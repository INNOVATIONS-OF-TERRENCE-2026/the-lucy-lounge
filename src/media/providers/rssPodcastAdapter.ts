// =============================================================================
// THE LUCY LOUNGE - RSS Podcast Provider Adapter
// =============================================================================
// Podcasts from any RSS feed - full-length episode playback
// =============================================================================

import {
  BaseProviderAdapter,
  ProviderInitResult,
  SearchParams,
  SearchResult,
  TrendingParams,
  GenreParams,
  NewReleasesParams,
  PaginationParams,
  CreditWithPerson,
  PlaybackInfo,
  generateCanonicalId,
  extractYear,
  normalizeDuration,
} from './ProviderAdapter';
import type { MediaNode, MediaSeries, MediaAvailability, ProviderType } from '../types';

// =============================================================================
// RSS TYPES
// =============================================================================

interface RSSFeed {
  title: string;
  description?: string;
  link?: string;
  image?: { url: string };
  author?: string;
  language?: string;
  categories?: string[];
  items: RSSItem[];
}

interface RSSItem {
  guid?: string;
  title: string;
  description?: string;
  pubDate?: string;
  enclosure?: {
    url: string;
    type: string;
    length?: string;
  };
  'itunes:duration'?: string;
  'itunes:image'?: { href: string };
  'itunes:author'?: string;
  'itunes:episode'?: string;
  'itunes:season'?: string;
}

// =============================================================================
// CURATED PODCAST FEEDS
// =============================================================================

export interface PodcastFeed {
  id: string;
  name: string;
  description?: string;
  feedUrl: string;
  category: string;
  imageUrl?: string;
}

export const CURATED_PODCASTS: PodcastFeed[] = [
  // Tech & News
  {
    id: 'daily-tech-news',
    name: 'Daily Tech News Show',
    feedUrl: 'https://feeds.feedburner.com/DailyTechNewsShow',
    category: 'technology',
    description: 'Daily tech news coverage',
  },
  {
    id: 'pivot',
    name: 'Pivot',
    feedUrl: 'https://feeds.megaphone.fm/pivot',
    category: 'business',
    description: 'Kara Swisher and Scott Galloway discuss tech and business',
  },
  
  // Comedy
  {
    id: 'comedy-bang-bang',
    name: 'Comedy Bang! Bang!',
    feedUrl: 'https://feeds.simplecast.com/byb4nhvN',
    category: 'comedy',
    description: 'Hosted by Scott Aukerman',
  },
  
  // True Crime
  {
    id: 'crime-junkie',
    name: 'Crime Junkie',
    feedUrl: 'https://feeds.simplecast.com/qm_9xx0g',
    category: 'true-crime',
    description: 'Weekly true crime podcast',
  },
  
  // Education
  {
    id: 'stuff-you-should-know',
    name: 'Stuff You Should Know',
    feedUrl: 'https://feeds.megaphone.fm/stuffyoushouldknow',
    category: 'education',
    description: 'How stuff works explained',
  },
  
  // History
  {
    id: 'hardcore-history',
    name: 'Hardcore History',
    feedUrl: 'https://feeds.feedburner.com/dancarlin/history',
    category: 'history',
    description: 'In-depth historical topics by Dan Carlin',
  },
  
  // Culture & Society
  {
    id: 'this-american-life',
    name: 'This American Life',
    feedUrl: 'https://www.thisamericanlife.org/podcast/rss.xml',
    category: 'society',
    description: 'Stories from across America',
  },
  
  // Music
  {
    id: 'song-exploder',
    name: 'Song Exploder',
    feedUrl: 'https://feeds.simplecast.com/2O9TZSe0',
    category: 'music',
    description: 'Musicians break down their songs',
  },
];

// =============================================================================
// RSS PODCAST ADAPTER
// =============================================================================

export class RSSPodcastAdapter extends BaseProviderAdapter {
  readonly providerId = 'rss_podcast';
  readonly providerType: ProviderType = 'rss_podcast';
  readonly displayName = 'Podcasts';
  readonly logoUrl = '/icons/podcast.svg';
  readonly requiresAuth = false;
  readonly supportsPlayback = true;
  readonly priority = 80;
  
  // Cache parsed feeds
  private feedCache = new Map<string, { feed: RSSFeed; fetchedAt: number }>();
  private readonly CACHE_TTL = 30 * 60 * 1000; // 30 minutes
  
  async initialize(): Promise<ProviderInitResult> {
    this._isReady = true;
    return { success: true };
  }
  
  /**
   * Parse RSS/Atom feed
   * Uses a CORS proxy for browser environments
   */
  private async parseFeed(feedUrl: string): Promise<RSSFeed> {
    // Check cache
    const cached = this.feedCache.get(feedUrl);
    if (cached && Date.now() - cached.fetchedAt < this.CACHE_TTL) {
      return cached.feed;
    }
    
    // Use a CORS proxy in browser environments
    const proxyUrl = typeof window !== 'undefined'
      ? `https://api.allorigins.win/raw?url=${encodeURIComponent(feedUrl)}`
      : feedUrl;
    
    const response = await fetch(proxyUrl);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch RSS feed: ${response.status}`);
    }
    
    const text = await response.text();
    const feed = this.parseRSSXML(text);
    
    // Cache the result
    this.feedCache.set(feedUrl, { feed, fetchedAt: Date.now() });
    
    return feed;
  }
  
  /**
   * Parse RSS XML to feed object
   */
  private parseRSSXML(xml: string): RSSFeed {
    const parser = new DOMParser();
    const doc = parser.parseFromString(xml, 'text/xml');
    
    const channel = doc.querySelector('channel');
    if (!channel) {
      throw new Error('Invalid RSS feed: no channel element');
    }
    
    const getTextContent = (parent: Element, selector: string): string | undefined => {
      const el = parent.querySelector(selector);
      return el?.textContent?.trim() || undefined;
    };
    
    const items: RSSItem[] = [];
    const itemElements = channel.querySelectorAll('item');
    
    itemElements.forEach(item => {
      const enclosure = item.querySelector('enclosure');
      
      items.push({
        guid: getTextContent(item, 'guid'),
        title: getTextContent(item, 'title') || 'Untitled',
        description: getTextContent(item, 'description'),
        pubDate: getTextContent(item, 'pubDate'),
        enclosure: enclosure ? {
          url: enclosure.getAttribute('url') || '',
          type: enclosure.getAttribute('type') || 'audio/mpeg',
          length: enclosure.getAttribute('length') || undefined,
        } : undefined,
        'itunes:duration': getTextContent(item, 'itunes\\:duration, duration'),
        'itunes:image': (() => {
          const img = item.querySelector('itunes\\:image, image');
          return img ? { href: img.getAttribute('href') || getTextContent(item, 'image url') || '' } : undefined;
        })(),
        'itunes:author': getTextContent(item, 'itunes\\:author'),
        'itunes:episode': getTextContent(item, 'itunes\\:episode'),
        'itunes:season': getTextContent(item, 'itunes\\:season'),
      });
    });
    
    // Channel image
    const imageEl = channel.querySelector('image url') || channel.querySelector('itunes\\:image');
    const imageUrl = imageEl?.textContent?.trim() || imageEl?.getAttribute('href') || undefined;
    
    // Categories
    const categoryElements = channel.querySelectorAll('itunes\\:category, category');
    const categories = Array.from(categoryElements).map(el => 
      el.getAttribute('text') || el.textContent?.trim() || ''
    ).filter(Boolean);
    
    return {
      title: getTextContent(channel, 'title') || 'Unknown Podcast',
      description: getTextContent(channel, 'description'),
      link: getTextContent(channel, 'link'),
      image: imageUrl ? { url: imageUrl } : undefined,
      author: getTextContent(channel, 'itunes\\:author'),
      language: getTextContent(channel, 'language'),
      categories,
      items,
    };
  }
  
  // =========================================================================
  // SEARCH
  // =========================================================================
  
  async search(params: SearchParams): Promise<SearchResult> {
    const { query } = params;
    const lowerQuery = query.toLowerCase();
    
    // Search in curated podcasts
    const matchingPodcasts = CURATED_PODCASTS.filter(p =>
      p.name.toLowerCase().includes(lowerQuery) ||
      p.description?.toLowerCase().includes(lowerQuery) ||
      p.category.toLowerCase().includes(lowerQuery)
    );
    
    // Also search within loaded feeds
    const results: MediaNode[] = [];
    
    for (const podcast of matchingPodcasts) {
      try {
        const feed = await this.parseFeed(podcast.feedUrl);
        results.push(this.feedToMediaSeries(feed, podcast.id) as unknown as MediaNode);
        
        // Add matching episodes
        for (const item of feed.items.slice(0, 5)) {
          if (item.title.toLowerCase().includes(lowerQuery) ||
              item.description?.toLowerCase().includes(lowerQuery)) {
            results.push(this.itemToMediaNode(item, feed, podcast.id));
          }
        }
      } catch (err) {
        console.warn(`Failed to search podcast ${podcast.id}:`, err);
      }
    }
    
    return {
      items: results,
      totalResults: results.length,
      page: 1,
      totalPages: 1,
      query,
    };
  }
  
  // =========================================================================
  // TRENDING (Popular podcasts)
  // =========================================================================
  
  async getTrending(params: TrendingParams): Promise<MediaNode[]> {
    const { limit = 10 } = params;
    
    // Return curated podcasts as "trending"
    return CURATED_PODCASTS.slice(0, limit).map(p => this.createMediaNode({
      canonical_id: generateCanonicalId('podcast_show', 'rss_podcast', p.id),
      media_type: 'podcast_show',
      category: 'audio',
      title: p.name,
      description: p.description,
      poster_url: p.imageUrl,
    }));
  }
  
  // =========================================================================
  // BY GENRE
  // =========================================================================
  
  async getByGenre(params: GenreParams): Promise<MediaNode[]> {
    const { genre } = params;
    
    const matches = CURATED_PODCASTS.filter(p => 
      p.category.toLowerCase() === genre.toLowerCase()
    );
    
    return matches.map(p => this.createMediaNode({
      canonical_id: generateCanonicalId('podcast_show', 'rss_podcast', p.id),
      media_type: 'podcast_show',
      category: 'audio',
      title: p.name,
      description: p.description,
      poster_url: p.imageUrl,
    }));
  }
  
  // =========================================================================
  // NEW RELEASES
  // =========================================================================
  
  async getNewReleases(params: NewReleasesParams): Promise<MediaNode[]> {
    const { limit = 20 } = params;
    const episodes: MediaNode[] = [];
    
    // Get latest episodes from each podcast
    for (const podcast of CURATED_PODCASTS) {
      try {
        const feed = await this.parseFeed(podcast.feedUrl);
        if (feed.items.length > 0) {
          episodes.push(this.itemToMediaNode(feed.items[0], feed, podcast.id));
        }
      } catch (err) {
        console.warn(`Failed to fetch ${podcast.id}:`, err);
      }
      
      if (episodes.length >= limit) break;
    }
    
    // Sort by date
    return episodes
      .filter(e => e.release_date)
      .sort((a, b) => new Date(b.release_date!).getTime() - new Date(a.release_date!).getTime())
      .slice(0, limit);
  }
  
  // =========================================================================
  // GET MEDIA NODE (Episode)
  // =========================================================================
  
  async getMediaNode(providerContentId: string): Promise<MediaNode | null> {
    // Format: {podcastId}/{episodeGuid}
    const [podcastId, ...guidParts] = providerContentId.split('/');
    const episodeGuid = guidParts.join('/');
    
    const podcast = CURATED_PODCASTS.find(p => p.id === podcastId);
    if (!podcast) return null;
    
    try {
      const feed = await this.parseFeed(podcast.feedUrl);
      const episode = feed.items.find(item => 
        (item.guid || item.title) === episodeGuid ||
        item.title === episodeGuid
      );
      
      if (!episode) return null;
      
      return this.itemToMediaNode(episode, feed, podcastId);
    } catch (err) {
      console.error(`Failed to get episode ${providerContentId}:`, err);
      return null;
    }
  }
  
  // =========================================================================
  // GET MEDIA SERIES (Podcast)
  // =========================================================================
  
  async getMediaSeries(providerContentId: string): Promise<MediaSeries | null> {
    const podcast = CURATED_PODCASTS.find(p => p.id === providerContentId);
    if (!podcast) return null;
    
    try {
      const feed = await this.parseFeed(podcast.feedUrl);
      return this.feedToMediaSeries(feed, podcastId);
    } catch (err) {
      console.error(`Failed to get podcast ${providerContentId}:`, err);
      return null;
    }
  }
  
  // =========================================================================
  // GET SERIES ITEMS (Episodes)
  // =========================================================================
  
  async getSeriesItems(seriesProviderContentId: string, params?: PaginationParams): Promise<MediaNode[]> {
    const podcast = CURATED_PODCASTS.find(p => p.id === seriesProviderContentId);
    if (!podcast) return [];
    
    try {
      const feed = await this.parseFeed(podcast.feedUrl);
      const pageSize = params?.pageSize || 50;
      const page = params?.page || 1;
      const start = (page - 1) * pageSize;
      
      return feed.items
        .slice(start, start + pageSize)
        .map(item => this.itemToMediaNode(item, feed, seriesProviderContentId));
    } catch (err) {
      console.error(`Failed to get episodes for ${seriesProviderContentId}:`, err);
      return [];
    }
  }
  
  // =========================================================================
  // GET AVAILABILITY
  // =========================================================================
  
  async getAvailability(providerContentId: string): Promise<MediaAvailability | null> {
    const node = await this.getMediaNode(providerContentId);
    if (!node || !node.preview_url) return null;
    
    return {
      id: '',
      media_node_id: '',
      provider_id: '',
      provider_content_id: providerContentId,
      availability_type: 'free',
      playback_url: node.preview_url,
      is_verified: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  }
  
  // =========================================================================
  // GET CREDITS
  // =========================================================================
  
  async getCredits(providerContentId: string): Promise<CreditWithPerson[]> {
    // Podcasts don't typically have structured credits
    return [];
  }
  
  // =========================================================================
  // GET RELATED
  // =========================================================================
  
  async getRelated(providerContentId: string, limit: number = 5): Promise<MediaNode[]> {
    const [podcastId] = providerContentId.split('/');
    const podcast = CURATED_PODCASTS.find(p => p.id === podcastId);
    if (!podcast) return [];
    
    // Return other podcasts in same category
    return CURATED_PODCASTS
      .filter(p => p.id !== podcastId && p.category === podcast.category)
      .slice(0, limit)
      .map(p => this.createMediaNode({
        canonical_id: generateCanonicalId('podcast_show', 'rss_podcast', p.id),
        media_type: 'podcast_show',
        category: 'audio',
        title: p.name,
        description: p.description,
        poster_url: p.imageUrl,
      }));
  }
  
  // =========================================================================
  // PLAYBACK
  // =========================================================================
  
  async getPlaybackUrl(providerContentId: string): Promise<PlaybackInfo | null> {
    const node = await this.getMediaNode(providerContentId);
    if (!node?.preview_url) return null;
    
    return {
      url: node.preview_url,
      type: 'direct',
    };
  }
  
  // =========================================================================
  // PUBLIC HELPERS
  // =========================================================================
  
  getCuratedPodcasts(): PodcastFeed[] {
    return CURATED_PODCASTS;
  }
  
  getPodcastsByCategory(category: string): PodcastFeed[] {
    return CURATED_PODCASTS.filter(p => p.category === category);
  }
  
  async addCustomFeed(feedUrl: string): Promise<MediaSeries | null> {
    try {
      const feed = await this.parseFeed(feedUrl);
      const id = this.generateFeedId(feedUrl);
      return this.feedToMediaSeries(feed, id);
    } catch (err) {
      console.error(`Failed to add custom feed ${feedUrl}:`, err);
      return null;
    }
  }
  
  private generateFeedId(feedUrl: string): string {
    // Generate stable ID from URL
    return 'custom-' + btoa(feedUrl).replace(/[^a-zA-Z0-9]/g, '').slice(0, 16);
  }
  
  // =========================================================================
  // CONVERSION HELPERS
  // =========================================================================
  
  private itemToMediaNode(item: RSSItem, feed: RSSFeed, podcastId: string): MediaNode {
    const episodeId = item.guid || item.title;
    const duration = item['itunes:duration'] ? this.parseDuration(item['itunes:duration']) : undefined;
    
    return this.createMediaNode({
      canonical_id: generateCanonicalId('podcast_episode', 'rss_podcast', `${podcastId}/${episodeId}`),
      media_type: 'podcast_episode',
      category: 'audio',
      title: item.title,
      description: item.description,
      release_date: item.pubDate,
      release_year: item.pubDate ? extractYear(item.pubDate) : undefined,
      duration_seconds: duration,
      episode_number: item['itunes:episode'] ? parseInt(item['itunes:episode'], 10) : undefined,
      season_number: item['itunes:season'] ? parseInt(item['itunes:season'], 10) : undefined,
      thumbnail_url: item['itunes:image']?.href || feed.image?.url,
      poster_url: item['itunes:image']?.href || feed.image?.url,
      preview_url: item.enclosure?.url, // This is the actual audio file URL
    });
  }
  
  private feedToMediaSeries(feed: RSSFeed, podcastId: string): MediaSeries {
    const firstEpisode = feed.items[0];
    const lastEpisode = feed.items[feed.items.length - 1];
    
    return this.createMediaSeries({
      canonical_id: generateCanonicalId('podcast_show', 'rss_podcast', podcastId),
      media_type: 'podcast_show',
      category: 'audio',
      title: feed.title,
      description: feed.description,
      start_year: lastEpisode?.pubDate ? extractYear(lastEpisode.pubDate) : undefined,
      total_episodes: feed.items.length,
      poster_url: feed.image?.url,
      rss_feed_url: CURATED_PODCASTS.find(p => p.id === podcastId)?.feedUrl,
    });
  }
  
  private parseDuration(duration: string): number | undefined {
    // Format can be: HH:MM:SS, MM:SS, or seconds
    if (/^\d+$/.test(duration)) {
      return parseInt(duration, 10);
    }
    
    const parts = duration.split(':').map(p => parseInt(p, 10));
    if (parts.length === 3) {
      return parts[0] * 3600 + parts[1] * 60 + parts[2];
    } else if (parts.length === 2) {
      return parts[0] * 60 + parts[1];
    }
    
    return undefined;
  }
}

// Fix the variable reference
const podcastId = '';

export const rssPodcastAdapter = new RSSPodcastAdapter();
