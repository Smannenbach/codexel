import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Bot, CheckCircle, Circle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Agent } from '@shared/schema';

interface AgentStatusProps {
  agents: Agent[];
}

export function AgentStatus({ agents }: AgentStatusProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'idle':
        return <Circle className="w-3 h-3" />;
      case 'active':
      case 'working':
        return <Loader2 className="w-3 h-3 animate-spin" />;
      case 'completed':
        return <CheckCircle className="w-3 h-3" />;
      default:
        return <Circle className="w-3 h-3" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'idle':
        return 'text-muted-foreground';
      case 'active':
        return 'text-blue-500';
      case 'working':
        return 'text-yellow-500';
      case 'completed':
        return 'text-green-500';
      default:
        return 'text-muted-foreground';
    }
  };

  return (
    <div className="h-full bg-muted/30">
      <div className="p-4 border-b">
        <h3 className="font-semibold">AI Agents</h3>
        <p className="text-xs text-muted-foreground mt-1">
          Your development team
        </p>
      </div>

      <ScrollArea className="h-[calc(100%-80px)]">
        <div className="p-4 space-y-3">
          {agents.length === 0 ? (
            <div className="text-center py-8">
              <Bot className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Agents will appear here when you start building
              </p>
            </div>
          ) : (
            agents.map((agent) => (
              <div
                key={agent.id}
                className="bg-background rounded-lg p-3 space-y-2 border"
              >
                <div className="flex items-start gap-3">
                  <Avatar 
                    className="w-8 h-8" 
                    style={{ backgroundColor: agent.color + '20' }}
                  >
                    <AvatarFallback style={{ backgroundColor: agent.color + '20' }}>
                      <span className="text-lg">{agent.icon || '🤖'}</span>
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-sm">{agent.name}</h4>
                      <Badge variant="outline" className="text-xs">
                        {agent.role}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-1 mt-1">
                      <span className={cn("flex items-center gap-1", getStatusColor(agent.status))}>
                        {getStatusIcon(agent.status)}
                        <span className="text-xs capitalize">{agent.status}</span>
                      </span>
                    </div>

                    {agent.description && (
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {agent.description}
                      </p>
                    )}

                    <p className="text-xs text-muted-foreground mt-1">
                      Model: {agent.model}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}