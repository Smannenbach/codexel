import { performance } from "perf_hooks";

interface LoadTestConfig {
  targetUrl: string;
  concurrentUsers: number;
  duration: number; // in seconds
  rampUpTime: number; // in seconds
  endpoints: string[];
}

interface LoadTestResult {
  id: string;
  config: LoadTestConfig;
  status: 'running' | 'completed' | 'failed';
  startTime: Date;
  endTime?: Date;
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
    timestamp: Date;
    endpoint: string;
    error: string;
    responseTime: number;
  }>;
  timeline: Array<{
    timestamp: Date;
    activeUsers: number;
    responseTime: number;
    requestsPerSecond: number;
  }>;
}

class LoadTestingService {
  private activeTests = new Map<string, LoadTestResult>();
  private testCounter = 0;

  async startLoadTest(config: LoadTestConfig): Promise<string> {
    const testId = `load_test_${Date.now()}_${++this.testCounter}`;
    
    const testResult: LoadTestResult = {
      id: testId,
      config,
      status: 'running',
      startTime: new Date(),
      metrics: {
        totalRequests: 0,
        successfulRequests: 0,
        failedRequests: 0,
        averageResponseTime: 0,
        minResponseTime: Infinity,
        maxResponseTime: 0,
        requestsPerSecond: 0,
        errorRate: 0
      },
      errors: [],
      timeline: []
    };

    this.activeTests.set(testId, testResult);

    // Start the load test in background
    this.executeLoadTest(testId);

    return testId;
  }

  getTestResult(testId: string): LoadTestResult | undefined {
    return this.activeTests.get(testId);
  }

  getAllTests(): LoadTestResult[] {
    return Array.from(this.activeTests.values())
      .sort((a, b) => b.startTime.getTime() - a.startTime.getTime());
  }

  stopTest(testId: string): boolean {
    const test = this.activeTests.get(testId);
    if (!test || test.status !== 'running') {
      return false;
    }

    test.status = 'completed';
    test.endTime = new Date();
    this.finalizeMetrics(test);
    return true;
  }

  private async executeLoadTest(testId: string) {
    const test = this.activeTests.get(testId);
    if (!test) return;

    const { config } = test;
    const startTime = performance.now();
    const endTime = startTime + (config.duration * 1000);
    const rampUpEndTime = startTime + (config.rampUpTime * 1000);

    let activeUsers = 0;
    const responseTimes: number[] = [];
    const userPromises: Promise<void>[] = [];

    // Timeline tracking
    const timelineInterval = setInterval(() => {
      if (test.status !== 'running') {
        clearInterval(timelineInterval);
        return;
      }

      const currentTime = performance.now();
      const recentResponseTimes = responseTimes.slice(-10); // Last 10 requests
      const avgResponseTime = recentResponseTimes.length > 0 
        ? recentResponseTimes.reduce((a, b) => a + b, 0) / recentResponseTimes.length 
        : 0;

      test.timeline.push({
        timestamp: new Date(),
        activeUsers,
        responseTime: avgResponseTime,
        requestsPerSecond: test.metrics.totalRequests / ((currentTime - startTime) / 1000)
      });
    }, 1000);

    try {
      while (performance.now() < endTime && test.status === 'running') {
        const currentTime = performance.now();
        
        // Ramp up users gradually
        const targetUsers = currentTime < rampUpEndTime 
          ? Math.floor((currentTime - startTime) / (rampUpEndTime - startTime) * config.concurrentUsers)
          : config.concurrentUsers;

        // Start new users if needed
        while (activeUsers < targetUsers && test.status === 'running') {
          activeUsers++;
          const userPromise = this.simulateUser(test, config);
          userPromises.push(userPromise);
          
          userPromise.finally(() => {
            activeUsers--;
          });

          // Small delay between starting users
          await this.delay(50);
        }

        await this.delay(100); // Check every 100ms
      }

      // Wait for all users to complete
      await Promise.allSettled(userPromises);

    } catch (error) {
      test.status = 'failed';
      test.errors.push({
        timestamp: new Date(),
        endpoint: 'system',
        error: error instanceof Error ? error.message : 'Unknown error',
        responseTime: 0
      });
    } finally {
      clearInterval(timelineInterval);
      if (test.status === 'running') {
        test.status = 'completed';
      }
      test.endTime = new Date();
      this.finalizeMetrics(test);
    }
  }

  private async simulateUser(test: LoadTestResult, config: LoadTestConfig) {
    const userStartTime = performance.now();
    const userEndTime = userStartTime + (config.duration * 1000);

    while (performance.now() < userEndTime && test.status === 'running') {
      // Pick a random endpoint
      const endpoint = config.endpoints[Math.floor(Math.random() * config.endpoints.length)];
      
      try {
        const requestStart = performance.now();
        
        // Simulate HTTP request (in real implementation, use actual HTTP client)
        await this.makeRequest(config.targetUrl + endpoint);
        
        const responseTime = performance.now() - requestStart;
        
        // Update metrics
        test.metrics.totalRequests++;
        test.metrics.successfulRequests++;
        test.metrics.minResponseTime = Math.min(test.metrics.minResponseTime, responseTime);
        test.metrics.maxResponseTime = Math.max(test.metrics.maxResponseTime, responseTime);
        
        // Update average response time
        const totalTime = (test.metrics.averageResponseTime * (test.metrics.totalRequests - 1)) + responseTime;
        test.metrics.averageResponseTime = totalTime / test.metrics.totalRequests;

      } catch (error) {
        test.metrics.totalRequests++;
        test.metrics.failedRequests++;
        test.errors.push({
          timestamp: new Date(),
          endpoint,
          error: error instanceof Error ? error.message : 'Request failed',
          responseTime: 0
        });
      }

      // Random delay between requests (1-3 seconds)
      await this.delay(1000 + Math.random() * 2000);
    }
  }

  private async makeRequest(url: string): Promise<void> {
    // Simulate network request with variable response time
    const baseDelay = 50 + Math.random() * 200; // 50-250ms base
    const networkJitter = Math.random() * 100; // 0-100ms jitter
    
    // Occasionally simulate slow requests
    const slowRequest = Math.random() < 0.05; // 5% chance
    const totalDelay = slowRequest ? baseDelay + 1000 + Math.random() * 2000 : baseDelay + networkJitter;
    
    await this.delay(totalDelay);

    // Simulate occasional failures
    if (Math.random() < 0.02) { // 2% failure rate
      throw new Error('Simulated network error');
    }
  }

  private finalizeMetrics(test: LoadTestResult) {
    const duration = test.endTime 
      ? (test.endTime.getTime() - test.startTime.getTime()) / 1000 
      : test.config.duration;

    test.metrics.requestsPerSecond = test.metrics.totalRequests / duration;
    test.metrics.errorRate = (test.metrics.failedRequests / test.metrics.totalRequests) * 100;

    if (test.metrics.minResponseTime === Infinity) {
      test.metrics.minResponseTime = 0;
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Predefined test scenarios
  getTestScenarios() {
    return [
      {
        name: "Light Load Test",
        description: "Basic functionality test with light traffic",
        config: {
          concurrentUsers: 10,
          duration: 60,
          rampUpTime: 10,
          endpoints: ['/api/projects', '/api/monitoring/health', '/api/monitoring/metrics']
        }
      },
      {
        name: "Moderate Load Test",
        description: "Realistic user load simulation",
        config: {
          concurrentUsers: 50,
          duration: 300,
          rampUpTime: 60,
          endpoints: [
            '/api/projects', 
            '/api/monitoring/health', 
            '/api/monitoring/metrics',
            '/api/ai/chat',
            '/api/analytics/track'
          ]
        }
      },
      {
        name: "Stress Test",
        description: "High load to identify system limits",
        config: {
          concurrentUsers: 200,
          duration: 600,
          rampUpTime: 120,
          endpoints: [
            '/api/projects', 
            '/api/monitoring/health', 
            '/api/monitoring/metrics',
            '/api/ai/chat',
            '/api/analytics/track',
            '/api/deployments',
            '/api/snapshots/auto-save'
          ]
        }
      },
      {
        name: "Spike Test",
        description: "Sudden traffic spikes simulation",
        config: {
          concurrentUsers: 100,
          duration: 180,
          rampUpTime: 5, // Very quick ramp up
          endpoints: ['/api/projects', '/api/ai/chat', '/api/monitoring/health']
        }
      }
    ];
  }
}

export const loadTestingService = new LoadTestingService();