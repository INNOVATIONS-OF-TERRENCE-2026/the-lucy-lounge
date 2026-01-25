/**
 * ┌─────────────────────────────────────────────────────────────────────────────┐
 * │ THE LUCY LOUNGE — DYNAMIC SITEMAP GENERATOR                                │
 * │                                                                             │
 * │ Segmented sitemaps for millions of pages                                   │
 * │ Google crawls what we serve. We serve intelligence.                        │
 * │                                                                             │
 * │ Every URL is a doorway. Lucy opens millions.                               │
 * └─────────────────────────────────────────────────────────────────────────────┘
 */

import type { SitemapEntry, SitemapIndex, SitemapImage, SitemapVideo } from './types';
import { LUCY_BRAND, NO_INDEX_PATHS, HIGH_PRIORITY_PATHS } from './types';

// =============================================================================
// SITEMAP CONFIGURATION
// =============================================================================

const SITEMAP_CONFIG = {
  maxUrlsPerSitemap: 50000,       // Google's limit
  baseUrl: LUCY_BRAND.url,
  defaultChangeFreq: 'weekly' as const,
  defaultPriority: 0.5,
};

// =============================================================================
// SITEMAP ENTRY GENERATORS
// =============================================================================

/**
 * Generate sitemap entries for static pages
 */
export function generateStaticPageEntries(): SitemapEntry[] {
  const now = new Date().toISOString();
  
  return [
    // Home
    {
      loc: SITEMAP_CONFIG.baseUrl,
      lastmod: now,
      changefreq: 'daily',
      priority: 1.0,
    },
    
    // Main sections
    {
      loc: `${SITEMAP_CONFIG.baseUrl}/explore`,
      lastmod: now,
      changefreq: 'daily',
      priority: 0.9,
    },
    {
      loc: `${SITEMAP_CONFIG.baseUrl}/listening`,
      lastmod: now,
      changefreq: 'daily',
      priority: 0.9,
    },
    {
      loc: `${SITEMAP_CONFIG.baseUrl}/media`,
      lastmod: now,
      changefreq: 'daily',
      priority: 0.9,
    },
    {
      loc: `${SITEMAP_CONFIG.baseUrl}/studios`,
      lastmod: now,
      changefreq: 'weekly',
      priority: 0.8,
    },
    
    // About & Info
    {
      loc: `${SITEMAP_CONFIG.baseUrl}/about`,
      lastmod: now,
      changefreq: 'monthly',
      priority: 0.7,
    },
    {
      loc: `${SITEMAP_CONFIG.baseUrl}/about/lucy`,
      lastmod: now,
      changefreq: 'monthly',
      priority: 0.7,
    },
    {
      loc: `${SITEMAP_CONFIG.baseUrl}/pricing`,
      lastmod: now,
      changefreq: 'weekly',
      priority: 0.7,
    },
    {
      loc: `${SITEMAP_CONFIG.baseUrl}/faq`,
      lastmod: now,
      changefreq: 'weekly',
      priority: 0.6,
    },
    {
      loc: `${SITEMAP_CONFIG.baseUrl}/help`,
      lastmod: now,
      changefreq: 'weekly',
      priority: 0.5,
    },
    
    // Legal
    {
      loc: `${SITEMAP_CONFIG.baseUrl}/privacy`,
      lastmod: now,
      changefreq: 'monthly',
      priority: 0.3,
    },
    {
      loc: `${SITEMAP_CONFIG.baseUrl}/terms`,
      lastmod: now,
      changefreq: 'monthly',
      priority: 0.3,
    },
  ];
}

/**
 * Generate sitemap entries for mood exploration pages
 */
export function generateMoodPageEntries(): SitemapEntry[] {
  const moods = [
    'happy', 'sad', 'energetic', 'calm', 'romantic', 'melancholic',
    'focused', 'relaxed', 'excited', 'peaceful', 'nostalgic', 'adventurous',
    'cozy', 'epic', 'dreamy', 'intense', 'playful', 'mysterious',
    'uplifting', 'dark', 'hopeful', 'rebellious', 'ethereal', 'groovy',
    'chill', 'hype', 'mellow', 'powerful', 'tender', 'wild',
  ];
  
  const now = new Date().toISOString();
  
  return moods.map(mood => ({
    loc: `${SITEMAP_CONFIG.baseUrl}/explore/mood/${mood}`,
    lastmod: now,
    changefreq: 'weekly' as const,
    priority: 0.7,
  }));
}

/**
 * Generate sitemap entries for genre exploration pages
 */
export function generateGenrePageEntries(): SitemapEntry[] {
  const genres = [
    // Music genres
    'pop', 'rock', 'hip-hop', 'r&b', 'jazz', 'classical', 'electronic',
    'country', 'folk', 'indie', 'metal', 'punk', 'soul', 'blues',
    'reggae', 'latin', 'k-pop', 'edm', 'ambient', 'lofi',
    
    // Movie/TV genres
    'action', 'comedy', 'drama', 'horror', 'thriller', 'romance',
    'sci-fi', 'fantasy', 'documentary', 'animation', 'mystery',
    'adventure', 'crime', 'family', 'musical', 'western', 'war',
    
    // Podcast genres
    'true-crime', 'business', 'technology', 'health', 'education',
    'news', 'sports', 'interview', 'storytelling', 'self-improvement',
  ];
  
  const now = new Date().toISOString();
  
  return genres.map(genre => ({
    loc: `${SITEMAP_CONFIG.baseUrl}/explore/genre/${genre}`,
    lastmod: now,
    changefreq: 'weekly' as const,
    priority: 0.7,
  }));
}

/**
 * Generate sitemap entries for journey/theme pages
 */
export function generateJourneyPageEntries(): SitemapEntry[] {
  const journeys = [
    // Time-based
    'morning-energy', 'afternoon-focus', 'evening-unwind', 'late-night-vibes',
    'sunday-morning', 'friday-night', 'weekend-brunch',
    
    // Activity-based
    'workout', 'study', 'meditation', 'cooking', 'road-trip', 'party',
    'work-from-home', 'cleaning', 'gaming', 'reading',
    
    // Mood journeys
    'feel-good', 'heartbreak-healing', 'motivation-boost', 'stress-relief',
    'confidence-builder', 'nostalgia-trip', 'discovery-mode',
    
    // Thematic
    '90s-throwback', '80s-classics', 'indie-discoveries', 'hidden-gems',
    'critic-favorites', 'award-winners', 'cult-classics',
  ];
  
  const now = new Date().toISOString();
  
  return journeys.map(journey => ({
    loc: `${SITEMAP_CONFIG.baseUrl}/explore/journey/${journey}`,
    lastmod: now,
    changefreq: 'weekly' as const,
    priority: 0.7,
  }));
}

/**
 * Generate sitemap entries for "similar to" pages
 */
export function generateSimilarToEntries(
  mediaItems: { id: string; title: string; image?: string; updatedAt?: string }[]
): SitemapEntry[] {
  return mediaItems.map(item => ({
    loc: `${SITEMAP_CONFIG.baseUrl}/media/similar-to/${item.id}`,
    lastmod: item.updatedAt || new Date().toISOString(),
    changefreq: 'weekly' as const,
    priority: 0.6,
    images: item.image ? [{
      loc: item.image,
      title: `Similar to ${item.title}`,
    }] : undefined,
  }));
}

/**
 * Generate sitemap entries for "listening after" pages
 */
export function generateListeningAfterEntries(
  mediaItems: { id: string; title: string; updatedAt?: string }[]
): SitemapEntry[] {
  return mediaItems.map(item => ({
    loc: `${SITEMAP_CONFIG.baseUrl}/listening/after/${item.id}`,
    lastmod: item.updatedAt || new Date().toISOString(),
    changefreq: 'weekly' as const,
    priority: 0.6,
  }));
}

/**
 * Generate sitemap entries for discovery intent pages
 */
export function generateDiscoveryIntentEntries(): SitemapEntry[] {
  const intents = [
    // Movie intents
    'movies-like-inception', 'movies-like-parasite', 'movies-like-pulp-fiction',
    'best-sci-fi-movies-2024', 'underrated-horror-movies', 'feel-good-comedies',
    
    // Music intents
    'songs-like-bohemian-rhapsody', 'artists-like-taylor-swift',
    'playlists-for-studying', 'workout-music-2024',
    
    // Podcast intents
    'podcasts-like-serial', 'best-true-crime-podcasts',
    'business-podcasts-for-entrepreneurs',
    
    // General
    'what-to-watch-tonight', 'new-releases-this-week',
    'trending-on-netflix', 'hidden-gems-on-spotify',
  ];
  
  const now = new Date().toISOString();
  
  return intents.map(intent => ({
    loc: `${SITEMAP_CONFIG.baseUrl}/discover/${intent}`,
    lastmod: now,
    changefreq: 'daily' as const,
    priority: 0.8,
  }));
}

// =============================================================================
// SITEMAP XML GENERATION
// =============================================================================

/**
 * Generate XML for a single sitemap
 */
export function generateSitemapXML(entries: SitemapEntry[]): string {
  const urlElements = entries.map(entry => {
    let xml = `  <url>\n    <loc>${escapeXml(entry.loc)}</loc>`;
    
    if (entry.lastmod) {
      xml += `\n    <lastmod>${entry.lastmod}</lastmod>`;
    }
    if (entry.changefreq) {
      xml += `\n    <changefreq>${entry.changefreq}</changefreq>`;
    }
    if (entry.priority !== undefined) {
      xml += `\n    <priority>${entry.priority.toFixed(1)}</priority>`;
    }
    
    // Image sitemap extension
    if (entry.images && entry.images.length > 0) {
      entry.images.forEach(image => {
        xml += `\n    <image:image>`;
        xml += `\n      <image:loc>${escapeXml(image.loc)}</image:loc>`;
        if (image.title) {
          xml += `\n      <image:title>${escapeXml(image.title)}</image:title>`;
        }
        if (image.caption) {
          xml += `\n      <image:caption>${escapeXml(image.caption)}</image:caption>`;
        }
        xml += `\n    </image:image>`;
      });
    }
    
    // Video sitemap extension
    if (entry.videos && entry.videos.length > 0) {
      entry.videos.forEach(video => {
        xml += `\n    <video:video>`;
        xml += `\n      <video:thumbnail_loc>${escapeXml(video.thumbnailLoc)}</video:thumbnail_loc>`;
        xml += `\n      <video:title>${escapeXml(video.title)}</video:title>`;
        xml += `\n      <video:description>${escapeXml(video.description)}</video:description>`;
        if (video.contentLoc) {
          xml += `\n      <video:content_loc>${escapeXml(video.contentLoc)}</video:content_loc>`;
        }
        if (video.duration) {
          xml += `\n      <video:duration>${video.duration}</video:duration>`;
        }
        xml += `\n    </video:video>`;
      });
    }
    
    xml += `\n  </url>`;
    return xml;
  });
  
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
        xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">
${urlElements.join('\n')}
</urlset>`;
}

/**
 * Generate sitemap index XML
 */
export function generateSitemapIndexXML(index: SitemapIndex): string {
  const sitemapElements = index.sitemaps.map(sitemap => {
    let xml = `  <sitemap>\n    <loc>${escapeXml(sitemap.loc)}</loc>`;
    if (sitemap.lastmod) {
      xml += `\n    <lastmod>${sitemap.lastmod}</lastmod>`;
    }
    xml += `\n  </sitemap>`;
    return xml;
  });
  
  return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapElements.join('\n')}
</sitemapindex>`;
}

// =============================================================================
// SITEMAP ORCHESTRATOR
// =============================================================================

export interface SitemapBuild {
  index: string;
  sitemaps: {
    name: string;
    content: string;
    urlCount: number;
  }[];
  totalUrls: number;
}

/**
 * Build complete sitemap system
 */
export function buildSitemaps(): SitemapBuild {
  const now = new Date().toISOString();
  const sitemaps: SitemapBuild['sitemaps'] = [];
  
  // Static pages sitemap
  const staticEntries = generateStaticPageEntries();
  sitemaps.push({
    name: 'sitemap-pages.xml',
    content: generateSitemapXML(staticEntries),
    urlCount: staticEntries.length,
  });
  
  // Mood exploration sitemap
  const moodEntries = generateMoodPageEntries();
  sitemaps.push({
    name: 'sitemap-moods.xml',
    content: generateSitemapXML(moodEntries),
    urlCount: moodEntries.length,
  });
  
  // Genre exploration sitemap
  const genreEntries = generateGenrePageEntries();
  sitemaps.push({
    name: 'sitemap-genres.xml',
    content: generateSitemapXML(genreEntries),
    urlCount: genreEntries.length,
  });
  
  // Journey sitemap
  const journeyEntries = generateJourneyPageEntries();
  sitemaps.push({
    name: 'sitemap-journeys.xml',
    content: generateSitemapXML(journeyEntries),
    urlCount: journeyEntries.length,
  });
  
  // Discovery intent sitemap
  const discoveryEntries = generateDiscoveryIntentEntries();
  sitemaps.push({
    name: 'sitemap-discover.xml',
    content: generateSitemapXML(discoveryEntries),
    urlCount: discoveryEntries.length,
  });
  
  // Generate index
  const indexData: SitemapIndex = {
    sitemaps: sitemaps.map(s => ({
      loc: `${SITEMAP_CONFIG.baseUrl}/${s.name}`,
      lastmod: now,
    })),
  };
  
  const totalUrls = sitemaps.reduce((sum, s) => sum + s.urlCount, 0);
  
  return {
    index: generateSitemapIndexXML(indexData),
    sitemaps,
    totalUrls,
  };
}

// =============================================================================
// UTILITIES
// =============================================================================

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Check if a path should be indexed
 */
export function shouldIndex(path: string): boolean {
  return !NO_INDEX_PATHS.some(noIndex => path.startsWith(noIndex));
}

/**
 * Get priority for a path
 */
export function getPathPriority(path: string): number {
  if (path === '/') return 1.0;
  if (HIGH_PRIORITY_PATHS.some(p => path.startsWith(p))) return 0.9;
  if (path.includes('/explore/')) return 0.7;
  if (path.includes('/media/')) return 0.6;
  if (path.includes('/listening/')) return 0.6;
  return 0.5;
}
