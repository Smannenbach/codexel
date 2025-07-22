import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ModelSelector } from './ModelSelector';
import { 
  Settings, 
  User, 
  Bell, 
  Shield, 
  Palette,
  Key,
  Save,
  AlertCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SettingsPanelProps {
  projectId: number;
  projectName: string;
  onModelChange?: (model: string) => void;
}

export function SettingsPanel({ projectId, projectName, onModelChange }: SettingsPanelProps) {
  const { toast } = useToast();
  const [selectedModel, setSelectedModel] = useState('gpt-4-turbo');
  const [settings, setSettings] = useState({
    autoSave: true,
    notifications: true,
    darkMode: false,
    codeCompletion: true,
    apiKey: '',
    budget: 25,
    maxTokens: 4096
  });

  const handleSave = () => {
    toast({
      title: "Settings Saved",
      description: "Your preferences have been updated successfully.",
    });
  };

  const handleModelChange = (model: string) => {
    setSelectedModel(model);
    if (onModelChange) {
      onModelChange(model);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-2">
        <Settings className="w-5 h-5" />
        <h2 className="text-xl font-semibold">Project Settings</h2>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="ai">AI Models</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4 mt-4">
          <Card className="p-6">
            <h3 className="font-semibold mb-4">Project Information</h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="project-name">Project Name</Label>
                <Input 
                  id="project-name" 
                  value={projectName} 
                  disabled 
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="budget">Monthly Budget ($)</Label>
                <Input 
                  id="budget" 
                  type="number" 
                  value={settings.budget}
                  onChange={(e) => setSettings({...settings, budget: parseInt(e.target.value)})}
                  className="mt-1"
                />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="font-semibold mb-4">Preferences</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Auto-save</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically save your work as you type
                  </p>
                </div>
                <Switch 
                  checked={settings.autoSave}
                  onCheckedChange={(checked) => setSettings({...settings, autoSave: checked})}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive updates about your project
                  </p>
                </div>
                <Switch 
                  checked={settings.notifications}
                  onCheckedChange={(checked) => setSettings({...settings, notifications: checked})}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Code Completion</Label>
                  <p className="text-sm text-muted-foreground">
                    Enable AI-powered code suggestions
                  </p>
                </div>
                <Switch 
                  checked={settings.codeCompletion}
                  onCheckedChange={(checked) => setSettings({...settings, codeCompletion: checked})}
                />
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="ai" className="space-y-4 mt-4">
          <Card className="p-6">
            <h3 className="font-semibold mb-4">AI Configuration</h3>
            <ModelSelector 
              selectedModel={selectedModel}
              onModelChange={handleModelChange}
              showDetails={true}
            />
            <div className="mt-6">
              <Label htmlFor="max-tokens">Max Tokens per Request</Label>
              <Input 
                id="max-tokens" 
                type="number" 
                value={settings.maxTokens}
                onChange={(e) => setSettings({...settings, maxTokens: parseInt(e.target.value)})}
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Higher values allow for longer responses but cost more
              </p>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4 mt-4">
          <Card className="p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Security Settings
            </h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="api-key">Custom API Key (Optional)</Label>
                <Input 
                  id="api-key" 
                  type="password"
                  placeholder="sk-..."
                  value={settings.apiKey}
                  onChange={(e) => setSettings({...settings, apiKey: e.target.value})}
                  className="mt-1"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Use your own API key for enhanced privacy
                </p>
              </div>
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
                <div className="flex gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5" />
                  <div className="text-sm text-amber-800 dark:text-amber-200">
                    <p className="font-medium">Security Notice</p>
                    <p className="text-xs mt-1">
                      Your code and data are encrypted and never shared with third parties.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="appearance" className="space-y-4 mt-4">
          <Card className="p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Palette className="w-4 h-4" />
              Appearance
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Dark Mode</Label>
                  <p className="text-sm text-muted-foreground">
                    Toggle dark theme for the workspace
                  </p>
                </div>
                <Switch 
                  checked={settings.darkMode}
                  onCheckedChange={(checked) => setSettings({...settings, darkMode: checked})}
                />
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end">
        <Button onClick={handleSave}>
          <Save className="w-4 h-4 mr-2" />
          Save Settings
        </Button>
      </div>
    </div>
  );
}