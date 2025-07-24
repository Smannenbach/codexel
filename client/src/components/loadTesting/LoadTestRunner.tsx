import { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Play, 
  Square, 
  Activity, 
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  Users,
  Zap,
  Target,
  BarChart3,
  Loader2
} from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface LoadTestConfig {
  targetUrl: string;
  concurrentUsers: number;
  duration: number;
  rampUpTime: number;
  endpoints: string[];
}

interface LoadTestResult {
  id: string;
  config: LoadTestConfig;
  status: 'running' | 'completed' | 'failed';
  startTime: string;
  endTime?: string;
  metrics: {
    totalRequests: number;
    successfulRequests: number;
    failedRequests: number;
    averageResponseTime: number;
    minResponseTime: number;
    maxResponseTime: number;
    requestsPerSecond: number;
    errorRate: number;
  };
  errors: Array<{
    timestamp: string;
    endpoint: string;
    error: string;
    responseTime: number;
  }>;
  timeline: Array<{
    timestamp: string;
    activeUsers: number;
    responseTime: number;
    requestsPerSecond: number;
  }>;
}

interface TestScenario {
  name: string;
  description: string;
  config: Omit<LoadTestConfig, 'targetUrl'>;
}

export default function LoadTestRunner() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [selectedScenario, setSelectedScenario] = useState<string>('');
  const [customConfig, setCustomConfig] = useState<LoadTestConfig>({
    targetUrl: 'http://localhost:5000',
    concurrentUsers: 10,
    duration: 60,
    rampUpTime: 10,
    endpoints: ['/api/monitoring/health', '/api/projects']
  });
  
  const [activeTestId, setActiveTestId] = useState<string | null>(null);

  // Get test scenarios
  const { data: scenariosData } = useQuery<{ scenarios: TestScenario[] }>({
    queryKey: ['/api/load-testing/scenarios']
  });

  // Get all tests
  const { data: testsData } = useQuery<{ tests: LoadTestResult[] }>({
    queryKey: ['/api/load-testing/tests'],
    refetchInterval: 5000
  });

  // Get active test stats
  const { data: activeTestStats } = useQuery<{
    id: string;
    status: string;
    metrics: {
      totalRequests: number;
      requestsPerSecond: number;
      averageResponseTime: number;
      errorRate: number;
    };
    duration: number;
  }>({
    queryKey: [`/api/load-testing/stats/${activeTestId}`],
    enabled: !!activeTestId,
    refetchInterval: 2000
  });

  const scenarios = scenariosData?.scenarios || [];
  const tests = testsData?.tests || [];
  const runningTest = tests.find(t => t.status === 'running');

  // Update active test ID when a test is running
  useEffect(() => {
    if (runningTest && !activeTestId) {
      setActiveTestId(runningTest.id);
    } else if (!runningTest && activeTestId) {
      setActiveTestId(null);
    }
  }, [runningTest, activeTestId]);

  // Start test mutation
  const startTestMutation = useMutation({
    mutationFn: async (config: LoadTestConfig) => {
      return apiRequest('POST', '/api/load-testing/start', config);
    },
    onSuccess: (data: any) => {
      setActiveTestId(data.testId);
      queryClient.invalidateQueries({ queryKey: ['/api/load-testing/tests'] });
      toast({
        title: "Load Test Started",
        description: "Your load test is now running.",
      });
    },
    onError: () => {
      toast({
        title: "Failed to Start Test",
        description: "Please check your configuration and try again.",
        variant: "destructive",
      });
    }
  });

  // Stop test mutation
  const stopTestMutation = useMutation({
    mutationFn: async (testId: string) => {
      return apiRequest('POST', `/api/load-testing/stop/${testId}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/load-testing/tests'] });
      toast({
        title: "Test Stopped",
        description: "Load test has been stopped successfully.",
      });
    }
  });

  // Quick benchmark mutation
  const benchmarkMutation = useMutation({
    mutationFn: async () => {
      return apiRequest('POST', '/api/load-testing/benchmark', {});
    },
    onSuccess: (data: any) => {
      setActiveTestId(data.testId);
      queryClient.invalidateQueries({ queryKey: ['/api/load-testing/tests'] });
      toast({
        title: "Benchmark Started",
        description: "Quick performance benchmark is running.",
      });
    }
  });

  const handleScenarioSelect = (scenarioName: string) => {
    setSelectedScenario(scenarioName);
    const scenario = scenarios.find(s => s.name === scenarioName);
    if (scenario) {
      setCustomConfig({
        targetUrl: customConfig.targetUrl,
        ...scenario.config
      });
    }
  };

  const handleStartTest = () => {
    if (runningTest) {
      toast({
        title: "Test Already Running",
        description: "Please wait for the current test to complete.",
        variant: "destructive",
      });
      return;
    }
    startTestMutation.mutate(customConfig);
  };

  const handleStopTest = () => {
    if (runningTest) {
      stopTestMutation.mutate(runningTest.id);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running':
        return <Loader2 className="h-4 w-4 animate-spin text-blue-600" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'failed':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Target className="h-6 w-6 text-primary" />
          <div>
            <h2 className="text-2xl font-bold">Load Testing</h2>
            <p className="text-muted-foreground">Test system performance under various load conditions</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            onClick={() => benchmarkMutation.mutate()}
            disabled={!!runningTest || benchmarkMutation.isPending}
          >
            <Zap className="h-4 w-4 mr-2" />
            Quick Benchmark
          </Button>
        </div>
      </div>

      <Tabs defaultValue="runner">
        <TabsList>
          <TabsTrigger value="runner">Test Runner</TabsTrigger>
          <TabsTrigger value="results">Results</TabsTrigger>
          <TabsTrigger value="analysis">Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="runner" className="space-y-6">
          {/* Active Test Status */}
          {runningTest && (
            <Card className="border-blue-200 bg-blue-50/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                  Test Running: {runningTest.config.concurrentUsers} users
                </CardTitle>
                <CardDescription>
                  Duration: {runningTest.config.duration}s • Started: {new Date(runningTest.startTime).toLocaleTimeString()}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Progress</span>
                    <Button 
                      size="sm" 
                      variant="destructive"
                      onClick={handleStopTest}
                      disabled={stopTestMutation.isPending}
                    >
                      <Square className="h-3 w-3 mr-1" />
                      Stop Test
                    </Button>
                  </div>
                  
                  {activeTestStats && (
                    <>
                      <Progress value={(activeTestStats.duration / runningTest.config.duration) * 100} />
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <div className="text-muted-foreground">Requests</div>
                          <div className="font-medium">{activeTestStats.metrics.totalRequests}</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">RPS</div>
                          <div className="font-medium">{activeTestStats.metrics.requestsPerSecond.toFixed(1)}</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Avg Response</div>
                          <div className="font-medium">{activeTestStats.metrics.averageResponseTime.toFixed(0)}ms</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Error Rate</div>
                          <div className="font-medium">{activeTestStats.metrics.errorRate.toFixed(1)}%</div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Test Configuration */}
            <Card>
              <CardHeader>
                <CardTitle>Test Configuration</CardTitle>
                <CardDescription>Configure your load testing parameters</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Predefined Scenarios */}
                <div>
                  <Label>Test Scenario</Label>
                  <select 
                    className="w-full mt-1 p-2 border rounded-md"
                    value={selectedScenario}
                    onChange={(e) => handleScenarioSelect(e.target.value)}
                  >
                    <option value="">Custom Configuration</option>
                    {scenarios.map((scenario) => (
                      <option key={scenario.name} value={scenario.name}>
                        {scenario.name}
                      </option>
                    ))}
                  </select>
                  {selectedScenario && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {scenarios.find(s => s.name === selectedScenario)?.description}
                    </p>
                  )}
                </div>

                {/* Custom Parameters */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Concurrent Users</Label>
                    <Input
                      type="number"
                      value={customConfig.concurrentUsers}
                      onChange={(e) => setCustomConfig(prev => ({
                        ...prev, 
                        concurrentUsers: parseInt(e.target.value) || 1
                      }))}
                      min="1"
                      max="1000"
                    />
                  </div>
                  <div>
                    <Label>Duration (seconds)</Label>
                    <Input
                      type="number"
                      value={customConfig.duration}
                      onChange={(e) => setCustomConfig(prev => ({
                        ...prev, 
                        duration: parseInt(e.target.value) || 60
                      }))}
                      min="10"
                      max="3600"
                    />
                  </div>
                </div>

                <div>
                  <Label>Ramp-up Time (seconds)</Label>
                  <Input
                    type="number"
                    value={customConfig.rampUpTime}
                    onChange={(e) => setCustomConfig(prev => ({
                      ...prev, 
                      rampUpTime: parseInt(e.target.value) || 0
                    }))}
                    min="0"
                    max="600"
                  />
                </div>

                <div>
                  <Label>Target Endpoints</Label>
                  <textarea
                    className="w-full mt-1 p-2 border rounded-md text-sm"
                    rows={3}
                    value={customConfig.endpoints.join('\n')}
                    onChange={(e) => setCustomConfig(prev => ({
                      ...prev, 
                      endpoints: e.target.value.split('\n').filter(Boolean)
                    }))}
                    placeholder="/api/health&#10;/api/projects&#10;/api/monitoring/metrics"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    One endpoint per line
                  </p>
                </div>

                <Button
                  onClick={handleStartTest}
                  disabled={!!runningTest || startTestMutation.isPending}
                  className="w-full gap-2"
                >
                  {startTestMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Play className="h-4 w-4" />
                  )}
                  {runningTest ? 'Test Running...' : 'Start Load Test'}
                </Button>
              </CardContent>
            </Card>

            {/* Test Overview */}
            <Card>
              <CardHeader>
                <CardTitle>System Load Impact</CardTitle>
                <CardDescription>Expected impact on system resources</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 border rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Users className="h-4 w-4 text-blue-600" />
                        <span className="text-sm font-medium">Load Profile</span>
                      </div>
                      <div className="text-lg font-bold">{customConfig.concurrentUsers} users</div>
                      <div className="text-xs text-muted-foreground">
                        {formatDuration(customConfig.duration)} duration
                      </div>
                    </div>

                    <div className="p-3 border rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="h-4 w-4 text-green-600" />
                        <span className="text-sm font-medium">Ramp-up</span>
                      </div>
                      <div className="text-lg font-bold">{formatDuration(customConfig.rampUpTime)}</div>
                      <div className="text-xs text-muted-foreground">
                        Gradual user increase
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="text-sm font-medium mb-2">Test Endpoints ({customConfig.endpoints.length})</div>
                    <ScrollArea className="h-24 w-full border rounded p-2 bg-gray-50">
                      <div className="text-xs space-y-1">
                        {customConfig.endpoints.map((endpoint, index) => (
                          <div key={index} className="font-mono text-gray-700">
                            {endpoint}
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>

                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <AlertTriangle className="h-4 w-4 text-yellow-600" />
                      <span className="text-sm font-medium text-yellow-800">Load Testing Notice</span>
                    </div>
                    <p className="text-xs text-yellow-700">
                      Load testing may temporarily impact system performance. Run during maintenance windows when possible.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="results" className="space-y-6">
          {/* Test History */}
          <Card>
            <CardHeader>
              <CardTitle>Test History</CardTitle>
              <CardDescription>Previous load test results and performance data</CardDescription>
            </CardHeader>
            <CardContent>
              {tests.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium mb-2">No load tests yet</p>
                  <p className="text-sm">Run your first load test to see performance metrics</p>
                </div>
              ) : (
                <ScrollArea className="h-96">
                  <div className="space-y-3">
                    {tests.map((test) => (
                      <div key={test.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          {getStatusIcon(test.status)}
                          <div>
                            <div className="font-medium">
                              {test.config.concurrentUsers} users • {formatDuration(test.config.duration)}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {new Date(test.startTime).toLocaleString()}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm">
                          {test.status === 'completed' && (
                            <>
                              <div className="text-center">
                                <div className="font-medium">{test.metrics.requestsPerSecond.toFixed(1)}</div>
                                <div className="text-xs text-muted-foreground">RPS</div>
                              </div>
                              <div className="text-center">
                                <div className="font-medium">{test.metrics.averageResponseTime.toFixed(0)}ms</div>
                                <div className="text-xs text-muted-foreground">Avg Response</div>
                              </div>
                              <div className="text-center">
                                <div className="font-medium">{test.metrics.errorRate.toFixed(1)}%</div>
                                <div className="text-xs text-muted-foreground">Errors</div>
                              </div>
                            </>
                          )}
                          <Badge variant={test.status === 'completed' ? 'default' : 'secondary'}>
                            {test.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analysis" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Performance Analysis</CardTitle>
              <CardDescription>Detailed analysis and recommendations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium mb-2">Performance Analysis</p>
                <p className="text-sm">Complete a load test to see detailed analysis and recommendations</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}