import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { 
  Rocket, 
  Server, 
  Globe, 
  Shield, 
  Clock, 
  Activity, 
  AlertTriangle, 
  CheckCircle,
  XCircle,
  RotateCcw,
  Play,
  Pause,
  Settings,
  BarChart3
} from 'lucide-react';

interface DeploymentEnvironment {
  id: string;
  name: string;
  type: 'development' | 'staging' | 'production';
  url?: string;
  status: 'inactive' | 'deploying' | 'active' | 'failed' | 'maintenance';
  health: {
    cpu: number;
    memory: number;
    disk: number;
    network: number;
    uptime: number;
  };
  config: {
    domain?: string;
    ssl: boolean;
    cdn: boolean;
    autoScale: boolean;
    backups: boolean;
    monitoring: boolean;
  };
  deployments: DeploymentRecord[];
  lastDeployed?: Date;
}

interface DeploymentRecord {
  id: string;
  version: string;
  status: 'pending' | 'building' | 'testing' | 'deploying' | 'success' | 'failed' | 'rolled-back';
  startTime: Date;
  endTime?: Date;
  duration?: number;
  logs: Array<{
    timestamp: Date;
    level: 'info' | 'warn' | 'error' | 'debug';
    message: string;
  }>;
}

interface Pipeline {
  id: string;
  name: string;
  status: 'active' | 'paused' | 'disabled';
  lastRun?: Date;
  successRate: number;
}

const environmentTypeColors = {
  development: 'bg-blue-500',
  staging: 'bg-yellow-500',
  production: 'bg-green-500'
};

const statusColors = {
  inactive: 'bg-gray-500',
  deploying: 'bg-blue-500 animate-pulse',
  active: 'bg-green-500',
  failed: 'bg-red-500',
  maintenance: 'bg-yellow-500'
};

const deploymentStatusColors = {
  pending: 'bg-gray-500',
  building: 'bg-blue-500',
  testing: 'bg-yellow-500',
  deploying: 'bg-blue-600',
  success: 'bg-green-500',
  failed: 'bg-red-500',
  'rolled-back': 'bg-orange-500'
};

export default function EnterpriseDeploymentPanel() {
  const [selectedEnvironment, setSelectedEnvironment] = useState<string>('prod');
  const [selectedDeployment, setSelectedDeployment] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch environments
  const { data: environmentsData, isLoading: environmentsLoading } = useQuery({
    queryKey: ['/api/deployment/environments'],
    refetchInterval: 5000
  });

  // Fetch active deployments
  const { data: activeDeploymentsData } = useQuery({
    queryKey: ['/api/deployment/deployments/active'],
    refetchInterval: 3000
  });

  // Fetch deployment history
  const { data: deploymentsData } = useQuery({
    queryKey: ['/api/deployment/environments', selectedEnvironment, 'deployments'],
    enabled: !!selectedEnvironment,
    refetchInterval: 5000
  });

  // Fetch pipelines
  const { data: pipelinesData } = useQuery({
    queryKey: ['/api/deployment/pipelines'],
    refetchInterval: 10000
  });

  // Deploy mutation
  const deployMutation = useMutation({
    mutationFn: async ({ environmentId, config }: { environmentId: string; config: any }) => {
      return apiRequest('POST', `/api/deployment/environments/${environmentId}/deploy`, config);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/deployment/environments'] });
      queryClient.invalidateQueries({ queryKey: ['/api/deployment/deployments/active'] });
      toast({ 
        title: "Deployment started", 
        description: `Deployment ${data.deployment.id} initiated successfully` 
      });
    },
    onError: (error: any) => {
      toast({ 
        title: "Deployment failed", 
        description: error.message, 
        variant: "destructive" 
      });
    }
  });

  // Rollback mutation
  const rollbackMutation = useMutation({
    mutationFn: async ({ environmentId, targetDeploymentId }: { environmentId: string; targetDeploymentId?: string }) => {
      return apiRequest('POST', `/api/deployment/environments/${environmentId}/rollback`, { targetDeploymentId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/deployment/environments'] });
      toast({ title: "Rollback initiated", description: "Rolling back to previous version" });
    },
    onError: (error: any) => {
      toast({ title: "Rollback failed", description: error.message, variant: "destructive" });
    }
  });

  // Run pipeline mutation
  const runPipelineMutation = useMutation({
    mutationFn: async ({ pipelineId, trigger }: { pipelineId: string; trigger?: string }) => {
      return apiRequest('POST', `/api/deployment/pipelines/${pipelineId}/run`, { trigger });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/deployment/pipelines'] });
      toast({ 
        title: "Pipeline started", 
        description: `Pipeline run ${data.runId} initiated successfully` 
      });
    },
    onError: (error: any) => {
      toast({ title: "Pipeline failed", description: error.message, variant: "destructive" });
    }
  });

  const environments: DeploymentEnvironment[] = (environmentsData as any)?.environments || [];
  const activeDeployments: DeploymentRecord[] = (activeDeploymentsData as any)?.deployments || [];
  const deployments: DeploymentRecord[] = (deploymentsData as any)?.deployments || [];
  const pipelines: Pipeline[] = (pipelinesData as any)?.pipelines || [];

  const selectedEnv = environments.find(env => env.id === selectedEnvironment);

  const handleDeploy = (environmentId: string) => {
    const config = {
      triggeredBy: 'manual-deployment',
      version: 'latest'
    };
    deployMutation.mutate({ environmentId, config });
  };

  const handleRollback = (environmentId: string) => {
    rollbackMutation.mutate({ environmentId });
  };

  const handleRunPipeline = (pipelineId: string) => {
    runPipelineMutation.mutate({ pipelineId, trigger: 'manual' });
  };

  const getHealthColor = (value: number) => {
    if (value > 90) return 'text-red-500';
    if (value > 75) return 'text-yellow-500';
    return 'text-green-500';
  };

  return (
    <div className="h-full flex flex-col space-y-4 p-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Enterprise Deployment</h2>
          <p className="text-muted-foreground">Automated deployment pipeline and environment management</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge className="bg-blue-500 text-white">
            {activeDeployments.length} Active
          </Badge>
          <Button 
            onClick={() => handleDeploy(selectedEnvironment)}
            disabled={deployMutation.isPending}
          >
            {deployMutation.isPending ? 'Deploying...' : 'Deploy Now'}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="environments" className="flex-1 flex flex-col">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="environments">Environments</TabsTrigger>
          <TabsTrigger value="deployments">Deployments</TabsTrigger>
          <TabsTrigger value="pipelines">Pipelines</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="environments" className="flex-1">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-full">
            {/* Environment List */}
            <Card className="flex flex-col">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Server className="h-5 w-5" />
                  Deployment Environments ({environments.length})
                </CardTitle>
                <CardDescription>Manage your deployment environments</CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                <ScrollArea className="h-full">
                  <div className="space-y-3">
                    {environmentsLoading ? (
                      <div className="text-center py-8">Loading environments...</div>
                    ) : (
                      environments.map((env) => (
                        <div
                          key={env.id}
                          className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                            selectedEnvironment === env.id ? 'border-primary bg-primary/5' : 'hover:bg-gray-50'
                          }`}
                          onClick={() => setSelectedEnvironment(env.id)}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <Badge className={`${environmentTypeColors[env.type]} text-white`}>
                                {env.type}
                              </Badge>
                              <span className="font-medium">{env.name}</span>
                            </div>
                            <Badge className={`${statusColors[env.status]} text-white`}>
                              {env.status}
                            </Badge>
                          </div>

                          {env.url && (
                            <div className="flex items-center gap-1 mb-2">
                              <Globe className="h-3 w-3" />
                              <span className="text-sm text-muted-foreground">{env.url}</span>
                            </div>
                          )}

                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div className={getHealthColor(env.health.cpu)}>
                              CPU: {env.health.cpu.toFixed(1)}%
                            </div>
                            <div className={getHealthColor(env.health.memory)}>
                              Memory: {env.health.memory.toFixed(1)}%
                            </div>
                            <div className="text-muted-foreground">
                              Uptime: {env.health.uptime.toFixed(2)}%
                            </div>
                            <div className="text-muted-foreground">
                              Deployments: {env.deployments.length}
                            </div>
                          </div>

                          {env.lastDeployed && (
                            <div className="text-xs text-muted-foreground mt-2">
                              Last deployed: {new Date(env.lastDeployed).toLocaleString()}
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Environment Details */}
            <Card className="flex flex-col">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Environment Details
                </CardTitle>
                <CardDescription>Configuration and health status</CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                {!selectedEnv ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Select an environment to view details
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">Health Metrics</h4>
                      <div className="space-y-2">
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>CPU Usage</span>
                            <span className={getHealthColor(selectedEnv.health.cpu)}>
                              {selectedEnv.health.cpu.toFixed(1)}%
                            </span>
                          </div>
                          <Progress value={selectedEnv.health.cpu} className="h-2" />
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Memory Usage</span>
                            <span className={getHealthColor(selectedEnv.health.memory)}>
                              {selectedEnv.health.memory.toFixed(1)}%
                            </span>
                          </div>
                          <Progress value={selectedEnv.health.memory} className="h-2" />
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Disk Usage</span>
                            <span className={getHealthColor(selectedEnv.health.disk)}>
                              {selectedEnv.health.disk.toFixed(1)}%
                            </span>
                          </div>
                          <Progress value={selectedEnv.health.disk} className="h-2" />
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Configuration</h4>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="flex items-center gap-2">
                          {selectedEnv.config.ssl ? <CheckCircle className="h-4 w-4 text-green-500" /> : <XCircle className="h-4 w-4 text-red-500" />}
                          <span className="text-sm">SSL</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {selectedEnv.config.cdn ? <CheckCircle className="h-4 w-4 text-green-500" /> : <XCircle className="h-4 w-4 text-red-500" />}
                          <span className="text-sm">CDN</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {selectedEnv.config.autoScale ? <CheckCircle className="h-4 w-4 text-green-500" /> : <XCircle className="h-4 w-4 text-red-500" />}
                          <span className="text-sm">Auto Scale</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {selectedEnv.config.backups ? <CheckCircle className="h-4 w-4 text-green-500" /> : <XCircle className="h-4 w-4 text-red-500" />}
                          <span className="text-sm">Backups</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleDeploy(selectedEnv.id)}
                        disabled={deployMutation.isPending || selectedEnv.status === 'deploying'}
                      >
                        <Rocket className="h-4 w-4 mr-1" />
                        Deploy
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => handleRollback(selectedEnv.id)}
                        disabled={rollbackMutation.isPending || selectedEnv.deployments.length === 0}
                      >
                        <RotateCcw className="h-4 w-4 mr-1" />
                        Rollback
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="deployments" className="flex-1">
          <Card className="h-full flex flex-col">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Recent Deployments
              </CardTitle>
              <CardDescription>
                Deployment history and status for {selectedEnv?.name || 'selected environment'}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
              <ScrollArea className="h-full">
                <div className="space-y-3">
                  {deployments.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No deployments found
                    </div>
                  ) : (
                    deployments.map((deployment) => (
                      <div key={deployment.id} className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">v{deployment.version}</span>
                            <Badge className={`${deploymentStatusColors[deployment.status]} text-white`}>
                              {deployment.status}
                            </Badge>
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {new Date(deployment.startTime).toLocaleString()}
                          </span>
                        </div>

                        {deployment.duration && (
                          <div className="text-sm text-muted-foreground mb-2">
                            Duration: {Math.round(deployment.duration / 1000)}s
                          </div>
                        )}

                        {deployment.logs.length > 0 && (
                          <div className="text-xs">
                            <div className="bg-gray-50 p-2 rounded">
                              {deployment.logs.slice(-3).map((log, index) => (
                                <div key={index} className="flex justify-between">
                                  <span>{log.message}</span>
                                  <span className="text-muted-foreground">
                                    {new Date(log.timestamp).toLocaleTimeString()}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pipelines" className="flex-1">
          <Card className="h-full flex flex-col">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                CI/CD Pipelines ({pipelines.length})
              </CardTitle>
              <CardDescription>Automated deployment pipelines</CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
              <ScrollArea className="h-full">
                <div className="space-y-3">
                  {pipelines.map((pipeline) => (
                    <div key={pipeline.id} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">{pipeline.name}</span>
                        <Badge variant={pipeline.status === 'active' ? 'default' : 'secondary'}>
                          {pipeline.status}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                        <div>
                          Success Rate: {pipeline.successRate.toFixed(1)}%
                        </div>
                        <div>
                          Last Run: {pipeline.lastRun ? new Date(pipeline.lastRun).toLocaleString() : 'Never'}
                        </div>
                      </div>

                      <Button
                        onClick={() => handleRunPipeline(pipeline.id)}
                        disabled={runPipelineMutation.isPending || pipeline.status !== 'active'}
                        size="sm"
                      >
                        <Play className="h-4 w-4 mr-1" />
                        Run Pipeline
                      </Button>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="flex-1">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-full">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Deployment Statistics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold">{environments.length}</div>
                    <div className="text-sm text-muted-foreground">Environments</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{activeDeployments.length}</div>
                    <div className="text-sm text-muted-foreground">Active Deployments</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">
                      {pipelines.filter(p => p.status === 'active').length}
                    </div>
                    <div className="text-sm text-muted-foreground">Active Pipelines</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">
                      {environments.filter(e => e.status === 'active').length}
                    </div>
                    <div className="text-sm text-muted-foreground">Healthy Environments</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Environment Health</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {environments.map((env) => (
                    <div key={env.id}>
                      <div className="flex justify-between text-sm mb-1">
                        <span>{env.name}</span>
                        <span>{env.health.uptime.toFixed(2)}% uptime</span>
                      </div>
                      <Progress value={env.health.uptime} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}