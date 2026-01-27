/**
 * ┌─────────────────────────────────────────────────────────────────────────────┐
 * │ LUCY ARCADE — ASSET PIPELINE                                               │
 * │                                                                             │
 * │ Tier-aware asset loading, performance budgets, and streaming               │
 * │                                                                             │
 * │ FEATURES:                                                                  │
 * │ • Quality tier-based asset selection                                       │
 * │ • Progressive loading with priority queues                                 │
 * │ • Memory budget management                                                 │
 * │ • Asset streaming and unloading                                            │
 * │ • Consistent naming conventions                                            │
 * └─────────────────────────────────────────────────────────────────────────────┘
 */

import * as THREE from 'three';
import type { GraphicsTier } from './GraphicsTierSystem';

// ============================================================================
// TYPES
// ============================================================================

export type AssetType = 'model' | 'texture' | 'audio' | 'animation' | 'shader' | 'data';
export type AssetPriority = 'critical' | 'high' | 'medium' | 'low' | 'background';

export interface AssetManifestEntry {
  id: string;
  type: AssetType;
  path: string;
  priority: AssetPriority;
  memoryBudgetKB: number;
  
  // Tier-specific variants
  variants?: {
    [K in GraphicsTier]?: {
      path: string;
      memoryBudgetKB: number;
    };
  };
  
  // Dependencies
  dependencies?: string[];
  
  // Streaming options
  streamable?: boolean;
  preload?: boolean;
  
  // Metadata
  category?: string;
  tags?: string[];
}

export interface LoadedAsset {
  id: string;
  type: AssetType;
  data: any;
  memoryUsageKB: number;
  loadedAt: number;
  lastAccessedAt: number;
  accessCount: number;
  tier: GraphicsTier;
}

export interface LoadProgress {
  loaded: number;
  total: number;
  currentAsset: string;
  percentage: number;
}

// ============================================================================
// NAMING CONVENTIONS
// ============================================================================

export const ASSET_NAMING = {
  // Model naming: {category}_{name}_{variant}.{ext}
  // Example: weapon_rifle_phantom.glb
  model: {
    prefix: '',
    separator: '_',
    variants: ['high', 'medium', 'low'],
    extension: 'glb',
  },
  
  // Texture naming: {type}_{name}_{resolution}.{ext}
  // Example: diffuse_metal_2k.webp
  texture: {
    types: ['diffuse', 'normal', 'roughness', 'metalness', 'ao', 'emissive', 'height'],
    resolutions: ['4k', '2k', '1k', '512'],
    extension: 'webp',
  },
  
  // Audio naming: {category}_{name}_{variant}.{ext}
  // Example: sfx_gunshot_rifle.mp3
  audio: {
    categories: ['sfx', 'music', 'ambient', 'ui', 'voice'],
    extension: 'mp3',
  },
  
  // Animation naming: {character}_{action}_{variant}.{ext}
  // Example: soldier_run_forward.glb
  animation: {
    actions: ['idle', 'walk', 'run', 'jump', 'crouch', 'shoot', 'reload', 'death', 'hit'],
    extension: 'glb',
  },
};

// ============================================================================
// MEMORY BUDGETS PER TIER (MB)
// ============================================================================

export const MEMORY_BUDGETS: Record<GraphicsTier, {
  total: number;
  models: number;
  textures: number;
  audio: number;
  other: number;
}> = {
  0: { total: 256, models: 64, textures: 128, audio: 32, other: 32 },
  1: { total: 512, models: 128, textures: 256, audio: 64, other: 64 },
  2: { total: 1024, models: 256, textures: 512, audio: 128, other: 128 },
  3: { total: 2048, models: 512, textures: 1024, audio: 256, other: 256 },
};

// ============================================================================
// ASSET PIPELINE CLASS
// ============================================================================

export class AssetPipeline {
  private manifest: Map<string, AssetManifestEntry> = new Map();
  private loadedAssets: Map<string, LoadedAsset> = new Map();
  private loadQueue: AssetManifestEntry[] = [];
  private isLoading: boolean = false;
  private currentTier: GraphicsTier = 1;
  
  // Memory tracking
  private memoryUsage: { models: number; textures: number; audio: number; other: number } = {
    models: 0,
    textures: 0,
    audio: 0,
    other: 0,
  };
  
  // Callbacks
  private onProgressCallbacks: Set<(progress: LoadProgress) => void> = new Set();
  private onCompleteCallbacks: Set<() => void> = new Set();
  private onErrorCallbacks: Set<(error: Error, assetId: string) => void> = new Set();

  constructor() {}

  // ============================================================================
  // MANIFEST MANAGEMENT
  // ============================================================================

  /**
   * Register an asset in the manifest
   */
  public registerAsset(entry: AssetManifestEntry): void {
    this.manifest.set(entry.id, entry);
  }

  /**
   * Register multiple assets
   */
  public registerAssets(entries: AssetManifestEntry[]): void {
    entries.forEach(entry => this.registerAsset(entry));
  }

  /**
   * Get asset manifest entry
   */
  public getManifestEntry(id: string): AssetManifestEntry | undefined {
    return this.manifest.get(id);
  }

  // ============================================================================
  // TIER MANAGEMENT
  // ============================================================================

  /**
   * Set the current graphics tier
   */
  public setTier(tier: GraphicsTier): void {
    if (this.currentTier !== tier) {
      const oldTier = this.currentTier;
      this.currentTier = tier;
      
      console.log(`[AssetPipeline] Tier changed: ${oldTier} -> ${tier}`);
      
      // Trigger asset swapping if needed
      this.swapAssetsForTier(tier);
    }
  }

  /**
   * Get the current tier
   */
  public getTier(): GraphicsTier {
    return this.currentTier;
  }

  /**
   * Get the appropriate path for current tier
   */
  private getPathForTier(entry: AssetManifestEntry): string {
    if (entry.variants && entry.variants[this.currentTier]) {
      return entry.variants[this.currentTier]!.path;
    }
    return entry.path;
  }

  /**
   * Swap assets when tier changes
   */
  private async swapAssetsForTier(newTier: GraphicsTier): Promise<void> {
    const assetsToReload: string[] = [];
    
    this.loadedAssets.forEach((loaded, id) => {
      const entry = this.manifest.get(id);
      if (!entry) return;
      
      // Check if this asset has tier-specific variants
      if (entry.variants && entry.variants[newTier]) {
        if (loaded.tier !== newTier) {
          assetsToReload.push(id);
        }
      }
    });
    
    // Reload assets with new tier variants
    for (const id of assetsToReload) {
      await this.reloadAsset(id);
    }
  }

  // ============================================================================
  // LOADING
  // ============================================================================

  /**
   * Load a single asset
   */
  public async loadAsset(id: string): Promise<LoadedAsset | null> {
    const entry = this.manifest.get(id);
    if (!entry) {
      console.warn(`[AssetPipeline] Asset not in manifest: ${id}`);
      return null;
    }
    
    // Check if already loaded
    const existing = this.loadedAssets.get(id);
    if (existing) {
      existing.lastAccessedAt = Date.now();
      existing.accessCount++;
      return existing;
    }
    
    // Check memory budget
    if (!this.checkMemoryBudget(entry)) {
      // Try to free memory
      this.freeMemoryForAsset(entry);
    }
    
    const path = this.getPathForTier(entry);
    
    try {
      let data: any;
      
      switch (entry.type) {
        case 'model':
          data = await this.loadModel(path);
          break;
        case 'texture':
          data = await this.loadTexture(path);
          break;
        case 'audio':
          data = await this.loadAudio(path);
          break;
        case 'data':
          data = await this.loadData(path);
          break;
        default:
          throw new Error(`Unknown asset type: ${entry.type}`);
      }
      
      const loaded: LoadedAsset = {
        id,
        type: entry.type,
        data,
        memoryUsageKB: entry.memoryBudgetKB,
        loadedAt: Date.now(),
        lastAccessedAt: Date.now(),
        accessCount: 1,
        tier: this.currentTier,
      };
      
      this.loadedAssets.set(id, loaded);
      this.updateMemoryUsage(entry.type, entry.memoryBudgetKB);
      
      return loaded;
    } catch (error) {
      console.error(`[AssetPipeline] Failed to load asset: ${id}`, error);
      this.onErrorCallbacks.forEach(cb => cb(error as Error, id));
      return null;
    }
  }

  /**
   * Load multiple assets with progress tracking
   */
  public async loadAssets(ids: string[]): Promise<Map<string, LoadedAsset>> {
    const results = new Map<string, LoadedAsset>();
    
    // Sort by priority
    const sorted = ids
      .map(id => this.manifest.get(id))
      .filter((entry): entry is AssetManifestEntry => !!entry)
      .sort((a, b) => this.getPriorityWeight(a.priority) - this.getPriorityWeight(b.priority));
    
    const total = sorted.length;
    let loaded = 0;
    
    for (const entry of sorted) {
      this.notifyProgress({
        loaded,
        total,
        currentAsset: entry.id,
        percentage: (loaded / total) * 100,
      });
      
      const result = await this.loadAsset(entry.id);
      if (result) {
        results.set(entry.id, result);
      }
      
      loaded++;
    }
    
    this.notifyProgress({
      loaded: total,
      total,
      currentAsset: '',
      percentage: 100,
    });
    
    this.onCompleteCallbacks.forEach(cb => cb());
    
    return results;
  }

  /**
   * Preload assets marked as preload in manifest
   */
  public async preloadAssets(): Promise<void> {
    const preloadIds = Array.from(this.manifest.values())
      .filter(entry => entry.preload)
      .map(entry => entry.id);
    
    await this.loadAssets(preloadIds);
  }

  /**
   * Reload an asset (for tier changes)
   */
  private async reloadAsset(id: string): Promise<void> {
    const existing = this.loadedAssets.get(id);
    if (existing) {
      this.unloadAsset(id);
    }
    
    await this.loadAsset(id);
  }

  // ============================================================================
  // ASSET TYPE LOADERS
  // ============================================================================

  private async loadModel(path: string): Promise<THREE.Object3D> {
    // Placeholder - would use GLTFLoader
    return new THREE.Group();
  }

  private async loadTexture(path: string): Promise<THREE.Texture> {
    return new Promise((resolve, reject) => {
      const loader = new THREE.TextureLoader();
      loader.load(
        path,
        (texture) => {
          texture.colorSpace = THREE.SRGBColorSpace;
          resolve(texture);
        },
        undefined,
        reject
      );
    });
  }

  private async loadAudio(path: string): Promise<AudioBuffer> {
    const response = await fetch(path);
    const arrayBuffer = await response.arrayBuffer();
    const audioContext = new AudioContext();
    return audioContext.decodeAudioData(arrayBuffer);
  }

  private async loadData(path: string): Promise<any> {
    const response = await fetch(path);
    if (path.endsWith('.json')) {
      return response.json();
    }
    return response.text();
  }

  // ============================================================================
  // MEMORY MANAGEMENT
  // ============================================================================

  /**
   * Check if we have budget for an asset
   */
  private checkMemoryBudget(entry: AssetManifestEntry): boolean {
    const budget = MEMORY_BUDGETS[this.currentTier];
    const category = this.getMemoryCategory(entry.type);
    const currentUsage = this.memoryUsage[category];
    const categoryBudget = budget[category] * 1024; // Convert to KB
    
    return currentUsage + entry.memoryBudgetKB <= categoryBudget;
  }

  /**
   * Free memory to make room for new asset
   */
  private freeMemoryForAsset(entry: AssetManifestEntry): void {
    const category = this.getMemoryCategory(entry.type);
    const budget = MEMORY_BUDGETS[this.currentTier][category] * 1024;
    const needed = entry.memoryBudgetKB;
    
    // Get assets of same type, sorted by LRU
    const candidates = Array.from(this.loadedAssets.values())
      .filter(asset => this.getMemoryCategory(asset.type) === category)
      .sort((a, b) => a.lastAccessedAt - b.lastAccessedAt);
    
    let freed = 0;
    const toUnload: string[] = [];
    
    for (const candidate of candidates) {
      if (this.memoryUsage[category] - freed + needed <= budget) {
        break;
      }
      
      toUnload.push(candidate.id);
      freed += candidate.memoryUsageKB;
    }
    
    toUnload.forEach(id => this.unloadAsset(id));
  }

  /**
   * Unload an asset
   */
  public unloadAsset(id: string): void {
    const asset = this.loadedAssets.get(id);
    if (!asset) return;
    
    // Dispose resources
    if (asset.data instanceof THREE.Texture) {
      asset.data.dispose();
    } else if (asset.data instanceof THREE.Object3D) {
      asset.data.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.geometry?.dispose();
          if (child.material instanceof THREE.Material) {
            child.material.dispose();
          }
        }
      });
    }
    
    // Update memory tracking
    const category = this.getMemoryCategory(asset.type);
    this.memoryUsage[category] -= asset.memoryUsageKB;
    
    this.loadedAssets.delete(id);
  }

  /**
   * Unload all assets
   */
  public unloadAll(): void {
    const ids = Array.from(this.loadedAssets.keys());
    ids.forEach(id => this.unloadAsset(id));
  }

  private updateMemoryUsage(type: AssetType, sizeKB: number): void {
    const category = this.getMemoryCategory(type);
    this.memoryUsage[category] += sizeKB;
  }

  private getMemoryCategory(type: AssetType): 'models' | 'textures' | 'audio' | 'other' {
    switch (type) {
      case 'model':
      case 'animation':
        return 'models';
      case 'texture':
        return 'textures';
      case 'audio':
        return 'audio';
      default:
        return 'other';
    }
  }

  // ============================================================================
  // UTILITIES
  // ============================================================================

  /**
   * Get an already loaded asset
   */
  public getAsset<T = any>(id: string): T | null {
    const asset = this.loadedAssets.get(id);
    if (asset) {
      asset.lastAccessedAt = Date.now();
      asset.accessCount++;
      return asset.data as T;
    }
    return null;
  }

  /**
   * Check if asset is loaded
   */
  public isLoaded(id: string): boolean {
    return this.loadedAssets.has(id);
  }

  /**
   * Get memory usage statistics
   */
  public getMemoryStats(): {
    usage: typeof this.memoryUsage;
    budget: typeof MEMORY_BUDGETS[GraphicsTier];
    percentage: { models: number; textures: number; audio: number; other: number };
  } {
    const budget = MEMORY_BUDGETS[this.currentTier];
    
    return {
      usage: { ...this.memoryUsage },
      budget,
      percentage: {
        models: (this.memoryUsage.models / (budget.models * 1024)) * 100,
        textures: (this.memoryUsage.textures / (budget.textures * 1024)) * 100,
        audio: (this.memoryUsage.audio / (budget.audio * 1024)) * 100,
        other: (this.memoryUsage.other / (budget.other * 1024)) * 100,
      },
    };
  }

  private getPriorityWeight(priority: AssetPriority): number {
    switch (priority) {
      case 'critical': return 0;
      case 'high': return 1;
      case 'medium': return 2;
      case 'low': return 3;
      case 'background': return 4;
      default: return 5;
    }
  }

  // ============================================================================
  // CALLBACKS
  // ============================================================================

  public onProgress(callback: (progress: LoadProgress) => void): () => void {
    this.onProgressCallbacks.add(callback);
    return () => this.onProgressCallbacks.delete(callback);
  }

  public onComplete(callback: () => void): () => void {
    this.onCompleteCallbacks.add(callback);
    return () => this.onCompleteCallbacks.delete(callback);
  }

  public onError(callback: (error: Error, assetId: string) => void): () => void {
    this.onErrorCallbacks.add(callback);
    return () => this.onErrorCallbacks.delete(callback);
  }

  private notifyProgress(progress: LoadProgress): void {
    this.onProgressCallbacks.forEach(cb => cb(progress));
  }

  // ============================================================================
  // CLEANUP
  // ============================================================================

  public dispose(): void {
    this.unloadAll();
    this.manifest.clear();
    this.onProgressCallbacks.clear();
    this.onCompleteCallbacks.clear();
    this.onErrorCallbacks.clear();
  }
}

export default AssetPipeline;
