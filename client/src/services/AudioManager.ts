interface AudioSettings {
  enabled: boolean;
  volume: number;
  spatialAudio: boolean;
  adaptiveVolume: boolean;
  soundTheme: 'minimal' | 'organic' | 'digital' | 'ambient';
}

interface SoundConfig {
  frequency: number;
  duration: number;
  volume: number;
  type: 'sine' | 'square' | 'triangle' | 'sawtooth';
  envelope?: {
    attack: number;
    decay: number;
    sustain: number;
    release: number;
  };
  spatialPosition?: { x: number; y: number };
}

export class AudioManager {
  private audioContext: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private settings: AudioSettings;
  private isInitialized = false;
  private activityLevel = 0;
  private lastInteraction = Date.now();

  constructor() {
    this.settings = this.loadSettings();
    this.initializeAudio();
  }

  private loadSettings(): AudioSettings {
    const saved = localStorage.getItem('workspace-audio-settings');
    return saved ? JSON.parse(saved) : {
      enabled: true,
      volume: 0.3,
      spatialAudio: true,
      adaptiveVolume: true,
      soundTheme: 'minimal'
    };
  }

  private saveSettings(): void {
    localStorage.setItem('workspace-audio-settings', JSON.stringify(this.settings));
  }

  private async initializeAudio(): Promise<void> {
    if (!this.settings.enabled) return;

    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.masterGain = this.audioContext.createGain();
      this.masterGain.connect(this.audioContext.destination);
      this.masterGain.gain.value = this.settings.volume;
      this.isInitialized = true;
    } catch (error) {
      console.warn('Audio context initialization failed:', error);
    }
  }

  private async ensureAudioContext(): Promise<boolean> {
    if (!this.isInitialized || !this.audioContext) {
      await this.initializeAudio();
    }

    if (this.audioContext?.state === 'suspended') {
      try {
        await this.audioContext.resume();
      } catch (error) {
        console.warn('Failed to resume audio context:', error);
        return false;
      }
    }

    return this.isInitialized && this.audioContext?.state === 'running';
  }

  private getAdaptiveVolume(): number {
    if (!this.settings.adaptiveVolume) return this.settings.volume;

    const timeSinceLastInteraction = Date.now() - this.lastInteraction;
    const inactivityFactor = Math.min(timeSinceLastInteraction / 5000, 1); // Reduce volume after 5s of inactivity
    const activityFactor = Math.max(0.3, 1 - (this.activityLevel * 0.1)); // Reduce volume with high activity

    return this.settings.volume * activityFactor * (1 - inactivityFactor * 0.7);
  }

  private updateActivity(): void {
    this.lastInteraction = Date.now();
    this.activityLevel = Math.min(this.activityLevel + 1, 10);
    
    // Decay activity level over time
    setTimeout(() => {
      this.activityLevel = Math.max(0, this.activityLevel - 1);
    }, 1000);
  }

  private getSoundConfig(type: string): SoundConfig {
    const theme = this.settings.soundTheme;
    const configs: Record<string, Record<string, SoundConfig>> = {
      minimal: {
        panelResize: { frequency: 220, duration: 0.1, volume: 0.1, type: 'sine' },
        snapToGrid: { frequency: 440, duration: 0.05, volume: 0.15, type: 'triangle' },
        buttonClick: { frequency: 800, duration: 0.03, volume: 0.05, type: 'square' },
        messageSend: { frequency: 660, duration: 0.2, volume: 0.1, type: 'sine' },
        messageReceive: { frequency: 523, duration: 0.15, volume: 0.08, type: 'triangle' },
        snapshotSave: { frequency: 880, duration: 0.3, volume: 0.12, type: 'sine' },
        snapshotRestore: { frequency: 440, duration: 0.25, volume: 0.1, type: 'triangle' },
        agentActivated: { frequency: 392, duration: 0.4, volume: 0.08, type: 'sine' },
        agentCompleted: { frequency: 523, duration: 0.3, volume: 0.1, type: 'triangle' },
        error: { frequency: 200, duration: 0.5, volume: 0.15, type: 'sawtooth' },
        success: { frequency: 880, duration: 0.4, volume: 0.12, type: 'sine' },
        notification: { frequency: 698, duration: 0.2, volume: 0.08, type: 'triangle' }
      },
      organic: {
        panelResize: { frequency: 180, duration: 0.15, volume: 0.12, type: 'triangle' },
        snapToGrid: { frequency: 320, duration: 0.08, volume: 0.18, type: 'sine' },
        buttonClick: { frequency: 600, duration: 0.04, volume: 0.06, type: 'triangle' },
        messageSend: { frequency: 520, duration: 0.25, volume: 0.12, type: 'triangle' },
        messageReceive: { frequency: 415, duration: 0.18, volume: 0.1, type: 'sine' },
        snapshotSave: { frequency: 740, duration: 0.35, volume: 0.14, type: 'triangle' },
        snapshotRestore: { frequency: 370, duration: 0.3, volume: 0.12, type: 'sine' },
        agentActivated: { frequency: 311, duration: 0.5, volume: 0.1, type: 'triangle' },
        agentCompleted: { frequency: 466, duration: 0.4, volume: 0.12, type: 'sine' },
        error: { frequency: 165, duration: 0.6, volume: 0.18, type: 'triangle' },
        success: { frequency: 740, duration: 0.5, volume: 0.14, type: 'triangle' },
        notification: { frequency: 554, duration: 0.25, volume: 0.1, type: 'sine' }
      },
      digital: {
        panelResize: { frequency: 440, duration: 0.05, volume: 0.08, type: 'square' },
        snapToGrid: { frequency: 880, duration: 0.03, volume: 0.12, type: 'square' },
        buttonClick: { frequency: 1760, duration: 0.02, volume: 0.04, type: 'square' },
        messageSend: { frequency: 1320, duration: 0.1, volume: 0.08, type: 'square' },
        messageReceive: { frequency: 1046, duration: 0.08, volume: 0.06, type: 'square' },
        snapshotSave: { frequency: 1760, duration: 0.15, volume: 0.1, type: 'square' },
        snapshotRestore: { frequency: 880, duration: 0.12, volume: 0.08, type: 'square' },
        agentActivated: { frequency: 784, duration: 0.2, volume: 0.06, type: 'square' },
        agentCompleted: { frequency: 1046, duration: 0.15, volume: 0.08, type: 'square' },
        error: { frequency: 220, duration: 0.3, volume: 0.12, type: 'sawtooth' },
        success: { frequency: 1760, duration: 0.2, volume: 0.1, type: 'square' },
        notification: { frequency: 1396, duration: 0.1, volume: 0.06, type: 'square' }
      },
      ambient: {
        panelResize: { frequency: 110, duration: 0.3, volume: 0.15, type: 'sine' },
        snapToGrid: { frequency: 220, duration: 0.15, volume: 0.2, type: 'triangle' },
        buttonClick: { frequency: 330, duration: 0.1, volume: 0.08, type: 'sine' },
        messageSend: { frequency: 415, duration: 0.4, volume: 0.15, type: 'sine' },
        messageReceive: { frequency: 330, duration: 0.3, volume: 0.12, type: 'triangle' },
        snapshotSave: { frequency: 554, duration: 0.6, volume: 0.18, type: 'sine' },
        snapshotRestore: { frequency: 277, duration: 0.5, volume: 0.15, type: 'triangle' },
        agentActivated: { frequency: 247, duration: 0.8, volume: 0.12, type: 'sine' },
        agentCompleted: { frequency: 370, duration: 0.6, volume: 0.15, type: 'triangle' },
        error: { frequency: 110, duration: 1.0, volume: 0.2, type: 'triangle' },
        success: { frequency: 554, duration: 0.8, volume: 0.18, type: 'sine' },
        notification: { frequency: 440, duration: 0.4, volume: 0.12, type: 'triangle' }
      }
    };

    return configs[theme]?.[type] || configs.minimal[type];
  }

  private async playTone(config: SoundConfig, spatialPosition?: { x: number; y: number }): Promise<void> {
    if (!await this.ensureAudioContext() || !this.audioContext || !this.masterGain) return;

    this.updateActivity();

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    
    // Spatial audio setup
    let pannerNode: PannerNode | null = null;
    if (this.settings.spatialAudio && spatialPosition) {
      pannerNode = this.audioContext.createPanner();
      pannerNode.panningModel = 'HRTF';
      pannerNode.distanceModel = 'inverse';
      pannerNode.refDistance = 1;
      pannerNode.maxDistance = 10;
      pannerNode.rolloffFactor = 1;
      pannerNode.coneInnerAngle = 360;
      pannerNode.coneOuterAngle = 0;
      pannerNode.coneOuterGain = 0;
      
      // Map 2D position to 3D space
      pannerNode.positionX.value = (spatialPosition.x - 0.5) * 2; // -1 to 1
      pannerNode.positionY.value = 0;
      pannerNode.positionZ.value = (spatialPosition.y - 0.5) * -2; // -1 to 1 (inverted)
    }

    // Audio routing
    oscillator.connect(gainNode);
    if (pannerNode) {
      gainNode.connect(pannerNode);
      pannerNode.connect(this.masterGain);
    } else {
      gainNode.connect(this.masterGain);
    }

    // Configure oscillator
    oscillator.type = config.type;
    oscillator.frequency.value = config.frequency;

    // Configure envelope
    const now = this.audioContext.currentTime;
    const adaptiveVolume = this.getAdaptiveVolume();
    const finalVolume = config.volume * adaptiveVolume;

    if (config.envelope) {
      const { attack, decay, sustain, release } = config.envelope;
      gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.linearRampToValueAtTime(finalVolume, now + attack);
      gainNode.gain.linearRampToValueAtTime(finalVolume * sustain, now + attack + decay);
      gainNode.gain.setValueAtTime(finalVolume * sustain, now + config.duration - release);
      gainNode.gain.linearRampToValueAtTime(0, now + config.duration);
    } else {
      // Simple envelope
      gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.linearRampToValueAtTime(finalVolume, now + 0.01);
      gainNode.gain.setValueAtTime(finalVolume, now + config.duration - 0.02);
      gainNode.gain.linearRampToValueAtTime(0, now + config.duration);
    }

    oscillator.start(now);
    oscillator.stop(now + config.duration);
  }

  // Public API methods
  async playPanelResize(panelIndex: number): Promise<void> {
    const config = this.getSoundConfig('panelResize');
    // Adjust frequency based on panel index
    config.frequency = config.frequency + (panelIndex * 50);
    await this.playTone(config, { x: panelIndex / 3, y: 0.5 });
  }

  async playSnapToGrid(position: { x: number; y: number }): Promise<void> {
    const config = this.getSoundConfig('snapToGrid');
    await this.playTone(config, position);
  }

  async playButtonClick(element?: HTMLElement): Promise<void> {
    const config = this.getSoundConfig('buttonClick');
    let spatialPosition: { x: number; y: number } | undefined;
    
    if (element) {
      const rect = element.getBoundingClientRect();
      spatialPosition = {
        x: (rect.left + rect.width / 2) / window.innerWidth,
        y: (rect.top + rect.height / 2) / window.innerHeight
      };
    }
    
    await this.playTone(config, spatialPosition);
  }

  async playMessageSend(): Promise<void> {
    const config = this.getSoundConfig('messageSend');
    await this.playTone(config, { x: 0.65, y: 0.5 }); // Chat panel position
  }

  async playMessageReceive(): Promise<void> {
    const config = this.getSoundConfig('messageReceive');
    await this.playTone(config, { x: 0.65, y: 0.5 }); // Chat panel position
  }

  async playSnapshotSave(): Promise<void> {
    const config = this.getSoundConfig('snapshotSave');
    config.envelope = { attack: 0.05, decay: 0.1, sustain: 0.7, release: 0.15 };
    await this.playTone(config, { x: 0.9, y: 0.9 }); // Bottom right where widget is
  }

  async playSnapshotRestore(): Promise<void> {
    const config = this.getSoundConfig('snapshotRestore');
    config.envelope = { attack: 0.02, decay: 0.08, sustain: 0.8, release: 0.15 };
    await this.playTone(config, { x: 0.9, y: 0.9 });
  }

  async playAgentActivated(agentType: string): Promise<void> {
    const config = this.getSoundConfig('agentActivated');
    // Vary frequency based on agent type
    const typeMultiplier = agentType.length % 4;
    config.frequency = config.frequency + (typeMultiplier * 30);
    await this.playTone(config, { x: 0.15, y: 0.3 }); // AI panel position
  }

  async playAgentCompleted(agentType: string): Promise<void> {
    const config = this.getSoundConfig('agentCompleted');
    const typeMultiplier = agentType.length % 4;
    config.frequency = config.frequency + (typeMultiplier * 40);
    config.envelope = { attack: 0.05, decay: 0.1, sustain: 0.6, release: 0.25 };
    await this.playTone(config, { x: 0.15, y: 0.3 });
  }

  async playError(): Promise<void> {
    const config = this.getSoundConfig('error');
    config.envelope = { attack: 0.1, decay: 0.2, sustain: 0.5, release: 0.2 };
    await this.playTone(config);
  }

  async playSuccess(): Promise<void> {
    const config = this.getSoundConfig('success');
    config.envelope = { attack: 0.05, decay: 0.15, sustain: 0.7, release: 0.2 };
    await this.playTone(config);
  }

  async playNotification(): Promise<void> {
    const config = this.getSoundConfig('notification');
    await this.playTone(config);
  }

  // Settings management
  updateSettings(newSettings: Partial<AudioSettings>): void {
    this.settings = { ...this.settings, ...newSettings };
    this.saveSettings();
    
    if (this.masterGain) {
      this.masterGain.gain.value = this.settings.volume;
    }

    if (!this.settings.enabled && this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
      this.masterGain = null;
      this.isInitialized = false;
    } else if (this.settings.enabled && !this.isInitialized) {
      this.initializeAudio();
    }
  }

  getSettings(): AudioSettings {
    return { ...this.settings };
  }

  // Test sounds
  async playTestSound(): Promise<void> {
    const config = this.getSoundConfig('notification');
    config.volume = 0.2;
    await this.playTone(config);
  }
}

// Singleton instance
export const audioManager = new AudioManager();