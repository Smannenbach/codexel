import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle2, 
  Circle, 
  Clock, 
  TrendingUp,
  Zap,
  Users,
  Code,
  Layout,
  TestTube,
  Rocket
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProgressTrackerProps {
  projectProgress: number;
  checklist: any[];
  agents: any[];
}

interface CategoryProgress {
  name: string;
  icon: React.ElementType;
  color: string;
  completed: number;
  total: number;
}

export function ProgressTracker({ projectProgress = 0, checklist = [], agents = [] }: ProgressTrackerProps) {
  // Calculate category progress
  const categories: CategoryProgress[] = [
    {
      name: 'Planning',
      icon: Layout,
      color: 'text-blue-500',
      completed: checklist.filter(item => item.category === 'planning' && item.completed).length,
      total: checklist.filter(item => item.category === 'planning').length || 1
    },
    {
      name: 'Architecture',
      icon: Code,
      color: 'text-purple-500',
      completed: checklist.filter(item => item.category === 'architecture' && item.completed).length,
      total: checklist.filter(item => item.category === 'architecture').length || 1
    },
    {
      name: 'Development',
      icon: Zap,
      color: 'text-green-500',
      completed: checklist.filter(item => item.category === 'development' && item.completed).length,
      total: checklist.filter(item => item.category === 'development').length || 1
    },
    {
      name: 'Testing',
      icon: TestTube,
      color: 'text-orange-500',
      completed: checklist.filter(item => item.category === 'testing' && item.completed).length,
      total: checklist.filter(item => item.category === 'testing').length || 1
    },
    {
      name: 'Deployment',
      icon: Rocket,
      color: 'text-red-500',
      completed: checklist.filter(item => item.category === 'deployment' && item.completed).length,
      total: checklist.filter(item => item.category === 'deployment').length || 1
    }
  ];

  // Calculate active agents
  const activeAgents = agents.filter(agent => agent.status === 'working').length;

  // Estimated completion time (mock calculation)
  const remainingTasks = checklist.filter(item => !item.completed).length;
  const avgTimePerTask = 15; // minutes
  const estimatedMinutes = remainingTasks * avgTimePerTask;
  const estimatedHours = Math.ceil(estimatedMinutes / 60);

  return (
    <div className="p-6 space-y-6">
      <div>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-2xl font-semibold">Project Progress</h2>
          <Badge variant={projectProgress >= 80 ? "default" : "secondary"} className="text-lg px-3 py-1">
            {projectProgress}%
          </Badge>
        </div>
        <Progress value={projectProgress} className="h-4" />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-8 h-8 text-green-500" />
            <div>
              <p className="text-sm text-muted-foreground">Completed Tasks</p>
              <p className="text-2xl font-bold">
                {checklist.filter(item => item.completed).length}/{checklist.length}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <Users className="w-8 h-8 text-blue-500" />
            <div>
              <p className="text-sm text-muted-foreground">Active Agents</p>
              <p className="text-2xl font-bold">{activeAgents}/{agents.length}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <Clock className="w-8 h-8 text-orange-500" />
            <div>
              <p className="text-sm text-muted-foreground">Est. Completion</p>
              <p className="text-2xl font-bold">~{estimatedHours}h</p>
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          Progress by Category
        </h3>
        <div className="space-y-4">
          {categories.map((category) => {
            const Icon = category.icon;
            const percentage = category.total > 0 
              ? Math.round((category.completed / category.total) * 100)
              : 0;

            return (
              <div key={category.name}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Icon className={cn("w-4 h-4", category.color)} />
                    <span className="font-medium">{category.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      {category.completed}/{category.total}
                    </span>
                    <Badge variant="secondary">{percentage}%</Badge>
                  </div>
                </div>
                <Progress value={percentage} className="h-2" />
              </div>
            );
          })}
        </div>
      </Card>

      <Card className="p-4 bg-primary/5 border-primary/20">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-full">
            <Zap className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="font-medium">Velocity Insight</p>
            <p className="text-sm text-muted-foreground">
              {activeAgents > 2 
                ? "Multiple agents working in parallel - high velocity!" 
                : "Consider activating more agents to increase development speed"}
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}