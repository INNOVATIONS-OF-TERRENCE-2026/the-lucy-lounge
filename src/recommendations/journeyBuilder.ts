/**
 * ┌─────────────────────────────────────────────────────────────────────────────┐
 * │ THE LUCY LOUNGE — JOURNEY BUILDER                                          │
 * │                                                                             │
 * │ Creates personalized Lucy Journeys from media content based on mood,       │
 * │ theme, era, or user preferences                                            │
 * │ PHASE 2 IMPLEMENTATION                                                      │
 * └─────────────────────────────────────────────────────────────────────────────┘
 */

import { supabase } from '@/integrations/supabase/client';
import type {
  MediaNode,
  MediaCategory,
  LucyJourney,
  JourneyStep,
  UserTasteProfile,
} from '@/media/types';

// =============================================================================
// TYPES
// =============================================================================

export interface JourneyBuilderConfig {
  minSteps: number;
  maxSteps: number;
  targetDurationMinutes: number;
  moodTransitionSmoothing: boolean;
  includeIntroductions: boolean;
}

export interface JourneyBuildContext {
  userId?: string;
  tasteProfile?: UserTasteProfile;
  mood?: string;
  theme?: string;
  era?: string;
  category?: MediaCategory;
  seedNodeId?: string;
}

export interface GeneratedJourney extends Omit<LucyJourney, 'id' | 'created_at' | 'updated_at'> {
  nodes: MediaNode[];
  buildMetadata: {
    buildTime: number;
    candidatesConsidered: number;
    diversityScore: number;
  };
}

// =============================================================================
// JOURNEY TEMPLATES
// =============================================================================

interface JourneyTemplate {
  id: string;
  name: string;
  description: string;
  moodArc: string[]; // e.g., ['calm', 'building', 'peak', 'wind_down']
  pacing: 'slow' | 'medium' | 'fast';
  transitionStyle: 'smooth' | 'contrasting' | 'thematic';
}

const JOURNEY_TEMPLATES: JourneyTemplate[] = [
  {
    id: 'chill_to_hype',
    name: 'Chill to Hype',
    description: 'Start relaxed, build energy gradually',
    moodArc: ['chill', 'vibing', 'energetic', 'hype'],
    pacing: 'slow',
    transitionStyle: 'smooth',
  },
  {
    id: 'deep_dive',
    name: 'Deep Dive',
    description: 'Explore one artist or genre thoroughly',
    moodArc: ['introduction', 'exploration', 'deep_cuts', 'signature'],
    pacing: 'medium',
    transitionStyle: 'thematic',
  },
  {
    id: 'mood_swing',
    name: 'Mood Swing',
    description: 'Journey through contrasting emotions',
    moodArc: ['melancholy', 'hopeful', 'euphoric', 'reflective'],
    pacing: 'medium',
    transitionStyle: 'contrasting',
  },
  {
    id: 'late_night',
    name: 'Late Night Session',
    description: 'Perfect for after midnight',
    moodArc: ['atmospheric', 'introspective', 'dreamy', 'ambient'],
    pacing: 'slow',
    transitionStyle: 'smooth',
  },
  {
    id: 'workout_flow',
    name: 'Workout Flow',
    description: 'Warm up, push hard, cool down',
    moodArc: ['warm_up', 'building', 'peak_energy', 'cool_down'],
    pacing: 'fast',
    transitionStyle: 'contrasting',
  },
];

// =============================================================================
// DEFAULT CONFIG
// =============================================================================

export const DEFAULT_JOURNEY_CONFIG: JourneyBuilderConfig = {
  minSteps: 5,
  maxSteps: 12,
  targetDurationMinutes: 45,
  moodTransitionSmoothing: true,
  includeIntroductions: true,
};

// =============================================================================
// JOURNEY BUILDER CLASS
// =============================================================================

export class JourneyBuilder {
  private config: JourneyBuilderConfig;

  constructor(config: Partial<JourneyBuilderConfig> = {}) {
    this.config = { ...DEFAULT_JOURNEY_CONFIG, ...config };
  }

  /**
   * Build a journey from a mood
   */
  async buildFromMood(
    mood: string,
    context: JourneyBuildContext = {}
  ): Promise<GeneratedJourney | null> {
    const startTime = Date.now();
    
    // Select appropriate template
    const template = this.selectTemplate(mood);
    
    // Get candidates for each mood in the arc
    const candidatesByPhase = await Promise.all(
      template.moodArc.map(phaseMood => 
        this.getCandidatesForPhase(phaseMood, context)
      )
    );

    // Select items for each phase
    const selectedNodes: MediaNode[] = [];
    const usedIds = new Set<string>();

    for (let i = 0; i < template.moodArc.length; i++) {
      const phaseCandidates = candidatesByPhase[i];
      const itemsPerPhase = Math.ceil(this.config.maxSteps / template.moodArc.length);

      for (const candidate of phaseCandidates) {
        if (selectedNodes.length >= this.config.maxSteps) break;
        if (usedIds.has(candidate.id)) continue;

        selectedNodes.push(candidate);
        usedIds.add(candidate.id);

        if (selectedNodes.length % itemsPerPhase === 0) break;
      }
    }

    if (selectedNodes.length < this.config.minSteps) {
      return null;
    }

    // Build journey steps
    const steps = this.buildSteps(selectedNodes, template);

    // Calculate duration
    const totalDuration = selectedNodes.reduce(
      (sum, node) => sum + (node.duration_seconds || 240),
      0
    );

    const journey: GeneratedJourney = {
      title: `${this.capitalizeFirst(mood)} Journey`,
      description: template.description,
      cover_image_url: selectedNodes[0]?.poster_url,
      gradient_colors: this.getMoodGradient(mood),
      journey_type: 'mood',
      media_categories: context.category ? [context.category] : ['audio'],
      moods: [mood, ...template.moodArc.slice(0, 3)],
      best_time_of_day: this.getBestTimeForMood(mood),
      estimated_duration_minutes: Math.ceil(totalDuration / 60),
      steps,
      is_featured: false,
      popularity_score: 0,
      created_by: 'lucy',
      nodes: selectedNodes,
      buildMetadata: {
        buildTime: Date.now() - startTime,
        candidatesConsidered: candidatesByPhase.flat().length,
        diversityScore: this.calculateDiversity(selectedNodes),
      },
    };

    return journey;
  }

  /**
   * Build a journey from a seed track/movie
   */
  async buildFromSeed(
    seedNodeId: string,
    context: JourneyBuildContext = {}
  ): Promise<GeneratedJourney | null> {
    const startTime = Date.now();

    // Get the seed node
    const { data: seedNode, error } = await supabase
      .from('media_nodes')
      .select('*')
      .eq('id', seedNodeId)
      .single();

    if (error || !seedNode) {
      return null;
    }

    // Get related content
    const { data: relationships } = await supabase
      .from('media_relationships')
      .select(`
        weight,
        relationship_type,
        media_nodes!media_relationships_target_id_fkey (*)
      `)
      .eq('source_id', seedNodeId)
      .order('weight', { ascending: false })
      .limit(30);

    if (!relationships || relationships.length === 0) {
      return null;
    }

    // Build journey with seed at the start
    const selectedNodes: MediaNode[] = [seedNode as MediaNode];
    const usedIds = new Set([seedNodeId]);

    // Add related items
    for (const rel of relationships) {
      if (selectedNodes.length >= this.config.maxSteps) break;
      if (!rel.media_nodes) continue;
      
      const node = rel.media_nodes as MediaNode;
      if (usedIds.has(node.id)) continue;

      selectedNodes.push(node);
      usedIds.add(node.id);
    }

    if (selectedNodes.length < this.config.minSteps) {
      return null;
    }

    // Build steps
    const steps = this.buildSteps(selectedNodes, null, seedNode as MediaNode);

    const totalDuration = selectedNodes.reduce(
      (sum, node) => sum + (node.duration_seconds || 240),
      0
    );

    const journey: GeneratedJourney = {
      title: `Journey from "${seedNode.title}"`,
      description: `A curated path starting with ${seedNode.title}`,
      cover_image_url: seedNode.poster_url || undefined,
      gradient_colors: ['#1e3a5f', '#0f172a'],
      journey_type: 'curated',
      media_categories: [seedNode.category],
      moods: [],
      estimated_duration_minutes: Math.ceil(totalDuration / 60),
      steps,
      is_featured: false,
      popularity_score: 0,
      created_by: 'lucy',
      nodes: selectedNodes,
      buildMetadata: {
        buildTime: Date.now() - startTime,
        candidatesConsidered: relationships.length,
        diversityScore: this.calculateDiversity(selectedNodes),
      },
    };

    return journey;
  }

  /**
   * Select the best template for a mood
   */
  private selectTemplate(mood: string): JourneyTemplate {
    const moodTemplateMap: Record<string, string> = {
      chill: 'chill_to_hype',
      relaxing: 'late_night',
      energetic: 'workout_flow',
      focus: 'deep_dive',
      sad: 'mood_swing',
      happy: 'chill_to_hype',
    };

    const templateId = moodTemplateMap[mood.toLowerCase()] || 'chill_to_hype';
    return JOURNEY_TEMPLATES.find(t => t.id === templateId) || JOURNEY_TEMPLATES[0];
  }

  /**
   * Get candidates for a journey phase
   */
  private async getCandidatesForPhase(
    phaseMood: string,
    context: JourneyBuildContext
  ): Promise<MediaNode[]> {
    let query = supabase
      .from('media_nodes')
      .select('*')
      .order('popularity_score', { ascending: false })
      .limit(20);

    if (context.category) {
      query = query.eq('category', context.category);
    }

    const { data } = await query;
    return (data || []) as MediaNode[];
  }

  /**
   * Build journey steps with transitions
   */
  private buildSteps(
    nodes: MediaNode[],
    template: JourneyTemplate | null,
    seedNode?: MediaNode
  ): JourneyStep[] {
    return nodes.map((node, index) => {
      const step: JourneyStep = {
        order: index + 1,
        media_node_id: node.id,
      };

      if (this.config.includeIntroductions) {
        if (index === 0 && seedNode) {
          step.introduction = `Starting your journey with "${node.title}"`;
        } else if (index === 0) {
          step.introduction = `Let's begin with "${node.title}"`;
        } else if (index === nodes.length - 1) {
          step.transition = 'And that brings us to the end of this journey.';
        }
      }

      return step;
    });
  }

  /**
   * Get gradient colors for a mood
   */
  private getMoodGradient(mood: string): string[] {
    const gradients: Record<string, string[]> = {
      chill: ['#1e3a5f', '#0f172a'],
      energetic: ['#dc2626', '#7f1d1d'],
      focus: ['#059669', '#064e3b'],
      sad: ['#4338ca', '#1e1b4b'],
      happy: ['#f59e0b', '#b45309'],
      relaxing: ['#7c3aed', '#4c1d95'],
    };

    return gradients[mood.toLowerCase()] || ['#374151', '#111827'];
  }

  /**
   * Get best time of day for a mood
   */
  private getBestTimeForMood(mood: string): LucyJourney['best_time_of_day'] {
    const timeMap: Record<string, LucyJourney['best_time_of_day']> = {
      chill: 'evening',
      energetic: 'afternoon',
      focus: 'morning',
      sad: 'late_night',
      happy: 'any',
      relaxing: 'evening',
    };

    return timeMap[mood.toLowerCase()] || 'any';
  }

  /**
   * Calculate diversity score for selected nodes
   */
  private calculateDiversity(nodes: MediaNode[]): number {
    if (nodes.length === 0) return 0;

    const uniqueTypes = new Set(nodes.map(n => n.media_type)).size;
    const typeVariety = uniqueTypes / Math.min(nodes.length, 5);

    return Math.min(1, typeVariety);
  }

  /**
   * Capitalize first letter
   */
  private capitalizeFirst(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
}

// =============================================================================
// FACTORY
// =============================================================================

export function createJourneyBuilder(
  config?: Partial<JourneyBuilderConfig>
): JourneyBuilder {
  return new JourneyBuilder(config);
}

export default JourneyBuilder;
