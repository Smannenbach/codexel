import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Volume2, VolumeX, TestTube, Sparkles } from 'lucide-react';
import { audioManager } from '@/services/AudioManager';

interface AudioSettingsProps {
  className?: string;
}

export function AudioSettings({ className = '' }: AudioSettingsProps) {
  const [settings, setSettings] = useState(audioManager.getSettings());
  const [isTestingSound, setIsTestingSound] = useState(false);

  useEffect(() => {
    audioManager.updateSettings(settings);
  }, [settings]);

  const handleTestSound = async () => {
    setIsTestingSound(true);
    await audioManager.playTestSound();
    setTimeout(() => setIsTestingSound(false), 500);
  };

  const soundThemeDescriptions = {
    minimal: 'Clean, subtle tones for focused work',
    organic: 'Natural, harmonious sounds inspired by nature',
    digital: 'Sharp, precise electronic tones',
    ambient: 'Atmospheric, spacious soundscape'
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Volume2 className="w-5 h-5 text-primary" />
          Workspace Audio Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Master Enable/Disable */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label className="text-base">Enable Audio Feedback</Label>
            <div className="text-sm text-muted-foreground">
              Provides subtle audio cues for workspace interactions
            </div>
          </div>
          <Switch
            checked={settings.enabled}
            onCheckedChange={(enabled) => setSettings(prev => ({ ...prev, enabled }))}
          />
        </div>

        {settings.enabled && (
          <>
            {/* Master Volume */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Master Volume</Label>
                <span className="text-sm text-muted-foreground">
                  {Math.round(settings.volume * 100)}%
                </span>
              </div>
              <Slider
                value={[settings.volume]}
                onValueChange={([volume]) => setSettings(prev => ({ ...prev, volume }))}
                max={1}
                min={0}
                step={0.05}
                className="w-full"
              />
            </div>

            {/* Sound Theme */}
            <div className="space-y-2">
              <Label>Sound Theme</Label>
              <Select
                value={settings.soundTheme}
                onValueChange={(soundTheme: any) => setSettings(prev => ({ ...prev, soundTheme }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="minimal">
                    <div className="flex flex-col">
                      <span>Minimal</span>
                      <span className="text-xs text-muted-foreground">
                        {soundThemeDescriptions.minimal}
                      </span>
                    </div>
                  </SelectItem>
                  <SelectItem value="organic">
                    <div className="flex flex-col">
                      <span>Organic</span>
                      <span className="text-xs text-muted-foreground">
                        {soundThemeDescriptions.organic}
                      </span>
                    </div>
                  </SelectItem>
                  <SelectItem value="digital">
                    <div className="flex flex-col">
                      <span>Digital</span>
                      <span className="text-xs text-muted-foreground">
                        {soundThemeDescriptions.digital}
                      </span>
                    </div>
                  </SelectItem>
                  <SelectItem value="ambient">
                    <div className="flex flex-col">
                      <span>Ambient</span>
                      <span className="text-xs text-muted-foreground">
                        {soundThemeDescriptions.ambient}
                      </span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Spatial Audio */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Spatial Audio</Label>
                <div className="text-sm text-muted-foreground">
                  Sounds originate from their workspace location
                </div>
              </div>
              <Switch
                checked={settings.spatialAudio}
                onCheckedChange={(spatialAudio) => setSettings(prev => ({ ...prev, spatialAudio }))}
              />
            </div>

            {/* Adaptive Volume */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Adaptive Volume</Label>
                <div className="text-sm text-muted-foreground">
                  Automatically adjusts volume based on activity
                </div>
              </div>
              <Switch
                checked={settings.adaptiveVolume}
                onCheckedChange={(adaptiveVolume) => setSettings(prev => ({ ...prev, adaptiveVolume }))}
              />
            </div>

            {/* Test Sound Button */}
            <div className="pt-4 border-t">
              <Button
                onClick={handleTestSound}
                disabled={isTestingSound}
                variant="outline"
                className="w-full"
              >
                {isTestingSound ? (
                  <>
                    <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                    Playing Test Sound...
                  </>
                ) : (
                  <>
                    <TestTube className="w-4 h-4 mr-2" />
                    Test Audio Settings
                  </>
                )}
              </Button>
            </div>

            {/* Audio Feedback Types */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Audio Feedback Types</Label>
              <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                <div>• Panel resizing</div>
                <div>• Snap-to-grid</div>
                <div>• Message send/receive</div>
                <div>• Button interactions</div>
                <div>• Snapshot save/restore</div>
                <div>• AI agent activity</div>
                <div>• Success/error states</div>
                <div>• Notifications</div>
              </div>
            </div>
          </>
        )}

        {!settings.enabled && (
          <div className="flex items-center justify-center py-8 text-muted-foreground">
            <div className="text-center">
              <VolumeX className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Audio feedback is disabled</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}