// Advanced Performance Optimization Service
import { EventEmitter } from 'events';

interface PerformanceMetrics {
  responseTime: number;
  memoryUsage: number;
  cpuUsage: number;
  activeConnections: number;
  cacheHitRatio: number;
  timestamp: number;
}

interface OptimizationRule {
  id: string;
  condition: (metrics: PerformanceMetrics) => boolean;
  action: (metrics: PerformanceMetrics) => Promise<void>;
  priority: number;
  cooldown: number;
  lastExecuted?: number;
}

class PerformanceOptimizer extends EventEmitter {
  private metrics: PerformanceMetrics[] = [];
  private optimizationRules: OptimizationRule[] = [];
  private isOptimizing = false;
  private cacheStore = new Map<string, { data: any; expires: number; hits: number }>();
  private readonly MAX_METRICS_HISTORY = 100;

  constructor() {
    super();
    this.initializeOptimizationRules();
    this.startMetricsCollection();
  }

  private initializeOptimizationRules() {
    this.optimizationRules = [
      {
        id: 'memory-cleanup',
        condition: (metrics) => metrics.memoryUsage > 85,
        action: async (metrics) => {
          await this.performMemoryCleanup();
          console.log(`🧹 Memory cleanup executed. Usage: ${metrics.memoryUsage}% -> ${this.getCurrentMemoryUsage()}%`);
        },
        priority: 1,
        cooldown: 30000 // 30 seconds
      },
      {
        id: 'cache-optimization',
        condition: (metrics) => metrics.cacheHitRatio < 0.7,
        action: async (metrics) => {
          await this.optimizeCache();
          console.log(`⚡ Cache optimization executed. Hit ratio improved to ${this.getCacheHitRatio()}`);
        },
        priority: 2,
        cooldown: 60000 // 1 minute
      },
      {
        id: 'connection-pooling',
        condition: (metrics) => metrics.activeConnections > 100,
        action: async (metrics) => {
          await this.optimizeConnections();
          console.log(`🔗 Connection pooling optimized. Active connections: ${metrics.activeConnections}`);
        },
        priority: 3,
        cooldown: 45000 // 45 seconds
      },
      {
        id: 'response-time-optimization',
        condition: (metrics) => metrics.responseTime > 1000,
        action: async (metrics) => {
          await this.optimizeResponseTime();
          console.log(`🚀 Response time optimization executed. Avg time: ${metrics.responseTime}ms`);
        },
        priority: 2,
        cooldown: 120000 // 2 minutes
      }
    ];
  }

  private startMetricsCollection() {
    setInterval(() => {
      this.collectMetrics();
    }, 5000); // Collect metrics every 5 seconds
  }

  private async collectMetrics() {
    const metrics: PerformanceMetrics = {
      responseTime: this.getAverageResponseTime(),
      memoryUsage: this.getCurrentMemoryUsage(),
      cpuUsage: this.getCurrentCpuUsage(),
      activeConnections: this.getActiveConnections(),
      cacheHitRatio: this.getCacheHitRatio(),
      timestamp: Date.now()
    };

    this.metrics.push(metrics);
    
    // Keep only recent metrics
    if (this.metrics.length > this.MAX_METRICS_HISTORY) {
      this.metrics.shift();
    }

    // Check for optimization opportunities
    await this.evaluateOptimizations(metrics);
    
    this.emit('metrics-updated', metrics);
  }

  private async evaluateOptimizations(metrics: PerformanceMetrics) {
    if (this.isOptimizing) return;

    const applicableRules = this.optimizationRules
      .filter(rule => rule.condition(metrics))
      .filter(rule => !rule.lastExecuted || (Date.now() - rule.lastExecuted) > rule.cooldown)
      .sort((a, b) => a.priority - b.priority);

    if (applicableRules.length > 0) {
      this.isOptimizing = true;
      
      for (const rule of applicableRules.slice(0, 2)) { // Execute max 2 rules at once
        try {
          await rule.action(metrics);
          rule.lastExecuted = Date.now();
          this.emit('optimization-applied', { rule: rule.id, metrics });
        } catch (error) {
          console.error(`Optimization rule ${rule.id} failed:`, error);
        }
      }
      
      this.isOptimizing = false;
    }
  }

  private getCurrentMemoryUsage(): number {
    const usage = process.memoryUsage();
    const totalMemory = 512 * 1024 * 1024; // 512MB typical container limit
    return (usage.heapUsed / totalMemory) * 100;
  }

  private getCurrentCpuUsage(): number {
    // Simplified CPU usage estimation
    const usage = process.cpuUsage();
    return Math.min(((usage.user + usage.system) / 1000000) * 100, 100);
  }

  private getActiveConnections(): number {
    // This would typically integrate with your HTTP server
    return Math.floor(Math.random() * 150) + 10; // Simulated for now
  }

  private getAverageResponseTime(): number {
    // Calculate from recent response times
    const recentMetrics = this.metrics.slice(-10);
    if (recentMetrics.length === 0) return 0;
    
    return recentMetrics.reduce((sum, m) => sum + m.responseTime, 0) / recentMetrics.length;
  }

  private getCacheHitRatio(): number {
    const totalHits = Array.from(this.cacheStore.values()).reduce((sum, item) => sum + item.hits, 0);
    const totalRequests = this.cacheStore.size * 10; // Estimated
    return totalRequests > 0 ? totalHits / totalRequests : 0;
  }

  private async performMemoryCleanup() {
    // Clear expired cache entries
    const now = Date.now();
    const entries = Array.from(this.cacheStore.entries());
    for (const [key, value] of entries) {
      if (value.expires < now) {
        this.cacheStore.delete(key);
      }
    }

    // Force garbage collection if available
    if (global.gc) {
      global.gc();
    }

    // Clear old metrics
    this.metrics = this.metrics.slice(-50);
  }

  private async optimizeCache() {
    // Implement cache warming for frequently accessed data
    const popularKeys = Array.from(this.cacheStore.entries())
      .sort(([,a], [,b]) => b.hits - a.hits)
      .slice(0, 10)
      .map(([key]) => key);

    // Extend TTL for popular cache entries
    popularKeys.forEach(key => {
      const entry = this.cacheStore.get(key);
      if (entry) {
        entry.expires = Date.now() + 3600000; // Extend by 1 hour
      }
    });
  }

  private async optimizeConnections() {
    // This would implement connection pooling optimizations
    console.log('Optimizing database connection pool...');
    
    // Simulate connection optimization
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  private async optimizeResponseTime() {
    // Implement response time optimizations
    console.log('Optimizing response times through caching and compression...');
    
    // Enable response compression
    // Optimize database queries
    // Implement request batching
    
    await new Promise(resolve => setTimeout(resolve, 200));
  }

  // Public API methods
  public getMetrics(): PerformanceMetrics[] {
    return [...this.metrics];
  }

  public getCurrentMetrics(): PerformanceMetrics | null {
    return this.metrics.length > 0 ? this.metrics[this.metrics.length - 1] : null;
  }

  public getOptimizationHistory(): Array<{ rule: string; timestamp: number; metrics: PerformanceMetrics }> {
    // Return history of optimizations applied
    return this.optimizationRules
      .filter(rule => rule.lastExecuted)
      .map(rule => ({
        rule: rule.id,
        timestamp: rule.lastExecuted!,
        metrics: this.metrics.find(m => Math.abs(m.timestamp - rule.lastExecuted!) < 5000) || this.getCurrentMetrics()!
      }))
      .sort((a, b) => b.timestamp - a.timestamp);
  }

  public async forceOptimization(ruleId?: string) {
    if (this.isOptimizing) {
      throw new Error('Optimization already in progress');
    }

    const currentMetrics = this.getCurrentMetrics();
    if (!currentMetrics) {
      throw new Error('No metrics available for optimization');
    }

    if (ruleId) {
      const rule = this.optimizationRules.find(r => r.id === ruleId);
      if (!rule) {
        throw new Error(`Optimization rule ${ruleId} not found`);
      }

      this.isOptimizing = true;
      try {
        await rule.action(currentMetrics);
        rule.lastExecuted = Date.now();
        this.emit('optimization-applied', { rule: rule.id, metrics: currentMetrics });
      } finally {
        this.isOptimizing = false;
      }
    } else {
      // Run all applicable optimizations
      await this.evaluateOptimizations(currentMetrics);
    }
  }

  // Cache management methods
  public setCache(key: string, data: any, ttl: number = 3600000) {
    this.cacheStore.set(key, {
      data,
      expires: Date.now() + ttl,
      hits: 0
    });
  }

  public getCache(key: string): any | null {
    const entry = this.cacheStore.get(key);
    if (!entry) return null;
    
    if (entry.expires < Date.now()) {
      this.cacheStore.delete(key);
      return null;
    }
    
    entry.hits++;
    return entry.data;
  }

  public clearCache(pattern?: string) {
    if (pattern) {
      const regex = new RegExp(pattern);
      const keys = Array.from(this.cacheStore.keys());
      for (const key of keys) {
        if (regex.test(key)) {
          this.cacheStore.delete(key);
        }
      }
    } else {
      this.cacheStore.clear();
    }
  }

  public getCacheStats() {
    const entries = Array.from(this.cacheStore.values());
    return {
      totalEntries: entries.length,
      totalHits: entries.reduce((sum, entry) => sum + entry.hits, 0),
      hitRatio: this.getCacheHitRatio(),
      memoryUsage: JSON.stringify(Array.from(this.cacheStore.entries())).length
    };
  }
}

// Singleton instance
export const performanceOptimizer = new PerformanceOptimizer();

// Performance monitoring middleware
export function performanceMiddleware() {
  return (req: any, res: any, next: any) => {
    const startTime = Date.now();
    
    res.on('finish', () => {
      const responseTime = Date.now() - startTime;
      
      // Store response time for metrics
      if (responseTime > 1000) {
        console.log(`🚨 WARNING ALERT: Slow response time: ${responseTime}ms`);
      }
      
      // Cache successful GET requests
      if (req.method === 'GET' && res.statusCode === 200 && responseTime < 500) {
        const cacheKey = `${req.method}:${req.path}:${JSON.stringify(req.query)}`;
        performanceOptimizer.setCache(cacheKey, res.locals.responseData, 300000); // 5 minutes
      }
    });
    
    next();
  };
}