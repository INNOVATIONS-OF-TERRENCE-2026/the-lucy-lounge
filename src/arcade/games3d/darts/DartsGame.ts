/**
 * ┌─────────────────────────────────────────────────────────────────────────────┐
 * │ LUCY ARCADE — 3D DARTS                                                     │
 * │                                                                             │
 * │ Precision darts with realistic throwing physics, multiple game modes,      │
 * │ and competitive scoring                                                    │
 * └─────────────────────────────────────────────────────────────────────────────┘
 */

import * as THREE from 'three';
import {
  Game3DBase,
  type Game3DConfig,
  type InputState,
} from '../../engine3d';

interface Dart {
  mesh: THREE.Group;
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  isFlying: boolean;
  hasHit: boolean;
}

interface DartboardSegment {
  value: number;
  multiplier: number;
  color: string;
}

type GameMode = '501' | '301' | 'cricket' | 'around-the-clock';

export class DartsGame extends Game3DBase {
  // Darts
  private darts: Dart[] = [];
  private currentDartIndex: number = 0;
  private dartsPerTurn: number = 3;
  
  // Dartboard
  private dartboardMesh!: THREE.Group;
  private dartboardRadius: number = 0.225; // Standard dartboard radius
  
  // Aiming
  private aimX: number = 0;
  private aimY: number = 0;
  private power: number = 0;
  private isPowerCharging: boolean = false;
  private throwAngleX: number = 0;
  private throwAngleY: number = 0;
  
  // Game state
  private gameMode: GameMode = '501';
  private playerScore: number = 501;
  private opponentScore: number = 501;
  private isPlayerTurn: boolean = true;
  private turnScore: number = 0;
  private dartsThrown: number = 0;
  
  // Cricket tracking
  private cricketNumbers: number[] = [20, 19, 18, 17, 16, 15, 25]; // 25 = bullseye
  private playerCricket: Map<number, number> = new Map();
  private opponentCricket: Map<number, number> = new Map();

  constructor(container: HTMLElement, config?: Game3DConfig) {
    super(container, {
      ...config,
      engineConfig: {
        shadows: true,
        bloom: true,
        bloomStrength: 0.3,
        ...config?.engineConfig,
      },
    });
  }

  protected async loadAssets(): Promise<void> {}

  protected initScene(): void {
    this.setupLighting();
    this.createRoom();
    this.createDartboard();
    this.createDarts();
    
    this.engine.camera.position.set(0, 1.7, 2.5);
    this.engine.camera.lookAt(0, 1.7, 0);
    
    this.initializeGameMode();
  }

  private setupLighting(): void {
    this.engine.addAmbientLight(0xffffff, 0.3);
    this.engine.addSpotLight(0xffffff, 2, new THREE.Vector3(0, 2.5, 1), new THREE.Vector3(0, 1.7, 0), Math.PI / 6, 0.5, true);
    this.engine.addPointLight(0xffaa00, 0.3, new THREE.Vector3(-2, 2, 2), 10, 2);
  }

  private createRoom(): void {
    // Back wall
    const wallGeo = new THREE.PlaneGeometry(6, 4);
    const wallMat = new THREE.MeshStandardMaterial({ color: 0x2a2a2a, roughness: 0.9 });
    const wall = new THREE.Mesh(wallGeo, wallMat);
    wall.position.set(0, 2, -0.5);
    wall.receiveShadow = true;
    this.engine.add(wall);
    
    // Floor
    const floorGeo = new THREE.PlaneGeometry(6, 6);
    const floorMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.8 });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    this.engine.add(floor);
    
    // Throw line (oche)
    const ocheGeo = new THREE.PlaneGeometry(0.6, 0.02);
    const ocheMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const oche = new THREE.Mesh(ocheGeo, ocheMat);
    oche.rotation.x = -Math.PI / 2;
    oche.position.set(0, 0.01, 2.37); // Standard distance
    this.engine.add(oche);
  }

  private createDartboard(): void {
    this.dartboardMesh = new THREE.Group();
    
    // Board backing
    const backingGeo = new THREE.CylinderGeometry(0.25, 0.25, 0.04, 32);
    const backingMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a });
    const backing = new THREE.Mesh(backingGeo, backingMat);
    backing.rotation.x = Math.PI / 2;
    this.dartboardMesh.add(backing);
    
    // Create segments
    const segments = 20;
    const segmentAngle = (Math.PI * 2) / segments;
    const segmentOrder = [20, 1, 18, 4, 13, 6, 10, 15, 2, 17, 3, 19, 7, 16, 8, 11, 14, 9, 12, 5];
    
    // Ring radii (normalized to board radius)
    const rings = [
      { inner: 0, outer: 0.032, color: 0x00ff00, multiplier: 2, name: 'double-bull' },
      { inner: 0.032, outer: 0.08, color: 0xff0000, multiplier: 1, name: 'single-bull' },
      { inner: 0.08, outer: 0.47, color: null, multiplier: 1, name: 'single-inner' },
      { inner: 0.47, outer: 0.53, color: null, multiplier: 3, name: 'triple' },
      { inner: 0.53, outer: 0.89, color: null, multiplier: 1, name: 'single-outer' },
      { inner: 0.89, outer: 1.0, color: null, multiplier: 2, name: 'double' },
    ];
    
    // Create each segment
    for (let i = 0; i < segments; i++) {
      const startAngle = i * segmentAngle - segmentAngle / 2 - Math.PI / 2;
      const value = segmentOrder[i];
      const isBlack = i % 2 === 0;
      
      rings.forEach((ring, ringIndex) => {
        if (ringIndex < 2) return; // Bulls are separate
        
        const innerRadius = ring.inner * this.dartboardRadius;
        const outerRadius = ring.outer * this.dartboardRadius;
        
        let color: number;
        if (ring.multiplier === 3 || ring.multiplier === 2) {
          color = isBlack ? 0x00aa00 : 0xff0000;
        } else {
          color = isBlack ? 0x1a1a1a : 0xf5deb3;
        }
        
        const shape = new THREE.Shape();
        shape.moveTo(
          Math.cos(startAngle) * innerRadius,
          Math.sin(startAngle) * innerRadius
        );
        shape.lineTo(
          Math.cos(startAngle) * outerRadius,
          Math.sin(startAngle) * outerRadius
        );
        shape.absarc(0, 0, outerRadius, startAngle, startAngle + segmentAngle, false);
        shape.lineTo(
          Math.cos(startAngle + segmentAngle) * innerRadius,
          Math.sin(startAngle + segmentAngle) * innerRadius
        );
        shape.absarc(0, 0, innerRadius, startAngle + segmentAngle, startAngle, true);
        
        const segGeo = new THREE.ShapeGeometry(shape);
        const segMat = new THREE.MeshStandardMaterial({ color });
        const segment = new THREE.Mesh(segGeo, segMat);
        segment.position.z = 0.021;
        segment.userData = { value, multiplier: ring.multiplier };
        this.dartboardMesh.add(segment);
      });
    }
    
    // Bullseye rings
    const bullGeo = new THREE.CircleGeometry(0.032 * this.dartboardRadius, 32);
    const bullMat = new THREE.MeshStandardMaterial({ color: 0xff0000 });
    const bull = new THREE.Mesh(bullGeo, bullMat);
    bull.position.z = 0.022;
    bull.userData = { value: 50, multiplier: 1 };
    this.dartboardMesh.add(bull);
    
    const outerBullGeo = new THREE.RingGeometry(0.032 * this.dartboardRadius, 0.08 * this.dartboardRadius, 32);
    const outerBullMat = new THREE.MeshStandardMaterial({ color: 0x00aa00 });
    const outerBull = new THREE.Mesh(outerBullGeo, outerBullMat);
    outerBull.position.z = 0.021;
    outerBull.userData = { value: 25, multiplier: 1 };
    this.dartboardMesh.add(outerBull);
    
    // Wire frame
    const wireGeo = new THREE.TorusGeometry(this.dartboardRadius, 0.002, 4, 64);
    const wireMat = new THREE.MeshStandardMaterial({ color: 0xcccccc, metalness: 0.8 });
    const wire = new THREE.Mesh(wireGeo, wireMat);
    wire.position.z = 0.025;
    this.dartboardMesh.add(wire);
    
    this.dartboardMesh.position.set(0, 1.73, 0); // Standard height
    this.engine.add(this.dartboardMesh);
  }

  private createDarts(): void {
    for (let i = 0; i < this.dartsPerTurn; i++) {
      const dart = this.createDart();
      this.darts.push(dart);
    }
  }

  private createDart(): Dart {
    const dartGroup = new THREE.Group();
    
    // Barrel
    const barrelGeo = new THREE.CylinderGeometry(0.004, 0.006, 0.05, 8);
    const barrelMat = new THREE.MeshStandardMaterial({ color: 0xcccccc, metalness: 0.9 });
    const barrel = new THREE.Mesh(barrelGeo, barrelMat);
    barrel.rotation.x = Math.PI / 2;
    dartGroup.add(barrel);
    
    // Point
    const pointGeo = new THREE.ConeGeometry(0.002, 0.03, 8);
    const pointMat = new THREE.MeshStandardMaterial({ color: 0x888888, metalness: 0.9 });
    const point = new THREE.Mesh(pointGeo, pointMat);
    point.rotation.x = -Math.PI / 2;
    point.position.z = 0.04;
    dartGroup.add(point);
    
    // Flight
    const flightGeo = new THREE.PlaneGeometry(0.02, 0.015);
    const flightMat = new THREE.MeshStandardMaterial({ color: 0xff0000, side: THREE.DoubleSide });
    
    [0, Math.PI / 2].forEach(angle => {
      const flight = new THREE.Mesh(flightGeo, flightMat);
      flight.rotation.y = angle;
      flight.position.z = -0.04;
      dartGroup.add(flight);
    });
    
    dartGroup.visible = false;
    this.engine.add(dartGroup);
    
    return {
      mesh: dartGroup,
      position: new THREE.Vector3(),
      velocity: new THREE.Vector3(),
      isFlying: false,
      hasHit: false,
    };
  }

  private initializeGameMode(): void {
    switch (this.gameMode) {
      case '501':
        this.playerScore = 501;
        this.opponentScore = 501;
        break;
      case '301':
        this.playerScore = 301;
        this.opponentScore = 301;
        break;
      case 'cricket':
        this.cricketNumbers.forEach(n => {
          this.playerCricket.set(n, 0);
          this.opponentCricket.set(n, 0);
        });
        break;
    }
  }

  protected update(deltaTime: number, input: InputState): void {
    if (this.isPlayerTurn) {
      this.updateAiming(deltaTime, input);
    }
    
    this.updateDarts(deltaTime);
  }

  protected fixedUpdate(fixedDeltaTime: number): void {}

  private updateAiming(deltaTime: number, input: InputState): void {
    const currentDart = this.darts[this.currentDartIndex];
    if (!currentDart || currentDart.hasHit) return;
    
    // Aim adjustment
    this.aimX += input.virtual.lookX * deltaTime * 0.5;
    this.aimY += input.virtual.lookY * deltaTime * 0.5;
    
    this.aimX = THREE.MathUtils.clamp(this.aimX, -0.3, 0.3);
    this.aimY = THREE.MathUtils.clamp(this.aimY, -0.3, 0.3);
    
    // Throw angle adjustment
    this.throwAngleX += input.virtual.moveX * deltaTime * 0.3;
    this.throwAngleY += input.virtual.moveY * deltaTime * 0.3;
    
    this.throwAngleX = THREE.MathUtils.clamp(this.throwAngleX, -0.2, 0.2);
    this.throwAngleY = THREE.MathUtils.clamp(this.throwAngleY, -0.2, 0.2);
    
    // Power charging
    if (input.virtual.fire && !currentDart.isFlying) {
      this.isPowerCharging = true;
      this.power = Math.min(1, this.power + deltaTime * 2);
      
      // Show dart in hand
      currentDart.mesh.visible = true;
      currentDart.mesh.position.set(this.aimX, 1.5, 2.3);
      currentDart.mesh.lookAt(this.aimX, 1.73 + this.aimY, 0);
    } else if (this.isPowerCharging && !currentDart.isFlying) {
      this.throwDart(currentDart);
    }
  }

  private throwDart(dart: Dart): void {
    this.isPowerCharging = false;
    dart.isFlying = true;
    this.dartsThrown++;
    
    const speed = 8 + this.power * 12;
    
    // Calculate throw direction with aim and angle adjustments
    const direction = new THREE.Vector3(
      this.aimX + this.throwAngleX * 0.5,
      (1.73 + this.aimY) - 1.5 + this.throwAngleY * 0.5,
      -2.3
    ).normalize();
    
    dart.velocity.copy(direction.multiplyScalar(speed));
    dart.position.set(this.aimX, 1.5, 2.3);
    
    this.power = 0;
    this.throwAngleX = 0;
    this.throwAngleY = 0;
  }

  private updateDarts(deltaTime: number): void {
    this.darts.forEach(dart => {
      if (!dart.isFlying || dart.hasHit) return;
      
      // Apply gravity
      dart.velocity.y -= 3 * deltaTime;
      
      // Update position
      dart.position.addScaledVector(dart.velocity, deltaTime);
      dart.mesh.position.copy(dart.position);
      
      // Rotate to face velocity
      const lookTarget = dart.position.clone().add(dart.velocity);
      dart.mesh.lookAt(lookTarget);
      
      // Check board hit
      if (dart.position.z <= 0.03) {
        this.dartHit(dart);
      }
      
      // Check miss (out of bounds)
      if (dart.position.y < 0 || Math.abs(dart.position.x) > 1 || dart.position.z < -0.5) {
        dart.hasHit = true;
        dart.isFlying = false;
        dart.mesh.visible = false;
      }
    });
  }

  private dartHit(dart: Dart): void {
    dart.hasHit = true;
    dart.isFlying = false;
    dart.position.z = 0.03;
    dart.mesh.position.copy(dart.position);
    
    // Calculate score based on hit position
    const hitX = dart.position.x;
    const hitY = dart.position.y - 1.73;
    const distFromCenter = Math.sqrt(hitX * hitX + hitY * hitY);
    
    let score = 0;
    let multiplier = 1;
    
    if (distFromCenter <= 0.032 * this.dartboardRadius) {
      // Double bullseye
      score = 50;
    } else if (distFromCenter <= 0.08 * this.dartboardRadius) {
      // Single bullseye
      score = 25;
    } else if (distFromCenter <= this.dartboardRadius) {
      // Calculate segment
      const angle = Math.atan2(hitY, hitX) + Math.PI / 2;
      const normalizedAngle = ((angle + Math.PI * 2) % (Math.PI * 2));
      const segmentIndex = Math.floor(normalizedAngle / (Math.PI * 2 / 20));
      const segmentOrder = [20, 1, 18, 4, 13, 6, 10, 15, 2, 17, 3, 19, 7, 16, 8, 11, 14, 9, 12, 5];
      score = segmentOrder[segmentIndex % 20];
      
      // Check for double/triple
      const normalizedDist = distFromCenter / this.dartboardRadius;
      if (normalizedDist >= 0.89) {
        multiplier = 2; // Double
      } else if (normalizedDist >= 0.47 && normalizedDist <= 0.53) {
        multiplier = 3; // Triple
      }
    }
    
    const totalScore = score * multiplier;
    this.turnScore += totalScore;
    
    this.addScore(totalScore);
    
    // Check for turn end
    if (this.dartsThrown >= this.dartsPerTurn) {
      this.endTurn();
    } else {
      this.currentDartIndex++;
    }
  }

  private endTurn(): void {
    // Update game score based on mode
    if (this.gameMode === '501' || this.gameMode === '301') {
      if (this.isPlayerTurn) {
        const newScore = this.playerScore - this.turnScore;
        if (newScore === 0) {
          this.end(true);
          return;
        } else if (newScore > 0) {
          this.playerScore = newScore;
        }
        // Bust if negative - score doesn't change
      }
    }
    
    // Reset for next turn
    this.turnScore = 0;
    this.dartsThrown = 0;
    this.currentDartIndex = 0;
    this.isPlayerTurn = !this.isPlayerTurn;
    
    // Reset darts
    this.darts.forEach(dart => {
      dart.hasHit = false;
      dart.isFlying = false;
      dart.mesh.visible = false;
    });
    
    // AI turn
    if (!this.isPlayerTurn) {
      setTimeout(() => this.aiTurn(), 1000);
    }
  }

  private aiTurn(): void {
    // Simplified AI - just end turn after delay
    setTimeout(() => {
      this.turnScore = Math.floor(Math.random() * 60) + 20;
      if (this.gameMode === '501' || this.gameMode === '301') {
        this.opponentScore = Math.max(0, this.opponentScore - this.turnScore);
        if (this.opponentScore === 0) {
          this.end(false);
          return;
        }
      }
      this.endTurn();
    }, 2000);
  }

  public getPlayerScore(): number { return this.playerScore; }
  public getOpponentScore(): number { return this.opponentScore; }
  public getTurnScore(): number { return this.turnScore; }
  public getDartsRemaining(): number { return this.dartsPerTurn - this.dartsThrown; }
  public isCurrentlyPlayerTurn(): boolean { return this.isPlayerTurn; }
  public getPower(): number { return this.power; }
  public getAimX(): number { return this.aimX; }
  public getAimY(): number { return this.aimY; }
  public getGameMode(): GameMode { return this.gameMode; }

  protected cleanup(): void {
    this.darts.forEach(dart => this.engine.remove(dart.mesh));
    this.engine.remove(this.dartboardMesh);
  }
}

export default DartsGame;
