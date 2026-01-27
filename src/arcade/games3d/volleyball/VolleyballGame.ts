/**
 * ┌─────────────────────────────────────────────────────────────────────────────┐
 * │ LUCY ARCADE — 3D BEACH VOLLEYBALL                                          │
 * │                                                                             │
 * │ Fast-paced beach volleyball with physics-based ball control,               │
 * │ AI teammates and opponents, and rally scoring                              │
 * └─────────────────────────────────────────────────────────────────────────────┘
 */

import * as THREE from 'three';
import {
  Game3DBase,
  type Game3DConfig,
  ThirdPersonCameraController,
  type InputState,
} from '../../engine3d';

interface Player {
  mesh: THREE.Group;
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  team: 'player' | 'opponent';
  isJumping: boolean;
  jumpVelocity: number;
}

interface Ball {
  mesh: THREE.Mesh;
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  isInPlay: boolean;
  lastTouchedBy: 'player' | 'opponent' | null;
  touchCount: number;
}

export class VolleyballGame extends Game3DBase {
  private cameraController!: ThirdPersonCameraController;
  
  private players: Player[] = [];
  private controlledPlayer!: Player;
  private ball!: Ball;
  
  // Court dimensions
  private courtLength: number = 16;
  private courtWidth: number = 8;
  private netHeight: number = 2.43;
  
  // Scoring
  private playerScore: number = 0;
  private opponentScore: number = 0;
  private pointsToWin: number = 21;
  private isServing: boolean = true;
  private serverTeam: 'player' | 'opponent' = 'player';

  constructor(container: HTMLElement, config?: Game3DConfig) {
    super(container, {
      ...config,
      engineConfig: {
        shadows: true,
        bloom: true,
        bloomStrength: 0.4,
        fog: { color: 0x87ceeb, near: 20, far: 100 },
        ...config?.engineConfig,
      },
    });
  }

  protected async loadAssets(): Promise<void> {}

  protected initScene(): void {
    this.setupLighting();
    this.createCourt();
    this.createNet();
    this.createPlayers();
    this.createBall();
    
    this.cameraController = new ThirdPersonCameraController(this.engine.camera, {
      distance: 12,
      height: 6,
      minPitch: 0.2,
      maxPitch: 1.0,
    });
    
    this.createGradientSkybox(0x87ceeb, 0xffffff);
    this.setupServe();
  }

  private setupLighting(): void {
    this.engine.addAmbientLight(0xffffff, 0.6);
    this.engine.addDirectionalLight(0xffffff, 1.0, new THREE.Vector3(20, 40, 10), true);
  }

  private createCourt(): void {
    // Sand
    const sandGeo = new THREE.PlaneGeometry(this.courtWidth + 4, this.courtLength + 4);
    const sandMat = new THREE.MeshStandardMaterial({ color: 0xf4d03f, roughness: 0.9 });
    const sand = new THREE.Mesh(sandGeo, sandMat);
    sand.rotation.x = -Math.PI / 2;
    sand.receiveShadow = true;
    this.engine.add(sand);
    
    // Court lines
    const lineMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    
    // Boundary lines
    const lines = [
      { pos: [0, this.courtLength / 2], size: [this.courtWidth, 0.05] },
      { pos: [0, -this.courtLength / 2], size: [this.courtWidth, 0.05] },
      { pos: [this.courtWidth / 2, 0], size: [0.05, this.courtLength] },
      { pos: [-this.courtWidth / 2, 0], size: [0.05, this.courtLength] },
    ];
    
    lines.forEach(({ pos, size }) => {
      const geo = new THREE.PlaneGeometry(size[0], size[1]);
      const line = new THREE.Mesh(geo, lineMat);
      line.rotation.x = -Math.PI / 2;
      line.position.set(pos[0], 0.01, pos[1]);
      this.engine.add(line);
    });
  }

  private createNet(): void {
    // Posts
    const postGeo = new THREE.CylinderGeometry(0.05, 0.05, this.netHeight + 0.5, 8);
    const postMat = new THREE.MeshStandardMaterial({ color: 0x333333 });
    
    [-this.courtWidth / 2 - 0.5, this.courtWidth / 2 + 0.5].forEach(x => {
      const post = new THREE.Mesh(postGeo, postMat);
      post.position.set(x, (this.netHeight + 0.5) / 2, 0);
      this.engine.add(post);
    });
    
    // Net
    const netGeo = new THREE.PlaneGeometry(this.courtWidth + 1, 1);
    const netMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.8,
      side: THREE.DoubleSide,
    });
    const net = new THREE.Mesh(netGeo, netMat);
    net.position.set(0, this.netHeight - 0.5, 0);
    this.engine.add(net);
    
    // Top band
    const bandGeo = new THREE.BoxGeometry(this.courtWidth + 1, 0.1, 0.05);
    const bandMat = new THREE.MeshStandardMaterial({ color: 0xffffff });
    const band = new THREE.Mesh(bandGeo, bandMat);
    band.position.set(0, this.netHeight, 0);
    this.engine.add(band);
  }

  private createPlayers(): void {
    // Player team
    const playerPositions = [
      new THREE.Vector3(-2, 0, 5),
      new THREE.Vector3(2, 0, 5),
    ];
    
    playerPositions.forEach((pos, i) => {
      const player = this.createPlayer(pos, 'player');
      this.players.push(player);
      if (i === 0) this.controlledPlayer = player;
    });
    
    // Opponent team
    const opponentPositions = [
      new THREE.Vector3(-2, 0, -5),
      new THREE.Vector3(2, 0, -5),
    ];
    
    opponentPositions.forEach(pos => {
      const player = this.createPlayer(pos, 'opponent');
      this.players.push(player);
    });
  }

  private createPlayer(position: THREE.Vector3, team: 'player' | 'opponent'): Player {
    const group = new THREE.Group();
    const color = team === 'player' ? 0x0066cc : 0xcc0000;
    
    // Body
    const bodyGeo = new THREE.CapsuleGeometry(0.25, 0.7, 4, 8);
    const bodyMat = new THREE.MeshStandardMaterial({ color });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = 1;
    body.castShadow = true;
    group.add(body);
    
    // Head
    const headGeo = new THREE.SphereGeometry(0.15, 16, 16);
    const headMat = new THREE.MeshStandardMaterial({ color: 0xdeb887 });
    const head = new THREE.Mesh(headGeo, headMat);
    head.position.y = 1.6;
    group.add(head);
    
    // Arms
    const armGeo = new THREE.CapsuleGeometry(0.06, 0.4, 4, 8);
    const armMat = new THREE.MeshStandardMaterial({ color: 0xdeb887 });
    
    [-0.35, 0.35].forEach(x => {
      const arm = new THREE.Mesh(armGeo, armMat);
      arm.position.set(x, 1.1, 0);
      arm.rotation.z = x > 0 ? -0.3 : 0.3;
      group.add(arm);
    });
    
    group.position.copy(position);
    this.engine.add(group);
    
    return {
      mesh: group,
      position: position.clone(),
      velocity: new THREE.Vector3(),
      team,
      isJumping: false,
      jumpVelocity: 0,
    };
  }

  private createBall(): void {
    const ballGeo = new THREE.SphereGeometry(0.105, 32, 32);
    const ballMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.4,
    });
    const mesh = new THREE.Mesh(ballGeo, ballMat);
    mesh.castShadow = true;
    this.engine.add(mesh);
    
    this.ball = {
      mesh,
      position: new THREE.Vector3(),
      velocity: new THREE.Vector3(),
      isInPlay: false,
      lastTouchedBy: null,
      touchCount: 0,
    };
  }

  private setupServe(): void {
    this.isServing = true;
    this.ball.isInPlay = false;
    this.ball.touchCount = 0;
    this.ball.lastTouchedBy = null;
    
    const serveZ = this.serverTeam === 'player' ? this.courtLength / 2 + 1 : -this.courtLength / 2 - 1;
    this.ball.position.set(0, 1.5, serveZ);
    this.ball.mesh.position.copy(this.ball.position);
    this.ball.velocity.set(0, 0, 0);
  }

  protected update(deltaTime: number, input: InputState): void {
    this.updateControlledPlayer(deltaTime, input);
    this.updateAIPlayers(deltaTime);
    this.updateBall(deltaTime);
    
    this.cameraController.setTarget(this.ball.position);
    this.cameraController.update(deltaTime, input);
  }

  protected fixedUpdate(fixedDeltaTime: number): void {}

  private updateControlledPlayer(deltaTime: number, input: InputState): void {
    const player = this.controlledPlayer;
    
    // Movement
    const moveSpeed = 6;
    player.velocity.x = input.virtual.moveX * moveSpeed;
    player.velocity.z = -input.virtual.moveY * moveSpeed;
    
    player.position.x += player.velocity.x * deltaTime;
    player.position.z += player.velocity.z * deltaTime;
    
    // Clamp to player's side
    player.position.x = THREE.MathUtils.clamp(player.position.x, -this.courtWidth / 2, this.courtWidth / 2);
    player.position.z = THREE.MathUtils.clamp(player.position.z, 0.5, this.courtLength / 2);
    
    // Jumping
    if (input.keysJustPressed.has('Space') && !player.isJumping) {
      player.isJumping = true;
      player.jumpVelocity = 8;
    }
    
    if (player.isJumping) {
      player.jumpVelocity -= 20 * deltaTime;
      player.position.y += player.jumpVelocity * deltaTime;
      
      if (player.position.y <= 0) {
        player.position.y = 0;
        player.isJumping = false;
        player.jumpVelocity = 0;
      }
    }
    
    player.mesh.position.copy(player.position);
    
    // Hit ball
    if (input.virtual.firePressed) {
      this.tryHitBall(player);
    }
    
    // Serve
    if (this.isServing && this.serverTeam === 'player' && input.virtual.firePressed) {
      this.serve('player');
    }
  }

  private updateAIPlayers(deltaTime: number): void {
    this.players.forEach(player => {
      if (player === this.controlledPlayer) return;
      
      const isOnPlayerTeam = player.team === 'player';
      const targetZ = isOnPlayerTeam ? this.courtLength / 4 : -this.courtLength / 4;
      
      // Move towards ball if it's coming to this side
      const ballComingToSide = isOnPlayerTeam ? this.ball.velocity.z > 0 : this.ball.velocity.z < 0;
      
      if (ballComingToSide && this.ball.isInPlay) {
        const targetX = this.ball.position.x;
        const diff = targetX - player.position.x;
        player.position.x += Math.sign(diff) * Math.min(Math.abs(diff), 5 * deltaTime);
        
        // Jump to hit
        if (Math.abs(this.ball.position.z - player.position.z) < 2 && 
            this.ball.position.y > 1.5 && 
            !player.isJumping) {
          player.isJumping = true;
          player.jumpVelocity = 7;
        }
        
        // Try to hit
        if (this.ball.position.distanceTo(player.position.clone().add(new THREE.Vector3(0, 1.5, 0))) < 1) {
          this.tryHitBall(player);
        }
      } else {
        // Return to position
        const diffZ = targetZ - player.position.z;
        player.position.z += Math.sign(diffZ) * Math.min(Math.abs(diffZ), 3 * deltaTime);
      }
      
      // Clamp position
      const minZ = isOnPlayerTeam ? 0.5 : -this.courtLength / 2;
      const maxZ = isOnPlayerTeam ? this.courtLength / 2 : -0.5;
      player.position.x = THREE.MathUtils.clamp(player.position.x, -this.courtWidth / 2, this.courtWidth / 2);
      player.position.z = THREE.MathUtils.clamp(player.position.z, minZ, maxZ);
      
      // Jumping physics
      if (player.isJumping) {
        player.jumpVelocity -= 20 * deltaTime;
        player.position.y += player.jumpVelocity * deltaTime;
        
        if (player.position.y <= 0) {
          player.position.y = 0;
          player.isJumping = false;
        }
      }
      
      player.mesh.position.copy(player.position);
    });
    
    // AI serve
    if (this.isServing && this.serverTeam === 'opponent') {
      if (Math.random() < 0.02) {
        this.serve('opponent');
      }
    }
  }

  private serve(team: 'player' | 'opponent'): void {
    this.isServing = false;
    this.ball.isInPlay = true;
    this.ball.lastTouchedBy = team;
    this.ball.touchCount = 0;
    
    const direction = team === 'player' ? -1 : 1;
    
    this.ball.velocity.set(
      (Math.random() - 0.5) * 3,
      6,
      direction * 8
    );
  }

  private tryHitBall(player: Player): void {
    const handPos = player.position.clone().add(new THREE.Vector3(0, 1.5 + player.position.y, 0));
    const dist = this.ball.position.distanceTo(handPos);
    
    if (dist < 1 && this.ball.isInPlay) {
      // Check touch count
      if (this.ball.lastTouchedBy === player.team) {
        this.ball.touchCount++;
        if (this.ball.touchCount > 3) {
          this.pointScored(player.team === 'player' ? 'opponent' : 'player');
          return;
        }
      } else {
        this.ball.touchCount = 1;
      }
      
      this.ball.lastTouchedBy = player.team;
      
      // Hit direction
      const direction = player.team === 'player' ? -1 : 1;
      const power = 8 + Math.random() * 4;
      
      this.ball.velocity.set(
        (Math.random() - 0.5) * 5,
        5 + Math.random() * 3,
        direction * power
      );
    }
  }

  private updateBall(deltaTime: number): void {
    if (!this.ball.isInPlay) return;
    
    // Gravity
    this.ball.velocity.y -= 9.81 * deltaTime;
    
    // Air resistance
    this.ball.velocity.multiplyScalar(0.999);
    
    // Update position
    this.ball.position.addScaledVector(this.ball.velocity, deltaTime);
    this.ball.mesh.position.copy(this.ball.position);
    
    // Ground collision
    if (this.ball.position.y <= 0.105) {
      // Check if in bounds
      const inBounds = Math.abs(this.ball.position.x) <= this.courtWidth / 2 &&
                       Math.abs(this.ball.position.z) <= this.courtLength / 2;
      
      if (inBounds) {
        // Point scored
        const winner = this.ball.position.z > 0 ? 'opponent' : 'player';
        this.pointScored(winner);
      } else {
        // Out of bounds
        const winner = this.ball.lastTouchedBy === 'player' ? 'opponent' : 'player';
        this.pointScored(winner);
      }
      return;
    }
    
    // Net collision
    if (Math.abs(this.ball.position.z) < 0.1 &&
        this.ball.position.y < this.netHeight &&
        this.ball.position.y > 0) {
      this.ball.velocity.z = -this.ball.velocity.z * 0.3;
    }
  }

  private pointScored(winner: 'player' | 'opponent'): void {
    if (winner === 'player') {
      this.playerScore++;
      this.addScore(1);
    } else {
      this.opponentScore++;
    }
    
    // Check for game win
    if (this.playerScore >= this.pointsToWin && this.playerScore - this.opponentScore >= 2) {
      this.end(true);
      return;
    }
    if (this.opponentScore >= this.pointsToWin && this.opponentScore - this.playerScore >= 2) {
      this.end(false);
      return;
    }
    
    // Winner serves
    this.serverTeam = winner;
    this.setupServe();
  }

  public getPlayerScore(): number { return this.playerScore; }
  public getOpponentScore(): number { return this.opponentScore; }
  public isCurrentlyServing(): boolean { return this.isServing; }
  public getServerTeam(): 'player' | 'opponent' { return this.serverTeam; }
  public getPointsToWin(): number { return this.pointsToWin; }

  protected cleanup(): void {
    this.players.forEach(p => this.engine.remove(p.mesh));
    this.engine.remove(this.ball.mesh);
  }
}

export default VolleyballGame;
