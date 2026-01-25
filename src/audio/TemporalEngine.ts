/**
 * ┌─────────────────────────────────────────────────────────────────────────────┐
 * │ THE LUCY LOUNGE — TIME-OF-DAY JOURNEY ENGINE                               │
 * │                                                                             │
 * │ Temporal recommendation system that adapts to circadian patterns           │
 * │ Morning focus. Afternoon productivity. Evening wind-down. Night escape.    │
 * │                                                                             │
 * │ Lucy knows when you need what before you do.                               │
 * └─────────────────────────────────────────────────────────────────────────────┘
 */

import type { MediaNode, MediaCategory, RecommendationRow, LucyJourney } from '@/media/types';

// =============================================================================
// TEMPORAL TYPES
// =============================================================================

export type TimeOfDay = 'early_morning' | 'morning' | 'afternoon' | 'evening' | 'night' | 'late_night';
export type DayType = 'weekday' | 'weekend' | 'holiday';
export type Season = 'spring' | 'summer' | 'fall' | 'winter';

export interface TemporalContext {
  timeOfDay: TimeOfDay;
  hour: number;
  dayType: DayType;
  dayOfWeek: number;          // 0 = Sunday
  season: Season;
  isHoliday: boolean;
  
  // User context
  timezone: string;
  localTime: Date;
  
  // Derived
  isMorningCommute: boolean;
  isEveningCommute: boolean;
  isWorkHours: boolean;
  isRelaxTime: boolean;
}

export interface TemporalProfile {
  // Preferred content by time
  morningPreferences: MediaCategory[];
  afternoonPreferences: MediaCategory[];
  eveningPreferences: MediaCategory[];
  nightPreferences: MediaCategory[];
  
  // Mood patterns
  typicalMorningMood: string;
  typicalEveningMood: string;
  
  // Activity patterns
  commuteHours?: { start: number; end: number }[];
  workHours?: { start: number; end: number };
  sleepHours?: { start: number; end: number };
}

export interface TemporalJourney {
  id: string;
  name: string;
  description: string;
  timeOfDay: TimeOfDay[];
  mood: string;
  category?: MediaCategory;
  duration: number;               // minutes
  steps: TemporalJourneyStep[];
  artwork?: string;
}

export interface TemporalJourneyStep {
  order: number;
  mood: string;
  energy: number;                 // 0-1
  suggestedGenres: string[];
  suggestedMoods: string[];
  duration: number;               // minutes
  transitionType: 'gradual' | 'shift' | 'surprise';
}

// =============================================================================
// TIME UTILITIES
// =============================================================================

export function getCurrentTemporalContext(timezone?: string): TemporalContext {
  const tz = timezone || Intl.DateTimeFormat().resolvedOptions().timeZone;
  const now = new Date();
  
  // Get local time in timezone
  const localTime = new Date(now.toLocaleString('en-US', { timeZone: tz }));
  const hour = localTime.getHours();
  const dayOfWeek = localTime.getDay();
  const month = localTime.getMonth();
  
  // Determine time of day
  let timeOfDay: TimeOfDay;
  if (hour >= 5 && hour < 7) timeOfDay = 'early_morning';
  else if (hour >= 7 && hour < 12) timeOfDay = 'morning';
  else if (hour >= 12 && hour < 17) timeOfDay = 'afternoon';
  else if (hour >= 17 && hour < 21) timeOfDay = 'evening';
  else if (hour >= 21 || hour < 1) timeOfDay = 'night';
  else timeOfDay = 'late_night';
  
  // Determine day type
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
  const dayType: DayType = isWeekend ? 'weekend' : 'weekday';
  
  // Determine season (Northern Hemisphere)
  let season: Season;
  if (month >= 2 && month <= 4) season = 'spring';
  else if (month >= 5 && month <= 7) season = 'summer';
  else if (month >= 8 && month <= 10) season = 'fall';
  else season = 'winter';
  
  // Derived contexts
  const isMorningCommute = !isWeekend && hour >= 7 && hour <= 9;
  const isEveningCommute = !isWeekend && hour >= 17 && hour <= 19;
  const isWorkHours = !isWeekend && hour >= 9 && hour <= 17;
  const isRelaxTime = isWeekend || hour >= 19 || hour < 7;
  
  return {
    timeOfDay,
    hour,
    dayType,
    dayOfWeek,
    season,
    isHoliday: false, // Would need holiday API
    timezone: tz,
    localTime,
    isMorningCommute,
    isEveningCommute,
    isWorkHours,
    isRelaxTime,
  };
}

// =============================================================================
// TEMPORAL JOURNEY TEMPLATES
// =============================================================================

const TEMPORAL_JOURNEYS: TemporalJourney[] = [
  // ===== MORNING =====
  {
    id: 'morning-energize',
    name: 'Morning Energizer',
    description: 'Start your day with building energy',
    timeOfDay: ['early_morning', 'morning'],
    mood: 'energizing',
    duration: 45,
    steps: [
      { order: 1, mood: 'calm', energy: 0.3, suggestedGenres: ['ambient', 'classical'], suggestedMoods: ['peaceful', 'gentle'], duration: 10, transitionType: 'gradual' },
      { order: 2, mood: 'uplifting', energy: 0.5, suggestedGenres: ['acoustic', 'indie'], suggestedMoods: ['hopeful', 'warm'], duration: 15, transitionType: 'gradual' },
      { order: 3, mood: 'energetic', energy: 0.8, suggestedGenres: ['pop', 'indie-pop'], suggestedMoods: ['energetic', 'motivated'], duration: 20, transitionType: 'gradual' },
    ],
  },
  {
    id: 'morning-focus',
    name: 'Focus Flow',
    description: 'Enter deep work mode',
    timeOfDay: ['morning', 'afternoon'],
    mood: 'focused',
    duration: 120,
    steps: [
      { order: 1, mood: 'settling', energy: 0.4, suggestedGenres: ['ambient', 'lofi'], suggestedMoods: ['calm', 'focused'], duration: 20, transitionType: 'gradual' },
      { order: 2, mood: 'deep_focus', energy: 0.5, suggestedGenres: ['lofi', 'electronic'], suggestedMoods: ['focused', 'productive'], duration: 80, transitionType: 'gradual' },
      { order: 3, mood: 'emergence', energy: 0.6, suggestedGenres: ['ambient', 'post-rock'], suggestedMoods: ['reflective', 'accomplished'], duration: 20, transitionType: 'gradual' },
    ],
  },
  
  // ===== AFTERNOON =====
  {
    id: 'afternoon-groove',
    name: 'Afternoon Groove',
    description: 'Keep the momentum going',
    timeOfDay: ['afternoon'],
    mood: 'groovy',
    duration: 60,
    steps: [
      { order: 1, mood: 'smooth', energy: 0.6, suggestedGenres: ['r&b', 'soul'], suggestedMoods: ['smooth', 'confident'], duration: 20, transitionType: 'gradual' },
      { order: 2, mood: 'groovy', energy: 0.7, suggestedGenres: ['funk', 'disco'], suggestedMoods: ['groovy', 'fun'], duration: 25, transitionType: 'gradual' },
      { order: 3, mood: 'cool', energy: 0.5, suggestedGenres: ['jazz', 'neo-soul'], suggestedMoods: ['cool', 'sophisticated'], duration: 15, transitionType: 'gradual' },
    ],
  },
  
  // ===== EVENING =====
  {
    id: 'evening-unwind',
    name: 'Evening Unwind',
    description: 'Decompress after a long day',
    timeOfDay: ['evening'],
    mood: 'relaxing',
    duration: 60,
    steps: [
      { order: 1, mood: 'release', energy: 0.5, suggestedGenres: ['indie', 'folk'], suggestedMoods: ['reflective', 'peaceful'], duration: 15, transitionType: 'gradual' },
      { order: 2, mood: 'mellow', energy: 0.4, suggestedGenres: ['acoustic', 'singer-songwriter'], suggestedMoods: ['mellow', 'warm'], duration: 25, transitionType: 'gradual' },
      { order: 3, mood: 'calm', energy: 0.3, suggestedGenres: ['ambient', 'classical'], suggestedMoods: ['calm', 'serene'], duration: 20, transitionType: 'gradual' },
    ],
  },
  {
    id: 'evening-social',
    name: 'Social Hour',
    description: 'Perfect for dinner parties and gatherings',
    timeOfDay: ['evening'],
    mood: 'social',
    duration: 90,
    steps: [
      { order: 1, mood: 'welcoming', energy: 0.5, suggestedGenres: ['jazz', 'bossa-nova'], suggestedMoods: ['warm', 'inviting'], duration: 30, transitionType: 'gradual' },
      { order: 2, mood: 'conversational', energy: 0.6, suggestedGenres: ['soul', 'r&b'], suggestedMoods: ['smooth', 'sophisticated'], duration: 35, transitionType: 'gradual' },
      { order: 3, mood: 'vibrant', energy: 0.7, suggestedGenres: ['funk', 'disco'], suggestedMoods: ['fun', 'celebratory'], duration: 25, transitionType: 'gradual' },
    ],
  },
  
  // ===== NIGHT =====
  {
    id: 'night-chill',
    name: 'Late Night Chill',
    description: 'Wind down into the night',
    timeOfDay: ['night', 'late_night'],
    mood: 'chill',
    duration: 60,
    steps: [
      { order: 1, mood: 'nocturnal', energy: 0.4, suggestedGenres: ['lofi', 'chillhop'], suggestedMoods: ['chill', 'nocturnal'], duration: 20, transitionType: 'gradual' },
      { order: 2, mood: 'dreamy', energy: 0.3, suggestedGenres: ['ambient', 'downtempo'], suggestedMoods: ['dreamy', 'ethereal'], duration: 25, transitionType: 'gradual' },
      { order: 3, mood: 'sleep', energy: 0.1, suggestedGenres: ['ambient', 'drone'], suggestedMoods: ['peaceful', 'sleepy'], duration: 15, transitionType: 'gradual' },
    ],
  },
  {
    id: 'night-party',
    name: 'Night Out',
    description: 'Building energy for the night',
    timeOfDay: ['night'],
    mood: 'party',
    duration: 120,
    steps: [
      { order: 1, mood: 'pregame', energy: 0.6, suggestedGenres: ['hip-hop', 'r&b'], suggestedMoods: ['confident', 'excited'], duration: 30, transitionType: 'gradual' },
      { order: 2, mood: 'hype', energy: 0.8, suggestedGenres: ['dance', 'hip-hop'], suggestedMoods: ['hype', 'energetic'], duration: 50, transitionType: 'shift' },
      { order: 3, mood: 'peak', energy: 1.0, suggestedGenres: ['edm', 'house'], suggestedMoods: ['euphoric', 'wild'], duration: 40, transitionType: 'gradual' },
    ],
  },
  
  // ===== WEEKEND SPECIALS =====
  {
    id: 'sunday-morning',
    name: 'Sunday Morning',
    description: 'Lazy weekend vibes',
    timeOfDay: ['early_morning', 'morning'],
    mood: 'lazy',
    duration: 90,
    steps: [
      { order: 1, mood: 'awakening', energy: 0.2, suggestedGenres: ['ambient', 'classical'], suggestedMoods: ['gentle', 'peaceful'], duration: 30, transitionType: 'gradual' },
      { order: 2, mood: 'cozy', energy: 0.3, suggestedGenres: ['acoustic', 'folk'], suggestedMoods: ['warm', 'nostalgic'], duration: 35, transitionType: 'gradual' },
      { order: 3, mood: 'content', energy: 0.4, suggestedGenres: ['indie', 'singer-songwriter'], suggestedMoods: ['content', 'happy'], duration: 25, transitionType: 'gradual' },
    ],
  },
  
  // ===== COMMUTE =====
  {
    id: 'morning-commute',
    name: 'Morning Commute',
    description: 'Power through your commute',
    timeOfDay: ['morning'],
    mood: 'commute',
    duration: 45,
    steps: [
      { order: 1, mood: 'wake', energy: 0.5, suggestedGenres: ['pop', 'indie-pop'], suggestedMoods: ['upbeat', 'energizing'], duration: 15, transitionType: 'gradual' },
      { order: 2, mood: 'drive', energy: 0.7, suggestedGenres: ['rock', 'electronic'], suggestedMoods: ['powerful', 'motivated'], duration: 20, transitionType: 'shift' },
      { order: 3, mood: 'arrive', energy: 0.6, suggestedGenres: ['hip-hop', 'pop'], suggestedMoods: ['confident', 'ready'], duration: 10, transitionType: 'gradual' },
    ],
  },
  {
    id: 'evening-commute',
    name: 'Evening Commute',
    description: 'Transition from work to life',
    timeOfDay: ['evening'],
    mood: 'decompression',
    duration: 45,
    steps: [
      { order: 1, mood: 'release', energy: 0.5, suggestedGenres: ['indie', 'alternative'], suggestedMoods: ['reflective', 'processing'], duration: 15, transitionType: 'gradual' },
      { order: 2, mood: 'transition', energy: 0.4, suggestedGenres: ['r&b', 'soul'], suggestedMoods: ['smooth', 'relaxing'], duration: 20, transitionType: 'gradual' },
      { order: 3, mood: 'home', energy: 0.3, suggestedGenres: ['acoustic', 'lofi'], suggestedMoods: ['peaceful', 'content'], duration: 10, transitionType: 'gradual' },
    ],
  },
];

// =============================================================================
// TEMPORAL ENGINE IMPLEMENTATION
// =============================================================================

export class TemporalEngine {
  private context: TemporalContext;
  private userProfile: TemporalProfile | null = null;
  
  constructor() {
    this.context = getCurrentTemporalContext();
    
    // Update context every minute
    if (typeof window !== 'undefined') {
      setInterval(() => {
        this.context = getCurrentTemporalContext();
      }, 60000);
    }
  }
  
  // ===========================================================================
  // CONTEXT
  // ===========================================================================
  
  getContext(): TemporalContext {
    return this.context;
  }
  
  setUserProfile(profile: TemporalProfile): void {
    this.userProfile = profile;
  }
  
  // ===========================================================================
  // JOURNEY SELECTION
  // ===========================================================================
  
  /**
   * Get the best journey for current time
   */
  getCurrentJourney(): TemporalJourney | null {
    const { timeOfDay, dayType, isMorningCommute, isEveningCommute } = this.context;
    
    // Commute-specific journeys
    if (isMorningCommute) {
      return TEMPORAL_JOURNEYS.find(j => j.id === 'morning-commute') || null;
    }
    if (isEveningCommute) {
      return TEMPORAL_JOURNEYS.find(j => j.id === 'evening-commute') || null;
    }
    
    // Weekend morning
    if (dayType === 'weekend' && timeOfDay === 'morning') {
      return TEMPORAL_JOURNEYS.find(j => j.id === 'sunday-morning') || null;
    }
    
    // Time-based journeys
    const candidates = TEMPORAL_JOURNEYS.filter(j => j.timeOfDay.includes(timeOfDay));
    
    // Pick based on typical patterns
    if (candidates.length > 0) {
      // Default selections
      if (timeOfDay === 'morning' || timeOfDay === 'early_morning') {
        return candidates.find(j => j.mood === 'energizing' || j.mood === 'focused') || candidates[0];
      }
      if (timeOfDay === 'afternoon') {
        return candidates.find(j => j.mood === 'groovy' || j.mood === 'focused') || candidates[0];
      }
      if (timeOfDay === 'evening') {
        return candidates.find(j => j.mood === 'relaxing') || candidates[0];
      }
      if (timeOfDay === 'night' || timeOfDay === 'late_night') {
        return candidates.find(j => j.mood === 'chill') || candidates[0];
      }
    }
    
    return null;
  }
  
  /**
   * Get all journeys available for current time
   */
  getAvailableJourneys(): TemporalJourney[] {
    const { timeOfDay } = this.context;
    return TEMPORAL_JOURNEYS.filter(j => j.timeOfDay.includes(timeOfDay));
  }
  
  /**
   * Get all journey templates
   */
  getAllJourneys(): TemporalJourney[] {
    return [...TEMPORAL_JOURNEYS];
  }
  
  // ===========================================================================
  // MOOD RECOMMENDATIONS
  // ===========================================================================
  
  /**
   * Get recommended mood for current time
   */
  getCurrentMood(): string {
    const { timeOfDay, isWorkHours, isRelaxTime } = this.context;
    
    if (isWorkHours) return 'focused';
    if (isRelaxTime) return 'relaxed';
    
    switch (timeOfDay) {
      case 'early_morning': return 'peaceful';
      case 'morning': return 'energizing';
      case 'afternoon': return 'productive';
      case 'evening': return 'unwinding';
      case 'night': return 'chill';
      case 'late_night': return 'dreamy';
      default: return 'neutral';
    }
  }
  
  /**
   * Get energy level recommendation (0-1)
   */
  getCurrentEnergyLevel(): number {
    const { hour } = this.context;
    
    // Energy curve throughout the day
    if (hour >= 5 && hour < 7) return 0.3;    // Early morning - low
    if (hour >= 7 && hour < 10) return 0.6;   // Morning - rising
    if (hour >= 10 && hour < 12) return 0.8;  // Late morning - peak
    if (hour >= 12 && hour < 14) return 0.5;  // Post-lunch dip
    if (hour >= 14 && hour < 17) return 0.7;  // Afternoon - productive
    if (hour >= 17 && hour < 20) return 0.5;  // Evening - winding down
    if (hour >= 20 && hour < 23) return 0.3;  // Night - low
    return 0.1;                                // Late night - very low
  }
  
  // ===========================================================================
  // CONTENT RECOMMENDATIONS
  // ===========================================================================
  
  /**
   * Get recommended genres for current time
   */
  getRecommendedGenres(): string[] {
    const { timeOfDay, isWorkHours, dayType } = this.context;
    
    if (isWorkHours) {
      return ['lofi', 'ambient', 'classical', 'electronic'];
    }
    
    if (dayType === 'weekend') {
      switch (timeOfDay) {
        case 'morning': return ['acoustic', 'folk', 'indie', 'jazz'];
        case 'afternoon': return ['pop', 'rock', 'soul', 'funk'];
        case 'evening': return ['r&b', 'soul', 'jazz', 'disco'];
        case 'night': return ['hip-hop', 'electronic', 'dance'];
      }
    }
    
    switch (timeOfDay) {
      case 'early_morning': return ['ambient', 'classical', 'acoustic'];
      case 'morning': return ['pop', 'indie-pop', 'upbeat'];
      case 'afternoon': return ['hip-hop', 'r&b', 'funk', 'soul'];
      case 'evening': return ['jazz', 'acoustic', 'indie', 'singer-songwriter'];
      case 'night': return ['lofi', 'chillhop', 'ambient', 'downtempo'];
      case 'late_night': return ['ambient', 'drone', 'meditation'];
      default: return ['pop', 'indie', 'r&b'];
    }
  }
  
  /**
   * Get recommended content categories
   */
  getRecommendedCategories(): MediaCategory[] {
    const { timeOfDay, isWorkHours, isRelaxTime } = this.context;
    
    // Work hours: audio-focused
    if (isWorkHours) {
      return ['audio', 'podcast'];
    }
    
    // Relax time: more video
    if (isRelaxTime) {
      return ['video', 'audio', 'podcast'];
    }
    
    // Time-based
    switch (timeOfDay) {
      case 'early_morning':
      case 'morning':
        return ['audio', 'podcast'];
      case 'afternoon':
        return ['audio', 'video', 'podcast'];
      case 'evening':
        return ['video', 'audio'];
      case 'night':
      case 'late_night':
        return ['video', 'audio'];
      default:
        return ['audio', 'video', 'podcast'];
    }
  }
  
  // ===========================================================================
  // JOURNEY TO LUCY JOURNEY CONVERSION
  // ===========================================================================
  
  /**
   * Convert temporal journey to LucyJourney format for UI
   */
  toLucyJourney(journey: TemporalJourney): LucyJourney {
    return {
      id: journey.id,
      name: journey.name,
      description: journey.description,
      mood_arc: journey.steps.map(s => s.mood),
      duration_minutes: journey.duration,
      energy_curve: journey.steps.map(s => s.energy),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      // Steps would be populated with actual content
      steps: journey.steps.map((step, index) => ({
        id: `${journey.id}-step-${index}`,
        journey_id: journey.id,
        order: step.order,
        media_node_id: '', // To be populated
        duration_target: step.duration * 60, // Convert to seconds
        mood_contribution: step.mood,
        created_at: new Date().toISOString(),
      })),
    };
  }
  
  /**
   * Build recommendation rows based on current time
   */
  buildTemporalRows(): RecommendationRow[] {
    const rows: RecommendationRow[] = [];
    const { timeOfDay } = this.context;
    const mood = this.getCurrentMood();
    const genres = this.getRecommendedGenres();
    
    // Time-based row
    const timeLabels: Record<TimeOfDay, string> = {
      early_morning: 'Early Morning Calm',
      morning: 'Morning Energy',
      afternoon: 'Afternoon Vibes',
      evening: 'Evening Unwind',
      night: 'Night Chill',
      late_night: 'Late Night Dreams',
    };
    
    rows.push({
      id: `temporal-${timeOfDay}`,
      title: timeLabels[timeOfDay],
      reason: `Perfect for ${new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`,
      reason_type: 'mood',
      items: [], // To be populated with actual content
    });
    
    // Mood-based row
    rows.push({
      id: `mood-${mood}`,
      title: `${mood.charAt(0).toUpperCase() + mood.slice(1)} Mode`,
      reason: 'Matches your current vibe',
      reason_type: 'mood',
      items: [],
    });
    
    // Genre-based row
    if (genres.length > 0) {
      rows.push({
        id: `genre-${genres[0]}`,
        title: `${genres[0].charAt(0).toUpperCase() + genres[0].slice(1)} picks`,
        reason: `Trending in ${genres[0]}`,
        reason_type: 'trending',
        items: [],
      });
    }
    
    return rows;
  }
}

// =============================================================================
// SINGLETON INSTANCE
// =============================================================================

let engineInstance: TemporalEngine | null = null;

export function getTemporalEngine(): TemporalEngine {
  if (!engineInstance) {
    engineInstance = new TemporalEngine();
  }
  return engineInstance;
}
