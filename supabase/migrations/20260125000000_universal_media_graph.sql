-- =====================================================================
-- THE LUCY LOUNGE - UNIVERSAL MEDIA GRAPH SCHEMA
-- Migration: 20260125_universal_media_graph.sql
-- =====================================================================
-- Complete schema for the Universal Media Intelligence Layer
-- Covers: Movies, TV, Music, Podcasts, Audiobooks, Creator Content
-- =====================================================================

-- =====================================================================
-- ENABLE EXTENSIONS
-- =====================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";  -- pgvector for embeddings

-- =====================================================================
-- CUSTOM TYPES (ENUMS)
-- =====================================================================

-- Media Type Enum
DO $$ BEGIN
  CREATE TYPE media_type AS ENUM (
    'movie',
    'tv_show',
    'tv_season',
    'tv_episode',
    'music_album',
    'music_track',
    'podcast_show',
    'podcast_episode',
    'audiobook',
    'audiobook_chapter',
    'creator_video',
    'creator_audio',
    'live_stream',
    'fast_channel'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Media Category Enum
DO $$ BEGIN
  CREATE TYPE media_category AS ENUM ('video', 'audio', 'live');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Relationship Type Enum
DO $$ BEGIN
  CREATE TYPE relationship_type AS ENUM (
    'sequel_to',
    'prequel_to',
    'spin_off_of',
    'remake_of',
    'part_of',
    'soundtrack_of',
    'same_creator',
    'same_franchise',
    'similar_to',
    'recommended_after',
    'mood_match',
    'theme_match',
    'remix_of',
    'cover_of',
    'features'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Provider Type Enum
DO $$ BEGIN
  CREATE TYPE provider_type AS ENUM (
    'tmdb',
    'youtube',
    'spotify',
    'apple_music',
    'soundcloud',
    'rss_podcast',
    'librivox',
    'archive_org',
    'pluto_tv',
    'tubi',
    'plex_free',
    'vimeo',
    'twitch',
    'custom'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Availability Type Enum
DO $$ BEGIN
  CREATE TYPE availability_type AS ENUM (
    'free',
    'free_with_ads',
    'subscription',
    'rental',
    'purchase',
    'premium_only',
    'geo_restricted'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Content Rating Enum
DO $$ BEGIN
  CREATE TYPE content_rating AS ENUM (
    'G', 'PG', 'PG-13', 'R', 'NC-17',
    'TV-Y', 'TV-Y7', 'TV-G', 'TV-PG', 'TV-14', 'TV-MA',
    'E', 'CLEAN', 'UNRATED'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Tag Type Enum
DO $$ BEGIN
  CREATE TYPE tag_type AS ENUM (
    'genre', 'mood', 'era', 'topic', 'language', 'theme', 'style'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Credit Role Enum
DO $$ BEGIN
  CREATE TYPE credit_role AS ENUM (
    'actor', 'director', 'writer', 'producer', 'composer',
    'artist', 'featured_artist', 'host', 'narrator', 'author', 'creator'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Media Status Enum
DO $$ BEGIN
  CREATE TYPE media_status AS ENUM (
    'not_started', 'in_progress', 'completed', 'abandoned'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Collection Type Enum
DO $$ BEGIN
  CREATE TYPE collection_type AS ENUM (
    'watchlist', 'favorites', 'playlist', 'queue', 'history', 'custom'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Journey Type Enum
DO $$ BEGIN
  CREATE TYPE journey_type AS ENUM (
    'mood', 'theme', 'era', 'director', 'artist', 'story', 'curated'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- =====================================================================
-- 1. MEDIA PROVIDERS
-- =====================================================================

CREATE TABLE IF NOT EXISTS public.media_providers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  provider_type provider_type NOT NULL,
  logo_url TEXT,
  website_url TEXT,
  
  -- Capabilities
  supports_playback BOOLEAN DEFAULT true,
  supports_offline BOOLEAN DEFAULT false,
  requires_auth BOOLEAN DEFAULT false,
  
  -- Integration
  api_base_url TEXT,
  deep_link_template TEXT,
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  priority INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(name)
);

-- =====================================================================
-- 2. MEDIA SERIES (Containers: Shows, Albums, Podcasts, Audiobooks)
-- =====================================================================

CREATE TABLE IF NOT EXISTS public.media_series (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  canonical_id TEXT NOT NULL UNIQUE,
  media_type media_type NOT NULL,
  category media_category NOT NULL,
  
  -- Core metadata
  title TEXT NOT NULL,
  original_title TEXT,
  description TEXT,
  
  -- Temporal
  start_year INTEGER,
  end_year INTEGER,
  
  -- Counts
  total_episodes INTEGER,
  total_seasons INTEGER,
  total_tracks INTEGER,
  total_chapters INTEGER,
  
  -- Ratings
  content_rating content_rating,
  average_rating NUMERIC(3,1) CHECK (average_rating >= 0 AND average_rating <= 10),
  vote_count INTEGER DEFAULT 0,
  
  -- Visual
  poster_url TEXT,
  backdrop_url TEXT,
  
  -- External IDs
  imdb_id TEXT,
  tmdb_id INTEGER,
  spotify_id TEXT,
  apple_id TEXT,
  rss_feed_url TEXT,
  
  -- Status
  status TEXT CHECK (status IN ('returning', 'ended', 'canceled', 'in_production')),
  
  -- Embeddings (pgvector)
  embedding vector(1536),
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_synced_at TIMESTAMPTZ
);

-- =====================================================================
-- 3. MEDIA NODES (Atomic items: Movies, Episodes, Tracks, etc.)
-- =====================================================================

CREATE TABLE IF NOT EXISTS public.media_nodes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  canonical_id TEXT NOT NULL UNIQUE,
  media_type media_type NOT NULL,
  category media_category NOT NULL,
  
  -- Core metadata
  title TEXT NOT NULL,
  original_title TEXT,
  description TEXT,
  tagline TEXT,
  
  -- Temporal
  release_date DATE,
  release_year INTEGER,
  duration_seconds INTEGER,
  
  -- Media-specific
  season_number INTEGER,
  episode_number INTEGER,
  track_number INTEGER,
  disc_number INTEGER,
  chapter_number INTEGER,
  
  -- Ratings & Popularity
  content_rating content_rating,
  average_rating NUMERIC(3,1) CHECK (average_rating >= 0 AND average_rating <= 10),
  vote_count INTEGER DEFAULT 0,
  popularity_score NUMERIC(10,2) DEFAULT 0,
  
  -- Visual
  poster_url TEXT,
  backdrop_url TEXT,
  thumbnail_url TEXT,
  
  -- Audio-specific
  preview_url TEXT,
  waveform_data JSONB,
  
  -- External IDs
  imdb_id TEXT,
  tmdb_id INTEGER,
  spotify_id TEXT,
  apple_id TEXT,
  youtube_id TEXT,
  isrc TEXT,
  isbn TEXT,
  
  -- Graph
  parent_series_id UUID REFERENCES public.media_series(id) ON DELETE SET NULL,
  
  -- Embeddings (pgvector)
  embedding vector(1536),
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_synced_at TIMESTAMPTZ
);

-- =====================================================================
-- 4. MEDIA AVAILABILITY (Where content is available)
-- =====================================================================

CREATE TABLE IF NOT EXISTS public.media_availability (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  media_node_id UUID NOT NULL REFERENCES public.media_nodes(id) ON DELETE CASCADE,
  provider_id UUID NOT NULL REFERENCES public.media_providers(id) ON DELETE CASCADE,
  
  -- Provider-specific ID
  provider_content_id TEXT NOT NULL,
  
  -- Availability details
  availability_type availability_type NOT NULL,
  quality TEXT,
  regions TEXT[],
  
  -- Playback
  playback_url TEXT,
  embed_url TEXT,
  
  -- Pricing
  price_cents INTEGER,
  currency TEXT DEFAULT 'USD',
  
  -- Validity
  available_from TIMESTAMPTZ,
  available_until TIMESTAMPTZ,
  
  -- Verification
  last_verified_at TIMESTAMPTZ,
  is_verified BOOLEAN DEFAULT false,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(media_node_id, provider_id, provider_content_id)
);

-- =====================================================================
-- 5. MEDIA RELATIONSHIPS (Graph edges)
-- =====================================================================

CREATE TABLE IF NOT EXISTS public.media_relationships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  source_id UUID NOT NULL,
  source_type TEXT NOT NULL CHECK (source_type IN ('node', 'series')),
  target_id UUID NOT NULL,
  target_type TEXT NOT NULL CHECK (target_type IN ('node', 'series')),
  
  relationship_type relationship_type NOT NULL,
  
  -- Weight
  weight NUMERIC(3,2) DEFAULT 1.0 CHECK (weight >= 0 AND weight <= 1),
  
  -- Context
  metadata JSONB DEFAULT '{}',
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(source_id, target_id, relationship_type)
);

-- =====================================================================
-- 6. MEDIA TAGS (Genres, moods, eras, topics)
-- =====================================================================

CREATE TABLE IF NOT EXISTS public.media_tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  
  tag_type tag_type NOT NULL,
  
  -- Visual
  icon TEXT,
  color TEXT,
  
  -- Hierarchy
  parent_tag_id UUID REFERENCES public.media_tags(id) ON DELETE SET NULL,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================================
-- 7. MEDIA NODE TAGS (Many-to-many mapping)
-- =====================================================================

CREATE TABLE IF NOT EXISTS public.media_node_tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  media_node_id UUID NOT NULL REFERENCES public.media_nodes(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES public.media_tags(id) ON DELETE CASCADE,
  relevance NUMERIC(3,2) DEFAULT 1.0 CHECK (relevance >= 0 AND relevance <= 1),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(media_node_id, tag_id)
);

-- =====================================================================
-- 8. MEDIA PEOPLE (Cast, artists, creators)
-- =====================================================================

CREATE TABLE IF NOT EXISTS public.media_people (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  canonical_id TEXT NOT NULL UNIQUE,
  
  name TEXT NOT NULL,
  also_known_as TEXT[],
  
  -- Bio
  biography TEXT,
  birth_date DATE,
  death_date DATE,
  birth_place TEXT,
  
  -- Visual
  profile_image_url TEXT,
  
  -- External IDs
  imdb_id TEXT,
  tmdb_id INTEGER,
  spotify_id TEXT,
  
  -- Popularity
  popularity_score NUMERIC(10,2) DEFAULT 0,
  
  -- Embeddings
  embedding vector(1536),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================================
-- 9. MEDIA CREDITS (Person ↔ Media mapping)
-- =====================================================================

CREATE TABLE IF NOT EXISTS public.media_credits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  person_id UUID NOT NULL REFERENCES public.media_people(id) ON DELETE CASCADE,
  media_node_id UUID REFERENCES public.media_nodes(id) ON DELETE CASCADE,
  media_series_id UUID REFERENCES public.media_series(id) ON DELETE CASCADE,
  
  role credit_role NOT NULL,
  
  character_name TEXT,
  department TEXT,
  job TEXT,
  
  -- Ordering
  "order" INTEGER,
  is_primary BOOLEAN DEFAULT false,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Must have either node or series
  CONSTRAINT credit_target CHECK (
    (media_node_id IS NOT NULL AND media_series_id IS NULL) OR
    (media_node_id IS NULL AND media_series_id IS NOT NULL)
  )
);

-- =====================================================================
-- 10. USER MEDIA STATE (Progress/resume per node)
-- =====================================================================

CREATE TABLE IF NOT EXISTS public.user_media_state (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  media_node_id UUID NOT NULL REFERENCES public.media_nodes(id) ON DELETE CASCADE,
  
  -- Progress
  progress_seconds INTEGER DEFAULT 0,
  progress_percent NUMERIC(5,2) DEFAULT 0 CHECK (progress_percent >= 0 AND progress_percent <= 100),
  
  -- Status
  status media_status DEFAULT 'not_started',
  
  -- Completion
  completed_at TIMESTAMPTZ,
  completed_count INTEGER DEFAULT 0,
  
  -- Last interaction
  last_position_seconds INTEGER,
  last_played_at TIMESTAMPTZ,
  
  -- Device
  last_device TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, media_node_id)
);

-- =====================================================================
-- 11. USER WATCH EVENTS (Video telemetry)
-- =====================================================================

CREATE TABLE IF NOT EXISTS public.user_watch_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  media_node_id UUID NOT NULL REFERENCES public.media_nodes(id) ON DELETE CASCADE,
  
  -- Session
  session_id TEXT NOT NULL,
  started_at TIMESTAMPTZ NOT NULL,
  ended_at TIMESTAMPTZ,
  
  -- Duration
  duration_watched_seconds INTEGER DEFAULT 0,
  
  -- Positions
  start_position_seconds INTEGER DEFAULT 0,
  end_position_seconds INTEGER DEFAULT 0,
  
  -- Quality
  quality_level TEXT,
  
  -- Context
  device_type TEXT,
  player_type TEXT,
  
  -- Engagement
  paused_count INTEGER DEFAULT 0,
  seeked_count INTEGER DEFAULT 0,
  completed BOOLEAN DEFAULT false,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================================
-- 12. USER LISTEN EVENTS (Audio telemetry)
-- =====================================================================

CREATE TABLE IF NOT EXISTS public.user_listen_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  media_node_id UUID NOT NULL REFERENCES public.media_nodes(id) ON DELETE CASCADE,
  
  -- Session
  session_id TEXT NOT NULL,
  started_at TIMESTAMPTZ NOT NULL,
  ended_at TIMESTAMPTZ,
  
  -- Duration
  duration_listened_seconds INTEGER DEFAULT 0,
  
  -- Context
  source TEXT CHECK (source IN ('queue', 'playlist', 'album', 'radio', 'search', 'recommendation')),
  shuffle_mode BOOLEAN DEFAULT false,
  repeat_mode TEXT DEFAULT 'off' CHECK (repeat_mode IN ('off', 'track', 'all')),
  
  -- Device
  device_type TEXT,
  
  -- Engagement
  skipped BOOLEAN DEFAULT false,
  skip_position_seconds INTEGER,
  liked_during_play BOOLEAN DEFAULT false,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================================
-- 13. USER COLLECTIONS (Watchlists, favorites, playlists, queues)
-- =====================================================================

CREATE TABLE IF NOT EXISTS public.user_collections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  name TEXT NOT NULL,
  description TEXT,
  
  collection_type collection_type NOT NULL,
  media_category media_category,
  
  -- Visual
  cover_image_url TEXT,
  
  -- Privacy
  is_public BOOLEAN DEFAULT false,
  
  -- Smart collections
  is_smart BOOLEAN DEFAULT false,
  smart_rules JSONB,
  
  -- Stats
  item_count INTEGER DEFAULT 0,
  total_duration_seconds INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================================
-- 14. USER COLLECTION ITEMS
-- =====================================================================

CREATE TABLE IF NOT EXISTS public.user_collection_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  collection_id UUID NOT NULL REFERENCES public.user_collections(id) ON DELETE CASCADE,
  media_node_id UUID NOT NULL REFERENCES public.media_nodes(id) ON DELETE CASCADE,
  
  -- Ordering
  position INTEGER NOT NULL,
  
  -- Context
  added_by TEXT DEFAULT 'user' CHECK (added_by IN ('user', 'lucy', 'smart_rule')),
  note TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(collection_id, media_node_id)
);

-- =====================================================================
-- 15. USER RATINGS
-- =====================================================================

CREATE TABLE IF NOT EXISTS public.user_ratings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  media_node_id UUID REFERENCES public.media_nodes(id) ON DELETE CASCADE,
  media_series_id UUID REFERENCES public.media_series(id) ON DELETE CASCADE,
  
  -- Rating
  rating NUMERIC(3,1) NOT NULL CHECK (rating >= 1 AND rating <= 10),
  rating_type TEXT DEFAULT 'stars' CHECK (rating_type IN ('stars', 'thumbs', 'percentage')),
  
  -- Review
  review_text TEXT,
  contains_spoilers BOOLEAN DEFAULT false,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Must have either node or series
  CONSTRAINT rating_target CHECK (
    (media_node_id IS NOT NULL AND media_series_id IS NULL) OR
    (media_node_id IS NULL AND media_series_id IS NOT NULL)
  ),
  
  -- One rating per user per item
  UNIQUE(user_id, media_node_id),
  UNIQUE(user_id, media_series_id)
);

-- =====================================================================
-- 16. USER TASTE PROFILE (Derived + cached signals)
-- =====================================================================

CREATE TABLE IF NOT EXISTS public.user_taste_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Affinities (JSONB for flexibility)
  genre_scores JSONB DEFAULT '{}',
  mood_scores JSONB DEFAULT '{}',
  era_scores JSONB DEFAULT '{}',
  media_type_scores JSONB DEFAULT '{}',
  
  -- Top creators
  top_creators JSONB DEFAULT '[]',
  
  -- Temporal patterns
  preferred_watching_hours INTEGER[] DEFAULT '{}',
  preferred_listening_hours INTEGER[] DEFAULT '{}',
  weekend_preference NUMERIC(3,2) DEFAULT 0.5,
  
  -- Engagement metrics
  average_watch_completion NUMERIC(3,2) DEFAULT 0.5,
  average_listen_completion NUMERIC(3,2) DEFAULT 0.5,
  binge_tendency NUMERIC(3,2) DEFAULT 0.5,
  
  -- Discovery profile
  novelty_preference NUMERIC(3,2) DEFAULT 0.5,
  depth_preference NUMERIC(3,2) DEFAULT 0.5,
  
  -- Taste vector
  taste_embedding vector(256),
  
  -- Cache management
  last_computed_at TIMESTAMPTZ,
  computation_version INTEGER DEFAULT 1,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================================
-- 17. LUCY JOURNEYS (Curated multi-step sequences)
-- =====================================================================

CREATE TABLE IF NOT EXISTS public.lucy_journeys (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  title TEXT NOT NULL,
  description TEXT,
  
  -- Visual
  cover_image_url TEXT,
  gradient_colors TEXT[],
  
  -- Type
  journey_type journey_type NOT NULL,
  
  -- Cross-media
  media_categories media_category[] DEFAULT '{}',
  
  -- Mood/context
  moods TEXT[] DEFAULT '{}',
  best_time_of_day TEXT CHECK (best_time_of_day IN ('morning', 'afternoon', 'evening', 'late_night', 'any')),
  estimated_duration_minutes INTEGER,
  
  -- Steps (JSONB array)
  steps JSONB NOT NULL DEFAULT '[]',
  
  -- Discovery
  is_featured BOOLEAN DEFAULT false,
  popularity_score NUMERIC(10,2) DEFAULT 0,
  
  -- Creator
  created_by TEXT DEFAULT 'lucy' CHECK (created_by IN ('lucy', 'editorial', 'community')),
  curator_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================================
-- 18. MOOD DISCOVERY CONFIG
-- =====================================================================

CREATE TABLE IF NOT EXISTS public.mood_discovery_config (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  mood_slug TEXT NOT NULL UNIQUE,
  
  display_name TEXT NOT NULL,
  description TEXT,
  
  -- Visual
  icon TEXT,
  gradient_colors TEXT[] NOT NULL,
  background_image_url TEXT,
  
  -- Query configuration
  genre_weights JSONB DEFAULT '{}',
  tag_filters TEXT[] DEFAULT '{}',
  tempo_range JSONB,
  energy_range JSONB,
  
  -- Time affinity
  time_of_day_weights JSONB DEFAULT '{}',
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================================
-- 19. PROVIDER SYNC JOBS
-- =====================================================================

CREATE TABLE IF NOT EXISTS public.provider_sync_jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  provider_id UUID NOT NULL REFERENCES public.media_providers(id) ON DELETE CASCADE,
  
  job_type TEXT NOT NULL CHECK (job_type IN ('full', 'incremental', 'specific_ids')),
  
  -- Status
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed')),
  
  -- Progress
  total_items INTEGER,
  processed_items INTEGER DEFAULT 0,
  failed_items INTEGER DEFAULT 0,
  
  -- Timing
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  
  -- Errors
  error_log JSONB DEFAULT '[]',
  
  -- Filters
  filters JSONB DEFAULT '{}',
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================================
-- INDEXES
-- =====================================================================

-- Media Nodes
CREATE INDEX IF NOT EXISTS idx_media_nodes_canonical ON public.media_nodes(canonical_id);
CREATE INDEX IF NOT EXISTS idx_media_nodes_type ON public.media_nodes(media_type);
CREATE INDEX IF NOT EXISTS idx_media_nodes_category ON public.media_nodes(category);
CREATE INDEX IF NOT EXISTS idx_media_nodes_parent ON public.media_nodes(parent_series_id);
CREATE INDEX IF NOT EXISTS idx_media_nodes_tmdb ON public.media_nodes(tmdb_id) WHERE tmdb_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_media_nodes_spotify ON public.media_nodes(spotify_id) WHERE spotify_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_media_nodes_youtube ON public.media_nodes(youtube_id) WHERE youtube_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_media_nodes_popularity ON public.media_nodes(popularity_score DESC);
CREATE INDEX IF NOT EXISTS idx_media_nodes_release ON public.media_nodes(release_date DESC);
CREATE INDEX IF NOT EXISTS idx_media_nodes_title_search ON public.media_nodes USING gin(to_tsvector('english', title));

-- Media Series
CREATE INDEX IF NOT EXISTS idx_media_series_canonical ON public.media_series(canonical_id);
CREATE INDEX IF NOT EXISTS idx_media_series_type ON public.media_series(media_type);
CREATE INDEX IF NOT EXISTS idx_media_series_tmdb ON public.media_series(tmdb_id) WHERE tmdb_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_media_series_spotify ON public.media_series(spotify_id) WHERE spotify_id IS NOT NULL;

-- Media Availability
CREATE INDEX IF NOT EXISTS idx_availability_node ON public.media_availability(media_node_id);
CREATE INDEX IF NOT EXISTS idx_availability_provider ON public.media_availability(provider_id);
CREATE INDEX IF NOT EXISTS idx_availability_type ON public.media_availability(availability_type);
CREATE INDEX IF NOT EXISTS idx_availability_provider_id ON public.media_availability(provider_content_id);

-- Media Relationships
CREATE INDEX IF NOT EXISTS idx_relationships_source ON public.media_relationships(source_id);
CREATE INDEX IF NOT EXISTS idx_relationships_target ON public.media_relationships(target_id);
CREATE INDEX IF NOT EXISTS idx_relationships_type ON public.media_relationships(relationship_type);

-- Media Tags
CREATE INDEX IF NOT EXISTS idx_tags_type ON public.media_tags(tag_type);
CREATE INDEX IF NOT EXISTS idx_tags_slug ON public.media_tags(slug);

-- Media Node Tags
CREATE INDEX IF NOT EXISTS idx_node_tags_node ON public.media_node_tags(media_node_id);
CREATE INDEX IF NOT EXISTS idx_node_tags_tag ON public.media_node_tags(tag_id);

-- Media People
CREATE INDEX IF NOT EXISTS idx_people_canonical ON public.media_people(canonical_id);
CREATE INDEX IF NOT EXISTS idx_people_tmdb ON public.media_people(tmdb_id) WHERE tmdb_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_people_name_search ON public.media_people USING gin(to_tsvector('english', name));

-- Media Credits
CREATE INDEX IF NOT EXISTS idx_credits_person ON public.media_credits(person_id);
CREATE INDEX IF NOT EXISTS idx_credits_node ON public.media_credits(media_node_id);
CREATE INDEX IF NOT EXISTS idx_credits_series ON public.media_credits(media_series_id);
CREATE INDEX IF NOT EXISTS idx_credits_role ON public.media_credits(role);

-- User Media State
CREATE INDEX IF NOT EXISTS idx_user_state_user ON public.user_media_state(user_id);
CREATE INDEX IF NOT EXISTS idx_user_state_node ON public.user_media_state(media_node_id);
CREATE INDEX IF NOT EXISTS idx_user_state_status ON public.user_media_state(status);
CREATE INDEX IF NOT EXISTS idx_user_state_last_played ON public.user_media_state(user_id, last_played_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_state_in_progress ON public.user_media_state(user_id) 
  WHERE status = 'in_progress';

-- User Watch Events
CREATE INDEX IF NOT EXISTS idx_watch_events_user ON public.user_watch_events(user_id);
CREATE INDEX IF NOT EXISTS idx_watch_events_node ON public.user_watch_events(media_node_id);
CREATE INDEX IF NOT EXISTS idx_watch_events_session ON public.user_watch_events(session_id);
CREATE INDEX IF NOT EXISTS idx_watch_events_recent ON public.user_watch_events(user_id, started_at DESC);

-- User Listen Events
CREATE INDEX IF NOT EXISTS idx_listen_events_user ON public.user_listen_events(user_id);
CREATE INDEX IF NOT EXISTS idx_listen_events_node ON public.user_listen_events(media_node_id);
CREATE INDEX IF NOT EXISTS idx_listen_events_session ON public.user_listen_events(session_id);
CREATE INDEX IF NOT EXISTS idx_listen_events_recent ON public.user_listen_events(user_id, started_at DESC);

-- User Collections
CREATE INDEX IF NOT EXISTS idx_collections_user ON public.user_collections(user_id);
CREATE INDEX IF NOT EXISTS idx_collections_type ON public.user_collections(collection_type);
CREATE INDEX IF NOT EXISTS idx_collections_public ON public.user_collections(is_public) WHERE is_public = true;

-- User Collection Items
CREATE INDEX IF NOT EXISTS idx_collection_items_collection ON public.user_collection_items(collection_id);
CREATE INDEX IF NOT EXISTS idx_collection_items_node ON public.user_collection_items(media_node_id);
CREATE INDEX IF NOT EXISTS idx_collection_items_position ON public.user_collection_items(collection_id, position);

-- User Ratings
CREATE INDEX IF NOT EXISTS idx_ratings_user ON public.user_ratings(user_id);
CREATE INDEX IF NOT EXISTS idx_ratings_node ON public.user_ratings(media_node_id);
CREATE INDEX IF NOT EXISTS idx_ratings_series ON public.user_ratings(media_series_id);

-- User Taste Profiles
CREATE INDEX IF NOT EXISTS idx_taste_user ON public.user_taste_profiles(user_id);

-- Lucy Journeys
CREATE INDEX IF NOT EXISTS idx_journeys_type ON public.lucy_journeys(journey_type);
CREATE INDEX IF NOT EXISTS idx_journeys_featured ON public.lucy_journeys(is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_journeys_moods ON public.lucy_journeys USING gin(moods);

-- Vector indexes (pgvector)
CREATE INDEX IF NOT EXISTS idx_media_nodes_embedding ON public.media_nodes 
  USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
CREATE INDEX IF NOT EXISTS idx_media_series_embedding ON public.media_series 
  USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
CREATE INDEX IF NOT EXISTS idx_media_people_embedding ON public.media_people 
  USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
CREATE INDEX IF NOT EXISTS idx_taste_profile_embedding ON public.user_taste_profiles 
  USING ivfflat (taste_embedding vector_cosine_ops) WITH (lists = 50);

-- =====================================================================
-- ROW LEVEL SECURITY
-- =====================================================================

-- Media tables are public read, admin write
ALTER TABLE public.media_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_series ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_node_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_people ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lucy_journeys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mood_discovery_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.provider_sync_jobs ENABLE ROW LEVEL SECURITY;

-- User tables are user-isolated
ALTER TABLE public.user_media_state ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_watch_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_listen_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_collection_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_taste_profiles ENABLE ROW LEVEL SECURITY;

-- =====================================================================
-- RLS POLICIES - PUBLIC MEDIA TABLES (Read: all, Write: service role)
-- =====================================================================

-- media_providers
CREATE POLICY "Anyone can read providers" ON public.media_providers
  FOR SELECT USING (true);

CREATE POLICY "Service can manage providers" ON public.media_providers
  FOR ALL USING (auth.role() = 'service_role');

-- media_series
CREATE POLICY "Anyone can read series" ON public.media_series
  FOR SELECT USING (true);

CREATE POLICY "Service can manage series" ON public.media_series
  FOR ALL USING (auth.role() = 'service_role');

-- media_nodes
CREATE POLICY "Anyone can read nodes" ON public.media_nodes
  FOR SELECT USING (true);

CREATE POLICY "Service can manage nodes" ON public.media_nodes
  FOR ALL USING (auth.role() = 'service_role');

-- media_availability
CREATE POLICY "Anyone can read availability" ON public.media_availability
  FOR SELECT USING (true);

CREATE POLICY "Service can manage availability" ON public.media_availability
  FOR ALL USING (auth.role() = 'service_role');

-- media_relationships
CREATE POLICY "Anyone can read relationships" ON public.media_relationships
  FOR SELECT USING (true);

CREATE POLICY "Service can manage relationships" ON public.media_relationships
  FOR ALL USING (auth.role() = 'service_role');

-- media_tags
CREATE POLICY "Anyone can read tags" ON public.media_tags
  FOR SELECT USING (true);

CREATE POLICY "Service can manage tags" ON public.media_tags
  FOR ALL USING (auth.role() = 'service_role');

-- media_node_tags
CREATE POLICY "Anyone can read node tags" ON public.media_node_tags
  FOR SELECT USING (true);

CREATE POLICY "Service can manage node tags" ON public.media_node_tags
  FOR ALL USING (auth.role() = 'service_role');

-- media_people
CREATE POLICY "Anyone can read people" ON public.media_people
  FOR SELECT USING (true);

CREATE POLICY "Service can manage people" ON public.media_people
  FOR ALL USING (auth.role() = 'service_role');

-- media_credits
CREATE POLICY "Anyone can read credits" ON public.media_credits
  FOR SELECT USING (true);

CREATE POLICY "Service can manage credits" ON public.media_credits
  FOR ALL USING (auth.role() = 'service_role');

-- lucy_journeys
CREATE POLICY "Anyone can read journeys" ON public.lucy_journeys
  FOR SELECT USING (true);

CREATE POLICY "Service can manage journeys" ON public.lucy_journeys
  FOR ALL USING (auth.role() = 'service_role');

-- mood_discovery_config
CREATE POLICY "Anyone can read mood config" ON public.mood_discovery_config
  FOR SELECT USING (true);

CREATE POLICY "Service can manage mood config" ON public.mood_discovery_config
  FOR ALL USING (auth.role() = 'service_role');

-- provider_sync_jobs
CREATE POLICY "Service can manage sync jobs" ON public.provider_sync_jobs
  FOR ALL USING (auth.role() = 'service_role');

-- =====================================================================
-- RLS POLICIES - USER TABLES (User-isolated)
-- =====================================================================

-- user_media_state
CREATE POLICY "Users can view own media state" ON public.user_media_state
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own media state" ON public.user_media_state
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own media state" ON public.user_media_state
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own media state" ON public.user_media_state
  FOR DELETE USING (auth.uid() = user_id);

-- user_watch_events
CREATE POLICY "Users can view own watch events" ON public.user_watch_events
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own watch events" ON public.user_watch_events
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- user_listen_events
CREATE POLICY "Users can view own listen events" ON public.user_listen_events
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own listen events" ON public.user_listen_events
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- user_collections
CREATE POLICY "Users can view own collections" ON public.user_collections
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view public collections" ON public.user_collections
  FOR SELECT USING (is_public = true);

CREATE POLICY "Users can insert own collections" ON public.user_collections
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own collections" ON public.user_collections
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own collections" ON public.user_collections
  FOR DELETE USING (auth.uid() = user_id);

-- user_collection_items (access through collection ownership)
CREATE POLICY "Users can view own collection items" ON public.user_collection_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_collections c
      WHERE c.id = collection_id AND (c.user_id = auth.uid() OR c.is_public = true)
    )
  );

CREATE POLICY "Users can insert own collection items" ON public.user_collection_items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_collections c
      WHERE c.id = collection_id AND c.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own collection items" ON public.user_collection_items
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.user_collections c
      WHERE c.id = collection_id AND c.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own collection items" ON public.user_collection_items
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.user_collections c
      WHERE c.id = collection_id AND c.user_id = auth.uid()
    )
  );

-- user_ratings
CREATE POLICY "Users can view own ratings" ON public.user_ratings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own ratings" ON public.user_ratings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own ratings" ON public.user_ratings
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own ratings" ON public.user_ratings
  FOR DELETE USING (auth.uid() = user_id);

-- user_taste_profiles
CREATE POLICY "Users can view own taste profile" ON public.user_taste_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own taste profile" ON public.user_taste_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own taste profile" ON public.user_taste_profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- =====================================================================
-- TRIGGERS - updated_at
-- =====================================================================

-- Generic trigger function
CREATE OR REPLACE FUNCTION public.trigger_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.media_providers
  FOR EACH ROW EXECUTE FUNCTION public.trigger_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.media_series
  FOR EACH ROW EXECUTE FUNCTION public.trigger_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.media_nodes
  FOR EACH ROW EXECUTE FUNCTION public.trigger_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.media_availability
  FOR EACH ROW EXECUTE FUNCTION public.trigger_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.media_people
  FOR EACH ROW EXECUTE FUNCTION public.trigger_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.user_media_state
  FOR EACH ROW EXECUTE FUNCTION public.trigger_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.user_collections
  FOR EACH ROW EXECUTE FUNCTION public.trigger_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.user_ratings
  FOR EACH ROW EXECUTE FUNCTION public.trigger_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.user_taste_profiles
  FOR EACH ROW EXECUTE FUNCTION public.trigger_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.lucy_journeys
  FOR EACH ROW EXECUTE FUNCTION public.trigger_updated_at();

-- =====================================================================
-- TRIGGER - Collection item count
-- =====================================================================

CREATE OR REPLACE FUNCTION public.update_collection_item_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.user_collections
    SET item_count = item_count + 1
    WHERE id = NEW.collection_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.user_collections
    SET item_count = item_count - 1
    WHERE id = OLD.collection_id;
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_collection_count
  AFTER INSERT OR DELETE ON public.user_collection_items
  FOR EACH ROW EXECUTE FUNCTION public.update_collection_item_count();

-- =====================================================================
-- VIEWS
-- =====================================================================

-- Continue Watching View
CREATE OR REPLACE VIEW public.continue_watching AS
SELECT 
  ums.user_id,
  ums.media_node_id,
  ums.progress_seconds,
  ums.progress_percent,
  ums.last_played_at,
  mn.title,
  mn.media_type,
  mn.category,
  mn.thumbnail_url,
  mn.poster_url,
  mn.duration_seconds,
  mn.parent_series_id,
  ms.title AS series_title
FROM public.user_media_state ums
JOIN public.media_nodes mn ON ums.media_node_id = mn.id
LEFT JOIN public.media_series ms ON mn.parent_series_id = ms.id
WHERE ums.status = 'in_progress'
  AND mn.category = 'video'
  AND ums.progress_percent < 95
ORDER BY ums.last_played_at DESC;

-- Continue Listening View
CREATE OR REPLACE VIEW public.continue_listening AS
SELECT 
  ums.user_id,
  ums.media_node_id,
  ums.progress_seconds,
  ums.progress_percent,
  ums.last_played_at,
  mn.title,
  mn.media_type,
  mn.category,
  mn.thumbnail_url,
  mn.poster_url,
  mn.duration_seconds,
  mn.parent_series_id,
  ms.title AS series_title
FROM public.user_media_state ums
JOIN public.media_nodes mn ON ums.media_node_id = mn.id
LEFT JOIN public.media_series ms ON mn.parent_series_id = ms.id
WHERE ums.status = 'in_progress'
  AND mn.category = 'audio'
  AND ums.progress_percent < 95
ORDER BY ums.last_played_at DESC;

-- User Library View (All saved content)
CREATE OR REPLACE VIEW public.user_library AS
SELECT 
  c.user_id,
  c.id AS collection_id,
  c.name AS collection_name,
  c.collection_type,
  c.media_category,
  ci.media_node_id,
  ci.position,
  ci.added_by,
  ci.created_at AS added_at,
  mn.title,
  mn.media_type,
  mn.category,
  mn.thumbnail_url,
  mn.poster_url,
  mn.duration_seconds,
  ms.title AS series_title
FROM public.user_collections c
JOIN public.user_collection_items ci ON c.id = ci.collection_id
JOIN public.media_nodes mn ON ci.media_node_id = mn.id
LEFT JOIN public.media_series ms ON mn.parent_series_id = ms.id
ORDER BY c.user_id, c.collection_type, ci.position;

-- Popular Content View (for trending)
CREATE OR REPLACE VIEW public.trending_content AS
SELECT 
  mn.id,
  mn.title,
  mn.media_type,
  mn.category,
  mn.poster_url,
  mn.thumbnail_url,
  mn.popularity_score,
  mn.average_rating,
  mn.release_date,
  COUNT(DISTINCT uwe.user_id) AS recent_watch_count,
  COUNT(DISTINCT ule.user_id) AS recent_listen_count
FROM public.media_nodes mn
LEFT JOIN public.user_watch_events uwe ON mn.id = uwe.media_node_id 
  AND uwe.started_at > NOW() - INTERVAL '7 days'
LEFT JOIN public.user_listen_events ule ON mn.id = ule.media_node_id 
  AND ule.started_at > NOW() - INTERVAL '7 days'
GROUP BY mn.id
ORDER BY (COALESCE(recent_watch_count, 0) + COALESCE(recent_listen_count, 0)) DESC,
         mn.popularity_score DESC;

-- =====================================================================
-- FUNCTIONS
-- =====================================================================

-- Get or create user taste profile
CREATE OR REPLACE FUNCTION public.get_or_create_taste_profile(p_user_id UUID)
RETURNS public.user_taste_profiles
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  profile public.user_taste_profiles;
BEGIN
  SELECT * INTO profile FROM public.user_taste_profiles WHERE user_id = p_user_id;
  
  IF NOT FOUND THEN
    INSERT INTO public.user_taste_profiles (user_id)
    VALUES (p_user_id)
    RETURNING * INTO profile;
  END IF;
  
  RETURN profile;
END;
$$;

-- Upsert media state
CREATE OR REPLACE FUNCTION public.upsert_media_state(
  p_user_id UUID,
  p_media_node_id UUID,
  p_progress_seconds INTEGER,
  p_progress_percent NUMERIC,
  p_status media_status DEFAULT 'in_progress',
  p_device TEXT DEFAULT NULL
)
RETURNS public.user_media_state
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result public.user_media_state;
BEGIN
  INSERT INTO public.user_media_state (
    user_id, media_node_id, progress_seconds, progress_percent, status, 
    last_position_seconds, last_played_at, last_device
  ) VALUES (
    p_user_id, p_media_node_id, p_progress_seconds, p_progress_percent, p_status,
    p_progress_seconds, NOW(), p_device
  )
  ON CONFLICT (user_id, media_node_id) DO UPDATE SET
    progress_seconds = EXCLUDED.progress_seconds,
    progress_percent = EXCLUDED.progress_percent,
    status = EXCLUDED.status,
    last_position_seconds = EXCLUDED.progress_seconds,
    last_played_at = NOW(),
    last_device = COALESCE(EXCLUDED.last_device, user_media_state.last_device),
    completed_at = CASE 
      WHEN EXCLUDED.status = 'completed' THEN NOW() 
      ELSE user_media_state.completed_at 
    END,
    completed_count = CASE 
      WHEN EXCLUDED.status = 'completed' THEN user_media_state.completed_count + 1
      ELSE user_media_state.completed_count
    END
  RETURNING * INTO result;
  
  RETURN result;
END;
$$;

-- Get recommendations by genre (basic)
CREATE OR REPLACE FUNCTION public.get_recommendations_by_genre(
  p_user_id UUID,
  p_limit INTEGER DEFAULT 20
)
RETURNS TABLE (
  node_id UUID,
  title TEXT,
  media_type media_type,
  poster_url TEXT,
  score NUMERIC,
  reason TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  WITH user_genres AS (
    -- Get user's preferred genres from watch/listen history
    SELECT mt.tag_id, COUNT(*) AS watch_count
    FROM public.user_watch_events uwe
    JOIN public.media_node_tags mt ON uwe.media_node_id = mt.media_node_id
    WHERE uwe.user_id = p_user_id
      AND uwe.started_at > NOW() - INTERVAL '90 days'
    GROUP BY mt.tag_id
    UNION ALL
    SELECT mt.tag_id, COUNT(*) AS listen_count
    FROM public.user_listen_events ule
    JOIN public.media_node_tags mt ON ule.media_node_id = mt.media_node_id
    WHERE ule.user_id = p_user_id
      AND ule.started_at > NOW() - INTERVAL '90 days'
    GROUP BY mt.tag_id
  ),
  genre_scores AS (
    SELECT tag_id, SUM(watch_count) AS total_count
    FROM user_genres
    GROUP BY tag_id
    ORDER BY total_count DESC
    LIMIT 10
  ),
  watched_nodes AS (
    SELECT DISTINCT media_node_id
    FROM public.user_media_state
    WHERE user_id = p_user_id
  )
  SELECT 
    mn.id AS node_id,
    mn.title,
    mn.media_type,
    mn.poster_url,
    (gs.total_count * mt.relevance)::NUMERIC AS score,
    t.name || ' lover' AS reason
  FROM public.media_nodes mn
  JOIN public.media_node_tags mt ON mn.id = mt.media_node_id
  JOIN genre_scores gs ON mt.tag_id = gs.tag_id
  JOIN public.media_tags t ON mt.tag_id = t.id
  WHERE mn.id NOT IN (SELECT media_node_id FROM watched_nodes)
  ORDER BY score DESC, mn.popularity_score DESC
  LIMIT p_limit;
END;
$$;

-- Semantic search for media
CREATE OR REPLACE FUNCTION public.search_media_semantic(
  p_query_embedding vector(1536),
  p_media_type media_type DEFAULT NULL,
  p_category media_category DEFAULT NULL,
  p_limit INTEGER DEFAULT 20
)
RETURNS TABLE (
  node_id UUID,
  title TEXT,
  media_type media_type,
  category media_category,
  poster_url TEXT,
  similarity NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    mn.id AS node_id,
    mn.title,
    mn.media_type,
    mn.category,
    mn.poster_url,
    (1 - (mn.embedding <=> p_query_embedding))::NUMERIC AS similarity
  FROM public.media_nodes mn
  WHERE mn.embedding IS NOT NULL
    AND (p_media_type IS NULL OR mn.media_type = p_media_type)
    AND (p_category IS NULL OR mn.category = p_category)
  ORDER BY mn.embedding <=> p_query_embedding
  LIMIT p_limit;
END;
$$;

-- =====================================================================
-- SEED DATA - Providers
-- =====================================================================

INSERT INTO public.media_providers (name, provider_type, supports_playback, requires_auth, priority) VALUES
  ('TMDB', 'tmdb', false, false, 100),
  ('YouTube', 'youtube', true, false, 90),
  ('Spotify', 'spotify', true, true, 95),
  ('Apple Music', 'apple_music', true, true, 85),
  ('SoundCloud', 'soundcloud', true, false, 70),
  ('RSS Podcasts', 'rss_podcast', true, false, 80),
  ('LibriVox', 'librivox', true, false, 60),
  ('Internet Archive', 'archive_org', true, false, 65),
  ('Pluto TV', 'pluto_tv', true, false, 75),
  ('Tubi', 'tubi', true, false, 72),
  ('Plex Free', 'plex_free', true, false, 68),
  ('Vimeo', 'vimeo', true, false, 55),
  ('Twitch', 'twitch', true, true, 50)
ON CONFLICT (name) DO NOTHING;

-- =====================================================================
-- SEED DATA - Default Mood Configs
-- =====================================================================

INSERT INTO public.mood_discovery_config (mood_slug, display_name, description, gradient_colors, genre_weights, time_of_day_weights) VALUES
  ('focus', 'Deep Focus', 'Minimal distractions, maximum concentration', ARRAY['#1a1a2e', '#16213e'], 
   '{"ambient": 0.9, "classical": 0.8, "lofi": 0.85, "instrumental": 0.95}',
   '{"morning": 0.8, "afternoon": 0.9, "evening": 0.6, "late_night": 0.4}'),
  
  ('chill', 'Chill Vibes', 'Relaxed and easygoing', ARRAY['#2d3436', '#636e72'],
   '{"rnb": 0.9, "lofi": 0.85, "jazz": 0.7, "soul": 0.8}',
   '{"morning": 0.5, "afternoon": 0.6, "evening": 0.9, "late_night": 0.95}'),
  
  ('hype', 'High Energy', 'Get pumped and motivated', ARRAY['#e74c3c', '#c0392b'],
   '{"hip-hop": 0.95, "electronic": 0.9, "rock": 0.85, "pop": 0.7}',
   '{"morning": 0.7, "afternoon": 0.9, "evening": 0.8, "late_night": 0.5}'),
  
  ('romance', 'Romantic', 'Love and intimacy', ARRAY['#e91e63', '#9c27b0'],
   '{"rnb": 0.95, "soul": 0.9, "jazz": 0.8, "acoustic": 0.7, "romance": 0.95}',
   '{"morning": 0.3, "afternoon": 0.4, "evening": 0.9, "late_night": 0.95}'),
  
  ('nostalgia', 'Nostalgic', 'Take a trip down memory lane', ARRAY['#f39c12', '#d68910'],
   '{"80s": 0.9, "90s": 0.9, "classic-rock": 0.8, "oldies": 0.85}',
   '{"morning": 0.6, "afternoon": 0.7, "evening": 0.8, "late_night": 0.7}'),
  
  ('late_night', 'Late Night', 'For the night owls', ARRAY['#0c0c1e', '#1a1a3e'],
   '{"ambient": 0.9, "lofi": 0.85, "rnb": 0.8, "jazz": 0.75, "electronic": 0.6}',
   '{"morning": 0.1, "afternoon": 0.2, "evening": 0.6, "late_night": 0.95}')
ON CONFLICT (mood_slug) DO NOTHING;

-- =====================================================================
-- SEED DATA - Core Tags
-- =====================================================================

INSERT INTO public.media_tags (name, slug, tag_type) VALUES
  -- Genres - Video
  ('Action', 'action', 'genre'),
  ('Comedy', 'comedy', 'genre'),
  ('Drama', 'drama', 'genre'),
  ('Horror', 'horror', 'genre'),
  ('Thriller', 'thriller', 'genre'),
  ('Romance', 'romance', 'genre'),
  ('Sci-Fi', 'sci-fi', 'genre'),
  ('Fantasy', 'fantasy', 'genre'),
  ('Documentary', 'documentary', 'genre'),
  ('Animation', 'animation', 'genre'),
  ('Crime', 'crime', 'genre'),
  ('Mystery', 'mystery', 'genre'),
  
  -- Genres - Music
  ('Hip-Hop', 'hip-hop', 'genre'),
  ('R&B', 'rnb', 'genre'),
  ('Pop', 'pop', 'genre'),
  ('Rock', 'rock', 'genre'),
  ('Electronic', 'electronic', 'genre'),
  ('Jazz', 'jazz', 'genre'),
  ('Classical', 'classical', 'genre'),
  ('Lo-Fi', 'lofi', 'genre'),
  ('Ambient', 'ambient', 'genre'),
  ('Soul', 'soul', 'genre'),
  ('Country', 'country', 'genre'),
  ('Reggae', 'reggae', 'genre'),
  ('Metal', 'metal', 'genre'),
  ('Indie', 'indie', 'genre'),
  
  -- Moods
  ('Chill', 'chill', 'mood'),
  ('Energetic', 'energetic', 'mood'),
  ('Melancholic', 'melancholic', 'mood'),
  ('Uplifting', 'uplifting', 'mood'),
  ('Dark', 'dark', 'mood'),
  ('Romantic', 'romantic', 'mood'),
  ('Intense', 'intense', 'mood'),
  ('Peaceful', 'peaceful', 'mood'),
  ('Nostalgic', 'nostalgic', 'mood'),
  ('Motivational', 'motivational', 'mood'),
  
  -- Eras
  ('60s', '60s', 'era'),
  ('70s', '70s', 'era'),
  ('80s', '80s', 'era'),
  ('90s', '90s', 'era'),
  ('2000s', '2000s', 'era'),
  ('2010s', '2010s', 'era'),
  ('2020s', '2020s', 'era'),
  
  -- Languages
  ('English', 'english', 'language'),
  ('Spanish', 'spanish', 'language'),
  ('French', 'french', 'language'),
  ('Korean', 'korean', 'language'),
  ('Japanese', 'japanese', 'language'),
  ('Hindi', 'hindi', 'language'),
  
  -- Themes
  ('Coming of Age', 'coming-of-age', 'theme'),
  ('Family', 'family', 'theme'),
  ('Friendship', 'friendship', 'theme'),
  ('Revenge', 'revenge', 'theme'),
  ('Survival', 'survival', 'theme'),
  ('Love', 'love', 'theme'),
  ('Identity', 'identity', 'theme'),
  ('Power', 'power', 'theme')
ON CONFLICT (slug) DO NOTHING;

-- =====================================================================
-- MIGRATION COMPLETE
-- =====================================================================
