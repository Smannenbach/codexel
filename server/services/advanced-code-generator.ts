import { OpenAI } from 'openai';
import Anthropic from '@anthropic-ai/sdk';

interface CodeGenerationRequest {
  description: string;
  context: {
    projectType: string;
    framework: string;
    language: string;
    existingCode?: string;
    dependencies?: string[];
    fileStructure?: string[];
  };
  preferences: {
    codeStyle: 'functional' | 'object-oriented' | 'mixed';
    complexity: 'simple' | 'intermediate' | 'advanced';
    includeComments: boolean;
    includeTests: boolean;
    includeDocumentation: boolean;
  };
}

interface CodeGenerationResult {
  files: {
    path: string;
    content: string;
    language: string;
    description: string;
  }[];
  dependencies: string[];
  instructions: string[];
  estimatedComplexity: number;
  confidence: number;
  suggestions: string[];
}

export class AdvancedCodeGenerator {
  private openai: OpenAI;
  private anthropic: Anthropic;

  constructor() {
    this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    this.anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }

  async generateCode(request: CodeGenerationRequest): Promise<CodeGenerationResult> {
    // Analyze the request complexity and choose the best AI model
    const complexity = this.analyzeComplexity(request);
    const model = complexity > 7 ? 'claude-sonnet-4-20250514' : 'gpt-4o';

    // Build context-aware prompt
    const prompt = this.buildContextAwarePrompt(request);

    let result: CodeGenerationResult;

    if (model.startsWith('claude')) {
      result = await this.generateWithClaude(prompt, request);
    } else {
      result = await this.generateWithGPT(prompt, request);
    }

    // Post-process and enhance the generated code
    return this.enhanceGeneratedCode(result, request);
  }

  private analyzeComplexity(request: CodeGenerationRequest): number {
    let complexity = 0;
    
    // Base complexity from description length and keywords
    complexity += Math.min(request.description.length / 100, 3);
    
    // Framework complexity
    const complexFrameworks = ['react', 'angular', 'vue', 'next.js', 'nuxt', 'express', 'fastapi'];
    if (complexFrameworks.some(fw => request.context.framework.toLowerCase().includes(fw))) {
      complexity += 2;
    }

    // Existing code complexity
    if (request.context.existingCode && request.context.existingCode.length > 1000) {
      complexity += 2;
    }

    // Feature complexity keywords
    const complexKeywords = ['authentication', 'database', 'api', 'websocket', 'real-time', 'payment', 'security'];
    const keywordMatches = complexKeywords.filter(keyword => 
      request.description.toLowerCase().includes(keyword)
    ).length;
    complexity += keywordMatches;

    // Preferences complexity
    if (request.preferences.includeTests) complexity += 1;
    if (request.preferences.includeDocumentation) complexity += 1;
    if (request.preferences.complexity === 'advanced') complexity += 2;

    return Math.min(complexity, 10);
  }

  private buildContextAwarePrompt(request: CodeGenerationRequest): string {
    return `
# Advanced Code Generation Request

## Project Context
- **Type**: ${request.context.projectType}
- **Framework**: ${request.context.framework}
- **Language**: ${request.context.language}
- **Dependencies**: ${request.context.dependencies?.join(', ') || 'None specified'}

## File Structure
${request.context.fileStructure?.map(file => `- ${file}`).join('\n') || 'No existing structure'}

## Existing Code Context
${request.context.existingCode ? `\`\`\`\n${request.context.existingCode}\n\`\`\`` : 'No existing code provided'}

## Requirements
${request.description}

## Code Preferences
- **Style**: ${request.preferences.codeStyle}
- **Complexity**: ${request.preferences.complexity}
- **Include Comments**: ${request.preferences.includeComments ? 'Yes' : 'No'}
- **Include Tests**: ${request.preferences.includeTests ? 'Yes' : 'No'}
- **Include Documentation**: ${request.preferences.includeDocumentation ? 'Yes' : 'No'}

## Instructions
Generate production-ready code that:
1. Follows the specified code style and complexity level
2. Integrates seamlessly with the existing project structure
3. Includes appropriate error handling and validation
4. Follows best practices for the specified framework and language
5. Is well-documented and maintainable

## Response Format
Provide your response as a JSON object with this structure:
{
  "files": [
    {
      "path": "relative/path/to/file.ext",
      "content": "actual file content",
      "language": "javascript|typescript|python|etc",
      "description": "brief description of file purpose"
    }
  ],
  "dependencies": ["package1", "package2"],
  "instructions": ["step 1", "step 2"],
  "estimatedComplexity": 1-10,
  "confidence": 0.0-1.0,
  "suggestions": ["improvement suggestion 1", "suggestion 2"]
}
`;
  }

  private async generateWithClaude(prompt: string, request: CodeGenerationRequest): Promise<CodeGenerationResult> {
    const response = await this.anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4000,
      messages: [{ role: 'user', content: prompt }],
      system: 'You are an expert software engineer with deep knowledge of modern frameworks, best practices, and code architecture. Generate high-quality, production-ready code.'
    });

    const content = response.content[0].type === 'text' ? response.content[0].text : '';
    return this.parseCodeGenerationResponse(content);
  }

  private async generateWithGPT(prompt: string, request: CodeGenerationRequest): Promise<CodeGenerationResult> {
    const response = await this.openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'You are an expert software engineer with deep knowledge of modern frameworks, best practices, and code architecture. Generate high-quality, production-ready code.'
        },
        { role: 'user', content: prompt }
      ],
      response_format: { type: 'json_object' },
      max_tokens: 4000
    });

    const content = response.choices[0].message.content || '{}';
    return this.parseCodeGenerationResponse(content);
  }

  private parseCodeGenerationResponse(content: string): CodeGenerationResult {
    try {
      // Try to extract JSON from the response
      const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || content.match(/\{[\s\S]*\}/);
      const jsonStr = jsonMatch ? jsonMatch[1] || jsonMatch[0] : content;
      
      const parsed = JSON.parse(jsonStr);
      
      return {
        files: parsed.files || [],
        dependencies: parsed.dependencies || [],
        instructions: parsed.instructions || [],
        estimatedComplexity: parsed.estimatedComplexity || 5,
        confidence: parsed.confidence || 0.8,
        suggestions: parsed.suggestions || []
      };
    } catch (error) {
      // Fallback parsing for non-JSON responses
      return this.fallbackParsing(content);
    }
  }

  private fallbackParsing(content: string): CodeGenerationResult {
    const files: { path: string; content: string; language: string; description: string }[] = [];
    
    // Extract code blocks
    const codeBlocks = content.match(/```(\w+)?\n([\s\S]*?)\n```/g) || [];
    
    codeBlocks.forEach((block, index) => {
      const match = block.match(/```(\w+)?\n([\s\S]*?)\n```/);
      if (match) {
        const language = match[1] || 'text';
        const code = match[2];
        files.push({
          path: `generated-file-${index + 1}.${this.getFileExtension(language)}`,
          content: code,
          language,
          description: `Generated ${language} code`
        });
      }
    });

    return {
      files,
      dependencies: [],
      instructions: ['Review and integrate the generated code into your project'],
      estimatedComplexity: 5,
      confidence: 0.6,
      suggestions: ['Consider adding error handling', 'Add unit tests for the generated code']
    };
  }

  private getFileExtension(language: string): string {
    const extensions: Record<string, string> = {
      javascript: 'js',
      typescript: 'ts',
      python: 'py',
      java: 'java',
      csharp: 'cs',
      cpp: 'cpp',
      c: 'c',
      go: 'go',
      rust: 'rs',
      html: 'html',
      css: 'css',
      scss: 'scss',
      json: 'json',
      yaml: 'yml',
      xml: 'xml'
    };
    return extensions[language.toLowerCase()] || 'txt';
  }

  private async enhanceGeneratedCode(result: CodeGenerationResult, request: CodeGenerationRequest): Promise<CodeGenerationResult> {
    // Add framework-specific enhancements
    if (request.context.framework.toLowerCase().includes('react')) {
      result = this.enhanceReactCode(result);
    } else if (request.context.framework.toLowerCase().includes('express')) {
      result = this.enhanceExpressCode(result);
    }

    // Add security enhancements
    result = this.addSecurityEnhancements(result);

    // Add performance optimizations
    result = this.addPerformanceOptimizations(result);

    return result;
  }

  private enhanceReactCode(result: CodeGenerationResult): CodeGenerationResult {
    // Add React-specific improvements
    result.suggestions.push(
      'Consider using React.memo for performance optimization',
      'Implement proper error boundaries',
      'Use custom hooks for reusable logic'
    );

    // Check if TypeScript is being used and add type safety suggestions
    const hasTypeScript = result.files.some(file => file.language === 'typescript');
    if (hasTypeScript) {
      result.suggestions.push('Ensure all props have proper TypeScript interfaces');
    }

    return result;
  }

  private enhanceExpressCode(result: CodeGenerationResult): CodeGenerationResult {
    // Add Express-specific improvements
    result.suggestions.push(
      'Implement proper middleware for error handling',
      'Add input validation using libraries like Joi or Zod',
      'Consider rate limiting for API endpoints'
    );

    // Add security middleware dependencies
    if (!result.dependencies.includes('helmet')) {
      result.dependencies.push('helmet');
    }
    if (!result.dependencies.includes('cors')) {
      result.dependencies.push('cors');
    }

    return result;
  }

  private addSecurityEnhancements(result: CodeGenerationResult): CodeGenerationResult {
    result.suggestions.push(
      'Implement proper input sanitization',
      'Use environment variables for sensitive configuration',
      'Add authentication and authorization where appropriate'
    );

    return result;
  }

  private addPerformanceOptimizations(result: CodeGenerationResult): CodeGenerationResult {
    result.suggestions.push(
      'Consider implementing caching strategies',
      'Optimize database queries if applicable',
      'Implement proper error handling and logging'
    );

    return result;
  }

  async generateSmartTemplate(templateType: string, customizations: any): Promise<CodeGenerationResult> {
    const templatePrompt = `
Generate a smart, customizable template for a ${templateType} project with the following customizations:
${JSON.stringify(customizations, null, 2)}

The template should be:
1. Modern and production-ready
2. Fully functional out of the box
3. Well-documented with setup instructions
4. Include best practices and common patterns
5. Extensible and maintainable

Provide a complete project structure with all necessary files.
`;

    return this.generateCode({
      description: templatePrompt,
      context: {
        projectType: templateType,
        framework: customizations.framework || 'react',
        language: customizations.language || 'typescript',
      },
      preferences: {
        codeStyle: 'mixed',
        complexity: 'intermediate',
        includeComments: true,
        includeTests: true,
        includeDocumentation: true
      }
    });
  }
}