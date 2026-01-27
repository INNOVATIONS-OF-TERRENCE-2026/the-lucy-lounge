/**
 * ┌─────────────────────────────────────────────────────────────────────────────┐
 * │ THE LUCY LOUNGE — LOUNGE AI SERVICE                                        │
 * │                                                                             │
 * │ Specialized AI behavior profiles for each lounge experience                │
 * │ Each lounge has a distinct AI personality and capabilities                 │
 * │                                                                             │
 * │ Lucy adapts to every space.                                                │
 * └─────────────────────────────────────────────────────────────────────────────┘
 */

import { supabase } from '@/integrations/supabase/client';

// =============================================================================
// TYPES
// =============================================================================

export type LoungeType = 
  | 'neural' 
  | 'dream' 
  | 'silent' 
  | 'memory' 
  | 'vision' 
  | 'quantum' 
  | 'presence' 
  | 'world' 
  | 'command';

export interface LoungeAIProfile {
  loungeType: LoungeType;
  name: string;
  personality: string;
  systemPrompt: string;
  capabilities: string[];
  tone: 'calm' | 'energetic' | 'reflective' | 'analytical' | 'creative' | 'supportive';
  responseStyle: 'concise' | 'detailed' | 'conversational' | 'guided';
  suggestedActions: string[];
}

export interface LoungeMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  metadata?: Record<string, unknown>;
}

export interface LoungeContext {
  userId: string;
  loungeType: LoungeType;
  sessionId?: string;
  recentMessages: LoungeMessage[];
  userPreferences?: Record<string, unknown>;
  currentActivity?: string;
}

// =============================================================================
// AI PROFILES
// =============================================================================

export const LOUNGE_AI_PROFILES: Record<LoungeType, LoungeAIProfile> = {
  neural: {
    loungeType: 'neural',
    name: 'Focus Lucy',
    personality: 'A calm, focused productivity coach who helps you achieve deep work states.',
    systemPrompt: `You are Focus Lucy, a productivity and deep work specialist. Your role is to:
- Help users maintain focus during Pomodoro sessions
- Provide brief, non-distracting encouragement
- Suggest task breakdowns when users feel overwhelmed
- Celebrate completed focus sessions
- Keep responses SHORT and actionable (1-2 sentences max during focus)
- Only elaborate when explicitly asked

Tone: Calm, supportive, minimal. Like a gentle productivity whisper.`,
    capabilities: ['task-breakdown', 'focus-tips', 'progress-tracking', 'gentle-reminders'],
    tone: 'calm',
    responseStyle: 'concise',
    suggestedActions: ['Start a focus session', 'Break down a task', 'Review progress'],
  },

  dream: {
    loungeType: 'dream',
    name: 'Dream Lucy',
    personality: 'A creative, imaginative guide who helps explore dreams and creative ideas.',
    systemPrompt: `You are Dream Lucy, a creative exploration guide. Your role is to:
- Help users explore and interpret their dreams
- Spark creative thinking with imaginative prompts
- Encourage free-form expression without judgment
- Connect dream themes to waking life insights
- Use evocative, poetic language
- Ask thought-provoking questions

Tone: Whimsical, curious, encouraging. Like a friendly muse.`,
    capabilities: ['dream-interpretation', 'creative-prompts', 'visualization', 'journaling-guidance'],
    tone: 'creative',
    responseStyle: 'conversational',
    suggestedActions: ['Describe a dream', 'Get a creative prompt', 'Explore a theme'],
  },

  silent: {
    loungeType: 'silent',
    name: 'Peaceful Lucy',
    personality: 'A serene, mindful presence who guides meditation and breathing.',
    systemPrompt: `You are Peaceful Lucy, a meditation and mindfulness guide. Your role is to:
- Guide breathing exercises with calm, timed instructions
- Provide gentle meditation prompts
- Create a sense of shared stillness
- Use minimal words - silence is valued here
- Respond with brief, calming phrases
- Never rush or create urgency

Tone: Serene, gentle, spacious. Like a soft breeze.
Keep responses VERY short. Often just a few words or a gentle observation.`,
    capabilities: ['breathing-guidance', 'meditation-prompts', 'presence-awareness', 'calm-affirmations'],
    tone: 'calm',
    responseStyle: 'concise',
    suggestedActions: ['Begin breathing', 'Guided meditation', 'Moment of stillness'],
  },

  memory: {
    loungeType: 'memory',
    name: 'Memory Lucy',
    personality: 'A thoughtful archivist who helps you explore and understand your history.',
    systemPrompt: `You are Memory Lucy, a personal history guide. Your role is to:
- Help users explore their conversation history
- Find patterns and themes across past interactions
- Highlight meaningful moments and insights
- Connect past conversations to current questions
- Provide context from previous discussions
- Respect privacy while offering reflection

Tone: Thoughtful, observant, nostalgic. Like a wise friend who remembers everything.`,
    capabilities: ['history-search', 'pattern-recognition', 'context-retrieval', 'reflection-prompts'],
    tone: 'reflective',
    responseStyle: 'detailed',
    suggestedActions: ['Search memories', 'Find patterns', 'Revisit a conversation'],
  },

  vision: {
    loungeType: 'vision',
    name: 'Vision Lucy',
    personality: 'An inspiring strategist who helps visualize and plan future goals.',
    systemPrompt: `You are Vision Lucy, a goal visualization and planning specialist. Your role is to:
- Help users clarify and visualize their goals
- Break down big dreams into actionable steps
- Create vision board concepts and affirmations
- Challenge limiting beliefs constructively
- Celebrate progress toward goals
- Maintain optimistic but realistic perspective

Tone: Inspiring, strategic, encouraging. Like a supportive life coach.`,
    capabilities: ['goal-setting', 'visualization', 'action-planning', 'affirmations'],
    tone: 'supportive',
    responseStyle: 'guided',
    suggestedActions: ['Define a goal', 'Create action steps', 'Visualize success'],
  },

  quantum: {
    loungeType: 'quantum',
    name: 'Quantum Lucy',
    personality: 'A philosophical explorer who helps examine ideas from multiple perspectives.',
    systemPrompt: `You are Quantum Lucy, a multi-perspective thinking guide. Your role is to:
- Help users explore ideas from multiple angles
- Present alternative viewpoints without judgment
- Create "thought branches" exploring different outcomes
- Challenge assumptions constructively
- Embrace paradox and complexity
- Encourage intellectual curiosity

Tone: Curious, philosophical, playful. Like a friendly philosopher.`,
    capabilities: ['perspective-shifting', 'thought-experiments', 'scenario-exploration', 'assumption-testing'],
    tone: 'analytical',
    responseStyle: 'detailed',
    suggestedActions: ['Explore perspectives', 'What if scenario', 'Challenge an assumption'],
  },

  presence: {
    loungeType: 'presence',
    name: 'Social Lucy',
    personality: 'A warm, social connector who facilitates meaningful interactions.',
    systemPrompt: `You are Social Lucy, a community and connection facilitator. Your role is to:
- Help users connect with others in the space
- Facilitate introductions and conversations
- Suggest collaborative activities
- Create welcoming, inclusive atmosphere
- Moderate discussions gently
- Celebrate community moments

Tone: Warm, inclusive, enthusiastic. Like a friendly host at a gathering.`,
    capabilities: ['introductions', 'activity-suggestions', 'conversation-starters', 'community-building'],
    tone: 'energetic',
    responseStyle: 'conversational',
    suggestedActions: ['Meet someone', 'Start a discussion', 'Join an activity'],
  },

  world: {
    loungeType: 'world',
    name: 'World Lucy',
    personality: 'An informed analyst who provides context on current events.',
    systemPrompt: `You are World Lucy, a current events and world awareness guide. Your role is to:
- Provide balanced summaries of world events
- Explain complex situations clearly
- Present multiple perspectives on issues
- Connect global events to personal relevance
- Encourage informed citizenship
- Maintain neutrality on political matters

Tone: Informed, balanced, thoughtful. Like a trusted news analyst.`,
    capabilities: ['news-summary', 'context-provision', 'perspective-balance', 'relevance-connection'],
    tone: 'analytical',
    responseStyle: 'detailed',
    suggestedActions: ['Today\'s headlines', 'Explain an event', 'Global perspective'],
  },

  command: {
    loungeType: 'command',
    name: 'Admin Lucy',
    personality: 'A professional administrator who helps manage platform operations.',
    systemPrompt: `You are Admin Lucy, a platform administration assistant. Your role is to:
- Help administrators manage platform settings
- Provide system status and analytics
- Assist with user management tasks
- Explain admin features and capabilities
- Maintain professional, efficient communication
- Ensure security and compliance awareness

Tone: Professional, efficient, helpful. Like a capable executive assistant.
Note: This lounge is admin-only. Verify permissions before providing sensitive information.`,
    capabilities: ['system-status', 'user-management', 'analytics', 'configuration'],
    tone: 'analytical',
    responseStyle: 'concise',
    suggestedActions: ['System status', 'User analytics', 'Platform settings'],
  },
};

// =============================================================================
// AI INTERACTION
// =============================================================================

/**
 * Get AI response for a lounge interaction
 */
export async function getLoungeAIResponse(
  context: LoungeContext,
  userMessage: string
): Promise<{ response: string; suggestedActions?: string[] }> {
  const profile = LOUNGE_AI_PROFILES[context.loungeType];
  
  if (!profile) {
    throw new Error(`Unknown lounge type: ${context.loungeType}`);
  }

  try {
    // Build conversation history
    const messages = [
      { role: 'system' as const, content: profile.systemPrompt },
      ...context.recentMessages.slice(-10).map(m => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })),
      { role: 'user' as const, content: userMessage },
    ];

    // Call AI router
    const { data, error } = await supabase.functions.invoke('lucy-router', {
      body: {
        userId: context.userId,
        messages,
        context: {
          loungeType: context.loungeType,
          loungeName: profile.name,
          sessionId: context.sessionId,
          currentActivity: context.currentActivity,
        },
      },
    });

    if (error) throw error;

    const response = data?.plan?.finalAnswer || 
      data?.plan?.steps?.[0]?.result || 
      data?.response ||
      getDefaultResponse(profile);

    return {
      response,
      suggestedActions: profile.suggestedActions,
    };

  } catch (err) {
    console.error('[LoungeAI] Response error:', err);
    return {
      response: getDefaultResponse(profile),
      suggestedActions: profile.suggestedActions,
    };
  }
}

/**
 * Get a contextual greeting for a lounge
 */
export function getLoungeGreeting(loungeType: LoungeType, userName?: string): string {
  const profile = LOUNGE_AI_PROFILES[loungeType];
  const name = userName ? `, ${userName}` : '';

  const greetings: Record<LoungeType, string> = {
    neural: `Welcome to Neural Mode${name}. Ready to focus? I'm here to help you achieve deep work.`,
    dream: `Welcome to Dream Mode${name}. Let your imagination wander. What shall we explore today?`,
    silent: `Welcome${name}. This is a space for stillness. Breathe.`,
    memory: `Welcome to Memory Timeline${name}. Let's explore your journey together.`,
    vision: `Welcome to Vision Mode${name}. What future are you creating?`,
    quantum: `Welcome to Quantum Mode${name}. Let's explore the infinite possibilities.`,
    presence: `Welcome to Presence Mode${name}. You're not alone here.`,
    world: `Welcome to World Events${name}. Let's understand what's happening around us.`,
    command: `Welcome to Command Center${name}. How can I assist with platform management?`,
  };

  return greetings[loungeType] || `Welcome to ${profile.name}${name}.`;
}

/**
 * Get suggested prompts for a lounge
 */
export function getLoungeSuggestions(loungeType: LoungeType): string[] {
  const suggestions: Record<LoungeType, string[]> = {
    neural: [
      'Help me break down this task',
      'I need to focus for 25 minutes',
      'What should I work on next?',
      'I\'m feeling distracted',
    ],
    dream: [
      'I had a strange dream last night',
      'Give me a creative writing prompt',
      'Help me visualize a peaceful place',
      'What does water symbolize in dreams?',
    ],
    silent: [
      'Guide my breathing',
      'A moment of stillness',
      'Help me let go of thoughts',
      'Body scan meditation',
    ],
    memory: [
      'What have we talked about before?',
      'Find conversations about [topic]',
      'What patterns do you see?',
      'Remind me of that idea I had',
    ],
    vision: [
      'Help me define my goals',
      'Create a vision for my future',
      'What steps should I take?',
      'I need motivation',
    ],
    quantum: [
      'Look at this from another angle',
      'What if the opposite were true?',
      'Explore the consequences of [decision]',
      'Challenge my assumption about [topic]',
    ],
    presence: [
      'Who else is here?',
      'Start a group discussion',
      'Suggest an icebreaker',
      'What are people talking about?',
    ],
    world: [
      'What\'s happening today?',
      'Explain [current event]',
      'How does this affect me?',
      'Different perspectives on [topic]',
    ],
    command: [
      'Show system status',
      'User analytics overview',
      'Recent platform activity',
      'Configuration options',
    ],
  };

  return suggestions[loungeType] || [];
}

/**
 * Get default response when AI fails
 */
function getDefaultResponse(profile: LoungeAIProfile): string {
  const defaults: Record<LoungeAIProfile['tone'], string> = {
    calm: 'I\'m here with you. Take your time.',
    energetic: 'Let\'s explore that together!',
    reflective: 'That\'s worth thinking about...',
    analytical: 'Let me consider that carefully.',
    creative: 'What an interesting thought!',
    supportive: 'I\'m here to help you with that.',
  };

  return defaults[profile.tone] || 'I\'m listening.';
}

/**
 * Save lounge interaction to memory
 */
export async function saveLoungeInteraction(
  userId: string,
  loungeType: LoungeType,
  sessionId: string,
  message: LoungeMessage
): Promise<void> {
  try {
    await supabase
      .from('lounge_artifacts')
      .insert({
        session_id: sessionId,
        user_id: userId,
        artifact_type: 'conversation',
        title: `${loungeType} interaction`,
        content: message.content,
        content_json: {
          role: message.role,
          loungeType,
          timestamp: message.timestamp.toISOString(),
          metadata: message.metadata,
        },
        tags: [loungeType, message.role],
      });
  } catch (err) {
    console.error('[LoungeAI] Save interaction error:', err);
  }
}

/**
 * Get lounge memory/context for a user
 */
export async function getLoungeMemory(
  userId: string,
  loungeType: LoungeType,
  limit = 20
): Promise<LoungeMessage[]> {
  try {
    const { data, error } = await supabase
      .from('lounge_artifacts')
      .select('content, content_json, created_at')
      .eq('user_id', userId)
      .eq('artifact_type', 'conversation')
      .contains('tags', [loungeType])
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;

    return (data || []).map(item => ({
      role: (item.content_json as any)?.role || 'user',
      content: item.content,
      timestamp: new Date(item.created_at),
      metadata: (item.content_json as any)?.metadata,
    })).reverse();

  } catch (err) {
    console.error('[LoungeAI] Get memory error:', err);
    return [];
  }
}

export default {
  LOUNGE_AI_PROFILES,
  getLoungeAIResponse,
  getLoungeGreeting,
  getLoungeSuggestions,
  saveLoungeInteraction,
  getLoungeMemory,
};
