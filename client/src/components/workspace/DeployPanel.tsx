import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { 
  Rocket, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Globe,
  Server,
  Shield,
  Activity,
  ExternalLink,
  Loader2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface DeployPanelProps {
  projectId: number;
  projectName: string;
  isReady?: boolean;
}

interface DeploymentStep {
  id: string;
  title: string;
  status: 'pending' | 'in-progress' | 'completed' | 'error';
  message?: string;
}

export function DeployPanel({ projectId, projectName, isReady = false }: DeployPanelProps) {
  const { toast } = useToast();
  const [isDeploying, setIsDeploying] = useState(false);
  const [deploymentUrl, setDeploymentUrl] = useState('');
  const [deploymentSteps, setDeploymentSteps] = useState<DeploymentStep[]>([
    { id: 'validate', title: 'Validate Application', status: 'pending' },
    { id: 'build', title: 'Build Application', status: 'pending' },
    { id: 'deploy', title: 'Deploy to Cloud', status: 'pending' },
    { id: 'configure', title: 'Configure Domain', status: 'pending' },
    { id: 'finalize', title: 'Finalize Deployment', status: 'pending' }
  ]);

  const handleDeploy = async () => {
    if (!isReady) {
      toast({
        title: "Not Ready to Deploy",
        description: "Please complete at least 80% of your project before deploying.",
        variant: "destructive"
      });
      return;
    }

    setIsDeploying(true);
    setDeploymentSteps(steps => steps.map(s => ({ ...s, status: 'pending' })));

    try {
      // Simulate deployment process
      for (let i = 0; i < deploymentSteps.length; i++) {
        setDeploymentSteps(steps => 
          steps.map((step, index) => ({
            ...step,
            status: index === i ? 'in-progress' : index < i ? 'completed' : 'pending'
          }))
        );
        
        // Simulate step execution
        await new Promise(resolve => setTimeout(resolve, 2000));
      }

      // Mark all as completed
      setDeploymentSteps(steps => 
        steps.map(step => ({ ...step, status: 'completed' }))
      );

      const url = `https://${projectName.toLowerCase().replace(/\s+/g, '-')}.codexel.app`;
      setDeploymentUrl(url);

      toast({
        title: "Deployment Successful!",
        description: "Your application is now live and accessible.",
      });
    } catch (error) {
      setDeploymentSteps(steps => 
        steps.map((step, index) => ({
          ...step,
          status: step.status === 'in-progress' ? 'error' : step.status
        }))
      );
      
      toast({
        title: "Deployment Failed",
        description: "An error occurred during deployment. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsDeploying(false);
    }
  };

  const getStepIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case 'in-progress':
        return <Loader2 className="w-5 h-5 text-primary animate-spin" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-destructive" />;
      default:
        return <Clock className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const deploymentProgress = 
    (deploymentSteps.filter(s => s.status === 'completed').length / deploymentSteps.length) * 100;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Rocket className="w-5 h-5" />
          <h2 className="text-xl font-semibold">Deploy Project</h2>
        </div>
        <Badge variant={isReady ? "default" : "secondary"}>
          {isReady ? "Ready to Deploy" : "Not Ready"}
        </Badge>
      </div>

      {!isReady && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Project Not Ready</AlertTitle>
          <AlertDescription>
            Your project needs to be at least 80% complete before deployment. 
            Continue developing and testing your application.
          </AlertDescription>
        </Alert>
      )}

      <Card className="p-6">
        <h3 className="font-semibold mb-4">Deployment Information</h3>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <Globe className="w-4 h-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Domain</p>
              <p className="text-sm text-muted-foreground">
                {projectName.toLowerCase().replace(/\s+/g, '-')}.codexel.app
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Server className="w-4 h-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Infrastructure</p>
              <p className="text-sm text-muted-foreground">Auto-scaling cloud servers</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Shield className="w-4 h-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Security</p>
              <p className="text-sm text-muted-foreground">SSL/TLS encryption enabled</p>
            </div>
          </div>
        </div>
      </Card>

      {(isDeploying || deploymentUrl) && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Deployment Progress</h3>
            <span className="text-sm text-muted-foreground">
              {Math.round(deploymentProgress)}%
            </span>
          </div>
          <Progress value={deploymentProgress} className="mb-4" />
          
          <div className="space-y-3">
            {deploymentSteps.map((step) => (
              <div 
                key={step.id}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-lg",
                  step.status === 'in-progress' && "bg-primary/5",
                  step.status === 'completed' && "bg-green-500/5",
                  step.status === 'error' && "bg-destructive/5"
                )}
              >
                {getStepIcon(step.status)}
                <div className="flex-1">
                  <p className="text-sm font-medium">{step.title}</p>
                  {step.message && (
                    <p className="text-xs text-muted-foreground">{step.message}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {deploymentUrl && (
        <Alert className="border-green-500 bg-green-500/5">
          <CheckCircle2 className="h-4 w-4 text-green-500" />
          <AlertTitle>Deployment Successful!</AlertTitle>
          <AlertDescription>
            Your application is now live at{' '}
            <a 
              href={deploymentUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="font-medium underline inline-flex items-center gap-1"
            >
              {deploymentUrl}
              <ExternalLink className="w-3 h-3" />
            </a>
          </AlertDescription>
        </Alert>
      )}

      <div className="flex gap-3">
        <Button 
          onClick={handleDeploy} 
          disabled={!isReady || isDeploying}
          className="flex-1"
        >
          {isDeploying ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Deploying...
            </>
          ) : (
            <>
              <Rocket className="mr-2 h-4 w-4" />
              Deploy to Production
            </>
          )}
        </Button>
        
        {deploymentUrl && (
          <Button 
            variant="outline"
            onClick={() => window.open(deploymentUrl, '_blank')}
          >
            <Activity className="mr-2 h-4 w-4" />
            View Live Site
          </Button>
        )}
      </div>
    </div>
  );
}