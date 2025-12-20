import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Film,
  Tv,
  Clapperboard,
  Users,
  Server,
  Settings,
  ArrowLeft,
  RefreshCw,
  Play,
  Youtube,
  Globe,
  Video,
} from "lucide-react";

import { youtubeCatalog, FreeMediaItem, FreeMediaCategory } from "@/features/media/services/youtubeCatalog";
import { vimeoCatalog } from "@/features/media/services/vimeoCatalog";
import { EmbeddedPlayerModal } from "@/features/media/components/EmbeddedPlayerModal";
import { FreeMovieCard } from "@/features/media/components/FreeMovieCard";

type SelectedVideo = {
  provider: "youtube" | "vimeo";
  id: string;
  title: string;
} | null;

const FILTER_OPTIONS: {
  value: FreeMediaCategory;
  label: string;
  icon: React.ReactNode;
}[] = [
  { value: "youtube_free", label: "YouTube", icon: <Youtube className="h-4 w-4" /> },
  { value: "public_domain", label: "Public Domain", icon: <Globe className="h-4 w-4" /> },
  { value: "trailers", label: "Trailers", icon: <Play className="h-4 w-4" /> },
  { value: "vimeo", label: "Vimeo", icon: <Video className="h-4 w-4" /> },
];

export default function Media() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("free");

  // FREE MOVIES STATE
  const [freeLoading, setFreeLoading] = useState(false);
  const [freeError, setFreeError] = useState<string | null>(null);
  const [freeItems, setFreeItems] = useState<FreeMediaItem[]>([]);
  const [freeFilter, setFreeFilter] = useState<FreeMediaCategory>("youtube_free");
  const [selectedVideo, setSelectedVideo] = useState<SelectedVideo>(null);

  // 🔥 FIX #2 — FORCE LOAD ON MOUNT (GUARANTEED)
  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        await loadFreeMovies();
      } catch (e) {
        console.error("[MEDIA_BOOT_FREE_MOVIES_FAIL]", e);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  // 🔥 FIX #3 — GUARANTEED FALLBACK
  async function loadFreeMovies() {
    setFreeLoading(true);
    setFreeError(null);

    try {
      const yt = await youtubeCatalog.loadTopFree(120);
      const vimeo = vimeoCatalog.getCurated();
      const combined = [...yt, ...vimeo];

      if (!combined || combined.length === 0) {
        setFreeItems(youtubeCatalog.getFallbackCurated());
      } else {
        setFreeItems(combined);
      }
    } catch (e: unknown) {
      console.error("[FREE_MOVIES_LOAD_FAIL]", e);
      setFreeError("Could not load free movies right now.");
      setFreeItems(youtubeCatalog.getFallbackCurated());
    } finally {
      setFreeLoading(false);
    }
  }

  const filteredItems = freeItems.filter((item) => {
    if (freeFilter === "trailers") {
      return item.category === "youtube_free";
    }
    return item.category === freeFilter;
  });

  const handlePlayVideo = (item: FreeMediaItem) => {
    setSelectedVideo({
      provider: item.provider,
      id: item.id,
      title: item.title,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* HEADER */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Lucy Media</h1>
              <p className="text-sm text-muted-foreground">Stream movies, TV shows, and more</p>
            </div>
          </div>
        </div>
      </header>

      {/* CONTENT */}
      <main className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-6 mb-6">
            <TabsTrigger value="movies">
              <Film className="h-4 w-4" /> Movies
            </TabsTrigger>
            <TabsTrigger value="tv">
              <Tv className="h-4 w-4" /> TV
            </TabsTrigger>
            <TabsTrigger value="free">
              <Clapperboard className="h-4 w-4" /> Free Movies
            </TabsTrigger>
            <TabsTrigger value="party">
              <Users className="h-4 w-4" /> Watch Party
            </TabsTrigger>
            <TabsTrigger value="plex">
              <Server className="h-4 w-4" /> My Plex
            </TabsTrigger>
            <TabsTrigger value="settings">
              <Settings className="h-4 w-4" /> Settings
            </TabsTrigger>
          </TabsList>

          {/* FREE MOVIES */}
          <TabsContent value="free">
            <div className="space-y-6">
              <div className="flex flex-wrap gap-2">
                {FILTER_OPTIONS.map((opt) => (
                  <Button
                    key={opt.value}
                    size="sm"
                    variant={freeFilter === opt.value ? "default" : "outline"}
                    onClick={() => setFreeFilter(opt.value)}
                  >
                    {opt.icon} {opt.label}
                  </Button>
                ))}
              </div>

              {freeLoading && (
                <div className="grid grid-cols-5 gap-4">
                  {Array.from({ length: 10 }).map((_, i) => (
                    <Skeleton key={i} className="aspect-video rounded-lg" />
                  ))}
                </div>
              )}

              {!freeLoading && filteredItems.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {filteredItems.map((item) => (
                    <FreeMovieCard key={`${item.provider}:${item.id}`} item={item} onPlay={handlePlayVideo} />
                  ))}
                </div>
              )}

              {!freeLoading && filteredItems.length === 0 && (
                <Card>
                  <CardContent className="pt-6 text-center">
                    <Clapperboard className="mx-auto h-10 w-10 text-muted-foreground" />
                    <p className="mt-2 font-medium">No movies found</p>
                    <Button variant="outline" className="mt-4" onClick={loadFreeMovies}>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Reload
                    </Button>
                  </CardContent>
                </Card>
              )}

              {freeItems.length > 0 && (
                <div className="flex justify-between text-sm text-muted-foreground border-t pt-4">
                  <span>
                    Showing {filteredItems.length} of {freeItems.length} free titles
                  </span>
                  <Badge variant="outline">No API key required</Badge>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* EMBED PLAYER */}
      <EmbeddedPlayerModal
        open={!!selectedVideo}
        onClose={() => setSelectedVideo(null)}
        provider={selectedVideo?.provider ?? "youtube"}
        id={selectedVideo?.id ?? ""}
        title={selectedVideo?.title ?? ""}
      />
    </div>
  );
}
