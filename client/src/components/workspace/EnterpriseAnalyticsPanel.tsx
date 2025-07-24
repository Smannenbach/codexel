import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Shield, 
  Users, 
  Activity, 
  Download,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Clock,
  Zap,
  Target,
  Globe
} from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface EnterpriseMetrics {
  totalUsers: number;
  activeProjects: number;
  codeGenerationRequests: number;
  deploymentCount: number;
  apiUsage: {
    total: number;
    byModel: Record<string, number>;
    costAnalysis: {
      total: number;
      breakdown: Record<string, number>;
    };
  };
  performance: {
    averageResponseTime: number;
    uptime: number;
    errorRate: number;
  };
  security: {
    threatsDetected: number;
    vulnerabilitiesFixed: number;
    complianceScore: number;
  };
}

interface TeamProductivity {
  teamId: string;
  teamName: string;
  metrics: {
    projectsCompleted: number;
    averageCompletionTime: number;
    codeQualityScore: number;
    collaborationScore: number;
    deploymentSuccess: number;
  };
  trends: {
    productivity: 'increasing' | 'decreasing' | 'stable';
    efficiency: number;
    qualityImprovement: number;
  };
}

interface CostOptimization {
  currentSpend: number;
  projectedSavings: number;
  recommendations: {
    id: string;
    type: 'model-optimization' | 'resource-scaling' | 'automation';
    description: string;
    estimatedSavings: number;
    implementationEffort: 'low' | 'medium' | 'high';
    priority: 'low' | 'medium' | 'high' | 'critical';
  }[];
}

export default function EnterpriseAnalyticsPanel() {
  const [metrics, setMetrics] = useState<EnterpriseMetrics | null>(null);
  const [teams, setTeams] = useState<TeamProductivity[]>([]);
  const [costData, setCostData] = useState<CostOptimization | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTimeRange, setSelectedTimeRange] = useState('7d');
  const [selectedExportFormat, setSelectedExportFormat] = useState('json');
  const { toast } = useToast();

  const loadAnalytics = async () => {
    setIsLoading(true);
    try {
      // Load enterprise metrics
      const metricsResponse = await apiRequest('GET', '/api/enterprise/analytics/metrics');
      setMetrics(metricsResponse);

      // Load team productivity
      const teamsResponse = await apiRequest('GET', '/api/enterprise/analytics/teams');
      setTeams(teamsResponse);

      // Load cost optimization
      const costResponse = await apiRequest('GET', '/api/enterprise/analytics/costs');
      setCostData(costResponse);
    } catch (error) {
      toast({
        title: "Failed to Load Analytics",
        description: "Could not fetch enterprise analytics data",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const exportReport = async () => {
    try {
      const response = await apiRequest('POST', '/api/enterprise/analytics/export', {
        format: selectedExportFormat,
        timeRange: selectedTimeRange,
        includeTeams: true,
        includeCosts: true
      });

      // Create download link
      const blob = new Blob([response.content], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `enterprise-report-${new Date().toISOString().split('T')[0]}.${selectedExportFormat}`;
      a.click();
      window.URL.revokeObjectURL(url);

      toast({
        title: "Report Exported",
        description: `Enterprise report exported as ${selectedExportFormat.toUpperCase()}`,
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Could not export enterprise report",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, [selectedTimeRange]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-red-500';
      case 'high': return 'text-orange-500';
      case 'medium': return 'text-yellow-500';
      case 'low': return 'text-green-500';
      default: return 'text-gray-500';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing': return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'decreasing': return <TrendingDown className="w-4 h-4 text-red-500" />;
      default: return <Activity className="w-4 h-4 text-blue-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Enterprise Analytics</h1>
          <p className="text-gray-400 mt-1">Comprehensive insights and performance metrics</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={selectedTimeRange} onValueChange={setSelectedTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1d">Last 24h</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          
          <Button
            onClick={loadAnalytics}
            disabled={isLoading}
            variant="outline"
            size="sm"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>

          <div className="flex items-center gap-2">
            <Select value={selectedExportFormat} onValueChange={setSelectedExportFormat}>
              <SelectTrigger className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="json">JSON</SelectItem>
                <SelectItem value="csv">CSV</SelectItem>
                <SelectItem value="pdf">PDF</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={exportReport} size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </div>

      {/* Key Metrics Cards */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Total Users</p>
                  <p className="text-2xl font-bold text-white">{formatNumber(metrics.totalUsers)}</p>
                </div>
                <Users className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Active Projects</p>
                  <p className="text-2xl font-bold text-white">{formatNumber(metrics.activeProjects)}</p>
                </div>
                <Target className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">API Usage</p>
                  <p className="text-2xl font-bold text-white">{formatNumber(metrics.apiUsage.total)}</p>
                </div>
                <Zap className="w-8 h-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Deployments</p>
                  <p className="text-2xl font-bold text-white">{formatNumber(metrics.deploymentCount)}</p>
                </div>
                <Globe className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Analytics Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="teams">Teams</TabsTrigger>
          <TabsTrigger value="costs">Costs</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {metrics && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* API Usage Breakdown */}
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    API Usage by Model
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {Object.entries(metrics.apiUsage.byModel).map(([model, usage]) => (
                    <div key={model} className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-300">{model}</span>
                        <span className="text-sm text-white">{formatNumber(usage)}</span>
                      </div>
                      <Progress 
                        value={(usage / Math.max(...Object.values(metrics.apiUsage.byModel))) * 100} 
                        className="h-2"
                      />
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Cost Analysis */}
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5" />
                    Cost Breakdown
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-white">
                      {formatCurrency(metrics.apiUsage.costAnalysis.total)}
                    </div>
                    <div className="text-sm text-gray-400">Total Spend</div>
                  </div>
                  {Object.entries(metrics.apiUsage.costAnalysis.breakdown).map(([provider, cost]) => (
                    <div key={provider} className="flex justify-between items-center">
                      <span className="text-sm text-gray-300 capitalize">{provider}</span>
                      <span className="text-sm text-white">{formatCurrency(cost)}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="teams" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {teams.map((team) => (
              <Card key={team.teamId} className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{team.teamName}</span>
                    {getTrendIcon(team.trends.productivity)}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-400">Projects Completed</span>
                      <span className="text-sm text-white">{team.metrics.projectsCompleted}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-400">Avg Completion Time</span>
                      <span className="text-sm text-white">{team.metrics.averageCompletionTime} days</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-400">Code Quality</span>
                      <span className="text-sm text-white">{Math.round(team.metrics.codeQualityScore)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-400">Collaboration</span>
                      <span className="text-sm text-white">{Math.round(team.metrics.collaborationScore)}%</span>
                    </div>
                  </div>
                  
                  <div className="pt-2 border-t border-gray-700">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-400">Efficiency Trend</span>
                      <Badge variant={team.trends.efficiency > 0 ? "default" : "destructive"}>
                        {team.trends.efficiency > 0 ? '+' : ''}{team.trends.efficiency}%
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="costs" className="space-y-6">
          {costData && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle>Cost Overview</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Current Monthly Spend</span>
                      <span className="text-white text-lg font-semibold">
                        {formatCurrency(costData.currentSpend)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Projected Savings</span>
                      <span className="text-green-400 text-lg font-semibold">
                        {formatCurrency(costData.projectedSavings)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Potential ROI</span>
                      <span className="text-green-400 text-lg font-semibold">
                        {Math.round((costData.projectedSavings / costData.currentSpend) * 100)}%
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle>Cost Optimization Recommendations</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {costData.recommendations.map((rec) => (
                    <div key={rec.id} className="p-3 bg-gray-700 rounded border-l-4 border-l-blue-500">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="text-sm font-medium text-white">{rec.description}</h4>
                        <Badge className={getPriorityColor(rec.priority)}>
                          {rec.priority}
                        </Badge>
                      </div>
                      <div className="flex justify-between text-xs text-gray-400">
                        <span>Savings: {formatCurrency(rec.estimatedSavings)}</span>
                        <span>Effort: {rec.implementationEffort}</span>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          {metrics && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    Security Overview
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-400">
                      {Math.round(metrics.security.complianceScore)}%
                    </div>
                    <div className="text-sm text-gray-400">Compliance Score</div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Threats Detected</span>
                      <span className="text-red-400">{metrics.security.threatsDetected}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Vulnerabilities Fixed</span>
                      <span className="text-green-400">{metrics.security.vulnerabilitiesFixed}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle>Compliance Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    { name: 'SOC 2', status: 'compliant' },
                    { name: 'GDPR', status: 'compliant' },
                    { name: 'HIPAA', status: 'compliant' },
                    { name: 'ISO 27001', status: 'pending' }
                  ].map((standard) => (
                    <div key={standard.name} className="flex justify-between items-center">
                      <span className="text-gray-300">{standard.name}</span>
                      <div className="flex items-center gap-2">
                        {standard.status === 'compliant' ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                          <Clock className="w-4 h-4 text-yellow-500" />
                        )}
                        <span className={`text-xs ${
                          standard.status === 'compliant' ? 'text-green-400' : 'text-yellow-400'
                        }`}>
                          {standard.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle>Security Recommendations</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    'Implement additional encryption for data at rest',
                    'Enhance access control logging',
                    'Complete ISO 27001 certification process',
                    'Update data retention policies'
                  ].map((rec, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-gray-300">{rec}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          {metrics && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle>Response Time</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-400">
                      {metrics.performance.averageResponseTime}ms
                    </div>
                    <div className="text-sm text-gray-400">Average Response Time</div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle>System Uptime</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-400">
                      {metrics.performance.uptime.toFixed(2)}%
                    </div>
                    <div className="text-sm text-gray-400">Uptime</div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle>Error Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-red-400">
                      {metrics.performance.errorRate.toFixed(3)}%
                    </div>
                    <div className="text-sm text-gray-400">Error Rate</div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}