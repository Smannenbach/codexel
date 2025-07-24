import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Play, 
  CheckCircle, 
  ArrowRight, 
  ArrowLeft,
  X,
  Lightbulb,
  Target,
  Zap,
  Users,
  MessageSquare,
  Eye,
  BarChart
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  target: string;
  action: string;
  tip: string;
}

const onboardingSteps: OnboardingStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to Codexel.ai',
    description: 'Your AI-powered development platform where autonomous agents build applications for you.',
    icon: Lightbulb,
    target: 'workspace',
    action: 'Get familiar with the three-panel layout',
    tip: 'Each panel serves a specific purpose: AI Team (left), Chat (center), Preview (right)'
  },
  {
    id: 'ai-team',
    title: 'Meet Your AI Team',
    description: 'Specialized AI agents work together to build your application: Project Manager, Architect, Designer, and Developers.',
    icon: Users,
    target: 'left-panel',
    action: 'Explore the AI team dashboard',
    tip: 'Watch as agents collaborate, update their status, and complete tasks autonomously'
  },
  {
    id: 'chat-interface',
    title: 'Communicate with AI',
    description: 'Use natural language to describe what you want to build. Upload files, images, or documents for context.',
    icon: MessageSquare,
    target: 'chat-panel',
    action: 'Send your first message',
    tip: 'Try: "Build me a landing page for a restaurant" or upload a wireframe image'
  },
  {
    id: 'live-preview',
    title: 'See Real-time Results',
    description: 'Watch your application come to life in the preview panel. Test on different devices instantly.',
    icon: Eye,
    target: 'preview-panel',
    action: 'View your app preview',
    tip: 'Use device switching to test responsive design across desktop, tablet, and mobile'
  },
  {
    id: 'analytics',
    title: 'Track Progress & Optimize',
    description: 'Monitor your workspace performance, get AI-driven recommendations, and deploy with one click.',
    icon: BarChart,
    target: 'analytics-button',
    action: 'Open analytics dashboard',
    tip: 'Analytics help optimize your workflow and provide insights for better productivity'
  },
  {
    id: 'complete',
    title: 'You\'re Ready to Build!',
    description: 'Start creating amazing applications with the power of autonomous AI development.',
    icon: Target,
    target: 'complete',
    action: 'Begin your first project',
    tip: 'Choose from 100+ professional templates or describe your custom idea'
  }
];

interface OnboardingGuideProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

export default function OnboardingGuide({ isOpen, onClose, onComplete }: OnboardingGuideProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());

  const currentStepData = onboardingSteps[currentStep];
  const progress = ((currentStep + 1) / onboardingSteps.length) * 100;

  const handleNext = () => {
    setCompletedSteps(prev => new Set([...prev, currentStepData.id]));
    
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
      onClose();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    onComplete();
    onClose();
  };

  const IconComponent = currentStepData?.icon;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-gray-900 border-gray-800">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between text-white">
            <div className="flex items-center gap-2">
              <Play className="h-5 w-5 text-blue-500" />
              Getting Started Guide
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Progress</span>
              <span className="text-white">
                Step {currentStep + 1} of {onboardingSteps.length}
              </span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Current Step */}
          {currentStepData && (
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-white">
                  <div className="p-2 rounded-lg bg-blue-600/20">
                    <IconComponent className="h-6 w-6 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-lg">{currentStepData.title}</h3>
                    <Badge variant="outline" className="mt-1">
                      {currentStepData.target}
                    </Badge>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-300">{currentStepData.description}</p>
                
                <div className="p-3 bg-blue-900/20 border border-blue-800 rounded-lg">
                  <div className="flex items-start gap-2">
                    <Zap className="h-4 w-4 text-blue-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-blue-300">Next Action:</p>
                      <p className="text-sm text-blue-200">{currentStepData.action}</p>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-yellow-900/20 border border-yellow-800 rounded-lg">
                  <div className="flex items-start gap-2">
                    <Lightbulb className="h-4 w-4 text-yellow-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-yellow-300">Pro Tip:</p>
                      <p className="text-sm text-yellow-200">{currentStepData.tip}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step Overview */}
          <div className="grid grid-cols-2 gap-2">
            {onboardingSteps.map((step, index) => {
              const StepIcon = step.icon;
              const isCompleted = completedSteps.has(step.id);
              const isCurrent = index === currentStep;
              
              return (
                <div
                  key={step.id}
                  className={`p-3 rounded-lg border transition-colors ${
                    isCurrent 
                      ? 'bg-blue-900/30 border-blue-700'
                      : isCompleted
                      ? 'bg-green-900/30 border-green-700'
                      : 'bg-gray-800/30 border-gray-700'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {isCompleted ? (
                      <CheckCircle className="h-4 w-4 text-green-400" />
                    ) : (
                      <StepIcon className={`h-4 w-4 ${isCurrent ? 'text-blue-400' : 'text-gray-500'}`} />
                    )}
                    <span className={`text-xs font-medium ${
                      isCurrent ? 'text-blue-300' : isCompleted ? 'text-green-300' : 'text-gray-400'
                    }`}>
                      {step.title}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Navigation */}
          <div className="flex justify-between">
            <div className="flex gap-2">
              <Button 
                onClick={handlePrevious}
                disabled={currentStep === 0}
                variant="outline"
                className="border-gray-700 text-gray-300"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>
              
              <Button 
                onClick={handleSkip}
                variant="ghost"
                className="text-gray-400"
              >
                Skip Guide
              </Button>
            </div>

            <Button 
              onClick={handleNext}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {currentStep === onboardingSteps.length - 1 ? (
                <>
                  <Target className="h-4 w-4 mr-2" />
                  Start Building
                </>
              ) : (
                <>
                  Next
                  <ArrowRight className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Hook to manage onboarding state
export function useOnboarding() {
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(() => {
    return localStorage.getItem('codexel_onboarding_completed') === 'true';
  });

  const [showOnboarding, setShowOnboarding] = useState(!hasCompletedOnboarding);

  const completeOnboarding = () => {
    localStorage.setItem('codexel_onboarding_completed', 'true');
    setHasCompletedOnboarding(true);
    setShowOnboarding(false);
  };

  const resetOnboarding = () => {
    localStorage.removeItem('codexel_onboarding_completed');
    setHasCompletedOnboarding(false);
    setShowOnboarding(true);
  };

  return {
    hasCompletedOnboarding,
    showOnboarding,
    setShowOnboarding,
    completeOnboarding,
    resetOnboarding
  };
}