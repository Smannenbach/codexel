import { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { AI_MODELS } from '@/lib/ai-models';
import { Brain, Zap, DollarSign, Gauge } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ModelSelectorProps {
  selectedModel: string;
  onModelChange: (model: string) => void;
  showDetails?: boolean;
}

export function ModelSelector({ selectedModel, onModelChange, showDetails = true }: ModelSelectorProps) {
  const currentModel = AI_MODELS[selectedModel] || AI_MODELS['gpt-4-turbo'];
  
  const getSpeedScore = (responseTime: string) => {
    switch (responseTime) {
      case 'fast': return 90;
      case 'medium': return 60;
      case 'slow': return 30;
      default: return 50;
    }
  };

  const getCostScore = (costPerToken: number) => {
    const maxCost = Math.max(...Object.values(AI_MODELS).map(m => m.costPerToken));
    return Math.round((1 - costPerToken / maxCost) * 100);
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium mb-2 block">AI Model</label>
        <Select value={selectedModel} onValueChange={onModelChange}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select a model" />
          </SelectTrigger>
          <SelectContent>
            {Object.values(AI_MODELS).map((model) => (
              <SelectItem key={model.id} value={model.id}>
                <div className="flex items-center gap-2">
                  <Brain className="w-4 h-4" />
                  <span>{model.name}</span>
                  <Badge variant="secondary" className="ml-2 text-xs">
                    {model.provider}
                  </Badge>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {showDetails && (
        <Card className="p-4 space-y-3">
          <div>
            <h4 className="font-semibold text-sm mb-1">{currentModel.name}</h4>
            <p className="text-xs text-muted-foreground">{currentModel.description}</p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-yellow-500" />
                <span>Speed</span>
              </div>
              <span className="text-muted-foreground">{currentModel.responseTime}</span>
            </div>
            <Progress value={getSpeedScore(currentModel.responseTime)} className="h-2" />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-green-500" />
                <span>Cost Efficiency</span>
              </div>
              <span className="text-muted-foreground">${currentModel.costPerToken}/1K tokens</span>
            </div>
            <Progress value={getCostScore(currentModel.costPerToken)} className="h-2" />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <Gauge className="w-4 h-4 text-blue-500" />
                <span>Context Window</span>
              </div>
              <span className="text-muted-foreground">{currentModel.contextWindow.toLocaleString()} tokens</span>
            </div>
          </div>

          <div className="pt-2 border-t">
            <p className="text-xs font-medium mb-1">Capabilities</p>
            <div className="flex flex-wrap gap-1">
              {currentModel.capabilities.map((cap) => (
                <Badge key={cap} variant="outline" className="text-xs">
                  {cap}
                </Badge>
              ))}
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}