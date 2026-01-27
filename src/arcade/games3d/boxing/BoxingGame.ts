/**
 * ┌─────────────────────────────────────────────────────────────────────────────┐
 * │ LUCY ARCADE — 3D BOXING                                                    │
 * │                                                                             │
 * │ Intense boxing simulation with realistic physics, stamina management,      │
 * │ combos, and AI opponents with adaptive difficulty                          │
 * └─────────────────────────────────────────────────────────────────────────────┘
 */

import * as THREE from 'three';
import {
  Game3DBase,
  type Game3DConfig,
  type InputState,
} from '../../engine3d';
import { AdaptiveDifficulty } from '../../engine3d/core/AIBehaviorTree';

interface Boxer {
  mesh: THREE.Group;
  position: THREE.Vector3;
  
  // Stats
  health: number;
  maxHealth: number;
  stamina: number;
  maxStamina: number;
  
  // State
  isBlocking: boolean;
  isDodging: boolean;
  isStunned: boolean;
  stunTime: number;
  
  // Animation
  leftArmAngle: number;
  rightArmAngle: number;
  bodyLean: number;
  
  // Combat
  lastPunchTime: number;
  combo: number;
  
  team: 'player' | 'opponent';
}

type PunchType = 'jab' | 'cross' | 'hook' | 'uppercut';

interface Punch {
  type: PunchType;
  damage: number;
  staminaCost: number;
  speed: number;
  range: number;
}

const PUNCHES: Record<PunchType, Punch> = {
  jab: { type: 'jab', damage: 5, staminaCost: 5, speed: 0.15, range: 1.5 },
  cross: { type: 'cross', damage: 10, staminaCost: 10, speed: 0.2, range: 1.8 },
  hook: { type: 'hook', damage: 15, staminaCost: 15, speed: 0.25, range: 1.2 },
  uppercut: { type: 'uppercut', damage: 20, staminaCost: 20, speed: 0.3, range: 1.0 },
};

export class BoxingGame extends Game3DBase {
  private player!: Boxer;
  private opponent!: Boxer;
  
  // Ring
  private ringMesh!: THREE.Group;
  
  // Game state
  private round: number = 1;
  private maxRounds: number = 3;
  private roundTime: number = 0;
  private roundDuration: number = 60;
  private isRoundActive: boolean = false;
  private knockdowns: { player: number; opponent: number } = { player: 0, opponent: 0 };
  
  // AI
  private aiDifficulty: AdaptiveDifficulty;
  private aiNextAction: number = 0;

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
    
    this.aiDifficulty = new AdaptiveDifficulty('medium');
  }

  protected async loadAssets(): Promise<void> {}

  protected initScene(): void {
    this.setupLighting();
    this.createRing();
    this.createBoxers();
    
    this.engine.camera.position.set(0, 3, 8);
    this.engine.camera.lookAt(0, 1.5, 0);
    
    this.createGradientSkybox(0x1a1a2e, 0x0a0a1a);
    this.startRound();
  }

  private setupLighting(): void {
    this.engine.addAmbientLight(0xffffff, 0.3);
    
    // Ring lights
    const spotPositions = [
      [-5, 8, -5], [5, 8, -5], [-5, 8, 5], [5, 8, 5],
    ];
    
    spotPositions.forEach(([x, y, z]) => {
      this.engine.addSpotLight(0xffffff, 2, new THREE.Vector3(x, y, z), new THREE.Vector3(0, 0, 0), Math.PI / 4, 0.5, true);
    });
  }

  private createRing(): void {
    this.ringMesh = new THREE.Group();
    
    // Canvas
    const canvasGeo = new THREE.BoxGeometry(8, 0.5, 8);
    const canvasMat = new THREE.MeshStandardMaterial({ color: 0x1a1a8a });
    const canvas = new THREE.Mesh(canvasGeo, canvasMat);
    canvas.position.y = 0.25;
    canvas.receiveShadow = true;
    this.ringMesh.add(canvas);
    
    // Corner posts
    const postGeo = new THREE.CylinderGeometry(0.1, 0.1, 2, 8);
    const postMat = new THREE.MeshStandardMaterial({ color: 0xcccccc, metalness: 0.8 });
    
    [[-3.5, -3.5], [3.5, -3.5], [-3.5, 3.5], [3.5, 3.5]].forEach(([x, z], i) => {
      const post = new THREE.Mesh(postGeo, postMat);
      post.position.set(x, 1.5, z);
      this.ringMesh.add(post);
      
      // Corner pad
      const padGeo = new THREE.CylinderGeometry(0.2, 0.2, 1.5, 8);
      const padMat = new THREE.MeshStandardMaterial({ color: i < 2 ? 0xff0000 : 0x0000ff });
      const pad = new THREE.Mesh(padGeo, padMat);
      pad.position.set(x, 1.25, z);
      this.ringMesh.add(pad);
    });
    
    // Ropes
    const ropeMat = new THREE.MeshStandardMaterial({ color: 0xffffff });
    
    [0.8, 1.3, 1.8].forEach(height => {
      // Side ropes
      [[-3.5, 0], [3.5, 0], [0, -3.5], [0, 3.5]].forEach(([x, z]) => {
        const ropeGeo = new THREE.CylinderGeometry(0.03, 0.03, 7, 8);
        const rope = new THREE.Mesh(ropeGeo, ropeMat);
        rope.rotation.z = Math.PI / 2;
        if (z !== 0) rope.rotation.y = Math.PI / 2;
        rope.position.set(x, height, z);
        this.ringMesh.add(rope);
      });
    });
    
    this.engine.add(this.ringMesh);
  }

  private createBoxers(): void {
    this.player = this.createBoxer(new THREE.Vector3(0, 0.5, 2), 'player', 0x0066cc);
    this.opponent = this.createBoxer(new THREE.Vector3(0, 0.5, -2), 'opponent', 0xcc0000);
    this.opponent.mesh.rotation.y = Math.PI;
  }

  private createBoxer(position: THREE.Vector3, team: 'player' | 'opponent', color: number): Boxer {
    const group = new THREE.Group();
    
    // Body
    const bodyGeo = new THREE.CapsuleGeometry(0.3, 0.6, 4, 8);
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0xdeb887 });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = 1;
    body.castShadow = true;
    group.add(body);
    
    // Head
    const headGeo = new THREE.SphereGeometry(0.2, 16, 16);
    const head = new THREE.Mesh(headGeo, bodyMat);
    head.position.y = 1.6;
    head.castShadow = true;
    group.add(head);
    
    // Gloves
    const gloveMat = new THREE.MeshStandardMaterial({ color });
    const gloveGeo = new THREE.SphereGeometry(0.12, 8, 8);
    
    const leftGlove = new THREE.Mesh(gloveGeo, gloveMat);
    leftGlove.position.set(-0.4, 1.3, 0.3);
    leftGlove.name = 'leftGlove';
    group.add(leftGlove);
    
    const rightGlove = new THREE.Mesh(gloveGeo, gloveMat);
    rightGlove.position.set(0.4, 1.3, 0.3);
    rightGlove.name = 'rightGlove';
    group.add(rightGlove);
    
    // Arms
    const armGeo = new THREE.CapsuleGeometry(0.08, 0.4, 4, 8);
    const armMat = new THREE.MeshStandardMaterial({ color: 0xdeb887 });
    
    const leftArm = new THREE.Mesh(armGeo, armMat);
    leftArm.position.set(-0.35, 1.15, 0.15);
    leftArm.rotation.x = -0.5;
    leftArm.name = 'leftArm';
    group.add(leftArm);
    
    const rightArm = new THREE.Mesh(armGeo, armMat);
    rightArm.position.set(0.35, 1.15, 0.15);
    rightArm.rotation.x = -0.5;
    rightArm.name = 'rightArm';
    group.add(rightArm);
    
    // Shorts
    const shortsGeo = new THREE.CylinderGeometry(0.25, 0.3, 0.4, 8);
    const shortsMat = new THREE.MeshStandardMaterial({ color });
    const shorts = new THREE.Mesh(shortsGeo, shortsMat);
    shorts.position.y = 0.6;
    group.add(shorts);
    
    group.position.copy(position);
    this.engine.add(group);
    
    return {
      mesh: group,
      position: position.clone(),
      health: 100,
      maxHealth: 100,
      stamina: 100,
      maxStamina: 100,
      isBlocking: false,
      isDodging: false,
      isStunned: false,
      stunTime: 0,
      leftArmAngle: 0,
      rightArmAngle: 0,
      bodyLean: 0,
      lastPunchTime: 0,
      combo: 0,
      team,
    };
  }

  private startRound(): void {
    this.isRoundActive = true;
    this.roundTime = 0;
    
    // Reset positions
    this.player.position.set(0, 0.5, 2);
    this.player.mesh.position.copy(this.player.position);
    this.opponent.position.set(0, 0.5, -2);
    this.opponent.mesh.position.copy(this.opponent.position);
    
    // Reset stamina
    this.player.stamina = this.player.maxStamina;
    this.opponent.stamina = this.opponent.maxStamina;
  }

  protected update(deltaTime: number, input: InputState): void {
    if (!this.isRoundActive) return;
    
    this.roundTime += deltaTime;
    
    if (this.roundTime >= this.roundDuration) {
      this.endRound();
      return;
    }
    
    this.updatePlayer(deltaTime, input);
    this.updateOpponent(deltaTime);
    this.updateAnimations(deltaTime);
    this.regenerateStamina(deltaTime);
    
    // Update camera to follow action
    const midpoint = this.player.position.clone().add(this.opponent.position).multiplyScalar(0.5);
    this.engine.camera.position.lerp(new THREE.Vector3(midpoint.x, 3, 8), 0.05);
    this.engine.camera.lookAt(midpoint.x, 1.5, midpoint.z);
  }

  protected fixedUpdate(fixedDeltaTime: number): void {}

  private updatePlayer(deltaTime: number, input: InputState): void {
    const player = this.player;
    
    if (player.isStunned) {
      player.stunTime -= deltaTime;
      if (player.stunTime <= 0) player.isStunned = false;
      return;
    }
    
    // Movement
    const moveSpeed = 3;
    player.position.x += input.virtual.moveX * moveSpeed * deltaTime;
    player.position.z -= input.virtual.moveY * moveSpeed * deltaTime;
    
    // Clamp to ring
    player.position.x = THREE.MathUtils.clamp(player.position.x, -3, 3);
    player.position.z = THREE.MathUtils.clamp(player.position.z, -3, 3);
    
    player.mesh.position.copy(player.position);
    
    // Face opponent
    const toOpponent = this.opponent.position.clone().sub(player.position);
    player.mesh.rotation.y = Math.atan2(toOpponent.x, toOpponent.z);
    
    // Blocking
    player.isBlocking = input.keys.has('ShiftLeft') || input.keys.has('ShiftRight');
    
    // Dodging
    if (input.keysJustPressed.has('Space')) {
      player.isDodging = true;
      player.bodyLean = input.virtual.moveX * 0.5;
      setTimeout(() => {
        player.isDodging = false;
        player.bodyLean = 0;
      }, 300);
    }
    
    // Punches
    if (input.keysJustPressed.has('KeyJ')) this.throwPunch(player, 'jab', 'left');
    if (input.keysJustPressed.has('KeyK')) this.throwPunch(player, 'cross', 'right');
    if (input.keysJustPressed.has('KeyU')) this.throwPunch(player, 'hook', 'left');
    if (input.keysJustPressed.has('KeyI')) this.throwPunch(player, 'uppercut', 'right');
  }

  private updateOpponent(deltaTime: number): void {
    const opponent = this.opponent;
    const difficulty = this.aiDifficulty.getAdjustedConfig();
    
    if (opponent.isStunned) {
      opponent.stunTime -= deltaTime;
      if (opponent.stunTime <= 0) opponent.isStunned = false;
      return;
    }
    
    // AI decision making
    this.aiNextAction -= deltaTime;
    
    if (this.aiNextAction <= 0) {
      const distToPlayer = opponent.position.distanceTo(this.player.position);
      
      // Move towards player
      if (distToPlayer > 2) {
        const toPlayer = this.player.position.clone().sub(opponent.position).normalize();
        opponent.position.addScaledVector(toPlayer, 2 * deltaTime * difficulty.aiSpeedMultiplier);
      }
      
      // Attack if in range
      if (distToPlayer < 2 && Math.random() < difficulty.aiAggression) {
        const punches: PunchType[] = ['jab', 'cross', 'hook', 'uppercut'];
        const punch = punches[Math.floor(Math.random() * punches.length)];
        const hand = Math.random() > 0.5 ? 'left' : 'right';
        this.throwPunch(opponent, punch, hand);
      }
      
      // Block sometimes
      opponent.isBlocking = Math.random() < 0.3;
      
      this.aiNextAction = difficulty.aiReactionTime + Math.random() * 0.3;
    }
    
    // Face player
    const toPlayer = this.player.position.clone().sub(opponent.position);
    opponent.mesh.rotation.y = Math.atan2(toPlayer.x, toPlayer.z);
    
    opponent.mesh.position.copy(opponent.position);
  }

  private throwPunch(boxer: Boxer, type: PunchType, hand: 'left' | 'right'): void {
    const punch = PUNCHES[type];
    
    if (boxer.stamina < punch.staminaCost) return;
    if (this.gameTime - boxer.lastPunchTime < punch.speed) return;
    
    boxer.stamina -= punch.staminaCost;
    boxer.lastPunchTime = this.gameTime;
    
    // Animate punch
    if (hand === 'left') {
      boxer.leftArmAngle = 1;
    } else {
      boxer.rightArmAngle = 1;
    }
    
    // Check hit
    const target = boxer === this.player ? this.opponent : this.player;
    const distance = boxer.position.distanceTo(target.position);
    
    if (distance <= punch.range) {
      // Check if blocked or dodged
      if (target.isBlocking) {
        // Reduced damage
        this.dealDamage(target, punch.damage * 0.2, boxer);
      } else if (target.isDodging) {
        // Miss
        boxer.combo = 0;
      } else {
        // Full hit
        this.dealDamage(target, punch.damage, boxer);
        boxer.combo++;
        
        // Stun on combo
        if (boxer.combo >= 3) {
          target.isStunned = true;
          target.stunTime = 0.5;
        }
      }
    } else {
      boxer.combo = 0;
    }
  }

  private dealDamage(target: Boxer, damage: number, attacker: Boxer): void {
    target.health -= damage;
    
    if (attacker === this.player) {
      this.aiDifficulty.recordPlayerEvent('damage_dealt', damage);
      this.addScore(Math.round(damage));
    } else {
      this.aiDifficulty.recordPlayerEvent('damage_taken', damage);
    }
    
    // Knockdown check
    if (target.health <= 0) {
      target.health = 0;
      this.knockdown(target);
    }
    
    this.screenShake(0.1, 0.1);
  }

  private knockdown(boxer: Boxer): void {
    if (boxer === this.player) {
      this.knockdowns.player++;
      if (this.knockdowns.player >= 3) {
        this.end(false);
      }
    } else {
      this.knockdowns.opponent++;
      this.addScore(500);
      if (this.knockdowns.opponent >= 3) {
        this.end(true);
      }
    }
    
    // Reset health for next knockdown
    boxer.health = boxer.maxHealth * 0.5;
    boxer.isStunned = true;
    boxer.stunTime = 3;
  }

  private updateAnimations(deltaTime: number): void {
    [this.player, this.opponent].forEach(boxer => {
      // Arm animations
      boxer.leftArmAngle = THREE.MathUtils.lerp(boxer.leftArmAngle, 0, deltaTime * 10);
      boxer.rightArmAngle = THREE.MathUtils.lerp(boxer.rightArmAngle, 0, deltaTime * 10);
      
      const leftGlove = boxer.mesh.getObjectByName('leftGlove') as THREE.Mesh;
      const rightGlove = boxer.mesh.getObjectByName('rightGlove') as THREE.Mesh;
      
      if (leftGlove) {
        leftGlove.position.z = 0.3 + boxer.leftArmAngle * 0.5;
        leftGlove.position.y = 1.3 - boxer.leftArmAngle * 0.2;
      }
      if (rightGlove) {
        rightGlove.position.z = 0.3 + boxer.rightArmAngle * 0.5;
        rightGlove.position.y = 1.3 - boxer.rightArmAngle * 0.2;
      }
      
      // Blocking stance
      if (boxer.isBlocking) {
        if (leftGlove) leftGlove.position.set(-0.2, 1.5, 0.2);
        if (rightGlove) rightGlove.position.set(0.2, 1.5, 0.2);
      }
      
      // Body lean
      boxer.mesh.rotation.z = boxer.bodyLean;
    });
  }

  private regenerateStamina(deltaTime: number): void {
    [this.player, this.opponent].forEach(boxer => {
      if (!boxer.isBlocking && this.gameTime - boxer.lastPunchTime > 0.5) {
        boxer.stamina = Math.min(boxer.maxStamina, boxer.stamina + 10 * deltaTime);
      }
    });
  }

  private endRound(): void {
    this.isRoundActive = false;
    
    if (this.round >= this.maxRounds) {
      // Determine winner by health
      this.end(this.player.health > this.opponent.health);
    } else {
      this.round++;
      setTimeout(() => this.startRound(), 3000);
    }
  }

  public getPlayerHealth(): number { return this.player?.health ?? 0; }
  public getPlayerMaxHealth(): number { return this.player?.maxHealth ?? 100; }
  public getPlayerStamina(): number { return this.player?.stamina ?? 0; }
  public getOpponentHealth(): number { return this.opponent?.health ?? 0; }
  public getOpponentMaxHealth(): number { return this.opponent?.maxHealth ?? 100; }
  public getRound(): number { return this.round; }
  public getMaxRounds(): number { return this.maxRounds; }
  public getRoundTime(): number { return this.roundTime; }
  public getRoundDuration(): number { return this.roundDuration; }
  public getPlayerKnockdowns(): number { return this.knockdowns.player; }
  public getOpponentKnockdowns(): number { return this.knockdowns.opponent; }
  public getCombo(): number { return this.player?.combo ?? 0; }

  protected cleanup(): void {
    this.engine.remove(this.player.mesh);
    this.engine.remove(this.opponent.mesh);
    this.engine.remove(this.ringMesh);
  }
}

export default BoxingGame;
