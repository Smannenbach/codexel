import type { Express } from "express";
import { z } from "zod";

interface OnboardingProgress {
  userId: string;
  step: number;
  completed: boolean;
  profile: {
    name: string;
    role: string;
    experience: string;
    goals: string[];
    industry: string;
  };
  completedAt?: string;
}

class OnboardingService {
  private progress: Map<string, OnboardingProgress> = new Map();

  async saveProgress(userId: string, data: Partial<OnboardingProgress>): Promise<void> {
    const existing = this.progress.get(userId) || {
      userId,
      step: 0,
      completed: false,
      profile: { name: '', role: '', experience: '', goals: [], industry: '' }
    };

    this.progress.set(userId, { ...existing, ...data });
  }

  async getProgress(userId: string): Promise<OnboardingProgress | null> {
    return this.progress.get(userId) || null;
  }

  async getCompletionStats(): Promise<{
    totalUsers: number;
    completed: number;
    averageCompletionTime: number;
    dropOffPoints: Array<{ step: number; dropOffs: number }>;
  }> {
    const allProgress = Array.from(this.progress.values());
    const completed = allProgress.filter(p => p.completed);
    
    return {
      totalUsers: allProgress.length,
      completed: completed.length,
      averageCompletionTime: 300, // 5 minutes average
      dropOffPoints: [
        { step: 1, dropOffs: Math.max(0, allProgress.length - allProgress.filter(p => p.step >= 1).length) },
        { step: 2, dropOffs: Math.max(0, allProgress.filter(p => p.step >= 1).length - allProgress.filter(p => p.step >= 2).length) },
        { step: 3, dropOffs: Math.max(0, allProgress.filter(p => p.step >= 2).length - allProgress.filter(p => p.step >= 3).length) }
      ]
    };
  }
}

const onboardingService = new OnboardingService();

export function registerOnboardingRoutes(app: Express) {
  
  // Save onboarding progress
  app.post('/api/onboarding/progress', async (req, res) => {
    try {
      const progressSchema = z.object({
        userId: z.string(),
        step: z.number().optional(),
        completed: z.boolean().optional(),
        profile: z.object({
          name: z.string().optional(),
          role: z.string().optional(),
          experience: z.string().optional(),
          goals: z.array(z.string()).optional(),
          industry: z.string().optional()
        }).optional(),
        completedAt: z.string().optional()
      });

      const data = progressSchema.parse(req.body);
      await onboardingService.saveProgress(data.userId, data);

      res.json({
        success: true,
        message: 'Onboarding progress saved'
      });

    } catch (error) {
      console.error('Onboarding progress error:', error);
      res.status(500).json({ 
        error: 'Failed to save onboarding progress',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Get onboarding progress
  app.get('/api/onboarding/progress/:userId', async (req, res) => {
    try {
      const progress = await onboardingService.getProgress(req.params.userId);
      
      if (!progress) {
        return res.json({ progress: null });
      }

      res.json({ progress });
    } catch (error) {
      console.error('Get onboarding progress error:', error);
      res.status(500).json({ error: 'Failed to retrieve onboarding progress' });
    }
  });

  // Check if user needs onboarding
  app.get('/api/onboarding/needs/:userId', async (req, res) => {
    try {
      const progress = await onboardingService.getProgress(req.params.userId);
      
      const needsOnboarding = !progress || !progress.completed;
      
      res.json({ 
        needsOnboarding,
        currentStep: progress?.step || 0,
        profile: progress?.profile || null
      });
    } catch (error) {
      console.error('Check onboarding needs error:', error);
      res.status(500).json({ error: 'Failed to check onboarding status' });
    }
  });

  // Get onboarding analytics
  app.get('/api/onboarding/analytics', async (req, res) => {
    try {
      const stats = await onboardingService.getCompletionStats();
      res.json(stats);
    } catch (error) {
      console.error('Onboarding analytics error:', error);
      res.status(500).json({ error: 'Failed to retrieve onboarding analytics' });
    }
  });

  // Get onboarding configuration
  app.get('/api/onboarding/config', (req, res) => {
    try {
      const config = {
        enabled: true,
        skipable: false,
        steps: [
          { id: 'welcome', title: 'Welcome', required: true },
          { id: 'profile', title: 'Profile Setup', required: true },
          { id: 'goals', title: 'Set Goals', required: false },
          { id: 'workspace', title: 'Workspace Tour', required: false },
          { id: 'first-project', title: 'First Project', required: false },
          { id: 'ai-intro', title: 'AI Introduction', required: true }
        ],
        estimatedTime: 300 // 5 minutes
      };

      res.json(config);
    } catch (error) {
      console.error('Onboarding config error:', error);
      res.status(500).json({ error: 'Failed to get onboarding configuration' });
    }
  });

  // Skip onboarding (for experienced users)
  app.post('/api/onboarding/skip/:userId', async (req, res) => {
    try {
      await onboardingService.saveProgress(req.params.userId, {
        userId: req.params.userId,
        step: 6,
        completed: true,
        completedAt: new Date().toISOString(),
        profile: {
          name: 'User',
          role: 'developer',
          experience: 'advanced',
          goals: ['business'],
          industry: 'tech'
        }
      });

      res.json({
        success: true,
        message: 'Onboarding skipped successfully'
      });

    } catch (error) {
      console.error('Skip onboarding error:', error);
      res.status(500).json({ error: 'Failed to skip onboarding' });
    }
  });
}