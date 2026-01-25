/**
 * ┌─────────────────────────────────────────────────────────────────────────────┐
 * │ THE LUCY LOUNGE — PROGRAMMATIC SEO PAGE GENERATOR                          │
 * │                                                                             │
 * │ Generate thousands to millions of legitimate, indexed pages                │
 * │ Each page answers a real human intent with unique value.                   │
 * │                                                                             │
 * │ Scale without spam. Intelligence without thin content.                     │
 * └─────────────────────────────────────────────────────────────────────────────┘
 */

import { LUCY_BRAND } from './types';
import { generateExploreMeta, generateDiscoveryMeta, generateMediaMeta } from './metaGenerator';
import { 
  generateExploreCollectionSchema, 
  generateItemListSchema,
  generateBreadcrumbSchema 
} from './schemas';
import type { SEOConfig, Schema, MediaSEOData, ExploreSEOData } from './types';

// =============================================================================
// PAGE TYPE DEFINITIONS
// =============================================================================

export interface ProgrammaticPage {
  path: string;
  title: string;
  description: string;
  canonical: string;
  schemas: Schema[];
  content: ProgrammaticContent;
  seo: SEOConfig;
}

export interface ProgrammaticContent {
  heading: string;
  subheading: string;
  introText: string;
  items: MediaSEOData[];
  relatedLinks: { href: string; text: string }[];
  faq?: { question: string; answer: string }[];
}

// =============================================================================
// MOOD PAGE GENERATOR
// =============================================================================

/**
 * Generate a complete mood exploration page
 */
export function generateMoodPage(
  mood: string,
  items: MediaSEOData[]
): ProgrammaticPage {
  const capitalizedMood = mood.charAt(0).toUpperCase() + mood.slice(1);
  const path = `/explore/mood/${mood}`;
  
  const seo = generateExploreMeta('mood', mood, items.length);
  
  const exploreData: ExploreSEOData = {
    category: 'mood',
    value: mood,
    title: `${capitalizedMood} Mood — Movies, Music & More`,
    description: `Discover ${items.length}+ recommendations perfect for a ${mood} mood. AI-curated movies, music, podcasts, and audiobooks.`,
    itemCount: items.length,
    items,
  };
  
  const schemas: Schema[] = [
    generateExploreCollectionSchema(exploreData),
    generateBreadcrumbSchema([
      { name: 'Home', url: '/' },
      { name: 'Explore', url: '/explore' },
      { name: 'Mood', url: '/explore/mood' },
      { name: capitalizedMood, url: path },
    ]),
  ];
  
  return {
    path,
    title: `${capitalizedMood} Mood — Discover on Lucy Lounge`,
    description: seo.description,
    canonical: `${LUCY_BRAND.url}${path}`,
    schemas,
    seo,
    content: {
      heading: `${capitalizedMood} Mood`,
      subheading: `${items.length}+ Recommendations`,
      introText: generateMoodIntroText(mood, items.length),
      items,
      relatedLinks: generateRelatedMoodLinks(mood),
      faq: generateMoodFAQ(mood),
    },
  };
}

function generateMoodIntroText(mood: string, count: number): string {
  const moodDescriptions: Record<string, string> = {
    happy: 'upbeat, joyful content that\'ll put a smile on your face',
    sad: 'emotional, cathartic content for when you need to feel understood',
    energetic: 'high-energy content to get you pumped up and moving',
    calm: 'peaceful, relaxing content to help you unwind',
    romantic: 'love-filled content perfect for date nights or daydreaming',
    focused: 'concentration-enhancing content for deep work and study',
    nostalgic: 'throwback content that takes you down memory lane',
    adventurous: 'thrilling content for when you crave excitement',
    cozy: 'warm, comfortable content perfect for lazy days',
    epic: 'grand, sweeping content that makes you feel alive',
  };
  
  const description = moodDescriptions[mood] || `content that matches your ${mood} mood`;
  
  return `Looking for ${description}? Lucy has curated ${count}+ movies, songs, podcasts, and audiobooks that perfectly capture the ${mood} vibe. Whether you're settling in for a movie night or need the perfect soundtrack, these picks will match exactly how you're feeling.`;
}

function generateRelatedMoodLinks(mood: string): { href: string; text: string }[] {
  const moodRelations: Record<string, string[]> = {
    happy: ['energetic', 'playful', 'uplifting'],
    sad: ['melancholic', 'emotional', 'reflective'],
    energetic: ['happy', 'excited', 'powerful'],
    calm: ['peaceful', 'relaxed', 'mellow'],
    romantic: ['passionate', 'tender', 'dreamy'],
    focused: ['calm', 'minimal', 'ambient'],
  };
  
  const related = moodRelations[mood] || ['happy', 'calm', 'energetic'];
  
  return related.map(m => ({
    href: `/explore/mood/${m}`,
    text: `${m.charAt(0).toUpperCase() + m.slice(1)} Mood`,
  }));
}

function generateMoodFAQ(mood: string): { question: string; answer: string }[] {
  const capitalizedMood = mood.charAt(0).toUpperCase() + mood.slice(1);
  
  return [
    {
      question: `What is the best ${mood} movie?`,
      answer: `The best ${mood} movies vary by personal taste, but Lucy Lounge curates top-rated ${mood} films based on critic reviews, audience scores, and AI analysis. Browse our ${mood} mood collection to find your perfect match.`,
    },
    {
      question: `How do I find ${mood} music?`,
      answer: `Lucy Lounge's ${mood} mood collection includes music from Spotify, Apple Music, and other platforms that match the ${mood} vibe. You can also ask Lucy directly for ${mood} music recommendations tailored to your taste.`,
    },
    {
      question: `What podcasts are good for a ${mood} mood?`,
      answer: `Our AI analyzes podcast tone, content, and listener feedback to recommend ${mood} podcasts. The ${capitalizedMood} Mood collection includes podcasts across genres that match this emotional state.`,
    },
  ];
}

// =============================================================================
// GENRE PAGE GENERATOR
// =============================================================================

export function generateGenrePage(
  genre: string,
  items: MediaSEOData[]
): ProgrammaticPage {
  const capitalizedGenre = genre.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  const path = `/explore/genre/${genre}`;
  
  const seo = generateExploreMeta('genre', genre, items.length);
  
  const exploreData: ExploreSEOData = {
    category: 'genre',
    value: genre,
    title: `${capitalizedGenre} — Movies, Music & More`,
    description: `Discover ${items.length}+ ${capitalizedGenre} recommendations. Movies, music, podcasts, and audiobooks in the ${capitalizedGenre} genre.`,
    itemCount: items.length,
    items,
  };
  
  const schemas: Schema[] = [
    generateExploreCollectionSchema(exploreData),
    generateBreadcrumbSchema([
      { name: 'Home', url: '/' },
      { name: 'Explore', url: '/explore' },
      { name: 'Genre', url: '/explore/genre' },
      { name: capitalizedGenre, url: path },
    ]),
  ];
  
  return {
    path,
    title: `${capitalizedGenre} — Discover on Lucy Lounge`,
    description: seo.description,
    canonical: `${LUCY_BRAND.url}${path}`,
    schemas,
    seo,
    content: {
      heading: capitalizedGenre,
      subheading: `${items.length}+ Recommendations`,
      introText: `Explore the best of ${capitalizedGenre} across movies, music, podcasts, and audiobooks. Lucy's AI curates top picks in this genre based on quality, popularity, and your personal taste preferences.`,
      items,
      relatedLinks: [
        { href: `/explore/genre`, text: 'All Genres' },
        { href: `/explore/mood`, text: 'Browse by Mood' },
        { href: `/explore/journey`, text: 'Themed Journeys' },
      ],
    },
  };
}

// =============================================================================
// JOURNEY PAGE GENERATOR
// =============================================================================

export function generateJourneyPage(
  journey: string,
  items: MediaSEOData[],
  journeyDescription?: string
): ProgrammaticPage {
  const capitalizedJourney = journey.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  const path = `/explore/journey/${journey}`;
  
  const seo = generateExploreMeta('journey', journey, items.length);
  
  const exploreData: ExploreSEOData = {
    category: 'journey',
    value: journey,
    title: `${capitalizedJourney} Journey`,
    description: journeyDescription || `A curated journey through ${items.length}+ pieces of content for ${capitalizedJourney}.`,
    itemCount: items.length,
    items,
  };
  
  const schemas: Schema[] = [
    generateExploreCollectionSchema(exploreData),
    generateBreadcrumbSchema([
      { name: 'Home', url: '/' },
      { name: 'Explore', url: '/explore' },
      { name: 'Journeys', url: '/explore/journey' },
      { name: capitalizedJourney, url: path },
    ]),
  ];
  
  return {
    path,
    title: `${capitalizedJourney} — Lucy Lounge Journey`,
    description: seo.description,
    canonical: `${LUCY_BRAND.url}${path}`,
    schemas,
    seo,
    content: {
      heading: `${capitalizedJourney} Journey`,
      subheading: `${items.length}+ Curated Picks`,
      introText: journeyDescription || `Experience a carefully curated journey through ${capitalizedJourney}. Lucy has assembled the perfect sequence of movies, music, podcasts, and audiobooks to take you through this themed experience.`,
      items,
      relatedLinks: [
        { href: `/explore/journey`, text: 'All Journeys' },
        { href: `/explore/mood`, text: 'Browse by Mood' },
        { href: `/explore/genre`, text: 'Browse by Genre' },
      ],
    },
  };
}

// =============================================================================
// "SIMILAR TO" PAGE GENERATOR
// =============================================================================

export function generateSimilarToPage(
  sourceMedia: MediaSEOData,
  similarItems: MediaSEOData[]
): ProgrammaticPage {
  const path = `/media/similar-to/${sourceMedia.id}`;
  
  const title = `Similar to ${sourceMedia.title} — Lucy Lounge`;
  const description = `Discover ${similarItems.length}+ movies, shows, and content similar to ${sourceMedia.title}. AI-powered recommendations based on themes, tone, and style.`;
  
  const schemas: Schema[] = [
    generateItemListSchema(similarItems, `Similar to ${sourceMedia.title}`),
    generateBreadcrumbSchema([
      { name: 'Home', url: '/' },
      { name: 'Media', url: '/media' },
      { name: sourceMedia.title, url: `/media/${sourceMedia.id}` },
      { name: 'Similar', url: path },
    ]),
  ];
  
  const seo = generateDiscoveryMeta(`similar-to-${sourceMedia.id}`, similarItems.length);
  
  return {
    path,
    title,
    description,
    canonical: `${LUCY_BRAND.url}${path}`,
    schemas,
    seo,
    content: {
      heading: `Similar to ${sourceMedia.title}`,
      subheading: `${similarItems.length}+ Recommendations`,
      introText: `Loved ${sourceMedia.title}? Lucy's AI has analyzed its themes, style, and emotional impact to find ${similarItems.length}+ similar movies, shows, music, and more that capture the same essence.`,
      items: similarItems,
      relatedLinks: [
        { href: `/media/${sourceMedia.id}`, text: `Back to ${sourceMedia.title}` },
        { href: `/explore`, text: 'Explore More' },
      ],
    },
  };
}

// =============================================================================
// "LISTENING AFTER" PAGE GENERATOR
// =============================================================================

export function generateListeningAfterPage(
  sourceMedia: MediaSEOData,
  listeningItems: MediaSEOData[]
): ProgrammaticPage {
  const path = `/listening/after/${sourceMedia.id}`;
  
  const title = `What to Listen to After ${sourceMedia.title} — Lucy Lounge`;
  const description = `Perfect music, podcasts, and audiobooks to listen to after watching ${sourceMedia.title}. ${listeningItems.length}+ AI-curated recommendations.`;
  
  const schemas: Schema[] = [
    generateItemListSchema(listeningItems, `Listen After ${sourceMedia.title}`),
    generateBreadcrumbSchema([
      { name: 'Home', url: '/' },
      { name: 'Listening', url: '/listening' },
      { name: `After ${sourceMedia.title}`, url: path },
    ]),
  ];
  
  const seo = generateDiscoveryMeta(`listening-after-${sourceMedia.id}`, listeningItems.length);
  
  return {
    path,
    title,
    description,
    canonical: `${LUCY_BRAND.url}${path}`,
    schemas,
    seo,
    content: {
      heading: `Listen After ${sourceMedia.title}`,
      subheading: `${listeningItems.length}+ Soundtrack & Related Audio`,
      introText: `Just finished ${sourceMedia.title}? Keep the vibe going with Lucy's curated audio picks — from the official soundtrack to thematically similar music, podcasts discussing the content, and related audiobooks.`,
      items: listeningItems,
      relatedLinks: [
        { href: `/media/${sourceMedia.id}`, text: `${sourceMedia.title} Details` },
        { href: `/media/similar-to/${sourceMedia.id}`, text: `Similar Content` },
        { href: `/listening`, text: 'Explore Listening' },
      ],
    },
  };
}

// =============================================================================
// DISCOVERY INTENT PAGE GENERATOR
// =============================================================================

export function generateDiscoveryIntentPage(
  intent: string,
  items: MediaSEOData[],
  intentDescription?: string
): ProgrammaticPage {
  const humanizedIntent = intent.split('-').join(' ');
  const capitalizedIntent = humanizedIntent.charAt(0).toUpperCase() + humanizedIntent.slice(1);
  const path = `/discover/${intent}`;
  
  const seo = generateDiscoveryMeta(intent, items.length);
  
  const schemas: Schema[] = [
    generateItemListSchema(items, capitalizedIntent),
    generateBreadcrumbSchema([
      { name: 'Home', url: '/' },
      { name: 'Discover', url: '/discover' },
      { name: capitalizedIntent, url: path },
    ]),
  ];
  
  return {
    path,
    title: `${capitalizedIntent} — Lucy Lounge Discovery`,
    description: intentDescription || `${items.length}+ recommendations for "${humanizedIntent}". Discover exactly what you're looking for with Lucy's AI.`,
    canonical: `${LUCY_BRAND.url}${path}`,
    schemas,
    seo,
    content: {
      heading: capitalizedIntent,
      subheading: `${items.length}+ Results`,
      introText: intentDescription || `Looking for "${humanizedIntent}"? Lucy has analyzed thousands of options to bring you the ${items.length}+ best matches. These AI-curated recommendations are tailored to this specific intent.`,
      items,
      relatedLinks: [
        { href: '/explore', text: 'Explore More' },
        { href: '/listening', text: 'Browse Listening' },
        { href: '/media', text: 'Browse Media' },
      ],
    },
  };
}

// =============================================================================
// PAGE REGISTRY
// =============================================================================

export interface PageRegistry {
  moods: string[];
  genres: string[];
  journeys: string[];
  intents: string[];
}

export const PAGE_REGISTRY: PageRegistry = {
  moods: [
    'happy', 'sad', 'energetic', 'calm', 'romantic', 'melancholic',
    'focused', 'relaxed', 'excited', 'peaceful', 'nostalgic', 'adventurous',
    'cozy', 'epic', 'dreamy', 'intense', 'playful', 'mysterious',
    'uplifting', 'dark', 'hopeful', 'rebellious', 'ethereal', 'groovy',
    'chill', 'hype', 'mellow', 'powerful', 'tender', 'wild',
  ],
  genres: [
    'pop', 'rock', 'hip-hop', 'r-and-b', 'jazz', 'classical', 'electronic',
    'country', 'folk', 'indie', 'metal', 'punk', 'soul', 'blues',
    'action', 'comedy', 'drama', 'horror', 'thriller', 'romance',
    'sci-fi', 'fantasy', 'documentary', 'animation', 'mystery',
    'true-crime', 'business', 'technology', 'health', 'education',
  ],
  journeys: [
    'morning-energy', 'afternoon-focus', 'evening-unwind', 'late-night-vibes',
    'sunday-morning', 'friday-night', 'weekend-brunch',
    'workout', 'study', 'meditation', 'cooking', 'road-trip', 'party',
    'feel-good', 'heartbreak-healing', 'motivation-boost', 'stress-relief',
    '90s-throwback', '80s-classics', 'indie-discoveries', 'hidden-gems',
  ],
  intents: [
    'movies-like-inception', 'movies-like-parasite', 'best-sci-fi-movies-2024',
    'songs-like-bohemian-rhapsody', 'playlists-for-studying',
    'podcasts-like-serial', 'best-true-crime-podcasts',
    'what-to-watch-tonight', 'new-releases-this-week',
  ],
};

/**
 * Get total programmatic page count
 */
export function getTotalProgrammaticPageCount(): number {
  return (
    PAGE_REGISTRY.moods.length +
    PAGE_REGISTRY.genres.length +
    PAGE_REGISTRY.journeys.length +
    PAGE_REGISTRY.intents.length
  );
}
