import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Zap, 
  TrendingUp, 
  Database, 
  Globe, 
  Shield, 
  Cpu,
  CheckCircle,
  AlertTriangle,
  ExternalLink
} from 'lucide-react';

interface ProductionMetrics {
  performance: number;
  security: number;
  reliability: number;
  scalability: number;
}

export default function ProductionOptimizer() {
  const [metrics, setMetrics] = useState<ProductionMetrics>({
    performance: 95,
    security: 98,
    reliability: 97,
    scalability: 92
  });
  
  const [isOptimizing, setIsOptimizing] = useState(false);
  
  const optimizations = [
    {
      id: 'cache',
      title: 'Redis Caching',
      description: 'Implement Redis for session and API response caching',
      impact: 'High',
      status: 'recommended',
      icon: Database
    },
    {
      id: 'cdn',
      title: 'CDN Integration',
      description: 'Deploy static assets via global CDN',
      impact: 'High',
      status: 'ready',
      icon: Globe
    },
    {
      id: 'monitoring',
      title: 'Performance Monitoring',
      description: 'Real-time application performance tracking',
      impact: 'Medium',
      status: 'active',
      icon: TrendingUp
    },
    {
      id: 'security',
      title: 'Security Hardening',
      description: 'Rate limiting, CORS, and security headers',
      impact: 'Critical',
      status: 'active',
      icon: Shield
    },
    {
      id: 'scaling',
      title: 'Auto-scaling',
      description: 'Horizontal scaling based on traffic',
      impact: 'High',
      status: 'configured',
      icon: Cpu
    }
  ];

  const handleOptimize = async () => {
    setIsOptimizing(true);
    
    // Simulate optimization process
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setMetrics(prev => ({
      performance: Math.min(100, prev.performance + 3),
      security: Math.min(100, prev.security + 1),
      reliability: Math.min(100, prev.reliability + 2),
      scalability: Math.min(100, prev.scalability + 5)
    }));
    
    setIsOptimizing(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'configured': return 'bg-blue-500';
      case 'ready': return 'bg-yellow-500';
      case 'recommended': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
      case 'configured':
        return <CheckCircle className="h-4 w-4" />;
      case 'ready':
      case 'recommended':
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-gray-900/50 border-gray-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Zap className="h-5 w-5 text-yellow-500" />
            Production Optimizer
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Performance Metrics */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Performance</span>
                <span className="text-white">{metrics.performance}%</span>
              </div>
              <Progress value={metrics.performance} className="h-2" />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Security</span>
                <span className="text-white">{metrics.security}%</span>
              </div>
              <Progress value={metrics.security} className="h-2" />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Reliability</span>
                <span className="text-white">{metrics.reliability}%</span>
              </div>
              <Progress value={metrics.reliability} className="h-2" />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Scalability</span>
                <span className="text-white">{metrics.scalability}%</span>
              </div>
              <Progress value={metrics.scalability} className="h-2" />
            </div>
          </div>

          {/* Optimization Recommendations */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-white">Production Optimizations</h4>
            
            {optimizations.map((opt) => {
              const IconComponent = opt.icon;
              return (
                <div 
                  key={opt.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-gray-800/50 border border-gray-700"
                >
                  <div className="flex items-center gap-3">
                    <IconComponent className="h-4 w-4 text-gray-400" />
                    <div>
                      <div className="text-sm font-medium text-white">{opt.title}</div>
                      <div className="text-xs text-gray-400">{opt.description}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant="secondary" 
                      className={`text-white text-xs ${getStatusColor(opt.status)}`}
                    >
                      {getStatusIcon(opt.status)}
                      {opt.status}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {opt.impact}
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button 
              onClick={handleOptimize}
              disabled={isOptimizing}
              className="flex-1 bg-purple-600 hover:bg-purple-700"
            >
              {isOptimizing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Optimizing...
                </>
              ) : (
                <>
                  <Zap className="h-4 w-4 mr-2" />
                  Optimize Performance
                </>
              )}
            </Button>
            
            <Button variant="outline" className="border-gray-700 text-gray-300">
              <ExternalLink className="h-4 w-4 mr-2" />
              Deploy
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}