// =============================================================================
// THE LUCY LOUNGE - COLD START STRATEGY
// =============================================================================
// Handles new users who have no watch/listen history yet.
// Uses progressive disclosure and onboarding signals.
// =============================================================================

import { supabase } from '@/integrations/supabase/client';
import type {
  MediaNode,
  MediaCategory,
  MediaType,
  RecommendationRow,
  LucyJourney,
} from '../types';
import { SIGNAL_WEIGHTS } from './recommendationEngine';

// =============================================================================
// COLD START CONFIG
// =============================================================================

export interface ColdStartConfig {
  // Minimum interactions before switching to personalized
  minWatchEvents: number;
  minListenEvents: number;
  minRatings: number;
  
  // Fallback strategies
  defaultMoods: string[];
  defaultGenres: string[];
  featuredJourneyWeight: number;
  
  // Onboarding questions
  enableTasteQuiz: boolean;
  quizQuestionCount: number;
}

export const DEFAULT_COLD_START_CONFIG: ColdStartConfig = {
  minWatchEvents: 3,
  minListenEvents: 5,
  minRatings: 2,
  
  defaultMoods: ['chill', 'discover', 'focus'],
  defaultGenres: ['drama', 'comedy', 'indie', 'ambient'],
  featuredJourneyWeight: 1.5,
  
  enableTasteQuiz: true,
  quizQuestionCount: 5,
};

// =============================================================================
// TASTE QUIZ
// =============================================================================

export interface TasteQuizQuestion {
  id: string;
  type: 'binary_choice' | 'multiple_choice' | 'slider';
  category: MediaCategory;
  question: string;
  options: TasteQuizOption[];
  weight: number;
}

export interface TasteQuizOption {
  id: string;
  label: string;
  imageUrl?: string;
  videoUrl?: string;
  genreSignals: string[];
  moodSignals: string[];
}

export interface TasteQuizResponse {
  questionId: string;
  selectedOptionIds: string[];
  sliderValue?: number;
}

// Sample quiz questions for video
export const VIDEO_TASTE_QUESTIONS: TasteQuizQuestion[] = [
  {
    id: 'video-mood-1',
    type: 'binary_choice',
    category: 'video',
    question: 'When you have time to watch something, do you prefer...',
    weight: 1.0,
    options: [
      {
        id: 'intense',
        label: 'Edge-of-your-seat intensity',
        genreSignals: ['thriller', 'action', 'horror'],
        moodSignals: ['intense', 'suspenseful'],
      },
      {
        id: 'relaxing',
        label: 'Relaxing and heartwarming',
        genreSignals: ['comedy', 'romance', 'slice-of-life'],
        moodSignals: ['chill', 'cozy', 'uplifting'],
      },
    ],
  },
  {
    id: 'video-mood-2',
    type: 'binary_choice',
    category: 'video',
    question: 'What draws you in more?',
    weight: 0.8,
    options: [
      {
        id: 'story',
        label: 'A compelling story',
        genreSignals: ['drama', 'documentary', 'biography'],
        moodSignals: ['thoughtful', 'deep'],
      },
      {
        id: 'spectacle',
        label: 'Visual spectacle',
        genreSignals: ['sci-fi', 'fantasy', 'animation'],
        moodSignals: ['epic', 'immersive'],
      },
    ],
  },
  {
    id: 'video-format-1',
    type: 'multiple_choice',
    category: 'video',
    question: 'What\'s your ideal watching session?',
    weight: 0.6,
    options: [
      {
        id: 'movie',
        label: '2-hour movie experience',
        genreSignals: [],
        moodSignals: ['cinematic'],
      },
      {
        id: 'binge',
        label: 'Multi-episode binge',
        genreSignals: [],
        moodSignals: ['bingeable'],
      },
      {
        id: 'short',
        label: 'Quick 20-30 min episodes',
        genreSignals: [],
        moodSignals: ['quick'],
      },
    ],
  },
];

// Sample quiz questions for audio
export const AUDIO_TASTE_QUESTIONS: TasteQuizQuestion[] = [
  {
    id: 'audio-mood-1',
    type: 'binary_choice',
    category: 'audio',
    question: 'When listening to something, do you prefer...',
    weight: 1.0,
    options: [
      {
        id: 'background',
        label: 'Background vibes while doing other things',
        genreSignals: ['ambient', 'instrumental', 'lo-fi'],
        moodSignals: ['focus', 'work', 'study'],
      },
      {
        id: 'focused',
        label: 'Active listening and engagement',
        genreSignals: ['podcast', 'audiobook', 'complex-music'],
        moodSignals: ['engaged', 'learning'],
      },
    ],
  },
  {
    id: 'audio-genre-1',
    type: 'multiple_choice',
    category: 'audio',
    question: 'What type of audio content interests you most?',
    weight: 1.2,
    options: [
      {
        id: 'music',
        label: 'Music',
        genreSignals: ['music'],
        moodSignals: ['vibes'],
      },
      {
        id: 'podcasts',
        label: 'Podcasts & Talk',
        genreSignals: ['podcast', 'interview'],
        moodSignals: ['conversational'],
      },
      {
        id: 'audiobooks',
        label: 'Audiobooks & Stories',
        genreSignals: ['audiobook', 'fiction', 'non-fiction'],
        moodSignals: ['storytelling'],
      },
      {
        id: 'mixed',
        label: 'Mix of everything',
        genreSignals: [],
        moodSignals: ['eclectic'],
      },
    ],
  },
];

// =============================================================================
// COLD START ENGINE
// =============================================================================

export class ColdStartEngine {
  private config: ColdStartConfig;
  
  constructor(config: Partial<ColdStartConfig> = {}) {
    this.config = { ...DEFAULT_COLD_START_CONFIG, ...config };
  }
  
  /**
   * Check if user is in cold start state
   */
  async isUserColdStart(userId: string): Promise<boolean> {
    const [watchCount, listenCount, ratingCount] = await Promise.all([
      this.getEventCount('user_watch_events', userId),
      this.getEventCount('user_listen_events', userId),
      this.getEventCount('user_ratings', userId),
    ]);
    
    // User is cold start if below all minimums
    return (
      watchCount < this.config.minWatchEvents &&
      listenCount < this.config.minListenEvents &&
      ratingCount < this.config.minRatings
    );
  }
  
  /**
   * Get cold start recommendation rows
   */
  async getColdStartRecommendations(
    userId: string,
    category?: MediaCategory
  ): Promise<RecommendationRow[]> {
    const rows: RecommendationRow[] = [];
    
    // 1. Featured Lucy Journeys (curated onboarding paths)
    const journeys = await this.getFeaturedJourneys(category);
    if (journeys.length > 0) {
      rows.push({
        id: 'cold-start-journeys',
        title: 'Start Your Journey',
        reason: 'Curated paths to help you explore',
        reason_type: 'curated',
        items: [], // Journeys rendered differently
        journeys,
      } as any);
    }
    
    // 2. Popular content (global popularity as fallback)
    const popular = await this.getPopularContent(category, 15);
    if (popular.length > 0) {
      rows.push({
        id: 'cold-start-popular',
        title: 'Popular Right Now',
        reason: 'What everyone\'s enjoying',
        reason_type: 'trending',
        items: popular,
      });
    }
    
    // 3. Mood-based discovery (default moods)
    for (const mood of this.config.defaultMoods.slice(0, 2)) {
      const moodContent = await this.getMoodContent(mood, category, 10);
      if (moodContent.length > 0) {
        rows.push({
          id: `cold-start-mood-${mood}`,
          title: this.getMoodTitle(mood),
          reason: `Perfect for ${mood} vibes`,
          reason_type: 'mood_match',
          items: moodContent,
        });
      }
    }
    
    // 4. High-quality new releases
    const newReleases = await this.getQualityNewReleases(category, 10);
    if (newReleases.length > 0) {
      rows.push({
        id: 'cold-start-new',
        title: 'Fresh Releases',
        reason: 'Just dropped',
        reason_type: 'new_release',
        items: newReleases,
      });
    }
    
    // 5. Staff picks / editor's choice
    const staffPicks = await this.getStaffPicks(category, 10);
    if (staffPicks.length > 0) {
      rows.push({
        id: 'cold-start-staff-picks',
        title: 'Lucy\'s Picks',
        reason: 'Hand-selected recommendations',
        reason_type: 'curated',
        items: staffPicks,
      });
    }
    
    return rows;
  }
  
  /**
   * Process taste quiz responses and bootstrap taste profile
   */
  async processTasteQuiz(
    userId: string,
    responses: TasteQuizResponse[]
  ): Promise<void> {
    const genreScores: Record<string, number> = {};
    const moodScores: Record<string, number> = {};
    
    // Combine all quiz questions
    const allQuestions = [...VIDEO_TASTE_QUESTIONS, ...AUDIO_TASTE_QUESTIONS];
    
    for (const response of responses) {
      const question = allQuestions.find(q => q.id === response.questionId);
      if (!question) continue;
      
      for (const optionId of response.selectedOptionIds) {
        const option = question.options.find(o => o.id === optionId);
        if (!option) continue;
        
        // Accumulate genre signals
        for (const genre of option.genreSignals) {
          genreScores[genre] = (genreScores[genre] || 0) + question.weight;
        }
        
        // Accumulate mood signals
        for (const mood of option.moodSignals) {
          moodScores[mood] = (moodScores[mood] || 0) + question.weight;
        }
      }
    }
    
    // Save to taste profile
    await supabase.from('user_taste_profiles').upsert({
      user_id: userId,
      genre_scores: genreScores,
      mood_scores: moodScores,
      media_type_scores: {},
      quiz_completed: true,
      quiz_completed_at: new Date().toISOString(),
      last_computed_at: new Date().toISOString(),
      computation_version: 1,
    });
  }
  
  /**
   * Get onboarding quiz questions
   */
  getQuizQuestions(category?: MediaCategory): TasteQuizQuestion[] {
    if (category === 'video') {
      return VIDEO_TASTE_QUESTIONS.slice(0, this.config.quizQuestionCount);
    }
    
    if (category === 'audio') {
      return AUDIO_TASTE_QUESTIONS.slice(0, this.config.quizQuestionCount);
    }
    
    // Mix of both for general onboarding
    const mixed = [
      VIDEO_TASTE_QUESTIONS[0],
      AUDIO_TASTE_QUESTIONS[0],
      VIDEO_TASTE_QUESTIONS[1],
      AUDIO_TASTE_QUESTIONS[1],
      VIDEO_TASTE_QUESTIONS[2],
    ];
    
    return mixed.slice(0, this.config.quizQuestionCount);
  }
  
  // =========================================================================
  // PRIVATE HELPERS
  // =========================================================================
  
  private async getEventCount(table: string, userId: string): Promise<number> {
    const { count } = await supabase
      .from(table)
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);
    
    return count || 0;
  }
  
  private async getFeaturedJourneys(category?: MediaCategory): Promise<LucyJourney[]> {
    let query = supabase
      .from('lucy_journeys')
      .select('*')
      .eq('is_featured', true)
      .order('popularity_score', { ascending: false })
      .limit(5);
    
    if (category) {
      query = query.contains('media_categories', [category]);
    }
    
    const { data } = await query;
    return (data || []) as LucyJourney[];
  }
  
  private async getPopularContent(
    category?: MediaCategory,
    limit: number = 15
  ): Promise<MediaNode[]> {
    let query = supabase
      .from('media_nodes')
      .select('*')
      .order('popularity_score', { ascending: false })
      .limit(limit);
    
    if (category) {
      query = query.eq('category', category);
    }
    
    const { data } = await query;
    return (data || []) as MediaNode[];
  }
  
  private async getMoodContent(
    mood: string,
    category?: MediaCategory,
    limit: number = 10
  ): Promise<MediaNode[]> {
    // Get mood config
    const { data: moodConfig } = await supabase
      .from('mood_discovery_config')
      .select('genre_weights')
      .eq('mood_slug', mood)
      .single();
    
    if (!moodConfig) return [];
    
    const genreWeights = moodConfig.genre_weights as Record<string, number>;
    const topGenres = Object.keys(genreWeights).slice(0, 3);
    
    // Get content with matching tags
    const { data } = await supabase
      .from('media_node_tags')
      .select(`
        media_nodes!inner (*)
      `)
      .in('media_tags.slug', topGenres)
      .limit(limit);
    
    if (!data) return [];
    
    return data.map((t: any) => t.media_nodes as MediaNode);
  }
  
  private async getQualityNewReleases(
    category?: MediaCategory,
    limit: number = 10
  ): Promise<MediaNode[]> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    let query = supabase
      .from('media_nodes')
      .select('*')
      .gte('release_date', thirtyDaysAgo.toISOString())
      .gte('average_rating', 6.5) // Quality filter
      .order('release_date', { ascending: false })
      .limit(limit);
    
    if (category) {
      query = query.eq('category', category);
    }
    
    const { data } = await query;
    return (data || []) as MediaNode[];
  }
  
  private async getStaffPicks(
    category?: MediaCategory,
    limit: number = 10
  ): Promise<MediaNode[]> {
    // Staff picks stored as a special collection
    const { data } = await supabase
      .from('user_collections')
      .select(`
        user_collection_items (
          media_nodes!inner (*)
        )
      `)
      .eq('collection_type', 'staff_picks')
      .single();
    
    if (!data) {
      // Fallback to high-rated content
      let query = supabase
        .from('media_nodes')
        .select('*')
        .gte('average_rating', 8)
        .order('average_rating', { ascending: false })
        .limit(limit);
      
      if (category) {
        query = query.eq('category', category);
      }
      
      const { data: fallback } = await query;
      return (fallback || []) as MediaNode[];
    }
    
    const items = (data as any).user_collection_items || [];
    return items.map((i: any) => i.media_nodes as MediaNode).slice(0, limit);
  }
  
  private getMoodTitle(mood: string): string {
    const titles: Record<string, string> = {
      'chill': 'Chill Vibes',
      'discover': 'Discover Something New',
      'focus': 'Focus Mode',
      'party': 'Party Time',
      'romance': 'Date Night',
      'adventure': 'Adventure Awaits',
      'cozy': 'Cozy Night In',
      'energetic': 'Get Energized',
    };
    
    return titles[mood] || `${mood.charAt(0).toUpperCase()}${mood.slice(1)} Mood`;
  }
}

// =============================================================================
// EXPORT
// =============================================================================

export function createColdStartEngine(
  config?: Partial<ColdStartConfig>
): ColdStartEngine {
  return new ColdStartEngine(config);
}
