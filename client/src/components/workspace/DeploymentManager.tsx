import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Rocket, 
  Globe, 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  ExternalLink,
  Settings,
  Database,
  Shield,
  Zap
} from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface DeploymentConfig {
  environment: 'staging' | 'production';
  domain?: string;
  envVars: Record<string, string>;
  scalingConfig: {
    minInstances: number;
    maxInstances: number;
    cpuTarget: number;
  };
}

interface Deployment {
  id: number;
  environment: string;
  status: string;
  url?: string;
  deployedAt?: string;
  logs?: string;
}

export default function DeploymentManager({ projectId }: { projectId: number }) {
  const [deployments, setDeployments] = useState<Deployment[]>([]);
  const [isDeploying, setIsDeploying] = useState(false);
  const [deploymentConfig, setDeploymentConfig] = useState<DeploymentConfig>({
    environment: 'staging',
    envVars: {},
    scalingConfig: {
      minInstances: 1,
      maxInstances: 10,
      cpuTarget: 70
    }
  });
  const [deploymentProgress, setDeploymentProgress] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);
  const { toast } = useToast();

  const deploymentSteps = [
    'Building application',
    'Running tests',
    'Optimizing assets',
    'Configuring environment',
    'Deploying to cloud',
    'Health checks',
    'DNS configuration',
    'Ready!'
  ];

  const handleDeploy = async () => {
    setIsDeploying(true);
    setDeploymentProgress(0);
    setLogs([]);
    
    try {
      // Simulate deployment process
      for (let i = 0; i < deploymentSteps.length; i++) {
        const step = deploymentSteps[i];
        setLogs(prev => [...prev, `✓ ${step}`]);
        setDeploymentProgress(((i + 1) / deploymentSteps.length) * 100);
        
        // Simulate processing time
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        if (i === 4) {
          // Simulate actual deployment API call
          const response = await apiRequest('POST', '/api/deployments', {
            projectId,
            environment: deploymentConfig.environment,
            config: deploymentConfig
          });
          
          if (response.ok) {
            const deployment = await response.json();
            setDeployments(prev => [deployment, ...prev]);
          }
        }
      }
      
      toast({
        title: "Deployment Successful!",
        description: "Your application is now live and accessible.",
      });
      
      // Generate deployment URL
      const deployUrl = deploymentConfig.environment === 'production' 
        ? `https://${deploymentConfig.domain || 'app'}.codexel.ai`
        : `https://staging-${projectId}.codexel.ai`;
        
      setLogs(prev => [...prev, `🌐 Available at: ${deployUrl}`]);
      
    } catch (error) {
      toast({
        title: "Deployment Failed",
        description: "There was an error deploying your application.",
        variant: "destructive"
      });
      setLogs(prev => [...prev, `❌ Deployment failed: ${error}`]);
    } finally {
      setIsDeploying(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'deployed': return 'bg-green-500';
      case 'deploying': return 'bg-yellow-500';
      case 'failed': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'deployed': return <CheckCircle className="h-4 w-4" />;
      case 'deploying': return <Clock className="h-4 w-4" />;
      case 'failed': return <AlertCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-gray-900/50 border-gray-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Rocket className="h-5 w-5 text-blue-500" />
            Deployment Manager
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Deployment Configuration */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-white">Deployment Configuration</h4>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="environment" className="text-gray-400">Environment</Label>
                <Select 
                  value={deploymentConfig.environment}
                  onValueChange={(value: 'staging' | 'production') =>
                    setDeploymentConfig(prev => ({ ...prev, environment: value }))
                  }
                >
                  <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    <SelectItem value="staging">Staging</SelectItem>
                    <SelectItem value="production">Production</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {deploymentConfig.environment === 'production' && (
                <div className="space-y-2">
                  <Label htmlFor="domain" className="text-gray-400">Custom Domain</Label>
                  <Input
                    id="domain"
                    value={deploymentConfig.domain || ''}
                    onChange={(e) => setDeploymentConfig(prev => ({ ...prev, domain: e.target.value }))}
                    placeholder="app.yourdomain.com"
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                </div>
              )}
            </div>

            {/* Scaling Configuration */}
            <div className="space-y-3">
              <Label className="text-gray-400">Auto-scaling Configuration</Label>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label className="text-xs text-gray-500">Min Instances</Label>
                  <Input
                    type="number"
                    value={deploymentConfig.scalingConfig.minInstances}
                    onChange={(e) => setDeploymentConfig(prev => ({
                      ...prev,
                      scalingConfig: { ...prev.scalingConfig, minInstances: parseInt(e.target.value) }
                    }))}
                    className="bg-gray-800 border-gray-700 text-white text-sm"
                  />
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Max Instances</Label>
                  <Input
                    type="number"
                    value={deploymentConfig.scalingConfig.maxInstances}
                    onChange={(e) => setDeploymentConfig(prev => ({
                      ...prev,
                      scalingConfig: { ...prev.scalingConfig, maxInstances: parseInt(e.target.value) }
                    }))}
                    className="bg-gray-800 border-gray-700 text-white text-sm"
                  />
                </div>
                <div>
                  <Label className="text-xs text-gray-500">CPU Target %</Label>
                  <Input
                    type="number"
                    value={deploymentConfig.scalingConfig.cpuTarget}
                    onChange={(e) => setDeploymentConfig(prev => ({
                      ...prev,
                      scalingConfig: { ...prev.scalingConfig, cpuTarget: parseInt(e.target.value) }
                    }))}
                    className="bg-gray-800 border-gray-700 text-white text-sm"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Deployment Progress */}
          {isDeploying && (
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Deployment Progress</span>
                <span className="text-white">{deploymentProgress.toFixed(0)}%</span>
              </div>
              <Progress value={deploymentProgress} className="h-2" />
              
              <div className="bg-gray-800/50 rounded-lg p-3 max-h-32 overflow-y-auto">
                {logs.map((log, index) => (
                  <div key={index} className="text-xs text-gray-300 font-mono">
                    {log}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Deploy Button */}
          <Button 
            onClick={handleDeploy}
            disabled={isDeploying}
            className="w-full bg-blue-600 hover:bg-blue-700"
            size="lg"
          >
            {isDeploying ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Deploying...
              </>
            ) : (
              <>
                <Rocket className="h-4 w-4 mr-2" />
                Deploy to {deploymentConfig.environment}
              </>
            )}
          </Button>

          {/* Recent Deployments */}
          {deployments.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-white">Recent Deployments</h4>
              {deployments.slice(0, 3).map((deployment) => (
                <div key={deployment.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-800/50 border border-gray-700">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(deployment.status)}
                    <div>
                      <div className="text-sm font-medium text-white capitalize">
                        {deployment.environment}
                      </div>
                      <div className="text-xs text-gray-400">
                        {deployment.deployedAt ? new Date(deployment.deployedAt).toLocaleString() : 'In progress'}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Badge className={`text-white text-xs ${getStatusColor(deployment.status)}`}>
                      {deployment.status}
                    </Badge>
                    {deployment.url && (
                      <Button variant="ghost" size="sm" asChild>
                        <a href={deployment.url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Environment Status */}
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 rounded-lg bg-gray-800/50">
              <div className="text-sm font-medium text-white">Staging</div>
              <div className="text-xs text-gray-400">staging-{projectId}.codexel.ai</div>
              <Badge className="mt-1 bg-green-500 text-white text-xs">
                <CheckCircle className="h-3 w-3 mr-1" />
                Live
              </Badge>
            </div>
            <div className="text-center p-3 rounded-lg bg-gray-800/50">
              <div className="text-sm font-medium text-white">Production</div>
              <div className="text-xs text-gray-400">
                {deploymentConfig.domain || 'app'}.codexel.ai
              </div>
              <Badge className="mt-1 bg-gray-500 text-white text-xs">
                <Clock className="h-3 w-3 mr-1" />
                Ready
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}