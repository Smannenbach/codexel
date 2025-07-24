import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  Lock, 
  Eye,
  FileCheck,
  Clock,
  Activity,
  Bug,
  Zap
} from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface SecurityEvent {
  id: string;
  type: 'authentication' | 'authorization' | 'data_access' | 'rate_limit' | 'suspicious_activity';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: Date;
  source: string;
  resolved: boolean;
}

interface SecurityMetrics {
  totalEvents: number;
  criticalAlerts: number;
  blockedRequests: number;
  authFailures: number;
  rateLimitHits: number;
  lastScan: Date;
}

export default function SecurityMonitor() {
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([
    {
      id: '1',
      type: 'rate_limit',
      severity: 'medium',
      message: 'Rate limit exceeded for IP 192.168.1.100',
      timestamp: new Date(Date.now() - 10 * 60 * 1000),
      source: 'API Gateway',
      resolved: true
    },
    {
      id: '2',
      type: 'authentication',
      severity: 'low',
      message: 'Failed login attempt detected',
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
      source: 'Auth Service',
      resolved: true
    },
    {
      id: '3',
      type: 'data_access',
      severity: 'high',
      message: 'Unusual data access pattern detected',
      timestamp: new Date(Date.now() - 45 * 60 * 1000),
      source: 'Database Monitor',
      resolved: false
    }
  ]);

  const [metrics, setMetrics] = useState<SecurityMetrics>({
    totalEvents: 15,
    criticalAlerts: 0,
    blockedRequests: 8,
    authFailures: 3,
    rateLimitHits: 12,
    lastScan: new Date(Date.now() - 5 * 60 * 1000)
  });

  const [isScanning, setIsScanning] = useState(false);
  const { toast } = useToast();

  // Simulate real-time security monitoring
  useEffect(() => {
    const interval = setInterval(() => {
      // Randomly generate new security events
      if (Math.random() < 0.1) { // 10% chance of new event
        const eventTypes = ['authentication', 'authorization', 'data_access', 'rate_limit'] as const;
        const severities = ['low', 'medium', 'high'] as const;
        const sources = ['API Gateway', 'Auth Service', 'Database Monitor', 'File System', 'Network Scanner'];
        const messages = [
          'Suspicious login pattern detected',
          'Multiple failed authentication attempts',
          'Unusual API usage detected',
          'File access from unknown location',
          'Potential SQL injection attempt blocked'
        ];

        const newEvent: SecurityEvent = {
          id: Date.now().toString(),
          type: eventTypes[Math.floor(Math.random() * eventTypes.length)],
          severity: severities[Math.floor(Math.random() * severities.length)],
          message: messages[Math.floor(Math.random() * messages.length)],
          timestamp: new Date(),
          source: sources[Math.floor(Math.random() * sources.length)],
          resolved: false
        };

        setSecurityEvents(prev => [newEvent, ...prev.slice(0, 9)]); // Keep only 10 most recent
        
        // Update metrics
        setMetrics(prev => ({
          ...prev,
          totalEvents: prev.totalEvents + 1,
          criticalAlerts: newEvent.severity === 'high' ? prev.criticalAlerts + 1 : prev.criticalAlerts
        }));
      }
    }, 10000); // Check every 10 seconds

    return () => clearInterval(interval);
  }, []);

  const runSecurityScan = async () => {
    setIsScanning(true);
    
    try {
      // Simulate security scan
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      setMetrics(prev => ({
        ...prev,
        lastScan: new Date()
      }));
      
      toast({
        title: "Security Scan Complete",
        description: "No critical vulnerabilities detected",
      });
    } catch (error) {
      toast({
        title: "Security Scan Failed",
        description: "Unable to complete security scan",
        variant: "destructive"
      });
    } finally {
      setIsScanning(false);
    }
  };

  const resolveEvent = (eventId: string) => {
    setSecurityEvents(prev => 
      prev.map(event => 
        event.id === eventId ? { ...event, resolved: true } : event
      )
    );
    
    toast({
      title: "Security Event Resolved",
      description: "Event has been marked as resolved",
    });
  };

  const getSeverityColor = (severity: SecurityEvent['severity']) => {
    switch (severity) {
      case 'critical': return 'bg-red-600';
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      default: return 'bg-blue-500';
    }
  };

  const getSeverityIcon = (severity: SecurityEvent['severity']) => {
    switch (severity) {
      case 'critical': 
      case 'high': return <AlertTriangle className="h-4 w-4" />;
      case 'medium': return <Eye className="h-4 w-4" />;
      default: return <CheckCircle className="h-4 w-4" />;
    }
  };

  const getTypeIcon = (type: SecurityEvent['type']) => {
    switch (type) {
      case 'authentication': return <Lock className="h-4 w-4" />;
      case 'authorization': return <Shield className="h-4 w-4" />;
      case 'data_access': return <FileCheck className="h-4 w-4" />;
      case 'rate_limit': return <Zap className="h-4 w-4" />;
      default: return <Bug className="h-4 w-4" />;
    }
  };

  const unresolvedEvents = securityEvents.filter(event => !event.resolved);
  const criticalEvents = securityEvents.filter(event => event.severity === 'critical' || event.severity === 'high');

  return (
    <div className="space-y-6">
      <Card className="bg-gray-900/50 border-gray-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Shield className="h-5 w-5 text-green-500" />
            Security Monitor
            <div className="flex items-center gap-1 text-xs text-green-400">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              Active
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Security Overview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 rounded-lg bg-gray-800/50">
              <div className="text-lg font-bold text-white">{metrics.totalEvents}</div>
              <div className="text-xs text-gray-400">Total Events</div>
            </div>
            <div className="text-center p-3 rounded-lg bg-gray-800/50">
              <div className="text-lg font-bold text-red-400">{unresolvedEvents.length}</div>
              <div className="text-xs text-gray-400">Unresolved</div>
            </div>
            <div className="text-center p-3 rounded-lg bg-gray-800/50">
              <div className="text-lg font-bold text-yellow-400">{metrics.blockedRequests}</div>
              <div className="text-xs text-gray-400">Blocked</div>
            </div>
            <div className="text-center p-3 rounded-lg bg-gray-800/50">
              <div className="text-lg font-bold text-green-400">99.8%</div>
              <div className="text-xs text-gray-400">Uptime</div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex gap-3">
            <Button 
              onClick={runSecurityScan}
              disabled={isScanning}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              {isScanning ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Scanning...
                </>
              ) : (
                <>
                  <Shield className="h-4 w-4 mr-2" />
                  Run Security Scan
                </>
              )}
            </Button>
            
            <Button variant="outline" className="border-gray-700 text-gray-300">
              <FileCheck className="h-4 w-4 mr-2" />
              Generate Report
            </Button>
          </div>

          {/* Security Status */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-white">Security Status</h4>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 rounded-lg bg-green-900/30 border border-green-700">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="h-4 w-4 text-green-400" />
                  <span className="text-sm font-medium text-green-300">Firewall</span>
                </div>
                <div className="text-xs text-green-200">Active & Protected</div>
              </div>
              
              <div className="p-3 rounded-lg bg-green-900/30 border border-green-700">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="h-4 w-4 text-green-400" />
                  <span className="text-sm font-medium text-green-300">SSL/TLS</span>
                </div>
                <div className="text-xs text-green-200">Valid Certificate</div>
              </div>
              
              <div className="p-3 rounded-lg bg-yellow-900/30 border border-yellow-700">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-400" />
                  <span className="text-sm font-medium text-yellow-300">Rate Limiting</span>
                </div>
                <div className="text-xs text-yellow-200">{metrics.rateLimitHits} hits today</div>
              </div>
              
              <div className="p-3 rounded-lg bg-green-900/30 border border-green-700">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="h-4 w-4 text-green-400" />
                  <span className="text-sm font-medium text-green-300">Data Encryption</span>
                </div>
                <div className="text-xs text-green-200">AES-256 Enabled</div>
              </div>
            </div>
          </div>

          {/* Recent Security Events */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium text-white">Recent Security Events</h4>
              <div className="text-xs text-gray-400">
                Last scan: {metrics.lastScan.toLocaleTimeString()}
              </div>
            </div>
            
            {securityEvents.length > 0 ? (
              <div className="space-y-2">
                {securityEvents.slice(0, 5).map((event) => (
                  <div key={event.id} className="p-3 rounded-lg bg-gray-800/50 border border-gray-700">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className="flex items-center gap-1">
                          {getTypeIcon(event.type)}
                          {getSeverityIcon(event.severity)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-medium text-white">{event.message}</span>
                            <Badge className={`text-white text-xs ${getSeverityColor(event.severity)}`}>
                              {event.severity}
                            </Badge>
                            {event.resolved && (
                              <Badge className="bg-green-500 text-white text-xs">
                                Resolved
                              </Badge>
                            )}
                          </div>
                          <div className="text-xs text-gray-400">
                            {event.timestamp.toLocaleTimeString()} • {event.source}
                          </div>
                        </div>
                      </div>
                      
                      {!event.resolved && (
                        <Button 
                          onClick={() => resolveEvent(event.id)}
                          variant="outline" 
                          size="sm"
                          className="border-gray-700 text-gray-300"
                        >
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Resolve
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-gray-400 text-sm">
                No security events detected
              </div>
            )}
          </div>

          {/* Alert Summary */}
          {criticalEvents.length > 0 && (
            <div className="p-3 bg-red-900/20 border border-red-800 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-4 w-4 text-red-400" />
                <span className="text-sm font-medium text-red-300">Critical Security Alert</span>
              </div>
              <p className="text-xs text-red-200">
                {criticalEvents.length} high-priority security event(s) require immediate attention.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}