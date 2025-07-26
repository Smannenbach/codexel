import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export interface UserProfile {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  profileImageUrl?: string;
  subscriptionStatus: 'free' | 'pro' | 'enterprise';
  usage: {
    current: {
      aiCalls: number;
      storageGB: number;
      workspaceHours: number;
      projectCount: number;
      resetDate: string;
    };
    limits: {
      aiCalls: number;
      storageGB: number;
      workspaceHours: number;
      projectCount: number;
    };
    recentStats: Array<{
      period: string;
      metrics: {
        aiCalls: number;
        tokensUsed: number;
        workspaceMinutes: number;
        projectsCreated: number;
        filesUploaded: number;
        storageUsedMB: number;
        featuresUsed: string[];
      };
    }>;
  };
}

export function useProductionAuth() {
  const queryClient = useQueryClient();

  // Get user profile with usage information
  const { data: userProfile, isLoading, error } = useQuery({
    queryKey: ['/api/auth/user/profile'],
    retry: false,
  });

  // Track AI usage
  const trackAiUsage = useMutation({
    mutationFn: async (usage: {
      model: string;
      feature: string;
      inputTokens: number;
      outputTokens: number;
      cost: number;
      projectId?: number;
      sessionId?: string;
      metadata?: any;
    }) => {
      return apiRequest('POST', '/api/auth/usage/ai', usage);
    },
    onSuccess: () => {
      // Invalidate user profile to refresh usage stats
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user/profile'] });
    }
  });

  // Track workspace time
  const trackWorkspaceTime = useMutation({
    mutationFn: async (data: { sessionId: string; minutes: number }) => {
      return apiRequest('POST', '/api/auth/usage/workspace-time', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user/profile'] });
    }
  });

  // Check if user can perform action
  const checkUsageLimit = async (action: string, params?: any): Promise<{
    canPerform: boolean;
    reason: string;
    currentUsage: any;
    limits: any;
  }> => {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.keys(params).forEach(key => {
        queryParams.append(key, params[key]);
      });
    }
    
    const response = await apiRequest('GET', `/api/auth/usage/check/${action}?${queryParams}`);
    return response.json();
  };

  // Get detailed usage analytics
  const { data: usageAnalytics } = useQuery({
    queryKey: ['/api/auth/user/usage'],
    enabled: !!userProfile,
  });

  return {
    user: userProfile as UserProfile | undefined,
    isLoading,
    isAuthenticated: !!userProfile,
    error,
    usageAnalytics,
    trackAiUsage,
    trackWorkspaceTime,
    checkUsageLimit,
  };
}