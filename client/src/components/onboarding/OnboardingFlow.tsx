import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  ChevronRight, 
  ChevronLeft, 
  CheckCircle, 
  Play,
  Rocket,
  Brain,
  Zap,
  Target,
  Users,
  Sparkles,
  ArrowRight,
  Clock,
  Star,
  Plus
} from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: any;
  component: React.ComponentType<any>;
  optional?: boolean;
}

interface UserProfile {
  name: string;
  role: string;
  experience: string;
  goals: string[];
  industry: string;
}

export default function OnboardingFlow({ onComplete }: { onComplete: () => void }) {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: '',
    role: '',
    experience: '',
    goals: [],
    industry: ''
  });

  const steps: OnboardingStep[] = [
    {
      id: 'welcome',
      title: 'Welcome to Codexel.ai',
      description: 'The future of AI-powered app development',
      icon: Sparkles,
      component: WelcomeStep
    },
    {
      id: 'profile',
      title: 'Tell us about yourself',
      description: 'Help us personalize your experience',
      icon: Users,
      component: ProfileStep
    },
    {
      id: 'goals',
      title: 'What do you want to build?',
      description: 'Set your development goals',
      icon: Target,
      component: GoalsStep
    },
    {
      id: 'workspace',
      title: 'Explore the workspace',
      description: 'Take a quick tour of the interface',
      icon: Zap,
      component: WorkspaceStep
    },
    {
      id: 'first-project',
      title: 'Create your first project',
      description: 'Get started with a template',
      icon: Rocket,
      component: FirstProjectStep
    },
    {
      id: 'ai-intro',
      title: 'Meet your AI team',
      description: 'Learn how AI agents work together',
      icon: Brain,
      component: AIIntroStep
    }
  ];

  // Save onboarding progress
  const saveProgressMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest('POST', '/api/onboarding/progress', data);
    }
  });

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCompletedSteps(prev => new Set([...Array.from(prev), currentStep]));
      setCurrentStep(currentStep + 1);
      
      // Save progress
      saveProgressMutation.mutate({
        userId: 'user_1',
        step: currentStep,
        completed: true,
        profile: userProfile
      });
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    setCompletedSteps(prev => new Set([...Array.from(prev), currentStep]));
    
    // Save completion
    saveProgressMutation.mutate({
      userId: 'user_1',
      completed: true,
      completedAt: new Date().toISOString(),
      profile: userProfile
    });

    toast({
      title: "Welcome aboard!",
      description: "You're all set to start building amazing apps with AI.",
    });

    onComplete();
  };

  const progress = ((Array.from(completedSteps).length) / steps.length) * 100;
  const CurrentStepComponent = steps[currentStep].component;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b bg-gradient-to-r from-blue-50 to-purple-50">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Get Started</h1>
                <p className="text-muted-foreground">Step {currentStep + 1} of {steps.length}</p>
              </div>
            </div>
            
            <Badge variant="outline" className="gap-1">
              <Clock className="h-3 w-3" />
              ~5 min
            </Badge>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Progress</span>
              <span>{Math.round(progress)}% complete</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          <CurrentStepComponent
            userProfile={userProfile}
            setUserProfile={setUserProfile}
            onNext={handleNext}
            onBack={handleBack}
            isFirst={currentStep === 0}
            isLast={currentStep === steps.length - 1}
            step={steps[currentStep]}
          />
        </div>

        {/* Footer */}
        <div className="p-6 border-t bg-gray-50 flex justify-between">
          <Button 
            variant="outline" 
            onClick={handleBack}
            disabled={currentStep === 0}
            className="gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            Back
          </Button>

          <div className="flex gap-2">
            {currentStep === steps.length - 1 ? (
              <Button onClick={handleComplete} className="gap-2">
                <CheckCircle className="h-4 w-4" />
                Get Started
              </Button>
            ) : (
              <Button onClick={handleNext} className="gap-2">
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Individual Step Components
function WelcomeStep({ step }: any) {
  return (
    <div className="text-center space-y-6">
      <div className="flex justify-center">
        <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
          <Sparkles className="h-12 w-12 text-white" />
        </div>
      </div>
      
      <div>
        <h2 className="text-3xl font-bold mb-4">{step.title}</h2>
        <p className="text-lg text-muted-foreground">
          Build production-ready applications faster than ever with AI-powered development
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4 mt-8">
        <div className="text-center">
          <Brain className="h-8 w-8 text-primary mx-auto mb-2" />
          <h3 className="font-medium">AI Agents</h3>
          <p className="text-sm text-muted-foreground">Specialized AI for every task</p>
        </div>
        <div className="text-center">
          <Zap className="h-8 w-8 text-primary mx-auto mb-2" />
          <h3 className="font-medium">Lightning Fast</h3>
          <p className="text-sm text-muted-foreground">Deploy in minutes</p>
        </div>
        <div className="text-center">
          <Rocket className="h-8 w-8 text-primary mx-auto mb-2" />
          <h3 className="font-medium">Production Ready</h3>
          <p className="text-sm text-muted-foreground">Enterprise-grade apps</p>
        </div>
      </div>
    </div>
  );
}

function ProfileStep({ userProfile, setUserProfile }: any) {
  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold mb-2">Tell us about yourself</h2>
        <p className="text-muted-foreground">This helps us personalize your experience</p>
      </div>

      <div className="space-y-4">
        <div>
          <Label>What's your name?</Label>
          <Input
            value={userProfile.name}
            onChange={(e) => setUserProfile((prev: any) => ({ ...prev, name: e.target.value }))}
            placeholder="Enter your name"
          />
        </div>

        <div>
          <Label>What's your role?</Label>
          <select
            className="w-full mt-1 p-2 border rounded-md"
            value={userProfile.role}
            onChange={(e) => setUserProfile((prev: any) => ({ ...prev, role: e.target.value }))}
          >
            <option value="">Select your role</option>
            <option value="entrepreneur">Entrepreneur</option>
            <option value="developer">Developer</option>
            <option value="designer">Designer</option>
            <option value="product-manager">Product Manager</option>
            <option value="student">Student</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div>
          <Label>Experience with app development</Label>
          <select
            className="w-full mt-1 p-2 border rounded-md"
            value={userProfile.experience}
            onChange={(e) => setUserProfile((prev: any) => ({ ...prev, experience: e.target.value }))}
          >
            <option value="">Select experience level</option>
            <option value="beginner">Beginner - New to development</option>
            <option value="intermediate">Intermediate - Some experience</option>
            <option value="advanced">Advanced - Experienced developer</option>
            <option value="expert">Expert - Highly experienced</option>
          </select>
        </div>

        <div>
          <Label>Industry</Label>
          <select
            className="w-full mt-1 p-2 border rounded-md"
            value={userProfile.industry}
            onChange={(e) => setUserProfile((prev: any) => ({ ...prev, industry: e.target.value }))}
          >
            <option value="">Select industry</option>
            <option value="tech">Technology</option>
            <option value="healthcare">Healthcare</option>
            <option value="finance">Finance</option>
            <option value="education">Education</option>
            <option value="retail">Retail/E-commerce</option>
            <option value="consulting">Consulting</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>
    </div>
  );
}

function GoalsStep({ userProfile, setUserProfile }: any) {
  const goals = [
    { id: 'mvp', label: 'Build an MVP quickly', description: 'Get your idea to market fast' },
    { id: 'business', label: 'Create a business app', description: 'Professional applications' },
    { id: 'learning', label: 'Learn app development', description: 'Educational purposes' },
    { id: 'automation', label: 'Automate workflows', description: 'Business process automation' },
    { id: 'ai-apps', label: 'Build AI-powered apps', description: 'Applications with AI features' },
    { id: 'portfolio', label: 'Expand my portfolio', description: 'Showcase projects' }
  ];

  const toggleGoal = (goalId: string) => {
    setUserProfile((prev: any) => ({
      ...prev,
      goals: prev.goals.includes(goalId)
        ? prev.goals.filter((g: string) => g !== goalId)
        : [...prev.goals, goalId]
    }));
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold mb-2">What do you want to accomplish?</h2>
        <p className="text-muted-foreground">Select all that apply</p>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {goals.map((goal) => (
          <button
            key={goal.id}
            onClick={() => toggleGoal(goal.id)}
            className={`p-4 text-left border rounded-lg transition-colors ${
              userProfile.goals.includes(goal.id)
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-primary/50'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-5 h-5 border-2 rounded-full flex items-center justify-center ${
                userProfile.goals.includes(goal.id) ? 'border-primary bg-primary' : 'border-gray-300'
              }`}>
                {userProfile.goals.includes(goal.id) && (
                  <div className="w-3 h-3 bg-white rounded-full" />
                )}
              </div>
              <div>
                <div className="font-medium">{goal.label}</div>
                <div className="text-sm text-muted-foreground">{goal.description}</div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function WorkspaceStep() {
  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold mb-2">Your AI-Powered Workspace</h2>
        <p className="text-muted-foreground">Three panels working together seamlessly</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Users className="h-8 w-8 text-primary mx-auto mb-2" />
            <h3 className="font-medium mb-1">AI Team</h3>
            <p className="text-xs text-muted-foreground">Specialized agents for every task</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <Brain className="h-8 w-8 text-primary mx-auto mb-2" />
            <h3 className="font-medium mb-1">Chat Interface</h3>
            <p className="text-xs text-muted-foreground">Natural conversation with AI</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <Play className="h-8 w-8 text-primary mx-auto mb-2" />
            <h3 className="font-medium mb-1">Live Preview</h3>
            <p className="text-xs text-muted-foreground">See your app as you build</p>
          </CardContent>
        </Card>
      </div>

      <div className="bg-blue-50 p-4 rounded-lg">
        <h3 className="font-medium mb-2 flex items-center gap-2">
          <Star className="h-4 w-4 text-primary" />
          Pro Tip
        </h3>
        <p className="text-sm text-muted-foreground">
          The workspace layout automatically adapts to your screen size and saves your preferences.
        </p>
      </div>
    </div>
  );
}

function FirstProjectStep() {
  const templates = [
    { id: 'ecommerce', name: 'E-commerce Store', icon: '🛍️', time: '~10 min' },
    { id: 'saas', name: 'SaaS Dashboard', icon: '📊', time: '~15 min' },
    { id: 'portfolio', name: 'Portfolio Site', icon: '🎨', time: '~5 min' },
    { id: 'blog', name: 'Blog Platform', icon: '📝', time: '~8 min' }
  ];

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold mb-2">Choose your first project</h2>
        <p className="text-muted-foreground">Start with a template or create from scratch</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {templates.map((template) => (
          <Card key={template.id} className="cursor-pointer hover:border-primary transition-colors">
            <CardContent className="p-4 text-center">
              <div className="text-2xl mb-2">{template.icon}</div>
              <h3 className="font-medium mb-1">{template.name}</h3>
              <Badge variant="outline" className="text-xs">{template.time}</Badge>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="text-center">
        <Button variant="outline" className="gap-2">
          <Plus className="h-4 w-4" />
          Start from scratch
        </Button>
      </div>
    </div>
  );
}

function AIIntroStep() {
  const agents = [
    { name: 'Planner', role: 'Project planning & architecture', status: 'ready' },
    { name: 'Designer', role: 'UI/UX design & styling', status: 'ready' },
    { name: 'Developer', role: 'Code generation & implementation', status: 'ready' },
    { name: 'Tester', role: 'Quality assurance & debugging', status: 'ready' }
  ];

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold mb-2">Meet your AI team</h2>
        <p className="text-muted-foreground">Specialized agents ready to help you build</p>
      </div>

      <div className="space-y-3">
        {agents.map((agent, index) => (
          <div key={agent.name} className="flex items-center gap-4 p-3 border rounded-lg">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
              <Brain className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-medium">{agent.name}</h3>
              <p className="text-sm text-muted-foreground">{agent.role}</p>
            </div>
            <Badge className="bg-green-100 text-green-700">
              {agent.status}
            </Badge>
          </div>
        ))}
      </div>

      <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg">
        <h3 className="font-medium mb-2 flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          Ready to start building?
        </h3>
        <p className="text-sm text-muted-foreground">
          Your AI team is ready to turn your ideas into reality. Just describe what you want to build!
        </p>
      </div>
    </div>
  );
}