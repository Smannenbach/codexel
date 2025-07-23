import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Volume2, 
  VolumeX, 
  Waves, 
  Shield,
  TrendingDown,
  Zap
} from 'lucide-react';

interface NoiseReductionIndicatorProps {
  isActive: boolean;
  audioLevels: { volume: number; noise: number; quality: 'excellent' | 'good' | 'fair' | 'poor' };
  className?: string;
}

export default function NoiseReductionIndicator({ 
  isActive, 
  audioLevels, 
  className = '' 
}: NoiseReductionIndicatorProps) {
  if (!isActive) return null;

  const getQualityColor = (quality: string) => {
    switch (quality) {
      case 'excellent': return 'text-green-400 border-green-500/30 bg-green-500/10';
      case 'good': return 'text-blue-400 border-blue-500/30 bg-blue-500/10';
      case 'fair': return 'text-yellow-400 border-yellow-500/30 bg-yellow-500/10';
      case 'poor': return 'text-red-400 border-red-500/30 bg-red-500/10';
      default: return 'text-muted-foreground border-muted bg-muted/10';
    }
  };

  const getNoiseReductionLevel = () => {
    if (audioLevels.noise < 10) return { level: 'Excellent', percentage: 95 };
    if (audioLevels.noise < 20) return { level: 'Very Good', percentage: 85 };
    if (audioLevels.noise < 30) return { level: 'Good', percentage: 70 };
    if (audioLevels.noise < 40) return { level: 'Fair', percentage: 50 };
    return { level: 'Processing', percentage: 30 };
  };

  const noiseReduction = getNoiseReductionLevel();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`fixed top-4 right-4 z-50 ${className}`}
    >
      <Card className="bg-background/95 backdrop-blur-sm border-purple-500/20 min-w-[280px]">
        <CardContent className="p-4">
          <div className="space-y-3">
            {/* Header */}
            <div className="flex items-center gap-2">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              >
                <Zap className="w-4 h-4 text-purple-400" />
              </motion.div>
              <span className="text-sm font-medium text-purple-400">
                AI Noise Reduction Active
              </span>
              <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs">
                LIVE
              </Badge>
            </div>

            {/* Processing Indicators */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="space-y-1">
                <div className="flex items-center gap-1">
                  <Shield className="w-3 h-3 text-blue-400" />
                  <span className="text-muted-foreground">Filtering</span>
                </div>
                <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-blue-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${noiseReduction.percentage}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
                <span className="text-blue-400">{noiseReduction.level}</span>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-1">
                  <TrendingDown className="w-3 h-3 text-green-400" />
                  <span className="text-muted-foreground">Suppression</span>
                </div>
                <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-green-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.max(10, 100 - audioLevels.noise * 2)}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
                <span className="text-green-400">
                  {Math.max(10, 100 - audioLevels.noise * 2).toFixed(0)}% Reduced
                </span>
              </div>
            </div>

            {/* Audio Quality */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {audioLevels.volume > 20 ? 
                  <Volume2 className="w-4 h-4 text-green-400" /> : 
                  <VolumeX className="w-4 h-4 text-yellow-400" />
                }
                <span className="text-sm text-muted-foreground">Quality:</span>
              </div>
              <Badge className={`text-xs ${getQualityColor(audioLevels.quality)}`}>
                {audioLevels.quality.toUpperCase()}
              </Badge>
            </div>

            {/* Real-time Levels */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <div className="text-muted-foreground mb-1">Signal</div>
                <div className="flex items-center gap-1">
                  <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-green-500 transition-all duration-100" 
                      style={{ width: `${Math.min(audioLevels.volume * 2, 100)}%` }}
                    />
                  </div>
                  <span className="text-green-400 w-8">{audioLevels.volume}</span>
                </div>
              </div>
              
              <div>
                <div className="text-muted-foreground mb-1">Noise</div>
                <div className="flex items-center gap-1">
                  <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-red-500 transition-all duration-100" 
                      style={{ width: `${Math.min(audioLevels.noise * 3, 100)}%` }}
                    />
                  </div>
                  <span className="text-red-400 w-8">{audioLevels.noise}</span>
                </div>
              </div>
            </div>

            {/* Processing Effects */}
            <div className="pt-2 border-t border-muted/50">
              <div className="grid grid-cols-2 gap-1 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                  Echo Cancel
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
                  Auto Gain
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-pulse" />
                  Compressor
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-pulse" />
                  Filter Chain
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}