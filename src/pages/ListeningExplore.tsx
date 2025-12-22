import { useNavigate } from "react-router-dom";
import { ArrowLeft, Compass } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ExploreRow } from "@/components/listening/ExploreRow";
import {
  explorePlaylists,
  getExploreByCategory,
} from "@/data/explorePlaylists";

export default function ListeningExplore() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b border-border/50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/listening")}
              aria-label="Back to Library"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>

            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Compass className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Explore</h1>
                <p className="text-sm text-muted-foreground">
                  Discover playlists, moods, and local energy
                </p>
              </div>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/")}
          >
            Home
          </Button>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-8 space-y-12">
        {/* Editorial */}
        <ExploreRow
          title="🔥 Editorial Picks"
          subtitle="Spotify-curated playlists that play full tracks"
          playlists={getExploreByCategory("editorial")}
        />

        {/* Rap / Trap */}
        <ExploreRow
          title="💣 Trap & Rap"
          subtitle="High-energy hip-hop, street anthems, and boss vibes"
          playlists={[
            ...getExploreByCategory("trap"),
            ...getExploreByCategory("rap"),
          ]}
        />

        {/* R&B */}
        <ExploreRow
          title="❤️ R&B Vibes"
          subtitle="Smooth R&B from classic to modern"
          playlists={getExploreByCategory("rnb")}
        />

        {/* Eras */}
        <ExploreRow
          title="🕰️ Timeless Eras"
          subtitle="70s, 80s, and 90s soul & R&B"
          playlists={getExploreByCategory("eras")}
        />

        {/* Lo-Fi / Chill */}
        <ExploreRow
          title="🌿 Lo-Fi & Chill"
          subtitle="Study, relax, and late-night vibes"
          playlists={[
            ...getExploreByCategory("lofi"),
            ...getExploreByCategory("chill"),
          ]}
        />

        {/* Focus / Ambient */}
        <ExploreRow
          title="🧠 Focus & Ambient"
          subtitle="Deep work, clarity, and calm soundscapes"
          playlists={[
            ...getExploreByCategory("focus"),
            ...getExploreByCategory("ambient"),
          ]}
        />

        {/* Dallas */}
        <ExploreRow
          title="🏙️ Dallas Energy"
          subtitle="Local drill and next-up Dallas artists"
          playlists={getExploreByCategory("dallas")}
        />
      </main>
    </div>
  );
}
