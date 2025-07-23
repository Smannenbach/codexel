export class AudioProcessor {
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private noiseGate: GainNode | null = null;
  private compressor: DynamicsCompressorNode | null = null;
  private highPassFilter: BiquadFilterNode | null = null;
  private lowPassFilter: BiquadFilterNode | null = null;
  private mediaStream: MediaStream | null = null;

  constructor() {
    this.initializeAudioContext();
  }

  private initializeAudioContext() {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch (error) {
      console.error('Audio context not supported:', error);
    }
  }

  async getEnhancedMediaStream(constraints: MediaStreamConstraints = {}): Promise<MediaStream> {
    if (!this.audioContext) {
      throw new Error('Audio context not available');
    }

    // Enhanced audio constraints for noise reduction
    const enhancedConstraints: MediaStreamConstraints = {
      audio: {
        sampleRate: 48000,
        channelCount: 1,
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
        // Advanced noise reduction settings (Chrome/WebRTC extensions)
        googEchoCancellation: true,
        googAutoGainControl: true,
        googNoiseSuppression: true,
        googHighpassFilter: true,
        ...constraints.audio
      },
      ...constraints
    };

    try {
      this.mediaStream = await navigator.mediaDevices.getUserMedia(enhancedConstraints);
      return this.processAudioStream(this.mediaStream);
    } catch (error) {
      console.error('Error accessing enhanced microphone:', error);
      // Fallback to basic constraints
      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: { 
          sampleRate: 44100,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true
        }
      });
      return this.processAudioStream(this.mediaStream);
    }
  }

  private processAudioStream(stream: MediaStream): MediaStream {
    if (!this.audioContext) return stream;

    try {
      // Create audio processing chain
      const source = this.audioContext.createMediaStreamSource(stream);
      const destination = this.audioContext.createMediaStreamDestination();

      // High-pass filter to remove low-frequency noise (AC hum, rumble)
      this.highPassFilter = this.audioContext.createBiquadFilter();
      this.highPassFilter.type = 'highpass';
      this.highPassFilter.frequency.value = 80; // Remove frequencies below 80Hz
      this.highPassFilter.Q.value = 1;

      // Low-pass filter to remove high-frequency noise
      this.lowPassFilter = this.audioContext.createBiquadFilter();
      this.lowPassFilter.type = 'lowpass';
      this.lowPassFilter.frequency.value = 8000; // Remove frequencies above 8kHz
      this.lowPassFilter.Q.value = 1;

      // Compressor for dynamic range control
      this.compressor = this.audioContext.createDynamicsCompressor();
      this.compressor.threshold.value = -24; // dB
      this.compressor.knee.value = 30;
      this.compressor.ratio.value = 12;
      this.compressor.attack.value = 0.003;
      this.compressor.release.value = 0.25;

      // Noise gate to eliminate background noise during silence
      this.noiseGate = this.audioContext.createGain();
      this.noiseGate.gain.value = 1;

      // Analyser for real-time audio analysis
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 2048;
      this.analyser.smoothingTimeConstant = 0.8;

      // Connect the processing chain
      source
        .connect(this.highPassFilter)
        .connect(this.lowPassFilter)
        .connect(this.compressor)
        .connect(this.noiseGate)
        .connect(this.analyser)
        .connect(destination);

      // Start noise gate monitoring
      this.startNoiseGateMonitoring();

      return destination.stream;
    } catch (error) {
      console.error('Error processing audio stream:', error);
      return stream; // Return original stream if processing fails
    }
  }

  private startNoiseGateMonitoring() {
    if (!this.analyser || !this.noiseGate) return;

    const bufferLength = this.analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    const noiseThreshold = 30; // Adjust based on environment
    const gateOpenThreshold = 35;
    const gateCloseThreshold = 25;
    let isGateOpen = false;

    const monitorNoise = () => {
      if (!this.analyser || !this.noiseGate) return;

      this.analyser.getByteFrequencyData(dataArray);
      
      // Calculate RMS (Root Mean Square) for overall volume
      let sum = 0;
      for (let i = 0; i < bufferLength; i++) {
        sum += dataArray[i] * dataArray[i];
      }
      const rms = Math.sqrt(sum / bufferLength);

      // Noise gate logic
      if (!isGateOpen && rms > gateOpenThreshold) {
        isGateOpen = true;
        this.noiseGate.gain.setTargetAtTime(1, this.audioContext!.currentTime, 0.01);
      } else if (isGateOpen && rms < gateCloseThreshold) {
        isGateOpen = false;
        this.noiseGate.gain.setTargetAtTime(0.1, this.audioContext!.currentTime, 0.1);
      }

      requestAnimationFrame(monitorNoise);
    };

    monitorNoise();
  }

  getAudioLevels(): { volume: number; noise: number; quality: 'excellent' | 'good' | 'fair' | 'poor' } {
    if (!this.analyser) return { volume: 0, noise: 0, quality: 'poor' };

    const bufferLength = this.analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    this.analyser.getByteFrequencyData(dataArray);

    // Calculate volume (RMS)
    let sum = 0;
    for (let i = 0; i < bufferLength; i++) {
      sum += dataArray[i] * dataArray[i];
    }
    const volume = Math.sqrt(sum / bufferLength);

    // Estimate noise level (low frequency content)
    const noiseRange = Math.floor(bufferLength * 0.1); // First 10% of frequencies
    let noiseSum = 0;
    for (let i = 0; i < noiseRange; i++) {
      noiseSum += dataArray[i];
    }
    const noise = noiseSum / noiseRange;

    // Calculate quality based on signal-to-noise ratio
    const signalToNoise = volume / Math.max(noise, 1);
    let quality: 'excellent' | 'good' | 'fair' | 'poor';
    
    if (signalToNoise > 8) quality = 'excellent';
    else if (signalToNoise > 5) quality = 'good';
    else if (signalToNoise > 3) quality = 'fair';
    else quality = 'poor';

    return { 
      volume: Math.round(volume), 
      noise: Math.round(noise), 
      quality 
    };
  }

  async processRecordedAudio(audioBlob: Blob): Promise<Blob> {
    if (!this.audioContext) return audioBlob;

    try {
      // Convert blob to array buffer
      const arrayBuffer = await audioBlob.arrayBuffer();
      const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);

      // Apply additional post-processing
      const processedBuffer = await this.applyPostProcessing(audioBuffer);
      
      // Convert back to blob
      return this.audioBufferToBlob(processedBuffer);
    } catch (error) {
      console.error('Error processing recorded audio:', error);
      return audioBlob;
    }
  }

  private async applyPostProcessing(audioBuffer: AudioBuffer): Promise<AudioBuffer> {
    if (!this.audioContext) return audioBuffer;

    const offlineContext = new OfflineAudioContext(
      1, // Mono
      audioBuffer.length,
      audioBuffer.sampleRate
    );

    const source = offlineContext.createBufferSource();
    source.buffer = audioBuffer;

    // Apply same processing chain as real-time
    const highPass = offlineContext.createBiquadFilter();
    highPass.type = 'highpass';
    highPass.frequency.value = 80;

    const lowPass = offlineContext.createBiquadFilter();
    lowPass.type = 'lowpass';
    lowPass.frequency.value = 8000;

    const compressor = offlineContext.createDynamicsCompressor();
    compressor.threshold.value = -24;
    compressor.knee.value = 30;
    compressor.ratio.value = 12;
    compressor.attack.value = 0.003;
    compressor.release.value = 0.25;

    // Apply normalization
    const gain = offlineContext.createGain();
    gain.gain.value = 1.2; // Slight boost

    source
      .connect(highPass)
      .connect(lowPass)
      .connect(compressor)
      .connect(gain)
      .connect(offlineContext.destination);

    source.start();
    return await offlineContext.startRendering();
  }

  private audioBufferToBlob(audioBuffer: AudioBuffer): Blob {
    const length = audioBuffer.length;
    const arrayBuffer = new ArrayBuffer(length * 2);
    const view = new DataView(arrayBuffer);
    const channelData = audioBuffer.getChannelData(0);

    // Convert to 16-bit PCM
    let offset = 0;
    for (let i = 0; i < length; i++) {
      const sample = Math.max(-1, Math.min(1, channelData[i]));
      view.setInt16(offset, sample * 0x7FFF, true);
      offset += 2;
    }

    return new Blob([arrayBuffer], { type: 'audio/wav' });
  }

  cleanup() {
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop());
      this.mediaStream = null;
    }
    
    if (this.audioContext && this.audioContext.state !== 'closed') {
      this.audioContext.close();
    }
    
    this.audioContext = null;
    this.analyser = null;
    this.noiseGate = null;
    this.compressor = null;
    this.highPassFilter = null;
    this.lowPassFilter = null;
  }
}

// Singleton instance for global use
export const audioProcessor = new AudioProcessor();