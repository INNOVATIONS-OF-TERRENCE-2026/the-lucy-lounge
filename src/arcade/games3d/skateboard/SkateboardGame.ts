/**
 * ┌─────────────────────────────────────────────────────────────────────────────┐
 * │ LUCY ARCADE — 3D SKATEBOARD                                                │
 * │                                                                             │
 * │ Extreme skateboarding with physics-based tricks, combo system,             │
 * │ and dynamic skate parks                                                    │
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
  duration: number;
  type: 'flip' | 'grab' | 'grind' | 'manual';
}

const TRICKS: Record<string, Trick> = {
  ollie: { name: 'Ollie', points: 50, duration: 0.3, type: 'flip' },
  kickflip: { name: 'Kickflip', points: 100, duration: 0.4, type: 'flip' },
  heelflip: { name: 'Heelflip', points: 100, duration: 0.4, type: 'flip' },
  treflip: { name: '360 Flip', points: 200, duration: 0.5, type: 'flip' },
  shuvit: { name: 'Shuvit', points: 75, duration: 0.35, type: 'flip' },
  grab: { name: 'Grab', points: 50, duration: 0.3, type: 'grab' },
  grind: { name: 'Grind', points: 25, duration: 0.1, type: 'grind' }, // Per tick
  manual: { name: 'Manual', points: 10, duration: 0.1, type: 'manual' }, // Per tick
};

export class SkateboardGame extends Game3DBase {
  private cameraController!: ThirdPersonCameraController;
  
  // Skater
  private skaterMesh!: THREE.Group;
  private skaterBody!: PhysicsBody;
  private position: THREE.Vector3 = new THREE.Vector3();
  private velocity: THREE.Vector3 = new THREE.Vector3();
  private rotation: number = 0;
  
  // State
  private isGrounded: boolean = true;
  private isGrinding: boolean = false;
  private isManual: boolean = false;
  private currentTrick: Trick | null = null;
  private trickProgress: number = 0;
  
  // Combo
  private combo: number = 0;
  private comboMultiplier: number = 1;
  private comboTimer: number = 0;
  private trickList: string[] = [];
  
  // Session
  private sessionTime: number = 120;
  private highScore: number = 0;

  constructor(container: HTMLElement, config?: Game3DConfig) {
    super(container, {
      ...config,
      engineConfig: {
        shadows: true,
        bloom: true,
        bloomStrength: 0.4,
        ...config?.engineConfig,
      },
    });
  }

  protected async loadAssets(): Promise<void> {}

  protected initScene(): void {
    this.setupLighting();
    this.createSkatePark();
    this.createSkater();
    
    this.cameraController = new ThirdPersonCameraController(this.engine.camera, {
      distance: 8,
      height: 3,
      minPitch: 0.1,
      maxPitch: 0.8,
    });
    
    this.createGradientSkybox(0x87ceeb, 0xffd700);
  }

  private setupLighting(): void {
    this.engine.addAmbientLight(0xffffff, 0.5);
    this.engine.addDirectionalLight(0xffffff, 1.0, new THREE.Vector3(30, 50, 20), true);
  }

  private createSkatePark(): void {
    // Ground
    const groundGeo = new THREE.PlaneGeometry(100, 100);
    const groundMat = new THREE.MeshStandardMaterial({ color: 0x555555, roughness: 0.9 });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    this.engine.add(ground);
    this.engine.physics.addBox(ground, new THREE.Vector3(100, 0.1, 100), 'static');
    
    // Half pipe
    this.createHalfPipe(new THREE.Vector3(-20, 0, 0));
    
    // Rails
    this.createRail(new THREE.Vector3(10, 0, 0), 10, 0);
    this.createRail(new THREE.Vector3(10, 0, 15), 8, Math.PI / 4);
    
    // Ramps
    this.createRamp(new THREE.Vector3(0, 0, -15), 5, 2, 0);
    this.createRamp(new THREE.Vector3(20, 0, 0), 4, 1.5, Math.PI / 2);
    
    // Quarter pipes
    this.createQuarterPipe(new THREE.Vector3(-10, 0, 20), 0);
    this.createQuarterPipe(new THREE.Vector3(10, 0, 20), Math.PI);
    
    // Funbox
    this.createFunbox(new THREE.Vector3(0, 0, 0));
    
    // Ledges
    this.createLedge(new THREE.Vector3(-5, 0, -5), 6, 0.5);
    this.createLedge(new THREE.Vector3(25, 0, -10), 8, 0.7);
  }

  private createHalfPipe(position: THREE.Vector3): void {
    const width = 15;
    const height = 4;
    const depth = 10;
    
    // Create curved surface using segments
    const segments = 20;
    const group = new THREE.Group();
    
    for (let i = 0; i < segments; i++) {
      const angle = (i / segments) * Math.PI;
      const nextAngle = ((i + 1) / segments) * Math.PI;
      
      const y1 = Math.cos(angle) * height + height;
      const z1 = Math.sin(angle) * height - height;
      const y2 = Math.cos(nextAngle) * height + height;
      const z2 = Math.sin(nextAngle) * height - height;
      
      const segGeo = new THREE.BoxGeometry(width, 0.2, Math.sqrt((y2 - y1) ** 2 + (z2 - z1) ** 2));
      const segMat = new THREE.MeshStandardMaterial({ color: 0x8b4513 });
      const seg = new THREE.Mesh(segGeo, segMat);
      
      seg.position.set(0, (y1 + y2) / 2, (z1 + z2) / 2);
      seg.rotation.x = Math.atan2(y2 - y1, z2 - z1);
      seg.castShadow = true;
      seg.receiveShadow = true;
      group.add(seg);
    }
    
    // Flat bottom
    const bottomGeo = new THREE.BoxGeometry(width, 0.2, depth);
    const bottomMat = new THREE.MeshStandardMaterial({ color: 0x8b4513 });
    const bottom = new THREE.Mesh(bottomGeo, bottomMat);
    bottom.position.y = 0.1;
    bottom.receiveShadow = true;
    group.add(bottom);
    
    group.position.copy(position);
    this.engine.add(group);
    
    // Simplified physics
    this.engine.physics.addBox(
      bottom,
      new THREE.Vector3(width, 0.2, depth),
      'static'
    );
  }

  private createRail(position: THREE.Vector3, length: number, rotation: number): void {
    const railGeo = new THREE.CylinderGeometry(0.05, 0.05, length, 8);
    const railMat = new THREE.MeshStandardMaterial({ color: 0xcccccc, metalness: 0.8 });
    const rail = new THREE.Mesh(railGeo, railMat);
    rail.rotation.z = Math.PI / 2;
    rail.rotation.y = rotation;
    rail.position.copy(position);
    rail.position.y = 0.5;
    rail.castShadow = true;
    rail.userData = { isGrindable: true };
    this.engine.add(rail);
    
    // Support posts
    const postGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.5, 8);
    [-length / 2 + 0.5, length / 2 - 0.5].forEach(offset => {
      const post = new THREE.Mesh(postGeo, railMat);
      post.position.copy(position);
      post.position.x += Math.cos(rotation) * offset;
      post.position.z += Math.sin(rotation) * offset;
      post.position.y = 0.25;
      this.engine.add(post);
    });
  }

  private createRamp(position: THREE.Vector3, width: number, height: number, rotation: number): void {
    const rampGeo = new THREE.BoxGeometry(width, height, width);
    const rampMat = new THREE.MeshStandardMaterial({ color: 0x666666 });
    const ramp = new THREE.Mesh(rampGeo, rampMat);
    
    // Shear to create ramp shape
    ramp.geometry.translate(0, height / 2, 0);
    
    ramp.position.copy(position);
    ramp.rotation.y = rotation;
    ramp.castShadow = true;
    ramp.receiveShadow = true;
    this.engine.add(ramp);
    
    this.engine.physics.addBox(ramp, new THREE.Vector3(width, height, width), 'static');
  }

  private createQuarterPipe(position: THREE.Vector3, rotation: number): void {
    const width = 8;
    const height = 3;
    const segments = 10;
    const group = new THREE.Group();
    
    for (let i = 0; i < segments; i++) {
      const angle = (i / segments) * (Math.PI / 2);
      const nextAngle = ((i + 1) / segments) * (Math.PI / 2);
      
      const y1 = Math.sin(angle) * height;
      const z1 = Math.cos(angle) * height - height;
      const y2 = Math.sin(nextAngle) * height;
      const z2 = Math.cos(nextAngle) * height - height;
      
      const segGeo = new THREE.BoxGeometry(width, 0.2, Math.sqrt((y2 - y1) ** 2 + (z2 - z1) ** 2) + 0.1);
      const segMat = new THREE.MeshStandardMaterial({ color: 0x8b4513 });
      const seg = new THREE.Mesh(segGeo, segMat);
      
      seg.position.set(0, (y1 + y2) / 2, (z1 + z2) / 2);
      seg.rotation.x = Math.atan2(y2 - y1, z2 - z1);
      seg.castShadow = true;
      seg.receiveShadow = true;
      group.add(seg);
    }
    
    group.position.copy(position);
    group.rotation.y = rotation;
    this.engine.add(group);
  }

  private createFunbox(position: THREE.Vector3): void {
    const boxGeo = new THREE.BoxGeometry(4, 0.8, 4);
    const boxMat = new THREE.MeshStandardMaterial({ color: 0x444444 });
    const box = new THREE.Mesh(boxGeo, boxMat);
    box.position.copy(position);
    box.position.y = 0.4;
    box.castShadow = true;
    box.receiveShadow = true;
    box.userData = { isGrindable: true };
    this.engine.add(box);
    
    this.engine.physics.addBox(box, new THREE.Vector3(4, 0.8, 4), 'static');
  }

  private createLedge(position: THREE.Vector3, length: number, height: number): void {
    const ledgeGeo = new THREE.BoxGeometry(length, height, 0.5);
    const ledgeMat = new THREE.MeshStandardMaterial({ color: 0x888888 });
    const ledge = new THREE.Mesh(ledgeGeo, ledgeMat);
    ledge.position.copy(position);
    ledge.position.y = height / 2;
    ledge.castShadow = true;
    ledge.receiveShadow = true;
    ledge.userData = { isGrindable: true };
    this.engine.add(ledge);
    
    this.engine.physics.addBox(ledge, new THREE.Vector3(length, height, 0.5), 'static');
  }

  private createSkater(): void {
    this.skaterMesh = new THREE.Group();
    
    // Body
    const bodyGeo = new THREE.CapsuleGeometry(0.2, 0.6, 4, 8);
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0x333333 });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = 1;
    body.castShadow = true;
    this.skaterMesh.add(body);
    
    // Head
    const headGeo = new THREE.SphereGeometry(0.15, 16, 16);
    const headMat = new THREE.MeshStandardMaterial({ color: 0xdeb887 });
    const head = new THREE.Mesh(headGeo, headMat);
    head.position.y = 1.5;
    this.skaterMesh.add(head);
    
    // Skateboard
    const boardGeo = new THREE.BoxGeometry(0.2, 0.05, 0.8);
    const boardMat = new THREE.MeshStandardMaterial({ color: 0x8b4513 });
    const board = new THREE.Mesh(boardGeo, boardMat);
    board.position.y = 0.1;
    board.name = 'board';
    this.skaterMesh.add(board);
    
    // Wheels
    const wheelGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.05, 8);
    const wheelMat = new THREE.MeshStandardMaterial({ color: 0x222222 });
    
    [[-0.08, 0.03, 0.3], [0.08, 0.03, 0.3], [-0.08, 0.03, -0.3], [0.08, 0.03, -0.3]].forEach(([x, y, z]) => {
      const wheel = new THREE.Mesh(wheelGeo, wheelMat);
      wheel.rotation.z = Math.PI / 2;
      wheel.position.set(x, y, z);
      this.skaterMesh.add(wheel);
    });
    
    this.skaterMesh.position.set(0, 0, 0);
    this.position.copy(this.skaterMesh.position);
    this.engine.add(this.skaterMesh);
    
    this.skaterBody = this.engine.physics.addCapsule(
      this.skaterMesh,
      0.5,
      0.2,
      'dynamic',
      { mass: 70, linearDamping: 0.5, angularDamping: 0.9 }
    );
  }

  protected update(deltaTime: number, input: InputState): void {
    this.sessionTime -= deltaTime;
    
    if (this.sessionTime <= 0) {
      this.end(true);
      return;
    }
    
    this.updateSkater(deltaTime, input);
    this.updateTricks(deltaTime, input);
    this.updateCombo(deltaTime);
    
    this.cameraController.setTarget(this.skaterMesh.position);
    this.cameraController.update(deltaTime, input);
    
    this.setScore({ score: this.getScore().score, combo: this.comboMultiplier });
  }

  protected fixedUpdate(fixedDeltaTime: number): void {}

  private updateSkater(deltaTime: number, input: InputState): void {
    // Ground check
    const rayResult = this.engine.physics.raycast(
      this.skaterMesh.position.clone().add(new THREE.Vector3(0, 0.5, 0)),
      new THREE.Vector3(0, -1, 0),
      1
    );
    this.isGrounded = rayResult.hit && rayResult.distance! < 0.6;
    
    // Movement
    const moveSpeed = 15;
    const turnSpeed = 3;
    
    // Acceleration
    if (input.virtual.moveY > 0) {
      const forward = new THREE.Vector3(0, 0, 1).applyAxisAngle(new THREE.Vector3(0, 1, 0), this.rotation);
      this.engine.physics.applyForce(this.skaterBody, forward.multiplyScalar(moveSpeed));
    }
    
    // Turning
    if (this.isGrounded) {
      this.rotation += input.virtual.moveX * turnSpeed * deltaTime;
      this.skaterMesh.rotation.y = this.rotation;
    }
    
    // Braking
    if (input.virtual.moveY < 0 && this.isGrounded) {
      const vel = this.engine.physics.getLinearVelocity(this.skaterBody);
      vel.multiplyScalar(0.95);
      this.engine.physics.setLinearVelocity(this.skaterBody, vel);
    }
    
    this.position.copy(this.skaterMesh.position);
    
    // Check grinding
    this.checkGrinding();
  }

  private updateTricks(deltaTime: number, input: InputState): void {
    if (this.currentTrick) {
      this.trickProgress += deltaTime;
      
      if (this.trickProgress >= this.currentTrick.duration) {
        this.completeTrick();
      }
      return;
    }
    
    // Jump / Ollie
    if (input.keysJustPressed.has('Space') && this.isGrounded) {
      this.engine.physics.applyImpulse(this.skaterBody, new THREE.Vector3(0, 8, 0));
      this.startTrick('ollie');
    }
    
    // Flip tricks (in air)
    if (!this.isGrounded) {
      if (input.keysJustPressed.has('KeyJ')) this.startTrick('kickflip');
      if (input.keysJustPressed.has('KeyK')) this.startTrick('heelflip');
      if (input.keysJustPressed.has('KeyL')) this.startTrick('treflip');
      if (input.keysJustPressed.has('KeyU')) this.startTrick('shuvit');
      if (input.keys.has('KeyG')) this.startTrick('grab');
    }
    
    // Manual
    if (this.isGrounded && input.keys.has('KeyM')) {
      if (!this.isManual) {
        this.isManual = true;
        this.startTrick('manual');
      }
    } else {
      this.isManual = false;
    }
    
    // Grinding
    if (this.isGrinding) {
      this.addTrickPoints('grind');
    }
  }

  private startTrick(trickId: string): void {
    const trick = TRICKS[trickId];
    if (!trick) return;
    
    this.currentTrick = trick;
    this.trickProgress = 0;
    
    // Visual feedback
    const board = this.skaterMesh.getObjectByName('board') as THREE.Mesh;
    if (board && trick.type === 'flip') {
      // Animate flip
    }
  }

  private completeTrick(): void {
    if (!this.currentTrick) return;
    
    this.addTrickPoints(this.currentTrick.name.toLowerCase().replace(' ', ''));
    this.trickList.push(this.currentTrick.name);
    this.currentTrick = null;
    this.trickProgress = 0;
  }

  private addTrickPoints(trickId: string): void {
    const trick = TRICKS[trickId];
    if (!trick) return;
    
    const points = trick.points * this.comboMultiplier;
    this.addScore(Math.round(points));
    this.combo++;
    this.comboTimer = 2;
    
    if (this.combo > 1 && this.combo % 3 === 0) {
      this.comboMultiplier = Math.min(10, this.comboMultiplier + 0.5);
    }
  }

  private updateCombo(deltaTime: number): void {
    if (this.comboTimer > 0) {
      this.comboTimer -= deltaTime;
      
      if (this.comboTimer <= 0 && this.isGrounded && !this.isGrinding && !this.isManual) {
        // Land combo
        if (this.combo > 0) {
          const bonusPoints = this.combo * 50 * this.comboMultiplier;
          this.addScore(Math.round(bonusPoints));
        }
        
        this.combo = 0;
        this.comboMultiplier = 1;
        this.trickList = [];
      }
    }
  }

  private checkGrinding(): void {
    // Simplified grinding check
    const rayResult = this.engine.physics.raycast(
      this.skaterMesh.position,
      new THREE.Vector3(0, -1, 0),
      0.3
    );
    
    this.isGrinding = false;
    // Would check if hit object has isGrindable userData
  }

  public getSessionTime(): number { return this.sessionTime; }
  public getCombo(): number { return this.combo; }
  public getComboMultiplier(): number { return this.comboMultiplier; }
  public getTrickList(): string[] { return [...this.trickList]; }
  public getCurrentTrick(): string | null { return this.currentTrick?.name ?? null; }
  public isSkaterGrounded(): boolean { return this.isGrounded; }

  protected cleanup(): void {
    this.engine.remove(this.skaterMesh);
    this.engine.physics.removeBody(this.skaterBody);
  }
}

export default SkateboardGame;
