/**
 * ┌─────────────────────────────────────────────────────────────────────────────┐
 * │ LUCY GAME SDK — MAIN ENTRY POINT                                           │
 * │                                                                             │
 * │ The unified SDK for building AAA web games on Lucy Arcade                  │
 * │                                                                             │
 * │ CAPABILITIES:                                                              │
 * │ • WebGPU/WebGL Rendering Pipeline                                          │
 * │ • Deterministic Physics                                                    │
 * │ • Unified Input (KB/M, Touch, Gamepad)                                     │
 * │ • Spatial Audio                                                            │
 * │ • Network Synchronization                                                  │
 * │ • AI Opponent System                                                       │
 * │ • Graphics Tier Enforcement                                                │
 * │                                                                             │
 * │ VERSION: 1.0.0                                                             │
 * └─────────────────────────────────────────────────────────────────────────────┘
 */

import type {
  LucyGameConfig,
  GraphicsTierLevel,
  GraphicsTierSpec,
  GameSession,
  LucyPlayer,
  InputSnapshot,
  NetworkState,
  PhysicsConfig,
  AudioConfig,
  AIConfig,
  GameEvent,
  EventCallback,
  Vector3,
  Quaternion,
  SyncedEntity,
} from './types';

// ============================================================================
// SDK INITIALIZATION
// ============================================================================

export interface SDKInitOptions {
  gameConfig: LucyGameConfig;
  container: HTMLElement;
  
  // Rendering
  preferWebGPU?: boolean;
  forceGraphicsTier?: GraphicsTierLevel;
  
  // Physics
  physicsConfig?: Partial<PhysicsConfig>;
  
  // Audio
  audioConfig?: Partial<AudioConfig>;
  
  // Network
  serverUrl?: string;
  enableNetworking?: boolean;
  
  // Debug
  debug?: boolean;
  showStats?: boolean;
}

export interface SDKState {
  initialized: boolean;
  currentTier: GraphicsTierLevel;
  session: GameSession | null;
  localPlayer: LucyPlayer | null;
  networkState: NetworkState;
  
  // Performance
  fps: number;
  frameTime: number;
  physicsTime: number;
  renderTime: number;
}

// ============================================================================
// LUCY GAME SDK CLASS
// ============================================================================

export class LucyGameSDK {
  private static instance: LucyGameSDK | null = null;
  
  // Core Systems
  private renderer: SDKRenderer | null = null;
  private physics: SDKPhysics | null = null;
  private input: SDKInput | null = null;
  private audio: SDKAudio | null = null;
  private network: SDKNetwork | null = null;
  private ai: SDKAI | null = null;
  
  // State
  private config: LucyGameConfig | null = null;
  private state: SDKState;
  private container: HTMLElement | null = null;
  
  // Game Loop
  private isRunning: boolean = false;
  private lastTime: number = 0;
  private accumulator: number = 0;
  private fixedTimestep: number = 1 / 60; // 60Hz physics
  private currentTick: number = 0;
  
  // Callbacks
  private updateCallbacks: Set<(dt: number) => void> = new Set();
  private fixedUpdateCallbacks: Set<(tick: number) => void> = new Set();
  private eventCallbacks: Map<string, Set<EventCallback>> = new Map();
  
  private constructor() {
    this.state = {
      initialized: false,
      currentTier: 'B',
      session: null,
      localPlayer: null,
      networkState: {
        isConnected: false,
        isHost: false,
        latency: 0,
        jitter: 0,
        packetLoss: 0,
        serverTick: 0,
        clientTick: 0,
        tickOffset: 0,
        bytesSent: 0,
        bytesReceived: 0,
        packetsPerSecond: 0,
      },
      fps: 0,
      frameTime: 0,
      physicsTime: 0,
      renderTime: 0,
    };
  }
  
  // ============================================================================
  // SINGLETON ACCESS
  // ============================================================================
  
  public static getInstance(): LucyGameSDK {
    if (!LucyGameSDK.instance) {
      LucyGameSDK.instance = new LucyGameSDK();
    }
    return LucyGameSDK.instance;
  }
  
  public static create(): LucyGameSDK {
    return LucyGameSDK.getInstance();
  }
  
  // ============================================================================
  // INITIALIZATION
  // ============================================================================
  
  public async initialize(options: SDKInitOptions): Promise<void> {
    if (this.state.initialized) {
      console.warn('[LucySDK] Already initialized');
      return;
    }
    
    console.log('[LucySDK] Initializing Lucy Game SDK v1.0.0');
    
    this.config = options.gameConfig;
    this.container = options.container;
    
    // Detect and enforce graphics tier
    const detectedTier = options.forceGraphicsTier || await this.detectGraphicsTier();
    this.state.currentTier = this.enforceTierRequirements(detectedTier);
    
    console.log(`[LucySDK] Graphics Tier: ${this.state.currentTier}`);
    
    // Initialize subsystems
    await this.initializeRenderer(options);
    await this.initializePhysics(options);
    await this.initializeInput();
    await this.initializeAudio(options);
    
    if (options.enableNetworking !== false) {
      await this.initializeNetwork(options);
    }
    
    // Initialize AI system
    this.ai = new SDKAI(this);
    
    this.state.initialized = true;
    console.log('[LucySDK] Initialization complete');
    
    // Emit ready event
    this.emit('sdk:ready', { tier: this.state.currentTier });
  }
  
  private async detectGraphicsTier(): Promise<GraphicsTierLevel> {
    // Check for WebGPU support
    const hasWebGPU = 'gpu' in navigator;
    
    // Check device memory
    const deviceMemory = (navigator as any).deviceMemory || 4;
    
    // Check for mobile
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );
    
    // Check hardware concurrency
    const cores = navigator.hardwareConcurrency || 4;
    
    // Check WebGL capabilities
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
    let maxTextureSize = 4096;
    let renderer = '';
    
    if (gl) {
      maxTextureSize = gl.getParameter(gl.MAX_TEXTURE_SIZE);
      const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
      if (debugInfo) {
        renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
      }
    }
    
    // Score-based tier detection
    let score = 0;
    
    // WebGPU support
    if (hasWebGPU) score += 30;
    
    // Memory
    if (deviceMemory >= 8) score += 25;
    else if (deviceMemory >= 4) score += 15;
    else if (deviceMemory >= 2) score += 5;
    
    // Cores
    if (cores >= 8) score += 20;
    else if (cores >= 4) score += 10;
    else if (cores >= 2) score += 5;
    
    // GPU Detection
    const highEndGPUs = ['RTX', 'RX 6', 'RX 7', 'Arc A', 'M1', 'M2', 'M3'];
    const midRangeGPUs = ['GTX 16', 'GTX 10', 'RX 5', 'Vega', 'Iris'];
    
    if (highEndGPUs.some(gpu => renderer.includes(gpu))) {
      score += 25;
    } else if (midRangeGPUs.some(gpu => renderer.includes(gpu))) {
      score += 15;
    }
    
    // Mobile penalty
    if (isMobile) score -= 30;
    
    // Determine tier
    if (score >= 80) return 'S';
    if (score >= 50) return 'A';
    if (score >= 25) return 'B';
    return 'C';
  }
  
  private enforceTierRequirements(detected: GraphicsTierLevel): GraphicsTierLevel {
    if (!this.config) return detected;
    
    const tierOrder: GraphicsTierLevel[] = ['C', 'B', 'A', 'S'];
    const minIndex = tierOrder.indexOf(this.config.minTier);
    const detectedIndex = tierOrder.indexOf(detected);
    
    // If detected tier is below minimum, use minimum
    if (detectedIndex < minIndex) {
      console.warn(
        `[LucySDK] Device tier ${detected} below minimum ${this.config.minTier}. ` +
        `Performance may be degraded.`
      );
      return this.config.minTier;
    }
    
    return detected;
  }
  
  // ============================================================================
  // SUBSYSTEM INITIALIZATION
  // ============================================================================
  
  private async initializeRenderer(options: SDKInitOptions): Promise<void> {
    this.renderer = new SDKRenderer(
      this.container!,
      this.state.currentTier,
      options.preferWebGPU ?? true,
      options.debug ?? false
    );
    await this.renderer.initialize();
  }
  
  private async initializePhysics(options: SDKInitOptions): Promise<void> {
    const physicsConfig: PhysicsConfig = {
      gravity: { x: 0, y: -9.81, z: 0 },
      fixedTimestep: this.fixedTimestep,
      maxSubsteps: 4,
      collisionIterations: 4,
      contactOffset: 0.01,
      useDeterministicMode: true,
      randomSeed: Date.now(),
      broadphaseType: 'bvh',
      sleepThreshold: 0.01,
      ...options.physicsConfig,
    };
    
    this.physics = new SDKPhysics(physicsConfig);
    await this.physics.initialize();
  }
  
  private async initializeInput(): Promise<void> {
    this.input = new SDKInput(this.container!);
    await this.input.initialize();
  }
  
  private async initializeAudio(options: SDKInitOptions): Promise<void> {
    const audioConfig: AudioConfig = {
      masterVolume: 1,
      sfxVolume: 0.8,
      musicVolume: 0.6,
      ambientVolume: 0.4,
      voiceVolume: 1,
      spatialEnabled: true,
      listenerPosition: { x: 0, y: 0, z: 0 },
      listenerForward: { x: 0, y: 0, z: -1 },
      listenerUp: { x: 0, y: 1, z: 0 },
      sampleRate: 48000,
      latencyHint: 'interactive',
      ...options.audioConfig,
    };
    
    this.audio = new SDKAudio(audioConfig);
    await this.audio.initialize();
  }
  
  private async initializeNetwork(options: SDKInitOptions): Promise<void> {
    this.network = new SDKNetwork(
      options.serverUrl || '',
      this.config!.tickRate || 60
    );
  }
  
  // ============================================================================
  // GAME LOOP
  // ============================================================================
  
  public start(): void {
    if (this.isRunning) return;
    
    this.isRunning = true;
    this.lastTime = performance.now();
    this.accumulator = 0;
    
    this.emit('game:start', {});
    requestAnimationFrame(this.gameLoop.bind(this));
  }
  
  public stop(): void {
    this.isRunning = false;
    this.emit('game:stop', {});
  }
  
  public pause(): void {
    this.isRunning = false;
    this.emit('game:pause', {});
  }
  
  public resume(): void {
    if (this.isRunning) return;
    
    this.isRunning = true;
    this.lastTime = performance.now();
    this.emit('game:resume', {});
    requestAnimationFrame(this.gameLoop.bind(this));
  }
  
  private gameLoop(currentTime: number): void {
    if (!this.isRunning) return;
    
    const frameStart = performance.now();
    const deltaTime = (currentTime - this.lastTime) / 1000;
    this.lastTime = currentTime;
    
    // Cap delta to prevent spiral of death
    const cappedDelta = Math.min(deltaTime, 0.25);
    this.accumulator += cappedDelta;
    
    // Input polling
    this.input?.poll();
    const inputSnapshot = this.input?.getSnapshot();
    
    // Send input to server if networked
    if (this.network?.isConnected()) {
      this.network.sendInput(inputSnapshot!, this.currentTick);
    }
    
    // Fixed timestep physics
    const physicsStart = performance.now();
    while (this.accumulator >= this.fixedTimestep) {
      // Fixed update callbacks
      this.fixedUpdateCallbacks.forEach(cb => cb(this.currentTick));
      
      // Step physics
      this.physics?.step(this.fixedTimestep);
      
      // AI update
      this.ai?.update(this.fixedTimestep);
      
      this.accumulator -= this.fixedTimestep;
      this.currentTick++;
    }
    this.state.physicsTime = performance.now() - physicsStart;
    
    // Variable update
    this.updateCallbacks.forEach(cb => cb(cappedDelta));
    
    // Network sync
    this.network?.update(cappedDelta);
    
    // Render
    const renderStart = performance.now();
    const alpha = this.accumulator / this.fixedTimestep;
    this.renderer?.render(alpha);
    this.state.renderTime = performance.now() - renderStart;
    
    // Stats
    this.state.frameTime = performance.now() - frameStart;
    this.state.fps = 1000 / this.state.frameTime;
    
    // Continue loop
    requestAnimationFrame(this.gameLoop.bind(this));
  }
  
  // ============================================================================
  // CALLBACKS
  // ============================================================================
  
  public onUpdate(callback: (dt: number) => void): () => void {
    this.updateCallbacks.add(callback);
    return () => this.updateCallbacks.delete(callback);
  }
  
  public onFixedUpdate(callback: (tick: number) => void): () => void {
    this.fixedUpdateCallbacks.add(callback);
    return () => this.fixedUpdateCallbacks.delete(callback);
  }
  
  public on(event: string, callback: EventCallback): () => void {
    if (!this.eventCallbacks.has(event)) {
      this.eventCallbacks.set(event, new Set());
    }
    this.eventCallbacks.get(event)!.add(callback);
    return () => this.eventCallbacks.get(event)?.delete(callback);
  }
  
  public emit(type: string, data: any): void {
    const event: GameEvent = {
      id: crypto.randomUUID(),
      type,
      timestamp: Date.now(),
      tick: this.currentTick,
      data,
      isReplayable: false,
    };
    
    this.eventCallbacks.get(type)?.forEach(cb => cb(event));
    this.eventCallbacks.get('*')?.forEach(cb => cb(event));
  }
  
  // ============================================================================
  // SYSTEM ACCESS
  // ============================================================================
  
  public getRenderer(): SDKRenderer | null {
    return this.renderer;
  }
  
  public getPhysics(): SDKPhysics | null {
    return this.physics;
  }
  
  public getInput(): SDKInput | null {
    return this.input;
  }
  
  public getAudio(): SDKAudio | null {
    return this.audio;
  }
  
  public getNetwork(): SDKNetwork | null {
    return this.network;
  }
  
  public getAI(): SDKAI | null {
    return this.ai;
  }
  
  public getState(): Readonly<SDKState> {
    return this.state;
  }
  
  public getConfig(): Readonly<LucyGameConfig> | null {
    return this.config;
  }
  
  public getTier(): GraphicsTierLevel {
    return this.state.currentTier;
  }
  
  public getTick(): number {
    return this.currentTick;
  }
  
  // ============================================================================
  // CLEANUP
  // ============================================================================
  
  public dispose(): void {
    this.stop();
    
    this.renderer?.dispose();
    this.physics?.dispose();
    this.input?.dispose();
    this.audio?.dispose();
    this.network?.dispose();
    this.ai?.dispose();
    
    this.updateCallbacks.clear();
    this.fixedUpdateCallbacks.clear();
    this.eventCallbacks.clear();
    
    this.state.initialized = false;
    LucyGameSDK.instance = null;
  }
}

// ============================================================================
// SDK RENDERER
// ============================================================================

export class SDKRenderer {
  private container: HTMLElement;
  private tier: GraphicsTierLevel;
  private preferWebGPU: boolean;
  private debug: boolean;
  
  private canvas: HTMLCanvasElement | null = null;
  private useWebGPU: boolean = false;
  
  // Three.js (WebGL fallback)
  private renderer: any = null;
  private scene: any = null;
  private camera: any = null;
  private composer: any = null;
  
  // WebGPU
  private gpuDevice: GPUDevice | null = null;
  private gpuContext: GPUCanvasContext | null = null;
  
  constructor(
    container: HTMLElement,
    tier: GraphicsTierLevel,
    preferWebGPU: boolean,
    debug: boolean
  ) {
    this.container = container;
    this.tier = tier;
    this.preferWebGPU = preferWebGPU;
    this.debug = debug;
  }
  
  public async initialize(): Promise<void> {
    // Create canvas
    this.canvas = document.createElement('canvas');
    this.canvas.style.width = '100%';
    this.canvas.style.height = '100%';
    this.container.appendChild(this.canvas);
    
    // Try WebGPU first
    if (this.preferWebGPU && 'gpu' in navigator) {
      try {
        const adapter = await navigator.gpu.requestAdapter({
          powerPreference: this.tier === 'S' ? 'high-performance' : 'low-power',
        });
        
        if (adapter) {
          this.gpuDevice = await adapter.requestDevice();
          this.gpuContext = this.canvas.getContext('webgpu') as GPUCanvasContext;
          
          if (this.gpuContext) {
            const format = navigator.gpu.getPreferredCanvasFormat();
            this.gpuContext.configure({
              device: this.gpuDevice,
              format,
              alphaMode: 'premultiplied',
            });
            
            this.useWebGPU = true;
            console.log('[SDKRenderer] Using WebGPU');
          }
        }
      } catch (e) {
        console.warn('[SDKRenderer] WebGPU initialization failed, falling back to WebGL');
      }
    }
    
    // Fall back to Three.js/WebGL
    if (!this.useWebGPU) {
      await this.initializeWebGL();
    }
  }
  
  private async initializeWebGL(): Promise<void> {
    const THREE = await import('three');
    const { EffectComposer } = await import('three/examples/jsm/postprocessing/EffectComposer.js');
    const { RenderPass } = await import('three/examples/jsm/postprocessing/RenderPass.js');
    const { UnrealBloomPass } = await import('three/examples/jsm/postprocessing/UnrealBloomPass.js');
    const { SMAAPass } = await import('three/examples/jsm/postprocessing/SMAAPass.js');
    
    const tierSpec = GRAPHICS_TIER_SPECS[this.tier];
    
    // Renderer
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas!,
      antialias: tierSpec.enableFXAA || tierSpec.enableTAA,
      powerPreference: this.tier === 'S' ? 'high-performance' : 'default',
    });
    
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio * tierSpec.resolutionScale, 2));
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    this.renderer.shadowMap.enabled = tierSpec.shadowMapResolution > 0;
    this.renderer.shadowMap.type = tierSpec.enableSoftShadows 
      ? THREE.PCFSoftShadowMap 
      : THREE.PCFShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    
    // Scene
    this.scene = new THREE.Scene();
    
    // Camera (default perspective)
    this.camera = new THREE.PerspectiveCamera(
      75,
      this.container.clientWidth / this.container.clientHeight,
      0.1,
      1000
    );
    
    // Post-processing
    this.composer = new EffectComposer(this.renderer);
    this.composer.addPass(new RenderPass(this.scene, this.camera));
    
    if (tierSpec.enableBloom) {
      const bloomPass = new UnrealBloomPass(
        new THREE.Vector2(this.container.clientWidth, this.container.clientHeight),
        tierSpec.tier === 'S' ? 1.5 : 1.0,
        0.4,
        0.85
      );
      this.composer.addPass(bloomPass);
    }
    
    if (tierSpec.enableFXAA || tierSpec.enableTAA) {
      const smaaPass = new SMAAPass(
        this.container.clientWidth * window.devicePixelRatio,
        this.container.clientHeight * window.devicePixelRatio
      );
      this.composer.addPass(smaaPass);
    }
    
    // Resize handling
    const resizeObserver = new ResizeObserver(() => this.handleResize());
    resizeObserver.observe(this.container);
    
    console.log('[SDKRenderer] Using WebGL2');
  }
  
  private handleResize(): void {
    if (!this.renderer || !this.camera || !this.composer) return;
    
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    
    this.renderer.setSize(width, height);
    this.composer.setSize(width, height);
  }
  
  public render(alpha: number): void {
    if (this.useWebGPU) {
      this.renderWebGPU(alpha);
    } else {
      this.renderWebGL(alpha);
    }
  }
  
  private renderWebGPU(alpha: number): void {
    // WebGPU rendering implementation
    // This would use the WebGPU API for custom rendering
    // For now, this is a placeholder that can be expanded
  }
  
  private renderWebGL(alpha: number): void {
    if (this.composer) {
      this.composer.render();
    } else if (this.renderer) {
      this.renderer.render(this.scene, this.camera);
    }
  }
  
  public getScene(): any {
    return this.scene;
  }
  
  public getCamera(): any {
    return this.camera;
  }
  
  public getThreeRenderer(): any {
    return this.renderer;
  }
  
  public isUsingWebGPU(): boolean {
    return this.useWebGPU;
  }
  
  public dispose(): void {
    this.renderer?.dispose();
    this.composer?.dispose();
    this.gpuDevice?.destroy();
    this.canvas?.remove();
  }
}

// ============================================================================
// SDK PHYSICS (DETERMINISTIC)
// ============================================================================

export class SDKPhysics {
  private config: PhysicsConfig;
  private world: any = null;
  private bodies: Map<string, any> = new Map();
  private colliders: Map<string, any> = new Map();
  
  // Determinism
  private randomState: number;
  
  constructor(config: PhysicsConfig) {
    this.config = config;
    this.randomState = config.randomSeed;
  }
  
  public async initialize(): Promise<void> {
    // Import Rapier dynamically
    const RAPIER = await import('@dimforge/rapier3d-compat');
    await RAPIER.init();
    
    this.world = new RAPIER.World({
      x: this.config.gravity.x,
      y: this.config.gravity.y,
      z: this.config.gravity.z,
    });
    
    console.log('[SDKPhysics] Rapier physics initialized');
  }
  
  public step(dt: number): void {
    if (!this.world) return;
    this.world.step();
  }
  
  // Deterministic random for physics
  public random(): number {
    this.randomState = (this.randomState * 1103515245 + 12345) & 0x7fffffff;
    return this.randomState / 0x7fffffff;
  }
  
  public setSeed(seed: number): void {
    this.randomState = seed;
  }
  
  public createRigidBody(id: string, config: any): any {
    if (!this.world) return null;
    
    const RAPIER = (this.world as any).constructor;
    let bodyDesc;
    
    switch (config.type) {
      case 'static':
        bodyDesc = RAPIER.RigidBodyDesc.fixed();
        break;
      case 'kinematic':
        bodyDesc = RAPIER.RigidBodyDesc.kinematicPositionBased();
        break;
      default:
        bodyDesc = RAPIER.RigidBodyDesc.dynamic();
    }
    
    bodyDesc.setTranslation(
      config.position?.x || 0,
      config.position?.y || 0,
      config.position?.z || 0
    );
    
    const body = this.world.createRigidBody(bodyDesc);
    this.bodies.set(id, body);
    
    return body;
  }
  
  public removeRigidBody(id: string): void {
    const body = this.bodies.get(id);
    if (body && this.world) {
      this.world.removeRigidBody(body);
      this.bodies.delete(id);
    }
  }
  
  public raycast(origin: Vector3, direction: Vector3, maxDistance: number): any {
    if (!this.world) return null;
    
    const ray = new (this.world as any).constructor.Ray(
      origin,
      direction
    );
    
    return this.world.castRay(ray, maxDistance, true);
  }
  
  public getState(): any {
    // Serialize physics state for networking/replay
    const state: any = {
      bodies: [],
      tick: 0,
    };
    
    this.bodies.forEach((body, id) => {
      const pos = body.translation();
      const rot = body.rotation();
      const vel = body.linvel();
      const angVel = body.angvel();
      
      state.bodies.push({
        id,
        position: { x: pos.x, y: pos.y, z: pos.z },
        rotation: { x: rot.x, y: rot.y, z: rot.z, w: rot.w },
        velocity: { x: vel.x, y: vel.y, z: vel.z },
        angularVelocity: { x: angVel.x, y: angVel.y, z: angVel.z },
      });
    });
    
    return state;
  }
  
  public setState(state: any): void {
    // Restore physics state (for rollback netcode)
    state.bodies.forEach((bodyState: any) => {
      const body = this.bodies.get(bodyState.id);
      if (body) {
        body.setTranslation(bodyState.position, true);
        body.setRotation(bodyState.rotation, true);
        body.setLinvel(bodyState.velocity, true);
        body.setAngvel(bodyState.angularVelocity, true);
      }
    });
  }
  
  public dispose(): void {
    this.bodies.clear();
    this.colliders.clear();
    this.world = null;
  }
}

// ============================================================================
// SDK INPUT
// ============================================================================

export class SDKInput {
  private container: HTMLElement;
  
  // State
  private keysDown: Set<string> = new Set();
  private keysJustPressed: Set<string> = new Set();
  private keysJustReleased: Set<string> = new Set();
  
  private mouseX: number = 0;
  private mouseY: number = 0;
  private mouseDeltaX: number = 0;
  private mouseDeltaY: number = 0;
  private mouseButtons: number = 0;
  private mouseWheel: number = 0;
  private mouseLocked: boolean = false;
  
  private gamepads: Map<number, GamepadState> = new Map();
  private touches: Map<number, any> = new Map();
  
  // Virtual inputs
  private moveX: number = 0;
  private moveY: number = 0;
  private lookX: number = 0;
  private lookY: number = 0;
  private buttonState: number = 0;
  
  constructor(container: HTMLElement) {
    this.container = container;
  }
  
  public async initialize(): Promise<void> {
    // Keyboard
    window.addEventListener('keydown', this.onKeyDown.bind(this));
    window.addEventListener('keyup', this.onKeyUp.bind(this));
    
    // Mouse
    this.container.addEventListener('mousedown', this.onMouseDown.bind(this));
    this.container.addEventListener('mouseup', this.onMouseUp.bind(this));
    this.container.addEventListener('mousemove', this.onMouseMove.bind(this));
    this.container.addEventListener('wheel', this.onWheel.bind(this));
    document.addEventListener('pointerlockchange', this.onPointerLockChange.bind(this));
    
    // Touch
    this.container.addEventListener('touchstart', this.onTouchStart.bind(this));
    this.container.addEventListener('touchmove', this.onTouchMove.bind(this));
    this.container.addEventListener('touchend', this.onTouchEnd.bind(this));
    
    // Gamepad
    window.addEventListener('gamepadconnected', this.onGamepadConnected.bind(this));
    window.addEventListener('gamepaddisconnected', this.onGamepadDisconnected.bind(this));
    
    console.log('[SDKInput] Input system initialized');
  }
  
  public poll(): void {
    // Clear frame-specific states
    this.keysJustPressed.clear();
    this.keysJustReleased.clear();
    this.mouseDeltaX = 0;
    this.mouseDeltaY = 0;
    this.mouseWheel = 0;
    
    // Poll gamepads
    this.pollGamepads();
    
    // Update virtual inputs
    this.updateVirtualInputs();
  }
  
  private pollGamepads(): void {
    const gamepads = navigator.getGamepads();
    
    for (const gamepad of gamepads) {
      if (!gamepad) continue;
      
      const state: GamepadState = {
        index: gamepad.index,
        connected: gamepad.connected,
        leftStickX: this.applyDeadzone(gamepad.axes[0] || 0),
        leftStickY: this.applyDeadzone(gamepad.axes[1] || 0),
        rightStickX: this.applyDeadzone(gamepad.axes[2] || 0),
        rightStickY: this.applyDeadzone(gamepad.axes[3] || 0),
        leftTrigger: gamepad.buttons[6]?.value || 0,
        rightTrigger: gamepad.buttons[7]?.value || 0,
        buttons: gamepad.buttons.map(b => b.pressed),
        canVibrate: 'vibrationActuator' in gamepad,
      };
      
      this.gamepads.set(gamepad.index, state);
    }
  }
  
  private applyDeadzone(value: number, deadzone: number = 0.15): number {
    if (Math.abs(value) < deadzone) return 0;
    return Math.sign(value) * (Math.abs(value) - deadzone) / (1 - deadzone);
  }
  
  private updateVirtualInputs(): void {
    // Reset
    this.moveX = 0;
    this.moveY = 0;
    this.lookX = 0;
    this.lookY = 0;
    
    // Keyboard movement
    if (this.keysDown.has('KeyW') || this.keysDown.has('ArrowUp')) this.moveY += 1;
    if (this.keysDown.has('KeyS') || this.keysDown.has('ArrowDown')) this.moveY -= 1;
    if (this.keysDown.has('KeyA') || this.keysDown.has('ArrowLeft')) this.moveX -= 1;
    if (this.keysDown.has('KeyD') || this.keysDown.has('ArrowRight')) this.moveX += 1;
    
    // Mouse look
    if (this.mouseLocked) {
      this.lookX = this.mouseDeltaX;
      this.lookY = this.mouseDeltaY;
    }
    
    // Gamepad (use first connected)
    const gamepad = this.gamepads.values().next().value;
    if (gamepad) {
      this.moveX += gamepad.leftStickX;
      this.moveY -= gamepad.leftStickY;
      this.lookX += gamepad.rightStickX * 10;
      this.lookY += gamepad.rightStickY * 10;
    }
    
    // Normalize movement
    const moveMag = Math.sqrt(this.moveX * this.moveX + this.moveY * this.moveY);
    if (moveMag > 1) {
      this.moveX /= moveMag;
      this.moveY /= moveMag;
    }
  }
  
  // Event handlers
  private onKeyDown(e: KeyboardEvent): void {
    if (!this.keysDown.has(e.code)) {
      this.keysJustPressed.add(e.code);
    }
    this.keysDown.add(e.code);
  }
  
  private onKeyUp(e: KeyboardEvent): void {
    this.keysDown.delete(e.code);
    this.keysJustReleased.add(e.code);
  }
  
  private onMouseDown(e: MouseEvent): void {
    this.mouseButtons = e.buttons;
  }
  
  private onMouseUp(e: MouseEvent): void {
    this.mouseButtons = e.buttons;
  }
  
  private onMouseMove(e: MouseEvent): void {
    this.mouseX = e.clientX;
    this.mouseY = e.clientY;
    this.mouseDeltaX += e.movementX;
    this.mouseDeltaY += e.movementY;
  }
  
  private onWheel(e: WheelEvent): void {
    this.mouseWheel = e.deltaY;
  }
  
  private onPointerLockChange(): void {
    this.mouseLocked = document.pointerLockElement === this.container;
  }
  
  private onTouchStart(e: TouchEvent): void {
    for (const touch of Array.from(e.changedTouches)) {
      this.touches.set(touch.identifier, {
        id: touch.identifier,
        x: touch.clientX,
        y: touch.clientY,
        startX: touch.clientX,
        startY: touch.clientY,
      });
    }
  }
  
  private onTouchMove(e: TouchEvent): void {
    for (const touch of Array.from(e.changedTouches)) {
      const stored = this.touches.get(touch.identifier);
      if (stored) {
        stored.x = touch.clientX;
        stored.y = touch.clientY;
      }
    }
  }
  
  private onTouchEnd(e: TouchEvent): void {
    for (const touch of Array.from(e.changedTouches)) {
      this.touches.delete(touch.identifier);
    }
  }
  
  private onGamepadConnected(e: GamepadEvent): void {
    console.log(`[SDKInput] Gamepad connected: ${e.gamepad.id}`);
  }
  
  private onGamepadDisconnected(e: GamepadEvent): void {
    this.gamepads.delete(e.gamepad.index);
    console.log(`[SDKInput] Gamepad disconnected: ${e.gamepad.id}`);
  }
  
  // Public API
  public isKeyDown(code: string): boolean {
    return this.keysDown.has(code);
  }
  
  public isKeyJustPressed(code: string): boolean {
    return this.keysJustPressed.has(code);
  }
  
  public isMouseButtonDown(button: number): boolean {
    return (this.mouseButtons & (1 << button)) !== 0;
  }
  
  public getGamepad(index: number = 0): GamepadState | undefined {
    return this.gamepads.get(index);
  }
  
  public requestPointerLock(): void {
    this.container.requestPointerLock();
  }
  
  public exitPointerLock(): void {
    document.exitPointerLock();
  }
  
  public vibrate(
    gamepadIndex: number,
    duration: number,
    weakMagnitude: number,
    strongMagnitude: number
  ): void {
    const gamepad = navigator.getGamepads()[gamepadIndex];
    if (gamepad && 'vibrationActuator' in gamepad) {
      (gamepad as any).vibrationActuator.playEffect('dual-rumble', {
        duration,
        weakMagnitude,
        strongMagnitude,
      });
    }
  }
  
  public getSnapshot(): InputSnapshot {
    return {
      timestamp: Date.now(),
      tick: 0, // Set by SDK
      moveX: this.moveX,
      moveY: this.moveY,
      lookX: this.lookX,
      lookY: this.lookY,
      buttons: this.buttonState,
      keyboard: {
        keysDown: new Set(this.keysDown),
        keysJustPressed: new Set(this.keysJustPressed),
        keysJustReleased: new Set(this.keysJustReleased),
      },
      mouse: {
        x: this.mouseX,
        y: this.mouseY,
        deltaX: this.mouseDeltaX,
        deltaY: this.mouseDeltaY,
        buttons: this.mouseButtons,
        wheel: this.mouseWheel,
        locked: this.mouseLocked,
      },
      gamepad: this.gamepads.values().next().value,
    };
  }
  
  public dispose(): void {
    window.removeEventListener('keydown', this.onKeyDown.bind(this));
    window.removeEventListener('keyup', this.onKeyUp.bind(this));
  }
}

interface GamepadState {
  index: number;
  connected: boolean;
  leftStickX: number;
  leftStickY: number;
  rightStickX: number;
  rightStickY: number;
  leftTrigger: number;
  rightTrigger: number;
  buttons: boolean[];
  canVibrate: boolean;
}

// ============================================================================
// SDK AUDIO
// ============================================================================

export class SDKAudio {
  private config: AudioConfig;
  private context: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private musicGain: GainNode | null = null;
  private ambientGain: GainNode | null = null;
  
  private sounds: Map<string, AudioBuffer> = new Map();
  private activeSources: Map<string, AudioBufferSourceNode> = new Map();
  
  constructor(config: AudioConfig) {
    this.config = config;
  }
  
  public async initialize(): Promise<void> {
    this.context = new AudioContext({
      sampleRate: this.config.sampleRate,
      latencyHint: this.config.latencyHint,
    });
    
    // Create gain nodes
    this.masterGain = this.context.createGain();
    this.masterGain.gain.value = this.config.masterVolume;
    this.masterGain.connect(this.context.destination);
    
    this.sfxGain = this.context.createGain();
    this.sfxGain.gain.value = this.config.sfxVolume;
    this.sfxGain.connect(this.masterGain);
    
    this.musicGain = this.context.createGain();
    this.musicGain.gain.value = this.config.musicVolume;
    this.musicGain.connect(this.masterGain);
    
    this.ambientGain = this.context.createGain();
    this.ambientGain.gain.value = this.config.ambientVolume;
    this.ambientGain.connect(this.masterGain);
    
    console.log('[SDKAudio] Audio system initialized');
  }
  
  public async loadSound(id: string, url: string): Promise<void> {
    if (!this.context) return;
    
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    const audioBuffer = await this.context.decodeAudioData(arrayBuffer);
    
    this.sounds.set(id, audioBuffer);
  }
  
  public playSound(
    id: string,
    options: {
      volume?: number;
      pitch?: number;
      loop?: boolean;
      position?: Vector3;
    } = {}
  ): string | null {
    if (!this.context || !this.sfxGain) return null;
    
    const buffer = this.sounds.get(id);
    if (!buffer) return null;
    
    const source = this.context.createBufferSource();
    source.buffer = buffer;
    source.playbackRate.value = options.pitch || 1;
    source.loop = options.loop || false;
    
    const gainNode = this.context.createGain();
    gainNode.gain.value = options.volume || 1;
    
    source.connect(gainNode);
    
    if (options.position && this.config.spatialEnabled) {
      const panner = this.context.createPanner();
      panner.setPosition(options.position.x, options.position.y, options.position.z);
      panner.distanceModel = 'inverse';
      panner.refDistance = 1;
      panner.maxDistance = 100;
      panner.rolloffFactor = 1;
      
      gainNode.connect(panner);
      panner.connect(this.sfxGain);
    } else {
      gainNode.connect(this.sfxGain);
    }
    
    source.start();
    
    const instanceId = crypto.randomUUID();
    this.activeSources.set(instanceId, source);
    
    source.onended = () => {
      this.activeSources.delete(instanceId);
    };
    
    return instanceId;
  }
  
  public stopSound(instanceId: string): void {
    const source = this.activeSources.get(instanceId);
    if (source) {
      source.stop();
      this.activeSources.delete(instanceId);
    }
  }
  
  public setListenerPosition(position: Vector3, forward: Vector3, up: Vector3): void {
    if (!this.context) return;
    
    const listener = this.context.listener;
    listener.setPosition(position.x, position.y, position.z);
    listener.setOrientation(forward.x, forward.y, forward.z, up.x, up.y, up.z);
  }
  
  public setMasterVolume(volume: number): void {
    if (this.masterGain) {
      this.masterGain.gain.value = volume;
    }
  }
  
  public resume(): void {
    this.context?.resume();
  }
  
  public suspend(): void {
    this.context?.suspend();
  }
  
  public dispose(): void {
    this.activeSources.forEach(source => source.stop());
    this.activeSources.clear();
    this.sounds.clear();
    this.context?.close();
  }
}

// ============================================================================
// SDK NETWORK
// ============================================================================

export class SDKNetwork {
  private serverUrl: string;
  private tickRate: number;
  private socket: WebSocket | null = null;
  private connected: boolean = false;
  
  // State sync
  private entities: Map<string, SyncedEntity> = new Map();
  private pendingInputs: InputSnapshot[] = [];
  private lastServerTick: number = 0;
  private lastClientTick: number = 0;
  
  // Metrics
  private latency: number = 0;
  private jitter: number = 0;
  private pingTimes: number[] = [];
  
  constructor(serverUrl: string, tickRate: number) {
    this.serverUrl = serverUrl;
    this.tickRate = tickRate;
  }
  
  public async connect(matchId: string, playerId: string, token: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const url = `${this.serverUrl}?match=${matchId}&player=${playerId}&token=${token}`;
      this.socket = new WebSocket(url);
      
      this.socket.onopen = () => {
        this.connected = true;
        console.log('[SDKNetwork] Connected to game server');
        this.startPingLoop();
        resolve();
      };
      
      this.socket.onclose = () => {
        this.connected = false;
        console.log('[SDKNetwork] Disconnected from game server');
      };
      
      this.socket.onerror = (error) => {
        reject(error);
      };
      
      this.socket.onmessage = (event) => {
        this.handleMessage(JSON.parse(event.data));
      };
    });
  }
  
  public disconnect(): void {
    this.socket?.close();
    this.socket = null;
    this.connected = false;
  }
  
  public isConnected(): boolean {
    return this.connected;
  }
  
  public sendInput(input: InputSnapshot, tick: number): void {
    if (!this.connected || !this.socket) return;
    
    input.tick = tick;
    this.pendingInputs.push(input);
    
    this.socket.send(JSON.stringify({
      type: 'input',
      tick,
      data: {
        moveX: input.moveX,
        moveY: input.moveY,
        lookX: input.lookX,
        lookY: input.lookY,
        buttons: input.buttons,
      },
    }));
  }
  
  public sendEvent(type: string, data: any): void {
    if (!this.connected || !this.socket) return;
    
    this.socket.send(JSON.stringify({
      type: 'event',
      eventType: type,
      data,
    }));
  }
  
  private handleMessage(packet: any): void {
    switch (packet.type) {
      case 'state_snapshot':
        this.handleStateSnapshot(packet);
        break;
      case 'state_delta':
        this.handleStateDelta(packet);
        break;
      case 'event':
        this.handleEvent(packet);
        break;
      case 'pong':
        this.handlePong(packet);
        break;
    }
  }
  
  private handleStateSnapshot(packet: any): void {
    this.lastServerTick = packet.tick;
    
    // Update all entities
    for (const entityData of packet.entities) {
      let entity = this.entities.get(entityData.entityId);
      
      if (!entity) {
        entity = {
          entityId: entityData.entityId,
          ownerId: entityData.ownerId,
          type: entityData.type,
          position: entityData.position,
          rotation: entityData.rotation,
          velocity: entityData.velocity || { x: 0, y: 0, z: 0 },
          angularVelocity: entityData.angularVelocity || { x: 0, y: 0, z: 0 },
          state: entityData.state || {},
          interpolationBuffer: [],
          lastUpdate: Date.now(),
        };
        this.entities.set(entityData.entityId, entity);
      } else {
        // Add to interpolation buffer
        entity.interpolationBuffer.push({
          tick: packet.tick,
          timestamp: Date.now(),
          position: entityData.position,
          rotation: entityData.rotation,
          state: entityData.state,
        });
        
        // Keep buffer limited
        if (entity.interpolationBuffer.length > 10) {
          entity.interpolationBuffer.shift();
        }
      }
    }
    
    // Remove acknowledged inputs
    this.pendingInputs = this.pendingInputs.filter(
      input => input.tick > packet.lastProcessedInput
    );
  }
  
  private handleStateDelta(packet: any): void {
    // Apply delta updates
    for (const delta of packet.deltas) {
      const entity = this.entities.get(delta.entityId);
      if (entity) {
        Object.assign(entity, delta.changes);
      }
    }
  }
  
  private handleEvent(packet: any): void {
    // Emit to SDK event system
    console.log('[SDKNetwork] Event:', packet.eventType, packet.data);
  }
  
  private handlePong(packet: any): void {
    const rtt = Date.now() - packet.clientTime;
    this.latency = rtt / 2;
    
    this.pingTimes.push(this.latency);
    if (this.pingTimes.length > 10) {
      this.pingTimes.shift();
    }
    
    // Calculate jitter
    if (this.pingTimes.length > 1) {
      let jitterSum = 0;
      for (let i = 1; i < this.pingTimes.length; i++) {
        jitterSum += Math.abs(this.pingTimes[i] - this.pingTimes[i - 1]);
      }
      this.jitter = jitterSum / (this.pingTimes.length - 1);
    }
  }
  
  private startPingLoop(): void {
    setInterval(() => {
      if (this.connected && this.socket) {
        this.socket.send(JSON.stringify({
          type: 'ping',
          clientTime: Date.now(),
        }));
      }
    }, 1000);
  }
  
  public update(dt: number): void {
    // Interpolate entities
    const renderTime = Date.now() - (1000 / this.tickRate) * 2; // 2 tick delay
    
    this.entities.forEach(entity => {
      if (entity.interpolationBuffer.length < 2) return;
      
      const buffer = entity.interpolationBuffer;
      
      // Find the two snapshots to interpolate between
      let fromIndex = 0;
      let toIndex = 1;
      
      for (let i = 0; i < buffer.length - 1; i++) {
        if (buffer[i].timestamp <= renderTime && buffer[i + 1].timestamp >= renderTime) {
          fromIndex = i;
          toIndex = i + 1;
          break;
        }
      }
      
      const from = buffer[fromIndex];
      const to = buffer[toIndex];
      
      // Calculate interpolation factor
      const range = to.timestamp - from.timestamp;
      const t = range > 0 ? (renderTime - from.timestamp) / range : 0;
      
      // Interpolate position
      entity.position = {
        x: from.position.x + (to.position.x - from.position.x) * t,
        y: from.position.y + (to.position.y - from.position.y) * t,
        z: from.position.z + (to.position.z - from.position.z) * t,
      };
      
      // Interpolate rotation (simple lerp, should use slerp for quaternions)
      entity.rotation = {
        x: from.rotation.x + (to.rotation.x - from.rotation.x) * t,
        y: from.rotation.y + (to.rotation.y - from.rotation.y) * t,
        z: from.rotation.z + (to.rotation.z - from.rotation.z) * t,
        w: from.rotation.w + (to.rotation.w - from.rotation.w) * t,
      };
    });
  }
  
  public getEntity(id: string): SyncedEntity | undefined {
    return this.entities.get(id);
  }
  
  public getAllEntities(): SyncedEntity[] {
    return Array.from(this.entities.values());
  }
  
  public getLatency(): number {
    return this.latency;
  }
  
  public getJitter(): number {
    return this.jitter;
  }
  
  public dispose(): void {
    this.disconnect();
    this.entities.clear();
    this.pendingInputs = [];
  }
}

// ============================================================================
// SDK AI
// ============================================================================

export class SDKAI {
  private sdk: LucyGameSDK;
  private agents: Map<string, AIAgent> = new Map();
  
  constructor(sdk: LucyGameSDK) {
    this.sdk = sdk;
  }
  
  public createAgent(id: string, config: AIConfig): AIAgent {
    const agent = new AIAgent(id, config, this.sdk);
    this.agents.set(id, agent);
    return agent;
  }
  
  public removeAgent(id: string): void {
    this.agents.delete(id);
  }
  
  public getAgent(id: string): AIAgent | undefined {
    return this.agents.get(id);
  }
  
  public update(dt: number): void {
    this.agents.forEach(agent => agent.update(dt));
  }
  
  public dispose(): void {
    this.agents.clear();
  }
}

export class AIAgent {
  private id: string;
  private config: AIConfig;
  private sdk: LucyGameSDK;
  
  // State
  private position: Vector3 = { x: 0, y: 0, z: 0 };
  private rotation: Quaternion = { x: 0, y: 0, z: 0, w: 1 };
  private velocity: Vector3 = { x: 0, y: 0, z: 0 };
  
  // Memory
  private knownEntities: Map<string, any> = new Map();
  private lastDecisionTime: number = 0;
  private currentGoal: string = 'idle';
  private currentTarget: string | null = null;
  
  // Behavior tree state
  private blackboard: Record<string, any> = {};
  
  constructor(id: string, config: AIConfig, sdk: LucyGameSDK) {
    this.id = id;
    this.config = config;
    this.sdk = sdk;
  }
  
  public update(dt: number): void {
    // Update perception
    this.updatePerception();
    
    // Make decisions at configured frequency
    const now = Date.now();
    const decisionInterval = 1000 / (this.config.difficulty.decisionQuality * 10);
    
    if (now - this.lastDecisionTime > decisionInterval) {
      this.makeDecision();
      this.lastDecisionTime = now;
    }
    
    // Execute current behavior
    this.executeBehavior(dt);
  }
  
  private updatePerception(): void {
    // Get nearby entities from physics/network
    // Update known entities with current info
    // Apply perception delay based on difficulty
  }
  
  private makeDecision(): void {
    // Evaluate threats
    // Consider personality weights
    // Select goal based on utility
    
    switch (this.config.personality) {
      case 'aggressive':
        this.evaluateAggressiveGoals();
        break;
      case 'defensive':
        this.evaluateDefensiveGoals();
        break;
      case 'tactical':
        this.evaluateTacticalGoals();
        break;
      case 'adaptive':
        this.evaluateAdaptiveGoals();
        break;
    }
  }
  
  private evaluateAggressiveGoals(): void {
    // Prioritize attacking nearest enemy
    // Low concern for self-preservation
    this.currentGoal = 'attack';
  }
  
  private evaluateDefensiveGoals(): void {
    // Prioritize cover and position
    // High concern for health
    this.currentGoal = 'defend';
  }
  
  private evaluateTacticalGoals(): void {
    // Balance attack/defense
    // Coordinate with team
    this.currentGoal = 'tactical';
  }
  
  private evaluateAdaptiveGoals(): void {
    // Analyze player behavior
    // Counter their strategy
    this.currentGoal = 'adapt';
  }
  
  private executeBehavior(dt: number): void {
    // Apply reaction time delay
    const reactionTime = this.config.reactionTimeBase +
      (Math.random() * this.config.reactionTimeVariance);
    
    switch (this.currentGoal) {
      case 'attack':
        this.executeAttack(dt);
        break;
      case 'defend':
        this.executeDefend(dt);
        break;
      case 'tactical':
        this.executeTactical(dt);
        break;
      case 'idle':
        this.executeIdle(dt);
        break;
    }
  }
  
  private executeAttack(dt: number): void {
    // Move toward target
    // Fire with accuracy variance
  }
  
  private executeDefend(dt: number): void {
    // Find cover
    // Hold position
  }
  
  private executeTactical(dt: number): void {
    // Flank or coordinate
  }
  
  private executeIdle(dt: number): void {
    // Patrol or wait
  }
  
  // Public API
  public setPosition(pos: Vector3): void {
    this.position = pos;
  }
  
  public getPosition(): Vector3 {
    return this.position;
  }
  
  public getVelocity(): Vector3 {
    return this.velocity;
  }
  
  public getCurrentGoal(): string {
    return this.currentGoal;
  }
  
  public getDecision(): any {
    return {
      goal: this.currentGoal,
      target: this.currentTarget,
      position: this.position,
      velocity: this.velocity,
    };
  }
}

// ============================================================================
// GRAPHICS TIER SPECIFICATIONS
// ============================================================================

export const GRAPHICS_TIER_SPECS: Record<GraphicsTierLevel, GraphicsTierSpec> = {
  S: {
    tier: 'S',
    name: 'Console / High-End PC',
    description: 'PS5, RTX 3080+, Apple M2 Pro',
    
    maxTrianglesPerFrame: 10_000_000,
    maxTrianglesPerObject: 500_000,
    maxDrawCalls: 5000,
    
    maxTextureResolution: 4096,
    textureAnisotropy: 16,
    compressedTextures: true,
    
    shaderQuality: 'ultra',
    enablePBR: true,
    enableNormalMaps: true,
    enableParallaxMapping: true,
    
    shadowMapResolution: 4096,
    shadowCascades: 4,
    enableSoftShadows: true,
    
    maxDynamicLights: 64,
    enableVolumetricLighting: true,
    enableGlobalIllumination: true,
    enableSSAO: true,
    
    enableBloom: true,
    enableMotionBlur: true,
    enableDOF: true,
    enableSSR: true,
    enableFXAA: false,
    enableTAA: true,
    
    maxParticlesPerSystem: 100_000,
    maxActiveSystems: 50,
    enableGPUParticles: true,
    
    physicsSubsteps: 4,
    maxRigidBodies: 2000,
    
    resolutionScale: 1.0,
    targetFPS: 120,
    minAcceptableFPS: 60,
    
    maxVRAMMB: 8192,
    maxRAMMB: 16384,
  },
  
  A: {
    tier: 'A',
    name: 'Desktop / Gaming Laptop',
    description: 'GTX 1070+, RX 580+, Apple M1',
    
    maxTrianglesPerFrame: 5_000_000,
    maxTrianglesPerObject: 200_000,
    maxDrawCalls: 2000,
    
    maxTextureResolution: 2048,
    textureAnisotropy: 8,
    compressedTextures: true,
    
    shaderQuality: 'high',
    enablePBR: true,
    enableNormalMaps: true,
    enableParallaxMapping: false,
    
    shadowMapResolution: 2048,
    shadowCascades: 3,
    enableSoftShadows: true,
    
    maxDynamicLights: 32,
    enableVolumetricLighting: false,
    enableGlobalIllumination: false,
    enableSSAO: true,
    
    enableBloom: true,
    enableMotionBlur: true,
    enableDOF: false,
    enableSSR: false,
    enableFXAA: true,
    enableTAA: false,
    
    maxParticlesPerSystem: 50_000,
    maxActiveSystems: 30,
    enableGPUParticles: true,
    
    physicsSubsteps: 3,
    maxRigidBodies: 1000,
    
    resolutionScale: 1.0,
    targetFPS: 60,
    minAcceptableFPS: 45,
    
    maxVRAMMB: 4096,
    maxRAMMB: 8192,
  },
  
  B: {
    tier: 'B',
    name: 'Tablet / Integrated',
    description: 'iPad Pro, Intel Iris, AMD Vega',
    
    maxTrianglesPerFrame: 1_500_000,
    maxTrianglesPerObject: 50_000,
    maxDrawCalls: 800,
    
    maxTextureResolution: 1024,
    textureAnisotropy: 4,
    compressedTextures: true,
    
    shaderQuality: 'medium',
    enablePBR: true,
    enableNormalMaps: true,
    enableParallaxMapping: false,
    
    shadowMapResolution: 1024,
    shadowCascades: 2,
    enableSoftShadows: false,
    
    maxDynamicLights: 8,
    enableVolumetricLighting: false,
    enableGlobalIllumination: false,
    enableSSAO: false,
    
    enableBloom: true,
    enableMotionBlur: false,
    enableDOF: false,
    enableSSR: false,
    enableFXAA: true,
    enableTAA: false,
    
    maxParticlesPerSystem: 10_000,
    maxActiveSystems: 15,
    enableGPUParticles: false,
    
    physicsSubsteps: 2,
    maxRigidBodies: 500,
    
    resolutionScale: 0.85,
    targetFPS: 60,
    minAcceptableFPS: 30,
    
    maxVRAMMB: 2048,
    maxRAMMB: 4096,
  },
  
  C: {
    tier: 'C',
    name: 'Mobile / Low-End',
    description: 'iPhone, Android, Chromebook',
    
    maxTrianglesPerFrame: 500_000,
    maxTrianglesPerObject: 10_000,
    maxDrawCalls: 300,
    
    maxTextureResolution: 512,
    textureAnisotropy: 1,
    compressedTextures: true,
    
    shaderQuality: 'low',
    enablePBR: false,
    enableNormalMaps: false,
    enableParallaxMapping: false,
    
    shadowMapResolution: 512,
    shadowCascades: 1,
    enableSoftShadows: false,
    
    maxDynamicLights: 2,
    enableVolumetricLighting: false,
    enableGlobalIllumination: false,
    enableSSAO: false,
    
    enableBloom: false,
    enableMotionBlur: false,
    enableDOF: false,
    enableSSR: false,
    enableFXAA: false,
    enableTAA: false,
    
    maxParticlesPerSystem: 2000,
    maxActiveSystems: 5,
    enableGPUParticles: false,
    
    physicsSubsteps: 1,
    maxRigidBodies: 200,
    
    resolutionScale: 0.7,
    targetFPS: 45,
    minAcceptableFPS: 25,
    
    maxVRAMMB: 512,
    maxRAMMB: 2048,
  },
};

// ============================================================================
// EXPORTS
// ============================================================================

export default LucyGameSDK;
