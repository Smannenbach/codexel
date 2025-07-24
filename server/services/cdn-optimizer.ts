import { Request, Response, NextFunction } from 'express';
import { createHash } from 'crypto';
import path from 'path';

interface CDNConfig {
  enabled: boolean;
  baseUrl?: string;
  regions: string[];
  compressionEnabled: boolean;
  cacheMaxAge: number;
}

interface AssetInfo {
  path: string;
  size: number;
  mimeType: string;
  etag: string;
  lastModified: Date;
  compressed: boolean;
}

class CDNOptimizer {
  private config: CDNConfig;
  private assetCache = new Map<string, AssetInfo>();
  private compressionRatio = new Map<string, number>();

  constructor(config: CDNConfig) {
    this.config = config;
  }

  // Middleware for static asset optimization
  optimizeStaticAssets() {
    return (req: Request, res: Response, next: NextFunction) => {
      const filePath = req.path;
      
      // Only optimize static assets
      if (!this.isStaticAsset(filePath)) {
        return next();
      }

      // Set caching headers
      this.setCacheHeaders(res, filePath);
      
      // Set compression headers
      this.setCompressionHeaders(res, filePath);
      
      // Set CDN headers
      this.setCDNHeaders(res, filePath);

      next();
    };
  }

  // Check if file is a static asset
  private isStaticAsset(filePath: string): boolean {
    const staticExtensions = [
      '.js', '.css', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico',
      '.woff', '.woff2', '.ttf', '.eot', '.mp4', '.webm', '.pdf'
    ];
    
    const ext = path.extname(filePath).toLowerCase();
    return staticExtensions.includes(ext);
  }

  // Set appropriate cache headers
  private setCacheHeaders(res: Response, filePath: string): void {
    const ext = path.extname(filePath).toLowerCase();
    let maxAge = this.config.cacheMaxAge;

    // Different cache durations for different asset types
    switch (ext) {
      case '.js':
      case '.css':
        maxAge = 31536000; // 1 year for JS/CSS (with versioning)
        break;
      case '.png':
      case '.jpg':
      case '.jpeg':
      case '.gif':
      case '.svg':
      case '.ico':
        maxAge = 2592000; // 30 days for images
        break;
      case '.woff':
      case '.woff2':
      case '.ttf':
      case '.eot':
        maxAge = 31536000; // 1 year for fonts
        break;
      default:
        maxAge = 86400; // 1 day for other assets
    }

    res.set({
      'Cache-Control': `public, max-age=${maxAge}, immutable`,
      'X-CDN-Cache': 'enabled',
      'Vary': 'Accept-Encoding'
    });
  }

  // Set compression headers
  private setCompressionHeaders(res: Response, filePath: string): void {
    if (!this.config.compressionEnabled) return;

    const ext = path.extname(filePath).toLowerCase();
    const compressibleTypes = ['.js', '.css', '.html', '.json', '.xml', '.svg'];

    if (compressibleTypes.includes(ext)) {
      res.set({
        'X-Compression': 'enabled',
        'Content-Encoding': 'gzip'
      });
    }
  }

  // Set CDN-specific headers
  private setCDNHeaders(res: Response, filePath: string): void {
    if (!this.config.enabled || !this.config.baseUrl) return;

    const assetUrl = `${this.config.baseUrl}${filePath}`;
    
    res.set({
      'X-CDN-URL': assetUrl,
      'X-CDN-Regions': this.config.regions.join(','),
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
      'Access-Control-Allow-Headers': 'Range'
    });
  }

  // Generate optimized URLs for static assets
  generateAssetURL(assetPath: string): string {
    if (!this.config.enabled || !this.config.baseUrl) {
      return assetPath;
    }

    // Add version hash for cache busting
    const hash = this.generateAssetHash(assetPath);
    const ext = path.extname(assetPath);
    const name = path.basename(assetPath, ext);
    const dir = path.dirname(assetPath);
    
    return `${this.config.baseUrl}${dir}/${name}.${hash}${ext}`;
  }

  // Generate hash for asset versioning
  private generateAssetHash(assetPath: string): string {
    // In production, this would hash the actual file content
    // For now, using a simple hash of the path and timestamp
    const content = assetPath + Date.now().toString();
    return createHash('md5').update(content).digest('hex').substring(0, 8);
  }

  // Preload critical assets
  generatePreloadHeaders(criticalAssets: string[]): string[] {
    const preloadHeaders: string[] = [];

    for (const asset of criticalAssets) {
      const assetUrl = this.generateAssetURL(asset);
      const asType = this.getAssetType(asset);
      
      preloadHeaders.push(`<${assetUrl}>; rel=preload; as=${asType}`);
    }

    return preloadHeaders;
  }

  // Get asset type for preload headers
  private getAssetType(assetPath: string): string {
    const ext = path.extname(assetPath).toLowerCase();
    
    switch (ext) {
      case '.js': return 'script';
      case '.css': return 'style';
      case '.woff':
      case '.woff2': return 'font';
      case '.png':
      case '.jpg':
      case '.jpeg':
      case '.gif':
      case '.svg': return 'image';
      default: return 'fetch';
    }
  }

  // Image optimization suggestions
  getImageOptimizations(imagePath: string): string[] {
    const optimizations: string[] = [];
    const ext = path.extname(imagePath).toLowerCase();

    if (['.png', '.jpg', '.jpeg'].includes(ext)) {
      optimizations.push('Consider using WebP format for better compression');
      optimizations.push('Implement responsive images with different sizes');
      optimizations.push('Add lazy loading for below-the-fold images');
    }

    if (ext === '.svg') {
      optimizations.push('Minify SVG files to reduce size');
      optimizations.push('Consider inlining small SVGs to reduce HTTP requests');
    }

    return optimizations;
  }

  // CDN performance analytics
  getPerformanceStats(): any {
    return {
      enabled: this.config.enabled,
      regions: this.config.regions,
      cachedAssets: this.assetCache.size,
      compressionEnabled: this.config.compressionEnabled,
      averageCompressionRatio: this.calculateAverageCompression(),
      recommendations: this.getOptimizationRecommendations()
    };
  }

  // Calculate average compression ratio
  private calculateAverageCompression(): number {
    if (this.compressionRatio.size === 0) return 0;
    
    const ratios = Array.from(this.compressionRatio.values());
    return ratios.reduce((sum, ratio) => sum + ratio, 0) / ratios.length;
  }

  // Get optimization recommendations
  private getOptimizationRecommendations(): string[] {
    const recommendations: string[] = [];

    if (!this.config.enabled) {
      recommendations.push('Enable CDN for improved global performance');
    }

    if (!this.config.compressionEnabled) {
      recommendations.push('Enable compression to reduce bandwidth usage');
    }

    if (this.config.regions.length < 3) {
      recommendations.push('Add more CDN regions for better global coverage');
    }

    const avgCompression = this.calculateAverageCompression();
    if (avgCompression < 0.7 && this.compressionRatio.size > 0) {
      recommendations.push('Optimize assets further - compression ratio could be improved');
    }

    return recommendations;
  }

  // Update configuration
  updateConfig(newConfig: Partial<CDNConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }
}

// Default CDN configuration
const defaultConfig: CDNConfig = {
  enabled: true,
  baseUrl: process.env.CDN_BASE_URL,
  regions: ['us-east-1', 'eu-west-1', 'ap-southeast-1'],
  compressionEnabled: true,
  cacheMaxAge: 86400 // 24 hours
};

export const cdnOptimizer = new CDNOptimizer(defaultConfig);

// Express middleware function
export const cdnMiddleware = cdnOptimizer.optimizeStaticAssets();

export default cdnOptimizer;