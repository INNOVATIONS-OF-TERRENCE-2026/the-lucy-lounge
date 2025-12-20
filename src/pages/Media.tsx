import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Film,
  Tv,
  Clapperboard,
  Users,
  Server,
  Settings,
  ArrowLeft,
  Youtube,
} from "lucide-react";

/* 🔐 Mobile device detection (iOS + Android only) */
const isMobileDevice =
  typeof navigator !== "undefined" &&
  /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

/* 🎬 YOUR PLAYLISTS */
const PLAYLISTS = [
  { title: "Free Family Movies", id: "PLCriYrweK0098Mtl95jNTBNPdgGj26RXK" },
  { title: "Free Movies & Shows", id: "PLX9_I-EOJPdHZJDzvjjRjpj86ClhZSsVm" },
  { title: "Nicktoons Full Episodes", id: "PLUQR09yEYrP0RaHE3f9vNQkOx08IT9ZTe" },
  { title: "CatDog Full Episodes", id: "PLfrgt_xI4Xq2Cg78vsEjqEs-aJv1HQmO0" },
  { title: "Fresh Prince of Bel-Air", id: "PLRDC-DZ_uWhrOMCryr5YU--MrsZPL9sb3" },
  { title: "Classic Cartoons", id: "PLx78q5BVTkpxxgNBfyMHWEyJRRhiw01Un" },
  { title: "Animaniacs – Pinky & The Brain", id: "PLd3-CCCcbQeJSROdd9rf5YV996HwYdEDL" },
  { title: "Animaniacs – WB Kids", id: "PLfrgt_xI4Xq0GvPClEj57Xhl1vt8Ww5fZ" },
  { title: "Courage the Cowardly Dog", id: "PLLIU9nFd9IrGmATWUdDgpsMzTAMgDXrNp" },
];

/* 🎥 YOUR SINGLE MOVIES / EPISODES */
const SINGLES = [
  { title: "Casper's Haunted Christmas", id: "hr2rI0qn5EA" },
  { title: "SpongeBob Classic Marathon", id: "8B8jplhrlso" },
  { title: "SpongeBob Season 2", id: "pr80hyFCeGY" },
  { title: "Ed, Edd n Eddy – Full Episode", id: "X-HRLChOTOA" },
  { title: "Courage – Muriel’s Swampy Love Story", id: "uAVQgEXrZZU" },
  { title: "Dexter’s Laboratory", id: "3bLNQgRn-Wg" },
  { title: "Powerpuff Girls", id: "c0KlvkCKpE4" },
  { title: "Recess (Disney)", id: "-UtUuT8AJjQ" },
  { title: "That’s So Raven – Full Episode", id: "Tr7FcIvjVc4" },
  { title: "Django", id: "ZxHLuzOnVNo" },
  { title: "First Sunday", id: "3Aky7idipRk" },
  { title: "Norbit", id: "-lbDPdksl-E" },
  { title: "Gotti", id: "twW1G_yji5Q" },
  { title: "Dumb and Dumber To", id: "TTgsopmTDG8" },
  { title: "ATL", id: "ybzh6_5GFD0" },
  { title: "The New Edition Story", id: "Iz7PQsBYM7g" },
  { title: "Bonus Movie 1", id: "di2rSFQ-AvA" },
  { title: "Bonus Movie 2", id: "f-Qnyvek5rE" },
  { title: "Bonus Movie 3", id: "vBzxrvTl-ik" },
  { title: "Bonus Movie 4", id: "Xs3YxSIRVi8" },
  { title: "Bonus Movie 5", id: "mhcMts3LdWA" },
  { title: "Bonus Movie 6", id: "22W83FgIX54" },
  { title: "Bonus Movie 7", id: "JmKS9WCTuZg" },
  { title: "Bonus Movie 8", id: "LRsBEtYNffU" },
  { title: "Bonus Movie 9", id: "57YMa7kaZCA" },
  { title: "Bonus Movie 10", id: "jKzn3qyq7Yk" },
  { title: "Bonus Movie 11", id: "A2J1Q1fa3Rg" },
];

export default function Media() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("free");

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
            <p className="text-sm text-muted-foreground">
              Watch movies, shows & cartoons
            </p>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-6 mb-6">
            <TabsTrigger value="movies"><Film className="h-4 w-4" /> Movies</TabsTrigger>
            <TabsTrigger value="tv"><Tv className="h-4 w-4" /> TV</TabsTrigger>
            <TabsTrigger value="free"><Clapperboard className="h-4 w-4" /> Free</TabsTrigger>
            <TabsTrigger value="party"><Users className="h-4 w-4" /> Party</TabsTrigger>
            <TabsTrigger value="plex"><Server className="h-4 w-4" /> Plex</TabsTrigger>
            <TabsTrigger value="settings"><Settings className="h-4 w-4" /> Settings</TabsTrigger>
          </TabsList>

          {/* FREE MEDIA */}
          <TabsContent value="free" className="space-y-8">
            {/* PLAYLISTS */}
            {PLAYLISTS.map((pl) => (
              <Card key={pl.id}>
                <CardHeader>
                  <CardTitle>{pl.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  {isMobileDevice ? (
                    <Button
                      className="w-full"
                      onClick={() =>
                        window.open(
                          `https://www.youtube.com/playlist?list=${pl.id}`,
                          "_blank"
                        )
                      }
                    >
                      ▶️ Open Playlist on YouTube
                    </Button>
                  ) : (
                    <div className="aspect-video rounded-xl overflow-hidden border">
                      <iframe
                        src={`https://www.youtube.com/embed/videoseries?list=${pl.id}`}
                        className="w-full h-full"
                        allow="encrypted-media; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}

            {/* SINGLE MOVIES */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {SINGLES.map((m) => (
                <Card key={m.id}>
                  <CardContent className="p-0">
                    {isMobileDevice ? (
                      <Button
                        className="w-full h-14"
                        onClick={() =>
                          window.open(
                            `https://www.youtube.com/watch?v=${m.id}`,
                            "_blank"
                          )
                        }
                      >
                        ▶️ {m.title}
                      </Button>
                    ) : (
                      <div className="aspect-video">
                        <iframe
                          src={`https://www.youtube.com/embed/${m.id}`}
                          className="w-full h-full"
                          allow="encrypted-media; picture-in-picture"
                          allowFullScreen
                        />
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="flex justify-end">
              <Badge variant="outline">YouTube • Free with ads</Badge>
            </div>
          </TabsContent>

          {/* PLACEHOLDER TABS */}
          <TabsContent value="movies"><Card><CardContent>Coming Soon</CardContent></Card></TabsContent>
          <TabsContent value="tv"><Card><CardContent>Coming Soon</CardContent></Card></TabsContent>
          <TabsContent value="party"><Card><CardContent>Coming Soon</CardContent></Card></TabsContent>
          <TabsContent value="plex"><Card><CardContent>Coming Soon</CardContent></Card></TabsContent>
          <TabsContent value="settings"><Card><CardContent>Coming Soon</CardContent></Card></TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
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
