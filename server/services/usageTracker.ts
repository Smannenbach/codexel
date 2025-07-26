import { storage } from '../storage';
import type { InsertAiUsage, InsertUsageStats } from '@shared/schema';

export class UsageTracker {
  private sessionUsage = new Map<string, {
    aiCalls: number;
    tokensUsed: number;
    workspaceMinutes: number;
    featuresUsed: Set<string>;
    startTime: Date;
  }>();

  // Track AI usage
  async trackAiUsage(userId: string, usage: {
    model: string;
    feature: string;
    inputTokens: number;
    outputTokens: number;
    cost: number;
    projectId?: number;
    sessionId?: string;
    metadata?: any;
  }): Promise<void> {
    try {
      // Record detailed AI usage
      await storage.trackAiUsage({
        userId,
        projectId: usage.projectId,
        model: usage.model,
        feature: usage.feature,
        inputTokens: usage.inputTokens,
        outputTokens: usage.outputTokens,
        cost: Math.round(usage.cost * 100), // Convert to cents
        sessionId: usage.sessionId,
        metadata: usage.metadata
      });

      // Update user's quota
      const totalTokens = usage.inputTokens + usage.outputTokens;
      await storage.updateUserUsage(userId, {
        aiCalls: 1, // Increment by 1
        workspaceHours: 0, // No change for AI calls
        storageGB: 0, // No change for AI calls
        projectCount: 0, // No change for AI calls
        resetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      });

      // Update session tracking
      const sessionKey = usage.sessionId || `${userId}-${Date.now()}`;
      if (!this.sessionUsage.has(sessionKey)) {
        this.sessionUsage.set(sessionKey, {
          aiCalls: 0,
          tokensUsed: 0,
          workspaceMinutes: 0,
          featuresUsed: new Set(),
          startTime: new Date()
        });
      }

      const session = this.sessionUsage.get(sessionKey)!;
      session.aiCalls += 1;
      session.tokensUsed += totalTokens;
      session.featuresUsed.add(usage.feature);

    } catch (error) {
      console.error('Failed to track AI usage:', error);
    }
  }

  // Track workspace session time
  async trackWorkspaceTime(userId: string, sessionId: string, minutes: number): Promise<void> {
    try {
      await storage.updateUserUsage(userId, {
        workspaceHours: minutes / 60,
        aiCalls: 0,
        storageGB: 0,
        projectCount: 0,
        resetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      });

      // Update session tracking
      if (this.sessionUsage.has(sessionId)) {
        this.sessionUsage.get(sessionId)!.workspaceMinutes += minutes;
      }
    } catch (error) {
      console.error('Failed to track workspace time:', error);
    }
  }

  // Track project creation
  async trackProjectCreation(userId: string): Promise<void> {
    try {
      await storage.updateUserUsage(userId, {
        projectCount: 1,
        aiCalls: 0,
        storageGB: 0,
        workspaceHours: 0,
        resetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      });
    } catch (error) {
      console.error('Failed to track project creation:', error);
    }
  }

  // Track storage usage
  async trackStorageUsage(userId: string, additionalMB: number): Promise<void> {
    try {
      await storage.updateUserUsage(userId, {
        storageGB: additionalMB / 1024,
        aiCalls: 0,
        workspaceHours: 0,
        projectCount: 0,
        resetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      });
    } catch (error) {
      console.error('Failed to track storage usage:', error);
    }
  }

  // Generate daily usage statistics
  async generateDailyStats(userId: string): Promise<void> {
    try {
      const today = new Date();
      const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000);

      // Aggregate session data
      const sessions = Array.from(this.sessionUsage.entries()).filter(([key]) => key.startsWith(userId));
      const dailyMetrics = sessions.reduce((acc, [_, session]) => {
        acc.aiCalls += session.aiCalls;
        acc.tokensUsed += session.tokensUsed;
        acc.workspaceMinutes += session.workspaceMinutes;
        session.featuresUsed.forEach(feature => acc.featuresUsed.add(feature));
        return acc;
      }, {
        aiCalls: 0,
        tokensUsed: 0,
        workspaceMinutes: 0,
        projectsCreated: 0,
        filesUploaded: 0,
        storageUsedMB: 0,
        featuresUsed: new Set<string>(),
        topModels: [] as Array<{ model: string; count: number }>
      });

      await storage.createUsageStats({
        userId,
        period: 'daily',
        periodStart: startOfDay,
        periodEnd: endOfDay,
        metrics: {
          aiCalls: dailyMetrics.aiCalls,
          tokensUsed: dailyMetrics.tokensUsed,
          workspaceMinutes: dailyMetrics.workspaceMinutes,
          projectsCreated: dailyMetrics.projectsCreated,
          filesUploaded: dailyMetrics.filesUploaded,
          storageUsedMB: dailyMetrics.storageUsedMB,
          featuresUsed: Array.from(dailyMetrics.featuresUsed),
          topModels: dailyMetrics.topModels
        }
      });

      // Clean up old session data
      sessions.forEach(([key]) => this.sessionUsage.delete(key));

    } catch (error) {
      console.error('Failed to generate daily stats:', error);
    }
  }

  // Get current session usage
  getSessionUsage(sessionId: string) {
    return this.sessionUsage.get(sessionId);
  }

  // Clean up old sessions (run periodically)
  cleanupOldSessions(): void {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    for (const [key, session] of this.sessionUsage.entries()) {
      if (session.startTime < oneDayAgo) {
        this.sessionUsage.delete(key);
      }
    }
  }
}

export const usageTracker = new UsageTracker();

// Clean up old sessions every hour
setInterval(() => {
  usageTracker.cleanupOldSessions();
}, 60 * 60 * 1000);