import { Router } from 'express';
import { DeploymentService } from '../services/deployment-service';
import { z } from 'zod';
import { isAuthenticated } from '../auth';

const router = Router();
const deploymentService = new DeploymentService();

// Create new deployment (plural path for compatibility)
router.post('/api/deployments', isAuthenticated, async (req, res) => {
  try {
    const { projectId } = z.object({ projectId: z.number() }).parse(req.body);
    const userId = req.user!.id;

    const deploymentId = await deploymentService.deployProject(projectId, userId);
    
    res.json({ 
      success: true, 
      deploymentId,
      status: 'pending',
      message: 'Deployment started successfully' 
    });
  } catch (error: any) {
    console.error('Deploy error:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

// Deploy project (singular path)
router.post('/api/deploy/:projectId', isAuthenticated, async (req, res) => {
  try {
    const projectId = parseInt(req.params.projectId);
    const userId = req.user!.id;

    const deploymentId = await deploymentService.deployProject(projectId, userId);
    
    res.json({ 
      success: true, 
      deploymentId,
      message: 'Deployment started successfully' 
    });
  } catch (error: any) {
    console.error('Deploy error:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

// Get deployment status (plural path)
router.get('/api/deployments/:id', isAuthenticated, async (req, res) => {
  try {
    const deploymentId = parseInt(req.params.id);
    const deployment = await deploymentService.getDeploymentStatus(deploymentId);
    
    if (!deployment) {
      return res.status(404).json({ error: 'Deployment not found' });
    }
    
    res.json(deployment);
  } catch (error: any) {
    console.error('Get deployment status error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get deployment status (singular path)
router.get('/api/deploy/:deploymentId/status', async (req, res) => {
  try {
    const deploymentId = parseInt(req.params.deploymentId);
    const deployment = await deploymentService.getDeploymentStatus(deploymentId);
    
    if (!deployment) {
      return res.status(404).json({ error: 'Deployment not found' });
    }
    
    res.json(deployment);
  } catch (error: any) {
    console.error('Get deployment status error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get project deployments (plural path)
router.get('/api/deployments/project/:projectId', isAuthenticated, async (req, res) => {
  try {
    const projectId = parseInt(req.params.projectId);
    const deployments = await deploymentService.getProjectDeployments(projectId);
    
    res.json({ deployments });
  } catch (error: any) {
    console.error('Get deployments error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get project deployments (singular path)
router.get('/api/projects/:projectId/deployments', async (req, res) => {
  try {
    const projectId = parseInt(req.params.projectId);
    const deployments = await deploymentService.getProjectDeployments(projectId);
    
    res.json(deployments);
  } catch (error: any) {
    console.error('Get deployments error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
