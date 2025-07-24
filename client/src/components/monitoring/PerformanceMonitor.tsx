import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Cpu,
  MemoryStick,
  Network,
  Database,
  TrendingUp,
  Clock,
  Zap,
  Server
} from 'lucide-react';

interface PerformanceMetrics {
  timestamp: string;
  cpu: {
    usage: number;
    loadAverage: number[];
    cores: number;
  };
  memory: {
    used: number;
    total: number;
    usage: number;
    heap: {
      used: number;
      total: number;
    };
  };
  network: {
    requests: number;
    responses: number;
    errors: number;
    avgResponseTime: number;
  };
  database: {
    connections: number;
    queries: number;
    avgQueryTime: number;
  };
}

interface Alert {
  id: string;
  type: string;
  level: 'warning' | 'critical';
  message: string;
  threshold: number;
  value: number;
  timestamp: string;
  resolved: boolean;
}

interface HealthCheck {
  status: string;
  timestamp: string;
  uptime: number;
  version: string;
  environment: string;
  checks: {
    database: { status: string; responseTime?: number; connections?: number };
    memory: { status: string; usage?: number };
    cpu: { status: string; usage?: number };
    network: { status: string; errorRate?: number; avgResponseTime?: number };
  };
}

export default function PerformanceMonitor() {
  const [selectedTimeRange, setSelectedTimeRange] = useState('1h');
  
  // Get current metrics
  const { data: metrics } = useQuery<PerformanceMetrics>({
    queryKey: ['/api/monitoring/metrics'],
    refetchInterval: 5000 // Refresh every 5 seconds
  });

  // Get alerts
  const { data: alertsData } = useQuery<{ alerts: Alert[] }>({
    queryKey: ['/api/monitoring/alerts'],
    refetchInterval: 10000 // Refresh every 10 seconds
  });

  // Get health status
  const { data: health } = useQuery<HealthCheck>({
    queryKey: ['/api/monitoring/health'],
    refetchInterval: 30000 // Refresh every 30 seconds
  });

  const alerts = alertsData?.alerts || [];
  const activeAlerts = alerts.filter(a => !a.resolved);

  const formatBytes = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ok':
      case 'healthy':
        return 'text-green-600 bg-green-100';
      case 'warning':
        return 'text-yellow-600 bg-yellow-100';
      case 'critical':
      case 'degraded':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ok':
      case 'healthy':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'critical':
      case 'degraded':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Activity className="h-6 w-6 text-primary" />
          <div>
            <h2 className="text-2xl font-bold">Performance Monitor</h2>
            <p className="text-muted-foreground">Real-time system performance and health monitoring</p>
          </div>
        </div>
        
        {health && (
          <div className="flex items-center gap-2">
            {getStatusIcon(health.status)}
            <Badge className={getStatusColor(health.status)}>
              {health.status.charAt(0).toUpperCase() + health.status.slice(1)}
            </Badge>
          </div>
        )}
      </div>

      {/* System Overview */}
      {health && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Server className="h-5 w-5" />
              System Overview
            </CardTitle>
            <CardDescription>
              Overall system health and uptime information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <div className="text-sm font-medium text-muted-foreground">Uptime</div>
                <div className="text-lg font-bold">{formatUptime(health.uptime)}</div>
              </div>
              <div className="space-y-2">
                <div className="text-sm font-medium text-muted-foreground">Environment</div>
                <div className="text-lg font-bold capitalize">{health.environment}</div>
              </div>
              <div className="space-y-2">
                <div className="text-sm font-medium text-muted-foreground">Version</div>
                <div className="text-lg font-bold">{health.version}</div>
              </div>
              <div className="space-y-2">
                <div className="text-sm font-medium text-muted-foreground">Last Check</div>
                <div className="text-lg font-bold">
                  {new Date(health.timestamp).toLocaleTimeString()}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Active Alerts */}
      {activeAlerts.length > 0 && (
        <Card className="border-red-200 bg-red-50/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-700">
              <AlertTriangle className="h-5 w-5" />
              Active Alerts ({activeAlerts.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-32">
              <div className="space-y-2">
                {activeAlerts.map((alert) => (
                  <div key={alert.id} className="flex items-center justify-between p-2 bg-white rounded border">
                    <div className="flex items-center gap-2">
                      <Badge variant={alert.level === 'critical' ? 'destructive' : 'secondary'}>
                        {alert.level}
                      </Badge>
                      <span className="text-sm">{alert.message}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(alert.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {/* Performance Metrics */}
      <Tabs value={selectedTimeRange} onValueChange={setSelectedTimeRange}>
        <TabsList>
          <TabsTrigger value="1h">Last Hour</TabsTrigger>
          <TabsTrigger value="24h">Last 24 Hours</TabsTrigger>
          <TabsTrigger value="7d">Last 7 Days</TabsTrigger>
        </TabsList>

        <TabsContent value={selectedTimeRange} className="space-y-4">
          {/* Real-time Metrics Grid */}
          {metrics && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* CPU Usage */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Cpu className="h-4 w-4" />
                    CPU Usage
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="text-2xl font-bold">
                      {metrics.cpu.usage.toFixed(1)}%
                    </div>
                    <Progress value={metrics.cpu.usage} className="h-2" />
                    <div className="text-xs text-muted-foreground">
                      {metrics.cpu.cores} cores • Load: {metrics.cpu.loadAverage[0].toFixed(2)}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Memory Usage */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <MemoryStick className="h-4 w-4" />
                    Memory Usage
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="text-2xl font-bold">
                      {metrics.memory.usage.toFixed(1)}%
                    </div>
                    <Progress value={metrics.memory.usage} className="h-2" />
                    <div className="text-xs text-muted-foreground">
                      {formatBytes(metrics.memory.used)} / {formatBytes(metrics.memory.total)}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Network Performance */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Network className="h-4 w-4" />
                    Network
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="text-2xl font-bold">
                      {metrics.network.avgResponseTime.toFixed(0)}ms
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {metrics.network.requests} requests • {metrics.network.errors} errors
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Database Performance */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Database className="h-4 w-4" />
                    Database
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="text-2xl font-bold">
                      {metrics.database.avgQueryTime.toFixed(0)}ms
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {metrics.database.queries} queries • {metrics.database.connections} connections
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Health Checks Details */}
          {health && (
            <Card>
              <CardHeader>
                <CardTitle>Component Health</CardTitle>
                <CardDescription>
                  Detailed health status of system components
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(health.checks).map(([component, check]: [string, any]) => (
                    <div key={component} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(check.status)}
                        <div>
                          <div className="font-medium capitalize">{component}</div>
                          {check.responseTime && (
                            <div className="text-sm text-muted-foreground">
                              Response: {check.responseTime.toFixed(0)}ms
                            </div>
                          )}
                          {check.usage && (
                            <div className="text-sm text-muted-foreground">
                              Usage: {check.usage.toFixed(1)}%
                            </div>
                          )}
                        </div>
                      </div>
                      <Badge className={getStatusColor(check.status)}>
                        {check.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}