/**
 * ┌─────────────────────────────────────────────────────────────────────────────┐
 * │ THE LUCY LOUNGE — useSEO React Hook                                        │
 * │                                                                             │
 * │ React hook for injecting SEO metadata into pages.                          │
 * │ Handles meta tags, JSON-LD schemas, and canonical URLs.                    │
 * │                                                                             │
 * │ Usage:                                                                      │
 * │   useSEO({ title: 'My Page', description: '...', schemas: [...] });       │
 * └─────────────────────────────────────────────────────────────────────────────┘
 */

import { useEffect, useCallback } from 'react';
import type { SEOConfig, Schema } from '../seo/types';
import { LUCY_BRAND } from '../seo/types';
import { serializeSchemas, generateGlobalSchemas } from '../seo/schemas';

// =============================================================================
// TYPES
// =============================================================================

export interface UseSEOOptions {
  /** Page title (will be suffixed with " — Lucy Lounge" if not present) */
  title: string;
  
  /** Meta description (150-160 chars recommended) */
  description: string;
  
  /** Canonical URL (absolute or relative path) */
  canonical?: string;
  
  /** JSON-LD schemas for this page */
  schemas?: Schema[];
  
  /** Open Graph image URL */
  ogImage?: string;
  
  /** Open Graph type */
  ogType?: 'website' | 'article' | 'video.movie' | 'music.song' | 'profile';
  
  /** Twitter card type */
  twitterCard?: 'summary' | 'summary_large_image' | 'player';
  
  /** Keywords for meta tag (optional, low SEO impact) */
  keywords?: string[];
  
  /** Whether to include global schemas */
  includeGlobalSchemas?: boolean;
  
  /** Whether to prevent indexing */
  noIndex?: boolean;
  
  /** Whether to prevent following links */
  noFollow?: boolean;
}

// =============================================================================
// HOOK IMPLEMENTATION
// =============================================================================

/**
 * React hook for managing SEO metadata on a page
 * 
 * @example
 * ```tsx
 * useSEO({
 *   title: 'Explore Movies',
 *   description: 'Discover AI-curated movie recommendations.',
 *   schemas: [generateExploreCollectionSchema(data)],
 * });
 * ```
 */
export function useSEO(options: UseSEOOptions): void {
  const {
    title,
    description,
    canonical,
    schemas = [],
    ogImage,
    ogType = 'website',
    twitterCard = 'summary_large_image',
    keywords,
    includeGlobalSchemas = false,
    noIndex = false,
    noFollow = false,
  } = options;

  // Normalize title
  const normalizedTitle = title.includes('Lucy') 
    ? title 
    : `${title} — Lucy Lounge`;

  // Normalize canonical URL
  const normalizedCanonical = canonical
    ? (canonical.startsWith('http') ? canonical : `${LUCY_BRAND.url}${canonical.startsWith('/') ? '' : '/'}${canonical}`)
    : undefined;

  // Combine schemas
  const allSchemas = includeGlobalSchemas 
    ? [...generateGlobalSchemas(), ...schemas]
    : schemas;

  // Update document head
  useEffect(() => {
    // Title
    document.title = normalizedTitle;

    // Meta description
    updateMetaTag('description', description);

    // Canonical
    if (normalizedCanonical) {
      updateLinkTag('canonical', normalizedCanonical);
    }

    // Robots
    const robotsContent = [
      noIndex ? 'noindex' : 'index',
      noFollow ? 'nofollow' : 'follow',
    ].join(', ');
    updateMetaTag('robots', robotsContent);

    // Keywords (low priority but included for completeness)
    if (keywords?.length) {
      updateMetaTag('keywords', keywords.join(', '));
    }

    // Open Graph
    updateMetaProperty('og:title', normalizedTitle);
    updateMetaProperty('og:description', description);
    updateMetaProperty('og:type', ogType);
    updateMetaProperty('og:site_name', LUCY_BRAND.name);
    if (normalizedCanonical) {
      updateMetaProperty('og:url', normalizedCanonical);
    }
    if (ogImage) {
      updateMetaProperty('og:image', ogImage);
    }

    // Twitter Cards
    updateMetaTag('twitter:card', twitterCard, 'name');
    updateMetaTag('twitter:site', LUCY_BRAND.twitterHandle, 'name');
    updateMetaTag('twitter:title', normalizedTitle, 'name');
    updateMetaTag('twitter:description', description, 'name');
    if (ogImage) {
      updateMetaTag('twitter:image', ogImage, 'name');
    }

    // JSON-LD Schemas
    if (allSchemas.length > 0) {
      injectSchemas(allSchemas);
    }

    // Cleanup function
    return () => {
      removeSchemas();
    };
  }, [
    normalizedTitle,
    description,
    normalizedCanonical,
    ogType,
    ogImage,
    twitterCard,
    keywords?.join(','),
    allSchemas.length,
    noIndex,
    noFollow,
  ]);
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

function updateMetaTag(
  name: string, 
  content: string, 
  attributeType: 'name' | 'property' = 'name'
): void {
  let element = document.querySelector(`meta[${attributeType}="${name}"]`) as HTMLMetaElement | null;
  
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attributeType, name);
    document.head.appendChild(element);
  }
  
  element.content = content;
}

function updateMetaProperty(property: string, content: string): void {
  updateMetaTag(property, content, 'property');
}

function updateLinkTag(rel: string, href: string): void {
  let element = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null;
  
  if (!element) {
    element = document.createElement('link');
    element.rel = rel;
    document.head.appendChild(element);
  }
  
  element.href = href;
}

function injectSchemas(schemas: Schema[]): void {
  // Remove existing Lucy schemas first
  removeSchemas();
  
  // Create new script element
  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.id = 'lucy-seo-schemas';
  script.textContent = serializeSchemas(schemas);
  document.head.appendChild(script);
}

function removeSchemas(): void {
  const existing = document.getElementById('lucy-seo-schemas');
  if (existing) {
    existing.remove();
  }
}

// =============================================================================
// PRE-BUILT PAGE SEO HOOKS
// =============================================================================

/**
 * SEO hook for the home page
 */
export function useHomePageSEO(): void {
  useSEO({
    title: 'Lucy Lounge — Your AI-Powered Media Intelligence Platform',
    description: 'Discover movies, music, podcasts, and audiobooks with Lucy, your AI media companion. Personalized recommendations across all your favorite platforms.',
    canonical: '/',
    includeGlobalSchemas: true,
    ogImage: `${LUCY_BRAND.url}/images/og-home.png`,
  });
}

/**
 * SEO hook for explore pages
 */
export function useExplorePageSEO(
  category: string,
  value: string,
  itemCount: number,
  schemas: Schema[] = []
): void {
  const capitalizedCategory = category.charAt(0).toUpperCase() + category.slice(1);
  const capitalizedValue = value.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  
  useSEO({
    title: `${capitalizedValue} ${capitalizedCategory} — Lucy Lounge`,
    description: `Explore ${itemCount}+ ${capitalizedValue} recommendations. AI-curated movies, music, podcasts, and audiobooks for every ${category}.`,
    canonical: `/explore/${category}/${value}`,
    schemas,
    ogImage: `${LUCY_BRAND.url}/images/og-explore-${category}.png`,
  });
}

/**
 * SEO hook for media detail pages
 */
export function useMediaPageSEO(
  mediaTitle: string,
  mediaType: string,
  description: string,
  schemas: Schema[] = []
): void {
  useSEO({
    title: `${mediaTitle} — ${mediaType} on Lucy Lounge`,
    description,
    canonical: `/media/${mediaTitle.toLowerCase().replace(/\s+/g, '-')}`,
    schemas,
    ogType: mediaType === 'Movie' ? 'video.movie' : 'website',
    ogImage: `${LUCY_BRAND.url}/images/og-media.png`,
  });
}

/**
 * SEO hook for listening pages
 */
export function useListeningPageSEO(
  title: string,
  description: string,
  itemCount: number,
  schemas: Schema[] = []
): void {
  useSEO({
    title: `${title} — Listening on Lucy Lounge`,
    description: `${description} Discover ${itemCount}+ curated audio picks.`,
    canonical: `/listening/${title.toLowerCase().replace(/\s+/g, '-')}`,
    schemas,
    ogImage: `${LUCY_BRAND.url}/images/og-listening.png`,
  });
}

export default useSEO;
