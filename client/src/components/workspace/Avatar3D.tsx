import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Upload, Camera, Mic, MicOff, Volume2, VolumeX } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Avatar3DProps {
  isSpeaking: boolean;
  isMuted: boolean;
  onToggleMute: () => void;
  message: string;
  onImageUpload: (file: File) => void;
  avatarUrl?: string;
  onStartRecording?: () => void;
  onStopRecording?: () => void;
  isRecording?: boolean;
  hasVoiceRecording?: boolean;
}

// Enhanced 3D Avatar with photo support
function SimpleAvatar({ isAnimating, avatarImage }: { isAnimating: boolean; avatarImage?: string }) {
  return (
    <div className="relative w-64 h-64 mx-auto">
      {/* Face */}
      <div 
        className={`w-48 h-48 mx-auto rounded-full transition-all duration-300 ${
          isAnimating ? 'scale-105 shadow-2xl' : 'scale-100 shadow-xl'
        } ${avatarImage ? 'border-4 border-primary' : ''}`}
        style={{
          background: avatarImage 
            ? `url(${avatarImage}) center/cover` 
            : 'linear-gradient(145deg, #fdbcb4, #f1a898)',
          boxShadow: isAnimating 
            ? '0 15px 40px rgba(0,0,0,0.4), 0 0 30px rgba(59, 130, 246, 0.5)' 
            : '0 10px 30px rgba(0,0,0,0.3)'
        }}
      >
        {!avatarImage && (
          <>
            {/* Eyes */}
            <div className="absolute top-16 left-12 w-4 h-4 bg-slate-800 rounded-full" />
            <div className="absolute top-16 right-12 w-4 h-4 bg-slate-800 rounded-full" />
            
            {/* Pupils with animation */}
            <div className={`absolute top-18 left-14 w-2 h-2 bg-blue-500 rounded-full transition-all ${isAnimating ? 'scale-110' : ''}`} />
            <div className={`absolute top-18 right-14 w-2 h-2 bg-blue-500 rounded-full transition-all ${isAnimating ? 'scale-110' : ''}`} />
            
            {/* Animated Mouth */}
            <div 
              className={`absolute bottom-16 left-1/2 transform -translate-x-1/2 bg-red-800 rounded-full transition-all duration-200 ${
                isAnimating ? 'w-8 h-6 animate-pulse' : 'w-6 h-3'
              }`}
            />
          </>
        )}

        {/* Speaking Indicator Overlay for Custom Avatar */}
        {avatarImage && isAnimating && (
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 animate-pulse" />
        )}
      </div>
      
      {/* Body */}
      <div className="w-32 h-24 mx-auto mt-4 bg-gradient-to-b from-blue-600 to-blue-700 rounded-t-full" />
      
      {isAnimating && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute -bottom-8 left-1/2 transform -translate-x-1/2"
        >
          <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
            Speaking
          </Badge>
        </motion.div>
      )}
    </div>
  );
}

export default function Avatar3D({ 
  isSpeaking,
  isMuted, 
  onToggleMute, 
  message, 
  onImageUpload,
  avatarUrl,
  onStartRecording,
  onStopRecording,
  isRecording,
  hasVoiceRecording
}: Avatar3DProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarImage, setAvatarImage] = useState<string>();
  const [showUploadHint, setShowUploadHint] = useState(true);

  useEffect(() => {
    if (avatarUrl) {
      setAvatarImage(avatarUrl);
      setShowUploadHint(false);
    }
  }, [avatarUrl]);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      onImageUpload(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatarImage(e.target?.result as string);
        setShowUploadHint(false);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="relative w-full h-full bg-gradient-to-b from-slate-900 to-slate-800 rounded-lg overflow-hidden">
      {/* Avatar Display */}
      <div className="flex items-center justify-center h-full pt-8">
        <SimpleAvatar isAnimating={isSpeaking} avatarImage={avatarImage} />
      </div>
      
      {/* Upload Hint */}
      <AnimatePresence>
        {showUploadHint && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-4 left-4 right-4"
          >
            <Card className="bg-black/50 border-blue-500/30 backdrop-blur-sm">
              <CardContent className="p-3">
                <div className="flex items-center gap-2 text-blue-400">
                  <Upload className="w-4 h-4" />
                  <span className="text-sm">Upload your photo to personalize the avatar</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Voice Recording Hint */}
      <AnimatePresence>
        {avatarImage && !hasVoiceRecording && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-16 left-4 right-4"
          >
            <Card className="bg-black/50 border-green-500/30 backdrop-blur-sm">
              <CardContent className="p-3">
                <div className="flex items-center gap-2 text-green-400">
                  <Mic className="w-4 h-4" />
                  <span className="text-sm">Record your voice for complete personalization</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Recording Indicator */}
      <AnimatePresence>
        {isRecording && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
          >
            <Card className="bg-red-500/90 border-red-400 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-white">
                  <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
                  <span className="font-medium">Recording Voice...</span>
                </div>
                <div className="text-xs text-red-100 mt-1">Speak clearly for 10-30 seconds</div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Controls */}
      <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            className="bg-black/50 border-blue-500/30 backdrop-blur-sm"
            onClick={() => fileInputRef.current?.click()}
          >
            <Camera className="w-4 h-4 mr-1" />
            Upload Photo
          </Button>
          
          {/* Voice Recording Button */}
          <Button
            size="sm"
            variant={isRecording ? "destructive" : hasVoiceRecording ? "default" : "outline"}
            className={`bg-black/50 backdrop-blur-sm ${
              isRecording ? 'border-red-500/50 animate-pulse' : 
              hasVoiceRecording ? 'border-green-500/50' : 'border-purple-500/30'
            }`}
            onClick={isRecording ? onStopRecording : onStartRecording}
          >
            <Mic className="w-4 h-4 mr-1" />
            {isRecording ? 'Stop' : hasVoiceRecording ? 'Re-record' : 'Record Voice'}
          </Button>
          
          <Button
            size="sm"
            variant={isMuted ? "destructive" : "default"}
            className="bg-black/50 backdrop-blur-sm"
            onClick={onToggleMute}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </Button>
        </div>
        
        {isSpeaking && (
          <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              Speaking
            </div>
          </Badge>
        )}
      </div>
      
      {/* Message Display */}
      {message && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute bottom-16 left-4 right-4"
        >
          <Card className="bg-black/70 border-blue-500/30 backdrop-blur-md">
            <CardContent className="p-4">
              <p className="text-sm text-blue-100 leading-relaxed">
                {message}
              </p>
            </CardContent>
          </Card>
        </motion.div>
      )}
      
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="hidden"
      />
    </div>
  );
}