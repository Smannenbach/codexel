import { Router } from 'express';
import { z } from 'zod';
import { autonomousAgentOrchestrator } from '../services/autonomous-agent-orchestrator';

const router = Router();

// Validation schemas
const createProjectSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().min(10).max(1000),
  requirements: z.array(z.string()),
  timeline: z.string(),
  projectType: z.string()
});

const projectActionSchema = z.object({
  action: z.enum(['start', 'pause', 'resume', 'cancel'])
});

// Get all autonomous agents
router.get('/agents', (req, res) => {
  try {
    const agents = autonomousAgentOrchestrator.getAgents();
    res.json({
      success: true,
      agents,
      message: `Found ${agents.length} autonomous agents`
    });
  } catch (error) {
    console.error('Get agents error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get agents'
    });
  }
});

// Get all projects
router.get('/projects', (req, res) => {
  try {
    const projects = autonomousAgentOrchestrator.getProjects();
    res.json({
      success: true,
      projects,
      message: `Found ${projects.length} projects`
    });
  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get projects'
    });
  }
});

// Get specific project
router.get('/projects/:projectId', (req, res) => {
  try {
    const { projectId } = req.params;
    const project = autonomousAgentOrchestrator.getProject(projectId);
    
    if (!project) {
      return res.status(404).json({
        success: false,
        message: `Project ${projectId} not found`
      });
    }

    res.json({
      success: true,
      project,
      message: 'Project retrieved successfully'
    });
  } catch (error) {
    console.error('Get project error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get project'
    });
  }
});

// Create new project
router.post('/projects', async (req, res) => {
  try {
    const request = createProjectSchema.parse(req.body);
    
    console.log(`🚀 Creating autonomous project: ${request.name}`);
    
    const project = await autonomousAgentOrchestrator.createProject(request);
    
    res.json({
      success: true,
      project,
      message: `Project "${request.name}" created successfully`
    });
  } catch (error) {
    console.error('Create project error:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Invalid project data',
        errors: error.errors
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to create project',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Project actions (start, pause, resume, cancel)
router.post('/projects/:projectId/actions', async (req, res) => {
  try {
    const { projectId } = req.params;
    const { action } = projectActionSchema.parse(req.body);
    
    console.log(`🎯 Executing action ${action} on project ${projectId}`);
    
    switch (action) {
      case 'start':
        await autonomousAgentOrchestrator.startProject(projectId);
        break;
      case 'pause':
        autonomousAgentOrchestrator.pauseProject(projectId);
        break;
      case 'resume':
        autonomousAgentOrchestrator.resumeProject(projectId);
        break;
      case 'cancel':
        autonomousAgentOrchestrator.pauseProject(projectId);
        break;
    }
    
    res.json({
      success: true,
      message: `Project ${action} executed successfully`
    });
  } catch (error) {
    console.error('Project action error:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Invalid action data',
        errors: error.errors
      });
    }
    
    res.status(500).json({
      success: false,
      message: `Failed to execute ${req.body.action}`,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get event log
router.get('/events', (req, res) => {
  try {
    const events = autonomousAgentOrchestrator.getEventLog();
    res.json({
      success: true,
      events,
      message: `Retrieved ${events.length} recent events`
    });
  } catch (error) {
    console.error('Get events error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get events'
    });
  }
});

// Get agent performance
router.get('/agents/:agentId/performance', (req, res) => {
  try {
    const { agentId } = req.params;
    const agents = autonomousAgentOrchestrator.getAgents();
    const agent = agents.find(a => a.id === agentId);
    
    if (!agent) {
      return res.status(404).json({
        success: false,
        message: `Agent ${agentId} not found`
      });
    }

    res.json({
      success: true,
      performance: agent.performance,
      agent: {
        id: agent.id,
        name: agent.name,
        role: agent.role,
        status: agent.status
      },
      message: 'Agent performance retrieved successfully'
    });
  } catch (error) {
    console.error('Get agent performance error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get agent performance'
    });
  }
});

// Project statistics
router.get('/statistics', (req, res) => {
  try {
    const projects = autonomousAgentOrchestrator.getProjects();
    const agents = autonomousAgentOrchestrator.getAgents();
    
    const statistics = {
      totalProjects: projects.length,
      activeProjects: projects.filter(p => p.status === 'active').length,
      completedProjects: projects.filter(p => p.status === 'completed').length,
      totalAgents: agents.length,
      activeAgents: agents.filter(a => a.status === 'working').length,
      idleAgents: agents.filter(a => a.status === 'idle').length,
      averageSuccessRate: agents.reduce((sum, a) => sum + a.performance.successRate, 0) / agents.length,
      totalTasksCompleted: agents.reduce((sum, a) => sum + a.performance.tasksCompleted, 0)
    };

    res.json({
      success: true,
      statistics,
      message: 'Statistics retrieved successfully'
    });
  } catch (error) {
    console.error('Get statistics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get statistics'
    });
  }
});

export default router;