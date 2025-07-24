import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  PlayCircle, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Zap,
  Bug,
  Shield,
  Globe,
  Database,
  Code
} from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface TestCase {
  id: string;
  name: string;
  description: string;
  category: 'unit' | 'integration' | 'e2e' | 'performance' | 'security';
  status: 'pending' | 'running' | 'passed' | 'failed';
  duration?: number;
  error?: string;
}

interface TestSuite {
  id: string;
  name: string;
  tests: TestCase[];
  progress: number;
}

export default function TestWorkflows({ projectId }: { projectId: number }) {
  const [testSuites, setTestSuites] = useState<TestSuite[]>([
    {
      id: 'frontend',
      name: 'Frontend Tests',
      progress: 0,
      tests: [
        {
          id: 'component-render',
          name: 'Component Rendering',
          description: 'Test all React components render correctly',
          category: 'unit',
          status: 'pending'
        },
        {
          id: 'user-interactions',
          name: 'User Interactions',
          description: 'Test click, input, and navigation flows',
          category: 'integration',
          status: 'pending'
        },
        {
          id: 'responsive-design',
          name: 'Responsive Design',
          description: 'Test layout on different screen sizes',
          category: 'e2e',
          status: 'pending'
        }
      ]
    },
    {
      id: 'backend',
      name: 'Backend Tests',
      progress: 0,
      tests: [
        {
          id: 'api-endpoints',
          name: 'API Endpoints',
          description: 'Test all REST endpoints return correct responses',
          category: 'integration',
          status: 'pending'
        },
        {
          id: 'database-operations',
          name: 'Database Operations',
          description: 'Test CRUD operations and data integrity',
          category: 'unit',
          status: 'pending'
        },
        {
          id: 'authentication',
          name: 'Authentication',
          description: 'Test login, logout, and protected routes',
          category: 'security',
          status: 'pending'
        }
      ]
    },
    {
      id: 'performance',
      name: 'Performance Tests',
      progress: 0,
      tests: [
        {
          id: 'load-testing',
          name: 'Load Testing',
          description: 'Test application under high concurrent users',
          category: 'performance',
          status: 'pending'
        },
        {
          id: 'memory-usage',
          name: 'Memory Usage',
          description: 'Monitor memory leaks and optimization',
          category: 'performance',
          status: 'pending'
        },
        {
          id: 'api-response-time',
          name: 'API Response Time',
          description: 'Ensure APIs respond within acceptable limits',
          category: 'performance',
          status: 'pending'
        }
      ]
    }
  ]);

  const [isRunning, setIsRunning] = useState(false);
  const [overallProgress, setOverallProgress] = useState(0);
  const { toast } = useToast();

  const runTestSuite = async (suiteId: string) => {
    setIsRunning(true);
    const suite = testSuites.find(s => s.id === suiteId);
    if (!suite) return;

    for (let i = 0; i < suite.tests.length; i++) {
      const test = suite.tests[i];
      
      // Update test status to running
      setTestSuites(prev => prev.map(s => 
        s.id === suiteId 
          ? {
              ...s,
              tests: s.tests.map(t => 
                t.id === test.id ? { ...t, status: 'running' as const } : t
              )
            }
          : s
      ));

      // Simulate test execution
      const duration = Math.random() * 3000 + 1000; // 1-4 seconds
      await new Promise(resolve => setTimeout(resolve, duration));

      // Simulate test result (90% pass rate)
      const passed = Math.random() > 0.1;
      const status = passed ? 'passed' : 'failed';
      const error = passed ? undefined : `Test failed: ${test.name} did not meet expectations`;

      // Update test status
      setTestSuites(prev => prev.map(s => 
        s.id === suiteId 
          ? {
              ...s,
              tests: s.tests.map(t => 
                t.id === test.id ? { 
                  ...t, 
                  status: status,
                  duration: Math.round(duration),
                  error 
                } : t
              ),
              progress: ((i + 1) / s.tests.length) * 100
            }
          : s
      ));
    }

    // Calculate overall progress
    const totalTests = testSuites.reduce((acc, suite) => acc + suite.tests.length, 0);
    const completedTests = testSuites.reduce((acc, suite) => 
      acc + suite.tests.filter(t => t.status === 'passed' || t.status === 'failed').length, 0
    );
    setOverallProgress((completedTests / totalTests) * 100);

    setIsRunning(false);
    
    toast({
      title: "Test Suite Complete",
      description: `${suite.name} finished with ${suite.tests.filter(t => t.status === 'passed').length}/${suite.tests.length} tests passing`,
    });
  };

  const runAllTests = async () => {
    setIsRunning(true);
    for (const suite of testSuites) {
      await runTestSuite(suite.id);
    }
    setIsRunning(false);
    
    toast({
      title: "All Tests Complete",
      description: "Full test suite execution finished",
    });
  };

  const getStatusIcon = (status: TestCase['status']) => {
    switch (status) {
      case 'passed': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'running': return <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500" />;
      default: return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: TestCase['status']) => {
    switch (status) {
      case 'passed': return 'bg-green-500';
      case 'failed': return 'bg-red-500';
      case 'running': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getCategoryIcon = (category: TestCase['category']) => {
    switch (category) {
      case 'unit': return <Code className="h-3 w-3" />;
      case 'integration': return <Zap className="h-3 w-3" />;
      case 'e2e': return <Globe className="h-3 w-3" />;
      case 'performance': return <PlayCircle className="h-3 w-3" />;
      case 'security': return <Shield className="h-3 w-3" />;
      default: return <Bug className="h-3 w-3" />;
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-gray-900/50 border-gray-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <PlayCircle className="h-5 w-5 text-green-500" />
            Test Workflows
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-4 bg-gray-800 border-gray-700">
              <TabsTrigger value="overview" className="text-gray-300">Overview</TabsTrigger>
              <TabsTrigger value="frontend" className="text-gray-300">Frontend</TabsTrigger>
              <TabsTrigger value="backend" className="text-gray-300">Backend</TabsTrigger>
              <TabsTrigger value="performance" className="text-gray-300">Performance</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="space-y-4 mt-4">
              {/* Overall Progress */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Overall Test Progress</span>
                  <span className="text-white">{overallProgress.toFixed(0)}%</span>
                </div>
                <Progress value={overallProgress} className="h-2" />
              </div>

              {/* Test Suite Summary */}
              <div className="grid grid-cols-1 gap-4">
                {testSuites.map((suite) => {
                  const passedTests = suite.tests.filter(t => t.status === 'passed').length;
                  const failedTests = suite.tests.filter(t => t.status === 'failed').length;
                  
                  return (
                    <div key={suite.id} className="p-4 rounded-lg bg-gray-800/50 border border-gray-700">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-sm font-medium text-white">{suite.name}</h4>
                        <Button 
                          onClick={() => runTestSuite(suite.id)}
                          disabled={isRunning}
                          variant="outline"
                          size="sm"
                          className="border-gray-700 text-gray-300"
                        >
                          {isRunning ? <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white" /> : <PlayCircle className="h-3 w-3" />}
                        </Button>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-400">Progress</span>
                          <span className="text-white">{suite.progress.toFixed(0)}%</span>
                        </div>
                        <Progress value={suite.progress} className="h-1" />
                        
                        <div className="flex gap-4 text-xs">
                          <span className="text-green-400">Passed: {passedTests}</span>
                          <span className="text-red-400">Failed: {failedTests}</span>
                          <span className="text-gray-400">Total: {suite.tests.length}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Run All Tests Button */}
              <Button 
                onClick={runAllTests}
                disabled={isRunning}
                className="w-full bg-green-600 hover:bg-green-700"
                size="lg"
              >
                {isRunning ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Running Tests...
                  </>
                ) : (
                  <>
                    <PlayCircle className="h-4 w-4 mr-2" />
                    Run All Tests
                  </>
                )}
              </Button>
            </TabsContent>
            
            {testSuites.map((suite) => (
              <TabsContent key={suite.id} value={suite.id} className="space-y-4 mt-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium text-white">{suite.name}</h4>
                    <Button 
                      onClick={() => runTestSuite(suite.id)}
                      disabled={isRunning}
                      variant="outline"
                      size="sm"
                      className="border-gray-700 text-gray-300"
                    >
                      <PlayCircle className="h-3 w-3 mr-1" />
                      Run Suite
                    </Button>
                  </div>
                  
                  {suite.tests.map((test) => (
                    <div key={test.id} className="p-3 rounded-lg bg-gray-800/50 border border-gray-700">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          {getStatusIcon(test.status)}
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm font-medium text-white">{test.name}</span>
                              <Badge className={`text-xs text-white ${getStatusColor(test.status)}`}>
                                {test.status}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {getCategoryIcon(test.category)}
                                {test.category}
                              </Badge>
                            </div>
                            <p className="text-xs text-gray-400 mb-2">{test.description}</p>
                            
                            {test.duration && (
                              <div className="text-xs text-gray-500">
                                Duration: {test.duration}ms
                              </div>
                            )}
                            
                            {test.error && (
                              <div className="text-xs text-red-400 mt-1 p-2 bg-red-900/20 rounded">
                                {test.error}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}