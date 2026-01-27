/**
 * ┌─────────────────────────────────────────────────────────────────────────────┐
 * │ LUCY ARCADE — 3D ARCHERY                                                   │
 * │                                                                             │
 * │ Precision archery with realistic arrow physics, wind effects,              │
 * │ multiple targets, and competitive scoring                                  │
 * └─────────────────────────────────────────────────────────────────────────────┘
 */

import * as THREE from 'three';
import {
  Game3DBase,
  type Game3DConfig,
  type InputState,
} from '../../engine3d';

interface Arrow {
  mesh: THREE.Group;
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  isFlying: boolean;
  hasHit: boolean;
}

interface Target {
  mesh: THREE.Group;
  position: THREE.Vector3;
  distance: number;
  isMoving: boolean;
  moveSpeed: number;
  moveRange: number;
}

export class ArcheryGame extends Game3DBase {
  // Bow
  private bowMesh!: THREE.Group;
  private drawStrength: number = 0;
  private isDrawing: boolean = false;
  private aimX: number = 0;
  private aimY: number = 0;
  
  // Arrows
  private arrows: Arrow[] = [];
  private arrowsRemaining: number = 10;
  private currentArrow: Arrow | null = null;
  
  // Targets
  private targets: Target[] = [];
  private currentRound: number = 1;
  private maxRounds: number = 3;
  
  // Wind
  private windDirection: THREE.Vector3 = new THREE.Vector3();
  private windSpeed: number = 0;
  
  // Scoring
  private roundScores: number[] = [];
  private totalScore: number = 0;

  constructor(container: HTMLElement, config?: Game3DConfig) {
    super(container, {
      ...config,
      engineConfig: {
        shadows: true,
        bloom: true,
        bloomStrength: 0.3,
        fog: { color: 0x87ceeb, near: 50, far: 200 },
        ...config?.engineConfig,
      },
    });
  }

  protected async loadAssets(): Promise<void> {}

  protected initScene(): void {
    this.setupLighting();
    this.createEnvironment();
    this.createBow();
    this.setupRound(1);
    
    this.engine.camera.position.set(0, 1.6, 0);
    this.engine.camera.lookAt(0, 1.6, 50);
    
    this.createGradientSkybox(0x87ceeb, 0xffffff);
  }

  private setupLighting(): void {
    this.engine.addAmbientLight(0xffffff, 0.5);
    this.engine.addDirectionalLight(0xffffff, 1.0, new THREE.Vector3(30, 50, 20), true);
  }

  private createEnvironment(): void {
    // Ground
    const groundGeo = new THREE.PlaneGeometry(100, 200);
    const groundMat = new THREE.MeshStandardMaterial({ color: 0x228B22, roughness: 0.9 });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    this.engine.add(ground);
    
    // Shooting platform
    const platformGeo = new THREE.BoxGeometry(3, 0.1, 2);
    const platformMat = new THREE.MeshStandardMaterial({ color: 0x8b4513 });
    const platform = new THREE.Mesh(platformGeo, platformMat);
    platform.position.set(0, 0.05, 0);
    this.engine.add(platform);
    
    // Trees for atmosphere
    for (let i = 0; i < 20; i++) {
      const x = (Math.random() - 0.5) * 80;
      const z = 20 + Math.random() * 80;
      if (Math.abs(x) > 10) {
        this.createTree(new THREE.Vector3(x, 0, z));
      }
    }
    
    // Wind indicator flag
    const flagPole = new THREE.CylinderGeometry(0.02, 0.02, 3, 8);
    const poleMat = new THREE.MeshStandardMaterial({ color: 0x888888 });
    const pole = new THREE.Mesh(flagPole, poleMat);
    pole.position.set(-3, 1.5, 0);
    this.engine.add(pole);
    
    const flagGeo = new THREE.PlaneGeometry(0.5, 0.3);
    const flagMat = new THREE.MeshStandardMaterial({ color: 0xff0000, side: THREE.DoubleSide });
    const flag = new THREE.Mesh(flagGeo, flagMat);
    flag.position.set(-2.75, 2.85, 0);
    flag.name = 'windFlag';
    this.engine.add(flag);
  }

  private createTree(position: THREE.Vector3): void {
    const trunkGeo = new THREE.CylinderGeometry(0.2, 0.3, 3, 8);
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x8B4513 });
    const trunk = new THREE.Mesh(trunkGeo, trunkMat);
    trunk.position.copy(position);
    trunk.position.y = 1.5;
    trunk.castShadow = true;
    this.engine.add(trunk);
    
    const foliageGeo = new THREE.ConeGeometry(2, 5, 8);
    const foliageMat = new THREE.MeshStandardMaterial({ color: 0x228B22 });
    const foliage = new THREE.Mesh(foliageGeo, foliageMat);
    foliage.position.copy(position);
    foliage.position.y = 5.5;
    foliage.castShadow = true;
    this.engine.add(foliage);
  }

  private createBow(): void {
    this.bowMesh = new THREE.Group();
    
    // Bow body (curved)
    const bowCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, -0.6, 0),
      new THREE.Vector3(0.1, -0.3, 0),
      new THREE.Vector3(0.15, 0, 0),
      new THREE.Vector3(0.1, 0.3, 0),
      new THREE.Vector3(0, 0.6, 0),
    ]);
    
    const bowGeo = new THREE.TubeGeometry(bowCurve, 20, 0.02, 8, false);
    const bowMat = new THREE.MeshStandardMaterial({ color: 0x8B4513 });
    const bow = new THREE.Mesh(bowGeo, bowMat);
    this.bowMesh.add(bow);
    
    // Bowstring
    const stringGeo = new THREE.CylinderGeometry(0.003, 0.003, 1.2, 4);
    const stringMat = new THREE.MeshStandardMaterial({ color: 0xffffff });
    const string = new THREE.Mesh(stringGeo, stringMat);
    string.name = 'string';
    this.bowMesh.add(string);
    
    // Arrow rest
    const restGeo = new THREE.BoxGeometry(0.02, 0.02, 0.05);
    const rest = new THREE.Mesh(restGeo, bowMat);
    rest.position.set(0.15, 0, 0);
    this.bowMesh.add(rest);
    
    this.bowMesh.position.set(0.3, 1.5, 0.5);
    this.engine.add(this.bowMesh);
    
    // Create initial arrow
    this.nockArrow();
  }

  private createArrow(): Arrow {
    const arrowGroup = new THREE.Group();
    
    // Shaft
    const shaftGeo = new THREE.CylinderGeometry(0.005, 0.005, 0.7, 8);
    const shaftMat = new THREE.MeshStandardMaterial({ color: 0x8B4513 });
    const shaft = new THREE.Mesh(shaftGeo, shaftMat);
    shaft.rotation.x = Math.PI / 2;
    arrowGroup.add(shaft);
    
    // Arrowhead
    const headGeo = new THREE.ConeGeometry(0.015, 0.05, 4);
    const headMat = new THREE.MeshStandardMaterial({ color: 0x888888, metalness: 0.8 });
    const head = new THREE.Mesh(headGeo, headMat);
    head.rotation.x = -Math.PI / 2;
    head.position.z = 0.375;
    arrowGroup.add(head);
    
    // Fletching
    const fletchGeo = new THREE.PlaneGeometry(0.03, 0.08);
    const fletchMat = new THREE.MeshStandardMaterial({ color: 0xff0000, side: THREE.DoubleSide });
    
    [0, Math.PI * 2 / 3, Math.PI * 4 / 3].forEach(angle => {
      const fletch = new THREE.Mesh(fletchGeo, fletchMat);
      fletch.position.z = -0.3;
      fletch.rotation.y = angle;
      arrowGroup.add(fletch);
    });
    
    this.engine.add(arrowGroup);
    
    return {
      mesh: arrowGroup,
      position: new THREE.Vector3(),
      velocity: new THREE.Vector3(),
      isFlying: false,
      hasHit: false,
    };
  }

  private nockArrow(): void {
    if (this.arrowsRemaining <= 0) return;
    
    this.currentArrow = this.createArrow();
    this.currentArrow.mesh.position.set(0.3, 1.5, 0.5);
    this.arrows.push(this.currentArrow);
  }

  private createTarget(distance: number, isMoving: boolean = false): Target {
    const targetGroup = new THREE.Group();
    
    // Target rings (from outside to center)
    const rings = [
      { radius: 0.6, color: 0xffffff, points: 1 },
      { radius: 0.48, color: 0x000000, points: 2 },
      { radius: 0.36, color: 0x0066cc, points: 3 },
      { radius: 0.24, color: 0xff0000, points: 5 },
      { radius: 0.12, color: 0xffff00, points: 8 },
      { radius: 0.05, color: 0xffff00, points: 10 },
    ];
    
    rings.forEach(({ radius, color }, i) => {
      const ringGeo = new THREE.CircleGeometry(radius, 32);
      const ringMat = new THREE.MeshStandardMaterial({ color });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.position.z = 0.001 * i;
      ring.userData = { points: rings[i].points };
      targetGroup.add(ring);
    });
    
    // Target stand
    const standGeo = new THREE.BoxGeometry(0.1, 1.5, 0.1);
    const standMat = new THREE.MeshStandardMaterial({ color: 0x8B4513 });
    const stand = new THREE.Mesh(standGeo, standMat);
    stand.position.y = -0.75;
    stand.position.z = -0.1;
    targetGroup.add(stand);
    
    targetGroup.position.set(0, 1.5, distance);
    this.engine.add(targetGroup);
    
    return {
      mesh: targetGroup,
      position: targetGroup.position.clone(),
      distance,
      isMoving,
      moveSpeed: isMoving ? 1 + Math.random() : 0,
      moveRange: isMoving ? 3 + Math.random() * 2 : 0,
    };
  }

  private setupRound(round: number): void {
    // Clear existing targets
    this.targets.forEach(t => this.engine.remove(t.mesh));
    this.targets = [];
    
    // Setup targets based on round
    switch (round) {
      case 1:
        // Easy: single stationary target at 30m
        this.targets.push(this.createTarget(30, false));
        break;
      case 2:
        // Medium: two targets at different distances
        this.targets.push(this.createTarget(40, false));
        this.targets.push(this.createTarget(50, false));
        break;
      case 3:
        // Hard: moving targets
        this.targets.push(this.createTarget(40, true));
        this.targets.push(this.createTarget(60, true));
        break;
    }
    
    this.arrowsRemaining = 10;
    this.randomizeWind();
    this.nockArrow();
  }

  private randomizeWind(): void {
    this.windDirection = new THREE.Vector3(
      Math.random() - 0.5,
      0,
      0
    ).normalize();
    this.windSpeed = Math.random() * 5; // 0-5 m/s
    
    // Update wind flag
    const flag = this.engine.scene.getObjectByName('windFlag') as THREE.Mesh;
    if (flag) {
      flag.rotation.y = Math.atan2(this.windDirection.x, this.windDirection.z);
    }
  }

  protected update(deltaTime: number, input: InputState): void {
    this.updateAiming(deltaTime, input);
    this.updateArrows(deltaTime);
    this.updateTargets(deltaTime);
    
    // Update camera to follow aim
    this.engine.camera.rotation.y = -this.aimX * 0.3;
    this.engine.camera.rotation.x = this.aimY * 0.2;
  }

  protected fixedUpdate(fixedDeltaTime: number): void {}

  private updateAiming(deltaTime: number, input: InputState): void {
    // Aim adjustment
    this.aimX += input.virtual.lookX * deltaTime * 2;
    this.aimY += input.virtual.lookY * deltaTime * 2;
    
    this.aimX = THREE.MathUtils.clamp(this.aimX, -0.5, 0.5);
    this.aimY = THREE.MathUtils.clamp(this.aimY, -0.3, 0.3);
    
    // Update bow rotation
    this.bowMesh.rotation.y = -this.aimX;
    this.bowMesh.rotation.x = this.aimY;
    
    // Drawing
    if (input.virtual.fire && this.currentArrow && !this.currentArrow.isFlying) {
      this.isDrawing = true;
      this.drawStrength = Math.min(1, this.drawStrength + deltaTime * 1.5);
      
      // Pull back arrow
      this.currentArrow.mesh.position.z = 0.5 - this.drawStrength * 0.3;
    } else if (this.isDrawing && this.currentArrow) {
      this.releaseArrow();
    }
  }

  private releaseArrow(): void {
    if (!this.currentArrow || this.currentArrow.isFlying) return;
    
    this.isDrawing = false;
    this.currentArrow.isFlying = true;
    this.arrowsRemaining--;
    
    // Calculate initial velocity
    const power = 30 + this.drawStrength * 50; // 30-80 m/s
    const direction = new THREE.Vector3(
      -Math.sin(this.aimX * 0.3),
      Math.sin(this.aimY * 0.2) + 0.02, // Slight upward arc
      1
    ).normalize();
    
    this.currentArrow.velocity.copy(direction.multiplyScalar(power));
    this.currentArrow.position.copy(this.currentArrow.mesh.position);
    
    this.drawStrength = 0;
    
    // Nock next arrow after delay
    setTimeout(() => {
      if (this.arrowsRemaining > 0) {
        this.nockArrow();
      } else {
        this.checkRoundEnd();
      }
    }, 1000);
  }

  private updateArrows(deltaTime: number): void {
    this.arrows.forEach(arrow => {
      if (!arrow.isFlying || arrow.hasHit) return;
      
      // Apply gravity
      arrow.velocity.y -= 9.81 * deltaTime;
      
      // Apply wind
      arrow.velocity.x += this.windDirection.x * this.windSpeed * deltaTime * 0.5;
      
      // Update position
      arrow.position.addScaledVector(arrow.velocity, deltaTime);
      arrow.mesh.position.copy(arrow.position);
      
      // Rotate arrow to face velocity direction
      const lookDir = arrow.velocity.clone().normalize();
      arrow.mesh.lookAt(arrow.position.clone().add(lookDir));
      
      // Check target hits
      this.targets.forEach(target => {
        if (arrow.hasHit) return;
        
        const toTarget = target.position.clone().sub(arrow.position);
        if (toTarget.length() < 0.7 && Math.abs(arrow.position.z - target.position.z) < 0.5) {
          this.hitTarget(arrow, target);
        }
      });
      
      // Check ground hit
      if (arrow.position.y < 0) {
        arrow.hasHit = true;
        arrow.isFlying = false;
      }
    });
  }

  private hitTarget(arrow: Arrow, target: Target): void {
    arrow.hasHit = true;
    arrow.isFlying = false;
    
    // Calculate score based on distance from center
    const hitPos = new THREE.Vector2(
      arrow.position.x - target.position.x,
      arrow.position.y - target.position.y
    );
    const distFromCenter = hitPos.length();
    
    let points = 0;
    if (distFromCenter < 0.05) points = 10;
    else if (distFromCenter < 0.12) points = 8;
    else if (distFromCenter < 0.24) points = 5;
    else if (distFromCenter < 0.36) points = 3;
    else if (distFromCenter < 0.48) points = 2;
    else if (distFromCenter < 0.6) points = 1;
    
    this.totalScore += points;
    this.addScore(points);
    
    // Stick arrow in target
    arrow.mesh.position.copy(arrow.position);
    arrow.mesh.position.z = target.position.z - 0.1;
  }

  private updateTargets(deltaTime: number): void {
    this.targets.forEach(target => {
      if (!target.isMoving) return;
      
      // Oscillate horizontally
      target.position.x = Math.sin(this.gameTime * target.moveSpeed) * target.moveRange;
      target.mesh.position.x = target.position.x;
    });
  }

  private checkRoundEnd(): void {
    if (this.arrowsRemaining <= 0) {
      this.roundScores.push(this.totalScore);
      
      if (this.currentRound < this.maxRounds) {
        this.currentRound++;
        setTimeout(() => this.setupRound(this.currentRound), 2000);
      } else {
        this.end(true);
      }
    }
  }

  public getDrawStrength(): number { return this.drawStrength; }
  public getArrowsRemaining(): number { return this.arrowsRemaining; }
  public getCurrentRound(): number { return this.currentRound; }
  public getMaxRounds(): number { return this.maxRounds; }
  public getTotalScore(): number { return this.totalScore; }
  public getWindSpeed(): number { return this.windSpeed; }
  public getWindDirection(): THREE.Vector3 { return this.windDirection.clone(); }
  public getAimX(): number { return this.aimX; }
  public getAimY(): number { return this.aimY; }

  protected cleanup(): void {
    this.arrows.forEach(a => this.engine.remove(a.mesh));
    this.targets.forEach(t => this.engine.remove(t.mesh));
    this.engine.remove(this.bowMesh);
  }
}

export default ArcheryGame;
