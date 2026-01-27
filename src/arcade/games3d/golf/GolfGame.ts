/**
 * ┌─────────────────────────────────────────────────────────────────────────────┐
 * │ LUCY ARCADE — 3D GOLF                                                      │
 * │                                                                             │
 * │ Realistic golf simulation with terrain physics, wind effects,              │
 * │ multiple clubs, and beautiful courses                                      │
 * └─────────────────────────────────────────────────────────────────────────────┘
 */

import * as THREE from 'three';
import {
  Game3DBase,
  type Game3DConfig,
  type PhysicsBody,
  type InputState,
} from '../../engine3d';

interface Club {
  id: string;
  name: string;
  power: number;
  loft: number; // Launch angle in degrees
  accuracy: number;
}

interface Hole {
  teePosition: THREE.Vector3;
  holePosition: THREE.Vector3;
  par: number;
  distance: number;
}

const CLUBS: Club[] = [
  { id: 'driver', name: 'Driver', power: 1.0, loft: 10, accuracy: 0.7 },
  { id: 'wood3', name: '3 Wood', power: 0.85, loft: 15, accuracy: 0.75 },
  { id: 'iron5', name: '5 Iron', power: 0.65, loft: 25, accuracy: 0.85 },
  { id: 'iron7', name: '7 Iron', power: 0.55, loft: 35, accuracy: 0.9 },
  { id: 'iron9', name: '9 Iron', power: 0.45, loft: 45, accuracy: 0.92 },
  { id: 'wedge', name: 'Pitching Wedge', power: 0.35, loft: 50, accuracy: 0.95 },
  { id: 'putter', name: 'Putter', power: 0.15, loft: 2, accuracy: 1.0 },
];

export class GolfGame extends Game3DBase {
  private ball!: { mesh: THREE.Mesh; body: PhysicsBody };
  private flagMesh!: THREE.Group;
  
  // Course
  private holes: Hole[] = [];
  private currentHole: number = 0;
  private terrainMesh!: THREE.Mesh;
  
  // Clubs
  private currentClubIndex: number = 0;
  
  // Shot state
  private aimDirection: number = 0;
  private power: number = 0;
  private isPowerCharging: boolean = false;
  private isAiming: boolean = true;
  private ballInFlight: boolean = false;
  
  // Wind
  private windDirection: THREE.Vector3 = new THREE.Vector3();
  private windSpeed: number = 0;
  
  // Scoring
  private strokes: number = 0;
  private holeScores: number[] = [];
  private totalScore: number = 0;

  constructor(container: HTMLElement, config?: Game3DConfig) {
    super(container, {
      ...config,
      engineConfig: {
        shadows: true,
        bloom: true,
        bloomStrength: 0.2,
        fog: { color: 0x87ceeb, near: 100, far: 500 },
        ...config?.engineConfig,
      },
    });
  }

  protected async loadAssets(): Promise<void> {}

  protected initScene(): void {
    this.setupLighting();
    this.createCourse();
    this.createBall();
    this.createFlag();
    this.setupHole(0);
    
    this.engine.camera.position.set(0, 10, -20);
    this.engine.camera.lookAt(0, 0, 0);
    
    this.randomizeWind();
    this.createGradientSkybox(0x87ceeb, 0xffffff);
  }

  private setupLighting(): void {
    this.engine.addAmbientLight(0xffffff, 0.5);
    this.engine.addDirectionalLight(0xffffee, 1.0, new THREE.Vector3(50, 100, 30), true);
  }

  private createCourse(): void {
    // Create terrain with height variation
    const terrainGeo = new THREE.PlaneGeometry(200, 400, 100, 200);
    const positions = terrainGeo.attributes.position;
    
    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i);
      const y = positions.getY(i);
      
      // Gentle hills
      let height = Math.sin(x * 0.05) * Math.cos(y * 0.03) * 3;
      height += Math.sin(x * 0.02 + y * 0.02) * 2;
      
      // Flatten tee and green areas
      const distFromTee = Math.sqrt(x * x + (y + 150) * (y + 150));
      const distFromGreen = Math.sqrt(x * x + (y - 150) * (y - 150));
      
      if (distFromTee < 15) height *= distFromTee / 15;
      if (distFromGreen < 20) height *= distFromGreen / 20;
      
      positions.setZ(i, height);
    }
    
    terrainGeo.computeVertexNormals();
    
    const terrainMat = new THREE.MeshStandardMaterial({
      color: 0x228B22,
      roughness: 0.9,
    });
    
    this.terrainMesh = new THREE.Mesh(terrainGeo, terrainMat);
    this.terrainMesh.rotation.x = -Math.PI / 2;
    this.terrainMesh.receiveShadow = true;
    this.engine.add(this.terrainMesh);
    
    this.engine.physics.addTrimesh(this.terrainMesh, { friction: 0.8, restitution: 0.3 });
    
    // Create hole data
    this.holes = [
      { teePosition: new THREE.Vector3(0, 1, -150), holePosition: new THREE.Vector3(0, 0, 150), par: 4, distance: 300 },
    ];
    
    // Green (darker grass)
    const greenGeo = new THREE.CircleGeometry(15, 32);
    const greenMat = new THREE.MeshStandardMaterial({ color: 0x006400 });
    const green = new THREE.Mesh(greenGeo, greenMat);
    green.rotation.x = -Math.PI / 2;
    green.position.set(0, 0.1, 150);
    this.engine.add(green);
    
    // Fairway
    const fairwayGeo = new THREE.PlaneGeometry(30, 280);
    const fairwayMat = new THREE.MeshStandardMaterial({ color: 0x32CD32 });
    const fairway = new THREE.Mesh(fairwayGeo, fairwayMat);
    fairway.rotation.x = -Math.PI / 2;
    fairway.position.set(0, 0.05, 0);
    this.engine.add(fairway);
    
    // Bunkers
    this.createBunker(new THREE.Vector3(-20, 0, 100), 8);
    this.createBunker(new THREE.Vector3(15, 0, 50), 6);
    
    // Trees
    for (let i = 0; i < 30; i++) {
      const x = (Math.random() - 0.5) * 180;
      const z = (Math.random() - 0.5) * 380;
      if (Math.abs(x) > 20) {
        this.createTree(new THREE.Vector3(x, 0, z));
      }
    }
  }

  private createBunker(position: THREE.Vector3, radius: number): void {
    const bunkerGeo = new THREE.CircleGeometry(radius, 16);
    const bunkerMat = new THREE.MeshStandardMaterial({ color: 0xf4d03f });
    const bunker = new THREE.Mesh(bunkerGeo, bunkerMat);
    bunker.rotation.x = -Math.PI / 2;
    bunker.position.copy(position);
    bunker.position.y = 0.02;
    this.engine.add(bunker);
  }

  private createTree(position: THREE.Vector3): void {
    const trunkGeo = new THREE.CylinderGeometry(0.3, 0.5, 4, 8);
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x8B4513 });
    const trunk = new THREE.Mesh(trunkGeo, trunkMat);
    trunk.position.copy(position);
    trunk.position.y = 2;
    trunk.castShadow = true;
    this.engine.add(trunk);
    
    const foliageGeo = new THREE.ConeGeometry(3, 8, 8);
    const foliageMat = new THREE.MeshStandardMaterial({ color: 0x228B22 });
    const foliage = new THREE.Mesh(foliageGeo, foliageMat);
    foliage.position.copy(position);
    foliage.position.y = 8;
    foliage.castShadow = true;
    this.engine.add(foliage);
  }

  private createBall(): void {
    const ballGeo = new THREE.SphereGeometry(0.021, 16, 16); // Golf ball ~42mm diameter
    const ballMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3 });
    const mesh = new THREE.Mesh(ballGeo, ballMat);
    mesh.castShadow = true;
    this.engine.add(mesh);
    
    const body = this.engine.physics.addSphere(mesh, 0.021, 'dynamic', {
      mass: 0.046, // ~46 grams
      friction: 0.5,
      restitution: 0.6,
      linearDamping: 0.3,
      angularDamping: 0.5,
    });
    
    this.ball = { mesh, body };
  }

  private createFlag(): void {
    this.flagMesh = new THREE.Group();
    
    // Pole
    const poleGeo = new THREE.CylinderGeometry(0.02, 0.02, 2, 8);
    const poleMat = new THREE.MeshStandardMaterial({ color: 0xffffff });
    const pole = new THREE.Mesh(poleGeo, poleMat);
    pole.position.y = 1;
    this.flagMesh.add(pole);
    
    // Flag
    const flagGeo = new THREE.PlaneGeometry(0.5, 0.3);
    const flagMat = new THREE.MeshStandardMaterial({ color: 0xff0000, side: THREE.DoubleSide });
    const flag = new THREE.Mesh(flagGeo, flagMat);
    flag.position.set(0.25, 1.85, 0);
    this.flagMesh.add(flag);
    
    this.engine.add(this.flagMesh);
  }

  private setupHole(holeIndex: number): void {
    const hole = this.holes[holeIndex];
    
    this.ball.mesh.position.copy(hole.teePosition);
    this.engine.physics.setLinearVelocity(this.ball.body, new THREE.Vector3(0, 0, 0));
    
    this.flagMesh.position.copy(hole.holePosition);
    
    this.strokes = 0;
    this.isAiming = true;
    this.ballInFlight = false;
    this.power = 0;
    this.aimDirection = 0;
    
    // Point camera at hole
    this.updateCamera();
  }

  private randomizeWind(): void {
    this.windDirection = new THREE.Vector3(
      Math.random() - 0.5,
      0,
      Math.random() - 0.5
    ).normalize();
    this.windSpeed = Math.random() * 10; // 0-10 m/s
  }

  protected update(deltaTime: number, input: InputState): void {
    if (this.isAiming) {
      this.updateAiming(deltaTime, input);
    } else if (this.ballInFlight) {
      this.updateBallFlight(deltaTime);
    }
    
    this.updateCamera();
  }

  protected fixedUpdate(fixedDeltaTime: number): void {}

  private updateAiming(deltaTime: number, input: InputState): void {
    // Rotate aim
    this.aimDirection += input.virtual.moveX * deltaTime * 2;
    
    // Club selection
    if (input.keysJustPressed.has('KeyQ')) {
      this.currentClubIndex = Math.max(0, this.currentClubIndex - 1);
    }
    if (input.keysJustPressed.has('KeyE')) {
      this.currentClubIndex = Math.min(CLUBS.length - 1, this.currentClubIndex + 1);
    }
    
    // Power
    if (input.virtual.fire) {
      this.isPowerCharging = true;
      this.power = (Math.sin(this.gameTime * 3) + 1) / 2; // Oscillating power meter
    } else if (this.isPowerCharging) {
      this.swing();
    }
  }

  private swing(): void {
    this.isPowerCharging = false;
    this.isAiming = false;
    this.ballInFlight = true;
    this.strokes++;
    
    const club = CLUBS[this.currentClubIndex];
    const maxDistance = 250 * club.power;
    const speed = this.power * maxDistance * 0.15;
    
    const loftRad = (club.loft * Math.PI) / 180;
    const direction = new THREE.Vector3(
      Math.sin(this.aimDirection) * Math.cos(loftRad),
      Math.sin(loftRad),
      Math.cos(this.aimDirection) * Math.cos(loftRad)
    );
    
    // Add accuracy variance
    const variance = (1 - club.accuracy) * (Math.random() - 0.5) * 0.2;
    direction.x += variance;
    direction.z += variance;
    direction.normalize();
    
    const velocity = direction.multiplyScalar(speed);
    this.engine.physics.setLinearVelocity(this.ball.body, velocity);
    
    // Add backspin
    const spin = new THREE.Vector3(-speed * 0.5, 0, 0);
    this.engine.physics.setAngularVelocity(this.ball.body, spin);
  }

  private updateBallFlight(deltaTime: number): void {
    // Apply wind
    const windForce = this.windDirection.clone().multiplyScalar(this.windSpeed * 0.001);
    this.engine.physics.applyForce(this.ball.body, windForce);
    
    const velocity = this.engine.physics.getLinearVelocity(this.ball.body);
    const speed = velocity.length();
    
    // Check if ball stopped
    if (speed < 0.1 && this.ball.mesh.position.y < 1) {
      this.ballStopped();
    }
    
    // Check if in hole
    const hole = this.holes[this.currentHole];
    const distToHole = this.ball.mesh.position.distanceTo(hole.holePosition);
    if (distToHole < 0.1 && speed < 2) {
      this.ballInHole();
    }
  }

  private ballStopped(): void {
    this.ballInFlight = false;
    this.isAiming = true;
    this.power = 0;
    
    // Auto-select appropriate club based on distance
    const hole = this.holes[this.currentHole];
    const distance = this.ball.mesh.position.distanceTo(hole.holePosition);
    
    if (distance < 5) {
      this.currentClubIndex = CLUBS.length - 1; // Putter
    } else if (distance < 50) {
      this.currentClubIndex = 5; // Wedge
    } else if (distance < 100) {
      this.currentClubIndex = 3; // 7 Iron
    } else {
      this.currentClubIndex = 0; // Driver
    }
  }

  private ballInHole(): void {
    this.ballInFlight = false;
    
    const hole = this.holes[this.currentHole];
    const scoreRelativeToPar = this.strokes - hole.par;
    
    this.holeScores.push(this.strokes);
    this.totalScore = this.holeScores.reduce((a, b) => a + b, 0);
    
    this.addScore(Math.max(0, (hole.par - this.strokes + 5) * 100));
    
    // Next hole or end game
    if (this.currentHole < this.holes.length - 1) {
      this.currentHole++;
      this.setupHole(this.currentHole);
      this.randomizeWind();
    } else {
      this.end(true);
    }
  }

  private updateCamera(): void {
    const ballPos = this.ball.mesh.position;
    const hole = this.holes[this.currentHole];
    
    // Camera behind ball, looking towards hole
    const toHole = hole.holePosition.clone().sub(ballPos).normalize();
    const cameraOffset = toHole.clone().multiplyScalar(-15);
    cameraOffset.y = 8;
    
    const targetPos = ballPos.clone().add(cameraOffset);
    this.engine.camera.position.lerp(targetPos, 0.05);
    this.engine.camera.lookAt(ballPos.clone().add(toHole.multiplyScalar(10)));
  }

  public getCurrentClub(): Club { return CLUBS[this.currentClubIndex]; }
  public getPower(): number { return this.power; }
  public getStrokes(): number { return this.strokes; }
  public getCurrentHole(): number { return this.currentHole + 1; }
  public getTotalHoles(): number { return this.holes.length; }
  public getPar(): number { return this.holes[this.currentHole]?.par ?? 4; }
  public getDistanceToHole(): number {
    return this.ball.mesh.position.distanceTo(this.holes[this.currentHole].holePosition);
  }
  public getWindSpeed(): number { return this.windSpeed; }
  public getWindDirection(): THREE.Vector3 { return this.windDirection.clone(); }
  public getTotalScore(): number { return this.totalScore; }
  public isCurrentlyAiming(): boolean { return this.isAiming; }

  protected cleanup(): void {
    this.engine.remove(this.ball.mesh);
    this.engine.physics.removeBody(this.ball.body);
    this.engine.remove(this.flagMesh);
    this.engine.remove(this.terrainMesh);
  }
}

export default GolfGame;
