/**
 * ┌─────────────────────────────────────────────────────────────────────────────┐
 * │ LUCY ARCADE — 3D PARKOUR                                                   │
 * │                                                                             │
 * │ First-person parkour with wall running, vaulting, sliding,                 │
 * │ and momentum-based movement                                                │
 * └─────────────────────────────────────────────────────────────────────────────┘
 */

import * as THREE from 'three';
import {
  Game3DBase,
  type Game3DConfig,
  FPSCameraController,
  type PhysicsBody,
  type InputState,
} from '../../engine3d';

type MovementState = 'running' | 'jumping' | 'wallrunning' | 'sliding' | 'vaulting' | 'climbing';

export class ParkourGame extends Game3DBase {
  private cameraController!: FPSCameraController;
  
  // Player
  private playerBody!: PhysicsBody;
  private playerMesh!: THREE.Mesh;
  private position: THREE.Vector3 = new THREE.Vector3();
  private velocity: THREE.Vector3 = new THREE.Vector3();
  
  // Movement state
  private movementState: MovementState = 'running';
  private isGrounded: boolean = true;
  private canJump: boolean = true;
  private wallRunSide: 'left' | 'right' | null = null;
  private wallRunTimer: number = 0;
  private slideTimer: number = 0;
  private vaultProgress: number = 0;
  
  // Momentum
  private momentum: number = 0;
  private maxMomentum: number = 100;
  
  // Course
  private checkpoints: THREE.Vector3[] = [];
  private currentCheckpoint: number = 0;
  private courseTime: number = 0;
  private bestTime: number = Infinity;

  constructor(container: HTMLElement, config?: Game3DConfig) {
    super(container, {
      ...config,
      engineConfig: {
        shadows: true,
        bloom: true,
        bloomStrength: 0.4,
        fog: { color: 0x88aacc, near: 30, far: 150 },
        ...config?.engineConfig,
      },
    });
  }

  protected async loadAssets(): Promise<void> {}

  protected initScene(): void {
    this.setupLighting();
    this.createCourse();
    this.createPlayer();
    
    this.cameraController = new FPSCameraController(this.engine.camera, {
      sensitivity: 0.002,
      minPitch: -Math.PI / 2,
      maxPitch: Math.PI / 2,
    });
    
    this.createGradientSkybox(0x88aacc, 0xffffff);
  }

  private setupLighting(): void {
    this.engine.addAmbientLight(0xffffff, 0.5);
    this.engine.addDirectionalLight(0xffffff, 1.0, new THREE.Vector3(30, 50, 20), true);
  }

  private createCourse(): void {
    // Starting platform
    this.createPlatform(new THREE.Vector3(0, 0, 0), new THREE.Vector3(10, 1, 10));
    this.checkpoints.push(new THREE.Vector3(0, 1, 0));
    
    // Section 1: Basic jumps
    this.createPlatform(new THREE.Vector3(0, 0, 15), new THREE.Vector3(5, 1, 5));
    this.createPlatform(new THREE.Vector3(5, 1, 25), new THREE.Vector3(5, 1, 5));
    this.createPlatform(new THREE.Vector3(0, 2, 35), new THREE.Vector3(5, 1, 5));
    this.checkpoints.push(new THREE.Vector3(0, 3, 35));
    
    // Section 2: Wall run corridor
    this.createWall(new THREE.Vector3(-5, 3, 50), new THREE.Vector3(0.5, 8, 30), 'left');
    this.createWall(new THREE.Vector3(5, 3, 50), new THREE.Vector3(0.5, 8, 30), 'right');
    this.createPlatform(new THREE.Vector3(0, -1, 50), new THREE.Vector3(10, 1, 30));
    this.checkpoints.push(new THREE.Vector3(0, 0, 65));
    
    // Section 3: Vaulting obstacles
    this.createVaultObstacle(new THREE.Vector3(0, 0, 80));
    this.createVaultObstacle(new THREE.Vector3(3, 0, 90));
    this.createVaultObstacle(new THREE.Vector3(-2, 0, 100));
    this.createPlatform(new THREE.Vector3(0, 0, 90), new THREE.Vector3(15, 0.1, 40));
    this.checkpoints.push(new THREE.Vector3(0, 1, 110));
    
    // Section 4: Climbing section
    this.createClimbWall(new THREE.Vector3(0, 5, 120), 10);
    this.createPlatform(new THREE.Vector3(0, 10, 125), new THREE.Vector3(8, 1, 10));
    this.checkpoints.push(new THREE.Vector3(0, 11, 125));
    
    // Section 5: Slide tunnels
    this.createSlideTunnel(new THREE.Vector3(0, 10, 140), 20);
    this.createPlatform(new THREE.Vector3(0, 5, 160), new THREE.Vector3(8, 1, 10));
    this.checkpoints.push(new THREE.Vector3(0, 6, 160));
    
    // Section 6: Complex parkour
    this.createPlatform(new THREE.Vector3(-8, 6, 175), new THREE.Vector3(4, 1, 4));
    this.createPlatform(new THREE.Vector3(0, 8, 185), new THREE.Vector3(4, 1, 4));
    this.createPlatform(new THREE.Vector3(8, 10, 195), new THREE.Vector3(4, 1, 4));
    this.createWall(new THREE.Vector3(12, 8, 195), new THREE.Vector3(0.5, 6, 15), 'right');
    this.createPlatform(new THREE.Vector3(0, 12, 210), new THREE.Vector3(10, 1, 10));
    this.checkpoints.push(new THREE.Vector3(0, 13, 210));
    
    // Finish platform
    this.createFinishPlatform(new THREE.Vector3(0, 12, 230));
  }

  private createPlatform(position: THREE.Vector3, size: THREE.Vector3): void {
    const geo = new THREE.BoxGeometry(size.x, size.y, size.z);
    const mat = new THREE.MeshStandardMaterial({ color: 0x444444, roughness: 0.8 });
    const platform = new THREE.Mesh(geo, mat);
    platform.position.copy(position);
    platform.position.y += size.y / 2;
    platform.castShadow = true;
    platform.receiveShadow = true;
    this.engine.add(platform);
    
    this.engine.physics.addBox(platform, size, 'static');
  }

  private createWall(position: THREE.Vector3, size: THREE.Vector3, side: 'left' | 'right'): void {
    const geo = new THREE.BoxGeometry(size.x, size.y, size.z);
    const mat = new THREE.MeshStandardMaterial({ color: 0x666666, roughness: 0.7 });
    const wall = new THREE.Mesh(geo, mat);
    wall.position.copy(position);
    wall.castShadow = true;
    wall.receiveShadow = true;
    wall.userData = { isWallRunnable: true, side };
    this.engine.add(wall);
    
    this.engine.physics.addBox(wall, size, 'static');
  }

  private createVaultObstacle(position: THREE.Vector3): void {
    const geo = new THREE.BoxGeometry(3, 1, 0.5);
    const mat = new THREE.MeshStandardMaterial({ color: 0x888888 });
    const obstacle = new THREE.Mesh(geo, mat);
    obstacle.position.copy(position);
    obstacle.position.y = 0.5;
    obstacle.castShadow = true;
    obstacle.userData = { isVaultable: true };
    this.engine.add(obstacle);
    
    this.engine.physics.addBox(obstacle, new THREE.Vector3(3, 1, 0.5), 'static');
  }

  private createClimbWall(position: THREE.Vector3, height: number): void {
    const geo = new THREE.BoxGeometry(4, height, 1);
    const mat = new THREE.MeshStandardMaterial({ color: 0x555555 });
    const wall = new THREE.Mesh(geo, mat);
    wall.position.copy(position);
    wall.castShadow = true;
    wall.receiveShadow = true;
    wall.userData = { isClimbable: true };
    this.engine.add(wall);
    
    this.engine.physics.addBox(wall, new THREE.Vector3(4, height, 1), 'static');
    
    // Ledges for climbing
    for (let y = 2; y < height; y += 2) {
      const ledgeGeo = new THREE.BoxGeometry(4, 0.1, 0.3);
      const ledge = new THREE.Mesh(ledgeGeo, mat);
      ledge.position.set(position.x, position.y - height / 2 + y, position.z + 0.5);
      this.engine.add(ledge);
    }
  }

  private createSlideTunnel(position: THREE.Vector3, length: number): void {
    // Floor
    const floorGeo = new THREE.BoxGeometry(4, 0.2, length);
    const floorMat = new THREE.MeshStandardMaterial({ color: 0x333333 });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.position.copy(position);
    floor.position.z += length / 2;
    floor.rotation.x = 0.2; // Slight downward slope
    floor.receiveShadow = true;
    this.engine.add(floor);
    
    this.engine.physics.addBox(floor, new THREE.Vector3(4, 0.2, length), 'static');
    
    // Ceiling (low, forces sliding)
    const ceilingGeo = new THREE.BoxGeometry(4, 0.2, length);
    const ceiling = new THREE.Mesh(ceilingGeo, floorMat);
    ceiling.position.copy(position);
    ceiling.position.y += 1;
    ceiling.position.z += length / 2;
    this.engine.add(ceiling);
    
    this.engine.physics.addBox(ceiling, new THREE.Vector3(4, 0.2, length), 'static');
  }

  private createFinishPlatform(position: THREE.Vector3): void {
    const geo = new THREE.BoxGeometry(10, 1, 10);
    const mat = new THREE.MeshStandardMaterial({ color: 0x00ff00, emissive: 0x004400 });
    const platform = new THREE.Mesh(geo, mat);
    platform.position.copy(position);
    platform.receiveShadow = true;
    platform.userData = { isFinish: true };
    this.engine.add(platform);
    
    this.engine.physics.addBox(platform, new THREE.Vector3(10, 1, 10), 'static');
    
    // Finish marker
    const markerGeo = new THREE.TorusGeometry(3, 0.2, 8, 32);
    const markerMat = new THREE.MeshStandardMaterial({ color: 0xffff00, emissive: 0x444400 });
    const marker = new THREE.Mesh(markerGeo, markerMat);
    marker.position.copy(position);
    marker.position.y += 3;
    marker.rotation.x = Math.PI / 2;
    this.engine.add(marker);
  }

  private createPlayer(): void {
    const geo = new THREE.CapsuleGeometry(0.3, 1, 4, 8);
    const mat = new THREE.MeshStandardMaterial({ color: 0x0066cc, visible: false });
    this.playerMesh = new THREE.Mesh(geo, mat);
    this.playerMesh.position.set(0, 2, 0);
    this.position.copy(this.playerMesh.position);
    this.engine.add(this.playerMesh);
    
    this.playerBody = this.engine.physics.addCapsule(
      this.playerMesh,
      0.5,
      0.3,
      'dynamic',
      { mass: 70, linearDamping: 0.1, angularDamping: 0.99 }
    );
  }

  protected update(deltaTime: number, input: InputState): void {
    this.courseTime += deltaTime;
    
    this.updateMovement(deltaTime, input);
    this.updateMomentum(deltaTime);
    this.checkCheckpoints();
    
    // Update camera position
    this.engine.camera.position.copy(this.playerMesh.position);
    this.engine.camera.position.y += 0.5;
    this.cameraController.update(deltaTime, input);
    
    this.setScore({ score: Math.round(this.momentum * 10), time: this.courseTime });
  }

  protected fixedUpdate(fixedDeltaTime: number): void {}

  private updateMovement(deltaTime: number, input: InputState): void {
    // Ground check
    const groundRay = this.engine.physics.raycast(
      this.playerMesh.position,
      new THREE.Vector3(0, -1, 0),
      1.2
    );
    this.isGrounded = groundRay.hit && groundRay.distance! < 1.1;
    
    // Wall check
    const leftWallRay = this.engine.physics.raycast(
      this.playerMesh.position,
      new THREE.Vector3(-1, 0, 0),
      1
    );
    const rightWallRay = this.engine.physics.raycast(
      this.playerMesh.position,
      new THREE.Vector3(1, 0, 0),
      1
    );
    
    // Get current velocity
    this.velocity = this.engine.physics.getLinearVelocity(this.playerBody);
    
    // Movement based on state
    switch (this.movementState) {
      case 'running':
        this.handleRunning(deltaTime, input);
        break;
      case 'jumping':
        this.handleJumping(deltaTime, input, leftWallRay, rightWallRay);
        break;
      case 'wallrunning':
        this.handleWallRunning(deltaTime, input);
        break;
      case 'sliding':
        this.handleSliding(deltaTime, input);
        break;
      case 'vaulting':
        this.handleVaulting(deltaTime);
        break;
      case 'climbing':
        this.handleClimbing(deltaTime, input);
        break;
    }
    
    this.position.copy(this.playerMesh.position);
  }

  private handleRunning(deltaTime: number, input: InputState): void {
    const moveSpeed = 8 + this.momentum * 0.1;
    const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(this.engine.camera.quaternion);
    forward.y = 0;
    forward.normalize();
    
    const right = new THREE.Vector3(1, 0, 0).applyQuaternion(this.engine.camera.quaternion);
    right.y = 0;
    right.normalize();
    
    const moveDir = new THREE.Vector3();
    moveDir.addScaledVector(forward, -input.virtual.moveY);
    moveDir.addScaledVector(right, input.virtual.moveX);
    
    if (moveDir.length() > 0) {
      moveDir.normalize().multiplyScalar(moveSpeed);
      this.velocity.x = moveDir.x;
      this.velocity.z = moveDir.z;
      this.engine.physics.setLinearVelocity(this.playerBody, this.velocity);
    }
    
    // Jump
    if (input.keysJustPressed.has('Space') && this.isGrounded) {
      const jumpForce = 8 + this.momentum * 0.05;
      this.engine.physics.applyImpulse(this.playerBody, new THREE.Vector3(0, jumpForce, 0));
      this.movementState = 'jumping';
      this.canJump = false;
    }
    
    // Slide
    if (input.keysJustPressed.has('ShiftLeft') && this.isGrounded && this.velocity.length() > 5) {
      this.movementState = 'sliding';
      this.slideTimer = 1;
    }
    
    if (!this.isGrounded) {
      this.movementState = 'jumping';
    }
  }

  private handleJumping(deltaTime: number, input: InputState, leftWall: any, rightWall: any): void {
    // Air control
    const airControl = 5;
    const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(this.engine.camera.quaternion);
    forward.y = 0;
    forward.normalize();
    
    const right = new THREE.Vector3(1, 0, 0).applyQuaternion(this.engine.camera.quaternion);
    right.y = 0;
    right.normalize();
    
    const moveDir = new THREE.Vector3();
    moveDir.addScaledVector(forward, -input.virtual.moveY);
    moveDir.addScaledVector(right, input.virtual.moveX);
    
    if (moveDir.length() > 0) {
      moveDir.normalize().multiplyScalar(airControl * deltaTime);
      this.velocity.x += moveDir.x;
      this.velocity.z += moveDir.z;
      this.engine.physics.setLinearVelocity(this.playerBody, this.velocity);
    }
    
    // Wall run initiation
    if (leftWall.hit && leftWall.distance! < 0.8 && input.keys.has('KeyA')) {
      this.movementState = 'wallrunning';
      this.wallRunSide = 'left';
      this.wallRunTimer = 2;
    } else if (rightWall.hit && rightWall.distance! < 0.8 && input.keys.has('KeyD')) {
      this.movementState = 'wallrunning';
      this.wallRunSide = 'right';
      this.wallRunTimer = 2;
    }
    
    // Landing
    if (this.isGrounded) {
      this.movementState = 'running';
      this.canJump = true;
    }
  }

  private handleWallRunning(deltaTime: number, input: InputState): void {
    this.wallRunTimer -= deltaTime;
    
    // Wall run physics
    this.velocity.y = -2; // Slow descent
    
    const wallRunSpeed = 10 + this.momentum * 0.1;
    const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(this.engine.camera.quaternion);
    forward.y = 0;
    forward.normalize();
    
    this.velocity.x = forward.x * wallRunSpeed;
    this.velocity.z = forward.z * wallRunSpeed;
    this.engine.physics.setLinearVelocity(this.playerBody, this.velocity);
    
    // Wall jump
    if (input.keysJustPressed.has('Space')) {
      const jumpDir = this.wallRunSide === 'left' ? 1 : -1;
      this.engine.physics.applyImpulse(this.playerBody, new THREE.Vector3(jumpDir * 5, 8, 0));
      this.movementState = 'jumping';
      this.wallRunSide = null;
      this.momentum += 10;
    }
    
    // End wall run
    if (this.wallRunTimer <= 0 || this.isGrounded) {
      this.movementState = this.isGrounded ? 'running' : 'jumping';
      this.wallRunSide = null;
    }
  }

  private handleSliding(deltaTime: number, input: InputState): void {
    this.slideTimer -= deltaTime;
    
    // Maintain momentum while sliding
    const slideSpeed = this.velocity.length();
    this.velocity.y = -1;
    this.engine.physics.setLinearVelocity(this.playerBody, this.velocity);
    
    // End slide
    if (this.slideTimer <= 0 || input.keysJustPressed.has('Space')) {
      this.movementState = 'running';
      if (input.keysJustPressed.has('Space')) {
        this.engine.physics.applyImpulse(this.playerBody, new THREE.Vector3(0, 6, 0));
        this.movementState = 'jumping';
      }
    }
  }

  private handleVaulting(deltaTime: number): void {
    this.vaultProgress += deltaTime * 3;
    
    if (this.vaultProgress >= 1) {
      this.movementState = 'running';
      this.vaultProgress = 0;
      this.momentum += 5;
    }
  }

  private handleClimbing(deltaTime: number, input: InputState): void {
    const climbSpeed = 4;
    
    if (input.virtual.moveY > 0) {
      this.velocity.y = climbSpeed;
    } else if (input.virtual.moveY < 0) {
      this.velocity.y = -climbSpeed;
    } else {
      this.velocity.y = 0;
    }
    
    this.velocity.x = 0;
    this.velocity.z = 0;
    this.engine.physics.setLinearVelocity(this.playerBody, this.velocity);
    
    // Jump off wall
    if (input.keysJustPressed.has('Space')) {
      this.engine.physics.applyImpulse(this.playerBody, new THREE.Vector3(0, 6, -5));
      this.movementState = 'jumping';
    }
  }

  private updateMomentum(deltaTime: number): void {
    const speed = this.velocity.length();
    
    // Build momentum while moving fast
    if (speed > 5 && this.isGrounded) {
      this.momentum = Math.min(this.maxMomentum, this.momentum + deltaTime * 5);
    }
    
    // Lose momentum when slow or stopped
    if (speed < 2) {
      this.momentum = Math.max(0, this.momentum - deltaTime * 10);
    }
    
    // Bonus momentum for tricks
    if (this.movementState === 'wallrunning') {
      this.momentum = Math.min(this.maxMomentum, this.momentum + deltaTime * 10);
    }
  }

  private checkCheckpoints(): void {
    if (this.currentCheckpoint < this.checkpoints.length) {
      const checkpoint = this.checkpoints[this.currentCheckpoint];
      if (this.position.distanceTo(checkpoint) < 5) {
        this.currentCheckpoint++;
        this.addScore(100);
      }
    }
    
    // Check finish
    if (this.position.z > 225 && this.position.y > 10) {
      if (this.courseTime < this.bestTime) {
        this.bestTime = this.courseTime;
      }
      this.end(true);
    }
  }

  public getSpeed(): number { return this.velocity.length() * 3.6; }
  public getMomentum(): number { return this.momentum; }
  public getMaxMomentum(): number { return this.maxMomentum; }
  public getMovementState(): MovementState { return this.movementState; }
  public getCourseTime(): number { return this.courseTime; }
  public getBestTime(): number { return this.bestTime; }
  public getCurrentCheckpoint(): number { return this.currentCheckpoint; }
  public getTotalCheckpoints(): number { return this.checkpoints.length; }

  protected cleanup(): void {
    this.engine.remove(this.playerMesh);
    this.engine.physics.removeBody(this.playerBody);
  }
}

export default ParkourGame;
