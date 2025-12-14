import { WeatherMode, SeasonMode } from '@/hooks/useWeatherAmbient';

export type MusicGenre = 'none' | 'jazz' | 'rnb' | 'lofi' | 'ambient';

export interface AudioTrack {
  id: string;
  title: string;
  src: string;
  genres: MusicGenre[];
  weatherAffinity: WeatherMode[];
  seasonAffinity: SeasonMode[];
  /** Per-track loudness normalization (0.5-1.5, 1.0 = no change) */
  gainNormalization: number;
}

// ============= COMPLETE AUDIO LIBRARY (28 TRACKS) =============
// gainNormalization values calibrated to equalize perceived loudness
// Values > 1.0 boost quieter tracks, < 1.0 reduce louder tracks
export const AUDIO_TRACKS: AudioTrack[] = [
  // ORIGINAL 8 TRACKS
  {
    id: 'ambient-dark',
    title: 'Ambient Dark',
    src: '/audio/ambient-dark.mp3',
    genres: ['ambient'],
    weatherAffinity: ['hurricane', 'tornado', 'blizzard'],
    seasonAffinity: ['winter', 'fall'],
    gainNormalization: 1.1,
  },
  {
    id: 'ambient-emotional',
    title: 'Ambient Emotional',
    src: '/audio/ambient-emotional.mp3',
    genres: ['ambient', 'lofi'],
    weatherAffinity: ['rain', 'cloudy', 'snow'],
    seasonAffinity: ['fall', 'winter'],
    gainNormalization: 1.05,
  },
  {
    id: 'ambient-spiritual',
    title: 'Ambient Spiritual',
    src: '/audio/ambient-spiritual.mp3',
    genres: ['ambient'],
    weatherAffinity: ['bloomy', 'sunshine', 'clear'],
    seasonAffinity: ['spring', 'summer'],
    gainNormalization: 1.0,
  },
  {
    id: 'jazz-smooth',
    title: 'Jazz Smooth',
    src: '/audio/jazz-smooth.mp3',
    genres: ['jazz', 'lofi'],
    weatherAffinity: ['rain', 'cloudy', 'bloomy'],
    seasonAffinity: ['spring', 'fall'],
    gainNormalization: 0.95,
  },
  {
    id: 'jazz-warm',
    title: 'Jazz Warm',
    src: '/audio/jazz-warm.mp3',
    genres: ['jazz'],
    weatherAffinity: ['sunshine', 'bloomy'],
    seasonAffinity: ['summer', 'spring'],
    gainNormalization: 0.9,
  },
  {
    id: 'lofi-mellow',
    title: 'Lo-Fi Mellow',
    src: '/audio/lofi-mellow.mp3',
    genres: ['lofi'],
    weatherAffinity: ['rain', 'cloudy', 'snow'],
    seasonAffinity: ['fall', 'winter'],
    gainNormalization: 1.0,
  },
  {
    id: 'rnb-soulful',
    title: 'R&B Soulful',
    src: '/audio/rnb-soulful.mp3',
    genres: ['rnb'],
    weatherAffinity: ['sunshine', 'bloomy'],
    seasonAffinity: ['summer', 'spring'],
    gainNormalization: 0.85,
  },
  {
    id: 'rnb-upbeat',
    title: 'R&B Upbeat',
    src: '/audio/rnb-upbeat.mp3',
    genres: ['rnb', 'jazz'],
    weatherAffinity: ['sunshine'],
    seasonAffinity: ['summer'],
    gainNormalization: 0.8,
  },
  
  // EXPANDED LIBRARY (10 MORE TRACKS)
  {
    id: 'country-road',
    title: 'Country Road',
    src: '/audio/country-road.mp3',
    genres: ['jazz', 'lofi'],
    weatherAffinity: ['sunshine', 'cloudy', 'bloomy'],
    seasonAffinity: ['summer', 'fall'],
    gainNormalization: 0.9,
  },
  {
    id: 'blue-bonnets',
    title: 'Blue Bonnets',
    src: '/audio/blue-bonnets.mp3',
    genres: ['ambient', 'lofi'],
    weatherAffinity: ['bloomy', 'rain', 'cloudy'],
    seasonAffinity: ['spring', 'fall'],
    gainNormalization: 1.0,
  },
  {
    id: 'big-money-melodies',
    title: 'Big Money Melodies',
    src: '/audio/big-money-melodies.mp3',
    genres: ['rnb'],
    weatherAffinity: ['sunshine', 'bloomy'],
    seasonAffinity: ['summer', 'spring'],
    gainNormalization: 0.75,
  },
  {
    id: 'comeback-mix',
    title: 'Comeback Mix',
    src: '/audio/comeback-mix.mp3',
    genres: ['rnb', 'jazz'],
    weatherAffinity: ['sunshine', 'bloomy'],
    seasonAffinity: ['summer', 'spring'],
    gainNormalization: 0.8,
  },
  {
    id: 'project2-samples',
    title: 'Project 2 Samples',
    src: '/audio/project2-samples.mp3',
    genres: ['lofi', 'ambient'],
    weatherAffinity: ['rain', 'cloudy', 'snow'],
    seasonAffinity: ['fall', 'winter'],
    gainNormalization: 0.95,
  },
  {
    id: 'kanye-samples-deep',
    title: 'Kanye Samples Deep',
    src: '/audio/kanye-samples-deep.mp3',
    genres: ['rnb', 'ambient'],
    weatherAffinity: ['rain', 'cloudy', 'hurricane'],
    seasonAffinity: ['fall', 'winter'],
    gainNormalization: 0.85,
  },
  {
    id: 'life-after-pain',
    title: 'Life After Pain',
    src: '/audio/life-after-pain.mp3',
    genres: ['ambient', 'lofi'],
    weatherAffinity: ['rain', 'snow', 'cloudy'],
    seasonAffinity: ['fall', 'winter'],
    gainNormalization: 1.0,
  },
  {
    id: 'call-me-sample',
    title: 'Call Me Sample',
    src: '/audio/call-me-sample.wav',
    genres: ['rnb', 'jazz'],
    weatherAffinity: ['sunshine', 'bloomy'],
    seasonAffinity: ['summer', 'spring'],
    gainNormalization: 0.85,
  },
  {
    id: 'ttttttt',
    title: 'TTTTTTT',
    src: '/audio/ttttttt.wav',
    genres: ['ambient'],
    weatherAffinity: ['blizzard', 'hurricane', 'tornado'],
    seasonAffinity: ['winter'],
    gainNormalization: 1.15,
  },
  {
    id: 'crushed-velvet',
    title: 'Crushed Velvet',
    src: '/audio/crushed-velvet.mp3',
    genres: ['lofi', 'jazz'],
    weatherAffinity: ['rain', 'cloudy', 'bloomy'],
    seasonAffinity: ['fall', 'spring'],
    gainNormalization: 0.9,
  },

  // NEW 10 TRACKS (BEATZ BY YT COLLECTION)
  {
    id: 'southside-blues',
    title: 'Southside Blues',
    src: '/audio/southside-blues-full.mp3',
    genres: ['rnb', 'jazz'],
    weatherAffinity: ['rain', 'cloudy', 'bloomy'],
    seasonAffinity: ['fall', 'summer'],
    gainNormalization: 0.85,
  },
  {
    id: 'got-rich-quick',
    title: 'Got Rich Quick',
    src: '/audio/got-rich-quick.mp3',
    genres: ['rnb'],
    weatherAffinity: ['sunshine', 'bloomy'],
    seasonAffinity: ['summer', 'spring'],
    gainNormalization: 0.8,
  },
  {
    id: 'generational-wealth',
    title: 'Generational Wealth',
    src: '/audio/generational-wealth.mp3',
    genres: ['rnb', 'jazz'],
    weatherAffinity: ['sunshine', 'bloomy', 'cloudy'],
    seasonAffinity: ['summer', 'spring'],
    gainNormalization: 0.85,
  },
  {
    id: 'family-practice',
    title: 'Family Practice',
    src: '/audio/family-practice.mp3',
    genres: ['rnb', 'lofi'],
    weatherAffinity: ['rain', 'cloudy', 'sunshine'],
    seasonAffinity: ['fall', 'summer'],
    gainNormalization: 0.9,
  },
  {
    id: 'dallas-4eva',
    title: 'Dallas 4eva',
    src: '/audio/dallas-4eva.mp3',
    genres: ['rnb', 'jazz'],
    weatherAffinity: ['sunshine', 'bloomy'],
    seasonAffinity: ['summer', 'spring'],
    gainNormalization: 0.85,
  },
  {
    id: 'pain-of-a-king',
    title: 'Pain of a King',
    src: '/audio/pain-of-a-king.mp3',
    genres: ['ambient', 'rnb'],
    weatherAffinity: ['rain', 'cloudy', 'snow'],
    seasonAffinity: ['fall', 'winter'],
    gainNormalization: 0.95,
  },
  {
    id: 'growth-2',
    title: 'Growth 2',
    src: '/audio/growth-2.mp3',
    genres: ['ambient', 'lofi'],
    weatherAffinity: ['bloomy', 'sunshine', 'rain'],
    seasonAffinity: ['spring', 'summer'],
    gainNormalization: 0.9,
  },
  {
    id: 'after-da-rain',
    title: 'After Da Rain',
    src: '/audio/after-da-rain.mp3',
    genres: ['lofi', 'ambient'],
    weatherAffinity: ['rain', 'cloudy', 'bloomy'],
    seasonAffinity: ['spring', 'fall'],
    gainNormalization: 0.95,
  },
  {
    id: '324-beat',
    title: '3-24 Beat',
    src: '/audio/324-beat.mp3',
    genres: ['rnb', 'lofi'],
    weatherAffinity: ['sunshine', 'cloudy', 'bloomy'],
    seasonAffinity: ['summer', 'spring'],
    gainNormalization: 0.85,
  },
  {
    id: 'story-of-broken-man',
    title: 'Story of a Broken Man',
    src: '/audio/story-of-broken-man.mp3',
    genres: ['ambient'],
    weatherAffinity: ['rain', 'snow', 'cloudy', 'hurricane'],
    seasonAffinity: ['fall', 'winter'],
    gainNormalization: 1.0,
  },
];

/**
 * Get track normalization gain by src path
 */
export function getTrackNormalization(src: string): number {
  const track = AUDIO_TRACKS.find(t => t.src === src);
  return track?.gainNormalization ?? 1.0;
}

// ============= WEATHER → GENRE MAPPING =============
export const WEATHER_GENRE_MAP: Record<WeatherMode, { genres: MusicGenre[]; volumeMod: number }> = {
  clear: { genres: [], volumeMod: 0 },
  rain: { genres: ['lofi', 'jazz', 'ambient'], volumeMod: 1 },
  snow: { genres: ['ambient', 'jazz'], volumeMod: 0.9 },
  sunshine: { genres: ['rnb', 'jazz'], volumeMod: 1 },
  cloudy: { genres: ['lofi', 'jazz', 'ambient'], volumeMod: 0.95 },
  bloomy: { genres: ['lofi', 'jazz'], volumeMod: 1 },
  blizzard: { genres: ['ambient', 'jazz'], volumeMod: 0.85 },
  hurricane: { genres: ['ambient'], volumeMod: 0.7 },
  tornado: { genres: ['ambient'], volumeMod: 0.65 },
};

// ============= SEASON → GENRE INFLUENCE =============
export const SEASON_GENRE_INFLUENCE: Record<SeasonMode, MusicGenre[]> = {
  none: [],
  spring: ['jazz', 'lofi'],
  summer: ['rnb', 'jazz'],
  fall: ['lofi', 'ambient'],
  winter: ['ambient', 'jazz'],
};

// ============= SEASON EQ MODIFIERS =============
export const SEASON_EQ_MODIFIERS: Record<SeasonMode, { filterFreq: number; gainMod: number }> = {
  none: { filterFreq: 20000, gainMod: 1 },
  spring: { filterFreq: 18000, gainMod: 1.05 },
  summer: { filterFreq: 20000, gainMod: 1 },
  fall: { filterFreq: 8000, gainMod: 0.9 },
  winter: { filterFreq: 6000, gainMod: 0.85 },
};

// ============= HELPER FUNCTIONS =============

/**
 * Get tracks that match a specific genre
 */
export function getTracksByGenre(genre: MusicGenre): AudioTrack[] {
  if (genre === 'none') return [];
  return AUDIO_TRACKS.filter(track => track.genres.includes(genre));
}

/**
 * Get tracks matching weather and season context
 * Combines weather genre pool with season affinity for optimal matching
 */
export function getTracksForWeatherSeason(weather: WeatherMode, season: SeasonMode): AudioTrack[] {
  const weatherPool = WEATHER_GENRE_MAP[weather];
  if (!weatherPool.genres.length) return [];
  
  // Get all tracks that match weather genres
  const weatherTracks = AUDIO_TRACKS.filter(track => 
    track.genres.some(g => weatherPool.genres.includes(g))
  );
  
  // If season is set, prioritize tracks with season affinity
  if (season !== 'none') {
    const seasonTracks = weatherTracks.filter(track => 
      track.seasonAffinity.includes(season)
    );
    // Return season-matched tracks if available, otherwise all weather-matched
    return seasonTracks.length > 0 ? seasonTracks : weatherTracks;
  }
  
  return weatherTracks;
}

/**
 * Get default fallback playlist (ambient + lofi)
 */
export function getDefaultPlaylist(): AudioTrack[] {
  return AUDIO_TRACKS.filter(track => 
    track.genres.includes('ambient') || track.genres.includes('lofi')
  );
}

/**
 * Fisher-Yates shuffle algorithm
 */
export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Get readable track name from path
 */
export function getTrackDisplayName(filePath: string): string {
  if (!filePath) return '';
  const fileName = filePath.split('/').pop() || '';
  return fileName
    .replace(/\.(mp3|wav|ogg|m4a)$/i, '')
    .replace(/-/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase());
}
