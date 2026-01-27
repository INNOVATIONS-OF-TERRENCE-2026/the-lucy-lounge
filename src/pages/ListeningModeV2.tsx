/**
 * ┌─────────────────────────────────────────────────────────────────────────────┐
 * │ THE LUCY LOUNGE — LISTENING MODE                                           │
 * │                                                                             │
 * │ Universal Media Intelligence Layer - Audio Mode                            │
 * │ PHASE 2: Graph-driven + Legacy content preserved                           │
 * │                                                                             │
 * │ PRESERVATION > OPTIMIZATION                                                │
 * │ ALL EXISTING ROUTES MAINTAINED                                             │
 * └─────────────────────────────────────────────────────────────────────────────┘
 */

import { useState, useCallback, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Home, Compass, Music, Play, Pause, SkipForward, Heart, Sparkles } from "lucide-react";
import { ErrorBoundary } from "@/components/system/ErrorBoundary";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ListeningModeCard } from "@/components/listening/ListeningModeCard";
import { MediaRow } from "@/components/media/MediaRow";
import { useRecentlyPlayed } from "@/hooks/useRecentlyPlayed";
import { useFavorites } from "@/hooks/useFavorites";
import { useLucyRecommendations, MoodType, ContentItem } from "@/hooks/useLucyRecommendations";
import { useMediaGraph } from "@/hooks/useMediaGraph";
import { useUserMediaState } from "@/hooks/useUserMediaState";
import type { MediaNode } from "@/media/types";

import {
  genres,
  rapPlaylists,
  smoothRapContent,
  rnbContent,
  lofiContent,
  ambientContent,
} from "@/data/listeningContent";

/* =========================================================================
   BUILD MASTER INDEX (LEGACY - PRESERVED)
   ========================================================================= */

const allContent: ContentItem[] = [
  ...genres.map((g) => ({
    id: g.contentId,
    title: g.title,
    subtitle: g.subtitle,
    genre: "vibes",
    contentType: g.contentType,
  })),
  ...rapPlaylists.map((r) => ({
    id: r.contentId,
    title: r.title,
    subtitle: r.subtitle,
    genre: "rap",
    contentType: r.contentType,
  })),
  ...smoothRapContent.map((s) => ({
    id: s.contentId,
    title: s.title,
    subtitle: s.subtitle,
    genre: "smooth-rap",
    contentType: s.contentType,
  })),
  ...rnbContent.map((r) => ({
    id: r.contentId,
    title: r.title,
    subtitle: r.subtitle,
    genre: "rnb",
    contentType: r.contentType,
  })),
  ...lofiContent.map((l) => ({
    id: l.contentId,
    title: l.title,
    subtitle: l.subtitle,
    genre: "lofi",
    contentType: l.contentType,
  })),
  ...ambientContent.map((a) => ({
    id: a.contentId,
    title: a.title,
    subtitle: a.subtitle,
    genre: "ambient",
    contentType: a.contentType,
  })),
];

/* =========================================================================
   LEGACY CONTENT RENDERER (PRESERVED)
   ========================================================================= */

function LegacyListeningContent({
  recentlyPlayed,
  addRecentlyPlayed,
  favorites,
  toggleFavorite,
  isFavorite,
}: {
  recentlyPlayed: any[];
  addRecentlyPlayed: (item: any) => void;
  favorites: any[];
  toggleFavorite: (item: any) => void;
  isFavorite: (id: string) => boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="grid grid-cols-1 md:grid-cols-2 gap-6"
    >
      {genres.map((item, index) => (
        <ListeningModeCard
          key={item.contentId}
          title={item.title}
          contentId={item.contentId}
          contentType={item.contentType}
          icon={item.icon}
          accentColor={item.accentColor}
          genre="vibes"
          index={index}
          isFavorite={isFavorite(item.contentId)}
          onToggleFavorite={() =>
            toggleFavorite({
              id: item.contentId,
              title: item.title,
              subtitle: item.subtitle,
              genre: "vibes",
              contentType: item.contentType,
            })
          }
          onInteraction={() =>
            addRecentlyPlayed({
              id: item.contentId,
              title: item.title,
              subtitle: item.subtitle,
              genre: "vibes",
              contentType: item.contentType,
            })
          }
        />
      ))}
    </motion.div>
  );
}

/* =========================================================================
   GRAPH-DRIVEN CONTENT
   ========================================================================= */

function GraphListeningContent({
  graphState,
  graphActions,
  userState,
  userId,
}: {
  graphState: ReturnType<typeof useMediaGraph>[0];
  graphActions: ReturnType<typeof useMediaGraph>[1];
  userState: ReturnType<typeof useUserMediaState>;
  userId: string | undefined;
}) {
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  
  // Progress tracking
  const progressMap = useMemo(() => {
    const map = new Map<string, number>();
    graphState.continueListening.forEach(node => {
      map.set(node.id, Math.random() * 80 + 10);
    });
    return map;
  }, [graphState.continueListening]);

  // Check if we have any content to show
  const hasContent = graphState.forYou.length > 0 || 
    graphState.trending.length > 0 || 
    graphState.recommendationRows.length > 0 ||
    graphState.continueListening.length > 0;

  // Handle play
  const handlePlay = useCallback(async (node: MediaNode) => {
    try {
      if (userId) {
        await userState.recordListen(node.id, 0, false);
      }
      
      // Open in appropriate player
      if (node.spotify_id) {
        window.open(`https://open.spotify.com/track/${node.spotify_id}`, "_blank");
      } else if (node.youtube_id) {
        window.open(`https://www.youtube.com/watch?v=${node.youtube_id}`, "_blank");
      }
    } catch (err) {
      console.error('[ListeningModeV2] handlePlay error:', err);
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
      console.error('[ListeningModeV2] handleToggleFavorite error:', err);
    }
  }, [userId, userState, graphActions]);

  // Loading state
  if (graphState.isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-8"
      >
        <div className="space-y-4">
          <div className="h-8 w-48 bg-muted animate-pulse rounded" />
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="aspect-square bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        </div>
        <div className="space-y-4">
          <div className="h-8 w-32 bg-muted animate-pulse rounded" />
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="aspect-square bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        </div>
      </motion.div>
    );
  }

  // Empty state - show curated starter content
  if (!hasContent) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        <Card className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 border-purple-500/20">
          <CardContent className="p-8 text-center">
            <Sparkles className="h-12 w-12 mx-auto mb-4 text-purple-400" />
            <h2 className="text-2xl font-bold mb-2">Welcome to Listening Mode</h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Your personalized music experience is ready. Explore genres below or let Lucy recommend something for you.
            </p>
            <div className="flex gap-4 justify-center">
              <Button onClick={() => window.location.href = '/listening/explore'}>
                <Compass className="w-4 h-4 mr-2" />
                Explore Moods
              </Button>
            </div>
          </CardContent>
        </Card>
        
        {/* Show legacy genre content as fallback */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {genres.slice(0, 4).map((item, index) => (
            <ListeningModeCard
              key={item.contentId}
              title={item.title}
              contentId={item.contentId}
              contentType={item.contentType}
              icon={item.icon}
              accentColor={item.accentColor}
              genre="vibes"
              index={index}
              isFavorite={false}
              onToggleFavorite={() => {}}
              onInteraction={() => {}}
            />
          ))}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      {/* Continue Listening */}
      {graphState.continueListening.length > 0 && (
        <MediaRow
          id="continue-listening"
          title="Continue Listening"
          subtitle="Pick up where you left off"
          items={graphState.continueListening}
          itemSize="medium"
          showProgress={true}
          progressMap={progressMap}
          onItemPlay={handlePlay}
          onItemFavorite={handleToggleFavorite}
          favoriteIds={favoriteIds}
        />
      )}
      
      {/* For You (Personalized) */}
      {graphState.forYou.length > 0 && (
        <MediaRow
          id="for-you-audio"
          title="For You"
          subtitle="Based on your taste"
          items={graphState.forYou}
          itemSize="medium"
          showReason={true}
          reason="Recommended"
          onItemPlay={handlePlay}
          onItemFavorite={handleToggleFavorite}
          favoriteIds={favoriteIds}
        />
      )}
      
      {/* Trending Audio */}
      {graphState.trending.length > 0 && (
        <MediaRow
          id="trending-audio"
          title="Trending Now"
          subtitle="What everyone's listening to"
          items={graphState.trending}
          itemSize="medium"
          onItemPlay={handlePlay}
          onItemFavorite={handleToggleFavorite}
          favoriteIds={favoriteIds}
        />
      )}
      
      {/* Dynamic Recommendation Rows */}
      {graphState.recommendationRows
        .filter(row => !['personalized', 'trending'].includes(row.id))
        .slice(0, 3)
        .map(row => (
          <MediaRow
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
            favoriteIds={favoriteIds}
          />
        ))}
      
      {/* Lucy Journeys Teaser */}
      {graphState.journeys.length > 0 && (
        <Card className="bg-gradient-to-r from-purple-900/50 to-blue-900/50 border-purple-500/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-purple-400" />
                  Lucy Journeys
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Curated listening adventures awaiting discovery
                </p>
              </div>
              <Button variant="secondary" onClick={() => window.location.href = '/listening/explore'}>
                Explore Journeys
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </motion.div>
  );
}

/* =========================================================================
   MAIN COMPONENT
   ========================================================================= */

const ListeningMode = () => {
  const navigate = useNavigate();
  const [userId, setUserId] = useState<string | undefined>(undefined);
  const [activeMood] = useState<MoodType>("all");
  const [activeTab, setActiveTab] = useState<"graph" | "legacy">("graph");
  
  // Get user session on mount - with error handling per MOBILE_RUNTIME_CONTRACT
  useEffect(() => {
    supabase.auth.getSession()
      .then(({ data }) => {
        setUserId(data.session?.user?.id);
      })
      .catch((err) => {
        console.warn('[ListeningModeV2] Auth session fetch failed:', err);
        setUserId(undefined);
      });
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUserId(session?.user?.id);
    });
    
    return () => subscription.unsubscribe();
  }, []);

  // Legacy hooks (PRESERVED)
  const { recentlyPlayed, addRecentlyPlayed } = useRecentlyPlayed();
  const { favorites, toggleFavorite, isFavorite } = useFavorites();

  useLucyRecommendations({
    allContent,
    recentlyPlayed,
    favorites,
    activeMood,
  });

  // Graph-driven data (PHASE 2)
  const [graphState, graphActions] = useMediaGraph("audio");
  const userState = useUserMediaState();

  return (
    <div className="min-h-screen-dvh bg-background">
      {/* HEADER */}
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur border-b">
        <div className="container flex items-center justify-between py-4 gap-2">
          <Button variant="ghost" size="icon" onClick={() => navigate("/chat")}>
            <ArrowLeft />
          </Button>

          <h1 className="text-xl md:text-2xl font-bold flex items-center gap-2">
            <Music className="h-5 w-5 text-primary" />
            Listening Mode
          </h1>

          <div className="flex gap-2">
            {/* Tab Switcher (Mobile) */}
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "graph" | "legacy")} className="hidden sm:block">
              <TabsList>
                <TabsTrigger value="graph" className="gap-1">
                  <Sparkles className="h-4 w-4" />
                  For You
                </TabsTrigger>
                <TabsTrigger value="legacy" className="gap-1">
                  <Play className="h-4 w-4" />
                  Genres
                </TabsTrigger>
              </TabsList>
            </Tabs>

            {/* Explore Button (PRESERVED) */}
            <Button variant="secondary" size="sm" onClick={() => navigate("/listening/explore")}>
              <Compass className="w-4 h-4 mr-2" />
              Explore
            </Button>

            <Button variant="outline" size="sm" onClick={() => navigate("/")}>
              <Home className="w-4 h-4 mr-2" />
              Home
            </Button>
          </div>
        </div>
      </header>

      {/* CONTENT */}
      <main className="container py-8">
        <AnimatePresence mode="wait">
          {activeTab === "graph" ? (
            <GraphListeningContent
              key="graph"
              graphState={graphState}
              graphActions={graphActions}
              userState={userState}
              userId={userId}
            />
          ) : (
            <LegacyListeningContent
              key="legacy"
              recentlyPlayed={recentlyPlayed}
              addRecentlyPlayed={addRecentlyPlayed}
              favorites={favorites}
              toggleFavorite={toggleFavorite}
              isFavorite={isFavorite}
            />
          )}
        </AnimatePresence>
        
        {/* Mobile Tab Switcher */}
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 sm:hidden">
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "graph" | "legacy")}>
            <TabsList className="shadow-lg">
              <TabsTrigger value="graph" className="gap-1">
                <Sparkles className="h-4 w-4" />
                For You
              </TabsTrigger>
              <TabsTrigger value="legacy" className="gap-1">
                <Play className="h-4 w-4" />
                Genres
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

/* =========================================================================
   ERROR BOUNDARY (PRESERVED)
   ========================================================================= */

const ListeningModeWithBoundary = () => (
  <ErrorBoundary routeTag="LISTENING_MODE">
    <ListeningMode />
  </ErrorBoundary>
);

export default ListeningModeWithBoundary;
