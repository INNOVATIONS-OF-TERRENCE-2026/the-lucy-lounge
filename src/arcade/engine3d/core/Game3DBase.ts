/**
 * ┌─────────────────────────────────────────────────────────────────────────────┐
 * │ LUCY ARCADE — 3D GAME BASE CLASS                                           │
 * │                                                                             │
 * │ Abstract base class for all AAA 3D games                                   │
 * │ Provides lifecycle, state management, and common utilities                 │
 * └─────────────────────────────────────────────────────────────────────────────┘
 */

import * as THREE from 'three';
import { Engine3D, type Engine3DConfig, type EngineStats } from './Engine3D';
import type { InputState } from './InputManager';
import type { PhysicsBody, CharacterController } from './PhysicsWorld';
import { ParticleSystem, type ParticleConfig } from './ParticleSystem';

export type GameState = 'loading' | 'menu' | 'playing' | 'paused' | 'gameover' | 'victory';

export interface Game3DConfig {
  engineConfig?: Partial<Engine3DConfig>;
  showStats?: boolean;
  showDebug?: boolean;
  autoStart?: boolean;
}

export interface GameScore {
  score: number;
  time: number;
  kills?: number;
  deaths?: number;
  accuracy?: number;
  combo?: number;
  rank?: string;
}

export abstract class Game3DBase {
  // Engine
  protected engine: Engine3D;
  protected container: HTMLElement;
  
  // State
  protected state: GameState = 'loading';
  protected score: GameScore = { score: 0, time: 0 };
  protected difficulty: 'easy' | 'medium' | 'hard' | 'expert' = 'medium';
  
  // Time
  protected gameTime: number = 0;
  protected pauseTime: number = 0;
  
  // Callbacks
  private stateChangeCallbacks: Set<(state: GameState) => void> = new Set();
  private scoreChangeCallbacks: Set<(score: GameScore) => void> = new Set();
  
  // Particle systems
  protected particleSystems: Map<string, ParticleSystem> = new Map();
  
  // Debug
  protected showStats: boolean;
  protected showDebug: boolean;

  constructor(container: HTMLElement, config: Game3DConfig = {}) {
    this.container = container;
    this.showStats = config.showStats ?? false;
    this.showDebug = config.showDebug ?? false;
    
    // Initialize engine
    this.engine = new Engine3D({
      container,
      ...config.engineConfig,
    });
    
    // Register update callbacks
    this.engine.onUpdate(this.internalUpdate.bind(this));
    this.engine.onFixedUpdate(this.internalFixedUpdate.bind(this));
    this.engine.onResize(this.onResize.bind(this));
    
    // Auto-start loading
    if (config.autoStart !== false) {
      this.load();
    }
  }

  // ============================================================================
  // LIFECYCLE - Override these in subclasses
  // ============================================================================

  /**
   * Load game assets (models, textures, sounds)
   * Called automatically on construction
   */
  protected abstract loadAssets(): Promise<void>;

  /**
   * Initialize game scene (create objects, setup physics)
   * Called after assets are loaded
   */
  protected abstract initScene(): void;

  /**
   * Game update loop (called every frame)
   * @param deltaTime Time since last frame in seconds
   * @param input Current input state
   */
  protected abstract update(deltaTime: number, input: InputState): void;

  /**
   * Fixed timestep update (for physics)
   * @param fixedDeltaTime Fixed timestep (usually 1/60)
   */
  protected abstract fixedUpdate(fixedDeltaTime: number): void;

  /**
   * Clean up game resources
   */
  protected abstract cleanup(): void;

  // ============================================================================
  // OPTIONAL LIFECYCLE HOOKS
  // ============================================================================

  /**
   * Called when game state changes
   */
  protected onStateChange(newState: GameState, oldState: GameState): void {}

  /**
   * Called when window/container is resized
   */
  protected onResize(width: number, height: number): void {}

  /**
   * Called when game starts
   */
  protected onGameStart(): void {}

  /**
   * Called when game is paused
   */
  protected onGamePause(): void {}

  /**
   * Called when game is resumed
   */
  protected onGameResume(): void {}

  /**
   * Called when game ends
   */
  protected onGameEnd(victory: boolean): void {}

  // ============================================================================
  // INTERNAL UPDATE LOOP
  // ============================================================================

  private internalUpdate(deltaTime: number, elapsedTime: number, input: InputState): void {
    // Handle pause toggle
    if (input.virtual.pausePressed && this.state === 'playing') {
      this.pause();
      return;
    }
    
    if (input.virtual.pausePressed && this.state === 'paused') {
      this.resume();
      return;
    }
    
    // Only update game when playing
    if (this.state === 'playing') {
      this.gameTime += deltaTime;
      this.score.time = this.gameTime;
      
      // Update particle systems
      this.particleSystems.forEach(ps => ps.update(deltaTime));
      
      // Call game update
      this.update(deltaTime, input);
    }
    
    // Update audio listener position
    this.engine.audio.updateListener();
  }

  private internalFixedUpdate(fixedDeltaTime: number): void {
    if (this.state === 'playing') {
      this.fixedUpdate(fixedDeltaTime);
    }
  }

  // ============================================================================
  // GAME CONTROL
  // ============================================================================

  /**
   * Load game assets and initialize
   */
  public async load(): Promise<void> {
    this.setState('loading');
    
    try {
      await this.loadAssets();
      this.initScene();
      this.setState('menu');
    } catch (error) {
      console.error('[Game3DBase] Failed to load:', error);
      throw error;
    }
  }

  /**
   * Start the game
   */
  public start(): void {
    if (this.state === 'loading') {
      console.warn('[Game3DBase] Cannot start while loading');
      return;
    }
    
    this.gameTime = 0;
    this.score = { score: 0, time: 0 };
    
    this.engine.start();
    this.setState('playing');
    this.onGameStart();
  }

  /**
   * Pause the game
   */
  public pause(): void {
    if (this.state !== 'playing') return;
    
    this.engine.pause();
    this.setState('paused');
    this.onGamePause();
  }

  /**
   * Resume the game
   */
  public resume(): void {
    if (this.state !== 'paused') return;
    
    this.engine.resume();
    this.setState('playing');
    this.onGameResume();
  }

  /**
   * End the game
   */
  public end(victory: boolean = false): void {
    this.setState(victory ? 'victory' : 'gameover');
    this.onGameEnd(victory);
  }

  /**
   * Restart the game
   */
  public restart(): void {
    this.cleanup();
    this.initScene();
    this.start();
  }

  /**
   * Stop and dispose the game
   */
  public dispose(): void {
    this.cleanup();
    
    // Dispose particle systems
    this.particleSystems.forEach(ps => ps.dispose());
    this.particleSystems.clear();
    
    // Dispose engine
    this.engine.dispose();
    
    // Clear callbacks
    this.stateChangeCallbacks.clear();
    this.scoreChangeCallbacks.clear();
  }

  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================

  protected setState(newState: GameState): void {
    const oldState = this.state;
    this.state = newState;
    
    this.onStateChange(newState, oldState);
    this.stateChangeCallbacks.forEach(cb => cb(newState));
  }

  public getState(): GameState {
    return this.state;
  }

  public onStateChangeCallback(callback: (state: GameState) => void): () => void {
    this.stateChangeCallbacks.add(callback);
    return () => this.stateChangeCallbacks.delete(callback);
  }

  // ============================================================================
  // SCORE MANAGEMENT
  // ============================================================================

  protected addScore(points: number): void {
    this.score.score += points;
    this.notifyScoreChange();
  }

  protected setScore(score: Partial<GameScore>): void {
    this.score = { ...this.score, ...score };
    this.notifyScoreChange();
  }

  private notifyScoreChange(): void {
    this.scoreChangeCallbacks.forEach(cb => cb({ ...this.score }));
  }

  public getScore(): GameScore {
    return { ...this.score };
  }

  public onScoreChange(callback: (score: GameScore) => void): () => void {
    this.scoreChangeCallbacks.add(callback);
    return () => this.scoreChangeCallbacks.delete(callback);
  }

  // ============================================================================
  // DIFFICULTY
  // ============================================================================

  public setDifficulty(difficulty: 'easy' | 'medium' | 'hard' | 'expert'): void {
    this.difficulty = difficulty;
  }

  public getDifficulty(): string {
    return this.difficulty;
  }

  // ============================================================================
  // ENGINE ACCESS
  // ============================================================================

  public getEngine(): Engine3D {
    return this.engine;
  }

  public getScene(): THREE.Scene {
    return this.engine.scene;
  }

  public getCamera(): THREE.PerspectiveCamera {
    return this.engine.camera;
  }

  public getStats(): EngineStats {
    return this.engine.getStats();
  }

  // ============================================================================
  // PARTICLE SYSTEM HELPERS
  // ============================================================================

  protected createParticleSystem(id: string, config: Partial<ParticleConfig>): ParticleSystem {
    const ps = new ParticleSystem(config);
    this.particleSystems.set(id, ps);
    this.engine.scene.add(ps.getObject3D());
    return ps;
  }

  protected getParticleSystem(id: string): ParticleSystem | undefined {
    return this.particleSystems.get(id);
  }

  protected removeParticleSystem(id: string): void {
    const ps = this.particleSystems.get(id);
    if (ps) {
      this.engine.scene.remove(ps.getObject3D());
      ps.dispose();
      this.particleSystems.delete(id);
    }
  }

  // ============================================================================
  // COMMON GAME UTILITIES
  // ============================================================================

  /**
   * Create a ground plane with physics
   */
  protected createGround(
    size: number = 100,
    color: number = 0x333333,
    receiveShadow: boolean = true
  ): THREE.Mesh {
    const geometry = new THREE.PlaneGeometry(size, size);
    const material = new THREE.MeshStandardMaterial({
      color,
      roughness: 0.8,
      metalness: 0.2,
    });
    
    const ground = new THREE.Mesh(geometry, material);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = receiveShadow;
    
    this.engine.scene.add(ground);
    
    // Add physics
    if (this.engine.physics.isInitialized()) {
      this.engine.physics.addBox(
        ground,
        new THREE.Vector3(size, 0.1, size),
        'static'
      );
    }
    
    return ground;
  }

  /**
   * Create a skybox from colors
   */
  protected createGradientSkybox(topColor: number, bottomColor: number): void {
    const canvas = document.createElement('canvas');
    canvas.width = 2;
    canvas.height = 512;
    
    const ctx = canvas.getContext('2d')!;
    const gradient = ctx.createLinearGradient(0, 0, 0, 512);
    
    const top = new THREE.Color(topColor);
    const bottom = new THREE.Color(bottomColor);
    
    gradient.addColorStop(0, `#${top.getHexString()}`);
    gradient.addColorStop(1, `#${bottom.getHexString()}`);
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 2, 512);
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.mapping = THREE.EquirectangularReflectionMapping;
    
    this.engine.scene.background = texture;
  }

  /**
   * Create standard lighting setup
   */
  protected createStandardLighting(): void {
    // Ambient light
    this.engine.addAmbientLight(0xffffff, 0.4);
    
    // Main directional light (sun)
    const sunLight = this.engine.addDirectionalLight(
      0xffffff,
      1.0,
      new THREE.Vector3(20, 30, 20),
      true
    );
    
    // Fill light
    this.engine.addDirectionalLight(
      0x8888ff,
      0.3,
      new THREE.Vector3(-10, 10, -10),
      false
    );
  }

  /**
   * Screen shake effect
   */
  protected screenShake(intensity: number = 0.5, duration: number = 0.3): void {
    // Implemented via camera controller if available
    // Or direct camera manipulation
    const startPos = this.engine.camera.position.clone();
    const startTime = performance.now();
    
    const shake = () => {
      const elapsed = (performance.now() - startTime) / 1000;
      
      if (elapsed >= duration) {
        this.engine.camera.position.copy(startPos);
        return;
      }
      
      const decay = 1 - elapsed / duration;
      const offset = new THREE.Vector3(
        (Math.random() - 0.5) * intensity * decay,
        (Math.random() - 0.5) * intensity * decay,
        (Math.random() - 0.5) * intensity * decay * 0.5
      );
      
      this.engine.camera.position.copy(startPos).add(offset);
      requestAnimationFrame(shake);
    };
    
    shake();
  }

  /**
   * Slow motion effect
   */
  protected slowMotion(scale: number = 0.2, duration: number = 1.0): Promise<void> {
    return new Promise((resolve) => {
      // This would need to be implemented with a time scale system
      // For now, just wait the duration
      setTimeout(resolve, duration * 1000);
    });
  }

  /**
   * Request pointer lock for FPS controls
   */
  protected requestPointerLock(): void {
    this.engine.input.requestPointerLock();
  }

  /**
   * Exit pointer lock
   */
  protected exitPointerLock(): void {
    this.engine.input.exitPointerLock();
  }

  /**
   * Vibrate gamepad
   */
  protected vibrateGamepad(duration: number = 200, strong: number = 0.5, weak: number = 0.5): void {
    this.engine.input.vibrate(duration, strong, weak);
  }
}

export default Game3DBase;
