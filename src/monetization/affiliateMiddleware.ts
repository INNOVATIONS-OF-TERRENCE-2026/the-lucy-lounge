/**
 * ┌─────────────────────────────────────────────────────────────────────────────┐
 * │ THE LUCY LOUNGE — AFFILIATE LINK MIDDLEWARE                                │
 * │                                                                             │
 * │ Transform media deep links into revenue without degrading UX               │
 * │ Every click tracked. Every conversion attributed. Every partner honored.   │
 * │                                                                             │
 * │ Lucy earns her keep by driving value, not dark patterns.                   │
 * └─────────────────────────────────────────────────────────────────────────────┘
 */

import { supabase } from '@/integrations/supabase/client';
import type { 
  AffiliateLink, 
  AffiliatePartner, 
  AttributionEvent,
  ConversionEvent 
} from './types';

// =============================================================================
// AFFILIATE CONFIGURATION
// =============================================================================

const AFFILIATE_LINKS: Record<AffiliatePartner, AffiliateLink> = {
  amazon_music: {
    id: 'amzn-music',
    partner: 'amazon_music',
    baseUrl: 'https://music.amazon.com',
    affiliateTag: 'lucylounge-20',
    deepLinkTemplate: 'https://music.amazon.com/albums/{albumId}?tag={tag}',
    commissionRate: 5,
    cookieDuration: 24,
    enabled: true,
    requiresAttribution: true,
  },
  apple_music: {
    id: 'apple-music',
    partner: 'apple_music',
    baseUrl: 'https://music.apple.com',
    affiliateTag: 'lucylounge',
    deepLinkTemplate: 'https://music.apple.com/{region}/album/{albumId}?at={tag}',
    commissionRate: 7,
    cookieDuration: 30,
    enabled: true,
    requiresAttribution: true,
  },
  spotify_premium: {
    id: 'spotify',
    partner: 'spotify_premium',
    baseUrl: 'https://open.spotify.com',
    affiliateTag: 'lucylounge',
    deepLinkTemplate: 'https://open.spotify.com/{type}/{id}',
    commissionRate: 0, // Spotify doesn't have traditional affiliate
    cookieDuration: 0,
    enabled: true,
    requiresAttribution: false,
  },
  audible: {
    id: 'audible',
    partner: 'audible',
    baseUrl: 'https://www.audible.com',
    affiliateTag: 'lucylounge-20',
    deepLinkTemplate: 'https://www.audible.com/pd/{bookId}?tag={tag}',
    commissionRate: 10,
    cookieDuration: 24,
    enabled: true,
    requiresAttribution: true,
  },
  kindle_unlimited: {
    id: 'kindle',
    partner: 'kindle_unlimited',
    baseUrl: 'https://www.amazon.com',
    affiliateTag: 'lucylounge-20',
    deepLinkTemplate: 'https://www.amazon.com/dp/{bookId}?tag={tag}',
    commissionRate: 4,
    cookieDuration: 24,
    enabled: true,
    requiresAttribution: true,
  },
  youtube_premium: {
    id: 'yt-premium',
    partner: 'youtube_premium',
    baseUrl: 'https://www.youtube.com',
    affiliateTag: '',
    deepLinkTemplate: 'https://www.youtube.com/watch?v={videoId}',
    commissionRate: 0,
    cookieDuration: 0,
    enabled: true,
    requiresAttribution: false,
  },
  netflix: {
    id: 'netflix',
    partner: 'netflix',
    baseUrl: 'https://www.netflix.com',
    affiliateTag: '',
    deepLinkTemplate: 'https://www.netflix.com/title/{titleId}',
    commissionRate: 0, // Netflix rarely has affiliate programs
    cookieDuration: 0,
    enabled: true,
    requiresAttribution: false,
  },
  hbo_max: {
    id: 'hbo',
    partner: 'hbo_max',
    baseUrl: 'https://www.max.com',
    affiliateTag: '',
    deepLinkTemplate: 'https://www.max.com/{type}/{slug}',
    commissionRate: 0,
    cookieDuration: 0,
    enabled: true,
    requiresAttribution: false,
  },
  disney_plus: {
    id: 'disney',
    partner: 'disney_plus',
    baseUrl: 'https://www.disneyplus.com',
    affiliateTag: '',
    deepLinkTemplate: 'https://www.disneyplus.com/{type}/{slug}',
    commissionRate: 0,
    cookieDuration: 0,
    enabled: true,
    requiresAttribution: false,
  },
  paramount: {
    id: 'paramount',
    partner: 'paramount',
    baseUrl: 'https://www.paramountplus.com',
    affiliateTag: '',
    deepLinkTemplate: 'https://www.paramountplus.com/shows/{slug}',
    commissionRate: 0,
    cookieDuration: 0,
    enabled: true,
    requiresAttribution: false,
  },
  peacock: {
    id: 'peacock',
    partner: 'peacock',
    baseUrl: 'https://www.peacocktv.com',
    affiliateTag: '',
    deepLinkTemplate: 'https://www.peacocktv.com/watch/{slug}',
    commissionRate: 0,
    cookieDuration: 0,
    enabled: true,
    requiresAttribution: false,
  },
  tubi: {
    id: 'tubi',
    partner: 'tubi',
    baseUrl: 'https://tubitv.com',
    affiliateTag: '',
    deepLinkTemplate: 'https://tubitv.com/{type}/{id}',
    commissionRate: 0,
    cookieDuration: 0,
    enabled: true,
    requiresAttribution: false,
  },
  pluto: {
    id: 'pluto',
    partner: 'pluto',
    baseUrl: 'https://pluto.tv',
    affiliateTag: '',
    deepLinkTemplate: 'https://pluto.tv/on-demand/{type}/{id}',
    commissionRate: 0,
    cookieDuration: 0,
    enabled: true,
    requiresAttribution: false,
  },
  plex: {
    id: 'plex',
    partner: 'plex',
    baseUrl: 'https://watch.plex.tv',
    affiliateTag: '',
    deepLinkTemplate: 'https://watch.plex.tv/{type}/{id}',
    commissionRate: 0,
    cookieDuration: 0,
    enabled: true,
    requiresAttribution: false,
  },
};

// =============================================================================
// SESSION MANAGEMENT
// =============================================================================

function getSessionId(): string {
  const key = 'lucy_session_id';
  let sessionId = sessionStorage.getItem(key);
  
  if (!sessionId) {
    sessionId = `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem(key, sessionId);
  }
  
  return sessionId;
}

async function getCurrentUserId(): Promise<string | null> {
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id || null;
}

// =============================================================================
// DEEP LINK GENERATION
// =============================================================================

export interface DeepLinkParams {
  partner: AffiliatePartner;
  contentId: string;
  contentType?: string;
  region?: string;
}

export function generateDeepLink(params: DeepLinkParams): string {
  const config = AFFILIATE_LINKS[params.partner];
  if (!config || !config.enabled) {
    return '';
  }
  
  let url = config.deepLinkTemplate;
  
  // Replace template variables
  url = url.replace('{albumId}', params.contentId);
  url = url.replace('{bookId}', params.contentId);
  url = url.replace('{videoId}', params.contentId);
  url = url.replace('{titleId}', params.contentId);
  url = url.replace('{id}', params.contentId);
  url = url.replace('{slug}', params.contentId);
  url = url.replace('{type}', params.contentType || 'content');
  url = url.replace('{region}', params.region || 'us');
  url = url.replace('{tag}', config.affiliateTag);
  
  return url;
}

// =============================================================================
// ATTRIBUTION TRACKING
// =============================================================================

export interface TrackClickParams {
  partner: AffiliatePartner;
  mediaNodeId?: string;
  source: AttributionEvent['source'];
  componentPath: string;
  deepLinkUrl: string;
}

export async function trackAffiliateClick(params: TrackClickParams): Promise<string> {
  const userId = await getCurrentUserId();
  const sessionId = getSessionId();
  
  const event: Omit<AttributionEvent, 'id'> = {
    userId: userId || undefined,
    sessionId,
    partner: params.partner,
    mediaNodeId: params.mediaNodeId,
    deepLinkUrl: params.deepLinkUrl,
    source: params.source,
    componentPath: params.componentPath,
    timestamp: new Date(),
  };
  
  // Store in Supabase (would need table created)
  // For now, also store in localStorage for debugging
  const attributionId = `attr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  const attributions = JSON.parse(localStorage.getItem('lucy_attributions') || '[]');
  attributions.push({ id: attributionId, ...event });
  localStorage.setItem('lucy_attributions', JSON.stringify(attributions.slice(-100)));
  
  // Set attribution cookie for conversion tracking
  document.cookie = `lucy_attr=${attributionId}; path=/; max-age=${AFFILIATE_LINKS[params.partner].cookieDuration * 86400}`;
  
  console.log('[AffiliateMiddleware] Click tracked:', attributionId, params.partner);
  
  return attributionId;
}

// =============================================================================
// CONVERSION TRACKING
// =============================================================================

export async function trackConversion(params: {
  attributionId: string;
  partner: AffiliatePartner;
  type: ConversionEvent['type'];
  revenue: number;
  currency?: string;
}): Promise<void> {
  const config = AFFILIATE_LINKS[params.partner];
  const commission = params.revenue * (config.commissionRate / 100);
  
  const event: Omit<ConversionEvent, 'id'> = {
    attributionId: params.attributionId,
    partner: params.partner,
    type: params.type,
    revenue: params.revenue,
    commission,
    currency: params.currency || 'USD',
    lucyInfluenceScore: 0.8, // Would be calculated based on journey
    timestamp: new Date(),
  };
  
  // Store conversion
  const conversions = JSON.parse(localStorage.getItem('lucy_conversions') || '[]');
  conversions.push({ id: `conv_${Date.now()}`, ...event });
  localStorage.setItem('lucy_conversions', JSON.stringify(conversions.slice(-100)));
  
  console.log('[AffiliateMiddleware] Conversion tracked:', params.partner, commission);
}

// =============================================================================
// SMART LINK ROUTING
// =============================================================================

export interface SmartLinkOptions {
  mediaNodeId: string;
  title: string;
  artist?: string;
  type: 'track' | 'album' | 'podcast' | 'audiobook' | 'movie' | 'show';
  source: AttributionEvent['source'];
  componentPath: string;
  
  // Provider IDs
  spotifyId?: string;
  appleMusicId?: string;
  amazonMusicId?: string;
  youtubeId?: string;
  netflixId?: string;
  // ... other provider IDs
}

export interface SmartLinkResult {
  primary: {
    partner: AffiliatePartner;
    url: string;
    label: string;
  };
  alternatives: {
    partner: AffiliatePartner;
    url: string;
    label: string;
  }[];
}

export function generateSmartLinks(options: SmartLinkOptions): SmartLinkResult {
  const links: SmartLinkResult['alternatives'] = [];
  
  // Audio content
  if (options.type === 'track' || options.type === 'album') {
    if (options.spotifyId) {
      links.push({
        partner: 'spotify_premium',
        url: generateDeepLink({ partner: 'spotify_premium', contentId: options.spotifyId, contentType: options.type }),
        label: 'Spotify',
      });
    }
    if (options.appleMusicId) {
      links.push({
        partner: 'apple_music',
        url: generateDeepLink({ partner: 'apple_music', contentId: options.appleMusicId }),
        label: 'Apple Music',
      });
    }
    if (options.amazonMusicId) {
      links.push({
        partner: 'amazon_music',
        url: generateDeepLink({ partner: 'amazon_music', contentId: options.amazonMusicId }),
        label: 'Amazon Music',
      });
    }
    if (options.youtubeId) {
      links.push({
        partner: 'youtube_premium',
        url: generateDeepLink({ partner: 'youtube_premium', contentId: options.youtubeId }),
        label: 'YouTube Music',
      });
    }
  }
  
  // Audiobooks
  if (options.type === 'audiobook') {
    links.push({
      partner: 'audible',
      url: generateDeepLink({ partner: 'audible', contentId: options.title.replace(/\s+/g, '-').toLowerCase() }),
      label: 'Audible',
    });
  }
  
  // Video content
  if (options.type === 'movie' || options.type === 'show') {
    if (options.netflixId) {
      links.push({
        partner: 'netflix',
        url: generateDeepLink({ partner: 'netflix', contentId: options.netflixId }),
        label: 'Netflix',
      });
    }
    // Add Tubi/Pluto for free options
    links.push({
      partner: 'tubi',
      url: `https://tubitv.com/search/${encodeURIComponent(options.title)}`,
      label: 'Tubi (Free)',
    });
    links.push({
      partner: 'pluto',
      url: `https://pluto.tv/search/${encodeURIComponent(options.title)}`,
      label: 'Pluto TV (Free)',
    });
  }
  
  // Sort by commission rate (revenue optimization)
  links.sort((a, b) => {
    const aRate = AFFILIATE_LINKS[a.partner].commissionRate;
    const bRate = AFFILIATE_LINKS[b.partner].commissionRate;
    return bRate - aRate;
  });
  
  return {
    primary: links[0] || { partner: 'spotify_premium', url: '', label: 'Listen' },
    alternatives: links.slice(1),
  };
}

// =============================================================================
// CLICK HANDLER
// =============================================================================

export async function handleAffiliateClick(
  partner: AffiliatePartner,
  url: string,
  options: {
    mediaNodeId?: string;
    source: AttributionEvent['source'];
    componentPath: string;
    openInNewTab?: boolean;
  }
): Promise<void> {
  // Track the click
  await trackAffiliateClick({
    partner,
    mediaNodeId: options.mediaNodeId,
    source: options.source,
    componentPath: options.componentPath,
    deepLinkUrl: url,
  });
  
  // Open the link
  if (options.openInNewTab !== false) {
    window.open(url, '_blank', 'noopener,noreferrer');
  } else {
    window.location.href = url;
  }
}

// =============================================================================
// ANALYTICS HELPERS
// =============================================================================

export function getAttributionStats(): {
  totalClicks: number;
  byPartner: Record<AffiliatePartner, number>;
  recentClicks: AttributionEvent[];
} {
  const attributions: AttributionEvent[] = JSON.parse(
    localStorage.getItem('lucy_attributions') || '[]'
  );
  
  const byPartner = attributions.reduce((acc, attr) => {
    acc[attr.partner] = (acc[attr.partner] || 0) + 1;
    return acc;
  }, {} as Record<AffiliatePartner, number>);
  
  return {
    totalClicks: attributions.length,
    byPartner,
    recentClicks: attributions.slice(-10).reverse(),
  };
}

export function getConversionStats(): {
  totalConversions: number;
  totalRevenue: number;
  totalCommission: number;
  byPartner: Record<AffiliatePartner, { conversions: number; revenue: number; commission: number }>;
} {
  const conversions: ConversionEvent[] = JSON.parse(
    localStorage.getItem('lucy_conversions') || '[]'
  );
  
  const byPartner = conversions.reduce((acc, conv) => {
    if (!acc[conv.partner]) {
      acc[conv.partner] = { conversions: 0, revenue: 0, commission: 0 };
    }
    acc[conv.partner].conversions += 1;
    acc[conv.partner].revenue += conv.revenue;
    acc[conv.partner].commission += conv.commission;
    return acc;
  }, {} as Record<AffiliatePartner, { conversions: number; revenue: number; commission: number }>);
  
  return {
    totalConversions: conversions.length,
    totalRevenue: conversions.reduce((sum, c) => sum + c.revenue, 0),
    totalCommission: conversions.reduce((sum, c) => sum + c.commission, 0),
    byPartner,
  };
}
