import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Film, Tv, Clapperboard, Users, Server, Settings, ArrowLeft, Youtube, Globe, Play, Video } from "lucide-react";

// 🔐 MOBILE DEVICE DETECTION (iOS + Android ONLY)
const isMobileDevice = typeof navigator !== "undefined" && /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

export default function Media() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("free");
  const [freeFilter, setFreeFilter] = useState<"youtube" | "public" | "trailers" | "vimeo">("youtube");

  return (
    <div className="min-h-screen bg-background">
      {/* HEADER */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
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
              {/* FILTER BUTTONS */}
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant={freeFilter === "youtube" ? "default" : "outline"}
                  onClick={() => setFreeFilter("youtube")}
                  className="gap-2"
                >
                  <Youtube className="h-4 w-4" />
                  YouTube Movies
                </Button>

                <Button
                  size="sm"
                  variant={freeFilter === "public" ? "default" : "outline"}
                  onClick={() => setFreeFilter("public")}
                  className="gap-2"
                >
                  <Globe className="h-4 w-4" />
                  Public Domain
                </Button>

                <Button
                  size="sm"
                  variant={freeFilter === "trailers" ? "default" : "outline"}
                  onClick={() => setFreeFilter("trailers")}
                  className="gap-2"
                >
                  <Play className="h-4 w-4" />
                  Trailers
                </Button>

                <Button
                  size="sm"
                  variant={freeFilter === "vimeo" ? "default" : "outline"}
                  onClick={() => setFreeFilter("vimeo")}
                  className="gap-2"
                >
                  <Video className="h-4 w-4" />
                  Vimeo
                </Button>
              </div>

              {/* YOUTUBE MOVIES PLAYLIST (DESKTOP INLINE, MOBILE REDIRECT) */}
              {freeFilter === "youtube" && (
                <Card>
                  <CardHeader>
                    <CardTitle>YouTube Movies — Free With Ads</CardTitle>
                    <CardDescription>Official YouTube Movies playlist</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isMobileDevice ? (
                      <Button
                        className="w-full h-14 text-lg"
                        onClick={() =>
                          window.open(
                            "https://www.youtube.com/watch?v=GXCmSXMbx64&list=PL8jVTN1qurcMB8yUZfVF2SDBZabAhAOuO",
                            "_blank",
                          )
                        }
                      >
                        ▶️ Watch on YouTube (Mobile Friendly)
                      </Button>
                    ) : (
                      <div className="aspect-video w-full rounded-xl overflow-hidden border">
                        <iframe
                          src="https://www.youtube.com/embed/videoseries?list=PL8jVTN1qurcMB8yUZfVF2SDBZabAhAOuO"
                          title="YouTube Movies Playlist"
                          className="w-full h-full"
                          allow="autoplay; encrypted-media; picture-in-picture"
                          allowFullScreen
                        />
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* PLACEHOLDERS FOR OTHER FILTERS */}
              {freeFilter !== "youtube" && (
                <Card>
                  <CardContent className="pt-6 text-center">
                    <Clapperboard className="h-12 w-12 mx-auto text-muted-foreground" />
                    <p className="mt-2 font-medium">
                      {freeFilter === "public" && "Public domain movies coming next"}
                      {freeFilter === "trailers" && "Trailers coming soon"}
                      {freeFilter === "vimeo" && "Vimeo films coming soon"}
                    </p>
                    <Badge className="mt-3" variant="secondary">
                      Coming Soon
                    </Badge>
                  </CardContent>
                </Card>
              )}

              <div className="flex justify-end text-sm text-muted-foreground pt-4 border-t">
                <Badge variant="outline">No API key required</Badge>
              </div>
            </div>
          </TabsContent>

          {/* OTHER TABS (UNCHANGED PLACEHOLDERS) */}
          <TabsContent value="movies">
            <Card>
              <CardHeader>
                <CardTitle>Movies</CardTitle>
                <CardDescription>Connect to Plex or browse free movies</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Movies from connected services will appear here.</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tv">
            <Card>
              <CardHeader>
                <CardTitle>TV Shows</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">TV content coming soon.</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="party">
            <Card>
              <CardHeader>
                <CardTitle>Watch Party</CardTitle>
              </CardHeader>
              <CardContent>
                <Button disabled>Coming Soon</Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="plex">
            <Card>
              <CardHeader>
                <CardTitle>My Plex</CardTitle>
              </CardHeader>
              <CardContent>
                <Button disabled>Connect Plex (Coming Soon)</Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Media Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <Badge variant="secondary">Coming Soon</Badge>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
