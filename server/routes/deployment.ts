import type { Express } from "express";
import { z } from "zod";

interface DeploymentConfig {
  projectId: number;
  environment: 'staging' | 'production';
  domain?: string;
  autoScale?: boolean;
  region?: string;
}

interface DeploymentStatus {
  id: string;
  projectId: number;
  environment: string;
  status: 'pending' | 'building' | 'deploying' | 'success' | 'failed';
  url?: string;
  logs: string[];
  startedAt: Date;
  completedAt?: Date;
  error?: string;
}

// In-memory store for demo (would be replaced with database)
const deployments = new Map<string, DeploymentStatus>();

export function registerDeploymentRoutes(app: Express) {
  
  // Create new deployment
  app.post('/api/deployments', async (req, res) => {
    try {
      const deploymentSchema = z.object({
        projectId: z.number(),
        environment: z.enum(['staging', 'production']),
        domain: z.string().optional(),
        autoScale: z.boolean().default(true),
        region: z.string().default('us-east-1')
      });

      const config = deploymentSchema.parse(req.body);
      const deploymentId = `deploy_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const deployment: DeploymentStatus = {
        id: deploymentId,
        projectId: config.projectId,
        environment: config.environment,
        status: 'pending',
        logs: ['Deployment initiated...'],
        startedAt: new Date()
      };

      deployments.set(deploymentId, deployment);

      // Simulate deployment process
      setTimeout(() => {
        simulateDeployment(deploymentId, config);
      }, 1000);

      res.json({
        deploymentId,
        status: deployment.status,
        message: 'Deployment started successfully'
      });

    } catch (error) {
      console.error('Deployment creation error:', error);
      res.status(500).json({ 
        error: 'Failed to create deployment',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Get deployment status
  app.get('/api/deployments/:id', (req, res) => {
    const deployment = deployments.get(req.params.id);
    
    if (!deployment) {
      return res.status(404).json({ error: 'Deployment not found' });
    }

    res.json(deployment);
  });

  // Get all deployments for a project
  app.get('/api/deployments/project/:projectId', (req, res) => {
    const projectId = parseInt(req.params.projectId);
    const projectDeployments = Array.from(deployments.values())
      .filter(d => d.projectId === projectId)
      .sort((a, b) => b.startedAt.getTime() - a.startedAt.getTime());

    res.json({ deployments: projectDeployments });
  });

  // Cancel deployment
  app.post('/api/deployments/:id/cancel', (req, res) => {
    const deployment = deployments.get(req.params.id);
    
    if (!deployment) {
      return res.status(404).json({ error: 'Deployment not found' });
    }

    if (deployment.status === 'success' || deployment.status === 'failed') {
      return res.status(400).json({ error: 'Cannot cancel completed deployment' });
    }

    deployment.status = 'failed';
    deployment.error = 'Deployment cancelled by user';
    deployment.completedAt = new Date();
    deployment.logs.push('Deployment cancelled');

    res.json({ message: 'Deployment cancelled successfully' });
  });

  // Get deployment logs (streaming endpoint)
  app.get('/api/deployments/:id/logs', (req, res) => {
    const deployment = deployments.get(req.params.id);
    
    if (!deployment) {
      return res.status(404).json({ error: 'Deployment not found' });
    }

    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Cache-Control', 'no-cache');
    
    // Send current logs
    deployment.logs.forEach(log => {
      res.write(`${new Date().toISOString()} - ${log}\n`);
    });

    res.end();
  });

  // Health check endpoint
  app.get('/api/deployments/health', (req, res) => {
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      deployments: {
        total: deployments.size,
        active: Array.from(deployments.values()).filter(d => 
          d.status === 'pending' || d.status === 'building' || d.status === 'deploying'
        ).length
      }
    });
  });
}

// Simulate the deployment process
async function simulateDeployment(deploymentId: string, config: DeploymentConfig) {
  const deployment = deployments.get(deploymentId);
  if (!deployment) return;

  try {
    // Building phase
    deployment.status = 'building';
    deployment.logs.push('Building application...');
    await delay(2000);

    deployment.logs.push('Installing dependencies...');
    await delay(1500);

    deployment.logs.push('Compiling TypeScript...');
    await delay(1000);

    deployment.logs.push('Building frontend assets...');
    await delay(2000);

    // Deploying phase
    deployment.status = 'deploying';
    deployment.logs.push('Deploying to Replit hosting...');
    await delay(1500);

    deployment.logs.push('Configuring environment variables...');
    await delay(1000);

    if (config.domain) {
      deployment.logs.push(`Setting up custom domain: ${config.domain}`);
      await delay(1500);
      
      deployment.logs.push('Configuring SSL certificate...');
      await delay(2000);
    }

    deployment.logs.push('Starting application...');
    await delay(1500);

    deployment.logs.push('Running health checks...');
    await delay(1000);

    // Success
    deployment.status = 'success';
    deployment.completedAt = new Date();
    
    const baseUrl = config.domain 
      ? `https://${config.domain}`
      : config.environment === 'production'
        ? `https://codexel.ai`
        : `https://staging-${config.projectId}.replit.app`;
    
    deployment.url = baseUrl;
    deployment.logs.push(`✅ Deployment successful! Application available at: ${baseUrl}`);

  } catch (error) {
    deployment.status = 'failed';
    deployment.error = error instanceof Error ? error.message : 'Unknown deployment error';
    deployment.completedAt = new Date();
    deployment.logs.push(`❌ Deployment failed: ${deployment.error}`);
  }
}

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}