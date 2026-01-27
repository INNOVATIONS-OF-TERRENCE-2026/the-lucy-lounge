/**
 * ┌─────────────────────────────────────────────────────────────────────────────┐
 * │ LUCY ARCADE — 3D AUDIO ENGINE                                              │
 * │                                                                             │
 * │ Positional audio, ambient sounds, music system                             │
 * │ Built on Web Audio API with Three.js integration                           │
 * └─────────────────────────────────────────────────────────────────────────────┘
 */

import * as THREE from 'three';

export interface SoundConfig {
  volume?: number;
  loop?: boolean;
  playbackRate?: number;
  refDistance?: number;
  maxDistance?: number;
  rolloffFactor?: number;
  distanceModel?: 'linear' | 'inverse' | 'exponential';
  autoplay?: boolean;
}

export interface Sound {
  id: string;
  buffer: AudioBuffer;
  source: AudioBufferSourceNode | null;
  gainNode: GainNode;
  isPlaying: boolean;
  config: SoundConfig;
}

export interface PositionalSound extends Sound {
  panner: PannerNode;
  position: THREE.Vector3;
}

export interface MusicTrack {
  id: string;
  buffer: AudioBuffer;
  source: AudioBufferSourceNode | null;
  gainNode: GainNode;
  isPlaying: boolean;
  volume: number;
}

export class AudioEngine {
  private context: AudioContext;
  private listener: THREE.AudioListener;
  private camera: THREE.Camera;
  
  // Audio nodes
  private masterGain: GainNode;
  private sfxGain: GainNode;
  private musicGain: GainNode;
  private ambientGain: GainNode;
  
  // Sound storage
  private sounds: Map<string, Sound> = new Map();
  private positionalSounds: Map<string, PositionalSound> = new Map();
  private musicTracks: Map<string, MusicTrack> = new Map();
  
  // State
  private isMuted: boolean = false;
  private masterVolume: number = 1.0;
  private sfxVolume: number = 1.0;
  private musicVolume: number = 0.7;
  private ambientVolume: number = 0.5;
  
  // Current music
  private currentMusic: MusicTrack | null = null;
  private musicFadeTime: number = 1.0;

  constructor(camera: THREE.Camera) {
    this.camera = camera;
    
    // Create audio context
    this.context = new AudioContext();
    
    // Create Three.js audio listener
    this.listener = new THREE.AudioListener();
    camera.add(this.listener);
    
    // Create gain nodes for mixing
    this.masterGain = this.context.createGain();
    this.sfxGain = this.context.createGain();
    this.musicGain = this.context.createGain();
    this.ambientGain = this.context.createGain();
    
    // Connect audio graph
    this.sfxGain.connect(this.masterGain);
    this.musicGain.connect(this.masterGain);
    this.ambientGain.connect(this.masterGain);
    this.masterGain.connect(this.context.destination);
    
    // Set initial volumes
    this.updateVolumes();
    
    // Resume context on user interaction
    this.setupContextResume();
    
    console.log('[AudioEngine] Initialized');
  }

  private setupContextResume(): void {
    const resume = () => {
      if (this.context.state === 'suspended') {
        this.context.resume();
      }
    };
    
    document.addEventListener('click', resume, { once: true });
    document.addEventListener('keydown', resume, { once: true });
    document.addEventListener('touchstart', resume, { once: true });
  }

  private updateVolumes(): void {
    this.masterGain.gain.value = this.isMuted ? 0 : this.masterVolume;
    this.sfxGain.gain.value = this.sfxVolume;
    this.musicGain.gain.value = this.musicVolume;
    this.ambientGain.gain.value = this.ambientVolume;
  }

  // ============================================================================
  // LOADING
  // ============================================================================

  public async loadSound(id: string, url: string, config: SoundConfig = {}): Promise<Sound> {
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    const buffer = await this.context.decodeAudioData(arrayBuffer);
    
    const gainNode = this.context.createGain();
    gainNode.gain.value = config.volume ?? 1.0;
    gainNode.connect(this.sfxGain);
    
    const sound: Sound = {
      id,
      buffer,
      source: null,
      gainNode,
      isPlaying: false,
      config,
    };
    
    this.sounds.set(id, sound);
    
    if (config.autoplay) {
      this.playSound(id);
    }
    
    return sound;
  }

  public async loadPositionalSound(
    id: string,
    url: string,
    position: THREE.Vector3,
    config: SoundConfig = {}
  ): Promise<PositionalSound> {
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    const buffer = await this.context.decodeAudioData(arrayBuffer);
    
    const gainNode = this.context.createGain();
    gainNode.gain.value = config.volume ?? 1.0;
    
    const panner = this.context.createPanner();
    panner.panningModel = 'HRTF';
    panner.distanceModel = config.distanceModel || 'inverse';
    panner.refDistance = config.refDistance ?? 1;
    panner.maxDistance = config.maxDistance ?? 10000;
    panner.rolloffFactor = config.rolloffFactor ?? 1;
    panner.setPosition(position.x, position.y, position.z);
    
    gainNode.connect(panner);
    panner.connect(this.sfxGain);
    
    const sound: PositionalSound = {
      id,
      buffer,
      source: null,
      gainNode,
      panner,
      position: position.clone(),
      isPlaying: false,
      config,
    };
    
    this.positionalSounds.set(id, sound);
    
    if (config.autoplay) {
      this.playPositionalSound(id);
    }
    
    return sound;
  }

  public async loadMusic(id: string, url: string, volume: number = 1.0): Promise<MusicTrack> {
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    const buffer = await this.context.decodeAudioData(arrayBuffer);
    
    const gainNode = this.context.createGain();
    gainNode.gain.value = volume;
    gainNode.connect(this.musicGain);
    
    const track: MusicTrack = {
      id,
      buffer,
      source: null,
      gainNode,
      isPlaying: false,
      volume,
    };
    
    this.musicTracks.set(id, track);
    return track;
  }

  // ============================================================================
  // PLAYBACK - SOUNDS
  // ============================================================================

  public playSound(id: string, config?: Partial<SoundConfig>): void {
    const sound = this.sounds.get(id);
    if (!sound) {
      console.warn(`[AudioEngine] Sound not found: ${id}`);
      return;
    }
    
    // Stop previous instance if playing
    if (sound.source) {
      sound.source.stop();
    }
    
    // Create new source
    const source = this.context.createBufferSource();
    source.buffer = sound.buffer;
    source.loop = config?.loop ?? sound.config.loop ?? false;
    source.playbackRate.value = config?.playbackRate ?? sound.config.playbackRate ?? 1.0;
    source.connect(sound.gainNode);
    
    source.onended = () => {
      sound.isPlaying = false;
      sound.source = null;
    };
    
    sound.source = source;
    sound.isPlaying = true;
    source.start();
  }

  public playSoundOneShot(id: string, volume: number = 1.0, playbackRate: number = 1.0): void {
    const sound = this.sounds.get(id);
    if (!sound) return;
    
    const source = this.context.createBufferSource();
    source.buffer = sound.buffer;
    source.playbackRate.value = playbackRate;
    
    const gainNode = this.context.createGain();
    gainNode.gain.value = volume;
    gainNode.connect(this.sfxGain);
    
    source.connect(gainNode);
    source.start();
  }

  public stopSound(id: string): void {
    const sound = this.sounds.get(id);
    if (sound?.source) {
      sound.source.stop();
      sound.isPlaying = false;
      sound.source = null;
    }
  }

  // ============================================================================
  // PLAYBACK - POSITIONAL SOUNDS
  // ============================================================================

  public playPositionalSound(id: string): void {
    const sound = this.positionalSounds.get(id);
    if (!sound) return;
    
    if (sound.source) {
      sound.source.stop();
    }
    
    const source = this.context.createBufferSource();
    source.buffer = sound.buffer;
    source.loop = sound.config.loop ?? false;
    source.connect(sound.gainNode);
    
    source.onended = () => {
      sound.isPlaying = false;
      sound.source = null;
    };
    
    sound.source = source;
    sound.isPlaying = true;
    source.start();
  }

  public stopPositionalSound(id: string): void {
    const sound = this.positionalSounds.get(id);
    if (sound?.source) {
      sound.source.stop();
      sound.isPlaying = false;
      sound.source = null;
    }
  }

  public setPositionalSoundPosition(id: string, position: THREE.Vector3): void {
    const sound = this.positionalSounds.get(id);
    if (sound) {
      sound.position.copy(position);
      sound.panner.setPosition(position.x, position.y, position.z);
    }
  }

  // ============================================================================
  // PLAYBACK - MUSIC
  // ============================================================================

  public playMusic(id: string, fadeIn: boolean = true): void {
    const track = this.musicTracks.get(id);
    if (!track) {
      console.warn(`[AudioEngine] Music track not found: ${id}`);
      return;
    }
    
    // Fade out current music
    if (this.currentMusic && this.currentMusic.id !== id) {
      this.stopMusic(true);
    }
    
    if (track.source) {
      track.source.stop();
    }
    
    const source = this.context.createBufferSource();
    source.buffer = track.buffer;
    source.loop = true;
    source.connect(track.gainNode);
    
    source.onended = () => {
      track.isPlaying = false;
      track.source = null;
    };
    
    track.source = source;
    track.isPlaying = true;
    this.currentMusic = track;
    
    if (fadeIn) {
      track.gainNode.gain.value = 0;
      track.gainNode.gain.linearRampToValueAtTime(
        track.volume,
        this.context.currentTime + this.musicFadeTime
      );
    }
    
    source.start();
  }

  public stopMusic(fadeOut: boolean = true): void {
    if (!this.currentMusic) return;
    
    const track = this.currentMusic;
    
    if (fadeOut) {
      track.gainNode.gain.linearRampToValueAtTime(
        0,
        this.context.currentTime + this.musicFadeTime
      );
      
      setTimeout(() => {
        if (track.source) {
          track.source.stop();
          track.isPlaying = false;
          track.source = null;
        }
      }, this.musicFadeTime * 1000);
    } else {
      if (track.source) {
        track.source.stop();
        track.isPlaying = false;
        track.source = null;
      }
    }
    
    this.currentMusic = null;
  }

  public crossfadeMusic(toId: string): void {
    const toTrack = this.musicTracks.get(toId);
    if (!toTrack) return;
    
    // Start new track at 0 volume
    this.playMusic(toId, true);
    
    // Fade out old track (handled in playMusic)
  }

  // ============================================================================
  // VOLUME CONTROL
  // ============================================================================

  public setMasterVolume(volume: number): void {
    this.masterVolume = Math.max(0, Math.min(1, volume));
    this.updateVolumes();
  }

  public setSfxVolume(volume: number): void {
    this.sfxVolume = Math.max(0, Math.min(1, volume));
    this.updateVolumes();
  }

  public setMusicVolume(volume: number): void {
    this.musicVolume = Math.max(0, Math.min(1, volume));
    this.updateVolumes();
  }

  public setAmbientVolume(volume: number): void {
    this.ambientVolume = Math.max(0, Math.min(1, volume));
    this.updateVolumes();
  }

  public mute(): void {
    this.isMuted = true;
    this.updateVolumes();
  }

  public unmute(): void {
    this.isMuted = false;
    this.updateVolumes();
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    this.updateVolumes();
    return this.isMuted;
  }

  // ============================================================================
  // LISTENER UPDATE
  // ============================================================================

  public updateListener(): void {
    // Update listener position and orientation from camera
    const position = new THREE.Vector3();
    const forward = new THREE.Vector3();
    const up = new THREE.Vector3();
    
    this.camera.getWorldPosition(position);
    this.camera.getWorldDirection(forward);
    up.copy(this.camera.up).applyQuaternion(this.camera.quaternion);
    
    if (this.context.listener.positionX) {
      // Modern API
      this.context.listener.positionX.value = position.x;
      this.context.listener.positionY.value = position.y;
      this.context.listener.positionZ.value = position.z;
      this.context.listener.forwardX.value = forward.x;
      this.context.listener.forwardY.value = forward.y;
      this.context.listener.forwardZ.value = forward.z;
      this.context.listener.upX.value = up.x;
      this.context.listener.upY.value = up.y;
      this.context.listener.upZ.value = up.z;
    } else {
      // Legacy API
      this.context.listener.setPosition(position.x, position.y, position.z);
      this.context.listener.setOrientation(forward.x, forward.y, forward.z, up.x, up.y, up.z);
    }
  }

  // ============================================================================
  // UTILITIES
  // ============================================================================

  public getSound(id: string): Sound | undefined {
    return this.sounds.get(id);
  }

  public getPositionalSound(id: string): PositionalSound | undefined {
    return this.positionalSounds.get(id);
  }

  public getMusicTrack(id: string): MusicTrack | undefined {
    return this.musicTracks.get(id);
  }

  public isSoundPlaying(id: string): boolean {
    return this.sounds.get(id)?.isPlaying ?? false;
  }

  public isMusicPlaying(): boolean {
    return this.currentMusic?.isPlaying ?? false;
  }

  public getCurrentMusicId(): string | null {
    return this.currentMusic?.id ?? null;
  }

  public getContext(): AudioContext {
    return this.context;
  }

  // ============================================================================
  // CLEANUP
  // ============================================================================

  public stopAll(): void {
    this.sounds.forEach((sound) => {
      if (sound.source) {
        sound.source.stop();
        sound.isPlaying = false;
        sound.source = null;
      }
    });
    
    this.positionalSounds.forEach((sound) => {
      if (sound.source) {
        sound.source.stop();
        sound.isPlaying = false;
        sound.source = null;
      }
    });
    
    this.stopMusic(false);
  }

  public dispose(): void {
    this.stopAll();
    
    this.sounds.clear();
    this.positionalSounds.clear();
    this.musicTracks.clear();
    
    this.camera.remove(this.listener);
    
    if (this.context.state !== 'closed') {
      this.context.close();
    }
    
    console.log('[AudioEngine] Disposed');
  }
}

export default AudioEngine;
