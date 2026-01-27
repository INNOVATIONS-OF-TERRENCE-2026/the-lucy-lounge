/**
 * ┌─────────────────────────────────────────────────────────────────────────────┐
 * │ LUCY ARCADE — TANK BATTLE                                                  │
 * │                                                                             │
 * │ AAA tank combat with destructible environments, realistic ballistics,      │
 * │ AI opponents with behavior trees, and multiplayer support                  │
 * └─────────────────────────────────────────────────────────────────────────────┘
 */

import * as THREE from 'three';
import {
  Game3DBase,
  type Game3DConfig,
  ThirdPersonCameraController,
  ParticlePresets,
  CollisionGroups,
  type PhysicsBody,
  type InputState,
} from '../../engine3d';
import { BehaviorTree, BehaviorTrees, AdaptiveDifficulty, type AIAgent } from '../../engine3d/core/AIBehaviorTree';

// ============================================================================
// TYPES
// ============================================================================

interface TankConfig {
  id: string;
  name: string;
  health: number;
  armor: number;
  speed: number;
  turnSpeed: number;
  turretSpeed: number;
  mainGunDamage: number;
  mainGunReload: number;
  mainGunVelocity: number;
  color: number;
}

interface Tank {
  config: TankConfig;
  mesh: THREE.Group;
  body: PhysicsBody;
  turretMesh: THREE.Mesh;
  barrelMesh: THREE.Mesh;
  
  // State
  health: number;
  position: THREE.Vector3;
  rotation: number;
  turretRotation: number;
  barrelElevation: number;
  velocity: THREE.Vector3;
  
  // Combat
  lastFireTime: number;
  isReloading: boolean;
  reloadProgress: number;
  
  // AI
  ai?: {
    agent: AIAgent;
    behaviorTree: BehaviorTree;
    difficulty: AdaptiveDifficulty;
  };
  
  team: 'player' | 'enemy';
  isDestroyed: boolean;
}

interface Projectile {
  mesh: THREE.Mesh;
  body: PhysicsBody;
  velocity: THREE.Vector3;
  damage: number;
  owner: Tank;
  lifetime: number;
}

interface Destructible {
  mesh: THREE.Mesh;
  body: PhysicsBody;
  health: number;
  debris: THREE.Mesh[];
}

// ============================================================================
// TANK CONFIGURATIONS
// ============================================================================

const TANKS: Record<string, TankConfig> = {
  light: {
    id: 'light',
    name: 'Scout',
    health: 100,
    armor: 20,
    speed: 15,
    turnSpeed: 2,
    turretSpeed: 3,
    mainGunDamage: 30,
    mainGunReload: 2,
    mainGunVelocity: 200,
    color: 0x4a7c4e,
  },
  medium: {
    id: 'medium',
    name: 'Warrior',
    health: 150,
    armor: 40,
    speed: 10,
    turnSpeed: 1.5,
    turretSpeed: 2,
    mainGunDamage: 50,
    mainGunReload: 3,
    mainGunVelocity: 180,
    color: 0x5c5c3d,
  },
  heavy: {
    id: 'heavy',
    name: 'Titan',
    health: 250,
    armor: 80,
    speed: 6,
    turnSpeed: 0.8,
    turretSpeed: 1,
    mainGunDamage: 100,
    mainGunReload: 5,
    mainGunVelocity: 150,
    color: 0x3d3d3d,
  },
};

// ============================================================================
// TANK BATTLE GAME
// ============================================================================

export class TankBattleGame extends Game3DBase {
  private cameraController!: ThirdPersonCameraController;
  
  // Tanks
  private playerTank!: Tank;
  private enemyTanks: Tank[] = [];
  private allTanks: Tank[] = [];
  
  // Projectiles
  private projectiles: Projectile[] = [];
  
  // Destructibles
  private destructibles: Destructible[] = [];
  
  // Terrain
  private terrainMeshes: THREE.Mesh[] = [];
  
  // Game state
  private playerKills: number = 0;
  private waveNumber: number = 0;
  private enemiesRemaining: number = 0;

  constructor(container: HTMLElement, config?: Game3DConfig) {
    super(container, {
      ...config,
      engineConfig: {
        shadows: true,
        shadowMapSize: 2048,
        bloom: true,
        bloomStrength: 0.6,
        bloomThreshold: 0.8,
        fog: { color: 0x8b7355, near: 50, far: 300 },
        ...config?.engineConfig,
      },
    });
  }

  protected async loadAssets(): Promise<void> {
    console.log('[TankBattle] Loading assets...');
  }

  protected initScene(): void {
    this.setupLighting();
    this.createTerrain();
    this.createDestructibles();
    this.createPlayerTank();
    this.spawnEnemyWave();
    
    this.cameraController = new ThirdPersonCameraController(this.engine.camera, {
      distance: 20,
      height: 10,
      minPitch: 0.1,
      maxPitch: 1.2,
    });
    
    this.createParticleSystem('explosion', ParticlePresets.explosion());
    this.createParticleSystem('smoke', ParticlePresets.smoke());
    this.createParticleSystem('sparks', ParticlePresets.sparks());
    this.createParticleSystem('muzzle', ParticlePresets.muzzleFlash());
    
    this.createGradientSkybox(0x87ceeb, 0xdeb887);
  }

  private setupLighting(): void {
    this.engine.addAmbientLight(0xffffff, 0.4);
    this.engine.addDirectionalLight(0xffffff, 1.0, new THREE.Vector3(50, 100, 30), true);
  }

  private createTerrain(): void {
    // Ground
    const groundGeo = new THREE.PlaneGeometry(200, 200, 50, 50);
    const groundMat = new THREE.MeshStandardMaterial({ color: 0x8b7355, roughness: 0.9 });
    
    // Add height variation
    const positions = groundGeo.attributes.position;
    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i);
      const y = positions.getY(i);
      positions.setZ(i, Math.sin(x * 0.1) * Math.cos(y * 0.1) * 2);
    }
    groundGeo.computeVertexNormals();
    
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    this.engine.add(ground);
    
    this.engine.physics.addTrimesh(ground);
  }

  private createDestructibles(): void {
    const positions = [
      [-20, 0, -20], [20, 0, -20], [-20, 0, 20], [20, 0, 20],
      [0, 0, -30], [0, 0, 30], [-30, 0, 0], [30, 0, 0],
    ];
    
    positions.forEach(([x, y, z]) => {
      this.createBuilding(new THREE.Vector3(x, y, z));
    });
  }

  private createBuilding(position: THREE.Vector3): void {
    const width = 4 + Math.random() * 4;
    const height = 5 + Math.random() * 10;
    const depth = 4 + Math.random() * 4;
    
    const geo = new THREE.BoxGeometry(width, height, depth);
    const mat = new THREE.MeshStandardMaterial({
      color: 0x888888,
      roughness: 0.8,
    });
    
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.copy(position);
    mesh.position.y = height / 2;
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    this.engine.add(mesh);
    
    const body = this.engine.physics.addBox(
      mesh,
      new THREE.Vector3(width, height, depth),
      'static'
    );
    
    this.destructibles.push({
      mesh,
      body,
      health: 100,
      debris: [],
    });
  }

  private createTankMesh(config: TankConfig): THREE.Group {
    const group = new THREE.Group();
    const mat = new THREE.MeshStandardMaterial({ color: config.color, roughness: 0.6, metalness: 0.4 });
    
    // Hull
    const hullGeo = new THREE.BoxGeometry(3, 1, 4);
    const hull = new THREE.Mesh(hullGeo, mat);
    hull.position.y = 0.5;
    hull.castShadow = true;
    group.add(hull);
    
    // Turret
    const turretGeo = new THREE.BoxGeometry(2, 0.8, 2);
    const turret = new THREE.Mesh(turretGeo, mat);
    turret.position.y = 1.4;
    turret.castShadow = true;
    turret.name = 'turret';
    group.add(turret);
    
    // Barrel
    const barrelGeo = new THREE.CylinderGeometry(0.1, 0.15, 3, 8);
    const barrel = new THREE.Mesh(barrelGeo, mat);
    barrel.rotation.x = Math.PI / 2;
    barrel.position.set(0, 1.4, 2);
    barrel.castShadow = true;
    barrel.name = 'barrel';
    group.add(barrel);
    
    // Tracks
    const trackGeo = new THREE.BoxGeometry(0.5, 0.5, 4.5);
    const trackMat = new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.9 });
    
    const leftTrack = new THREE.Mesh(trackGeo, trackMat);
    leftTrack.position.set(-1.5, 0.25, 0);
    group.add(leftTrack);
    
    const rightTrack = new THREE.Mesh(trackGeo, trackMat);
    rightTrack.position.set(1.5, 0.25, 0);
    group.add(rightTrack);
    
    return group;
  }

  private createTank(config: TankConfig, position: THREE.Vector3, team: 'player' | 'enemy'): Tank {
    const mesh = this.createTankMesh(config);
    mesh.position.copy(position);
    this.engine.add(mesh);
    
    const body = this.engine.physics.addBox(
      mesh,
      new THREE.Vector3(3, 1.5, 4),
      'dynamic',
      { mass: 5000, linearDamping: 0.9, angularDamping: 0.95 }
    );
    
    const turretMesh = mesh.getObjectByName('turret') as THREE.Mesh;
    const barrelMesh = mesh.getObjectByName('barrel') as THREE.Mesh;
    
    return {
      config,
      mesh,
      body,
      turretMesh,
      barrelMesh,
      health: config.health,
      position: position.clone(),
      rotation: 0,
      turretRotation: 0,
      barrelElevation: 0,
      velocity: new THREE.Vector3(),
      lastFireTime: 0,
      isReloading: false,
      reloadProgress: 0,
      team,
      isDestroyed: false,
    };
  }

  private createPlayerTank(): void {
    this.playerTank = this.createTank(TANKS.medium, new THREE.Vector3(0, 1, 50), 'player');
    this.allTanks.push(this.playerTank);
  }

  private spawnEnemyWave(): void {
    this.waveNumber++;
    const enemyCount = 2 + this.waveNumber;
    
    const spawnPositions = [
      new THREE.Vector3(-40, 1, -40),
      new THREE.Vector3(40, 1, -40),
      new THREE.Vector3(-40, 1, 40),
      new THREE.Vector3(40, 1, 40),
      new THREE.Vector3(0, 1, -50),
    ];
    
    for (let i = 0; i < enemyCount; i++) {
      const pos = spawnPositions[i % spawnPositions.length].clone();
      pos.x += (Math.random() - 0.5) * 20;
      pos.z += (Math.random() - 0.5) * 20;
      
      const configKey = ['light', 'medium', 'heavy'][Math.floor(Math.random() * 3)];
      const tank = this.createTank(TANKS[configKey], pos, 'enemy');
      
      // Setup AI
      tank.ai = {
        agent: this.createAIAgent(tank),
        behaviorTree: BehaviorTrees.tactical(),
        difficulty: new AdaptiveDifficulty('medium'),
      };
      
      this.enemyTanks.push(tank);
      this.allTanks.push(tank);
    }
    
    this.enemiesRemaining = enemyCount;
  }

  private createAIAgent(tank: Tank): AIAgent {
    return {
      id: tank.config.id,
      position: tank.position,
      rotation: new THREE.Euler(0, tank.rotation, 0),
      velocity: tank.velocity,
      health: tank.health,
      maxHealth: tank.config.health,
      target: this.playerTank?.position || null,
      enemy: null,
      state: 'idle',
      data: {},
      moveTo: (pos) => { tank.position.copy(pos); },
      lookAt: (pos) => {
        const dir = pos.clone().sub(tank.position);
        tank.turretRotation = Math.atan2(dir.x, dir.z);
      },
      stop: () => { tank.velocity.set(0, 0, 0); },
      attack: () => { this.fireTank(tank); },
      defend: () => {},
      reload: () => {},
      useAbility: () => {},
      canSee: (target) => {
        const dir = target.clone().sub(tank.position).normalize();
        const result = this.engine.physics.raycast(tank.position, dir, 100);
        return !result.hit || result.distance! > tank.position.distanceTo(target) - 1;
      },
      getDistanceTo: (target) => tank.position.distanceTo(target),
      isInRange: (target, range) => tank.position.distanceTo(target) <= range,
    };
  }

  protected update(deltaTime: number, input: InputState): void {
    this.updatePlayerTank(deltaTime, input);
    this.updateEnemyTanks(deltaTime);
    this.updateProjectiles(deltaTime);
    
    this.cameraController.setTarget(this.playerTank.mesh.position);
    this.cameraController.update(deltaTime, input);
    
    this.checkWaveCompletion();
    
    this.setScore({
      score: this.playerKills * 100,
      kills: this.playerKills,
    });
  }

  protected fixedUpdate(fixedDeltaTime: number): void {}

  private updatePlayerTank(deltaTime: number, input: InputState): void {
    const tank = this.playerTank;
    if (tank.isDestroyed) return;
    
    // Movement
    const moveForce = input.virtual.moveY * tank.config.speed * 100;
    const turnForce = -input.virtual.moveX * tank.config.turnSpeed;
    
    tank.rotation += turnForce * deltaTime;
    tank.mesh.rotation.y = tank.rotation;
    
    const forward = new THREE.Vector3(0, 0, 1).applyAxisAngle(new THREE.Vector3(0, 1, 0), tank.rotation);
    this.engine.physics.applyForce(tank.body, forward.multiplyScalar(moveForce));
    
    // Turret control
    tank.turretRotation -= input.virtual.lookX * tank.config.turretSpeed * deltaTime;
    tank.barrelElevation = THREE.MathUtils.clamp(
      tank.barrelElevation - input.virtual.lookY * deltaTime,
      -0.1,
      0.3
    );
    
    tank.turretMesh.rotation.y = tank.turretRotation - tank.rotation;
    tank.barrelMesh.rotation.x = Math.PI / 2 - tank.barrelElevation;
    tank.barrelMesh.position.z = 2 + Math.cos(tank.barrelElevation) * 0.5;
    tank.barrelMesh.position.y = 1.4 + Math.sin(tank.barrelElevation) * 0.5;
    
    // Firing
    if (input.virtual.firePressed) {
      this.fireTank(tank);
    }
    
    tank.position.copy(tank.mesh.position);
  }

  private updateEnemyTanks(deltaTime: number): void {
    this.enemyTanks.forEach(tank => {
      if (tank.isDestroyed || !tank.ai) return;
      
      tank.ai.agent.position = tank.position;
      tank.ai.agent.health = tank.health;
      tank.ai.agent.target = this.playerTank.position;
      
      tank.ai.behaviorTree.tick(tank.ai.agent, deltaTime, this.gameTime);
      
      // Simple movement towards player
      const toPlayer = this.playerTank.position.clone().sub(tank.position);
      const distance = toPlayer.length();
      
      if (distance > 20) {
        toPlayer.normalize();
        const targetRotation = Math.atan2(toPlayer.x, toPlayer.z);
        tank.rotation = THREE.MathUtils.lerp(tank.rotation, targetRotation, deltaTime * 2);
        tank.mesh.rotation.y = tank.rotation;
        
        const forward = new THREE.Vector3(0, 0, 1).applyAxisAngle(new THREE.Vector3(0, 1, 0), tank.rotation);
        this.engine.physics.applyForce(tank.body, forward.multiplyScalar(tank.config.speed * 50));
      }
      
      // Aim at player
      const aimDir = this.playerTank.position.clone().sub(tank.position);
      tank.turretRotation = Math.atan2(aimDir.x, aimDir.z);
      tank.turretMesh.rotation.y = tank.turretRotation - tank.rotation;
      
      // Fire if in range and can see
      if (distance < 50 && tank.ai.agent.canSee(this.playerTank.position)) {
        if (this.gameTime - tank.lastFireTime > tank.config.mainGunReload) {
          this.fireTank(tank);
        }
      }
      
      tank.position.copy(tank.mesh.position);
    });
  }

  private fireTank(tank: Tank): void {
    if (this.gameTime - tank.lastFireTime < tank.config.mainGunReload) return;
    
    tank.lastFireTime = this.gameTime;
    
    // Calculate barrel tip position
    const barrelTip = new THREE.Vector3(0, 0, 1.5);
    barrelTip.applyAxisAngle(new THREE.Vector3(1, 0, 0), -tank.barrelElevation);
    barrelTip.applyAxisAngle(new THREE.Vector3(0, 1, 0), tank.turretRotation);
    barrelTip.add(tank.mesh.position);
    barrelTip.y += 1.4;
    
    // Calculate direction
    const direction = new THREE.Vector3(0, 0, 1);
    direction.applyAxisAngle(new THREE.Vector3(1, 0, 0), -tank.barrelElevation);
    direction.applyAxisAngle(new THREE.Vector3(0, 1, 0), tank.turretRotation);
    
    // Create projectile
    const projGeo = new THREE.SphereGeometry(0.15, 8, 8);
    const projMat = new THREE.MeshBasicMaterial({ color: 0xffff00 });
    const projMesh = new THREE.Mesh(projGeo, projMat);
    projMesh.position.copy(barrelTip);
    this.engine.add(projMesh);
    
    const projBody = this.engine.physics.addSphere(projMesh, 0.15, 'dynamic', {
      ccd: true,
      gravityScale: 0.3,
    });
    
    const velocity = direction.multiplyScalar(tank.config.mainGunVelocity);
    this.engine.physics.setLinearVelocity(projBody, velocity);
    
    this.projectiles.push({
      mesh: projMesh,
      body: projBody,
      velocity,
      damage: tank.config.mainGunDamage,
      owner: tank,
      lifetime: 5,
    });
    
    // Muzzle flash
    const muzzle = this.getParticleSystem('muzzle');
    if (muzzle) {
      muzzle.setPosition(barrelTip);
      muzzle.burst(30);
    }
    
    // Recoil
    this.screenShake(0.3, 0.2);
  }

  private updateProjectiles(deltaTime: number): void {
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const proj = this.projectiles[i];
      proj.lifetime -= deltaTime;
      
      if (proj.lifetime <= 0 || proj.mesh.position.y < -10) {
        this.removeProjectile(i);
        continue;
      }
      
      // Check tank hits
      for (const tank of this.allTanks) {
        if (tank === proj.owner || tank.isDestroyed) continue;
        
        const dist = proj.mesh.position.distanceTo(tank.mesh.position);
        if (dist < 2) {
          this.hitTank(tank, proj.damage, proj.owner);
          this.removeProjectile(i);
          break;
        }
      }
      
      // Check destructible hits
      for (const dest of this.destructibles) {
        if (dest.health <= 0) continue;
        
        const dist = proj.mesh.position.distanceTo(dest.mesh.position);
        if (dist < 5) {
          this.hitDestructible(dest, proj.damage);
          this.removeProjectile(i);
          break;
        }
      }
    }
  }

  private hitTank(tank: Tank, damage: number, attacker: Tank): void {
    const actualDamage = Math.max(1, damage - tank.config.armor * 0.5);
    tank.health -= actualDamage;
    
    const sparks = this.getParticleSystem('sparks');
    if (sparks) {
      sparks.setPosition(tank.mesh.position);
      sparks.burst(20);
    }
    
    if (tank.health <= 0) {
      this.destroyTank(tank);
      if (attacker === this.playerTank) {
        this.playerKills++;
        this.addScore(100);
      }
    }
  }

  private destroyTank(tank: Tank): void {
    tank.isDestroyed = true;
    
    const explosion = this.getParticleSystem('explosion');
    if (explosion) {
      explosion.setPosition(tank.mesh.position);
      explosion.burst(100);
    }
    
    const smoke = this.getParticleSystem('smoke');
    if (smoke) {
      smoke.setPosition(tank.mesh.position);
      smoke.play();
    }
    
    this.screenShake(0.5, 0.3);
    
    if (tank.team === 'enemy') {
      this.enemiesRemaining--;
    } else {
      this.end(false);
    }
  }

  private hitDestructible(dest: Destructible, damage: number): void {
    dest.health -= damage;
    
    if (dest.health <= 0) {
      this.engine.remove(dest.mesh);
      this.engine.physics.removeBody(dest.body);
      
      const explosion = this.getParticleSystem('explosion');
      if (explosion) {
        explosion.setPosition(dest.mesh.position);
        explosion.burst(50);
      }
    }
  }

  private removeProjectile(index: number): void {
    const proj = this.projectiles[index];
    this.engine.remove(proj.mesh);
    this.engine.physics.removeBody(proj.body);
    this.projectiles.splice(index, 1);
  }

  private checkWaveCompletion(): void {
    if (this.enemiesRemaining <= 0) {
      setTimeout(() => this.spawnEnemyWave(), 3000);
    }
  }

  public getPlayerHealth(): number { return this.playerTank?.health ?? 0; }
  public getPlayerMaxHealth(): number { return this.playerTank?.config.health ?? 100; }
  public getWaveNumber(): number { return this.waveNumber; }
  public getEnemiesRemaining(): number { return this.enemiesRemaining; }
  public getReloadProgress(): number {
    const elapsed = this.gameTime - this.playerTank.lastFireTime;
    return Math.min(1, elapsed / this.playerTank.config.mainGunReload);
  }

  protected cleanup(): void {
    this.allTanks.forEach(tank => {
      this.engine.remove(tank.mesh);
      this.engine.physics.removeBody(tank.body);
    });
    this.projectiles.forEach((_, i) => this.removeProjectile(i));
    this.destructibles.forEach(d => {
      this.engine.remove(d.mesh);
      this.engine.physics.removeBody(d.body);
    });
  }
}

export default TankBattleGame;
