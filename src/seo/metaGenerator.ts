/**
 * ┌─────────────────────────────────────────────────────────────────────────────┐
 * │ THE LUCY LOUNGE — META TAG GENERATOR                                       │
 * │                                                                             │
 * │ Route-level meta injection for search and social dominance                 │
 * │ Every page tells search engines exactly what to show.                      │
 * │                                                                             │
 * │ We don't hope Google gets it right. We MAKE it right.                      │
 * └─────────────────────────────────────────────────────────────────────────────┘
 */

import type { SEOConfig, OpenGraphMeta, TwitterMeta } from './types';
import { LUCY_BRAND, SEO_DEFAULTS, NO_INDEX_PATHS } from './types';

// =============================================================================
// META TAG GENERATION
// =============================================================================

/**
 * Generate complete meta tags for a page
 */
export function generateMetaTags(config: Partial<SEOConfig>): string {
  const tags: string[] = [];
  
  // Title
  const title = config.title 
    ? truncate(config.title + SEO_DEFAULTS.titleSuffix, SEO_DEFAULTS.maxTitleLength)
    : LUCY_BRAND.name;
  tags.push(`<title>${escapeHtml(title)}</title>`);
  
  // Description
  const description = config.description 
    ? truncate(config.description, SEO_DEFAULTS.maxDescriptionLength)
    : LUCY_BRAND.description;
  tags.push(`<meta name="description" content="${escapeHtml(description)}">`);
  
  // Canonical (CRITICAL)
  const canonical = config.canonical || LUCY_BRAND.url;
  tags.push(`<link rel="canonical" href="${escapeHtml(ensureAbsoluteUrl(canonical))}">`);
  
  // Robots
  const robots = buildRobotsContent(config);
  tags.push(`<meta name="robots" content="${robots}">`);
  
  // Keywords
  if (config.keywords && config.keywords.length > 0) {
    tags.push(`<meta name="keywords" content="${escapeHtml(config.keywords.join(', '))}">`);
  }
  
  // Author
  tags.push(`<meta name="author" content="${config.author || LUCY_BRAND.name}">`);
  
  // Published/Modified time
  if (config.publishedTime) {
    tags.push(`<meta property="article:published_time" content="${config.publishedTime}">`);
  }
  if (config.modifiedTime) {
    tags.push(`<meta property="article:modified_time" content="${config.modifiedTime}">`);
  }
  
  // Open Graph
  const og = config.og || buildDefaultOpenGraph(config);
  tags.push(...generateOpenGraphTags(og));
  
  // Twitter
  const twitter = config.twitter || buildDefaultTwitterMeta(config);
  tags.push(...generateTwitterTags(twitter));
  
  // Additional SEO meta
  tags.push(`<meta name="application-name" content="${LUCY_BRAND.name}">`);
  tags.push(`<meta name="apple-mobile-web-app-title" content="${LUCY_BRAND.name}">`);
  tags.push(`<meta name="theme-color" content="#8B5CF6">`);
  
  return tags.join('\n');
}

/**
 * Generate Open Graph meta tags
 */
export function generateOpenGraphTags(og: OpenGraphMeta): string[] {
  const tags: string[] = [];
  
  tags.push(`<meta property="og:type" content="${og.type}">`);
  tags.push(`<meta property="og:title" content="${escapeHtml(og.title)}">`);
  tags.push(`<meta property="og:description" content="${escapeHtml(og.description)}">`);
  tags.push(`<meta property="og:image" content="${escapeHtml(og.image)}">`);
  
  if (og.imageAlt) {
    tags.push(`<meta property="og:image:alt" content="${escapeHtml(og.imageAlt)}">`);
  }
  
  tags.push(`<meta property="og:url" content="${escapeHtml(og.url)}">`);
  tags.push(`<meta property="og:site_name" content="${escapeHtml(og.siteName)}">`);
  tags.push(`<meta property="og:locale" content="${og.locale || SEO_DEFAULTS.locale}">`);
  
  return tags;
}

/**
 * Generate Twitter Card meta tags
 */
export function generateTwitterTags(twitter: TwitterMeta): string[] {
  const tags: string[] = [];
  
  tags.push(`<meta name="twitter:card" content="${twitter.card}">`);
  tags.push(`<meta name="twitter:site" content="${twitter.site}">`);
  
  if (twitter.creator) {
    tags.push(`<meta name="twitter:creator" content="${twitter.creator}">`);
  }
  
  tags.push(`<meta name="twitter:title" content="${escapeHtml(twitter.title)}">`);
  tags.push(`<meta name="twitter:description" content="${escapeHtml(twitter.description)}">`);
  tags.push(`<meta name="twitter:image" content="${escapeHtml(twitter.image)}">`);
  
  if (twitter.imageAlt) {
    tags.push(`<meta name="twitter:image:alt" content="${escapeHtml(twitter.imageAlt)}">`);
  }
  
  return tags;
}

// =============================================================================
// PAGE-SPECIFIC META GENERATORS
// =============================================================================

/**
 * Generate meta for home page
 */
export function generateHomePageMeta(): SEOConfig {
  return {
    title: 'The Lucy Lounge — Universal Media Intelligence Platform',
    description: 'Discover movies, music, podcasts, and audiobooks with AI-powered personalization. Lucy learns your taste and helps you find what you\'ll love across Netflix, Spotify, and 50+ platforms.',
    canonical: LUCY_BRAND.url,
    keywords: [
      'media discovery', 'AI recommendations', 'streaming guide',
      'movie recommendations', 'music discovery', 'podcast finder',
      'personalized entertainment', 'cross-platform streaming',
    ],
    og: {
      type: 'website',
      title: 'The Lucy Lounge — Your AI Media Companion',
      description: 'Discover your next favorite movie, song, podcast, or audiobook with Lucy, your AI-powered media intelligence companion.',
      image: `${LUCY_BRAND.url}/og-home.png`,
      imageAlt: 'The Lucy Lounge - Universal Media Intelligence Platform',
      url: LUCY_BRAND.url,
      siteName: LUCY_BRAND.name,
    },
    twitter: {
      card: 'summary_large_image',
      site: SEO_DEFAULTS.twitterSite,
      title: 'The Lucy Lounge — Your AI Media Companion',
      description: 'Discover your next favorite movie, song, podcast, or audiobook with Lucy.',
      image: `${LUCY_BRAND.url}/og-home.png`,
    },
    schemas: [],
  };
}

/**
 * Generate meta for explore pages
 */
export function generateExploreMeta(
  category: 'mood' | 'genre' | 'journey',
  value: string,
  itemCount: number
): SEOConfig {
  const capitalizedValue = value.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  const categoryLabel = category === 'mood' ? 'Mood' : category === 'genre' ? 'Genre' : 'Journey';
  
  const title = `${capitalizedValue} ${categoryLabel} — Discover on Lucy Lounge`;
  const description = `Explore ${itemCount}+ ${capitalizedValue.toLowerCase()} recommendations. AI-curated ${category === 'mood' ? 'content that matches your' : category === 'genre' ? 'movies, music, and podcasts in' : 'themed experiences for'} ${capitalizedValue.toLowerCase()}.`;
  
  return {
    title,
    description,
    canonical: `${LUCY_BRAND.url}/explore/${category}/${value}`,
    keywords: [
      `${value} ${category}`,
      `${value} movies`,
      `${value} music`,
      `${value} recommendations`,
      'Lucy Lounge',
    ],
    og: {
      type: 'website',
      title,
      description,
      image: `${LUCY_BRAND.url}/og/${category}/${value}.png`,
      imageAlt: `${capitalizedValue} ${categoryLabel} on Lucy Lounge`,
      url: `${LUCY_BRAND.url}/explore/${category}/${value}`,
      siteName: LUCY_BRAND.name,
    },
    twitter: {
      card: 'summary_large_image',
      site: SEO_DEFAULTS.twitterSite,
      title,
      description,
      image: `${LUCY_BRAND.url}/og/${category}/${value}.png`,
    },
    schemas: [],
  };
}

/**
 * Generate meta for media detail pages
 */
export function generateMediaMeta(
  media: {
    id: string;
    title: string;
    description: string;
    type: 'movie' | 'series' | 'music' | 'podcast' | 'audiobook';
    image: string;
    year?: string;
    creators?: string[];
  }
): SEOConfig {
  const typeLabel = {
    movie: 'Movie',
    series: 'TV Series',
    music: 'Music',
    podcast: 'Podcast',
    audiobook: 'Audiobook',
  }[media.type];
  
  const title = `${media.title}${media.year ? ` (${media.year})` : ''} — ${typeLabel} on Lucy Lounge`;
  const description = truncate(media.description, SEO_DEFAULTS.maxDescriptionLength);
  
  return {
    title,
    description,
    canonical: `${LUCY_BRAND.url}/media/${media.id}`,
    keywords: [
      media.title,
      typeLabel.toLowerCase(),
      ...(media.creators || []),
      'where to watch',
      'streaming',
    ],
    og: {
      type: media.type === 'movie' ? 'video.movie' : media.type === 'music' ? 'music.song' : 'website',
      title: media.title,
      description,
      image: media.image,
      imageAlt: `${media.title} poster`,
      url: `${LUCY_BRAND.url}/media/${media.id}`,
      siteName: LUCY_BRAND.name,
    },
    twitter: {
      card: 'summary_large_image',
      site: SEO_DEFAULTS.twitterSite,
      title: media.title,
      description,
      image: media.image,
    },
    schemas: [],
  };
}

/**
 * Generate meta for listening pages
 */
export function generateListeningMeta(): SEOConfig {
  return {
    title: 'Listening — Music, Podcasts & Audiobooks on Lucy Lounge',
    description: 'Discover music, podcasts, and audiobooks personalized to your taste. Lucy curates the perfect soundtrack for every moment.',
    canonical: `${LUCY_BRAND.url}/listening`,
    keywords: [
      'music discovery', 'podcast recommendations', 'audiobook finder',
      'personalized playlists', 'AI music recommendations',
    ],
    og: {
      type: 'website',
      title: 'Listening — Lucy Lounge',
      description: 'Discover music, podcasts, and audiobooks personalized to your taste.',
      image: `${LUCY_BRAND.url}/og-listening.png`,
      imageAlt: 'Listening on Lucy Lounge',
      url: `${LUCY_BRAND.url}/listening`,
      siteName: LUCY_BRAND.name,
    },
    twitter: {
      card: 'summary_large_image',
      site: SEO_DEFAULTS.twitterSite,
      title: 'Listening — Lucy Lounge',
      description: 'Discover music, podcasts, and audiobooks personalized to your taste.',
      image: `${LUCY_BRAND.url}/og-listening.png`,
    },
    schemas: [],
  };
}

/**
 * Generate meta for discovery intent pages
 */
export function generateDiscoveryMeta(
  intent: string,
  itemCount: number
): SEOConfig {
  const humanizedIntent = intent.split('-').join(' ');
  const capitalizedIntent = humanizedIntent.charAt(0).toUpperCase() + humanizedIntent.slice(1);
  
  const title = `${capitalizedIntent} — Lucy Lounge Discovery`;
  const description = `Find ${itemCount}+ recommendations for "${humanizedIntent}". AI-powered discovery from Lucy Lounge.`;
  
  return {
    title,
    description,
    canonical: `${LUCY_BRAND.url}/discover/${intent}`,
    keywords: [
      humanizedIntent,
      'recommendations',
      'what to watch',
      'similar to',
      'AI recommendations',
    ],
    og: {
      type: 'website',
      title,
      description,
      image: `${LUCY_BRAND.url}/og-discover.png`,
      imageAlt: `${capitalizedIntent} on Lucy Lounge`,
      url: `${LUCY_BRAND.url}/discover/${intent}`,
      siteName: LUCY_BRAND.name,
    },
    twitter: {
      card: 'summary_large_image',
      site: SEO_DEFAULTS.twitterSite,
      title,
      description,
      image: `${LUCY_BRAND.url}/og-discover.png`,
    },
    schemas: [],
  };
}

// =============================================================================
// UTILITIES
// =============================================================================

function buildRobotsContent(config: Partial<SEOConfig>): string {
  const directives: string[] = [];
  
  directives.push(config.noIndex ? 'noindex' : 'index');
  directives.push(config.noFollow ? 'nofollow' : 'follow');
  
  return directives.join(', ');
}

function buildDefaultOpenGraph(config: Partial<SEOConfig>): OpenGraphMeta {
  return {
    type: 'website',
    title: config.title || LUCY_BRAND.name,
    description: config.description || LUCY_BRAND.description,
    image: SEO_DEFAULTS.defaultImage,
    imageAlt: SEO_DEFAULTS.defaultImageAlt,
    url: config.canonical || LUCY_BRAND.url,
    siteName: LUCY_BRAND.name,
    locale: SEO_DEFAULTS.locale,
  };
}

function buildDefaultTwitterMeta(config: Partial<SEOConfig>): TwitterMeta {
  return {
    card: 'summary_large_image',
    site: SEO_DEFAULTS.twitterSite,
    title: config.title || LUCY_BRAND.name,
    description: config.description || LUCY_BRAND.description,
    image: SEO_DEFAULTS.defaultImage,
    imageAlt: SEO_DEFAULTS.defaultImageAlt,
  };
}

function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.substring(0, maxLength - 3) + '...';
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function ensureAbsoluteUrl(url: string): string {
  if (url.startsWith('http')) return url;
  return `${LUCY_BRAND.url}${url.startsWith('/') ? '' : '/'}${url}`;
}

/**
 * Check if path should be no-indexed
 */
export function shouldNoIndex(path: string): boolean {
  return NO_INDEX_PATHS.some(noIndex => path.startsWith(noIndex));
}
