import { useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@radix-ui/react-collapsible';
import { ChevronRight, ChevronDown, CheckCircle2, Circle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ChecklistItem } from '@shared/schema';

interface ChecklistPanelProps {
  items: ChecklistItem[];
  onToggleItem?: (itemId: number) => void;
  projectProgress: number;
}

export function ChecklistPanel({ items, onToggleItem, projectProgress }: ChecklistPanelProps) {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['Planning']));

  // Group items by category
  const groupedItems = items.reduce((acc, item) => {
    const category = item.category || 'Uncategorized';
    if (!acc[category]) acc[category] = [];
    acc[category].push(item);
    return acc;
  }, {} as Record<string, ChecklistItem[]>);

  const toggleCategory = (category: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case 'in_progress':
        return <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />;
      default:
        return <Circle className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-500';
      case 'in_progress':
        return 'text-blue-500';
      default:
        return 'text-muted-foreground';
    }
  };

  return (
    <div className="h-full bg-muted/30">
      <div className="p-4 border-b">
        <h3 className="font-semibold mb-2">Development Checklist</h3>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Overall Progress</span>
            <span className="font-medium">{projectProgress}%</span>
          </div>
          <Progress value={projectProgress} className="h-2" />
        </div>
      </div>

      <ScrollArea className="h-[calc(100%-120px)]">
        <div className="p-4 space-y-3">
          {Object.entries(groupedItems).map(([category, categoryItems]) => {
            const completedCount = categoryItems.filter(item => item.status === 'completed').length;
            const totalCount = categoryItems.length;
            const isExpanded = expandedCategories.has(category);

            return (
              <Collapsible
                key={category}
                open={isExpanded}
                onOpenChange={() => toggleCategory(category)}
              >
                <CollapsibleTrigger className="w-full">
                  <div className="flex items-center justify-between p-2 rounded hover:bg-accent/50 transition-colors">
                    <div className="flex items-center gap-2">
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                      <span className="font-medium">{category}</span>
                      <Badge variant="secondary" className="text-xs">
                        {completedCount}/{totalCount}
                      </Badge>
                    </div>
                  </div>
                </CollapsibleTrigger>

                <CollapsibleContent>
                  <div className="pl-6 space-y-2 mt-2">
                    {categoryItems.map((item) => (
                      <div
                        key={item.id}
                        className={cn(
                          "flex items-start gap-3 p-2 rounded hover:bg-accent/50 transition-colors",
                          item.status === 'completed' && "opacity-70"
                        )}
                      >
                        <button
                          onClick={() => onToggleItem?.(item.id)}
                          className="mt-0.5"
                        >
                          {getStatusIcon(item.status)}
                        </button>
                        
                        <div className="flex-1 space-y-1">
                          <div className={cn(
                            "text-sm",
                            item.status === 'completed' && "line-through"
                          )}>
                            {item.title}
                          </div>
                          
                          {item.description && (
                            <p className="text-xs text-muted-foreground">
                              {item.description}
                            </p>
                          )}

                          {item.assignedAgent && (
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline" className="text-xs">
                                {item.assignedAgent}
                              </Badge>
                              <span className={cn("text-xs", getStatusColor(item.status))}>
                                {item.status.replace('_', ' ')}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}