/**
 * ┌─────────────────────────────────────────────────────────────────────────────┐
 * │ LUCY: SENTINEL PROTOCOL — AI DIRECTOR                                       │
 * │                                                                             │
 * │ Advanced AI system with:                                                    │
 * │ • Personality-driven behaviors                                              │
 * │ • Player skill-based adaptation                                             │
 * │ • Strategic decision making                                                 │
 * │ • Memory and learning systems                                               │
 * └─────────────────────────────────────────────────────────────────────────────┘
 */

import * as THREE from 'three';
import type {
  AIPersonality,
  AIPersonalityConfig,
  AIState,
  AIMemory,
  Player,
  CoverPoint,
  WeaponDefinition,
  AI_PERSONALITIES,
} from './types';
import { AI_PERSONALITIES as PERSONALITIES } from './types';

// ============================================================================
// AI CONTROLLER
// ============================================================================

export interface AIControllerConfig {
  personality: AIPersonality;
  difficultyLevel: 'easy' | 'medium' | 'hard' | 'expert';
  adaptToPlayer: boolean;
  teamCoordination: boolean;
}

export class AIController {
  public state: AIState;
  private player: Player;
  private config: AIControllerConfig;
  
  // Cached calculations
  private _cachedPath: THREE.Vector3[] = [];
  private _pathUpdateTime: number = 0;
  private _visibilityCache: Map<string, boolean> = new Map();
  private _visibilityCacheTime: number = 0;
  
  constructor(player: Player, config: AIControllerConfig) {
    this.player = player;
    this.config = config;
    
    const personality = PERSONALITIES[config.personality];
    const difficultyMultiplier = this.getDifficultyMultiplier(config.difficultyLevel);
    
    this.state = {
      personality,
      currentBehavior: 'patrol',
      targetId: null,
      targetPosition: null,
      moveTarget: null,
      lastDecisionTime: 0,
      reactionTimer: 0,
      difficultyMultiplier,
      memory: this.createEmptyMemory(),
    };
  }
  
  private getDifficultyMultiplier(level: string): number {
    switch (level) {
      case 'easy': return 0.6;
      case 'medium': return 1.0;
      case 'hard': return 1.4;
      case 'expert': return 1.8;
      default: return 1.0;
    }
  }
  
  private createEmptyMemory(): AIMemory {
    return {
      lastSeenPlayerPosition: null,
      lastSeenTime: 0,
      playerMovementPattern: [],
      predictedPosition: null,
      knownCoverPositions: [],
      dangerZones: [],
      teammatePositions: new Map(),
      killCount: 0,
      deathCount: 0,
      damageDealt: 0,
      damageTaken: 0,
    };
  }
  
  // ============================================================================
  // MAIN UPDATE
  // ============================================================================
  
  public update(
    deltaTime: number,
    gameTime: number,
    enemies: Player[],
    coverPoints: CoverPoint[],
    teammates: Player[]
  ): AIDecision {
    const personality = this.state.personality;
    
    // Update reaction timer
    if (this.state.reactionTimer > 0) {
      this.state.reactionTimer -= deltaTime;
    }
    
    // Clear visibility cache periodically
    if (gameTime - this._visibilityCacheTime > 0.5) {
      this._visibilityCache.clear();
      this._visibilityCacheTime = gameTime;
    }
    
    // Find best target
    const target = this.selectTarget(enemies);
    this.state.targetId = target?.id || null;
    
    // Update memory
    if (target) {
      this.updateMemory(target, gameTime);
    }
    
    // Make strategic decision
    if (gameTime - this.state.lastDecisionTime > personality.decisionFrequency) {
      this.makeStrategicDecision(target, coverPoints, teammates, gameTime);
      this.state.lastDecisionTime = gameTime;
    }
    
    // Generate action
    return this.generateAction(target, deltaTime, gameTime);
  }
  
  // ============================================================================
  // TARGET SELECTION
  // ============================================================================
  
  private selectTarget(enemies: Player[]): Player | null {
    const personality = this.state.personality;
    const myPos = this.player.movement.position;
    
    let bestTarget: Player | null = null;
    let bestScore = -Infinity;
    
    for (const enemy of enemies) {
      if (!enemy.isAlive) continue;
      
      const distance = myPos.distanceTo(enemy.movement.position);
      
      // Skip if too far
      if (distance > personality.engagementRange * 2) continue;
      
      // Calculate target score
      let score = 0;
      
      // Distance factor - prefer targets in preferred range
      const distFromPreferred = Math.abs(distance - personality.preferredRange);
      score -= distFromPreferred * 2;
      
      // Low health targets are attractive (aggressive personalities)
      const healthPercent = enemy.stats.health / enemy.stats.maxHealth;
      score += (1 - healthPercent) * personality.aggression * 50;
      
      // Visible targets are much better
      if (this.canSeeTarget(enemy)) {
        score += 100;
      }
      
      // Recent damage dealt to us makes them a priority
      if (this.state.targetId === enemy.id) {
        score += 30; // Prefer current target
      }
      
      if (score > bestScore) {
        bestScore = score;
        bestTarget = enemy;
      }
    }
    
    return bestTarget;
  }
  
  // ============================================================================
  // MEMORY & LEARNING
  // ============================================================================
  
  private updateMemory(target: Player, gameTime: number): void {
    const canSee = this.canSeeTarget(target);
    
    if (canSee) {
      this.state.memory.lastSeenPlayerPosition = target.movement.position.clone();
      this.state.memory.lastSeenTime = gameTime;
      
      // Track movement pattern
      this.state.memory.playerMovementPattern.push(target.movement.position.clone());
      if (this.state.memory.playerMovementPattern.length > 20) {
        this.state.memory.playerMovementPattern.shift();
      }
      
      // Predict movement if personality supports it
      if (this.state.personality.predictsMovesMent && this.state.memory.playerMovementPattern.length >= 3) {
        this.state.memory.predictedPosition = this.predictTargetPosition(target);
      }
    }
    
    this.state.targetPosition = this.state.memory.lastSeenPlayerPosition;
  }
  
  private predictTargetPosition(target: Player): THREE.Vector3 {
    const patterns = this.state.memory.playerMovementPattern;
    if (patterns.length < 3) {
      return target.movement.position.clone();
    }
    
    // Simple velocity extrapolation
    const recent = patterns.slice(-3);
    const velocity = new THREE.Vector3()
      .subVectors(recent[2], recent[0])
      .divideScalar(2);
    
    // Predict 0.5 seconds ahead
    return target.movement.position.clone().add(velocity.multiplyScalar(0.5));
  }
  
  // ============================================================================
  // STRATEGIC DECISIONS
  // ============================================================================
  
  private makeStrategicDecision(
    target: Player | null,
    coverPoints: CoverPoint[],
    teammates: Player[],
    gameTime: number
  ): void {
    const personality = this.state.personality;
    const healthPercent = this.player.stats.health / this.player.stats.maxHealth;
    
    // Check if should retreat
    if (healthPercent < personality.retreatHealthPercent) {
      this.state.currentBehavior = 'retreat';
      this.state.moveTarget = this.findRetreatPosition(coverPoints);
      return;
    }
    
    // No target - patrol or search
    if (!target) {
      const timeSinceSeen = gameTime - this.state.memory.lastSeenTime;
      
      if (this.state.memory.lastSeenPlayerPosition && timeSinceSeen < 10) {
        this.state.currentBehavior = 'search';
        this.state.moveTarget = this.state.memory.lastSeenPlayerPosition.clone();
      } else {
        this.state.currentBehavior = 'patrol';
        this.state.moveTarget = this.getPatrolPoint();
      }
      return;
    }
    
    const canSee = this.canSeeTarget(target);
    const distance = this.player.movement.position.distanceTo(target.movement.position);
    
    // Decide behavior based on personality
    const roll = Math.random();
    
    // Flanking
    if (roll < personality.flanksFrequency && distance > personality.preferredRange * 0.5) {
      this.state.currentBehavior = 'flank';
      this.state.moveTarget = this.calculateFlankPosition(target, coverPoints);
      return;
    }
    
    // Rushing
    if (roll < personality.rushFrequency && canSee && distance > personality.preferredRange * 0.3) {
      this.state.currentBehavior = 'engage';
      this.state.moveTarget = target.movement.position.clone();
      return;
    }
    
    // Using cover
    if (roll < personality.usesCovertFrequency && !this.isInCover(coverPoints)) {
      const nearestCover = this.findCoverTowardsTarget(target, coverPoints);
      if (nearestCover) {
        this.state.currentBehavior = 'hold';
        this.state.moveTarget = nearestCover;
        return;
      }
    }
    
    // Default engage
    if (canSee) {
      this.state.currentBehavior = 'engage';
      if (distance > personality.preferredRange) {
        this.state.moveTarget = this.getMoveTowardsTarget(target);
      } else if (distance < personality.preferredRange * 0.5) {
        this.state.moveTarget = this.getMoveAwayFromTarget(target);
      } else {
        this.state.moveTarget = null; // Stay and fight
      }
    } else {
      this.state.currentBehavior = 'search';
      this.state.moveTarget = this.state.memory.lastSeenPlayerPosition?.clone() || this.getPatrolPoint();
    }
  }
  
  // ============================================================================
  // POSITION FINDING
  // ============================================================================
  
  private findRetreatPosition(coverPoints: CoverPoint[]): THREE.Vector3 {
    const myPos = this.player.movement.position;
    const targetPos = this.state.targetPosition || myPos;
    
    // Move away from target, towards cover
    const awayDir = new THREE.Vector3().subVectors(myPos, targetPos).normalize();
    
    // Find cover in retreat direction
    let bestCover: THREE.Vector3 | null = null;
    let bestScore = -Infinity;
    
    for (const cover of coverPoints) {
      const toCover = new THREE.Vector3().subVectors(cover.position, myPos);
      const alignment = toCover.normalize().dot(awayDir);
      const distance = myPos.distanceTo(cover.position);
      
      const score = alignment * 50 - distance;
      
      if (score > bestScore && distance < 30) {
        bestScore = score;
        bestCover = cover.position.clone();
      }
    }
    
    return bestCover || myPos.clone().add(awayDir.multiplyScalar(15));
  }
  
  private calculateFlankPosition(target: Player, coverPoints: CoverPoint[]): THREE.Vector3 {
    const myPos = this.player.movement.position;
    const targetPos = target.movement.position;
    
    // Calculate perpendicular direction
    const toTarget = new THREE.Vector3().subVectors(targetPos, myPos);
    const perpendicular = new THREE.Vector3(-toTarget.z, 0, toTarget.x).normalize();
    
    // Randomly go left or right
    if (Math.random() > 0.5) {
      perpendicular.negate();
    }
    
    // Calculate flank position
    const flankDistance = this.state.personality.preferredRange * 0.8;
    const flankPos = targetPos.clone().add(perpendicular.multiplyScalar(flankDistance));
    
    // Find cover near flank position if available
    let nearestCover: THREE.Vector3 | null = null;
    let nearestDist = Infinity;
    
    for (const cover of coverPoints) {
      const dist = cover.position.distanceTo(flankPos);
      if (dist < nearestDist && dist < 10) {
        nearestDist = dist;
        nearestCover = cover.position.clone();
      }
    }
    
    return nearestCover || flankPos;
  }
  
  private findCoverTowardsTarget(target: Player, coverPoints: CoverPoint[]): THREE.Vector3 | null {
    const myPos = this.player.movement.position;
    const targetPos = target.movement.position;
    
    let bestCover: THREE.Vector3 | null = null;
    let bestScore = -Infinity;
    
    for (const cover of coverPoints) {
      const toTarget = new THREE.Vector3().subVectors(targetPos, cover.position);
      const fromCover = new THREE.Vector3().subVectors(myPos, cover.position);
      
      // Cover should be between us and target
      const alignment = toTarget.normalize().dot(fromCover.normalize());
      const distToMe = myPos.distanceTo(cover.position);
      const distToTarget = cover.position.distanceTo(targetPos);
      
      // Prefer cover that's close to us but provides line of sight to target
      const score = alignment * 30 - distToMe * 2 + (distToTarget < 30 ? 20 : 0);
      
      if (score > bestScore && distToMe < 20) {
        bestScore = score;
        bestCover = cover.position.clone();
      }
    }
    
    return bestCover;
  }
  
  private getMoveTowardsTarget(target: Player): THREE.Vector3 {
    const myPos = this.player.movement.position;
    const targetPos = target.movement.position;
    const direction = new THREE.Vector3().subVectors(targetPos, myPos).normalize();
    
    const distance = this.state.personality.preferredRange;
    return targetPos.clone().sub(direction.multiplyScalar(distance));
  }
  
  private getMoveAwayFromTarget(target: Player): THREE.Vector3 {
    const myPos = this.player.movement.position;
    const targetPos = target.movement.position;
    const direction = new THREE.Vector3().subVectors(myPos, targetPos).normalize();
    
    return myPos.clone().add(direction.multiplyScalar(5));
  }
  
  private getPatrolPoint(): THREE.Vector3 {
    const myPos = this.player.movement.position;
    
    // Random patrol within area
    const angle = Math.random() * Math.PI * 2;
    const distance = 10 + Math.random() * 20;
    
    return new THREE.Vector3(
      myPos.x + Math.cos(angle) * distance,
      myPos.y,
      myPos.z + Math.sin(angle) * distance
    );
  }
  
  private isInCover(coverPoints: CoverPoint[]): boolean {
    const myPos = this.player.movement.position;
    
    for (const cover of coverPoints) {
      if (myPos.distanceTo(cover.position) < 2) {
        return true;
      }
    }
    
    return false;
  }
  
  // ============================================================================
  // ACTION GENERATION
  // ============================================================================
  
  private generateAction(target: Player | null, deltaTime: number, gameTime: number): AIDecision {
    const decision: AIDecision = {
      moveDirection: new THREE.Vector3(),
      lookDirection: new THREE.Vector3(0, 0, -1),
      shouldFire: false,
      shouldAim: false,
      shouldReload: false,
      shouldSprint: false,
      shouldCrouch: false,
      shouldJump: false,
      useAbility: null,
      throwGrenade: null,
    };
    
    // Movement
    if (this.state.moveTarget) {
      const toTarget = new THREE.Vector3()
        .subVectors(this.state.moveTarget, this.player.movement.position);
      
      if (toTarget.length() > 1) {
        decision.moveDirection.copy(toTarget.normalize());
        
        // Sprint if far from target and not engaging
        if (toTarget.length() > 10 && this.state.currentBehavior !== 'engage') {
          decision.shouldSprint = true;
        }
      }
    }
    
    // Look direction and combat
    if (target && this.state.reactionTimer <= 0) {
      const canSee = this.canSeeTarget(target);
      
      // Calculate aim point
      let aimPoint = target.movement.position.clone();
      aimPoint.y += 1.5; // Head height
      
      // Use predicted position if available
      if (this.state.personality.predictsMovesMent && this.state.memory.predictedPosition) {
        const prediction = this.state.memory.predictedPosition.clone();
        prediction.y += 1.5;
        aimPoint.lerp(prediction, 0.5);
      }
      
      decision.lookDirection.subVectors(aimPoint, this.player.movement.position).normalize();
      
      // Combat actions
      if (canSee) {
        const distance = this.player.movement.position.distanceTo(target.movement.position);
        
        // Should aim
        decision.shouldAim = distance > 10;
        
        // Should fire (with accuracy simulation)
        const weapon = this.player.weapons[this.player.currentWeaponIndex];
        if (weapon && weapon.currentAmmo > 0) {
          const accuracy = this.calculateAccuracy(distance, target);
          decision.shouldFire = Math.random() < accuracy;
        }
        
        // Reload if needed
        if (weapon && weapon.currentAmmo === 0) {
          decision.shouldReload = true;
        }
        
        // Crouch for accuracy in firefights
        if (distance > 15 && this.state.currentBehavior === 'engage') {
          decision.shouldCrouch = Math.random() < 0.3;
        }
      }
      
      // Grenades
      if (this.state.personality.usesGrenades && canSee) {
        const distance = this.player.movement.position.distanceTo(target.movement.position);
        if (distance > 15 && distance < 40 && Math.random() < 0.01) {
          decision.throwGrenade = 'frag';
        }
      }
    } else if (this.state.moveTarget) {
      // Look towards movement target
      decision.lookDirection.copy(decision.moveDirection);
    }
    
    return decision;
  }
  
  private calculateAccuracy(distance: number, target: Player): number {
    const personality = this.state.personality;
    const diffMult = this.state.difficultyMultiplier;
    
    // Base accuracy from personality
    let accuracy = personality.baseAccuracy;
    
    // Add variance
    accuracy += (Math.random() - 0.5) * personality.accuracyVariance * 2;
    
    // Distance penalty
    const distancePenalty = Math.max(0, (distance - 20) * 0.005);
    accuracy -= distancePenalty;
    
    // Movement penalty
    if (target.movement.state === 'sprinting') {
      accuracy -= 0.15;
    } else if (target.movement.state === 'sliding') {
      accuracy -= 0.25;
    }
    
    // Apply difficulty multiplier
    accuracy *= diffMult;
    
    return Math.max(0.05, Math.min(0.95, accuracy));
  }
  
  // ============================================================================
  // VISIBILITY
  // ============================================================================
  
  private canSeeTarget(target: Player): boolean {
    const cacheKey = `${this.player.id}-${target.id}`;
    
    if (this._visibilityCache.has(cacheKey)) {
      return this._visibilityCache.get(cacheKey)!;
    }
    
    // Simple distance and angle check for now
    // In full implementation, would do raycast
    const myPos = this.player.movement.position;
    const targetPos = target.movement.position;
    
    const distance = myPos.distanceTo(targetPos);
    if (distance > this.state.personality.engagementRange * 1.5) {
      this._visibilityCache.set(cacheKey, false);
      return false;
    }
    
    // Could add raycast check here
    const canSee = true; // Placeholder - would use physics raycast
    
    this._visibilityCache.set(cacheKey, canSee);
    return canSee;
  }
  
  // ============================================================================
  // ADAPTATION
  // ============================================================================
  
  public recordKill(): void {
    this.state.memory.killCount++;
    // Could adjust aggression
  }
  
  public recordDeath(): void {
    this.state.memory.deathCount++;
    // Could adjust caution
  }
  
  public recordDamageDealt(amount: number): void {
    this.state.memory.damageDealt += amount;
  }
  
  public recordDamageTaken(amount: number, fromDirection: THREE.Vector3): void {
    this.state.memory.damageTaken += amount;
    this.state.memory.dangerZones.push(fromDirection.clone());
    
    if (this.state.memory.dangerZones.length > 10) {
      this.state.memory.dangerZones.shift();
    }
    
    // Trigger reaction
    const reactionTime = this.state.personality.baseReactionTime +
      (Math.random() - 0.5) * this.state.personality.reactionTimeVariance * 2;
    
    this.state.reactionTimer = Math.max(0, reactionTime / this.state.difficultyMultiplier);
  }
}

// ============================================================================
// AI DECISION OUTPUT
// ============================================================================

export interface AIDecision {
  moveDirection: THREE.Vector3;
  lookDirection: THREE.Vector3;
  shouldFire: boolean;
  shouldAim: boolean;
  shouldReload: boolean;
  shouldSprint: boolean;
  shouldCrouch: boolean;
  shouldJump: boolean;
  useAbility: string | null;
  throwGrenade: 'frag' | 'flash' | 'smoke' | null;
}

// ============================================================================
// AI DIRECTOR - MANAGES ALL AI IN MATCH
// ============================================================================

export class AIDirector {
  private controllers: Map<string, AIController> = new Map();
  private adaptiveDifficulty: AdaptiveDifficultySystem;
  
  constructor() {
    this.adaptiveDifficulty = new AdaptiveDifficultySystem();
  }
  
  public createAI(player: Player, config: AIControllerConfig): AIController {
    const controller = new AIController(player, config);
    this.controllers.set(player.id, controller);
    return controller;
  }
  
  public removeAI(playerId: string): void {
    this.controllers.delete(playerId);
  }
  
  public update(
    deltaTime: number,
    gameTime: number,
    allPlayers: Player[],
    coverPoints: CoverPoint[]
  ): Map<string, AIDecision> {
    const decisions = new Map<string, AIDecision>();
    
    this.controllers.forEach((controller, playerId) => {
      const player = allPlayers.find(p => p.id === playerId);
      if (!player || !player.isAlive) return;
      
      // Get enemies and teammates
      const enemies = allPlayers.filter(p => 
        p.id !== playerId && 
        p.team !== player.team && 
        p.isAlive
      );
      
      const teammates = allPlayers.filter(p =>
        p.id !== playerId &&
        p.team === player.team &&
        p.isAlive
      );
      
      const decision = controller.update(deltaTime, gameTime, enemies, coverPoints, teammates);
      decisions.set(playerId, decision);
    });
    
    return decisions;
  }
  
  public recordPlayerEvent(event: PlayerEvent): void {
    this.adaptiveDifficulty.recordEvent(event);
    
    // Notify relevant AI controllers
    if (event.type === 'kill') {
      const killer = this.controllers.get(event.playerId);
      killer?.recordKill();
      
      const victim = this.controllers.get(event.targetId || '');
      victim?.recordDeath();
    }
    
    if (event.type === 'damage') {
      const dealer = this.controllers.get(event.playerId);
      dealer?.recordDamageDealt(event.amount || 0);
      
      const victim = this.controllers.get(event.targetId || '');
      if (event.direction) {
        victim?.recordDamageTaken(event.amount || 0, event.direction);
      }
    }
  }
  
  public getDifficultyMultiplier(): number {
    return this.adaptiveDifficulty.getMultiplier();
  }
  
  public dispose(): void {
    this.controllers.clear();
  }
}

// ============================================================================
// ADAPTIVE DIFFICULTY
// ============================================================================

interface PlayerEvent {
  type: 'kill' | 'death' | 'damage' | 'headshot';
  playerId: string;
  targetId?: string;
  amount?: number;
  direction?: THREE.Vector3;
  isPlayer: boolean;
}

class AdaptiveDifficultySystem {
  private playerKills: number = 0;
  private playerDeaths: number = 0;
  private playerDamageDealt: number = 0;
  private playerDamageTaken: number = 0;
  private recentPerformance: number[] = [];
  private readonly historySize = 30;
  
  public recordEvent(event: PlayerEvent): void {
    if (!event.isPlayer) return;
    
    switch (event.type) {
      case 'kill':
        this.playerKills++;
        this.recentPerformance.push(1);
        break;
      case 'death':
        this.playerDeaths++;
        this.recentPerformance.push(-1);
        break;
      case 'damage':
        this.playerDamageDealt += event.amount || 0;
        this.recentPerformance.push(0.1);
        break;
      case 'headshot':
        this.recentPerformance.push(0.5);
        break;
    }
    
    while (this.recentPerformance.length > this.historySize) {
      this.recentPerformance.shift();
    }
  }
  
  public getMultiplier(): number {
    if (this.recentPerformance.length < 5) return 1.0;
    
    const avgPerformance = this.recentPerformance.reduce((a, b) => a + b, 0) / 
      this.recentPerformance.length;
    
    // Scale from 0.7 to 1.3 based on performance
    // Good performance = harder AI
    // Poor performance = easier AI
    return 1.0 + avgPerformance * 0.3;
  }
  
  public reset(): void {
    this.playerKills = 0;
    this.playerDeaths = 0;
    this.playerDamageDealt = 0;
    this.playerDamageTaken = 0;
    this.recentPerformance = [];
  }
}

export default AIDirector;
