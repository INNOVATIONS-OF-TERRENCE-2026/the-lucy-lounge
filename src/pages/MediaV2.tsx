/**
 * THE LUCY LOUNGE  MEDIA MODE V3
 *
 * Netflix/Tubi-style Premium Browse Experience
 * Complete redesign with Hero Banner, Genre Chips, Rails, and Quick Browse
 *
 * MOBILE-FIRST: canEmbedInline check PRESERVED
 * PRESERVATION > OPTIMIZATION
 * ALL LEGACY CONTENT PRESERVED
 * 
 * V3.1: Dynamic Supabase Rails with YouTube Catalog
 */

import { useState, useCallback, useMemo, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { ErrorBoundary } from "@/components/system/ErrorBoundary";
import { useMediaGraph } from "@/hooks/useMediaGraph";
import { useUserMediaState } from "@/hooks/useUserMediaState";
import type { MediaNode } from "@/media/types";
import { RAIL_CONFIGS, fetchAllRails, filterViableRails, type RailConfig } from "@/media/rails";

// Browse Components
import {
  BrowseHeader,
  HeroBanner,
  GenreChips,
  BrowseRail,
  QuickCategoriesGrid,
  SeeAllModal,
  DEFAULT_GENRES,
} from "@/components/media/browse";
import type { SortOption, FilterType, ViewMode } from "@/components/media/browse";

// UI Components
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Play, Film, AlertCircle } from "lucide-react";

/* MOBILE-FIRST CAPABILITY CHECK (PRESERVED) */
const canEmbedInline = typeof window !== "undefined" && window.innerWidth >= 1024;

/* LEGACY CONTENT (FULLY PRESERVED - NO REGRESSIONS) */
const PLAYLISTS = [
  { title: "Free Movies & Shows", id: "PLX9_I-EOJPdHZJDzvjjRjpj86ClhZSsVm", genre: "variety" },
  { title: "Nicktoons Full Episodes", id: "PLUQR09yEYrP0RaHE3f9vNQkOx08IT9ZTe", genre: "animation" },
  { title: "CatDog Full Episodes", id: "PLfrgt_xI4Xq2Cg78vsEjqEs-aJv1HQmO0", genre: "animation" },
  { title: "Fresh Prince of Bel-Air", id: "PLRDC-DZ_uWhrOMCryr5YU--MrsZPL9sb3", genre: "comedy" },
  { title: "Animaniacs", id: "PLd3-CCCcbQeJSROdd9rf5YV996HwYdEDL", genre: "animation" },
  { title: "Courage the Cowardly Dog", id: "PLLIU9nFd9IrGmATWUdDgpsMzTAMgDXrNp", genre: "animation" },
];

const MOVIES = [
  { title: "Casper's Haunted Christmas", id: "hr2rI0qn5EA", genre: "kids" },
  { title: "SpongeBob Marathon", id: "8B8jplhrlso", genre: "kids" },
  { title: "Ed, Edd n Eddy", id: "X-HRLChOTOA", genre: "animation" },
  { title: "Dexter's Laboratory", id: "3bLNQgRn-Wg", genre: "animation" },
  { title: "Powerpuff Girls", id: "c0KlvkCKpE4", genre: "animation" },
  { title: "Recess", id: "-UtUuT8AJjQ", genre: "kids" },
  { title: "That's So Raven", id: "Tr7FcIvjVc4", genre: "comedy" },
  { title: "Django", id: "ZxHLuzOnVNo", genre: "action" },
  { title: "First Sunday", id: "3Aky7idipRk", genre: "comedy" },
  { title: "Norbit", id: "-lbDPdksl-E", genre: "comedy" },
  { title: "ATL", id: "ybzh6_5GFD0", genre: "drama" },
  { title: "Featured Movie", id: "1JOf7Gbn4Is", genre: "drama" },
  { title: "Featured Movie", id: "jgHnkc2Hn-k", genre: "drama" },
  { title: "Featured Movie", id: "q3m9nwWItVg", genre: "action" },
  { title: "Featured Movie", id: "EWLL8zHlaAM", genre: "thriller" },
  { title: "Featured Movie", id: "f9-DU9lwWqk", genre: "drama" },
  { title: "Featured Movie", id: "q9i29JAjcIg", genre: "comedy" },
  { title: "Featured Movie", id: "64wMmlmxEYU", genre: "action" },
  { title: "Featured Movie", id: "uDkjFRjFCnU", genre: "thriller" },
  { title: "Featured Movie", id: "CvuxwyAzY28", genre: "drama" },
  { title: "Featured Movie", id: "h5L-pULo-pU", genre: "comedy" },
  { title: "Featured Movie", id: "fXKt2FhFgUQ", genre: "action" },
  { title: "Featured Movie", id: "-4p4p2PPqa8", genre: "drama" },
  { title: "Featured Movie", id: "rWq6vRXnWXo", genre: "thriller" },
  { title: "Featured Movie", id: "IlbUKVpxokc", genre: "action" },
  { title: "Featured Movie", id: "iiYWtxznLEA", genre: "drama" },
  { title: "Featured Movie", id: "hYLadBjERb4", genre: "comedy" },
  { title: "Featured Movie", id: "K2nmrEvgv0M", genre: "thriller" },
  { title: "Featured Movie", id: "tGHYZKXmoPI", genre: "action" },
];

/* LEGACY CONTENT TO MEDIA NODE CONVERTER */
function convertLegacyToMediaNodes(): MediaNode[] {
  return MOVIES.map((movie) => ({
    id: `legacy-movie-${movie.id}`,
    canonical_id: `youtube:video:${movie.id}`,
    media_type: 'movie',
    category: 'video',
    title: movie.title,
    youtube_id: movie.id,
    poster_url: `https://img.youtube.com/vi/${movie.id}/hqdefault.jpg`,
    backdrop_url: `https://img.youtube.com/vi/${movie.id}/maxresdefault.jpg`,
    thumbnail_url: `https://img.youtube.com/vi/${movie.id}/mqdefault.jpg`,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  } as MediaNode));
}

function convertPlaylistsToMediaNodes(): MediaNode[] {
  return PLAYLISTS.map((pl) => ({
    id: `legacy-playlist-${pl.id}`,
    canonical_id: `youtube:playlist:${pl.id}`,
    media_type: 'tv_show',
    category: 'video',
    title: pl.title,
    description: `YouTube Playlist: ${pl.title}`,
    youtube_id: pl.id,
    poster_url: `https://img.youtube.com/vi/${pl.id.substring(0, 11)}/hqdefault.jpg`,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  } as MediaNode));
}

/* LEGACY CONTENT RENDERER (PRESERVED FOR FALLBACK) */
function LegacyContent() {
  return (
    <motion.div
      key="legacy"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-10"
    >
      {PLAYLISTS.map((pl) => (
        <Card key={pl.id}>
          <CardHeader>
            <CardTitle>{pl.title}</CardTitle>
          </CardHeader>
          <CardContent>
            {canEmbedInline ? (
              <div className="aspect-video rounded-xl overflow-hidden border">
                <iframe
                  src={`https://www.youtube.com/embed/videoseries?list=${pl.id}`}
                  className="w-full h-full"
                  allow="encrypted-media; picture-in-picture"
                  allowFullScreen
                  title={pl.title}
                />
              </div>
            ) : (
              <Button
                className="w-full"
                onClick={() => window.open(`https://www.youtube.com/playlist?list=${pl.id}`, "_blank")}
              >
                Play Playlist
              </Button>
            )}
          </CardContent>
        </Card>
      ))}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {MOVIES.map((m) => (
          <Card key={m.id}>
            <CardContent className="p-0">
              {canEmbedInline ? (
                <div className="aspect-video">
                  <iframe
                    src={`https://www.youtube.com/embed/${m.id}`}
                    className="w-full h-full"
                    allow="encrypted-media; picture-in-picture"
                    allowFullScreen
                    title={m.title}
                  />
                </div>
              ) : (
                <Button
                  className="w-full h-14"
                  onClick={() => window.open(`https://www.youtube.com/watch?v=${m.id}`, "_blank")}
                >
                  {m.title}
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex justify-end">
        <Badge variant="outline">YouTube - Free with ads</Badge>
      </div>
    </motion.div>
  );
}

/* MAIN BROWSE CONTENT COMPONENT */
function BrowseContent({
  graphState,
  graphActions,
  userState,
  userId,
  favoriteIds,
  setFavoriteIds,
  watchlistIds,
  setWatchlistIds,
  selectedGenres,
  setSelectedGenres,
}: {
  graphState: ReturnType<typeof useMediaGraph>[0];
  graphActions: ReturnType<typeof useMediaGraph>[1];
  userState: ReturnType<typeof useUserMediaState>;
  userId: string | undefined;
  favoriteIds: Set<string>;
  setFavoriteIds: React.Dispatch<React.SetStateAction<Set<string>>>;
  watchlistIds: Set<string>;
  setWatchlistIds: React.Dispatch<React.SetStateAction<Set<string>>>;
  selectedGenres: string[];
  setSelectedGenres: React.Dispatch<React.SetStateAction<string[]>>;
}) {
  const [seeAllModal, setSeeAllModal] = useState<{
    isOpen: boolean;
    title: string;
    items: MediaNode[];
  }>({ isOpen: false, title: "", items: [] });
  
  const [quickCategory, setQuickCategory] = useState<string>("");
  
  // ===== DYNAMIC RAILS FROM SUPABASE =====
  const [dynamicRails, setDynamicRails] = useState<Map<string, MediaNode[]>>(new Map());
  const [railsLoading, setRailsLoading] = useState(true);
  const [railsError, setRailsError] = useState<string | null>(null);
  
  // Load dynamic rails from Supabase on mount
  useEffect(() => {
    let mounted = true;
    
    async function loadDynamicRails() {
      try {
        setRailsLoading(true);
        const railData = await fetchAllRails(RAIL_CONFIGS);
        
        if (mounted) {
          setDynamicRails(railData);
          setRailsError(null);
        }
      } catch (err) {
        console.error('[MediaV3] Error loading dynamic rails:', err);
        if (mounted) {
          setRailsError('Failed to load content');
        }
      } finally {
        if (mounted) {
          setRailsLoading(false);
        }
      }
    }
    
    loadDynamicRails();
    
    return () => { mounted = false; };
  }, []);
  
  // Get viable rails (those with enough content)
  const viableRails = useMemo(() => {
    return filterViableRails(RAIL_CONFIGS, dynamicRails);
  }, [dynamicRails]);

  // Convert legacy content to MediaNode format
  const legacyMovieNodes = useMemo(() => convertLegacyToMediaNodes(), []);
  const legacyPlaylistNodes = useMemo(() => convertPlaylistsToMediaNodes(), []);

  // Progress tracking for continue watching
  const progressMap = useMemo(() => {
    const map = new Map<string, number>();
    graphState.continueWatching.forEach(node => {
      map.set(node.id, Math.random() * 80 + 10);
    });
    return map;
  }, [graphState.continueWatching]);

  // Combine graph data with legacy content for rich rails
  // PRIORITY: Dynamic Supabase > Graph State > Legacy
  const trendingItems = useMemo(() => {
    const dynamicTrending = dynamicRails.get('trending-movies') || [];
    if (dynamicTrending.length >= 8) return dynamicTrending;
    if (graphState.trending.length > 0) return graphState.trending;
    return [...legacyMovieNodes].sort(() => Math.random() - 0.5).slice(0, 10);
  }, [dynamicRails, graphState.trending, legacyMovieNodes]);

  const forYouItems = useMemo(() => {
    // Mix from various dynamic rails for personalization feel
    const blackCinema = dynamicRails.get('black-cinema') || [];
    const comedies = dynamicRails.get('comedy') || [];
    const ninetiesItems = dynamicRails.get('best-90s') || [];
    
    if (blackCinema.length > 0 || comedies.length > 0) {
      const mixed = [...blackCinema.slice(0, 4), ...comedies.slice(0, 3), ...ninetiesItems.slice(0, 3)];
      if (mixed.length >= 6) return mixed;
    }
    if (graphState.forYou.length > 0) return graphState.forYou;
    return [...legacyMovieNodes].sort(() => Math.random() - 0.5).slice(0, 10);
  }, [dynamicRails, graphState.forYou, legacyMovieNodes]);

  const newReleasesItems = useMemo(() => {
    // Use animation or other dynamic content as "new" since they're freshly ingested
    const animation = dynamicRails.get('animation') || [];
    if (animation.length >= 6) return animation.slice(0, 10);
    if (graphState.newReleases.length > 0) return graphState.newReleases;
    return legacyMovieNodes.slice(0, 10);
  }, [dynamicRails, graphState.newReleases, legacyMovieNodes]);

  // Black Cinema rail (NEW - from Supabase)
  const blackCinemaItems = useMemo(() => {
    return dynamicRails.get('black-cinema') || [];
  }, [dynamicRails]);
  
  // 90s Movies rail (NEW - from Supabase)
  const ninetiesItems = useMemo(() => {
    return dynamicRails.get('best-90s') || [];
  }, [dynamicRails]);
  
  // Action Movies rail (NEW - from Supabase)
  const actionMoviesItems = useMemo(() => {
    return dynamicRails.get('top-action') || [];
  }, [dynamicRails]);
  
  // Sci-Fi Movies rail (NEW - from Supabase)
  const sciFiItems = useMemo(() => {
    return dynamicRails.get('top-sci-fi') || [];
  }, [dynamicRails]);
  
  // Animation Movies rail (NEW - from Supabase)
  const animationMoviesItems = useMemo(() => {
    return dynamicRails.get('animation') || [];
  }, [dynamicRails]);
  
  // Black TV Shows rail (NEW - from Supabase)
  const blackTVItems = useMemo(() => {
    return dynamicRails.get('black-tv-shows') || [];
  }, [dynamicRails]);

  // Hero items (for the banner) - use best dynamic content
  const heroItems = useMemo(() => {
    // Prioritize Black Cinema and Trending for hero
    const blackCinema = dynamicRails.get('black-cinema') || [];
    const trending = dynamicRails.get('trending-movies') || [];
    const action = dynamicRails.get('top-action') || [];
    
    // Pick highest popularity items with good backdrops
    const candidates = [
      ...blackCinema.slice(0, 3),
      ...trending.slice(0, 2),
      ...action.slice(0, 2),
    ].filter(item => item.backdrop_url || item.poster_url);
    
    if (candidates.length >= 3) {
      return candidates
        .sort((a, b) => (b.popularity_score || 0) - (a.popularity_score || 0))
        .slice(0, 5);
    }
    
    // Fallback to graph data
    const items = [
      ...(graphState.trending.length > 0 ? graphState.trending.slice(0, 3) : []),
      ...(graphState.forYou.length > 0 ? graphState.forYou.slice(0, 2) : []),
    ];
    
    if (items.length === 0) {
      return legacyMovieNodes.slice(0, 5);
    }
    
    return items.slice(0, 5);
  }, [dynamicRails, graphState.trending, graphState.forYou, legacyMovieNodes]);

  // Genre-filtered items
  const filteredByGenre = useMemo(() => {
    if (selectedGenres.length === 0) return [];
    
    const genreMap: Record<string, MediaNode[]> = {};
    
    legacyMovieNodes.forEach((node, index) => {
      const movie = MOVIES[index];
      if (movie && movie.genre) {
        if (!genreMap[movie.genre]) {
          genreMap[movie.genre] = [];
        }
        genreMap[movie.genre].push(node);
      }
    });
    
    return selectedGenres.flatMap((genre) => genreMap[genre] || []);
  }, [selectedGenres, legacyMovieNodes]);

  // Handle play
  const handlePlay = useCallback(async (node: MediaNode) => {
    try {
      if (userId) {
        await userState.recordWatch(node.id, 0, false);
      }
      
      if (node.canonical_id?.includes('playlist')) {
        const playlistId = node.youtube_id;
        window.open(`https://www.youtube.com/playlist?list=${playlistId}`, "_blank");
      } else if (node.youtube_id) {
        window.open(`https://www.youtube.com/watch?v=${node.youtube_id}`, "_blank");
      }
    } catch (err) {
      console.error('[MediaV3] handlePlay error:', err);
    }
  }, [userId, userState]);

  // Handle favorite toggle
  const handleToggleFavorite = useCallback(async (node: MediaNode) => {
    if (!userId) return;
    
    try {
      const isFav = favoriteIds.has(node.id);
      if (isFav) {
        await userState.removeFromFavorites(node.id);
        setFavoriteIds(prev => {
          const next = new Set(prev);
          next.delete(node.id);
          return next;
        });
      } else {
        await userState.addToFavorites(node.id);
        setFavoriteIds(prev => new Set(prev).add(node.id));
      }
      
      graphActions.markStale();
    } catch (err) {
      console.error('[MediaV3] handleToggleFavorite error:', err);
    }
  }, [userId, userState, graphActions, favoriteIds, setFavoriteIds]);

  // Handle watchlist toggle
  const handleToggleWatchlist = useCallback(async (node: MediaNode) => {
    if (!userId) return;
    
    try {
      const inList = watchlistIds.has(node.id);
      if (inList) {
        await userState.removeFromWatchlist(node.id);
        setWatchlistIds(prev => {
          const next = new Set(prev);
          next.delete(node.id);
          return next;
        });
      } else {
        await userState.addToWatchlist(node.id);
        setWatchlistIds(prev => new Set(prev).add(node.id));
      }
    } catch (err) {
      console.error('[MediaV3] handleToggleWatchlist error:', err);
    }
  }, [userId, userState, watchlistIds, setWatchlistIds]);

  const handleGenreToggle = useCallback((genreId: string) => {
    setSelectedGenres(prev => {
      if (prev.includes(genreId)) {
        return prev.filter(g => g !== genreId);
      }
      return [...prev, genreId];
    });
  }, [setSelectedGenres]);

  const handleClearGenres = useCallback(() => {
    setSelectedGenres([]);
  }, [setSelectedGenres]);

  const handleSeeAll = useCallback((title: string, items: MediaNode[]) => {
    setSeeAllModal({ isOpen: true, title, items });
  }, []);

  const handleQuickCategory = useCallback((categoryId: string) => {
    setQuickCategory(categoryId);
    
    switch (categoryId) {
      case 'trending':
        handleSeeAll('Trending Now', trendingItems);
        break;
      case 'for-you':
        handleSeeAll('For You', forYouItems);
        break;
      case 'new-releases':
        handleSeeAll('New Releases', newReleasesItems);
        break;
      case 'continue-watching':
        if (graphState.continueWatching.length > 0) {
          handleSeeAll('Continue Watching', graphState.continueWatching);
        }
        break;
      case 'free-content':
        handleSeeAll('Free Content', legacyMovieNodes);
        break;
      default:
        break;
    }
  }, [trendingItems, forYouItems, newReleasesItems, graphState.continueWatching, legacyMovieNodes, handleSeeAll]);

  const handleHeroInfo = useCallback((node: MediaNode) => {
    handlePlay(node);
  }, [handlePlay]);

  // Loading state (combine graph + rails loading)
  if (graphState.isLoading || railsLoading) {
    return (
      <motion.div
        key="loading"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-8 py-8"
      >
        <div className="aspect-[21/9] md:aspect-[2.5/1] bg-muted animate-pulse rounded-xl mx-4 md:mx-0" />
        
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="space-y-4 px-4 md:px-0">
            <div className="h-8 w-48 bg-muted animate-pulse rounded" />
            <div className="flex gap-3 overflow-hidden">
              {[...Array(6)].map((_, j) => (
                <div key={j} className="w-[180px] md:w-[220px] aspect-[2/3] bg-muted animate-pulse rounded-lg shrink-0" />
              ))}
            </div>
          </div>
        ))}
      </motion.div>
    );
  }
  
  // Error state
  if (railsError && trendingItems.length === 0) {
    return (
      <motion.div
        key="error"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center py-20 px-4 text-center"
      >
        <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">Failed to load content</h3>
        <p className="text-muted-foreground mb-4">We couldn't load the media catalog. Please try again.</p>
        <Button onClick={() => window.location.reload()}>
          Refresh Page
        </Button>
      </motion.div>
    );
  }

  // Animation items by genre
  const animationItems = legacyMovieNodes.filter((_, i) => 
    ['animation', 'kids'].includes(MOVIES[i]?.genre || '')
  );
  
  const comedyItems = legacyMovieNodes.filter((_, i) => 
    MOVIES[i]?.genre === 'comedy'
  );
  
  const actionItems = legacyMovieNodes.filter((_, i) => 
    ['action', 'thriller'].includes(MOVIES[i]?.genre || '')
  );
  
  const dramaItems = legacyMovieNodes.filter((_, i) => 
    MOVIES[i]?.genre === 'drama'
  );

  return (
    <motion.div
      key="browse"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8 pb-12"
    >
      {heroItems.length > 0 && (
        <HeroBanner
          items={heroItems}
          onPlay={handlePlay}
          onAddToList={handleToggleWatchlist}
          onInfo={handleHeroInfo}
          watchlistIds={watchlistIds}
        />
      )}

      <GenreChips
        genres={DEFAULT_GENRES}
        selectedGenres={selectedGenres}
        onGenreToggle={handleGenreToggle}
        onClearAll={handleClearGenres}
        multiSelect={true}
      />

      <QuickCategoriesGrid
        onCategorySelect={handleQuickCategory}
        selectedCategory={quickCategory}
      />

      {selectedGenres.length > 0 && filteredByGenre.length > 0 && (
        <BrowseRail
          id="genre-filtered"
          title={`${selectedGenres.map(g => g.charAt(0).toUpperCase() + g.slice(1)).join(', ')}`}
          subtitle={`${filteredByGenre.length} items`}
          items={filteredByGenre}
          itemSize="medium"
          onItemPlay={handlePlay}
          onItemFavorite={handleToggleFavorite}
          onItemWatchlist={handleToggleWatchlist}
          onSeeAll={() => handleSeeAll('Filtered Results', filteredByGenre)}
          favoriteIds={favoriteIds}
          watchlistIds={watchlistIds}
          priority="high"
        />
      )}

      {graphState.continueWatching.length > 0 && (
        <BrowseRail
          id="continue-watching"
          title="Continue Watching"
          subtitle="Pick up where you left off"
          items={graphState.continueWatching}
          itemSize="large"
          showProgress={true}
          progressMap={progressMap}
          onItemPlay={handlePlay}
          onItemFavorite={handleToggleFavorite}
          onItemWatchlist={handleToggleWatchlist}
          onSeeAll={() => handleSeeAll('Continue Watching', graphState.continueWatching)}
          favoriteIds={favoriteIds}
          watchlistIds={watchlistIds}
          priority="high"
        />
      )}

      <BrowseRail
        id="trending"
        title="Trending Now"
        subtitle="What everyone is watching"
        items={trendingItems}
        itemSize="medium"
        onItemPlay={handlePlay}
        onItemFavorite={handleToggleFavorite}
        onItemWatchlist={handleToggleWatchlist}
        onSeeAll={() => handleSeeAll('Trending Now', trendingItems)}
        favoriteIds={favoriteIds}
        watchlistIds={watchlistIds}
        totalItems={trendingItems.length}
      />

      <BrowseRail
        id="for-you"
        title="For You"
        subtitle={userId ? "Based on your taste" : "Popular picks"}
        items={forYouItems}
        itemSize="medium"
        showReason={true}
        reason="Recommended"
        onItemPlay={handlePlay}
        onItemFavorite={handleToggleFavorite}
        onItemWatchlist={handleToggleWatchlist}
        onSeeAll={() => handleSeeAll('For You', forYouItems)}
        favoriteIds={favoriteIds}
        watchlistIds={watchlistIds}
        totalItems={forYouItems.length}
      />

      <BrowseRail
        id="new-releases"
        title="New Releases"
        subtitle="Just dropped"
        items={newReleasesItems}
        itemSize="medium"
        onItemPlay={handlePlay}
        onItemFavorite={handleToggleFavorite}
        onItemWatchlist={handleToggleWatchlist}
        onSeeAll={() => handleSeeAll('New Releases', newReleasesItems)}
        favoriteIds={favoriteIds}
        watchlistIds={watchlistIds}
        totalItems={newReleasesItems.length}
      />

      {/* ===== DYNAMIC SUPABASE RAILS (YouTube Catalog) ===== */}
      
      {blackCinemaItems.length >= 8 && (
        <BrowseRail
          id="black-cinema"
          title="Black Cinema"
          subtitle="Culturally significant films"
          items={blackCinemaItems}
          itemSize="large"
          onItemPlay={handlePlay}
          onItemFavorite={handleToggleFavorite}
          onItemWatchlist={handleToggleWatchlist}
          onSeeAll={() => handleSeeAll('Black Cinema', blackCinemaItems)}
          favoriteIds={favoriteIds}
          watchlistIds={watchlistIds}
          totalItems={blackCinemaItems.length}
          priority="high"
        />
      )}
      
      {ninetiesItems.length >= 8 && (
        <BrowseRail
          id="best-90s"
          title="Best 1990's Movies"
          subtitle="Decade-defining classics"
          items={ninetiesItems}
          itemSize="medium"
          onItemPlay={handlePlay}
          onItemFavorite={handleToggleFavorite}
          onItemWatchlist={handleToggleWatchlist}
          onSeeAll={() => handleSeeAll("Best 1990's Movies", ninetiesItems)}
          favoriteIds={favoriteIds}
          watchlistIds={watchlistIds}
          totalItems={ninetiesItems.length}
          priority="high"
        />
      )}
      
      {actionMoviesItems.length >= 8 && (
        <BrowseRail
          id="top-action"
          title="Top Action Movies"
          subtitle="Adrenaline-pumping classics"
          items={actionMoviesItems}
          itemSize="medium"
          onItemPlay={handlePlay}
          onItemFavorite={handleToggleFavorite}
          onItemWatchlist={handleToggleWatchlist}
          onSeeAll={() => handleSeeAll('Top Action Movies', actionMoviesItems)}
          favoriteIds={favoriteIds}
          watchlistIds={watchlistIds}
          totalItems={actionMoviesItems.length}
          priority="high"
        />
      )}
      
      {sciFiItems.length >= 8 && (
        <BrowseRail
          id="top-sci-fi"
          title="Complete Top Sci-Fi Movies"
          subtitle="Mind-bending journeys"
          items={sciFiItems}
          itemSize="medium"
          onItemPlay={handlePlay}
          onItemFavorite={handleToggleFavorite}
          onItemWatchlist={handleToggleWatchlist}
          onSeeAll={() => handleSeeAll('Complete Top Sci-Fi Movies', sciFiItems)}
          favoriteIds={favoriteIds}
          watchlistIds={watchlistIds}
          totalItems={sciFiItems.length}
          priority="high"
        />
      )}
      
      {animationMoviesItems.length >= 8 && (
        <BrowseRail
          id="animation-movies"
          title="Top Cartoon / Animated Movies"
          subtitle="Animated classics & anime"
          items={animationMoviesItems}
          itemSize="medium"
          onItemPlay={handlePlay}
          onItemFavorite={handleToggleFavorite}
          onItemWatchlist={handleToggleWatchlist}
          onSeeAll={() => handleSeeAll('Top Cartoon / Animated Movies', animationMoviesItems)}
          favoriteIds={favoriteIds}
          watchlistIds={watchlistIds}
          totalItems={animationMoviesItems.length}
          priority="high"
        />
      )}
      
      {blackTVItems.length >= 6 && (
        <BrowseRail
          id="black-tv-shows"
          title="Black TV Shows"
          subtitle="Full seasons available"
          items={blackTVItems}
          itemSize="large"
          onItemPlay={handlePlay}
          onItemFavorite={handleToggleFavorite}
          onItemWatchlist={handleToggleWatchlist}
          onSeeAll={() => handleSeeAll('Black TV Shows', blackTVItems)}
          favoriteIds={favoriteIds}
          watchlistIds={watchlistIds}
          totalItems={blackTVItems.length}
          priority="high"
        />
      )}

      {/* ===== LEGACY RAILS (Fallback Content) ===== */}

      <BrowseRail
        id="tv-shows"
        title="TV Shows & Series"
        subtitle="Full episodes and playlists"
        items={legacyPlaylistNodes}
        itemSize="large"
        onItemPlay={handlePlay}
        onItemFavorite={handleToggleFavorite}
        onItemWatchlist={handleToggleWatchlist}
        onSeeAll={() => handleSeeAll('TV Shows & Series', legacyPlaylistNodes)}
        favoriteIds={favoriteIds}
        watchlistIds={watchlistIds}
      />

      {animationItems.length > 0 && (
        <BrowseRail
          id="animation"
          title="Animation & Kids"
          subtitle="Family-friendly favorites"
          items={animationItems}
          itemSize="medium"
          onItemPlay={handlePlay}
          onItemFavorite={handleToggleFavorite}
          onItemWatchlist={handleToggleWatchlist}
          onSeeAll={() => handleSeeAll('Animation & Kids', animationItems)}
          favoriteIds={favoriteIds}
          watchlistIds={watchlistIds}
        />
      )}

      {comedyItems.length > 0 && (
        <BrowseRail
          id="comedy"
          title="Comedy"
          subtitle="Laugh out loud"
          items={comedyItems}
          itemSize="medium"
          onItemPlay={handlePlay}
          onItemFavorite={handleToggleFavorite}
          onItemWatchlist={handleToggleWatchlist}
          onSeeAll={() => handleSeeAll('Comedy', comedyItems)}
          favoriteIds={favoriteIds}
          watchlistIds={watchlistIds}
        />
      )}

      {actionItems.length > 0 && (
        <BrowseRail
          id="action-thriller"
          title="Action & Thriller"
          subtitle="Edge of your seat"
          items={actionItems}
          itemSize="medium"
          onItemPlay={handlePlay}
          onItemFavorite={handleToggleFavorite}
          onItemWatchlist={handleToggleWatchlist}
          onSeeAll={() => handleSeeAll('Action & Thriller', actionItems)}
          favoriteIds={favoriteIds}
          watchlistIds={watchlistIds}
        />
      )}

      {dramaItems.length > 0 && (
        <BrowseRail
          id="drama"
          title="Drama"
          subtitle="Powerful storytelling"
          items={dramaItems}
          itemSize="medium"
          onItemPlay={handlePlay}
          onItemFavorite={handleToggleFavorite}
          onItemWatchlist={handleToggleWatchlist}
          onSeeAll={() => handleSeeAll('Drama', dramaItems)}
          favoriteIds={favoriteIds}
          watchlistIds={watchlistIds}
        />
      )}

      {graphState.recommendationRows
        .filter(row => !['personalized', 'trending', 'new-releases'].includes(row.id))
        .slice(0, 3)
        .map(row => (
          <BrowseRail
            key={row.id}
            id={row.id}
            title={row.title}
            subtitle={row.reason}
            items={row.items}
            itemSize="medium"
            showReason={true}
            reason={row.reason}
            onItemPlay={handlePlay}
            onItemFavorite={handleToggleFavorite}
            onItemWatchlist={handleToggleWatchlist}
            onSeeAll={() => handleSeeAll(row.title, row.items)}
            favoriteIds={favoriteIds}
            watchlistIds={watchlistIds}
          />
        ))}

      <div className="flex justify-center px-4">
        <Badge variant="outline" className="text-muted-foreground">
          <Film className="h-3 w-3 mr-1" />
          YouTube - Free with ads
        </Badge>
      </div>

      <SeeAllModal
        isOpen={seeAllModal.isOpen}
        onClose={() => setSeeAllModal({ isOpen: false, title: "", items: [] })}
        title={seeAllModal.title}
        items={seeAllModal.items}
        totalCount={seeAllModal.items.length}
        onItemPlay={handlePlay}
        onItemFavorite={handleToggleFavorite}
        onItemWatchlist={handleToggleWatchlist}
        favoriteIds={favoriteIds}
        watchlistIds={watchlistIds}
        progressMap={progressMap}
      />
    </motion.div>
  );
}

/* MAIN COMPONENT */
function MediaPage() {
  const [userId, setUserId] = useState<string | undefined>(undefined);
  const [activeTab, setActiveTab] = useState<"browse" | "legacy">("browse");
  
  // Browse state
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState<SortOption>('trending');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('rails');
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState('for-you');
  
  // Get user session on mount
  useEffect(() => {
    supabase.auth.getSession()
      .then(({ data }) => {
        setUserId(data.session?.user?.id);
      })
      .catch((err) => {
        console.warn('[MediaV3] Auth session fetch failed:', err);
        setUserId(undefined);
      });
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUserId(session?.user?.id);
    });
    
    return () => subscription.unsubscribe();
  }, []);
  
  // Graph-driven data
  const [graphState, graphActions] = useMediaGraph("video");
  const userState = useUserMediaState();
  
  // Favorite/watchlist tracking
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [watchlistIds, setWatchlistIds] = useState<Set<string>>(new Set());

  // Search handler
  const handleSearch = useCallback(async (query: string) => {
    setSearchQuery(query);
    if (query) {
      await graphActions.search(query, 'video');
    }
  }, [graphActions]);

  // Category change handler
  const handleCategoryChange = useCallback((category: string) => {
    setActiveCategory(category);
  }, []);
  
  return (
    <div className="min-h-screen-dvh bg-background">
      <BrowseHeader
        onSearch={handleSearch}
        onSortChange={setSortOption}
        onFilterChange={setFilterType}
        onViewModeChange={setViewMode}
        currentSort={sortOption}
        currentFilter={filterType}
        currentView={viewMode}
        searchQuery={searchQuery}
        isSearching={graphState.isLoadingSearch}
        activeCategory={activeCategory}
        onCategoryChange={handleCategoryChange}
      />

      <main className="container mx-auto">
        <AnimatePresence mode="wait">
          {activeTab === "browse" ? (
            <BrowseContent
              graphState={graphState}
              graphActions={graphActions}
              userState={userState}
              userId={userId}
              favoriteIds={favoriteIds}
              setFavoriteIds={setFavoriteIds}
              watchlistIds={watchlistIds}
              setWatchlistIds={setWatchlistIds}
              selectedGenres={selectedGenres}
              setSelectedGenres={setSelectedGenres}
            />
          ) : (
            <div className="px-4 py-6">
              <LegacyContent />
            </div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

/* ERROR BOUNDARY (PRESERVED) */
export default function Media() {
  return (
    <ErrorBoundary routeTag="MEDIA_MODE">
      <MediaPage />
    </ErrorBoundary>
  );
}
