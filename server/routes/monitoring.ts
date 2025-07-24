import type { Express } from "express";
import { performance } from "perf_hooks";
import os from "os";

interface PerformanceMetrics {
  timestamp: Date;
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
  type: 'cpu' | 'memory' | 'response_time' | 'error_rate' | 'database';
  level: 'warning' | 'critical';
  message: string;
  threshold: number;
  value: number;
  timestamp: Date;
  resolved: boolean;
}

// Performance tracking
const metrics: PerformanceMetrics[] = [];
const alerts: Alert[] = [];
let requestCount = 0;
let responseCount = 0;
let errorCount = 0;
let totalResponseTime = 0;
let dbQueryCount = 0;
let totalDbQueryTime = 0;

// Middleware to track API performance
export function performanceMiddleware() {
  return (req: any, res: any, next: any) => {
    const startTime = performance.now();
    requestCount++;

    res.on('finish', () => {
      const endTime = performance.now();
      const responseTime = endTime - startTime;
      
      responseCount++;
      totalResponseTime += responseTime;

      if (res.statusCode >= 400) {
        errorCount++;
      }

      // Check for response time alerts
      if (responseTime > 1000) {
        createAlert('response_time', 'warning', 
          `Slow response time: ${responseTime.toFixed(2)}ms`, 
          1000, responseTime);
      }
    });

    next();
  };
}

export function registerMonitoringRoutes(app: Express) {
  
  // Add performance middleware
  app.use(performanceMiddleware());

  // Get current performance metrics
  app.get('/api/monitoring/metrics', (req, res) => {
    const currentMetrics = getCurrentMetrics();
    res.json(currentMetrics);
  });

  // Get historical metrics
  app.get('/api/monitoring/metrics/history', (req, res) => {
    const hours = parseInt(req.query.hours as string) || 24;
    const since = new Date(Date.now() - hours * 60 * 60 * 1000);
    
    const historicalMetrics = metrics.filter(m => m.timestamp >= since);
    res.json({ metrics: historicalMetrics });
  });

  // Get active alerts
  app.get('/api/monitoring/alerts', (req, res) => {
    const activeAlerts = alerts.filter(a => !a.resolved);
    res.json({ alerts: activeAlerts });
  });

  // Get all alerts
  app.get('/api/monitoring/alerts/all', (req, res) => {
    res.json({ alerts: alerts });
  });

  // Resolve alert
  app.post('/api/monitoring/alerts/:id/resolve', (req, res) => {
    const alert = alerts.find(a => a.id === req.params.id);
    
    if (!alert) {
      return res.status(404).json({ error: 'Alert not found' });
    }

    alert.resolved = true;
    res.json({ message: 'Alert resolved successfully' });
  });

  // System health check
  app.get('/api/monitoring/health', (req, res) => {
    const health = {
      status: 'healthy',
      timestamp: new Date(),
      uptime: process.uptime(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      checks: {
        database: checkDatabaseHealth(),
        memory: checkMemoryHealth(),
        cpu: checkCpuHealth(),
        network: checkNetworkHealth()
      }
    };

    const hasIssues = Object.values(health.checks).some(check => check.status !== 'ok');
    health.status = hasIssues ? 'degraded' : 'healthy';

    res.json(health);
  });

  // Performance optimization recommendations
  app.get('/api/monitoring/recommendations', (req, res) => {
    const recommendations = generateOptimizationRecommendations();
    res.json({ recommendations });
  });

  // Database query performance tracking
  app.post('/api/monitoring/db-query', (req, res) => {
    const { queryTime, queryType } = req.body;
    
    dbQueryCount++;
    totalDbQueryTime += queryTime;

    // Check for slow query alerts
    if (queryTime > 500) {
      createAlert('database', 'warning',
        `Slow database query: ${queryTime}ms (${queryType})`,
        500, queryTime);
    }

    res.json({ message: 'Query metrics recorded' });
  });
}

function getCurrentMetrics(): PerformanceMetrics {
  const memUsage = process.memoryUsage();
  const cpuUsage = os.loadavg()[0] / os.cpus().length;
  
  return {
    timestamp: new Date(),
    cpu: {
      usage: cpuUsage * 100,
      loadAverage: os.loadavg(),
      cores: os.cpus().length
    },
    memory: {
      used: memUsage.rss,
      total: os.totalmem(),
      usage: (memUsage.rss / os.totalmem()) * 100,
      heap: {
        used: memUsage.heapUsed,
        total: memUsage.heapTotal
      }
    },
    network: {
      requests: requestCount,
      responses: responseCount,
      errors: errorCount,
      avgResponseTime: responseCount > 0 ? totalResponseTime / responseCount : 0
    },
    database: {
      connections: 1, // Would track actual DB connections
      queries: dbQueryCount,
      avgQueryTime: dbQueryCount > 0 ? totalDbQueryTime / dbQueryCount : 0
    }
  };
}

function createAlert(type: Alert['type'], level: Alert['level'], message: string, threshold: number, value: number) {
  const alert: Alert = {
    id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
    type,
    level,
    message,
    threshold,
    value,
    timestamp: new Date(),
    resolved: false
  };

  alerts.push(alert);
  
  // Keep only last 100 alerts
  if (alerts.length > 100) {
    alerts.splice(0, alerts.length - 100);
  }

  console.warn(`🚨 ${level.toUpperCase()} ALERT:`, message);
}

function checkDatabaseHealth() {
  // In real implementation, would check actual DB connection
  return {
    status: 'ok',
    responseTime: Math.random() * 50 + 10, // Simulated
    connections: 5
  };
}

function checkMemoryHealth() {
  const memUsage = (process.memoryUsage().rss / os.totalmem()) * 100;
  
  if (memUsage > 85) {
    createAlert('memory', 'critical', 
      `High memory usage: ${memUsage.toFixed(1)}%`, 85, memUsage);
    return { status: 'critical', usage: memUsage };
  } else if (memUsage > 70) {
    createAlert('memory', 'warning',
      `Elevated memory usage: ${memUsage.toFixed(1)}%`, 70, memUsage);
    return { status: 'warning', usage: memUsage };
  }
  
  return { status: 'ok', usage: memUsage };
}

function checkCpuHealth() {
  const cpuUsage = (os.loadavg()[0] / os.cpus().length) * 100;
  
  if (cpuUsage > 85) {
    createAlert('cpu', 'critical',
      `High CPU usage: ${cpuUsage.toFixed(1)}%`, 85, cpuUsage);
    return { status: 'critical', usage: cpuUsage };
  } else if (cpuUsage > 70) {
    createAlert('cpu', 'warning',
      `Elevated CPU usage: ${cpuUsage.toFixed(1)}%`, 70, cpuUsage);
    return { status: 'warning', usage: cpuUsage };
  }
  
  return { status: 'ok', usage: cpuUsage };
}

function checkNetworkHealth() {
  const errorRate = responseCount > 0 ? (errorCount / responseCount) * 100 : 0;
  const avgResponseTime = responseCount > 0 ? totalResponseTime / responseCount : 0;
  
  if (errorRate > 10 || avgResponseTime > 2000) {
    return { status: 'critical', errorRate, avgResponseTime };
  } else if (errorRate > 5 || avgResponseTime > 1000) {
    return { status: 'warning', errorRate, avgResponseTime };
  }
  
  return { status: 'ok', errorRate, avgResponseTime };
}

function generateOptimizationRecommendations() {
  const recommendations = [];
  const currentMetrics = getCurrentMetrics();
  
  if (currentMetrics.memory.usage > 70) {
    recommendations.push({
      type: 'memory',
      priority: 'high',
      title: 'High Memory Usage Detected',
      description: 'Consider implementing memory caching optimization or increasing server memory allocation.',
      action: 'Implement Redis caching for frequently accessed data'
    });
  }
  
  if (currentMetrics.network.avgResponseTime > 500) {
    recommendations.push({
      type: 'performance',
      priority: 'medium',
      title: 'Slow API Response Times',
      description: 'API responses are slower than optimal. Consider database query optimization.',
      action: 'Analyze and optimize slow database queries'
    });
  }
  
  if (currentMetrics.database.avgQueryTime > 200) {
    recommendations.push({
      type: 'database',
      priority: 'high',
      title: 'Database Performance Issues',
      description: 'Database queries are taking longer than expected.',
      action: 'Add database indexes and optimize query performance'
    });
  }
  
  return recommendations;
}

// Collect metrics every 30 seconds
setInterval(() => {
  metrics.push(getCurrentMetrics());
  
  // Keep only last 24 hours of metrics (2880 data points)
  if (metrics.length > 2880) {
    metrics.splice(0, metrics.length - 2880);
  }
}, 30000);