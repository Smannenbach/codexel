import { Router } from 'express';
import { z } from 'zod';
import { enterpriseDeployment } from '../services/enterprise-deployment';

const router = Router();

// Validation schemas
const deploymentConfigSchema = z.object({
  version: z.string().optional(),
  commit: z.string().optional(),
  triggeredBy: z.string(),
  skipTests: z.boolean().optional(),
  emergencyDeploy: z.boolean().optional()
});

const environmentConfigSchema = z.object({
  domain: z.string().optional(),
  ssl: z.boolean().optional(),
  cdn: z.boolean().optional(),
  autoScale: z.boolean().optional(),
  backups: z.boolean().optional(),
  monitoring: z.boolean().optional()
});

const createEnvironmentSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  type: z.enum(['development', 'staging', 'production']),
  url: z.string().optional(),
  config: environmentConfigSchema
});

const pipelineRunSchema = z.object({
  trigger: z.string().optional().default('manual')
});

// Get all environments
router.get('/environments', (req, res) => {
  try {
    const environments = enterpriseDeployment.getEnvironments();
    res.json({
      success: true,
      environments,
      message: `Found ${environments.length} deployment environments`
    });
  } catch (error) {
    console.error('Get environments error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get environments'
    });
  }
});

// Get specific environment
router.get('/environments/:environmentId', (req, res) => {
  try {
    const { environmentId } = req.params;
    const environment = enterpriseDeployment.getEnvironment(environmentId);
    
    if (!environment) {
      return res.status(404).json({
        success: false,
        message: `Environment ${environmentId} not found`
      });
    }

    res.json({
      success: true,
      environment,
      message: 'Environment retrieved successfully'
    });
  } catch (error) {
    console.error('Get environment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get environment'
    });
  }
});

// Deploy to environment
router.post('/environments/:environmentId/deploy', async (req, res) => {
  try {
    const { environmentId } = req.params;
    const config = deploymentConfigSchema.parse(req.body);
    
    console.log(`🚀 Starting deployment to ${environmentId}`);
    
    const deployment = await enterpriseDeployment.deployToEnvironment(environmentId, config);
    
    res.json({
      success: true,
      deployment,
      message: `Deployment started for environment ${environmentId}`
    });
  } catch (error) {
    console.error('Deploy to environment error:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Invalid deployment configuration',
        errors: error.errors
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to start deployment',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get deployment history
router.get('/environments/:environmentId/deployments', (req, res) => {
  try {
    const { environmentId } = req.params;
    const limit = parseInt(req.query.limit as string) || 20;
    
    const deployments = enterpriseDeployment.getDeploymentHistory(environmentId, limit);
    
    res.json({
      success: true,
      deployments,
      count: deployments.length,
      message: 'Deployment history retrieved successfully'
    });
  } catch (error) {
    console.error('Get deployment history error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get deployment history'
    });
  }
});

// Rollback deployment
router.post('/environments/:environmentId/rollback', async (req, res) => {
  try {
    const { environmentId } = req.params;
    const { targetDeploymentId } = req.body;
    
    console.log(`🔄 Rolling back environment ${environmentId}`);
    
    const rollbackDeployment = await enterpriseDeployment.rollbackDeployment(
      environmentId, 
      targetDeploymentId
    );
    
    res.json({
      success: true,
      deployment: rollbackDeployment,
      message: `Rollback initiated for environment ${environmentId}`
    });
  } catch (error) {
    console.error('Rollback deployment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to rollback deployment',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Cancel active deployment
router.post('/deployments/:deploymentId/cancel', (req, res) => {
  try {
    const { deploymentId } = req.params;
    
    const success = enterpriseDeployment.cancelDeployment(deploymentId);
    
    if (!success) {
      return res.status(404).json({
        success: false,
        message: `Deployment ${deploymentId} not found or not active`
      });
    }

    res.json({
      success: true,
      message: `Deployment ${deploymentId} cancelled successfully`
    });
  } catch (error) {
    console.error('Cancel deployment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel deployment'
    });
  }
});

// Get active deployments
router.get('/deployments/active', (req, res) => {
  try {
    const activeDeployments = enterpriseDeployment.getActiveDeployments();
    
    res.json({
      success: true,
      deployments: activeDeployments,
      count: activeDeployments.length,
      message: 'Active deployments retrieved successfully'
    });
  } catch (error) {
    console.error('Get active deployments error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get active deployments'
    });
  }
});

// Update environment configuration
router.patch('/environments/:environmentId/config', (req, res) => {
  try {
    const { environmentId } = req.params;
    const config = environmentConfigSchema.parse(req.body);
    
    const success = enterpriseDeployment.updateEnvironmentConfig(environmentId, config);
    
    if (!success) {
      return res.status(404).json({
        success: false,
        message: `Environment ${environmentId} not found`
      });
    }

    res.json({
      success: true,
      message: `Environment ${environmentId} configuration updated`
    });
  } catch (error) {
    console.error('Update environment config error:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Invalid environment configuration',
        errors: error.errors
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to update environment configuration'
    });
  }
});

// Create new environment
router.post('/environments', (req, res) => {
  try {
    const environmentData = createEnvironmentSchema.parse(req.body);
    
    const environmentId = enterpriseDeployment.createEnvironment({
      ...environmentData,
      status: 'inactive',
      health: { cpu: 0, memory: 0, disk: 0, network: 0, uptime: 0 },
      deployments: []
    });
    
    res.json({
      success: true,
      environmentId,
      message: `Environment ${environmentData.name} created successfully`
    });
  } catch (error) {
    console.error('Create environment error:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Invalid environment data',
        errors: error.errors
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to create environment'
    });
  }
});

// Delete environment
router.delete('/environments/:environmentId', (req, res) => {
  try {
    const { environmentId } = req.params;
    
    const success = enterpriseDeployment.deleteEnvironment(environmentId);
    
    if (!success) {
      return res.status(404).json({
        success: false,
        message: `Environment ${environmentId} not found`
      });
    }

    res.json({
      success: true,
      message: `Environment ${environmentId} deleted successfully`
    });
  } catch (error) {
    console.error('Delete environment error:', error);
    
    if (error.message.includes('Cannot delete production')) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to delete environment'
    });
  }
});

// CI/CD Pipeline management
router.get('/pipelines', (req, res) => {
  try {
    const pipelines = enterpriseDeployment.getPipelines();
    
    res.json({
      success: true,
      pipelines,
      message: `Found ${pipelines.length} CI/CD pipelines`
    });
  } catch (error) {
    console.error('Get pipelines error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get pipelines'
    });
  }
});

// Run pipeline
router.post('/pipelines/:pipelineId/run', async (req, res) => {
  try {
    const { pipelineId } = req.params;
    const { trigger } = pipelineRunSchema.parse(req.body);
    
    console.log(`🔄 Running pipeline ${pipelineId} with trigger: ${trigger}`);
    
    const runId = await enterpriseDeployment.runPipeline(pipelineId, trigger);
    
    res.json({
      success: true,
      runId,
      message: `Pipeline ${pipelineId} started with run ID ${runId}`
    });
  } catch (error) {
    console.error('Run pipeline error:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Invalid pipeline run configuration',
        errors: error.errors
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to run pipeline',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Queue deployment
router.post('/queue', (req, res) => {
  try {
    const { environmentId, config, priority = 1 } = req.body;
    
    enterpriseDeployment.queueDeployment(environmentId, config, priority);
    
    res.json({
      success: true,
      message: `Deployment queued for environment ${environmentId} with priority ${priority}`
    });
  } catch (error) {
    console.error('Queue deployment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to queue deployment'
    });
  }
});

// Deployment statistics
router.get('/statistics', (req, res) => {
  try {
    const environments = enterpriseDeployment.getEnvironments();
    const activeDeployments = enterpriseDeployment.getActiveDeployments();
    
    const statistics = {
      totalEnvironments: environments.length,
      activeEnvironments: environments.filter(e => e.status === 'active').length,
      deploying: environments.filter(e => e.status === 'deploying').length,
      failed: environments.filter(e => e.status === 'failed').length,
      activeDeployments: activeDeployments.length,
      totalDeployments: environments.reduce((sum, env) => sum + env.deployments.length, 0),
      successfulDeployments: environments.reduce((sum, env) => 
        sum + env.deployments.filter(d => d.status === 'success').length, 0),
      failedDeployments: environments.reduce((sum, env) => 
        sum + env.deployments.filter(d => d.status === 'failed').length, 0),
      averageDeploymentTime: environments.reduce((sum, env) => {
        const completedDeployments = env.deployments.filter(d => d.duration);
        const totalTime = completedDeployments.reduce((timeSum, d) => timeSum + (d.duration || 0), 0);
        return sum + (completedDeployments.length > 0 ? totalTime / completedDeployments.length : 0);
      }, 0) / environments.length,
      healthStatus: {
        healthy: environments.filter(e => e.health.cpu < 80 && e.health.memory < 90).length,
        warning: environments.filter(e => e.health.cpu >= 80 || e.health.memory >= 90).length,
        critical: environments.filter(e => e.health.cpu >= 95 || e.health.memory >= 95).length
      }
    };

    res.json({
      success: true,
      statistics,
      message: 'Deployment statistics retrieved successfully'
    });
  } catch (error) {
    console.error('Get deployment statistics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get deployment statistics'
    });
  }
});

export default router;