import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { 
  Rocket, 
  Globe, 
  Settings, 
  CheckCircle, 
  XCircle, 
  Clock,
  AlertTriangle,
  ExternalLink,
  RotateCcw,
  Loader2
} from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface DeploymentManagerProps {
  projectId: number;
}

interface DeploymentConfig {
  environment: 'staging' | 'production';
  domain?: string;
  autoScale: boolean;
  region: string;
}

interface Deployment {
  id: string;
  projectId: number;
  environment: string;
  status: 'pending' | 'building' | 'deploying' | 'success' | 'failed';
  url?: string;
  logs: string[];
  startedAt: string;
  completedAt?: string;
  error?: string;
}

export default function DeploymentManager({ projectId }: DeploymentManagerProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [deployConfig, setDeployConfig] = useState<DeploymentConfig>({
    environment: 'production',
    autoScale: true,
    region: 'us-east-1'
  });

  const [customDomain, setCustomDomain] = useState('');

  // Get deployment history
  const { data: deploymentsResponse, isLoading } = useQuery<{ deployments: Deployment[] }>({
    queryKey: [`/api/deployments/project/${projectId}`],
    refetchInterval: 5000 // Poll every 5 seconds for updates
  });
  
  const deployments = deploymentsResponse?.deployments || [];

  // Deploy mutation
  const deployMutation = useMutation({
    mutationFn: async (config: DeploymentConfig) => {
      return apiRequest('POST', '/api/deployments', {
        projectId,
        ...config,
        domain: customDomain || undefined
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/deployments/project/${projectId}`] });
      toast({
        title: "Deployment Started",
        description: "Your application deployment has been initiated.",
      });
    },
    onError: (error) => {
      toast({
        title: "Deployment Failed",
        description: "Failed to start deployment. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleDeploy = () => {
    deployMutation.mutate(deployConfig);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'pending':
      case 'building':
      case 'deploying':
        return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      success: 'default',
      failed: 'destructive',
      pending: 'secondary',
      building: 'secondary',
      deploying: 'secondary'
    } as const;

    return (
      <Badge variant={variants[status as keyof typeof variants] || 'secondary'}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const activeDeployment = deployments.find((d: Deployment) => 
    ['pending', 'building', 'deploying'].includes(d.status)
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Rocket className="h-6 w-6 text-primary" />
          <div>
            <h2 className="text-2xl font-bold">Deployment Manager</h2>
            <p className="text-muted-foreground">Deploy your application to production</p>
          </div>
        </div>
      </div>

      {/* Quick Deploy Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Quick Deploy
          </CardTitle>
          <CardDescription>
            Deploy your application with one click to Replit hosting
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Environment</Label>
              <select 
                className="w-full mt-1 p-2 border rounded-md"
                value={deployConfig.environment}
                onChange={(e) => setDeployConfig(prev => ({
                  ...prev, 
                  environment: e.target.value as 'staging' | 'production'
                }))}
              >
                <option value="staging">Staging</option>
                <option value="production">Production</option>
              </select>
            </div>
            
            <div>
              <Label>Region</Label>
              <select 
                className="w-full mt-1 p-2 border rounded-md"
                value={deployConfig.region}
                onChange={(e) => setDeployConfig(prev => ({...prev, region: e.target.value}))}
              >
                <option value="us-east-1">US East (N. Virginia)</option>
                <option value="us-west-2">US West (Oregon)</option>
                <option value="eu-west-1">Europe (Ireland)</option>
                <option value="ap-southeast-1">Asia Pacific (Singapore)</option>
              </select>
            </div>
          </div>

          <div>
            <Label>Custom Domain (Optional)</Label>
            <Input
              value={customDomain}
              onChange={(e) => setCustomDomain(e.target.value)}
              placeholder="example.com"
              className="mt-1"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Leave empty to use default Replit domain
            </p>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="autoScale"
                checked={deployConfig.autoScale}
                onChange={(e) => setDeployConfig(prev => ({...prev, autoScale: e.target.checked}))}
              />
              <Label htmlFor="autoScale">Enable auto-scaling</Label>
            </div>
            
            <Button
              onClick={handleDeploy}
              disabled={deployMutation.isPending || !!activeDeployment}
              className="gap-2"
            >
              {deployMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Rocket className="h-4 w-4" />
              )}
              {activeDeployment ? 'Deployment In Progress' : 'Deploy Now'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Active Deployment Status */}
      {activeDeployment && (
        <Card className="border-blue-200 bg-blue-50/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
              Deployment In Progress
            </CardTitle>
            <CardDescription>
              Environment: {activeDeployment.environment} • Started: {new Date(activeDeployment.startedAt).toLocaleTimeString()}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Status: {activeDeployment.status}</span>
                {getStatusBadge(activeDeployment.status)}
              </div>
              
              <Progress value={
                activeDeployment.status === 'pending' ? 10 :
                activeDeployment.status === 'building' ? 40 :
                activeDeployment.status === 'deploying' ? 80 : 100
              } />
              
              <ScrollArea className="h-32 w-full border rounded p-2 bg-gray-50">
                <div className="text-xs font-mono space-y-1">
                  {activeDeployment.logs.map((log: string, index: number) => (
                    <div key={index} className="text-gray-700">
                      {log}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Deployment History */}
      <Card>
        <CardHeader>
          <CardTitle>Deployment History</CardTitle>
          <CardDescription>
            View past deployments and their status
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : deployments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Rocket className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium mb-2">No deployments yet</p>
              <p className="text-sm">Deploy your first application to get started</p>
            </div>
          ) : (
            <ScrollArea className="h-80">
              <div className="space-y-3">
                {deployments.map((deployment: Deployment) => (
                  <div key={deployment.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(deployment.status)}
                      <div>
                        <div className="font-medium">
                          {deployment.environment} deployment
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {new Date(deployment.startedAt).toLocaleString()}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      {getStatusBadge(deployment.status)}
                      
                      {deployment.url && deployment.status === 'success' && (
                        <Button size="sm" variant="outline" asChild>
                          <a href={deployment.url} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-3 w-3 mr-1" />
                            Visit
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
}