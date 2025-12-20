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

import { FreeMediaItem, FreeMediaCategory } from "@/features/media/services/youtubeCatalog";
import { vimeoCatalog } from "@/features/media/services/vimeoCatalog";
import { EmbeddedPlayerModal } from "@/features/media/components/EmbeddedPlayerModal";
import { FreeMovieCard } from "@/features/media/components/FreeMovieCard";

type SelectedVideo = {
  provider: "youtube" | "vimeo";
  id: string;
  title: string;
} | null;

const FILTER_OPTIONS: { value: FreeMediaCategory; label: string; icon: React.ReactNode }[] = [
  { value: "youtube_free", label: "YouTube", icon: <Youtube className="h-4 w-4" /> },
  { value: "public_domain", label: "Public Domain", icon: <Globe className="h-4 w-4" /> },
  { value: "trailers", label: "Trailers", icon: <Play className="h-4 w-4" /> },
  { value: "vimeo", label: "Vimeo", icon: <Video className="h-4 w-4" /> },
];

export default function Media() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("free");

  const [freeLoading, setFreeLoading] = useState(false);
  const [freeError, setFreeError] = useState<string | null>(null);
  const [freeItems, setFreeItems] = useState<FreeMediaItem[]>([]);
  const [freeFilter, setFreeFilter] = useState<FreeMediaCategory>("youtube_free");
  const [selectedVideo, setSelectedVideo] = useState<SelectedVideo>(null);

  // 🔥 STEP 2 FIX — SERVER-SIDE FETCH (NO CORS, FULL PLAYLISTS)
  useEffect(() => {
    loadFreeMovies();
  }, []);

  async function loadFreeMovies() {
    setFreeLoading(true);
    setFreeError(null);

    try {
      const res = await fetch("/functions/v1/free-movies");
      if (!res.ok) throw new Error("Edge function failed");

      const yt: FreeMediaItem[] = await res.json();
      const vimeo = vimeoCatalog.getCurated();

      const combined = [...yt, ...vimeo];

      setFreeItems(combined);
    } catch (e) {
      console.error("[FREE_MOVIES_EDGE_FAIL]", e);
      setFreeError("Could not load free movies.");
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
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Lucy Media</h1>
            <p className="text-sm text-muted-foreground">Stream movies, TV shows, and more</p>
          </div>
        </div>
      </header>

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

          {/* FREE MOVIES TAB */}
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
                  {Array.from({ length: 12 }).map((_, i) => (
                    <Skeleton key={i} className="aspect-video rounded-lg" />
                  ))}
                </div>
              )}

              {!freeLoading && freeError && (
                <Card>
                  <CardContent className="pt-6 text-center">
                    <p className="text-destructive">{freeError}</p>
                    <Button onClick={loadFreeMovies} className="mt-4">
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Retry
                    </Button>
                  </CardContent>
                </Card>
              )}

              {!freeLoading && filteredItems.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {filteredItems.map((item) => (
                    <FreeMovieCard key={`${item.provider}:${item.id}`} item={item} onPlay={handlePlayVideo} />
                  ))}
                </div>
              )}

              {!freeLoading && freeItems.length > 0 && (
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
