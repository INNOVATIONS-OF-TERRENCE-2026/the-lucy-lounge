/**
 * ┌─────────────────────────────────────────────────────────────────────────────┐
 * │ LUCY ARCADE — AI BEHAVIOR TREE SYSTEM                                      │
 * │                                                                             │
 * │ Professional-grade AI with behavior trees, blackboards,                    │
 * │ and adaptive difficulty for console-quality gameplay                       │
 * └─────────────────────────────────────────────────────────────────────────────┘
 */

import * as THREE from 'three';

// ============================================================================
// TYPES
// ============================================================================

export type NodeStatus = 'success' | 'failure' | 'running';

export interface BTContext {
  agent: AIAgent;
  blackboard: Blackboard;
  deltaTime: number;
  gameTime: number;
}

export interface AIAgent {
  id: string;
  position: THREE.Vector3;
  rotation: THREE.Euler;
  velocity: THREE.Vector3;
  health: number;
  maxHealth: number;
  target: THREE.Vector3 | null;
  enemy: AIAgent | null;
  state: string;
  data: Record<string, any>;
  
  // Movement
  moveTo: (position: THREE.Vector3) => void;
  lookAt: (position: THREE.Vector3) => void;
  stop: () => void;
  
  // Actions
  attack: () => void;
  defend: () => void;
  reload: () => void;
  useAbility: (ability: string) => void;
  
  // Queries
  canSee: (target: THREE.Vector3) => boolean;
  getDistanceTo: (target: THREE.Vector3) => number;
  isInRange: (target: THREE.Vector3, range: number) => boolean;
}

// ============================================================================
// BLACKBOARD
// ============================================================================

export class Blackboard {
  private data: Map<string, any> = new Map();
  private timestamps: Map<string, number> = new Map();

  public set(key: string, value: any): void {
    this.data.set(key, value);
    this.timestamps.set(key, performance.now());
  }

  public get<T>(key: string, defaultValue?: T): T | undefined {
    return this.data.has(key) ? this.data.get(key) : defaultValue;
  }

  public has(key: string): boolean {
    return this.data.has(key);
  }

  public delete(key: string): void {
    this.data.delete(key);
    this.timestamps.delete(key);
  }

  public clear(): void {
    this.data.clear();
    this.timestamps.clear();
  }

  public getAge(key: string): number {
    const timestamp = this.timestamps.get(key);
    return timestamp ? performance.now() - timestamp : Infinity;
  }

  public isStale(key: string, maxAge: number): boolean {
    return this.getAge(key) > maxAge;
  }
}

// ============================================================================
// BASE NODE
// ============================================================================

export abstract class BTNode {
  protected name: string;

  constructor(name: string = 'BTNode') {
    this.name = name;
  }

  public abstract tick(context: BTContext): NodeStatus;

  public getName(): string {
    return this.name;
  }
}

// ============================================================================
// COMPOSITE NODES
// ============================================================================

/**
 * Sequence - Runs children in order until one fails
 */
export class Sequence extends BTNode {
  private children: BTNode[];
  private currentIndex: number = 0;

  constructor(name: string, children: BTNode[]) {
    super(name);
    this.children = children;
  }

  public tick(context: BTContext): NodeStatus {
    while (this.currentIndex < this.children.length) {
      const status = this.children[this.currentIndex].tick(context);
      
      if (status === 'running') {
        return 'running';
      }
      
      if (status === 'failure') {
        this.currentIndex = 0;
        return 'failure';
      }
      
      this.currentIndex++;
    }
    
    this.currentIndex = 0;
    return 'success';
  }
}

/**
 * Selector - Runs children until one succeeds
 */
export class Selector extends BTNode {
  private children: BTNode[];
  private currentIndex: number = 0;

  constructor(name: string, children: BTNode[]) {
    super(name);
    this.children = children;
  }

  public tick(context: BTContext): NodeStatus {
    while (this.currentIndex < this.children.length) {
      const status = this.children[this.currentIndex].tick(context);
      
      if (status === 'running') {
        return 'running';
      }
      
      if (status === 'success') {
        this.currentIndex = 0;
        return 'success';
      }
      
      this.currentIndex++;
    }
    
    this.currentIndex = 0;
    return 'failure';
  }
}

/**
 * Parallel - Runs all children simultaneously
 */
export class Parallel extends BTNode {
  private children: BTNode[];
  private successThreshold: number;
  private failureThreshold: number;

  constructor(
    name: string,
    children: BTNode[],
    successThreshold: number = -1, // -1 means all must succeed
    failureThreshold: number = 1
  ) {
    super(name);
    this.children = children;
    this.successThreshold = successThreshold === -1 ? children.length : successThreshold;
    this.failureThreshold = failureThreshold;
  }

  public tick(context: BTContext): NodeStatus {
    let successCount = 0;
    let failureCount = 0;
    let runningCount = 0;
    
    for (const child of this.children) {
      const status = child.tick(context);
      
      switch (status) {
        case 'success':
          successCount++;
          break;
        case 'failure':
          failureCount++;
          break;
        case 'running':
          runningCount++;
          break;
      }
    }
    
    if (failureCount >= this.failureThreshold) {
      return 'failure';
    }
    
    if (successCount >= this.successThreshold) {
      return 'success';
    }
    
    return 'running';
  }
}

/**
 * RandomSelector - Randomly selects a child to run
 */
export class RandomSelector extends BTNode {
  private children: BTNode[];
  private weights: number[];

  constructor(name: string, children: BTNode[], weights?: number[]) {
    super(name);
    this.children = children;
    this.weights = weights || children.map(() => 1);
  }

  public tick(context: BTContext): NodeStatus {
    const totalWeight = this.weights.reduce((a, b) => a + b, 0);
    let random = Math.random() * totalWeight;
    
    for (let i = 0; i < this.children.length; i++) {
      random -= this.weights[i];
      if (random <= 0) {
        return this.children[i].tick(context);
      }
    }
    
    return this.children[this.children.length - 1].tick(context);
  }
}

// ============================================================================
// DECORATOR NODES
// ============================================================================

/**
 * Inverter - Inverts the result of its child
 */
export class Inverter extends BTNode {
  private child: BTNode;

  constructor(name: string, child: BTNode) {
    super(name);
    this.child = child;
  }

  public tick(context: BTContext): NodeStatus {
    const status = this.child.tick(context);
    
    if (status === 'success') return 'failure';
    if (status === 'failure') return 'success';
    return 'running';
  }
}

/**
 * Repeater - Repeats its child N times or until failure
 */
export class Repeater extends BTNode {
  private child: BTNode;
  private times: number;
  private currentCount: number = 0;
  private untilFail: boolean;

  constructor(name: string, child: BTNode, times: number = -1, untilFail: boolean = false) {
    super(name);
    this.child = child;
    this.times = times;
    this.untilFail = untilFail;
  }

  public tick(context: BTContext): NodeStatus {
    while (this.times === -1 || this.currentCount < this.times) {
      const status = this.child.tick(context);
      
      if (status === 'running') {
        return 'running';
      }
      
      if (status === 'failure' && this.untilFail) {
        this.currentCount = 0;
        return 'success';
      }
      
      if (status === 'failure') {
        this.currentCount = 0;
        return 'failure';
      }
      
      this.currentCount++;
    }
    
    this.currentCount = 0;
    return 'success';
  }
}

/**
 * Succeeder - Always returns success
 */
export class Succeeder extends BTNode {
  private child: BTNode;

  constructor(name: string, child: BTNode) {
    super(name);
    this.child = child;
  }

  public tick(context: BTContext): NodeStatus {
    this.child.tick(context);
    return 'success';
  }
}

/**
 * Cooldown - Prevents execution for a duration after success
 */
export class Cooldown extends BTNode {
  private child: BTNode;
  private cooldownTime: number;
  private lastSuccessTime: number = -Infinity;

  constructor(name: string, child: BTNode, cooldownTime: number) {
    super(name);
    this.child = child;
    this.cooldownTime = cooldownTime;
  }

  public tick(context: BTContext): NodeStatus {
    if (context.gameTime - this.lastSuccessTime < this.cooldownTime) {
      return 'failure';
    }
    
    const status = this.child.tick(context);
    
    if (status === 'success') {
      this.lastSuccessTime = context.gameTime;
    }
    
    return status;
  }
}

/**
 * TimeLimit - Fails if child takes too long
 */
export class TimeLimit extends BTNode {
  private child: BTNode;
  private timeLimit: number;
  private startTime: number = -1;

  constructor(name: string, child: BTNode, timeLimit: number) {
    super(name);
    this.child = child;
    this.timeLimit = timeLimit;
  }

  public tick(context: BTContext): NodeStatus {
    if (this.startTime < 0) {
      this.startTime = context.gameTime;
    }
    
    if (context.gameTime - this.startTime > this.timeLimit) {
      this.startTime = -1;
      return 'failure';
    }
    
    const status = this.child.tick(context);
    
    if (status !== 'running') {
      this.startTime = -1;
    }
    
    return status;
  }
}

// ============================================================================
// LEAF NODES - CONDITIONS
// ============================================================================

export class Condition extends BTNode {
  private predicate: (context: BTContext) => boolean;

  constructor(name: string, predicate: (context: BTContext) => boolean) {
    super(name);
    this.predicate = predicate;
  }

  public tick(context: BTContext): NodeStatus {
    return this.predicate(context) ? 'success' : 'failure';
  }
}

// Common conditions
export const Conditions = {
  hasTarget: () => new Condition('HasTarget', (ctx) => ctx.agent.target !== null),
  
  hasEnemy: () => new Condition('HasEnemy', (ctx) => ctx.agent.enemy !== null),
  
  canSeeEnemy: () => new Condition('CanSeeEnemy', (ctx) => 
    ctx.agent.enemy !== null && ctx.agent.canSee(ctx.agent.enemy.position)
  ),
  
  isInRange: (range: number) => new Condition(`IsInRange(${range})`, (ctx) =>
    ctx.agent.enemy !== null && ctx.agent.isInRange(ctx.agent.enemy.position, range)
  ),
  
  healthAbove: (percent: number) => new Condition(`HealthAbove(${percent})`, (ctx) =>
    ctx.agent.health / ctx.agent.maxHealth > percent
  ),
  
  healthBelow: (percent: number) => new Condition(`HealthBelow(${percent})`, (ctx) =>
    ctx.agent.health / ctx.agent.maxHealth < percent
  ),
  
  blackboardHas: (key: string) => new Condition(`BB.Has(${key})`, (ctx) =>
    ctx.blackboard.has(key)
  ),
  
  blackboardEquals: (key: string, value: any) => new Condition(`BB.Equals(${key})`, (ctx) =>
    ctx.blackboard.get(key) === value
  ),
  
  random: (chance: number) => new Condition(`Random(${chance})`, () =>
    Math.random() < chance
  ),
};

// ============================================================================
// LEAF NODES - ACTIONS
// ============================================================================

export class Action extends BTNode {
  private action: (context: BTContext) => NodeStatus;

  constructor(name: string, action: (context: BTContext) => NodeStatus) {
    super(name);
    this.action = action;
  }

  public tick(context: BTContext): NodeStatus {
    return this.action(context);
  }
}

// Common actions
export const Actions = {
  moveTo: (getTarget: (ctx: BTContext) => THREE.Vector3 | null) => 
    new Action('MoveTo', (ctx) => {
      const target = getTarget(ctx);
      if (!target) return 'failure';
      
      ctx.agent.moveTo(target);
      
      const distance = ctx.agent.getDistanceTo(target);
      return distance < 1 ? 'success' : 'running';
    }),
  
  moveToEnemy: () => new Action('MoveToEnemy', (ctx) => {
    if (!ctx.agent.enemy) return 'failure';
    
    ctx.agent.moveTo(ctx.agent.enemy.position);
    
    const distance = ctx.agent.getDistanceTo(ctx.agent.enemy.position);
    return distance < 2 ? 'success' : 'running';
  }),
  
  attack: () => new Action('Attack', (ctx) => {
    ctx.agent.attack();
    return 'success';
  }),
  
  defend: () => new Action('Defend', (ctx) => {
    ctx.agent.defend();
    return 'success';
  }),
  
  reload: () => new Action('Reload', (ctx) => {
    ctx.agent.reload();
    return 'success';
  }),
  
  lookAtEnemy: () => new Action('LookAtEnemy', (ctx) => {
    if (!ctx.agent.enemy) return 'failure';
    ctx.agent.lookAt(ctx.agent.enemy.position);
    return 'success';
  }),
  
  stop: () => new Action('Stop', (ctx) => {
    ctx.agent.stop();
    return 'success';
  }),
  
  wait: (duration: number) => {
    let startTime = -1;
    return new Action(`Wait(${duration})`, (ctx) => {
      if (startTime < 0) startTime = ctx.gameTime;
      
      if (ctx.gameTime - startTime >= duration) {
        startTime = -1;
        return 'success';
      }
      
      return 'running';
    });
  },
  
  setBlackboard: (key: string, getValue: (ctx: BTContext) => any) =>
    new Action(`SetBB(${key})`, (ctx) => {
      ctx.blackboard.set(key, getValue(ctx));
      return 'success';
    }),
  
  setState: (state: string) => new Action(`SetState(${state})`, (ctx) => {
    ctx.agent.state = state;
    return 'success';
  }),
  
  log: (message: string) => new Action(`Log`, (ctx) => {
    console.log(`[AI ${ctx.agent.id}] ${message}`);
    return 'success';
  }),
};

// ============================================================================
// BEHAVIOR TREE
// ============================================================================

export class BehaviorTree {
  private root: BTNode;
  private blackboard: Blackboard;

  constructor(root: BTNode) {
    this.root = root;
    this.blackboard = new Blackboard();
  }

  public tick(agent: AIAgent, deltaTime: number, gameTime: number): NodeStatus {
    const context: BTContext = {
      agent,
      blackboard: this.blackboard,
      deltaTime,
      gameTime,
    };
    
    return this.root.tick(context);
  }

  public getBlackboard(): Blackboard {
    return this.blackboard;
  }

  public reset(): void {
    this.blackboard.clear();
  }
}

// ============================================================================
// PRESET BEHAVIOR TREES
// ============================================================================

export const BehaviorTrees = {
  /**
   * Basic combat AI - attacks when in range, chases otherwise
   */
  basicCombat: () => new BehaviorTree(
    new Selector('Root', [
      // Attack if in range
      new Sequence('AttackSequence', [
        Conditions.hasEnemy(),
        Conditions.canSeeEnemy(),
        Conditions.isInRange(10),
        Actions.lookAtEnemy(),
        Actions.attack(),
      ]),
      // Chase enemy
      new Sequence('ChaseSequence', [
        Conditions.hasEnemy(),
        Actions.moveToEnemy(),
      ]),
      // Idle
      Actions.stop(),
    ])
  ),

  /**
   * Defensive AI - retreats when low health
   */
  defensive: () => new BehaviorTree(
    new Selector('Root', [
      // Retreat when low health
      new Sequence('RetreatSequence', [
        Conditions.healthBelow(0.3),
        Actions.setState('retreating'),
        new Action('Retreat', (ctx) => {
          if (!ctx.agent.enemy) return 'failure';
          
          // Move away from enemy
          const away = ctx.agent.position.clone()
            .sub(ctx.agent.enemy.position)
            .normalize()
            .multiplyScalar(20)
            .add(ctx.agent.position);
          
          ctx.agent.moveTo(away);
          return 'running';
        }),
      ]),
      // Attack if in range
      new Sequence('AttackSequence', [
        Conditions.hasEnemy(),
        Conditions.canSeeEnemy(),
        Conditions.isInRange(15),
        Actions.setState('attacking'),
        Actions.lookAtEnemy(),
        Actions.attack(),
      ]),
      // Chase
      new Sequence('ChaseSequence', [
        Conditions.hasEnemy(),
        Actions.setState('chasing'),
        Actions.moveToEnemy(),
      ]),
      // Idle
      new Sequence('IdleSequence', [
        Actions.setState('idle'),
        Actions.stop(),
      ]),
    ])
  ),

  /**
   * Aggressive AI - always pushes forward
   */
  aggressive: () => new BehaviorTree(
    new Selector('Root', [
      // Always attack if possible
      new Sequence('AttackSequence', [
        Conditions.hasEnemy(),
        Conditions.isInRange(20),
        Actions.lookAtEnemy(),
        new Parallel('AttackAndMove', [
          Actions.attack(),
          Actions.moveToEnemy(),
        ], 1, 2),
      ]),
      // Chase aggressively
      new Sequence('ChaseSequence', [
        Conditions.hasEnemy(),
        Actions.moveToEnemy(),
      ]),
      Actions.stop(),
    ])
  ),

  /**
   * Tactical AI - uses cover and flanking
   */
  tactical: () => new BehaviorTree(
    new Selector('Root', [
      // Take cover when damaged
      new Sequence('CoverSequence', [
        Conditions.healthBelow(0.5),
        new Cooldown('CoverCooldown',
          new Action('FindCover', (ctx) => {
            // Would find nearest cover point
            ctx.blackboard.set('needsCover', true);
            return 'success';
          }),
          5
        ),
      ]),
      // Flank if enemy is focused elsewhere
      new Sequence('FlankSequence', [
        Conditions.hasEnemy(),
        Conditions.random(0.3),
        new Action('Flank', (ctx) => {
          if (!ctx.agent.enemy) return 'failure';
          
          // Calculate flank position
          const toEnemy = ctx.agent.enemy.position.clone().sub(ctx.agent.position);
          const perpendicular = new THREE.Vector3(-toEnemy.z, 0, toEnemy.x).normalize();
          const flankPos = ctx.agent.enemy.position.clone()
            .add(perpendicular.multiplyScalar(10));
          
          ctx.agent.moveTo(flankPos);
          return 'running';
        }),
      ]),
      // Standard combat
      new Sequence('CombatSequence', [
        Conditions.hasEnemy(),
        Conditions.canSeeEnemy(),
        Actions.lookAtEnemy(),
        Actions.attack(),
      ]),
      // Chase
      new Sequence('ChaseSequence', [
        Conditions.hasEnemy(),
        Actions.moveToEnemy(),
      ]),
      Actions.stop(),
    ])
  ),
};

// ============================================================================
// ADAPTIVE DIFFICULTY
// ============================================================================

export interface DifficultyConfig {
  aiAccuracy: number;        // 0-1, how accurate AI aims
  aiReactionTime: number;    // Seconds before AI reacts
  aiAggression: number;      // 0-1, how aggressive AI is
  aiHealthMultiplier: number;
  aiDamageMultiplier: number;
  aiSpeedMultiplier: number;
  rubberBanding: number;     // 0-1, how much AI adapts to player performance
}

const DIFFICULTY_PRESETS: Record<string, DifficultyConfig> = {
  easy: {
    aiAccuracy: 0.3,
    aiReactionTime: 0.8,
    aiAggression: 0.3,
    aiHealthMultiplier: 0.7,
    aiDamageMultiplier: 0.5,
    aiSpeedMultiplier: 0.8,
    rubberBanding: 0.5,
  },
  medium: {
    aiAccuracy: 0.6,
    aiReactionTime: 0.4,
    aiAggression: 0.5,
    aiHealthMultiplier: 1.0,
    aiDamageMultiplier: 1.0,
    aiSpeedMultiplier: 1.0,
    rubberBanding: 0.3,
  },
  hard: {
    aiAccuracy: 0.85,
    aiReactionTime: 0.2,
    aiAggression: 0.7,
    aiHealthMultiplier: 1.3,
    aiDamageMultiplier: 1.5,
    aiSpeedMultiplier: 1.2,
    rubberBanding: 0.1,
  },
  expert: {
    aiAccuracy: 0.95,
    aiReactionTime: 0.1,
    aiAggression: 0.9,
    aiHealthMultiplier: 1.5,
    aiDamageMultiplier: 2.0,
    aiSpeedMultiplier: 1.3,
    rubberBanding: 0,
  },
};

export class AdaptiveDifficulty {
  private config: DifficultyConfig;
  private playerPerformance: number = 0.5; // 0-1, how well player is doing
  private performanceHistory: number[] = [];
  private readonly historySize = 20;

  constructor(difficulty: string = 'medium') {
    this.config = { ...DIFFICULTY_PRESETS[difficulty] || DIFFICULTY_PRESETS.medium };
  }

  public recordPlayerEvent(event: 'kill' | 'death' | 'damage_dealt' | 'damage_taken', value: number = 1): void {
    let performanceDelta = 0;
    
    switch (event) {
      case 'kill':
        performanceDelta = 0.1 * value;
        break;
      case 'death':
        performanceDelta = -0.15 * value;
        break;
      case 'damage_dealt':
        performanceDelta = 0.01 * value;
        break;
      case 'damage_taken':
        performanceDelta = -0.01 * value;
        break;
    }
    
    this.performanceHistory.push(performanceDelta);
    if (this.performanceHistory.length > this.historySize) {
      this.performanceHistory.shift();
    }
    
    // Calculate average performance
    const avgDelta = this.performanceHistory.reduce((a, b) => a + b, 0) / this.performanceHistory.length;
    this.playerPerformance = Math.max(0, Math.min(1, 0.5 + avgDelta));
  }

  public getAdjustedConfig(): DifficultyConfig {
    const rubberBand = this.config.rubberBanding;
    const performanceAdjust = (0.5 - this.playerPerformance) * rubberBand;
    
    return {
      aiAccuracy: Math.max(0.1, Math.min(1, this.config.aiAccuracy - performanceAdjust * 0.3)),
      aiReactionTime: Math.max(0.05, this.config.aiReactionTime + performanceAdjust * 0.3),
      aiAggression: Math.max(0.1, Math.min(1, this.config.aiAggression - performanceAdjust * 0.2)),
      aiHealthMultiplier: Math.max(0.5, this.config.aiHealthMultiplier - performanceAdjust * 0.3),
      aiDamageMultiplier: Math.max(0.3, this.config.aiDamageMultiplier - performanceAdjust * 0.4),
      aiSpeedMultiplier: Math.max(0.7, this.config.aiSpeedMultiplier - performanceAdjust * 0.2),
      rubberBanding: this.config.rubberBanding,
    };
  }

  public getPlayerPerformance(): number {
    return this.playerPerformance;
  }

  public setDifficulty(difficulty: string): void {
    this.config = { ...DIFFICULTY_PRESETS[difficulty] || DIFFICULTY_PRESETS.medium };
  }

  public reset(): void {
    this.playerPerformance = 0.5;
    this.performanceHistory.length = 0;
  }
}

export default { BehaviorTree, Blackboard, BehaviorTrees, AdaptiveDifficulty };
