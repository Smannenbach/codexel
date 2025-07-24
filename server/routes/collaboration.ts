import { Router } from 'express';
import { z } from 'zod';
import { realTimeCollaboration } from '../services/real-time-collaboration';

const router = Router();

// Validation schemas
const updateUserRoleSchema = z.object({
  userId: z.string(),
  role: z.enum(['owner', 'collaborator', 'viewer'])
});

const sendMessageSchema = z.object({
  toUserId: z.string(),
  message: z.string().min(1).max(1000)
});

const kickUserSchema = z.object({
  userId: z.string(),
  reason: z.string().optional()
});

// Get all active workspaces
router.get('/workspaces', (req, res) => {
  try {
    const workspaces = realTimeCollaboration.getActiveWorkspaces();
    res.json({
      success: true,
      workspaces: workspaces.map(workspace => ({
        id: workspace.id,
        name: workspace.name,
        projectId: workspace.projectId,
        userCount: workspace.users.size,
        created: workspace.created,
        lastActivity: workspace.lastActivity,
        sharedState: workspace.sharedState
      })),
      message: `Found ${workspaces.length} active workspaces`
    });
  } catch (error) {
    console.error('Get workspaces error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get workspaces'
    });
  }
});

// Get specific workspace
router.get('/workspaces/:workspaceId', (req, res) => {
  try {
    const { workspaceId } = req.params;
    const workspace = realTimeCollaboration.getWorkspace(workspaceId);
    
    if (!workspace) {
      return res.status(404).json({
        success: false,
        message: `Workspace ${workspaceId} not found`
      });
    }

    res.json({
      success: true,
      workspace: {
        id: workspace.id,
        name: workspace.name,
        projectId: workspace.projectId,
        users: Array.from(workspace.users.values()),
        sharedState: workspace.sharedState,
        created: workspace.created,
        lastActivity: workspace.lastActivity
      },
      message: 'Workspace retrieved successfully'
    });
  } catch (error) {
    console.error('Get workspace error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get workspace'
    });
  }
});

// Get workspace users
router.get('/workspaces/:workspaceId/users', (req, res) => {
  try {
    const { workspaceId } = req.params;
    const users = realTimeCollaboration.getWorkspaceUsers(workspaceId);
    
    res.json({
      success: true,
      users,
      message: `Found ${users.length} users in workspace`
    });
  } catch (error) {
    console.error('Get workspace users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get workspace users'
    });
  }
});

// Get message history
router.get('/workspaces/:workspaceId/messages', (req, res) => {
  try {
    const { workspaceId } = req.params;
    const limit = parseInt(req.query.limit as string) || 100;
    
    const messages = realTimeCollaboration.getMessageHistory(workspaceId, limit);
    
    res.json({
      success: true,
      messages,
      count: messages.length,
      message: 'Message history retrieved successfully'
    });
  } catch (error) {
    console.error('Get message history error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get message history'
    });
  }
});

// Update user role
router.post('/workspaces/:workspaceId/users/role', (req, res) => {
  try {
    const { workspaceId } = req.params;
    const { userId, role } = updateUserRoleSchema.parse(req.body);
    
    const success = realTimeCollaboration.updateUserRole(workspaceId, userId, role);
    
    if (!success) {
      return res.status(404).json({
        success: false,
        message: 'Workspace or user not found'
      });
    }

    res.json({
      success: true,
      message: `User role updated to ${role}`
    });
  } catch (error) {
    console.error('Update user role error:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role data',
        errors: error.errors
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to update user role'
    });
  }
});

// Send direct message
router.post('/users/:fromUserId/message', (req, res) => {
  try {
    const { fromUserId } = req.params;
    const { toUserId, message } = sendMessageSchema.parse(req.body);
    
    const success = realTimeCollaboration.sendDirectMessage(fromUserId, toUserId, message);
    
    if (!success) {
      return res.status(404).json({
        success: false,
        message: 'Recipient user not found or offline'
      });
    }

    res.json({
      success: true,
      message: 'Direct message sent successfully'
    });
  } catch (error) {
    console.error('Send direct message error:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Invalid message data',
        errors: error.errors
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to send direct message'
    });
  }
});

// Kick user from workspace
router.post('/workspaces/:workspaceId/kick', (req, res) => {
  try {
    const { workspaceId } = req.params;
    const { userId, reason = 'Removed by administrator' } = kickUserSchema.parse(req.body);
    
    const success = realTimeCollaboration.kickUserFromWorkspace(workspaceId, userId, reason);
    
    if (!success) {
      return res.status(404).json({
        success: false,
        message: 'Workspace or user not found'
      });
    }

    res.json({
      success: true,
      message: `User ${userId} removed from workspace`
    });
  } catch (error) {
    console.error('Kick user error:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Invalid kick data',
        errors: error.errors
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to kick user'
    });
  }
});

// Collaboration statistics
router.get('/statistics', (req, res) => {
  try {
    const workspaces = realTimeCollaboration.getActiveWorkspaces();
    
    const statistics = {
      totalWorkspaces: workspaces.length,
      totalUsers: workspaces.reduce((sum, w) => sum + w.users.size, 0),
      averageUsersPerWorkspace: workspaces.length > 0 
        ? workspaces.reduce((sum, w) => sum + w.users.size, 0) / workspaces.length 
        : 0,
      mostActiveWorkspace: workspaces.reduce((most, current) => 
        current.users.size > most.users.size ? current : most, 
        workspaces[0] || null
      ),
      onlineUsers: workspaces.reduce((sum, w) => {
        const onlineCount = Array.from(w.users.values()).filter(u => u.status === 'online').length;
        return sum + onlineCount;
      }, 0)
    };

    res.json({
      success: true,
      statistics,
      message: 'Collaboration statistics retrieved successfully'
    });
  } catch (error) {
    console.error('Get collaboration statistics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get collaboration statistics'
    });
  }
});

// Get workspace connection info for WebSocket
router.get('/workspaces/:workspaceId/connection', (req, res) => {
  try {
    const { workspaceId } = req.params;
    const userId = req.query.userId as string;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'userId query parameter is required'
      });
    }

    const protocol = req.protocol === 'https' ? 'wss' : 'ws';
    const host = req.get('host');
    const wsUrl = `${protocol}://${host}/collaboration?userId=${userId}&workspaceId=${workspaceId}`;

    res.json({
      success: true,
      connection: {
        wsUrl,
        workspaceId,
        userId
      },
      message: 'Connection info retrieved successfully'
    });
  } catch (error) {
    console.error('Get connection info error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get connection info'
    });
  }
});

export default router;