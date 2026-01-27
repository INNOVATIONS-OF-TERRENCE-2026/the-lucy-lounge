/**
 * ┌─────────────────────────────────────────────────────────────────────────────┐
 * │ LUCY ARCADE — 3D AIR HOCKEY                                                │
 * │                                                                             │
 * │ Fast-paced air hockey with physics-based puck movement,                    │
 * │ AI opponents, and competitive scoring                                      │
 * └─────────────────────────────────────────────────────────────────────────────┘
 */

import * as THREE from 'three';
import {
  Game3DBase,
  type Game3DConfig,
  type InputState,
} from '../../engine3d';

interface Paddle {
  mesh: THREE.Mesh;
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  isPlayer: boolean;
}

interface Puck {
  mesh: THREE.Mesh;
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  isInPlay: boolean;
}

export class HockeyGame extends Game3DBase {
  private playerPaddle!: Paddle;
  private opponentPaddle!: Paddle;
  private puck!: Puck;
  
  // Table dimensions
  private tableLength: number = 2;
  private tableWidth: number = 1;
  private goalWidth: number = 0.3;
  private paddleRadius: number = 0.06;
  private puckRadius: number = 0.04;
  
  // Scoring
  private playerScore: number = 0;
  private opponentScore: number = 0;
  private pointsToWin: number = 7;

  constructor(container: HTMLElement, config?: Game3DConfig) {
    super(container, {
      ...config,
      engineConfig: {
        shadows: true,
        bloom: true,
        bloomStrength: 0.5,
        ...config?.engineConfig,
      },
    });
  }

  protected async loadAssets(): Promise<void> {}

  protected initScene(): void {
    this.setupLighting();
    this.createTable();
    this.createPaddles();
    this.createPuck();
    
    this.engine.camera.position.set(0, 1.5, 0);
    this.engine.camera.lookAt(0, 0, 0);
    
    this.resetPuck('center');
  }

  private setupLighting(): void {
    this.engine.addAmbientLight(0xffffff, 0.4);
    this.engine.addPointLight(0xffffff, 1, new THREE.Vector3(0, 1, 0), 5, 2);
    this.engine.addSpotLight(0x00aaff, 0.5, new THREE.Vector3(0, 1.5, 0), new THREE.Vector3(0, 0, 0), Math.PI / 3, 0.5, false);
  }

  private createTable(): void {
    // Table surface
    const tableGeo = new THREE.BoxGeometry(this.tableWidth, 0.05, this.tableLength);
    const tableMat = new THREE.MeshStandardMaterial({
      color: 0x1a1a3a,
      roughness: 0.2,
      metalness: 0.3,
    });
    const table = new THREE.Mesh(tableGeo, tableMat);
    table.position.y = -0.025;
    table.receiveShadow = true;
    this.engine.add(table);
    
    // Table edges
    const edgeMat = new THREE.MeshStandardMaterial({ color: 0x333333, metalness: 0.8 });
    
    // Side edges
    [-1, 1].forEach(side => {
      const edgeGeo = new THREE.BoxGeometry(0.03, 0.05, this.tableLength);
      const edge = new THREE.Mesh(edgeGeo, edgeMat);
      edge.position.set(side * (this.tableWidth / 2 + 0.015), 0, 0);
      this.engine.add(edge);
    });
    
    // End edges (with goal gaps)
    [-1, 1].forEach(end => {
      // Left of goal
      const leftGeo = new THREE.BoxGeometry((this.tableWidth - this.goalWidth) / 2, 0.05, 0.03);
      const left = new THREE.Mesh(leftGeo, edgeMat);
      left.position.set(
        -(this.tableWidth / 2 - (this.tableWidth - this.goalWidth) / 4),
        0,
        end * (this.tableLength / 2 + 0.015)
      );
      this.engine.add(left);
      
      // Right of goal
      const right = new THREE.Mesh(leftGeo, edgeMat);
      right.position.set(
        (this.tableWidth / 2 - (this.tableWidth - this.goalWidth) / 4),
        0,
        end * (this.tableLength / 2 + 0.015)
      );
      this.engine.add(right);
    });
    
    // Center line
    const centerLineGeo = new THREE.PlaneGeometry(this.tableWidth - 0.1, 0.005);
    const centerLineMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const centerLine = new THREE.Mesh(centerLineGeo, centerLineMat);
    centerLine.rotation.x = -Math.PI / 2;
    centerLine.position.y = 0.001;
    this.engine.add(centerLine);
    
    // Center circle
    const circleGeo = new THREE.RingGeometry(0.1, 0.105, 32);
    const circle = new THREE.Mesh(circleGeo, centerLineMat);
    circle.rotation.x = -Math.PI / 2;
    circle.position.y = 0.001;
    this.engine.add(circle);
    
    // Goal areas
    [-1, 1].forEach(end => {
      const goalGeo = new THREE.PlaneGeometry(this.goalWidth, 0.1);
      const goalMat = new THREE.MeshBasicMaterial({ color: end > 0 ? 0x00ff00 : 0xff0000, transparent: true, opacity: 0.3 });
      const goal = new THREE.Mesh(goalGeo, goalMat);
      goal.rotation.x = -Math.PI / 2;
      goal.position.set(0, 0.001, end * (this.tableLength / 2 - 0.05));
      this.engine.add(goal);
    });
    
    // Neon glow strips
    const glowMat = new THREE.MeshBasicMaterial({ color: 0x00aaff });
    
    [-1, 1].forEach(side => {
      const glowGeo = new THREE.BoxGeometry(0.01, 0.01, this.tableLength);
      const glow = new THREE.Mesh(glowGeo, glowMat);
      glow.position.set(side * (this.tableWidth / 2 - 0.02), 0.02, 0);
      this.engine.add(glow);
    });
  }

  private createPaddles(): void {
    this.playerPaddle = this.createPaddle(true);
    this.opponentPaddle = this.createPaddle(false);
    
    this.playerPaddle.mesh.position.set(0, 0.02, this.tableLength / 2 - 0.15);
    this.opponentPaddle.mesh.position.set(0, 0.02, -this.tableLength / 2 + 0.15);
  }

  private createPaddle(isPlayer: boolean): Paddle {
    const paddleGeo = new THREE.CylinderGeometry(this.paddleRadius, this.paddleRadius, 0.03, 32);
    const paddleMat = new THREE.MeshStandardMaterial({
      color: isPlayer ? 0x00ff00 : 0xff0000,
      roughness: 0.3,
      metalness: 0.5,
      emissive: isPlayer ? 0x004400 : 0x440000,
    });
    const mesh = new THREE.Mesh(paddleGeo, paddleMat);
    mesh.castShadow = true;
    this.engine.add(mesh);
    
    // Handle
    const handleGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.04, 16);
    const handleMat = new THREE.MeshStandardMaterial({ color: 0x333333 });
    const handle = new THREE.Mesh(handleGeo, handleMat);
    handle.position.y = 0.035;
    mesh.add(handle);
    
    return {
      mesh,
      position: mesh.position,
      velocity: new THREE.Vector3(),
      isPlayer,
    };
  }

  private createPuck(): void {
    const puckGeo = new THREE.CylinderGeometry(this.puckRadius, this.puckRadius, 0.015, 32);
    const puckMat = new THREE.MeshStandardMaterial({
      color: 0xffff00,
      roughness: 0.2,
      metalness: 0.8,
      emissive: 0x444400,
    });
    const mesh = new THREE.Mesh(puckGeo, puckMat);
    mesh.castShadow = true;
    this.engine.add(mesh);
    
    this.puck = {
      mesh,
      position: mesh.position,
      velocity: new THREE.Vector3(),
      isInPlay: true,
    };
  }

  private resetPuck(position: 'center' | 'player' | 'opponent'): void {
    this.puck.velocity.set(0, 0, 0);
    this.puck.isInPlay = true;
    
    switch (position) {
      case 'center':
        this.puck.position.set(0, 0.01, 0);
        break;
      case 'player':
        this.puck.position.set(0, 0.01, this.tableLength / 4);
        break;
      case 'opponent':
        this.puck.position.set(0, 0.01, -this.tableLength / 4);
        break;
    }
    
    this.puck.mesh.position.copy(this.puck.position);
  }

  protected update(deltaTime: number, input: InputState): void {
    this.updatePlayerPaddle(deltaTime, input);
    this.updateOpponentPaddle(deltaTime);
    this.updatePuck(deltaTime);
  }

  protected fixedUpdate(fixedDeltaTime: number): void {}

  private updatePlayerPaddle(deltaTime: number, input: InputState): void {
    const paddle = this.playerPaddle;
    const moveSpeed = 2;
    
    const prevPos = paddle.position.clone();
    
    // Movement
    paddle.position.x += input.virtual.moveX * moveSpeed * deltaTime;
    paddle.position.z -= input.virtual.moveY * moveSpeed * deltaTime;
    
    // Clamp to player's half
    paddle.position.x = THREE.MathUtils.clamp(
      paddle.position.x,
      -this.tableWidth / 2 + this.paddleRadius,
      this.tableWidth / 2 - this.paddleRadius
    );
    paddle.position.z = THREE.MathUtils.clamp(
      paddle.position.z,
      this.paddleRadius,
      this.tableLength / 2 - this.paddleRadius
    );
    
    // Calculate velocity for collision response
    paddle.velocity.copy(paddle.position).sub(prevPos).divideScalar(deltaTime);
    
    paddle.mesh.position.copy(paddle.position);
  }

  private updateOpponentPaddle(deltaTime: number): void {
    const paddle = this.opponentPaddle;
    const prevPos = paddle.position.clone();
    
    // AI: Track puck when it's on opponent's side
    if (this.puck.position.z < 0) {
      const targetX = this.puck.position.x;
      const targetZ = Math.max(-this.tableLength / 2 + 0.15, this.puck.position.z + 0.1);
      
      const diffX = targetX - paddle.position.x;
      const diffZ = targetZ - paddle.position.z;
      
      paddle.position.x += Math.sign(diffX) * Math.min(Math.abs(diffX), 1.5 * deltaTime);
      paddle.position.z += Math.sign(diffZ) * Math.min(Math.abs(diffZ), 1.5 * deltaTime);
    } else {
      // Return to defensive position
      const targetX = 0;
      const targetZ = -this.tableLength / 2 + 0.2;
      
      const diffX = targetX - paddle.position.x;
      const diffZ = targetZ - paddle.position.z;
      
      paddle.position.x += Math.sign(diffX) * Math.min(Math.abs(diffX), 1 * deltaTime);
      paddle.position.z += Math.sign(diffZ) * Math.min(Math.abs(diffZ), 1 * deltaTime);
    }
    
    // Clamp to opponent's half
    paddle.position.x = THREE.MathUtils.clamp(
      paddle.position.x,
      -this.tableWidth / 2 + this.paddleRadius,
      this.tableWidth / 2 - this.paddleRadius
    );
    paddle.position.z = THREE.MathUtils.clamp(
      paddle.position.z,
      -this.tableLength / 2 + this.paddleRadius,
      -this.paddleRadius
    );
    
    paddle.velocity.copy(paddle.position).sub(prevPos).divideScalar(deltaTime);
    paddle.mesh.position.copy(paddle.position);
  }

  private updatePuck(deltaTime: number): void {
    if (!this.puck.isInPlay) return;
    
    // Air hockey table friction (very low)
    this.puck.velocity.multiplyScalar(0.998);
    
    // Update position
    this.puck.position.addScaledVector(this.puck.velocity, deltaTime);
    
    // Wall collisions
    if (Math.abs(this.puck.position.x) > this.tableWidth / 2 - this.puckRadius) {
      this.puck.position.x = Math.sign(this.puck.position.x) * (this.tableWidth / 2 - this.puckRadius);
      this.puck.velocity.x = -this.puck.velocity.x * 0.9;
    }
    
    // End wall collisions (with goal check)
    if (Math.abs(this.puck.position.z) > this.tableLength / 2 - this.puckRadius) {
      // Check if in goal
      if (Math.abs(this.puck.position.x) < this.goalWidth / 2) {
        // Goal scored!
        const scorer = this.puck.position.z > 0 ? 'opponent' : 'player';
        this.goalScored(scorer);
        return;
      } else {
        this.puck.position.z = Math.sign(this.puck.position.z) * (this.tableLength / 2 - this.puckRadius);
        this.puck.velocity.z = -this.puck.velocity.z * 0.9;
      }
    }
    
    // Paddle collisions
    this.checkPaddleCollision(this.playerPaddle);
    this.checkPaddleCollision(this.opponentPaddle);
    
    // Speed limit
    const maxSpeed = 5;
    if (this.puck.velocity.length() > maxSpeed) {
      this.puck.velocity.normalize().multiplyScalar(maxSpeed);
    }
    
    this.puck.mesh.position.copy(this.puck.position);
  }

  private checkPaddleCollision(paddle: Paddle): void {
    const dx = this.puck.position.x - paddle.position.x;
    const dz = this.puck.position.z - paddle.position.z;
    const dist = Math.sqrt(dx * dx + dz * dz);
    
    const minDist = this.paddleRadius + this.puckRadius;
    
    if (dist < minDist) {
      // Collision normal
      const nx = dx / dist;
      const nz = dz / dist;
      
      // Separate puck from paddle
      this.puck.position.x = paddle.position.x + nx * minDist;
      this.puck.position.z = paddle.position.z + nz * minDist;
      
      // Reflect velocity and add paddle velocity
      const relVelX = this.puck.velocity.x - paddle.velocity.x;
      const relVelZ = this.puck.velocity.z - paddle.velocity.z;
      
      const dot = relVelX * nx + relVelZ * nz;
      
      this.puck.velocity.x = relVelX - 2 * dot * nx + paddle.velocity.x * 1.5;
      this.puck.velocity.z = relVelZ - 2 * dot * nz + paddle.velocity.z * 1.5;
      
      // Boost
      this.puck.velocity.multiplyScalar(1.1);
    }
  }

  private goalScored(scorer: 'player' | 'opponent'): void {
    if (scorer === 'player') {
      this.playerScore++;
      this.addScore(1);
      this.resetPuck('opponent');
    } else {
      this.opponentScore++;
      this.resetPuck('player');
    }
    
    // Check for win
    if (this.playerScore >= this.pointsToWin) {
      this.end(true);
    } else if (this.opponentScore >= this.pointsToWin) {
      this.end(false);
    }
  }

  public getPlayerScore(): number { return this.playerScore; }
  public getOpponentScore(): number { return this.opponentScore; }
  public getPointsToWin(): number { return this.pointsToWin; }

  protected cleanup(): void {
    this.engine.remove(this.playerPaddle.mesh);
    this.engine.remove(this.opponentPaddle.mesh);
    this.engine.remove(this.puck.mesh);
  }
}

export default HockeyGame;
