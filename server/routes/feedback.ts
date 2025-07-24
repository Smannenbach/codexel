import type { Express } from "express";
import { z } from "zod";
import { feedbackService } from "../services/feedbackService";

export function registerFeedbackRoutes(app: Express) {
  
  // Submit user feedback
  app.post('/api/feedback/submit', async (req, res) => {
    try {
      const feedbackSchema = z.object({
        userId: z.string(),
        type: z.enum(['bug', 'feature', 'improvement', 'praise']),
        category: z.enum(['ui', 'performance', 'ai', 'deployment', 'general']),
        title: z.string().min(1).max(200),
        description: z.string().min(1).max(2000),
        priority: z.enum(['low', 'medium', 'high', 'critical']).optional(),
        metadata: z.object({
          userAgent: z.string(),
          url: z.string(),
          sessionId: z.string(),
          browserInfo: z.any().optional()
        }),
        attachments: z.array(z.object({
          type: z.enum(['screenshot', 'file']),
          url: z.string(),
          filename: z.string()
        })).optional()
      });

      const feedback = feedbackSchema.parse(req.body);
      const id = await feedbackService.submitFeedback(feedback);

      res.json({
        success: true,
        feedbackId: id,
        message: 'Feedback submitted successfully'
      });

    } catch (error) {
      console.error('Feedback submission error:', error);
      res.status(500).json({ 
        error: 'Failed to submit feedback',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Get feedback by ID
  app.get('/api/feedback/:id', async (req, res) => {
    try {
      const feedback = await feedbackService.getFeedback(req.params.id);
      
      if (!feedback) {
        return res.status(404).json({ error: 'Feedback not found' });
      }

      res.json(feedback);
    } catch (error) {
      console.error('Get feedback error:', error);
      res.status(500).json({ error: 'Failed to retrieve feedback' });
    }
  });

  // Get all feedback with filters
  app.get('/api/feedback', async (req, res) => {
    try {
      const filters = {
        type: req.query.type as string,
        category: req.query.category as string,
        priority: req.query.priority as string,
        status: req.query.status as string,
        userId: req.query.userId as string
      };

      // Remove undefined filters
      Object.keys(filters).forEach(key => {
        if (!filters[key as keyof typeof filters]) {
          delete filters[key as keyof typeof filters];
        }
      });

      const feedback = await feedbackService.getAllFeedback(
        Object.keys(filters).length > 0 ? filters : undefined
      );

      res.json({ feedback });
    } catch (error) {
      console.error('Get all feedback error:', error);
      res.status(500).json({ error: 'Failed to retrieve feedback' });
    }
  });

  // Update feedback status
  app.patch('/api/feedback/:id/status', async (req, res) => {
    try {
      const statusSchema = z.object({
        status: z.enum(['new', 'reviewed', 'in_progress', 'resolved', 'closed'])
      });

      const { status } = statusSchema.parse(req.body);
      const success = await feedbackService.updateFeedbackStatus(req.params.id, status);

      if (!success) {
        return res.status(404).json({ error: 'Feedback not found' });
      }

      res.json({ 
        success: true,
        message: 'Feedback status updated successfully'
      });

    } catch (error) {
      console.error('Update feedback status error:', error);
      res.status(500).json({ error: 'Failed to update feedback status' });
    }
  });

  // Get feedback analytics
  app.get('/api/feedback/analytics/overview', async (req, res) => {
    try {
      const analytics = await feedbackService.getFeedbackAnalytics();
      res.json(analytics);
    } catch (error) {
      console.error('Feedback analytics error:', error);
      res.status(500).json({ error: 'Failed to retrieve feedback analytics' });
    }
  });

  // Submit satisfaction survey
  app.post('/api/feedback/survey', async (req, res) => {
    try {
      const surveySchema = z.object({
        userId: z.string(),
        overallSatisfaction: z.number().min(1).max(5),
        easeOfUse: z.number().min(1).max(5),
        performance: z.number().min(1).max(5),
        features: z.number().min(1).max(5),
        aiQuality: z.number().min(1).max(5),
        comments: z.string().optional()
      });

      const survey = surveySchema.parse(req.body);
      const surveyId = await feedbackService.submitSatisfactionSurvey(
        survey.userId,
        survey
      );

      res.json({
        success: true,
        surveyId,
        message: 'Survey submitted successfully'
      });

    } catch (error) {
      console.error('Survey submission error:', error);
      res.status(500).json({ error: 'Failed to submit survey' });
    }
  });

  // Quick feedback (like/dislike for specific features)
  app.post('/api/feedback/quick', async (req, res) => {
    try {
      const quickFeedbackSchema = z.object({
        userId: z.string(),
        feature: z.string(), // e.g., 'ai_chat', 'load_testing', 'deployment'
        rating: z.enum(['like', 'dislike']),
        context: z.string().optional() // Additional context
      });

      const quick = quickFeedbackSchema.parse(req.body);
      
      const feedbackId = await feedbackService.submitFeedback({
        userId: quick.userId,
        type: quick.rating === 'like' ? 'praise' : 'improvement',
        category: 'general',
        title: `Quick feedback: ${quick.feature}`,
        description: `User ${quick.rating}d ${quick.feature}. ${quick.context || ''}`,
        priority: 'low',
        metadata: {
          userAgent: req.headers['user-agent'] || 'unknown',
          url: req.headers.referer || '/unknown',
          sessionId: `quick_${Date.now()}`,
          browserInfo: { quickFeedback: true, feature: quick.feature, rating: quick.rating }
        }
      });

      res.json({
        success: true,
        feedbackId,
        message: 'Quick feedback recorded'
      });

    } catch (error) {
      console.error('Quick feedback error:', error);
      res.status(500).json({ error: 'Failed to record quick feedback' });
    }
  });

  // Feedback widget configuration
  app.get('/api/feedback/widget/config', (req, res) => {
    try {
      const config = {
        enabled: true,
        position: 'bottom-right',
        triggers: ['manual', 'timed'], // manual button, or timed popup
        timedDelay: 30000, // 30 seconds
        categories: [
          { id: 'ui', label: 'User Interface', icon: 'layout' },
          { id: 'performance', label: 'Performance', icon: 'zap' },
          { id: 'ai', label: 'AI Features', icon: 'brain' },
          { id: 'deployment', label: 'Deployment', icon: 'rocket' },
          { id: 'general', label: 'General', icon: 'message-circle' }
        ],
        types: [
          { id: 'bug', label: 'Report a Bug', icon: 'bug' },
          { id: 'feature', label: 'Request Feature', icon: 'plus' },
          { id: 'improvement', label: 'Suggest Improvement', icon: 'arrow-up' },
          { id: 'praise', label: 'Give Praise', icon: 'heart' }
        ]
      };

      res.json(config);
    } catch (error) {
      console.error('Widget config error:', error);
      res.status(500).json({ error: 'Failed to get widget configuration' });
    }
  });
}