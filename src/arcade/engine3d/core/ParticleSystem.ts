/**
 * ┌─────────────────────────────────────────────────────────────────────────────┐
 * │ LUCY ARCADE — PARTICLE SYSTEM                                              │
 * │                                                                             │
 * │ GPU-accelerated particle effects for explosions, trails, weather           │
 * │ Supports emitters, forces, and custom shaders                              │
 * └─────────────────────────────────────────────────────────────────────────────┘
 */

import * as THREE from 'three';

export interface ParticleConfig {
  // Emission
  maxParticles?: number;
  emissionRate?: number;
  emissionBurst?: number;
  duration?: number;
  loop?: boolean;
  
  // Lifetime
  lifetime?: number;
  lifetimeVariance?: number;
  
  // Position
  position?: THREE.Vector3;
  positionVariance?: THREE.Vector3;
  emitterShape?: 'point' | 'sphere' | 'box' | 'cone' | 'ring';
  emitterRadius?: number;
  emitterSize?: THREE.Vector3;
  emitterAngle?: number;
  
  // Velocity
  velocity?: THREE.Vector3;
  velocityVariance?: THREE.Vector3;
  speed?: number;
  speedVariance?: number;
  
  // Acceleration
  gravity?: THREE.Vector3;
  drag?: number;
  
  // Size
  startSize?: number;
  startSizeVariance?: number;
  endSize?: number;
  endSizeVariance?: number;
  
  // Color
  startColor?: THREE.Color;
  startColorVariance?: THREE.Color;
  endColor?: THREE.Color;
  endColorVariance?: THREE.Color;
  
  // Opacity
  startOpacity?: number;
  endOpacity?: number;
  
  // Rotation
  startRotation?: number;
  startRotationVariance?: number;
  rotationSpeed?: number;
  rotationSpeedVariance?: number;
  
  // Texture
  texture?: THREE.Texture;
  textureFrames?: { x: number; y: number };
  animateTexture?: boolean;
  
  // Blending
  blending?: THREE.Blending;
  depthWrite?: boolean;
  transparent?: boolean;
}

interface Particle {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  acceleration: THREE.Vector3;
  lifetime: number;
  age: number;
  startSize: number;
  endSize: number;
  startColor: THREE.Color;
  endColor: THREE.Color;
  startOpacity: number;
  endOpacity: number;
  rotation: number;
  rotationSpeed: number;
  textureFrame: number;
  alive: boolean;
}

const DEFAULT_CONFIG: ParticleConfig = {
  maxParticles: 1000,
  emissionRate: 100,
  emissionBurst: 0,
  duration: -1,
  loop: true,
  lifetime: 2,
  lifetimeVariance: 0.5,
  position: new THREE.Vector3(),
  positionVariance: new THREE.Vector3(0.1, 0.1, 0.1),
  emitterShape: 'point',
  emitterRadius: 1,
  emitterSize: new THREE.Vector3(1, 1, 1),
  emitterAngle: Math.PI / 4,
  velocity: new THREE.Vector3(0, 1, 0),
  velocityVariance: new THREE.Vector3(0.5, 0.5, 0.5),
  speed: 5,
  speedVariance: 1,
  gravity: new THREE.Vector3(0, -9.81, 0),
  drag: 0.1,
  startSize: 0.5,
  startSizeVariance: 0.1,
  endSize: 0.1,
  endSizeVariance: 0.05,
  startColor: new THREE.Color(1, 1, 1),
  startColorVariance: new THREE.Color(0, 0, 0),
  endColor: new THREE.Color(1, 1, 1),
  endColorVariance: new THREE.Color(0, 0, 0),
  startOpacity: 1,
  endOpacity: 0,
  startRotation: 0,
  startRotationVariance: Math.PI,
  rotationSpeed: 0,
  rotationSpeedVariance: 1,
  textureFrames: { x: 1, y: 1 },
  animateTexture: false,
  blending: THREE.AdditiveBlending,
  depthWrite: false,
  transparent: true,
};

// Particle vertex shader
const particleVertexShader = `
  attribute float size;
  attribute vec3 color;
  attribute float opacity;
  attribute float rotation;
  
  varying vec3 vColor;
  varying float vOpacity;
  varying float vRotation;
  
  void main() {
    vColor = color;
    vOpacity = opacity;
    vRotation = rotation;
    
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = size * (300.0 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;
  }
`;

// Particle fragment shader
const particleFragmentShader = `
  uniform sampler2D map;
  uniform bool useTexture;
  uniform vec2 textureFrames;
  
  varying vec3 vColor;
  varying float vOpacity;
  varying float vRotation;
  
  void main() {
    vec2 uv = gl_PointCoord;
    
    // Apply rotation
    float c = cos(vRotation);
    float s = sin(vRotation);
    uv = vec2(
      c * (uv.x - 0.5) + s * (uv.y - 0.5) + 0.5,
      -s * (uv.x - 0.5) + c * (uv.y - 0.5) + 0.5
    );
    
    vec4 texColor = vec4(1.0);
    
    if (useTexture) {
      texColor = texture2D(map, uv);
    } else {
      // Default circular particle
      float dist = length(uv - vec2(0.5));
      if (dist > 0.5) discard;
      texColor.a = 1.0 - smoothstep(0.3, 0.5, dist);
    }
    
    gl_FragColor = vec4(vColor, vOpacity) * texColor;
  }
`;

export class ParticleSystem {
  private config: ParticleConfig;
  private particles: Particle[] = [];
  private geometry: THREE.BufferGeometry;
  private material: THREE.ShaderMaterial;
  private points: THREE.Points;
  
  // Buffers
  private positions: Float32Array;
  private sizes: Float32Array;
  private colors: Float32Array;
  private opacities: Float32Array;
  private rotations: Float32Array;
  
  // State
  private emissionAccumulator: number = 0;
  private elapsed: number = 0;
  private isPlaying: boolean = false;
  private worldPosition: THREE.Vector3 = new THREE.Vector3();

  constructor(config: Partial<ParticleConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    
    const maxParticles = this.config.maxParticles!;
    
    // Initialize particles
    for (let i = 0; i < maxParticles; i++) {
      this.particles.push(this.createDeadParticle());
    }
    
    // Create buffers
    this.positions = new Float32Array(maxParticles * 3);
    this.sizes = new Float32Array(maxParticles);
    this.colors = new Float32Array(maxParticles * 3);
    this.opacities = new Float32Array(maxParticles);
    this.rotations = new Float32Array(maxParticles);
    
    // Create geometry
    this.geometry = new THREE.BufferGeometry();
    this.geometry.setAttribute('position', new THREE.BufferAttribute(this.positions, 3));
    this.geometry.setAttribute('size', new THREE.BufferAttribute(this.sizes, 1));
    this.geometry.setAttribute('color', new THREE.BufferAttribute(this.colors, 3));
    this.geometry.setAttribute('opacity', new THREE.BufferAttribute(this.opacities, 1));
    this.geometry.setAttribute('rotation', new THREE.BufferAttribute(this.rotations, 1));
    
    // Create material
    this.material = new THREE.ShaderMaterial({
      uniforms: {
        map: { value: this.config.texture || null },
        useTexture: { value: !!this.config.texture },
        textureFrames: { value: new THREE.Vector2(
          this.config.textureFrames!.x,
          this.config.textureFrames!.y
        )},
      },
      vertexShader: particleVertexShader,
      fragmentShader: particleFragmentShader,
      blending: this.config.blending!,
      depthWrite: this.config.depthWrite!,
      transparent: this.config.transparent!,
    });
    
    // Create points
    this.points = new THREE.Points(this.geometry, this.material);
    this.points.frustumCulled = false;
    
    if (this.config.position) {
      this.points.position.copy(this.config.position);
    }
  }

  private createDeadParticle(): Particle {
    return {
      position: new THREE.Vector3(),
      velocity: new THREE.Vector3(),
      acceleration: new THREE.Vector3(),
      lifetime: 0,
      age: 0,
      startSize: 0,
      endSize: 0,
      startColor: new THREE.Color(),
      endColor: new THREE.Color(),
      startOpacity: 0,
      endOpacity: 0,
      rotation: 0,
      rotationSpeed: 0,
      textureFrame: 0,
      alive: false,
    };
  }

  private variance(base: number, variance: number): number {
    return base + (Math.random() - 0.5) * 2 * variance;
  }

  private colorVariance(base: THREE.Color, variance: THREE.Color): THREE.Color {
    return new THREE.Color(
      Math.max(0, Math.min(1, base.r + (Math.random() - 0.5) * 2 * variance.r)),
      Math.max(0, Math.min(1, base.g + (Math.random() - 0.5) * 2 * variance.g)),
      Math.max(0, Math.min(1, base.b + (Math.random() - 0.5) * 2 * variance.b))
    );
  }

  private getEmissionPosition(): THREE.Vector3 {
    const pos = new THREE.Vector3();
    const cfg = this.config;
    
    switch (cfg.emitterShape) {
      case 'point':
        pos.set(0, 0, 0);
        break;
        
      case 'sphere': {
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        const r = Math.cbrt(Math.random()) * cfg.emitterRadius!;
        pos.set(
          r * Math.sin(phi) * Math.cos(theta),
          r * Math.sin(phi) * Math.sin(theta),
          r * Math.cos(phi)
        );
        break;
      }
      
      case 'box':
        pos.set(
          (Math.random() - 0.5) * cfg.emitterSize!.x,
          (Math.random() - 0.5) * cfg.emitterSize!.y,
          (Math.random() - 0.5) * cfg.emitterSize!.z
        );
        break;
        
      case 'cone': {
        const angle = Math.random() * Math.PI * 2;
        const r = Math.random() * cfg.emitterRadius!;
        const h = Math.random() * cfg.emitterSize!.y;
        const coneR = r * (h / cfg.emitterSize!.y) * Math.tan(cfg.emitterAngle!);
        pos.set(
          Math.cos(angle) * coneR,
          h,
          Math.sin(angle) * coneR
        );
        break;
      }
      
      case 'ring': {
        const ringAngle = Math.random() * Math.PI * 2;
        pos.set(
          Math.cos(ringAngle) * cfg.emitterRadius!,
          0,
          Math.sin(ringAngle) * cfg.emitterRadius!
        );
        break;
      }
    }
    
    // Add position variance
    pos.add(new THREE.Vector3(
      this.variance(0, cfg.positionVariance!.x),
      this.variance(0, cfg.positionVariance!.y),
      this.variance(0, cfg.positionVariance!.z)
    ));
    
    return pos;
  }

  private getEmissionVelocity(): THREE.Vector3 {
    const cfg = this.config;
    const vel = cfg.velocity!.clone();
    
    vel.add(new THREE.Vector3(
      this.variance(0, cfg.velocityVariance!.x),
      this.variance(0, cfg.velocityVariance!.y),
      this.variance(0, cfg.velocityVariance!.z)
    ));
    
    vel.normalize().multiplyScalar(this.variance(cfg.speed!, cfg.speedVariance!));
    
    return vel;
  }

  private emitParticle(): void {
    const cfg = this.config;
    
    // Find dead particle
    const particle = this.particles.find(p => !p.alive);
    if (!particle) return;
    
    particle.alive = true;
    particle.age = 0;
    particle.lifetime = this.variance(cfg.lifetime!, cfg.lifetimeVariance!);
    
    particle.position.copy(this.getEmissionPosition());
    particle.velocity.copy(this.getEmissionVelocity());
    particle.acceleration.copy(cfg.gravity!);
    
    particle.startSize = this.variance(cfg.startSize!, cfg.startSizeVariance!);
    particle.endSize = this.variance(cfg.endSize!, cfg.endSizeVariance!);
    
    particle.startColor = this.colorVariance(cfg.startColor!, cfg.startColorVariance!);
    particle.endColor = this.colorVariance(cfg.endColor!, cfg.endColorVariance!);
    
    particle.startOpacity = cfg.startOpacity!;
    particle.endOpacity = cfg.endOpacity!;
    
    particle.rotation = this.variance(cfg.startRotation!, cfg.startRotationVariance!);
    particle.rotationSpeed = this.variance(cfg.rotationSpeed!, cfg.rotationSpeedVariance!);
    
    particle.textureFrame = 0;
  }

  public update(deltaTime: number): void {
    if (!this.isPlaying) return;
    
    const cfg = this.config;
    this.elapsed += deltaTime;
    
    // Check duration
    if (cfg.duration! > 0 && this.elapsed >= cfg.duration!) {
      if (cfg.loop) {
        this.elapsed = 0;
      } else {
        this.isPlaying = false;
      }
    }
    
    // Emit particles
    if (this.isPlaying) {
      this.emissionAccumulator += deltaTime * cfg.emissionRate!;
      
      while (this.emissionAccumulator >= 1) {
        this.emitParticle();
        this.emissionAccumulator -= 1;
      }
    }
    
    // Update particles
    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];
      
      if (!p.alive) {
        this.sizes[i] = 0;
        continue;
      }
      
      p.age += deltaTime;
      
      if (p.age >= p.lifetime) {
        p.alive = false;
        this.sizes[i] = 0;
        continue;
      }
      
      const t = p.age / p.lifetime;
      
      // Physics
      p.velocity.add(p.acceleration.clone().multiplyScalar(deltaTime));
      p.velocity.multiplyScalar(1 - cfg.drag! * deltaTime);
      p.position.add(p.velocity.clone().multiplyScalar(deltaTime));
      
      // Rotation
      p.rotation += p.rotationSpeed * deltaTime;
      
      // Interpolate properties
      const size = THREE.MathUtils.lerp(p.startSize, p.endSize, t);
      const opacity = THREE.MathUtils.lerp(p.startOpacity, p.endOpacity, t);
      const color = p.startColor.clone().lerp(p.endColor, t);
      
      // Update buffers
      this.positions[i * 3] = p.position.x;
      this.positions[i * 3 + 1] = p.position.y;
      this.positions[i * 3 + 2] = p.position.z;
      
      this.sizes[i] = size;
      
      this.colors[i * 3] = color.r;
      this.colors[i * 3 + 1] = color.g;
      this.colors[i * 3 + 2] = color.b;
      
      this.opacities[i] = opacity;
      this.rotations[i] = p.rotation;
    }
    
    // Mark buffers for update
    this.geometry.attributes.position.needsUpdate = true;
    this.geometry.attributes.size.needsUpdate = true;
    this.geometry.attributes.color.needsUpdate = true;
    this.geometry.attributes.opacity.needsUpdate = true;
    this.geometry.attributes.rotation.needsUpdate = true;
  }

  // ============================================================================
  // CONTROL
  // ============================================================================

  public play(): void {
    this.isPlaying = true;
    this.elapsed = 0;
  }

  public stop(): void {
    this.isPlaying = false;
  }

  public pause(): void {
    this.isPlaying = false;
  }

  public resume(): void {
    this.isPlaying = true;
  }

  public burst(count?: number): void {
    const burstCount = count ?? this.config.emissionBurst ?? 10;
    for (let i = 0; i < burstCount; i++) {
      this.emitParticle();
    }
  }

  public reset(): void {
    this.elapsed = 0;
    this.emissionAccumulator = 0;
    
    for (const p of this.particles) {
      p.alive = false;
    }
    
    this.sizes.fill(0);
    this.geometry.attributes.size.needsUpdate = true;
  }

  // ============================================================================
  // POSITION
  // ============================================================================

  public setPosition(position: THREE.Vector3): void {
    this.points.position.copy(position);
  }

  public getPosition(): THREE.Vector3 {
    return this.points.position.clone();
  }

  public setWorldPosition(position: THREE.Vector3): void {
    this.worldPosition.copy(position);
  }

  // ============================================================================
  // GETTERS
  // ============================================================================

  public getObject3D(): THREE.Points {
    return this.points;
  }

  public getAliveCount(): number {
    return this.particles.filter(p => p.alive).length;
  }

  public isActive(): boolean {
    return this.isPlaying || this.getAliveCount() > 0;
  }

  // ============================================================================
  // CLEANUP
  // ============================================================================

  public dispose(): void {
    this.geometry.dispose();
    this.material.dispose();
    
    if (this.config.texture) {
      this.config.texture.dispose();
    }
  }
}

// ============================================================================
// PRESET PARTICLE EFFECTS
// ============================================================================

export const ParticlePresets = {
  explosion: (): Partial<ParticleConfig> => ({
    maxParticles: 500,
    emissionRate: 0,
    emissionBurst: 200,
    duration: 0.5,
    loop: false,
    lifetime: 1,
    lifetimeVariance: 0.3,
    emitterShape: 'sphere',
    emitterRadius: 0.5,
    speed: 15,
    speedVariance: 5,
    gravity: new THREE.Vector3(0, -5, 0),
    drag: 2,
    startSize: 1,
    endSize: 0.1,
    startColor: new THREE.Color(1, 0.8, 0.2),
    endColor: new THREE.Color(1, 0.2, 0),
    startOpacity: 1,
    endOpacity: 0,
    blending: THREE.AdditiveBlending,
  }),
  
  fire: (): Partial<ParticleConfig> => ({
    maxParticles: 300,
    emissionRate: 100,
    lifetime: 1.5,
    lifetimeVariance: 0.5,
    emitterShape: 'cone',
    emitterRadius: 0.5,
    emitterAngle: Math.PI / 8,
    velocity: new THREE.Vector3(0, 3, 0),
    velocityVariance: new THREE.Vector3(0.5, 0.5, 0.5),
    speed: 3,
    speedVariance: 1,
    gravity: new THREE.Vector3(0, 2, 0),
    drag: 0.5,
    startSize: 0.8,
    endSize: 0.1,
    startColor: new THREE.Color(1, 0.6, 0),
    endColor: new THREE.Color(1, 0, 0),
    startOpacity: 1,
    endOpacity: 0,
    blending: THREE.AdditiveBlending,
  }),
  
  smoke: (): Partial<ParticleConfig> => ({
    maxParticles: 200,
    emissionRate: 30,
    lifetime: 4,
    lifetimeVariance: 1,
    emitterShape: 'sphere',
    emitterRadius: 0.3,
    velocity: new THREE.Vector3(0, 1, 0),
    velocityVariance: new THREE.Vector3(0.3, 0.2, 0.3),
    speed: 1,
    speedVariance: 0.5,
    gravity: new THREE.Vector3(0, 0.5, 0),
    drag: 0.3,
    startSize: 0.5,
    endSize: 3,
    startColor: new THREE.Color(0.3, 0.3, 0.3),
    endColor: new THREE.Color(0.1, 0.1, 0.1),
    startOpacity: 0.8,
    endOpacity: 0,
    blending: THREE.NormalBlending,
  }),
  
  sparks: (): Partial<ParticleConfig> => ({
    maxParticles: 100,
    emissionRate: 50,
    lifetime: 0.5,
    lifetimeVariance: 0.2,
    emitterShape: 'point',
    velocity: new THREE.Vector3(0, 2, 0),
    velocityVariance: new THREE.Vector3(2, 2, 2),
    speed: 8,
    speedVariance: 3,
    gravity: new THREE.Vector3(0, -15, 0),
    drag: 0.1,
    startSize: 0.15,
    endSize: 0.05,
    startColor: new THREE.Color(1, 0.9, 0.5),
    endColor: new THREE.Color(1, 0.5, 0),
    startOpacity: 1,
    endOpacity: 0,
    blending: THREE.AdditiveBlending,
  }),
  
  rain: (): Partial<ParticleConfig> => ({
    maxParticles: 2000,
    emissionRate: 500,
    lifetime: 2,
    lifetimeVariance: 0.5,
    emitterShape: 'box',
    emitterSize: new THREE.Vector3(50, 1, 50),
    velocity: new THREE.Vector3(0, -1, 0),
    velocityVariance: new THREE.Vector3(0.1, 0, 0.1),
    speed: 20,
    speedVariance: 5,
    gravity: new THREE.Vector3(0, 0, 0),
    drag: 0,
    startSize: 0.05,
    endSize: 0.05,
    startColor: new THREE.Color(0.7, 0.8, 1),
    endColor: new THREE.Color(0.7, 0.8, 1),
    startOpacity: 0.6,
    endOpacity: 0.3,
    blending: THREE.NormalBlending,
  }),
  
  snow: (): Partial<ParticleConfig> => ({
    maxParticles: 1000,
    emissionRate: 100,
    lifetime: 8,
    lifetimeVariance: 2,
    emitterShape: 'box',
    emitterSize: new THREE.Vector3(50, 1, 50),
    velocity: new THREE.Vector3(0, -1, 0),
    velocityVariance: new THREE.Vector3(0.5, 0.1, 0.5),
    speed: 2,
    speedVariance: 1,
    gravity: new THREE.Vector3(0, 0, 0),
    drag: 0.5,
    startSize: 0.1,
    endSize: 0.1,
    startColor: new THREE.Color(1, 1, 1),
    endColor: new THREE.Color(1, 1, 1),
    startOpacity: 0.8,
    endOpacity: 0.5,
    rotationSpeed: 1,
    rotationSpeedVariance: 2,
    blending: THREE.NormalBlending,
  }),
  
  muzzleFlash: (): Partial<ParticleConfig> => ({
    maxParticles: 50,
    emissionRate: 0,
    emissionBurst: 30,
    duration: 0.05,
    loop: false,
    lifetime: 0.1,
    lifetimeVariance: 0.02,
    emitterShape: 'cone',
    emitterRadius: 0.1,
    emitterAngle: Math.PI / 6,
    speed: 20,
    speedVariance: 5,
    gravity: new THREE.Vector3(0, 0, 0),
    drag: 5,
    startSize: 0.3,
    endSize: 0.1,
    startColor: new THREE.Color(1, 1, 0.8),
    endColor: new THREE.Color(1, 0.5, 0),
    startOpacity: 1,
    endOpacity: 0,
    blending: THREE.AdditiveBlending,
  }),
  
  dust: (): Partial<ParticleConfig> => ({
    maxParticles: 100,
    emissionRate: 20,
    lifetime: 3,
    lifetimeVariance: 1,
    emitterShape: 'sphere',
    emitterRadius: 0.5,
    velocity: new THREE.Vector3(0, 0.5, 0),
    velocityVariance: new THREE.Vector3(0.5, 0.2, 0.5),
    speed: 0.5,
    speedVariance: 0.3,
    gravity: new THREE.Vector3(0, 0.1, 0),
    drag: 0.5,
    startSize: 0.2,
    endSize: 0.5,
    startColor: new THREE.Color(0.6, 0.5, 0.4),
    endColor: new THREE.Color(0.4, 0.35, 0.3),
    startOpacity: 0.5,
    endOpacity: 0,
    blending: THREE.NormalBlending,
  }),
  
  trail: (): Partial<ParticleConfig> => ({
    maxParticles: 200,
    emissionRate: 100,
    lifetime: 0.5,
    lifetimeVariance: 0.1,
    emitterShape: 'point',
    velocity: new THREE.Vector3(0, 0, 0),
    velocityVariance: new THREE.Vector3(0.1, 0.1, 0.1),
    speed: 0.5,
    speedVariance: 0.2,
    gravity: new THREE.Vector3(0, 0, 0),
    drag: 2,
    startSize: 0.3,
    endSize: 0.05,
    startColor: new THREE.Color(0.5, 0.8, 1),
    endColor: new THREE.Color(0.2, 0.4, 1),
    startOpacity: 1,
    endOpacity: 0,
    blending: THREE.AdditiveBlending,
  }),
};

export default ParticleSystem;
