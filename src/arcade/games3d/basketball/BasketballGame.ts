/**
 * ┌─────────────────────────────────────────────────────────────────────────────┐
 * │ LUCY ARCADE — STREET BASKETBALL 3D                                         │
 * │                                                                             │
 * │ AAA-quality basketball game with:                                          │
 * │ • Physics-based shooting mechanics                                         │
 * │ • AI opponents                                                             │
 * │ • Multiple game modes (1v1, 3v3, shootout)                                │
 * │ • Trick shots and combos                                                   │
 * └─────────────────────────────────────────────────────────────────────────────┘
 */

import * as THREE from 'three';
import {
  Game3DBase,
  type Game3DConfig,
  ThirdPersonCameraController,
  ParticlePresets,
  CollisionGroups,
  type PhysicsBody,
  type InputState,
} from '../../engine3d';

// ============================================================================
// TYPES
// ============================================================================

type GameMode = 'shootout' | '1v1' | '3v3';

interface Player {
  id: string;
  name: string;
  mesh: THREE.Group;
  body: PhysicsBody;
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  
  // Stats
  speed: number;
  shootingSkill: number;
  defense: number;
  
  // State
  hasBall: boolean;
  isAiming: boolean;
  isShooting: boolean;
  isJumping: boolean;
  stamina: number;
  maxStamina: number;
  
  // Animation
  animationTime: number;
  
  // Team
  team: 'player' | 'opponent';
  color: number;
}

interface Ball {
  mesh: THREE.Mesh;
  body: PhysicsBody;
  holder: Player | null;
  isInFlight: boolean;
  lastShooter: Player | null;
}

interface ShotState {
  power: number;
  angle: number;
  spin: number;
  isCharging: boolean;
  releaseTime: number;
}

interface Hoop {
  position: THREE.Vector3;
  mesh: THREE.Group;
  rimBody: PhysicsBody;
  backboardBody: PhysicsBody;
  team: 'player' | 'opponent';
}

// ============================================================================
// BASKETBALL GAME CLASS
// ============================================================================

export class BasketballGame extends Game3DBase {
  // Camera
  private cameraController!: ThirdPersonCameraController;
  
  // Game mode
  private gameMode: GameMode = 'shootout';
  
  // Players
  private playerCharacter!: Player;
  private aiPlayers: Player[] = [];
  private allPlayers: Player[] = [];
  
  // Ball
  private ball!: Ball;
  
  // Hoops
  private playerHoop!: Hoop;
  private opponentHoop!: Hoop;
  
  // Shot state
  private shotState: ShotState = {
    power: 0,
    angle: 45,
    spin: 0,
    isCharging: false,
    releaseTime: 0,
  };
  
  // Game state
  private playerScore: number = 0;
  private opponentScore: number = 0;
  private shotClock: number = 24;
  private gameTime: number = 120; // 2 minute games
  private possession: 'player' | 'opponent' = 'player';
  
  // Streak/combo
  private consecutiveShots: number = 0;
  private comboMultiplier: number = 1;
  
  // Court
  private courtMeshes: THREE.Mesh[] = [];

  constructor(container: HTMLElement, config?: Game3DConfig) {
    super(container, {
      ...config,
      engineConfig: {
        shadows: true,
        shadowMapSize: 2048,
        bloom: true,
        bloomStrength: 0.5,
        bloomThreshold: 0.85,
        fog: null,
        backgroundColor: 0x1a1a2e,
        ...config?.engineConfig,
      },
    });
  }

  // ============================================================================
  // LIFECYCLE
  // ============================================================================

  protected async loadAssets(): Promise<void> {
    console.log('[Basketball] Loading assets...');
    console.log('[Basketball] Assets loaded');
  }

  protected initScene(): void {
    console.log('[Basketball] Initializing scene...');
    
    // Setup lighting
    this.setupLighting();
    
    // Create court
    this.createCourt();
    
    // Create hoops
    this.createHoops();
    
    // Create ball
    this.createBall();
    
    // Create players
    this.createPlayers();
    
    // Setup camera
    this.cameraController = new ThirdPersonCameraController(this.engine.camera, {
      distance: 12,
      height: 6,
      minPitch: 0.1,
      maxPitch: 1.0,
    });
    
    // Create particle systems
    this.createParticleSystem('swish', {
      ...ParticlePresets.sparks(),
      startColor: new THREE.Color(0xffaa00),
      endColor: new THREE.Color(0xff6600),
    });
    this.createParticleSystem('dust', ParticlePresets.dust());
    
    // Initialize game state
    this.playerScore = 0;
    this.opponentScore = 0;
    this.shotClock = 24;
    this.gameTime = 120;
    this.consecutiveShots = 0;
    this.comboMultiplier = 1;
    
    // Give ball to player
    this.giveBallTo(this.playerCharacter);
    
    // Create skybox
    this.createGradientSkybox(0x1a1a2e, 0x0a0a1a);
    
    console.log('[Basketball] Scene initialized');
  }

  private setupLighting(): void {
    // Ambient
    this.engine.addAmbientLight(0xffffff, 0.4);
    
    // Court lights
    const lightPositions = [
      { x: -10, y: 15, z: 0 },
      { x: 10, y: 15, z: 0 },
      { x: 0, y: 15, z: -10 },
      { x: 0, y: 15, z: 10 },
    ];
    
    lightPositions.forEach(pos => {
      const light = this.engine.addSpotLight(
        0xffffff,
        2,
        new THREE.Vector3(pos.x, pos.y, pos.z),
        new THREE.Vector3(0, 0, 0),
        Math.PI / 4,
        0.5,
        true
      );
    });
    
    // Colored accent lights
    this.engine.addPointLight(0xff6600, 1, new THREE.Vector3(-15, 3, 0), 10, 2);
    this.engine.addPointLight(0x0066ff, 1, new THREE.Vector3(15, 3, 0), 10, 2);
  }

  private createCourt(): void {
    // Court floor
    const courtGeometry = new THREE.PlaneGeometry(28.65, 15.24); // NBA court dimensions (scaled)
    const courtMaterial = new THREE.MeshStandardMaterial({
      color: 0x8B4513,
      roughness: 0.6,
      metalness: 0.1,
    });
    const court = new THREE.Mesh(courtGeometry, courtMaterial);
    court.rotation.x = -Math.PI / 2;
    court.receiveShadow = true;
    this.engine.add(court);
    this.courtMeshes.push(court);
    
    // Add physics
    this.engine.physics.addBox(
      court,
      new THREE.Vector3(28.65, 0.1, 15.24),
      'static',
      { friction: 0.8, restitution: 0.3 }
    );
    
    // Court lines
    this.createCourtLines();
    
    // Three-point line
    this.createThreePointLine();
    
    // Key/paint areas
    this.createKeyArea(-11, 0xff6600);
    this.createKeyArea(11, 0x0066ff);
  }

  private createCourtLines(): void {
    const lineMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
    
    // Center circle
    const centerCircle = new THREE.RingGeometry(1.8, 1.85, 32);
    const centerLine = new THREE.Mesh(centerCircle, lineMaterial);
    centerLine.rotation.x = -Math.PI / 2;
    centerLine.position.y = 0.01;
    this.engine.add(centerLine);
    
    // Half court line
    const halfLineGeometry = new THREE.PlaneGeometry(0.1, 15.24);
    const halfLine = new THREE.Mesh(halfLineGeometry, lineMaterial);
    halfLine.rotation.x = -Math.PI / 2;
    halfLine.position.y = 0.01;
    this.engine.add(halfLine);
    
    // Boundary lines
    const boundaryPositions = [
      { x: 0, z: 7.62, width: 28.65, height: 0.1 },
      { x: 0, z: -7.62, width: 28.65, height: 0.1 },
      { x: 14.325, z: 0, width: 0.1, height: 15.24 },
      { x: -14.325, z: 0, width: 0.1, height: 15.24 },
    ];
    
    boundaryPositions.forEach(({ x, z, width, height }) => {
      const geo = new THREE.PlaneGeometry(width, height);
      const line = new THREE.Mesh(geo, lineMaterial);
      line.rotation.x = -Math.PI / 2;
      line.position.set(x, 0.01, z);
      this.engine.add(line);
    });
  }

  private createThreePointLine(): void {
    const lineMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
    
    // Three-point arc (simplified)
    [-1, 1].forEach(side => {
      const arcGeometry = new THREE.RingGeometry(6.7, 6.75, 32, 1, 0, Math.PI);
      const arc = new THREE.Mesh(arcGeometry, lineMaterial);
      arc.rotation.x = -Math.PI / 2;
      arc.rotation.z = side > 0 ? Math.PI / 2 : -Math.PI / 2;
      arc.position.set(side * 11, 0.01, 0);
      this.engine.add(arc);
    });
  }

  private createKeyArea(x: number, color: number): void {
    // Paint area
    const keyGeometry = new THREE.PlaneGeometry(5.8, 4.9);
    const keyMaterial = new THREE.MeshStandardMaterial({
      color,
      roughness: 0.7,
      transparent: true,
      opacity: 0.3,
    });
    const key = new THREE.Mesh(keyGeometry, keyMaterial);
    key.rotation.x = -Math.PI / 2;
    key.position.set(x, 0.005, 0);
    this.engine.add(key);
    
    // Free throw circle
    const ftCircle = new THREE.RingGeometry(1.8, 1.85, 32);
    const ftMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const ftLine = new THREE.Mesh(ftCircle, ftMaterial);
    ftLine.rotation.x = -Math.PI / 2;
    ftLine.position.set(x > 0 ? x - 2.9 : x + 2.9, 0.01, 0);
    this.engine.add(ftLine);
  }

  private createHoops(): void {
    this.playerHoop = this.createHoop(-12.5, 'player');
    this.opponentHoop = this.createHoop(12.5, 'opponent');
  }

  private createHoop(x: number, team: 'player' | 'opponent'): Hoop {
    const group = new THREE.Group();
    
    // Backboard
    const backboardGeometry = new THREE.BoxGeometry(1.8, 1.05, 0.05);
    const backboardMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.7,
      roughness: 0.1,
      metalness: 0.3,
    });
    const backboard = new THREE.Mesh(backboardGeometry, backboardMaterial);
    backboard.position.set(0, 3.05, 0);
    backboard.castShadow = true;
    group.add(backboard);
    
    // Rim
    const rimGeometry = new THREE.TorusGeometry(0.225, 0.02, 8, 32);
    const rimMaterial = new THREE.MeshStandardMaterial({
      color: 0xff6600,
      roughness: 0.3,
      metalness: 0.8,
    });
    const rim = new THREE.Mesh(rimGeometry, rimMaterial);
    rim.rotation.x = Math.PI / 2;
    rim.position.set(x > 0 ? -0.15 : 0.15, 3.05, 0);
    rim.castShadow = true;
    group.add(rim);
    
    // Net (simplified)
    const netGeometry = new THREE.CylinderGeometry(0.225, 0.15, 0.4, 16, 1, true);
    const netMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      wireframe: true,
      transparent: true,
      opacity: 0.5,
    });
    const net = new THREE.Mesh(netGeometry, netMaterial);
    net.position.set(x > 0 ? -0.15 : 0.15, 2.85, 0);
    group.add(net);
    
    // Pole
    const poleGeometry = new THREE.CylinderGeometry(0.1, 0.1, 3.05, 8);
    const poleMaterial = new THREE.MeshStandardMaterial({
      color: 0x333333,
      roughness: 0.5,
      metalness: 0.5,
    });
    const pole = new THREE.Mesh(poleGeometry, poleMaterial);
    pole.position.set(x > 0 ? 0.9 : -0.9, 1.525, 0);
    pole.castShadow = true;
    group.add(pole);
    
    group.position.x = x;
    this.engine.add(group);
    
    // Physics for backboard
    const backboardBody = this.engine.physics.addBox(
      backboard,
      new THREE.Vector3(1.8, 1.05, 0.1),
      'static',
      { restitution: 0.7 }
    );
    
    // Physics for rim (simplified as box)
    const rimBody = this.engine.physics.addBox(
      rim,
      new THREE.Vector3(0.5, 0.05, 0.5),
      'static',
      { restitution: 0.5 }
    );
    
    return {
      position: new THREE.Vector3(x, 3.05, 0),
      mesh: group,
      rimBody,
      backboardBody,
      team,
    };
  }

  private createBall(): void {
    const geometry = new THREE.SphereGeometry(0.12, 32, 32);
    const material = new THREE.MeshStandardMaterial({
      color: 0xff6600,
      roughness: 0.8,
      metalness: 0.1,
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.castShadow = true;
    mesh.position.set(0, 1, 0);
    this.engine.add(mesh);
    
    const body = this.engine.physics.addSphere(
      mesh,
      0.12,
      'dynamic',
      {
        restitution: 0.8,
        friction: 0.6,
        linearDamping: 0.3,
        angularDamping: 0.3,
      }
    );
    
    this.ball = {
      mesh,
      body,
      holder: null,
      isInFlight: false,
      lastShooter: null,
    };
  }

  private createPlayers(): void {
    // Player character
    this.playerCharacter = this.createPlayer('Player', 'player', 0x0066ff, new THREE.Vector3(-5, 0, 0));
    this.allPlayers.push(this.playerCharacter);
    
    // AI opponents (for shootout mode, just one defender)
    if (this.gameMode !== 'shootout') {
      const defender = this.createPlayer('Defender', 'opponent', 0xff0066, new THREE.Vector3(5, 0, 0));
      this.aiPlayers.push(defender);
      this.allPlayers.push(defender);
    }
  }

  private createPlayer(name: string, team: 'player' | 'opponent', color: number, position: THREE.Vector3): Player {
    const group = new THREE.Group();
    
    // Body
    const bodyGeometry = new THREE.CapsuleGeometry(0.3, 1.0, 4, 8);
    const bodyMaterial = new THREE.MeshStandardMaterial({
      color,
      roughness: 0.6,
    });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = 1.0;
    body.castShadow = true;
    group.add(body);
    
    // Head
    const headGeometry = new THREE.SphereGeometry(0.2, 16, 16);
    const headMaterial = new THREE.MeshStandardMaterial({
      color: 0xdeb887,
      roughness: 0.8,
    });
    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.position.y = 1.8;
    head.castShadow = true;
    group.add(head);
    
    // Jersey number
    // (Would add text sprite here in production)
    
    group.position.copy(position);
    this.engine.add(group);
    
    const physicsBody = this.engine.physics.addCapsule(
      group,
      0.5,
      0.3,
      'dynamic',
      {
        collisionGroups: team === 'player' ? CollisionGroups.PLAYER : CollisionGroups.ENEMY,
        linearDamping: 5,
        angularDamping: 10,
      }
    );
    
    return {
      id: `player_${name}`,
      name,
      mesh: group,
      body: physicsBody,
      position: position.clone(),
      velocity: new THREE.Vector3(),
      speed: 6,
      shootingSkill: 0.8,
      defense: 0.7,
      hasBall: false,
      isAiming: false,
      isShooting: false,
      isJumping: false,
      stamina: 100,
      maxStamina: 100,
      animationTime: 0,
      team,
      color,
    };
  }

  private giveBallTo(player: Player): void {
    if (this.ball.holder) {
      this.ball.holder.hasBall = false;
    }
    
    this.ball.holder = player;
    player.hasBall = true;
    this.ball.isInFlight = false;
    
    // Reset shot clock
    this.shotClock = 24;
  }

  // ============================================================================
  // UPDATE LOOP
  // ============================================================================

  protected update(deltaTime: number, input: InputState): void {
    // Update game time
    this.gameTime -= deltaTime;
    if (this.gameTime <= 0) {
      this.gameTime = 0;
      this.end(this.playerScore > this.opponentScore);
      return;
    }
    
    // Update shot clock
    if (this.ball.holder || this.ball.isInFlight) {
      this.shotClock -= deltaTime;
      if (this.shotClock <= 0) {
        // Shot clock violation - turnover
        this.turnover();
      }
    }
    
    // Update player
    this.updatePlayer(deltaTime, input);
    
    // Update AI
    this.updateAI(deltaTime);
    
    // Update ball
    this.updateBall(deltaTime);
    
    // Update camera
    this.cameraController.setTarget(this.playerCharacter.mesh.position);
    this.cameraController.update(deltaTime, input);
    
    // Check for scores
    this.checkScore();
    
    // Update score display
    this.setScore({
      score: this.playerScore,
      time: this.gameTime,
    });
  }

  protected fixedUpdate(fixedDeltaTime: number): void {
    // Physics handled in update
  }

  private updatePlayer(deltaTime: number, input: InputState): void {
    const player = this.playerCharacter;
    
    // Movement
    if (!player.isAiming) {
      const moveSpeed = input.virtual.sprint ? player.speed * 1.5 : player.speed;
      
      const forward = new THREE.Vector3(1, 0, 0);
      const right = new THREE.Vector3(0, 0, 1);
      
      const movement = new THREE.Vector3();
      movement.addScaledVector(forward, input.virtual.moveY * moveSpeed);
      movement.addScaledVector(right, input.virtual.moveX * moveSpeed);
      
      if (movement.length() > 0) {
        this.engine.physics.setLinearVelocity(player.body, movement);
        
        // Face movement direction
        const angle = Math.atan2(movement.z, movement.x);
        player.mesh.rotation.y = -angle + Math.PI / 2;
      } else {
        this.engine.physics.setLinearVelocity(player.body, new THREE.Vector3(0, 0, 0));
      }
    }
    
    // Update position from physics
    player.position.copy(player.mesh.position);
    
    // Ball handling
    if (player.hasBall && this.ball.holder === player) {
      // Position ball in front of player
      const ballOffset = new THREE.Vector3(0.5, 1.2, 0);
      ballOffset.applyAxisAngle(new THREE.Vector3(0, 1, 0), player.mesh.rotation.y);
      
      const ballPos = player.position.clone().add(ballOffset);
      this.ball.mesh.position.copy(ballPos);
      this.engine.physics.setLinearVelocity(this.ball.body, new THREE.Vector3(0, 0, 0));
    }
    
    // Shooting
    if (player.hasBall) {
      // Start aiming
      if (input.virtual.fire && !this.shotState.isCharging) {
        this.shotState.isCharging = true;
        this.shotState.power = 0;
        player.isAiming = true;
      }
      
      // Charge shot
      if (this.shotState.isCharging && input.virtual.fire) {
        this.shotState.power = Math.min(1, this.shotState.power + deltaTime * 1.5);
        
        // Adjust angle with up/down
        if (input.keys.has('ArrowUp') || input.keys.has('KeyW')) {
          this.shotState.angle = Math.min(70, this.shotState.angle + deltaTime * 30);
        }
        if (input.keys.has('ArrowDown') || input.keys.has('KeyS')) {
          this.shotState.angle = Math.max(30, this.shotState.angle - deltaTime * 30);
        }
      }
      
      // Release shot
      if (this.shotState.isCharging && !input.virtual.fire) {
        this.shoot(player);
      }
    }
    
    // Jumping
    if (input.virtual.jumpPressed && !player.isJumping) {
      player.isJumping = true;
      this.engine.physics.applyImpulse(player.body, new THREE.Vector3(0, 8, 0));
    }
    
    // Check if grounded
    if (player.mesh.position.y <= 0.1) {
      player.isJumping = false;
    }
  }

  private shoot(player: Player): void {
    const state = this.shotState;
    
    // Calculate shot direction towards opponent's hoop
    const targetHoop = player.team === 'player' ? this.opponentHoop : this.playerHoop;
    const toHoop = targetHoop.position.clone().sub(player.position);
    toHoop.y = 0;
    toHoop.normalize();
    
    // Calculate shot velocity
    const distance = player.position.distanceTo(targetHoop.position);
    const power = state.power * 15 + distance * 0.5;
    const angleRad = (state.angle * Math.PI) / 180;
    
    const velocity = new THREE.Vector3(
      toHoop.x * Math.cos(angleRad) * power,
      Math.sin(angleRad) * power,
      toHoop.z * Math.cos(angleRad) * power
    );
    
    // Release ball
    player.hasBall = false;
    this.ball.holder = null;
    this.ball.isInFlight = true;
    this.ball.lastShooter = player;
    
    // Apply velocity to ball
    this.engine.physics.setLinearVelocity(this.ball.body, velocity);
    
    // Add spin
    this.engine.physics.setAngularVelocity(
      this.ball.body,
      new THREE.Vector3(0, 0, -10)
    );
    
    // Reset shot state
    state.isCharging = false;
    state.power = 0;
    player.isAiming = false;
    player.isShooting = true;
    
    setTimeout(() => {
      player.isShooting = false;
    }, 500);
  }

  private updateAI(deltaTime: number): void {
    this.aiPlayers.forEach(ai => {
      if (ai.hasBall) {
        // AI with ball - try to score
        // Simple: move towards hoop and shoot
        const targetHoop = ai.team === 'player' ? this.opponentHoop : this.playerHoop;
        const toHoop = targetHoop.position.clone().sub(ai.position);
        const distance = toHoop.length();
        
        if (distance < 5) {
          // Close enough to shoot
          this.shotState.power = 0.7 + Math.random() * 0.2;
          this.shotState.angle = 45 + Math.random() * 10;
          this.shoot(ai);
        } else {
          // Move towards hoop
          toHoop.normalize().multiplyScalar(ai.speed);
          this.engine.physics.setLinearVelocity(ai.body, toHoop);
        }
      } else {
        // AI without ball - defend or chase ball
        if (this.ball.isInFlight) {
          // Try to get rebound
          const toBall = this.ball.mesh.position.clone().sub(ai.position);
          toBall.y = 0;
          toBall.normalize().multiplyScalar(ai.speed);
          this.engine.physics.setLinearVelocity(ai.body, toBall);
        } else if (this.ball.holder && this.ball.holder.team !== ai.team) {
          // Defend
          const toPlayer = this.ball.holder.position.clone().sub(ai.position);
          toPlayer.y = 0;
          if (toPlayer.length() > 2) {
            toPlayer.normalize().multiplyScalar(ai.speed * 0.8);
            this.engine.physics.setLinearVelocity(ai.body, toPlayer);
          }
        }
      }
      
      // Update position
      ai.position.copy(ai.mesh.position);
    });
  }

  private updateBall(deltaTime: number): void {
    if (this.ball.isInFlight) {
      // Check if ball is on ground
      if (this.ball.mesh.position.y < 0.15) {
        this.ball.isInFlight = false;
        
        // Ball is loose - anyone can grab it
        this.checkBallPickup();
      }
    }
  }

  private checkBallPickup(): void {
    if (this.ball.holder) return;
    
    let closestPlayer: Player | null = null;
    let closestDistance = 2; // Pickup range
    
    this.allPlayers.forEach(player => {
      const distance = player.position.distanceTo(this.ball.mesh.position);
      if (distance < closestDistance) {
        closestDistance = distance;
        closestPlayer = player;
      }
    });
    
    if (closestPlayer) {
      this.giveBallTo(closestPlayer);
    }
  }

  private checkScore(): void {
    if (!this.ball.isInFlight) return;
    
    // Check if ball went through either hoop
    [this.playerHoop, this.opponentHoop].forEach(hoop => {
      const ballPos = this.ball.mesh.position;
      const hoopPos = hoop.position;
      
      // Simple check: ball near rim height and within rim radius
      const horizontalDist = Math.hypot(
        ballPos.x - (hoopPos.x + (hoop.team === 'player' ? 0.15 : -0.15)),
        ballPos.z - hoopPos.z
      );
      
      if (horizontalDist < 0.3 && Math.abs(ballPos.y - hoopPos.y) < 0.3) {
        // Check if ball is going down (scored)
        const velocity = this.engine.physics.getLinearVelocity(this.ball.body);
        
        if (velocity.y < 0) {
          this.scoreBasket(hoop);
        }
      }
    });
  }

  private scoreBasket(hoop: Hoop): void {
    const shooter = this.ball.lastShooter;
    if (!shooter) return;
    
    // Determine points
    const distance = shooter.position.distanceTo(hoop.position);
    const isThreePointer = distance > 6.7;
    const points = isThreePointer ? 3 : 2;
    
    // Add score to correct team
    if (shooter.team === 'player' && hoop.team === 'opponent') {
      this.playerScore += points * this.comboMultiplier;
      this.consecutiveShots++;
      this.comboMultiplier = Math.min(3, 1 + this.consecutiveShots * 0.5);
      
      // Effects
      const swish = this.getParticleSystem('swish');
      if (swish) {
        swish.setPosition(hoop.position);
        swish.burst(30);
      }
      
      this.screenShake(0.1, 0.1);
    } else if (shooter.team === 'opponent' && hoop.team === 'player') {
      this.opponentScore += points;
      this.consecutiveShots = 0;
      this.comboMultiplier = 1;
    }
    
    // Reset possession
    this.ball.isInFlight = false;
    this.ball.lastShooter = null;
    
    // Give ball to other team
    const newPossessor = shooter.team === 'player' ? this.aiPlayers[0] : this.playerCharacter;
    if (newPossessor) {
      // Reset ball position
      this.ball.mesh.position.set(
        newPossessor.team === 'player' ? -10 : 10,
        1,
        0
      );
      
      setTimeout(() => {
        this.giveBallTo(newPossessor);
      }, 1000);
    }
  }

  private turnover(): void {
    this.shotClock = 24;
    this.consecutiveShots = 0;
    this.comboMultiplier = 1;
    
    // Give ball to other team
    if (this.ball.holder?.team === 'player') {
      const opponent = this.aiPlayers[0];
      if (opponent) {
        this.giveBallTo(opponent);
      }
    } else {
      this.giveBallTo(this.playerCharacter);
    }
  }

  // ============================================================================
  // PUBLIC GETTERS FOR UI
  // ============================================================================

  public getPlayerScore(): number {
    return this.playerScore;
  }

  public getOpponentScore(): number {
    return this.opponentScore;
  }

  public getShotClock(): number {
    return Math.ceil(this.shotClock);
  }

  public getGameTime(): number {
    return this.gameTime;
  }

  public getShotPower(): number {
    return this.shotState.power;
  }

  public getShotAngle(): number {
    return this.shotState.angle;
  }

  public isAiming(): boolean {
    return this.shotState.isCharging;
  }

  public getComboMultiplier(): number {
    return this.comboMultiplier;
  }

  public getConsecutiveShots(): number {
    return this.consecutiveShots;
  }

  public hasBall(): boolean {
    return this.playerCharacter?.hasBall ?? false;
  }

  // ============================================================================
  // CLEANUP
  // ============================================================================

  protected cleanup(): void {
    // Remove players
    this.allPlayers.forEach(player => {
      this.engine.remove(player.mesh);
      this.engine.physics.removeBody(player.body);
    });
    this.allPlayers = [];
    this.aiPlayers = [];
    
    // Remove ball
    if (this.ball) {
      this.engine.remove(this.ball.mesh);
      this.engine.physics.removeBody(this.ball.body);
    }
    
    // Remove court meshes
    this.courtMeshes.forEach(mesh => {
      this.engine.remove(mesh);
      mesh.geometry.dispose();
      (mesh.material as THREE.Material).dispose();
    });
    this.courtMeshes = [];
    
    console.log('[Basketball] Cleanup complete');
  }
}

export default BasketballGame;
