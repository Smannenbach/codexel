import { Router } from 'express';
import { AdvancedCodeGenerator } from '../services/advanced-code-generator';
import { z } from 'zod';

const router = Router();
const codeGenerator = new AdvancedCodeGenerator();

// Validation schemas
const CodeGenerationRequestSchema = z.object({
  description: z.string().min(10).max(2000),
  context: z.object({
    projectType: z.string(),
    framework: z.string(),
    language: z.string(),
    existingCode: z.string().optional(),
    dependencies: z.array(z.string()).optional(),
    fileStructure: z.array(z.string()).optional(),
  }),
  preferences: z.object({
    codeStyle: z.enum(['functional', 'object-oriented', 'mixed']),
    complexity: z.enum(['simple', 'intermediate', 'advanced']),
    includeComments: z.boolean(),
    includeTests: z.boolean(),
    includeDocumentation: z.boolean(),
  }),
});

const SmartTemplateRequestSchema = z.object({
  templateType: z.string(),
  customizations: z.object({
    framework: z.string().optional(),
    language: z.string().optional(),
    features: z.array(z.string()).optional(),
    styling: z.string().optional(),
    database: z.string().optional(),
    authentication: z.boolean().optional(),
    deployment: z.string().optional(),
  }),
});

// Generate code from natural language description
router.post('/generate', async (req, res) => {
  try {
    const request = CodeGenerationRequestSchema.parse(req.body);
    
    console.log(`🚀 Starting advanced code generation for: ${request.description.substring(0, 100)}...`);
    
    const result = await codeGenerator.generateCode(request);
    
    res.json({
      success: true,
      result,
      metadata: {
        filesGenerated: result.files.length,
        dependenciesAdded: result.dependencies.length,
        complexity: result.estimatedComplexity,
        confidence: result.confidence,
        generatedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Code generation error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    });
  }
});

// Generate smart template with customizations
router.post('/template', async (req, res) => {
  try {
    const request = SmartTemplateRequestSchema.parse(req.body);
    
    console.log(`🎨 Generating smart template: ${request.templateType}`);
    
    const result = await codeGenerator.generateSmartTemplate(
      request.templateType,
      request.customizations
    );
    
    res.json({
      success: true,
      template: result,
      metadata: {
        templateType: request.templateType,
        filesGenerated: result.files.length,
        customizations: request.customizations,
        generatedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Smart template generation error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    });
  }
});

// Analyze code complexity and suggest improvements
router.post('/analyze', async (req, res) => {
  try {
    const { code, language, framework } = req.body;
    
    if (!code || !language) {
      return res.status(400).json({
        success: false,
        error: 'Code and language are required'
      });
    }

    // Simple analysis for now - can be enhanced with AST parsing
    const complexity = Math.min(Math.floor(code.length / 100) + 
      (code.match(/function|class|interface|type/g) || []).length, 10);
    
    const suggestions = [
      'Consider breaking down large functions into smaller ones',
      'Add error handling where appropriate',
      'Include TypeScript types for better type safety',
      'Add unit tests for critical functionality'
    ];

    if (code.includes('useState') && !code.includes('useCallback')) {
      suggestions.push('Consider using useCallback for function props to prevent unnecessary re-renders');
    }

    if (code.includes('console.log')) {
      suggestions.push('Replace console.log with proper logging in production');
    }

    res.json({
      success: true,
      analysis: {
        complexity,
        linesOfCode: code.split('\n').length,
        suggestions,
        security: {
          hasInputValidation: code.includes('validate') || code.includes('schema'),
          hasErrorHandling: code.includes('try') || code.includes('catch'),
          hasAuthentication: code.includes('auth') || code.includes('token')
        },
        performance: {
          hasOptimizations: code.includes('memo') || code.includes('useMemo'),
          hasLazyLoading: code.includes('lazy') || code.includes('Suspense'),
          hasCaching: code.includes('cache') || code.includes('redis')
        }
      }
    });
  } catch (error) {
    console.error('Code analysis error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    });
  }
});

// Get code generation suggestions based on project context
router.post('/suggestions', async (req, res) => {
  try {
    const { projectType, framework, language, currentFeatures } = req.body;
    
    const suggestions = [
      {
        type: 'component',
        title: 'Error Boundary Component',
        description: 'Add React error boundaries for better error handling',
        complexity: 3,
        estimatedTime: '15 minutes'
      },
      {
        type: 'utility',
        title: 'API Client',
        description: 'Create a centralized API client with error handling',
        complexity: 5,
        estimatedTime: '30 minutes'
      },
      {
        type: 'hook',
        title: 'Custom Authentication Hook',
        description: 'Build a reusable authentication hook',
        complexity: 6,
        estimatedTime: '45 minutes'
      },
      {
        type: 'middleware',
        title: 'Request Validation Middleware',
        description: 'Add input validation for API endpoints',
        complexity: 4,
        estimatedTime: '20 minutes'
      }
    ];

    // Filter suggestions based on project context
    const filteredSuggestions = suggestions.filter(suggestion => {
      if (framework.toLowerCase().includes('react') && suggestion.type === 'component') return true;
      if (framework.toLowerCase().includes('express') && suggestion.type === 'middleware') return true;
      return suggestion.type === 'utility' || suggestion.type === 'hook';
    });

    res.json({
      success: true,
      suggestions: filteredSuggestions,
      totalSuggestions: filteredSuggestions.length
    });
  } catch (error) {
    console.error('Suggestions error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    });
  }
});

export default router;