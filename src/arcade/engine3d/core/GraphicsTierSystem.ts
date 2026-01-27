/**
 * ┌─────────────────────────────────────────────────────────────────────────────┐
 * │ LUCY ARCADE — AAA GRAPHICS TIER SYSTEM                                     │
 * │                                                                             │
 * │ FORMALIZED GRAPHICS QUALITY TIERS                                          │
 * │                                                                             │
 * │ TIER 0 — Mobile Safe                                                       │
 * │   Simplified shaders, reduced particles, fixed resolution                  │
 * │                                                                             │
 * │ TIER 1 — Console Web (Default)                                             │
 * │   PBR materials, dynamic lighting, real shadows, post-processing           │
 * │                                                                             │
 * │ TIER 2 — Desktop Ultra                                                     │
 * │   High-poly assets, volumetric lighting, advanced post FX                  │
 * │                                                                             │
 * │ TIER 3 — Experimental (WebGPU-Ready)                                       │
 * │   Ray-inspired lighting, advanced compute effects, future pipeline         │
 * └─────────────────────────────────────────────────────────────────────────────┘
 */

import * as THREE from 'three';

// ============================================================================
// TIER DEFINITIONS
// ============================================================================

export type GraphicsTier = 0 | 1 | 2 | 3;

export interface TierConfig {
  name: string;
  description: string;
  
  // Resolution
  maxPixelRatio: number;
  dynamicResolution: boolean;
  minResolutionScale: number;
  
  // Shadows
  shadowsEnabled: boolean;
  shadowMapSize: number;
  shadowCascades: number;
  shadowSoftness: 'none' | 'basic' | 'pcf' | 'pcfsoft' | 'vsm';
  
  // Lighting
  maxDynamicLights: number;
  areaLightsEnabled: boolean;
  realtimeGI: boolean;
  volumetricLighting: boolean;
  lightProbes: boolean;
  
  // Materials
  pbrEnabled: boolean;
  normalMapsEnabled: boolean;
  parallaxMappingEnabled: boolean;
  subsurfaceScattering: boolean;
  
  // Post-Processing
  bloomEnabled: boolean;
  bloomQuality: 'off' | 'low' | 'medium' | 'high' | 'ultra';
  ssaoEnabled: boolean;
  ssaoQuality: 'off' | 'low' | 'medium' | 'high';
  ssrEnabled: boolean;
  ssrQuality: 'off' | 'low' | 'high';
  dofEnabled: boolean;
  motionBlurEnabled: boolean;
  chromaticAberration: boolean;
  filmGrain: boolean;
  vignette: boolean;
  colorGrading: boolean;
  
  // Anti-aliasing
  antialiasing: 'none' | 'fxaa' | 'smaa' | 'taa' | 'msaa4x' | 'msaa8x';
  
  // Geometry
  maxTriangles: number;
  lodEnabled: boolean;
  lodBias: number;
  tessellation: boolean;
  geometryInstancing: boolean;
  
  // Particles
  particleMultiplier: number;
  gpuParticles: boolean;
  particleShadows: boolean;
  softParticles: boolean;
  
  // Textures
  maxTextureSize: number;
  textureQuality: number;
  anisotropicFiltering: number;
  textureStreaming: boolean;
  
  // Animation
  skeletalAnimations: boolean;
  maxBones: number;
  clothSimulation: boolean;
  
  // Physics visuals
  destructionEnabled: boolean;
  debrisCount: number;
  
  // Water / Environment
  waterReflections: boolean;
  waterRefraction: boolean;
  atmosphericScattering: boolean;
  
  // Performance
  targetFPS: number;
  minFPS: number;
  maxDrawCalls: number;
}

// ============================================================================
// TIER PRESETS
// ============================================================================

export const TIER_CONFIGS: Record<GraphicsTier, TierConfig> = {
  // ==========================================================================
  // TIER 0 — MOBILE SAFE
  // ==========================================================================
  0: {
    name: 'Mobile Safe',
    description: 'Optimized for mobile devices and low-end hardware',
    
    maxPixelRatio: 1.0,
    dynamicResolution: true,
    minResolutionScale: 0.5,
    
    shadowsEnabled: true,
    shadowMapSize: 512,
    shadowCascades: 1,
    shadowSoftness: 'basic',
    
    maxDynamicLights: 2,
    areaLightsEnabled: false,
    realtimeGI: false,
    volumetricLighting: false,
    lightProbes: false,
    
    pbrEnabled: true,
    normalMapsEnabled: false,
    parallaxMappingEnabled: false,
    subsurfaceScattering: false,
    
    bloomEnabled: false,
    bloomQuality: 'off',
    ssaoEnabled: false,
    ssaoQuality: 'off',
    ssrEnabled: false,
    ssrQuality: 'off',
    dofEnabled: false,
    motionBlurEnabled: false,
    chromaticAberration: false,
    filmGrain: false,
    vignette: false,
    colorGrading: true,
    
    antialiasing: 'none',
    
    maxTriangles: 500000,
    lodEnabled: true,
    lodBias: 3,
    tessellation: false,
    geometryInstancing: true,
    
    particleMultiplier: 0.25,
    gpuParticles: false,
    particleShadows: false,
    softParticles: false,
    
    maxTextureSize: 512,
    textureQuality: 0.25,
    anisotropicFiltering: 1,
    textureStreaming: true,
    
    skeletalAnimations: true,
    maxBones: 32,
    clothSimulation: false,
    
    destructionEnabled: false,
    debrisCount: 0,
    
    waterReflections: false,
    waterRefraction: false,
    atmosphericScattering: false,
    
    targetFPS: 45,
    minFPS: 30,
    maxDrawCalls: 200,
  },
  
  // ==========================================================================
  // TIER 1 — CONSOLE WEB (DEFAULT)
  // ==========================================================================
  1: {
    name: 'Console Web',
    description: 'Console-quality graphics optimized for web browsers',
    
    maxPixelRatio: 1.5,
    dynamicResolution: true,
    minResolutionScale: 0.65,
    
    shadowsEnabled: true,
    shadowMapSize: 1024,
    shadowCascades: 2,
    shadowSoftness: 'pcf',
    
    maxDynamicLights: 8,
    areaLightsEnabled: false,
    realtimeGI: false,
    volumetricLighting: false,
    lightProbes: true,
    
    pbrEnabled: true,
    normalMapsEnabled: true,
    parallaxMappingEnabled: false,
    subsurfaceScattering: false,
    
    bloomEnabled: true,
    bloomQuality: 'medium',
    ssaoEnabled: false,
    ssaoQuality: 'off',
    ssrEnabled: false,
    ssrQuality: 'off',
    dofEnabled: false,
    motionBlurEnabled: false,
    chromaticAberration: false,
    filmGrain: false,
    vignette: true,
    colorGrading: true,
    
    antialiasing: 'fxaa',
    
    maxTriangles: 1500000,
    lodEnabled: true,
    lodBias: 1.5,
    tessellation: false,
    geometryInstancing: true,
    
    particleMultiplier: 0.75,
    gpuParticles: true,
    particleShadows: false,
    softParticles: true,
    
    maxTextureSize: 1024,
    textureQuality: 0.75,
    anisotropicFiltering: 4,
    textureStreaming: true,
    
    skeletalAnimations: true,
    maxBones: 64,
    clothSimulation: false,
    
    destructionEnabled: true,
    debrisCount: 10,
    
    waterReflections: true,
    waterRefraction: false,
    atmosphericScattering: false,
    
    targetFPS: 60,
    minFPS: 45,
    maxDrawCalls: 500,
  },
  
  // ==========================================================================
  // TIER 2 — DESKTOP ULTRA
  // ==========================================================================
  2: {
    name: 'Desktop Ultra',
    description: 'High-fidelity graphics for powerful desktop systems',
    
    maxPixelRatio: 2.0,
    dynamicResolution: true,
    minResolutionScale: 0.75,
    
    shadowsEnabled: true,
    shadowMapSize: 2048,
    shadowCascades: 4,
    shadowSoftness: 'pcfsoft',
    
    maxDynamicLights: 24,
    areaLightsEnabled: true,
    realtimeGI: false,
    volumetricLighting: true,
    lightProbes: true,
    
    pbrEnabled: true,
    normalMapsEnabled: true,
    parallaxMappingEnabled: true,
    subsurfaceScattering: true,
    
    bloomEnabled: true,
    bloomQuality: 'high',
    ssaoEnabled: true,
    ssaoQuality: 'medium',
    ssrEnabled: true,
    ssrQuality: 'low',
    dofEnabled: true,
    motionBlurEnabled: true,
    chromaticAberration: true,
    filmGrain: true,
    vignette: true,
    colorGrading: true,
    
    antialiasing: 'smaa',
    
    maxTriangles: 3000000,
    lodEnabled: true,
    lodBias: 0.5,
    tessellation: false,
    geometryInstancing: true,
    
    particleMultiplier: 1.5,
    gpuParticles: true,
    particleShadows: true,
    softParticles: true,
    
    maxTextureSize: 2048,
    textureQuality: 1.0,
    anisotropicFiltering: 8,
    textureStreaming: true,
    
    skeletalAnimations: true,
    maxBones: 128,
    clothSimulation: true,
    
    destructionEnabled: true,
    debrisCount: 50,
    
    waterReflections: true,
    waterRefraction: true,
    atmosphericScattering: true,
    
    targetFPS: 60,
    minFPS: 50,
    maxDrawCalls: 1000,
  },
  
  // ==========================================================================
  // TIER 3 — EXPERIMENTAL (WebGPU-Ready)
  // ==========================================================================
  3: {
    name: 'Experimental',
    description: 'Cutting-edge features for WebGPU-capable browsers',
    
    maxPixelRatio: 2.5,
    dynamicResolution: true,
    minResolutionScale: 0.8,
    
    shadowsEnabled: true,
    shadowMapSize: 4096,
    shadowCascades: 4,
    shadowSoftness: 'vsm',
    
    maxDynamicLights: 48,
    areaLightsEnabled: true,
    realtimeGI: true, // Would use compute shaders
    volumetricLighting: true,
    lightProbes: true,
    
    pbrEnabled: true,
    normalMapsEnabled: true,
    parallaxMappingEnabled: true,
    subsurfaceScattering: true,
    
    bloomEnabled: true,
    bloomQuality: 'ultra',
    ssaoEnabled: true,
    ssaoQuality: 'high',
    ssrEnabled: true,
    ssrQuality: 'high',
    dofEnabled: true,
    motionBlurEnabled: true,
    chromaticAberration: true,
    filmGrain: true,
    vignette: true,
    colorGrading: true,
    
    antialiasing: 'taa',
    
    maxTriangles: 5000000,
    lodEnabled: true,
    lodBias: 0,
    tessellation: true, // Hardware tessellation
    geometryInstancing: true,
    
    particleMultiplier: 2.0,
    gpuParticles: true,
    particleShadows: true,
    softParticles: true,
    
    maxTextureSize: 4096,
    textureQuality: 1.0,
    anisotropicFiltering: 16,
    textureStreaming: true,
    
    skeletalAnimations: true,
    maxBones: 256,
    clothSimulation: true,
    
    destructionEnabled: true,
    debrisCount: 100,
    
    waterReflections: true,
    waterRefraction: true,
    atmosphericScattering: true,
    
    targetFPS: 120,
    minFPS: 60,
    maxDrawCalls: 2000,
  },
};

// ============================================================================
// GRAPHICS TIER MANAGER
// ============================================================================

export class GraphicsTierSystem {
  private currentTier: GraphicsTier = 1;
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private autoDetected: boolean = false;
  
  constructor(renderer: THREE.WebGLRenderer, scene: THREE.Scene) {
    this.renderer = renderer;
    this.scene = scene;
  }
  
  /**
   * Auto-detect the best tier for the current device
   */
  public autoDetectTier(): GraphicsTier {
    if (this.autoDetected) return this.currentTier;
    
    const gl = this.renderer.getContext();
    
    // Check for mobile
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );
    
    // Check WebGPU support
    const hasWebGPU = 'gpu' in navigator;
    
    // Get GPU info
    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
    let gpuRenderer = 'Unknown';
    if (debugInfo) {
      gpuRenderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
    }
    
    // Check capabilities
    const maxTextureSize = gl.getParameter(gl.MAX_TEXTURE_SIZE);
    const maxVertexUniforms = gl.getParameter(gl.MAX_VERTEX_UNIFORM_VECTORS);
    const maxFragmentUniforms = gl.getParameter(gl.MAX_FRAGMENT_UNIFORM_VECTORS);
    
    console.log('[GraphicsTier] GPU:', gpuRenderer);
    console.log('[GraphicsTier] Max Texture Size:', maxTextureSize);
    console.log('[GraphicsTier] WebGPU Available:', hasWebGPU);
    console.log('[GraphicsTier] Mobile:', isMobile);
    
    let tier: GraphicsTier = 1; // Default to Console Web
    
    if (isMobile) {
      tier = 0; // Mobile Safe
    } else if (hasWebGPU && maxTextureSize >= 8192 && !gpuRenderer.includes('Intel')) {
      tier = 3; // Experimental
    } else if (maxTextureSize >= 4096 && maxVertexUniforms >= 1024) {
      // Check for high-end GPU
      const isHighEnd = 
        gpuRenderer.includes('RTX') ||
        gpuRenderer.includes('GTX 10') ||
        gpuRenderer.includes('GTX 16') ||
        gpuRenderer.includes('RX 5') ||
        gpuRenderer.includes('RX 6') ||
        gpuRenderer.includes('M1') ||
        gpuRenderer.includes('M2') ||
        gpuRenderer.includes('M3');
      
      tier = isHighEnd ? 2 : 1;
    } else if (gpuRenderer.includes('Intel')) {
      tier = 1; // Console Web for Intel iGPU
    }
    
    this.autoDetected = true;
    this.currentTier = tier;
    
    console.log(`[GraphicsTier] Auto-detected tier: ${tier} (${TIER_CONFIGS[tier].name})`);
    
    return tier;
  }
  
  /**
   * Set the graphics tier manually
   */
  public setTier(tier: GraphicsTier): void {
    if (tier < 0 || tier > 3) {
      console.warn(`[GraphicsTier] Invalid tier ${tier}, using 1`);
      tier = 1;
    }
    
    this.currentTier = tier;
    this.applyTier(tier);
    
    console.log(`[GraphicsTier] Set to tier ${tier}: ${TIER_CONFIGS[tier].name}`);
  }
  
  /**
   * Get the current tier
   */
  public getTier(): GraphicsTier {
    return this.currentTier;
  }
  
  /**
   * Get the config for the current tier
   */
  public getConfig(): TierConfig {
    return TIER_CONFIGS[this.currentTier];
  }
  
  /**
   * Get config for a specific tier
   */
  public getTierConfig(tier: GraphicsTier): TierConfig {
    return TIER_CONFIGS[tier];
  }
  
  /**
   * Apply tier settings to the renderer and scene
   */
  private applyTier(tier: GraphicsTier): void {
    const config = TIER_CONFIGS[tier];
    
    // Renderer settings
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, config.maxPixelRatio));
    this.renderer.shadowMap.enabled = config.shadowsEnabled;
    
    // Shadow quality
    switch (config.shadowSoftness) {
      case 'none':
        this.renderer.shadowMap.type = THREE.BasicShadowMap;
        break;
      case 'basic':
        this.renderer.shadowMap.type = THREE.BasicShadowMap;
        break;
      case 'pcf':
        this.renderer.shadowMap.type = THREE.PCFShadowMap;
        break;
      case 'pcfsoft':
      case 'vsm':
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        break;
    }
    
    // Update all shadow-casting lights
    this.scene.traverse((obj) => {
      if (obj instanceof THREE.DirectionalLight && obj.castShadow) {
        obj.shadow.mapSize.setScalar(config.shadowMapSize);
        obj.shadow.map?.dispose();
        obj.shadow.map = null;
      }
      if (obj instanceof THREE.SpotLight && obj.castShadow) {
        obj.shadow.mapSize.setScalar(config.shadowMapSize);
        obj.shadow.map?.dispose();
        obj.shadow.map = null;
      }
    });
  }
  
  /**
   * Check if a feature is enabled at the current tier
   */
  public isFeatureEnabled(feature: keyof TierConfig): boolean {
    const config = TIER_CONFIGS[this.currentTier];
    const value = config[feature];
    
    if (typeof value === 'boolean') {
      return value;
    }
    if (typeof value === 'string') {
      return value !== 'off' && value !== 'none';
    }
    if (typeof value === 'number') {
      return value > 0;
    }
    
    return false;
  }
  
  /**
   * Get a numeric value with tier scaling
   */
  public getScaledValue(feature: keyof TierConfig, baseValue: number): number {
    const config = TIER_CONFIGS[this.currentTier];
    const tierValue = config[feature];
    
    if (typeof tierValue === 'number' && tierValue > 0) {
      // For multipliers, use directly
      if (feature.toLowerCase().includes('multiplier') || 
          feature.toLowerCase().includes('quality') ||
          feature.toLowerCase().includes('ratio')) {
        return baseValue * tierValue;
      }
      // For counts/limits, use the config value
      return tierValue;
    }
    
    return baseValue;
  }
  
  /**
   * Get all tier names for UI
   */
  public static getTierNames(): { tier: GraphicsTier; name: string; description: string }[] {
    return [
      { tier: 0, name: TIER_CONFIGS[0].name, description: TIER_CONFIGS[0].description },
      { tier: 1, name: TIER_CONFIGS[1].name, description: TIER_CONFIGS[1].description },
      { tier: 2, name: TIER_CONFIGS[2].name, description: TIER_CONFIGS[2].description },
      { tier: 3, name: TIER_CONFIGS[3].name, description: TIER_CONFIGS[3].description },
    ];
  }
}

export default GraphicsTierSystem;
