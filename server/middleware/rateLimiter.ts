import { Request, Response, NextFunction } from 'express';

interface RateLimitOptions {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum number of requests per window
  message?: string;
  statusCode?: number;
}

interface RequestRecord {
  count: number;
  resetTime: number;
}

// In-memory store for rate limiting (use Redis in production)
const requestStore = new Map<string, RequestRecord>();

export function createRateLimiter(options: RateLimitOptions) {
  const {
    windowMs = 15 * 60 * 1000, // 15 minutes default
    maxRequests = 100, // 100 requests default
    message = 'Too many requests, please try again later',
    statusCode = 429
  } = options;

  return (req: Request, res: Response, next: NextFunction) => {
    const clientId = getClientId(req);
    const now = Date.now();
    
    // Clean up expired entries periodically
    if (Math.random() < 0.01) { // 1% chance to clean up
      cleanupExpiredEntries(now);
    }

    const record = requestStore.get(clientId);
    
    if (!record || now > record.resetTime) {
      // Create new record or reset expired one
      requestStore.set(clientId, {
        count: 1,
        resetTime: now + windowMs
      });
      
      // Add rate limit headers
      res.set({
        'X-RateLimit-Limit': maxRequests.toString(),
        'X-RateLimit-Remaining': (maxRequests - 1).toString(),
        'X-RateLimit-Reset': Math.ceil((now + windowMs) / 1000).toString()
      });
      
      return next();
    }

    if (record.count >= maxRequests) {
      // Rate limit exceeded
      res.set({
        'X-RateLimit-Limit': maxRequests.toString(),
        'X-RateLimit-Remaining': '0',
        'X-RateLimit-Reset': Math.ceil(record.resetTime / 1000).toString(),
        'Retry-After': Math.ceil((record.resetTime - now) / 1000).toString()
      });
      
      // Log the rate limit violation
      console.warn(`Rate limit exceeded for ${clientId}. Request count: ${record.count}`);
      
      return res.status(statusCode).json({
        error: 'Rate limit exceeded',
        message,
        retryAfter: Math.ceil((record.resetTime - now) / 1000)
      });
    }

    // Increment request count
    record.count++;
    requestStore.set(clientId, record);
    
    // Add rate limit headers
    res.set({
      'X-RateLimit-Limit': maxRequests.toString(),
      'X-RateLimit-Remaining': Math.max(0, maxRequests - record.count).toString(),
      'X-RateLimit-Reset': Math.ceil(record.resetTime / 1000).toString()
    });

    next();
  };
}

function getClientId(req: Request): string {
  // Use multiple identifiers for better tracking
  const forwarded = req.headers['x-forwarded-for'] as string;
  const ip = forwarded ? forwarded.split(',')[0].trim() : req.ip || req.socket.remoteAddress || 'unknown';
  
  // Include user ID if authenticated for more granular control
  const userId = (req as any).user?.id;
  
  return userId ? `user:${userId}` : `ip:${ip}`;
}

function cleanupExpiredEntries(now: number) {
  for (const [key, record] of requestStore) {
    if (now > record.resetTime) {
      requestStore.delete(key);
    }
  }
}

// Predefined rate limiters for different endpoints
export const rateLimiters = {
  // General API rate limiter
  general: createRateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 1000, // 1000 requests per 15 minutes
    message: 'Too many requests, please slow down'
  }),
  
  // Strict rate limiter for authentication endpoints
  auth: createRateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 10, // 10 login attempts per 15 minutes
    message: 'Too many login attempts, please try again later'
  }),
  
  // AI chat rate limiter
  aiChat: createRateLimiter({
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 30, // 30 messages per minute
    message: 'Please wait before sending another message'
  }),
  
  // File upload rate limiter
  upload: createRateLimiter({
    windowMs: 5 * 60 * 1000, // 5 minutes
    maxRequests: 10, // 10 uploads per 5 minutes
    message: 'Upload limit exceeded, please wait before uploading more files'
  }),
  
  // Deployment rate limiter
  deployment: createRateLimiter({
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 5, // 5 deployments per hour
    message: 'Deployment limit exceeded, please wait before deploying again'
  })
};

// Middleware to log rate limit events for monitoring
export function rateLimitLogger(req: Request, res: Response, next: NextFunction) {
  const originalSend = res.send;
  
  res.send = function(data) {
    if (res.statusCode === 429) {
      // Log rate limit event
      console.log({
        type: 'rate_limit_exceeded',
        clientId: getClientId(req),
        path: req.path,
        method: req.method,
        timestamp: new Date().toISOString(),
        headers: {
          'x-forwarded-for': req.headers['x-forwarded-for'],
          'user-agent': req.headers['user-agent']
        }
      });
    }
    
    return originalSend.call(this, data);
  };
  
  next();
}