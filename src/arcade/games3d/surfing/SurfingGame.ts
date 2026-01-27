/**
 * ┌─────────────────────────────────────────────────────────────────────────────┐
 * │ LUCY ARCADE — 3D SURFING                                                   │
 * │                                                                             │
 * │ Dynamic wave surfing with procedural ocean, trick system,                  │
 * │ and tube riding mechanics                                                  │
 * └─────────────────────────────────────────────────────────────────────────────┘
 */

import * as THREE from 'three';
import {
  Game3DBase,
  type Game3DConfig,
  ThirdPersonCameraController,
  type InputState,
} from '../../engine3d';

interface Wave {
  position: number;
  height: number;
  speed: number;
  width: number;
  isTube: boolean;
}

interface Trick {
  name: string;
  points: number;
  type: 'aerial' | 'turn' | 'tube';
}

const TRICKS: Record<string, Trick> = {
  cutback: { name: 'Cutback', points: 50, type: 'turn' },
  snap: { name: 'Snap', points: 75, type: 'turn' },
  floater: { name: 'Floater', points: 100, type: 'aerial' },
  aerial: { name: 'Aerial', points: 150, type: 'aerial' },
  aerial360: { name: '360 Air', points: 250, type: 'aerial' },
  tubeRide: { name: 'Tube Ride', points: 25, type: 'tube' }, // Per second
  barrelRoll: { name: 'Barrel Roll', points: 200, type: 'aerial' },
};

export class SurfingGame extends Game3DBase {
  private cameraController!: ThirdPersonCameraController;
  
  // Surfer
  private surferMesh!: THREE.Group;
  private position: THREE.Vector3 = new THREE.Vector3();
  private velocity: THREE.Vector3 = new THREE.Vector3();
  private rotation: number = 0;
  
  // Ocean
  private oceanMesh!: THREE.Mesh;
  private oceanGeometry!: THREE.PlaneGeometry;
  private waves: Wave[] = [];
  
  // State
  private isOnWave: boolean = false;
  private isInTube: boolean = false;
  private isAirborne: boolean = false;
  private spinRotation: number = 0;
  private flipRotation: number = 0;
  
  // Tricks
  private currentTrick: Trick | null = null;
  private trickList: string[] = [];
  private tubeTime: number = 0;
  
  // Combo
  private combo: number = 0;
  private comboMultiplier: number = 1;
  private comboTimer: number = 0;
  
  // Session
  private sessionTime: number = 120;
  private wavesCaught: number = 0;

  constructor(container: HTMLElement, config?: Game3DConfig) {
    super(container, {
      ...config,
      engineConfig: {
        shadows: true,
        bloom: true,
        bloomStrength: 0.5,
        fog: { color: 0x88ccff, near: 30, far: 150 },
        ...config?.engineConfig,
      },
    });
  }

  protected async loadAssets(): Promise<void> {}

  protected initScene(): void {
    this.setupLighting();
    this.createOcean();
    this.createSurfer();
    this.createBeach();
    this.spawnWave();
    
    this.cameraController = new ThirdPersonCameraController(this.engine.camera, {
      distance: 10,
      height: 4,
      minPitch: 0.1,
      maxPitch: 0.8,
    });
    
    this.createGradientSkybox(0x88ccff, 0xffffff);
  }

  private setupLighting(): void {
    this.engine.addAmbientLight(0x88ccff, 0.5);
    this.engine.addDirectionalLight(0xffffee, 1.0, new THREE.Vector3(50, 80, 30), true);
  }

  private createOcean(): void {
    const width = 200;
    const length = 300;
    
    this.oceanGeometry = new THREE.PlaneGeometry(width, length, 100, 150);
    
    const oceanMat = new THREE.MeshStandardMaterial({
      color: 0x0066aa,
      roughness: 0.3,
      metalness: 0.1,
      transparent: true,
      opacity: 0.9,
    });
    
    this.oceanMesh = new THREE.Mesh(this.oceanGeometry, oceanMat);
    this.oceanMesh.rotation.x = -Math.PI / 2;
    this.oceanMesh.receiveShadow = true;
    this.engine.add(this.oceanMesh);
    
    // Foam/whitewash
    const foamGeo = new THREE.PlaneGeometry(width, 20);
    const foamMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.5,
    });
    const foam = new THREE.Mesh(foamGeo, foamMat);
    foam.rotation.x = -Math.PI / 2;
    foam.position.set(0, 0.1, -100);
    this.engine.add(foam);
  }

  private createBeach(): void {
    const beachGeo = new THREE.PlaneGeometry(200, 50);
    const beachMat = new THREE.MeshStandardMaterial({ color: 0xf4d03f, roughness: 0.9 });
    const beach = new THREE.Mesh(beachGeo, beachMat);
    beach.rotation.x = -Math.PI / 2;
    beach.position.set(0, -0.5, -150);
    beach.receiveShadow = true;
    this.engine.add(beach);
  }

  private createSurfer(): void {
    this.surferMesh = new THREE.Group();
    
    // Body
    const bodyGeo = new THREE.CapsuleGeometry(0.15, 0.4, 4, 8);
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0x333333 });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = 0.6;
    body.castShadow = true;
    this.surferMesh.add(body);
    
    // Head
    const headGeo = new THREE.SphereGeometry(0.12, 16, 16);
    const headMat = new THREE.MeshStandardMaterial({ color: 0xdeb887 });
    const head = new THREE.Mesh(headGeo, headMat);
    head.position.y = 1;
    this.surferMesh.add(head);
    
    // Surfboard
    const boardGeo = new THREE.BoxGeometry(0.5, 0.05, 2);
    const boardMat = new THREE.MeshStandardMaterial({ color: 0xffffff });
    const board = new THREE.Mesh(boardGeo, boardMat);
    board.name = 'board';
    this.surferMesh.add(board);
    
    // Board fins
    const finGeo = new THREE.BoxGeometry(0.02, 0.1, 0.15);
    const finMat = new THREE.MeshStandardMaterial({ color: 0x333333 });
    [-0.15, 0, 0.15].forEach(x => {
      const fin = new THREE.Mesh(finGeo, finMat);
      fin.position.set(x, -0.05, -0.7);
      this.surferMesh.add(fin);
    });
    
    this.surferMesh.position.set(0, 0, 50);
    this.position.copy(this.surferMesh.position);
    this.engine.add(this.surferMesh);
  }

  private spawnWave(): void {
    const wave: Wave = {
      position: 100,
      height: 3 + Math.random() * 3,
      speed: 5 + Math.random() * 3,
      width: 30 + Math.random() * 20,
      isTube: Math.random() > 0.5,
    };
    
    this.waves.push(wave);
  }

  protected update(deltaTime: number, input: InputState): void {
    this.sessionTime -= deltaTime;
    
    if (this.sessionTime <= 0) {
      this.end(true);
      return;
    }
    
    this.updateOcean(deltaTime);
    this.updateSurfer(deltaTime, input);
    this.updateTricks(deltaTime, input);
    this.updateCombo(deltaTime);
    this.updateWaves(deltaTime);
    
    this.cameraController.setTarget(this.surferMesh.position);
    this.cameraController.update(deltaTime, input);
    
    this.setScore({ score: this.getScore().score, combo: this.comboMultiplier });
  }

  protected fixedUpdate(fixedDeltaTime: number): void {}

  private updateOcean(deltaTime: number): void {
    const positions = this.oceanGeometry.attributes.position;
    const time = this.gameTime;
    
    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i);
      const y = positions.getY(i);
      
      // Base wave motion
      let z = Math.sin(x * 0.1 + time) * 0.3;
      z += Math.sin(y * 0.05 + time * 0.5) * 0.2;
      
      // Add wave heights
      this.waves.forEach(wave => {
        const distToWave = Math.abs(y - wave.position);
        if (distToWave < wave.width) {
          const waveShape = Math.cos((distToWave / wave.width) * Math.PI) * 0.5 + 0.5;
          z += waveShape * wave.height;
          
          // Tube shape
          if (wave.isTube && distToWave < wave.width * 0.3) {
            const tubeShape = Math.sin((distToWave / (wave.width * 0.3)) * Math.PI);
            z += tubeShape * wave.height * 0.5;
          }
        }
      });
      
      positions.setZ(i, z);
    }
    
    positions.needsUpdate = true;
    this.oceanGeometry.computeVertexNormals();
  }

  private updateSurfer(deltaTime: number, input: InputState): void {
    // Find wave height at surfer position
    let waveHeight = 0;
    let onWaveFace = false;
    let inTube = false;
    
    this.waves.forEach(wave => {
      const distToWave = Math.abs(this.position.z - wave.position);
      if (distToWave < wave.width) {
        const waveShape = Math.cos((distToWave / wave.width) * Math.PI) * 0.5 + 0.5;
        waveHeight = waveShape * wave.height;
        onWaveFace = distToWave < wave.width * 0.7;
        inTube = wave.isTube && distToWave < wave.width * 0.2;
      }
    });
    
    this.isOnWave = onWaveFace && !this.isAirborne;
    this.isInTube = inTube && !this.isAirborne;
    
    if (this.isOnWave) {
      // Surfing physics
      const surfSpeed = 8 + waveHeight * 2;
      
      // Steering
      this.rotation += input.virtual.moveX * 3 * deltaTime;
      this.surferMesh.rotation.y = this.rotation;
      
      // Movement along wave
      const forward = new THREE.Vector3(0, 0, 1).applyAxisAngle(new THREE.Vector3(0, 1, 0), this.rotation);
      this.velocity.copy(forward.multiplyScalar(surfSpeed));
      
      // Pump for speed
      if (input.virtual.moveY > 0) {
        this.velocity.multiplyScalar(1.2);
      }
      
      // Position on wave
      this.position.addScaledVector(this.velocity, deltaTime);
      this.position.y = waveHeight + 0.1;
      
      // Jump/aerial
      if (input.keysJustPressed.has('Space')) {
        this.isAirborne = true;
        this.velocity.y = 8 + waveHeight * 0.5;
      }
      
      // Tube time scoring
      if (this.isInTube) {
        this.tubeTime += deltaTime;
        if (this.tubeTime > 0.5) {
          this.addTrickPoints('tubeRide');
          this.tubeTime = 0;
        }
      }
    } else if (this.isAirborne) {
      // Air physics
      this.velocity.y -= 15 * deltaTime;
      this.position.addScaledVector(this.velocity, deltaTime);
      
      // Spin
      if (input.keys.has('KeyA')) {
        this.spinRotation += deltaTime * 360;
      }
      if (input.keys.has('KeyD')) {
        this.spinRotation -= deltaTime * 360;
      }
      
      // Flip
      if (input.keys.has('KeyW')) {
        this.flipRotation += deltaTime * 360;
      }
      if (input.keys.has('KeyS')) {
        this.flipRotation -= deltaTime * 360;
      }
      
      // Apply visual rotation
      this.surferMesh.rotation.y = this.rotation + THREE.MathUtils.degToRad(this.spinRotation);
      this.surferMesh.rotation.x = THREE.MathUtils.degToRad(this.flipRotation);
      
      // Landing
      if (this.position.y <= waveHeight + 0.1) {
        this.position.y = waveHeight + 0.1;
        this.isAirborne = false;
        this.landTrick();
        
        // Reset rotations
        this.spinRotation = 0;
        this.flipRotation = 0;
        this.surferMesh.rotation.x = 0;
      }
    } else {
      // Paddling (not on wave)
      const paddleSpeed = 3;
      const forward = new THREE.Vector3(0, 0, 1).applyAxisAngle(new THREE.Vector3(0, 1, 0), this.rotation);
      
      this.rotation += input.virtual.moveX * 2 * deltaTime;
      this.surferMesh.rotation.y = this.rotation;
      
      if (input.virtual.moveY > 0) {
        this.position.addScaledVector(forward, paddleSpeed * deltaTime);
      }
      
      this.position.y = 0.1;
    }
    
    // Keep in bounds
    this.position.x = THREE.MathUtils.clamp(this.position.x, -80, 80);
    this.position.z = THREE.MathUtils.clamp(this.position.z, -100, 100);
    
    this.surferMesh.position.copy(this.position);
  }

  private updateTricks(deltaTime: number, input: InputState): void {
    if (!this.isOnWave && !this.isAirborne) return;
    
    // Turn tricks
    if (this.isOnWave && Math.abs(input.virtual.moveX) > 0.8) {
      if (input.keysJustPressed.has('KeyJ')) {
        this.currentTrick = TRICKS.cutback;
      } else if (input.keysJustPressed.has('KeyK')) {
        this.currentTrick = TRICKS.snap;
      }
    }
    
    // Aerial detection
    if (this.isAirborne) {
      const totalSpin = Math.abs(this.spinRotation);
      const totalFlip = Math.abs(this.flipRotation);
      
      if (totalFlip > 270) {
        this.currentTrick = TRICKS.barrelRoll;
      } else if (totalSpin > 270) {
        this.currentTrick = TRICKS.aerial360;
      } else if (totalSpin > 90 || totalFlip > 90) {
        this.currentTrick = TRICKS.aerial;
      } else {
        this.currentTrick = TRICKS.floater;
      }
    }
  }

  private landTrick(): void {
    if (this.currentTrick) {
      this.addTrickPoints(Object.keys(TRICKS).find(k => TRICKS[k] === this.currentTrick) || 'floater');
      this.currentTrick = null;
    }
  }

  private addTrickPoints(trickId: string): void {
    const trick = TRICKS[trickId];
    if (!trick) return;
    
    const points = trick.points * this.comboMultiplier;
    this.addScore(Math.round(points));
    this.trickList.push(trick.name);
    this.combo++;
    this.comboTimer = 3;
    
    if (this.combo % 3 === 0) {
      this.comboMultiplier = Math.min(5, this.comboMultiplier + 0.5);
    }
  }

  private updateCombo(deltaTime: number): void {
    if (this.comboTimer > 0) {
      this.comboTimer -= deltaTime;
      
      if (this.comboTimer <= 0 && !this.isOnWave && !this.isAirborne) {
        // End combo
        if (this.combo > 1) {
          const bonus = this.combo * 20 * this.comboMultiplier;
          this.addScore(Math.round(bonus));
        }
        
        this.combo = 0;
        this.comboMultiplier = 1;
        this.trickList = [];
      }
    }
  }

  private updateWaves(deltaTime: number): void {
    // Move waves towards shore
    this.waves.forEach(wave => {
      wave.position -= wave.speed * deltaTime;
    });
    
    // Remove waves that reached shore
    this.waves = this.waves.filter(wave => wave.position > -120);
    
    // Spawn new waves
    if (this.waves.length < 3 && Math.random() < deltaTime * 0.5) {
      this.spawnWave();
    }
  }

  public getSessionTime(): number { return this.sessionTime; }
  public getCombo(): number { return this.combo; }
  public getComboMultiplier(): number { return this.comboMultiplier; }
  public getTrickList(): string[] { return [...this.trickList]; }
  public getCurrentTrick(): string | null { return this.currentTrick?.name ?? null; }
  public isOnWaveFace(): boolean { return this.isOnWave; }
  public isInsideTube(): boolean { return this.isInTube; }
  public isInAir(): boolean { return this.isAirborne; }
  public getWavesCaught(): number { return this.wavesCaught; }

  protected cleanup(): void {
    this.engine.remove(this.surferMesh);
    this.engine.remove(this.oceanMesh);
  }
}

export default SurfingGame;
