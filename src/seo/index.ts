/**
 * ┌─────────────────────────────────────────────────────────────────────────────┐
 * │ THE LUCY LOUNGE — SEO MODULE INDEX                                         │
 * │                                                                             │
 * │ Central export for all SEO infrastructure.                                 │
 * │ Import from 'src/seo' to access all SEO utilities.                         │
 * └─────────────────────────────────────────────────────────────────────────────┘
 */

// =============================================================================
// TYPE EXPORTS
// =============================================================================
export type {
  SEOConfig,
  OpenGraphMeta,
  TwitterMeta,
  Schema,
  SitemapEntry,
  SitemapIndex,
  InternalLink,
  LinkCluster,
  SEOAuditResult,
  SEOIssue,
  MediaSEOData,
  ExploreSEOData,
  ListeningSEOData,
} from './types';

export {
  LUCY_BRAND,
  NO_INDEX_PATHS,
  HIGH_PRIORITY_PATHS,
} from './types';

// =============================================================================
// SCHEMA GENERATORS
// =============================================================================
export {
  // Global schemas
  generateGlobalSchemas,
  generateHomePageSchemas,
  
  // Media schemas
  generateMovieSchema,
  generateTVSeriesSchema,
  generateVideoSchema,
  generateMusicRecordingSchema,
  generateMusicAlbumSchema,
  generatePlaylistSchema,
  generatePodcastSeriesSchema,
  generatePodcastEpisodeSchema,
  generateAudiobookSchema,
  
  // Collection schemas
  generateExploreCollectionSchema,
  generateItemListSchema,
  
  // Utility schemas
  generateBreadcrumbSchema,
  generateFAQSchema,
  generateHowToSchema,
  
  // Schema utilities
  serializeSchemas,
  validateSchema,
} from './schemas';

// =============================================================================
// META TAG GENERATORS
// =============================================================================
export {
  generateMetaTags,
  generateOpenGraphTags,
  generateTwitterTags,
  generateHomePageMeta,
  generateExploreMeta,
  generateMediaMeta,
  generateListeningMeta,
  generateDiscoveryMeta,
} from './metaGenerator';

// =============================================================================
// SITEMAP GENERATOR
// =============================================================================
export {
  generateStaticPageEntries,
  generateMoodPageEntries,
  generateGenrePageEntries,
  generateJourneyPageEntries,
  generateDiscoveryIntentEntries,
  generateSimilarToEntries,
  generateListeningAfterEntries,
  buildSitemaps,
  generateSitemapXML,
  generateSitemapIndexXML,
} from './sitemapGenerator';

// =============================================================================
// INTERNAL LINKING
// =============================================================================
export {
  CORE_NAVIGATION_LINKS,
  DISCOVERY_HUB_LINKS,
  ENTITY_LINKS,
  generateRelatedMediaLinks,
  generateBreadcrumbs,
  generateCrossSellLinks,
  buildLinkCluster,
  calculateCrawlDepth,
  isOptimalCrawlDepth,
  generateFooterLinks,
  analyzeLinkStructure,
} from './internalLinking';

// =============================================================================
// AI SEARCH OPTIMIZATION
// =============================================================================
export {
  LUCY_DEFINITION,
  AI_OPTIMIZED_FAQS,
  AI_OPTIMIZED_HOWTOS,
  AI_SEARCH_SIGNALS,
  VOICE_ASSISTANT_ANSWERS,
  CITABLE_FACTS,
  generateEntityDefinitionHTML,
} from './aiSearchOptimization';

// =============================================================================
// SEO ASSERTIONS (DEV/TEST)
// =============================================================================
export {
  assertMetaTagsPresent,
  assertSchemasPresent,
  assertNoDuplicateTitles,
  assertCoreWebVitals,
  assertRobotsTxt,
  runPageAudit,
  logAuditResults,
} from './assertions';

// =============================================================================
// PROGRAMMATIC SEO
// =============================================================================
export {
  generateMoodPage,
  generateGenrePage,
  generateJourneyPage,
  generateSimilarToPage,
  generateListeningAfterPage,
  generateDiscoveryIntentPage,
  PAGE_REGISTRY,
  getTotalProgrammaticPageCount,
} from './programmaticSEO';

export type {
  ProgrammaticPage,
  ProgrammaticContent,
  PageRegistry,
} from './programmaticSEO';
