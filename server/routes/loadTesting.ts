import type { Express } from "express";
import { z } from "zod";
import { loadTestingService } from "../services/loadTesting";

export function registerLoadTestingRoutes(app: Express) {
  
  // Get available test scenarios
  app.get('/api/load-testing/scenarios', (req, res) => {
    try {
      const scenarios = loadTestingService.getTestScenarios();
      res.json({ scenarios });
    } catch (error) {
      console.error('Load testing scenarios error:', error);
      res.status(500).json({ error: 'Failed to fetch test scenarios' });
    }
  });

  // Start a load test
  app.post('/api/load-testing/start', async (req, res) => {
    try {
      const loadTestSchema = z.object({
        targetUrl: z.string().url().optional().default('http://localhost:5000'),
        concurrentUsers: z.number().min(1).max(1000),
        duration: z.number().min(10).max(3600), // 10 seconds to 1 hour
        rampUpTime: z.number().min(0).max(600), // 0 to 10 minutes
        endpoints: z.array(z.string()).min(1)
      });

      const config = loadTestSchema.parse(req.body);
      const testId = await loadTestingService.startLoadTest(config);

      res.json({
        testId,
        message: 'Load test started successfully',
        config
      });

    } catch (error) {
      console.error('Load test start error:', error);
      res.status(500).json({ 
        error: 'Failed to start load test',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Get test result
  app.get('/api/load-testing/results/:testId', (req, res) => {
    try {
      const testResult = loadTestingService.getTestResult(req.params.testId);
      
      if (!testResult) {
        return res.status(404).json({ error: 'Test not found' });
      }

      res.json(testResult);
    } catch (error) {
      console.error('Load test result error:', error);
      res.status(500).json({ error: 'Failed to fetch test result' });
    }
  });

  // Get all tests
  app.get('/api/load-testing/tests', (req, res) => {
    try {
      const tests = loadTestingService.getAllTests();
      res.json({ tests });
    } catch (error) {
      console.error('Load tests fetch error:', error);
      res.status(500).json({ error: 'Failed to fetch tests' });
    }
  });

  // Stop a running test
  app.post('/api/load-testing/stop/:testId', (req, res) => {
    try {
      const success = loadTestingService.stopTest(req.params.testId);
      
      if (!success) {
        return res.status(400).json({ error: 'Test not found or not running' });
      }

      res.json({ message: 'Test stopped successfully' });
    } catch (error) {
      console.error('Load test stop error:', error);
      res.status(500).json({ error: 'Failed to stop test' });
    }
  });

  // Quick performance benchmark
  app.post('/api/load-testing/benchmark', async (req, res) => {
    try {
      const benchmarkConfig = {
        targetUrl: 'http://localhost:5000',
        concurrentUsers: 20,
        duration: 30,
        rampUpTime: 5,
        endpoints: ['/api/monitoring/health', '/api/projects']
      };

      const testId = await loadTestingService.startLoadTest(benchmarkConfig);

      res.json({
        testId,
        message: 'Performance benchmark started',
        config: benchmarkConfig
      });

    } catch (error) {
      console.error('Benchmark error:', error);
      res.status(500).json({ error: 'Failed to start benchmark' });
    }
  });

  // Get real-time test statistics
  app.get('/api/load-testing/stats/:testId', (req, res) => {
    try {
      const testResult = loadTestingService.getTestResult(req.params.testId);
      
      if (!testResult) {
        return res.status(404).json({ error: 'Test not found' });
      }

      // Return only the latest metrics for real-time updates
      const stats = {
        id: testResult.id,
        status: testResult.status,
        metrics: testResult.metrics,
        timeline: testResult.timeline.slice(-10), // Last 10 data points
        errorCount: testResult.errors.length,
        duration: testResult.endTime 
          ? (testResult.endTime.getTime() - testResult.startTime.getTime()) / 1000
          : (Date.now() - testResult.startTime.getTime()) / 1000
      };

      res.json(stats);
    } catch (error) {
      console.error('Load test stats error:', error);
      res.status(500).json({ error: 'Failed to fetch test statistics' });
    }
  });

  // System recommendations based on load test results
  app.get('/api/load-testing/recommendations/:testId', (req, res) => {
    try {
      const testResult = loadTestingService.getTestResult(req.params.testId);
      
      if (!testResult || testResult.status === 'running') {
        return res.status(400).json({ error: 'Test not completed' });
      }

      const recommendations = generatePerformanceRecommendations(testResult);
      res.json({ recommendations });

    } catch (error) {
      console.error('Load test recommendations error:', error);
      res.status(500).json({ error: 'Failed to generate recommendations' });
    }
  });
}

function generatePerformanceRecommendations(testResult: any) {
  const recommendations = [];
  const { metrics } = testResult;

  // Response time recommendations
  if (metrics.averageResponseTime > 1000) {
    recommendations.push({
      type: 'performance',
      priority: 'high',
      title: 'High Response Time Detected',
      description: `Average response time of ${metrics.averageResponseTime.toFixed(0)}ms exceeds recommended limits.`,
      action: 'Optimize database queries and implement caching strategies'
    });
  }

  // Error rate recommendations
  if (metrics.errorRate > 5) {
    recommendations.push({
      type: 'reliability',
      priority: 'critical',
      title: 'High Error Rate',
      description: `Error rate of ${metrics.errorRate.toFixed(1)}% indicates system instability.`,
      action: 'Review error logs and implement better error handling'
    });
  }

  // Throughput recommendations
  if (metrics.requestsPerSecond < 10) {
    recommendations.push({
      type: 'scalability',
      priority: 'medium',
      title: 'Low Throughput',
      description: `Only ${metrics.requestsPerSecond.toFixed(1)} requests per second processed.`,
      action: 'Consider horizontal scaling or performance optimization'
    });
  }

  // Response time variance
  const responseTimeVariance = metrics.maxResponseTime - metrics.minResponseTime;
  if (responseTimeVariance > 2000) {
    recommendations.push({
      type: 'consistency',
      priority: 'medium',
      title: 'Inconsistent Response Times',
      description: `Large variance in response times (${responseTimeVariance.toFixed(0)}ms).`,
      action: 'Implement request queuing and load balancing'
    });
  }

  // Success recommendations
  if (metrics.errorRate < 1 && metrics.averageResponseTime < 500) {
    recommendations.push({
      type: 'success',
      priority: 'low',
      title: 'Excellent Performance',
      description: 'System performing well under current load conditions.',
      action: 'Consider increasing load to find upper performance limits'
    });
  }

  return recommendations;
}