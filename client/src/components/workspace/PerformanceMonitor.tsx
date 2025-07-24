import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Activity, 
  TrendingUp, 
  Cpu, 
  MemoryStick, 
  Network, 
  Clock,
  AlertTriangle,
  CheckCircle,
  Zap
} from 'lucide-react';

interface PerformanceMetrics {
  cpuUsage: number;
  memoryUsage: number;
  networkLatency: number;
  responseTime: number;
  throughput: number;
  errorRate: number;
}

interface Alert {
  id: string;
  type: 'warning' | 'error' | 'info';
  message: string;
  timestamp: Date;
  metric: string;
}

export default function PerformanceMonitor() {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    cpuUsage: 45,
    memoryUsage: 62,
    networkLatency: 12,
    responseTime: 280,
    throughput: 1450,
    errorRate: 0.2
  });

  const [alerts, setAlerts] = useState<Alert[]>([
    {
      id: '1',
      type: 'warning',
      message: 'Memory usage approaching 70% threshold',
      timestamp: new Date(Date.now() - 5 * 60 * 1000),
      metric: 'memory'
    },
    {
      id: '2',
      type: 'info',
      message: 'Response time optimized by 15%',
      timestamp: new Date(Date.now() - 15 * 60 * 1000),
      metric: 'response_time'
    }
  ]);

  const [isMonitoring, setIsMonitoring] = useState(true);

  useEffect(() => {
    if (!isMonitoring) return;

    const interval = setInterval(() => {
      setMetrics(prev => ({
        cpuUsage: Math.max(10, Math.min(90, prev.cpuUsage + (Math.random() - 0.5) * 10)),
        memoryUsage: Math.max(20, Math.min(85, prev.memoryUsage + (Math.random() - 0.5) * 8)),
        networkLatency: Math.max(5, Math.min(50, prev.networkLatency + (Math.random() - 0.5) * 6)),
        responseTime: Math.max(100, Math.min(1000, prev.responseTime + (Math.random() - 0.5) * 50)),
        throughput: Math.max(800, Math.min(2000, prev.throughput + (Math.random() - 0.5) * 100)),
        errorRate: Math.max(0, Math.min(5, prev.errorRate + (Math.random() - 0.5) * 0.5))
      }));

      // Generate alerts based on thresholds
      if (Math.random() < 0.1) { // 10% chance of new alert
        const alertTypes = ['warning', 'error', 'info'] as const;
        const messages = [
          'High CPU usage detected',
          'Memory usage spike',
          'Network latency increased',
          'Response time improved',
          'Throughput optimized'
        ];
        
        const newAlert: Alert = {
          id: Date.now().toString(),
          type: alertTypes[Math.floor(Math.random() * alertTypes.length)],
          message: messages[Math.floor(Math.random() * messages.length)],
          timestamp: new Date(),
          metric: 'cpu'
        };
        
        setAlerts(prev => [newAlert, ...prev.slice(0, 4)]); // Keep only 5 most recent
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [isMonitoring]);

  const getMetricStatus = (value: number, thresholds: { warning: number; error: number }) => {
    if (value >= thresholds.error) return { status: 'error', color: 'text-red-500' };
    if (value >= thresholds.warning) return { status: 'warning', color: 'text-yellow-500' };
    return { status: 'good', color: 'text-green-500' };
  };

  const getAlertIcon = (type: Alert['type']) => {
    switch (type) {
      case 'error': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default: return <CheckCircle className="h-4 w-4 text-blue-500" />;
    }
  };

  const getAlertColor = (type: Alert['type']) => {
    switch (type) {
      case 'error': return 'bg-red-500';
      case 'warning': return 'bg-yellow-500';
      default: return 'bg-blue-500';
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-gray-900/50 border-gray-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Activity className="h-5 w-5 text-green-500" />
            Performance Monitor
            {isMonitoring && (
              <div className="flex items-center gap-1 text-xs text-green-400">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                Live
              </div>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Real-time Metrics */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Cpu className="h-4 w-4 text-blue-400" />
                  <span className="text-gray-400">CPU Usage</span>
                </div>
                <span className={`font-medium ${getMetricStatus(metrics.cpuUsage, { warning: 70, error: 85 }).color}`}>
                  {metrics.cpuUsage.toFixed(1)}%
                </span>
              </div>
              <Progress value={metrics.cpuUsage} className="h-2" />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <MemoryStick className="h-4 w-4 text-purple-400" />
                  <span className="text-gray-400">Memory</span>
                </div>
                <span className={`font-medium ${getMetricStatus(metrics.memoryUsage, { warning: 70, error: 85 }).color}`}>
                  {metrics.memoryUsage.toFixed(1)}%
                </span>
              </div>
              <Progress value={metrics.memoryUsage} className="h-2" />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Network className="h-4 w-4 text-orange-400" />
                  <span className="text-gray-400">Network Latency</span>
                </div>
                <span className={`font-medium ${getMetricStatus(metrics.networkLatency, { warning: 30, error: 50 }).color}`}>
                  {metrics.networkLatency.toFixed(0)}ms
                </span>
              </div>
              <Progress value={(metrics.networkLatency / 50) * 100} className="h-2" />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-cyan-400" />
                  <span className="text-gray-400">Response Time</span>
                </div>
                <span className={`font-medium ${getMetricStatus(metrics.responseTime, { warning: 500, error: 1000 }).color}`}>
                  {metrics.responseTime.toFixed(0)}ms
                </span>
              </div>
              <Progress value={(metrics.responseTime / 1000) * 100} className="h-2" />
            </div>
          </div>

          {/* Performance Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-3 rounded-lg bg-gray-800/50">
              <div className="text-lg font-bold text-white">{metrics.throughput.toFixed(0)}</div>
              <div className="text-xs text-gray-400">Requests/min</div>
            </div>
            <div className="text-center p-3 rounded-lg bg-gray-800/50">
              <div className="text-lg font-bold text-white">{metrics.errorRate.toFixed(2)}%</div>
              <div className="text-xs text-gray-400">Error Rate</div>
            </div>
            <div className="text-center p-3 rounded-lg bg-gray-800/50">
              <div className="text-lg font-bold text-white">99.9%</div>
              <div className="text-xs text-gray-400">Uptime</div>
            </div>
          </div>

          {/* Recent Alerts */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium text-white">Recent Alerts</h4>
              <Button
                onClick={() => setIsMonitoring(!isMonitoring)}
                variant="outline"
                size="sm"
                className="border-gray-700 text-gray-300"
              >
                {isMonitoring ? (
                  <>
                    <Activity className="h-3 w-3 mr-1" />
                    Monitoring
                  </>
                ) : (
                  <>
                    <Zap className="h-3 w-3 mr-1" />
                    Start Monitor
                  </>
                )}
              </Button>
            </div>
            
            {alerts.length > 0 ? (
              <div className="space-y-2">
                {alerts.map((alert) => (
                  <div key={alert.id} className="p-3 rounded-lg bg-gray-800/50 border border-gray-700">
                    <div className="flex items-start gap-3">
                      {getAlertIcon(alert.type)}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium text-white">{alert.message}</span>
                          <Badge className={`text-white text-xs ${getAlertColor(alert.type)}`}>
                            {alert.type}
                          </Badge>
                        </div>
                        <div className="text-xs text-gray-400">
                          {alert.timestamp.toLocaleTimeString()} • {alert.metric}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-gray-400 text-sm">
                No recent alerts
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="flex-1 border-gray-700 text-gray-300">
              <TrendingUp className="h-3 w-3 mr-1" />
              View Detailed Report
            </Button>
            <Button variant="outline" size="sm" className="flex-1 border-gray-700 text-gray-300">
              <Zap className="h-3 w-3 mr-1" />
              Optimize Performance
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}