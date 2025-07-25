// Phase 11: Advanced Integration & Ecosystem Panel
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Github, 
  Zap, 
  BarChart3, 
  Settings, 
  ExternalLink, 
  GitBranch, 
  GitCommit, 
  Users,
  CheckCircle,
  AlertCircle,
  Clock,
  TrendingUp,
  Database,
  Cpu,
  MemoryStick,
  Network,
  Shield,
  Palette,
  Package
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  description: string;
  private: boolean;
  url: string;
  default_branch: string;
  updated_at: string;
}

interface PerformanceMetrics {
  responseTime: number;
  memoryUsage: number;
  cpuUsage: number;
  activeConnections: number;
  cacheHitRatio: number;
  timestamp: number;
}

interface Integration {
  id: string;
  name: string;
  description: string;
  category: string;
  status: 'available' | 'installed' | 'coming-soon';
  documentation: string;
}

export function Phase11Panel() {
  const [activeTab, setActiveTab] = useState('github');
  const [repos, setRepos] = useState<GitHubRepo[]>([]);
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [githubConnected, setGithubConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    await Promise.all([
      checkGitHubConnection(),
      loadPerformanceMetrics(),
      loadIntegrations()
    ]);
  };

  const checkGitHubConnection = async () => {
    try {
      const response = await apiRequest('GET', '/api/github/validate');
      setGithubConnected(response.valid);
      if (response.valid) {
        loadRepositories();
      }
    } catch (error) {
      console.error('GitHub connection check failed:', error);
    }
  };

  const loadRepositories = async () => {
    try {
      const repos = await apiRequest('GET', '/api/github/repos');
      setRepos(repos);
    } catch (error) {
      console.error('Failed to load repositories:', error);
    }
  };

  const loadPerformanceMetrics = async () => {
    try {
      const data = await apiRequest('GET', '/api/performance/metrics');
      setMetrics(data.current);
    } catch (error) {
      console.error('Failed to load performance metrics:', error);
    }
  };

  const loadIntegrations = async () => {
    try {
      const integrations = await apiRequest('GET', '/api/marketplace/integrations');
      setIntegrations(integrations);
    } catch (error) {
      console.error('Failed to load integrations:', error);
    }
  };

  const createRepository = async (name: string, description: string, isPrivate: boolean) => {
    setLoading(true);
    try {
      const repo = await apiRequest('POST', '/api/github/repos', {
        name,
        description,
        isPrivate
      });
      
      setRepos(prev => [repo, ...prev]);
      toast({
        title: "Repository Created",
        description: `Repository '${name}' created successfully`,
      });
    } catch (error) {
      toast({
        title: "Creation Failed",
        description: "Failed to create repository",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const optimizePerformance = async (ruleId?: string) => {
    setLoading(true);
    try {
      await apiRequest('POST', '/api/performance/optimize', { ruleId });
      await loadPerformanceMetrics();
      
      toast({
        title: "Optimization Complete",
        description: ruleId ? `Rule '${ruleId}' executed` : "All optimizations applied",
      });
    } catch (error) {
      toast({
        title: "Optimization Failed",
        description: "Failed to execute performance optimization",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const installIntegration = async (integrationId: string) => {
    setLoading(true);
    try {
      await apiRequest('POST', `/api/marketplace/integrations/${integrationId}/install`, {
        config: {}
      });
      
      setIntegrations(prev => 
        prev.map(int => 
          int.id === integrationId 
            ? { ...int, status: 'installed' } 
            : int
        )
      );
      
      toast({
        title: "Integration Installed",
        description: `${integrationId} integration installed successfully`,
      });
    } catch (error) {
      toast({
        title: "Installation Failed",
        description: "Failed to install integration",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full bg-gray-900 text-white">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-purple-500/20 rounded-lg">
            <Settings className="w-6 h-6 text-purple-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Phase 11: Advanced Integration & Ecosystem</h1>
            <p className="text-gray-400">GitHub integration, performance optimization, and API marketplace</p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-gray-800">
            <TabsTrigger value="github" className="data-[state=active]:bg-purple-600">
              <Github className="w-4 h-4 mr-2" />
              GitHub
            </TabsTrigger>
            <TabsTrigger value="performance" className="data-[state=active]:bg-purple-600">
              <Zap className="w-4 h-4 mr-2" />
              Performance
            </TabsTrigger>
            <TabsTrigger value="marketplace" className="data-[state=active]:bg-purple-600">
              <Package className="w-4 h-4 mr-2" />
              Marketplace
            </TabsTrigger>
            <TabsTrigger value="white-label" className="data-[state=active]:bg-purple-600">
              <Palette className="w-4 h-4 mr-2" />
              White-label
            </TabsTrigger>
          </TabsList>

          <TabsContent value="github" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* GitHub Connection Status */}
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Github className="w-5 h-5" />
                    GitHub Connection
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {githubConnected ? (
                        <>
                          <CheckCircle className="w-4 h-4 text-green-400" />
                          <span className="text-green-400">Connected</span>
                        </>
                      ) : (
                        <>
                          <AlertCircle className="w-4 h-4 text-red-400" />
                          <span className="text-red-400">Not Connected</span>
                        </>
                      )}
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={checkGitHubConnection}
                    >
                      Check Status
                    </Button>
                  </div>
                  
                  {!githubConnected && (
                    <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                      <p className="text-sm text-yellow-400">
                        To enable GitHub integration, set your GITHUB_TOKEN environment variable.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Repository Creation */}
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle>Create Repository</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="repo-name">Repository Name</Label>
                    <Input
                      id="repo-name"
                      placeholder="my-awesome-project"
                      className="bg-gray-700 border-gray-600"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="repo-desc">Description</Label>
                    <Input
                      id="repo-desc"
                      placeholder="A brief description of your project"
                      className="bg-gray-700 border-gray-600"
                    />
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch id="private-repo" />
                    <Label htmlFor="private-repo">Private Repository</Label>
                  </div>
                  
                  <Button 
                    className="w-full" 
                    disabled={!githubConnected || loading}
                    onClick={() => {
                      const nameInput = document.getElementById('repo-name') as HTMLInputElement;
                      const descInput = document.getElementById('repo-desc') as HTMLInputElement;
                      const privateSwitch = document.getElementById('private-repo') as HTMLInputElement;
                      
                      if (nameInput.value) {
                        createRepository(nameInput.value, descInput.value, privateSwitch.checked);
                      }
                    }}
                  >
                    Create Repository
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Repositories List */}
            {githubConnected && (
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    Your Repositories
                    <Badge variant="secondary">{repos.length} repos</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-64">
                    <div className="space-y-2">
                      {repos.map((repo) => (
                        <div
                          key={repo.id}
                          className="flex items-center justify-between p-3 bg-gray-700 rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <GitBranch className="w-4 h-4 text-gray-400" />
                            <div>
                              <h4 className="font-medium">{repo.name}</h4>
                              <p className="text-sm text-gray-400">{repo.description || 'No description'}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            {repo.private && (
                              <Badge variant="outline" className="text-xs">Private</Badge>
                            )}
                            <Button variant="ghost" size="sm" asChild>
                              <a href={repo.url} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="w-4 h-4" />
                              </a>
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="performance" className="space-y-6">
            {/* Performance Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="bg-gray-800 border-gray-700">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-blue-400" />
                    <span className="text-sm text-gray-400">Response Time</span>
                  </div>
                  <div className="mt-2">
                    <span className="text-2xl font-bold">
                      {metrics ? `${metrics.responseTime.toFixed(0)}ms` : '---'}
                    </span>
                    {metrics && metrics.responseTime > 1000 && (
                      <Badge variant="destructive" className="ml-2 text-xs">Slow</Badge>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-800 border-gray-700">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <MemoryStick className="w-4 h-4 text-green-400" />
                    <span className="text-sm text-gray-400">Memory Usage</span>
                  </div>
                  <div className="mt-2">
                    <span className="text-2xl font-bold">
                      {metrics ? `${metrics.memoryUsage.toFixed(1)}%` : '---'}
                    </span>
                    {metrics && (
                      <Progress 
                        value={metrics.memoryUsage} 
                        className="mt-2 h-2"
                      />
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-800 border-gray-700">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-purple-400" />
                    <span className="text-sm text-gray-400">CPU Usage</span>
                  </div>
                  <div className="mt-2">
                    <span className="text-2xl font-bold">
                      {metrics ? `${metrics.cpuUsage.toFixed(1)}%` : '---'}
                    </span>
                    {metrics && (
                      <Progress 
                        value={metrics.cpuUsage} 
                        className="mt-2 h-2"
                      />
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-800 border-gray-700">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Network className="w-4 h-4 text-orange-400" />
                    <span className="text-sm text-gray-400">Cache Hit Ratio</span>
                  </div>
                  <div className="mt-2">
                    <span className="text-2xl font-bold">
                      {metrics ? `${(metrics.cacheHitRatio * 100).toFixed(1)}%` : '---'}
                    </span>
                    {metrics && metrics.cacheHitRatio < 0.7 && (
                      <Badge variant="outline" className="ml-2 text-xs">Low</Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Optimization Controls */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle>Performance Optimization</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button
                    variant="outline"
                    onClick={() => optimizePerformance('memory-cleanup')}
                    disabled={loading}
                    className="flex items-center gap-2"
                  >
                    <MemoryStick className="w-4 h-4" />
                    Memory Cleanup
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={() => optimizePerformance('cache-optimization')}
                    disabled={loading}
                    className="flex items-center gap-2"
                  >
                    <Database className="w-4 h-4" />
                    Cache Optimization
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={() => optimizePerformance('connection-pooling')}
                    disabled={loading}
                    className="flex items-center gap-2"
                  >
                    <Network className="w-4 h-4" />
                    Connection Pooling
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={() => optimizePerformance('response-time-optimization')}
                    disabled={loading}
                    className="flex items-center gap-2"
                  >
                    <Zap className="w-4 h-4" />
                    Response Time
                  </Button>
                </div>
                
                <Button
                  onClick={() => optimizePerformance()}
                  disabled={loading}
                  className="w-full"
                >
                  Run All Optimizations
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="marketplace" className="space-y-6">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle>Available Integrations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {integrations.map((integration) => (
                    <Card key={integration.id} className="bg-gray-700 border-gray-600">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium">{integration.name}</h4>
                          <Badge 
                            variant={integration.status === 'installed' ? 'default' : 'secondary'}
                            className="text-xs"
                          >
                            {integration.status}
                          </Badge>
                        </div>
                        
                        <p className="text-sm text-gray-400 mb-3">{integration.description}</p>
                        
                        <div className="flex items-center justify-between">
                          <Badge variant="outline" className="text-xs">
                            {integration.category}
                          </Badge>
                          
                          <div className="flex gap-2">
                            <Button variant="ghost" size="sm" asChild>
                              <a href={integration.documentation} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            </Button>
                            
                            {integration.status === 'available' && (
                              <Button
                                size="sm"
                                onClick={() => installIntegration(integration.id)}
                                disabled={loading}
                              >
                                Install
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="white-label" className="space-y-6">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle>White-label Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Branding</h3>
                    
                    <div className="space-y-2">
                      <Label>Company Name</Label>
                      <Input 
                        defaultValue="Codexel.ai"
                        className="bg-gray-700 border-gray-600"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Primary Color</Label>
                      <Input 
                        type="color"
                        defaultValue="#6366f1"
                        className="bg-gray-700 border-gray-600 h-12"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Custom Domain</Label>
                      <Input 
                        placeholder="your-domain.com"
                        className="bg-gray-700 border-gray-600"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Features</h3>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span>AI Models</span>
                        <Switch defaultChecked />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span>Templates</span>
                        <Switch defaultChecked />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span>Mobile Generation</span>
                        <Switch defaultChecked />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span>GitHub Integration</span>
                        <Switch defaultChecked />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span>Analytics</span>
                        <Switch defaultChecked />
                      </div>
                    </div>
                  </div>
                </div>
                
                <Button className="w-full">
                  Save Configuration
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}