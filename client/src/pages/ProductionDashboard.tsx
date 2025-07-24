import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Settings, 
  Rocket, 
  Activity, 
  BarChart3,
  Shield,
  Zap,
  Globe,
  Database,
  Target
} from 'lucide-react';
import DeploymentManager from '@/components/deployment/DeploymentManager';
import PerformanceMonitor from '@/components/monitoring/PerformanceMonitor';
import LoadTestRunner from '@/components/loadTesting/LoadTestRunner';
import LiveDeployment from '@/components/deployment/LiveDeployment';

export default function ProductionDashboard() {
  const [activeTab, setActiveTab] = useState('overview');

  const productionStats = {
    deployments: 12,
    uptime: '99.9%',
    avgResponseTime: '142ms',
    activeUsers: 247,
    errorRate: '0.1%',
    lastDeploy: '2 hours ago'
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Production Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Monitor and manage your production deployment
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
              System Healthy
            </Badge>
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <Card>
            <CardContent className="p-3">
              <div className="flex items-center gap-2">
                <Rocket className="h-4 w-4 text-blue-600" />
                <div>
                  <div className="text-xs text-muted-foreground">Deployments</div>
                  <div className="text-lg font-bold">{productionStats.deployments}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-3">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-green-600" />
                <div>
                  <div className="text-xs text-muted-foreground">Uptime</div>
                  <div className="text-lg font-bold">{productionStats.uptime}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-3">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-yellow-600" />
                <div>
                  <div className="text-xs text-muted-foreground">Response Time</div>
                  <div className="text-lg font-bold">{productionStats.avgResponseTime}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-3">
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-purple-600" />
                <div>
                  <div className="text-xs text-muted-foreground">Active Users</div>
                  <div className="text-lg font-bold">{productionStats.activeUsers}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-3">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-red-600" />
                <div>
                  <div className="text-xs text-muted-foreground">Error Rate</div>
                  <div className="text-lg font-bold">{productionStats.errorRate}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-3">
              <div className="flex items-center gap-2">
                <Database className="h-4 w-4 text-indigo-600" />
                <div>
                  <div className="text-xs text-muted-foreground">Last Deploy</div>
                  <div className="text-lg font-bold">{productionStats.lastDeploy}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Dashboard */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="deployments">Deployments</TabsTrigger>
            <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
            <TabsTrigger value="load-testing">Load Testing</TabsTrigger>
            <TabsTrigger value="live-deploy">Live Deploy</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* System Status */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    System Status
                  </CardTitle>
                  <CardDescription>
                    Current status of all production systems
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span>Web Application</span>
                      <Badge className="bg-green-100 text-green-700">Operational</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>API Services</span>
                      <Badge className="bg-green-100 text-green-700">Operational</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Database</span>
                      <Badge className="bg-green-100 text-green-700">Operational</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Payment Processing</span>
                      <Badge className="bg-green-100 text-green-700">Operational</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>AI Services</span>
                      <Badge className="bg-green-100 text-green-700">Operational</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Recent Activity
                  </CardTitle>
                  <CardDescription>
                    Latest system events and deployments
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-sm">
                      <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                      <span className="flex-1">Production deployment completed</span>
                      <span className="text-muted-foreground">2h ago</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                      <span className="flex-1">SSL certificate renewed</span>
                      <span className="text-muted-foreground">6h ago</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                      <span className="flex-1">Database backup completed</span>
                      <span className="text-muted-foreground">12h ago</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                      <span className="flex-1">Security scan completed</span>
                      <span className="text-muted-foreground">1d ago</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Production Readiness Checklist */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Production Readiness
                </CardTitle>
                <CardDescription>
                  Critical production requirements and their status
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <h4 className="font-medium">Security</h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                        SSL Certificate Active
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                        Security Headers Configured
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                        Rate Limiting Active
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-medium">Performance</h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                        CDN Configured
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                        Caching Enabled
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                        Database Optimized
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-medium">Reliability</h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                        Health Checks Active
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                        Backup Systems Running
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                        Error Monitoring Active
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="deployments">
            <DeploymentManager projectId={3} />
          </TabsContent>

          <TabsContent value="monitoring">
            <PerformanceMonitor />
          </TabsContent>

          <TabsContent value="load-testing">
            <LoadTestRunner />
          </TabsContent>

          <TabsContent value="live-deploy">
            <LiveDeployment />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Production Analytics</CardTitle>
                <CardDescription>
                  Detailed analytics and insights for production systems
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium mb-2">Analytics Dashboard</p>
                  <p className="text-sm">
                    Advanced analytics and reporting features will be available here
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}