// ElevenLabs voice synthesis utility functions
export const synthesizeSpeech = async (text: string, voiceId: string): Promise<HTMLAudioElement | null> => {
  try {
    const response = await fetch('/api/voice/synthesize', {
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
      console.error('Voice synthesis failed:', response.statusText);
      // Fallback to browser TTS
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        utterance.volume = 0.9;
        
        // Use a high-quality voice if available
        const voices = speechSynthesis.getVoices();
        const preferredVoice = voices.find(v => v.name.includes('Google') || v.name.includes('Microsoft'));
        if (preferredVoice) {
          utterance.voice = preferredVoice;
        }
        
        speechSynthesis.speak(utterance);
      }
      return null;
    }

    const audioBlob = await response.blob();
    const audioUrl = URL.createObjectURL(audioBlob);
    const audio = new Audio(audioUrl);
    
    // Clean up URL when audio ends
    audio.addEventListener('ended', () => {
      URL.revokeObjectURL(audioUrl);
    });
    
    return audio;
  } catch (error) {
    console.error('Error synthesizing speech:', error);
    
    // Fallback to browser TTS
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.volume = 0.9;
      speechSynthesis.speak(utterance);
    }
    
    return null;
  }
};

export const stopAllSpeech = () => {
  if ('speechSynthesis' in window) {
    speechSynthesis.cancel();
  }
};