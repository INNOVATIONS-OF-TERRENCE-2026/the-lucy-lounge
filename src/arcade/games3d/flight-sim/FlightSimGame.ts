/**
 * ┌─────────────────────────────────────────────────────────────────────────────┐
 * │ LUCY ARCADE — FLIGHT SIMULATOR                                             │
 * │                                                                             │
 * │ Arcade flight sim with physics-based controls, missions,                   │
 * │ and aerial combat                                                          │
 * └─────────────────────────────────────────────────────────────────────────────┘
 */

import * as THREE from 'three';
import {
  Game3DBase,
  type Game3DConfig,
  ParticlePresets,
  type InputState,
} from '../../engine3d';

interface Aircraft {
  mesh: THREE.Group;
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  rotation: THREE.Euler;
  
  // Flight dynamics
  speed: number;
  throttle: number;
  pitch: number;
  roll: number;
  yaw: number;
  
  // State
  altitude: number;
  health: number;
  maxHealth: number;
  ammo: number;
  missiles: number;
  
  // Weapons
  lastFireTime: number;
  
  isPlayer: boolean;
  isDestroyed: boolean;
}

interface Target {
  mesh: THREE.Mesh;
  position: THREE.Vector3;
  isDestroyed: boolean;
  type: 'ground' | 'air';
}

export class FlightSimGame extends Game3DBase {
  private player!: Aircraft;
  private enemies: Aircraft[] = [];
  private targets: Target[] = [];
  private projectiles: { mesh: THREE.Mesh; position: THREE.Vector3; velocity: THREE.Vector3; owner: Aircraft }[] = [];
  
  // World
  private terrain!: THREE.Mesh;
  private worldSize: number = 2000;
  private minAltitude: number = 50;
  private maxAltitude: number = 500;
  
  // Mission
  private targetsDestroyed: number = 0;
  private totalTargets: number = 10;

  constructor(container: HTMLElement, config?: Game3DConfig) {
    super(container, {
      ...config,
      engineConfig: {
        shadows: true,
        bloom: true,
        bloomStrength: 0.4,
        fog: { color: 0x87ceeb, near: 100, far: 1000 },
        ...config?.engineConfig,
      },
    });
  }

  protected async loadAssets(): Promise<void> {}

  protected initScene(): void {
    this.setupLighting();
    this.createTerrain();
    this.createPlayerAircraft();
    this.createTargets();
    this.createEnemies();
    
    this.createParticleSystem('explosion', ParticlePresets.explosion());
    this.createParticleSystem('smoke', ParticlePresets.smoke());
    
    this.createGradientSkybox(0x87ceeb, 0xffffff);
  }

  private setupLighting(): void {
    this.engine.addAmbientLight(0xffffff, 0.5);
    this.engine.addDirectionalLight(0xffffff, 1.0, new THREE.Vector3(100, 200, 100), true);
  }

  private createTerrain(): void {
    // Ground plane
    const groundGeo = new THREE.PlaneGeometry(this.worldSize, this.worldSize, 50, 50);
    const groundMat = new THREE.MeshStandardMaterial({ 
      color: 0x228B22,
      roughness: 0.9,
    });
    
    // Add some height variation
    const positions = groundGeo.attributes.position;
    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i);
      const y = positions.getY(i);
      const height = Math.sin(x * 0.01) * Math.cos(y * 0.01) * 20;
      positions.setZ(i, height);
    }
    groundGeo.computeVertexNormals();
    
    this.terrain = new THREE.Mesh(groundGeo, groundMat);
    this.terrain.rotation.x = -Math.PI / 2;
    this.terrain.receiveShadow = true;
    this.engine.add(this.terrain);
    
    // Water
    const waterGeo = new THREE.PlaneGeometry(this.worldSize * 2, this.worldSize * 2);
    const waterMat = new THREE.MeshStandardMaterial({
      color: 0x0066aa,
      roughness: 0.1,
      metalness: 0.3,
      transparent: true,
      opacity: 0.8,
    });
    const water = new THREE.Mesh(waterGeo, waterMat);
    water.rotation.x = -Math.PI / 2;
    water.position.y = -5;
    this.engine.add(water);
    
    // Mountains
    for (let i = 0; i < 20; i++) {
      const mountainGeo = new THREE.ConeGeometry(
        50 + Math.random() * 100,
        100 + Math.random() * 200,
        8
      );
      const mountainMat = new THREE.MeshStandardMaterial({
        color: 0x666666,
        roughness: 0.9,
      });
      const mountain = new THREE.Mesh(mountainGeo, mountainMat);
      mountain.position.set(
        (Math.random() - 0.5) * this.worldSize * 0.8,
        0,
        (Math.random() - 0.5) * this.worldSize * 0.8
      );
      mountain.castShadow = true;
      this.engine.add(mountain);
    }
  }

  private createAircraft(position: THREE.Vector3, isPlayer: boolean): Aircraft {
    const group = new THREE.Group();
    const color = isPlayer ? 0x4488ff : 0xff4444;
    const mat = new THREE.MeshStandardMaterial({ color, metalness: 0.5, roughness: 0.3 });
    
    // Fuselage
    const fuselageGeo = new THREE.CylinderGeometry(0.5, 0.3, 8, 8);
    const fuselage = new THREE.Mesh(fuselageGeo, mat);
    fuselage.rotation.x = Math.PI / 2;
    fuselage.castShadow = true;
    group.add(fuselage);
    
    // Nose cone
    const noseGeo = new THREE.ConeGeometry(0.5, 2, 8);
    const nose = new THREE.Mesh(noseGeo, mat);
    nose.rotation.x = -Math.PI / 2;
    nose.position.z = 5;
    group.add(nose);
    
    // Wings
    const wingGeo = new THREE.BoxGeometry(12, 0.2, 2);
    const wings = new THREE.Mesh(wingGeo, mat);
    wings.position.z = -0.5;
    wings.castShadow = true;
    group.add(wings);
    
    // Tail
    const tailGeo = new THREE.BoxGeometry(4, 0.2, 1);
    const tail = new THREE.Mesh(tailGeo, mat);
    tail.position.z = -3.5;
    group.add(tail);
    
    // Vertical stabilizer
    const stabGeo = new THREE.BoxGeometry(0.2, 2, 1.5);
    const stab = new THREE.Mesh(stabGeo, mat);
    stab.position.set(0, 1, -3.5);
    group.add(stab);
    
    // Cockpit
    const cockpitGeo = new THREE.SphereGeometry(0.6, 8, 8);
    const cockpitMat = new THREE.MeshStandardMaterial({
      color: 0x333333,
      roughness: 0.1,
      metalness: 0.8,
    });
    const cockpit = new THREE.Mesh(cockpitGeo, cockpitMat);
    cockpit.position.set(0, 0.4, 2);
    cockpit.scale.set(1, 0.6, 1.5);
    group.add(cockpit);
    
    // Engines
    [-3, 3].forEach(x => {
      const engineGeo = new THREE.CylinderGeometry(0.3, 0.4, 2, 8);
      const engine = new THREE.Mesh(engineGeo, mat);
      engine.rotation.x = Math.PI / 2;
      engine.position.set(x, -0.3, -1);
      group.add(engine);
    });
    
    group.position.copy(position);
    this.engine.add(group);
    
    return {
      mesh: group,
      position: position.clone(),
      velocity: new THREE.Vector3(0, 0, 100),
      rotation: new THREE.Euler(),
      speed: 100,
      throttle: 0.5,
      pitch: 0,
      roll: 0,
      yaw: 0,
      altitude: position.y,
      health: 100,
      maxHealth: 100,
      ammo: 500,
      missiles: 4,
      lastFireTime: 0,
      isPlayer,
      isDestroyed: false,
    };
  }

  private createPlayerAircraft(): void {
    this.player = this.createAircraft(new THREE.Vector3(0, 200, 0), true);
  }

  private createTargets(): void {
    for (let i = 0; i < this.totalTargets; i++) {
      const x = (Math.random() - 0.5) * this.worldSize * 0.6;
      const z = (Math.random() - 0.5) * this.worldSize * 0.6;
      
      const targetGeo = new THREE.BoxGeometry(10, 5, 10);
      const targetMat = new THREE.MeshStandardMaterial({ color: 0xff0000 });
      const target = new THREE.Mesh(targetGeo, targetMat);
      target.position.set(x, 2.5, z);
      target.castShadow = true;
      this.engine.add(target);
      
      this.targets.push({
        mesh: target,
        position: target.position.clone(),
        isDestroyed: false,
        type: 'ground',
      });
    }
  }

  private createEnemies(): void {
    for (let i = 0; i < 3; i++) {
      const pos = new THREE.Vector3(
        (Math.random() - 0.5) * 500,
        150 + Math.random() * 100,
        (Math.random() - 0.5) * 500
      );
      const enemy = this.createAircraft(pos, false);
      this.enemies.push(enemy);
    }
  }

  protected update(deltaTime: number, input: InputState): void {
    this.updatePlayer(deltaTime, input);
    this.updateEnemies(deltaTime);
    this.updateProjectiles(deltaTime);
    this.updateCamera();
    
    this.setScore({ score: this.targetsDestroyed * 100, kills: this.targetsDestroyed });
  }

  protected fixedUpdate(fixedDeltaTime: number): void {}

  private updatePlayer(deltaTime: number, input: InputState): void {
    const aircraft = this.player;
    if (aircraft.isDestroyed) return;
    
    // Throttle
    if (input.keys.has('KeyW')) aircraft.throttle = Math.min(1, aircraft.throttle + deltaTime);
    if (input.keys.has('KeyS')) aircraft.throttle = Math.max(0, aircraft.throttle - deltaTime);
    
    // Target speed based on throttle
    const minSpeed = 50;
    const maxSpeed = 200;
    const targetSpeed = minSpeed + (maxSpeed - minSpeed) * aircraft.throttle;
    aircraft.speed = THREE.MathUtils.lerp(aircraft.speed, targetSpeed, deltaTime * 0.5);
    
    // Flight controls
    const pitchRate = 1.5;
    const rollRate = 2;
    const yawRate = 0.5;
    
    // Pitch (up/down)
    aircraft.pitch = THREE.MathUtils.lerp(aircraft.pitch, -input.virtual.lookY * pitchRate, deltaTime * 3);
    
    // Roll (bank)
    aircraft.roll = THREE.MathUtils.lerp(aircraft.roll, -input.virtual.moveX * rollRate, deltaTime * 3);
    
    // Yaw (rudder)
    if (input.keys.has('KeyQ')) aircraft.yaw += yawRate * deltaTime;
    if (input.keys.has('KeyE')) aircraft.yaw -= yawRate * deltaTime;
    aircraft.yaw *= 0.95;
    
    // Apply rotation
    aircraft.rotation.x += aircraft.pitch * deltaTime;
    aircraft.rotation.z += aircraft.roll * deltaTime;
    aircraft.rotation.y += aircraft.yaw * deltaTime;
    
    // Auto-level roll
    aircraft.rotation.z *= 0.98;
    
    // Clamp pitch
    aircraft.rotation.x = THREE.MathUtils.clamp(aircraft.rotation.x, -Math.PI / 3, Math.PI / 3);
    
    // Calculate velocity from rotation
    const forward = new THREE.Vector3(0, 0, 1);
    forward.applyEuler(aircraft.rotation);
    aircraft.velocity.copy(forward).multiplyScalar(aircraft.speed);
    
    // Add lift (counteract gravity somewhat)
    const lift = Math.cos(aircraft.rotation.x) * 0.8;
    aircraft.velocity.y += (lift - 0.5) * 10 * deltaTime;
    
    // Update position
    aircraft.position.addScaledVector(aircraft.velocity, deltaTime);
    
    // Altitude limits
    aircraft.altitude = aircraft.position.y;
    if (aircraft.altitude < this.minAltitude) {
      aircraft.position.y = this.minAltitude;
      aircraft.velocity.y = Math.max(0, aircraft.velocity.y);
    }
    if (aircraft.altitude > this.maxAltitude) {
      aircraft.position.y = this.maxAltitude;
      aircraft.velocity.y = Math.min(0, aircraft.velocity.y);
    }
    
    // World bounds
    aircraft.position.x = THREE.MathUtils.clamp(aircraft.position.x, -this.worldSize / 2, this.worldSize / 2);
    aircraft.position.z = THREE.MathUtils.clamp(aircraft.position.z, -this.worldSize / 2, this.worldSize / 2);
    
    // Update mesh
    aircraft.mesh.position.copy(aircraft.position);
    aircraft.mesh.rotation.copy(aircraft.rotation);
    
    // Weapons
    if (input.virtual.fire && aircraft.ammo > 0 && this.gameTime - aircraft.lastFireTime > 0.1) {
      this.fireGun(aircraft);
    }
    
    if (input.keysJustPressed.has('KeyR') && aircraft.missiles > 0) {
      this.fireMissile(aircraft);
    }
  }

  private updateEnemies(deltaTime: number): void {
    this.enemies.forEach(enemy => {
      if (enemy.isDestroyed) return;
      
      // Simple AI: fly towards player
      const toPlayer = this.player.position.clone().sub(enemy.position);
      const distance = toPlayer.length();
      toPlayer.normalize();
      
      // Turn towards player
      const targetYaw = Math.atan2(toPlayer.x, toPlayer.z);
      enemy.rotation.y = THREE.MathUtils.lerp(enemy.rotation.y, targetYaw, deltaTime);
      
      // Adjust pitch
      const targetPitch = Math.asin(toPlayer.y);
      enemy.rotation.x = THREE.MathUtils.lerp(enemy.rotation.x, targetPitch * 0.5, deltaTime);
      
      // Speed
      enemy.speed = THREE.MathUtils.lerp(enemy.speed, 80, deltaTime);
      
      // Update velocity
      const forward = new THREE.Vector3(0, 0, 1);
      forward.applyEuler(enemy.rotation);
      enemy.velocity.copy(forward).multiplyScalar(enemy.speed);
      
      // Update position
      enemy.position.addScaledVector(enemy.velocity, deltaTime);
      enemy.position.y = THREE.MathUtils.clamp(enemy.position.y, this.minAltitude, this.maxAltitude);
      
      enemy.mesh.position.copy(enemy.position);
      enemy.mesh.rotation.copy(enemy.rotation);
      
      // Fire at player
      if (distance < 300 && Math.random() < 0.02) {
        this.fireGun(enemy);
      }
    });
  }

  private fireGun(aircraft: Aircraft): void {
    aircraft.lastFireTime = this.gameTime;
    aircraft.ammo--;
    
    const bulletGeo = new THREE.SphereGeometry(0.3, 4, 4);
    const bulletMat = new THREE.MeshBasicMaterial({ color: aircraft.isPlayer ? 0x00ff00 : 0xff0000 });
    const bullet = new THREE.Mesh(bulletGeo, bulletMat);
    
    const forward = new THREE.Vector3(0, 0, 1);
    forward.applyEuler(aircraft.rotation);
    
    const spawnPos = aircraft.position.clone().add(forward.clone().multiplyScalar(6));
    bullet.position.copy(spawnPos);
    this.engine.add(bullet);
    
    this.projectiles.push({
      mesh: bullet,
      position: spawnPos,
      velocity: forward.multiplyScalar(500).add(aircraft.velocity),
      owner: aircraft,
    });
  }

  private fireMissile(aircraft: Aircraft): void {
    aircraft.missiles--;
    // Simplified - just fire a faster projectile
    const missileGeo = new THREE.ConeGeometry(0.3, 2, 8);
    const missileMat = new THREE.MeshBasicMaterial({ color: 0xffaa00 });
    const missile = new THREE.Mesh(missileGeo, missileMat);
    
    const forward = new THREE.Vector3(0, 0, 1);
    forward.applyEuler(aircraft.rotation);
    
    const spawnPos = aircraft.position.clone().add(forward.clone().multiplyScalar(6));
    missile.position.copy(spawnPos);
    missile.rotation.x = Math.PI / 2;
    this.engine.add(missile);
    
    this.projectiles.push({
      mesh: missile,
      position: spawnPos,
      velocity: forward.multiplyScalar(300).add(aircraft.velocity),
      owner: aircraft,
    });
  }

  private updateProjectiles(deltaTime: number): void {
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const proj = this.projectiles[i];
      
      proj.position.addScaledVector(proj.velocity, deltaTime);
      proj.mesh.position.copy(proj.position);
      
      // Check ground targets
      if (proj.owner.isPlayer) {
        for (const target of this.targets) {
          if (target.isDestroyed) continue;
          if (proj.position.distanceTo(target.position) < 10) {
            this.destroyTarget(target);
            this.removeProjectile(i);
            break;
          }
        }
        
        // Check enemy aircraft
        for (const enemy of this.enemies) {
          if (enemy.isDestroyed) continue;
          if (proj.position.distanceTo(enemy.position) < 5) {
            enemy.health -= 20;
            if (enemy.health <= 0) {
              this.destroyAircraft(enemy);
            }
            this.removeProjectile(i);
            break;
          }
        }
      } else {
        // Enemy projectile hitting player
        if (proj.position.distanceTo(this.player.position) < 5) {
          this.player.health -= 10;
          if (this.player.health <= 0) {
            this.destroyAircraft(this.player);
            this.end(false);
          }
          this.removeProjectile(i);
          continue;
        }
      }
      
      // Remove if out of bounds or hit ground
      if (proj.position.y < 0 || proj.position.length() > this.worldSize) {
        this.removeProjectile(i);
      }
    }
  }

  private destroyTarget(target: Target): void {
    target.isDestroyed = true;
    this.targetsDestroyed++;
    this.addScore(100);
    
    const explosion = this.getParticleSystem('explosion');
    if (explosion) {
      explosion.setPosition(target.position);
      explosion.burst(50);
    }
    
    this.engine.remove(target.mesh);
    
    if (this.targetsDestroyed >= this.totalTargets) {
      this.end(true);
    }
  }

  private destroyAircraft(aircraft: Aircraft): void {
    aircraft.isDestroyed = true;
    
    const explosion = this.getParticleSystem('explosion');
    if (explosion) {
      explosion.setPosition(aircraft.position);
      explosion.burst(100);
    }
    
    this.engine.remove(aircraft.mesh);
    
    if (!aircraft.isPlayer) {
      this.addScore(200);
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
    const aircraft = this.player;
    if (aircraft.isDestroyed) return;
    
    // Chase camera
    const offset = new THREE.Vector3(0, 5, -20);
    offset.applyEuler(aircraft.rotation);
    
    const targetPos = aircraft.position.clone().add(offset);
    this.engine.camera.position.lerp(targetPos, 0.1);
    
    const lookTarget = aircraft.position.clone().add(
      new THREE.Vector3(0, 0, 50).applyEuler(aircraft.rotation)
    );
    this.engine.camera.lookAt(lookTarget);
  }

  public getSpeed(): number { return this.player?.speed ?? 0; }
  public getAltitude(): number { return this.player?.altitude ?? 0; }
  public getThrottle(): number { return this.player?.throttle ?? 0; }
  public getHealth(): number { return this.player?.health ?? 0; }
  public getMaxHealth(): number { return this.player?.maxHealth ?? 100; }
  public getAmmo(): number { return this.player?.ammo ?? 0; }
  public getMissiles(): number { return this.player?.missiles ?? 0; }
  public getTargetsDestroyed(): number { return this.targetsDestroyed; }
  public getTotalTargets(): number { return this.totalTargets; }

  protected cleanup(): void {
    this.engine.remove(this.player.mesh);
    this.enemies.forEach(e => this.engine.remove(e.mesh));
    this.targets.forEach(t => this.engine.remove(t.mesh));
    this.projectiles.forEach((_, i) => this.removeProjectile(i));
  }
}

export default FlightSimGame;
