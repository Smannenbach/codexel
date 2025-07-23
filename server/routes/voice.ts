import type { Express } from "express";
import multer from "multer";
import { createReadStream, unlinkSync } from "fs";
import FormData from "form-data";

// Configure multer for audio file uploads
const upload = multer({ 
  dest: '/tmp/',
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept audio files
    if (file.mimetype.startsWith('audio/')) {
      cb(null, true);
    } else {
      cb(null, false);
    }
  }
});

export function registerVoiceRoutes(app: Express) {
  // Voice cloning endpoint
  app.post('/api/voice/clone', upload.single('audio'), async (req, res) => {
    try {
      const { voiceName } = req.body;
      
      if (!req.file) {
        return res.status(400).json({ error: 'No audio file provided' });
      }

      if (!process.env.ELEVENLABS_API_KEY) {
        return res.status(503).json({ 
          error: 'ElevenLabs API key not configured. Voice cloning is not available.',
          fallback: 'browser_tts'
        });
      }

      // Create FormData for ElevenLabs API
      const formData = new FormData();
      formData.append('name', voiceName || 'Custom Voice');
      formData.append('files', createReadStream(req.file.path), 'voice-sample.wav');
      formData.append('description', 'Custom cloned voice from Codexel platform');

      // Call ElevenLabs voice cloning API
      const response = await fetch('https://api.elevenlabs.io/v1/voices/add', {
        method: 'POST',
        headers: {
          'xi-api-key': process.env.ELEVENLABS_API_KEY!,
          ...formData.getHeaders()
        },
        body: formData as any
      });

      // Clean up uploaded file
      unlinkSync(req.file.path);

      if (!response.ok) {
        const errorData = await response.text();
        console.error('ElevenLabs API error:', errorData);
        return res.status(response.status).json({ 
          error: 'Voice cloning failed',
          details: errorData,
          fallback: 'browser_tts'
        });
      }

      const result = await response.json();
      
      res.json({
        success: true,
        voice_id: result.voice_id,
        name: result.name,
        message: 'Voice cloned successfully!'
      });

    } catch (error) {
      console.error('Voice cloning error:', error);
      res.status(500).json({ 
        error: 'Internal server error during voice cloning',
        fallback: 'browser_tts'
      });
    }
  });

  // Text-to-speech with cloned voice
  app.post('/api/voice/speak', async (req, res) => {
    try {
      const { text, voiceId } = req.body;

      if (!text || !voiceId) {
        return res.status(400).json({ error: 'Text and voice ID are required' });
      }

      if (!process.env.ELEVENLABS_API_KEY) {
        return res.status(503).json({ 
          error: 'ElevenLabs API key not configured',
          fallback: 'browser_tts'
        });
      }

      const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': process.env.ELEVENLABS_API_KEY,
        },
        body: JSON.stringify({
          text,
          model_id: 'eleven_monolingual_v1',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.5
          }
        })
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('TTS API error:', errorData);
        return res.status(response.status).json({ 
          error: 'Text-to-speech failed',
          details: errorData,
          fallback: 'browser_tts'
        });
      }

      // Return audio stream
      res.set({
        'Content-Type': 'audio/mpeg',
        'Content-Disposition': 'inline; filename="speech.mp3"'
      });

      // Convert web stream to node stream for piping
      const reader = response.body?.getReader();
      if (reader) {
        const pump = (): Promise<void> => {
          return reader.read().then(({ done, value }) => {
            if (done) {
              res.end();
              return;
            }
            res.write(value);
            return pump();
          });
        };
        pump();
      } else {
        res.status(500).json({ error: 'Failed to stream audio' });
      }

    } catch (error) {
      console.error('TTS error:', error);
      res.status(500).json({ 
        error: 'Internal server error during text-to-speech',
        fallback: 'browser_tts'
      });
    }
  });

  // Duplicate endpoint for client compatibility 
  app.post('/api/voice/synthesize', async (req, res) => {
    try {
      const { text, voiceId } = req.body;

      if (!text || !voiceId) {
        return res.status(400).json({ error: 'Text and voice ID are required' });
      }

      if (!process.env.ELEVENLABS_API_KEY) {
        return res.status(503).json({ 
          error: 'ElevenLabs API key not configured',
          fallback: 'browser_tts'
        });
      }

      const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': process.env.ELEVENLABS_API_KEY,
        },
        body: JSON.stringify({
          text,
          model_id: 'eleven_monolingual_v1',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.5
          }
        })
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('TTS API error:', errorData);
        return res.status(response.status).json({ 
          error: 'Text-to-speech failed',
          details: errorData,
          fallback: 'browser_tts'
        });
      }

      // Return audio stream
      res.set({
        'Content-Type': 'audio/mpeg',
        'Content-Disposition': 'inline; filename="speech.mp3"'
      });

      // Convert web stream to node stream for piping
      const reader = response.body?.getReader();
      if (reader) {
        const pump = (): Promise<void> => {
          return reader.read().then(({ done, value }) => {
            if (done) {
              res.end();
              return;
            }
            res.write(value);
            return pump();
          });
        };
        pump();
      } else {
        res.status(500).json({ error: 'Failed to stream audio' });
      }

    } catch (error) {
      console.error('TTS error:', error);
      res.status(500).json({ 
        error: 'Internal server error during text-to-speech',
        fallback: 'browser_tts'
      });
    }
  });
}