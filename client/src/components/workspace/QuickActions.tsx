import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  Code, 
  Layout, 
  Database, 
  ShoppingCart, 
  MessageSquare,
  Gamepad2,
  Briefcase,
  GraduationCap,
  Heart,
  Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  prompt: string;
  color: string;
}

const quickActions: QuickAction[] = [
  {
    id: 'ecommerce',
    title: 'E-commerce Store',
    description: 'Build a full online store with products and checkout',
    icon: ShoppingCart,
    prompt: 'Create an e-commerce website with product catalog, shopping cart, and checkout flow',
    color: 'text-green-500'
  },
  {
    id: 'dashboard',
    title: 'Admin Dashboard',
    description: 'Create a data visualization dashboard',
    icon: Layout,
    prompt: 'Build an admin dashboard with charts, analytics, and data tables',
    color: 'text-blue-500'
  },
  {
    id: 'chat',
    title: 'Chat Application',
    description: 'Real-time messaging app',
    icon: MessageSquare,
    prompt: 'Create a real-time chat application with user authentication and message history',
    color: 'text-purple-500'
  },
  {
    id: 'api',
    title: 'REST API',
    description: 'Backend API with database',
    icon: Database,
    prompt: 'Build a REST API with CRUD operations, authentication, and PostgreSQL database',
    color: 'text-orange-500'
  },
  {
    id: 'portfolio',
    title: 'Portfolio Site',
    description: 'Personal portfolio website',
    icon: Briefcase,
    prompt: 'Create a modern portfolio website with projects showcase and contact form',
    color: 'text-pink-500'
  },
  {
    id: 'game',
    title: 'Simple Game',
    description: 'Interactive browser game',
    icon: Gamepad2,
    prompt: 'Build a simple interactive browser game with scoring and levels',
    color: 'text-indigo-500'
  },
  {
    id: 'learning',
    title: 'Learning Platform',
    description: 'Online course website',
    icon: GraduationCap,
    prompt: 'Create an online learning platform with courses, lessons, and progress tracking',
    color: 'text-cyan-500'
  },
  {
    id: 'health',
    title: 'Health Tracker',
    description: 'Fitness and wellness app',
    icon: Heart,
    prompt: 'Build a health tracking app with exercise logging, meal planning, and progress charts',
    color: 'text-red-500'
  }
];

interface QuickActionsProps {
  onSelectAction: (prompt: string) => void;
}

export function QuickActions({ onSelectAction }: QuickActionsProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Zap className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold">Quick Start</h3>
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        {quickActions.map((action) => {
          const Icon = action.icon;
          return (
            <Card
              key={action.id}
              className="p-4 cursor-pointer hover:shadow-md transition-shadow hover:border-primary/50"
              onClick={() => onSelectAction(action.prompt)}
            >
              <div className="flex items-start gap-3">
                <div className={cn("mt-0.5", action.color)}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-sm mb-1">{action.title}</h4>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {action.description}
                  </p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="pt-4 border-t">
        <p className="text-xs text-muted-foreground text-center">
          Click any card to start building with AI assistance
        </p>
      </div>
    </div>
  );
}