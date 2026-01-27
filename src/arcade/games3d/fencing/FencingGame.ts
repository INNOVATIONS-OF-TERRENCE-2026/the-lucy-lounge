/**
 * ┌─────────────────────────────────────────────────────────────────────────────┐
 * │ LUCY ARCADE — 3D FENCING                                                   │
 * │                                                                             │
 * │ Olympic fencing with precise combat mechanics, parries, ripostes,          │
 * │ and AI opponents with behavior trees                                       │
 * └─────────────────────────────────────────────────────────────────────────────┘
 */

import * as THREE from 'three';
import {
  Game3DBase,
  type Game3DConfig,
  type InputState,
} from '../../engine3d';
import { AdaptiveDifficulty } from '../../engine3d/core/AIBehaviorTree';

type FencingAction = 'idle' | 'advance' | 'retreat' | 'lunge' | 'parry' | 'riposte' | 'attack' | 'hit' | 'recovery';

interface Fencer {
  mesh: THREE.Group;
  position: THREE.Vector3;
  swordMesh: THREE.Mesh;
  
  // State
  action: FencingAction;
  actionTimer: number;
  isParrying: boolean;
  isVulnerable: boolean;
  
  // Combat
  health: number;
  maxHealth: number;
  stamina: number;
  maxStamina: number;
  
  // Scoring
  touches: number;
  
  team: 'player' | 'opponent';
}

export class FencingGame extends Game3DBase {
  private player!: Fencer;
  private opponent!: Fencer;
  
  // Piste (fencing strip)
  private pisteLength: number = 14;
  private pisteWidth: number = 2;
  
  // Game state
  private bout: number = 1;
  private maxBouts: number = 3;
  private touchesToWin: number = 5;
  private isRoundActive: boolean = false;
  private roundTimer: number = 0;
  private roundDuration: number = 180;
  
  // AI
  private aiDifficulty: AdaptiveDifficulty;
  private aiNextAction: number = 0;

  constructor(container: HTMLElement, config?: Game3DConfig) {
    super(container, {
      ...config,
      engineConfig: {
        shadows: true,
        bloom: true,
        bloomStrength: 0.4,
        ...config?.engineConfig,
      },
    });
    
    this.aiDifficulty = new AdaptiveDifficulty('medium');
  }

  protected async loadAssets(): Promise<void> {}

  protected initScene(): void {
    this.setupLighting();
    this.createPiste();
    this.createFencers();
    
    this.engine.camera.position.set(0, 2, 8);
    this.engine.camera.lookAt(0, 1, 0);
    
    this.createGradientSkybox(0x1a1a2e, 0x0a0a1a);
    this.startRound();
  }

  private setupLighting(): void {
    this.engine.addAmbientLight(0xffffff, 0.4);
    this.engine.addDirectionalLight(0xffffff, 0.8, new THREE.Vector3(10, 20, 10), true);
    this.engine.addSpotLight(0xffffff, 1, new THREE.Vector3(0, 5, 0), new THREE.Vector3(0, 0, 0), Math.PI / 4, 0.5, true);
  }

  private createPiste(): void {
    // Piste surface
    const pisteGeo = new THREE.BoxGeometry(this.pisteWidth, 0.05, this.pisteLength);
    const pisteMat = new THREE.MeshStandardMaterial({ color: 0x333333, roughness: 0.8 });
    const piste = new THREE.Mesh(pisteGeo, pisteMat);
    piste.receiveShadow = true;
    this.engine.add(piste);
    
    // Center line
    const centerGeo = new THREE.PlaneGeometry(this.pisteWidth, 0.05);
    const centerMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const center = new THREE.Mesh(centerGeo, centerMat);
    center.rotation.x = -Math.PI / 2;
    center.position.y = 0.03;
    this.engine.add(center);
    
    // En garde lines
    [-2, 2].forEach(z => {
      const lineGeo = new THREE.PlaneGeometry(this.pisteWidth, 0.03);
      const line = new THREE.Mesh(lineGeo, centerMat);
      line.rotation.x = -Math.PI / 2;
      line.position.set(0, 0.03, z);
      this.engine.add(line);
    });
    
    // Warning lines
    [-6, 6].forEach(z => {
      const lineGeo = new THREE.PlaneGeometry(this.pisteWidth, 0.03);
      const lineMat = new THREE.MeshBasicMaterial({ color: 0xff0000 });
      const line = new THREE.Mesh(lineGeo, lineMat);
      line.rotation.x = -Math.PI / 2;
      line.position.set(0, 0.03, z);
      this.engine.add(line);
    });
    
    // End lines
    [-7, 7].forEach(z => {
      const lineGeo = new THREE.PlaneGeometry(this.pisteWidth, 0.05);
      const lineMat = new THREE.MeshBasicMaterial({ color: 0xff0000 });
      const line = new THREE.Mesh(lineGeo, lineMat);
      line.rotation.x = -Math.PI / 2;
      line.position.set(0, 0.03, z);
      this.engine.add(line);
    });
  }

  private createFencers(): void {
    this.player = this.createFencer(new THREE.Vector3(0, 0, 3), 'player');
    this.opponent = this.createFencer(new THREE.Vector3(0, 0, -3), 'opponent');
    this.opponent.mesh.rotation.y = Math.PI;
  }

  private createFencer(position: THREE.Vector3, team: 'player' | 'opponent'): Fencer {
    const group = new THREE.Group();
    const color = team === 'player' ? 0xffffff : 0x333333;
    
    // Body (fencing jacket)
    const bodyGeo = new THREE.CapsuleGeometry(0.2, 0.5, 4, 8);
    const bodyMat = new THREE.MeshStandardMaterial({ color });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = 0.9;
    body.castShadow = true;
    group.add(body);
    
    // Head (mask)
    const headGeo = new THREE.SphereGeometry(0.15, 16, 16);
    const headMat = new THREE.MeshStandardMaterial({ color: 0x222222, metalness: 0.5 });
    const head = new THREE.Mesh(headGeo, headMat);
    head.position.y = 1.5;
    group.add(head);
    
    // Mask mesh
    const maskGeo = new THREE.SphereGeometry(0.16, 8, 8, 0, Math.PI);
    const maskMat = new THREE.MeshStandardMaterial({ 
      color: 0x444444, 
      wireframe: true,
      transparent: true,
      opacity: 0.8,
    });
    const mask = new THREE.Mesh(maskGeo, maskMat);
    mask.position.y = 1.5;
    mask.rotation.y = team === 'player' ? 0 : Math.PI;
    group.add(mask);
    
    // Sword arm
    const armGeo = new THREE.CapsuleGeometry(0.05, 0.4, 4, 8);
    const armMat = new THREE.MeshStandardMaterial({ color });
    const arm = new THREE.Mesh(armGeo, armMat);
    arm.position.set(0.3, 1, 0.2);
    arm.rotation.x = -0.3;
    arm.name = 'swordArm';
    group.add(arm);
    
    // Sword (épée)
    const swordGroup = new THREE.Group();
    
    // Guard
    const guardGeo = new THREE.TorusGeometry(0.08, 0.01, 8, 16);
    const guardMat = new THREE.MeshStandardMaterial({ color: 0xcccccc, metalness: 0.9 });
    const guard = new THREE.Mesh(guardGeo, guardMat);
    guard.rotation.x = Math.PI / 2;
    swordGroup.add(guard);
    
    // Handle
    const handleGeo = new THREE.CylinderGeometry(0.015, 0.015, 0.15, 8);
    const handleMat = new THREE.MeshStandardMaterial({ color: 0x333333 });
    const handle = new THREE.Mesh(handleGeo, handleMat);
    handle.position.y = -0.075;
    swordGroup.add(handle);
    
    // Blade
    const bladeGeo = new THREE.CylinderGeometry(0.005, 0.003, 0.9, 8);
    const bladeMat = new THREE.MeshStandardMaterial({ color: 0xcccccc, metalness: 0.9 });
    const blade = new THREE.Mesh(bladeGeo, bladeMat);
    blade.position.y = 0.45;
    swordGroup.add(blade);
    
    // Point
    const pointGeo = new THREE.SphereGeometry(0.008, 8, 8);
    const point = new THREE.Mesh(pointGeo, bladeMat);
    point.position.y = 0.9;
    point.name = 'point';
    swordGroup.add(point);
    
    swordGroup.position.set(0.35, 1.1, 0.5);
    swordGroup.rotation.x = -Math.PI / 6;
    swordGroup.name = 'sword';
    group.add(swordGroup);
    
    group.position.copy(position);
    this.engine.add(group);
    
    return {
      mesh: group,
      position: position.clone(),
      swordMesh: swordGroup as any,
      action: 'idle',
      actionTimer: 0,
      isParrying: false,
      isVulnerable: false,
      health: 100,
      maxHealth: 100,
      stamina: 100,
      maxStamina: 100,
      touches: 0,
      team,
    };
  }

  private startRound(): void {
    this.isRoundActive = true;
    this.roundTimer = 0;
    
    // Reset positions
    this.player.position.set(0, 0, 3);
    this.player.mesh.position.copy(this.player.position);
    this.opponent.position.set(0, 0, -3);
    this.opponent.mesh.position.copy(this.opponent.position);
    
    // Reset states
    [this.player, this.opponent].forEach(fencer => {
      fencer.action = 'idle';
      fencer.actionTimer = 0;
      fencer.isParrying = false;
      fencer.isVulnerable = false;
      fencer.stamina = fencer.maxStamina;
    });
  }

  protected update(deltaTime: number, input: InputState): void {
    if (!this.isRoundActive) return;
    
    this.roundTimer += deltaTime;
    
    if (this.roundTimer >= this.roundDuration) {
      this.endRound();
      return;
    }
    
    this.updatePlayer(deltaTime, input);
    this.updateOpponent(deltaTime);
    this.updateAnimations(deltaTime);
    this.regenerateStamina(deltaTime);
    this.checkTouch();
    
    // Update camera
    const midpoint = this.player.position.clone().add(this.opponent.position).multiplyScalar(0.5);
    this.engine.camera.position.lerp(new THREE.Vector3(0, 2, 8), 0.05);
    this.engine.camera.lookAt(midpoint.x, 1, midpoint.z);
  }

  protected fixedUpdate(fixedDeltaTime: number): void {}

  private updatePlayer(deltaTime: number, input: InputState): void {
    const player = this.player;
    
    if (player.actionTimer > 0) {
      player.actionTimer -= deltaTime;
      return;
    }
    
    player.action = 'idle';
    player.isParrying = false;
    player.isVulnerable = false;
    
    // Movement
    const moveSpeed = 3;
    if (input.virtual.moveY > 0 && player.position.z > -this.pisteLength / 2 + 1) {
      player.position.z -= moveSpeed * deltaTime;
      player.action = 'advance';
    }
    if (input.virtual.moveY < 0 && player.position.z < this.pisteLength / 2 - 1) {
      player.position.z += moveSpeed * deltaTime;
      player.action = 'retreat';
    }
    
    player.mesh.position.copy(player.position);
    
    // Actions
    if (input.keysJustPressed.has('KeyJ') && player.stamina >= 20) {
      // Quick attack
      player.action = 'attack';
      player.actionTimer = 0.3;
      player.stamina -= 20;
      player.isVulnerable = true;
    }
    
    if (input.keysJustPressed.has('KeyK') && player.stamina >= 30) {
      // Lunge
      player.action = 'lunge';
      player.actionTimer = 0.5;
      player.stamina -= 30;
      player.position.z -= 1.5;
      player.mesh.position.copy(player.position);
    }
    
    if (input.keys.has('KeyL')) {
      // Parry
      player.action = 'parry';
      player.isParrying = true;
    }
    
    if (input.keysJustPressed.has('KeyU') && player.stamina >= 25) {
      // Riposte (counter after parry)
      player.action = 'riposte';
      player.actionTimer = 0.4;
      player.stamina -= 25;
    }
  }

  private updateOpponent(deltaTime: number): void {
    const opponent = this.opponent;
    const difficulty = this.aiDifficulty.getAdjustedConfig();
    
    if (opponent.actionTimer > 0) {
      opponent.actionTimer -= deltaTime;
      return;
    }
    
    opponent.action = 'idle';
    opponent.isParrying = false;
    opponent.isVulnerable = false;
    
    this.aiNextAction -= deltaTime;
    
    if (this.aiNextAction <= 0) {
      const distance = Math.abs(this.player.position.z - opponent.position.z);
      
      // AI decision making
      if (distance < 2) {
        // Close range - attack or parry
        if (this.player.action === 'attack' || this.player.action === 'lunge') {
          // Try to parry
          if (Math.random() < difficulty.aiAccuracy) {
            opponent.action = 'parry';
            opponent.isParrying = true;
            this.aiNextAction = 0.3;
          }
        } else if (Math.random() < difficulty.aiAggression && opponent.stamina >= 20) {
          // Attack
          opponent.action = 'attack';
          opponent.actionTimer = 0.3;
          opponent.stamina -= 20;
          opponent.isVulnerable = true;
        }
      } else if (distance < 3.5) {
        // Medium range - lunge or advance
        if (Math.random() < difficulty.aiAggression * 0.5 && opponent.stamina >= 30) {
          opponent.action = 'lunge';
          opponent.actionTimer = 0.5;
          opponent.stamina -= 30;
          opponent.position.z += 1.5;
          opponent.mesh.position.copy(opponent.position);
        } else {
          opponent.position.z += 2 * deltaTime;
          opponent.action = 'advance';
        }
      } else {
        // Far - advance
        opponent.position.z += 2 * deltaTime;
        opponent.action = 'advance';
      }
      
      this.aiNextAction = difficulty.aiReactionTime + Math.random() * 0.2;
    }
    
    // Clamp position
    opponent.position.z = THREE.MathUtils.clamp(
      opponent.position.z,
      -this.pisteLength / 2 + 1,
      this.pisteLength / 2 - 1
    );
    opponent.mesh.position.copy(opponent.position);
  }

  private updateAnimations(deltaTime: number): void {
    [this.player, this.opponent].forEach(fencer => {
      const sword = fencer.mesh.getObjectByName('sword') as THREE.Group;
      if (!sword) return;
      
      switch (fencer.action) {
        case 'attack':
        case 'lunge':
          sword.rotation.x = -Math.PI / 2;
          sword.position.z = 1;
          break;
        case 'parry':
          sword.rotation.x = 0;
          sword.rotation.z = 0.5;
          sword.position.z = 0.3;
          break;
        case 'riposte':
          sword.rotation.x = -Math.PI / 3;
          sword.position.z = 0.8;
          break;
        default:
          sword.rotation.x = THREE.MathUtils.lerp(sword.rotation.x, -Math.PI / 6, deltaTime * 5);
          sword.rotation.z = THREE.MathUtils.lerp(sword.rotation.z, 0, deltaTime * 5);
          sword.position.z = THREE.MathUtils.lerp(sword.position.z, 0.5, deltaTime * 5);
      }
    });
  }

  private regenerateStamina(deltaTime: number): void {
    [this.player, this.opponent].forEach(fencer => {
      if (fencer.action === 'idle' || fencer.action === 'advance' || fencer.action === 'retreat') {
        fencer.stamina = Math.min(fencer.maxStamina, fencer.stamina + 15 * deltaTime);
      }
    });
  }

  private checkTouch(): void {
    const distance = Math.abs(this.player.position.z - this.opponent.position.z);
    
    // Player attacking opponent
    if ((this.player.action === 'attack' || this.player.action === 'lunge' || this.player.action === 'riposte') &&
        distance < 2 && this.player.actionTimer > 0.1 && this.player.actionTimer < 0.25) {
      if (this.opponent.isParrying) {
        // Parried!
        this.player.action = 'recovery';
        this.player.actionTimer = 0.5;
        this.player.isVulnerable = true;
      } else {
        // Touch!
        this.scoreTouch('player');
      }
    }
    
    // Opponent attacking player
    if ((this.opponent.action === 'attack' || this.opponent.action === 'lunge' || this.opponent.action === 'riposte') &&
        distance < 2 && this.opponent.actionTimer > 0.1 && this.opponent.actionTimer < 0.25) {
      if (this.player.isParrying) {
        // Parried!
        this.opponent.action = 'recovery';
        this.opponent.actionTimer = 0.5;
        this.opponent.isVulnerable = true;
      } else {
        // Touch!
        this.scoreTouch('opponent');
      }
    }
  }

  private scoreTouch(scorer: 'player' | 'opponent'): void {
    if (scorer === 'player') {
      this.player.touches++;
      this.addScore(10);
      this.aiDifficulty.recordPlayerEvent('kill');
    } else {
      this.opponent.touches++;
      this.aiDifficulty.recordPlayerEvent('death');
    }
    
    // Reset positions
    this.player.position.set(0, 0, 3);
    this.player.mesh.position.copy(this.player.position);
    this.opponent.position.set(0, 0, -3);
    this.opponent.mesh.position.copy(this.opponent.position);
    
    // Check for bout win
    if (this.player.touches >= this.touchesToWin || this.opponent.touches >= this.touchesToWin) {
      this.endRound();
    }
  }

  private endRound(): void {
    this.isRoundActive = false;
    
    const playerWon = this.player.touches > this.opponent.touches;
    
    if (this.bout >= this.maxBouts) {
      this.end(playerWon);
    } else {
      this.bout++;
      this.player.touches = 0;
      this.opponent.touches = 0;
      setTimeout(() => this.startRound(), 2000);
    }
  }

  public getPlayerTouches(): number { return this.player?.touches ?? 0; }
  public getOpponentTouches(): number { return this.opponent?.touches ?? 0; }
  public getPlayerStamina(): number { return this.player?.stamina ?? 0; }
  public getBout(): number { return this.bout; }
  public getMaxBouts(): number { return this.maxBouts; }
  public getTouchesToWin(): number { return this.touchesToWin; }
  public getRoundTime(): number { return this.roundTimer; }
  public getRoundDuration(): number { return this.roundDuration; }
  public getPlayerAction(): FencingAction { return this.player?.action ?? 'idle'; }

  protected cleanup(): void {
    this.engine.remove(this.player.mesh);
    this.engine.remove(this.opponent.mesh);
  }
}

export default FencingGame;
