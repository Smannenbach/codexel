import { apiRequest } from '@/lib/queryClient';

export interface VoiceCloneResult {
  voice_id: string;
  name: string;
  success: boolean;
  fallback?: string;
}

export const cloneVoice = async (audioBlob: Blob, voiceName: string): Promise<VoiceCloneResult> => {
  const formData = new FormData();
  formData.append('audio', audioBlob, 'voice-sample.wav');
  formData.append('voiceName', voiceName);

  try {
    const response = await fetch('/api/voice/clone', {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Voice cloning error:', error);
    // Fallback to browser TTS
    return {
      voice_id: 'browser_tts',
      name: voiceName,
      success: true,
      fallback: 'browser_tts'
    };
  }
};

export const speakWithVoice = async (text: string, voiceId: string): Promise<void> => {
  if (voiceId === 'browser_tts') {
    // Use browser's speech synthesis as fallback
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1.0;
      utterance.volume = 0.8;
      window.speechSynthesis.speak(utterance);
    }
    return;
  }

  try {
    const response = await fetch('/api/voice/speak', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        voiceId
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Play the audio response
    const audioBlob = await response.blob();
    const audioUrl = URL.createObjectURL(audioBlob);
    const audio = new Audio(audioUrl);
    
    audio.onended = () => {
      URL.revokeObjectURL(audioUrl);
    };
    
    await audio.play();
  } catch (error) {
    console.error('Voice synthesis error:', error);
    // Fallback to browser TTS
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      window.speechSynthesis.speak(utterance);
    }
  }
};