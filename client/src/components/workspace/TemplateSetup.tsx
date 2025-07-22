import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { 
  Brain, 
  Sparkles, 
  FileText, 
  Share2, 
  Mail, 
  Phone,
  Users,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  Zap,
  Settings,
  BarChart
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useMutation, useQuery } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import type { BlogPost, MarketingCampaign } from '@shared/schema';
import TemplateSelector from './TemplateSelector';
import type { ProjectTemplate } from '@shared/templates';

interface TemplateSetupProps {
  projectId: number;
  onComplete?: () => void;
}

interface SetupStep {
  id: string;
  title: string;
  description: string;
  icon: any;
  status: 'pending' | 'in-progress' | 'completed' | 'error';
  progress?: number;
}

export default function TemplateSetup({ projectId, onComplete }: TemplateSetupProps) {
  const { toast } = useToast();
  const [showTemplateSelector, setShowTemplateSelector] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState<ProjectTemplate | null>(null);
  const [selectedStacks, setSelectedStacks] = useState<string[]>([]);
  const [templateConfig, setTemplateConfig] = useState<any>(null);
  const [setupSteps, setSetupSteps] = useState<SetupStep[]>([]);
  const [currentStep, setCurrentStep] = useState<string | null>(null);

  // Fetch blog posts
  const { data: blogPosts = [] } = useQuery<BlogPost[]>({
    queryKey: ['/api/blog/project', projectId],
    enabled: !!projectId && !showTemplateSelector,
  });

  // Generate initial blog posts
  const generateBlogMutation = useMutation({
    mutationFn: async (config: any) => {
      return await apiRequest('POST', '/api/blog/generate', config);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/blog/project', projectId] });
      updateStepStatus('blog-content', 'completed');
    },
    onError: (error) => {
      updateStepStatus('blog-content', 'error');
      toast({
        title: 'Error generating blog content',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Generate social media content
  const generateSocialMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest('POST', '/api/marketing/social/generate', data);
    },
    onSuccess: () => {
      updateStepStatus('social-media', 'completed');
    },
    onError: (error) => {
      updateStepStatus('social-media', 'error');
    },
  });

  // Generate email campaigns
  const generateEmailMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest('POST', '/api/marketing/email/generate', data);
    },
    onSuccess: () => {
      updateStepStatus('email-campaigns', 'completed');
    },
    onError: (error) => {
      updateStepStatus('email-campaigns', 'error');
    },
  });

  const handleTemplateSelection = (template: ProjectTemplate, stacks: string[], config: any) => {
    setSelectedTemplate(template);
    setSelectedStacks(stacks);
    setTemplateConfig(config);
    setShowTemplateSelector(false);
    
    // Initialize setup steps based on selected stacks
    const steps: SetupStep[] = [
      {
        id: 'website-creation',
        title: 'Creating Website Structure',
        description: 'Building your professional law firm website',
        icon: Settings,
        status: 'pending',
      },
    ];

    if (stacks.includes('ai-blog-writer')) {
      steps.push({
        id: 'blog-content',
        title: 'AI Blog Writer',
        description: 'Generating SEO-optimized legal articles',
        icon: FileText,
        status: 'pending',
      });
    }

    if (stacks.includes('ai-social-media')) {
      steps.push({
        id: 'social-media',
        title: 'Social Media Content',
        description: 'Creating engaging social posts',
        icon: Share2,
        status: 'pending',
      });
    }

    if (stacks.includes('ai-emailer')) {
      steps.push({
        id: 'email-campaigns',
        title: 'Email Campaigns',
        description: 'Setting up automated email sequences',
        icon: Mail,
        status: 'pending',
      });
    }

    setSetupSteps(steps);
    
    // Start the setup process
    setTimeout(() => startSetupProcess(template, stacks, config), 500);
  };

  const updateStepStatus = (stepId: string, status: SetupStep['status'], progress?: number) => {
    setSetupSteps(prev => prev.map(step => 
      step.id === stepId ? { ...step, status, progress } : step
    ));
  };

  const startSetupProcess = async (template: ProjectTemplate, stacks: string[], config: any) => {
    // Start website creation
    setCurrentStep('website-creation');
    updateStepStatus('website-creation', 'in-progress');
    
    // Simulate website creation
    await new Promise(resolve => setTimeout(resolve, 2000));
    updateStepStatus('website-creation', 'completed');

    // Generate blog content if selected
    if (stacks.includes('ai-blog-writer')) {
      setCurrentStep('blog-content');
      updateStepStatus('blog-content', 'in-progress');
      
      // Generate multiple blog posts
      const blogTopics = [
        'What to Do After a Car Accident',
        'Understanding Personal Injury Law',
        'How to Choose the Right Attorney',
        'Common Mistakes in Personal Injury Cases',
        'Your Rights After an Accident'
      ];

      for (let i = 0; i < blogTopics.length; i++) {
        updateStepStatus('blog-content', 'in-progress', (i / blogTopics.length) * 100);
        
        await generateBlogMutation.mutateAsync({
          projectId,
          practiceArea: 'Personal Injury',
          targetKeywords: ['personal injury lawyer', config.states[0] + ' attorney'],
          tone: 'professional',
          length: 'medium',
          includeLocalSEO: true,
          state: config.states[0],
          city: config.city || undefined,
        });
        
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    // Generate social media content if selected
    if (stacks.includes('ai-social-media')) {
      setCurrentStep('social-media');
      updateStepStatus('social-media', 'in-progress');
      
      const platforms = ['facebook', 'linkedin', 'instagram', 'twitter'];
      for (const platform of platforms) {
        await generateSocialMutation.mutateAsync({
          topic: 'Know your rights after an accident',
          platform,
          includeHashtags: true,
        });
      }
    }

    // Generate email campaigns if selected
    if (stacks.includes('ai-emailer')) {
      setCurrentStep('email-campaigns');
      updateStepStatus('email-campaigns', 'in-progress');
      
      await generateEmailMutation.mutateAsync({
        campaignType: 'welcome',
        practiceArea: 'Personal Injury',
      });
      
      await generateEmailMutation.mutateAsync({
        campaignType: 'newsletter',
        practiceArea: 'Personal Injury',
      });
    }

    setCurrentStep(null);
    
    // Show completion message
    toast({
      title: 'Setup Complete!',
      description: 'Your AI-powered law firm website is ready.',
    });
    
    if (onComplete) {
      setTimeout(onComplete, 2000);
    }
  };

  if (showTemplateSelector) {
    return <TemplateSelector onComplete={handleTemplateSelection} />;
  }

  const totalSteps = setupSteps.length;
  const completedSteps = setupSteps.filter(s => s.status === 'completed').length;
  const overallProgress = (completedSteps / totalSteps) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-3">Setting Up Your Law Firm Website</h2>
          <p className="text-lg text-muted-foreground">
            AI is automatically building your website and marketing content
          </p>
          <div className="mt-4">
            <Progress value={overallProgress} className="h-2" />
            <p className="text-sm text-muted-foreground mt-2">
              {completedSteps} of {totalSteps} steps completed
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {setupSteps.map((step) => (
            <Card 
              key={step.id}
              className={cn(
                "transition-all",
                step.status === 'in-progress' && "ring-2 ring-primary",
                step.status === 'completed' && "bg-primary/5",
                step.status === 'error' && "ring-2 ring-destructive"
              )}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className={cn(
                      "p-2 rounded-lg",
                      step.status === 'completed' && "bg-primary text-primary-foreground",
                      step.status === 'in-progress' && "bg-primary/20 text-primary",
                      step.status === 'pending' && "bg-muted",
                      step.status === 'error' && "bg-destructive text-destructive-foreground"
                    )}>
                      <step.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{step.title}</CardTitle>
                      <CardDescription>{step.description}</CardDescription>
                    </div>
                  </div>
                  <div>
                    {step.status === 'completed' && (
                      <CheckCircle className="w-6 h-6 text-primary" />
                    )}
                    {step.status === 'in-progress' && (
                      <div className="animate-spin">
                        <Zap className="w-6 h-6 text-primary" />
                      </div>
                    )}
                    {step.status === 'error' && (
                      <AlertCircle className="w-6 h-6 text-destructive" />
                    )}
                  </div>
                </div>
              </CardHeader>
              {step.status === 'in-progress' && step.progress !== undefined && (
                <CardContent>
                  <Progress value={step.progress} className="h-1" />
                </CardContent>
              )}
            </Card>
          ))}
        </div>

        {/* Live content preview */}
        {blogPosts.length > 0 && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Generated Blog Posts</CardTitle>
              <CardDescription>
                AI has created {blogPosts.length} SEO-optimized articles for your website
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-64">
                <div className="space-y-3">
                  {blogPosts.map((post) => (
                    <div key={post.id} className="p-3 border rounded-lg">
                      <h4 className="font-semibold">{post.title}</h4>
                      <p className="text-sm text-muted-foreground mt-1">{post.excerpt}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="secondary">
                          <Clock className="w-3 h-3 mr-1" />
                          {post.readTime} min read
                        </Badge>
                        <Badge variant="outline">{post.category}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}