import { Router } from 'express';
import { z } from 'zod';

const router = Router();

const errorLogSchema = z.object({
  message: z.string(),
  stack: z.string().optional(),
  componentStack: z.string().optional(),
  timestamp: z.string(),
  userAgent: z.string().optional(),
  url: z.string().optional(),
  userId: z.string().optional(),
  projectId: z.number().optional(),
  severity: z.enum(['low', 'medium', 'high', 'critical']).optional().default('medium'),
  category: z.enum(['frontend', 'backend', 'network', 'auth', 'database']).optional().default('frontend')
});

interface ErrorLog {
  id: string;
  message: string;
  stack?: string;
  componentStack?: string;
  timestamp: string;
  userAgent?: string;
  url?: string;
  userId?: string;
  projectId?: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: 'frontend' | 'backend' | 'network' | 'auth' | 'database';
  resolved: boolean;
}

// In-memory storage for errors (use database in production)
const errorLogs: ErrorLog[] = [];

// Log client-side errors
router.post('/api/errors', async (req, res) => {
  try {
    const errorData = errorLogSchema.parse(req.body);
    
    const errorLog: ErrorLog = {
      id: Date.now().toString(),
      ...errorData,
      resolved: false
    };
    
    // Store error log
    errorLogs.unshift(errorLog); // Add to beginning
    
    // Keep only last 1000 errors to prevent memory issues
    if (errorLogs.length > 1000) {
      errorLogs.splice(1000);
    }
    
    // Log to console for development
    console.error('Client Error Logged:', {
      message: errorLog.message,
      url: errorLog.url,
      timestamp: errorLog.timestamp,
      severity: errorLog.severity
    });
    
    // Send alert for critical errors
    if (errorLog.severity === 'critical') {
      console.error('🚨 CRITICAL ERROR DETECTED:', errorLog.message);
      // In production, send to monitoring service (e.g., Sentry, DataDog)
    }
    
    res.json({ success: true, errorId: errorLog.id });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Invalid error data', details: error.errors });
    } else {
      console.error('Failed to log error:', error);
      res.status(500).json({ error: 'Failed to log error' });
    }
  }
});

// Get error logs with filtering and pagination
router.get('/api/errors', async (req, res) => {
  try {
    const {
      page = '1',
      limit = '50',
      severity,
      category,
      resolved,
      search
    } = req.query;
    
    let filteredErrors = [...errorLogs];
    
    // Apply filters
    if (severity) {
      filteredErrors = filteredErrors.filter(error => error.severity === severity);
    }
    
    if (category) {
      filteredErrors = filteredErrors.filter(error => error.category === category);
    }
    
    if (resolved !== undefined) {
      const isResolved = resolved === 'true';
      filteredErrors = filteredErrors.filter(error => error.resolved === isResolved);
    }
    
    if (search) {
      const searchTerm = (search as string).toLowerCase();
      filteredErrors = filteredErrors.filter(error => 
        error.message.toLowerCase().includes(searchTerm) ||
        error.url?.toLowerCase().includes(searchTerm)
      );
    }
    
    // Pagination
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const startIndex = (pageNum - 1) * limitNum;
    const endIndex = startIndex + limitNum;
    
    const paginatedErrors = filteredErrors.slice(startIndex, endIndex);
    
    res.json({
      errors: paginatedErrors,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: filteredErrors.length,
        pages: Math.ceil(filteredErrors.length / limitNum)
      },
      summary: {
        total: errorLogs.length,
        unresolved: errorLogs.filter(e => !e.resolved).length,
        critical: errorLogs.filter(e => e.severity === 'critical').length,
        high: errorLogs.filter(e => e.severity === 'high').length
      }
    });
  } catch (error) {
    console.error('Failed to fetch errors:', error);
    res.status(500).json({ error: 'Failed to fetch errors' });
  }
});

// Mark error as resolved
router.patch('/api/errors/:id/resolve', async (req, res) => {
  try {
    const { id } = req.params;
    const errorIndex = errorLogs.findIndex(error => error.id === id);
    
    if (errorIndex === -1) {
      return res.status(404).json({ error: 'Error not found' });
    }
    
    errorLogs[errorIndex].resolved = true;
    
    res.json({ success: true, error: errorLogs[errorIndex] });
  } catch (error) {
    console.error('Failed to resolve error:', error);
    res.status(500).json({ error: 'Failed to resolve error' });
  }
});

// Get error statistics for dashboard
router.get('/api/errors/stats', async (req, res) => {
  try {
    const now = new Date();
    const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const recent24h = errorLogs.filter(error => 
      new Date(error.timestamp) > last24Hours
    );
    
    const recentWeek = errorLogs.filter(error => 
      new Date(error.timestamp) > lastWeek
    );
    
    const stats = {
      total: errorLogs.length,
      last24Hours: recent24h.length,
      lastWeek: recentWeek.length,
      byCategory: {
        frontend: errorLogs.filter(e => e.category === 'frontend').length,
        backend: errorLogs.filter(e => e.category === 'backend').length,
        network: errorLogs.filter(e => e.category === 'network').length,
        auth: errorLogs.filter(e => e.category === 'auth').length,
        database: errorLogs.filter(e => e.category === 'database').length
      },
      bySeverity: {
        low: errorLogs.filter(e => e.severity === 'low').length,
        medium: errorLogs.filter(e => e.severity === 'medium').length,
        high: errorLogs.filter(e => e.severity === 'high').length,
        critical: errorLogs.filter(e => e.severity === 'critical').length
      },
      resolved: errorLogs.filter(e => e.resolved).length,
      unresolved: errorLogs.filter(e => !e.resolved).length
    };
    
    res.json(stats);
  } catch (error) {
    console.error('Failed to get error stats:', error);
    res.status(500).json({ error: 'Failed to get error stats' });
  }
});

export default router;