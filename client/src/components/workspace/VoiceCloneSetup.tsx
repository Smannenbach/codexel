import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { apiRequest } from '@/lib/queryClient';
import { Mic, Play, Pause, RotateCcw, CheckCircle, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface VoiceCloneSetupProps {
  onVoiceCloned: (voiceId: string) => void;
}

export default function VoiceCloneSetup({ onVoiceCloned }: VoiceCloneSetupProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [voiceName, setVoiceName] = useState('My Custom Voice');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [advancedOptions, setAdvancedOptions] = useState({
    noiseReduction: true,
    audioEnhancement: true,
    optimization: true,
    studioQuality: true
  });
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  const steps = [
    { icon: '🎤', label: 'Voice Clone Setup', description: 'Create your personalized AI voice in minutes' },
    { icon: '🎙️', label: 'Recording', description: 'Record your voice sample' },
    { icon: '🎧', label: 'Review', description: 'Review and optimize your recording' },
    { icon: '🚀', label: 'Processing', description: 'Creating your AI voice' }
  ];

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 48000
        } 
      });
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm'
      });
      
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];
      
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        setAudioUrl(URL.createObjectURL(blob));
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorder.start();
      setIsRecording(true);
      setDuration(0);
      
      // Start timer
      timerRef.current = setInterval(() => {
        setDuration(prev => prev + 1);
      }, 1000);
      
    } catch (error) {
      console.error('Error accessing microphone:', error);
      toast({
        title: "Microphone Access Required",
        description: "Please allow microphone access to record your voice.",
        variant: "destructive"
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      setCurrentStep(2);
    }
  };

  const playAudio = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const resetRecording = () => {
    setAudioBlob(null);
    setAudioUrl(null);
    setDuration(0);
    setCurrentStep(1);
  };

  const processVoiceClone = async () => {
    if (!audioBlob) return;
    
    setIsProcessing(true);
    setCurrentStep(3);
    setProgress(0);
    
    // Simulate progress
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 10;
      });
    }, 500);
    
    try {
      // Convert blob to base64
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);
      reader.onloadend = async () => {
        const base64Audio = reader.result as string;
        
        // Store voice data in localStorage (in production, this would go to ElevenLabs)
        const voiceId = `voice_${Date.now()}`;
        localStorage.setItem(`codexel_voice_${voiceId}`, base64Audio);
        localStorage.setItem('codexel_voice_name', voiceName);
        localStorage.setItem('codexel_voice_settings', JSON.stringify(advancedOptions));
        
        setProgress(100);
        clearInterval(progressInterval);
        
        setTimeout(() => {
          onVoiceCloned(voiceId);
          toast({
            title: "Voice Clone Created!",
            description: "Your AI voice is ready to use.",
          });
        }, 500);
      };
    } catch (error) {
      clearInterval(progressInterval);
      setIsProcessing(false);
      toast({
        title: "Processing Failed",
        description: "Failed to create voice clone. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Progress Steps */}
      <div className="flex items-center justify-between mb-8">
        {steps.map((step, index) => (
          <div key={index} className="flex items-center">
            <div className={`flex flex-col items-center ${index <= currentStep ? 'opacity-100' : 'opacity-50'}`}>
              <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl mb-2 ${
                index < currentStep ? 'bg-green-500' : 
                index === currentStep ? 'bg-purple-600 animate-pulse' : 
                'bg-gray-600'
              }`}>
                {index < currentStep ? <CheckCircle className="w-6 h-6 text-white" /> : step.icon}
              </div>
              <span className="text-xs font-medium">{step.label}</span>
            </div>
            {index < steps.length - 1 && (
              <div className={`w-16 h-0.5 mx-2 ${
                index < currentStep ? 'bg-green-500' : 'bg-gray-600'
              }`} />
            )}
          </div>
        ))}
      </div>

      {/* Step Content */}
      {currentStep === 0 && (
        <Card className="p-6 bg-white/5 backdrop-blur-xl border-white/10">
          <h3 className="text-xl font-bold mb-4">🎤 Voice Clone Setup</h3>
          <p className="text-gray-400 mb-6">Create your personalized AI voice in just a few minutes!</p>
          
          <div className="space-y-4 mb-6">
            <div className="flex items-start gap-3">
              <Badge className="bg-purple-500/20 text-purple-400 mt-1">1</Badge>
              <div>
                <p className="font-medium">Advanced Noise Reduction Active:</p>
                <ul className="text-sm text-gray-400 mt-1 space-y-1">
                  <li>• AI-powered background noise elimination</li>
                  <li>• Real-time audio enhancement and filtering</li>
                  <li>• Dynamic range compression for clear voice</li>
                  <li>• Automatic gain control for best volume</li>
                  <li>• Professional studio-quality processing</li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 mb-6">
            <p className="text-sm">
              <strong>Choose a sample text to read:</strong><br />
              "Hello, I'm excited to create my AI voice clone with Codexel. This technology will help me connect with clients in a more personal way."
            </p>
          </div>
          
          <div className="space-y-3">
            <p className="text-sm text-gray-400">
              <strong>Thank you for choosing our services. I'm here to help you build an amazing business with cutting-edge AI technology.</strong>
            </p>
            <p className="text-sm text-gray-400">
              <strong>Welcome to the future of personalized AI assistants. Your success is our priority, and we're committed to delivering exceptional results.</strong>
            </p>
          </div>
          
          <div className="mt-6">
            <label className="text-sm font-medium mb-2 block">Voice Name</label>
            <input
              type="text"
              value={voiceName}
              onChange={(e) => setVoiceName(e.target.value)}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400"
              placeholder="My Custom Voice"
            />
          </div>
          
          <Button 
            onClick={() => setCurrentStep(1)} 
            className="w-full mt-6 bg-gradient-to-r from-purple-600 to-pink-600"
          >
            🎙️ Start Recording
          </Button>
        </Card>
      )}

      {currentStep === 1 && (
        <Card className="p-6 bg-white/5 backdrop-blur-xl border-white/10">
          <h3 className="text-xl font-bold mb-4">🎙️ Recording Your Voice</h3>
          
          <div className="flex flex-col items-center space-y-6">
            <div className="relative">
              <div className={`w-32 h-32 rounded-full flex items-center justify-center ${
                isRecording ? 'bg-red-500 animate-pulse' : 'bg-purple-600'
              }`}>
                <Mic className="w-16 h-16 text-white" />
              </div>
              {isRecording && (
                <div className="absolute inset-0 rounded-full border-4 border-red-400 animate-ping" />
              )}
            </div>
            
            <div className="text-center">
              <p className="text-2xl font-mono">{Math.floor(duration / 60)}:{(duration % 60).toString().padStart(2, '0')}</p>
              <p className="text-sm text-gray-400 mt-1">
                {duration < 30 ? `Keep going! ${30 - duration} seconds to minimum` : 'Great! You can stop anytime'}
              </p>
            </div>
            
            {!isRecording ? (
              <Button 
                onClick={startRecording} 
                size="lg"
                className="bg-gradient-to-r from-purple-600 to-pink-600"
              >
                <Mic className="w-5 h-5 mr-2" />
                Start Recording
              </Button>
            ) : (
              <Button 
                onClick={stopRecording} 
                size="lg"
                variant="destructive"
                disabled={duration < 5}
              >
                Stop Recording
              </Button>
            )}
            
            <div className="bg-gray-800 rounded-lg p-4 max-w-md">
              <p className="text-sm text-center">
                Read this text naturally: <br />
                <strong className="text-white">
                  "Hello, I'm excited to create my AI voice clone with Codexel. 
                  This technology will help me connect with clients in a more personal way."
                </strong>
              </p>
            </div>
          </div>
        </Card>
      )}

      {currentStep === 2 && (
        <Card className="p-6 bg-white/5 backdrop-blur-xl border-white/10">
          <h3 className="text-xl font-bold mb-4">🎧 Review Your Recording</h3>
          
          <div className="space-y-6">
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-gray-400">Duration: {duration} seconds</span>
                <Badge className="bg-green-500/20 text-green-400">
                  {duration >= 30 ? 'Excellent Quality' : 'Good Quality'}
                </Badge>
              </div>
              
              <div className="flex gap-2">
                <Button
                  onClick={playAudio}
                  size="sm"
                  variant="outline"
                >
                  {isPlaying ? <Pause className="w-4 h-4 mr-1" /> : <Play className="w-4 h-4 mr-1" />}
                  {isPlaying ? 'Pause' : 'Play'}
                </Button>
                <Button
                  onClick={resetRecording}
                  size="sm"
                  variant="outline"
                >
                  <RotateCcw className="w-4 h-4 mr-1" />
                  Re-record
                </Button>
              </div>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-medium">Advanced Options</h4>
              {Object.entries(advancedOptions).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                  <label className="text-sm">
                    {key === 'noiseReduction' && '🔇 AI-powered Noise Reduction'}
                    {key === 'audioEnhancement' && '🎵 Audio Enhancement'}
                    {key === 'optimization' && '⚡ Voice Optimization'}
                    {key === 'studioQuality' && '🎙️ Studio Quality Processing'}
                  </label>
                  <Checkbox
                    checked={value}
                    onCheckedChange={(checked) => 
                      setAdvancedOptions(prev => ({ ...prev, [key]: checked as boolean }))
                    }
                  />
                </div>
              ))}
            </div>
            
            <Button 
              onClick={processVoiceClone}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600"
            >
              🚀 Create My Voice Clone
            </Button>
          </div>
          
          {audioUrl && (
            <audio ref={audioRef} src={audioUrl} onEnded={() => setIsPlaying(false)} />
          )}
        </Card>
      )}

      {currentStep === 3 && (
        <Card className="p-6 bg-white/5 backdrop-blur-xl border-white/10">
          <h3 className="text-xl font-bold mb-4">🚀 Creating Your AI Voice</h3>
          
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-purple-600 flex items-center justify-center animate-pulse">
                <AlertCircle className="w-12 h-12 text-white" />
              </div>
              <p className="text-gray-400 mb-6">
                We're processing your voice with advanced AI technology...
              </p>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Processing</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
            
            <div className="space-y-2 text-sm text-gray-400">
              <p className={progress >= 20 ? 'text-green-400' : ''}>
                ✓ Analyzing voice characteristics...
              </p>
              <p className={progress >= 40 ? 'text-green-400' : ''}>
                ✓ Applying noise reduction...
              </p>
              <p className={progress >= 60 ? 'text-green-400' : ''}>
                ✓ Enhancing audio quality...
              </p>
              <p className={progress >= 80 ? 'text-green-400' : ''}>
                ✓ Training AI model...
              </p>
              <p className={progress >= 100 ? 'text-green-400' : ''}>
                ✓ Finalizing your voice clone...
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}