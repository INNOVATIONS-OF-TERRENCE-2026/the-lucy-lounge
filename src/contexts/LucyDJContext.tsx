import { createContext, useContext, useState, useEffect, useCallback, useMemo, ReactNode } from 'react';
import { useGlobalSpotify } from './GlobalSpotifyContext';

// Content suggestion item
interface SuggestedItem {
  id: string;
  spotifyId: string;
  genre: string;
  title: string;
  reason: string;
  contentType: 'playlist' | 'album';
  confidence: number; // 0-100
}

// Context snapshot for intelligent suggestions
interface ContextSnapshot {
  currentGenre: string | null;
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'latenight';
  currentPage: string;
  sessionStartTime: number;
  recentSelections: string[];
  skipCount: number;
  completedListens: string[];
}

interface LucyDJState {
  isEnabled: boolean;
  contextSnapshot: ContextSnapshot;
  suggestedQueue: SuggestedItem[];
  currentSuggestion: SuggestedItem | null;
  confidenceScore: number;
  showSuggestionDrawer: boolean;
}

interface LucyDJContextType {
  state: LucyDJState;
  toggleEnabled: () => void;
  dismissSuggestion: () => void;
  openSuggestionDrawer: () => void;
  closeSuggestionDrawer: () => void;
  recordSelection: (genre: string) => void;
  recordSkip: () => void;
  recordCompletion: (genre: string) => void;
  getVibeMessage: () => string | null;
  isLucyPick: (genre: string) => boolean;
}

const LucyDJContext = createContext<LucyDJContextType | null>(null);

// Curated suggestion database
const SUGGESTION_DATABASE: Omit<SuggestedItem, 'confidence'>[] = [
  { id: 'focus-lofi', spotifyId: '37i9dQZF1DWWQRwui0ExPn', genre: 'lofi', title: 'Lo-Fi Beats', reason: 'Perfect for focused work', contentType: 'playlist' },
  { id: 'chill-jazz', spotifyId: '37i9dQZF1DX0SM0LYsmbMT', genre: 'jazz', title: 'Jazz Vibes', reason: 'Smooth background energy', contentType: 'playlist' },
  { id: 'soul-rnb', spotifyId: '37i9dQZF1DX4SBhb3fqCJd', genre: 'rnb', title: 'R&B Soul', reason: 'Soulful vibes for creativity', contentType: 'playlist' },
  { id: 'deep-ambient', spotifyId: '37i9dQZF1DX3Ogo9pFvBkY', genre: 'ambient', title: 'Ambient Chill', reason: 'Deep focus atmosphere', contentType: 'playlist' },
  { id: 'energy-rap', spotifyId: '37i9dQZF1DX0XUsuxWHRQd', genre: 'rap', title: 'Rap Hits', reason: 'High energy boost', contentType: 'playlist' },
  { id: 'smooth-vibes', spotifyId: '37i9dQZF1DWUzFXarNiofw', genre: 'smooth', title: 'Smooth Vibes', reason: 'Relaxed productivity', contentType: 'playlist' },
];

// Time-based genre preferences
const TIME_PREFERENCES: Record<ContextSnapshot['timeOfDay'], string[]> = {
  morning: ['lofi', 'jazz', 'ambient'],
  afternoon: ['rnb', 'jazz', 'lofi'],
  evening: ['rnb', 'smooth', 'jazz'],
  latenight: ['ambient', 'lofi', 'smooth'],
};

// Vibe messages based on context
const VIBE_MESSAGES: Record<string, string[]> = {
  morning: ['☀️ Morning Focus Mode', '🌅 Fresh Start Vibes'],
  afternoon: ['💼 Productivity Flow', '⚡ Hustle Mode Active'],
  evening: ['🌙 Evening Wind-Down', '✨ Chill Session'],
  latenight: ['🌃 Late Night Energy', '🎧 Deep Focus Zone'],
  lofi: ['🎵 Lo-Fi Flow Detected'],
  jazz: ['🎷 Jazz Mood Engaged'],
  rnb: ['💜 R&B Soul Session'],
  ambient: ['🌊 Ambient Atmosphere'],
  rap: ['🔥 High Energy Mode'],
  smooth: ['😌 Smooth Vibes Only'],
};

function getTimeOfDay(): ContextSnapshot['timeOfDay'] {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 22) return 'evening';
  return 'latenight';
}

export const LucyDJProvider = ({ children }: { children: ReactNode }) => {
  const { state: spotifyState } = useGlobalSpotify();
  
  const [state, setState] = useState<LucyDJState>({
    isEnabled: true,
    contextSnapshot: {
      currentGenre: null,
      timeOfDay: getTimeOfDay(),
      currentPage: 'chat',
      sessionStartTime: Date.now(),
      recentSelections: [],
      skipCount: 0,
      completedListens: [],
    },
    suggestedQueue: [],
    currentSuggestion: null,
    confidenceScore: 0,
    showSuggestionDrawer: false,
  });

  // HC-02: READ-ONLY - Only observe Spotify state, never modify
  useEffect(() => {
    if (spotifyState.currentGenre) {
      setState(prev => ({
        ...prev,
        contextSnapshot: {
          ...prev.contextSnapshot,
          currentGenre: spotifyState.currentGenre,
          timeOfDay: getTimeOfDay(),
        },
      }));
    }
  }, [spotifyState.currentGenre]);

  // Generate intelligent suggestions based on context (READ-ONLY)
  useEffect(() => {
    const { contextSnapshot } = state;
    const timePrefs = TIME_PREFERENCES[contextSnapshot.timeOfDay];
    const recentGenres = contextSnapshot.recentSelections.slice(-3);
    
    // Score each suggestion
    const scoredSuggestions = SUGGESTION_DATABASE.map(item => {
      let score = 50; // Base score
      
      // Time of day preference boost
      if (timePrefs.includes(item.genre)) score += 20;
      
      // Avoid recently played
      if (recentGenres.includes(item.genre)) score -= 30;
      
      // Boost completed listens (user liked it)
      if (contextSnapshot.completedListens.includes(item.genre)) score += 15;
      
      // Current genre affinity
      if (contextSnapshot.currentGenre === item.genre) score -= 10; // Variety
      
      return { ...item, confidence: Math.min(100, Math.max(0, score)) };
    });
    
    // Sort by confidence and take top suggestions
    const sorted = scoredSuggestions.sort((a, b) => b.confidence - a.confidence);
    const topSuggestion = sorted[0];
    
    setState(prev => ({
      ...prev,
      suggestedQueue: sorted.slice(0, 3),
      currentSuggestion: topSuggestion.confidence > 60 ? topSuggestion : null,
      confidenceScore: topSuggestion.confidence,
    }));
  }, [state.contextSnapshot]);

  const toggleEnabled = useCallback(() => {
    setState(prev => ({ ...prev, isEnabled: !prev.isEnabled }));
  }, []);

  const dismissSuggestion = useCallback(() => {
    setState(prev => ({ ...prev, currentSuggestion: null }));
  }, []);

  const openSuggestionDrawer = useCallback(() => {
    setState(prev => ({ ...prev, showSuggestionDrawer: true }));
  }, []);

  const closeSuggestionDrawer = useCallback(() => {
    setState(prev => ({ ...prev, showSuggestionDrawer: false }));
  }, []);

  // Record user actions for learning (session only - HC-02 compliant)
  const recordSelection = useCallback((genre: string) => {
    setState(prev => ({
      ...prev,
      contextSnapshot: {
        ...prev.contextSnapshot,
        recentSelections: [...prev.contextSnapshot.recentSelections.slice(-9), genre],
      },
    }));
  }, []);

  const recordSkip = useCallback(() => {
    setState(prev => ({
      ...prev,
      contextSnapshot: {
        ...prev.contextSnapshot,
        skipCount: prev.contextSnapshot.skipCount + 1,
      },
    }));
  }, []);

  const recordCompletion = useCallback((genre: string) => {
    setState(prev => ({
      ...prev,
      contextSnapshot: {
        ...prev.contextSnapshot,
        completedListens: [...prev.contextSnapshot.completedListens.slice(-9), genre],
      },
    }));
  }, []);

  // Get contextual vibe message
  const getVibeMessage = useCallback((): string | null => {
    if (!state.isEnabled) return null;
    
    const { contextSnapshot } = state;
    const messages: string[] = [];
    
    // Time-based message
    const timeMessages = VIBE_MESSAGES[contextSnapshot.timeOfDay];
    if (timeMessages) messages.push(...timeMessages);
    
    // Genre-based message
    if (contextSnapshot.currentGenre) {
      const genreMessages = VIBE_MESSAGES[contextSnapshot.currentGenre];
      if (genreMessages) messages.push(...genreMessages);
    }
    
    return messages.length > 0 ? messages[Math.floor(Math.random() * messages.length)] : null;
  }, [state.isEnabled, state.contextSnapshot]);

  // Check if a genre is a "Lucy Pick" for current context
  const isLucyPick = useCallback((genre: string): boolean => {
    if (!state.isEnabled) return false;
    const timePrefs = TIME_PREFERENCES[state.contextSnapshot.timeOfDay];
    return timePrefs.includes(genre.toLowerCase());
  }, [state.isEnabled, state.contextSnapshot.timeOfDay]);

  const value = useMemo(() => ({
    state,
    toggleEnabled,
    dismissSuggestion,
    openSuggestionDrawer,
    closeSuggestionDrawer,
    recordSelection,
    recordSkip,
    recordCompletion,
    getVibeMessage,
    isLucyPick,
  }), [state, toggleEnabled, dismissSuggestion, openSuggestionDrawer, closeSuggestionDrawer, recordSelection, recordSkip, recordCompletion, getVibeMessage, isLucyPick]);

  return (
    <LucyDJContext.Provider value={value}>
      {children}
    </LucyDJContext.Provider>
  );
};

export const useLucyDJ = () => {
  const context = useContext(LucyDJContext);
  if (!context) {
    throw new Error('useLucyDJ must be used within LucyDJProvider');
  }
  return context;
};
