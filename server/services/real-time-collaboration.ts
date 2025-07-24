import { WebSocketServer, WebSocket } from 'ws';
import { IncomingMessage } from 'http';
import { autonomousAgentOrchestrator } from './autonomous-agent-orchestrator';

export interface CollaborationUser {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'owner' | 'collaborator' | 'viewer';
  status: 'online' | 'away' | 'offline';
  lastSeen: Date;
  currentWorkspace?: string;
  cursor?: {
    x: number;
    y: number;
    panel: 'chat' | 'preview' | 'agents';
  };
}

export interface WorkspaceSession {
  id: string;
  name: string;
  projectId: string;
  users: Map<string, CollaborationUser>;
  sharedState: {
    currentView: string;
    panelSizes: { left: number; center: number; right: number };
    activeTab?: string;
    aiContext: string[];
    lastUpdate: Date;
  };
  created: Date;
  lastActivity: Date;
}

export interface CollaborationMessage {
  type: 'user_join' | 'user_leave' | 'cursor_move' | 'state_sync' | 'ai_message' | 'code_change' | 'agent_update';
  userId: string;
  workspaceId: string;
  timestamp: Date;
  data: any;
}

class RealTimeCollaborationService {
  private wss?: WebSocketServer;
  private connections: Map<string, WebSocket> = new Map();
  private userSessions: Map<string, string> = new Map(); // userId -> workspaceId
  private workspaces: Map<string, WorkspaceSession> = new Map();
  private messageHistory: Map<string, CollaborationMessage[]> = new Map();

  constructor() {
    this.initializeCollaboration();
  }

  setupWebSocketServer(server: any): void {
    this.wss = new WebSocketServer({ 
      server, 
      path: '/collaboration',
      verifyClient: (info) => {
        // Add authentication verification here
        return true;
      }
    });

    this.wss.on('connection', (ws: WebSocket, request: IncomingMessage) => {
      this.handleConnection(ws, request);
    });

    console.log('🤝 Real-time collaboration server initialized');
  }

  private handleConnection(ws: WebSocket, request: IncomingMessage): void {
    const url = new URL(request.url || '', `http://${request.headers.host}`);
    const userId = url.searchParams.get('userId');
    const workspaceId = url.searchParams.get('workspaceId');

    if (!userId || !workspaceId) {
      ws.close(4000, 'Missing userId or workspaceId');
      return;
    }

    console.log(`👥 User ${userId} joining workspace ${workspaceId}`);

    // Store connection
    this.connections.set(userId, ws);
    this.userSessions.set(userId, workspaceId);

    // Create or join workspace
    this.joinWorkspace(userId, workspaceId);

    // Handle messages
    ws.on('message', (data: Buffer) => {
      try {
        const message = JSON.parse(data.toString());
        this.handleMessage(userId, message);
      } catch (error) {
        console.error('Invalid message format:', error);
      }
    });

    // Handle disconnection
    ws.on('close', () => {
      this.handleDisconnection(userId);
    });

    // Send initial state
    this.sendWorkspaceState(userId, workspaceId);
  }

  private initializeCollaboration(): void {
    // Start periodic cleanup and updates
    setInterval(() => {
      this.cleanupInactiveUsers();
      this.broadcastAgentUpdates();
    }, 30000); // Every 30 seconds
  }

  private joinWorkspace(userId: string, workspaceId: string): void {
    let workspace = this.workspaces.get(workspaceId);
    
    if (!workspace) {
      workspace = {
        id: workspaceId,
        name: `Workspace ${workspaceId}`,
        projectId: workspaceId, // Assuming workspace ID maps to project ID
        users: new Map(),
        sharedState: {
          currentView: 'workspace',
          panelSizes: { left: 30, center: 40, right: 30 },
          aiContext: [],
          lastUpdate: new Date()
        },
        created: new Date(),
        lastActivity: new Date()
      };
      this.workspaces.set(workspaceId, workspace);
      this.messageHistory.set(workspaceId, []);
    }

    // Add user to workspace
    const user: CollaborationUser = {
      id: userId,
      name: `User ${userId}`,
      email: `user${userId}@example.com`,
      role: workspace.users.size === 0 ? 'owner' : 'collaborator',
      status: 'online',
      lastSeen: new Date(),
      currentWorkspace: workspaceId
    };

    workspace.users.set(userId, user);
    workspace.lastActivity = new Date();

    // Broadcast user join
    this.broadcastToWorkspace(workspaceId, {
      type: 'user_join',
      userId,
      workspaceId,
      timestamp: new Date(),
      data: { user }
    }, userId);
  }

  private handleMessage(userId: string, message: any): void {
    const workspaceId = this.userSessions.get(userId);
    if (!workspaceId) return;

    const workspace = this.workspaces.get(workspaceId);
    if (!workspace) return;

    const collaborationMessage: CollaborationMessage = {
      type: message.type,
      userId,
      workspaceId,
      timestamp: new Date(),
      data: message.data
    };

    // Store message in history
    const history = this.messageHistory.get(workspaceId) || [];
    history.push(collaborationMessage);
    this.messageHistory.set(workspaceId, history.slice(-1000)); // Keep last 1000 messages

    // Handle different message types
    switch (message.type) {
      case 'cursor_move':
        this.handleCursorMove(userId, workspaceId, message.data);
        break;
      case 'state_sync':
        this.handleStateSync(userId, workspaceId, message.data);
        break;
      case 'ai_message':
        this.handleAIMessage(userId, workspaceId, message.data);
        break;
      case 'code_change':
        this.handleCodeChange(userId, workspaceId, message.data);
        break;
      default:
        // Broadcast unknown messages to all users
        this.broadcastToWorkspace(workspaceId, collaborationMessage, userId);
    }

    workspace.lastActivity = new Date();
  }

  private handleCursorMove(userId: string, workspaceId: string, data: any): void {
    const workspace = this.workspaces.get(workspaceId);
    if (!workspace) return;

    const user = workspace.users.get(userId);
    if (user) {
      user.cursor = data.cursor;
      user.lastSeen = new Date();

      // Broadcast cursor position to other users
      this.broadcastToWorkspace(workspaceId, {
        type: 'cursor_move',
        userId,
        workspaceId,
        timestamp: new Date(),
        data: { cursor: data.cursor }
      }, userId);
    }
  }

  private handleStateSync(userId: string, workspaceId: string, data: any): void {
    const workspace = this.workspaces.get(workspaceId);
    if (!workspace) return;

    // Update shared state
    workspace.sharedState = {
      ...workspace.sharedState,
      ...data,
      lastUpdate: new Date()
    };

    // Broadcast state change to all users
    this.broadcastToWorkspace(workspaceId, {
      type: 'state_sync',
      userId,
      workspaceId,
      timestamp: new Date(),
      data: workspace.sharedState
    });
  }

  private async handleAIMessage(userId: string, workspaceId: string, data: any): Promise<void> {
    const workspace = this.workspaces.get(workspaceId);
    if (!workspace) return;

    // Add message to AI context
    workspace.sharedState.aiContext.push(data.message);
    
    // Keep only last 50 messages for context
    if (workspace.sharedState.aiContext.length > 50) {
      workspace.sharedState.aiContext = workspace.sharedState.aiContext.slice(-50);
    }

    // Broadcast AI message to all users
    this.broadcastToWorkspace(workspaceId, {
      type: 'ai_message',
      userId,
      workspaceId,
      timestamp: new Date(),
      data: {
        message: data.message,
        context: workspace.sharedState.aiContext
      }
    });

    // If this triggers an autonomous agent action, start it
    if (data.triggerAgent) {
      try {
        const project = await autonomousAgentOrchestrator.createProject({
          name: `Collaborative Project ${workspaceId}`,
          description: data.message,
          requirements: data.requirements || [],
          timeline: data.timeline || '1 week',
          projectType: data.projectType || 'web-app'
        });

        // Broadcast agent project creation
        this.broadcastToWorkspace(workspaceId, {
          type: 'agent_update',
          userId: 'system',
          workspaceId,
          timestamp: new Date(),
          data: {
            action: 'project_created',
            project: project
          }
        });

        // Start the project
        await autonomousAgentOrchestrator.startProject(project.id);

      } catch (error) {
        console.error('Failed to create autonomous project:', error);
      }
    }
  }

  private handleCodeChange(userId: string, workspaceId: string, data: any): void {
    // Broadcast code changes to all users for real-time editing
    this.broadcastToWorkspace(workspaceId, {
      type: 'code_change',
      userId,
      workspaceId,
      timestamp: new Date(),
      data: {
        file: data.file,
        changes: data.changes,
        cursor: data.cursor
      }
    }, userId);
  }

  private handleDisconnection(userId: string): void {
    const workspaceId = this.userSessions.get(userId);
    if (!workspaceId) return;

    const workspace = this.workspaces.get(workspaceId);
    if (workspace) {
      const user = workspace.users.get(userId);
      if (user) {
        user.status = 'offline';
        user.lastSeen = new Date();

        // Broadcast user leave
        this.broadcastToWorkspace(workspaceId, {
          type: 'user_leave',
          userId,
          workspaceId,
          timestamp: new Date(),
          data: { user }
        }, userId);

        // Remove user after 5 minutes
        setTimeout(() => {
          workspace.users.delete(userId);
          if (workspace.users.size === 0) {
            this.workspaces.delete(workspaceId);
            this.messageHistory.delete(workspaceId);
          }
        }, 5 * 60 * 1000);
      }
    }

    this.connections.delete(userId);
    this.userSessions.delete(userId);
  }

  private broadcastToWorkspace(workspaceId: string, message: CollaborationMessage, excludeUserId?: string): void {
    const workspace = this.workspaces.get(workspaceId);
    if (!workspace) return;

    workspace.users.forEach((user, userId) => {
      if (userId !== excludeUserId && user.status === 'online') {
        const ws = this.connections.get(userId);
        if (ws && ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify(message));
        }
      }
    });
  }

  private sendWorkspaceState(userId: string, workspaceId: string): void {
    const workspace = this.workspaces.get(workspaceId);
    if (!workspace) return;

    const ws = this.connections.get(userId);
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({
        type: 'workspace_state',
        userId: 'system',
        workspaceId,
        timestamp: new Date(),
        data: {
          workspace: {
            id: workspace.id,
            name: workspace.name,
            users: Array.from(workspace.users.values()),
            sharedState: workspace.sharedState
          },
          recentMessages: this.messageHistory.get(workspaceId)?.slice(-20) || []
        }
      }));
    }
  }

  private cleanupInactiveUsers(): void {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    
    this.workspaces.forEach((workspace, workspaceId) => {
      workspace.users.forEach((user, userId) => {
        if (user.status === 'online' && user.lastSeen < fiveMinutesAgo) {
          user.status = 'away';
          this.broadcastToWorkspace(workspaceId, {
            type: 'user_leave',
            userId,
            workspaceId,
            timestamp: new Date(),
            data: { user, reason: 'inactive' }
          });
        }
      });
    });
  }

  private broadcastAgentUpdates(): void {
    // Get agent status from orchestrator
    const agents = autonomousAgentOrchestrator.getAgents();
    const projects = autonomousAgentOrchestrator.getProjects();
    const events = autonomousAgentOrchestrator.getEventLog();

    // Broadcast agent updates to all active workspaces
    this.workspaces.forEach((workspace, workspaceId) => {
      if (workspace.users.size > 0) {
        this.broadcastToWorkspace(workspaceId, {
          type: 'agent_update',
          userId: 'system',
          workspaceId,
          timestamp: new Date(),
          data: {
            agents,
            projects,
            events: events.slice(-10) // Last 10 events
          }
        });
      }
    });
  }

  // Public API methods
  getActiveWorkspaces(): WorkspaceSession[] {
    return Array.from(this.workspaces.values());
  }

  getWorkspace(workspaceId: string): WorkspaceSession | undefined {
    return this.workspaces.get(workspaceId);
  }

  getWorkspaceUsers(workspaceId: string): CollaborationUser[] {
    const workspace = this.workspaces.get(workspaceId);
    return workspace ? Array.from(workspace.users.values()) : [];
  }

  getMessageHistory(workspaceId: string, limit: number = 100): CollaborationMessage[] {
    const history = this.messageHistory.get(workspaceId) || [];
    return history.slice(-limit);
  }

  kickUserFromWorkspace(workspaceId: string, userId: string, reason: string = 'Removed by administrator'): boolean {
    const workspace = this.workspaces.get(workspaceId);
    if (!workspace || !workspace.users.has(userId)) {
      return false;
    }

    const ws = this.connections.get(userId);
    if (ws) {
      ws.close(4001, reason);
    }

    this.handleDisconnection(userId);
    return true;
  }

  sendDirectMessage(fromUserId: string, toUserId: string, message: string): boolean {
    const ws = this.connections.get(toUserId);
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      return false;
    }

    ws.send(JSON.stringify({
      type: 'direct_message',
      userId: fromUserId,
      workspaceId: 'direct',
      timestamp: new Date(),
      data: { message }
    }));

    return true;
  }

  updateUserRole(workspaceId: string, userId: string, role: CollaborationUser['role']): boolean {
    const workspace = this.workspaces.get(workspaceId);
    if (!workspace) return false;

    const user = workspace.users.get(userId);
    if (!user) return false;

    user.role = role;
    
    this.broadcastToWorkspace(workspaceId, {
      type: 'user_role_updated',
      userId: 'system',
      workspaceId,
      timestamp: new Date(),
      data: { userId, role }
    });

    return true;
  }
}

export const realTimeCollaboration = new RealTimeCollaborationService();