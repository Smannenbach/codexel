interface UserFeedback {
  id: string;
  userId: string;
  type: 'bug' | 'feature' | 'improvement' | 'praise';
  category: 'ui' | 'performance' | 'ai' | 'deployment' | 'general';
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'new' | 'reviewed' | 'in_progress' | 'resolved' | 'closed';
  timestamp: Date;
  metadata: {
    userAgent: string;
    url: string;
    sessionId: string;
    browserInfo: any;
  };
  attachments?: Array<{
    type: 'screenshot' | 'file';
    url: string;
    filename: string;
  }>;
}

interface FeedbackAnalytics {
  totalFeedback: number;
  byType: Record<string, number>;
  byCategory: Record<string, number>;
  byPriority: Record<string, number>;
  satisfaction: {
    score: number;
    trend: 'up' | 'down' | 'stable';
  };
  commonIssues: Array<{
    issue: string;
    count: number;
    category: string;
  }>;
}

class FeedbackService {
  private feedback: Map<string, UserFeedback> = new Map();
  private feedbackCounter = 0;

  async submitFeedback(feedback: Omit<UserFeedback, 'id' | 'timestamp' | 'status'>): Promise<string> {
    const id = `feedback_${Date.now()}_${++this.feedbackCounter}`;
    
    const newFeedback: UserFeedback = {
      ...feedback,
      id,
      timestamp: new Date(),
      status: 'new'
    };

    this.feedback.set(id, newFeedback);

    // Auto-prioritize based on type and keywords
    this.autoPrioritize(newFeedback);

    // Trigger notifications for high/critical issues
    if (newFeedback.priority === 'high' || newFeedback.priority === 'critical') {
      await this.notifyTeam(newFeedback);
    }

    return id;
  }

  async getFeedback(id: string): Promise<UserFeedback | undefined> {
    return this.feedback.get(id);
  }

  async getAllFeedback(filters?: {
    type?: string;
    category?: string;
    priority?: string;
    status?: string;
    userId?: string;
  }): Promise<UserFeedback[]> {
    let result = Array.from(this.feedback.values());

    if (filters) {
      if (filters.type) result = result.filter(f => f.type === filters.type);
      if (filters.category) result = result.filter(f => f.category === filters.category);
      if (filters.priority) result = result.filter(f => f.priority === filters.priority);
      if (filters.status) result = result.filter(f => f.status === filters.status);
      if (filters.userId) result = result.filter(f => f.userId === filters.userId);
    }

    return result.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  async updateFeedbackStatus(id: string, status: UserFeedback['status']): Promise<boolean> {
    const feedback = this.feedback.get(id);
    if (!feedback) return false;

    feedback.status = status;
    this.feedback.set(id, feedback);
    return true;
  }

  async getFeedbackAnalytics(): Promise<FeedbackAnalytics> {
    const allFeedback = Array.from(this.feedback.values());
    
    const byType: Record<string, number> = {};
    const byCategory: Record<string, number> = {};
    const byPriority: Record<string, number> = {};

    allFeedback.forEach(feedback => {
      byType[feedback.type] = (byType[feedback.type] || 0) + 1;
      byCategory[feedback.category] = (byCategory[feedback.category] || 0) + 1;
      byPriority[feedback.priority] = (byPriority[feedback.priority] || 0) + 1;
    });

    // Calculate satisfaction score (praise vs bugs/issues)
    const praise = byType['praise'] || 0;
    const issues = (byType['bug'] || 0) + (byType['improvement'] || 0);
    const satisfactionScore = allFeedback.length > 0 
      ? Math.round((praise / (praise + issues)) * 100) || 0
      : 100;

    // Find common issues
    const commonIssues = this.findCommonIssues(allFeedback);

    return {
      totalFeedback: allFeedback.length,
      byType,
      byCategory,
      byPriority,
      satisfaction: {
        score: satisfactionScore,
        trend: this.calculateTrend()
      },
      commonIssues
    };
  }

  private autoPrioritize(feedback: UserFeedback): void {
    const criticalKeywords = ['crash', 'broken', 'error', 'not working', 'down'];
    const highKeywords = ['slow', 'bug', 'issue', 'problem'];
    
    const text = (feedback.title + ' ' + feedback.description).toLowerCase();
    
    if (feedback.type === 'bug' && criticalKeywords.some(keyword => text.includes(keyword))) {
      feedback.priority = 'critical';
    } else if (feedback.type === 'bug' || highKeywords.some(keyword => text.includes(keyword))) {
      feedback.priority = 'high';
    } else if (feedback.type === 'feature') {
      feedback.priority = 'medium';
    } else {
      feedback.priority = 'low';
    }
  }

  private async notifyTeam(feedback: UserFeedback): Promise<void> {
    // In a real implementation, this would send notifications to Slack, email, etc.
    console.log(`🚨 ${feedback.priority.toUpperCase()} FEEDBACK: ${feedback.title}`);
    console.log(`Category: ${feedback.category} | Type: ${feedback.type}`);
    console.log(`User: ${feedback.userId} | Description: ${feedback.description}`);
  }

  private findCommonIssues(feedback: UserFeedback[]): Array<{issue: string, count: number, category: string}> {
    const issueMap = new Map<string, {count: number, category: string}>();
    
    feedback.forEach(f => {
      if (f.type === 'bug' || f.type === 'improvement') {
        const key = f.title.toLowerCase();
        const existing = issueMap.get(key);
        if (existing) {
          existing.count++;
        } else {
          issueMap.set(key, {count: 1, category: f.category});
        }
      }
    });

    return Array.from(issueMap.entries())
      .map(([issue, data]) => ({issue, ...data}))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }

  private calculateTrend(): 'up' | 'down' | 'stable' {
    // Simple trend calculation based on recent feedback
    const allFeedback = Array.from(this.feedback.values());
    const recent = allFeedback.filter(f => 
      f.timestamp.getTime() > Date.now() - (7 * 24 * 60 * 60 * 1000) // Last 7 days
    );
    
    const recentPraise = recent.filter(f => f.type === 'praise').length;
    const recentIssues = recent.filter(f => f.type === 'bug').length;
    
    if (recentPraise > recentIssues) return 'up';
    if (recentIssues > recentPraise) return 'down';
    return 'stable';
  }

  // User satisfaction survey
  async submitSatisfactionSurvey(userId: string, responses: {
    overallSatisfaction: number; // 1-5
    easeOfUse: number; // 1-5
    performance: number; // 1-5
    features: number; // 1-5
    aiQuality: number; // 1-5
    comments?: string;
  }): Promise<string> {
    const surveyId = `survey_${Date.now()}_${userId}`;
    
    // Convert survey to feedback format
    const averageScore = (
      responses.overallSatisfaction + 
      responses.easeOfUse + 
      responses.performance + 
      responses.features + 
      responses.aiQuality
    ) / 5;

    const feedbackType = averageScore >= 4 ? 'praise' : averageScore >= 3 ? 'improvement' : 'bug';
    
    await this.submitFeedback({
      userId,
      type: feedbackType,
      category: 'general',
      title: `User Satisfaction Survey (${averageScore.toFixed(1)}/5)`,
      description: `Overall: ${responses.overallSatisfaction}/5, Ease: ${responses.easeOfUse}/5, Performance: ${responses.performance}/5, Features: ${responses.features}/5, AI: ${responses.aiQuality}/5. ${responses.comments || ''}`,
      priority: averageScore < 3 ? 'high' : 'medium',
      metadata: {
        userAgent: 'survey',
        url: '/survey',
        sessionId: surveyId,
        browserInfo: responses
      }
    });

    return surveyId;
  }
}

export const feedbackService = new FeedbackService();