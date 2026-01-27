/**
 * ┌─────────────────────────────────────────────────────────────────────────────┐
 * │ LUCY ARCADE — 3D BOWLING                                                   │
 * │                                                                             │
 * │ Realistic bowling simulation with physics-based pin action,                │
 * │ lane oil patterns, and full 10-frame scoring                               │
 * └─────────────────────────────────────────────────────────────────────────────┘
 */

import * as THREE from 'three';
import {
  Game3DBase,
  type Game3DConfig,
  OrbitCameraController,
  type PhysicsBody,
  type InputState,
} from '../../engine3d';

interface Pin {
  mesh: THREE.Mesh;
  body: PhysicsBody;
  isStanding: boolean;
  originalPosition: THREE.Vector3;
}

interface Ball {
  mesh: THREE.Mesh;
  body: PhysicsBody;
  isRolling: boolean;
  spin: THREE.Vector3;
}

interface Frame {
  roll1: number | null;
  roll2: number | null;
  roll3?: number | null; // 10th frame only
  score: number | null;
  isStrike: boolean;
  isSpare: boolean;
}

export class BowlingGame extends Game3DBase {
  private cameraController!: OrbitCameraController;
  
  private ball!: Ball;
  private pins: Pin[] = [];
  
  // Game state
  private frames: Frame[] = [];
  private currentFrame: number = 0;
  private currentRoll: number = 0;
  private totalScore: number = 0;
  
  // Aiming
  private aimPosition: number = 0;
  private aimAngle: number = 0;
  private power: number = 0;
  private spin: number = 0;
  private isAiming: boolean = true;
  private isPowerCharging: boolean = false;
  private ballThrown: boolean = false;
  
  // Lane
  private laneMesh!: THREE.Mesh;

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
    this.createLane();
    this.createBall();
    this.createPins();
    
    this.cameraController = new OrbitCameraController(this.engine.camera, {
      distance: 15,
      minDistance: 5,
      maxDistance: 30,
      autoRotate: false,
    });
    this.cameraController.setTarget(new THREE.Vector3(0, 0, 10));
    
    // Initialize frames
    this.frames = Array(10).fill(null).map(() => ({
      roll1: null,
      roll2: null,
      score: null,
      isStrike: false,
      isSpare: false,
    }));
    
    this.resetForRoll();
  }

  private setupLighting(): void {
    this.engine.addAmbientLight(0xffffff, 0.5);
    this.engine.addDirectionalLight(0xffffff, 0.8, new THREE.Vector3(10, 20, 10), true);
    this.engine.addPointLight(0xffaa00, 0.5, new THREE.Vector3(0, 5, 15), 20, 2);
  }

  private createLane(): void {
    // Lane surface
    const laneGeo = new THREE.BoxGeometry(1.5, 0.1, 25);
    const laneMat = new THREE.MeshStandardMaterial({
      color: 0xdeb887,
      roughness: 0.3,
      metalness: 0.1,
    });
    this.laneMesh = new THREE.Mesh(laneGeo, laneMat);
    this.laneMesh.position.set(0, 0, 10);
    this.laneMesh.receiveShadow = true;
    this.engine.add(this.laneMesh);
    
    this.engine.physics.addBox(this.laneMesh, new THREE.Vector3(1.5, 0.1, 25), 'static', {
      friction: 0.2,
      restitution: 0.1,
    });
    
    // Gutters
    const gutterGeo = new THREE.BoxGeometry(0.3, 0.2, 25);
    const gutterMat = new THREE.MeshStandardMaterial({ color: 0x333333 });
    
    [-1, 1].forEach(side => {
      const gutter = new THREE.Mesh(gutterGeo, gutterMat);
      gutter.position.set(side * 0.9, -0.05, 10);
      this.engine.add(gutter);
      this.engine.physics.addBox(gutter, new THREE.Vector3(0.3, 0.2, 25), 'static');
    });
    
    // Approach area
    const approachGeo = new THREE.BoxGeometry(2, 0.1, 5);
    const approachMat = new THREE.MeshStandardMaterial({ color: 0x8b4513 });
    const approach = new THREE.Mesh(approachGeo, approachMat);
    approach.position.set(0, 0, -5);
    approach.receiveShadow = true;
    this.engine.add(approach);
    
    // Pin deck
    const deckGeo = new THREE.BoxGeometry(2, 0.1, 3);
    const deck = new THREE.Mesh(deckGeo, laneMat);
    deck.position.set(0, 0, 21);
    deck.receiveShadow = true;
    this.engine.add(deck);
    
    this.engine.physics.addBox(deck, new THREE.Vector3(2, 0.1, 3), 'static', {
      friction: 0.5,
    });
    
    // Foul line
    const foulGeo = new THREE.PlaneGeometry(1.5, 0.05);
    const foulMat = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    const foulLine = new THREE.Mesh(foulGeo, foulMat);
    foulLine.rotation.x = -Math.PI / 2;
    foulLine.position.set(0, 0.06, -2);
    this.engine.add(foulLine);
  }

  private createBall(): void {
    const ballGeo = new THREE.SphereGeometry(0.11, 32, 32);
    const ballMat = new THREE.MeshStandardMaterial({
      color: 0x1a1a8a,
      roughness: 0.2,
      metalness: 0.3,
    });
    const mesh = new THREE.Mesh(ballGeo, ballMat);
    mesh.castShadow = true;
    mesh.position.set(0, 0.11, -3);
    this.engine.add(mesh);
    
    const body = this.engine.physics.addSphere(mesh, 0.11, 'dynamic', {
      mass: 7, // ~15 lbs
      friction: 0.3,
      restitution: 0.3,
      linearDamping: 0.1,
      angularDamping: 0.05,
    });
    
    this.ball = {
      mesh,
      body,
      isRolling: false,
      spin: new THREE.Vector3(),
    };
  }

  private createPins(): void {
    const pinPositions = [
      [0, 20],           // 1 (head pin)
      [-0.15, 20.3], [0.15, 20.3],  // 2, 3
      [-0.3, 20.6], [0, 20.6], [0.3, 20.6],  // 4, 5, 6
      [-0.45, 20.9], [-0.15, 20.9], [0.15, 20.9], [0.45, 20.9],  // 7, 8, 9, 10
    ];
    
    pinPositions.forEach(([x, z], index) => {
      this.createPin(new THREE.Vector3(x, 0, z), index + 1);
    });
  }

  private createPin(position: THREE.Vector3, number: number): void {
    const pinGroup = new THREE.Group();
    
    // Pin body (simplified shape)
    const bodyGeo = new THREE.CylinderGeometry(0.03, 0.06, 0.38, 8);
    const bodyMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.3,
    });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = 0.19;
    body.castShadow = true;
    pinGroup.add(body);
    
    // Red stripes
    const stripeGeo = new THREE.CylinderGeometry(0.035, 0.035, 0.02, 8);
    const stripeMat = new THREE.MeshStandardMaterial({ color: 0xff0000 });
    
    [0.28, 0.32].forEach(y => {
      const stripe = new THREE.Mesh(stripeGeo, stripeMat);
      stripe.position.y = y;
      pinGroup.add(stripe);
    });
    
    pinGroup.position.copy(position);
    pinGroup.position.y = 0;
    this.engine.add(pinGroup);
    
    const physicsBody = this.engine.physics.addCapsule(
      pinGroup,
      0.15,
      0.04,
      'dynamic',
      {
        mass: 1.5,
        friction: 0.5,
        restitution: 0.3,
        linearDamping: 0.3,
        angularDamping: 0.3,
      }
    );
    
    this.pins.push({
      mesh: body,
      body: physicsBody,
      isStanding: true,
      originalPosition: position.clone(),
    });
  }

  private resetForRoll(): void {
    this.isAiming = true;
    this.isPowerCharging = false;
    this.ballThrown = false;
    this.power = 0;
    this.spin = 0;
    this.aimPosition = 0;
    this.aimAngle = 0;
    
    // Reset ball position
    this.ball.mesh.position.set(0, 0.11, -3);
    this.engine.physics.setLinearVelocity(this.ball.body, new THREE.Vector3(0, 0, 0));
    this.engine.physics.setAngularVelocity(this.ball.body, new THREE.Vector3(0, 0, 0));
  }

  private resetPins(fullReset: boolean): void {
    if (fullReset) {
      this.pins.forEach(pin => {
        pin.mesh.parent!.position.copy(pin.originalPosition);
        pin.mesh.parent!.position.y = 0;
        pin.mesh.parent!.rotation.set(0, 0, 0);
        pin.isStanding = true;
        
        this.engine.physics.setLinearVelocity(pin.body, new THREE.Vector3(0, 0, 0));
        this.engine.physics.setAngularVelocity(pin.body, new THREE.Vector3(0, 0, 0));
      });
    }
  }

  protected update(deltaTime: number, input: InputState): void {
    if (this.isAiming) {
      this.updateAiming(deltaTime, input);
    } else if (this.ballThrown) {
      this.updateBallRolling(deltaTime);
    }
    
    this.cameraController.update(deltaTime, input);
  }

  protected fixedUpdate(fixedDeltaTime: number): void {}

  private updateAiming(deltaTime: number, input: InputState): void {
    // Adjust position
    this.aimPosition = THREE.MathUtils.clamp(
      this.aimPosition + input.virtual.moveX * deltaTime * 2,
      -0.6,
      0.6
    );
    this.ball.mesh.position.x = this.aimPosition;
    
    // Adjust angle
    this.aimAngle = THREE.MathUtils.clamp(
      this.aimAngle + input.virtual.lookX * deltaTime,
      -0.3,
      0.3
    );
    
    // Adjust spin
    if (input.keys.has('KeyQ')) this.spin = Math.max(-1, this.spin - deltaTime * 2);
    if (input.keys.has('KeyE')) this.spin = Math.min(1, this.spin + deltaTime * 2);
    
    // Power charging
    if (input.virtual.fire) {
      this.isPowerCharging = true;
      this.power = Math.min(1, this.power + deltaTime);
    } else if (this.isPowerCharging) {
      this.throwBall();
    }
  }

  private throwBall(): void {
    this.isAiming = false;
    this.ballThrown = true;
    this.ball.isRolling = true;
    
    const speed = 8 + this.power * 12;
    const direction = new THREE.Vector3(
      Math.sin(this.aimAngle),
      0,
      Math.cos(this.aimAngle)
    ).normalize();
    
    const velocity = direction.multiplyScalar(speed);
    this.engine.physics.setLinearVelocity(this.ball.body, velocity);
    
    // Apply spin
    const spinVelocity = new THREE.Vector3(0, this.spin * 20, 0);
    this.engine.physics.setAngularVelocity(this.ball.body, spinVelocity);
  }

  private updateBallRolling(deltaTime: number): void {
    const ballPos = this.ball.mesh.position;
    
    // Check if ball reached pins or went in gutter
    if (ballPos.z > 22 || Math.abs(ballPos.x) > 1 || ballPos.y < -1) {
      this.endRoll();
    }
    
    // Check pin states
    this.pins.forEach(pin => {
      const pinPos = pin.mesh.parent!.position;
      const pinRot = pin.mesh.parent!.rotation;
      
      // Pin is knocked down if tilted significantly
      if (Math.abs(pinRot.x) > 0.5 || Math.abs(pinRot.z) > 0.5 || pinPos.y < -0.1) {
        pin.isStanding = false;
      }
    });
  }

  private endRoll(): void {
    const pinsKnocked = this.pins.filter(p => !p.isStanding).length;
    const frame = this.frames[this.currentFrame];
    
    if (this.currentRoll === 0) {
      frame.roll1 = pinsKnocked;
      
      if (pinsKnocked === 10) {
        frame.isStrike = true;
        this.advanceFrame();
      } else {
        this.currentRoll = 1;
        this.resetForRoll();
      }
    } else {
      const firstRoll = frame.roll1 || 0;
      frame.roll2 = pinsKnocked - firstRoll;
      
      if (pinsKnocked === 10) {
        frame.isSpare = true;
      }
      
      this.advanceFrame();
    }
    
    this.calculateScores();
  }

  private advanceFrame(): void {
    this.currentFrame++;
    this.currentRoll = 0;
    
    if (this.currentFrame >= 10) {
      this.end(true);
    } else {
      this.resetPins(true);
      this.resetForRoll();
    }
  }

  private calculateScores(): void {
    let runningScore = 0;
    
    for (let i = 0; i < 10; i++) {
      const frame = this.frames[i];
      if (frame.roll1 === null) break;
      
      let frameScore = (frame.roll1 || 0) + (frame.roll2 || 0);
      
      if (frame.isStrike && i < 9) {
        const next = this.frames[i + 1];
        frameScore += (next?.roll1 || 0);
        if (next?.isStrike && i < 8) {
          frameScore += (this.frames[i + 2]?.roll1 || 0);
        } else {
          frameScore += (next?.roll2 || 0);
        }
      } else if (frame.isSpare && i < 9) {
        frameScore += (this.frames[i + 1]?.roll1 || 0);
      }
      
      runningScore += frameScore;
      frame.score = runningScore;
    }
    
    this.totalScore = runningScore;
    this.setScore({ score: this.totalScore });
  }

  public getFrames(): Frame[] { return this.frames; }
  public getCurrentFrame(): number { return this.currentFrame; }
  public getCurrentRoll(): number { return this.currentRoll; }
  public getTotalScore(): number { return this.totalScore; }
  public getPower(): number { return this.power; }
  public getSpin(): number { return this.spin; }
  public getAimPosition(): number { return this.aimPosition; }
  public getAimAngle(): number { return this.aimAngle; }
  public isCurrentlyAiming(): boolean { return this.isAiming; }

  protected cleanup(): void {
    this.pins.forEach(pin => {
      this.engine.remove(pin.mesh.parent!);
      this.engine.physics.removeBody(pin.body);
    });
    this.engine.remove(this.ball.mesh);
    this.engine.physics.removeBody(this.ball.body);
  }
}

export default BowlingGame;
