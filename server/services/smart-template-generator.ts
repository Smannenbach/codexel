import { OpenAI } from 'openai';
import Anthropic from '@anthropic-ai/sdk';

interface TemplateRequest {
  type: string;
  industry: string;
  features: string[];
  targetAudience: string;
  businessGoals: string[];
  customization: {
    branding?: {
      primaryColor?: string;
      secondaryColor?: string;
      fontFamily?: string;
      logoStyle?: string;
    };
    content?: {
      tone?: 'professional' | 'casual' | 'technical' | 'friendly';
      language?: string;
      regions?: string[];
    };
    technical?: {
      framework?: string;
      database?: string;
      hosting?: string;
      scalability?: 'small' | 'medium' | 'large' | 'enterprise';
    };
  };
}

interface GeneratedTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  features: string[];
  files: {
    path: string;
    content: string;
    language: string;
    purpose: string;
  }[];
  dependencies: string[];
  configuration: {
    environment: Record<string, string>;
    database: any;
    apis: any[];
  };
  deployment: {
    steps: string[];
    requirements: string[];
    estimatedTime: string;
  };
  customizations: {
    applied: string[];
    available: string[];
  };
  metadata: {
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    estimatedDevTime: string;
    marketValue: string;
    competitorAnalysis: string[];
  };
}

class SmartTemplateGenerator {
  private openai: OpenAI;
  private anthropic: Anthropic;
  private templateCache = new Map<string, GeneratedTemplate>();

  constructor() {
    this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    this.anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }

  async generateTemplate(request: TemplateRequest): Promise<GeneratedTemplate> {
    // Check cache first
    const cacheKey = this.generateCacheKey(request);
    if (this.templateCache.has(cacheKey)) {
      return this.templateCache.get(cacheKey)!;
    }

    // Analyze complexity and choose AI model
    const complexity = this.analyzeTemplateComplexity(request);
    const useAdvancedModel = complexity > 7;

    const prompt = this.buildTemplatePrompt(request);
    let template: GeneratedTemplate;

    if (useAdvancedModel) {
      template = await this.generateWithClaude(prompt, request);
    } else {
      template = await this.generateWithGPT(prompt, request);
    }

    // Enhance template with smart customizations
    template = await this.applySmartCustomizations(template, request);

    // Add market analysis
    template = await this.addMarketAnalysis(template, request);

    // Cache the result
    this.templateCache.set(cacheKey, template);

    return template;
  }

  private generateCacheKey(request: TemplateRequest): string {
    return JSON.stringify({
      type: request.type,
      industry: request.industry,
      features: request.features.sort(),
      audience: request.targetAudience,
      goals: request.businessGoals.sort(),
      tech: request.customization.technical
    });
  }

  private analyzeTemplateComplexity(request: TemplateRequest): number {
    let complexity = 0;

    // Base complexity from type
    const complexTypes = ['e-commerce', 'marketplace', 'saas', 'fintech', 'healthcare'];
    if (complexTypes.includes(request.type.toLowerCase())) {
      complexity += 3;
    }

    // Features complexity
    complexity += Math.min(request.features.length * 0.5, 4);

    // Business goals complexity
    const complexGoals = ['payment-processing', 'user-authentication', 'real-time-features', 'multi-tenant'];
    const goalComplexity = request.businessGoals.filter(goal => 
      complexGoals.some(complex => goal.toLowerCase().includes(complex))
    ).length;
    complexity += goalComplexity;

    // Technical complexity
    if (request.customization.technical?.scalability === 'enterprise') {
      complexity += 2;
    }
    if (request.customization.technical?.database?.includes('distributed')) {
      complexity += 1;
    }

    return Math.min(complexity, 10);
  }

  private buildTemplatePrompt(request: TemplateRequest): string {
    return `
# Smart Template Generation Request

## Project Overview
- **Type**: ${request.type}
- **Industry**: ${request.industry}
- **Target Audience**: ${request.targetAudience}

## Required Features
${request.features.map(feature => `- ${feature}`).join('\n')}

## Business Goals
${request.businessGoals.map(goal => `- ${goal}`).join('\n')}

## Customization Requirements
### Branding
${JSON.stringify(request.customization.branding || {}, null, 2)}

### Content
${JSON.stringify(request.customization.content || {}, null, 2)}

### Technical
${JSON.stringify(request.customization.technical || {}, null, 2)}

## Instructions
Generate a comprehensive, production-ready template that includes:
1. Complete file structure with all necessary components
2. Industry-specific features and best practices
3. Responsive design with modern UI/UX
4. Security and performance optimizations
5. Deployment configuration
6. Documentation and setup instructions
7. Customization options for branding and content
8. Integration points for common third-party services

## Response Format
Provide a JSON response with the following structure:
{
  "id": "unique-template-id",
  "name": "Template Name",
  "description": "Detailed description",
  "category": "${request.industry}",
  "features": ["feature1", "feature2"],
  "files": [
    {
      "path": "relative/path/file.ext",
      "content": "complete file content",
      "language": "javascript|typescript|html|css|etc",
      "purpose": "description of file purpose"
    }
  ],
  "dependencies": ["package1", "package2"],
  "configuration": {
    "environment": {"VAR1": "value1"},
    "database": {"type": "postgresql", "schema": "..."},
    "apis": [{"name": "service", "endpoint": "url"}]
  },
  "deployment": {
    "steps": ["step1", "step2"],
    "requirements": ["req1", "req2"],
    "estimatedTime": "2-4 hours"
  },
  "customizations": {
    "applied": ["branding", "content"],
    "available": ["theme", "layout", "features"]
  },
  "metadata": {
    "difficulty": "intermediate",
    "estimatedDevTime": "1-2 weeks",
    "marketValue": "$5,000-$15,000",
    "competitorAnalysis": ["competitor1", "competitor2"]
  }
}
`;
  }

  private async generateWithClaude(prompt: string, request: TemplateRequest): Promise<GeneratedTemplate> {
    const response = await this.anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 8000,
      messages: [{ role: 'user', content: prompt }],
      system: `You are an expert full-stack developer and business analyst. Generate comprehensive, production-ready templates that follow industry best practices and include modern features, security considerations, and scalability patterns.`
    });

    const content = response.content[0].type === 'text' ? response.content[0].text : '';
    return this.parseTemplateResponse(content, request);
  }

  private async generateWithGPT(prompt: string, request: TemplateRequest): Promise<GeneratedTemplate> {
    const response = await this.openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'You are an expert full-stack developer and business analyst. Generate comprehensive, production-ready templates that follow industry best practices.'
        },
        { role: 'user', content: prompt }
      ],
      response_format: { type: 'json_object' },
      max_tokens: 8000
    });

    const content = response.choices[0].message.content || '{}';
    return this.parseTemplateResponse(content, request);
  }

  private parseTemplateResponse(content: string, request: TemplateRequest): GeneratedTemplate {
    try {
      // Extract JSON from response
      const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || content.match(/\{[\s\S]*\}/);
      const jsonStr = jsonMatch ? jsonMatch[1] || jsonMatch[0] : content;
      
      const parsed = JSON.parse(jsonStr);
      
      return {
        id: parsed.id || `template-${Date.now()}`,
        name: parsed.name || `${request.type} Template`,
        description: parsed.description || 'AI-generated template',
        category: parsed.category || request.industry,
        features: parsed.features || request.features,
        files: parsed.files || [],
        dependencies: parsed.dependencies || [],
        configuration: parsed.configuration || {},
        deployment: parsed.deployment || {
          steps: ['Install dependencies', 'Configure environment', 'Deploy'],
          requirements: ['Node.js', 'Database'],
          estimatedTime: '2-4 hours'
        },
        customizations: parsed.customizations || {
          applied: [],
          available: ['branding', 'content', 'features']
        },
        metadata: parsed.metadata || {
          difficulty: 'intermediate',
          estimatedDevTime: '1-2 weeks',
          marketValue: '$5,000-$15,000',
          competitorAnalysis: []
        }
      };
    } catch (error) {
      return this.generateFallbackTemplate(request);
    }
  }

  private generateFallbackTemplate(request: TemplateRequest): GeneratedTemplate {
    return {
      id: `fallback-${Date.now()}`,
      name: `${request.type} Template`,
      description: `A ${request.industry} ${request.type} template generated for ${request.targetAudience}`,
      category: request.industry,
      features: request.features,
      files: [
        {
          path: 'index.html',
          content: '<!DOCTYPE html><html><head><title>Template</title></head><body><h1>Template Generated</h1></body></html>',
          language: 'html',
          purpose: 'Main page'
        }
      ],
      dependencies: ['react', 'typescript'],
      configuration: {
        environment: {},
        database: {},
        apis: []
      },
      deployment: {
        steps: ['Setup', 'Configure', 'Deploy'],
        requirements: ['Node.js'],
        estimatedTime: '2-4 hours'
      },
      customizations: {
        applied: [],
        available: ['branding', 'content']
      },
      metadata: {
        difficulty: 'intermediate',
        estimatedDevTime: '1-2 weeks',
        marketValue: '$5,000-$15,000',
        competitorAnalysis: []
      }
    };
  }

  private async applySmartCustomizations(template: GeneratedTemplate, request: TemplateRequest): Promise<GeneratedTemplate> {
    // Apply branding customizations
    if (request.customization.branding) {
      template = this.applyBrandingCustomizations(template, request.customization.branding);
    }

    // Apply content customizations
    if (request.customization.content) {
      template = this.applyContentCustomizations(template, request.customization.content);
    }

    // Apply technical customizations
    if (request.customization.technical) {
      template = this.applyTechnicalCustomizations(template, request.customization.technical);
    }

    return template;
  }

  private applyBrandingCustomizations(template: GeneratedTemplate, branding: any): GeneratedTemplate {
    // Update CSS files with brand colors
    template.files = template.files.map(file => {
      if (file.language === 'css' || file.path.includes('.css')) {
        let content = file.content;
        if (branding.primaryColor) {
          content = content.replace(/--primary-color:\s*[^;]+;/g, `--primary-color: ${branding.primaryColor};`);
        }
        if (branding.secondaryColor) {
          content = content.replace(/--secondary-color:\s*[^;]+;/g, `--secondary-color: ${branding.secondaryColor};`);
        }
        return { ...file, content };
      }
      return file;
    });

    template.customizations.applied.push('branding');
    return template;
  }

  private applyContentCustomizations(template: GeneratedTemplate, content: any): GeneratedTemplate {
    // Update content tone and language
    template.files = template.files.map(file => {
      if (file.language === 'html' || file.language === 'jsx' || file.language === 'tsx') {
        let fileContent = file.content;
        
        // Adjust content tone
        if (content.tone === 'professional') {
          fileContent = fileContent.replace(/\b(awesome|cool|great)\b/gi, 'excellent');
        } else if (content.tone === 'casual') {
          fileContent = fileContent.replace(/\b(excellent|superior)\b/gi, 'awesome');
        }
        
        return { ...file, content: fileContent };
      }
      return file;
    });

    template.customizations.applied.push('content');
    return template;
  }

  private applyTechnicalCustomizations(template: GeneratedTemplate, technical: any): GeneratedTemplate {
    // Update framework-specific files
    if (technical.framework) {
      template.dependencies = template.dependencies.filter(dep => 
        !['react', 'vue', 'angular'].includes(dep)
      );
      template.dependencies.push(technical.framework);
    }

    // Update database configuration
    if (technical.database) {
      template.configuration.database = {
        type: technical.database,
        connection: `${technical.database}_connection_string`
      };
    }

    template.customizations.applied.push('technical');
    return template;
  }

  private async addMarketAnalysis(template: GeneratedTemplate, request: TemplateRequest): Promise<GeneratedTemplate> {
    // Add competitive analysis and market value estimation
    const marketData = this.getMarketAnalysis(request.industry, request.type);
    
    template.metadata.competitorAnalysis = marketData.competitors;
    template.metadata.marketValue = marketData.valueRange;
    
    return template;
  }

  private getMarketAnalysis(industry: string, type: string): { competitors: string[], valueRange: string } {
    const marketData: Record<string, Record<string, any>> = {
      'legal': {
        'website': {
          competitors: ['Avvo', 'Martindale-Hubbell', 'FindLaw'],
          valueRange: '$5,000-$25,000'
        },
        'crm': {
          competitors: ['Clio', 'MyCase', 'PracticePanther'],
          valueRange: '$10,000-$50,000'
        }
      },
      'healthcare': {
        'website': {
          competitors: ['Healthgrades', 'WebMD', 'Zocdoc'],
          valueRange: '$8,000-$30,000'
        },
        'portal': {
          competitors: ['Epic MyChart', 'athenahealth', 'NextGen'],
          valueRange: '$25,000-$100,000'
        }
      },
      'finance': {
        'app': {
          competitors: ['Mint', 'Robinhood', 'Charles Schwab'],
          valueRange: '$50,000-$200,000'
        }
      }
    };

    return marketData[industry]?.[type] || {
      competitors: ['Industry Leader 1', 'Industry Leader 2'],
      valueRange: '$5,000-$20,000'
    };
  }

  async getTemplateRecommendations(criteria: {
    industry: string;
    budget?: string;
    timeline?: string;
    teamSize?: number;
  }): Promise<{ templateType: string; reasoning: string; features: string[] }[]> {
    const recommendations = [
      {
        templateType: 'Professional Website',
        reasoning: 'Essential for establishing online presence and credibility',
        features: ['Responsive design', 'Contact forms', 'SEO optimization', 'Content management']
      },
      {
        templateType: 'Client Portal',
        reasoning: 'Improves client experience and operational efficiency',
        features: ['User authentication', 'Document sharing', 'Communication tools', 'Progress tracking']
      },
      {
        templateType: 'E-commerce Platform',
        reasoning: 'Enables online sales and revenue generation',
        features: ['Product catalog', 'Shopping cart', 'Payment processing', 'Order management']
      }
    ];

    // Filter based on criteria
    return recommendations.filter(rec => {
      if (criteria.budget === 'low' && rec.templateType.includes('E-commerce')) {
        return false; // E-commerce is typically more expensive
      }
      return true;
    });
  }

  clearCache(): void {
    this.templateCache.clear();
  }
}

export const smartTemplateGenerator = new SmartTemplateGenerator();