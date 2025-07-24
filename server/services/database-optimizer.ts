import { performance } from 'perf_hooks';

interface QueryPerformance {
  query: string;
  executionTime: number;
  timestamp: Date;
  params?: any[];
  rowsAffected?: number;
}

interface IndexRecommendation {
  table: string;
  columns: string[];
  reason: string;
  estimatedImprovement: string;
  priority: 'high' | 'medium' | 'low';
}

interface DatabaseStats {
  totalQueries: number;
  slowQueries: number;
  averageQueryTime: number;
  cacheHitRate: number;
  connectionPoolUsage: number;
  activeConnections: number;
}

class DatabaseOptimizer {
  private queryHistory: QueryPerformance[] = [];
  private slowQueryThreshold = 100; // 100ms
  private connectionStats = {
    totalConnections: 0,
    activeConnections: 0,
    poolSize: 10
  };

  // Query performance monitoring
  trackQuery(query: string, executionTime: number, params?: any[], rowsAffected?: number): void {
    const queryPerf: QueryPerformance = {
      query: this.normalizeQuery(query),
      executionTime,
      timestamp: new Date(),
      params,
      rowsAffected
    };

    this.queryHistory.push(queryPerf);
    
    // Keep only last 1000 queries to prevent memory issues
    if (this.queryHistory.length > 1000) {
      this.queryHistory = this.queryHistory.slice(-1000);
    }

    // Log slow queries
    if (executionTime > this.slowQueryThreshold) {
      console.log(`🐌 SLOW QUERY WARNING: ${executionTime.toFixed(2)}ms - ${query.substring(0, 100)}...`);
    }
  }

  // Normalize query for analysis (remove specific values)
  private normalizeQuery(query: string): string {
    return query
      .replace(/\$\d+/g, '$?') // Replace parameterized queries
      .replace(/\d+/g, '?') // Replace numbers
      .replace(/'[^']*'/g, "'?'") // Replace string literals
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();
  }

  // Get database performance statistics
  getStats(): DatabaseStats {
    const now = Date.now();
    const last24Hours = this.queryHistory.filter(q => 
      now - q.timestamp.getTime() < 24 * 60 * 60 * 1000
    );

    const slowQueries = last24Hours.filter(q => q.executionTime > this.slowQueryThreshold);
    const avgTime = last24Hours.length > 0 
      ? last24Hours.reduce((sum, q) => sum + q.executionTime, 0) / last24Hours.length
      : 0;

    return {
      totalQueries: last24Hours.length,
      slowQueries: slowQueries.length,
      averageQueryTime: Math.round(avgTime * 100) / 100,
      cacheHitRate: this.calculateCacheHitRate(),
      connectionPoolUsage: (this.connectionStats.activeConnections / this.connectionStats.poolSize) * 100,
      activeConnections: this.connectionStats.activeConnections
    };
  }

  // Calculate cache hit rate (simulated for now)
  private calculateCacheHitRate(): number {
    // In a real implementation, this would track actual cache hits
    // For now, returning a simulated value based on query patterns
    const uniqueQueries = new Set(this.queryHistory.map(q => q.query));
    const totalQueries = this.queryHistory.length;
    
    if (totalQueries === 0) return 0;
    
    // Simple heuristic: more repeated queries = higher cache hit rate
    const repetitionRate = (totalQueries - uniqueQueries.size) / totalQueries;
    return Math.round(repetitionRate * 100);
  }

  // Get index recommendations based on query patterns
  getIndexRecommendations(): IndexRecommendation[] {
    const recommendations: IndexRecommendation[] = [];
    const queryPatterns = this.analyzeQueryPatterns();

    // Analyze slow queries for index opportunities
    const slowQueries = this.queryHistory
      .filter(q => q.executionTime > this.slowQueryThreshold)
      .map(q => q.query);

    // Common patterns that benefit from indexes
    const patterns = [
      {
        pattern: /WHERE\s+(\w+)\s*=/i,
        reason: 'Equality lookups are frequent',
        priority: 'high' as const
      },
      {
        pattern: /ORDER BY\s+(\w+)/i,
        reason: 'Sorting operations can be optimized',
        priority: 'medium' as const
      },
      {
        pattern: /JOIN\s+\w+\s+ON\s+.*?(\w+)\s*=/i,
        reason: 'Join operations would benefit from indexing',
        priority: 'high' as const
      }
    ];

    for (const slowQuery of slowQueries) {
      for (const pattern of patterns) {
        const match = slowQuery.match(pattern.pattern);
        if (match && match[1]) {
          // Extract table name (simplified)
          const tableMatch = slowQuery.match(/FROM\s+(\w+)/i);
          const table = tableMatch ? tableMatch[1] : 'unknown_table';
          
          recommendations.push({
            table,
            columns: [match[1]],
            reason: pattern.reason,
            estimatedImprovement: this.estimateImprovement(pattern.priority),
            priority: pattern.priority
          });
        }
      }
    }

    // Remove duplicates
    return recommendations.filter((rec, index, arr) => 
      arr.findIndex(r => r.table === rec.table && r.columns.join(',') === rec.columns.join(',')) === index
    );
  }

  // Estimate performance improvement from optimization
  private estimateImprovement(priority: 'high' | 'medium' | 'low'): string {
    switch (priority) {
      case 'high': return '50-80% faster queries';
      case 'medium': return '20-50% faster queries';
      case 'low': return '10-20% faster queries';
    }
  }

  // Analyze query patterns for optimization opportunities
  private analyzeQueryPatterns(): any {
    const patterns = {
      selectQueries: 0,
      insertQueries: 0,
      updateQueries: 0,
      deleteQueries: 0,
      joinQueries: 0,
      aggregateQueries: 0
    };

    this.queryHistory.forEach(q => {
      const query = q.query.toUpperCase();
      if (query.startsWith('SELECT')) patterns.selectQueries++;
      if (query.startsWith('INSERT')) patterns.insertQueries++;
      if (query.startsWith('UPDATE')) patterns.updateQueries++;
      if (query.startsWith('DELETE')) patterns.deleteQueries++;
      if (query.includes('JOIN')) patterns.joinQueries++;
      if (query.includes('COUNT') || query.includes('SUM') || query.includes('AVG')) {
        patterns.aggregateQueries++;
      }
    });

    return patterns;
  }

  // Get optimization recommendations
  getOptimizationRecommendations(): string[] {
    const recommendations: string[] = [];
    const stats = this.getStats();

    // Check slow query rate
    if (stats.slowQueries > stats.totalQueries * 0.1) {
      recommendations.push('High slow query rate detected - consider adding database indexes');
    }

    // Check average query time
    if (stats.averageQueryTime > 50) {
      recommendations.push('High average query time - review and optimize frequent queries');
    }

    // Check connection pool usage
    if (stats.connectionPoolUsage > 80) {
      recommendations.push('High connection pool usage - consider increasing pool size');
    }

    // Check cache hit rate
    if (stats.cacheHitRate < 70) {
      recommendations.push('Low cache hit rate - implement query result caching');
    }

    // Analyze query patterns
    const patterns = this.analyzeQueryPatterns();
    if (patterns.joinQueries > patterns.selectQueries * 0.3) {
      recommendations.push('High join query ratio - ensure proper indexes on join columns');
    }

    if (patterns.aggregateQueries > patterns.selectQueries * 0.2) {
      recommendations.push('Frequent aggregate queries - consider materialized views or pre-computed summaries');
    }

    return recommendations;
  }

  // Connection tracking
  trackConnection(action: 'open' | 'close'): void {
    if (action === 'open') {
      this.connectionStats.totalConnections++;
      this.connectionStats.activeConnections++;
    } else {
      this.connectionStats.activeConnections = Math.max(0, this.connectionStats.activeConnections - 1);
    }
  }

  // Middleware for database query monitoring
  queryMiddleware() {
    const optimizer = this;
    
    return function trackQueryPerformance(originalQuery: Function) {
      return async function(this: any, ...args: any[]) {
        const startTime = performance.now();
        
        try {
          const result = await originalQuery.apply(this, args);
          const endTime = performance.now();
          const executionTime = endTime - startTime;
          
          // Extract query info from args
          const query = args[0]?.sql || args[0] || 'Unknown query';
          const params = args[0]?.params || args.slice(1);
          
          optimizer.trackQuery(query, executionTime, params);
          
          return result;
        } catch (error) {
          const endTime = performance.now();
          const executionTime = endTime - startTime;
          
          optimizer.trackQuery('ERROR: ' + (args[0] || 'Unknown'), executionTime);
          throw error;
        }
      };
    };
  }

  // Clean up old query history
  cleanup(): void {
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const initialLength = this.queryHistory.length;
    
    this.queryHistory = this.queryHistory.filter(q => q.timestamp > oneWeekAgo);
    
    const cleaned = initialLength - this.queryHistory.length;
    if (cleaned > 0) {
      console.log(`🧹 Database optimizer: Cleaned ${cleaned} old query records`);
    }
  }

  // Generate SQL for creating recommended indexes
  generateIndexSQL(): string[] {
    const recommendations = this.getIndexRecommendations();
    const sqlStatements: string[] = [];

    recommendations.forEach((rec, index) => {
      const indexName = `idx_${rec.table}_${rec.columns.join('_')}`;
      const sql = `CREATE INDEX ${indexName} ON ${rec.table} (${rec.columns.join(', ')});`;
      sqlStatements.push(`-- ${rec.reason} (${rec.estimatedImprovement})`);
      sqlStatements.push(sql);
      sqlStatements.push('');
    });

    return sqlStatements;
  }
}

// Create global database optimizer instance
export const databaseOptimizer = new DatabaseOptimizer();

export default databaseOptimizer;