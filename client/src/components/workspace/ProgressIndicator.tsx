import React, { useState, useEffect } from 'react';
import { CheckCircle, Clock, FileText, Code, Palette, Zap, ChevronDown, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProgressStep {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'running' | 'completed' | 'error';
  icon: React.ComponentType<any>;
  duration?: number;
  details?: string[];
}

interface ProgressIndicatorProps {
  isVisible: boolean;
  onComplete?: () => void;
}

export default function ProgressIndicator({ isVisible, onComplete }: ProgressIndicatorProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isExpanded, setIsExpanded] = useState(true);
  const [steps, setSteps] = useState<ProgressStep[]>([
    {
      id: 'analyze',
      title: 'Analyzing Requirements',
      description: 'Processing your request and determining optimal approach',
      status: 'pending',
      icon: Clock,
      details: ['Parsing user requirements', 'Selecting design patterns', 'Planning architecture']
    },
    {
      id: 'generate',
      title: 'Generating HTML Structure',
      description: 'Creating semantic HTML layout with modern structure',
      status: 'pending',
      icon: FileText,
      details: ['Building navigation', 'Creating hero section', 'Adding content sections', 'Implementing footer']
    },
    {
      id: 'styling',
      title: 'Applying Styles',
      description: 'Adding responsive CSS with Tailwind classes',
      status: 'pending',
      icon: Palette,
      details: ['Configuring color scheme', 'Setting typography', 'Adding animations', 'Implementing responsive design']
    },
    {
      id: 'scripting',
      title: 'Adding Interactivity',
      description: 'Implementing JavaScript functionality',
      status: 'pending',
      icon: Code,
      details: ['Smooth scrolling navigation', 'Form validation', 'Interactive elements', 'Performance optimization']
    },
    {
      id: 'finalize',
      title: 'Finalizing Website',
      description: 'Optimizing and preparing for deployment',
      status: 'pending',
      icon: Zap,
      details: ['Code optimization', 'Asset compression', 'SEO enhancement', 'Cross-browser testing']
    }
  ]);

  useEffect(() => {
    if (!isVisible) {
      // Reset when hidden
      setCurrentStep(0);
      setSteps(prev => prev.map(step => ({ ...step, status: 'pending' })));
      return;
    }

    // Simulate progress when visible
    const progressTimer = setInterval(() => {
      setSteps(prev => {
        const newSteps = [...prev];
        const currentStepIndex = newSteps.findIndex(step => step.status === 'running');
        
        if (currentStepIndex >= 0) {
          // Complete current step
          newSteps[currentStepIndex].status = 'completed';
          
          // Start next step
          if (currentStepIndex + 1 < newSteps.length) {
            newSteps[currentStepIndex + 1].status = 'running';
            setCurrentStep(currentStepIndex + 1);
          } else {
            // All steps completed
            setTimeout(() => {
              onComplete?.();
            }, 1000);
          }
        } else {
          // Start first step
          newSteps[0].status = 'running';
          setCurrentStep(0);
        }
        
        return newSteps;
      });
    }, 2000); // Each step takes 2 seconds

    return () => clearInterval(progressTimer);
  }, [isVisible, onComplete]);

  if (!isVisible) return null;

  const getStatusIcon = (step: ProgressStep) => {
    const IconComponent = step.icon;
    
    switch (step.status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'running':
        return <IconComponent className="w-5 h-5 text-blue-500 animate-pulse" />;
      case 'error':
        return <IconComponent className="w-5 h-5 text-red-500" />;
      default:
        return <IconComponent className="w-5 h-5 text-gray-400" />;
    }
  };

  const completedSteps = steps.filter(step => step.status === 'completed').length;
  const totalSteps = steps.length;
  const progressPercentage = (completedSteps / totalSteps) * 100;

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-lg p-4 max-w-md">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="text-white font-semibold">Building Website</h3>
            <p className="text-gray-400 text-sm">{completedSteps}/{totalSteps} steps completed</p>
          </div>
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-gray-400 hover:text-white transition-colors"
        >
          {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </button>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      {/* Steps */}
      {isExpanded && (
        <div className="space-y-3">
          {steps.map((step, index) => (
            <div
              key={step.id}
              className={cn(
                "flex items-start space-x-3 p-3 rounded-lg transition-all duration-300",
                step.status === 'running' && "bg-blue-900/30 border border-blue-700/50",
                step.status === 'completed' && "bg-green-900/20 border border-green-700/30",
                step.status === 'pending' && "bg-gray-800/50"
              )}
            >
              <div className="flex-shrink-0 mt-0.5">
                {getStatusIcon(step)}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className={cn(
                  "text-sm font-medium",
                  step.status === 'completed' ? "text-green-400" :
                  step.status === 'running' ? "text-blue-400" :
                  "text-gray-300"
                )}>
                  {step.title}
                </h4>
                <p className="text-xs text-gray-500 mt-1">
                  {step.description}
                </p>
                
                {/* Show details for running step */}
                {step.status === 'running' && step.details && (
                  <div className="mt-2 space-y-1">
                    {step.details.map((detail, idx) => (
                      <div key={idx} className="flex items-center space-x-2 text-xs text-gray-400">
                        <div className="w-1 h-1 bg-blue-400 rounded-full animate-pulse" />
                        <span>{detail}</span>
                      </div>
                    ))}
                  </div>
                )}
                
                {/* Show checkmarks for completed step */}
                {step.status === 'completed' && step.details && (
                  <div className="mt-2 space-y-1">
                    {step.details.slice(0, 2).map((detail, idx) => (
                      <div key={idx} className="flex items-center space-x-2 text-xs text-green-400">
                        <CheckCircle className="w-3 h-3" />
                        <span>{detail}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Current Status */}
      {completedSteps === totalSteps && (
        <div className="mt-4 p-3 bg-green-900/20 border border-green-700/30 rounded-lg">
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <span className="text-green-400 font-medium">Website completed successfully!</span>
          </div>
          <p className="text-green-300 text-sm mt-1">
            Your website is now ready in the preview panel
          </p>
        </div>
      )}
    </div>
  );
}