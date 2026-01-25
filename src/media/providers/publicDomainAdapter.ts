// =============================================================================
// THE LUCY LOUNGE - Public Domain Provider Adapter
// =============================================================================
// Movies, audiobooks, and content from public domain sources:
// - Internet Archive (archive.org)
// - LibriVox (audiobooks)
// - Public Domain Movies
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
} from './ProviderAdapter';
import type { MediaNode, MediaSeries, MediaAvailability, ProviderType } from '../types';

// =============================================================================
// INTERNET ARCHIVE API TYPES
// =============================================================================

interface ArchiveItem {
  identifier: string;
  title: string;
  description?: string;
  creator?: string | string[];
  date?: string;
  year?: number;
  subject?: string | string[];
  mediatype: string;
  downloads?: number;
  avg_rating?: number;
  num_reviews?: number;
  runtime?: string;
  collection?: string[];
}

interface ArchiveSearchResponse {
  response: {
    numFound: number;
    start: number;
    docs: ArchiveItem[];
  };
}

interface ArchiveMetadata {
  metadata: ArchiveItem;
  files: ArchiveFile[];
}

interface ArchiveFile {
  name: string;
  format: string;
  size?: string;
  length?: string;
  title?: string;
  track?: string;
}

// =============================================================================
// LIBRIVOX API TYPES
// =============================================================================

interface LibriVoxBook {
  id: string;
  title: string;
  description?: string;
  url_text_source?: string;
  language: string;
  copyright_year?: string;
  num_sections?: number;
  url_rss?: string;
  url_zip_file?: string;
  url_project?: string;
  url_librivox?: string;
  url_iarchive?: string;
  totaltime?: string;
  totaltimesecs?: number;
  authors?: LibriVoxAuthor[];
  sections?: LibriVoxSection[];
}

interface LibriVoxAuthor {
  id: string;
  first_name: string;
  last_name: string;
  dob?: string;
  dod?: string;
}

interface LibriVoxSection {
  id: string;
  section_number: string;
  title: string;
  listen_url: string;
  language: string;
  playtime: string;
}

interface LibriVoxResponse {
  books: LibriVoxBook[];
}

// =============================================================================
// PUBLIC DOMAIN ADAPTER
// =============================================================================

const ARCHIVE_API_BASE = 'https://archive.org';
const LIBRIVOX_API_BASE = 'https://librivox.org/api/feed';

export class PublicDomainAdapter extends BaseProviderAdapter {
  readonly providerId = 'public_domain';
  readonly providerType: ProviderType = 'archive_org';
  readonly displayName = 'Public Domain';
  readonly logoUrl = 'https://archive.org/images/logo_archive.svg';
  readonly requiresAuth = false;
  readonly supportsPlayback = true;
  readonly priority = 65;
  
  async initialize(): Promise<ProviderInitResult> {
    this._isReady = true;
    return { success: true };
  }
  
  // =========================================================================
  // SEARCH
  // =========================================================================
  
  async search(params: SearchParams): Promise<SearchResult> {
    const { query, mediaType, category, page = 1, pageSize = 20 } = params;
    
    // Determine source based on media type
    if (mediaType === 'audiobook' || mediaType === 'audiobook_chapter') {
      return this.searchLibriVox(query, page, pageSize);
    }
    
    // Search Internet Archive
    return this.searchArchive(query, category, page, pageSize);
  }
  
  private async searchArchive(
    query: string,
    category?: string,
    page: number = 1,
    pageSize: number = 20
  ): Promise<SearchResult> {
    // Build collection filter
    let collections = 'collection:(feature_films OR classic_tv OR audio_bookspoetry)';
    if (category === 'video') {
      collections = 'collection:(feature_films OR classic_tv)';
    } else if (category === 'audio') {
      collections = 'collection:audio_bookspoetry';
    }
    
    const searchQuery = `${query} AND ${collections} AND mediatype:(movies OR audio)`;
    const start = (page - 1) * pageSize;
    
    const response = await fetch(
      `${ARCHIVE_API_BASE}/advancedsearch.php?` + new URLSearchParams({
        q: searchQuery,
        fl: 'identifier,title,description,creator,date,year,subject,mediatype,downloads,avg_rating,num_reviews,runtime',
        rows: String(pageSize),
        start: String(start),
        output: 'json',
      })
    );
    
    if (!response.ok) {
      throw new Error(`Archive.org search failed: ${response.status}`);
    }
    
    const data: ArchiveSearchResponse = await response.json();
    
    const items = data.response.docs.map(item => this.archiveItemToMediaNode(item));
    
    return {
      items,
      totalResults: data.response.numFound,
      page,
      totalPages: Math.ceil(data.response.numFound / pageSize),
      query,
    };
  }
  
  private async searchLibriVox(
    query: string,
    page: number = 1,
    pageSize: number = 20
  ): Promise<SearchResult> {
    const offset = (page - 1) * pageSize;
    
    const response = await fetch(
      `${LIBRIVOX_API_BASE}/audiobooks?` + new URLSearchParams({
        title: `^${query}`,
        format: 'json',
        limit: String(pageSize),
        offset: String(offset),
      })
    );
    
    if (!response.ok) {
      throw new Error(`LibriVox search failed: ${response.status}`);
    }
    
    const data: LibriVoxResponse = await response.json();
    
    if (!data.books) {
      return {
        items: [],
        totalResults: 0,
        page,
        totalPages: 0,
        query,
      };
    }
    
    const items = data.books.map(book => this.libriVoxBookToMediaNode(book));
    
    return {
      items,
      totalResults: items.length, // LibriVox doesn't provide total count
      page,
      totalPages: Math.ceil(items.length / pageSize),
      query,
    };
  }
  
  // =========================================================================
  // TRENDING (Popular on Archive.org)
  // =========================================================================
  
  async getTrending(params: TrendingParams): Promise<MediaNode[]> {
    const { category, limit = 20 } = params;
    
    let collection = 'feature_films';
    if (category === 'audio') {
      collection = 'audio_bookspoetry';
    }
    
    const response = await fetch(
      `${ARCHIVE_API_BASE}/advancedsearch.php?` + new URLSearchParams({
        q: `collection:${collection}`,
        fl: 'identifier,title,description,creator,date,year,subject,mediatype,downloads,avg_rating,num_reviews,runtime',
        rows: String(limit),
        sort: 'downloads desc',
        output: 'json',
      })
    );
    
    if (!response.ok) {
      return [];
    }
    
    const data: ArchiveSearchResponse = await response.json();
    return data.response.docs.map(item => this.archiveItemToMediaNode(item));
  }
  
  // =========================================================================
  // BY GENRE
  // =========================================================================
  
  async getByGenre(params: GenreParams): Promise<MediaNode[]> {
    const { genre, category, pageSize = 20 } = params;
    
    // Map genres to archive.org subjects
    const genreMap: Record<string, string> = {
      'comedy': 'comedy',
      'drama': 'drama',
      'horror': 'horror',
      'sci-fi': 'science fiction',
      'western': 'western',
      'noir': 'film noir',
      'documentary': 'documentary',
      'classic': 'classic',
    };
    
    const subject = genreMap[genre.toLowerCase()] || genre;
    
    const response = await fetch(
      `${ARCHIVE_API_BASE}/advancedsearch.php?` + new URLSearchParams({
        q: `collection:feature_films AND subject:(${subject})`,
        fl: 'identifier,title,description,creator,date,year,subject,mediatype,downloads,avg_rating,num_reviews,runtime',
        rows: String(pageSize),
        sort: 'downloads desc',
        output: 'json',
      })
    );
    
    if (!response.ok) {
      return [];
    }
    
    const data: ArchiveSearchResponse = await response.json();
    return data.response.docs.map(item => this.archiveItemToMediaNode(item));
  }
  
  // =========================================================================
  // NEW RELEASES (Recently added to Archive)
  // =========================================================================
  
  async getNewReleases(params: NewReleasesParams): Promise<MediaNode[]> {
    const { category, limit = 20 } = params;
    
    let collection = 'feature_films';
    if (category === 'audio') {
      collection = 'audio_bookspoetry';
    }
    
    const response = await fetch(
      `${ARCHIVE_API_BASE}/advancedsearch.php?` + new URLSearchParams({
        q: `collection:${collection}`,
        fl: 'identifier,title,description,creator,date,year,subject,mediatype,downloads,avg_rating,num_reviews,runtime',
        rows: String(limit),
        sort: 'addeddate desc',
        output: 'json',
      })
    );
    
    if (!response.ok) {
      return [];
    }
    
    const data: ArchiveSearchResponse = await response.json();
    return data.response.docs.map(item => this.archiveItemToMediaNode(item));
  }
  
  // =========================================================================
  // GET MEDIA NODE
  // =========================================================================
  
  async getMediaNode(providerContentId: string): Promise<MediaNode | null> {
    // Check if it's a LibriVox ID
    if (providerContentId.startsWith('librivox:')) {
      return this.getLibriVoxBook(providerContentId.replace('librivox:', ''));
    }
    
    // Archive.org item
    const response = await fetch(`${ARCHIVE_API_BASE}/metadata/${providerContentId}`);
    
    if (!response.ok) {
      return null;
    }
    
    const data: ArchiveMetadata = await response.json();
    return this.archiveItemToMediaNode(data.metadata);
  }
  
  private async getLibriVoxBook(id: string): Promise<MediaNode | null> {
    const response = await fetch(
      `${LIBRIVOX_API_BASE}/audiobooks?` + new URLSearchParams({
        id,
        format: 'json',
        extended: '1',
      })
    );
    
    if (!response.ok) {
      return null;
    }
    
    const data: LibriVoxResponse = await response.json();
    
    if (!data.books?.length) {
      return null;
    }
    
    return this.libriVoxBookToMediaNode(data.books[0]);
  }
  
  // =========================================================================
  // GET MEDIA SERIES
  // =========================================================================
  
  async getMediaSeries(providerContentId: string): Promise<MediaSeries | null> {
    // LibriVox books are series (chapters are episodes)
    if (providerContentId.startsWith('librivox:')) {
      const book = await this.getLibriVoxBook(providerContentId.replace('librivox:', ''));
      if (!book) return null;
      
      return this.createMediaSeries({
        canonical_id: book.canonical_id.replace('audiobook_chapter', 'audiobook'),
        media_type: 'audiobook',
        category: 'audio',
        title: book.title,
        description: book.description,
        total_chapters: 1, // Will be updated when chapters are fetched
        poster_url: book.poster_url,
      });
    }
    
    return null;
  }
  
  // =========================================================================
  // GET SERIES ITEMS
  // =========================================================================
  
  async getSeriesItems(seriesProviderContentId: string, params?: PaginationParams): Promise<MediaNode[]> {
    // LibriVox chapters
    if (seriesProviderContentId.startsWith('librivox:')) {
      const id = seriesProviderContentId.replace('librivox:', '');
      
      const response = await fetch(
        `${LIBRIVOX_API_BASE}/audiobooks?` + new URLSearchParams({
          id,
          format: 'json',
          extended: '1',
        })
      );
      
      if (!response.ok) {
        return [];
      }
      
      const data: LibriVoxResponse = await response.json();
      const book = data.books?.[0];
      
      if (!book?.sections) {
        return [];
      }
      
      return book.sections.map(section => this.libriVoxSectionToMediaNode(section, book));
    }
    
    return [];
  }
  
  // =========================================================================
  // GET AVAILABILITY
  // =========================================================================
  
  async getAvailability(providerContentId: string): Promise<MediaAvailability | null> {
    // LibriVox
    if (providerContentId.startsWith('librivox:')) {
      return {
        id: '',
        media_node_id: '',
        provider_id: '',
        provider_content_id: providerContentId,
        availability_type: 'free',
        is_verified: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
    }
    
    // Archive.org
    return {
      id: '',
      media_node_id: '',
      provider_id: '',
      provider_content_id: providerContentId,
      availability_type: 'free',
      playback_url: `https://archive.org/details/${providerContentId}`,
      embed_url: `https://archive.org/embed/${providerContentId}`,
      is_verified: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  }
  
  // =========================================================================
  // GET CREDITS
  // =========================================================================
  
  async getCredits(providerContentId: string): Promise<CreditWithPerson[]> {
    // LibriVox has author info
    if (providerContentId.startsWith('librivox:')) {
      const id = providerContentId.replace('librivox:', '');
      
      const response = await fetch(
        `${LIBRIVOX_API_BASE}/audiobooks?` + new URLSearchParams({
          id,
          format: 'json',
        })
      );
      
      if (!response.ok) {
        return [];
      }
      
      const data: LibriVoxResponse = await response.json();
      const book = data.books?.[0];
      
      if (!book?.authors) {
        return [];
      }
      
      return book.authors.map(author => ({
        credit: {
          person_id: '',
          role: 'author' as const,
          is_primary: true,
        },
        person: {
          canonical_id: generateCanonicalId('audiobook', 'librivox', `author/${author.id}`),
          name: `${author.first_name} ${author.last_name}`.trim(),
          birth_date: author.dob,
          death_date: author.dod,
        },
      }));
    }
    
    return [];
  }
  
  // =========================================================================
  // GET RELATED
  // =========================================================================
  
  async getRelated(providerContentId: string, limit: number = 10): Promise<MediaNode[]> {
    // For now, return popular items from same collection
    const node = await this.getMediaNode(providerContentId);
    if (!node) return [];
    
    return this.getTrending({ 
      category: node.category,
      limit,
    });
  }
  
  // =========================================================================
  // PLAYBACK
  // =========================================================================
  
  async getPlaybackUrl(providerContentId: string): Promise<PlaybackInfo | null> {
    // LibriVox
    if (providerContentId.startsWith('librivox:')) {
      // Need to get the actual audio URL from the book data
      const node = await this.getMediaNode(providerContentId);
      if (!node?.preview_url) return null;
      
      return {
        url: node.preview_url,
        type: 'direct',
      };
    }
    
    // Archive.org
    const response = await fetch(`${ARCHIVE_API_BASE}/metadata/${providerContentId}`);
    if (!response.ok) return null;
    
    const data: ArchiveMetadata = await response.json();
    
    // Find best video/audio file
    const videoFile = data.files.find(f => 
      f.format === 'MPEG4' || f.format === 'h.264' || f.format === 'Ogg Video'
    );
    const audioFile = data.files.find(f =>
      f.format === 'VBR MP3' || f.format === 'MP3' || f.format === 'Ogg Vorbis'
    );
    
    const file = videoFile || audioFile;
    if (!file) return null;
    
    return {
      url: `https://archive.org/download/${providerContentId}/${encodeURIComponent(file.name)}`,
      type: 'direct',
    };
  }
  
  getEmbedUrl(providerContentId: string): Promise<string | null> {
    if (providerContentId.startsWith('librivox:')) {
      return Promise.resolve(null);
    }
    
    return Promise.resolve(`https://archive.org/embed/${providerContentId}`);
  }
  
  // =========================================================================
  // CONVERSION HELPERS
  // =========================================================================
  
  private archiveItemToMediaNode(item: ArchiveItem): MediaNode {
    const isVideo = item.mediatype === 'movies';
    const mediaType = isVideo ? 'movie' : 'audiobook';
    const category = isVideo ? 'video' : 'audio';
    
    const creator = Array.isArray(item.creator) ? item.creator[0] : item.creator;
    const subjects = Array.isArray(item.subject) ? item.subject : item.subject ? [item.subject] : [];
    
    let duration: number | undefined;
    if (item.runtime) {
      const parts = item.runtime.split(':').map(p => parseInt(p, 10));
      if (parts.length === 3) {
        duration = parts[0] * 3600 + parts[1] * 60 + parts[2];
      } else if (parts.length === 2) {
        duration = parts[0] * 60 + parts[1];
      }
    }
    
    return this.createMediaNode({
      canonical_id: generateCanonicalId(mediaType, 'archive_org', item.identifier),
      media_type: mediaType,
      category,
      title: item.title,
      description: item.description,
      release_year: item.year || extractYear(item.date),
      duration_seconds: duration,
      average_rating: item.avg_rating ? item.avg_rating * 2 : undefined, // Scale to 0-10
      vote_count: item.num_reviews,
      popularity_score: item.downloads ? Math.log10(item.downloads + 1) * 10 : undefined,
      poster_url: `https://archive.org/services/img/${item.identifier}`,
      thumbnail_url: `https://archive.org/services/img/${item.identifier}`,
    });
  }
  
  private libriVoxBookToMediaNode(book: LibriVoxBook): MediaNode {
    const authorNames = book.authors?.map(a => `${a.first_name} ${a.last_name}`.trim()).join(', ');
    
    return this.createMediaNode({
      canonical_id: generateCanonicalId('audiobook', 'librivox', book.id),
      media_type: 'audiobook',
      category: 'audio',
      title: book.title,
      description: book.description ? `${book.description}${authorNames ? ` by ${authorNames}` : ''}` : undefined,
      release_year: book.copyright_year ? parseInt(book.copyright_year, 10) : undefined,
      duration_seconds: book.totaltimesecs,
      poster_url: book.url_iarchive ? `https://archive.org/services/img/${book.url_iarchive.split('/').pop()}` : undefined,
    });
  }
  
  private libriVoxSectionToMediaNode(section: LibriVoxSection, book: LibriVoxBook): MediaNode {
    // Parse playtime (HH:MM:SS)
    let duration: number | undefined;
    if (section.playtime) {
      const parts = section.playtime.split(':').map(p => parseInt(p, 10));
      if (parts.length === 3) {
        duration = parts[0] * 3600 + parts[1] * 60 + parts[2];
      } else if (parts.length === 2) {
        duration = parts[0] * 60 + parts[1];
      }
    }
    
    return this.createMediaNode({
      canonical_id: generateCanonicalId('audiobook_chapter', 'librivox', `${book.id}/${section.id}`),
      media_type: 'audiobook_chapter',
      category: 'audio',
      title: section.title,
      chapter_number: parseInt(section.section_number, 10),
      duration_seconds: duration,
      preview_url: section.listen_url,
    });
  }
}

export const publicDomainAdapter = new PublicDomainAdapter();
