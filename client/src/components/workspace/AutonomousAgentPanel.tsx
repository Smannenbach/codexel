import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { PlayCircle, PauseCircle, StopCircle, Brain, Code, Database, TestTube, Rocket, Settings } from 'lucide-react';

interface AutonomousAgent {
  id: string;
  name: string;
  role: 'architect' | 'frontend' | 'backend' | 'testing' | 'deployment' | 'coordinator';
  status: 'idle' | 'working' | 'completed' | 'error' | 'paused';
  currentTask?: string;
  capabilities: string[];
  performance: {
    tasksCompleted: number;
    successRate: number;
    averageCompletionTime: number;
    lastActive: Date;
  };
}

interface ProjectPlan {
  id: string;
  name: string;
  description: string;
  status: 'planning' | 'active' | 'paused' | 'completed' | 'failed';
  progress: {
    completedTasks: number;
    totalTasks: number;
    percentage: number;
  };
  tasks: Array<{
    id: string;
    title: string;
    status: 'pending' | 'assigned' | 'in-progress' | 'completed' | 'failed';
    type: 'planning' | 'architecture' | 'frontend' | 'backend' | 'testing' | 'deployment';
  }>;
}

const roleIcons = {
  architect: Brain,
  frontend: Code,
  backend: Database,
  testing: TestTube,
  deployment: Rocket,
  coordinator: Settings
};

const statusColors = {
  idle: 'bg-gray-500',
  working: 'bg-blue-500 animate-pulse',
  completed: 'bg-green-500',
  error: 'bg-red-500',
  paused: 'bg-yellow-500'
};

export default function AutonomousAgentPanel() {
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch agents
  const { data: agentsData, isLoading: agentsLoading } = useQuery({
    queryKey: ['/api/autonomous/agents'],
    refetchInterval: 5000 // Refresh every 5 seconds
  });

  // Fetch projects
  const { data: projectsData, isLoading: projectsLoading } = useQuery({
    queryKey: ['/api/autonomous/projects'],
    refetchInterval: 3000 // Refresh every 3 seconds
  });

  // Fetch events
  const { data: eventsData } = useQuery({
    queryKey: ['/api/autonomous/events'],
    refetchInterval: 2000 // Refresh every 2 seconds
  });

  // Create project mutation
  const createProjectMutation = useMutation({
    mutationFn: async (projectData: any) => {
      return apiRequest('POST', '/api/autonomous/projects', projectData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/autonomous/projects'] });
      toast({ title: "Project created successfully", description: "Autonomous agents are ready to start working" });
    },
    onError: (error: any) => {
      toast({ title: "Failed to create project", description: error.message, variant: "destructive" });
    }
  });

  // Project action mutation
  const projectActionMutation = useMutation({
    mutationFn: async ({ projectId, action }: { projectId: string; action: string }) => {
      return apiRequest('POST', `/api/autonomous/projects/${projectId}/actions`, { action });
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['/api/autonomous/projects'] });
      toast({ title: `Project ${variables.action} successful`, description: "Agent status updated" });
    },
    onError: (error: any) => {
      toast({ title: "Action failed", description: error.message, variant: "destructive" });
    }
  });

  const agents: AutonomousAgent[] = (agentsData as any)?.agents || [];
  const projects: ProjectPlan[] = (projectsData as any)?.projects || [];
  const events = (eventsData as any)?.events || [];

  const handleCreateProject = () => {
    const projectData = {
      name: `AI Project ${Date.now()}`,
      description: "AI-generated project with autonomous development",
      requirements: ["Modern web application", "Responsive design", "API integration"],
      timeline: "2 weeks",
      projectType: "web-app"
    };
    
    createProjectMutation.mutate(projectData);
  };

  const handleProjectAction = (projectId: string, action: string) => {
    projectActionMutation.mutate({ projectId, action });
  };

  return (
    <div className="h-full flex flex-col space-y-4 p-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Autonomous Agents</h2>
          <p className="text-muted-foreground">AI-powered development team working autonomously</p>
        </div>
        <Button onClick={handleCreateProject} disabled={createProjectMutation.isPending}>
          {createProjectMutation.isPending ? 'Creating...' : 'Create Project'}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1">
        {/* Agents Panel */}
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              Active Agents ({agents.filter(a => a.status === 'working').length}/{agents.length})
            </CardTitle>
            <CardDescription>Real-time agent status and performance</CardDescription>
          </CardHeader>
          <CardContent className="flex-1">
            <ScrollArea className="h-full">
              <div className="space-y-3">
                {agentsLoading ? (
                  <div className="text-center py-8">Loading agents...</div>
                ) : (
                  agents.map((agent) => {
                    const IconComponent = roleIcons[agent.role];
                    return (
                      <div key={agent.id} className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <IconComponent className="h-4 w-4" />
                            <span className="font-medium">{agent.name}</span>
                          </div>
                          <Badge className={`${statusColors[agent.status]} text-white`}>
                            {agent.status}
                          </Badge>
                        </div>
                        
                        {agent.currentTask && (
                          <p className="text-sm text-muted-foreground mb-2">
                            Working on: {agent.currentTask}
                          </p>
                        )}
                        
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>Tasks: {agent.performance.tasksCompleted}</div>
                          <div>Success: {agent.performance.successRate.toFixed(1)}%</div>
                        </div>
                        
                        <div className="mt-2">
                          <div className="flex flex-wrap gap-1">
                            {agent.capabilities.slice(0, 3).map((capability) => (
                              <Badge key={capability} variant="outline" className="text-xs">
                                {capability}
                              </Badge>
                            ))}
                            {agent.capabilities.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{agent.capabilities.length - 3}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Projects Panel */}
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Rocket className="h-5 w-5" />
              Active Projects ({projects.filter(p => p.status === 'active').length})
            </CardTitle>
            <CardDescription>Autonomous development projects in progress</CardDescription>
          </CardHeader>
          <CardContent className="flex-1">
            <ScrollArea className="h-full">
              <div className="space-y-3">
                {projectsLoading ? (
                  <div className="text-center py-8">Loading projects...</div>
                ) : projects.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No active projects. Create one to get started.
                  </div>
                ) : (
                  projects.map((project) => (
                    <div key={project.id} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{project.name}</h4>
                        <Badge variant={project.status === 'active' ? 'default' : 'secondary'}>
                          {project.status}
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-muted-foreground mb-3">
                        {project.description}
                      </p>
                      
                      <div className="mb-3">
                        <div className="flex justify-between text-sm mb-1">
                          <span>Progress</span>
                          <span>{project.progress.percentage}%</span>
                        </div>
                        <Progress value={project.progress.percentage} className="h-2" />
                        <div className="text-xs text-muted-foreground mt-1">
                          {project.progress.completedTasks}/{project.progress.totalTasks} tasks completed
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        {project.status === 'planning' && (
                          <Button
                            size="sm"
                            onClick={() => handleProjectAction(project.id, 'start')}
                            disabled={projectActionMutation.isPending}
                          >
                            <PlayCircle className="h-4 w-4 mr-1" />
                            Start
                          </Button>
                        )}
                        {project.status === 'active' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleProjectAction(project.id, 'pause')}
                            disabled={projectActionMutation.isPending}
                          >
                            <PauseCircle className="h-4 w-4 mr-1" />
                            Pause
                          </Button>
                        )}
                        {project.status === 'paused' && (
                          <Button
                            size="sm"
                            onClick={() => handleProjectAction(project.id, 'resume')}
                            disabled={projectActionMutation.isPending}
                          >
                            <PlayCircle className="h-4 w-4 mr-1" />
                            Resume
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleProjectAction(project.id, 'cancel')}
                          disabled={projectActionMutation.isPending}
                        >
                          <StopCircle className="h-4 w-4 mr-1" />
                          Stop
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Events Feed */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-32">
            <div className="space-y-2">
              {events.length === 0 ? (
                <p className="text-muted-foreground text-sm">No recent activity</p>
              ) : (
                events.slice(0, 10).map((event: any, index: number) => (
                  <div key={index} className="text-sm flex justify-between">
                    <span>{event.message}</span>
                    <span className="text-muted-foreground">
                      {new Date(event.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}