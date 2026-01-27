/**
 * ┌─────────────────────────────────────────────────────────────────────────────┐
 * │ LUCY ARCADE — 3D TENNIS                                                    │
 * │                                                                             │
 * │ Fast-paced tennis with realistic ball physics, spin mechanics,             │
 * │ AI opponents, and full match scoring                                       │
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

interface Player {
  mesh: THREE.Group;
  position: THREE.Vector3;
  side: 'near' | 'far';
  isServing: boolean;
  isSwinging: boolean;
  swingProgress: number;
  swingType: 'forehand' | 'backhand' | 'serve' | 'volley';
}

interface Ball {
  mesh: THREE.Mesh;
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  spin: THREE.Vector3;
  isInPlay: boolean;
  lastHitBy: 'player' | 'opponent' | null;
  bounceCount: number;
}

type ScorePoint = 0 | 15 | 30 | 40 | 'AD';

interface GameScore {
  player: ScorePoint;
  opponent: ScorePoint;
  playerGames: number;
  opponentGames: number;
  playerSets: number;
  opponentSets: number;
}

export class TennisGame extends Game3DBase {
  private cameraController!: ThirdPersonCameraController;
  
  private player!: Player;
  private opponent!: Player;
  private ball!: Ball;
  
  // Court dimensions (meters)
  private courtLength: number = 23.77;
  private courtWidth: number = 10.97;
  private netHeight: number = 0.914;
  
  // Scoring
  private score: GameScore = {
    player: 0,
    opponent: 0,
    playerGames: 0,
    opponentGames: 0,
    playerSets: 0,
    opponentSets: 0,
  };
  
  // State
  private isServing: boolean = true;
  private serverSide: 'player' | 'opponent' = 'player';
  private serveSide: 'deuce' | 'ad' = 'deuce';

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
    this.createCourt();
    this.createNet();
    this.createPlayers();
    this.createBall();
    
    this.cameraController = new ThirdPersonCameraController(this.engine.camera, {
      distance: 15,
      height: 8,
      minPitch: 0.3,
      maxPitch: 1.0,
    });
    
    this.createGradientSkybox(0x87ceeb, 0xffffff);
    this.setupServe();
  }

  private setupLighting(): void {
    this.engine.addAmbientLight(0xffffff, 0.5);
    this.engine.addDirectionalLight(0xffffff, 1.0, new THREE.Vector3(20, 40, 10), true);
  }

  private createCourt(): void {
    // Court surface (hard court blue)
    const courtGeo = new THREE.PlaneGeometry(this.courtWidth + 6, this.courtLength + 6);
    const courtMat = new THREE.MeshStandardMaterial({ color: 0x3366aa, roughness: 0.7 });
    const court = new THREE.Mesh(courtGeo, courtMat);
    court.rotation.x = -Math.PI / 2;
    court.receiveShadow = true;
    this.engine.add(court);
    
    // Playing area (lighter blue)
    const playAreaGeo = new THREE.PlaneGeometry(this.courtWidth, this.courtLength);
    const playAreaMat = new THREE.MeshStandardMaterial({ color: 0x4488cc, roughness: 0.6 });
    const playArea = new THREE.Mesh(playAreaGeo, playAreaMat);
    playArea.rotation.x = -Math.PI / 2;
    playArea.position.y = 0.01;
    playArea.receiveShadow = true;
    this.engine.add(playArea);
    
    // Court lines
    const lineMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    
    // Baseline
    this.createLine(0, this.courtLength / 2, this.courtWidth, 0.05);
    this.createLine(0, -this.courtLength / 2, this.courtWidth, 0.05);
    
    // Sidelines
    this.createLine(this.courtWidth / 2, 0, 0.05, this.courtLength);
    this.createLine(-this.courtWidth / 2, 0, 0.05, this.courtLength);
    
    // Service lines
    this.createLine(0, 6.4, this.courtWidth - 2.74, 0.05);
    this.createLine(0, -6.4, this.courtWidth - 2.74, 0.05);
    
    // Center service line
    this.createLine(0, 0, 0.05, 12.8);
    
    // Center mark
    this.createLine(0, this.courtLength / 2 - 0.2, 0.05, 0.4);
    this.createLine(0, -this.courtLength / 2 + 0.2, 0.05, 0.4);
    
    // Singles sidelines
    this.createLine((this.courtWidth - 2.74) / 2, 0, 0.05, this.courtLength);
    this.createLine(-(this.courtWidth - 2.74) / 2, 0, 0.05, this.courtLength);
  }

  private createLine(x: number, z: number, width: number, length: number): void {
    const geo = new THREE.PlaneGeometry(width, length);
    const mat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const line = new THREE.Mesh(geo, mat);
    line.rotation.x = -Math.PI / 2;
    line.position.set(x, 0.02, z);
    this.engine.add(line);
  }

  private createNet(): void {
    // Net posts
    const postGeo = new THREE.CylinderGeometry(0.04, 0.04, 1.07, 8);
    const postMat = new THREE.MeshStandardMaterial({ color: 0x333333, metalness: 0.8 });
    
    [-this.courtWidth / 2 - 0.5, this.courtWidth / 2 + 0.5].forEach(x => {
      const post = new THREE.Mesh(postGeo, postMat);
      post.position.set(x, 0.535, 0);
      this.engine.add(post);
    });
    
    // Net
    const netGeo = new THREE.PlaneGeometry(this.courtWidth + 1, this.netHeight);
    const netMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.8,
      side: THREE.DoubleSide,
    });
    const net = new THREE.Mesh(netGeo, netMat);
    net.position.set(0, this.netHeight / 2, 0);
    this.engine.add(net);
    
    // Net cord
    const cordGeo = new THREE.CylinderGeometry(0.02, 0.02, this.courtWidth + 1, 8);
    const cordMat = new THREE.MeshStandardMaterial({ color: 0xffffff });
    const cord = new THREE.Mesh(cordGeo, cordMat);
    cord.rotation.z = Math.PI / 2;
    cord.position.set(0, this.netHeight, 0);
    this.engine.add(cord);
  }

  private createPlayers(): void {
    this.player = this.createPlayer(new THREE.Vector3(0, 0, this.courtLength / 2 - 1), 'near');
    this.opponent = this.createPlayer(new THREE.Vector3(0, 0, -this.courtLength / 2 + 1), 'far');
    this.opponent.mesh.rotation.y = Math.PI;
  }

  private createPlayer(position: THREE.Vector3, side: 'near' | 'far'): Player {
    const group = new THREE.Group();
    
    // Body
    const bodyGeo = new THREE.CapsuleGeometry(0.25, 0.7, 4, 8);
    const bodyMat = new THREE.MeshStandardMaterial({ color: side === 'near' ? 0x0066cc : 0xcc0000 });
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
    
    // Racket
    const racketGroup = new THREE.Group();
    
    const handleGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.3, 8);
    const handleMat = new THREE.MeshStandardMaterial({ color: 0x333333 });
    const handle = new THREE.Mesh(handleGeo, handleMat);
    racketGroup.add(handle);
    
    const headGeoR = new THREE.RingGeometry(0.1, 0.15, 16);
    const headMatR = new THREE.MeshStandardMaterial({ color: 0xcc0000, side: THREE.DoubleSide });
    const racketHead = new THREE.Mesh(headGeoR, headMatR);
    racketHead.position.y = 0.25;
    racketHead.rotation.x = Math.PI / 2;
    racketGroup.add(racketHead);
    
    // Strings
    const stringsGeo = new THREE.CircleGeometry(0.1, 16);
    const stringsMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.5 });
    const strings = new THREE.Mesh(stringsGeo, stringsMat);
    strings.position.y = 0.25;
    strings.rotation.x = Math.PI / 2;
    racketGroup.add(strings);
    
    racketGroup.position.set(0.4, 1, 0);
    racketGroup.rotation.z = -Math.PI / 4;
    racketGroup.name = 'racket';
    group.add(racketGroup);
    
    group.position.copy(position);
    this.engine.add(group);
    
    return {
      mesh: group,
      position: position.clone(),
      side,
      isServing: false,
      isSwinging: false,
      swingProgress: 0,
      swingType: 'forehand',
    };
  }

  private createBall(): void {
    const ballGeo = new THREE.SphereGeometry(0.033, 16, 16);
    const ballMat = new THREE.MeshStandardMaterial({ color: 0xccff00 });
    const mesh = new THREE.Mesh(ballGeo, ballMat);
    mesh.castShadow = true;
    this.engine.add(mesh);
    
    this.ball = {
      mesh,
      position: new THREE.Vector3(),
      velocity: new THREE.Vector3(),
      spin: new THREE.Vector3(),
      isInPlay: false,
      lastHitBy: null,
      bounceCount: 0,
    };
  }

  private setupServe(): void {
    this.isServing = true;
    this.ball.isInPlay = false;
    this.ball.bounceCount = 0;
    
    const server = this.serverSide === 'player' ? this.player : this.opponent;
    server.isServing = true;
    
    // Position ball for serve
    const serveX = this.serveSide === 'deuce' ? 2 : -2;
    const serveZ = this.serverSide === 'player' ? this.courtLength / 2 - 1 : -this.courtLength / 2 + 1;
    
    this.ball.position.set(serveX, 2, serveZ);
    this.ball.mesh.position.copy(this.ball.position);
    this.ball.velocity.set(0, 0, 0);
  }

  protected update(deltaTime: number, input: InputState): void {
    this.updatePlayer(deltaTime, input);
    this.updateOpponent(deltaTime);
    this.updateBall(deltaTime);
    
    this.cameraController.setTarget(this.player.position);
    this.cameraController.update(deltaTime, input);
  }

  protected fixedUpdate(fixedDeltaTime: number): void {}

  private updatePlayer(deltaTime: number, input: InputState): void {
    const player = this.player;
    
    // Movement
    const moveSpeed = 8;
    player.position.x += input.virtual.moveX * moveSpeed * deltaTime;
    player.position.z -= input.virtual.moveY * moveSpeed * deltaTime;
    
    // Clamp to court
    player.position.x = THREE.MathUtils.clamp(player.position.x, -this.courtWidth / 2, this.courtWidth / 2);
    player.position.z = THREE.MathUtils.clamp(player.position.z, 1, this.courtLength / 2);
    
    player.mesh.position.copy(player.position);
    
    // Swing
    if (input.virtual.firePressed && !player.isSwinging) {
      if (this.isServing && this.serverSide === 'player') {
        this.serve(player);
      } else if (this.ball.isInPlay) {
        this.swing(player);
      }
    }
    
    // Update swing animation
    if (player.isSwinging) {
      player.swingProgress += deltaTime * 5;
      if (player.swingProgress >= 1) {
        player.isSwinging = false;
        player.swingProgress = 0;
      }
      
      const racket = player.mesh.getObjectByName('racket') as THREE.Group;
      if (racket) {
        racket.rotation.z = -Math.PI / 4 + Math.sin(player.swingProgress * Math.PI) * Math.PI / 2;
      }
    }
  }

  private updateOpponent(deltaTime: number): void {
    const opponent = this.opponent;
    
    if (this.isServing && this.serverSide === 'opponent') {
      // AI serve
      if (Math.random() < 0.02) {
        this.serve(opponent);
      }
      return;
    }
    
    if (!this.ball.isInPlay) return;
    
    // Move towards ball
    const targetX = this.ball.position.x;
    const diff = targetX - opponent.position.x;
    opponent.position.x += Math.sign(diff) * Math.min(Math.abs(diff), 6 * deltaTime);
    
    opponent.position.x = THREE.MathUtils.clamp(opponent.position.x, -this.courtWidth / 2, this.courtWidth / 2);
    opponent.mesh.position.copy(opponent.position);
    
    // Swing when ball is close
    if (this.ball.position.z < -this.courtLength / 4 && 
        Math.abs(this.ball.position.x - opponent.position.x) < 1.5 &&
        this.ball.lastHitBy === 'player' &&
        !opponent.isSwinging) {
      this.swing(opponent);
    }
  }

  private serve(player: Player): void {
    this.isServing = false;
    player.isServing = false;
    this.ball.isInPlay = true;
    this.ball.lastHitBy = player === this.player ? 'player' : 'opponent';
    this.ball.bounceCount = 0;
    
    // Serve velocity
    const direction = player.side === 'near' ? -1 : 1;
    const targetX = this.serveSide === 'deuce' ? -1 : 1;
    
    this.ball.velocity.set(
      (targetX - this.ball.position.x) * 0.5,
      8,
      direction * 25
    );
    
    this.ball.spin.set(0, 0, 0);
    
    player.isSwinging = true;
    player.swingProgress = 0;
    player.swingType = 'serve';
  }

  private swing(player: Player): void {
    const distToBall = player.position.distanceTo(this.ball.position);
    if (distToBall > 2) return;
    
    player.isSwinging = true;
    player.swingProgress = 0;
    
    // Determine swing type
    const ballSide = this.ball.position.x - player.position.x;
    player.swingType = ballSide > 0 ? 'forehand' : 'backhand';
    
    // Hit ball
    const direction = player.side === 'near' ? -1 : 1;
    const power = 15 + Math.random() * 10;
    const angle = (Math.random() - 0.5) * 0.5;
    
    this.ball.velocity.set(
      angle * power,
      5 + Math.random() * 3,
      direction * power
    );
    
    // Add topspin
    this.ball.spin.set(0, 0, direction * 5);
    
    this.ball.lastHitBy = player === this.player ? 'player' : 'opponent';
    this.ball.bounceCount = 0;
  }

  private updateBall(deltaTime: number): void {
    if (!this.ball.isInPlay) return;
    
    // Apply gravity
    this.ball.velocity.y -= 9.81 * deltaTime;
    
    // Apply spin effect (Magnus force)
    const magnus = this.ball.spin.clone().cross(this.ball.velocity).multiplyScalar(0.001);
    this.ball.velocity.add(magnus);
    
    // Air resistance
    this.ball.velocity.multiplyScalar(0.999);
    
    // Update position
    this.ball.position.addScaledVector(this.ball.velocity, deltaTime);
    this.ball.mesh.position.copy(this.ball.position);
    
    // Ground bounce
    if (this.ball.position.y < 0.033) {
      this.ball.position.y = 0.033;
      this.ball.velocity.y = -this.ball.velocity.y * 0.75;
      this.ball.bounceCount++;
      
      // Check if in bounds
      const inBounds = Math.abs(this.ball.position.x) < this.courtWidth / 2 &&
                       Math.abs(this.ball.position.z) < this.courtLength / 2;
      
      if (!inBounds || this.ball.bounceCount > 1) {
        this.pointOver(this.ball.lastHitBy === 'player' ? 'opponent' : 'player');
      }
    }
    
    // Net collision
    if (Math.abs(this.ball.position.z) < 0.1 && this.ball.position.y < this.netHeight) {
      this.pointOver(this.ball.lastHitBy === 'player' ? 'opponent' : 'player');
    }
    
    // Out of bounds
    if (Math.abs(this.ball.position.z) > this.courtLength / 2 + 5) {
      this.pointOver(this.ball.lastHitBy === 'player' ? 'opponent' : 'player');
    }
  }

  private pointOver(winner: 'player' | 'opponent'): void {
    this.ball.isInPlay = false;
    
    // Update score
    this.updateScore(winner);
    
    // Setup next point
    setTimeout(() => this.setupServe(), 2000);
  }

  private updateScore(winner: 'player' | 'opponent'): void {
    const current = winner === 'player' ? this.score.player : this.score.opponent;
    const opponent = winner === 'player' ? this.score.opponent : this.score.player;
    
    let newScore: ScorePoint;
    
    if (current === 0) newScore = 15;
    else if (current === 15) newScore = 30;
    else if (current === 30) newScore = 40;
    else if (current === 40) {
      if (opponent === 40) {
        newScore = 'AD';
      } else if (opponent === 'AD') {
        // Deuce
        if (winner === 'player') {
          this.score.opponent = 40;
        } else {
          this.score.player = 40;
        }
        return;
      } else {
        // Game won
        this.gameWon(winner);
        return;
      }
    } else if (current === 'AD') {
      // Game won
      this.gameWon(winner);
      return;
    } else {
      newScore = current;
    }
    
    if (winner === 'player') {
      this.score.player = newScore;
    } else {
      this.score.opponent = newScore;
    }
    
    this.addScore(winner === 'player' ? 15 : 0);
  }

  private gameWon(winner: 'player' | 'opponent'): void {
    if (winner === 'player') {
      this.score.playerGames++;
      this.addScore(100);
    } else {
      this.score.opponentGames++;
    }
    
    // Reset points
    this.score.player = 0;
    this.score.opponent = 0;
    
    // Switch server
    this.serverSide = this.serverSide === 'player' ? 'opponent' : 'player';
    this.serveSide = 'deuce';
    
    // Check for set win
    if (this.score.playerGames >= 6 && this.score.playerGames - this.score.opponentGames >= 2) {
      this.setWon('player');
    } else if (this.score.opponentGames >= 6 && this.score.opponentGames - this.score.playerGames >= 2) {
      this.setWon('opponent');
    }
  }

  private setWon(winner: 'player' | 'opponent'): void {
    if (winner === 'player') {
      this.score.playerSets++;
      this.addScore(500);
    } else {
      this.score.opponentSets++;
    }
    
    this.score.playerGames = 0;
    this.score.opponentGames = 0;
    
    // Check for match win
    if (this.score.playerSets >= 2) {
      this.end(true);
    } else if (this.score.opponentSets >= 2) {
      this.end(false);
    }
  }

  public getGameScore(): GameScore { return { ...this.score }; }
  public isCurrentlyServing(): boolean { return this.isServing; }
  public getServerSide(): 'player' | 'opponent' { return this.serverSide; }

  protected cleanup(): void {
    this.engine.remove(this.player.mesh);
    this.engine.remove(this.opponent.mesh);
    this.engine.remove(this.ball.mesh);
  }
}

export default TennisGame;
