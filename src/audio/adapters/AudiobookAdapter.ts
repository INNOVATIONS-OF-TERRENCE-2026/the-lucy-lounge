/**
 * ┌─────────────────────────────────────────────────────────────────────────────┐
 * │ THE LUCY LOUNGE — AUDIOBOOK ADAPTER                                         │
 * │                                                                             │
 * │ Free audiobook playback from public domain sources                         │
 * │ LibriVox, Internet Archive, Open Library                                   │
 * └─────────────────────────────────────────────────────────────────────────────┘
 */

import type {
  AudioTrack,
  AudioSourceType,
  AudioSourceAdapter,
  PlaybackState,
} from '../types';

// =============================================================================
// AUDIOBOOK TYPES
// =============================================================================

interface AudiobookMetadata {
  id: string;
  title: string;
  author: string;
  description?: string;
  coverUrl?: string;
  totalDuration?: number;
  language: string;
  genre?: string;
  source: 'librivox' | 'archive' | 'openlibrary';
  chapters: AudiobookChapter[];
}

interface AudiobookChapter {
  id: string;
  title: string;
  duration?: number;
  audioUrl: string;
  chapterNumber: number;
  reader?: string;
}

// =============================================================================
// LIBRIVOX API
// =============================================================================

const LIBRIVOX_API = 'https://librivox.org/api/feed/audiobooks';

interface LibriVoxResponse {
  books: Array<{
    id: string;
    title: string;
    description: string;
    url_librivox: string;
    url_other: string;
    url_project: string;
    url_rss: string;
    url_zip_file: string;
    language: string;
    copyright_year: string;
    num_sections: string;
    totaltimesecs: number;
    authors: Array<{
      id: string;
      first_name: string;
      last_name: string;
      dob: string;
      dod: string;
    }>;
    sections?: Array<{
      id: string;
      section_number: string;
      title: string;
      listen_url: string;
      language: string;
      playtime: string;
      readers: Array<{
        display_name: string;
      }>;
    }>;
  }>;
}

// =============================================================================
// INTERNET ARCHIVE API
// =============================================================================

const ARCHIVE_API = 'https://archive.org/advancedsearch.php';
const ARCHIVE_METADATA = 'https://archive.org/metadata';

// =============================================================================
// POPULAR AUDIOBOOK CATEGORIES
// =============================================================================

const AUDIOBOOK_CATEGORIES = [
  { id: 'classics', name: 'Classics', searchTerm: 'classic literature' },
  { id: 'fiction', name: 'Fiction', searchTerm: 'fiction' },
  { id: 'mystery', name: 'Mystery & Thriller', searchTerm: 'mystery' },
  { id: 'scifi', name: 'Science Fiction', searchTerm: 'science fiction' },
  { id: 'philosophy', name: 'Philosophy', searchTerm: 'philosophy' },
  { id: 'history', name: 'History', searchTerm: 'history' },
  { id: 'poetry', name: 'Poetry', searchTerm: 'poetry' },
  { id: 'adventure', name: 'Adventure', searchTerm: 'adventure' },
  { id: 'children', name: "Children's Books", searchTerm: 'children' },
  { id: 'biography', name: 'Biography', searchTerm: 'biography' },
];

// =============================================================================
// AUDIOBOOK ADAPTER IMPLEMENTATION
// =============================================================================

export class AudiobookAdapter implements AudioSourceAdapter {
  readonly source: AudioSourceType = 'audiobook';
  readonly displayName = 'Audiobooks';
  readonly supportsOffline = true;
  readonly requiresAuth = false;
  readonly canSeek = true;
  readonly canControlPlayback = true;
  
  private bookCache: Map<string, AudiobookMetadata> = new Map();
  private audioElement: HTMLAudioElement | null = null;
  private currentTrack: AudioTrack | null = null;
  private state: PlaybackState = 'idle';
  
  async initialize(): Promise<boolean> {
    console.log('[AudiobookAdapter] Initialized');
    return true;
  }
  
  dispose(): void {
    if (this.audioElement) {
      this.audioElement.pause();
      this.audioElement.src = '';
    }
    this.bookCache.clear();
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
      console.error('[AudiobookAdapter] Playback failed:', error);
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
    // sourceId format: "source:bookId:chapterId"
    const [source, bookId, chapterId] = sourceId.split(':');
    
    const book = await this.getBook(bookId, source as 'librivox' | 'archive');
    if (!book) return null;
    
    const chapter = book.chapters.find(c => c.id === chapterId);
    if (!chapter) return null;
    
    return this.chapterToTrack(chapter, book);
  }
  
  async searchTracks(query: string, limit: number = 20): Promise<AudioTrack[]> {
    const books = await this.searchBooks(query, limit);
    
    // Return first chapter of each book
    return books
      .filter(book => book.chapters.length > 0)
      .map(book => this.chapterToTrack(book.chapters[0], book));
  }
  
  // ===========================================================================
  // LIBRIVOX INTEGRATION
  // ===========================================================================
  
  async searchLibriVox(query: string, limit: number = 20): Promise<AudiobookMetadata[]> {
    try {
      const url = `${LIBRIVOX_API}?title=${encodeURIComponent(query)}&format=json&limit=${limit}`;
      const response = await fetch(url);
      
      if (!response.ok) return [];
      
      const data: LibriVoxResponse = await response.json();
      
      return (data.books || []).map(book => this.libriVoxToMetadata(book));
      
    } catch (error) {
      console.error('[AudiobookAdapter] LibriVox search failed:', error);
      return [];
    }
  }
  
  async getLibriVoxBook(bookId: string): Promise<AudiobookMetadata | null> {
    // Check cache
    const cacheKey = `librivox:${bookId}`;
    if (this.bookCache.has(cacheKey)) {
      return this.bookCache.get(cacheKey)!;
    }
    
    try {
      // Get book details
      const url = `${LIBRIVOX_API}?id=${bookId}&format=json&extended=1`;
      const response = await fetch(url);
      
      if (!response.ok) return null;
      
      const data: LibriVoxResponse = await response.json();
      const book = data.books?.[0];
      
      if (!book) return null;
      
      const metadata = this.libriVoxToMetadata(book);
      this.bookCache.set(cacheKey, metadata);
      
      return metadata;
      
    } catch (error) {
      console.error('[AudiobookAdapter] Failed to get LibriVox book:', error);
      return null;
    }
  }
  
  private libriVoxToMetadata(book: LibriVoxResponse['books'][0]): AudiobookMetadata {
    const authorNames = (book.authors || [])
      .map(a => `${a.first_name} ${a.last_name}`.trim())
      .join(', ');
    
    return {
      id: book.id,
      title: book.title,
      author: authorNames || 'Unknown Author',
      description: book.description,
      coverUrl: `https://archive.org/services/img/librivox_${book.id}`,
      totalDuration: book.totaltimesecs,
      language: book.language,
      source: 'librivox',
      chapters: (book.sections || []).map((section, index) => ({
        id: section.id,
        title: section.title || `Chapter ${index + 1}`,
        duration: this.parsePlaytime(section.playtime),
        audioUrl: section.listen_url,
        chapterNumber: parseInt(section.section_number) || index + 1,
        reader: section.readers?.[0]?.display_name,
      })),
    };
  }
  
  private parsePlaytime(playtime: string): number | undefined {
    if (!playtime) return undefined;
    
    const parts = playtime.split(':').map(Number);
    if (parts.length === 3) {
      return parts[0] * 3600 + parts[1] * 60 + parts[2];
    }
    if (parts.length === 2) {
      return parts[0] * 60 + parts[1];
    }
    return undefined;
  }
  
  // ===========================================================================
  // INTERNET ARCHIVE INTEGRATION
  // ===========================================================================
  
  async searchArchive(query: string, limit: number = 20): Promise<AudiobookMetadata[]> {
    try {
      const url = `${ARCHIVE_API}?q=${encodeURIComponent(query)}+mediatype:audio&fl=identifier,title,creator,description&rows=${limit}&output=json`;
      const response = await fetch(url);
      
      if (!response.ok) return [];
      
      const data = await response.json();
      
      return Promise.all(
        (data.response?.docs || [])
          .slice(0, limit)
          .map((doc: any) => this.getArchiveBook(doc.identifier))
      ).then(results => results.filter((r): r is AudiobookMetadata => r !== null));
      
    } catch (error) {
      console.error('[AudiobookAdapter] Archive search failed:', error);
      return [];
    }
  }
  
  async getArchiveBook(identifier: string): Promise<AudiobookMetadata | null> {
    // Check cache
    const cacheKey = `archive:${identifier}`;
    if (this.bookCache.has(cacheKey)) {
      return this.bookCache.get(cacheKey)!;
    }
    
    try {
      const url = `${ARCHIVE_METADATA}/${identifier}`;
      const response = await fetch(url);
      
      if (!response.ok) return null;
      
      const data = await response.json();
      
      // Find audio files
      const audioFiles = (data.files || [])
        .filter((f: any) => 
          f.format === 'VBR MP3' || 
          f.format === 'MP3' ||
          f.name?.endsWith('.mp3')
        )
        .sort((a: any, b: any) => (a.name || '').localeCompare(b.name || ''));
      
      if (audioFiles.length === 0) return null;
      
      const metadata: AudiobookMetadata = {
        id: identifier,
        title: data.metadata?.title || identifier,
        author: data.metadata?.creator || 'Unknown Author',
        description: data.metadata?.description,
        coverUrl: `https://archive.org/services/img/${identifier}`,
        language: data.metadata?.language || 'English',
        source: 'archive',
        chapters: audioFiles.map((file: any, index: number) => ({
          id: file.name,
          title: file.title || file.name?.replace(/\.mp3$/i, '') || `Chapter ${index + 1}`,
          duration: parseInt(file.length) || undefined,
          audioUrl: `https://archive.org/download/${identifier}/${file.name}`,
          chapterNumber: index + 1,
        })),
      };
      
      this.bookCache.set(cacheKey, metadata);
      return metadata;
      
    } catch (error) {
      console.error('[AudiobookAdapter] Failed to get Archive book:', error);
      return null;
    }
  }
  
  // ===========================================================================
  // UNIFIED SEARCH
  // ===========================================================================
  
  async searchBooks(query: string, limit: number = 20): Promise<AudiobookMetadata[]> {
    // Search both sources in parallel
    const [libriVoxResults, archiveResults] = await Promise.all([
      this.searchLibriVox(query, Math.ceil(limit / 2)),
      this.searchArchive(query, Math.ceil(limit / 2)),
    ]);
    
    // Merge and dedupe
    const merged = [...libriVoxResults, ...archiveResults];
    return merged.slice(0, limit);
  }
  
  async getBook(bookId: string, source?: 'librivox' | 'archive'): Promise<AudiobookMetadata | null> {
    if (source === 'librivox') {
      return this.getLibriVoxBook(bookId);
    }
    if (source === 'archive') {
      return this.getArchiveBook(bookId);
    }
    
    // Try both
    let book = await this.getLibriVoxBook(bookId);
    if (!book) {
      book = await this.getArchiveBook(bookId);
    }
    return book;
  }
  
  // ===========================================================================
  // FEATURED & CATEGORIES
  // ===========================================================================
  
  async getFeaturedBooks(limit: number = 20): Promise<AudiobookMetadata[]> {
    // Get popular classics
    return this.searchLibriVox('', limit);
  }
  
  async getBooksByCategory(categoryId: string, limit: number = 20): Promise<AudiobookMetadata[]> {
    const category = AUDIOBOOK_CATEGORIES.find(c => c.id === categoryId);
    if (!category) return [];
    
    return this.searchBooks(category.searchTerm, limit);
  }
  
  getCategories(): typeof AUDIOBOOK_CATEGORIES {
    return AUDIOBOOK_CATEGORIES;
  }
  
  // ===========================================================================
  // BOOK CHAPTERS
  // ===========================================================================
  
  async getBookChapters(bookId: string, source: 'librivox' | 'archive'): Promise<AudioTrack[]> {
    const book = await this.getBook(bookId, source);
    if (!book) return [];
    
    return book.chapters.map(chapter => this.chapterToTrack(chapter, book));
  }
  
  // ===========================================================================
  // CONVERSION HELPERS
  // ===========================================================================
  
  private chapterToTrack(chapter: AudiobookChapter, book: AudiobookMetadata): AudioTrack {
    return {
      id: `audiobook_${book.source}_${book.id}_${chapter.id}`,
      source: 'audiobook',
      sourceId: `${book.source}:${book.id}:${chapter.id}`,
      title: chapter.title,
      artist: book.author,
      album: book.title,
      duration: chapter.duration,
      artwork: book.coverUrl,
      playbackUrl: chapter.audioUrl,
      audiobookInfo: {
        bookTitle: book.title,
        author: book.author,
        chapter: chapter.chapterNumber,
        totalChapters: book.chapters.length,
        narrator: chapter.reader,
      },
    };
  }
}

// =============================================================================
// SINGLETON INSTANCE
// =============================================================================

export const audiobookAdapter = new AudiobookAdapter();
