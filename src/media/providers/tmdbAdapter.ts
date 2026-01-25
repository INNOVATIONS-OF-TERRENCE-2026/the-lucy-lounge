// =============================================================================
// THE LUCY LOUNGE - TMDB Provider Adapter
// =============================================================================
// Movie and TV metadata from The Movie Database
// https://developers.themoviedb.org/3
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
  generateCanonicalId,
  extractYear,
  normalizeDuration,
  normalizeContentRating,
} from './ProviderAdapter';
import type { MediaNode, MediaSeries, MediaAvailability, ProviderType } from '../types';

// =============================================================================
// TMDB API TYPES
// =============================================================================

interface TMDBMovie {
  id: number;
  title: string;
  original_title?: string;
  overview?: string;
  tagline?: string;
  release_date?: string;
  runtime?: number;
  vote_average?: number;
  vote_count?: number;
  popularity?: number;
  poster_path?: string;
  backdrop_path?: string;
  genres?: Array<{ id: number; name: string }>;
  imdb_id?: string;
}

interface TMDBTVShow {
  id: number;
  name: string;
  original_name?: string;
  overview?: string;
  tagline?: string;
  first_air_date?: string;
  last_air_date?: string;
  episode_run_time?: number[];
  vote_average?: number;
  vote_count?: number;
  popularity?: number;
  poster_path?: string;
  backdrop_path?: string;
  genres?: Array<{ id: number; name: string }>;
  number_of_seasons?: number;
  number_of_episodes?: number;
  status?: string;
}

interface TMDBSeason {
  id: number;
  name: string;
  overview?: string;
  season_number: number;
  episode_count?: number;
  air_date?: string;
  poster_path?: string;
}

interface TMDBEpisode {
  id: number;
  name: string;
  overview?: string;
  season_number: number;
  episode_number: number;
  air_date?: string;
  runtime?: number;
  vote_average?: number;
  vote_count?: number;
  still_path?: string;
}

interface TMDBPerson {
  id: number;
  name: string;
  also_known_as?: string[];
  biography?: string;
  birthday?: string;
  deathday?: string;
  place_of_birth?: string;
  profile_path?: string;
  popularity?: number;
  imdb_id?: string;
}

interface TMDBCast {
  id: number;
  name: string;
  character?: string;
  order?: number;
  profile_path?: string;
}

interface TMDBCrew {
  id: number;
  name: string;
  job?: string;
  department?: string;
  profile_path?: string;
}

interface TMDBSearchResult<T> {
  page: number;
  results: T[];
  total_pages: number;
  total_results: number;
}

// =============================================================================
// TMDB ADAPTER
// =============================================================================

const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p';
const TMDB_API_BASE = 'https://api.themoviedb.org/3';

export class TMDBAdapter extends BaseProviderAdapter {
  readonly providerId = 'tmdb';
  readonly providerType: ProviderType = 'tmdb';
  readonly displayName = 'TMDB';
  readonly logoUrl = 'https://www.themoviedb.org/assets/2/v4/logos/v2/blue_square_1-5bdc75aaebeb75dc7ae79426ddd9be3b2be1e342510f8202baf6bffa71d7f5c4.svg';
  readonly requiresAuth = false;
  readonly supportsPlayback = false; // TMDB is metadata only
  readonly priority = 100;
  
  private apiKey: string;
  private accessToken?: string;
  
  constructor(apiKey?: string, accessToken?: string) {
    super();
    this.apiKey = apiKey || import.meta.env.VITE_TMDB_API_KEY || '';
    this.accessToken = accessToken || import.meta.env.VITE_TMDB_ACCESS_TOKEN;
  }
  
  async initialize(): Promise<ProviderInitResult> {
    if (!this.apiKey && !this.accessToken) {
      this._lastError = 'TMDB API key or access token required';
      return { success: false, error: this._lastError };
    }
    
    try {
      // Validate credentials with a simple request
      const response = await this.tmdbFetch('/configuration');
      if (!response.ok) {
        throw new Error(`TMDB API error: ${response.status}`);
      }
      
      this._isReady = true;
      return { success: true };
    } catch (error) {
      this._lastError = error instanceof Error ? error.message : 'Unknown error';
      return { success: false, error: this._lastError };
    }
  }
  
  private async tmdbFetch(endpoint: string, params: Record<string, string> = {}): Promise<Response> {
    const url = new URL(`${TMDB_API_BASE}${endpoint}`);
    
    if (!this.accessToken) {
      url.searchParams.set('api_key', this.apiKey);
    }
    
    for (const [key, value] of Object.entries(params)) {
      url.searchParams.set(key, value);
    }
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    if (this.accessToken) {
      headers['Authorization'] = `Bearer ${this.accessToken}`;
    }
    
    return fetch(url.toString(), { headers });
  }
  
  private imageUrl(path: string | null | undefined, size: string = 'w500'): string | undefined {
    if (!path) return undefined;
    return `${TMDB_IMAGE_BASE}/${size}${path}`;
  }
  
  // =========================================================================
  // SEARCH
  // =========================================================================
  
  async search(params: SearchParams): Promise<SearchResult> {
    const { query, mediaType, page = 1 } = params;
    
    let endpoint = '/search/multi';
    if (mediaType === 'movie') endpoint = '/search/movie';
    else if (mediaType?.startsWith('tv_')) endpoint = '/search/tv';
    
    const response = await this.tmdbFetch(endpoint, {
      query,
      page: String(page),
      include_adult: 'false',
    });
    
    if (!response.ok) {
      throw new Error(`TMDB search failed: ${response.status}`);
    }
    
    const data: TMDBSearchResult<TMDBMovie | TMDBTVShow> = await response.json();
    
    const items: MediaNode[] = data.results.map(item => {
      if ('title' in item) {
        return this.movieToMediaNode(item);
      } else {
        return this.tvShowToMediaNode(item);
      }
    });
    
    return {
      items,
      totalResults: data.total_results,
      page: data.page,
      totalPages: data.total_pages,
      query,
    };
  }
  
  // =========================================================================
  // TRENDING
  // =========================================================================
  
  async getTrending(params: TrendingParams): Promise<MediaNode[]> {
    const { mediaType, timeWindow = 'week', page = 1 } = params;
    
    let mediaTypeParam = 'all';
    if (mediaType === 'movie') mediaTypeParam = 'movie';
    else if (mediaType?.startsWith('tv_')) mediaTypeParam = 'tv';
    
    const response = await this.tmdbFetch(`/trending/${mediaTypeParam}/${timeWindow}`, {
      page: String(page),
    });
    
    if (!response.ok) {
      throw new Error(`TMDB trending failed: ${response.status}`);
    }
    
    const data: TMDBSearchResult<TMDBMovie | TMDBTVShow> = await response.json();
    
    return data.results.map(item => {
      if ('title' in item) {
        return this.movieToMediaNode(item);
      } else {
        return this.tvShowToMediaNode(item);
      }
    });
  }
  
  // =========================================================================
  // BY GENRE
  // =========================================================================
  
  async getByGenre(params: GenreParams): Promise<MediaNode[]> {
    const { genre, mediaType, page = 1 } = params;
    
    // Genre can be numeric ID or slug - need to map
    const isMovie = mediaType === 'movie';
    const endpoint = isMovie ? '/discover/movie' : '/discover/tv';
    
    const response = await this.tmdbFetch(endpoint, {
      with_genres: genre,
      page: String(page),
      sort_by: 'popularity.desc',
    });
    
    if (!response.ok) {
      throw new Error(`TMDB genre search failed: ${response.status}`);
    }
    
    const data: TMDBSearchResult<TMDBMovie | TMDBTVShow> = await response.json();
    
    return data.results.map(item => {
      if ('title' in item) {
        return this.movieToMediaNode(item);
      } else {
        return this.tvShowToMediaNode(item);
      }
    });
  }
  
  // =========================================================================
  // NEW RELEASES
  // =========================================================================
  
  async getNewReleases(params: NewReleasesParams): Promise<MediaNode[]> {
    const { mediaType, region = 'US', daysBack = 30, limit = 20 } = params;
    
    const today = new Date();
    const startDate = new Date(today.getTime() - daysBack * 24 * 60 * 60 * 1000);
    
    const isMovie = mediaType === 'movie';
    const endpoint = isMovie ? '/discover/movie' : '/discover/tv';
    
    const dateParams = isMovie
      ? { 'primary_release_date.gte': startDate.toISOString().split('T')[0], 'primary_release_date.lte': today.toISOString().split('T')[0] }
      : { 'first_air_date.gte': startDate.toISOString().split('T')[0], 'first_air_date.lte': today.toISOString().split('T')[0] };
    
    const response = await this.tmdbFetch(endpoint, {
      ...dateParams,
      sort_by: 'popularity.desc',
      region,
    });
    
    if (!response.ok) {
      throw new Error(`TMDB new releases failed: ${response.status}`);
    }
    
    const data: TMDBSearchResult<TMDBMovie | TMDBTVShow> = await response.json();
    
    return data.results.slice(0, limit).map(item => {
      if ('title' in item) {
        return this.movieToMediaNode(item);
      } else {
        return this.tvShowToMediaNode(item);
      }
    });
  }
  
  // =========================================================================
  // GET MEDIA NODE
  // =========================================================================
  
  async getMediaNode(providerContentId: string): Promise<MediaNode | null> {
    // Format: movie/{id} or tv/{id}/season/{season}/episode/{episode}
    const parts = providerContentId.split('/');
    
    if (parts[0] === 'movie') {
      return this.getMovie(parts[1]);
    } else if (parts[0] === 'tv' && parts[2] === 'season' && parts[4] === 'episode') {
      return this.getEpisode(parts[1], parts[3], parts[5]);
    }
    
    return null;
  }
  
  private async getMovie(id: string): Promise<MediaNode | null> {
    const response = await this.tmdbFetch(`/movie/${id}`, {
      append_to_response: 'release_dates,credits',
    });
    
    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error(`TMDB movie fetch failed: ${response.status}`);
    }
    
    const movie: TMDBMovie = await response.json();
    return this.movieToMediaNode(movie);
  }
  
  private async getEpisode(showId: string, seasonNum: string, episodeNum: string): Promise<MediaNode | null> {
    const response = await this.tmdbFetch(`/tv/${showId}/season/${seasonNum}/episode/${episodeNum}`);
    
    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error(`TMDB episode fetch failed: ${response.status}`);
    }
    
    const episode: TMDBEpisode = await response.json();
    return this.episodeToMediaNode(episode, showId);
  }
  
  // =========================================================================
  // GET MEDIA SERIES
  // =========================================================================
  
  async getMediaSeries(providerContentId: string): Promise<MediaSeries | null> {
    // Format: tv/{id}
    const response = await this.tmdbFetch(`/tv/${providerContentId}`);
    
    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error(`TMDB TV show fetch failed: ${response.status}`);
    }
    
    const show: TMDBTVShow = await response.json();
    return this.tvShowToMediaSeries(show);
  }
  
  // =========================================================================
  // GET SERIES ITEMS (Episodes)
  // =========================================================================
  
  async getSeriesItems(seriesProviderContentId: string, params?: PaginationParams): Promise<MediaNode[]> {
    // First get show details to know number of seasons
    const show = await this.getMediaSeries(seriesProviderContentId);
    if (!show) return [];
    
    // Get all episodes (or paginate by season)
    const episodes: MediaNode[] = [];
    const totalSeasons = show.total_seasons || 1;
    
    for (let season = 1; season <= totalSeasons; season++) {
      const response = await this.tmdbFetch(`/tv/${seriesProviderContentId}/season/${season}`);
      
      if (!response.ok) continue;
      
      const data: { episodes: TMDBEpisode[] } = await response.json();
      
      for (const episode of data.episodes) {
        episodes.push(this.episodeToMediaNode(episode, seriesProviderContentId));
      }
    }
    
    return episodes;
  }
  
  // =========================================================================
  // GET AVAILABILITY (TMDB Watch Providers)
  // =========================================================================
  
  async getAvailability(providerContentId: string): Promise<MediaAvailability | null> {
    // TMDB provides watch provider info but we don't map it directly
    // This adapter is metadata-only; availability comes from other providers
    return null;
  }
  
  // =========================================================================
  // GET CREDITS
  // =========================================================================
  
  async getCredits(providerContentId: string): Promise<CreditWithPerson[]> {
    const [type, id] = providerContentId.split('/');
    const endpoint = type === 'movie' ? `/movie/${id}/credits` : `/tv/${id}/credits`;
    
    const response = await this.tmdbFetch(endpoint);
    
    if (!response.ok) {
      throw new Error(`TMDB credits fetch failed: ${response.status}`);
    }
    
    const data: { cast: TMDBCast[]; crew: TMDBCrew[] } = await response.json();
    const credits: CreditWithPerson[] = [];
    
    // Cast
    for (const cast of data.cast.slice(0, 20)) {
      credits.push({
        credit: {
          person_id: '', // Will be resolved
          role: 'actor',
          character_name: cast.character,
          order: cast.order,
          is_primary: (cast.order || 0) < 5,
        },
        person: {
          canonical_id: generateCanonicalId('movie', 'tmdb', `person/${cast.id}`),
          name: cast.name,
          profile_image_url: this.imageUrl(cast.profile_path, 'w185'),
          tmdb_id: cast.id,
        },
      });
    }
    
    // Crew (directors, writers, composers)
    const importantJobs = ['Director', 'Writer', 'Screenplay', 'Original Music Composer', 'Producer'];
    for (const crew of data.crew.filter(c => importantJobs.includes(c.job || ''))) {
      const roleMap: Record<string, string> = {
        'Director': 'director',
        'Writer': 'writer',
        'Screenplay': 'writer',
        'Original Music Composer': 'composer',
        'Producer': 'producer',
      };
      
      credits.push({
        credit: {
          person_id: '',
          role: (roleMap[crew.job || ''] || 'creator') as any,
          department: crew.department,
          job: crew.job,
          is_primary: crew.job === 'Director',
        },
        person: {
          canonical_id: generateCanonicalId('movie', 'tmdb', `person/${crew.id}`),
          name: crew.name,
          profile_image_url: this.imageUrl(crew.profile_path, 'w185'),
          tmdb_id: crew.id,
        },
      });
    }
    
    return credits;
  }
  
  // =========================================================================
  // GET RELATED
  // =========================================================================
  
  async getRelated(providerContentId: string, limit: number = 10): Promise<MediaNode[]> {
    const [type, id] = providerContentId.split('/');
    const endpoint = type === 'movie' ? `/movie/${id}/recommendations` : `/tv/${id}/recommendations`;
    
    const response = await this.tmdbFetch(endpoint);
    
    if (!response.ok) {
      throw new Error(`TMDB related fetch failed: ${response.status}`);
    }
    
    const data: TMDBSearchResult<TMDBMovie | TMDBTVShow> = await response.json();
    
    return data.results.slice(0, limit).map(item => {
      if ('title' in item) {
        return this.movieToMediaNode(item);
      } else {
        return this.tvShowToMediaNode(item);
      }
    });
  }
  
  // =========================================================================
  // CONVERSION HELPERS
  // =========================================================================
  
  private movieToMediaNode(movie: TMDBMovie): MediaNode {
    return this.createMediaNode({
      canonical_id: generateCanonicalId('movie', 'tmdb', String(movie.id)),
      media_type: 'movie',
      category: 'video',
      title: movie.title,
      original_title: movie.original_title,
      description: movie.overview,
      tagline: movie.tagline,
      release_date: movie.release_date,
      release_year: extractYear(movie.release_date),
      duration_seconds: movie.runtime ? movie.runtime * 60 : undefined,
      average_rating: movie.vote_average,
      vote_count: movie.vote_count,
      popularity_score: movie.popularity,
      poster_url: this.imageUrl(movie.poster_path),
      backdrop_url: this.imageUrl(movie.backdrop_path, 'w1280'),
      thumbnail_url: this.imageUrl(movie.poster_path, 'w342'),
      imdb_id: movie.imdb_id,
      tmdb_id: movie.id,
    });
  }
  
  private tvShowToMediaNode(show: TMDBTVShow): MediaNode {
    const avgRuntime = show.episode_run_time?.length 
      ? show.episode_run_time.reduce((a, b) => a + b, 0) / show.episode_run_time.length
      : undefined;
    
    return this.createMediaNode({
      canonical_id: generateCanonicalId('tv_show', 'tmdb', String(show.id)),
      media_type: 'tv_show',
      category: 'video',
      title: show.name,
      original_title: show.original_name,
      description: show.overview,
      tagline: show.tagline,
      release_date: show.first_air_date,
      release_year: extractYear(show.first_air_date),
      duration_seconds: avgRuntime ? avgRuntime * 60 : undefined,
      average_rating: show.vote_average,
      vote_count: show.vote_count,
      popularity_score: show.popularity,
      poster_url: this.imageUrl(show.poster_path),
      backdrop_url: this.imageUrl(show.backdrop_path, 'w1280'),
      thumbnail_url: this.imageUrl(show.poster_path, 'w342'),
      tmdb_id: show.id,
    });
  }
  
  private tvShowToMediaSeries(show: TMDBTVShow): MediaSeries {
    const statusMap: Record<string, string> = {
      'Returning Series': 'returning',
      'Ended': 'ended',
      'Canceled': 'canceled',
      'In Production': 'in_production',
    };
    
    return this.createMediaSeries({
      canonical_id: generateCanonicalId('tv_show', 'tmdb', String(show.id)),
      media_type: 'tv_show',
      category: 'video',
      title: show.name,
      original_title: show.original_name,
      description: show.overview,
      start_year: extractYear(show.first_air_date),
      end_year: show.status === 'Ended' ? extractYear(show.last_air_date) : undefined,
      total_episodes: show.number_of_episodes,
      total_seasons: show.number_of_seasons,
      average_rating: show.vote_average,
      vote_count: show.vote_count,
      poster_url: this.imageUrl(show.poster_path),
      backdrop_url: this.imageUrl(show.backdrop_path, 'w1280'),
      tmdb_id: show.id,
      status: statusMap[show.status || ''] as any,
    });
  }
  
  private episodeToMediaNode(episode: TMDBEpisode, showId: string): MediaNode {
    return this.createMediaNode({
      canonical_id: generateCanonicalId('tv_episode', 'tmdb', `${showId}/s${episode.season_number}e${episode.episode_number}`),
      media_type: 'tv_episode',
      category: 'video',
      title: episode.name,
      description: episode.overview,
      release_date: episode.air_date,
      release_year: extractYear(episode.air_date),
      duration_seconds: episode.runtime ? episode.runtime * 60 : undefined,
      season_number: episode.season_number,
      episode_number: episode.episode_number,
      average_rating: episode.vote_average,
      vote_count: episode.vote_count,
      thumbnail_url: this.imageUrl(episode.still_path, 'w300'),
      tmdb_id: episode.id,
    });
  }
}

export const tmdbAdapter = new TMDBAdapter();
