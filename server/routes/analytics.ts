import { Router } from 'express';
import { createAnalyticsTracker } from '../services/analytics';
import { db } from '../db';
import { workspaceAnalytics, layoutRecommendations } from '@shared/schema';
import { eq, desc, and } from 'drizzle-orm';
import { z } from 'zod';
import { isAuthenticated } from '../auth';

const router = Router();
const analyticsTrackers = new Map<string, ReturnType<typeof createAnalyticsTracker>>();

// Get or create analytics tracker for a user/project
const getTracker = (userId: string, projectId: number) => {
  const key = `${userId}_${projectId}`;
  if (!analyticsTrackers.has(key)) {
    analyticsTrackers.set(key, createAnalyticsTracker(userId, projectId));
  }
  return analyticsTrackers.get(key)!;
};

// Track workspace events
router.post('/api/analytics/track', isAuthenticated, async (req, res) => {
  try {
    const trackSchema = z.object({
      projectId: z.number(),
      event: z.enum(['layout_change', 'message_sent', 'panel_focus']),
      data: z.record(z.any()),
    });

    const { projectId, event, data } = trackSchema.parse(req.body);
    const userId = req.user!.id; 
    const tracker = getTracker(userId, projectId);

    switch (event) {
      case 'layout_change':
        await tracker.trackLayoutChange(data.configuration, data.panelSizes);
        break;
      case 'message_sent':
        await tracker.trackMessage(data.model);
        break;
      case 'panel_focus':
        await tracker.trackPanelFocus(data.panelName, data.duration);
        break;
    }

    res.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Invalid tracking data', details: error.errors });
    } else {
      console.error('Analytics tracking error:', error);
      res.status(500).json({ error: 'Failed to track analytics' });
    }
  }
});

// Get productivity stats
router.get('/api/analytics/stats/:projectId', isAuthenticated, async (req, res) => {
  try {
    const projectId = parseInt(req.params.projectId);
    const userId = req.user!.id;
    
    const tracker = getTracker(userId, projectId);
    const stats = await tracker.getProductivityStats();
    
    res.json(stats);
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Failed to fetch productivity stats' });
  }
});

// Get layout recommendations
router.get('/api/analytics/recommendations', isAuthenticated, async (req, res) => {
  try {
    const userId = req.user!.id;
    
    const recommendations = await db.select()
      .from(layoutRecommendations)
      .where(eq(layoutRecommendations.userId, userId))
      .orderBy(desc(layoutRecommendations.createdAt))
      .limit(5);
    
    res.json(recommendations);
  } catch (error) {
    console.error('Get recommendations error:', error);
    res.status(500).json({ error: 'Failed to fetch recommendations' });
  }
});

// Generate new recommendations
router.post('/api/analytics/recommendations/generate', isAuthenticated, async (req, res) => {
  try {
    const { projectId } = z.object({ projectId: z.number() }).parse(req.body);
    const userId = req.user!.id;
    const tracker = getTracker(userId, projectId);
    
    const recommendations = await tracker.generateRecommendations();
    res.json(recommendations);
  } catch (error) {
    console.error('Generate recommendations error:', error);
    res.status(500).json({ error: 'Failed to generate recommendations' });
  }
});

// Accept a recommendation
router.post('/api/analytics/recommendations/:id/accept', isAuthenticated, async (req, res) => {
  try {
    const recommendationId = parseInt(req.params.id);
    const userId = req.user!.id;
    
    await db.update(layoutRecommendations)
      .set({ accepted: true })
      .where(and(eq(layoutRecommendations.id, recommendationId), eq(layoutRecommendations.userId, userId)));
    
    res.json({ success: true });
  } catch (error) {
    console.error('Accept recommendation error:', error);
    res.status(500).json({ error: 'Failed to accept recommendation' });
  }
});

// Get analytics summary
router.get('/api/analytics/summary', isAuthenticated, async (req, res) => {
  try {
    const userId = req.user!.id;
    
    const analytics = await db.select()
      .from(workspaceAnalytics)
      .where(eq(workspaceAnalytics.userId, userId))
      .orderBy(desc(workspaceAnalytics.createdAt))
      .limit(100);
    
    const summary = {
      totalSessions: analytics.length,
      totalActiveTime: analytics.reduce((sum, a) => sum + a.totalActiveTime, 0),
      totalMessages: analytics.reduce((sum, a) => sum + a.messagesSent, 0),
      mostUsedPanels: {} as Record<string, number>,
      preferredModels: {} as Record<string, number>,
    };
    
    // Aggregate panel usage
    analytics.forEach(a => {
      if (a.mostUsedPanel) {
        summary.mostUsedPanels[a.mostUsedPanel] = 
          (summary.mostUsedPanels[a.mostUsedPanel] || 0) + 1;
      }
      
      // Aggregate model usage
      const modelUsage = a.preferredModelUsage as Record<string, number>;
      Object.entries(modelUsage).forEach(([model, count]) => {
        summary.preferredModels[model] = 
          (summary.preferredModels[model] || 0) + count;
      });
    });
    
    res.json(summary);
  } catch (error) {
    console.error('Get analytics summary error:', error);
    res.status(500).json({ error: 'Failed to fetch analytics summary' });
  }
});

export default router;
