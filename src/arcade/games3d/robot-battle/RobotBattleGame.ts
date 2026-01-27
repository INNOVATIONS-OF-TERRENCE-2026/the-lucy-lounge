/**
 * ┌─────────────────────────────────────────────────────────────────────────────┐
 * │ LUCY ARCADE — ROBOT BATTLE                                                 │
 * │                                                                             │
 * │ Mech combat with destructible robots, multiple weapons,                    │
 * │ and arena-based battles                                                    │
 * └─────────────────────────────────────────────────────────────────────────────┘
 */

import * as THREE from 'three';
import {
  Game3DBase,
  type Game3DConfig,
  ThirdPersonCameraController,
  ParticlePresets,
  type InputState,
} from '../../engine3d';

interface RobotPart {
  mesh: THREE.Mesh;
  health: number;
  maxHealth: number;
  isDestroyed: boolean;
}

interface Robot {
  mesh: THREE.Group;
  position: THREE.Vector3;
  rotation: number;
  
  // Parts
  body: RobotPart;
  leftArm: RobotPart;
  rightArm: RobotPart;
  legs: RobotPart;
  
  // Stats
  health: number;
  maxHealth: number;
  energy: number;
  maxEnergy: number;
  
  // Weapons
  leftWeapon: 'laser' | 'missile' | 'cannon';
  rightWeapon: 'laser' | 'missile' | 'cannon';
  lastFireTime: { left: number; right: number };
  
  // State
  isPlayer: boolean;
  isDestroyed: boolean;
}

interface Projectile {
  mesh: THREE.Mesh;
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  damage: number;
  owner: Robot;
  type: 'laser' | 'missile' | 'cannon';
  lifetime: number;
}

export class RobotBattleGame extends Game3DBase {
  private cameraController!: ThirdPersonCameraController;
  
  private playerRobot!: Robot;
  private enemyRobots: Robot[] = [];
  private projectiles: Projectile[] = [];
  
  // Arena
  private arenaSize: number = 50;
  
  // Game state
  private wave: number = 0;
  private kills: number = 0;
  private enemiesRemaining: number = 0;

  constructor(container: HTMLElement, config?: Game3DConfig) {
    super(container, {
      ...config,
      engineConfig: {
        shadows: true,
        bloom: true,
        bloomStrength: 0.8,
        fog: { color: 0x1a1a2e, near: 20, far: 80 },
        ...config?.engineConfig,
      },
    });
  }

  protected async loadAssets(): Promise<void> {}

  protected initScene(): void {
    this.setupLighting();
    this.createArena();
    this.createPlayerRobot();
    this.spawnWave();
    
    this.cameraController = new ThirdPersonCameraController(this.engine.camera, {
      distance: 15,
      height: 8,
      minPitch: 0.2,
      maxPitch: 1.0,
    });
    
    this.createParticleSystem('explosion', ParticlePresets.explosion());
    this.createParticleSystem('sparks', ParticlePresets.sparks());
    this.createParticleSystem('smoke', ParticlePresets.smoke());
    
    this.createGradientSkybox(0x1a1a2e, 0x0a0a1a);
  }

  private setupLighting(): void {
    this.engine.addAmbientLight(0x4444ff, 0.3);
    this.engine.addDirectionalLight(0xffffff, 0.6, new THREE.Vector3(30, 50, 20), true);
    this.engine.addPointLight(0xff4400, 0.5, new THREE.Vector3(0, 10, 0), 30, 2);
  }

  private createArena(): void {
    // Floor
    const floorGeo = new THREE.PlaneGeometry(this.arenaSize, this.arenaSize, 20, 20);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x222233,
      roughness: 0.8,
      metalness: 0.2,
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    this.engine.add(floor);
    
    // Grid lines
    const gridHelper = new THREE.GridHelper(this.arenaSize, 20, 0x444466, 0x333355);
    gridHelper.position.y = 0.01;
    this.engine.add(gridHelper);
    
    // Walls
    const wallMat = new THREE.MeshStandardMaterial({
      color: 0x333344,
      roughness: 0.6,
      metalness: 0.4,
    });
    
    const wallPositions = [
      { pos: [0, 3, -this.arenaSize / 2], size: [this.arenaSize, 6, 1] },
      { pos: [0, 3, this.arenaSize / 2], size: [this.arenaSize, 6, 1] },
      { pos: [-this.arenaSize / 2, 3, 0], size: [1, 6, this.arenaSize] },
      { pos: [this.arenaSize / 2, 3, 0], size: [1, 6, this.arenaSize] },
    ];
    
    wallPositions.forEach(({ pos, size }) => {
      const wallGeo = new THREE.BoxGeometry(size[0], size[1], size[2]);
      const wall = new THREE.Mesh(wallGeo, wallMat);
      wall.position.set(pos[0], pos[1], pos[2]);
      wall.castShadow = true;
      wall.receiveShadow = true;
      this.engine.add(wall);
    });
    
    // Obstacles
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const radius = 15;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      
      const obstacleGeo = new THREE.BoxGeometry(3, 4, 3);
      const obstacle = new THREE.Mesh(obstacleGeo, wallMat);
      obstacle.position.set(x, 2, z);
      obstacle.castShadow = true;
      obstacle.receiveShadow = true;
      this.engine.add(obstacle);
    }
  }

  private createRobot(position: THREE.Vector3, isPlayer: boolean): Robot {
    const group = new THREE.Group();
    const color = isPlayer ? 0x00aaff : 0xff4400;
    const mat = new THREE.MeshStandardMaterial({
      color,
      roughness: 0.4,
      metalness: 0.8,
      emissive: color,
      emissiveIntensity: 0.2,
    });
    
    // Body (torso)
    const bodyGeo = new THREE.BoxGeometry(2, 2.5, 1.5);
    const body = new THREE.Mesh(bodyGeo, mat);
    body.position.y = 3;
    body.castShadow = true;
    group.add(body);
    
    // Head
    const headGeo = new THREE.BoxGeometry(1, 0.8, 0.8);
    const head = new THREE.Mesh(headGeo, mat);
    head.position.y = 4.5;
    group.add(head);
    
    // Eyes
    const eyeMat = new THREE.MeshBasicMaterial({ color: isPlayer ? 0x00ff00 : 0xff0000 });
    const eyeGeo = new THREE.SphereGeometry(0.1, 8, 8);
    [-0.2, 0.2].forEach(x => {
      const eye = new THREE.Mesh(eyeGeo, eyeMat);
      eye.position.set(x, 4.5, 0.4);
      group.add(eye);
    });
    
    // Arms
    const armGeo = new THREE.BoxGeometry(0.6, 2, 0.6);
    const leftArm = new THREE.Mesh(armGeo, mat);
    leftArm.position.set(-1.5, 3, 0);
    leftArm.name = 'leftArm';
    leftArm.castShadow = true;
    group.add(leftArm);
    
    const rightArm = new THREE.Mesh(armGeo, mat);
    rightArm.position.set(1.5, 3, 0);
    rightArm.name = 'rightArm';
    rightArm.castShadow = true;
    group.add(rightArm);
    
    // Weapon barrels
    const barrelGeo = new THREE.CylinderGeometry(0.1, 0.15, 1, 8);
    const barrelMat = new THREE.MeshStandardMaterial({ color: 0x333333, metalness: 0.9 });
    
    const leftBarrel = new THREE.Mesh(barrelGeo, barrelMat);
    leftBarrel.rotation.x = Math.PI / 2;
    leftBarrel.position.set(-1.5, 3, 0.8);
    leftBarrel.name = 'leftBarrel';
    group.add(leftBarrel);
    
    const rightBarrel = new THREE.Mesh(barrelGeo, barrelMat);
    rightBarrel.rotation.x = Math.PI / 2;
    rightBarrel.position.set(1.5, 3, 0.8);
    rightBarrel.name = 'rightBarrel';
    group.add(rightBarrel);
    
    // Legs
    const legGeo = new THREE.BoxGeometry(0.8, 2, 0.8);
    const leftLeg = new THREE.Mesh(legGeo, mat);
    leftLeg.position.set(-0.6, 1, 0);
    leftLeg.name = 'leftLeg';
    leftLeg.castShadow = true;
    group.add(leftLeg);
    
    const rightLeg = new THREE.Mesh(legGeo, mat);
    rightLeg.position.set(0.6, 1, 0);
    rightLeg.name = 'rightLeg';
    rightLeg.castShadow = true;
    group.add(rightLeg);
    
    // Feet
    const footGeo = new THREE.BoxGeometry(1, 0.3, 1.2);
    [-0.6, 0.6].forEach(x => {
      const foot = new THREE.Mesh(footGeo, mat);
      foot.position.set(x, 0.15, 0.2);
      group.add(foot);
    });
    
    group.position.copy(position);
    this.engine.add(group);
    
    return {
      mesh: group,
      position: position.clone(),
      rotation: 0,
      body: { mesh: body, health: 100, maxHealth: 100, isDestroyed: false },
      leftArm: { mesh: leftArm, health: 50, maxHealth: 50, isDestroyed: false },
      rightArm: { mesh: rightArm, health: 50, maxHealth: 50, isDestroyed: false },
      legs: { mesh: leftLeg, health: 75, maxHealth: 75, isDestroyed: false },
      health: 200,
      maxHealth: 200,
      energy: 100,
      maxEnergy: 100,
      leftWeapon: 'laser',
      rightWeapon: 'cannon',
      lastFireTime: { left: 0, right: 0 },
      isPlayer,
      isDestroyed: false,
    };
  }

  private createPlayerRobot(): void {
    this.playerRobot = this.createRobot(new THREE.Vector3(0, 0, 0), true);
  }

  private spawnWave(): void {
    this.wave++;
    const enemyCount = 2 + this.wave;
    
    for (let i = 0; i < enemyCount; i++) {
      const angle = (i / enemyCount) * Math.PI * 2;
      const radius = 20;
      const pos = new THREE.Vector3(
        Math.cos(angle) * radius,
        0,
        Math.sin(angle) * radius
      );
      
      const enemy = this.createRobot(pos, false);
      this.enemyRobots.push(enemy);
    }
    
    this.enemiesRemaining = enemyCount;
  }

  protected update(deltaTime: number, input: InputState): void {
    this.updatePlayerRobot(deltaTime, input);
    this.updateEnemyRobots(deltaTime);
    this.updateProjectiles(deltaTime);
    this.regenerateEnergy(deltaTime);
    
    this.cameraController.setTarget(this.playerRobot.mesh.position);
    this.cameraController.update(deltaTime, input);
    
    this.checkWaveCompletion();
    
    this.setScore({ score: this.kills * 100, kills: this.kills });
  }

  protected fixedUpdate(fixedDeltaTime: number): void {}

  private updatePlayerRobot(deltaTime: number, input: InputState): void {
    const robot = this.playerRobot;
    if (robot.isDestroyed) return;
    
    // Movement
    const moveSpeed = robot.legs.isDestroyed ? 2 : 6;
    const turnSpeed = 2;
    
    robot.rotation -= input.virtual.moveX * turnSpeed * deltaTime;
    robot.mesh.rotation.y = robot.rotation;
    
    const forward = new THREE.Vector3(0, 0, 1).applyAxisAngle(new THREE.Vector3(0, 1, 0), robot.rotation);
    robot.position.addScaledVector(forward, input.virtual.moveY * moveSpeed * deltaTime);
    
    // Clamp to arena
    robot.position.x = THREE.MathUtils.clamp(robot.position.x, -this.arenaSize / 2 + 3, this.arenaSize / 2 - 3);
    robot.position.z = THREE.MathUtils.clamp(robot.position.z, -this.arenaSize / 2 + 3, this.arenaSize / 2 - 3);
    
    robot.mesh.position.copy(robot.position);
    
    // Firing
    if (input.virtual.fire && !robot.leftArm.isDestroyed) {
      this.fireWeapon(robot, 'left');
    }
    if (input.keys.has('KeyE') && !robot.rightArm.isDestroyed) {
      this.fireWeapon(robot, 'right');
    }
  }

  private updateEnemyRobots(deltaTime: number): void {
    this.enemyRobots.forEach(robot => {
      if (robot.isDestroyed) return;
      
      const toPlayer = this.playerRobot.position.clone().sub(robot.position);
      const distance = toPlayer.length();
      toPlayer.normalize();
      
      // Turn towards player
      const targetRotation = Math.atan2(toPlayer.x, toPlayer.z);
      robot.rotation = THREE.MathUtils.lerp(robot.rotation, targetRotation, deltaTime * 2);
      robot.mesh.rotation.y = robot.rotation;
      
      // Move towards player
      if (distance > 15) {
        const moveSpeed = robot.legs.isDestroyed ? 1 : 3;
        const forward = new THREE.Vector3(0, 0, 1).applyAxisAngle(new THREE.Vector3(0, 1, 0), robot.rotation);
        robot.position.addScaledVector(forward, moveSpeed * deltaTime);
        robot.mesh.position.copy(robot.position);
      }
      
      // Fire at player
      if (distance < 25 && Math.random() < 0.02) {
        if (!robot.leftArm.isDestroyed) this.fireWeapon(robot, 'left');
        if (!robot.rightArm.isDestroyed) this.fireWeapon(robot, 'right');
      }
    });
  }

  private fireWeapon(robot: Robot, side: 'left' | 'right'): void {
    const weapon = side === 'left' ? robot.leftWeapon : robot.rightWeapon;
    const lastFire = robot.lastFireTime[side];
    
    let fireRate: number;
    let damage: number;
    let speed: number;
    let energyCost: number;
    
    switch (weapon) {
      case 'laser':
        fireRate = 0.2;
        damage = 10;
        speed = 50;
        energyCost = 5;
        break;
      case 'cannon':
        fireRate = 1;
        damage = 40;
        speed = 30;
        energyCost = 20;
        break;
      case 'missile':
        fireRate = 2;
        damage = 60;
        speed = 20;
        energyCost = 30;
        break;
      default:
        return;
    }
    
    if (this.gameTime - lastFire < fireRate) return;
    if (robot.energy < energyCost) return;
    
    robot.lastFireTime[side] = this.gameTime;
    robot.energy -= energyCost;
    
    // Spawn projectile
    const barrelOffset = side === 'left' ? -1.5 : 1.5;
    const spawnPos = robot.position.clone().add(
      new THREE.Vector3(barrelOffset, 3, 1).applyAxisAngle(new THREE.Vector3(0, 1, 0), robot.rotation)
    );
    
    const direction = new THREE.Vector3(0, 0, 1).applyAxisAngle(new THREE.Vector3(0, 1, 0), robot.rotation);
    
    let projGeo: THREE.BufferGeometry;
    let projMat: THREE.Material;
    
    switch (weapon) {
      case 'laser':
        projGeo = new THREE.CylinderGeometry(0.05, 0.05, 1, 8);
        projMat = new THREE.MeshBasicMaterial({ color: robot.isPlayer ? 0x00ff00 : 0xff0000 });
        break;
      case 'cannon':
        projGeo = new THREE.SphereGeometry(0.2, 8, 8);
        projMat = new THREE.MeshBasicMaterial({ color: 0xffaa00 });
        break;
      case 'missile':
        projGeo = new THREE.ConeGeometry(0.1, 0.5, 8);
        projMat = new THREE.MeshBasicMaterial({ color: 0xff4400 });
        break;
      default:
        return;
    }
    
    const projMesh = new THREE.Mesh(projGeo, projMat);
    projMesh.position.copy(spawnPos);
    if (weapon === 'laser') {
      projMesh.rotation.x = Math.PI / 2;
    }
    projMesh.lookAt(spawnPos.clone().add(direction));
    this.engine.add(projMesh);
    
    this.projectiles.push({
      mesh: projMesh,
      position: spawnPos,
      velocity: direction.multiplyScalar(speed),
      damage,
      owner: robot,
      type: weapon,
      lifetime: 3,
    });
  }

  private updateProjectiles(deltaTime: number): void {
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const proj = this.projectiles[i];
      proj.lifetime -= deltaTime;
      
      if (proj.lifetime <= 0) {
        this.removeProjectile(i);
        continue;
      }
      
      // Update position
      proj.position.addScaledVector(proj.velocity, deltaTime);
      proj.mesh.position.copy(proj.position);
      
      // Check hits
      const targets = proj.owner.isPlayer ? this.enemyRobots : [this.playerRobot];
      
      for (const target of targets) {
        if (target.isDestroyed) continue;
        
        const dist = proj.position.distanceTo(target.position);
        if (dist < 2) {
          this.hitRobot(target, proj.damage, proj.owner);
          this.removeProjectile(i);
          break;
        }
      }
      
      // Out of bounds
      if (Math.abs(proj.position.x) > this.arenaSize / 2 ||
          Math.abs(proj.position.z) > this.arenaSize / 2) {
        this.removeProjectile(i);
      }
    }
  }

  private hitRobot(robot: Robot, damage: number, attacker: Robot): void {
    robot.health -= damage;
    
    const sparks = this.getParticleSystem('sparks');
    if (sparks) {
      sparks.setPosition(robot.position.clone().add(new THREE.Vector3(0, 3, 0)));
      sparks.burst(20);
    }
    
    // Random part damage
    const parts = [robot.body, robot.leftArm, robot.rightArm, robot.legs];
    const part = parts[Math.floor(Math.random() * parts.length)];
    if (!part.isDestroyed) {
      part.health -= damage * 0.5;
      if (part.health <= 0) {
        part.isDestroyed = true;
        part.mesh.visible = false;
      }
    }
    
    if (robot.health <= 0) {
      this.destroyRobot(robot);
      if (attacker === this.playerRobot) {
        this.kills++;
        this.addScore(100);
      }
    }
  }

  private destroyRobot(robot: Robot): void {
    robot.isDestroyed = true;
    
    const explosion = this.getParticleSystem('explosion');
    if (explosion) {
      explosion.setPosition(robot.position.clone().add(new THREE.Vector3(0, 3, 0)));
      explosion.burst(100);
    }
    
    const smoke = this.getParticleSystem('smoke');
    if (smoke) {
      smoke.setPosition(robot.position);
      smoke.play();
    }
    
    this.engine.remove(robot.mesh);
    
    if (!robot.isPlayer) {
      this.enemiesRemaining--;
    } else {
      this.end(false);
    }
    
    this.screenShake(0.4, 0.3);
  }

  private removeProjectile(index: number): void {
    const proj = this.projectiles[index];
    this.engine.remove(proj.mesh);
    proj.mesh.geometry.dispose();
    (proj.mesh.material as THREE.Material).dispose();
    this.projectiles.splice(index, 1);
  }

  private regenerateEnergy(deltaTime: number): void {
    [this.playerRobot, ...this.enemyRobots].forEach(robot => {
      if (!robot.isDestroyed) {
        robot.energy = Math.min(robot.maxEnergy, robot.energy + 10 * deltaTime);
      }
    });
  }

  private checkWaveCompletion(): void {
    if (this.enemiesRemaining <= 0) {
      setTimeout(() => this.spawnWave(), 3000);
    }
  }

  public getPlayerHealth(): number { return this.playerRobot?.health ?? 0; }
  public getPlayerMaxHealth(): number { return this.playerRobot?.maxHealth ?? 200; }
  public getPlayerEnergy(): number { return this.playerRobot?.energy ?? 0; }
  public getWave(): number { return this.wave; }
  public getEnemiesRemaining(): number { return this.enemiesRemaining; }
  public getKills(): number { return this.kills; }

  protected cleanup(): void {
    this.engine.remove(this.playerRobot.mesh);
    this.enemyRobots.forEach(r => this.engine.remove(r.mesh));
    this.projectiles.forEach((_, i) => this.removeProjectile(i));
  }
}

export default RobotBattleGame;
