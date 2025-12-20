import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft } from "lucide-react";

/* Mobile detection */
const isMobile = typeof navigator !== "undefined" && /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

/* PLAYLISTS */
const PLAYLISTS = [
  { title: "Free Family Movies", id: "PLCriYrweK0098Mtl95jNTBNPdgGj26RXK" },
  { title: "Free Movies & Shows", id: "PLX9_I-EOJPdHZJDzvjjRjpj86ClhZSsVm" },
  { title: "Nicktoons Full Episodes", id: "PLUQR09yEYrP0RaHE3f9vNQkOx08IT9ZTe" },
  { title: "CatDog Full Episodes", id: "PLfrgt_xI4Xq2Cg78vsEjqEs-aJv1HQmO0" },
  { title: "Fresh Prince of Bel-Air", id: "PLRDC-DZ_uWhrOMCryr5YU--MrsZPL9sb3" },
  { title: "Animaniacs", id: "PLd3-CCCcbQeJSROdd9rf5YV996HwYdEDL" },
  { title: "Courage the Cowardly Dog", id: "PLLIU9nFd9IrGmATWUdDgpsMzTAMgDXrNp" },
];

/* SINGLE MOVIES */
const MOVIES = [
  { title: "Casper's Haunted Christmas", id: "hr2rI0qn5EA" },
  { title: "SpongeBob Marathon", id: "8B8jplhrlso" },
  { title: "Ed, Edd n Eddy", id: "X-HRLChOTOA" },
  { title: "Dexter’s Laboratory", id: "3bLNQgRn-Wg" },
  { title: "Powerpuff Girls", id: "c0KlvkCKpE4" },
  { title: "Recess", id: "-UtUuT8AJjQ" },
  { title: "That’s So Raven", id: "Tr7FcIvjVc4" },
  { title: "Django", id: "ZxHLuzOnVNo" },
  { title: "First Sunday", id: "3Aky7idipRk" },
  { title: "Norbit", id: "-lbDPdksl-E" },
  { title: "ATL", id: "ybzh6_5GFD0" },
];

export default function Media() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* HEADER */}
      <header className="sticky top-0 z-50 bg-background border-b">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Lucy Media</h1>
            <p className="text-sm text-muted-foreground">Free movies & shows</p>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-8">
        {/* PLAYLISTS */}
        {PLAYLISTS.map((pl) => (
          <Card key={pl.id}>
            <CardHeader>
              <CardTitle>{pl.title}</CardTitle>
            </CardHeader>
            <CardContent>
              {isMobile ? (
                <Button
                  className="w-full"
                  onClick={() => window.open(`https://www.youtube.com/playlist?list=${pl.id}`, "_blank")}
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

        {/* MOVIES GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {MOVIES.map((m) => (
            <Card key={m.id}>
              <CardContent className="p-0">
                {isMobile ? (
                  <Button
                    className="w-full h-14"
                    onClick={() => window.open(`https://www.youtube.com/watch?v=${m.id}`, "_blank")}
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
      </main>
    </div>
  );
}
