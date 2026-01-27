/**
 * ┌─────────────────────────────────────────────────────────────────────────────┐
 * │ LUCY ARCADE — 3D SOCCER                                                    │
 * │                                                                             │
 * │ Fast-paced arcade soccer with physics-based ball control,                  │
 * │ AI teammates and opponents, and exciting gameplay                          │
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
  body: PhysicsBody;
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  team: 'home' | 'away';
  isControlled: boolean;
  hasBall: boolean;
  stamina: number;
  speed: number;
}

interface Ball {
  mesh: THREE.Mesh;
  body: PhysicsBody;
  lastTouchedBy: Player | null;
}

export class SoccerGame extends Game3DBase {
  private cameraController!: ThirdPersonCameraController;
  
  private ball!: Ball;
  private players: Player[] = [];
  private controlledPlayer!: Player;
  
  // Game state
  private homeScore: number = 0;
  private awayScore: number = 0;
  private matchTime: number = 0;
  private matchDuration: number = 180; // 3 minutes
  private isPaused: boolean = false;
  
  // Field dimensions
  private fieldWidth: number = 68;
  private fieldLength: number = 105;
  private goalWidth: number = 7.32;
  private goalHeight: number = 2.44;

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
    this.createField();
    this.createGoals();
    this.createBall();
    this.createPlayers();
    
    this.cameraController = new ThirdPersonCameraController(this.engine.camera, {
      distance: 20,
      height: 15,
      minPitch: 0.3,
      maxPitch: 1.2,
    });
    
    this.createGradientSkybox(0x87ceeb, 0xffffff);
    this.kickoff('home');
  }

  private setupLighting(): void {
    this.engine.addAmbientLight(0xffffff, 0.5);
    this.engine.addDirectionalLight(0xffffff, 1.0, new THREE.Vector3(30, 50, 20), true);
  }

  private createField(): void {
    // Grass
    const fieldGeo = new THREE.PlaneGeometry(this.fieldWidth, this.fieldLength);
    const fieldMat = new THREE.MeshStandardMaterial({ color: 0x228B22, roughness: 0.9 });
    const field = new THREE.Mesh(fieldGeo, fieldMat);
    field.rotation.x = -Math.PI / 2;
    field.receiveShadow = true;
    this.engine.add(field);
    
    this.engine.physics.addBox(field, new THREE.Vector3(this.fieldWidth, 0.1, this.fieldLength), 'static', {
      friction: 0.6,
      restitution: 0.3,
    });
    
    // Field lines
    const lineMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    
    // Center circle
    const centerCircle = new THREE.RingGeometry(9.1, 9.2, 32);
    const centerLine = new THREE.Mesh(centerCircle, lineMat);
    centerLine.rotation.x = -Math.PI / 2;
    centerLine.position.y = 0.01;
    this.engine.add(centerLine);
    
    // Center spot
    const spotGeo = new THREE.CircleGeometry(0.2, 16);
    const spot = new THREE.Mesh(spotGeo, lineMat);
    spot.rotation.x = -Math.PI / 2;
    spot.position.y = 0.01;
    this.engine.add(spot);
    
    // Halfway line
    const halfwayGeo = new THREE.PlaneGeometry(this.fieldWidth, 0.12);
    const halfway = new THREE.Mesh(halfwayGeo, lineMat);
    halfway.rotation.x = -Math.PI / 2;
    halfway.position.y = 0.01;
    this.engine.add(halfway);
    
    // Penalty areas
    this.createPenaltyArea(this.fieldLength / 2 - 16.5);
    this.createPenaltyArea(-this.fieldLength / 2 + 16.5);
    
    // Boundary walls (invisible)
    const wallPositions = [
      { pos: [0, 1, this.fieldLength / 2 + 2], size: [this.fieldWidth + 10, 2, 1] },
      { pos: [0, 1, -this.fieldLength / 2 - 2], size: [this.fieldWidth + 10, 2, 1] },
      { pos: [this.fieldWidth / 2 + 2, 1, 0], size: [1, 2, this.fieldLength + 10] },
      { pos: [-this.fieldWidth / 2 - 2, 1, 0], size: [1, 2, this.fieldLength + 10] },
    ];
    
    wallPositions.forEach(({ pos, size }) => {
      const wallGeo = new THREE.BoxGeometry(size[0], size[1], size[2]);
      const wall = new THREE.Mesh(wallGeo, new THREE.MeshBasicMaterial({ visible: false }));
      wall.position.set(pos[0], pos[1], pos[2]);
      this.engine.add(wall);
      this.engine.physics.addBox(wall, new THREE.Vector3(size[0], size[1], size[2]), 'static');
    });
  }

  private createPenaltyArea(z: number): void {
    const lineMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    
    // Penalty box
    const boxWidth = 40.3;
    const boxDepth = 16.5;
    
    const lines = [
      { pos: [0, 0.01, z], size: [boxWidth, 0.12], rot: 0 },
      { pos: [boxWidth / 2, 0.01, z + (z > 0 ? -boxDepth / 2 : boxDepth / 2)], size: [0.12, boxDepth], rot: 0 },
      { pos: [-boxWidth / 2, 0.01, z + (z > 0 ? -boxDepth / 2 : boxDepth / 2)], size: [0.12, boxDepth], rot: 0 },
    ];
    
    lines.forEach(({ pos, size }) => {
      const geo = new THREE.PlaneGeometry(size[0], size[1]);
      const line = new THREE.Mesh(geo, lineMat);
      line.rotation.x = -Math.PI / 2;
      line.position.set(pos[0], pos[1], pos[2]);
      this.engine.add(line);
    });
    
    // Penalty spot
    const spotGeo = new THREE.CircleGeometry(0.15, 16);
    const spot = new THREE.Mesh(spotGeo, lineMat);
    spot.rotation.x = -Math.PI / 2;
    spot.position.set(0, 0.01, z + (z > 0 ? -11 : 11));
    this.engine.add(spot);
  }

  private createGoals(): void {
    const goalMat = new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 0.8, roughness: 0.2 });
    
    [1, -1].forEach(side => {
      const goalGroup = new THREE.Group();
      
      // Posts
      const postGeo = new THREE.CylinderGeometry(0.06, 0.06, this.goalHeight, 8);
      
      const leftPost = new THREE.Mesh(postGeo, goalMat);
      leftPost.position.set(-this.goalWidth / 2, this.goalHeight / 2, 0);
      goalGroup.add(leftPost);
      
      const rightPost = new THREE.Mesh(postGeo, goalMat);
      rightPost.position.set(this.goalWidth / 2, this.goalHeight / 2, 0);
      goalGroup.add(rightPost);
      
      // Crossbar
      const crossbarGeo = new THREE.CylinderGeometry(0.06, 0.06, this.goalWidth + 0.12, 8);
      const crossbar = new THREE.Mesh(crossbarGeo, goalMat);
      crossbar.rotation.z = Math.PI / 2;
      crossbar.position.set(0, this.goalHeight, 0);
      goalGroup.add(crossbar);
      
      // Net (simplified)
      const netGeo = new THREE.PlaneGeometry(this.goalWidth, this.goalHeight);
      const netMat = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.3,
        side: THREE.DoubleSide,
      });
      const net = new THREE.Mesh(netGeo, netMat);
      net.position.set(0, this.goalHeight / 2, side * 1);
      goalGroup.add(net);
      
      goalGroup.position.set(0, 0, side * this.fieldLength / 2);
      this.engine.add(goalGroup);
      
      // Goal line trigger
      const triggerGeo = new THREE.BoxGeometry(this.goalWidth, this.goalHeight, 0.5);
      const trigger = new THREE.Mesh(triggerGeo, new THREE.MeshBasicMaterial({ visible: false }));
      trigger.position.set(0, this.goalHeight / 2, side * (this.fieldLength / 2 + 0.5));
      trigger.userData = { isGoal: true, team: side > 0 ? 'away' : 'home' };
      this.engine.add(trigger);
    });
  }

  private createBall(): void {
    const ballGeo = new THREE.SphereGeometry(0.11, 32, 32);
    const ballMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.4 });
    const mesh = new THREE.Mesh(ballGeo, ballMat);
    mesh.castShadow = true;
    this.engine.add(mesh);
    
    const body = this.engine.physics.addSphere(mesh, 0.11, 'dynamic', {
      mass: 0.43,
      friction: 0.5,
      restitution: 0.7,
      linearDamping: 0.3,
      angularDamping: 0.3,
    });
    
    this.ball = { mesh, body, lastTouchedBy: null };
  }

  private createPlayers(): void {
    // Home team (blue)
    const homePositions = [
      [0, -40], // GK
      [-15, -25], [15, -25], // Defenders
      [-20, 0], [0, -10], [20, 0], // Midfielders
      [-10, 20], [10, 20], // Forwards
    ];
    
    homePositions.forEach(([x, z], i) => {
      const player = this.createPlayer(new THREE.Vector3(x, 0, z), 'home', i === 0);
      this.players.push(player);
      if (i === 4) this.controlledPlayer = player; // Control center mid
    });
    
    // Away team (red)
    const awayPositions = [
      [0, 40], // GK
      [-15, 25], [15, 25], // Defenders
      [-20, 0], [0, 10], [20, 0], // Midfielders
      [-10, -20], [10, -20], // Forwards
    ];
    
    awayPositions.forEach(([x, z], i) => {
      const player = this.createPlayer(new THREE.Vector3(x, 0, z), 'away', i === 0);
      this.players.push(player);
    });
    
    this.controlledPlayer.isControlled = true;
  }

  private createPlayer(position: THREE.Vector3, team: 'home' | 'away', isGoalkeeper: boolean): Player {
    const group = new THREE.Group();
    const color = team === 'home' ? 0x0066cc : 0xcc0000;
    
    // Body
    const bodyGeo = new THREE.CapsuleGeometry(0.3, 0.8, 4, 8);
    const bodyMat = new THREE.MeshStandardMaterial({ color });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = 0.9;
    body.castShadow = true;
    group.add(body);
    
    // Head
    const headGeo = new THREE.SphereGeometry(0.2, 16, 16);
    const headMat = new THREE.MeshStandardMaterial({ color: 0xdeb887 });
    const head = new THREE.Mesh(headGeo, headMat);
    head.position.y = 1.6;
    head.castShadow = true;
    group.add(head);
    
    group.position.copy(position);
    this.engine.add(group);
    
    const physicsBody = this.engine.physics.addCapsule(group, 0.4, 0.3, 'dynamic', {
      mass: 75,
      linearDamping: 5,
      angularDamping: 10,
    });
    
    return {
      mesh: group,
      body: physicsBody,
      position: position.clone(),
      velocity: new THREE.Vector3(),
      team,
      isControlled: false,
      hasBall: false,
      stamina: 100,
      speed: isGoalkeeper ? 8 : 10,
    };
  }

  private kickoff(team: 'home' | 'away'): void {
    this.ball.mesh.position.set(0, 0.11, 0);
    this.engine.physics.setLinearVelocity(this.ball.body, new THREE.Vector3(0, 0, 0));
    
    // Reset player positions
    this.players.forEach((player, i) => {
      const isHome = player.team === 'home';
      const positions = isHome
        ? [[0, -40], [-15, -25], [15, -25], [-20, -5], [0, -10], [20, -5], [-10, -2], [10, -2]]
        : [[0, 40], [-15, 25], [15, 25], [-20, 5], [0, 10], [20, 5], [-10, 2], [10, 2]];
      
      const idx = i % 8;
      player.mesh.position.set(positions[idx][0], 0, positions[idx][1]);
      player.position.copy(player.mesh.position);
    });
  }

  protected update(deltaTime: number, input: InputState): void {
    this.matchTime += deltaTime;
    
    if (this.matchTime >= this.matchDuration) {
      this.end(this.homeScore > this.awayScore);
      return;
    }
    
    this.updateControlledPlayer(deltaTime, input);
    this.updateAIPlayers(deltaTime);
    this.updateBall(deltaTime);
    this.checkGoal();
    
    this.cameraController.setTarget(this.ball.mesh.position);
    this.cameraController.update(deltaTime, input);
    
    this.setScore({ score: this.homeScore });
  }

  protected fixedUpdate(fixedDeltaTime: number): void {}

  private updateControlledPlayer(deltaTime: number, input: InputState): void {
    const player = this.controlledPlayer;
    
    // Movement
    const moveDir = new THREE.Vector3(input.virtual.moveX, 0, -input.virtual.moveY);
    if (moveDir.length() > 0) {
      moveDir.normalize().multiplyScalar(player.speed);
      this.engine.physics.setLinearVelocity(player.body, moveDir);
      
      // Face movement direction
      player.mesh.rotation.y = Math.atan2(moveDir.x, moveDir.z);
    }
    
    player.position.copy(player.mesh.position);
    
    // Kick ball
    if (input.virtual.firePressed) {
      const toBall = this.ball.mesh.position.clone().sub(player.position);
      if (toBall.length() < 1.5) {
        this.kickBall(player, input.virtual.fire ? 20 : 10);
      }
    }
    
    // Switch player
    if (input.keysJustPressed.has('KeyQ')) {
      this.switchToNearestPlayer();
    }
  }

  private updateAIPlayers(deltaTime: number): void {
    this.players.forEach(player => {
      if (player.isControlled) return;
      
      const toBall = this.ball.mesh.position.clone().sub(player.position);
      const distToBall = toBall.length();
      
      // Simple AI: move towards ball if close, otherwise hold position
      if (distToBall < 15 && player.team === this.ball.lastTouchedBy?.team) {
        // Support play
        const supportPos = this.ball.mesh.position.clone();
        supportPos.x += (Math.random() - 0.5) * 10;
        supportPos.z += player.team === 'home' ? 5 : -5;
        
        const toSupport = supportPos.sub(player.position);
        if (toSupport.length() > 2) {
          toSupport.normalize().multiplyScalar(player.speed * 0.7);
          this.engine.physics.setLinearVelocity(player.body, toSupport);
        }
      } else if (distToBall < 10) {
        // Chase ball
        toBall.normalize().multiplyScalar(player.speed);
        this.engine.physics.setLinearVelocity(player.body, toBall);
        
        // Kick if close
        if (distToBall < 1.5) {
          this.kickBall(player, 15);
        }
      }
      
      player.position.copy(player.mesh.position);
    });
  }

  private kickBall(player: Player, power: number): void {
    // Direction towards opponent's goal
    const goalZ = player.team === 'home' ? this.fieldLength / 2 : -this.fieldLength / 2;
    const toGoal = new THREE.Vector3(0, 0, goalZ).sub(player.position).normalize();
    
    // Add some randomness
    toGoal.x += (Math.random() - 0.5) * 0.3;
    toGoal.y = 0.2; // Slight lift
    toGoal.normalize();
    
    const velocity = toGoal.multiplyScalar(power);
    this.engine.physics.setLinearVelocity(this.ball.body, velocity);
    
    this.ball.lastTouchedBy = player;
  }

  private updateBall(deltaTime: number): void {
    // Check which player has the ball
    this.players.forEach(player => {
      const dist = this.ball.mesh.position.distanceTo(player.position);
      player.hasBall = dist < 1;
    });
  }

  private checkGoal(): void {
    const ballZ = this.ball.mesh.position.z;
    const ballX = Math.abs(this.ball.mesh.position.x);
    const ballY = this.ball.mesh.position.y;
    
    if (ballX < this.goalWidth / 2 && ballY < this.goalHeight) {
      if (ballZ > this.fieldLength / 2) {
        this.homeScore++;
        this.addScore(100);
        this.kickoff('away');
      } else if (ballZ < -this.fieldLength / 2) {
        this.awayScore++;
        this.kickoff('home');
      }
    }
  }

  private switchToNearestPlayer(): void {
    let nearest: Player | null = null;
    let nearestDist = Infinity;
    
    this.players.forEach(player => {
      if (player.team !== 'home' || player === this.controlledPlayer) return;
      
      const dist = player.position.distanceTo(this.ball.mesh.position);
      if (dist < nearestDist) {
        nearestDist = dist;
        nearest = player;
      }
    });
    
    if (nearest) {
      this.controlledPlayer.isControlled = false;
      this.controlledPlayer = nearest;
      nearest.isControlled = true;
    }
  }

  public getHomeScore(): number { return this.homeScore; }
  public getAwayScore(): number { return this.awayScore; }
  public getMatchTime(): number { return this.matchTime; }
  public getMatchDuration(): number { return this.matchDuration; }

  protected cleanup(): void {
    this.players.forEach(p => {
      this.engine.remove(p.mesh);
      this.engine.physics.removeBody(p.body);
    });
    this.engine.remove(this.ball.mesh);
    this.engine.physics.removeBody(this.ball.body);
  }
}

export default SoccerGame;
