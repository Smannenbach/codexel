import { Router } from 'express';
import { DeploymentService } from '../services/deployment-service';
import { z } from 'zod';

const router = Router();
const deploymentService = new DeploymentService();

// Deploy project
router.post('/api/deploy/:projectId', async (req, res) => {
  try {
    const projectId = parseInt(req.params.projectId);
    const userId = 1; // TODO: Get from auth

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

// Get deployment status
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

// Get project deployments
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