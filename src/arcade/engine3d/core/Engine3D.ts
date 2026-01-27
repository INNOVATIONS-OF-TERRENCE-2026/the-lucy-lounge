/**
 * ┌─────────────────────────────────────────────────────────────────────────────┐
 * │ LUCY ARCADE — AAA 3D GAME ENGINE                                           │
 * │                                                                             │
 * │ Core engine built on Three.js with WebGL2/WebGPU support                   │
 * │ Real-time lighting, shadows, post-processing, physics                      │
 * │                                                                             │
 * │ THIS IS A CONSOLE-LEVEL WEB PLATFORM                                       │
 * └─────────────────────────────────────────────────────────────────────────────┘
 */

import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { FXAAShader } from 'three/examples/jsm/shaders/FXAAShader.js';
import { SMAAPass } from 'three/examples/jsm/postprocessing/SMAAPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import { InputManager, type InputState } from './InputManager';
import { PhysicsWorld } from './PhysicsWorld';
import { AudioEngine } from './AudioEngine';
import { AssetLoader } from './AssetLoader';

export interface Engine3DConfig {
  container: HTMLElement;
  width?: number;
  height?: number;
  antialias?: boolean;
  shadows?: boolean;
  shadowMapSize?: number;
  bloom?: boolean;
  bloomStrength?: number;
  bloomRadius?: number;
  bloomThreshold?: number;
  fxaa?: boolean;
  smaa?: boolean;
  toneMapping?: THREE.ToneMapping;
  toneMappingExposure?: number;
  physicsEnabled?: boolean;
  audioEnabled?: boolean;
  targetFPS?: number;
  pixelRatio?: number;
  backgroundColor?: number;
  fog?: { color: number; near: number; far: number } | null;
}

export interface EngineStats {
  fps: number;
  frameTime: number;
  drawCalls: number;
  triangles: number;
  physicsTime: number;
  renderTime: number;
}

export type UpdateCallback = (deltaTime: number, elapsedTime: number, input: InputState) => void;
export type FixedUpdateCallback = (fixedDeltaTime: number) => void;

const DEFAULT_CONFIG: Partial<Engine3DConfig> = {
  antialias: true,
  shadows: true,
  shadowMapSize: 2048,
  bloom: true,
  bloomStrength: 0.8,
  bloomRadius: 0.4,
  bloomThreshold: 0.85,
  fxaa: false,
  smaa: true,
  toneMapping: THREE.ACESFilmicToneMapping,
  toneMappingExposure: 1.0,
  physicsEnabled: true,
  audioEnabled: true,
  targetFPS: 60,
  pixelRatio: Math.min(window.devicePixelRatio, 2),
  backgroundColor: 0x000000,
  fog: null,
};

export class Engine3D {
  // Core Three.js components
  public readonly renderer: THREE.WebGLRenderer;
  public readonly scene: THREE.Scene;
  public readonly camera: THREE.PerspectiveCamera;
  public readonly composer: EffectComposer;
  
  // Subsystems
  public readonly input: InputManager;
  public readonly physics: PhysicsWorld;
  public readonly audio: AudioEngine;
  public readonly assets: AssetLoader;
  
  // Configuration
  private config: Engine3DConfig;
  private container: HTMLElement;
  
  // Game loop
  private isRunning: boolean = false;
  private isPaused: boolean = false;
  private animationFrameId: number | null = null;
  private clock: THREE.Clock;
  private accumulator: number = 0;
  private fixedTimeStep: number = 1 / 60;
  
  // Callbacks
  private updateCallbacks: Set<UpdateCallback> = new Set();
  private fixedUpdateCallbacks: Set<FixedUpdateCallback> = new Set();
  private resizeCallbacks: Set<(width: number, height: number) => void> = new Set();
  
  // Stats
  private stats: EngineStats = {
    fps: 0,
    frameTime: 0,
    drawCalls: 0,
    triangles: 0,
    physicsTime: 0,
    renderTime: 0,
  };
  private frameCount: number = 0;
  private lastStatsTime: number = 0;
  
  // Post-processing passes
  private bloomPass: UnrealBloomPass | null = null;
  private fxaaPass: ShaderPass | null = null;
  private smaaPass: SMAAPass | null = null;

  constructor(config: Engine3DConfig) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.container = config.container;
    
    const width = this.config.width || this.container.clientWidth;
    const height = this.config.height || this.container.clientHeight;
    
    // Initialize Three.js renderer
    this.renderer = new THREE.WebGLRenderer({
      antialias: this.config.antialias,
      powerPreference: 'high-performance',
      stencil: false,
    });
    
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(this.config.pixelRatio!);
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = this.config.toneMapping!;
    this.renderer.toneMappingExposure = this.config.toneMappingExposure!;
    
    // Shadow configuration
    if (this.config.shadows) {
      this.renderer.shadowMap.enabled = true;
      this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    }
    
    this.container.appendChild(this.renderer.domElement);
    
    // Initialize scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(this.config.backgroundColor!);
    
    if (this.config.fog) {
      this.scene.fog = new THREE.Fog(
        this.config.fog.color,
        this.config.fog.near,
        this.config.fog.far
      );
    }
    
    // Initialize camera
    this.camera = new THREE.PerspectiveCamera(
      75,
      width / height,
      0.1,
      1000
    );
    this.camera.position.set(0, 5, 10);
    this.camera.lookAt(0, 0, 0);
    
    // Initialize post-processing
    this.composer = new EffectComposer(this.renderer);
    this.setupPostProcessing(width, height);
    
    // Initialize subsystems
    this.input = new InputManager(this.renderer.domElement);
    this.physics = new PhysicsWorld();
    this.audio = new AudioEngine(this.camera);
    this.assets = new AssetLoader();
    
    // Initialize clock
    this.clock = new THREE.Clock();
    
    // Setup resize handler
    this.setupResizeHandler();
    
    console.log('[Engine3D] Initialized with WebGL2');
    console.log('[Engine3D] Max texture size:', this.renderer.capabilities.maxTextureSize);
    console.log('[Engine3D] Max anisotropy:', this.renderer.capabilities.getMaxAnisotropy());
  }

  private setupPostProcessing(width: number, height: number): void {
    // Render pass
    const renderPass = new RenderPass(this.scene, this.camera);
    this.composer.addPass(renderPass);
    
    // Bloom pass
    if (this.config.bloom) {
      this.bloomPass = new UnrealBloomPass(
        new THREE.Vector2(width, height),
        this.config.bloomStrength!,
        this.config.bloomRadius!,
        this.config.bloomThreshold!
      );
      this.composer.addPass(this.bloomPass);
    }
    
    // SMAA (better quality than FXAA)
    if (this.config.smaa) {
      this.smaaPass = new SMAAPass(width, height);
      this.composer.addPass(this.smaaPass);
    }
    
    // FXAA (faster, lower quality)
    if (this.config.fxaa && !this.config.smaa) {
      this.fxaaPass = new ShaderPass(FXAAShader);
      this.fxaaPass.uniforms['resolution'].value.set(1 / width, 1 / height);
      this.composer.addPass(this.fxaaPass);
    }
    
    // Output pass (required for correct color space)
    const outputPass = new OutputPass();
    this.composer.addPass(outputPass);
  }

  private setupResizeHandler(): void {
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.target === this.container) {
          this.handleResize();
        }
      }
    });
    
    resizeObserver.observe(this.container);
    window.addEventListener('resize', () => this.handleResize());
  }

  private handleResize(): void {
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    
    if (width === 0 || height === 0) return;
    
    // Update camera
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    
    // Update renderer
    this.renderer.setSize(width, height);
    this.composer.setSize(width, height);
    
    // Update post-processing passes
    if (this.bloomPass) {
      this.bloomPass.resolution.set(width, height);
    }
    
    if (this.fxaaPass) {
      this.fxaaPass.uniforms['resolution'].value.set(1 / width, 1 / height);
    }
    
    if (this.smaaPass) {
      this.smaaPass.setSize(width, height);
    }
    
    // Notify listeners
    this.resizeCallbacks.forEach(cb => cb(width, height));
  }

  // ============================================================================
  // GAME LOOP
  // ============================================================================

  public start(): void {
    if (this.isRunning) return;
    
    this.isRunning = true;
    this.isPaused = false;
    this.clock.start();
    this.lastStatsTime = performance.now();
    
    this.input.start();
    
    if (this.config.physicsEnabled) {
      this.physics.init().then(() => {
        console.log('[Engine3D] Physics initialized');
      });
    }
    
    this.gameLoop();
    console.log('[Engine3D] Game loop started');
  }

  public stop(): void {
    if (!this.isRunning) return;
    
    this.isRunning = false;
    
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    
    this.input.stop();
    this.clock.stop();
    
    console.log('[Engine3D] Game loop stopped');
  }

  public pause(): void {
    this.isPaused = true;
    this.clock.stop();
    console.log('[Engine3D] Paused');
  }

  public resume(): void {
    this.isPaused = false;
    this.clock.start();
    console.log('[Engine3D] Resumed');
  }

  private gameLoop = (): void => {
    if (!this.isRunning) return;
    
    this.animationFrameId = requestAnimationFrame(this.gameLoop);
    
    if (this.isPaused) return;
    
    const deltaTime = Math.min(this.clock.getDelta(), 0.1); // Cap at 100ms
    const elapsedTime = this.clock.getElapsedTime();
    
    // Update input
    this.input.update();
    const inputState = this.input.getState();
    
    // Fixed timestep physics update
    if (this.config.physicsEnabled && this.physics.isInitialized()) {
      const physicsStart = performance.now();
      
      this.accumulator += deltaTime;
      
      while (this.accumulator >= this.fixedTimeStep) {
        // Fixed update callbacks (physics, AI, etc.)
        this.fixedUpdateCallbacks.forEach(cb => cb(this.fixedTimeStep));
        
        // Step physics
        this.physics.step(this.fixedTimeStep);
        
        this.accumulator -= this.fixedTimeStep;
      }
      
      this.stats.physicsTime = performance.now() - physicsStart;
    }
    
    // Variable timestep update (rendering, animations, etc.)
    this.updateCallbacks.forEach(cb => cb(deltaTime, elapsedTime, inputState));
    
    // Render
    const renderStart = performance.now();
    this.composer.render();
    this.stats.renderTime = performance.now() - renderStart;
    
    // Update stats
    this.updateStats();
  };

  private updateStats(): void {
    this.frameCount++;
    
    const now = performance.now();
    const elapsed = now - this.lastStatsTime;
    
    if (elapsed >= 1000) {
      this.stats.fps = Math.round((this.frameCount * 1000) / elapsed);
      this.stats.frameTime = elapsed / this.frameCount;
      this.stats.drawCalls = this.renderer.info.render.calls;
      this.stats.triangles = this.renderer.info.render.triangles;
      
      this.frameCount = 0;
      this.lastStatsTime = now;
    }
  }

  // ============================================================================
  // CALLBACK REGISTRATION
  // ============================================================================

  public onUpdate(callback: UpdateCallback): () => void {
    this.updateCallbacks.add(callback);
    return () => this.updateCallbacks.delete(callback);
  }

  public onFixedUpdate(callback: FixedUpdateCallback): () => void {
    this.fixedUpdateCallbacks.add(callback);
    return () => this.fixedUpdateCallbacks.delete(callback);
  }

  public onResize(callback: (width: number, height: number) => void): () => void {
    this.resizeCallbacks.add(callback);
    return () => this.resizeCallbacks.delete(callback);
  }

  // ============================================================================
  // SCENE MANAGEMENT
  // ============================================================================

  public add(...objects: THREE.Object3D[]): void {
    objects.forEach(obj => this.scene.add(obj));
  }

  public remove(...objects: THREE.Object3D[]): void {
    objects.forEach(obj => this.scene.remove(obj));
  }

  public clear(): void {
    while (this.scene.children.length > 0) {
      const child = this.scene.children[0];
      this.scene.remove(child);
      
      if (child instanceof THREE.Mesh) {
        child.geometry?.dispose();
        if (Array.isArray(child.material)) {
          child.material.forEach(m => m.dispose());
        } else {
          child.material?.dispose();
        }
      }
    }
    
    this.physics.clear();
  }

  // ============================================================================
  // LIGHTING HELPERS
  // ============================================================================

  public addAmbientLight(color: number = 0xffffff, intensity: number = 0.4): THREE.AmbientLight {
    const light = new THREE.AmbientLight(color, intensity);
    this.scene.add(light);
    return light;
  }

  public addDirectionalLight(
    color: number = 0xffffff,
    intensity: number = 1,
    position: THREE.Vector3 = new THREE.Vector3(10, 20, 10),
    castShadow: boolean = true
  ): THREE.DirectionalLight {
    const light = new THREE.DirectionalLight(color, intensity);
    light.position.copy(position);
    
    if (castShadow && this.config.shadows) {
      light.castShadow = true;
      light.shadow.mapSize.width = this.config.shadowMapSize!;
      light.shadow.mapSize.height = this.config.shadowMapSize!;
      light.shadow.camera.near = 0.5;
      light.shadow.camera.far = 500;
      light.shadow.camera.left = -50;
      light.shadow.camera.right = 50;
      light.shadow.camera.top = 50;
      light.shadow.camera.bottom = -50;
      light.shadow.bias = -0.0001;
    }
    
    this.scene.add(light);
    return light;
  }

  public addPointLight(
    color: number = 0xffffff,
    intensity: number = 1,
    position: THREE.Vector3 = new THREE.Vector3(0, 5, 0),
    distance: number = 50,
    decay: number = 2,
    castShadow: boolean = false
  ): THREE.PointLight {
    const light = new THREE.PointLight(color, intensity, distance, decay);
    light.position.copy(position);
    
    if (castShadow && this.config.shadows) {
      light.castShadow = true;
      light.shadow.mapSize.width = this.config.shadowMapSize!;
      light.shadow.mapSize.height = this.config.shadowMapSize!;
    }
    
    this.scene.add(light);
    return light;
  }

  public addSpotLight(
    color: number = 0xffffff,
    intensity: number = 1,
    position: THREE.Vector3 = new THREE.Vector3(0, 10, 0),
    target: THREE.Vector3 = new THREE.Vector3(0, 0, 0),
    angle: number = Math.PI / 6,
    penumbra: number = 0.5,
    castShadow: boolean = true
  ): THREE.SpotLight {
    const light = new THREE.SpotLight(color, intensity);
    light.position.copy(position);
    light.target.position.copy(target);
    light.angle = angle;
    light.penumbra = penumbra;
    
    if (castShadow && this.config.shadows) {
      light.castShadow = true;
      light.shadow.mapSize.width = this.config.shadowMapSize!;
      light.shadow.mapSize.height = this.config.shadowMapSize!;
    }
    
    this.scene.add(light);
    this.scene.add(light.target);
    return light;
  }

  // ============================================================================
  // POST-PROCESSING CONTROLS
  // ============================================================================

  public setBloomStrength(strength: number): void {
    if (this.bloomPass) {
      this.bloomPass.strength = strength;
    }
  }

  public setBloomRadius(radius: number): void {
    if (this.bloomPass) {
      this.bloomPass.radius = radius;
    }
  }

  public setBloomThreshold(threshold: number): void {
    if (this.bloomPass) {
      this.bloomPass.threshold = threshold;
    }
  }

  public setExposure(exposure: number): void {
    this.renderer.toneMappingExposure = exposure;
  }

  // ============================================================================
  // GETTERS
  // ============================================================================

  public getStats(): EngineStats {
    return { ...this.stats };
  }

  public getCanvas(): HTMLCanvasElement {
    return this.renderer.domElement;
  }

  public getSize(): { width: number; height: number } {
    return {
      width: this.container.clientWidth,
      height: this.container.clientHeight,
    };
  }

  public isPlaying(): boolean {
    return this.isRunning && !this.isPaused;
  }

  // ============================================================================
  // CLEANUP
  // ============================================================================

  public dispose(): void {
    this.stop();
    this.clear();
    
    this.input.dispose();
    this.physics.dispose();
    this.audio.dispose();
    this.assets.dispose();
    
    this.composer.dispose();
    this.renderer.dispose();
    
    if (this.renderer.domElement.parentElement) {
      this.renderer.domElement.parentElement.removeChild(this.renderer.domElement);
    }
    
    this.updateCallbacks.clear();
    this.fixedUpdateCallbacks.clear();
    this.resizeCallbacks.clear();
    
    console.log('[Engine3D] Disposed');
  }
}

export default Engine3D;
