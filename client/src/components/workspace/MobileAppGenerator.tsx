import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  Smartphone, 
  Download, 
  Zap, 
  Code, 
  Palette, 
  Settings, 
  Play,
  CheckCircle,
  AlertTriangle,
  Clock,
  Monitor,
  Globe,
  FileCode,
  Package
} from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface MobileAppConfig {
  id: string;
  name: string;
  platform: 'react-native' | 'flutter' | 'native-ios' | 'native-android' | 'pwa';
  template: string;
  features: MobileFeature[];
  design: {
    primaryColor: string;
    secondaryColor: string;
    theme: 'light' | 'dark' | 'auto';
    typography: string;
  };
  navigation: NavigationType;
  integrations: Integration[];
  created: string;
  lastUpdated: string;
}

interface MobileFeature {
  id: string;
  name: string;
  type: 'authentication' | 'push-notifications' | 'offline-sync' | 'camera' | 'geolocation' | 'payments' | 'social-sharing' | 'analytics' | 'biometrics' | 'ar-vr';
  enabled: boolean;
  config: Record<string, any>;
}

interface NavigationType {
  type: 'tab' | 'drawer' | 'stack' | 'hybrid';
  screens: Screen[];
}

interface Screen {
  id: string;
  name: string;
  route: string;
  component: string;
  icon?: string;
  protected: boolean;
}

interface Integration {
  id: string;
  service: 'firebase' | 'supabase' | 'stripe' | 'twilio' | 'google-maps' | 'analytics' | 'crashlytics';
  enabled: boolean;
  config: Record<string, any>;
}

interface GenerationProgress {
  stage: 'analyzing' | 'scaffolding' | 'components' | 'features' | 'integration' | 'testing' | 'packaging' | 'complete';
  progress: number;
  message: string;
  files: GeneratedFile[];
  logs: string[];
}

interface GeneratedFile {
  path: string;
  content: string;
  type: 'component' | 'screen' | 'service' | 'config' | 'asset';
  size: number;
}

export default function MobileAppGenerator() {
  const [selectedPlatform, setSelectedPlatform] = useState<'react-native' | 'flutter' | 'native-ios' | 'native-android' | 'pwa'>('react-native');
  const [appName, setAppName] = useState('My Mobile App');
  const [webAppUrl, setWebAppUrl] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentAppId, setCurrentAppId] = useState<string | null>(null);
  const [selectedFeatures, setSelectedFeatures] = useState<Set<string>>(new Set(['auth', 'push']));
  const [primaryColor, setPrimaryColor] = useState('#007AFF');
  const [secondaryColor, setSecondaryColor] = useState('#5856D6');
  const [navigationType, setNavigationType] = useState<'tab' | 'drawer' | 'stack' | 'hybrid'>('tab');
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get generation progress
  const { data: progress } = useQuery<GenerationProgress>({
    queryKey: ['/api/mobile-app/progress', currentAppId],
    enabled: !!currentAppId && isGenerating,
    refetchInterval: 1000
  });

  // Get generated apps
  const { data: apps } = useQuery<MobileAppConfig[]>({
    queryKey: ['/api/mobile-app/apps']
  });

  // Generate mobile app mutation
  const generateAppMutation = useMutation({
    mutationFn: async (config: {
      webAppUrl: string;
      platform: string;
      options: Partial<MobileAppConfig>;
    }) => {
      const response = await apiRequest('POST', '/api/mobile-app/generate', config);
      return response.json();
    },
    onSuccess: (data: { appId: string }) => {
      setCurrentAppId(data.appId);
      setIsGenerating(true);
      toast({
        title: "Generation Started",
        description: "Your mobile app is being generated...",
      });
    },
    onError: (error) => {
      toast({
        title: "Generation Failed", 
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Download app files mutation
  const downloadFilesMutation = useMutation({
    mutationFn: async (appId: string) => {
      const response = await apiRequest('GET', `/api/mobile-app/download/${appId}`);
      return response.json();
    },
    onSuccess: (files: GeneratedFile[]) => {
      // Create ZIP download
      toast({
        title: "Download Ready",
        description: `${files.length} files ready for download`,
      });
    }
  });

  // Handle generation completion
  useEffect(() => {
    if (progress?.stage === 'complete' && progress.progress === 100) {
      setIsGenerating(false);
      queryClient.invalidateQueries({ queryKey: ['/api/mobile-app/apps'] });
      toast({
        title: "Generation Complete!",
        description: "Your mobile app has been generated successfully",
      });
    }
  }, [progress, queryClient, toast]);

  const handleGenerate = () => {
    if (!webAppUrl) {
      toast({
        title: "Missing URL",
        description: "Please provide a web app URL to convert",
        variant: "destructive",
      });
      return;
    }

    const features = Array.from(selectedFeatures).map(featureId => ({
      id: featureId,
      name: getFeatureName(featureId),
      type: featureId as any,
      enabled: true,
      config: {}
    }));

    generateAppMutation.mutate({
      webAppUrl,
      platform: selectedPlatform,
      options: {
        name: appName,
        features,
        design: {
          primaryColor,
          secondaryColor,
          theme: 'auto',
          typography: 'system'
        },
        navigation: {
          type: navigationType,
          screens: [
            {
              id: 'home',
              name: 'Home',
              route: '/home',
              component: 'HomeScreen',
              icon: 'home',
              protected: false
            }
          ]
        },
        integrations: []
      }
    });
  };

  const handleDownload = (appId: string) => {
    downloadFilesMutation.mutate(appId);
  };

  const toggleFeature = (featureId: string) => {
    const newFeatures = new Set(selectedFeatures);
    if (newFeatures.has(featureId)) {
      newFeatures.delete(featureId);
    } else {
      newFeatures.add(featureId);
    }
    setSelectedFeatures(newFeatures);
  };

  const getFeatureName = (featureId: string): string => {
    const names: Record<string, string> = {
      auth: 'Authentication',
      push: 'Push Notifications',
      offline: 'Offline Sync',
      camera: 'Camera Access',
      geolocation: 'Geolocation',
      payments: 'In-App Payments',
      social: 'Social Sharing',
      analytics: 'Analytics',
      biometrics: 'Biometric Auth',
      ar: 'AR/VR Features'
    };
    return names[featureId] || featureId;
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'react-native': return <Code className="w-4 h-4" />;
      case 'flutter': return <Zap className="w-4 h-4" />;
      case 'native-ios': return <Smartphone className="w-4 h-4" />;
      case 'native-android': return <Smartphone className="w-4 h-4" />;
      case 'pwa': return <Globe className="w-4 h-4" />;
      default: return <Monitor className="w-4 h-4" />;
    }
  };

  const getStageIcon = (stage: GenerationProgress['stage']) => {
    switch (stage) {
      case 'analyzing': return <Settings className="w-4 h-4 animate-spin" />;
      case 'scaffolding': return <Package className="w-4 h-4" />;
      case 'components': return <Code className="w-4 h-4" />;
      case 'features': return <Zap className="w-4 h-4" />;
      case 'integration': return <Settings className="w-4 h-4" />;
      case 'testing': return <CheckCircle className="w-4 h-4" />;
      case 'packaging': return <Package className="w-4 h-4" />;
      case 'complete': return <CheckCircle className="w-4 h-4 text-green-500" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const availableFeatures = [
    { id: 'auth', name: 'Authentication', description: 'User login and registration' },
    { id: 'push', name: 'Push Notifications', description: 'Real-time messaging' },
    { id: 'offline', name: 'Offline Sync', description: 'Work without internet' },
    { id: 'camera', name: 'Camera Access', description: 'Photo and video capture' },
    { id: 'geolocation', name: 'Geolocation', description: 'GPS and location services' },
    { id: 'payments', name: 'In-App Payments', description: 'Mobile payment processing' },
    { id: 'social', name: 'Social Sharing', description: 'Share to social platforms' },
    { id: 'analytics', name: 'Analytics', description: 'User behavior tracking' },
    { id: 'biometrics', name: 'Biometric Auth', description: 'Fingerprint and face ID' },
    { id: 'ar', name: 'AR/VR Features', description: 'Augmented reality support' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Mobile App Generator</h2>
          <p className="text-gray-400">Convert your web app to native mobile applications</p>
        </div>
        <Badge variant="secondary" className="bg-purple-500/20 text-purple-400">
          Phase 8 Feature
        </Badge>
      </div>

      <Tabs defaultValue="generate" className="space-y-6">
        <TabsList className="bg-gray-800">
          <TabsTrigger value="generate">Generate New App</TabsTrigger>
          <TabsTrigger value="existing">Existing Apps</TabsTrigger>
          <TabsTrigger value="preview">Live Preview</TabsTrigger>
        </TabsList>

        <TabsContent value="generate" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Configuration Panel */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  App Configuration
                </CardTitle>
                <CardDescription>Configure your mobile app settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="webUrl">Web App URL</Label>
                  <Input
                    id="webUrl"
                    placeholder="https://your-webapp.com"
                    value={webAppUrl}
                    onChange={(e) => setWebAppUrl(e.target.value)}
                    className="bg-gray-700 border-gray-600"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="appName">App Name</Label>
                  <Input
                    id="appName"
                    placeholder="My Mobile App"
                    value={appName}
                    onChange={(e) => setAppName(e.target.value)}
                    className="bg-gray-700 border-gray-600"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Target Platform</Label>
                  <Select value={selectedPlatform} onValueChange={(value: any) => setSelectedPlatform(value)}>
                    <SelectTrigger className="bg-gray-700 border-gray-600">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="react-native">React Native</SelectItem>
                      <SelectItem value="flutter">Flutter</SelectItem>
                      <SelectItem value="native-ios">Native iOS</SelectItem>
                      <SelectItem value="native-android">Native Android</SelectItem>
                      <SelectItem value="pwa">Progressive Web App</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Navigation Type</Label>
                  <Select value={navigationType} onValueChange={(value: any) => setNavigationType(value)}>
                    <SelectTrigger className="bg-gray-700 border-gray-600">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tab">Tab Navigation</SelectItem>
                      <SelectItem value="drawer">Drawer Navigation</SelectItem>
                      <SelectItem value="stack">Stack Navigation</SelectItem>
                      <SelectItem value="hybrid">Hybrid Navigation</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Primary Color</Label>
                    <Input
                      type="color"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="bg-gray-700 border-gray-600 h-10"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Secondary Color</Label>
                    <Input
                      type="color"
                      value={secondaryColor}
                      onChange={(e) => setSecondaryColor(e.target.value)}
                      className="bg-gray-700 border-gray-600 h-10"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Features Panel */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  Mobile Features
                </CardTitle>
                <CardDescription>Select features to include in your app</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-80">
                  <div className="space-y-3">
                    {availableFeatures.map((feature) => (
                      <div key={feature.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-700/50">
                        <div className="flex-1">
                          <div className="font-medium text-white">{feature.name}</div>
                          <div className="text-sm text-gray-400">{feature.description}</div>
                        </div>
                        <Switch
                          checked={selectedFeatures.has(feature.id)}
                          onCheckedChange={() => toggleFeature(feature.id)}
                        />
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* Generation Controls */}
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-white">Ready to Generate</h3>
                  <p className="text-gray-400">
                    Platform: {selectedPlatform} • Features: {selectedFeatures.size} selected
                  </p>
                </div>
                <Button
                  onClick={handleGenerate}
                  disabled={!webAppUrl || isGenerating}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  {isGenerating ? (
                    <>
                      <Settings className="w-4 h-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 mr-2" />
                      Generate Mobile App
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Generation Progress */}
          {isGenerating && progress && (
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  {getStageIcon(progress.stage)}
                  Generation Progress
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">{progress.message}</span>
                    <span className="text-white">{progress.progress}%</span>
                  </div>
                  <Progress value={progress.progress} className="h-2" />
                </div>

                {progress.logs.length > 0 && (
                  <div className="space-y-2">
                    <Label>Generation Logs</Label>
                    <ScrollArea className="h-32 rounded border border-gray-600 bg-gray-900 p-3">
                      <div className="space-y-1 text-xs font-mono">
                        {progress.logs.map((log, index) => (
                          <div key={index} className="text-gray-300">{log}</div>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>
                )}

                <div className="text-sm text-gray-400">
                  Generated {progress.files.length} files • Stage: {progress.stage}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="existing" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {apps?.map((app) => (
              <Card key={app.id} className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    {getPlatformIcon(app.platform)}
                    {app.name}
                  </CardTitle>
                  <CardDescription>
                    {app.platform} • {app.features.filter(f => f.enabled).length} features
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-wrap gap-1">
                    {app.features.filter(f => f.enabled).map((feature) => (
                      <Badge key={feature.id} variant="secondary" className="text-xs">
                        {feature.name}
                      </Badge>
                    ))}
                  </div>
                  
                  <div className="text-xs text-gray-400">
                    Created: {new Date(app.created).toLocaleDateString()}
                  </div>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDownload(app.id)}
                      className="flex-1"
                    >
                      <Download className="w-4 h-4 mr-1" />
                      Download
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {(!apps || apps.length === 0) && (
            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="py-8 text-center">
                <Smartphone className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">No Mobile Apps Yet</h3>
                <p className="text-gray-400 mb-4">Generate your first mobile app to get started</p>
                <Button variant="outline" onClick={() => setSelectedPlatform('react-native')}>
                  Generate First App
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="preview" className="space-y-6">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Monitor className="w-5 h-5" />
                Live Preview
              </CardTitle>
              <CardDescription>Preview your mobile app in real-time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="aspect-[9/19] bg-gray-900 rounded-3xl p-4 max-w-xs mx-auto border-2 border-gray-600">
                <div className="w-full h-full bg-gray-800 rounded-2xl flex items-center justify-center">
                  <div className="text-center">
                    <Smartphone className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                    <p className="text-gray-400 text-sm">Mobile App Preview</p>
                    <p className="text-gray-500 text-xs mt-2">Generate an app to see preview</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}