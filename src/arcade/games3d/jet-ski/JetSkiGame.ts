/**
 * ┌─────────────────────────────────────────────────────────────────────────────┐
 * │ LUCY ARCADE — JET SKI RACING                                               │
 * │                                                                             │
 * │ High-speed water racing with wave physics, tricks, and AI opponents        │
 * └─────────────────────────────────────────────────────────────────────────────┘
 */

import * as THREE from 'three';
import {
  Game3DBase,
  type Game3DConfig,
  type InputState,
} from '../../engine3d';

interface JetSki {
  mesh: THREE.Group;
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  rotation: number;
  pitch: number;
  roll: number;
  
  // State
  speed: number;
  boost: number;
  maxBoost: number;
  isAirborne: boolean;
  trickScore: number;
  
  // Race
  checkpoint: number;
  lap: number;
  raceTime: number;
  
  isPlayer: boolean;
}

export class JetSkiGame extends Game3DBase {
  private player!: JetSki;
  private opponents: JetSki[] = [];
  private water!: THREE.Mesh;
  
  // Course
  private checkpoints: THREE.Vector3[] = [];
  private courseRadius: number = 80;
  private laps: number = 3;
  
  // Water
  private waveTime: number = 0;
  private waveAmplitude: number = 1;
  private waveFrequency: number = 0.5;

  constructor(container: HTMLElement, config?: Game3DConfig) {
    super(container, {
      ...config,
      engineConfig: {
        shadows: true,
        bloom: true,
        bloomStrength: 0.5,
        fog: { color: 0x87ceeb, near: 50, far: 200 },
        ...config?.engineConfig,
      },
    });
  }

  protected async loadAssets(): Promise<void> {}

  protected initScene(): void {
    this.setupLighting();
    this.createWater();
    this.createCourse();
    this.createJetSkis();
    
    this.engine.camera.position.set(0, 10, 20);
    this.engine.camera.lookAt(0, 0, 0);
    
    this.createGradientSkybox(0x87ceeb, 0xffffff);
  }

  private setupLighting(): void {
    this.engine.addAmbientLight(0xffffff, 0.6);
    this.engine.addDirectionalLight(0xffffff, 1.0, new THREE.Vector3(50, 100, 50), true);
  }

  private createWater(): void {
    const waterGeo = new THREE.PlaneGeometry(500, 500, 100, 100);
    const waterMat = new THREE.MeshStandardMaterial({
      color: 0x0077be,
      roughness: 0.1,
      metalness: 0.3,
      transparent: true,
      opacity: 0.9,
    });
    
    this.water = new THREE.Mesh(waterGeo, waterMat);
    this.water.rotation.x = -Math.PI / 2;
    this.water.receiveShadow = true;
    this.engine.add(this.water);
  }

  private createCourse(): void {
    // Create oval course with checkpoints
    const numCheckpoints = 8;
    
    for (let i = 0; i < numCheckpoints; i++) {
      const angle = (i / numCheckpoints) * Math.PI * 2;
      const x = Math.cos(angle) * this.courseRadius;
      const z = Math.sin(angle) * this.courseRadius * 0.6;
      
      this.checkpoints.push(new THREE.Vector3(x, 0, z));
      
      // Buoy markers
      const buoyGeo = new THREE.CylinderGeometry(0.5, 0.5, 3, 8);
      const buoyMat = new THREE.MeshStandardMaterial({ 
        color: i === 0 ? 0x00ff00 : 0xff6600,
        emissive: i === 0 ? 0x004400 : 0x442200,
      });
      const buoy = new THREE.Mesh(buoyGeo, buoyMat);
      buoy.position.set(x, 1.5, z);
      buoy.castShadow = true;
      this.engine.add(buoy);
      
      // Inner buoy
      const innerX = Math.cos(angle) * (this.courseRadius - 15);
      const innerZ = Math.sin(angle) * (this.courseRadius * 0.6 - 10);
      const innerBuoy = new THREE.Mesh(buoyGeo, buoyMat);
      innerBuoy.position.set(innerX, 1.5, innerZ);
      this.engine.add(innerBuoy);
    }
    
    // Ramps
    const rampPositions = [
      new THREE.Vector3(this.courseRadius * 0.7, 0, 0),
      new THREE.Vector3(-this.courseRadius * 0.7, 0, 0),
    ];
    
    rampPositions.forEach(pos => {
      const rampGeo = new THREE.BoxGeometry(8, 1, 4);
      const rampMat = new THREE.MeshStandardMaterial({ color: 0xffff00 });
      const ramp = new THREE.Mesh(rampGeo, rampMat);
      ramp.position.copy(pos);
      ramp.rotation.x = -0.2;
      this.engine.add(ramp);
    });
  }

  private createJetSkis(): void {
    this.player = this.createJetSki(new THREE.Vector3(0, 0, -this.courseRadius * 0.6 + 5), true);
    
    // AI opponents
    for (let i = 0; i < 3; i++) {
      const offset = (i - 1) * 5;
      const opponent = this.createJetSki(
        new THREE.Vector3(offset, 0, -this.courseRadius * 0.6 + 10),
        false
      );
      this.opponents.push(opponent);
    }
  }

  private createJetSki(position: THREE.Vector3, isPlayer: boolean): JetSki {
    const group = new THREE.Group();
    const color = isPlayer ? 0x00aaff : 0xff4400;
    
    // Hull
    const hullGeo = new THREE.BoxGeometry(1.2, 0.6, 3);
    const hullMat = new THREE.MeshStandardMaterial({ color, roughness: 0.3, metalness: 0.5 });
    const hull = new THREE.Mesh(hullGeo, hullMat);
    hull.position.y = 0.3;
    hull.castShadow = true;
    group.add(hull);
    
    // Front nose
    const noseGeo = new THREE.ConeGeometry(0.6, 1.5, 8);
    const nose = new THREE.Mesh(noseGeo, hullMat);
    nose.rotation.x = -Math.PI / 2;
    nose.position.set(0, 0.3, 2);
    group.add(nose);
    
    // Seat
    const seatGeo = new THREE.BoxGeometry(0.8, 0.4, 1.5);
    const seatMat = new THREE.MeshStandardMaterial({ color: 0x111111 });
    const seat = new THREE.Mesh(seatGeo, seatMat);
    seat.position.set(0, 0.8, -0.3);
    group.add(seat);
    
    // Handlebars
    const handleGeo = new THREE.CylinderGeometry(0.05, 0.05, 0.8, 8);
    const handleMat = new THREE.MeshStandardMaterial({ color: 0x333333 });
    const handle = new THREE.Mesh(handleGeo, handleMat);
    handle.rotation.z = Math.PI / 2;
    handle.position.set(0, 1.2, 0.8);
    group.add(handle);
    
    // Rider (simplified)
    const riderGeo = new THREE.CapsuleGeometry(0.2, 0.6, 4, 8);
    const riderMat = new THREE.MeshStandardMaterial({ color: isPlayer ? 0x0066aa : 0xaa3300 });
    const rider = new THREE.Mesh(riderGeo, riderMat);
    rider.position.set(0, 1.3, -0.2);
    group.add(rider);
    
    group.position.copy(position);
    this.engine.add(group);
    
    return {
      mesh: group,
      position: position.clone(),
      velocity: new THREE.Vector3(),
      rotation: 0,
      pitch: 0,
      roll: 0,
      speed: 0,
      boost: 100,
      maxBoost: 100,
      isAirborne: false,
      trickScore: 0,
      checkpoint: 0,
      lap: 0,
      raceTime: 0,
      isPlayer,
    };
  }

  protected update(deltaTime: number, input: InputState): void {
    this.waveTime += deltaTime;
    this.updateWater();
    this.updatePlayer(deltaTime, input);
    this.updateOpponents(deltaTime);
    this.updateCamera();
    this.checkCheckpoints();
  }

  protected fixedUpdate(fixedDeltaTime: number): void {}

  private updateWater(): void {
    const positions = this.water.geometry.attributes.position;
    
    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i);
      const y = positions.getY(i);
      
      const wave = Math.sin(x * this.waveFrequency + this.waveTime * 2) * 
                   Math.cos(y * this.waveFrequency * 0.8 + this.waveTime * 1.5) * 
                   this.waveAmplitude;
      
      positions.setZ(i, wave);
    }
    
    positions.needsUpdate = true;
    this.water.geometry.computeVertexNormals();
  }

  private getWaveHeight(x: number, z: number): number {
    return Math.sin(x * this.waveFrequency + this.waveTime * 2) * 
           Math.cos(z * this.waveFrequency * 0.8 + this.waveTime * 1.5) * 
           this.waveAmplitude;
  }

  private updatePlayer(deltaTime: number, input: InputState): void {
    const ski = this.player;
    
    // Acceleration
    const maxSpeed = input.keys.has('ShiftLeft') && ski.boost > 0 ? 50 : 35;
    
    if (input.virtual.moveY > 0) {
      ski.speed = Math.min(maxSpeed, ski.speed + 30 * deltaTime);
      if (input.keys.has('ShiftLeft') && ski.boost > 0) {
        ski.boost -= 30 * deltaTime;
      }
    } else if (input.virtual.moveY < 0) {
      ski.speed = Math.max(-10, ski.speed - 40 * deltaTime);
    } else {
      ski.speed *= 0.98;
    }
    
    // Regenerate boost
    if (!input.keys.has('ShiftLeft')) {
      ski.boost = Math.min(ski.maxBoost, ski.boost + 10 * deltaTime);
    }
    
    // Steering
    const turnSpeed = 2.5 * (1 - Math.abs(ski.speed) / maxSpeed * 0.3);
    ski.rotation -= input.virtual.moveX * turnSpeed * deltaTime;
    ski.roll = THREE.MathUtils.lerp(ski.roll, -input.virtual.moveX * 0.3, deltaTime * 5);
    
    // Calculate velocity
    const forward = new THREE.Vector3(0, 0, 1).applyAxisAngle(new THREE.Vector3(0, 1, 0), ski.rotation);
    ski.velocity.copy(forward).multiplyScalar(ski.speed);
    
    // Update position
    ski.position.addScaledVector(ski.velocity, deltaTime);
    
    // Water height
    const waterHeight = this.getWaveHeight(ski.position.x, ski.position.z);
    
    if (ski.position.y <= waterHeight + 0.5) {
      ski.position.y = waterHeight + 0.5;
      ski.isAirborne = false;
      
      // Pitch from wave slope
      const slopeX = this.getWaveHeight(ski.position.x + 1, ski.position.z) - waterHeight;
      const slopeZ = this.getWaveHeight(ski.position.x, ski.position.z + 1) - waterHeight;
      ski.pitch = THREE.MathUtils.lerp(ski.pitch, -slopeZ * 0.5, deltaTime * 5);
    } else {
      ski.isAirborne = true;
      ski.velocity.y -= 15 * deltaTime;
      ski.position.y += ski.velocity.y * deltaTime;
      
      // Air tricks
      if (input.keysJustPressed.has('KeyQ')) {
        ski.roll += Math.PI * 2;
        ski.trickScore += 100;
      }
    }
    
    // Update mesh
    ski.mesh.position.copy(ski.position);
    ski.mesh.rotation.y = ski.rotation;
    ski.mesh.rotation.x = ski.pitch;
    ski.mesh.rotation.z = ski.roll;
    
    // Race time
    if (ski.lap < this.laps) {
      ski.raceTime += deltaTime;
    }
  }

  private updateOpponents(deltaTime: number): void {
    this.opponents.forEach(ski => {
      // Simple AI: follow checkpoints
      const targetCheckpoint = this.checkpoints[ski.checkpoint % this.checkpoints.length];
      const toTarget = targetCheckpoint.clone().sub(ski.position);
      toTarget.y = 0;
      
      const targetAngle = Math.atan2(toTarget.x, toTarget.z);
      const angleDiff = targetAngle - ski.rotation;
      
      // Normalize angle
      let normalizedDiff = angleDiff;
      while (normalizedDiff > Math.PI) normalizedDiff -= Math.PI * 2;
      while (normalizedDiff < -Math.PI) normalizedDiff += Math.PI * 2;
      
      ski.rotation += normalizedDiff * 2 * deltaTime;
      
      // Speed
      ski.speed = THREE.MathUtils.lerp(ski.speed, 30, deltaTime);
      
      // Update position
      const forward = new THREE.Vector3(0, 0, 1).applyAxisAngle(new THREE.Vector3(0, 1, 0), ski.rotation);
      ski.position.addScaledVector(forward, ski.speed * deltaTime);
      
      // Water height
      const waterHeight = this.getWaveHeight(ski.position.x, ski.position.z);
      ski.position.y = waterHeight + 0.5;
      
      ski.mesh.position.copy(ski.position);
      ski.mesh.rotation.y = ski.rotation;
      
      // Check checkpoint
      if (toTarget.length() < 10) {
        ski.checkpoint++;
        if (ski.checkpoint % this.checkpoints.length === 0) {
          ski.lap++;
        }
      }
      
      ski.raceTime += deltaTime;
    });
  }

  private updateCamera(): void {
    const ski = this.player;
    const cameraOffset = new THREE.Vector3(0, 5, -12).applyAxisAngle(new THREE.Vector3(0, 1, 0), ski.rotation);
    const targetPos = ski.position.clone().add(cameraOffset);
    
    this.engine.camera.position.lerp(targetPos, 0.1);
    this.engine.camera.lookAt(ski.position.clone().add(new THREE.Vector3(0, 2, 0)));
  }

  private checkCheckpoints(): void {
    const ski = this.player;
    const targetCheckpoint = this.checkpoints[ski.checkpoint % this.checkpoints.length];
    const dist = ski.position.distanceTo(targetCheckpoint);
    
    if (dist < 10) {
      ski.checkpoint++;
      this.addScore(50);
      
      if (ski.checkpoint % this.checkpoints.length === 0) {
        ski.lap++;
        this.addScore(500);
        
        if (ski.lap >= this.laps) {
          this.end(true);
        }
      }
    }
  }

  public getSpeed(): number { return this.player?.speed ?? 0; }
  public getBoost(): number { return this.player?.boost ?? 0; }
  public getMaxBoost(): number { return this.player?.maxBoost ?? 100; }
  public getLap(): number { return this.player?.lap ?? 0; }
  public getMaxLaps(): number { return this.laps; }
  public getRaceTime(): number { return this.player?.raceTime ?? 0; }
  public getPosition(): number {
    if (!this.player) return 1;
    const allSkis = [this.player, ...this.opponents];
    allSkis.sort((a, b) => (b.lap * 1000 + b.checkpoint) - (a.lap * 1000 + a.checkpoint));
    return allSkis.indexOf(this.player) + 1;
  }
  public getTrickScore(): number { return this.player?.trickScore ?? 0; }
  public isAirborne(): boolean { return this.player?.isAirborne ?? false; }

  protected cleanup(): void {
    this.engine.remove(this.player.mesh);
    this.opponents.forEach(o => this.engine.remove(o.mesh));
  }
}

export default JetSkiGame;
