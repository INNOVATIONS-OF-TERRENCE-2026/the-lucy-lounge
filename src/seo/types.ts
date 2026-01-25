/**
 * ┌─────────────────────────────────────────────────────────────────────────────┐
 * │ THE LUCY LOUNGE — SEO TYPE SYSTEM                                          │
 * │                                                                             │
 * │ Type-safe SEO infrastructure for entity-based search dominance             │
 * │ Every type tells search engines WHO Lucy is, not just WHAT she does.       │
 * │                                                                             │
 * │ Google ranks ENTITIES. Lucy IS the entity.                                 │
 * └─────────────────────────────────────────────────────────────────────────────┘
 */

// =============================================================================
// CORE SEO TYPES
// =============================================================================

export interface SEOConfig {
  title: string;
  description: string;
  canonical: string;
  noIndex?: boolean;
  noFollow?: boolean;
  
  // Open Graph
  og?: OpenGraphMeta;
  
  // Twitter
  twitter?: TwitterMeta;
  
  // Structured Data
  schemas: Schema[];
  
  // Additional meta
  keywords?: string[];
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
}

export interface OpenGraphMeta {
  type: 'website' | 'article' | 'video.movie' | 'music.song' | 'music.album' | 'profile';
  title: string;
  description: string;
  image: string;
  imageAlt?: string;
  url: string;
  siteName: string;
  locale?: string;
}

export interface TwitterMeta {
  card: 'summary' | 'summary_large_image' | 'player' | 'app';
  site: string;
  creator?: string;
  title: string;
  description: string;
  image: string;
  imageAlt?: string;
}

// =============================================================================
// SCHEMA.ORG TYPES
// =============================================================================

export type SchemaType = 
  | 'WebSite'
  | 'WebApplication'
  | 'SoftwareApplication'
  | 'Organization'
  | 'Brand'
  | 'Movie'
  | 'TVSeries'
  | 'VideoObject'
  | 'MusicRecording'
  | 'MusicAlbum'
  | 'MusicPlaylist'
  | 'PodcastSeries'
  | 'PodcastEpisode'
  | 'Audiobook'
  | 'CollectionPage'
  | 'ItemList'
  | 'CreativeWork'
  | 'BreadcrumbList'
  | 'FAQPage'
  | 'HowTo'
  | 'SearchAction';

export interface Schema {
  '@context': 'https://schema.org';
  '@type': SchemaType | SchemaType[];
  [key: string]: unknown;
}

// =============================================================================
// PAGE-SPECIFIC SEO TYPES
// =============================================================================

export interface MediaSEOData {
  id: string;
  type: 'movie' | 'series' | 'music' | 'podcast' | 'audiobook';
  title: string;
  description: string;
  image: string;
  releaseDate?: string;
  duration?: number;
  genres?: string[];
  creators?: string[];
  rating?: number;
  ratingCount?: number;
}

export interface ExploreSEOData {
  category: 'mood' | 'genre' | 'journey' | 'theme';
  value: string;
  title: string;
  description: string;
  itemCount: number;
  items: MediaSEOData[];
}

export interface ListeningSEOData {
  type: 'playlist' | 'station' | 'mix';
  name: string;
  description: string;
  trackCount: number;
  duration: number;
  creator?: string;
  image: string;
}

// =============================================================================
// SITEMAP TYPES
// =============================================================================

export interface SitemapEntry {
  loc: string;
  lastmod?: string;
  changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority?: number;
  images?: SitemapImage[];
  videos?: SitemapVideo[];
}

export interface SitemapImage {
  loc: string;
  caption?: string;
  title?: string;
}

export interface SitemapVideo {
  title: string;
  description: string;
  thumbnailLoc: string;
  contentLoc?: string;
  duration?: number;
}

export interface SitemapIndex {
  sitemaps: {
    loc: string;
    lastmod?: string;
  }[];
}

// =============================================================================
// INTERNAL LINKING TYPES
// =============================================================================

export interface InternalLink {
  href: string;
  text: string;
  title?: string;
  rel?: string;
  priority: number;           // 1-10, higher = more important
  category: LinkCategory;
}

export type LinkCategory = 
  | 'navigation'
  | 'discovery'
  | 'related'
  | 'breadcrumb'
  | 'cross-sell'
  | 'entity';

export interface LinkCluster {
  hub: string;                // Hub page URL
  spokes: InternalLink[];     // Related pages
  entityType: string;         // What entity this cluster represents
}

// =============================================================================
// SEO AUDIT TYPES
// =============================================================================

export interface SEOAuditResult {
  url: string;
  timestamp: Date;
  
  // Meta checks
  hasTitle: boolean;
  titleLength: number;
  hasDescription: boolean;
  descriptionLength: number;
  hasCanonical: boolean;
  canonicalValid: boolean;
  
  // Schema checks
  hasSchemas: boolean;
  schemaTypes: SchemaType[];
  schemaValid: boolean;
  
  // Performance
  ttfb?: number;
  lcp?: number;
  fid?: number;
  cls?: number;
  
  // Issues
  issues: SEOIssue[];
  warnings: SEOIssue[];
}

export interface SEOIssue {
  code: string;
  message: string;
  severity: 'error' | 'warning' | 'info';
  element?: string;
  recommendation: string;
}

// =============================================================================
// CONSTANTS
// =============================================================================

export const LUCY_BRAND = {
  name: 'The Lucy Lounge',
  legalName: 'The Lucy Lounge Media Intelligence Platform',
  url: 'https://thelucylounge.com',
  logo: 'https://thelucylounge.com/logo.png',
  description: 'A universal media intelligence platform for personalized discovery across movies, music, podcasts, and audiobooks.',
  slogan: 'Your AI-powered media companion',
  foundingDate: '2024',
  
  // Social
  twitter: '@thelucylounge',
  
  // Entity keywords
  entityKeywords: [
    'media intelligence platform',
    'AI-powered discovery',
    'universal media companion',
    'personalized recommendations',
    'cross-platform media',
    'taste memory',
    'Lucy AI',
  ],
} as const;

export const SEO_DEFAULTS = {
  titleSuffix: ' | The Lucy Lounge',
  maxTitleLength: 60,
  maxDescriptionLength: 160,
  defaultImage: 'https://thelucylounge.com/og-image.png',
  defaultImageAlt: 'The Lucy Lounge - Universal Media Intelligence Platform',
  locale: 'en_US',
  twitterSite: '@thelucylounge',
} as const;

// Pages that should NOT be indexed
export const NO_INDEX_PATHS = [
  '/auth',
  '/login',
  '/signup',
  '/reset-password',
  '/admin',
  '/internal',
  '/draft',
  '/preview',
  '/api',
  '/debug',
  '/test',
] as const;

// Pages with high crawl priority
export const HIGH_PRIORITY_PATHS = [
  '/',
  '/explore',
  '/listening',
  '/media',
  '/studios',
  '/about',
] as const;
