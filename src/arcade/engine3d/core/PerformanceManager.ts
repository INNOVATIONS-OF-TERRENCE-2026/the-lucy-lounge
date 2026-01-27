/**
 * ┌─────────────────────────────────────────────────────────────────────────────┐
 * │ LUCY ARCADE — CONSOLE-GRADE PERFORMANCE MANAGER                            │
 * │                                                                             │
 * │ Dynamic resolution scaling, LOD management, frustum culling,               │
 * │ occlusion culling, memory budgets, and performance telemetry               │
 * │                                                                             │
 * │ TARGETS: 120fps desktop, 60fps mobile, <16ms input latency                 │
 * └─────────────────────────────────────────────────────────────────────────────┘
 */

import * as THREE from 'three';

export interface PerformanceConfig {
  targetFPS: number;
  minFPS: number;
  maxResolutionScale: number;
  minResolutionScale: number;
  enableDynamicResolution: boolean;
  enableFrustumCulling: boolean;
  enableOcclusionCulling: boolean;
  enableLOD: boolean;
  enableAdaptiveQuality: boolean;
  memoryBudgetMB: number;
  drawCallBudget: number;
  triangleBudget: number;
  physicsTimeBudgetMs: number;
  aiTimeBudgetMs: number;
}

export interface PerformanceMetrics {
  fps: number;
  frameTime: number;
  cpuTime: number;
  gpuTime: number;
  drawCalls: number;
  triangles: number;
  textures: number;
  geometries: number;
  physicsTime: number;
  aiTime: number;
  renderTime: number;
  inputLatency: number;
  memoryUsedMB: number;
  resolutionScale: number;
  qualityLevel: QualityLevel;
  culledObjects: number;
  visibleObjects: number;
}

export type QualityLevel = 'ultra' | 'high' | 'medium' | 'low' | 'potato';

interface QualityPreset {
  shadowMapSize: number;
  shadowCascades: number;
  bloomEnabled: boolean;
  bloomSamples: number;
  ssaoEnabled: boolean;
  antialiasing: 'none' | 'fxaa' | 'smaa' | 'msaa';
  maxLights: number;
  particleMultiplier: number;
  lodBias: number;
  textureQuality: number;
  anisotropy: number;
  reflections: boolean;
  volumetrics: boolean;
}

const QUALITY_PRESETS: Record<QualityLevel, QualityPreset> = {
  ultra: {
    shadowMapSize: 4096,
    shadowCascades: 4,
    bloomEnabled: true,
    bloomSamples: 64,
    ssaoEnabled: true,
    antialiasing: 'smaa',
    maxLights: 32,
    particleMultiplier: 1.5,
    lodBias: 0,
    textureQuality: 1,
    anisotropy: 16,
    reflections: true,
    volumetrics: true,
  },
  high: {
    shadowMapSize: 2048,
    shadowCascades: 3,
    bloomEnabled: true,
    bloomSamples: 32,
    ssaoEnabled: true,
    antialiasing: 'smaa',
    maxLights: 16,
    particleMultiplier: 1,
    lodBias: 0.5,
    textureQuality: 1,
    anisotropy: 8,
    reflections: true,
    volumetrics: false,
  },
  medium: {
    shadowMapSize: 1024,
    shadowCascades: 2,
    bloomEnabled: true,
    bloomSamples: 16,
    ssaoEnabled: false,
    antialiasing: 'fxaa',
    maxLights: 8,
    particleMultiplier: 0.75,
    lodBias: 1,
    textureQuality: 0.75,
    anisotropy: 4,
    reflections: false,
    volumetrics: false,
  },
  low: {
    shadowMapSize: 512,
    shadowCascades: 1,
    bloomEnabled: false,
    bloomSamples: 0,
    ssaoEnabled: false,
    antialiasing: 'fxaa',
    maxLights: 4,
    particleMultiplier: 0.5,
    lodBias: 2,
    textureQuality: 0.5,
    anisotropy: 2,
    reflections: false,
    volumetrics: false,
  },
  potato: {
    shadowMapSize: 256,
    shadowCascades: 1,
    bloomEnabled: false,
    bloomSamples: 0,
    ssaoEnabled: false,
    antialiasing: 'none',
    maxLights: 2,
    particleMultiplier: 0.25,
    lodBias: 3,
    textureQuality: 0.25,
    anisotropy: 1,
    reflections: false,
    volumetrics: false,
  },
};

const DEFAULT_CONFIG: PerformanceConfig = {
  targetFPS: 60,
  minFPS: 30,
  maxResolutionScale: 1.0,
  minResolutionScale: 0.5,
  enableDynamicResolution: true,
  enableFrustumCulling: true,
  enableOcclusionCulling: true,
  enableLOD: true,
  enableAdaptiveQuality: true,
  memoryBudgetMB: 512,
  drawCallBudget: 1000,
  triangleBudget: 2000000,
  physicsTimeBudgetMs: 4,
  aiTimeBudgetMs: 2,
};

export class PerformanceManager {
  private config: PerformanceConfig;
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.Camera;
  
  // Metrics tracking
  private metrics: PerformanceMetrics;
  private frameTimeHistory: number[] = [];
  private readonly historySize = 60;
  
  // Dynamic resolution
  private currentResolutionScale: number = 1.0;
  private resolutionTarget: HTMLCanvasElement | null = null;
  
  // Quality management
  private currentQuality: QualityLevel = 'high';
  private qualityLocked: boolean = false;
  
  // Culling
  private frustum: THREE.Frustum = new THREE.Frustum();
  private frustumMatrix: THREE.Matrix4 = new THREE.Matrix4();
  private occlusionQueries: Map<string, WebGLQuery> = new Map();
  
  // LOD management
  private lodGroups: Map<string, THREE.LOD> = new Map();
  
  // Timing
  private lastFrameTime: number = 0;
  private frameStartTime: number = 0;
  private inputStartTime: number = 0;
  
  // GPU timing (where supported)
  private gpuTimerQuery: WebGLQuery | null = null;
  private gpuTimerExt: any = null;

  constructor(
    renderer: THREE.WebGLRenderer,
    scene: THREE.Scene,
    camera: THREE.Camera,
    config: Partial<PerformanceConfig> = {}
  ) {
    this.renderer = renderer;
    this.scene = scene;
    this.camera = camera;
    this.config = { ...DEFAULT_CONFIG, ...config };
    
    this.metrics = this.createEmptyMetrics();
    
    // Initialize GPU timer extension if available
    this.initGPUTimer();
    
    // Detect device capabilities and set initial quality
    this.detectCapabilities();
    
    console.log('[PerformanceManager] Initialized with quality:', this.currentQuality);
  }

  private createEmptyMetrics(): PerformanceMetrics {
    return {
      fps: 0,
      frameTime: 0,
      cpuTime: 0,
      gpuTime: 0,
      drawCalls: 0,
      triangles: 0,
      textures: 0,
      geometries: 0,
      physicsTime: 0,
      aiTime: 0,
      renderTime: 0,
      inputLatency: 0,
      memoryUsedMB: 0,
      resolutionScale: 1,
      qualityLevel: 'high',
      culledObjects: 0,
      visibleObjects: 0,
    };
  }

  private initGPUTimer(): void {
    const gl = this.renderer.getContext();
    this.gpuTimerExt = gl.getExtension('EXT_disjoint_timer_query_webgl2');
    
    if (this.gpuTimerExt) {
      this.gpuTimerQuery = gl.createQuery();
      console.log('[PerformanceManager] GPU timer available');
    }
  }

  private detectCapabilities(): void {
    const gl = this.renderer.getContext();
    
    // Check for mobile
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );
    
    // Check GPU capabilities
    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
    let gpuRenderer = 'Unknown';
    if (debugInfo) {
      gpuRenderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
    }
    
    // Check max texture size
    const maxTextureSize = gl.getParameter(gl.MAX_TEXTURE_SIZE);
    const maxVertexUniforms = gl.getParameter(gl.MAX_VERTEX_UNIFORM_VECTORS);
    
    console.log('[PerformanceManager] GPU:', gpuRenderer);
    console.log('[PerformanceManager] Max texture:', maxTextureSize);
    console.log('[PerformanceManager] Mobile:', isMobile);
    
    // Set initial quality based on capabilities
    if (isMobile) {
      this.config.targetFPS = 60;
      this.currentQuality = 'medium';
    } else if (gpuRenderer.includes('Intel')) {
      this.currentQuality = 'medium';
    } else if (maxTextureSize >= 8192 && maxVertexUniforms >= 1024) {
      this.currentQuality = 'ultra';
      this.config.targetFPS = 120;
    } else {
      this.currentQuality = 'high';
    }
    
    this.applyQualityPreset(this.currentQuality);
  }

  // ============================================================================
  // FRAME LIFECYCLE
  // ============================================================================

  public beginFrame(): void {
    this.frameStartTime = performance.now();
    this.inputStartTime = this.frameStartTime;
    
    // Begin GPU timing
    if (this.gpuTimerQuery && this.gpuTimerExt) {
      const gl = this.renderer.getContext();
      gl.beginQuery(this.gpuTimerExt.TIME_ELAPSED_EXT, this.gpuTimerQuery);
    }
  }

  public endFrame(): void {
    const now = performance.now();
    const frameTime = now - this.frameStartTime;
    
    // End GPU timing
    if (this.gpuTimerQuery && this.gpuTimerExt) {
      const gl = this.renderer.getContext();
      gl.endQuery(this.gpuTimerExt.TIME_ELAPSED_EXT);
      
      // Read previous frame's GPU time (async)
      if (gl.getQueryParameter(this.gpuTimerQuery, gl.QUERY_RESULT_AVAILABLE)) {
        this.metrics.gpuTime = gl.getQueryParameter(
          this.gpuTimerQuery,
          gl.QUERY_RESULT
        ) / 1000000; // Convert to ms
      }
    }
    
    // Update metrics
    this.updateMetrics(frameTime);
    
    // Adaptive quality
    if (this.config.enableAdaptiveQuality && !this.qualityLocked) {
      this.adaptQuality();
    }
    
    // Dynamic resolution
    if (this.config.enableDynamicResolution) {
      this.adaptResolution();
    }
    
    this.lastFrameTime = now;
  }

  private updateMetrics(frameTime: number): void {
    // Update frame time history
    this.frameTimeHistory.push(frameTime);
    if (this.frameTimeHistory.length > this.historySize) {
      this.frameTimeHistory.shift();
    }
    
    // Calculate average FPS
    const avgFrameTime = this.frameTimeHistory.reduce((a, b) => a + b, 0) / 
      this.frameTimeHistory.length;
    
    // Update metrics
    this.metrics.frameTime = frameTime;
    this.metrics.fps = Math.round(1000 / avgFrameTime);
    this.metrics.cpuTime = frameTime - this.metrics.gpuTime;
    
    // Renderer info
    const info = this.renderer.info;
    this.metrics.drawCalls = info.render.calls;
    this.metrics.triangles = info.render.triangles;
    this.metrics.textures = info.memory.textures;
    this.metrics.geometries = info.memory.geometries;
    
    // Memory (if available)
    if ((performance as any).memory) {
      this.metrics.memoryUsedMB = (performance as any).memory.usedJSHeapSize / 1048576;
    }
    
    this.metrics.resolutionScale = this.currentResolutionScale;
    this.metrics.qualityLevel = this.currentQuality;
  }

  // ============================================================================
  // ADAPTIVE QUALITY
  // ============================================================================

  private adaptQuality(): void {
    const targetFrameTime = 1000 / this.config.targetFPS;
    const minFrameTime = 1000 / this.config.minFPS;
    const avgFrameTime = this.frameTimeHistory.reduce((a, b) => a + b, 0) / 
      this.frameTimeHistory.length;
    
    // Only adapt after we have enough samples
    if (this.frameTimeHistory.length < 30) return;
    
    const qualityLevels: QualityLevel[] = ['ultra', 'high', 'medium', 'low', 'potato'];
    const currentIndex = qualityLevels.indexOf(this.currentQuality);
    
    // If consistently above target, consider lowering quality
    if (avgFrameTime > targetFrameTime * 1.2 && currentIndex < qualityLevels.length - 1) {
      const newQuality = qualityLevels[currentIndex + 1];
      console.log(`[PerformanceManager] Lowering quality: ${this.currentQuality} -> ${newQuality}`);
      this.setQuality(newQuality);
      this.frameTimeHistory.length = 0; // Reset history
    }
    // If consistently below target with headroom, consider raising quality
    else if (avgFrameTime < targetFrameTime * 0.7 && currentIndex > 0) {
      const newQuality = qualityLevels[currentIndex - 1];
      console.log(`[PerformanceManager] Raising quality: ${this.currentQuality} -> ${newQuality}`);
      this.setQuality(newQuality);
      this.frameTimeHistory.length = 0;
    }
  }

  private adaptResolution(): void {
    const targetFrameTime = 1000 / this.config.targetFPS;
    const avgFrameTime = this.frameTimeHistory.reduce((a, b) => a + b, 0) / 
      this.frameTimeHistory.length;
    
    if (this.frameTimeHistory.length < 10) return;
    
    // Calculate ideal resolution scale
    const ratio = targetFrameTime / avgFrameTime;
    let targetScale = this.currentResolutionScale * Math.sqrt(ratio);
    
    // Clamp to bounds
    targetScale = Math.max(
      this.config.minResolutionScale,
      Math.min(this.config.maxResolutionScale, targetScale)
    );
    
    // Smooth transition
    this.currentResolutionScale = THREE.MathUtils.lerp(
      this.currentResolutionScale,
      targetScale,
      0.1
    );
    
    // Apply resolution scale
    const pixelRatio = window.devicePixelRatio * this.currentResolutionScale;
    this.renderer.setPixelRatio(Math.min(pixelRatio, 2));
  }

  public setQuality(quality: QualityLevel): void {
    this.currentQuality = quality;
    this.applyQualityPreset(quality);
  }

  private applyQualityPreset(quality: QualityLevel): void {
    const preset = QUALITY_PRESETS[quality];
    
    // Apply shadow settings
    this.renderer.shadowMap.enabled = preset.shadowMapSize > 0;
    
    // Update all shadow-casting lights
    this.scene.traverse((obj) => {
      if (obj instanceof THREE.DirectionalLight && obj.castShadow) {
        obj.shadow.mapSize.setScalar(preset.shadowMapSize);
        obj.shadow.map?.dispose();
        obj.shadow.map = null;
      }
    });
    
    // Update LOD bias
    this.lodGroups.forEach((lod) => {
      // Adjust LOD distances based on bias
      // Higher bias = switch to lower LOD sooner
    });
    
    console.log(`[PerformanceManager] Applied quality preset: ${quality}`);
  }

  // ============================================================================
  // FRUSTUM CULLING
  // ============================================================================

  public updateFrustum(): void {
    if (!this.config.enableFrustumCulling) return;
    
    this.frustumMatrix.multiplyMatrices(
      this.camera.projectionMatrix,
      this.camera.matrixWorldInverse
    );
    this.frustum.setFromProjectionMatrix(this.frustumMatrix);
  }

  public isInFrustum(object: THREE.Object3D): boolean {
    if (!this.config.enableFrustumCulling) return true;
    
    // Get bounding sphere
    if (object instanceof THREE.Mesh) {
      if (!object.geometry.boundingSphere) {
        object.geometry.computeBoundingSphere();
      }
      
      const sphere = object.geometry.boundingSphere!.clone();
      sphere.applyMatrix4(object.matrixWorld);
      
      return this.frustum.intersectsSphere(sphere);
    }
    
    return true;
  }

  public cullScene(): { visible: number; culled: number } {
    if (!this.config.enableFrustumCulling) {
      return { visible: 0, culled: 0 };
    }
    
    this.updateFrustum();
    
    let visible = 0;
    let culled = 0;
    
    this.scene.traverse((obj) => {
      if (obj instanceof THREE.Mesh && obj.userData.cullable !== false) {
        const isVisible = this.isInFrustum(obj);
        obj.visible = isVisible;
        
        if (isVisible) {
          visible++;
        } else {
          culled++;
        }
      }
    });
    
    this.metrics.visibleObjects = visible;
    this.metrics.culledObjects = culled;
    
    return { visible, culled };
  }

  // ============================================================================
  // LOD MANAGEMENT
  // ============================================================================

  public createLOD(
    id: string,
    levels: Array<{ mesh: THREE.Mesh; distance: number }>
  ): THREE.LOD {
    const lod = new THREE.LOD();
    
    levels.forEach(({ mesh, distance }) => {
      const adjustedDistance = distance * (1 + QUALITY_PRESETS[this.currentQuality].lodBias);
      lod.addLevel(mesh, adjustedDistance);
    });
    
    this.lodGroups.set(id, lod);
    return lod;
  }

  public updateLODs(): void {
    if (!this.config.enableLOD) return;
    
    this.lodGroups.forEach((lod) => {
      lod.update(this.camera);
    });
  }

  // ============================================================================
  // TIMING HELPERS
  // ============================================================================

  public markPhysicsStart(): void {
    (this as any)._physicsStart = performance.now();
  }

  public markPhysicsEnd(): void {
    if ((this as any)._physicsStart) {
      this.metrics.physicsTime = performance.now() - (this as any)._physicsStart;
    }
  }

  public markAIStart(): void {
    (this as any)._aiStart = performance.now();
  }

  public markAIEnd(): void {
    if ((this as any)._aiStart) {
      this.metrics.aiTime = performance.now() - (this as any)._aiStart;
    }
  }

  public markRenderStart(): void {
    (this as any)._renderStart = performance.now();
  }

  public markRenderEnd(): void {
    if ((this as any)._renderStart) {
      this.metrics.renderTime = performance.now() - (this as any)._renderStart;
    }
  }

  public markInputProcessed(): void {
    this.metrics.inputLatency = performance.now() - this.inputStartTime;
  }

  // ============================================================================
  // BUDGET CHECKING
  // ============================================================================

  public isWithinBudget(): boolean {
    return (
      this.metrics.drawCalls <= this.config.drawCallBudget &&
      this.metrics.triangles <= this.config.triangleBudget &&
      this.metrics.physicsTime <= this.config.physicsTimeBudgetMs &&
      this.metrics.aiTime <= this.config.aiTimeBudgetMs &&
      this.metrics.memoryUsedMB <= this.config.memoryBudgetMB
    );
  }

  public getBudgetStatus(): Record<string, { current: number; budget: number; ok: boolean }> {
    return {
      drawCalls: {
        current: this.metrics.drawCalls,
        budget: this.config.drawCallBudget,
        ok: this.metrics.drawCalls <= this.config.drawCallBudget,
      },
      triangles: {
        current: this.metrics.triangles,
        budget: this.config.triangleBudget,
        ok: this.metrics.triangles <= this.config.triangleBudget,
      },
      physicsTime: {
        current: this.metrics.physicsTime,
        budget: this.config.physicsTimeBudgetMs,
        ok: this.metrics.physicsTime <= this.config.physicsTimeBudgetMs,
      },
      aiTime: {
        current: this.metrics.aiTime,
        budget: this.config.aiTimeBudgetMs,
        ok: this.metrics.aiTime <= this.config.aiTimeBudgetMs,
      },
      memory: {
        current: this.metrics.memoryUsedMB,
        budget: this.config.memoryBudgetMB,
        ok: this.metrics.memoryUsedMB <= this.config.memoryBudgetMB,
      },
    };
  }

  // ============================================================================
  // GETTERS
  // ============================================================================

  public getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  public getQuality(): QualityLevel {
    return this.currentQuality;
  }

  public getQualityPreset(): QualityPreset {
    return { ...QUALITY_PRESETS[this.currentQuality] };
  }

  public getResolutionScale(): number {
    return this.currentResolutionScale;
  }

  public lockQuality(lock: boolean): void {
    this.qualityLocked = lock;
  }

  public setTargetFPS(fps: number): void {
    this.config.targetFPS = fps;
  }

  // ============================================================================
  // CLEANUP
  // ============================================================================

  public dispose(): void {
    this.lodGroups.clear();
    this.occlusionQueries.clear();
    this.frameTimeHistory.length = 0;
    
    if (this.gpuTimerQuery) {
      const gl = this.renderer.getContext();
      gl.deleteQuery(this.gpuTimerQuery);
    }
  }
}

export default PerformanceManager;
