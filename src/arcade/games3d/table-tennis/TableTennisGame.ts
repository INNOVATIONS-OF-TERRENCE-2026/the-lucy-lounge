/**
 * ┌─────────────────────────────────────────────────────────────────────────────┐
 * │ LUCY ARCADE — 3D TABLE TENNIS                                              │
 * │                                                                             │
 * │ Fast-paced ping pong with spin mechanics, AI opponents,                    │
 * │ and realistic ball physics                                                 │
 * └─────────────────────────────────────────────────────────────────────────────┘
 */

import * as THREE from 'three';
import {
  Game3DBase,
  type Game3DConfig,
  type InputState,
} from '../../engine3d';

interface Paddle {
  mesh: THREE.Group;
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  isPlayer: boolean;
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

export class TableTennisGame extends Game3DBase {
  private playerPaddle!: Paddle;
  private opponentPaddle!: Paddle;
  private ball!: Ball;
  
  // Table dimensions (meters)
  private tableLength: number = 2.74;
  private tableWidth: number = 1.525;
  private tableHeight: number = 0.76;
  private netHeight: number = 0.1525;
  
  // Scoring
  private playerScore: number = 0;
  private opponentScore: number = 0;
  private pointsToWin: number = 11;
  private isServing: boolean = true;
  private serverSide: 'player' | 'opponent' = 'player';
  private serveCount: number = 0;

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
    this.createTable();
    this.createNet();
    this.createPaddles();
    this.createBall();
    
    this.engine.camera.position.set(0, 1.5, 2);
    this.engine.camera.lookAt(0, this.tableHeight, 0);
    
    this.setupServe();
  }

  private setupLighting(): void {
    this.engine.addAmbientLight(0xffffff, 0.4);
    this.engine.addDirectionalLight(0xffffff, 0.8, new THREE.Vector3(5, 10, 5), true);
    this.engine.addPointLight(0xffffff, 0.5, new THREE.Vector3(0, 2, 0), 10, 2);
  }

  private createTable(): void {
    // Table top
    const tableGeo = new THREE.BoxGeometry(this.tableWidth, 0.03, this.tableLength);
    const tableMat = new THREE.MeshStandardMaterial({ color: 0x006633, roughness: 0.3 });
    const table = new THREE.Mesh(tableGeo, tableMat);
    table.position.y = this.tableHeight;
    table.receiveShadow = true;
    this.engine.add(table);
    
    // Table lines
    const lineMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    
    // Center line
    const centerLineGeo = new THREE.PlaneGeometry(0.003, this.tableLength);
    const centerLine = new THREE.Mesh(centerLineGeo, lineMat);
    centerLine.rotation.x = -Math.PI / 2;
    centerLine.position.y = this.tableHeight + 0.016;
    this.engine.add(centerLine);
    
    // End lines
    [-1, 1].forEach(side => {
      const endLineGeo = new THREE.PlaneGeometry(this.tableWidth, 0.02);
      const endLine = new THREE.Mesh(endLineGeo, lineMat);
      endLine.rotation.x = -Math.PI / 2;
      endLine.position.set(0, this.tableHeight + 0.016, side * this.tableLength / 2);
      this.engine.add(endLine);
    });
    
    // Side lines
    [-1, 1].forEach(side => {
      const sideLineGeo = new THREE.PlaneGeometry(0.02, this.tableLength);
      const sideLine = new THREE.Mesh(sideLineGeo, lineMat);
      sideLine.rotation.x = -Math.PI / 2;
      sideLine.position.set(side * this.tableWidth / 2, this.tableHeight + 0.016, 0);
      this.engine.add(sideLine);
    });
    
    // Legs
    const legGeo = new THREE.CylinderGeometry(0.03, 0.03, this.tableHeight - 0.03, 8);
    const legMat = new THREE.MeshStandardMaterial({ color: 0x333333 });
    
    [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([x, z]) => {
      const leg = new THREE.Mesh(legGeo, legMat);
      leg.position.set(
        x * (this.tableWidth / 2 - 0.1),
        (this.tableHeight - 0.03) / 2,
        z * (this.tableLength / 2 - 0.1)
      );
      this.engine.add(leg);
    });
  }

  private createNet(): void {
    // Net posts
    const postGeo = new THREE.CylinderGeometry(0.01, 0.01, this.netHeight + 0.05, 8);
    const postMat = new THREE.MeshStandardMaterial({ color: 0x333333 });
    
    [-1, 1].forEach(side => {
      const post = new THREE.Mesh(postGeo, postMat);
      post.position.set(
        side * (this.tableWidth / 2 + 0.02),
        this.tableHeight + this.netHeight / 2,
        0
      );
      this.engine.add(post);
    });
    
    // Net
    const netGeo = new THREE.PlaneGeometry(this.tableWidth + 0.04, this.netHeight);
    const netMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.8,
      side: THREE.DoubleSide,
    });
    const net = new THREE.Mesh(netGeo, netMat);
    net.position.set(0, this.tableHeight + this.netHeight / 2, 0);
    this.engine.add(net);
  }

  private createPaddles(): void {
    this.playerPaddle = this.createPaddle(true);
    this.opponentPaddle = this.createPaddle(false);
    
    this.playerPaddle.mesh.position.set(0, this.tableHeight + 0.1, this.tableLength / 2 + 0.3);
    this.opponentPaddle.mesh.position.set(0, this.tableHeight + 0.1, -this.tableLength / 2 - 0.3);
    this.opponentPaddle.mesh.rotation.y = Math.PI;
  }

  private createPaddle(isPlayer: boolean): Paddle {
    const paddleGroup = new THREE.Group();
    
    // Handle
    const handleGeo = new THREE.CylinderGeometry(0.012, 0.015, 0.1, 8);
    const handleMat = new THREE.MeshStandardMaterial({ color: 0x8B4513 });
    const handle = new THREE.Mesh(handleGeo, handleMat);
    handle.rotation.x = Math.PI / 2;
    handle.position.z = -0.08;
    paddleGroup.add(handle);
    
    // Blade
    const bladeGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.006, 32);
    const bladeMat = new THREE.MeshStandardMaterial({ color: 0x8B4513 });
    const blade = new THREE.Mesh(bladeGeo, bladeMat);
    blade.rotation.x = Math.PI / 2;
    paddleGroup.add(blade);
    
    // Rubber (red side)
    const rubberGeo = new THREE.CircleGeometry(0.079, 32);
    const rubberMat = new THREE.MeshStandardMaterial({ color: isPlayer ? 0xcc0000 : 0x000000 });
    const rubber = new THREE.Mesh(rubberGeo, rubberMat);
    rubber.position.z = 0.004;
    paddleGroup.add(rubber);
    
    // Rubber (black side)
    const rubberBack = new THREE.Mesh(rubberGeo, new THREE.MeshStandardMaterial({ color: isPlayer ? 0x000000 : 0xcc0000 }));
    rubberBack.position.z = -0.004;
    rubberBack.rotation.y = Math.PI;
    paddleGroup.add(rubberBack);
    
    paddleGroup.castShadow = true;
    this.engine.add(paddleGroup);
    
    return {
      mesh: paddleGroup,
      position: paddleGroup.position,
      velocity: new THREE.Vector3(),
      isPlayer,
    };
  }

  private createBall(): void {
    const ballGeo = new THREE.SphereGeometry(0.02, 16, 16);
    const ballMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3 });
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
    this.ball.lastHitBy = null;
    
    const serveZ = this.serverSide === 'player' ? this.tableLength / 2 + 0.2 : -this.tableLength / 2 - 0.2;
    this.ball.position.set(0, this.tableHeight + 0.3, serveZ);
    this.ball.mesh.position.copy(this.ball.position);
    this.ball.velocity.set(0, 0, 0);
    this.ball.spin.set(0, 0, 0);
  }

  protected update(deltaTime: number, input: InputState): void {
    this.updatePlayerPaddle(deltaTime, input);
    this.updateOpponentPaddle(deltaTime);
    this.updateBall(deltaTime);
    
    // Update camera to follow ball slightly
    const cameraTarget = new THREE.Vector3(
      this.ball.position.x * 0.3,
      1.5,
      2
    );
    this.engine.camera.position.lerp(cameraTarget, 0.05);
    this.engine.camera.lookAt(0, this.tableHeight, 0);
  }

  protected fixedUpdate(fixedDeltaTime: number): void {}

  private updatePlayerPaddle(deltaTime: number, input: InputState): void {
    const paddle = this.playerPaddle;
    const moveSpeed = 3;
    
    // Movement
    paddle.position.x += input.virtual.moveX * moveSpeed * deltaTime;
    paddle.position.x = THREE.MathUtils.clamp(paddle.position.x, -this.tableWidth / 2, this.tableWidth / 2);
    
    // Height adjustment
    paddle.position.y += input.virtual.moveY * moveSpeed * deltaTime;
    paddle.position.y = THREE.MathUtils.clamp(paddle.position.y, this.tableHeight, this.tableHeight + 0.5);
    
    paddle.mesh.position.copy(paddle.position);
    
    // Serve
    if (this.isServing && this.serverSide === 'player' && input.virtual.firePressed) {
      this.serve('player');
    }
  }

  private updateOpponentPaddle(deltaTime: number): void {
    const paddle = this.opponentPaddle;
    
    if (this.isServing && this.serverSide === 'opponent') {
      if (Math.random() < 0.02) {
        this.serve('opponent');
      }
      return;
    }
    
    if (!this.ball.isInPlay) return;
    
    // AI: Track ball
    const targetX = this.ball.position.x;
    const diff = targetX - paddle.position.x;
    paddle.position.x += Math.sign(diff) * Math.min(Math.abs(diff), 4 * deltaTime);
    
    // Predict ball height
    if (this.ball.velocity.z < 0) {
      const timeToReach = Math.abs((paddle.position.z - this.ball.position.z) / this.ball.velocity.z);
      const predictedY = this.ball.position.y + this.ball.velocity.y * timeToReach - 0.5 * 9.81 * timeToReach * timeToReach;
      paddle.position.y = THREE.MathUtils.lerp(paddle.position.y, Math.max(this.tableHeight, predictedY), 0.1);
    }
    
    paddle.mesh.position.copy(paddle.position);
  }

  private serve(server: 'player' | 'opponent'): void {
    this.isServing = false;
    this.ball.isInPlay = true;
    this.ball.lastHitBy = server;
    this.ball.bounceCount = 0;
    
    const direction = server === 'player' ? -1 : 1;
    
    this.ball.velocity.set(
      (Math.random() - 0.5) * 2,
      3,
      direction * 5
    );
    
    this.ball.spin.set(0, 0, 0);
    this.serveCount++;
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
    
    // Table bounce
    if (this.ball.position.y <= this.tableHeight + 0.02 &&
        Math.abs(this.ball.position.x) <= this.tableWidth / 2 &&
        Math.abs(this.ball.position.z) <= this.tableLength / 2) {
      this.ball.position.y = this.tableHeight + 0.02;
      this.ball.velocity.y = -this.ball.velocity.y * 0.9;
      this.ball.bounceCount++;
      
      // Check for point
      if (this.ball.bounceCount > 1) {
        this.pointScored(this.ball.lastHitBy === 'player' ? 'opponent' : 'player');
        return;
      }
    }
    
    // Net collision
    if (Math.abs(this.ball.position.z) < 0.02 &&
        this.ball.position.y < this.tableHeight + this.netHeight &&
        this.ball.position.y > this.tableHeight) {
      this.ball.velocity.z = -this.ball.velocity.z * 0.3;
      this.ball.velocity.y *= 0.5;
    }
    
    // Paddle collision
    this.checkPaddleCollision(this.playerPaddle);
    this.checkPaddleCollision(this.opponentPaddle);
    
    // Out of bounds
    if (this.ball.position.y < 0 ||
        Math.abs(this.ball.position.z) > this.tableLength + 1 ||
        Math.abs(this.ball.position.x) > this.tableWidth + 1) {
      const winner = this.ball.position.z > 0 ? 'opponent' : 'player';
      this.pointScored(winner);
    }
  }

  private checkPaddleCollision(paddle: Paddle): void {
    const paddleRadius = 0.08;
    const dist = this.ball.position.distanceTo(paddle.position);
    
    if (dist < paddleRadius + 0.02) {
      const normal = this.ball.position.clone().sub(paddle.position).normalize();
      
      // Reflect velocity
      const speed = this.ball.velocity.length();
      this.ball.velocity.reflect(normal);
      this.ball.velocity.normalize().multiplyScalar(speed * 1.1);
      
      // Add spin based on paddle movement
      this.ball.spin.set(
        paddle.velocity.y * 10,
        0,
        paddle.velocity.x * 10
      );
      
      this.ball.lastHitBy = paddle.isPlayer ? 'player' : 'opponent';
      this.ball.bounceCount = 0;
      
      // Push ball out of paddle
      this.ball.position.copy(paddle.position).addScaledVector(normal, paddleRadius + 0.03);
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
    
    // Switch server every 2 points
    if ((this.playerScore + this.opponentScore) % 2 === 0) {
      this.serverSide = this.serverSide === 'player' ? 'opponent' : 'player';
    }
    
    this.setupServe();
  }

  public getPlayerScore(): number { return this.playerScore; }
  public getOpponentScore(): number { return this.opponentScore; }
  public isCurrentlyServing(): boolean { return this.isServing; }
  public getServerSide(): 'player' | 'opponent' { return this.serverSide; }
  public getPointsToWin(): number { return this.pointsToWin; }

  protected cleanup(): void {
    this.engine.remove(this.playerPaddle.mesh);
    this.engine.remove(this.opponentPaddle.mesh);
    this.engine.remove(this.ball.mesh);
  }
}

export default TableTennisGame;
