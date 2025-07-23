import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Play, Pause, Volume2, Wand2, Crown, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface Voice {
  voice_id: string;
  name: string;
  category: string;
  preview_url?: string;
  settings?: {
    stability: number;
    similarity_boost: number;
    style?: number;
  };
}

interface VoiceSelectionProps {
  selectedVoiceId?: string;
  onVoiceSelect: (voiceId: string, voiceName: string) => void;
  customVoices?: Voice[];
  className?: string;
}

const PREMIUM_VOICES: Voice[] = [
  {
    voice_id: 'premium_female_1',
    name: 'Aria Professional',
    category: 'Premium Female',
    settings: { stability: 0.7, similarity_boost: 0.8, style: 0.4 }
  },
  {
    voice_id: 'premium_male_1', 
    name: 'Marcus Executive',
    category: 'Premium Male',
    settings: { stability: 0.6, similarity_boost: 0.9, style: 0.3 }
  },
  {
    voice_id: 'premium_female_2',
    name: 'Sofia Elegant',
    category: 'Premium Female',
    settings: { stability: 0.8, similarity_boost: 0.7, style: 0.5 }
  },
  {
    voice_id: 'premium_male_2',
    name: 'David Confident', 
    category: 'Premium Male',
    settings: { stability: 0.5, similarity_boost: 0.8, style: 0.6 }
  }
];

export default function VoiceSelection({
  selectedVoiceId,
  onVoiceSelect,
  customVoices = [],
  className = ''
}: VoiceSelectionProps) {
  const [availableVoices, setAvailableVoices] = useState<Voice[]>([]);
  const [isPlaying, setIsPlaying] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadAvailableVoices();
  }, []);

  const loadAvailableVoices = async () => {
    try {
      setIsLoading(true);
      const response = await apiRequest('GET', '/api/voice/list');
      const data = await response.json();
      
      // Combine ElevenLabs voices, custom voices, and premium voices
      const allVoices = [
        ...customVoices,
        ...PREMIUM_VOICES,
        ...(data.voices || [])
      ];
      
      setAvailableVoices(allVoices);
    } catch (error) {
      console.error('Failed to load voices:', error);
      // Fallback to premium voices only
      setAvailableVoices([...customVoices, ...PREMIUM_VOICES]);
    } finally {
      setIsLoading(false);
    }
  };

  const playVoicePreview = async (voice: Voice) => {
    if (isPlaying === voice.voice_id) {
      setIsPlaying(null);
      return;
    }

    try {
      setIsPlaying(voice.voice_id);
      
      const previewText = `Hi! I'm ${voice.name}. I'll be your AI assistant, helping you build amazing applications with personalized voice interaction.`;
      
      const response = await fetch('/api/voice/speak', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: previewText,
          voiceId: voice.voice_id,
          settings: voice.settings
        })
      });

      if (response.ok) {
        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        
        audio.onended = () => {
          setIsPlaying(null);
          URL.revokeObjectURL(audioUrl);
        };
        
        await audio.play();
      } else {
        // Fallback to Web Speech API for preview
        const utterance = new SpeechSynthesisUtterance(previewText);
        utterance.onend = () => setIsPlaying(null);
        speechSynthesis.speak(utterance);
      }
    } catch (error) {
      console.error('Voice preview failed:', error);
      setIsPlaying(null);
    }
  };

  const handleVoiceSelect = (voiceId: string) => {
    const voice = availableVoices.find(v => v.voice_id === voiceId);
    if (voice) {
      onVoiceSelect(voiceId, voice.name);
      toast({
        title: "Voice Selected",
        description: `Now using ${voice.name} for AI responses`,
      });
    }
  };

  const getVoiceIcon = (category: string) => {
    if (category.includes('Custom')) return <Crown className="w-4 h-4 text-gold-500" />;
    if (category.includes('Premium')) return <Sparkles className="w-4 h-4 text-purple-500" />;
    return <Volume2 className="w-4 h-4 text-blue-500" />;
  };

  const getVoiceBadge = (voice: Voice) => {
    if (voice.category.includes('Custom')) {
      return <Badge className="bg-gold-500/20 text-gold-400 border-gold-500/30 text-xs">YOUR VOICE</Badge>;
    }
    if (voice.category.includes('Premium')) {
      return <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30 text-xs">PREMIUM</Badge>;
    }
    return <Badge variant="outline" className="text-xs">STANDARD</Badge>;
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full" />
            <span className="ml-2 text-sm text-muted-foreground">Loading voices...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Volume2 className="w-5 h-5 text-blue-500" />
          Voice Selection
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Choose AI Voice</Label>
          <Select value={selectedVoiceId} onValueChange={handleVoiceSelect}>
            <SelectTrigger>
              <SelectValue placeholder="Select a voice for your AI assistant" />
            </SelectTrigger>
            <SelectContent>
              {availableVoices.map((voice) => (
                <SelectItem key={voice.voice_id} value={voice.voice_id}>
                  <div className="flex items-center gap-2">
                    {getVoiceIcon(voice.category)}
                    <span>{voice.name}</span>
                    {voice.category.includes('Custom') && (
                      <Crown className="w-3 h-3 text-gold-500" />
                    )}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Voice Preview Cards */}
        <div className="space-y-3">
          <Label>Preview Voices</Label>
          <div className="grid gap-3 max-h-64 overflow-y-auto">
            {availableVoices.map((voice) => (
              <motion.div
                key={voice.voice_id}
                whileHover={{ scale: 1.02 }}
                className={`p-3 rounded-lg border transition-all ${
                  selectedVoiceId === voice.voice_id
                    ? 'border-primary bg-primary/5'
                    : 'border-muted hover:border-muted-foreground/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getVoiceIcon(voice.category)}
                    <div>
                      <div className="font-medium text-sm">{voice.name}</div>
                      <div className="text-xs text-muted-foreground">{voice.category}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {getVoiceBadge(voice)}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => playVoicePreview(voice)}
                      disabled={isPlaying !== null}
                    >
                      {isPlaying === voice.voice_id ? (
                        <Pause className="w-3 h-3" />
                      ) : (
                        <Play className="w-3 h-3" />
                      )}
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {customVoices.length === 0 && (
          <div className="p-4 bg-purple-500/10 rounded-lg border border-purple-500/20">
            <div className="flex items-center gap-2 mb-2">
              <Wand2 className="w-4 h-4 text-purple-400" />
              <span className="text-sm font-medium text-purple-400">Create Your Voice Clone</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Record a voice sample to create a custom AI voice that sounds exactly like you!
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}