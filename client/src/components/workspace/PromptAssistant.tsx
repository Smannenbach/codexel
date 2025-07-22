import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Lightbulb, 
  Eye, 
  Play, 
  Code, 
  Palette, 
  Database,
  Globe,
  TestTube,
  Rocket,
  MessageSquare,
  Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface PromptSuggestion {
  id: string;
  category: string;
  title: string;
  description: string;
  prompt: string;
  icon: React.ElementType;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  example?: string;
  preview?: string;
}

interface PromptAssistantProps {
  onSelectPrompt: (prompt: string) => void;
  onAddToQueue: (prompt: string) => void;
}

export function PromptAssistant({ onSelectPrompt, onAddToQueue }: PromptAssistantProps) {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [hoveredPrompt, setHoveredPrompt] = useState<string | null>(null);

  const promptSuggestions: PromptSuggestion[] = [
    {
      id: 'build-ecommerce',
      category: 'apps',
      title: 'Build E-commerce Store',
      description: 'Create a complete online store with products, cart, and payments',
      prompt: 'Build me a complete e-commerce website with product catalog, shopping cart, user authentication, payment processing with Stripe, and admin dashboard. Include features like product search, reviews, and order tracking.',
      icon: Globe,
      difficulty: 'intermediate',
      example: 'Creates: Product pages, shopping cart, checkout flow, admin panel',
      preview: 'A modern online store with sleek design, product galleries, and secure checkout'
    },
    {
      id: 'linkedin-automation',
      category: 'automation',
      title: 'LinkedIn Outreach Campaign',
      description: 'Automate LinkedIn connections and messaging for business development',
      prompt: 'Set up an automated LinkedIn outreach campaign to connect with 50 software engineers in San Francisco. Send personalized connection requests mentioning their recent posts, then follow up with a message about collaboration opportunities.',
      icon: MessageSquare,
      difficulty: 'beginner',
      example: 'Automates: Profile searches, connection requests, follow-up messages',
      preview: 'Professional networking automation with personalized messaging'
    },
    {
      id: 'ai-chatbot',
      category: 'apps',
      title: 'AI Customer Support Bot',
      description: 'Build an intelligent chatbot for customer service',
      prompt: 'Create an AI-powered customer support chatbot that can handle common questions, escalate complex issues to human agents, integrate with our knowledge base, and provide 24/7 support with sentiment analysis.',
      icon: Sparkles,
      difficulty: 'advanced',
      example: 'Includes: Natural language processing, knowledge base integration, escalation logic',
      preview: 'Smart chatbot with human-like conversations and intelligent routing'
    },
    {
      id: 'design-system',
      category: 'design',
      title: 'Complete Brand Identity',
      description: 'Create logos, colors, fonts, and brand guidelines',
      prompt: 'Design a complete brand identity for a sustainable tech startup including logo variations, color palette, typography system, business cards, letterhead, and brand guidelines document.',
      icon: Palette,
      difficulty: 'intermediate',
      example: 'Creates: Logo files, color schemes, font pairings, business materials',
      preview: 'Professional brand package with multiple logo variations and materials'
    },
    {
      id: 'data-dashboard',
      category: 'analytics',
      title: 'Analytics Dashboard',
      description: 'Build interactive charts and data visualization',
      prompt: 'Create a comprehensive analytics dashboard with real-time data visualization, KPI tracking, interactive charts, data filtering, export capabilities, and mobile-responsive design for business metrics monitoring.',
      icon: Database,
      difficulty: 'intermediate',
      example: 'Features: Real-time charts, KPI widgets, data filters, export tools',
      preview: 'Dynamic dashboard with beautiful charts and real-time updates'
    },
    {
      id: 'mobile-app',
      category: 'apps',
      title: 'Mobile App Development',
      description: 'Build a cross-platform mobile application',
      prompt: 'Develop a fitness tracking mobile app with workout logging, progress tracking, social features, push notifications, offline sync, and integration with wearable devices.',
      icon: Code,
      difficulty: 'advanced',
      example: 'Includes: Native features, offline storage, device integration, social sharing',
      preview: 'Cross-platform mobile app with native performance and features'
    },
    {
      id: 'automation-workflow',
      category: 'automation',
      title: 'Multi-App Workflow',
      description: 'Connect multiple apps and automate complex workflows',
      prompt: 'Create an automated workflow that monitors new GitHub issues, creates Slack notifications, updates Notion project tracker, sends email summaries, and generates weekly progress reports.',
      icon: Play,
      difficulty: 'intermediate',
      example: 'Connects: GitHub, Slack, Notion, Email, Report generation',
      preview: 'Seamless automation across multiple platforms with smart triggers'
    },
    {
      id: 'testing-suite',
      category: 'testing',
      title: 'Automated Testing Setup',
      description: 'Implement comprehensive testing for any application',
      prompt: 'Set up a complete testing suite with unit tests, integration tests, end-to-end testing, performance testing, security scanning, and continuous integration pipeline with automated reporting.',
      icon: TestTube,
      difficulty: 'advanced',
      example: 'Includes: Unit tests, E2E tests, performance monitoring, CI/CD pipeline',
      preview: 'Comprehensive testing automation with detailed reporting and monitoring'
    }
  ];

  const categories = [
    { id: 'all', label: 'All Suggestions', count: promptSuggestions.length },
    { id: 'apps', label: 'App Building', count: promptSuggestions.filter(p => p.category === 'apps').length },
    { id: 'automation', label: 'Automation', count: promptSuggestions.filter(p => p.category === 'automation').length },
    { id: 'design', label: 'Design', count: promptSuggestions.filter(p => p.category === 'design').length },
    { id: 'analytics', label: 'Analytics', count: promptSuggestions.filter(p => p.category === 'analytics').length },
    { id: 'testing', label: 'Testing', count: promptSuggestions.filter(p => p.category === 'testing').length }
  ];

  const filteredSuggestions = selectedCategory === 'all' 
    ? promptSuggestions 
    : promptSuggestions.filter(p => p.category === selectedCategory);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h3 className="text-xl font-semibold mb-2 flex items-center justify-center gap-2">
          <Lightbulb className="w-5 h-5 text-primary" />
          Smart Prompt Assistant
        </h3>
        <p className="text-muted-foreground">
          Choose from expert-crafted prompts designed for non-technical users
        </p>
      </div>

      {/* Category filters */}
      <div className="flex flex-wrap gap-2 justify-center">
        {categories.map((category) => (
          <Button
            key={category.id}
            variant={selectedCategory === category.id ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory(category.id)}
            className="text-xs"
          >
            {category.label}
            <Badge variant="secondary" className="ml-2 text-xs">
              {category.count}
            </Badge>
          </Button>
        ))}
      </div>

      {/* Suggestions grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredSuggestions.map((suggestion) => {
          const Icon = suggestion.icon;
          const isHovered = hoveredPrompt === suggestion.id;
          
          return (
            <Card 
              key={suggestion.id} 
              className={cn(
                "p-4 transition-all duration-200 cursor-pointer border-2",
                isHovered && "border-primary shadow-lg scale-[1.02]"
              )}
              onMouseEnter={() => setHoveredPrompt(suggestion.id)}
              onMouseLeave={() => setHoveredPrompt(null)}
            >
              <div className="space-y-3">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-medium">{suggestion.title}</h4>
                      <p className="text-sm text-muted-foreground">
                        {suggestion.description}
                      </p>
                    </div>
                  </div>
                  <Badge 
                    variant={
                      suggestion.difficulty === 'beginner' ? 'default' :
                      suggestion.difficulty === 'intermediate' ? 'secondary' : 'outline'
                    }
                    className="text-xs"
                  >
                    {suggestion.difficulty}
                  </Badge>
                </div>

                {/* Preview on hover */}
                {isHovered && suggestion.preview && (
                  <div className="p-3 bg-muted/50 rounded-lg border">
                    <div className="flex items-center gap-2 mb-2">
                      <Eye className="w-4 h-4 text-primary" />
                      <span className="text-sm font-medium">Preview</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{suggestion.preview}</p>
                    {suggestion.example && (
                      <p className="text-xs text-muted-foreground mt-2">
                        <strong>Example:</strong> {suggestion.example}
                      </p>
                    )}
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2">
                  <Button 
                    onClick={() => onSelectPrompt(suggestion.prompt)}
                    className="flex-1"
                    size="sm"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Start Now
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => onAddToQueue(suggestion.prompt)}
                    size="sm"
                  >
                    Add to Queue
                  </Button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Help text */}
      <div className="text-center text-sm text-muted-foreground space-y-1">
        <p>💡 Hover over suggestions to see detailed previews</p>
        <p>🚀 "Start Now" begins immediately, "Add to Queue" saves for later</p>
        <p>🎯 These prompts are optimized for complete autonomous execution</p>
      </div>
    </div>
  );
}