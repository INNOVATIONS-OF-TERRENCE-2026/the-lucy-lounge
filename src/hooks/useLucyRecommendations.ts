import { useMemo } from 'react';
import { RecentlyPlayedItem } from './useRecentlyPlayed';
import { FavoriteItem } from './useFavorites';

export type MoodType = 'all' | 'focus' | 'study' | 'hustle' | 'late-night' | 'chill';

export interface ContentItem {
  id: string;
  title: string;
  subtitle: string;
  genre: string;
  contentType: 'playlist' | 'album';
  mood?: MoodType[];
}

// Mood mapping based on genre
export const getMoodTags = (genre: string, title: string): MoodType[] => {
  const moods: MoodType[] = [];
  const lowerTitle = title.toLowerCase();
  const lowerGenre = genre.toLowerCase();
  
  // Focus moods: Lo-Fi, Jazz, Instrumental, Ambient
  if (
    lowerGenre.includes('vibes') && 
    (lowerTitle.includes('lo-fi') || lowerTitle.includes('jazz') || lowerTitle.includes('ambient'))
  ) {
    moods.push('focus');
  }
  if (lowerGenre === 'vibes') {
    moods.push('focus'); // All vibes are good for focus
  }
  
  // LO-FI genre always gets Focus, Study, and Late Night moods
  if (lowerGenre === 'lofi') {
    moods.push('focus');
    moods.push('study');
    moods.push('late-night');
  }
  
  // Study mood: deep focus, minimal distraction
  if (
    lowerTitle.includes('instrumental') ||
    lowerTitle.includes('ambient') ||
    lowerTitle.includes('lo-fi') ||
    lowerTitle.includes('lofi')
  ) {
    moods.push('study');
  }
  // Content tagged with focus also qualifies for study
  if (lowerGenre === 'vibes' && (lowerTitle.includes('jazz') || lowerTitle.includes('ambient'))) {
    moods.push('study');
  }
  
  // Hustle moods: Rap, Motivation
  if (lowerGenre === 'rap' || lowerGenre === 'smooth-rap') {
    moods.push('hustle');
  }
  if (lowerTitle.includes('hustle') || lowerTitle.includes('money') || lowerTitle.includes('rich')) {
    moods.push('hustle');
  }
  
  // Late Night moods: R&B, Soul, Smooth Rap, Lo-Fi
  if (lowerTitle.includes('r&b') || lowerTitle.includes('smooth') || lowerTitle.includes('vibes')) {
    moods.push('late-night');
  }
  if (lowerGenre === 'smooth-rap') {
    moods.push('late-night');
  }
  if (lowerGenre === 'rnb') {
    moods.push('late-night');
  }
  
  // Chill mood: R&B, Smooth Rap, Lo-Fi, relaxed content
  if (lowerGenre === 'rnb' || lowerGenre === 'smooth-rap' || lowerGenre === 'lofi') {
    moods.push('chill');
  }
  if (lowerTitle.includes('chill') || lowerTitle.includes('relax') || lowerTitle.includes('smooth') || lowerTitle.includes('vibe')) {
    moods.push('chill');
  }
  
  // Remove duplicates
  return moods.length > 0 ? [...new Set(moods)] : ['all'];
};

interface UseLucyRecommendationsProps {
  allContent: ContentItem[];
  recentlyPlayed: RecentlyPlayedItem[];
  favorites: FavoriteItem[];
  activeMood: MoodType;
}

export const useLucyRecommendations = ({
  allContent,
  recentlyPlayed,
  favorites,
  activeMood
}: UseLucyRecommendationsProps) => {
  const recommendations = useMemo(() => {
    if (recentlyPlayed.length === 0 && favorites.length === 0) {
      return [];
    }

    const recentIds = new Set(recentlyPlayed.map(r => r.id));
    const favoriteIds = new Set(favorites.map(f => f.id));
    const recentGenres = new Set(recentlyPlayed.map(r => r.genre));
    const favoriteGenres = new Set(favorites.map(f => f.genre));

    // Score each content item
    const scored = allContent.map(item => {
      let score = 0;
      const itemMoods = getMoodTags(item.genre, item.title);
      
      // Highest priority: Favorites
      if (favoriteIds.has(item.id)) {
        score += 100;
      }
      
      // High priority: Recently played
      if (recentIds.has(item.id)) {
        score += 50;
      }
      
      // Medium priority: Same genre as favorites
      if (favoriteGenres.has(item.genre)) {
        score += 30;
      }
      
      // Medium priority: Same genre as recent
      if (recentGenres.has(item.genre)) {
        score += 20;
      }
      
      // Mood match bonus
      if (activeMood !== 'all' && itemMoods.includes(activeMood)) {
        score += 25;
      }
      
      // CHILL MOOD PRIORITY RANKING
      // When Chill is active, apply genre-specific priority boosts
      if (activeMood === 'chill') {
        const lowerGenre = item.genre.toLowerCase();
        // R&B: highest priority for chill
        if (lowerGenre === 'rnb') {
          score += 60;
        }
        // Smooth Rap: second priority
        else if (lowerGenre === 'smooth-rap') {
          score += 45;
        }
        // Lo-Fi: third priority (background focus)
        else if (lowerGenre === 'lofi') {
          score += 30;
        }
        // De-prioritize high-energy RAP
        else if (lowerGenre === 'rap') {
          score -= 20;
        }
        
        // Boost recently played/favorites if they match chill genres
        const chillGenres = ['rnb', 'smooth-rap', 'lofi'];
        if (recentIds.has(item.id) && chillGenres.includes(lowerGenre)) {
          score += 15;
        }
        if (favoriteIds.has(item.id) && chillGenres.includes(lowerGenre)) {
          score += 20;
        }
      }
      
      return { item, score, moods: itemMoods };
    });

    // Filter by mood if active
    let filtered = scored;
    if (activeMood !== 'all') {
      filtered = scored.filter(s => s.moods.includes(activeMood));
    }

    // Sort by score, take top 5, exclude items user already has in favorites
    return filtered
      .filter(s => s.score > 0 && !favoriteIds.has(s.item.id))
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)
      .map(s => s.item);
  }, [allContent, recentlyPlayed, favorites, activeMood]);

  return { recommendations };
};
