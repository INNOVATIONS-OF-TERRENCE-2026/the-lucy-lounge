/**
 * ┌─────────────────────────────────────────────────────────────────────────────┐
 * │ THE LUCY LOUNGE — EXPLORE MODE                                             │
 * │                                                                             │
 * │ Universal Media Intelligence Layer - Discovery Mode                        │
 * │ PHASE 2: Lucy Journeys + Mood Discovery + Legacy Playlists                 │
 * │                                                                             │
 * │ PRESERVATION > OPTIMIZATION                                                │
 * │ ALL EXISTING CONTENT MAINTAINED                                            │
 * └─────────────────────────────────────────────────────────────────────────────┘
 */

import { useRef, useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import {
  ArrowLeft,
  Home,
  Flame,
  Music2,
  Headphones,
  MapPin,
  Sparkles,
  Clock,
  Compass,
  Play,
  Heart,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion, AnimatePresence } from "framer-motion";
import { ErrorBoundary } from "@/components/system/ErrorBoundary";
import { MediaRow } from "@/components/media/MediaRow";
import { useMediaGraph } from "@/hooks/useMediaGraph";
import { getFeaturedJourneys, getMoodDiscoveryConfigs, getMoodContent, getJourneyWithSteps } from "@/supabase/recommendations";
import type { LucyJourney, MoodDiscoveryConfig, MediaNode } from "@/media/types";

import {
  explorePlaylists,
  ExplorePlaylist,
} from "@/data/explorePlaylists";

// =========================================================
// LEGACY SECTION CONFIG (PRESERVED)
// =========================================================

type SectionKey =
  | "hipHopEditorial"
  | "trapPlaylists"
  | "dallasDrill"
  | "newDallas"
  | "rnb90s"
  | "rnb80s"
  | "rnb70s"
  | "lofiChill";

const SECTION_META: Record<
  SectionKey,
  { title: string; subtitle: string; icon: React.ElementType }
> = {
  hipHopEditorial: {
    title: "Hip-Hop Editorial",
    subtitle: "Full-song playlists, curated",
    icon: Flame,
  },
  trapPlaylists: {
    title: "Trap",
    subtitle: "Hard-hitting trap energy",
    icon: Music2,
  },
  dallasDrill: {
    title: "Dallas Drill",
    subtitle: "DFW underground & drill",
    icon: MapPin,
  },
  newDallas: {
    title: "New Dallas",
    subtitle: "Next wave of Dallas artists",
    icon: Sparkles,
  },
  rnb90s: {
    title: "90s R&B Slow Jams",
    subtitle: "Classic love & soul",
    icon: Headphones,
  },
  rnb80s: {
    title: "80s R&B",
    subtitle: "Golden era grooves",
    icon: Clock,
  },
  rnb70s: {
    title: "70s Soul",
    subtitle: "Timeless soul & R&B",
    icon: Clock,
  },
  lofiChill: {
    title: "Lo-Fi / Chill / Focus",
    subtitle: "Study, relax, lock in",
    icon: Headphones,
  },
};

// =========================================================
// JOURNEY CARD COMPONENT
// =========================================================

interface JourneyCardProps {
  journey: LucyJourney;
  onStart: (journey: LucyJourney) => void;
}

function JourneyCard({ journey, onStart }: JourneyCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="min-w-[300px] max-w-[300px]"
    >
      <Card 
        className="overflow-hidden cursor-pointer h-full"
        style={{
          background: journey.gradient_colors 
            ? `linear-gradient(135deg, ${journey.gradient_colors[0] || '#4c1d95'}, ${journey.gradient_colors[1] || '#1e1b4b'})`
            : 'linear-gradient(135deg, #4c1d95, #1e1b4b)',
        }}
        onClick={() => onStart(journey)}
      >
        <CardContent className="p-6 h-full flex flex-col justify-between min-h-[180px]">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="h-5 w-5 text-white/80" />
              <Badge variant="secondary" className="text-xs bg-white/20 text-white border-0">
                {journey.journey_type}
              </Badge>
            </div>
            <h3 className="text-lg font-bold text-white mb-1">{journey.title}</h3>
            {journey.description && (
              <p className="text-sm text-white/70 line-clamp-2">{journey.description}</p>
            )}
          </div>
          
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center gap-2">
              {journey.moods?.slice(0, 2).map(mood => (
                <Badge key={mood} variant="outline" className="text-xs text-white/80 border-white/30">
                  {mood}
                </Badge>
              ))}
            </div>
            
            <Button size="sm" variant="secondary" className="gap-1">
              <Play className="h-4 w-4" fill="currentColor" />
              Start
            </Button>
          </div>
          
          {journey.estimated_duration_minutes && (
            <p className="text-xs text-white/50 mt-2">
              ~{journey.estimated_duration_minutes} min
            </p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

// =========================================================
// MOOD CARD COMPONENT
// =========================================================

interface MoodCardProps {
  mood: MoodDiscoveryConfig;
  onSelect: (mood: MoodDiscoveryConfig) => void;
}

function MoodCard({ mood, onSelect }: MoodCardProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.98 }}
      className="flex flex-col items-center justify-center rounded-xl p-6 min-w-[140px] transition"
      style={{
        background: mood.gradient_colors 
          ? `linear-gradient(135deg, ${mood.gradient_colors[0]}, ${mood.gradient_colors[1]})`
          : 'linear-gradient(135deg, #374151, #111827)',
      }}
      onClick={() => onSelect(mood)}
    >
      {mood.icon && <span className="text-3xl mb-2">{mood.icon}</span>}
      <span className="text-sm font-semibold text-white">{mood.display_name}</span>
      {mood.description && (
        <span className="text-xs text-white/60 text-center mt-1 line-clamp-1">
          {mood.description}
        </span>
      )}
    </motion.button>
  );
}

// =========================================================
// LUCY JOURNEYS SECTION
// =========================================================

function JourneysSection() {
  const [journeys, setJourneys] = useState<LucyJourney[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  
  useEffect(() => {
    const loadJourneys = async () => {
      try {
        const data = await getFeaturedJourneys('audio', 10);
        setJourneys(data);
      } catch (error) {
        console.error('[ExploreMode] Failed to load journeys:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadJourneys();
  }, []);
  
  const handleStartJourney = useCallback(async (journey: LucyJourney) => {
    // In future: Start journey playback
    // For now: Navigate to first step or show details
    console.log('[ExploreMode] Starting journey:', journey.title);
    
    const journeyData = await getJourneyWithSteps(journey.id);
    if (journeyData && journeyData.nodes.length > 0) {
      const firstNode = journeyData.nodes[0];
      if (firstNode.spotify_id) {
        window.open(`https://open.spotify.com/track/${firstNode.spotify_id}`, "_blank");
      } else if (firstNode.youtube_id) {
        window.open(`https://www.youtube.com/watch?v=${firstNode.youtube_id}`, "_blank");
      }
    }
  }, []);
  
  if (loading) {
    return (
      <section className="container mx-auto px-4">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-purple-400" />
          <h2 className="text-lg font-semibold">Lucy Journeys</h2>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-2">
          {[1, 2, 3].map(i => (
            <div key={i} className="min-w-[300px] h-[180px] rounded-xl bg-muted animate-pulse" />
          ))}
        </div>
      </section>
    );
  }
  
  if (journeys.length === 0) {
    return null;
  }
  
  return (
    <section className="container mx-auto px-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-400" />
          <div>
            <h2 className="text-lg font-semibold">Lucy Journeys</h2>
            <p className="text-xs text-muted-foreground">Curated multi-track adventures</p>
          </div>
        </div>
      </div>
      
      <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
        {journeys.map((journey, index) => (
          <motion.div
            key={journey.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <JourneyCard journey={journey} onStart={handleStartJourney} />
          </motion.div>
        ))}
      </div>
    </section>
  );
}

// =========================================================
// MOOD DISCOVERY SECTION
// =========================================================

function MoodDiscoverySection() {
  const [moods, setMoods] = useState<MoodDiscoveryConfig[]>([]);
  const [selectedMood, setSelectedMood] = useState<MoodDiscoveryConfig | null>(null);
  const [moodContent, setMoodContent] = useState<MediaNode[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const loadMoods = async () => {
      try {
        const data = await getMoodDiscoveryConfigs();
        setMoods(data);
      } catch (error) {
        console.error('[ExploreMode] Failed to load moods:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadMoods();
  }, []);
  
  const handleSelectMood = useCallback(async (mood: MoodDiscoveryConfig) => {
    setSelectedMood(mood);
    
    try {
      const content = await getMoodContent(mood.mood_slug, 'audio', 20);
      setMoodContent(content);
    } catch (error) {
      console.error('[ExploreMode] Failed to load mood content:', error);
    }
  }, []);
  
  if (loading || moods.length === 0) {
    return null;
  }
  
  return (
    <section className="container mx-auto px-4 space-y-6">
      <div className="flex items-center gap-2">
        <Compass className="w-5 h-5 text-primary" />
        <div>
          <h2 className="text-lg font-semibold">Mood Discovery</h2>
          <p className="text-xs text-muted-foreground">How are you feeling?</p>
        </div>
      </div>
      
      {/* Mood Selector */}
      <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
        {moods.map((mood, index) => (
          <motion.div
            key={mood.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <MoodCard mood={mood} onSelect={handleSelectMood} />
          </motion.div>
        ))}
      </div>
      
      {/* Selected Mood Content */}
      {selectedMood && moodContent.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <MediaRow
            id={`mood-${selectedMood.mood_slug}`}
            title={`${selectedMood.display_name} Vibes`}
            subtitle={selectedMood.description || `Perfect for ${selectedMood.mood_slug}`}
            items={moodContent}
            itemSize="medium"
          />
        </motion.div>
      )}
    </section>
  );
}

// =========================================================
// LEGACY PLAYLISTS (PRESERVED)
// =========================================================

function LegacyPlaylistsSection() {
  const sectionRefs: Record<SectionKey, React.RefObject<HTMLDivElement>> = {
    hipHopEditorial: useRef(null),
    trapPlaylists: useRef(null),
    dallasDrill: useRef(null),
    newDallas: useRef(null),
    rnb90s: useRef(null),
    rnb80s: useRef(null),
    rnb70s: useRef(null),
    lofiChill: useRef(null),
  };

  const scrollToSection = (key: SectionKey) => {
    sectionRefs[key]?.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const renderRail = (items: ExplorePlaylist[]) => (
    <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
      {items.map((pl, index) => (
        <motion.div
          key={pl.id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.05 }}
          className="min-w-[320px] max-w-[320px] rounded-xl overflow-hidden bg-black shadow-lg"
        >
          <iframe
            title={pl.title}
            src={pl.spotifyEmbedUrl}
            width="100%"
            height="380"
            frameBorder="0"
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            loading="lazy"
          />
          <div className="p-3 bg-background">
            <h4 className="font-semibold text-sm">{pl.title}</h4>
            <p className="text-xs text-muted-foreground">{pl.subtitle}</p>
          </div>
        </motion.div>
      ))}
    </div>
  );

  return (
    <>
      {/* Genre Tiles */}
      <section className="container mx-auto px-4 py-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Music2 className="w-5 h-5 text-primary" />
          Browse by Genre
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {(Object.keys(SECTION_META) as SectionKey[]).map((key) => {
            const Icon = SECTION_META[key].icon;
            return (
              <button
                key={key}
                onClick={() => scrollToSection(key)}
                className="flex flex-col items-center justify-center rounded-xl border bg-muted/40 hover:bg-muted/70 transition p-4"
              >
                <Icon className="w-6 h-6 mb-2 text-primary" />
                <span className="text-sm font-semibold text-center">
                  {SECTION_META[key].title}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Editorial Sections */}
      {(Object.keys(SECTION_META) as SectionKey[]).map((key) => {
        const meta = SECTION_META[key];
        const items = explorePlaylists[key];

        if (!items || items.length === 0) return null;

        return (
          <section
            key={key}
            ref={sectionRefs[key]}
            className="container mx-auto px-4"
          >
            <div className="flex items-center gap-2 mb-3">
              <meta.icon className="w-5 h-5 text-primary" />
              <div>
                <h2 className="text-lg font-semibold">{meta.title}</h2>
                <p className="text-xs text-muted-foreground">{meta.subtitle}</p>
              </div>
            </div>

            {renderRail(items)}
          </section>
        );
      })}
    </>
  );
}

// =========================================================
// MAIN COMPONENT
// =========================================================

function ExploreModeContent() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"journeys" | "playlists">("journeys");

  return (
    <div className="min-h-screen-dvh bg-background">
      {/* HEADER */}
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur border-b">
        <div className="container mx-auto flex items-center justify-between py-4 px-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/listening-mode")}>
            <ArrowLeft />
          </Button>

          <div className="text-center">
            <h1 className="text-2xl font-bold flex items-center gap-2 justify-center">
              <Compass className="h-6 w-6 text-primary" />
              Explore
            </h1>
            <p className="text-xs text-muted-foreground">
              Discover journeys, moods & playlists
            </p>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => navigate("/")}>
              <Home className="mr-2 w-4 h-4" />
              Home
            </Button>
          </div>
        </div>
        
        {/* Tab Switcher */}
        <div className="container mx-auto px-4 pb-2">
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "journeys" | "playlists")}>
            <TabsList className="w-full grid grid-cols-2">
              <TabsTrigger value="journeys" className="gap-1">
                <Sparkles className="h-4 w-4" />
                Journeys & Moods
              </TabsTrigger>
              <TabsTrigger value="playlists" className="gap-1">
                <Music2 className="h-4 w-4" />
                Playlists
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </header>

      {/* CONTENT */}
      <main className="space-y-12 pb-16">
        <AnimatePresence mode="wait">
          {activeTab === "journeys" ? (
            <motion.div
              key="journeys"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-12 pt-6"
            >
              {/* Lucy Journeys */}
              <JourneysSection />
              
              {/* Mood Discovery */}
              <MoodDiscoverySection />
              
              {/* Teaser for Playlists */}
              <section className="container mx-auto px-4">
                <Card className="bg-gradient-to-r from-green-900/30 to-emerald-900/30 border-green-500/30">
                  <CardContent className="p-6 flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold flex items-center gap-2">
                        <Music2 className="h-5 w-5 text-green-400" />
                        Want more?
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Browse our curated Spotify playlists
                      </p>
                    </div>
                    <Button variant="secondary" onClick={() => setActiveTab("playlists")}>
                      Browse Playlists
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </CardContent>
                </Card>
              </section>
            </motion.div>
          ) : (
            <motion.div
              key="playlists"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <LegacyPlaylistsSection />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

// =========================================================
// ERROR BOUNDARY
// =========================================================

const ExploreMode = () => (
  <ErrorBoundary routeTag="EXPLORE_MODE">
    <ExploreModeContent />
  </ErrorBoundary>
);

export default ExploreMode;
