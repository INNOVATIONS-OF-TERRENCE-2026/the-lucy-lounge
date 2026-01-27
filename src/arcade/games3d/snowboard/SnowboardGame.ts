/**
 * ┌─────────────────────────────────────────────────────────────────────────────┐
 * │ LUCY ARCADE — 3D SNOWBOARD                                                 │
 * │                                                                             │
 * │ Extreme snowboarding with physics-based tricks, procedural mountains,      │
 * │ and high-speed downhill racing                                             │
 * └─────────────────────────────────────────────────────────────────────────────┘
 */

import * as THREE from 'three';
import {
  Game3DBase,
  type Game3DConfig,
  ThirdPersonCameraController,
  type PhysicsBody,
  type InputState,
} from '../../engine3d';

interface Trick {
  name: string;
  points: number;
  rotationType: 'spin' | 'flip' | 'grab';
}

const TRICKS: Record<string, Trick> = {
  grab: { name: 'Grab', points: 50, rotationType: 'grab' },
  spin180: { name: '180', points: 100, rotationType: 'spin' },
  spin360: { name: '360', points: 200, rotationType: 'spin' },
  spin540: { name: '540', points: 350, rotationType: 'spin' },
  spin720: { name: '720', points: 500, rotationType: 'spin' },
  frontflip: { name: 'Front Flip', points: 300, rotationType: 'flip' },
  backflip: { name: 'Back Flip', points: 300, rotationType: 'flip' },
  rodeo: { name: 'Rodeo', points: 400, rotationType: 'flip' },
};

export class SnowboardGame extends Game3DBase {
  private cameraController!: ThirdPersonCameraController;
  
  // Rider
  private riderMesh!: THREE.Group;
  private riderBody!: PhysicsBody;
  private position: THREE.Vector3 = new THREE.Vector3();
  private velocity: THREE.Vector3 = new THREE.Vector3();
  private rotation: number = 0;
  
  // State
  private isGrounded: boolean = true;
  private isCarving: boolean = false;
  private spinRotation: number = 0;
  private flipRotation: number = 0;
  private isGrabbing: boolean = false;
  
  // Tricks
  private currentTrick: Trick | null = null;
  private trickStartRotation: number = 0;
  private trickList: string[] = [];
  
  // Combo
  private combo: number = 0;
  private comboMultiplier: number = 1;
  private comboTimer: number = 0;
  
  // Course
  private courseLength: number = 1000;
  private distanceTraveled: number = 0;
  private checkpoints: THREE.Vector3[] = [];
  private currentCheckpoint: number = 0;

  constructor(container: HTMLElement, config?: Game3DConfig) {
    super(container, {
      ...config,
      engineConfig: {
        shadows: true,
        bloom: true,
        bloomStrength: 0.5,
        fog: { color: 0xaaccff, near: 50, far: 300 },
        ...config?.engineConfig,
      },
    });
  }

  protected async loadAssets(): Promise<void> {}

  protected initScene(): void {
    this.setupLighting();
    this.createMountain();
    this.createRider();
    this.createObstacles();
    
    this.cameraController = new ThirdPersonCameraController(this.engine.camera, {
      distance: 10,
      height: 4,
      minPitch: 0.1,
      maxPitch: 0.6,
    });
    
    this.createGradientSkybox(0x88aaff, 0xffffff);
  }

  private setupLighting(): void {
    this.engine.addAmbientLight(0xaaccff, 0.6);
    this.engine.addDirectionalLight(0xffffff, 1.0, new THREE.Vector3(50, 100, 30), true);
  }

  private createMountain(): void {
    // Generate procedural mountain slope
    const width = 50;
    const length = this.courseLength;
    const segments = 200;
    
    const geometry = new THREE.PlaneGeometry(width, length, 50, segments);
    const positions = geometry.attributes.position;
    
    // Create downhill slope with terrain variation
    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i);
      const y = positions.getY(i);
      
      // Base slope
      let z = y * 0.3; // Downhill gradient
      
      // Add terrain variation
      z += Math.sin(x * 0.2) * Math.cos(y * 0.05) * 2;
      z += Math.sin(x * 0.1 + y * 0.02) * 3;
      
      // Create half-pipe walls on sides
      const edgeDist = Math.abs(x) - width / 2 + 8;
      if (edgeDist > 0) {
        z += edgeDist * edgeDist * 0.1;
      }
      
      positions.setZ(i, z);
    }
    
    geometry.computeVertexNormals();
    
    const material = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.8,
    });
    
    const mountain = new THREE.Mesh(geometry, material);
    mountain.rotation.x = -Math.PI / 2;
    mountain.position.set(0, 0, length / 2);
    mountain.receiveShadow = true;
    this.engine.add(mountain);
    
    this.engine.physics.addTrimesh(mountain, { friction: 0.1, restitution: 0.1 });
    
    // Add trees along the sides
    for (let z = 0; z < length; z += 20) {
      [-20, 20].forEach(x => {
        if (Math.random() > 0.3) {
          this.createTree(new THREE.Vector3(x + (Math.random() - 0.5) * 5, 0, z));
        }
      });
    }
    
    // Create checkpoints
    for (let i = 0; i < 10; i++) {
      this.checkpoints.push(new THREE.Vector3(0, 0, (i + 1) * 100));
    }
  }

  private createTree(position: THREE.Vector3): void {
    const trunkGeo = new THREE.CylinderGeometry(0.2, 0.3, 3, 8);
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x4a3728 });
    const trunk = new THREE.Mesh(trunkGeo, trunkMat);
    trunk.position.copy(position);
    trunk.position.y = 1.5;
    trunk.castShadow = true;
    this.engine.add(trunk);
    
    const foliageGeo = new THREE.ConeGeometry(2, 5, 8);
    const foliageMat = new THREE.MeshStandardMaterial({ color: 0x1a4a1a });
    const foliage = new THREE.Mesh(foliageGeo, foliageMat);
    foliage.position.copy(position);
    foliage.position.y = 5.5;
    foliage.castShadow = true;
    this.engine.add(foliage);
  }

  private createObstacles(): void {
    // Jumps/kickers
    const jumpPositions = [50, 150, 280, 400, 550, 700, 850];
    
    jumpPositions.forEach(z => {
      this.createJump(new THREE.Vector3((Math.random() - 0.5) * 20, 0, z));
    });
    
    // Rails
    const railPositions = [100, 250, 450, 650, 800];
    
    railPositions.forEach(z => {
      this.createRail(new THREE.Vector3((Math.random() - 0.5) * 15, 0, z), 10);
    });
  }

  private createJump(position: THREE.Vector3): void {
    const jumpGeo = new THREE.BoxGeometry(8, 2, 4);
    const jumpMat = new THREE.MeshStandardMaterial({ color: 0xeeeeee });
    const jump = new THREE.Mesh(jumpGeo, jumpMat);
    
    // Angle the jump
    jump.rotation.x = -0.3;
    jump.position.copy(position);
    jump.position.y = 1;
    jump.castShadow = true;
    jump.receiveShadow = true;
    this.engine.add(jump);
    
    this.engine.physics.addBox(jump, new THREE.Vector3(8, 2, 4), 'static');
  }

  private createRail(position: THREE.Vector3, length: number): void {
    const railGeo = new THREE.CylinderGeometry(0.05, 0.05, length, 8);
    const railMat = new THREE.MeshStandardMaterial({ color: 0x888888, metalness: 0.8 });
    const rail = new THREE.Mesh(railGeo, railMat);
    rail.rotation.x = Math.PI / 2;
    rail.position.copy(position);
    rail.position.y = 0.5;
    rail.castShadow = true;
    rail.userData = { isRail: true };
    this.engine.add(rail);
    
    // Support posts
    const postGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.5, 8);
    [-length / 2 + 1, length / 2 - 1].forEach(offset => {
      const post = new THREE.Mesh(postGeo, railMat);
      post.position.copy(position);
      post.position.z += offset;
      post.position.y = 0.25;
      this.engine.add(post);
    });
  }

  private createRider(): void {
    this.riderMesh = new THREE.Group();
    
    // Body
    const bodyGeo = new THREE.CapsuleGeometry(0.2, 0.5, 4, 8);
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0x333333 });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = 0.9;
    body.castShadow = true;
    this.riderMesh.add(body);
    
    // Head with helmet
    const helmetGeo = new THREE.SphereGeometry(0.15, 16, 16);
    const helmetMat = new THREE.MeshStandardMaterial({ color: 0xff0000 });
    const helmet = new THREE.Mesh(helmetGeo, helmetMat);
    helmet.position.y = 1.4;
    this.riderMesh.add(helmet);
    
    // Goggles
    const goggleGeo = new THREE.BoxGeometry(0.2, 0.05, 0.05);
    const goggleMat = new THREE.MeshStandardMaterial({ color: 0x000000 });
    const goggles = new THREE.Mesh(goggleGeo, goggleMat);
    goggles.position.set(0, 1.4, 0.12);
    this.riderMesh.add(goggles);
    
    // Snowboard
    const boardGeo = new THREE.BoxGeometry(0.3, 0.03, 1.5);
    const boardMat = new THREE.MeshStandardMaterial({ color: 0x0066cc });
    const board = new THREE.Mesh(boardGeo, boardMat);
    board.position.y = 0.02;
    board.name = 'board';
    this.riderMesh.add(board);
    
    // Board edges
    const edgeGeo = new THREE.BoxGeometry(0.32, 0.01, 1.52);
    const edgeMat = new THREE.MeshStandardMaterial({ color: 0x333333 });
    const edge = new THREE.Mesh(edgeGeo, edgeMat);
    edge.position.y = 0.01;
    this.riderMesh.add(edge);
    
    this.riderMesh.position.set(0, 1, 10);
    this.position.copy(this.riderMesh.position);
    this.engine.add(this.riderMesh);
    
    this.riderBody = this.engine.physics.addCapsule(
      this.riderMesh,
      0.4,
      0.2,
      'dynamic',
      { mass: 75, linearDamping: 0.1, angularDamping: 0.5 }
    );
  }

  protected update(deltaTime: number, input: InputState): void {
    this.updateRider(deltaTime, input);
    this.updateTricks(deltaTime, input);
    this.updateCombo(deltaTime);
    this.checkProgress();
    
    this.cameraController.setTarget(this.riderMesh.position);
    this.cameraController.update(deltaTime, input);
    
    this.setScore({ score: this.getScore().score, combo: this.comboMultiplier });
  }

  protected fixedUpdate(fixedDeltaTime: number): void {}

  private updateRider(deltaTime: number, input: InputState): void {
    // Ground check
    const rayResult = this.engine.physics.raycast(
      this.riderMesh.position.clone().add(new THREE.Vector3(0, 0.5, 0)),
      new THREE.Vector3(0, -1, 0),
      1.5
    );
    this.isGrounded = rayResult.hit && rayResult.distance! < 1;
    
    // Gravity and downhill acceleration
    const gravity = new THREE.Vector3(0, -20, 0);
    const downhill = new THREE.Vector3(0, 0, 15); // Constant downhill push
    
    this.engine.physics.applyForce(this.riderBody, gravity);
    this.engine.physics.applyForce(this.riderBody, downhill);
    
    // Steering
    if (this.isGrounded) {
      const turnForce = input.virtual.moveX * 30;
      this.rotation += turnForce * deltaTime;
      this.riderMesh.rotation.y = this.rotation;
      
      // Carving
      this.isCarving = Math.abs(input.virtual.moveX) > 0.3;
      if (this.isCarving) {
        const carveForce = new THREE.Vector3(input.virtual.moveX * 20, 0, 0);
        this.engine.physics.applyForce(this.riderBody, carveForce);
      }
      
      // Speed control
      if (input.virtual.moveY > 0) {
        // Tuck for speed
        const speedBoost = new THREE.Vector3(0, 0, 10);
        this.engine.physics.applyForce(this.riderBody, speedBoost);
      } else if (input.virtual.moveY < 0) {
        // Brake
        const vel = this.engine.physics.getLinearVelocity(this.riderBody);
        vel.multiplyScalar(0.98);
        this.engine.physics.setLinearVelocity(this.riderBody, vel);
      }
    }
    
    // Jump
    if (input.keysJustPressed.has('Space') && this.isGrounded) {
      this.engine.physics.applyImpulse(this.riderBody, new THREE.Vector3(0, 10, 0));
    }
    
    this.position.copy(this.riderMesh.position);
    this.distanceTraveled = this.position.z;
  }

  private updateTricks(deltaTime: number, input: InputState): void {
    if (!this.isGrounded) {
      // Spin (left/right)
      if (input.keys.has('KeyA')) {
        this.spinRotation += deltaTime * 360;
        if (!this.currentTrick || this.currentTrick.rotationType !== 'spin') {
          this.currentTrick = TRICKS.spin180;
          this.trickStartRotation = this.spinRotation;
        }
      }
      if (input.keys.has('KeyD')) {
        this.spinRotation -= deltaTime * 360;
        if (!this.currentTrick || this.currentTrick.rotationType !== 'spin') {
          this.currentTrick = TRICKS.spin180;
          this.trickStartRotation = this.spinRotation;
        }
      }
      
      // Flip (forward/back)
      if (input.keys.has('KeyW')) {
        this.flipRotation += deltaTime * 360;
        this.currentTrick = TRICKS.frontflip;
      }
      if (input.keys.has('KeyS')) {
        this.flipRotation -= deltaTime * 360;
        this.currentTrick = TRICKS.backflip;
      }
      
      // Grab
      if (input.keys.has('KeyG')) {
        this.isGrabbing = true;
        if (!this.currentTrick) {
          this.currentTrick = TRICKS.grab;
        }
      } else {
        this.isGrabbing = false;
      }
      
      // Apply visual rotation
      this.riderMesh.rotation.y = this.rotation + THREE.MathUtils.degToRad(this.spinRotation);
      this.riderMesh.rotation.x = THREE.MathUtils.degToRad(this.flipRotation);
    } else {
      // Landing
      if (this.currentTrick) {
        this.landTrick();
      }
      
      // Reset rotations smoothly
      this.spinRotation = THREE.MathUtils.lerp(this.spinRotation, 0, deltaTime * 5);
      this.flipRotation = THREE.MathUtils.lerp(this.flipRotation, 0, deltaTime * 5);
      this.riderMesh.rotation.x = THREE.MathUtils.degToRad(this.flipRotation);
    }
  }

  private landTrick(): void {
    if (!this.currentTrick) return;
    
    // Calculate spin amount
    const totalSpin = Math.abs(this.spinRotation - this.trickStartRotation);
    
    let trick = this.currentTrick;
    
    // Upgrade spin trick based on rotation
    if (this.currentTrick.rotationType === 'spin') {
      if (totalSpin >= 720) trick = TRICKS.spin720;
      else if (totalSpin >= 540) trick = TRICKS.spin540;
      else if (totalSpin >= 360) trick = TRICKS.spin360;
      else if (totalSpin >= 180) trick = TRICKS.spin180;
    }
    
    // Add points
    let points = trick.points;
    if (this.isGrabbing) points *= 1.5;
    points *= this.comboMultiplier;
    
    this.addScore(Math.round(points));
    this.trickList.push(trick.name);
    this.combo++;
    this.comboTimer = 3;
    
    if (this.combo % 3 === 0) {
      this.comboMultiplier = Math.min(5, this.comboMultiplier + 0.5);
    }
    
    this.currentTrick = null;
    this.trickStartRotation = 0;
  }

  private updateCombo(deltaTime: number): void {
    if (this.comboTimer > 0) {
      this.comboTimer -= deltaTime;
      
      if (this.comboTimer <= 0 && this.isGrounded) {
        // End combo
        if (this.combo > 1) {
          const bonus = this.combo * 25 * this.comboMultiplier;
          this.addScore(Math.round(bonus));
        }
        
        this.combo = 0;
        this.comboMultiplier = 1;
        this.trickList = [];
      }
    }
  }

  private checkProgress(): void {
    if (this.currentCheckpoint < this.checkpoints.length) {
      const checkpoint = this.checkpoints[this.currentCheckpoint];
      if (this.position.z >= checkpoint.z) {
        this.currentCheckpoint++;
        this.addScore(200);
      }
    }
    
    // Check finish
    if (this.distanceTraveled >= this.courseLength) {
      this.end(true);
    }
  }

  public getSpeed(): number {
    const vel = this.engine.physics.getLinearVelocity(this.riderBody);
    return vel.length() * 3.6; // Convert to km/h
  }
  public getDistanceTraveled(): number { return this.distanceTraveled; }
  public getCourseLength(): number { return this.courseLength; }
  public getCombo(): number { return this.combo; }
  public getComboMultiplier(): number { return this.comboMultiplier; }
  public getTrickList(): string[] { return [...this.trickList]; }
  public getCurrentTrick(): string | null { return this.currentTrick?.name ?? null; }
  public isRiderGrounded(): boolean { return this.isGrounded; }

  protected cleanup(): void {
    this.engine.remove(this.riderMesh);
    this.engine.physics.removeBody(this.riderBody);
  }
}

export default SnowboardGame;
