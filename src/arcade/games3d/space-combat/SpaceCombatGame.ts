/**
 * ┌─────────────────────────────────────────────────────────────────────────────┐
 * │ LUCY ARCADE — SPACE COMBAT                                                 │
 * │                                                                             │
 * │ AAA space shooter with 6DOF flight, energy weapons, shields,               │
 * │ AI wingmen and enemies, and epic space battles                             │
 * └─────────────────────────────────────────────────────────────────────────────┘
 */

import * as THREE from 'three';
import {
  Game3DBase,
  type Game3DConfig,
  ParticlePresets,
  type InputState,
} from '../../engine3d';

// ============================================================================
// TYPES
// ============================================================================

interface ShipConfig {
  id: string;
  name: string;
  hull: number;
  shields: number;
  shieldRecharge: number;
  speed: number;
  acceleration: number;
  turnRate: number;
  rollRate: number;
  weapons: WeaponConfig[];
  color: number;
  scale: number;
}

interface WeaponConfig {
  type: 'laser' | 'plasma' | 'missile';
  damage: number;
  fireRate: number;
  energy: number;
  speed: number;
  range: number;
}

interface Ship {
  config: ShipConfig;
  mesh: THREE.Group;
  
  // State
  position: THREE.Vector3;
  rotation: THREE.Quaternion;
  velocity: THREE.Vector3;
  angularVelocity: THREE.Vector3;
  
  // Combat
  hull: number;
  shields: number;
  energy: number;
  maxEnergy: number;
  lastFireTime: number[];
  
  // AI
  isAI: boolean;
  target: Ship | null;
  state: 'idle' | 'patrol' | 'attack' | 'evade' | 'dead';
  
  team: 'player' | 'ally' | 'enemy';
}

interface Projectile {
  mesh: THREE.Mesh;
  velocity: THREE.Vector3;
  damage: number;
  owner: Ship;
  lifetime: number;
  type: 'laser' | 'plasma' | 'missile';
  target?: Ship;
}

// ============================================================================
// SHIP CONFIGURATIONS
// ============================================================================

const SHIPS: Record<string, ShipConfig> = {
  fighter: {
    id: 'fighter',
    name: 'Viper',
    hull: 100,
    shields: 50,
    shieldRecharge: 5,
    speed: 100,
    acceleration: 50,
    turnRate: 2,
    rollRate: 3,
    weapons: [
      { type: 'laser', damage: 10, fireRate: 8, energy: 2, speed: 500, range: 500 },
    ],
    color: 0x4488ff,
    scale: 1,
  },
  interceptor: {
    id: 'interceptor',
    name: 'Phantom',
    hull: 60,
    shields: 30,
    shieldRecharge: 8,
    speed: 150,
    acceleration: 80,
    turnRate: 3,
    rollRate: 4,
    weapons: [
      { type: 'laser', damage: 8, fireRate: 12, energy: 1, speed: 600, range: 400 },
    ],
    color: 0x44ff88,
    scale: 0.8,
  },
  bomber: {
    id: 'bomber',
    name: 'Devastator',
    hull: 200,
    shields: 100,
    shieldRecharge: 3,
    speed: 60,
    acceleration: 25,
    turnRate: 1,
    rollRate: 1.5,
    weapons: [
      { type: 'plasma', damage: 30, fireRate: 2, energy: 10, speed: 300, range: 600 },
      { type: 'missile', damage: 100, fireRate: 0.5, energy: 25, speed: 200, range: 1000 },
    ],
    color: 0xff4444,
    scale: 1.5,
  },
};

// ============================================================================
// SPACE COMBAT GAME
// ============================================================================

export class SpaceCombatGame extends Game3DBase {
  // Ships
  private playerShip!: Ship;
  private allShips: Ship[] = [];
  
  // Projectiles
  private projectiles: Projectile[] = [];
  
  // Environment
  private asteroids: THREE.Mesh[] = [];
  private stars: THREE.Points | null = null;
  
  // Game state
  private kills: number = 0;
  private waveNumber: number = 0;
  private enemiesRemaining: number = 0;

  constructor(container: HTMLElement, config?: Game3DConfig) {
    super(container, {
      ...config,
      engineConfig: {
        shadows: false, // Space doesn't need shadows
        bloom: true,
        bloomStrength: 1.2,
        bloomThreshold: 0.6,
        backgroundColor: 0x000011,
        ...config?.engineConfig,
      },
    });
  }

  protected async loadAssets(): Promise<void> {
    console.log('[SpaceCombat] Loading...');
  }

  protected initScene(): void {
    this.setupLighting();
    this.createStarfield();
    this.createAsteroids();
    this.createPlayerShip();
    this.spawnEnemyWave();
    
    this.createParticleSystem('laser_hit', {
      ...ParticlePresets.sparks(),
      startColor: new THREE.Color(0x00ffff),
      endColor: new THREE.Color(0x0066ff),
    });
    this.createParticleSystem('explosion', ParticlePresets.explosion());
    this.createParticleSystem('engine', {
      ...ParticlePresets.trail(),
      startColor: new THREE.Color(0x00aaff),
      endColor: new THREE.Color(0x0044aa),
    });
  }

  private setupLighting(): void {
    this.engine.addAmbientLight(0x222244, 0.3);
    this.engine.addDirectionalLight(0xffffee, 1.0, new THREE.Vector3(100, 50, 100), false);
    this.engine.addPointLight(0x4488ff, 0.5, new THREE.Vector3(0, 0, 0), 500, 2);
  }

  private createStarfield(): void {
    const starCount = 5000;
    const positions = new Float32Array(starCount * 3);
    const colors = new Float32Array(starCount * 3);
    
    for (let i = 0; i < starCount; i++) {
      const i3 = i * 3;
      const radius = 500 + Math.random() * 1500;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      
      positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i3 + 2] = radius * Math.cos(phi);
      
      const brightness = 0.5 + Math.random() * 0.5;
      colors[i3] = brightness;
      colors[i3 + 1] = brightness;
      colors[i3 + 2] = brightness;
    }
    
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    
    const material = new THREE.PointsMaterial({
      size: 2,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
    });
    
    this.stars = new THREE.Points(geometry, material);
    this.engine.add(this.stars);
  }

  private createAsteroids(): void {
    const asteroidMat = new THREE.MeshStandardMaterial({
      color: 0x666666,
      roughness: 0.9,
    });
    
    for (let i = 0; i < 50; i++) {
      const size = 2 + Math.random() * 10;
      const geo = new THREE.IcosahedronGeometry(size, 1);
      
      // Deform vertices for irregular shape
      const positions = geo.attributes.position;
      for (let j = 0; j < positions.count; j++) {
        const x = positions.getX(j);
        const y = positions.getY(j);
        const z = positions.getZ(j);
        const noise = 0.7 + Math.random() * 0.6;
        positions.setXYZ(j, x * noise, y * noise, z * noise);
      }
      geo.computeVertexNormals();
      
      const asteroid = new THREE.Mesh(geo, asteroidMat);
      asteroid.position.set(
        (Math.random() - 0.5) * 400,
        (Math.random() - 0.5) * 200,
        (Math.random() - 0.5) * 400
      );
      asteroid.rotation.set(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI
      );
      
      this.engine.add(asteroid);
      this.asteroids.push(asteroid);
    }
  }

  private createShipMesh(config: ShipConfig): THREE.Group {
    const group = new THREE.Group();
    const mat = new THREE.MeshStandardMaterial({
      color: config.color,
      roughness: 0.3,
      metalness: 0.7,
      emissive: config.color,
      emissiveIntensity: 0.2,
    });
    
    // Fuselage
    const bodyGeo = new THREE.ConeGeometry(0.5 * config.scale, 3 * config.scale, 6);
    const body = new THREE.Mesh(bodyGeo, mat);
    body.rotation.x = Math.PI / 2;
    group.add(body);
    
    // Wings
    const wingGeo = new THREE.BoxGeometry(3 * config.scale, 0.1 * config.scale, 1 * config.scale);
    const wings = new THREE.Mesh(wingGeo, mat);
    wings.position.z = -0.5 * config.scale;
    group.add(wings);
    
    // Cockpit
    const cockpitGeo = new THREE.SphereGeometry(0.3 * config.scale, 8, 8);
    const cockpitMat = new THREE.MeshStandardMaterial({
      color: 0x88ccff,
      roughness: 0.1,
      metalness: 0.9,
    });
    const cockpit = new THREE.Mesh(cockpitGeo, cockpitMat);
    cockpit.position.y = 0.2 * config.scale;
    cockpit.position.z = 0.5 * config.scale;
    group.add(cockpit);
    
    // Engine glow
    const engineGeo = new THREE.SphereGeometry(0.2 * config.scale, 8, 8);
    const engineMat = new THREE.MeshBasicMaterial({ color: 0x00aaff });
    const engine = new THREE.Mesh(engineGeo, engineMat);
    engine.position.z = -1.5 * config.scale;
    engine.name = 'engine';
    group.add(engine);
    
    return group;
  }

  private createShip(config: ShipConfig, position: THREE.Vector3, team: Ship['team']): Ship {
    const mesh = this.createShipMesh(config);
    mesh.position.copy(position);
    this.engine.add(mesh);
    
    return {
      config,
      mesh,
      position: position.clone(),
      rotation: new THREE.Quaternion(),
      velocity: new THREE.Vector3(),
      angularVelocity: new THREE.Vector3(),
      hull: config.hull,
      shields: config.shields,
      energy: 100,
      maxEnergy: 100,
      lastFireTime: config.weapons.map(() => 0),
      isAI: team !== 'player',
      target: null,
      state: 'idle',
      team,
    };
  }

  private createPlayerShip(): void {
    this.playerShip = this.createShip(SHIPS.fighter, new THREE.Vector3(0, 0, 0), 'player');
    this.allShips.push(this.playerShip);
  }

  private spawnEnemyWave(): void {
    this.waveNumber++;
    const count = 3 + this.waveNumber * 2;
    
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const radius = 100 + Math.random() * 50;
      const pos = new THREE.Vector3(
        Math.cos(angle) * radius,
        (Math.random() - 0.5) * 50,
        Math.sin(angle) * radius
      );
      
      const configKey = ['fighter', 'interceptor', 'bomber'][Math.floor(Math.random() * 3)];
      const ship = this.createShip(SHIPS[configKey], pos, 'enemy');
      ship.target = this.playerShip;
      ship.state = 'attack';
      
      this.allShips.push(ship);
    }
    
    this.enemiesRemaining = count;
  }

  protected update(deltaTime: number, input: InputState): void {
    this.updatePlayerShip(deltaTime, input);
    this.updateAIShips(deltaTime);
    this.updateProjectiles(deltaTime);
    this.updateCamera();
    
    // Regenerate shields and energy
    this.allShips.forEach(ship => {
      if (ship.state !== 'dead') {
        ship.shields = Math.min(ship.config.shields, ship.shields + ship.config.shieldRecharge * deltaTime);
        ship.energy = Math.min(ship.maxEnergy, ship.energy + 20 * deltaTime);
      }
    });
    
    this.checkWaveCompletion();
    
    this.setScore({ score: this.kills * 100, kills: this.kills });
  }

  protected fixedUpdate(fixedDeltaTime: number): void {}

  private updatePlayerShip(deltaTime: number, input: InputState): void {
    const ship = this.playerShip;
    if (ship.state === 'dead') return;
    
    // 6DOF Flight controls
    const pitch = input.virtual.lookY * ship.config.turnRate * deltaTime;
    const yaw = -input.virtual.lookX * ship.config.turnRate * deltaTime;
    const roll = input.virtual.moveX * ship.config.rollRate * deltaTime;
    
    // Apply rotation
    const pitchQ = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), pitch);
    const yawQ = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), yaw);
    const rollQ = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), roll);
    
    ship.rotation.multiply(pitchQ).multiply(yawQ).multiply(rollQ);
    ship.mesh.quaternion.copy(ship.rotation);
    
    // Thrust
    const forward = new THREE.Vector3(0, 0, 1).applyQuaternion(ship.rotation);
    const thrust = input.virtual.moveY * ship.config.acceleration * deltaTime;
    ship.velocity.addScaledVector(forward, thrust);
    
    // Drag
    ship.velocity.multiplyScalar(0.99);
    
    // Clamp speed
    if (ship.velocity.length() > ship.config.speed) {
      ship.velocity.normalize().multiplyScalar(ship.config.speed);
    }
    
    // Apply velocity
    ship.position.addScaledVector(ship.velocity, deltaTime);
    ship.mesh.position.copy(ship.position);
    
    // Firing
    if (input.virtual.fire) {
      this.fireWeapon(ship, 0);
    }
  }

  private updateAIShips(deltaTime: number): void {
    this.allShips.forEach(ship => {
      if (!ship.isAI || ship.state === 'dead') return;
      
      if (!ship.target || ship.target.state === 'dead') {
        ship.target = this.playerShip;
      }
      
      const toTarget = ship.target.position.clone().sub(ship.position);
      const distance = toTarget.length();
      toTarget.normalize();
      
      // Turn towards target
      const targetQuat = new THREE.Quaternion().setFromUnitVectors(
        new THREE.Vector3(0, 0, 1),
        toTarget
      );
      ship.rotation.slerp(targetQuat, deltaTime * ship.config.turnRate);
      ship.mesh.quaternion.copy(ship.rotation);
      
      // Move
      const forward = new THREE.Vector3(0, 0, 1).applyQuaternion(ship.rotation);
      
      if (distance > 50) {
        ship.velocity.addScaledVector(forward, ship.config.acceleration * deltaTime);
      } else if (distance < 20) {
        ship.velocity.addScaledVector(forward, -ship.config.acceleration * deltaTime * 0.5);
      }
      
      ship.velocity.multiplyScalar(0.99);
      if (ship.velocity.length() > ship.config.speed) {
        ship.velocity.normalize().multiplyScalar(ship.config.speed);
      }
      
      ship.position.addScaledVector(ship.velocity, deltaTime);
      ship.mesh.position.copy(ship.position);
      
      // Fire
      if (distance < 200) {
        this.fireWeapon(ship, 0);
      }
    });
  }

  private fireWeapon(ship: Ship, weaponIndex: number): void {
    const weapon = ship.config.weapons[weaponIndex];
    if (!weapon) return;
    
    const timeSinceFire = this.gameTime - ship.lastFireTime[weaponIndex];
    if (timeSinceFire < 1 / weapon.fireRate) return;
    if (ship.energy < weapon.energy) return;
    
    ship.lastFireTime[weaponIndex] = this.gameTime;
    ship.energy -= weapon.energy;
    
    const forward = new THREE.Vector3(0, 0, 1).applyQuaternion(ship.rotation);
    const spawnPos = ship.position.clone().addScaledVector(forward, 2);
    
    // Create projectile
    let projGeo: THREE.BufferGeometry;
    let projMat: THREE.Material;
    
    if (weapon.type === 'laser') {
      projGeo = new THREE.CylinderGeometry(0.05, 0.05, 2, 4);
      projMat = new THREE.MeshBasicMaterial({
        color: ship.team === 'player' ? 0x00ff00 : 0xff0000,
      });
    } else if (weapon.type === 'plasma') {
      projGeo = new THREE.SphereGeometry(0.3, 8, 8);
      projMat = new THREE.MeshBasicMaterial({
        color: ship.team === 'player' ? 0x00ffff : 0xff00ff,
      });
    } else {
      projGeo = new THREE.ConeGeometry(0.1, 0.5, 4);
      projMat = new THREE.MeshBasicMaterial({ color: 0xffaa00 });
    }
    
    const projMesh = new THREE.Mesh(projGeo, projMat);
    projMesh.position.copy(spawnPos);
    projMesh.quaternion.copy(ship.rotation);
    if (weapon.type === 'laser') {
      projMesh.rotateX(Math.PI / 2);
    }
    this.engine.add(projMesh);
    
    const velocity = forward.clone().multiplyScalar(weapon.speed).add(ship.velocity);
    
    this.projectiles.push({
      mesh: projMesh,
      velocity,
      damage: weapon.damage,
      owner: ship,
      lifetime: weapon.range / weapon.speed,
      type: weapon.type,
      target: weapon.type === 'missile' ? ship.target || undefined : undefined,
    });
  }

  private updateProjectiles(deltaTime: number): void {
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const proj = this.projectiles[i];
      proj.lifetime -= deltaTime;
      
      if (proj.lifetime <= 0) {
        this.removeProjectile(i);
        continue;
      }
      
      // Missile tracking
      if (proj.type === 'missile' && proj.target && proj.target.state !== 'dead') {
        const toTarget = proj.target.position.clone().sub(proj.mesh.position).normalize();
        proj.velocity.lerp(toTarget.multiplyScalar(proj.velocity.length()), deltaTime * 2);
      }
      
      proj.mesh.position.addScaledVector(proj.velocity, deltaTime);
      
      // Check hits
      for (const ship of this.allShips) {
        if (ship === proj.owner || ship.state === 'dead') continue;
        if (ship.team === proj.owner.team) continue;
        
        const dist = proj.mesh.position.distanceTo(ship.position);
        if (dist < 3) {
          this.hitShip(ship, proj.damage, proj.owner);
          this.removeProjectile(i);
          break;
        }
      }
    }
  }

  private hitShip(ship: Ship, damage: number, attacker: Ship): void {
    // Shields absorb damage first
    if (ship.shields > 0) {
      const shieldDamage = Math.min(ship.shields, damage);
      ship.shields -= shieldDamage;
      damage -= shieldDamage;
    }
    
    ship.hull -= damage;
    
    const hit = this.getParticleSystem('laser_hit');
    if (hit) {
      hit.setPosition(ship.position);
      hit.burst(15);
    }
    
    if (ship.hull <= 0) {
      this.destroyShip(ship);
      if (attacker === this.playerShip) {
        this.kills++;
        this.addScore(100);
      }
    }
  }

  private destroyShip(ship: Ship): void {
    ship.state = 'dead';
    
    const explosion = this.getParticleSystem('explosion');
    if (explosion) {
      explosion.setPosition(ship.position);
      explosion.burst(100);
    }
    
    this.engine.remove(ship.mesh);
    
    if (ship.team === 'enemy') {
      this.enemiesRemaining--;
    } else if (ship === this.playerShip) {
      this.end(false);
    }
  }

  private removeProjectile(index: number): void {
    const proj = this.projectiles[index];
    this.engine.remove(proj.mesh);
    proj.mesh.geometry.dispose();
    (proj.mesh.material as THREE.Material).dispose();
    this.projectiles.splice(index, 1);
  }

  private updateCamera(): void {
    const ship = this.playerShip;
    const forward = new THREE.Vector3(0, 0, 1).applyQuaternion(ship.rotation);
    const up = new THREE.Vector3(0, 1, 0).applyQuaternion(ship.rotation);
    
    const cameraOffset = forward.clone().multiplyScalar(-15).add(up.clone().multiplyScalar(5));
    const cameraPos = ship.position.clone().add(cameraOffset);
    
    this.engine.camera.position.lerp(cameraPos, 0.1);
    this.engine.camera.lookAt(ship.position.clone().addScaledVector(forward, 10));
  }

  private checkWaveCompletion(): void {
    if (this.enemiesRemaining <= 0) {
      setTimeout(() => this.spawnEnemyWave(), 3000);
    }
  }

  public getPlayerHull(): number { return this.playerShip?.hull ?? 0; }
  public getPlayerMaxHull(): number { return this.playerShip?.config.hull ?? 100; }
  public getPlayerShields(): number { return this.playerShip?.shields ?? 0; }
  public getPlayerMaxShields(): number { return this.playerShip?.config.shields ?? 50; }
  public getPlayerEnergy(): number { return this.playerShip?.energy ?? 0; }
  public getPlayerSpeed(): number { return this.playerShip?.velocity.length() ?? 0; }
  public getWaveNumber(): number { return this.waveNumber; }
  public getEnemiesRemaining(): number { return this.enemiesRemaining; }

  protected cleanup(): void {
    this.allShips.forEach(ship => this.engine.remove(ship.mesh));
    this.projectiles.forEach((_, i) => this.removeProjectile(i));
    this.asteroids.forEach(a => this.engine.remove(a));
    if (this.stars) this.engine.remove(this.stars);
  }
}

export default SpaceCombatGame;
