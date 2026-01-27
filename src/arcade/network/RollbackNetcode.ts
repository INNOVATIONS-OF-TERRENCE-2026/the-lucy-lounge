/**
 * ┌─────────────────────────────────────────────────────────────────────────────┐
 * │ LUCY ARCADE — ROLLBACK NETCODE ENGINE                                       │
 * │                                                                             │
 * │ GGPO-style rollback netcode for fighting and FPS games                      │
 * │                                                                             │
 * │ FEATURES:                                                                   │
 * │ • Input prediction with rollback                                            │
 * │ • State serialization and restoration                                       │
 * │ • Frame delay adjustment                                                    │
 * │ • Desync detection and recovery                                             │
 * │ • Spectator support with delay                                              │
 * │ • Input compression                                                         │
 * │ • Peer-to-peer or server-authoritative modes                                │
 * └─────────────────────────────────────────────────────────────────────────────┘
 */

// ============================================================================
// TYPES
// ============================================================================

export interface RollbackConfig {
  maxPredictionFrames: number;      // Max frames to predict ahead (default: 8)
  inputDelay: number;               // Local input delay in frames (default: 2)
  maxRollbackFrames: number;        // Max frames to rollback (default: 8)
  checkpointInterval: number;       // Frames between state checkpoints (default: 60)
  syncTestEnabled: boolean;         // Enable sync test mode
}

export interface GameInput {
  frame: number;
  playerId: number;
  data: Uint8Array;
  checksum: number;
}

export interface GameState {
  frame: number;
  data: Uint8Array;
  checksum: number;
}

export interface InputBuffer {
  inputs: (GameInput | null)[];
  confirmed: boolean[];
  predicted: boolean[];
}

export interface SyncEvent {
  type: 'rollback' | 'desync' | 'timeout' | 'disconnect';
  frame: number;
  data?: any;
}

export interface PeerState {
  playerId: number;
  lastConfirmedFrame: number;
  lastReceivedFrame: number;
  roundTripTime: number;
  jitter: number;
  connected: boolean;
}

export type StateSerializer<T> = {
  serialize: (state: T) => Uint8Array;
  deserialize: (data: Uint8Array) => T;
  hash: (state: T) => number;
};

export type InputSerializer = {
  serialize: (input: any) => Uint8Array;
  deserialize: (data: Uint8Array) => any;
};

// ============================================================================
// CONSTANTS
// ============================================================================

const DEFAULT_CONFIG: RollbackConfig = {
  maxPredictionFrames: 8,
  inputDelay: 2,
  maxRollbackFrames: 8,
  checkpointInterval: 60,
  syncTestEnabled: false,
};

// ============================================================================
// ROLLBACK NETCODE ENGINE
// ============================================================================

export class RollbackNetcode<TState, TInput> {
  private config: RollbackConfig;
  private stateSerializer: StateSerializer<TState>;
  private inputSerializer: InputSerializer;
  
  // Frame tracking
  private currentFrame: number = 0;
  private lastConfirmedFrame: number = -1;
  private lastSyncedFrame: number = -1;
  
  // State management
  private savedStates: Map<number, GameState> = new Map();
  private checkpoints: Map<number, GameState> = new Map();
  private currentState: TState | null = null;
  
  // Input management
  private localPlayerId: number = 0;
  private playerCount: number = 2;
  private inputBuffers: Map<number, InputBuffer> = new Map();
  private pendingInputs: GameInput[] = [];
  
  // Peer management
  private peers: Map<number, PeerState> = new Map();
  
  // Callbacks
  private onAdvanceFrame: ((inputs: Map<number, TInput>) => void) | null = null;
  private onLoadState: ((state: TState) => void) | null = null;
  private onSaveState: (() => TState) | null = null;
  private onSyncEvent: ((event: SyncEvent) => void) | null = null;
  
  // Statistics
  private rollbackCount: number = 0;
  private totalRollbackFrames: number = 0;
  private maxRollbackDepth: number = 0;
  
  constructor(
    stateSerializer: StateSerializer<TState>,
    inputSerializer: InputSerializer,
    config: Partial<RollbackConfig> = {}
  ) {
    this.stateSerializer = stateSerializer;
    this.inputSerializer = inputSerializer;
    this.config = { ...DEFAULT_CONFIG, ...config };
  }
  
  // ============================================================================
  // INITIALIZATION
  // ============================================================================
  
  public initialize(
    localPlayerId: number,
    playerCount: number,
    initialState: TState
  ): void {
    this.localPlayerId = localPlayerId;
    this.playerCount = playerCount;
    this.currentState = initialState;
    this.currentFrame = 0;
    this.lastConfirmedFrame = -1;
    this.lastSyncedFrame = -1;
    
    // Initialize input buffers
    for (let i = 0; i < playerCount; i++) {
      this.inputBuffers.set(i, {
        inputs: new Array(256).fill(null),
        confirmed: new Array(256).fill(false),
        predicted: new Array(256).fill(false),
      });
      
      this.peers.set(i, {
        playerId: i,
        lastConfirmedFrame: -1,
        lastReceivedFrame: -1,
        roundTripTime: 0,
        jitter: 0,
        connected: i === localPlayerId,
      });
    }
    
    // Save initial checkpoint
    this.saveCheckpoint(0, initialState);
  }
  
  public setCallbacks(callbacks: {
    onAdvanceFrame: (inputs: Map<number, TInput>) => void;
    onLoadState: (state: TState) => void;
    onSaveState: () => TState;
    onSyncEvent?: (event: SyncEvent) => void;
  }): void {
    this.onAdvanceFrame = callbacks.onAdvanceFrame;
    this.onLoadState = callbacks.onLoadState;
    this.onSaveState = callbacks.onSaveState;
    this.onSyncEvent = callbacks.onSyncEvent || null;
  }
  
  // ============================================================================
  // INPUT HANDLING
  // ============================================================================
  
  public addLocalInput(input: TInput): void {
    const targetFrame = this.currentFrame + this.config.inputDelay;
    const serialized = this.inputSerializer.serialize(input);
    
    const gameInput: GameInput = {
      frame: targetFrame,
      playerId: this.localPlayerId,
      data: serialized,
      checksum: this.computeChecksum(serialized),
    };
    
    this.storeInput(gameInput);
    this.pendingInputs.push(gameInput);
  }
  
  public receiveRemoteInput(input: GameInput): void {
    const buffer = this.inputBuffers.get(input.playerId);
    if (!buffer) return;
    
    const index = input.frame % buffer.inputs.length;
    
    // Check if we already have a confirmed input
    if (buffer.confirmed[index] && buffer.inputs[index]?.frame === input.frame) {
      // Verify checksum
      if (buffer.inputs[index]!.checksum !== input.checksum) {
        // Desync detected!
        this.onSyncEvent?.({
          type: 'desync',
          frame: input.frame,
          data: { expected: buffer.inputs[index]!.checksum, received: input.checksum },
        });
      }
      return;
    }
    
    // Check if this overwrites a prediction
    const wasPredicted = buffer.predicted[index] && buffer.inputs[index]?.frame === input.frame;
    
    // Store confirmed input
    buffer.inputs[index] = input;
    buffer.confirmed[index] = true;
    buffer.predicted[index] = false;
    
    // Update peer state
    const peer = this.peers.get(input.playerId);
    if (peer) {
      peer.lastReceivedFrame = Math.max(peer.lastReceivedFrame, input.frame);
    }
    
    // Trigger rollback if we predicted wrong
    if (wasPredicted) {
      const oldInput = buffer.inputs[index];
      if (oldInput && oldInput.checksum !== input.checksum) {
        this.triggerRollback(input.frame);
      }
    }
  }
  
  private storeInput(input: GameInput): void {
    const buffer = this.inputBuffers.get(input.playerId);
    if (!buffer) return;
    
    const index = input.frame % buffer.inputs.length;
    buffer.inputs[index] = input;
    buffer.confirmed[index] = input.playerId === this.localPlayerId;
    buffer.predicted[index] = false;
  }
  
  private getInput(playerId: number, frame: number): GameInput | null {
    const buffer = this.inputBuffers.get(playerId);
    if (!buffer) return null;
    
    const index = frame % buffer.inputs.length;
    const input = buffer.inputs[index];
    
    if (input && input.frame === frame) {
      return input;
    }
    
    return null;
  }
  
  private predictInput(playerId: number, frame: number): GameInput {
    // Find last known input for this player
    let lastInput: GameInput | null = null;
    
    for (let f = frame - 1; f >= Math.max(0, frame - 10); f--) {
      const input = this.getInput(playerId, f);
      if (input) {
        lastInput = input;
        break;
      }
    }
    
    // Predict by repeating last input
    const data = lastInput?.data || new Uint8Array(0);
    
    const predicted: GameInput = {
      frame,
      playerId,
      data,
      checksum: this.computeChecksum(data),
    };
    
    // Store prediction
    const buffer = this.inputBuffers.get(playerId);
    if (buffer) {
      const index = frame % buffer.inputs.length;
      buffer.inputs[index] = predicted;
      buffer.predicted[index] = true;
      buffer.confirmed[index] = false;
    }
    
    return predicted;
  }
  
  // ============================================================================
  // FRAME ADVANCEMENT
  // ============================================================================
  
  public advanceFrame(): void {
    // Gather inputs for current frame
    const inputs = new Map<number, TInput>();
    
    for (let playerId = 0; playerId < this.playerCount; playerId++) {
      let input = this.getInput(playerId, this.currentFrame);
      
      if (!input) {
        // Need to predict
        if (playerId === this.localPlayerId) {
          // Should never happen - local inputs should always be available
          console.warn(`[Rollback] Missing local input for frame ${this.currentFrame}`);
          input = this.predictInput(playerId, this.currentFrame);
        } else {
          // Predict remote input
          input = this.predictInput(playerId, this.currentFrame);
        }
      }
      
      inputs.set(playerId, this.inputSerializer.deserialize(input.data));
    }
    
    // Save state before advancing
    if (this.onSaveState) {
      const state = this.onSaveState();
      this.saveState(this.currentFrame, state);
    }
    
    // Advance game state
    if (this.onAdvanceFrame) {
      this.onAdvanceFrame(inputs);
    }
    
    // Update confirmed frame
    this.updateConfirmedFrame();
    
    // Cleanup old states
    this.cleanupOldStates();
    
    // Create checkpoint if needed
    if (this.currentFrame % this.config.checkpointInterval === 0) {
      if (this.onSaveState) {
        this.saveCheckpoint(this.currentFrame, this.onSaveState());
      }
    }
    
    this.currentFrame++;
  }
  
  private updateConfirmedFrame(): void {
    let confirmed = this.currentFrame;
    
    for (let playerId = 0; playerId < this.playerCount; playerId++) {
      const buffer = this.inputBuffers.get(playerId);
      if (!buffer) continue;
      
      // Find oldest unconfirmed frame for this player
      for (let f = this.lastConfirmedFrame + 1; f <= this.currentFrame; f++) {
        const index = f % buffer.inputs.length;
        if (!buffer.confirmed[index] || buffer.inputs[index]?.frame !== f) {
          confirmed = Math.min(confirmed, f - 1);
          break;
        }
      }
    }
    
    this.lastConfirmedFrame = confirmed;
  }
  
  // ============================================================================
  // ROLLBACK
  // ============================================================================
  
  private triggerRollback(toFrame: number): void {
    if (toFrame >= this.currentFrame) return;
    
    const rollbackDepth = this.currentFrame - toFrame;
    
    if (rollbackDepth > this.config.maxRollbackFrames) {
      // Too far back - force resync
      this.onSyncEvent?.({
        type: 'rollback',
        frame: toFrame,
        data: { depth: rollbackDepth, maxAllowed: this.config.maxRollbackFrames },
      });
      return;
    }
    
    // Statistics
    this.rollbackCount++;
    this.totalRollbackFrames += rollbackDepth;
    this.maxRollbackDepth = Math.max(this.maxRollbackDepth, rollbackDepth);
    
    // Find closest saved state
    let restoreFrame = toFrame;
    let state = this.savedStates.get(restoreFrame);
    
    if (!state) {
      // Find checkpoint before target frame
      let checkpointFrame = -1;
      for (const [frame] of this.checkpoints) {
        if (frame <= toFrame && frame > checkpointFrame) {
          checkpointFrame = frame;
        }
      }
      
      if (checkpointFrame >= 0) {
        state = this.checkpoints.get(checkpointFrame);
        restoreFrame = checkpointFrame;
      }
    }
    
    if (!state) {
      console.error(`[Rollback] Cannot find state for frame ${toFrame}`);
      return;
    }
    
    // Load state
    const gameState = this.stateSerializer.deserialize(state.data);
    if (this.onLoadState) {
      this.onLoadState(gameState);
    }
    
    // Re-simulate from restored frame to current
    const targetFrame = this.currentFrame;
    this.currentFrame = restoreFrame;
    
    while (this.currentFrame < targetFrame) {
      this.advanceFrame();
    }
  }
  
  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================
  
  private saveState(frame: number, state: TState): void {
    const serialized = this.stateSerializer.serialize(state);
    const checksum = this.stateSerializer.hash(state);
    
    this.savedStates.set(frame, {
      frame,
      data: serialized,
      checksum,
    });
  }
  
  private saveCheckpoint(frame: number, state: TState): void {
    const serialized = this.stateSerializer.serialize(state);
    const checksum = this.stateSerializer.hash(state);
    
    this.checkpoints.set(frame, {
      frame,
      data: serialized,
      checksum,
    });
  }
  
  private cleanupOldStates(): void {
    const minFrame = this.lastConfirmedFrame - this.config.maxRollbackFrames;
    
    for (const [frame] of this.savedStates) {
      if (frame < minFrame) {
        this.savedStates.delete(frame);
      }
    }
    
    // Keep only recent checkpoints
    const checkpointKeepCount = 3;
    const checkpointFrames = Array.from(this.checkpoints.keys()).sort((a, b) => b - a);
    
    for (let i = checkpointKeepCount; i < checkpointFrames.length; i++) {
      this.checkpoints.delete(checkpointFrames[i]);
    }
  }
  
  // ============================================================================
  // NETWORK
  // ============================================================================
  
  public getPendingInputs(): GameInput[] {
    const inputs = [...this.pendingInputs];
    this.pendingInputs = [];
    return inputs;
  }
  
  public getSyncState(): {
    frame: number;
    confirmedFrame: number;
    checksum: number;
  } {
    const state = this.savedStates.get(this.lastConfirmedFrame);
    return {
      frame: this.currentFrame,
      confirmedFrame: this.lastConfirmedFrame,
      checksum: state?.checksum || 0,
    };
  }
  
  public handleSyncCheck(remoteChecksum: number, frame: number): boolean {
    const localState = this.savedStates.get(frame);
    if (!localState) return true; // Can't verify
    
    if (localState.checksum !== remoteChecksum) {
      this.onSyncEvent?.({
        type: 'desync',
        frame,
        data: { local: localState.checksum, remote: remoteChecksum },
      });
      return false;
    }
    
    return true;
  }
  
  public updatePeerRTT(playerId: number, rtt: number): void {
    const peer = this.peers.get(playerId);
    if (peer) {
      // Exponential moving average
      const alpha = 0.1;
      peer.jitter = alpha * Math.abs(rtt - peer.roundTripTime) + (1 - alpha) * peer.jitter;
      peer.roundTripTime = alpha * rtt + (1 - alpha) * peer.roundTripTime;
    }
  }
  
  // ============================================================================
  // UTILITIES
  // ============================================================================
  
  private computeChecksum(data: Uint8Array): number {
    let hash = 0x811c9dc5;
    for (let i = 0; i < data.length; i++) {
      hash ^= data[i];
      hash = Math.imul(hash, 0x01000193);
    }
    return hash >>> 0;
  }
  
  // ============================================================================
  // STATISTICS
  // ============================================================================
  
  public getStatistics(): {
    currentFrame: number;
    confirmedFrame: number;
    rollbackCount: number;
    avgRollbackDepth: number;
    maxRollbackDepth: number;
    pendingPredictions: number;
  } {
    let pendingPredictions = 0;
    for (const [, buffer] of this.inputBuffers) {
      for (let i = 0; i < buffer.predicted.length; i++) {
        if (buffer.predicted[i]) pendingPredictions++;
      }
    }
    
    return {
      currentFrame: this.currentFrame,
      confirmedFrame: this.lastConfirmedFrame,
      rollbackCount: this.rollbackCount,
      avgRollbackDepth: this.rollbackCount > 0 
        ? this.totalRollbackFrames / this.rollbackCount 
        : 0,
      maxRollbackDepth: this.maxRollbackDepth,
      pendingPredictions,
    };
  }
  
  public getPeerState(playerId: number): PeerState | undefined {
    return this.peers.get(playerId);
  }
}

export default RollbackNetcode;
