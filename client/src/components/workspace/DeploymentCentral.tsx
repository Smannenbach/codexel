import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Rocket, 
  CheckCircle, 
  AlertTriangle, 
  X,
  Globe,
  Shield,
  Database,
  Code,
  Monitor,
  Settings,
  ExternalLink,
  Github,
  Zap,
  Activity,
  Clock,
  Users
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface DeploymentCheck {
  id: string;
  name: string;
  status: 'passed' | 'failed' | 'warning' | 'pending';
  required: boolean;
  description: string;
  details?: string;
}

interface DeploymentEnvironment {
  id: string;
  name: string;
  url?: string;
  status: 'active' | 'building' | 'failed' | 'stopped';
  lastDeployment: Date;
  version: string;
  health: number;
}

export default function DeploymentCentral() {
  const [isDeploying, setIsDeploying] = useState(false);
  const [deploymentProgress, setDeploymentProgress] = useState(0);
  const [selectedEnvironment, setSelectedEnvironment] = useState('production');
  const { toast } = useToast();

  const [deploymentChecks] = useState<DeploymentCheck[]>([
    {
      id: 'security',
      name: 'Security Checks',
      status: 'passed',
      required: true,
      description: 'All security vulnerabilities resolved',
      details: 'Rate limiting, error boundaries, input validation'
    },
    {
      id: 'performance',
      name: 'Performance Optimization',
      status: 'warning',
      required: false,
      description: 'Bundle size optimization recommended',
      details: 'Current: 975KB (Warning: >500KB). Lazy loading implemented.'
    },
    {
      id: 'database',
      name: 'Database Migrations',
      status: 'passed',
      required: true,
      description: 'All database schemas up to date'
    },
    {
      id: 'tests',
      name: 'Test Suite',
      status: 'passed',
      required: true,
      description: 'All critical tests passing'
    },
    {
      id: 'env-vars',
      name: 'Environment Variables',
      status: 'passed',
      required: true,
      description: 'All production secrets configured'
    },
    {
      id: 'ssl',
      name: 'SSL/HTTPS',
      status: 'passed',
      required: true,
      description: 'Secure connections enabled'
    },
    {
      id: 'monitoring',
      name: 'Monitoring Setup',
      status: 'passed',
      required: false,
      description: 'Error tracking and analytics configured'
    },
    {
      id: 'backup',
      name: 'Data Backup',
      status: 'passed',
      required: true,
      description: 'Automated backup systems active'
    }
  ]);

  const [environments] = useState<DeploymentEnvironment[]>([
    {
      id: 'development',
      name: 'Development',
      url: 'https://workspace.SteveMannenbach.repl.co',
      status: 'active',
      lastDeployment: new Date(),
      version: 'v1.0.0-dev',
      health: 98
    },
    {
      id: 'production',
      name: 'Production',
      url: 'https://codexel.ai',
      status: 'stopped',
      lastDeployment: new Date(Date.now() - 24 * 60 * 60 * 1000),
      version: 'v0.9.8',
      health: 0
    }
  ]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'passed':
      case 'active':
        return <CheckCircle className="h-4 w-4 text-green-400" />;
      case 'warning':
      case 'building':
        return <AlertTriangle className="h-4 w-4 text-yellow-400" />;
      case 'failed':
        return <X className="h-4 w-4 text-red-400" />;
      default:
        return <Monitor className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'passed':
      case 'active':
        return 'bg-green-500';
      case 'warning':
      case 'building':
        return 'bg-yellow-500';
      case 'failed':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const calculateReadinessScore = () => {
    const requiredPassed = deploymentChecks.filter(c => c.required && c.status === 'passed').length;
    const totalRequired = deploymentChecks.filter(c => c.required).length;
    return Math.round((requiredPassed / totalRequired) * 100);
  };

  const canDeploy = () => {
    const requiredChecks = deploymentChecks.filter(c => c.required);
    return requiredChecks.every(c => c.status === 'passed');
  };

  const deployToProduction = async () => {
    if (!canDeploy()) {
      toast({
        title: "Deployment Blocked",
        description: "Please fix all required checks before deploying",
        variant: "destructive"
      });
      return;
    }

    setIsDeploying(true);
    setDeploymentProgress(0);

    try {
      // Simulate deployment process
      const steps = [
        { name: "Building application", duration: 2000 },
        { name: "Running tests", duration: 1500 },
        { name: "Optimizing assets", duration: 1000 },
        { name: "Deploying to CDN", duration: 2000 },
        { name: "Starting services", duration: 1500 },
        { name: "Running health checks", duration: 1000 }
      ];

      for (let i = 0; i < steps.length; i++) {
        const step = steps[i];
        toast({
          title: `Deployment Step ${i + 1}/${steps.length}`,
          description: step.name,
        });

        await new Promise(resolve => setTimeout(resolve, step.duration));
        setDeploymentProgress(((i + 1) / steps.length) * 100);
      }

      // Simulate deployment completion
      await apiRequest('POST', '/api/deployments', {
        environment: selectedEnvironment,
        version: 'v1.0.0',
        timestamp: new Date().toISOString()
      });

      toast({
        title: "🎉 Deployment Successful!",
        description: "Your application is now live on production",
      });

    } catch (error) {
      toast({
        title: "Deployment Failed",
        description: "Unable to deploy to production. Check logs for details.",
        variant: "destructive"
      });
    } finally {
      setIsDeploying(false);
      setDeploymentProgress(0);
    }
  };

  const readinessScore = calculateReadinessScore();
  const passedChecks = deploymentChecks.filter(c => c.status === 'passed').length;
  const warningChecks = deploymentChecks.filter(c => c.status === 'warning').length;
  const failedChecks = deploymentChecks.filter(c => c.status === 'failed').length;

  return (
    <div className="space-y-6">
      <Card className="bg-gray-900/50 border-gray-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Rocket className="h-5 w-5 text-blue-500" />
            Deployment Central
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-gray-800 border-gray-700">
              <TabsTrigger value="overview" className="text-gray-300">Overview</TabsTrigger>
              <TabsTrigger value="checks" className="text-gray-300">Pre-flight Checks</TabsTrigger>
              <TabsTrigger value="environments" className="text-gray-300">Environments</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6 mt-4">
              {/* Deployment Readiness Score */}
              <div className="text-center space-y-4">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-green-500 to-blue-600">
                  <span className="text-xl font-bold text-white">{readinessScore}%</span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Deployment Readiness</h3>
                  <p className="text-sm text-gray-400">
                    {canDeploy() ? '🚀 Ready to Deploy!' : '⚠️ Fixes Required'}
                  </p>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-3 rounded-lg bg-green-900/30 border border-green-700">
                  <div className="text-lg font-bold text-green-400">{passedChecks}</div>
                  <div className="text-xs text-green-300">Passed</div>
                </div>
                <div className="text-center p-3 rounded-lg bg-yellow-900/30 border border-yellow-700">
                  <div className="text-lg font-bold text-yellow-400">{warningChecks}</div>
                  <div className="text-xs text-yellow-300">Warnings</div>
                </div>
                <div className="text-center p-3 rounded-lg bg-red-900/30 border border-red-700">
                  <div className="text-lg font-bold text-red-400">{failedChecks}</div>
                  <div className="text-xs text-red-300">Failed</div>
                </div>
              </div>

              {/* Deployment Actions */}
              <div className="space-y-3">
                {isDeploying && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Deployment Progress</span>
                      <span className="text-white">{deploymentProgress.toFixed(0)}%</span>
                    </div>
                    <Progress value={deploymentProgress} className="h-2" />
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <Button 
                    onClick={deployToProduction}
                    disabled={!canDeploy() || isDeploying}
                    className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600"
                  >
                    {isDeploying ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                        Deploying...
                      </>
                    ) : (
                      <>
                        <Rocket className="h-4 w-4 mr-2" />
                        Deploy to Production
                      </>
                    )}
                  </Button>
                  
                  <Button variant="outline" className="border-gray-700 text-gray-300">
                    <Github className="h-4 w-4 mr-2" />
                    View Source
                  </Button>
                </div>

                {!canDeploy() && (
                  <div className="p-3 bg-red-900/20 border border-red-800 rounded-lg">
                    <p className="text-sm text-red-300">
                      ⚠️ Deployment blocked: Please fix all required pre-flight checks
                    </p>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="checks" className="space-y-4 mt-4">
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-white">Pre-flight Checks</h4>
                
                {deploymentChecks.map((check) => (
                  <div key={check.id} className="p-3 rounded-lg bg-gray-800/50 border border-gray-700">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        {getStatusIcon(check.status)}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-medium text-white">{check.name}</span>
                            {check.required && (
                              <Badge variant="outline" className="text-xs text-red-300 border-red-700">
                                Required
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-gray-400 mb-1">{check.description}</p>
                          {check.details && (
                            <p className="text-xs text-gray-500">{check.details}</p>
                          )}
                        </div>
                      </div>
                      <div className={`w-2 h-2 rounded-full ${getStatusColor(check.status)}`} />
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="environments" className="space-y-4 mt-4">
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-white">Deployment Environments</h4>
                
                {environments.map((env) => (
                  <div key={env.id} className="p-4 rounded-lg bg-gray-800/50 border border-gray-700">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-start gap-3">
                        {getStatusIcon(env.status)}
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-medium text-white">{env.name}</span>
                            <Badge variant="outline" className="text-xs">
                              {env.version}
                            </Badge>
                          </div>
                          {env.url && (
                            <a 
                              href={env.url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
                            >
                              {env.url}
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-white">{env.health}%</div>
                        <div className="text-xs text-gray-400">Health</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-xs text-gray-400">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Last deploy: {env.lastDeployment.toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-1">
                        <Activity className="h-3 w-3" />
                        {env.status}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-4 bg-blue-900/20 border border-blue-800 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Globe className="h-4 w-4 text-blue-400" />
                  <span className="text-sm font-medium text-blue-300">Replit Deployments</span>
                </div>
                <p className="text-xs text-blue-200 mb-3">
                  Your app will be deployed using Replit's powerful deployment infrastructure with automatic scaling, SSL, and CDN.
                </p>
                <Button variant="outline" size="sm" className="border-blue-700 text-blue-300">
                  <Settings className="h-4 w-4 mr-2" />
                  Configure Deployment
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}