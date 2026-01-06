/**
 * SEO Configuration - Canonical Domain Constant
 * 
 * SINGLE SOURCE OF TRUTH for all SEO-related domain references.
 * This constant must be used everywhere URLs are generated for:
 * - Canonical links
 * - OG/Twitter meta tags
 * - Schema.org structured data
 * - Sitemap entries
 * - Internal absolute links
 * 
 * MIGRATION NOTE: All references to lucylounge.org have been
 * migrated to thelucylounge.com as of January 2026.
 */

export const CANONICAL_DOMAIN = 'https://thelucylounge.com';

// Helper function to generate full canonical URLs
export const getCanonicalUrl = (path: string): string => {
  // Ensure path starts with /
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${CANONICAL_DOMAIN}${normalizedPath}`;
};

// Helper function to generate full image URLs
export const getImageUrl = (imagePath: string): string => {
  if (imagePath.startsWith('http')) {
    return imagePath;
  }
  const normalizedPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
  return `${CANONICAL_DOMAIN}${normalizedPath}`;
};

// Site metadata constants
export const SITE_NAME = 'Lucy AI';
export const SITE_TITLE_SUFFIX = 'The Lucy Lounge';
export const SITE_DESCRIPTION = 'Lucy AI is your divine digital companion with advanced reasoning, multimodal intelligence, real-time web search, code execution, and long-term memory. Engineered by Terrence Milliner Sr.';
export const SITE_AUTHOR = 'Terrence Milliner Sr.';
export const SITE_TWITTER = '@LucyAI';
export const SITE_THEME_COLOR = '#7B3FF2';
