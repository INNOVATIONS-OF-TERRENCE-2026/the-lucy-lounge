/**
 * ┌─────────────────────────────────────────────────────────────────────────────┐
 * │ THE LUCY LOUNGE — JSON-LD SCHEMA GENERATORS                                │
 * │                                                                             │
 * │ Structured data that teaches search engines WHO Lucy is                    │
 * │ Every schema reinforces Lucy as THE media intelligence entity.             │
 * │                                                                             │
 * │ Google doesn't guess. We TELL Google.                                      │
 * └─────────────────────────────────────────────────────────────────────────────┘
 */

import type { Schema, MediaSEOData, ExploreSEOData, ListeningSEOData } from './types';
import { LUCY_BRAND } from './types';

// =============================================================================
// GLOBAL SCHEMAS (EVERY PAGE)
// =============================================================================

/**
 * Core Lucy Lounge application schema - appears on EVERY page
 */
export function generateGlobalSchemas(): Schema[] {
  return [
    // Software Application
    {
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: LUCY_BRAND.name,
      applicationCategory: 'EntertainmentApplication',
      operatingSystem: 'Web',
      description: LUCY_BRAND.description,
      url: LUCY_BRAND.url,
      logo: LUCY_BRAND.logo,
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
        description: 'Free tier available with premium upgrades',
      },
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: '4.8',
        ratingCount: '10000',
        bestRating: '5',
        worstRating: '1',
      },
      featureList: [
        'AI-powered media recommendations',
        'Cross-platform discovery',
        'Personalized taste memory',
        'Universal media search',
        'Mood-based journeys',
        'Cross-device sync',
      ],
    },
    
    // Organization
    {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: LUCY_BRAND.name,
      legalName: LUCY_BRAND.legalName,
      url: LUCY_BRAND.url,
      logo: LUCY_BRAND.logo,
      description: LUCY_BRAND.description,
      foundingDate: LUCY_BRAND.foundingDate,
      sameAs: [
        `https://twitter.com/${LUCY_BRAND.twitter.replace('@', '')}`,
      ],
      contactPoint: {
        '@type': 'ContactPoint',
        contactType: 'customer support',
        url: `${LUCY_BRAND.url}/support`,
      },
    },
    
    // WebSite with SearchAction
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: LUCY_BRAND.name,
      url: LUCY_BRAND.url,
      description: LUCY_BRAND.description,
      potentialAction: {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: `${LUCY_BRAND.url}/search?q={search_term_string}`,
        },
        'query-input': 'required name=search_term_string',
      },
    },
  ];
}

// =============================================================================
// HOME PAGE SCHEMAS
// =============================================================================

export function generateHomePageSchemas(): Schema[] {
  return [
    ...generateGlobalSchemas(),
    
    // WebApplication (enhanced for home)
    {
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      name: LUCY_BRAND.name,
      url: LUCY_BRAND.url,
      applicationCategory: 'Entertainment',
      browserRequirements: 'Requires JavaScript. Requires HTML5.',
      description: 'The Lucy Lounge is a universal media intelligence platform that uses AI to help you discover movies, music, podcasts, and audiobooks across all streaming platforms.',
      offers: {
        '@type': 'AggregateOffer',
        lowPrice: '0',
        highPrice: '19.99',
        priceCurrency: 'USD',
        offerCount: '5',
      },
      screenshot: `${LUCY_BRAND.url}/screenshots/home.png`,
      featureList: [
        'Universal media discovery across Netflix, Spotify, Apple Music, and 50+ platforms',
        'AI companion Lucy that learns your taste',
        'Mood-based recommendation journeys',
        'Cross-device playback sync',
        'Personalized daily discoveries',
      ],
    },
    
    // Brand
    {
      '@context': 'https://schema.org',
      '@type': 'Brand',
      name: LUCY_BRAND.name,
      slogan: LUCY_BRAND.slogan,
      logo: LUCY_BRAND.logo,
      url: LUCY_BRAND.url,
      description: 'Lucy Lounge is a media intelligence brand that helps users discover content they love through AI-powered personalization.',
    },
  ];
}

// =============================================================================
// MEDIA PAGE SCHEMAS
// =============================================================================

export function generateMovieSchema(data: MediaSEOData): Schema {
  return {
    '@context': 'https://schema.org',
    '@type': 'Movie',
    name: data.title,
    description: data.description,
    image: data.image,
    datePublished: data.releaseDate,
    duration: data.duration ? `PT${Math.floor(data.duration / 60)}H${data.duration % 60}M` : undefined,
    genre: data.genres,
    director: data.creators?.map(name => ({
      '@type': 'Person',
      name,
    })),
    aggregateRating: data.rating ? {
      '@type': 'AggregateRating',
      ratingValue: data.rating,
      ratingCount: data.ratingCount || 100,
      bestRating: 10,
      worstRating: 0,
    } : undefined,
    url: `${LUCY_BRAND.url}/media/${data.id}`,
    potentialAction: {
      '@type': 'WatchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${LUCY_BRAND.url}/media/${data.id}/watch`,
        actionPlatform: [
          'http://schema.org/DesktopWebPlatform',
          'http://schema.org/MobileWebPlatform',
        ],
      },
    },
  };
}

export function generateTVSeriesSchema(data: MediaSEOData): Schema {
  return {
    '@context': 'https://schema.org',
    '@type': 'TVSeries',
    name: data.title,
    description: data.description,
    image: data.image,
    datePublished: data.releaseDate,
    genre: data.genres,
    creator: data.creators?.map(name => ({
      '@type': 'Person',
      name,
    })),
    aggregateRating: data.rating ? {
      '@type': 'AggregateRating',
      ratingValue: data.rating,
      ratingCount: data.ratingCount || 100,
      bestRating: 10,
      worstRating: 0,
    } : undefined,
    url: `${LUCY_BRAND.url}/media/${data.id}`,
  };
}

export function generateVideoSchema(data: MediaSEOData): Schema {
  return {
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    name: data.title,
    description: data.description,
    thumbnailUrl: data.image,
    uploadDate: data.releaseDate || new Date().toISOString(),
    duration: data.duration ? `PT${Math.floor(data.duration / 60)}M${data.duration % 60}S` : undefined,
    contentUrl: `${LUCY_BRAND.url}/media/${data.id}`,
    embedUrl: `${LUCY_BRAND.url}/embed/${data.id}`,
    interactionStatistic: {
      '@type': 'InteractionCounter',
      interactionType: 'http://schema.org/WatchAction',
      userInteractionCount: data.ratingCount || 1000,
    },
  };
}

// =============================================================================
// LISTENING PAGE SCHEMAS
// =============================================================================

export function generateMusicRecordingSchema(data: MediaSEOData): Schema {
  return {
    '@context': 'https://schema.org',
    '@type': 'MusicRecording',
    name: data.title,
    description: data.description,
    image: data.image,
    datePublished: data.releaseDate,
    duration: data.duration ? `PT${Math.floor(data.duration / 60)}M${data.duration % 60}S` : undefined,
    genre: data.genres?.[0],
    byArtist: data.creators?.map(name => ({
      '@type': 'MusicGroup',
      name,
    })),
    url: `${LUCY_BRAND.url}/listening/track/${data.id}`,
  };
}

export function generateMusicAlbumSchema(data: MediaSEOData & { tracks?: MediaSEOData[] }): Schema {
  return {
    '@context': 'https://schema.org',
    '@type': 'MusicAlbum',
    name: data.title,
    description: data.description,
    image: data.image,
    datePublished: data.releaseDate,
    genre: data.genres,
    byArtist: data.creators?.map(name => ({
      '@type': 'MusicGroup',
      name,
    })),
    numTracks: data.tracks?.length,
    track: data.tracks?.map(track => ({
      '@type': 'MusicRecording',
      name: track.title,
      duration: track.duration ? `PT${Math.floor(track.duration / 60)}M${track.duration % 60}S` : undefined,
    })),
    url: `${LUCY_BRAND.url}/listening/album/${data.id}`,
  };
}

export function generatePodcastSeriesSchema(data: MediaSEOData): Schema {
  return {
    '@context': 'https://schema.org',
    '@type': 'PodcastSeries',
    name: data.title,
    description: data.description,
    image: data.image,
    datePublished: data.releaseDate,
    genre: data.genres,
    author: data.creators?.map(name => ({
      '@type': 'Person',
      name,
    })),
    url: `${LUCY_BRAND.url}/listening/podcast/${data.id}`,
    webFeed: `${LUCY_BRAND.url}/feeds/podcast/${data.id}.xml`,
  };
}

export function generatePodcastEpisodeSchema(
  data: MediaSEOData,
  series: { title: string; id: string }
): Schema {
  return {
    '@context': 'https://schema.org',
    '@type': 'PodcastEpisode',
    name: data.title,
    description: data.description,
    image: data.image,
    datePublished: data.releaseDate,
    duration: data.duration ? `PT${Math.floor(data.duration / 60)}M${data.duration % 60}S` : undefined,
    partOfSeries: {
      '@type': 'PodcastSeries',
      name: series.title,
      url: `${LUCY_BRAND.url}/listening/podcast/${series.id}`,
    },
    url: `${LUCY_BRAND.url}/listening/episode/${data.id}`,
  };
}

export function generateAudiobookSchema(data: MediaSEOData): Schema {
  return {
    '@context': 'https://schema.org',
    '@type': 'Audiobook',
    name: data.title,
    description: data.description,
    image: data.image,
    datePublished: data.releaseDate,
    duration: data.duration ? `PT${Math.floor(data.duration / 3600)}H${Math.floor((data.duration % 3600) / 60)}M` : undefined,
    genre: data.genres,
    author: data.creators?.map(name => ({
      '@type': 'Person',
      name,
    })),
    aggregateRating: data.rating ? {
      '@type': 'AggregateRating',
      ratingValue: data.rating,
      ratingCount: data.ratingCount || 50,
      bestRating: 5,
      worstRating: 1,
    } : undefined,
    url: `${LUCY_BRAND.url}/listening/audiobook/${data.id}`,
  };
}

export function generatePlaylistSchema(data: ListeningSEOData): Schema {
  return {
    '@context': 'https://schema.org',
    '@type': 'MusicPlaylist',
    name: data.name,
    description: data.description,
    image: data.image,
    numTracks: data.trackCount,
    creator: data.creator ? {
      '@type': 'Organization',
      name: data.creator === 'lucy' ? LUCY_BRAND.name : data.creator,
    } : undefined,
    url: `${LUCY_BRAND.url}/listening/playlist/${data.name.toLowerCase().replace(/\s+/g, '-')}`,
  };
}

// =============================================================================
// EXPLORE PAGE SCHEMAS
// =============================================================================

export function generateExploreCollectionSchema(data: ExploreSEOData): Schema {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: data.title,
    description: data.description,
    url: `${LUCY_BRAND.url}/explore/${data.category}/${data.value}`,
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: data.items.slice(0, 10).map((item, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        item: {
          '@type': item.type === 'movie' ? 'Movie' : item.type === 'series' ? 'TVSeries' : 'CreativeWork',
          name: item.title,
          description: item.description,
          image: item.image,
          url: `${LUCY_BRAND.url}/media/${item.id}`,
        },
      })),
      numberOfItems: data.itemCount,
    },
    isPartOf: {
      '@type': 'WebSite',
      name: LUCY_BRAND.name,
      url: LUCY_BRAND.url,
    },
  };
}

export function generateItemListSchema(items: MediaSEOData[], listName: string): Schema {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: listName,
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'CreativeWork',
        name: item.title,
        description: item.description,
        image: item.image,
        url: `${LUCY_BRAND.url}/media/${item.id}`,
      },
    })),
    numberOfItems: items.length,
  };
}

// =============================================================================
// BREADCRUMB SCHEMA
// =============================================================================

export function generateBreadcrumbSchema(
  breadcrumbs: { name: string; url: string }[]
): Schema {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbs.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.name,
      item: crumb.url.startsWith('http') ? crumb.url : `${LUCY_BRAND.url}${crumb.url}`,
    })),
  };
}

// =============================================================================
// FAQ SCHEMA (FOR AI SEARCH DOMINANCE)
// =============================================================================

export function generateFAQSchema(
  faqs: { question: string; answer: string }[]
): Schema {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

// =============================================================================
// HOW-TO SCHEMA
// =============================================================================

export function generateHowToSchema(
  title: string,
  description: string,
  steps: { name: string; text: string; image?: string }[]
): Schema {
  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: title,
    description: description,
    step: steps.map((step, index) => ({
      '@type': 'HowToStep',
      position: index + 1,
      name: step.name,
      text: step.text,
      image: step.image,
    })),
  };
}

// =============================================================================
// SCHEMA SERIALIZATION
// =============================================================================

export function serializeSchemas(schemas: Schema[]): string {
  return schemas
    .map(schema => `<script type="application/ld+json">${JSON.stringify(schema, null, 0)}</script>`)
    .join('\n');
}

export function serializeSchema(schema: Schema): string {
  return `<script type="application/ld+json">${JSON.stringify(schema, null, 0)}</script>`;
}

// =============================================================================
// SCHEMA VALIDATION
// =============================================================================

export function validateSchema(schema: Schema): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Check required fields
  if (!schema['@context']) {
    errors.push('Missing @context');
  }
  if (!schema['@type']) {
    errors.push('Missing @type');
  }
  
  // Type-specific validation
  const type = schema['@type'];
  
  if (type === 'Movie' || type === 'TVSeries') {
    if (!schema.name) errors.push('Movie/TVSeries must have name');
    if (!schema.description) errors.push('Movie/TVSeries should have description');
  }
  
  if (type === 'MusicRecording' || type === 'MusicAlbum') {
    if (!schema.name) errors.push('Music schema must have name');
  }
  
  if (type === 'ItemList') {
    if (!schema.itemListElement) errors.push('ItemList must have itemListElement');
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
}
