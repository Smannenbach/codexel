import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Plus, 
  Trash2, 
  ChevronUp, 
  ChevronDown, 
  Play, 
  Clock,
  ArrowRight
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface QueuedPrompt {
  id: string;
  prompt: string;
  priority: number;
  status: 'queued' | 'processing' | 'completed';
  queuedAt: Date;
  estimatedTime?: string;
}

interface PromptQueueProps {
  queuedPrompts: QueuedPrompt[];
  onAddToQueue: (prompt: string) => void;
  onRemoveFromQueue: (id: string) => void;
  onReorderQueue: (fromIndex: number, toIndex: number) => void;
  onProcessNext: () => void;
  isProcessing: boolean;
}

export function PromptQueue({
  queuedPrompts = [],
  onAddToQueue,
  onRemoveFromQueue,
  onReorderQueue,
  onProcessNext,
  isProcessing = false
}: PromptQueueProps) {
  const [newPrompt, setNewPrompt] = useState('');

  const handleAddPrompt = () => {
    if (newPrompt.trim()) {
      onAddToQueue(newPrompt.trim());
      setNewPrompt('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.shiftKey) {
      e.preventDefault();
      handleAddPrompt();
    }
  };

  const queuedItems = queuedPrompts.filter(p => p.status === 'queued');
  const currentItem = queuedPrompts.find(p => p.status === 'processing');

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold">Prompt Queue</h3>
            <p className="text-sm text-muted-foreground">
              Stack prompts to prevent interrupting AI work
            </p>
          </div>
          <Badge variant="secondary">
            {queuedItems.length} Queued
          </Badge>
        </div>

        {/* Add new prompt */}
        <div className="space-y-2">
          <div className="flex gap-2">
            <Input
              placeholder="Add prompt to queue (Shift+Enter to add)"
              value={newPrompt}
              onChange={(e) => setNewPrompt(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1"
            />
            <Button 
              onClick={handleAddPrompt}
              disabled={!newPrompt.trim()}
              size="icon"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Tip: Use Shift+Enter to quickly add prompts without interrupting current work
          </p>
        </div>

        {/* Current processing item */}
        {currentItem && (
          <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
              <span className="font-medium text-sm">Currently Processing</span>
              <Badge variant="default" className="ml-auto">Active</Badge>
            </div>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {currentItem.prompt}
            </p>
            {currentItem.estimatedTime && (
              <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                <Clock className="w-3 h-3" />
                Est. {currentItem.estimatedTime}
              </div>
            )}
          </div>
        )}

        {/* Queue controls */}
        {queuedItems.length > 0 && (
          <div className="flex items-center gap-2">
            <Button
              onClick={onProcessNext}
              disabled={isProcessing || queuedItems.length === 0}
              variant="default"
              size="sm"
            >
              <Play className="w-4 h-4 mr-2" />
              Process Next
            </Button>
            <span className="text-sm text-muted-foreground">
              {queuedItems.length} prompt{queuedItems.length !== 1 ? 's' : ''} waiting
            </span>
          </div>
        )}

        {/* Queue list */}
        <ScrollArea className="h-[300px]">
          <div className="space-y-2">
            {queuedItems.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No prompts in queue</p>
                <p className="text-xs">Add prompts above to get started</p>
              </div>
            ) : (
              queuedItems.map((prompt, index) => (
                <QueueItem
                  key={prompt.id}
                  prompt={prompt}
                  index={index}
                  totalItems={queuedItems.length}
                  onRemove={() => onRemoveFromQueue(prompt.id)}
                  onMoveUp={() => index > 0 && onReorderQueue(index, index - 1)}
                  onMoveDown={() => index < queuedItems.length - 1 && onReorderQueue(index, index + 1)}
                />
              ))
            )}
          </div>
        </ScrollArea>

        {/* Queue info */}
        <div className="text-xs text-muted-foreground space-y-1">
          <p>• Prompts are processed in order from top to bottom</p>
          <p>• Use reorder buttons to change priority</p>
          <p>• AI will maintain context between queued prompts</p>
        </div>
      </div>
    </Card>
  );
}

interface QueueItemProps {
  prompt: QueuedPrompt;
  index: number;
  totalItems: number;
  onRemove: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}

function QueueItem({ 
  prompt, 
  index, 
  totalItems, 
  onRemove, 
  onMoveUp, 
  onMoveDown 
}: QueueItemProps) {
  return (
    <div className="p-3 bg-muted/50 rounded-lg border">
      <div className="flex items-start gap-3">
        <div className="flex flex-col gap-1 mt-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={onMoveUp}
            disabled={index === 0}
          >
            <ChevronUp className="w-3 h-3" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={onMoveDown}
            disabled={index === totalItems - 1}
          >
            <ChevronDown className="w-3 h-3" />
          </Button>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="outline" className="text-xs">
              #{index + 1}
            </Badge>
            <span className="text-xs text-muted-foreground">
              Queued {prompt.queuedAt.toLocaleTimeString()}
            </span>
          </div>
          <p className="text-sm line-clamp-2">{prompt.prompt}</p>
          {prompt.estimatedTime && (
            <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
              <Clock className="w-3 h-3" />
              Est. {prompt.estimatedTime}
            </div>
          )}
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 text-destructive hover:text-destructive"
          onClick={onRemove}
        >
          <Trash2 className="w-3 h-3" />
        </Button>
      </div>
    </div>
  );
}