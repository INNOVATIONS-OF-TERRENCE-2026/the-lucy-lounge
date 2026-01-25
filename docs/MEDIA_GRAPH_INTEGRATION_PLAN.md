# =============================================================================
# THE LUCY LOUNGE - UNIVERSAL MEDIA GRAPH INTEGRATION PLAN
# =============================================================================
# Step-by-step implementation guide for the Media Intelligence Layer
# =============================================================================

## 🎯 OVERVIEW

This document outlines the complete integration plan for transforming The Lucy
Lounge into a **UNIVERSAL MEDIA INTELLIGENCE PLATFORM**. The goal: Media /
Listening / Explore feel "UNLIMITED" while Lucy tracks user taste across ALL
media types.

---

## 📦 DELIVERABLES COMPLETED

### 1. TypeScript Type System (`src/media/types/index.ts`)
- ✅ 14 media types (movie, tv_show, podcast, audiobook, music, etc.)
- ✅ MediaNode, MediaSeries, MediaProvider entities
- ✅ UserMediaState, UserTasteProfile for personalization
- ✅ LucyJourney, MoodDiscoveryConfig for exploration
- ✅ ~600 lines of comprehensive type definitions

### 2. SQL Migration (`supabase/migrations/20260125000000_universal_media_graph.sql`)
- ✅ 19 tables with complete schema
- ✅ 10 custom ENUMs for type safety
- ✅ Full-text search + pgvector indexes
- ✅ Row Level Security (RLS) on all tables
- ✅ 4 materialized views (continue_watching, continue_listening, etc.)
- ✅ Helper functions (get_or_create_taste_profile, search_media_semantic)
- ✅ Seed data: 13 providers, 6 moods, ~60 tags
- ✅ ~1500 lines of production-ready SQL

### 3. Provider Adapters (`src/media/providers/`)
- ✅ Base ProviderAdapter interface + utilities
- ✅ TMDB adapter (movies, TV shows)
- ✅ YouTube adapter (videos, FAST channels)
- ✅ RSS Podcast adapter (with curated list)
- ✅ Spotify adapter (music, playlists)
- ✅ Public Domain adapter (Archive.org, LibriVox)
- ✅ Provider registry with helpers

### 4. Recommendation Engine (`src/media/engine/`)
- ✅ Hybrid scoring model (explicit + implicit signals)
- ✅ Candidate generation from multiple sources
- ✅ Diversity re-ranking (MMR approach)
- ✅ Cold start strategy with taste quiz
- ✅ Semantic similarity via pgvector embeddings
- ✅ Taste vector computation and storage

### 5. Media Graph Client (`src/media/client/`)
- ✅ CRUD operations for all entities
- ✅ Content ingestion with deduplication
- ✅ Canonical ID generation and normalization
- ✅ Availability tracking across providers
- ✅ Batch operations for bulk ingestion
- ✅ Provider sync job management

### 6. UX Row Definitions (`src/media/ux/`)
- ✅ Home page row configurations
- ✅ Media Mode (video) row definitions
- ✅ Listening Mode (audio) row definitions
- ✅ Explore Mode row definitions
- ✅ Time-based rows (morning, evening, etc.)
- ✅ "Because you watched..." row generator
- ✅ Layout configurations for each row type
- ✅ Row data loader with caching

---

## 🚀 INTEGRATION STEPS

### Phase 1: Database Migration (Day 1)

```bash
# 1. Review migration file
cat supabase/migrations/20260125000000_universal_media_graph.sql

# 2. Apply migration to development
supabase db push

# 3. Verify tables created
supabase db dump --schema public | grep CREATE

# 4. Run seed data verification
SELECT COUNT(*) FROM media_providers;
SELECT COUNT(*) FROM media_tags;
SELECT COUNT(*) FROM mood_discovery_config;
```

**Checklist:**
- [ ] Migration applied without errors
- [ ] All 19 tables created
- [ ] RLS policies active
- [ ] Seed data present
- [ ] pgvector extension enabled

### Phase 2: Edge Functions (Day 2)

Create these Supabase Edge Functions:

```typescript
// supabase/functions/generate-embedding/index.ts
// Uses OpenAI text-embedding-3-small

// supabase/functions/generate-embedding-batch/index.ts
// Batch processing for content ingestion

// supabase/functions/content-sync/index.ts
// Scheduled content ingestion from providers
```

**Checklist:**
- [ ] `generate-embedding` function deployed
- [ ] `generate-embedding-batch` function deployed
- [ ] `content-sync` function deployed
- [ ] API keys configured in Supabase secrets

### Phase 3: Initial Content Ingestion (Day 3-4)

```typescript
// Run from development console or Edge Function
import { createIngestionPipeline } from '@/media/client';

const pipeline = createIngestionPipeline({
  providers: ['tmdb', 'youtube', 'rss_podcast', 'archive_org', 'librivox'],
  maxItemsPerProvider: 500,
  batchSize: 100,
});

// Full ingestion
const result = await pipeline.runFullIngestion();
console.log('Ingestion complete:', result);
```

**Checklist:**
- [ ] TMDB content ingested (movies, TV)
- [ ] YouTube content ingested (videos, channels)
- [ ] Podcast feeds ingested
- [ ] Archive.org content ingested
- [ ] LibriVox audiobooks ingested
- [ ] Embeddings generated for all content

### Phase 4: UI Integration (Day 5-7)

#### Update Media Mode Page

```typescript
// src/pages/Media.tsx
import { 
  MEDIA_MODE_ROW_DEFINITIONS,
  createRowDataLoader,
  getTimeBasedRows,
} from '@/media';

function MediaPage() {
  const { user } = useAuth();
  const loader = createRowDataLoader(user?.id || 'anonymous');
  
  // Combine static and time-based rows
  const rowConfigs = [
    ...MEDIA_MODE_ROW_DEFINITIONS,
    ...getTimeBasedRows().filter(r => r.category === 'video'),
  ].sort((a, b) => (a.priority || 99) - (b.priority || 99));
  
  // Load row data
  const [rows, setRows] = useState<LoadedRow[]>([]);
  
  useEffect(() => {
    loader.loadRows(rowConfigs).then(setRows);
  }, [user?.id]);
  
  return (
    <div className="space-y-8">
      {rows.map(row => (
        <MediaRow key={row.config.id} row={row} />
      ))}
    </div>
  );
}
```

#### Update Listening Mode Page

```typescript
// src/pages/ListeningMode.tsx
import { 
  LISTENING_MODE_ROW_DEFINITIONS,
  createRowDataLoader,
} from '@/media';

// Similar pattern to Media Mode
```

#### Update Explore Page

```typescript
// src/pages/ListeningExplore.tsx
import { 
  EXPLORE_MODE_ROW_DEFINITIONS,
  createRowDataLoader,
} from '@/media';

// Include Lucy Journeys rendering
```

**Checklist:**
- [ ] Media Mode renders new rows
- [ ] Listening Mode renders new rows
- [ ] Explore Mode renders journeys
- [ ] Continue watching/listening working
- [ ] Time-based rows display correctly

### Phase 5: Recommendation Integration (Day 8-9)

```typescript
// Hook for recommendation engine
function useRecommendations(category?: MediaCategory) {
  const { user } = useAuth();
  const [recs, setRecs] = useState<RecommendationRow[]>([]);
  
  useEffect(() => {
    if (!user) return;
    
    const engine = createUnifiedEngine(user.id);
    engine.getRecommendations({ category }).then(setRecs);
  }, [user?.id, category]);
  
  return recs;
}
```

**Checklist:**
- [ ] Recommendations displaying
- [ ] "Because you watched" rows appear
- [ ] Cold start quiz for new users
- [ ] Taste profile updating on interactions

### Phase 6: User Event Tracking (Day 10)

```typescript
// Track watch events
async function trackWatchProgress(nodeId: string, progress: number) {
  await supabase.rpc('upsert_media_state', {
    p_user_id: user.id,
    p_media_node_id: nodeId,
    p_progress_seconds: progress,
  });
}

// Track listen events
async function trackListenProgress(nodeId: string, progress: number) {
  // Similar pattern
}

// Track ratings
async function trackRating(nodeId: string, rating: number) {
  await supabase.from('user_ratings').upsert({
    user_id: user.id,
    media_node_id: nodeId,
    rating,
  });
  
  // Update taste profile
  const engine = createUnifiedEngine(user.id);
  await engine.updateTasteProfile({ /* derived from rating */ });
}
```

**Checklist:**
- [ ] Watch progress syncing
- [ ] Listen progress syncing
- [ ] Ratings captured
- [ ] Favorites/collections working
- [ ] Taste profile updates in real-time

### Phase 7: Scheduled Sync Jobs (Day 11)

```typescript
// Supabase scheduled function (pg_cron or external)
// Run every 4 hours for incremental sync
const incrementalJob = createSyncJob('incremental', {
  providers: ['tmdb', 'youtube', 'rss_podcast'],
  maxItemsPerProvider: 100,
});

// Run weekly for full sync
const fullJob = createSyncJob('full', {
  maxItemsPerProvider: 500,
});
```

**Checklist:**
- [ ] Incremental sync scheduled (every 4h)
- [ ] Full sync scheduled (weekly)
- [ ] Sync job monitoring in place
- [ ] Error alerting configured

---

## 📱 iOS SAFARI QA CHECKLIST

**Critical Priority** (must pass before launch):

### Video Playback
- [ ] Embedded YouTube videos play without user gesture issues
- [ ] Archive.org video plays inline (not fullscreen forced)
- [ ] Progress tracking works across browser sessions
- [ ] Picture-in-Picture functions correctly

### Audio Playback
- [ ] Audio plays after user interaction (iOS audio policy)
- [ ] Background audio continues when app is backgrounded
- [ ] Lock screen controls display correctly
- [ ] Audio ducking works with notifications

### Performance
- [ ] Infinite scroll doesn't cause memory issues
- [ ] Images lazy load correctly
- [ ] No layout shift on row loading
- [ ] Smooth 60fps scrolling on all row types

### PWA
- [ ] App installs to home screen
- [ ] Offline mode shows appropriate content
- [ ] Push notifications work (if applicable)
- [ ] Share sheet functions correctly

### Touch
- [ ] Swipe gestures work on carousels
- [ ] Touch targets are 44x44pt minimum
- [ ] No accidental taps on dense layouts
- [ ] Pull-to-refresh works

---

## 🏗️ FILE STRUCTURE

```
src/media/
├── index.ts                    # Main exports
├── types/
│   └── index.ts               # TypeScript type definitions
├── providers/
│   ├── index.ts               # Provider registry
│   ├── ProviderAdapter.ts     # Base interface
│   ├── tmdbAdapter.ts         # TMDB integration
│   ├── youtubeAdapter.ts      # YouTube/FAST channels
│   ├── rssPodcastAdapter.ts   # RSS podcast feeds
│   ├── spotifyAdapter.ts      # Spotify integration
│   └── publicDomainAdapter.ts # Archive.org/LibriVox
├── engine/
│   ├── index.ts               # Engine exports
│   ├── recommendationEngine.ts# Main recommendation logic
│   ├── coldStartStrategy.ts   # New user handling
│   └── semanticSimilarity.ts  # pgvector search
├── client/
│   ├── index.ts               # Client exports
│   ├── MediaGraphClient.ts    # Graph operations
│   └── IngestionPipeline.ts   # Content ingestion
└── ux/
    ├── index.ts               # UX exports
    ├── rowDefinitions.ts      # Row configurations
    └── rowDataLoader.ts       # Data loading

supabase/migrations/
└── 20260125000000_universal_media_graph.sql  # Database schema
```

---

## 🎨 DESIGN PRINCIPLES

### "Netflix-level UX without being a clone"

1. **Lucy's Personality**: Rows should feel curated BY Lucy, not just algorithmic
2. **Journey-First**: Encourage exploration paths, not just single items
3. **Mood-Aware**: Time-of-day and contextual recommendations
4. **Cross-Media**: Soundtrack relationships, adaptations, etc.
5. **Progressive Disclosure**: Start simple, reveal depth on engagement

### Defensible Value

1. **Taste Graph**: Deep understanding across ALL media types
2. **Memory**: Lucy remembers preferences long-term
3. **Journeys**: Curated multi-step experiences unique to Lucy
4. **Relationships**: Graph connections no single provider has

---

## 🔄 MAINTENANCE

### Weekly Tasks
- Review sync job success rates
- Check embedding backfill progress
- Monitor recommendation diversity metrics

### Monthly Tasks
- Refresh trending content weights
- Update FAST channel list
- Review cold start quiz effectiveness
- Analyze taste profile clustering

### Quarterly Tasks
- Full provider adapter audit
- Schema optimization review
- Embedding model evaluation
- UX row A/B test analysis

---

## 🚨 TROUBLESHOOTING

### "No recommendations showing"
1. Check if user has any watch/listen events
2. Verify cold start engine is triggered for new users
3. Check taste profile exists in database
4. Review console for API errors

### "Embeddings not generating"
1. Verify OpenAI API key in Supabase secrets
2. Check Edge Function logs
3. Confirm pgvector extension is enabled
4. Try manual embedding generation

### "Sync job failing"
1. Check provider API keys are valid
2. Review rate limit headers in responses
3. Check for schema migrations needed
4. Verify network connectivity

---

## ✅ LAUNCH READINESS

Before going live:

- [ ] All migrations applied to production
- [ ] Edge Functions deployed
- [ ] Initial content ingestion complete (>10k items)
- [ ] Embeddings generated (>90% coverage)
- [ ] All iOS Safari tests passing
- [ ] Performance benchmarks met (<100ms row render)
- [ ] Error monitoring configured
- [ ] Rollback plan documented

---

*Document version: 1.0*
*Last updated: January 2025*
*Created by: Lucy Engineering Team*
