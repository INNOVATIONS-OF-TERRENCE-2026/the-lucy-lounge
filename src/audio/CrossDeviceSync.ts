/**
 * ┌─────────────────────────────────────────────────────────────────────────────┐
 * │ THE LUCY LOUNGE — CROSS-DEVICE SYNC LAYER                                  │
 * │                                                                             │
 * │ Real-time sync of playback state, progress, and queue across devices       │
 * │ "Resume anywhere" - the core promise of Lucy's intelligence layer          │
 * │                                                                             │
 * │ Lucy owns the memory. Devices are just windows.                            │
 * └─────────────────────────────────────────────────────────────────────────────┘
 */

import { supabase } from '@/integrations/supabase/client';
import type { RealtimeChannel } from '@supabase/supabase-js';
import type {
  AudioTrack,
  PlaybackSnapshot,
  QueueState,
  DeviceState,
  SyncCommand,
} from './types';

// =============================================================================
// SYNC TYPES
// =============================================================================

export interface SyncState {
  userId: string;
  deviceId: string;
  deviceName: string;
  deviceType: 'web' | 'mobile' | 'desktop';
  
  // Current playback
  currentTrack: AudioTrack | null;
  position: number;
  isPlaying: boolean;
  
  // Queue
  queue: QueueState | null;
  
  // Last sync
  lastSyncAt: string;
  syncVersion: number;
}

export interface SyncEvent {
  type: 'playback_update' | 'device_joined' | 'device_left' | 'transfer_request' | 'sync_pull';
  deviceId: string;
  payload: any;
  timestamp: string;
}

export type SyncEventListener = (event: SyncEvent) => void;

// =============================================================================
// DEVICE FINGERPRINTING
// =============================================================================

function getDeviceId(): string {
  if (typeof window === 'undefined') return 'server';
  
  let deviceId = localStorage.getItem('lucy_device_id');
  if (!deviceId) {
    deviceId = crypto.randomUUID();
    localStorage.setItem('lucy_device_id', deviceId);
  }
  return deviceId;
}

function getDeviceName(): string {
  if (typeof window === 'undefined') return 'Server';
  
  const ua = navigator.userAgent;
  
  if (/iPhone/.test(ua)) return 'iPhone';
  if (/iPad/.test(ua)) return 'iPad';
  if (/Android/.test(ua)) {
    const match = ua.match(/Android[^;]+;([^)]+)/);
    return match ? match[1].trim() : 'Android Device';
  }
  if (/Mac/.test(ua)) return 'Mac';
  if (/Windows/.test(ua)) return 'Windows PC';
  if (/Linux/.test(ua)) return 'Linux';
  
  return 'Web Browser';
}

function getDeviceType(): 'web' | 'mobile' | 'desktop' {
  if (typeof window === 'undefined') return 'web';
  
  const ua = navigator.userAgent;
  if (/iPhone|iPad|iPod|Android/.test(ua)) return 'mobile';
  if (/Mac|Windows|Linux/.test(ua)) return 'desktop';
  return 'web';
}

// =============================================================================
// CROSS-DEVICE SYNC IMPLEMENTATION
// =============================================================================

export class CrossDeviceSync {
  private userId: string | null = null;
  private deviceId: string;
  private deviceName: string;
  private deviceType: 'web' | 'mobile' | 'desktop';
  
  // Supabase realtime channel
  private channel: RealtimeChannel | null = null;
  private presenceChannel: RealtimeChannel | null = null;
  
  // State
  private currentState: SyncState | null = null;
  private syncVersion: number = 0;
  private listeners: Set<SyncEventListener> = new Set();
  
  // Connected devices
  private connectedDevices: Map<string, DeviceState> = new Map();
  
  // Debounce
  private syncDebounceTimer: number | null = null;
  private SYNC_DEBOUNCE_MS = 500;
  
  constructor() {
    this.deviceId = getDeviceId();
    this.deviceName = getDeviceName();
    this.deviceType = getDeviceType();
  }
  
  // ===========================================================================
  // INITIALIZATION
  // ===========================================================================
  
  async initialize(): Promise<boolean> {
    // Get current user
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      console.log('[CrossDeviceSync] No authenticated user');
      return false;
    }
    
    this.userId = session.user.id;
    
    // Subscribe to auth changes
    supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        this.disconnect();
        this.userId = null;
      } else if (session?.user) {
        this.userId = session.user.id;
        this.connect();
      }
    });
    
    // Connect to realtime channels
    await this.connect();
    
    // Load initial state
    await this.loadRemoteState();
    
    return true;
  }
  
  // ===========================================================================
  // REALTIME CONNECTION
  // ===========================================================================
  
  private async connect(): Promise<void> {
    if (!this.userId) return;
    
    // Main sync channel
    this.channel = supabase
      .channel(`sync:${this.userId}`)
      .on('broadcast', { event: 'sync' }, (payload) => {
        this.handleRemoteSync(payload.payload as SyncEvent);
      })
      .subscribe();
    
    // Presence channel for device discovery
    this.presenceChannel = supabase
      .channel(`presence:${this.userId}`)
      .on('presence', { event: 'sync' }, () => {
        this.updateConnectedDevices();
      })
      .on('presence', { event: 'join' }, ({ newPresences }) => {
        newPresences.forEach((p: any) => {
          if (p.deviceId !== this.deviceId) {
            this.emit({
              type: 'device_joined',
              deviceId: p.deviceId,
              payload: p,
              timestamp: new Date().toISOString(),
            });
          }
        });
        this.updateConnectedDevices();
      })
      .on('presence', { event: 'leave' }, ({ leftPresences }) => {
        leftPresences.forEach((p: any) => {
          this.emit({
            type: 'device_left',
            deviceId: p.deviceId,
            payload: p,
            timestamp: new Date().toISOString(),
          });
        });
        this.updateConnectedDevices();
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await this.presenceChannel?.track({
            deviceId: this.deviceId,
            deviceName: this.deviceName,
            deviceType: this.deviceType,
            isActive: true,
            lastSeen: new Date().toISOString(),
          });
        }
      });
  }
  
  disconnect(): void {
    if (this.channel) {
      supabase.removeChannel(this.channel);
      this.channel = null;
    }
    
    if (this.presenceChannel) {
      supabase.removeChannel(this.presenceChannel);
      this.presenceChannel = null;
    }
  }
  
  private updateConnectedDevices(): void {
    if (!this.presenceChannel) return;
    
    const presenceState = this.presenceChannel.presenceState();
    this.connectedDevices.clear();
    
    Object.values(presenceState).forEach((presences: any[]) => {
      presences.forEach((p) => {
        this.connectedDevices.set(p.deviceId, {
          deviceId: p.deviceId,
          deviceName: p.deviceName,
          deviceType: p.deviceType,
          isActive: p.isActive,
          lastSeen: p.lastSeen,
        });
      });
    });
  }
  
  // ===========================================================================
  // STATE SYNC
  // ===========================================================================
  
  /**
   * Sync playback state to cloud (debounced)
   */
  syncPlayback(snapshot: PlaybackSnapshot, queue?: QueueState): void {
    if (!this.userId) return;
    
    // Debounce rapid updates
    if (this.syncDebounceTimer) {
      clearTimeout(this.syncDebounceTimer);
    }
    
    this.syncDebounceTimer = window.setTimeout(() => {
      this.performSync(snapshot, queue);
    }, this.SYNC_DEBOUNCE_MS);
  }
  
  /**
   * Immediate sync (for important state changes)
   */
  async syncNow(snapshot: PlaybackSnapshot, queue?: QueueState): Promise<void> {
    if (this.syncDebounceTimer) {
      clearTimeout(this.syncDebounceTimer);
    }
    await this.performSync(snapshot, queue);
  }
  
  private async performSync(snapshot: PlaybackSnapshot, queue?: QueueState): Promise<void> {
    if (!this.userId) return;
    
    this.syncVersion++;
    
    const syncState: SyncState = {
      userId: this.userId,
      deviceId: this.deviceId,
      deviceName: this.deviceName,
      deviceType: this.deviceType,
      currentTrack: snapshot.track,
      position: snapshot.position,
      isPlaying: snapshot.state === 'playing',
      queue: queue || null,
      lastSyncAt: new Date().toISOString(),
      syncVersion: this.syncVersion,
    };
    
    this.currentState = syncState;
    
    // Persist to Supabase
    await this.persistState(syncState);
    
    // Broadcast to other devices
    this.broadcast({
      type: 'playback_update',
      deviceId: this.deviceId,
      payload: syncState,
      timestamp: new Date().toISOString(),
    });
  }
  
  private async persistState(state: SyncState): Promise<void> {
    try {
      // Upsert to user_playback_state table (if it exists)
      const { error } = await supabase
        .from('user_playback_state')
        .upsert({
          user_id: state.userId,
          device_id: state.deviceId,
          device_name: state.deviceName,
          device_type: state.deviceType,
          current_track: state.currentTrack,
          position: state.position,
          is_playing: state.isPlaying,
          queue: state.queue,
          sync_version: state.syncVersion,
          updated_at: state.lastSyncAt,
        }, {
          onConflict: 'user_id,device_id',
        });
      
      if (error && error.code !== '42P01') { // Ignore "table doesn't exist"
        console.warn('[CrossDeviceSync] Persist failed:', error);
      }
    } catch (e) {
      // Table may not exist yet - fail silently
    }
  }
  
  // ===========================================================================
  // REMOTE STATE
  // ===========================================================================
  
  private async loadRemoteState(): Promise<SyncState | null> {
    if (!this.userId) return null;
    
    try {
      const { data, error } = await supabase
        .from('user_playback_state')
        .select('*')
        .eq('user_id', this.userId)
        .order('updated_at', { ascending: false })
        .limit(1)
        .single();
      
      if (error || !data) return null;
      
      return {
        userId: data.user_id,
        deviceId: data.device_id,
        deviceName: data.device_name,
        deviceType: data.device_type,
        currentTrack: data.current_track,
        position: data.position,
        isPlaying: data.is_playing,
        queue: data.queue,
        lastSyncAt: data.updated_at,
        syncVersion: data.sync_version,
      };
    } catch (e) {
      return null;
    }
  }
  
  /**
   * Get the most recent playback state from any device
   */
  async getLastPlaybackState(): Promise<SyncState | null> {
    return this.loadRemoteState();
  }
  
  /**
   * Resume playback from cloud state
   */
  async resumeFromCloud(): Promise<{
    track: AudioTrack | null;
    position: number;
    queue: QueueState | null;
  } | null> {
    const state = await this.loadRemoteState();
    if (!state) return null;
    
    return {
      track: state.currentTrack,
      position: state.position,
      queue: state.queue,
    };
  }
  
  // ===========================================================================
  // DEVICE TRANSFER
  // ===========================================================================
  
  /**
   * Transfer playback to another device
   */
  async transferTo(targetDeviceId: string): Promise<boolean> {
    if (!this.currentState) return false;
    
    this.broadcast({
      type: 'transfer_request',
      deviceId: this.deviceId,
      payload: {
        targetDeviceId,
        state: this.currentState,
      },
      timestamp: new Date().toISOString(),
    });
    
    return true;
  }
  
  /**
   * Pull playback from another device to this one
   */
  async pullFrom(sourceDeviceId: string): Promise<boolean> {
    this.broadcast({
      type: 'sync_pull',
      deviceId: this.deviceId,
      payload: {
        sourceDeviceId,
      },
      timestamp: new Date().toISOString(),
    });
    
    return true;
  }
  
  // ===========================================================================
  // CONNECTED DEVICES
  // ===========================================================================
  
  getConnectedDevices(): DeviceState[] {
    return Array.from(this.connectedDevices.values());
  }
  
  getActiveDevice(): DeviceState | null {
    const devices = this.getConnectedDevices();
    return devices.find(d => d.isActive) || null;
  }
  
  isThisDeviceActive(): boolean {
    const active = this.getActiveDevice();
    return active?.deviceId === this.deviceId;
  }
  
  // ===========================================================================
  // EVENT HANDLING
  // ===========================================================================
  
  private handleRemoteSync(event: SyncEvent): void {
    // Ignore own events
    if (event.deviceId === this.deviceId) return;
    
    switch (event.type) {
      case 'playback_update':
        // Another device updated playback
        this.emit(event);
        break;
        
      case 'transfer_request':
        // Check if we're the target
        if (event.payload.targetDeviceId === this.deviceId) {
          this.emit(event);
        }
        break;
        
      case 'sync_pull':
        // Check if we're the source
        if (event.payload.sourceDeviceId === this.deviceId && this.currentState) {
          // Send our state
          this.broadcast({
            type: 'playback_update',
            deviceId: this.deviceId,
            payload: this.currentState,
            timestamp: new Date().toISOString(),
          });
        }
        break;
    }
  }
  
  private broadcast(event: SyncEvent): void {
    if (!this.channel) return;
    
    this.channel.send({
      type: 'broadcast',
      event: 'sync',
      payload: event,
    });
  }
  
  // ===========================================================================
  // LISTENERS
  // ===========================================================================
  
  addEventListener(listener: SyncEventListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
  
  private emit(event: SyncEvent): void {
    this.listeners.forEach(listener => {
      try {
        listener(event);
      } catch (e) {
        console.error('[CrossDeviceSync] Listener error:', e);
      }
    });
  }
  
  // ===========================================================================
  // STATE
  // ===========================================================================
  
  getDeviceId(): string {
    return this.deviceId;
  }
  
  getDeviceName(): string {
    return this.deviceName;
  }
  
  getCurrentState(): SyncState | null {
    return this.currentState;
  }
  
  isConnected(): boolean {
    return this.channel !== null;
  }
}

// =============================================================================
// SINGLETON INSTANCE
// =============================================================================

let syncInstance: CrossDeviceSync | null = null;

export function getCrossDeviceSync(): CrossDeviceSync {
  if (!syncInstance) {
    syncInstance = new CrossDeviceSync();
  }
  return syncInstance;
}

export async function initializeCrossDeviceSync(): Promise<boolean> {
  const sync = getCrossDeviceSync();
  return sync.initialize();
}
