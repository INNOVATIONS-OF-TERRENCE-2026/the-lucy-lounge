// =============================================================================
// THE LUCY LOUNGE - Universal Media Graph Types
// =============================================================================
// COMPLETE TYPE SYSTEM for the Universal Media Intelligence Layer
// Covers: Movies, TV, Music, Podcasts, Audiobooks, Creator Content
// =============================================================================

// =============================================================================
// CORE ENUMS
// =============================================================================

export type MediaType = 
  | 'movie'
  | 'tv_show'
  | 'tv_season'
  | 'tv_episode'
  | 'music_album'
  | 'music_track'
  | 'podcast_show'
  | 'podcast_episode'
  | 'audiobook'
  | 'audiobook_chapter'
  | 'creator_video'
  | 'creator_audio'
  | 'live_stream'
  | 'fast_channel';

export type MediaCategory = 
  | 'video'      // Movies, TV, Creator Video
  | 'audio'      // Music, Podcasts, Audiobooks
  | 'live';      // Live streams, FAST channels

export type RelationshipType =
  | 'sequel_to'
  | 'prequel_to'
  | 'spin_off_of'
  | 'remake_of'
  | 'part_of'           // Episode → Season → Show
  | 'soundtrack_of'     // Album → Movie
  | 'same_creator'
  | 'same_franchise'
  | 'similar_to'
  | 'recommended_after'
  | 'mood_match'
  | 'theme_match'
  | 'remix_of'
  | 'cover_of'
  | 'features';         // Artist features on track

export type ProviderType =
  | 'tmdb'              // Movie/TV metadata
  | 'youtube'           // Videos, FAST
  | 'spotify'           // Music
  | 'apple_music'
  | 'soundcloud'
  | 'rss_podcast'       // Podcasts
  | 'librivox'          // Public domain audiobooks
  | 'archive_org'       // Public domain everything
  | 'pluto_tv'          // FAST channels
  | 'tubi'              // Free movies
  | 'plex_free'         // Free movies
  | 'vimeo'
  | 'twitch'
  | 'custom';           // User uploads

export type AvailabilityType =
  | 'free'
  | 'free_with_ads'
  | 'subscription'
  | 'rental'
  | 'purchase'
  | 'premium_only'
  | 'geo_restricted';

export type ContentRating =
  | 'G'
  | 'PG'
  | 'PG-13'
  | 'R'
  | 'NC-17'
  | 'TV-Y'
  | 'TV-Y7'
  | 'TV-G'
  | 'TV-PG'
  | 'TV-14'
  | 'TV-MA'
  | 'E'           // Explicit (music)
  | 'CLEAN'
  | 'UNRATED';

// =============================================================================
// GRAPH ENTITIES
// =============================================================================

/**
 * MediaNode - Atomic media item (movie, episode, track, etc.)
 * This is the fundamental unit of the media graph
 */
export interface MediaNode {
  id: string;                       // UUID
  canonical_id: string;             // Provider-agnostic ID (e.g., "lucy:movie:12345")
  media_type: MediaType;
  category: MediaCategory;
  
  // Core metadata
  title: string;
  original_title?: string;          // For foreign content
  description?: string;
  tagline?: string;
  
  // Temporal
  release_date?: string;            // ISO date
  release_year?: number;
  duration_seconds?: number;
  
  // Media-specific
  season_number?: number;           // For TV episodes
  episode_number?: number;
  track_number?: number;            // For music tracks
  disc_number?: number;
  chapter_number?: number;          // For audiobook chapters
  
  // Ratings & Popularity
  content_rating?: ContentRating;
  average_rating?: number;          // 0-10
  vote_count?: number;
  popularity_score?: number;        // Lucy computed
  
  // Visual
  poster_url?: string;
  backdrop_url?: string;
  thumbnail_url?: string;
  
  // Audio-specific
  preview_url?: string;             // 30s preview
  waveform_data?: number[];         // For visualizer
  
  // Identifiers
  imdb_id?: string;
  tmdb_id?: number;
  spotify_id?: string;
  apple_id?: string;
  youtube_id?: string;
  isrc?: string;                    // Music ISRC
  isbn?: string;                    // Books
  
  // Graph
  parent_series_id?: string;        // References MediaSeries
  
  // Embeddings (for semantic search)
  embedding?: number[];             // pgvector
  
  // Timestamps
  created_at: string;
  updated_at: string;
  last_synced_at?: string;
}

/**
 * MediaSeries - Container for related media (show, album, podcast, etc.)
 */
export interface MediaSeries {
  id: string;
  canonical_id: string;
  media_type: MediaType;
  category: MediaCategory;
  
  // Core metadata
  title: string;
  original_title?: string;
  description?: string;
  
  // Temporal
  start_year?: number;
  end_year?: number;                // null = ongoing
  
  // Counts
  total_episodes?: number;
  total_seasons?: number;
  total_tracks?: number;
  total_chapters?: number;
  
  // Ratings
  content_rating?: ContentRating;
  average_rating?: number;
  vote_count?: number;
  
  // Visual
  poster_url?: string;
  backdrop_url?: string;
  
  // Identifiers
  imdb_id?: string;
  tmdb_id?: number;
  spotify_id?: string;
  apple_id?: string;
  rss_feed_url?: string;            // Podcasts
  
  // Status
  status?: 'returning' | 'ended' | 'canceled' | 'in_production';
  
  // Embeddings
  embedding?: number[];
  
  created_at: string;
  updated_at: string;
}

/**
 * MediaProvider - Where content is available
 */
export interface MediaProvider {
  id: string;
  name: string;
  provider_type: ProviderType;
  logo_url?: string;
  website_url?: string;
  
  // Capabilities
  supports_playback: boolean;
  supports_offline: boolean;
  requires_auth: boolean;
  
  // Integration
  api_base_url?: string;
  deep_link_template?: string;      // e.g., "spotify:track:{id}"
  
  // Status
  is_active: boolean;
  priority: number;                 // For routing (higher = preferred)
  
  created_at: string;
  updated_at: string;
}

/**
 * MediaAvailability - Maps MediaNodes to Providers
 */
export interface MediaAvailability {
  id: string;
  media_node_id: string;
  provider_id: string;
  
  // Provider-specific ID
  provider_content_id: string;      // ID in that provider's system
  
  // Availability details
  availability_type: AvailabilityType;
  quality?: string;                 // "4K", "HD", "SD", "320kbps", etc.
  regions?: string[];               // ISO country codes
  
  // Playback
  playback_url?: string;            // Direct URL or deep link
  embed_url?: string;               // For iframe embedding
  
  // Pricing (for rental/purchase)
  price_cents?: number;
  currency?: string;
  
  // Validity
  available_from?: string;
  available_until?: string;
  
  // Metadata
  last_verified_at?: string;
  is_verified: boolean;
  
  created_at: string;
  updated_at: string;
}

/**
 * MediaRelationship - Graph edges between MediaNodes/MediaSeries
 */
export interface MediaRelationship {
  id: string;
  source_id: string;                // MediaNode or MediaSeries ID
  source_type: 'node' | 'series';
  target_id: string;
  target_type: 'node' | 'series';
  
  relationship_type: RelationshipType;
  
  // Weight/strength of relationship
  weight?: number;                  // 0-1
  
  // Context
  metadata?: Record<string, unknown>;
  
  created_at: string;
}

/**
 * MediaTag - Genres, moods, eras, topics
 */
export interface MediaTag {
  id: string;
  name: string;
  slug: string;                     // URL-safe identifier
  
  tag_type: 'genre' | 'mood' | 'era' | 'topic' | 'language' | 'theme' | 'style';
  
  // Visual
  icon?: string;
  color?: string;
  
  // Hierarchy
  parent_tag_id?: string;           // For sub-genres
  
  created_at: string;
}

/**
 * MediaNodeTag - Many-to-many mapping
 */
export interface MediaNodeTag {
  id: string;
  media_node_id: string;
  tag_id: string;
  relevance?: number;               // 0-1, how relevant this tag is
  created_at: string;
}

/**
 * MediaPerson - Cast, artists, creators
 */
export interface MediaPerson {
  id: string;
  canonical_id: string;
  
  name: string;
  also_known_as?: string[];
  
  // Bio
  biography?: string;
  birth_date?: string;
  death_date?: string;
  birth_place?: string;
  
  // Visual
  profile_image_url?: string;
  
  // Identifiers
  imdb_id?: string;
  tmdb_id?: number;
  spotify_id?: string;
  
  // Popularity
  popularity_score?: number;
  
  // Embeddings
  embedding?: number[];
  
  created_at: string;
  updated_at: string;
}

/**
 * MediaCredit - Maps MediaPerson to MediaNode/MediaSeries
 */
export interface MediaCredit {
  id: string;
  person_id: string;
  media_node_id?: string;           // Either node or series
  media_series_id?: string;
  
  role: 'actor' | 'director' | 'writer' | 'producer' | 'composer' | 
        'artist' | 'featured_artist' | 'host' | 'narrator' | 'author' | 'creator';
  
  character_name?: string;          // For actors
  department?: string;
  job?: string;
  
  // Ordering
  order?: number;
  is_primary: boolean;              // Main cast/creator
  
  created_at: string;
}

// =============================================================================
// USER STATE ENTITIES
// =============================================================================

/**
 * UserMediaState - Progress/resume state per media node
 */
export interface UserMediaState {
  id: string;
  user_id: string;
  media_node_id: string;
  
  // Progress
  progress_seconds: number;
  progress_percent: number;         // 0-100
  
  // Status
  status: 'not_started' | 'in_progress' | 'completed' | 'abandoned';
  
  // Completion
  completed_at?: string;
  completed_count: number;          // How many times finished
  
  // Last interaction
  last_position_seconds?: number;
  last_played_at?: string;
  
  // Device
  last_device?: string;
  
  created_at: string;
  updated_at: string;
}

/**
 * UserWatchEvent - Video watch telemetry
 */
export interface UserWatchEvent {
  id: string;
  user_id: string;
  media_node_id: string;
  
  // Session
  session_id: string;
  started_at: string;
  ended_at?: string;
  
  // Duration
  duration_watched_seconds: number;
  
  // Positions
  start_position_seconds: number;
  end_position_seconds: number;
  
  // Quality
  quality_level?: string;
  
  // Context
  device_type?: string;
  player_type?: string;
  
  // Engagement
  paused_count: number;
  seeked_count: number;
  completed: boolean;
  
  created_at: string;
}

/**
 * UserListenEvent - Audio listen telemetry
 */
export interface UserListenEvent {
  id: string;
  user_id: string;
  media_node_id: string;
  
  // Session
  session_id: string;
  started_at: string;
  ended_at?: string;
  
  // Duration
  duration_listened_seconds: number;
  
  // Context
  source: 'queue' | 'playlist' | 'album' | 'radio' | 'search' | 'recommendation';
  shuffle_mode: boolean;
  repeat_mode: 'off' | 'track' | 'all';
  
  // Device
  device_type?: string;
  
  // Engagement
  skipped: boolean;
  skip_position_seconds?: number;   // Where they skipped
  liked_during_play: boolean;
  
  created_at: string;
}

/**
 * UserCollection - Watchlists, favorites, playlists, queues
 */
export interface UserCollection {
  id: string;
  user_id: string;
  
  name: string;
  description?: string;
  
  collection_type: 'watchlist' | 'favorites' | 'playlist' | 'queue' | 'history' | 'custom';
  media_category?: MediaCategory;   // Restrict to video/audio
  
  // Visual
  cover_image_url?: string;
  
  // Privacy
  is_public: boolean;
  
  // Smart collections
  is_smart: boolean;                // Auto-populated based on rules
  smart_rules?: SmartCollectionRule[];
  
  // Stats
  item_count: number;
  total_duration_seconds?: number;
  
  created_at: string;
  updated_at: string;
}

export interface SmartCollectionRule {
  field: string;                    // e.g., "genre", "mood", "rating"
  operator: 'equals' | 'contains' | 'greater_than' | 'less_than' | 'in';
  value: string | number | string[];
}

/**
 * UserCollectionItem - Items in a collection
 */
export interface UserCollectionItem {
  id: string;
  collection_id: string;
  media_node_id: string;
  
  // Ordering
  position: number;
  
  // Context
  added_by: 'user' | 'lucy' | 'smart_rule';
  note?: string;
  
  created_at: string;
}

/**
 * UserRating - Optional explicit ratings
 */
export interface UserRating {
  id: string;
  user_id: string;
  media_node_id?: string;
  media_series_id?: string;
  
  // Rating
  rating: number;                   // 1-10
  rating_type: 'stars' | 'thumbs' | 'percentage';
  
  // Review
  review_text?: string;
  contains_spoilers: boolean;
  
  created_at: string;
  updated_at: string;
}

/**
 * UserTasteProfile - Derived + cached signals for recommendations
 */
export interface UserTasteProfile {
  id: string;
  user_id: string;
  
  // Genre affinities (0-1)
  genre_scores: Record<string, number>;
  
  // Mood affinities
  mood_scores: Record<string, number>;
  
  // Era preferences
  era_scores: Record<string, number>;
  
  // Content type preferences
  media_type_scores: Record<MediaType, number>;
  
  // Creator/artist affinities
  top_creators: Array<{ person_id: string; score: number }>;
  
  // Temporal patterns
  preferred_watching_hours: number[];   // 0-23
  preferred_listening_hours: number[];
  weekend_preference: number;           // 0-1, higher = prefers weekends
  
  // Engagement metrics
  average_watch_completion: number;     // 0-1
  average_listen_completion: number;
  binge_tendency: number;               // 0-1, higher = binges
  
  // Discovery profile
  novelty_preference: number;           // 0-1, higher = likes new things
  depth_preference: number;             // 0-1, higher = explores deeply
  
  // Taste vector (for similarity)
  taste_embedding?: number[];           // pgvector
  
  // Cache management
  last_computed_at: string;
  computation_version: number;
  
  created_at: string;
  updated_at: string;
}

// =============================================================================
// JOURNEY & DISCOVERY TYPES
// =============================================================================

/**
 * LucyJourney - Curated multi-step content sequence
 */
export interface LucyJourney {
  id: string;
  
  title: string;
  description?: string;
  
  // Visual
  cover_image_url?: string;
  gradient_colors?: string[];
  
  // Type
  journey_type: 'mood' | 'theme' | 'era' | 'director' | 'artist' | 'story' | 'curated';
  
  // Cross-media
  media_categories: MediaCategory[];
  
  // Mood/context
  moods: string[];
  best_time_of_day?: 'morning' | 'afternoon' | 'evening' | 'late_night' | 'any';
  estimated_duration_minutes?: number;
  
  // Steps
  steps: JourneyStep[];
  
  // Discovery
  is_featured: boolean;
  popularity_score?: number;
  
  // Creator
  created_by: 'lucy' | 'editorial' | 'community';
  curator_id?: string;
  
  created_at: string;
  updated_at: string;
}

export interface JourneyStep {
  order: number;
  media_node_id: string;
  
  // Context
  introduction?: string;            // Lucy says before this step
  transition?: string;              // Lucy says after this step
  
  // Optional overrides
  start_at_seconds?: number;
  end_at_seconds?: number;
}

/**
 * MoodDiscoveryConfig - Configuration for mood-based discovery
 */
export interface MoodDiscoveryConfig {
  id: string;
  mood_slug: string;
  
  display_name: string;
  description?: string;
  
  // Visual
  icon?: string;
  gradient_colors: string[];
  background_image_url?: string;
  
  // Query configuration
  genre_weights: Record<string, number>;
  tag_filters: string[];
  tempo_range?: [number, number];       // BPM for music
  energy_range?: [number, number];      // 0-1
  
  // Time affinity
  time_of_day_weights: Record<string, number>;
  
  created_at: string;
}

// =============================================================================
// INGESTION & SYNC TYPES
// =============================================================================

/**
 * ProviderSyncJob - Track ingestion jobs
 */
export interface ProviderSyncJob {
  id: string;
  provider_id: string;
  
  job_type: 'full' | 'incremental' | 'specific_ids';
  
  // Status
  status: 'pending' | 'running' | 'completed' | 'failed';
  
  // Progress
  total_items?: number;
  processed_items: number;
  failed_items: number;
  
  // Timing
  started_at?: string;
  completed_at?: string;
  
  // Errors
  error_log?: string[];
  
  // Filters
  filters?: Record<string, unknown>;
  
  created_at: string;
}

// =============================================================================
// API RESPONSE TYPES
// =============================================================================

export interface MediaNodeWithDetails extends MediaNode {
  series?: MediaSeries;
  availability: MediaAvailability[];
  tags: MediaTag[];
  credits: Array<MediaCredit & { person: MediaPerson }>;
  relationships: Array<MediaRelationship & { 
    related: MediaNode | MediaSeries;
  }>;
}

export interface UserMediaStateWithNode extends UserMediaState {
  media_node: MediaNode;
}

export interface ContinueWatchingItem {
  state: UserMediaState;
  node: MediaNode;
  series?: MediaSeries;
  next_episode?: MediaNode;
}

export interface ContinueListeningItem {
  state: UserMediaState;
  node: MediaNode;
  series?: MediaSeries;
  queue_position?: number;
}

export interface RecommendationRow {
  id: string;
  title: string;
  reason: string;                   // "Because you watched X"
  reason_type: 'history' | 'similar' | 'trending' | 'mood' | 'journey' | 'serendipity';
  items: MediaNode[];
}

export interface ExploreSection {
  id: string;
  title: string;
  description?: string;
  section_type: 'mood' | 'genre' | 'era' | 'journey' | 'trending' | 'new' | 'personalized';
  items: MediaNode[] | LucyJourney[];
  visual_style: 'row' | 'grid' | 'hero' | 'carousel' | 'story';
}
