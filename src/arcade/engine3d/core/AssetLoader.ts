/**
 * ┌─────────────────────────────────────────────────────────────────────────────┐
 * │ LUCY ARCADE — ASSET LOADER                                                 │
 * │                                                                             │
 * │ Unified asset loading with caching and progress tracking                   │
 * │ Supports GLTF, textures, audio, HDR environments                           │
 * └─────────────────────────────────────────────────────────────────────────────┘
 */

import * as THREE from 'three';
import { GLTFLoader, type GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';
import { EXRLoader } from 'three/examples/jsm/loaders/EXRLoader.js';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';

export interface LoadProgress {
  loaded: number;
  total: number;
  percentage: number;
  currentAsset: string;
}

export interface AssetManifest {
  models?: { id: string; url: string; type?: 'gltf' | 'fbx' }[];
  textures?: { id: string; url: string; type?: 'texture' | 'cube' | 'hdr' | 'exr' }[];
  audio?: { id: string; url: string }[];
  data?: { id: string; url: string }[];
}

export type ProgressCallback = (progress: LoadProgress) => void;

export class AssetLoader {
  // Loaders
  private gltfLoader: GLTFLoader;
  private dracoLoader: DRACOLoader;
  private textureLoader: THREE.TextureLoader;
  private cubeTextureLoader: THREE.CubeTextureLoader;
  private rgbeLoader: RGBELoader;
  private exrLoader: EXRLoader;
  private fbxLoader: FBXLoader;
  private audioLoader: THREE.AudioLoader;
  
  // Caches
  private modelCache: Map<string, GLTF | THREE.Group> = new Map();
  private textureCache: Map<string, THREE.Texture> = new Map();
  private audioCache: Map<string, AudioBuffer> = new Map();
  private dataCache: Map<string, any> = new Map();
  
  // Loading state
  private loadingManager: THREE.LoadingManager;
  private progressCallbacks: Set<ProgressCallback> = new Set();
  private currentAsset: string = '';

  constructor() {
    // Initialize loading manager
    this.loadingManager = new THREE.LoadingManager();
    
    this.loadingManager.onProgress = (url, loaded, total) => {
      this.notifyProgress({
        loaded,
        total,
        percentage: (loaded / total) * 100,
        currentAsset: this.currentAsset,
      });
    };
    
    // Initialize DRACO loader for compressed meshes
    this.dracoLoader = new DRACOLoader();
    this.dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/');
    this.dracoLoader.preload();
    
    // Initialize GLTF loader
    this.gltfLoader = new GLTFLoader(this.loadingManager);
    this.gltfLoader.setDRACOLoader(this.dracoLoader);
    
    // Initialize other loaders
    this.textureLoader = new THREE.TextureLoader(this.loadingManager);
    this.cubeTextureLoader = new THREE.CubeTextureLoader(this.loadingManager);
    this.rgbeLoader = new RGBELoader(this.loadingManager);
    this.exrLoader = new EXRLoader(this.loadingManager);
    this.fbxLoader = new FBXLoader(this.loadingManager);
    this.audioLoader = new THREE.AudioLoader(this.loadingManager);
    
    console.log('[AssetLoader] Initialized');
  }

  private notifyProgress(progress: LoadProgress): void {
    this.progressCallbacks.forEach(cb => cb(progress));
  }

  // ============================================================================
  // PROGRESS TRACKING
  // ============================================================================

  public onProgress(callback: ProgressCallback): () => void {
    this.progressCallbacks.add(callback);
    return () => this.progressCallbacks.delete(callback);
  }

  // ============================================================================
  // MODEL LOADING
  // ============================================================================

  public async loadGLTF(id: string, url: string): Promise<GLTF> {
    // Check cache
    const cached = this.modelCache.get(id);
    if (cached && 'scene' in cached) {
      return cached as GLTF;
    }
    
    this.currentAsset = id;
    
    return new Promise((resolve, reject) => {
      this.gltfLoader.load(
        url,
        (gltf) => {
          // Setup shadows for all meshes
          gltf.scene.traverse((child) => {
            if (child instanceof THREE.Mesh) {
              child.castShadow = true;
              child.receiveShadow = true;
            }
          });
          
          this.modelCache.set(id, gltf);
          resolve(gltf);
        },
        undefined,
        (error) => {
          console.error(`[AssetLoader] Failed to load GLTF: ${url}`, error);
          reject(error);
        }
      );
    });
  }

  public async loadFBX(id: string, url: string): Promise<THREE.Group> {
    const cached = this.modelCache.get(id);
    if (cached && cached instanceof THREE.Group) {
      return cached;
    }
    
    this.currentAsset = id;
    
    return new Promise((resolve, reject) => {
      this.fbxLoader.load(
        url,
        (group) => {
          group.traverse((child) => {
            if (child instanceof THREE.Mesh) {
              child.castShadow = true;
              child.receiveShadow = true;
            }
          });
          
          this.modelCache.set(id, group);
          resolve(group);
        },
        undefined,
        (error) => {
          console.error(`[AssetLoader] Failed to load FBX: ${url}`, error);
          reject(error);
        }
      );
    });
  }

  public cloneModel(id: string): THREE.Object3D | null {
    const cached = this.modelCache.get(id);
    if (!cached) return null;
    
    if ('scene' in cached) {
      return (cached as GLTF).scene.clone();
    }
    
    return cached.clone();
  }

  // ============================================================================
  // TEXTURE LOADING
  // ============================================================================

  public async loadTexture(
    id: string,
    url: string,
    options: {
      flipY?: boolean;
      colorSpace?: THREE.ColorSpace;
      wrapS?: THREE.Wrapping;
      wrapT?: THREE.Wrapping;
      minFilter?: THREE.MinificationTextureFilter;
      magFilter?: THREE.MagnificationTextureFilter;
      anisotropy?: number;
    } = {}
  ): Promise<THREE.Texture> {
    const cached = this.textureCache.get(id);
    if (cached) return cached;
    
    this.currentAsset = id;
    
    return new Promise((resolve, reject) => {
      this.textureLoader.load(
        url,
        (texture) => {
          texture.flipY = options.flipY ?? true;
          texture.colorSpace = options.colorSpace ?? THREE.SRGBColorSpace;
          texture.wrapS = options.wrapS ?? THREE.RepeatWrapping;
          texture.wrapT = options.wrapT ?? THREE.RepeatWrapping;
          texture.minFilter = options.minFilter ?? THREE.LinearMipmapLinearFilter;
          texture.magFilter = options.magFilter ?? THREE.LinearFilter;
          texture.anisotropy = options.anisotropy ?? 16;
          
          this.textureCache.set(id, texture);
          resolve(texture);
        },
        undefined,
        (error) => {
          console.error(`[AssetLoader] Failed to load texture: ${url}`, error);
          reject(error);
        }
      );
    });
  }

  public async loadCubeTexture(
    id: string,
    urls: string[] // [px, nx, py, ny, pz, nz]
  ): Promise<THREE.CubeTexture> {
    const cached = this.textureCache.get(id);
    if (cached instanceof THREE.CubeTexture) return cached;
    
    this.currentAsset = id;
    
    return new Promise((resolve, reject) => {
      this.cubeTextureLoader.load(
        urls,
        (texture) => {
          this.textureCache.set(id, texture);
          resolve(texture);
        },
        undefined,
        (error) => {
          console.error(`[AssetLoader] Failed to load cube texture`, error);
          reject(error);
        }
      );
    });
  }

  public async loadHDR(id: string, url: string): Promise<THREE.DataTexture> {
    const cached = this.textureCache.get(id);
    if (cached instanceof THREE.DataTexture) return cached;
    
    this.currentAsset = id;
    
    return new Promise((resolve, reject) => {
      this.rgbeLoader.load(
        url,
        (texture) => {
          texture.mapping = THREE.EquirectangularReflectionMapping;
          this.textureCache.set(id, texture);
          resolve(texture);
        },
        undefined,
        (error) => {
          console.error(`[AssetLoader] Failed to load HDR: ${url}`, error);
          reject(error);
        }
      );
    });
  }

  public async loadEXR(id: string, url: string): Promise<THREE.DataTexture> {
    const cached = this.textureCache.get(id);
    if (cached instanceof THREE.DataTexture) return cached;
    
    this.currentAsset = id;
    
    return new Promise((resolve, reject) => {
      this.exrLoader.load(
        url,
        (texture) => {
          texture.mapping = THREE.EquirectangularReflectionMapping;
          this.textureCache.set(id, texture);
          resolve(texture);
        },
        undefined,
        (error) => {
          console.error(`[AssetLoader] Failed to load EXR: ${url}`, error);
          reject(error);
        }
      );
    });
  }

  // ============================================================================
  // AUDIO LOADING
  // ============================================================================

  public async loadAudio(id: string, url: string): Promise<AudioBuffer> {
    const cached = this.audioCache.get(id);
    if (cached) return cached;
    
    this.currentAsset = id;
    
    return new Promise((resolve, reject) => {
      this.audioLoader.load(
        url,
        (buffer) => {
          this.audioCache.set(id, buffer);
          resolve(buffer);
        },
        undefined,
        (error) => {
          console.error(`[AssetLoader] Failed to load audio: ${url}`, error);
          reject(error);
        }
      );
    });
  }

  // ============================================================================
  // DATA LOADING
  // ============================================================================

  public async loadJSON<T = any>(id: string, url: string): Promise<T> {
    const cached = this.dataCache.get(id);
    if (cached) return cached as T;
    
    this.currentAsset = id;
    
    const response = await fetch(url);
    const data = await response.json();
    
    this.dataCache.set(id, data);
    return data as T;
  }

  public async loadText(id: string, url: string): Promise<string> {
    const cached = this.dataCache.get(id);
    if (cached) return cached as string;
    
    this.currentAsset = id;
    
    const response = await fetch(url);
    const text = await response.text();
    
    this.dataCache.set(id, text);
    return text;
  }

  // ============================================================================
  // BATCH LOADING
  // ============================================================================

  public async loadManifest(
    manifest: AssetManifest,
    onProgress?: ProgressCallback
  ): Promise<void> {
    const tasks: Promise<any>[] = [];
    
    let totalAssets = 0;
    let loadedAssets = 0;
    
    if (manifest.models) totalAssets += manifest.models.length;
    if (manifest.textures) totalAssets += manifest.textures.length;
    if (manifest.audio) totalAssets += manifest.audio.length;
    if (manifest.data) totalAssets += manifest.data.length;
    
    const updateProgress = (assetId: string) => {
      loadedAssets++;
      onProgress?.({
        loaded: loadedAssets,
        total: totalAssets,
        percentage: (loadedAssets / totalAssets) * 100,
        currentAsset: assetId,
      });
    };
    
    // Load models
    if (manifest.models) {
      for (const model of manifest.models) {
        const type = model.type || 'gltf';
        const task = type === 'fbx'
          ? this.loadFBX(model.id, model.url).then(() => updateProgress(model.id))
          : this.loadGLTF(model.id, model.url).then(() => updateProgress(model.id));
        tasks.push(task);
      }
    }
    
    // Load textures
    if (manifest.textures) {
      for (const tex of manifest.textures) {
        let task: Promise<any>;
        
        switch (tex.type) {
          case 'hdr':
            task = this.loadHDR(tex.id, tex.url);
            break;
          case 'exr':
            task = this.loadEXR(tex.id, tex.url);
            break;
          case 'cube':
            // Cube textures need 6 URLs, assume they're encoded in the URL somehow
            // or this is handled separately
            task = Promise.resolve();
            break;
          default:
            task = this.loadTexture(tex.id, tex.url);
        }
        
        tasks.push(task.then(() => updateProgress(tex.id)));
      }
    }
    
    // Load audio
    if (manifest.audio) {
      for (const audio of manifest.audio) {
        tasks.push(
          this.loadAudio(audio.id, audio.url).then(() => updateProgress(audio.id))
        );
      }
    }
    
    // Load data
    if (manifest.data) {
      for (const data of manifest.data) {
        tasks.push(
          this.loadJSON(data.id, data.url).then(() => updateProgress(data.id))
        );
      }
    }
    
    await Promise.all(tasks);
  }

  // ============================================================================
  // CACHE MANAGEMENT
  // ============================================================================

  public getModel(id: string): GLTF | THREE.Group | undefined {
    return this.modelCache.get(id);
  }

  public getTexture(id: string): THREE.Texture | undefined {
    return this.textureCache.get(id);
  }

  public getAudio(id: string): AudioBuffer | undefined {
    return this.audioCache.get(id);
  }

  public getData<T = any>(id: string): T | undefined {
    return this.dataCache.get(id) as T | undefined;
  }

  public hasModel(id: string): boolean {
    return this.modelCache.has(id);
  }

  public hasTexture(id: string): boolean {
    return this.textureCache.has(id);
  }

  public hasAudio(id: string): boolean {
    return this.audioCache.has(id);
  }

  public hasData(id: string): boolean {
    return this.dataCache.has(id);
  }

  public clearCache(type?: 'models' | 'textures' | 'audio' | 'data'): void {
    if (!type || type === 'models') {
      this.modelCache.clear();
    }
    if (!type || type === 'textures') {
      this.textureCache.forEach(tex => tex.dispose());
      this.textureCache.clear();
    }
    if (!type || type === 'audio') {
      this.audioCache.clear();
    }
    if (!type || type === 'data') {
      this.dataCache.clear();
    }
  }

  // ============================================================================
  // PROCEDURAL GENERATION HELPERS
  // ============================================================================

  public createCheckerboardTexture(
    size: number = 512,
    divisions: number = 8,
    color1: number = 0xffffff,
    color2: number = 0x000000
  ): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    
    const ctx = canvas.getContext('2d')!;
    const cellSize = size / divisions;
    
    const c1 = new THREE.Color(color1);
    const c2 = new THREE.Color(color2);
    
    for (let y = 0; y < divisions; y++) {
      for (let x = 0; x < divisions; x++) {
        const color = (x + y) % 2 === 0 ? c1 : c2;
        ctx.fillStyle = `#${color.getHexString()}`;
        ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
      }
    }
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    
    return texture;
  }

  public createNoiseTexture(size: number = 256): THREE.DataTexture {
    const data = new Uint8Array(size * size * 4);
    
    for (let i = 0; i < size * size; i++) {
      const value = Math.random() * 255;
      data[i * 4] = value;
      data[i * 4 + 1] = value;
      data[i * 4 + 2] = value;
      data[i * 4 + 3] = 255;
    }
    
    const texture = new THREE.DataTexture(data, size, size);
    texture.needsUpdate = true;
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    
    return texture;
  }

  public createGradientTexture(
    size: number = 256,
    color1: number = 0x000000,
    color2: number = 0xffffff,
    vertical: boolean = true
  ): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = vertical ? 1 : size;
    canvas.height = vertical ? size : 1;
    
    const ctx = canvas.getContext('2d')!;
    const gradient = vertical
      ? ctx.createLinearGradient(0, 0, 0, size)
      : ctx.createLinearGradient(0, 0, size, 0);
    
    const c1 = new THREE.Color(color1);
    const c2 = new THREE.Color(color2);
    
    gradient.addColorStop(0, `#${c1.getHexString()}`);
    gradient.addColorStop(1, `#${c2.getHexString()}`);
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    return new THREE.CanvasTexture(canvas);
  }

  // ============================================================================
  // CLEANUP
  // ============================================================================

  public dispose(): void {
    this.clearCache();
    this.dracoLoader.dispose();
    this.progressCallbacks.clear();
    
    console.log('[AssetLoader] Disposed');
  }
}

export default AssetLoader;
