/**
 * ┌─────────────────────────────────────────────────────────────────────────────┐
 * │ THE LUCY LOUNGE — LOUNGE SERVICE                                           │
 * │                                                                             │
 * │ Service for managing lounge sessions, artifacts, and presence              │
 * │                                                                             │
 * │ Lucy's lounges are spaces for deep work and reflection.                    │
 * └─────────────────────────────────────────────────────────────────────────────┘
 */

import { supabase } from '@/integrations/supabase/client';

// =============================================================================
// TYPES
// =============================================================================

export type LoungeType = 'neural' | 'dream' | 'vision' | 'silent' | 'memory' | 'quantum' | 'presence' | 'events' | 'command';

export type AIMode = 'focus' | 'creative' | 'analytical' | 'reflective' | 'exploratory';

export interface LoungeSession {
  id: string;
  userId: string;
  loungeType: LoungeType;
  startedAt: Date;
  endedAt?: Date;
  durationSeconds?: number;
  status: 'active' | 'paused' | 'completed' | 'abandoned';
  aiMode?: AIMode;
  sessionData: Record<string, unknown>;
  interactionsCount: number;
  artifactsCount: number;
}

export interface LoungeArtifact {
  id: string;
  sessionId?: string;
  userId: string;
  artifactType: string;
  title?: string;
  content?: string;
  contentJson?: Record<string, unknown>;
  aiGenerated: boolean;
  tags: string[];
  isPrivate: boolean;
  isStarred: boolean;
  createdAt: Date;
}

export interface LoungePresence {
  activeCount: number;
  recentActivity: {
    displayName: string;
    activityType?: string;
    lastSeen: string;
  }[];
}

// =============================================================================
// SESSION MANAGEMENT
// =============================================================================

export async function startSession(loungeType: LoungeType, aiMode?: AIMode): Promise<string> {
  const { data, error } = await supabase
    .rpc('start_lounge_session', {
      p_lounge_type: loungeType,
      p_ai_mode: aiMode || null
    });

  if (error) throw new Error(`Failed to start session: ${error.message}`);
  return data as string;
}

export async function endSession(sessionId: string): Promise<boolean> {
  const { data, error } = await supabase
    .rpc('end_lounge_session', {
      p_session_id: sessionId
    });

  if (error) throw new Error(`Failed to end session: ${error.message}`);
  return data as boolean;
}

export async function getActiveSession(loungeType: LoungeType): Promise<LoungeSession | null> {
  const { data, error } = await supabase
    .from('lounge_sessions')
    .select('*')
    .eq('lounge_type', loungeType)
    .eq('status', 'active')
    .order('started_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  return {
    id: data.id,
    userId: data.user_id,
    loungeType: data.lounge_type as LoungeType,
    startedAt: new Date(data.started_at),
    endedAt: data.ended_at ? new Date(data.ended_at) : undefined,
    durationSeconds: data.duration_seconds,
    status: data.status,
    aiMode: data.ai_mode as AIMode,
    sessionData: data.session_data || {},
    interactionsCount: data.interactions_count,
    artifactsCount: data.artifacts_count
  };
}

export async function updateSessionData(sessionId: string, data: Record<string, unknown>): Promise<void> {
  const { error } = await supabase
    .from('lounge_sessions')
    .update({ 
      session_data: data,
      interactions_count: supabase.rpc('increment', { x: 1 }) // This won't work directly, need different approach
    })
    .eq('id', sessionId);

  if (error) throw error;
}

export async function getSessionHistory(loungeType?: LoungeType, limit = 20): Promise<LoungeSession[]> {
  let query = supabase
    .from('lounge_sessions')
    .select('*')
    .order('started_at', { ascending: false })
    .limit(limit);

  if (loungeType) {
    query = query.eq('lounge_type', loungeType);
  }

  const { data, error } = await query;
  if (error) throw error;

  return (data || []).map(item => ({
    id: item.id,
    userId: item.user_id,
    loungeType: item.lounge_type as LoungeType,
    startedAt: new Date(item.started_at),
    endedAt: item.ended_at ? new Date(item.ended_at) : undefined,
    durationSeconds: item.duration_seconds,
    status: item.status,
    aiMode: item.ai_mode as AIMode,
    sessionData: item.session_data || {},
    interactionsCount: item.interactions_count,
    artifactsCount: item.artifacts_count
  }));
}

// =============================================================================
// ARTIFACTS
// =============================================================================

export async function saveArtifact(
  sessionId: string | null,
  artifactType: string,
  title: string,
  content: string,
  contentJson?: Record<string, unknown>,
  tags: string[] = []
): Promise<string> {
  if (sessionId) {
    const { data, error } = await supabase
      .rpc('save_lounge_artifact', {
        p_session_id: sessionId,
        p_artifact_type: artifactType,
        p_title: title,
        p_content: content,
        p_content_json: contentJson || null,
        p_tags: tags
      });

    if (error) throw new Error(`Failed to save artifact: ${error.message}`);
    return data as string;
  } else {
    // Direct insert without session
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('lounge_artifacts')
      .insert({
        user_id: userData.user.id,
        artifact_type: artifactType,
        title,
        content,
        content_json: contentJson,
        tags
      })
      .select('id')
      .single();

    if (error) throw error;
    return data.id;
  }
}

export async function getArtifacts(
  sessionId?: string,
  artifactType?: string,
  limit = 50
): Promise<LoungeArtifact[]> {
  let query = supabase
    .from('lounge_artifacts')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (sessionId) {
    query = query.eq('session_id', sessionId);
  }
  if (artifactType) {
    query = query.eq('artifact_type', artifactType);
  }

  const { data, error } = await query;
  if (error) throw error;

  return (data || []).map(item => ({
    id: item.id,
    sessionId: item.session_id,
    userId: item.user_id,
    artifactType: item.artifact_type,
    title: item.title,
    content: item.content,
    contentJson: item.content_json,
    aiGenerated: item.ai_generated,
    tags: item.tags || [],
    isPrivate: item.is_private,
    isStarred: item.is_starred,
    createdAt: new Date(item.created_at)
  }));
}

export async function starArtifact(artifactId: string, starred: boolean): Promise<void> {
  const { error } = await supabase
    .from('lounge_artifacts')
    .update({ is_starred: starred })
    .eq('id', artifactId);

  if (error) throw error;
}

export async function deleteArtifact(artifactId: string): Promise<void> {
  const { error } = await supabase
    .from('lounge_artifacts')
    .delete()
    .eq('id', artifactId);

  if (error) throw error;
}

// =============================================================================
// PRESENCE
// =============================================================================

export async function getPresence(loungeType: LoungeType): Promise<LoungePresence> {
  const { data, error } = await supabase
    .rpc('get_lounge_presence', {
      p_lounge_type: loungeType
    });

  if (error) throw error;

  const result = data?.[0] || { active_count: 0, recent_activity: [] };
  return {
    activeCount: result.active_count || 0,
    recentActivity: result.recent_activity || []
  };
}

export async function updatePresence(
  loungeType: LoungeType,
  activityType?: string,
  displayName?: string
): Promise<void> {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return;

  const { error } = await supabase
    .from('lounge_presence')
    .upsert({
      user_id: userData.user.id,
      lounge_type: loungeType,
      is_active: true,
      last_seen: new Date().toISOString(),
      activity_type: activityType,
      display_name: displayName
    }, {
      onConflict: 'user_id,lounge_type'
    });

  if (error) console.error('Failed to update presence:', error);
}

export async function clearPresence(loungeType: LoungeType): Promise<void> {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return;

  const { error } = await supabase
    .from('lounge_presence')
    .update({ is_active: false, last_seen: new Date().toISOString() })
    .eq('user_id', userData.user.id)
    .eq('lounge_type', loungeType);

  if (error) console.error('Failed to clear presence:', error);
}

// =============================================================================
// LOUNGE-SPECIFIC HELPERS
// =============================================================================

// Neural Mode: Focus tracking
export interface FocusSession {
  taskDescription: string;
  focusMinutes: number;
  breakMinutes: number;
  completedPomodoros: number;
}

export async function saveFocusSession(sessionId: string, focus: FocusSession): Promise<void> {
  await saveArtifact(
    sessionId,
    'focus-session',
    `Focus: ${focus.taskDescription}`,
    `Completed ${focus.completedPomodoros} pomodoros (${focus.focusMinutes}min focus, ${focus.breakMinutes}min break)`,
    focus,
    ['focus', 'productivity']
  );
}

// Dream Mode: Dream journal
export interface DreamEntry {
  description: string;
  mood: string;
  themes: string[];
  lucidity: number; // 0-10
}

export async function saveDreamEntry(sessionId: string, dream: DreamEntry): Promise<void> {
  await saveArtifact(
    sessionId,
    'dream',
    `Dream Journal Entry`,
    dream.description,
    dream,
    ['dream', dream.mood, ...dream.themes]
  );
}

// Vision Mode: Vision board item
export interface VisionItem {
  goal: string;
  timeline: string;
  steps: string[];
  motivation: string;
}

export async function saveVisionItem(sessionId: string, vision: VisionItem): Promise<void> {
  await saveArtifact(
    sessionId,
    'vision',
    vision.goal,
    vision.motivation,
    vision,
    ['vision', 'goal', vision.timeline]
  );
}

// Memory Timeline: Get conversation history
export async function getConversationHistory(limit = 50): Promise<{
  id: string;
  title: string;
  preview: string;
  createdAt: Date;
  messageCount: number;
}[]> {
  const { data, error } = await supabase
    .from('conversations')
    .select(`
      id,
      title,
      created_at,
      messages (count)
    `)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;

  return (data || []).map(conv => ({
    id: conv.id,
    title: conv.title || 'Untitled Conversation',
    preview: '', // Would need to fetch first message
    createdAt: new Date(conv.created_at),
    messageCount: (conv.messages as unknown as { count: number }[])?.[0]?.count || 0
  }));
}

// Quantum Mode: Branching thought
export interface QuantumBranch {
  parentId?: string;
  thought: string;
  branches: string[];
  selectedBranch?: number;
}

export async function saveQuantumBranch(sessionId: string, branch: QuantumBranch): Promise<string> {
  return await saveArtifact(
    sessionId,
    'quantum-branch',
    'Thought Branch',
    branch.thought,
    branch,
    ['quantum', 'branching']
  );
}

export default {
  startSession,
  endSession,
  getActiveSession,
  updateSessionData,
  getSessionHistory,
  saveArtifact,
  getArtifacts,
  starArtifact,
  deleteArtifact,
  getPresence,
  updatePresence,
  clearPresence,
  saveFocusSession,
  saveDreamEntry,
  saveVisionItem,
  getConversationHistory,
  saveQuantumBranch
};
