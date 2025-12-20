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

const FILTER_OPTIONS: { value: FreeMediaCategory; label: string; icon: React.ReactNode }[] = [
  { value: "youtube_free", label: "YouTube", icon: <Youtube className="h-4 w-4" /> },
  { value: "public_domain", label: "Public Domain", icon: <Globe className="h-4 w-4" /> },
  { value: "trailers", label: "Trailers", icon: <Play className="h-4 w-4" /> },
  { value: "vimeo", label: "Vimeo", icon: <Video className="h-4 w-4" /> },
];

export default function Media() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("free");

  // Free Movies state
  const [freeLoading, setFreeLoading] = useState(false);
  const [freeError, setFreeError] = useState<string | null>(null);
  const [freeItems, setFreeItems] = useState<FreeMediaItem[]>([]);
  const [freeFilter, setFreeFilter] = useState<FreeMediaCategory>("youtube_free");
  const [selectedVideo, setSelectedVideo] = useState<SelectedVideo>(null);

  // Load free movies on mount
  useEffect(() => {
    loadFreeMovies();
  }, []);

  async function loadFreeMovies() {
    setFreeLoading(true);
    setFreeError(null);
    try {
      const yt = await youtubeCatalog.loadTopFree(120);
      const vimeo = vimeoCatalog.getCurated();
      const combined = [...yt, ...vimeo];
      
      if (combined.length === 0) {
        // Use fallback if RSS completely fails
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
      // For now, show youtube_free items as trailers (placeholder)
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
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate(-1)}
                className="text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Lucy Media</h1>
                <p className="text-sm text-muted-foreground">
                  Stream movies, TV shows, and more
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-6 mb-6">
            <TabsTrigger value="movies" className="gap-2">
              <Film className="h-4 w-4" />
              <span className="hidden sm:inline">Movies</span>
            </TabsTrigger>
            <TabsTrigger value="tv" className="gap-2">
              <Tv className="h-4 w-4" />
              <span className="hidden sm:inline">TV</span>
            </TabsTrigger>
            <TabsTrigger value="free" className="gap-2">
              <Clapperboard className="h-4 w-4" />
              <span className="hidden sm:inline">Free Movies</span>
            </TabsTrigger>
            <TabsTrigger value="party" className="gap-2">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Watch Party</span>
            </TabsTrigger>
            <TabsTrigger value="plex" className="gap-2">
              <Server className="h-4 w-4" />
              <span className="hidden sm:inline">My Plex</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-2">
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">Settings</span>
            </TabsTrigger>
          </TabsList>

          {/* Movies Tab */}
          <TabsContent value="movies">
            <Card>
              <CardHeader>
                <CardTitle>Movies</CardTitle>
                <CardDescription>
                  Connect to Plex or browse free movies in the Free Movies tab
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Movies from your connected services will appear here.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TV Tab */}
          <TabsContent value="tv">
            <Card>
              <CardHeader>
                <CardTitle>TV Shows</CardTitle>
                <CardDescription>
                  Your TV shows and series
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  TV content from your connected services will appear here.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Free Movies Tab */}
          <TabsContent value="free">
            <div className="space-y-6">
              {/* Filter Buttons */}
              <div className="flex flex-wrap gap-2">
                {FILTER_OPTIONS.map((opt) => (
                  <Button
                    key={opt.value}
                    variant={freeFilter === opt.value ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFreeFilter(opt.value)}
                    className="gap-2"
                  >
                    {opt.icon}
                    {opt.label}
                  </Button>
                ))}
              </div>

              {/* Loading State */}
              {freeLoading && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {Array.from({ length: 10 }).map((_, i) => (
                    <div key={i} className="space-y-2">
                      <Skeleton className="aspect-video w-full rounded-lg" />
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  ))}
                </div>
              )}

              {/* Error State */}
              {freeError && !freeLoading && (
                <Card className="border-destructive/50">
                  <CardContent className="pt-6">
                    <div className="flex flex-col items-center gap-4 text-center">
                      <p className="text-destructive">{freeError}</p>
                      <Button onClick={loadFreeMovies} variant="outline" className="gap-2">
                        <RefreshCw className="h-4 w-4" />
                        Retry
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Content Grid */}
              {!freeLoading && filteredItems.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {filteredItems.map((item) => (
                    <FreeMovieCard
                      key={`${item.provider}:${item.id}`}
                      item={item}
                      onPlay={handlePlayVideo}
                    />
                  ))}
                </div>
              )}

              {/* Empty State */}
              {!freeLoading && !freeError && filteredItems.length === 0 && (
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex flex-col items-center gap-4 text-center">
                      <Clapperboard className="h-12 w-12 text-muted-foreground" />
                      <div>
                        <p className="font-medium text-foreground">No content available</p>
                        <p className="text-sm text-muted-foreground">
                          {freeFilter === "vimeo"
                            ? "Vimeo content coming soon"
                            : "Try a different category"}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Stats */}
              {!freeLoading && freeItems.length > 0 && (
                <div className="flex items-center justify-between text-sm text-muted-foreground pt-4 border-t border-border">
                  <span>
                    Showing {filteredItems.length} of {freeItems.length} free titles
                  </span>
                  <Badge variant="outline">No API key required</Badge>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Watch Party Tab */}
          <TabsContent value="party">
            <Card>
              <CardHeader>
                <CardTitle>Watch Party</CardTitle>
                <CardDescription>
                  Watch together with friends in real-time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Create or join a watch party to stream content together.
                </p>
                <Button className="mt-4" disabled>
                  Coming Soon
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* My Plex Tab */}
          <TabsContent value="plex">
            <Card>
              <CardHeader>
                <CardTitle>My Plex</CardTitle>
                <CardDescription>
                  Connect your Plex Media Server
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Link your Plex account to stream your personal media library.
                </p>
                <Button variant="outline" disabled>
                  Connect Plex (Coming Soon)
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Media Settings</CardTitle>
                <CardDescription>
                  Configure your media preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Autoplay trailers</p>
                    <p className="text-sm text-muted-foreground">
                      Automatically play trailers on hover
                    </p>
                  </div>
                  <Badge variant="secondary">Coming Soon</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Default quality</p>
                    <p className="text-sm text-muted-foreground">
                      Set preferred streaming quality
                    </p>
                  </div>
                  <Badge variant="secondary">Coming Soon</Badge>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Embedded Player Modal */}
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
