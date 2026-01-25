/**
 * ┌─────────────────────────────────────────────────────────────────────────────┐
 * │ THE LUCY LOUNGE — PODCAST RSS ADAPTER                                       │
 * │                                                                             │
 * │ Full podcast playback via RSS feeds                                        │
 * │ No subscription required - unlimited free content                          │
 * └─────────────────────────────────────────────────────────────────────────────┘
 */

import type {
  AudioTrack,
  AudioSourceType,
  AudioSourceAdapter,
  PlaybackState,
} from './types';

// =============================================================================
// PODCAST TYPES
// =============================================================================

interface PodcastFeed {
  title: string;
  description: string;
  author: string;
  image?: string;
  link?: string;
  language?: string;
  categories: string[];
  episodes: PodcastEpisode[];
}

interface PodcastEpisode {
  guid: string;
  title: string;
  description: string;
  pubDate: string;
  duration?: number;
  audioUrl: string;
  image?: string;
  season?: number;
  episode?: number;
}

// =============================================================================
// POPULAR PODCAST DIRECTORY
// =============================================================================

const FEATURED_PODCASTS: Array<{ feedUrl: string; category: string }> = [
  // Technology
  { feedUrl: 'https://feeds.simplecast.com/54nAGcIl', category: 'technology' }, // The Vergecast
  { feedUrl: 'https://feeds.megaphone.fm/replyall', category: 'technology' }, // Reply All
  
  // True Crime
  { feedUrl: 'https://feeds.simplecast.com/qm_9xx0g', category: 'true_crime' }, // Crime Junkie
  { feedUrl: 'https://rss.art19.com/my-favorite-murder', category: 'true_crime' }, // My Favorite Murder
  
  // Comedy
  { feedUrl: 'https://feeds.simplecast.com/dHoohVNH', category: 'comedy' }, // Conan O'Brien Needs A Friend
  { feedUrl: 'https://rss.art19.com/smartless', category: 'comedy' }, // SmartLess
  
  // News & Politics
  { feedUrl: 'https://feeds.simplecast.com/82FI35Px', category: 'news' }, // The Daily
  { feedUrl: 'https://feeds.npr.org/510289/podcast.xml', category: 'news' }, // Planet Money
  
  // Science
  { feedUrl: 'https://www.omnycontent.com/d/playlist/e73c998e-6e60-432f-8610-ae210140c5b1/A91018A4-EA4F-4130-BF55-AE270180C327/44710ECC-10BB-48D1-93C7-AE270180C33E/podcast.rss', category: 'science' }, // Radiolab
  { feedUrl: 'https://lexfridman.com/feed/podcast/', category: 'science' }, // Lex Fridman
  
  // Business
  { feedUrl: 'https://feeds.megaphone.fm/WWO3519750118', category: 'business' }, // How I Built This
  { feedUrl: 'https://rss.art19.com/the-tim-ferriss-show', category: 'business' }, // Tim Ferriss
  
  // Culture & Society
  { feedUrl: 'https://feeds.simplecast.com/l2i9YnTd', category: 'culture' }, // This American Life
  { feedUrl: 'https://feeds.npr.org/510312/podcast.xml', category: 'culture' }, // Invisibilia
  
  // Music
  { feedUrl: 'https://feeds.simplecast.com/Xl5gYgPO', category: 'music' }, // Song Exploder
  { feedUrl: 'https://rss.art19.com/the-dave-chang-show', category: 'music' }, // Dissect
  
  // Health & Wellness
  { feedUrl: 'https://rss.art19.com/huberman-lab', category: 'health' }, // Huberman Lab
  { feedUrl: 'https://feeds.megaphone.fm/ADL9840290619', category: 'health' }, // The Doctor's Farmacy
];

// =============================================================================
// RSS PARSER
// =============================================================================

async function parseRSSFeed(feedUrl: string): Promise<PodcastFeed | null> {
  try {
    // Use a CORS proxy for browser compatibility
    const proxyUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feedUrl)}`;
    
    const response = await fetch(proxyUrl);
    if (!response.ok) return null;
    
    const data = await response.json();
    
    if (data.status !== 'ok') return null;
    
    const feed: PodcastFeed = {
      title: data.feed?.title || 'Unknown Podcast',
      description: data.feed?.description || '',
      author: data.feed?.author || '',
      image: data.feed?.image,
      link: data.feed?.link,
      categories: [],
      episodes: (data.items || []).map((item: any) => ({
        guid: item.guid || item.link || crypto.randomUUID(),
        title: item.title || 'Untitled Episode',
        description: item.description || '',
        pubDate: item.pubDate || new Date().toISOString(),
        duration: parseDuration(item.enclosure?.duration),
        audioUrl: item.enclosure?.link || '',
        image: item.thumbnail || data.feed?.image,
      })),
    };
    
    return feed;
    
  } catch (error) {
    console.error('[PodcastAdapter] Failed to parse RSS feed:', error);
    return null;
  }
}

function parseDuration(duration: string | number | undefined): number | undefined {
  if (typeof duration === 'number') return duration;
  if (!duration) return undefined;
  
  // Handle HH:MM:SS format
  const parts = duration.split(':').map(Number);
  if (parts.length === 3) {
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  }
  if (parts.length === 2) {
    return parts[0] * 60 + parts[1];
  }
  
  return parseInt(duration) || undefined;
}

// =============================================================================
// PODCAST ADAPTER IMPLEMENTATION
// =============================================================================

export class PodcastRSSAdapter implements AudioSourceAdapter {
  readonly source: AudioSourceType = 'podcast_rss';
  readonly displayName = 'Podcasts';
  readonly supportsOffline = true;
  readonly requiresAuth = false;
  readonly canSeek = true;
  readonly canControlPlayback = true;
  
  private feedCache: Map<string, PodcastFeed> = new Map();
  private currentTrack: AudioTrack | null = null;
  private audioElement: HTMLAudioElement | null = null;
  private state: PlaybackState = 'idle';
  
  async initialize(): Promise<boolean> {
    // Pre-load featured podcast metadata
    console.log('[PodcastAdapter] Initializing with featured podcasts');
    return true;
  }
  
  dispose(): void {
    if (this.audioElement) {
      this.audioElement.pause();
      this.audioElement.src = '';
    }
    this.feedCache.clear();
  }
  
  // ===========================================================================
  // PLAYBACK CONTROL
  // ===========================================================================
  
  async play(track: AudioTrack, position?: number): Promise<boolean> {
    if (!track.playbackUrl) return false;
    
    if (!this.audioElement) {
      this.audioElement = new Audio();
      this.audioElement.preload = 'auto';
    }
    
    this.audioElement.src = track.playbackUrl;
    if (position) {
      this.audioElement.currentTime = position;
    }
    
    try {
      await this.audioElement.play();
      this.currentTrack = track;
      this.state = 'playing';
      return true;
    } catch (error) {
      console.error('[PodcastAdapter] Playback failed:', error);
      this.state = 'error';
      return false;
    }
  }
  
  async pause(): Promise<void> {
    if (this.audioElement) {
      this.audioElement.pause();
      this.state = 'paused';
    }
  }
  
  async resume(): Promise<void> {
    if (this.audioElement) {
      await this.audioElement.play();
      this.state = 'playing';
    }
  }
  
  async seek(position: number): Promise<void> {
    if (this.audioElement) {
      this.audioElement.currentTime = position;
    }
  }
  
  async stop(): Promise<void> {
    if (this.audioElement) {
      this.audioElement.pause();
      this.audioElement.currentTime = 0;
      this.state = 'idle';
    }
  }
  
  async getPosition(): Promise<number> {
    return this.audioElement?.currentTime ?? 0;
  }
  
  async getDuration(): Promise<number> {
    return this.audioElement?.duration ?? 0;
  }
  
  getState(): PlaybackState {
    return this.state;
  }
  
  // ===========================================================================
  // TRACK RESOLUTION
  // ===========================================================================
  
  async resolveTrack(sourceId: string): Promise<AudioTrack | null> {
    // sourceId format: "feedUrl|episodeGuid"
    const [feedUrl, episodeGuid] = sourceId.split('|');
    if (!feedUrl || !episodeGuid) return null;
    
    const feed = await this.getFeed(feedUrl);
    if (!feed) return null;
    
    const episode = feed.episodes.find(e => e.guid === episodeGuid);
    if (!episode) return null;
    
    return this.episodeToTrack(episode, feed, feedUrl);
  }
  
  async searchTracks(query: string, limit: number = 20): Promise<AudioTrack[]> {
    const results: AudioTrack[] = [];
    const queryLower = query.toLowerCase();
    
    // Search through cached feeds
    for (const [feedUrl, feed] of this.feedCache) {
      if (results.length >= limit) break;
      
      // Match show name
      if (feed.title.toLowerCase().includes(queryLower)) {
        results.push(...feed.episodes.slice(0, 5).map(ep => 
          this.episodeToTrack(ep, feed, feedUrl)
        ));
        continue;
      }
      
      // Match episode titles
      const matchingEpisodes = feed.episodes
        .filter(ep => ep.title.toLowerCase().includes(queryLower))
        .slice(0, 3);
      
      results.push(...matchingEpisodes.map(ep => 
        this.episodeToTrack(ep, feed, feedUrl)
      ));
    }
    
    return results.slice(0, limit);
  }
  
  // ===========================================================================
  // FEED MANAGEMENT
  // ===========================================================================
  
  async getFeed(feedUrl: string): Promise<PodcastFeed | null> {
    // Check cache
    if (this.feedCache.has(feedUrl)) {
      return this.feedCache.get(feedUrl)!;
    }
    
    // Parse feed
    const feed = await parseRSSFeed(feedUrl);
    if (feed) {
      this.feedCache.set(feedUrl, feed);
    }
    
    return feed;
  }
  
  async getLatestEpisodes(feedUrl: string, limit: number = 10): Promise<AudioTrack[]> {
    const feed = await this.getFeed(feedUrl);
    if (!feed) return [];
    
    return feed.episodes
      .slice(0, limit)
      .map(ep => this.episodeToTrack(ep, feed, feedUrl));
  }
  
  async getFeaturedPodcasts(category?: string): Promise<Array<{
    feedUrl: string;
    title: string;
    description: string;
    image?: string;
    category: string;
    latestEpisode?: AudioTrack;
  }>> {
    const filtered = category 
      ? FEATURED_PODCASTS.filter(p => p.category === category)
      : FEATURED_PODCASTS;
    
    const results = await Promise.all(
      filtered.slice(0, 10).map(async ({ feedUrl, category }) => {
        const feed = await this.getFeed(feedUrl);
        if (!feed) return null;
        
        return {
          feedUrl,
          title: feed.title,
          description: feed.description,
          image: feed.image,
          category,
          latestEpisode: feed.episodes[0] 
            ? this.episodeToTrack(feed.episodes[0], feed, feedUrl)
            : undefined,
        };
      })
    );
    
    return results.filter((r): r is NonNullable<typeof r> => r !== null);
  }
  
  async getPodcastCategories(): Promise<string[]> {
    return [...new Set(FEATURED_PODCASTS.map(p => p.category))];
  }
  
  // ===========================================================================
  // CONVERSION HELPERS
  // ===========================================================================
  
  private episodeToTrack(
    episode: PodcastEpisode,
    feed: PodcastFeed,
    feedUrl: string
  ): AudioTrack {
    return {
      id: `podcast_${episode.guid}`,
      source: 'podcast_rss',
      sourceId: `${feedUrl}|${episode.guid}`,
      title: episode.title,
      artist: feed.title,
      album: feed.title,
      duration: episode.duration,
      artwork: episode.image || feed.image,
      playbackUrl: episode.audioUrl,
      podcastInfo: {
        feedUrl,
        episodeGuid: episode.guid,
        publishDate: episode.pubDate,
        showName: feed.title,
      },
    };
  }
}

// =============================================================================
// SINGLETON INSTANCE
// =============================================================================

export const podcastAdapter = new PodcastRSSAdapter();
