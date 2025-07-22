import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Bot, 
  Brain, 
  Shield, 
  Zap, 
  Globe, 
  Code, 
  Eye,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Settings,
  Play,
  Pause,
  StopCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface AutonomousPanelProps {
  onStartAutonomousTask: (taskType: string, params: any) => void;
}

export function AutonomousPanel({ onStartAutonomousTask }: AutonomousPanelProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [isAutonomousMode, setIsAutonomousMode] = useState(false);

  // Mock data - would come from real services
  const autonomousCapabilities = {
    linkedin: { enabled: true, status: 'ready' },
    appBuilding: { enabled: true, status: 'active' },
    memorySystem: { enabled: true, status: 'learning' },
    security: { enabled: true, status: 'monitoring' }
  };

  const activeWorkflows = [
    {
      id: 'wf-1',
      type: 'LinkedIn Automation',
      progress: 75,
      status: 'running',
      apps: ['LinkedIn', 'Email', 'CRM'],
      eta: '15 min'
    },
    {
      id: 'wf-2',
      type: 'App Development',
      progress: 45,
      status: 'coding',
      apps: ['VS Code', 'GitHub', 'Vercel'],
      eta: '2 hours'
    }
  ];

  const memoryStats = {
    totalMemories: 15420,
    hiveMindSize: '2.3TB',
    relevanceScore: 0.94,
    freshMemories: 1250
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Autonomous Mode</h2>
          <p className="text-muted-foreground">AI-driven task automation with perfect memory</p>
        </div>
        <Button
          variant={isAutonomousMode ? "destructive" : "default"}
          onClick={() => setIsAutonomousMode(!isAutonomousMode)}
          className="min-w-[120px]"
        >
          {isAutonomousMode ? (
            <>
              <StopCircle className="w-4 h-4 mr-2" />
              Stop
            </>
          ) : (
            <>
              <Play className="w-4 h-4 mr-2" />
              Start
            </>
          )}
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="workflows">Workflows</TabsTrigger>
          <TabsTrigger value="memory">Memory</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-full">
                  <Globe className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium">Platform Integrations</p>
                  <p className="text-sm text-muted-foreground">17+ apps connected</p>
                </div>
                <Badge variant="default" className="ml-auto">Active</Badge>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 dark:bg-green-900 rounded-full">
                  <Code className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="font-medium">App Building</p>
                  <p className="text-sm text-muted-foreground">Autonomous development</p>
                </div>
                <Badge variant="default" className="ml-auto">Ready</Badge>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-full">
                  <Brain className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="font-medium">Hive Mind</p>
                  <p className="text-sm text-muted-foreground">Perfect memory system</p>
                </div>
                <Badge variant="default" className="ml-auto">Learning</Badge>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 dark:bg-red-900 rounded-full">
                  <Shield className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <p className="font-medium">Security</p>
                  <p className="text-sm text-muted-foreground">Rogue AI protection</p>
                </div>
                <Badge variant="default" className="ml-auto">Monitoring</Badge>
              </div>
            </Card>
          </div>

          <Card className="p-6">
            <h3 className="font-semibold mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-3">
              <Button 
                variant="outline" 
                className="justify-start h-auto p-4"
                onClick={() => onStartAutonomousTask('linkedin', { type: 'outreach' })}
              >
                <div className="text-left">
                  <p className="font-medium">LinkedIn Automation</p>
                  <p className="text-sm text-muted-foreground">Connect, follow, message</p>
                </div>
              </Button>
              
              <Button 
                variant="outline" 
                className="justify-start h-auto p-4"
                onClick={() => onStartAutonomousTask('app-building', { type: 'full-stack' })}
              >
                <div className="text-left">
                  <p className="font-medium">Build App</p>
                  <p className="text-sm text-muted-foreground">Complete autonomous development</p>
                </div>
              </Button>

              <Button 
                variant="outline" 
                className="justify-start h-auto p-4"
                onClick={() => onStartAutonomousTask('integration', { apps: ['slack', 'github'] })}
              >
                <div className="text-left">
                  <p className="font-medium">Connect Apps</p>
                  <p className="text-sm text-muted-foreground">Multi-platform integration</p>
                </div>
              </Button>

              <Button 
                variant="outline" 
                className="justify-start h-auto p-4"
                onClick={() => onStartAutonomousTask('design', { type: 'complete' })}
              >
                <div className="text-left">
                  <p className="font-medium">Create Designs</p>
                  <p className="text-sm text-muted-foreground">Images, logos, videos</p>
                </div>
              </Button>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="workflows" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Active Workflows</h3>
            <Badge variant="secondary">{activeWorkflows.length} Running</Badge>
          </div>

          {activeWorkflows.map((workflow) => (
            <Card key={workflow.id} className="p-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Bot className="w-5 h-5 text-primary" />
                    <div>
                      <p className="font-medium">{workflow.type}</p>
                      <p className="text-sm text-muted-foreground">
                        Using: {workflow.apps.join(', ')}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant="default">{workflow.status}</Badge>
                    <p className="text-sm text-muted-foreground mt-1">ETA: {workflow.eta}</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress</span>
                    <span>{workflow.progress}%</span>
                  </div>
                  <Progress value={workflow.progress} className="h-2" />
                </div>
              </div>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="memory" className="space-y-4">
          <Card className="p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Brain className="w-5 h-5" />
              Perfect Memory System
            </h3>
            
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Total Memories</p>
                  <p className="text-2xl font-bold">{memoryStats.totalMemories.toLocaleString()}</p>
                </div>
                
                <div>
                  <p className="text-sm text-muted-foreground">Hive Mind Size</p>
                  <p className="text-2xl font-bold">{memoryStats.hiveMindSize}</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Relevance Score</p>
                  <p className="text-2xl font-bold">{memoryStats.relevanceScore}</p>
                </div>
                
                <div>
                  <p className="text-sm text-muted-foreground">Fresh Memories (24h)</p>
                  <p className="text-2xl font-bold">{memoryStats.freshMemories}</p>
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-primary/5 border border-primary/20 rounded-lg">
              <div className="flex items-center gap-3">
                <Zap className="w-5 h-5 text-primary" />
                <div>
                  <p className="font-medium">Memory Status</p>
                  <p className="text-sm text-muted-foreground">
                    System learning continuously. Conflict resolution active. Duplicates merged automatically.
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card className="p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Security Monitor
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="font-medium">Threat Detection</p>
                    <p className="text-sm text-muted-foreground">No threats detected</p>
                  </div>
                </div>
                <Badge variant="secondary">Active</Badge>
              </div>

              <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                <div className="flex items-center gap-3">
                  <Eye className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="font-medium">Activity Monitoring</p>
                    <p className="text-sm text-muted-foreground">All agents supervised</p>
                  </div>
                </div>
                <Badge variant="secondary">Monitoring</Badge>
              </div>

              <div className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-950 rounded-lg">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-5 h-5 text-orange-600" />
                  <div>
                    <p className="font-medium">Permission Checks</p>
                    <p className="text-sm text-muted-foreground">3 elevated requests today</p>
                  </div>
                </div>
                <Badge variant="secondary">Reviewing</Badge>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}