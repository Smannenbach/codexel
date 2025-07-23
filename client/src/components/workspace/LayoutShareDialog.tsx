import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Upload, Globe, Lock, Hash, Camera } from 'lucide-react';
import html2canvas from 'html2canvas';

interface LayoutShareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentLayout: any; // Panel configuration
}

const BUSINESS_TYPES = [
  { value: 'legal', label: 'Legal Services' },
  { value: 'healthcare', label: 'Healthcare' },
  { value: 'finance', label: 'Financial Services' },
  { value: 'real-estate', label: 'Real Estate' },
  { value: 'hospitality', label: 'Hospitality' },
  { value: 'retail', label: 'Retail & E-commerce' },
  { value: 'technology', label: 'Technology' },
  { value: 'creative', label: 'Creative & Design' },
  { value: 'education', label: 'Education' },
  { value: 'nonprofit', label: 'Nonprofit' },
  { value: 'other', label: 'Other' },
];

export default function LayoutShareDialog({ open, onOpenChange, currentLayout }: LayoutShareDialogProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [businessType, setBusinessType] = useState('');
  const [category, setCategory] = useState('');
  const [tags, setTags] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [preview, setPreview] = useState<string>('');
  const [isCapturing, setIsCapturing] = useState(false);
  const { toast } = useToast();

  const saveLayout = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest('POST', '/api/layouts', data);
    },
    onSuccess: () => {
      toast({
        title: "Layout Saved!",
        description: isPublic ? "Your layout is now available in the marketplace!" : "Your layout has been saved privately.",
      });
      onOpenChange(false);
      // Reset form
      setName('');
      setDescription('');
      setBusinessType('');
      setCategory('');
      setTags('');
      setPreview('');
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save layout. Please try again.",
        variant: "destructive",
      });
    },
  });

  const capturePreview = async () => {
    setIsCapturing(true);
    try {
      // Capture the workspace area
      const workspaceElement = document.querySelector('.workspace-container');
      if (workspaceElement) {
        const canvas = await html2canvas(workspaceElement as HTMLElement, {
          backgroundColor: '#030712',
          scale: 0.5, // Reduce size for storage
          width: 1200,
          height: 800,
        });
        setPreview(canvas.toDataURL('image/jpeg', 0.8));
        toast({
          title: "Preview Captured",
          description: "Screenshot of your workspace has been captured.",
        });
      }
    } catch (error) {
      console.error('Failed to capture preview:', error);
      toast({
        title: "Capture Failed",
        description: "Could not capture workspace preview.",
        variant: "destructive",
      });
    } finally {
      setIsCapturing(false);
    }
  };

  const handleSubmit = () => {
    if (!name || !businessType || !description) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    const layoutData = {
      name,
      description,
      businessType,
      category: category || businessType,
      configuration: currentLayout,
      preview,
      isPublic,
      tags: tags.split(',').map(t => t.trim()).filter(Boolean),
    };

    saveLayout.mutate(layoutData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] bg-gray-900 border-gray-800">
        <DialogHeader>
          <DialogTitle className="text-2xl bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Share Your Workspace Layout
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Save your current workspace configuration and share it with the community.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Layout Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Layout Name *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Legal Practice Dashboard"
              className="bg-gray-800 border-gray-700"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what makes this layout special..."
              className="bg-gray-800 border-gray-700 min-h-[80px]"
            />
          </div>

          {/* Business Type */}
          <div className="space-y-2">
            <Label htmlFor="businessType">Business Type *</Label>
            <Select value={businessType} onValueChange={setBusinessType}>
              <SelectTrigger className="bg-gray-800 border-gray-700">
                <SelectValue placeholder="Select business type" />
              </SelectTrigger>
              <SelectContent>
                {BUSINESS_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label htmlFor="tags">Tags</Label>
            <Input
              id="tags"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="productivity, ai-focused, minimal (comma separated)"
              className="bg-gray-800 border-gray-700"
            />
            <p className="text-xs text-gray-500">Add tags to help others find your layout</p>
          </div>

          {/* Preview */}
          <div className="space-y-2">
            <Label>Preview Screenshot</Label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={capturePreview}
                disabled={isCapturing}
                className="flex-1"
              >
                <Camera className="w-4 h-4 mr-2" />
                {isCapturing ? 'Capturing...' : 'Capture Current View'}
              </Button>
            </div>
            {preview && (
              <div className="mt-2 relative">
                <img 
                  src={preview} 
                  alt="Layout preview" 
                  className="w-full h-32 object-cover rounded-lg border border-gray-700"
                />
                <Badge className="absolute top-2 right-2 bg-green-600">
                  Preview Ready
                </Badge>
              </div>
            )}
          </div>

          {/* Visibility Toggle */}
          <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
            <div className="space-y-0.5">
              <Label htmlFor="public" className="text-base font-medium">
                {isPublic ? (
                  <span className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-green-500" />
                    Public Layout
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Lock className="w-4 h-4 text-yellow-500" />
                    Private Layout
                  </span>
                )}
              </Label>
              <p className="text-sm text-gray-400">
                {isPublic 
                  ? "Anyone can discover and use this layout" 
                  : "Only you can access this layout"}
              </p>
            </div>
            <Switch
              id="public"
              checked={isPublic}
              onCheckedChange={setIsPublic}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={saveLayout.isPending}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            {saveLayout.isPending ? (
              <>Saving...</>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Share Layout
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}