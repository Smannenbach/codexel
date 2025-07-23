import { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { 
  Upload, 
  Sparkles, 
  User, 
  Camera, 
  Palette, 
  Settings,
  Check,
  Wand2,
  Crown,
  Image as ImageIcon,
  Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface Avatar3DWizardProps {
  onAvatarCreated: (avatarData: AvatarData) => void;
  className?: string;
}

interface AvatarData {
  id: string;
  photoUrl: string;
  style: '3d-animated' | '3d-realistic' | 'professional-headshot';
  customizations: {
    skinTone?: string;
    hairColor?: string;
    eyeColor?: string;
    outfit?: string;
    background?: string;
    lighting?: string;
  };
  readyPlayerMeUrl?: string;
  generatedUrls?: {
    preview: string;
    fullBody: string;
    headshot: string;
  };
}

const AVATAR_STYLES = [
  {
    id: '3d-realistic' as const,
    name: '3D Realistic',
    description: 'Photorealistic 3D model that looks exactly like you',
    icon: <User className="w-6 h-6" />,
    badge: 'PREMIUM',
    features: ['Photorealistic features', 'Natural expressions', 'Professional quality'],
    preview: '/avatars/realistic-preview.jpg'
  },
  {
    id: '3d-animated' as const,
    name: '3D Animated',
    description: 'Stylized animated character with your likeness',
    icon: <Sparkles className="w-6 h-6" />,
    badge: 'POPULAR',
    features: ['Cartoon-style animation', 'Expressive movements', 'Fun and engaging'],
    preview: '/avatars/animated-preview.jpg'
  },
  {
    id: 'professional-headshot' as const,
    name: 'Professional Headshot',
    description: 'AI-enhanced professional photo for business use',
    icon: <Camera className="w-6 h-6" />,
    badge: 'BUSINESS',
    features: ['Business appropriate', 'Enhanced lighting', 'Professional background'],
    preview: '/avatars/professional-preview.jpg'
  }
];

const CUSTOMIZATION_OPTIONS = {
  skinTone: ['Fair', 'Light', 'Medium', 'Tan', 'Deep'],
  hairColor: ['Blonde', 'Brown', 'Black', 'Red', 'Gray', 'White'],
  eyeColor: ['Blue', 'Brown', 'Green', 'Hazel', 'Gray'],
  outfit: ['Business Suit', 'Casual Shirt', 'Professional Dress', 'Polo Shirt', 'Sweater'],
  background: ['Office', 'Studio White', 'Nature', 'Modern Interior', 'Abstract'],
  lighting: ['Natural', 'Studio', 'Warm', 'Cool', 'Dramatic']
};

export default function Avatar3DWizard({ onAvatarCreated, className = '' }: Avatar3DWizardProps) {
  const [step, setStep] = useState<'upload' | 'style' | 'customize' | 'processing' | 'complete'>('upload');
  const [selectedPhoto, setSelectedPhoto] = useState<string>('');
  const [selectedStyle, setSelectedStyle] = useState<AvatarData['style']>('3d-realistic');
  const [customizations, setCustomizations] = useState<AvatarData['customizations']>({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [generatedAvatar, setGeneratedAvatar] = useState<AvatarData | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handlePhotoUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type and size
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid File",
        description: "Please upload an image file (JPG, PNG, etc.)",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Please upload an image smaller than 10MB",
        variant: "destructive",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const photoUrl = e.target?.result as string;
      setSelectedPhoto(photoUrl);
      setStep('style');
      
      // Store in localStorage for persistence
      localStorage.setItem('codexel_avatar_photo', photoUrl);
    };
    reader.readAsDataURL(file);
  }, [toast]);

  const handleStyleSelect = (style: AvatarData['style']) => {
    setSelectedStyle(style);
    setStep('customize');
  };

  const handleCustomizationChange = (key: keyof AvatarData['customizations'], value: string) => {
    setCustomizations(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const generateAvatar = async () => {
    if (!selectedPhoto) return;

    setIsProcessing(true);
    setStep('processing');
    setProgress(0);

    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 5, 90));
      }, 200);

      // Convert base64 to blob for upload
      const response = await fetch(selectedPhoto);
      const blob = await response.blob();
      
      const formData = new FormData();
      formData.append('photo', blob, 'avatar-photo.jpg');
      formData.append('style', selectedStyle);
      formData.append('customizations', JSON.stringify(customizations));

      // API call to generate 3D avatar
      const avatarResponse = await apiRequest('POST', '/api/avatar/generate', formData);
      const avatarData: AvatarData = await avatarResponse.json();

      clearInterval(progressInterval);
      setProgress(100);

      setTimeout(() => {
        setGeneratedAvatar(avatarData);
        setStep('complete');
        onAvatarCreated(avatarData);
        
        // Store generated avatar data
        localStorage.setItem('codexel_avatar_data', JSON.stringify(avatarData));
        
        toast({
          title: "Avatar Created!",
          description: "Your personalized 3D avatar is ready to use.",
        });
      }, 1000);

    } catch (error) {
      console.error('Avatar generation error:', error);
      setStep('customize');
      toast({
        title: "Avatar Generation Failed",
        description: "Please try again or contact support.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const resetWizard = () => {
    setStep('upload');
    setSelectedPhoto('');
    setSelectedStyle('3d-realistic');
    setCustomizations({});
    setGeneratedAvatar(null);
    setProgress(0);
  };

  return (
    <Card className={`w-full max-w-4xl mx-auto ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wand2 className="w-5 h-5 text-purple-500" />
          3D Avatar Creation Wizard
        </CardTitle>
        <CardDescription>
          Transform your photo into a stunning 3D animated figure that looks and sounds just like you
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Progress Steps */}
        <div className="flex items-center justify-between">
          {['Upload', 'Style', 'Customize', 'Generate', 'Complete'].map((label, index) => (
            <div key={label} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                index <= ['upload', 'style', 'customize', 'processing', 'complete'].indexOf(step)
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-muted text-muted-foreground'
              }`}>
                {index < ['upload', 'style', 'customize', 'processing', 'complete'].indexOf(step) ? 
                  <Check className="w-4 h-4" /> : index + 1
                }
              </div>
              {index < 4 && <div className="w-12 h-0.5 bg-muted mx-2" />}
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {step === 'upload' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="text-center space-y-4">
                <div className="w-24 h-24 mx-auto bg-purple-500/10 rounded-full flex items-center justify-center">
                  <ImageIcon className="w-12 h-12 text-purple-500" />
                </div>
                <h3 className="text-xl font-semibold">Upload Your Photo</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Choose a clear, front-facing photo with good lighting. This will be the basis for your 3D avatar.
                </p>
              </div>

              <div 
                className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="w-8 h-8 mx-auto mb-4 text-muted-foreground" />
                <p className="text-sm text-muted-foreground mb-2">
                  Click to upload or drag and drop
                </p>
                <p className="text-xs text-muted-foreground">
                  JPG, PNG, or GIF (max 10MB)
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-green-500/10 rounded-lg border border-green-500/20">
                  <Check className="w-5 h-5 text-green-500 mb-2" />
                  <h4 className="font-medium text-green-400 mb-1">Good Photos</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Clear, front-facing</li>
                    <li>• Good lighting</li>
                    <li>• High resolution</li>
                    <li>• Neutral expression</li>
                  </ul>
                </div>
                <div className="p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
                  <Zap className="w-5 h-5 text-blue-500 mb-2" />
                  <h4 className="font-medium text-blue-400 mb-1">AI Processing</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Face detection</li>
                    <li>• Feature mapping</li>
                    <li>• 3D reconstruction</li>
                    <li>• Animation rigging</li>
                  </ul>
                </div>
                <div className="p-4 bg-purple-500/10 rounded-lg border border-purple-500/20">
                  <Crown className="w-5 h-5 text-purple-500 mb-2" />
                  <h4 className="font-medium text-purple-400 mb-1">Final Result</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Photorealistic 3D model</li>
                    <li>• Full animation support</li>
                    <li>• Voice synchronization</li>
                    <li>• Ready for use</li>
                  </ul>
                </div>
              </div>
            </motion.div>
          )}

          {step === 'style' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="text-center">
                <h3 className="text-xl font-semibold mb-2">Choose Your Avatar Style</h3>
                <p className="text-muted-foreground">
                  Select the type of 3D avatar you want to create
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {AVATAR_STYLES.map((style) => (
                  <motion.div
                    key={style.id}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleStyleSelect(style.id)}
                    className={`p-6 rounded-lg border-2 cursor-pointer transition-all ${
                      selectedStyle === style.id
                        ? 'border-primary bg-primary/5'
                        : 'border-muted hover:border-muted-foreground/50'
                    }`}
                  >
                    <div className="text-center space-y-4">
                      <div className="w-16 h-16 mx-auto bg-purple-500/10 rounded-full flex items-center justify-center">
                        {style.icon}
                      </div>
                      <div>
                        <div className="flex items-center justify-center gap-2 mb-1">
                          <h4 className="font-semibold">{style.name}</h4>
                          <Badge className={
                            style.badge === 'PREMIUM' ? 'bg-purple-500/20 text-purple-400' :
                            style.badge === 'POPULAR' ? 'bg-green-500/20 text-green-400' :
                            'bg-blue-500/20 text-blue-400'
                          }>
                            {style.badge}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">
                          {style.description}
                        </p>
                        <ul className="text-xs text-muted-foreground space-y-1">
                          {style.features.map((feature, idx) => (
                            <li key={idx}>• {feature}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="flex justify-center">
                <Button onClick={() => setStep('customize')} disabled={!selectedStyle}>
                  Continue to Customization
                </Button>
              </div>
            </motion.div>
          )}

          {step === 'customize' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="text-center">
                <h3 className="text-xl font-semibold mb-2">Customize Your Avatar</h3>
                <p className="text-muted-foreground">
                  Fine-tune the appearance to match your preferences
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Object.entries(CUSTOMIZATION_OPTIONS).map(([key, options]) => (
                  <div key={key} className="space-y-2">
                    <Label className="capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {options.map((option) => (
                        <Button
                          key={option}
                          variant={customizations[key as keyof typeof customizations] === option ? "default" : "outline"}
                          size="sm"
                          onClick={() => handleCustomizationChange(key as keyof typeof customizations, option)}
                          className="text-xs"
                        >
                          {option}
                        </Button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <Separator />

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setStep('style')}>
                  Back to Style
                </Button>
                <Button onClick={generateAvatar}>
                  <Wand2 className="w-4 h-4 mr-2" />
                  Generate Avatar
                </Button>
              </div>
            </motion.div>
          )}

          {step === 'processing' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6 text-center"
            >
              <div className="flex items-center justify-center w-20 h-20 mx-auto bg-purple-500/20 rounded-full">
                <Wand2 className="w-10 h-10 text-purple-500 animate-spin" />
              </div>
              <h3 className="text-xl font-semibold">Creating Your 3D Avatar...</h3>
              <p className="text-muted-foreground">
                Our AI is analyzing your photo and generating your personalized avatar
              </p>
              <div className="w-full max-w-md mx-auto bg-muted rounded-full h-3">
                <div 
                  className="bg-purple-500 h-3 rounded-full transition-all duration-300" 
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-sm text-muted-foreground">{progress}% Complete</p>
            </motion.div>
          )}

          {step === 'complete' && generatedAvatar && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6 text-center"
            >
              <div className="flex items-center justify-center w-20 h-20 mx-auto bg-green-500/20 rounded-full">
                <Check className="w-10 h-10 text-green-500" />
              </div>
              <h3 className="text-xl font-semibold">Avatar Created Successfully!</h3>
              <p className="text-muted-foreground">
                Your personalized 3D avatar is ready and will be used in your AI assistant
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Badge className="bg-green-500/20 text-green-400 border-green-500/30 p-4">
                  <div className="text-center">
                    <Sparkles className="w-6 h-6 mx-auto mb-2" />
                    <div className="font-medium">Photorealistic</div>
                    <div className="text-xs">Looks exactly like you</div>
                  </div>
                </Badge>
                <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 p-4">
                  <div className="text-center">
                    <Zap className="w-6 h-6 mx-auto mb-2" />
                    <div className="font-medium">Fully Animated</div>
                    <div className="text-xs">Natural expressions</div>
                  </div>
                </Badge>
                <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30 p-4">
                  <div className="text-center">
                    <Crown className="w-6 h-6 mx-auto mb-2" />
                    <div className="font-medium">Voice Synced</div>
                    <div className="text-xs">Lip sync with your voice</div>
                  </div>
                </Badge>
              </div>

              <div className="flex justify-center gap-4">
                <Button onClick={resetWizard} variant="outline">
                  Create Another
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}