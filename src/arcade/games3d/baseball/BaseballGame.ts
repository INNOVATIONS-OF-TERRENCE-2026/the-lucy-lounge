/**
 * ┌─────────────────────────────────────────────────────────────────────────────┐
 * │ LUCY ARCADE — 3D BASEBALL                                                  │
 * │                                                                             │
 * │ Home run derby mode with physics-based batting, pitch variety,             │
 * │ and stadium atmosphere                                                     │
 * └─────────────────────────────────────────────────────────────────────────────┘
 */

import * as THREE from 'three';
import {
  Game3DBase,
  type Game3DConfig,
  type InputState,
} from '../../engine3d';

interface Ball {
  mesh: THREE.Mesh;
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  spin: THREE.Vector3;
  isInPlay: boolean;
  isPitched: boolean;
  isHit: boolean;
}

interface Bat {
  mesh: THREE.Group;
  position: THREE.Vector3;
  swingAngle: number;
  isSwinging: boolean;
  swingPower: number;
}

type PitchType = 'fastball' | 'curveball' | 'slider' | 'changeup';

export class BaseballGame extends Game3DBase {
  private ball!: Ball;
  private bat!: Bat;
  
  // Field dimensions
  private homeRunDistance: number = 120; // meters
  private foulLineAngle: number = Math.PI / 4;
  
  // Game state
  private pitchCount: number = 0;
  private maxPitches: number = 10;
  private homeRuns: number = 0;
  private totalDistance: number = 0;
  private longestHit: number = 0;
  
  // Timing
  private pitchTimer: number = 0;
  private isPitching: boolean = false;
  private currentPitch: PitchType = 'fastball';

  constructor(container: HTMLElement, config?: Game3DConfig) {
    super(container, {
      ...config,
      engineConfig: {
        shadows: true,
        bloom: true,
        bloomStrength: 0.4,
        fog: { color: 0x87ceeb, near: 50, far: 200 },
        ...config?.engineConfig,
      },
    });
  }

  protected async loadAssets(): Promise<void> {}

  protected initScene(): void {
    this.setupLighting();
    this.createStadium();
    this.createBat();
    this.createBall();
    
    this.engine.camera.position.set(0, 2, -5);
    this.engine.camera.lookAt(0, 1, 20);
    
    this.createGradientSkybox(0x87ceeb, 0xffffff);
    this.preparePitch();
  }

  private setupLighting(): void {
    this.engine.addAmbientLight(0xffffff, 0.5);
    this.engine.addDirectionalLight(0xffffff, 1.0, new THREE.Vector3(30, 50, -20), true);
  }

  private createStadium(): void {
    // Infield dirt
    const dirtGeo = new THREE.CircleGeometry(30, 32, 0, Math.PI);
    const dirtMat = new THREE.MeshStandardMaterial({ color: 0xc4a35a, roughness: 0.9 });
    const dirt = new THREE.Mesh(dirtGeo, dirtMat);
    dirt.rotation.x = -Math.PI / 2;
    dirt.rotation.z = Math.PI / 2;
    dirt.receiveShadow = true;
    this.engine.add(dirt);
    
    // Outfield grass
    const grassGeo = new THREE.CircleGeometry(150, 64, 0, Math.PI);
    const grassMat = new THREE.MeshStandardMaterial({ color: 0x228B22, roughness: 0.8 });
    const grass = new THREE.Mesh(grassGeo, grassMat);
    grass.rotation.x = -Math.PI / 2;
    grass.rotation.z = Math.PI / 2;
    grass.position.y = -0.01;
    grass.receiveShadow = true;
    this.engine.add(grass);
    
    // Home plate
    const plateGeo = new THREE.BoxGeometry(0.43, 0.02, 0.43);
    const plateMat = new THREE.MeshStandardMaterial({ color: 0xffffff });
    const plate = new THREE.Mesh(plateGeo, plateMat);
    plate.position.set(0, 0.01, 0);
    this.engine.add(plate);
    
    // Pitcher's mound
    const moundGeo = new THREE.CylinderGeometry(2, 2.5, 0.25, 16);
    const mound = new THREE.Mesh(moundGeo, dirtMat);
    mound.position.set(0, 0.125, 18.4);
    this.engine.add(mound);
    
    // Pitcher's rubber
    const rubberGeo = new THREE.BoxGeometry(0.61, 0.02, 0.15);
    const rubber = new THREE.Mesh(rubberGeo, plateMat);
    rubber.position.set(0, 0.26, 18.4);
    this.engine.add(rubber);
    
    // Foul lines
    const lineMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    
    [-1, 1].forEach(side => {
      const lineGeo = new THREE.PlaneGeometry(0.1, 150);
      const line = new THREE.Mesh(lineGeo, lineMat);
      line.rotation.x = -Math.PI / 2;
      line.rotation.z = side * this.foulLineAngle;
      line.position.set(side * 53, 0.02, 53);
      this.engine.add(line);
    });
    
    // Outfield wall
    const wallGeo = new THREE.CylinderGeometry(this.homeRunDistance, this.homeRunDistance, 3, 32, 1, true, 0, Math.PI);
    const wallMat = new THREE.MeshStandardMaterial({ color: 0x006633, side: THREE.DoubleSide });
    const wall = new THREE.Mesh(wallGeo, wallMat);
    wall.rotation.y = Math.PI / 2;
    wall.position.y = 1.5;
    this.engine.add(wall);
    
    // Distance markers
    [90, 100, 110, 120].forEach(dist => {
      const markerGeo = new THREE.PlaneGeometry(3, 1);
      const markerMat = new THREE.MeshBasicMaterial({ color: 0xffff00 });
      const marker = new THREE.Mesh(markerGeo, markerMat);
      marker.position.set(0, 2, dist);
      marker.rotation.y = Math.PI;
      this.engine.add(marker);
    });
  }

  private createBat(): void {
    const batGroup = new THREE.Group();
    
    // Handle
    const handleGeo = new THREE.CylinderGeometry(0.02, 0.025, 0.4, 8);
    const handleMat = new THREE.MeshStandardMaterial({ color: 0x8B4513 });
    const handle = new THREE.Mesh(handleGeo, handleMat);
    handle.position.y = -0.2;
    batGroup.add(handle);
    
    // Barrel
    const barrelGeo = new THREE.CylinderGeometry(0.035, 0.025, 0.6, 8);
    const barrelMat = new THREE.MeshStandardMaterial({ color: 0xdeb887 });
    const barrel = new THREE.Mesh(barrelGeo, barrelMat);
    barrel.position.y = 0.3;
    batGroup.add(barrel);
    
    // Knob
    const knobGeo = new THREE.SphereGeometry(0.03, 8, 8);
    const knob = new THREE.Mesh(knobGeo, handleMat);
    knob.position.y = -0.42;
    batGroup.add(knob);
    
    batGroup.rotation.x = -Math.PI / 4;
    batGroup.rotation.z = Math.PI / 6;
    batGroup.position.set(0.5, 1, -0.5);
    batGroup.castShadow = true;
    this.engine.add(batGroup);
    
    this.bat = {
      mesh: batGroup,
      position: batGroup.position.clone(),
      swingAngle: 0,
      isSwinging: false,
      swingPower: 0,
    };
  }

  private createBall(): void {
    const ballGeo = new THREE.SphereGeometry(0.037, 16, 16);
    const ballMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.4 });
    const mesh = new THREE.Mesh(ballGeo, ballMat);
    mesh.castShadow = true;
    this.engine.add(mesh);
    
    this.ball = {
      mesh,
      position: new THREE.Vector3(),
      velocity: new THREE.Vector3(),
      spin: new THREE.Vector3(),
      isInPlay: false,
      isPitched: false,
      isHit: false,
    };
  }

  private preparePitch(): void {
    this.isPitching = true;
    this.pitchTimer = 2;
    
    this.ball.position.set(0, 1.8, 18.4);
    this.ball.mesh.position.copy(this.ball.position);
    this.ball.velocity.set(0, 0, 0);
    this.ball.isInPlay = false;
    this.ball.isPitched = false;
    this.ball.isHit = false;
    
    // Random pitch type
    const pitches: PitchType[] = ['fastball', 'curveball', 'slider', 'changeup'];
    this.currentPitch = pitches[Math.floor(Math.random() * pitches.length)];
  }

  private throwPitch(): void {
    this.ball.isPitched = true;
    this.ball.isInPlay = true;
    
    let speed: number;
    let spinX: number;
    let spinY: number;
    
    switch (this.currentPitch) {
      case 'fastball':
        speed = 40; // ~90 mph
        spinX = 0;
        spinY = 0;
        break;
      case 'curveball':
        speed = 32;
        spinX = 5;
        spinY = 0;
        break;
      case 'slider':
        speed = 35;
        spinX = 2;
        spinY = 3;
        break;
      case 'changeup':
        speed = 28;
        spinX = -1;
        spinY = 0;
        break;
      default:
        speed = 35;
        spinX = 0;
        spinY = 0;
    }
    
    this.ball.velocity.set(
      (Math.random() - 0.5) * 2,
      -1 + (Math.random() - 0.5),
      -speed
    );
    
    this.ball.spin.set(spinX, spinY, 0);
  }

  protected update(deltaTime: number, input: InputState): void {
    this.updatePitching(deltaTime);
    this.updateBat(deltaTime, input);
    this.updateBall(deltaTime);
    
    // Camera follows hit ball
    if (this.ball.isHit && this.ball.position.z > 10) {
      const cameraTarget = new THREE.Vector3(
        this.ball.position.x * 0.3,
        Math.max(5, this.ball.position.y * 0.5),
        -10
      );
      this.engine.camera.position.lerp(cameraTarget, 0.02);
      this.engine.camera.lookAt(this.ball.position);
    }
  }

  protected fixedUpdate(fixedDeltaTime: number): void {}

  private updatePitching(deltaTime: number): void {
    if (!this.isPitching) return;
    
    this.pitchTimer -= deltaTime;
    
    if (this.pitchTimer <= 0 && !this.ball.isPitched) {
      this.throwPitch();
      this.isPitching = false;
    }
  }

  private updateBat(deltaTime: number, input: InputState): void {
    // Bat position follows mouse/input
    this.bat.position.x = 0.5 + input.virtual.lookX * 0.3;
    this.bat.position.y = 1 + input.virtual.lookY * 0.3;
    
    if (!this.bat.isSwinging) {
      this.bat.mesh.position.copy(this.bat.position);
      
      // Start swing
      if (input.virtual.firePressed && this.ball.isPitched && !this.ball.isHit) {
        this.bat.isSwinging = true;
        this.bat.swingAngle = 0;
        this.bat.swingPower = 0.8 + Math.random() * 0.2;
      }
    } else {
      // Animate swing
      this.bat.swingAngle += deltaTime * 15;
      
      this.bat.mesh.rotation.y = -Math.PI / 2 + this.bat.swingAngle;
      this.bat.mesh.rotation.z = Math.PI / 6 - this.bat.swingAngle * 0.3;
      
      // Check for contact
      if (this.bat.swingAngle > 0.5 && this.bat.swingAngle < 1.5 && !this.ball.isHit) {
        this.checkBatContact();
      }
      
      // End swing
      if (this.bat.swingAngle > Math.PI) {
        this.bat.isSwinging = false;
        this.bat.mesh.rotation.y = 0;
        this.bat.mesh.rotation.z = Math.PI / 6;
      }
    }
  }

  private checkBatContact(): void {
    const batTip = this.bat.position.clone().add(new THREE.Vector3(0, 0.5, 0.3));
    const dist = this.ball.position.distanceTo(batTip);
    
    if (dist < 0.3 && this.ball.position.z < 1 && this.ball.position.z > -1) {
      this.hitBall();
    }
  }

  private hitBall(): void {
    this.ball.isHit = true;
    
    // Calculate hit based on timing
    const timing = this.bat.swingAngle;
    const isPerfect = timing > 0.9 && timing < 1.1;
    
    const power = this.bat.swingPower * (isPerfect ? 1.2 : 0.8);
    const launchAngle = 25 + (Math.random() - 0.5) * 20;
    const direction = (timing - 1) * 0.5; // Pull/push based on timing
    
    const speed = 40 + power * 20;
    const launchRad = (launchAngle * Math.PI) / 180;
    
    this.ball.velocity.set(
      Math.sin(direction) * speed * Math.cos(launchRad),
      speed * Math.sin(launchRad),
      Math.cos(direction) * speed * Math.cos(launchRad)
    );
    
    this.ball.spin.set(0, 0, 0);
    
    this.screenShake(0.2, 0.15);
  }

  private updateBall(deltaTime: number): void {
    if (!this.ball.isInPlay) return;
    
    // Gravity
    this.ball.velocity.y -= 9.81 * deltaTime;
    
    // Spin effect (Magnus force)
    if (!this.ball.isHit) {
      const magnus = this.ball.spin.clone().cross(this.ball.velocity).multiplyScalar(0.01);
      this.ball.velocity.add(magnus);
    }
    
    // Air resistance
    this.ball.velocity.multiplyScalar(0.999);
    
    // Update position
    this.ball.position.addScaledVector(this.ball.velocity, deltaTime);
    this.ball.mesh.position.copy(this.ball.position);
    
    // Ground collision
    if (this.ball.position.y <= 0.037) {
      if (this.ball.isHit) {
        this.endPlay();
      } else {
        // Strike/ball
        this.pitchCount++;
        if (this.pitchCount >= this.maxPitches) {
          this.end(true);
        } else {
          this.preparePitch();
        }
      }
    }
    
    // Check for home run
    if (this.ball.isHit) {
      const distance = Math.sqrt(this.ball.position.x ** 2 + this.ball.position.z ** 2);
      
      if (distance >= this.homeRunDistance && this.ball.position.y > 3) {
        this.homeRuns++;
        this.addScore(100);
        this.totalDistance += distance;
        this.longestHit = Math.max(this.longestHit, distance);
        this.endPlay();
      }
    }
    
    // Out of play
    if (this.ball.position.z < -10 || Math.abs(this.ball.position.x) > 100) {
      if (!this.ball.isHit) {
        this.pitchCount++;
        if (this.pitchCount >= this.maxPitches) {
          this.end(true);
        } else {
          this.preparePitch();
        }
      } else {
        this.endPlay();
      }
    }
  }

  private endPlay(): void {
    if (this.ball.isHit) {
      const distance = Math.sqrt(this.ball.position.x ** 2 + this.ball.position.z ** 2);
      this.totalDistance += distance;
      this.longestHit = Math.max(this.longestHit, distance);
      
      // Check if fair ball
      const angle = Math.atan2(this.ball.position.x, this.ball.position.z);
      if (Math.abs(angle) < this.foulLineAngle) {
        this.addScore(Math.round(distance / 10));
      }
    }
    
    this.pitchCount++;
    
    if (this.pitchCount >= this.maxPitches) {
      this.end(true);
    } else {
      // Reset camera
      this.engine.camera.position.set(0, 2, -5);
      this.engine.camera.lookAt(0, 1, 20);
      this.preparePitch();
    }
  }

  public getPitchCount(): number { return this.pitchCount; }
  public getMaxPitches(): number { return this.maxPitches; }
  public getHomeRuns(): number { return this.homeRuns; }
  public getTotalDistance(): number { return this.totalDistance; }
  public getLongestHit(): number { return this.longestHit; }
  public getCurrentPitch(): PitchType { return this.currentPitch; }
  public isPitchIncoming(): boolean { return this.ball.isPitched && !this.ball.isHit; }

  protected cleanup(): void {
    this.engine.remove(this.ball.mesh);
    this.engine.remove(this.bat.mesh);
  }
}

export default BaseballGame;
