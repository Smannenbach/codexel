import { performance } from 'perf_hooks';

interface MemoryMetrics {
  used: number;
  total: number;
  percentage: number;
  heapUsed: number;
  heapTotal: number;
  external: number;
  rss: number;
}

interface MemoryOptimization {
  type: 'cache-clear' | 'gc-force' | 'connection-cleanup' | 'temp-cleanup';
  description: string;
  impact: 'low' | 'medium' | 'high';
  appliedAt: Date;
}

class MemoryOptimizer {
  private memoryHistory: MemoryMetrics[] = [];
  private optimizations: MemoryOptimization[] = [];
  private maxHistorySize = 100;
  private warningThreshold = 85; // 85% memory usage warning
  private criticalThreshold = 95; // 95% memory usage critical
  private cacheMap = new Map<string, any>();
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.startMonitoring();
  }

  private startMonitoring(): void {
    // Monitor memory usage every 30 seconds
    this.cleanupInterval = setInterval(() => {
      this.checkMemoryUsage();
    }, 30000);

    // Force garbage collection every 5 minutes if memory is high
    setInterval(() => {
      const metrics = this.getCurrentMemoryMetrics();
      if (metrics.percentage > this.warningThreshold) {
        this.forceGarbageCollection();
      }
    }, 300000);
  }

  getCurrentMemoryMetrics(): MemoryMetrics {
    const memUsage = process.memoryUsage();
    const totalMemory = this.getTotalSystemMemory();
    const used = memUsage.rss / 1024 / 1024; // Convert to MB
    const total = totalMemory / 1024 / 1024; // Convert to MB
    
    return {
      used,
      total,
      percentage: (used / total) * 100,
      heapUsed: memUsage.heapUsed / 1024 / 1024,
      heapTotal: memUsage.heapTotal / 1024 / 1024,
      external: memUsage.external / 1024 / 1024,
      rss: memUsage.rss / 1024 / 1024
    };
  }

  private getTotalSystemMemory(): number {
    // Default to 512MB if we can't determine system memory
    try {
      const os = require('os');
      return os.totalmem();
    } catch {
      return 512 * 1024 * 1024; // 512MB in bytes
    }
  }

  private checkMemoryUsage(): void {
    const metrics = this.getCurrentMemoryMetrics();
    
    // Add to history
    this.memoryHistory.push(metrics);
    if (this.memoryHistory.length > this.maxHistorySize) {
      this.memoryHistory.shift();
    }

    // Check thresholds and apply optimizations
    if (metrics.percentage > this.criticalThreshold) {
      console.log(`🚨 CRITICAL: High memory usage: ${metrics.percentage.toFixed(1)}% - Implement garbage collection optimization and reduce memory leaks`);
      this.applyCriticalOptimizations();
    } else if (metrics.percentage > this.warningThreshold) {
      console.log(`🚨 WARNING ALERT: High memory usage: ${metrics.percentage.toFixed(1)}%`);
      this.applyWarningOptimizations();
    }
  }

  private applyCriticalOptimizations(): void {
    const optimizations: MemoryOptimization[] = [];

    // Force garbage collection
    this.forceGarbageCollection();
    optimizations.push({
      type: 'gc-force',
      description: 'Forced garbage collection',
      impact: 'high',
      appliedAt: new Date()
    });

    // Clear all caches
    this.clearAllCaches();
    optimizations.push({
      type: 'cache-clear',
      description: 'Cleared all caches',
      impact: 'medium',
      appliedAt: new Date()
    });

    // Cleanup temporary data
    this.cleanupTemporaryData();
    optimizations.push({
      type: 'temp-cleanup',
      description: 'Cleaned up temporary data',
      impact: 'low',
      appliedAt: new Date()
    });

    this.optimizations.push(...optimizations);
    console.log(`Auto-optimizations applied: ${JSON.stringify(optimizations.map(o => o.type))}`);
  }

  private applyWarningOptimizations(): void {
    const optimizations: MemoryOptimization[] = [];

    // Clear expired cache entries
    this.clearExpiredCaches();
    optimizations.push({
      type: 'cache-clear',
      description: 'Cleared expired cache entries',
      impact: 'low',
      appliedAt: new Date()
    });

    this.optimizations.push(...optimizations);
  }

  private forceGarbageCollection(): void {
    if (global.gc) {
      global.gc();
    } else {
      // Try to trigger GC by creating memory pressure
      const pressure = new Array(100000).fill('memory pressure');
      pressure.length = 0;
    }
  }

  private clearAllCaches(): void {
    this.cacheMap.clear();
    
    // Note: Module cache clearing not available in ES modules
    // Focus on application-level cache clearing instead
    console.log('Application caches cleared');
  }

  private clearExpiredCaches(): void {
    // Clear cache entries older than 1 hour
    const oneHourAgo = Date.now() - (60 * 60 * 1000);
    
    // Use Array.from to avoid TypeScript iteration issues
    Array.from(this.cacheMap.entries()).forEach(([key, value]) => {
      if (value.timestamp && value.timestamp < oneHourAgo) {
        this.cacheMap.delete(key);
      }
    });
  }

  private cleanupTemporaryData(): void {
    // Clear memory history to keep only recent entries
    if (this.memoryHistory.length > 10) {
      this.memoryHistory = this.memoryHistory.slice(-10);
    }

    // Clear old optimizations log
    if (this.optimizations.length > 50) {
      this.optimizations = this.optimizations.slice(-20);
    }
  }

  getMemoryHistory(): MemoryMetrics[] {
    return [...this.memoryHistory];
  }

  getOptimizationHistory(): MemoryOptimization[] {
    return [...this.optimizations];
  }

  getMemoryTrend(): 'increasing' | 'decreasing' | 'stable' {
    if (this.memoryHistory.length < 5) return 'stable';
    
    const recent = this.memoryHistory.slice(-5);
    const average = recent.reduce((sum, m) => sum + m.percentage, 0) / recent.length;
    const older = this.memoryHistory.slice(-10, -5);
    
    if (older.length === 0) return 'stable';
    
    const olderAverage = older.reduce((sum, m) => sum + m.percentage, 0) / older.length;
    
    const difference = average - olderAverage;
    
    if (difference > 5) return 'increasing';
    if (difference < -5) return 'decreasing';
    return 'stable';
  }

  getRecommendations(): string[] {
    const currentMetrics = this.getCurrentMemoryMetrics();
    const recommendations: string[] = [];

    if (currentMetrics.percentage > this.criticalThreshold) {
      recommendations.push('Critical: Implement immediate memory optimization');
      recommendations.push('Consider restarting the application if memory usage persists');
      recommendations.push('Review code for memory leaks and circular references');
    } else if (currentMetrics.percentage > this.warningThreshold) {
      recommendations.push('Monitor memory usage closely');
      recommendations.push('Consider implementing lazy loading for large components');
      recommendations.push('Review and optimize database connection pooling');
    }

    const trend = this.getMemoryTrend();
    if (trend === 'increasing') {
      recommendations.push('Memory usage is trending upward - investigate potential memory leaks');
    }

    if (currentMetrics.heapUsed / currentMetrics.heapTotal > 0.8) {
      recommendations.push('Heap usage is high - consider optimizing object creation and cleanup');
    }

    return recommendations;
  }

  optimizeNow(): MemoryOptimization[] {
    const currentMetrics = this.getCurrentMemoryMetrics();
    const appliedOptimizations: MemoryOptimization[] = [];

    if (currentMetrics.percentage > this.warningThreshold) {
      this.forceGarbageCollection();
      appliedOptimizations.push({
        type: 'gc-force',
        description: 'Manual garbage collection triggered',
        impact: 'high',
        appliedAt: new Date()
      });

      this.clearExpiredCaches();
      appliedOptimizations.push({
        type: 'cache-clear',
        description: 'Cleared expired cache entries',
        impact: 'medium',
        appliedAt: new Date()
      });
    }

    this.optimizations.push(...appliedOptimizations);
    return appliedOptimizations;
  }

  cleanup(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
  }
}

export const memoryOptimizer = new MemoryOptimizer();