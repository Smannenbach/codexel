import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Users, MessageCircle, UserPlus, Settings, Crown, Eye, Edit3 } from 'lucide-react';

interface CollaborationUser {
  id: string;
  name: string;
  email: string;
  role: 'owner' | 'collaborator' | 'viewer';
  status: 'online' | 'away' | 'offline';
  avatar?: string;
  lastSeen: Date;
  currentLocation?: {
    panel: string;
    activity: string;
  };
}

interface CollaborationWorkspace {
  id: string;
  name: string;
  projectId: string;
  userCount: number;
  created: Date;
  lastActivity: Date;
  sharedState: {
    currentPanel: string;
    activeUsers: number;
    lastModified: Date;
  };
}

interface CollaborationMessage {
  id: string;
  userId: string;
  userName: string;
  content: string;
  timestamp: Date;
  type: 'text' | 'system' | 'file' | 'code';
  metadata?: any;
}

const roleIcons = {
  owner: Crown,
  collaborator: Edit3,
  viewer: Eye
};

const statusColors = {
  online: 'bg-green-500',
  away: 'bg-yellow-500',
  offline: 'bg-gray-500'
};

export default function CollaborationPanel() {
  const [selectedWorkspace, setSelectedWorkspace] = useState<string | null>(null);
  const [messageText, setMessageText] = useState('');
  const [wsConnection, setWsConnection] = useState<WebSocket | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Mock current user (in real app, get from auth context)
  const currentUserId = 'user-123';

  // Fetch workspaces
  const { data: workspacesData, isLoading: workspacesLoading } = useQuery({
    queryKey: ['/api/collaboration/workspaces'],
    refetchInterval: 5000
  });

  // Fetch workspace users
  const { data: usersData, isLoading: usersLoading } = useQuery({
    queryKey: ['/api/collaboration/workspaces', selectedWorkspace, 'users'],
    enabled: !!selectedWorkspace,
    refetchInterval: 3000
  });

  // Fetch messages
  const { data: messagesData } = useQuery({
    queryKey: ['/api/collaboration/workspaces', selectedWorkspace, 'messages'],
    enabled: !!selectedWorkspace,
    refetchInterval: 2000
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async ({ toUserId, message }: { toUserId: string; message: string }) => {
      return apiRequest('POST', `/api/collaboration/users/${currentUserId}/message`, { toUserId, message });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/collaboration/workspaces', selectedWorkspace, 'messages'] });
      setMessageText('');
    },
    onError: (error: any) => {
      toast({ title: "Failed to send message", description: error.message, variant: "destructive" });
    }
  });

  // Update user role mutation
  const updateRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: string }) => {
      return apiRequest('POST', `/api/collaboration/workspaces/${selectedWorkspace}/users/role`, { userId, role });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/collaboration/workspaces', selectedWorkspace, 'users'] });
      toast({ title: "User role updated successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Failed to update role", description: error.message, variant: "destructive" });
    }
  });

  const workspaces: CollaborationWorkspace[] = (workspacesData as any)?.workspaces || [];
  const users: CollaborationUser[] = (usersData as any)?.users || [];
  const messages: CollaborationMessage[] = (messagesData as any)?.messages || [];

  // Initialize WebSocket connection
  useEffect(() => {
    if (selectedWorkspace) {
      // Get WebSocket connection info
      apiRequest('GET', `/api/collaboration/workspaces/${selectedWorkspace}/connection?userId=${currentUserId}`)
        .then((response: any) => {
          const { wsUrl } = response.connection;
          const ws = new WebSocket(wsUrl);
          
          ws.onopen = () => {
            console.log('🔗 Connected to collaboration workspace');
            setWsConnection(ws);
          };
          
          ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            console.log('📨 Received collaboration message:', data);
            
            // Invalidate queries to refresh data
            queryClient.invalidateQueries({ queryKey: ['/api/collaboration/workspaces'] });
          };
          
          ws.onclose = () => {
            console.log('📡 Disconnected from collaboration workspace');
            setWsConnection(null);
          };
          
          return () => {
            ws.close();
          };
        })
        .catch(error => {
          console.error('Failed to connect to collaboration workspace:', error);
        });
    }
  }, [selectedWorkspace, currentUserId, queryClient]);

  const handleSendMessage = () => {
    if (!messageText.trim() || !selectedWorkspace) return;
    
    // In a real implementation, send via WebSocket
    if (wsConnection && wsConnection.readyState === WebSocket.OPEN) {
      wsConnection.send(JSON.stringify({
        type: 'chat-message',
        content: messageText,
        workspaceId: selectedWorkspace,
        userId: currentUserId
      }));
      setMessageText('');
    }
  };

  const handleJoinWorkspace = (workspaceId: string) => {
    setSelectedWorkspace(workspaceId);
    toast({ title: "Joined workspace", description: "You are now collaborating in real-time" });
  };

  const handleUpdateRole = (userId: string, role: string) => {
    updateRoleMutation.mutate({ userId, role });
  };

  return (
    <div className="h-full flex flex-col space-y-4 p-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Real-time Collaboration</h2>
          <p className="text-muted-foreground">Work together with your team in real-time</p>
        </div>
        <div className="flex items-center gap-2">
          {wsConnection ? (
            <Badge className="bg-green-500 text-white">Connected</Badge>
          ) : (
            <Badge variant="secondary">Offline</Badge>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 flex-1">
        {/* Workspaces Panel */}
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Active Workspaces ({workspaces.length})
            </CardTitle>
            <CardDescription>Join a workspace to collaborate</CardDescription>
          </CardHeader>
          <CardContent className="flex-1">
            <ScrollArea className="h-full">
              <div className="space-y-3">
                {workspacesLoading ? (
                  <div className="text-center py-8">Loading workspaces...</div>
                ) : workspaces.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No active workspaces
                  </div>
                ) : (
                  workspaces.map((workspace) => (
                    <div
                      key={workspace.id}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        selectedWorkspace === workspace.id ? 'border-primary bg-primary/5' : 'hover:bg-gray-50'
                      }`}
                      onClick={() => handleJoinWorkspace(workspace.id)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{workspace.name}</h4>
                        <Badge variant="outline">{workspace.userCount} users</Badge>
                      </div>
                      
                      <div className="text-sm text-muted-foreground">
                        Last activity: {new Date(workspace.lastActivity).toLocaleTimeString()}
                      </div>
                      
                      {workspace.sharedState && (
                        <div className="text-xs text-muted-foreground mt-1">
                          Current panel: {workspace.sharedState.currentPanel}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Users Panel */}
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Collaborators ({users.filter(u => u.status === 'online').length}/{users.length})
            </CardTitle>
            <CardDescription>Team members in this workspace</CardDescription>
          </CardHeader>
          <CardContent className="flex-1">
            {!selectedWorkspace ? (
              <div className="text-center py-8 text-muted-foreground">
                Select a workspace to see collaborators
              </div>
            ) : (
              <ScrollArea className="h-full">
                <div className="space-y-3">
                  {usersLoading ? (
                    <div className="text-center py-8">Loading users...</div>
                  ) : (
                    users.map((user) => {
                      const RoleIcon = roleIcons[user.role];
                      return (
                        <div key={user.id} className="p-3 border rounded-lg">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="relative">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={user.avatar} />
                                <AvatarFallback>{user.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                              </Avatar>
                              <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full ${statusColors[user.status]}`} />
                            </div>
                            
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{user.name}</span>
                                <RoleIcon className="h-3 w-3" />
                              </div>
                              <div className="text-xs text-muted-foreground">{user.email}</div>
                            </div>
                          </div>
                          
                          {user.currentLocation && (
                            <div className="text-xs text-muted-foreground mb-2">
                              {user.currentLocation.activity} in {user.currentLocation.panel}
                            </div>
                          )}
                          
                          <div className="flex items-center justify-between">
                            <Badge variant="outline" className="text-xs">
                              {user.role}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {user.status === 'online' ? 'Online' : `Last seen: ${new Date(user.lastSeen).toLocaleTimeString()}`}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>

        {/* Chat Panel */}
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              Team Chat
            </CardTitle>
            <CardDescription>Real-time communication</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col">
            {!selectedWorkspace ? (
              <div className="text-center py-8 text-muted-foreground">
                Join a workspace to start chatting
              </div>
            ) : (
              <>
                <ScrollArea className="flex-1 mb-4">
                  <div className="space-y-3">
                    {messages.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        No messages yet. Start the conversation!
                      </div>
                    ) : (
                      messages.map((message) => (
                        <div key={message.id} className="p-3 border rounded-lg">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-sm">{message.userName}</span>
                            <span className="text-xs text-muted-foreground">
                              {new Date(message.timestamp).toLocaleTimeString()}
                            </span>
                          </div>
                          <p className="text-sm">{message.content}</p>
                        </div>
                      ))
                    )}
                  </div>
                </ScrollArea>

                <div className="flex gap-2">
                  <Input
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    placeholder="Type a message..."
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                  />
                  <Button 
                    onClick={handleSendMessage}
                    disabled={!messageText.trim() || !wsConnection}
                  >
                    Send
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Collaboration Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>Collaboration Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{workspaces.length}</div>
              <div className="text-sm text-muted-foreground">Active Workspaces</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{users.filter(u => u.status === 'online').length}</div>
              <div className="text-sm text-muted-foreground">Online Users</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{messages.length}</div>
              <div className="text-sm text-muted-foreground">Messages Today</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{wsConnection ? '✓' : '✗'}</div>
              <div className="text-sm text-muted-foreground">Connection Status</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}