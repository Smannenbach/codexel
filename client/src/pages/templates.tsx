import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useLocation } from 'wouter';
import { 
  Search, 
  Rocket, 
  ShoppingCart, 
  MessageSquare, 
  Gamepad2,
  FileText,
  Calendar,
  BarChart,
  Users,
  Globe,
  Zap,
  Sparkles
} from 'lucide-react';

interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: React.ReactNode;
  features: string[];
  techStack: string[];
  estimatedTime: string;
  popularity: number;
}

const templates: Template[] = [
  {
    id: 'ecommerce',
    name: 'E-Commerce Store',
    description: 'Full-featured online store with payment processing, inventory management, and customer portal',
    category: 'Business',
    icon: <ShoppingCart className="w-6 h-6" />,
    features: ['Product catalog', 'Shopping cart', 'Payment integration', 'Order tracking', 'Admin dashboard'],
    techStack: ['React', 'Node.js', 'PostgreSQL', 'Stripe'],
    estimatedTime: '2-3 days',
    popularity: 95
  },
  {
    id: 'saas-dashboard',
    name: 'SaaS Dashboard',
    description: 'Modern analytics dashboard with real-time data visualization and user management',
    category: 'Business',
    icon: <BarChart className="w-6 h-6" />,
    features: ['Data visualization', 'User authentication', 'Team management', 'Billing integration', 'API access'],
    techStack: ['React', 'TypeScript', 'Chart.js', 'PostgreSQL'],
    estimatedTime: '3-4 days',
    popularity: 88
  },
  {
    id: 'ai-chatbot',
    name: 'AI Chatbot',
    description: 'Intelligent conversational interface with natural language processing and learning capabilities',
    category: 'AI/ML',
    icon: <MessageSquare className="w-6 h-6" />,
    features: ['Natural language processing', 'Context awareness', 'Multi-model support', 'Chat history', 'Custom training'],
    techStack: ['React', 'OpenAI API', 'WebSocket', 'PostgreSQL'],
    estimatedTime: '1-2 days',
    popularity: 92
  },
  {
    id: 'social-app',
    name: 'Social Network',
    description: 'Community platform with user profiles, posts, messaging, and social features',
    category: 'Social',
    icon: <Users className="w-6 h-6" />,
    features: ['User profiles', 'Posts & comments', 'Real-time messaging', 'Friend system', 'Notifications'],
    techStack: ['React', 'Node.js', 'Socket.io', 'PostgreSQL'],
    estimatedTime: '4-5 days',
    popularity: 85
  },
  {
    id: 'blog-cms',
    name: 'Blog & CMS',
    description: 'Content management system with rich text editor, SEO optimization, and analytics',
    category: 'Content',
    icon: <FileText className="w-6 h-6" />,
    features: ['Rich text editor', 'SEO optimization', 'Multi-author support', 'Comments system', 'Analytics'],
    techStack: ['React', 'MDX', 'Next.js', 'PostgreSQL'],
    estimatedTime: '2-3 days',
    popularity: 78
  },
  {
    id: 'booking-system',
    name: 'Booking System',
    description: 'Appointment scheduling platform with calendar integration and automated reminders',
    category: 'Business',
    icon: <Calendar className="w-6 h-6" />,
    features: ['Calendar view', 'Appointment booking', 'Email reminders', 'Payment processing', 'Staff management'],
    techStack: ['React', 'Node.js', 'Google Calendar API', 'PostgreSQL'],
    estimatedTime: '3-4 days',
    popularity: 82
  },
  {
    id: 'game-platform',
    name: 'Game Platform',
    description: 'Browser-based gaming platform with multiplayer support and leaderboards',
    category: 'Entertainment',
    icon: <Gamepad2 className="w-6 h-6" />,
    features: ['Real-time multiplayer', 'Leaderboards', 'User profiles', 'Game library', 'Chat system'],
    techStack: ['React', 'WebSocket', 'Canvas API', 'PostgreSQL'],
    estimatedTime: '4-5 days',
    popularity: 75
  },
  {
    id: 'portfolio',
    name: 'Portfolio Website',
    description: 'Professional portfolio with project showcase, blog, and contact form',
    category: 'Personal',
    icon: <Globe className="w-6 h-6" />,
    features: ['Project gallery', 'About section', 'Blog integration', 'Contact form', 'Analytics'],
    techStack: ['React', 'Tailwind CSS', 'EmailJS', 'Markdown'],
    estimatedTime: '1 day',
    popularity: 90
  }
];

export default function Templates() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [, navigate] = useLocation();

  const createProjectMutation = useMutation({
    mutationFn: async (template: Template) => {
      return await apiRequest('POST', '/api/projects', {
        name: `${template.name} Project`,
        description: `Building a ${template.name.toLowerCase()} using Codexel.ai`,
        config: {
          template: template.id,
          primaryModel: 'gpt-4-turbo',
          features: template.features,
          techStack: template.techStack
        }
      });
    },
    onSuccess: (data) => {
      navigate(`/workspace?project=${data.id}`);
    }
  });

  const categories = Array.from(new Set(templates.map(t => t.category)));
  
  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || template.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="h-screen flex flex-col bg-background">
      <div className="border-b">
        <div className="container mx-auto p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">Project Templates</h1>
              <p className="text-muted-foreground">
                Start with a pre-built template and customize it to your needs
              </p>
            </div>
            <Button onClick={() => navigate('/workspace')} variant="outline">
              <Sparkles className="w-4 h-4 mr-2" />
              Start from Scratch
            </Button>
          </div>

          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search templates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={selectedCategory === null ? "default" : "outline"}
                onClick={() => setSelectedCategory(null)}
              >
                All
              </Button>
              {categories.map(category => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="container mx-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTemplates.map(template => (
              <Card key={template.id} className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 bg-primary/10 rounded-lg">
                    {template.icon}
                  </div>
                  <Badge variant="secondary">
                    {template.popularity}% Popular
                  </Badge>
                </div>

                <h3 className="text-xl font-semibold mb-2">{template.name}</h3>
                <p className="text-sm text-muted-foreground mb-4">{template.description}</p>

                <div className="space-y-3 mb-4">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">Features</p>
                    <div className="flex flex-wrap gap-1">
                      {template.features.slice(0, 3).map((feature, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {feature}
                        </Badge>
                      ))}
                      {template.features.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{template.features.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">Tech Stack</p>
                    <div className="flex flex-wrap gap-1">
                      {template.techStack.map((tech, index) => (
                        <Badge key={index} className="text-xs">
                          {tech}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Zap className="w-3 h-3" />
                    <span>{template.estimatedTime}</span>
                  </div>
                  <Button 
                    onClick={() => createProjectMutation.mutate(template)}
                    disabled={createProjectMutation.isPending}
                  >
                    <Rocket className="w-4 h-4 mr-2" />
                    Use Template
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}