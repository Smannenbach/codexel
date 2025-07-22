import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  DragDropContext, 
  Droppable, 
  Draggable,
  DropResult 
} from '@hello-pangea/dnd';
import {
  Clock,
  Play,
  Pause,
  Trash2,
  GripVertical,
  AlertCircle,
  CheckCircle,
  Loader2,
  Plus,
  Edit3,
  Archive
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface QueueItem {
  id: string;
  prompt: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'paused';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  estimatedTime?: number;
  result?: string;
  error?: string;
  tags?: string[];
}

interface PromptQueueProps {
  onAddPrompt?: (prompt: string) => void;
  onProcessQueue?: () => void;
  className?: string;
}

export function PromptQueue({ onAddPrompt, onProcessQueue, className }: PromptQueueProps) {
  const [queue, setQueue] = useState<QueueItem[]>([
    {
      id: '1',
      prompt: 'Create a professional loan officer website with mortgage calculators',
      status: 'processing',
      priority: 'high',
      createdAt: new Date(Date.now() - 1000 * 60 * 5),
      startedAt: new Date(Date.now() - 1000 * 60 * 2),
      estimatedTime: 180,
      tags: ['website', 'financial']
    },
    {
      id: '2', 
      prompt: 'Add user authentication with social login options',
      status: 'pending',
      priority: 'normal',
      createdAt: new Date(Date.now() - 1000 * 60 * 3),
      estimatedTime: 120,
      tags: ['auth', 'feature']
    },
    {
      id: '3',
      prompt: 'Integrate Stripe payment processing for subscriptions',
      status: 'pending',
      priority: 'normal',
      createdAt: new Date(Date.now() - 1000 * 60 * 2),
      estimatedTime: 150,
      tags: ['payments', 'integration']
    },
    {
      id: '4',
      prompt: 'Deploy to production with SSL certificates',
      status: 'pending',
      priority: 'low',
      createdAt: new Date(Date.now() - 1000 * 60 * 1),
      estimatedTime: 60,
      tags: ['deployment']
    }
  ]);

  const [isProcessing, setIsProcessing] = useState(true);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(queue);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setQueue(items);
  };

  const removeFromQueue = (id: string) => {
    setQueue(queue.filter(item => item.id !== id));
  };

  const pauseItem = (id: string) => {
    setQueue(queue.map(item => 
      item.id === id 
        ? { ...item, status: item.status === 'paused' ? 'pending' : 'paused' }
        : item
    ));
  };

  const changePriority = (id: string, priority: QueueItem['priority']) => {
    setQueue(queue.map(item => 
      item.id === id ? { ...item, priority } : item
    ));
  };

  const getStatusIcon = (status: QueueItem['status']) => {
    switch (status) {
      case 'processing':
        return <Loader2 className="w-4 h-4 animate-spin text-blue-500" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'paused':
        return <Pause className="w-4 h-4 text-yellow-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority: QueueItem['priority']) => {
    switch (priority) {
      case 'urgent':
        return 'destructive';
      case 'high':
        return 'default';
      case 'normal':
        return 'secondary';
      case 'low':
        return 'outline';
    }
  };

  const activeCount = queue.filter(item => 
    item.status === 'processing' || item.status === 'pending'
  ).length;

  const completedCount = queue.filter(item => 
    item.status === 'completed'
  ).length;

  return (
    <div className={cn("flex flex-col h-full", className)}>
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-lg">Prompt Queue</h3>
            <p className="text-sm text-muted-foreground">
              {activeCount} active • {completedCount} completed
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant={isProcessing ? "secondary" : "default"}
              size="sm"
              onClick={() => setIsProcessing(!isProcessing)}
            >
              {isProcessing ? (
                <>
                  <Pause className="w-4 h-4 mr-1" />
                  Pause
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-1" />
                  Resume
                </>
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onAddPrompt?.('')}
            >
              <Plus className="w-4 h-4 mr-1" />
              Add
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
            <span className="text-muted-foreground">Processing</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-gray-300 rounded-full" />
            <span className="text-muted-foreground">Queued</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-green-500 rounded-full" />
            <span className="text-muted-foreground">Completed</span>
          </div>
        </div>
      </div>

      {/* Queue List */}
      <ScrollArea className="flex-1">
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="queue">
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="p-4 space-y-3"
              >
                {queue.map((item, index) => (
                  <Draggable 
                    key={item.id} 
                    draggableId={item.id} 
                    index={index}
                    isDragDisabled={item.status === 'processing'}
                  >
                    {(provided, snapshot) => (
                      <Card
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className={cn(
                          "p-4 transition-all",
                          snapshot.isDragging && "shadow-lg",
                          selectedItem === item.id && "ring-2 ring-primary",
                          item.status === 'processing' && "border-blue-500 bg-blue-50/50 dark:bg-blue-950/20"
                        )}
                        onClick={() => setSelectedItem(item.id)}
                      >
                        <div className="flex items-start gap-3">
                          <div
                            {...provided.dragHandleProps}
                            className={cn(
                              "mt-1",
                              item.status === 'processing' && "opacity-50 cursor-not-allowed"
                            )}
                          >
                            <GripVertical className="w-4 h-4 text-muted-foreground" />
                          </div>

                          <div className="flex-1 space-y-2">
                            <div className="flex items-start justify-between gap-2">
                              <p className="text-sm font-medium leading-relaxed">
                                {item.prompt}
                              </p>
                              <div className="flex items-center gap-1">
                                {getStatusIcon(item.status)}
                                <Badge variant={getPriorityColor(item.priority)} className="text-xs">
                                  {item.priority}
                                </Badge>
                              </div>
                            </div>

                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                {item.tags?.map(tag => (
                                  <Badge key={tag} variant="outline" className="text-xs">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>

                              <div className="flex items-center gap-1">
                                {item.status === 'pending' && (
                                  <>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-7 w-7"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        pauseItem(item.id);
                                      }}
                                    >
                                      <Pause className="w-3 h-3" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-7 w-7"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        removeFromQueue(item.id);
                                      }}
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </Button>
                                  </>
                                )}
                                {item.status === 'paused' && (
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      pauseItem(item.id);
                                    }}
                                  >
                                    <Play className="w-3 h-3" />
                                  </Button>
                                )}
                                {item.status === 'completed' && (
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      removeFromQueue(item.id);
                                    }}
                                  >
                                    <Archive className="w-3 h-3" />
                                  </Button>
                                )}
                              </div>
                            </div>

                            {item.status === 'processing' && item.estimatedTime && (
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <Clock className="w-3 h-3" />
                                <span>Est. {Math.ceil(item.estimatedTime / 60)} min remaining</span>
                                <div className="flex-1 h-1 bg-gray-200 rounded-full overflow-hidden">
                                  <div 
                                    className="h-full bg-blue-500 transition-all duration-1000"
                                    style={{ width: '30%' }}
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </Card>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </ScrollArea>

      {/* Footer Status */}
      <div className="p-4 border-t bg-muted/50">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            Queue processing: {isProcessing ? 'Active' : 'Paused'}
          </span>
          <span className="text-muted-foreground">
            Next up: {queue.find(item => item.status === 'pending')?.prompt.slice(0, 30)}...
          </span>
        </div>
      </div>
    </div>
  );
}