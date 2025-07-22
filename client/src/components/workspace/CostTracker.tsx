import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { DollarSign, TrendingUp, AlertCircle, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CostTrackerProps {
  totalCost: number;
  budget: number;
  modelCosts: { model: string; cost: number }[];
  dailyCosts: { date: string; cost: number }[];
}

export function CostTracker({ 
  totalCost = 0,
  budget = 25,
  modelCosts = [],
  dailyCosts = []
}: CostTrackerProps) {
  const budgetUsedPercentage = Math.min((totalCost / budget) * 100, 100);
  const isOverBudget = totalCost > budget;
  const remainingBudget = Math.max(budget - totalCost, 0);

  // Calculate daily average
  const dailyAverage = dailyCosts.length > 0 
    ? dailyCosts.reduce((sum, day) => sum + day.cost, 0) / dailyCosts.length
    : 0;

  // Estimate days remaining
  const daysRemaining = dailyAverage > 0 ? Math.floor(remainingBudget / dailyAverage) : null;

  return (
    <div className="space-y-4">
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-lg">Cost Tracking</h3>
          </div>
          {isOverBudget && (
            <Badge variant="destructive" className="flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              Over Budget
            </Badge>
          )}
        </div>

        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span>Total Spent</span>
              <span className={cn(
                "font-semibold",
                isOverBudget ? "text-destructive" : "text-foreground"
              )}>
                ${totalCost.toFixed(2)}
              </span>
            </div>
            <Progress 
              value={budgetUsedPercentage} 
              className={cn(
                "h-3",
                isOverBudget && "[&>div]:bg-destructive"
              )}
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>$0</span>
              <span>${budget}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Remaining Budget</p>
              <p className="text-2xl font-bold">
                ${remainingBudget.toFixed(2)}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Daily Average</p>
              <p className="text-2xl font-bold">
                ${dailyAverage.toFixed(2)}
              </p>
            </div>
          </div>

          {daysRemaining !== null && (
            <div className="bg-muted/50 rounded-lg p-3">
              <div className="flex items-center gap-2 text-sm">
                <TrendingUp className="w-4 h-4 text-primary" />
                <span>
                  At current rate, budget will last{' '}
                  <span className="font-semibold">{daysRemaining} days</span>
                </span>
              </div>
            </div>
          )}
        </div>
      </Card>

      {modelCosts.length > 0 && (
        <Card className="p-4">
          <h4 className="font-semibold mb-3 flex items-center gap-2">
            <Zap className="w-4 h-4" />
            Cost by Model
          </h4>
          <div className="space-y-3">
            {modelCosts
              .sort((a, b) => b.cost - a.cost)
              .map((item, index) => {
                const percentage = totalCost > 0 ? (item.cost / totalCost) * 100 : 0;
                return (
                  <div key={item.model}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="font-medium">{item.model}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">
                          {percentage.toFixed(0)}%
                        </span>
                        <span>${item.cost.toFixed(2)}</span>
                      </div>
                    </div>
                    <Progress value={percentage} className="h-1.5" />
                  </div>
                );
              })}
          </div>
        </Card>
      )}
    </div>
  );
}