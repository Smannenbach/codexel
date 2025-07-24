import { Router } from 'express';
import { z } from 'zod';
import { smartTemplateGenerator } from '../services/smart-template-generator';

const router = Router();

// Validation schemas
const templateRequestSchema = z.object({
  type: z.string(),
  industry: z.string(),
  features: z.array(z.string()),
  targetAudience: z.string(),
  businessGoals: z.array(z.string()),
  customization: z.object({
    branding: z.object({
      primaryColor: z.string().optional(),
      secondaryColor: z.string().optional(),
      fontFamily: z.string().optional(),
      logoStyle: z.string().optional(),
    }).optional(),
    content: z.object({
      tone: z.enum(['professional', 'casual', 'technical', 'friendly']).optional(),
      language: z.string().optional(),
      regions: z.array(z.string()).optional(),
    }).optional(),
    technical: z.object({
      framework: z.string().optional(),
      database: z.string().optional(),
      hosting: z.string().optional(),
      scalability: z.enum(['small', 'medium', 'large', 'enterprise']).optional(),
    }).optional(),
  }).optional(),
});

const recommendationCriteriaSchema = z.object({
  industry: z.string(),
  budget: z.string().optional(),
  timeline: z.string().optional(),
  teamSize: z.number().optional(),
});

// Generate smart template
router.post('/generate', async (req, res) => {
  try {
    const validatedRequest = templateRequestSchema.parse(req.body);
    
    // Ensure customization has default structure if undefined
    const requestWithDefaults = {
      ...validatedRequest,
      customization: validatedRequest.customization || {}
    };
    
    const template = await smartTemplateGenerator.generateTemplate(requestWithDefaults);
    
    res.json({
      success: true,
      template,
      message: 'Smart template generated successfully'
    });
  } catch (error) {
    console.error('Smart template generation error:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Invalid request data',
        errors: error.errors
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to generate smart template',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get template recommendations
router.post('/recommendations', async (req, res) => {
  try {
    const criteria = recommendationCriteriaSchema.parse(req.body);
    
    const recommendations = await smartTemplateGenerator.getTemplateRecommendations(criteria);
    
    res.json({
      success: true,
      recommendations,
      message: `Found ${recommendations.length} template recommendations`
    });
  } catch (error) {
    console.error('Template recommendations error:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Invalid criteria data',
        errors: error.errors
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to get template recommendations',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Clear template cache
router.post('/cache/clear', async (req, res) => {
  try {
    smartTemplateGenerator.clearCache();
    
    res.json({
      success: true,
      message: 'Template cache cleared successfully'
    });
  } catch (error) {
    console.error('Cache clear error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to clear template cache'
    });
  }
});

// Get template categories and types
router.get('/categories', (req, res) => {
  try {
    const categories = {
      industries: [
        'legal',
        'healthcare',
        'finance',
        'real-estate',
        'e-commerce',
        'saas',
        'consulting',
        'education',
        'hospitality',
        'manufacturing',
        'technology',
        'nonprofit'
      ],
      types: [
        'website',
        'web-app',
        'mobile-app',
        'e-commerce',
        'crm',
        'portal',
        'dashboard',
        'landing-page',
        'blog',
        'marketplace',
        'booking-system',
        'inventory-management'
      ],
      frameworks: [
        'react',
        'vue',
        'angular',
        'next.js',
        'express',
        'fastapi',
        'django',
        'laravel'
      ],
      databases: [
        'postgresql',
        'mysql',
        'mongodb',
        'sqlite',
        'redis',
        'supabase',
        'firebase'
      ]
    };
    
    res.json({
      success: true,
      categories,
      message: 'Template categories retrieved successfully'
    });
  } catch (error) {
    console.error('Categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get template categories'
    });
  }
});

// Validate template configuration
router.post('/validate', async (req, res) => {
  try {
    const request = templateRequestSchema.parse(req.body);
    
    // Validate configuration compatibility
    const validationResults = {
      isValid: true,
      warnings: [] as string[],
      suggestions: [] as string[]
    };
    
    // Check framework compatibility
    if (request.customization?.technical?.framework === 'react' && 
        request.customization?.technical?.database === 'mongodb') {
      validationResults.suggestions.push('Consider using PostgreSQL for better React integration');
    }
    
    // Check scalability requirements
    if (request.customization?.technical?.scalability === 'enterprise' &&
        !request.features.includes('user-authentication')) {
      validationResults.warnings.push('Enterprise scalability typically requires user authentication');
    }
    
    // Check industry-specific requirements
    if (request.industry === 'healthcare' && !request.features.includes('hipaa-compliance')) {
      validationResults.warnings.push('Healthcare applications should include HIPAA compliance');
    }
    
    if (request.industry === 'finance' && !request.features.includes('security-audit')) {
      validationResults.warnings.push('Financial applications require enhanced security measures');
    }
    
    res.json({
      success: true,
      validation: validationResults,
      message: 'Template configuration validated'
    });
  } catch (error) {
    console.error('Template validation error:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Invalid template configuration',
        errors: error.errors
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to validate template configuration'
    });
  }
});

export default router;