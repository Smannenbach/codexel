import { performance } from 'perf_hooks';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
  hits: number;
  size: number;
}

interface CacheStats {
  totalEntries: number;
  totalHits: number;
  totalMisses: number;
  hitRate: number;
  memoryUsage: number;
  oldestEntry: number;
  newestEntry: number;
}

class CachingService {
  private cache = new Map<string, CacheEntry<any>>();
  private maxSize: number;
  private defaultTTL: number;
  private stats = {
    hits: 0,
    misses: 0,
    sets: 0,
    deletes: 0
  };

  constructor(maxSize: number = 1000, defaultTTL: number = 300000) { // 5 minutes default
    this.maxSize = maxSize;
    this.defaultTTL = defaultTTL;
    
    // Cleanup expired entries every minute
    setInterval(() => this.cleanup(), 60000);
  }

  // Set cache entry with automatic expiration
  set<T>(key: string, data: T, ttl?: number): void {
    const now = Date.now();
    const entryTTL = ttl || this.defaultTTL;
    
    // Calculate approximate memory size
    const size = this.calculateSize(data);
    
    const entry: CacheEntry<T> = {
      data,
      timestamp: now,
      ttl: entryTTL,
      hits: 0,
      size
    };

    // If cache is full, remove least recently used entries
    if (this.cache.size >= this.maxSize) {
      this.evictLRU();
    }

    this.cache.set(key, entry);
    this.stats.sets++;
  }

  // Get cache entry if not expired
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      this.stats.misses++;
      return null;
    }

    const now = Date.now();
    
    // Check if expired
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      this.stats.misses++;
      this.stats.deletes++;
      return null;
    }

    // Update hit count and return data
    entry.hits++;
    this.stats.hits++;
    return entry.data;
  }

  // Check if key exists and is not expired
  has(key: string): boolean {
    return this.get(key) !== null;
  }

  // Delete specific entry
  delete(key: string): boolean {
    const deleted = this.cache.delete(key);
    if (deleted) {
      this.stats.deletes++;
    }
    return deleted;
  }

  // Clear all cache entries
  clear(): void {
    const entriesCleared = this.cache.size;
    this.cache.clear();
    this.stats.deletes += entriesCleared;
  }

  // Get cache statistics
  getStats(): CacheStats {
    const entries = Array.from(this.cache.values());
    const totalMemory = entries.reduce((sum, entry) => sum + entry.size, 0);
    const timestamps = entries.map(entry => entry.timestamp);
    
    return {
      totalEntries: this.cache.size,
      totalHits: this.stats.hits,
      totalMisses: this.stats.misses,
      hitRate: this.stats.hits + this.stats.misses > 0 
        ? (this.stats.hits / (this.stats.hits + this.stats.misses)) * 100 
        : 0,
      memoryUsage: totalMemory,
      oldestEntry: timestamps.length > 0 ? Math.min(...timestamps) : 0,
      newestEntry: timestamps.length > 0 ? Math.max(...timestamps) : 0
    };
  }

  // Get cache entry info for debugging
  getEntryInfo(key: string): any {
    const entry = this.cache.get(key);
    if (!entry) return null;
    
    return {
      key,
      timestamp: entry.timestamp,
      ttl: entry.ttl,
      hits: entry.hits,
      size: entry.size,
      age: Date.now() - entry.timestamp,
      expired: Date.now() - entry.timestamp > entry.ttl
    };
  }

  // Middleware for Express routes
  middleware(ttl?: number) {
    return (req: any, res: any, next: any) => {
      // Only cache GET requests
      if (req.method !== 'GET') {
        return next();
      }

      const cacheKey = this.generateCacheKey(req);
      const cachedResponse = this.get(cacheKey);

      if (cachedResponse) {
        res.set('X-Cache', 'HIT');
        res.set('X-Cache-Key', cacheKey);
        return res.json(cachedResponse);
      }

      // Override res.json to cache the response
      const originalJson = res.json.bind(res);
      res.json = function(data: any) {
        // Only cache successful responses
        if (res.statusCode >= 200 && res.statusCode < 300) {
          cachingService.set(cacheKey, data, ttl);
        }
        res.set('X-Cache', 'MISS');
        res.set('X-Cache-Key', cacheKey);
        return originalJson(data);
      };

      next();
    };
  }

  // Generate cache key from request
  private generateCacheKey(req: any): string {
    const { method, originalUrl, query, headers } = req;
    
    // Include relevant headers that might affect response
    const relevantHeaders = {
      'accept': headers.accept,
      'authorization': headers.authorization ? 'auth-present' : 'no-auth'
    };

    return `${method}:${originalUrl}:${JSON.stringify(query)}:${JSON.stringify(relevantHeaders)}`;
  }

  // Calculate approximate memory size of data
  private calculateSize(data: any): number {
    try {
      return JSON.stringify(data).length * 2; // Rough estimate (2 bytes per char)
    } catch {
      return 1000; // Default size if serialization fails
    }
  }

  // Remove least recently used entries
  private evictLRU(): void {
    if (this.cache.size === 0) return;

    let oldestKey: string | null = null;
    let oldestTimestamp = Infinity;

    const cacheEntries = Array.from(this.cache.entries());
    for (const [key, entry] of cacheEntries) {
      const lastAccessed = entry.timestamp + (entry.hits * 1000); // Factor in usage
      if (lastAccessed < oldestTimestamp) {
        oldestTimestamp = lastAccessed;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
      this.stats.deletes++;
    }
  }

  // Cleanup expired entries
  private cleanup(): void {
    const now = Date.now();
    let expiredCount = 0;

    const cacheEntries = Array.from(this.cache.entries());
    for (const [key, entry] of cacheEntries) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
        expiredCount++;
      }
    }

    if (expiredCount > 0) {
      this.stats.deletes += expiredCount;
      console.log(`🧹 Cache cleanup: Removed ${expiredCount} expired entries`);
    }
  }

  // Cache optimization based on usage patterns
  optimizeCache(): string[] {
    const optimizations: string[] = [];
    const stats = this.getStats();

    // If hit rate is low, suggest increasing TTL
    if (stats.hitRate < 30 && stats.totalEntries > 10) {
      optimizations.push('Low hit rate detected - consider increasing TTL for frequently accessed data');
    }

    // If cache is near capacity, suggest increasing size
    if (stats.totalEntries > this.maxSize * 0.9) {
      optimizations.push('Cache nearing capacity - consider increasing max size');
    }

    // If memory usage is high, suggest reducing TTL
    if (stats.memoryUsage > 10 * 1024 * 1024) { // 10MB
      optimizations.push('High memory usage - consider reducing TTL or cache size');
    }

    return optimizations;
  }
}

// Create global caching service instance
export const cachingService = new CachingService(2000, 600000); // 2000 entries, 10 min TTL

// Specialized caching for different data types
export class SpecializedCaches {
  // API response cache (short TTL)
  static api = new CachingService(500, 300000); // 5 minutes
  
  // Database query cache (medium TTL)  
  static database = new CachingService(1000, 900000); // 15 minutes
  
  // Static asset cache (long TTL)
  static assets = new CachingService(200, 3600000); // 1 hour
  
  // User session cache (short TTL)
  static sessions = new CachingService(1000, 1800000); // 30 minutes
}

export default cachingService;