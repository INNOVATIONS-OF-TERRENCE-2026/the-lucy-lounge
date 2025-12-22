import { useNavigate } from "react-router-dom";
import { ArrowLeft, Compass, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * =========================================================
 * LISTENING EXPLORE MODE
 * =========================================================
 * - Separate discovery page
 * - Spotify editorial + full-track playlists
 * - ZERO coupling to ListeningMode
 * =========================================================
 */

type ExplorePlaylist = {
  title: string;
  subtitle: string;
  spotifyEmbed: string;
  spotifyLink: string;
};

const EDITORIAL: ExplorePlaylist[] = [
  {
    title: "Rap Caviar",
    subtitle: "Spotify flagship hip-hop playlist (full tracks)",
    spotifyEmbed: "https://open.spotify.com/embed/playlist/37i9dQZF1DX0XUsuxWHRQd",
    spotifyLink: "https://open.spotify.com/playlist/37i9dQZF1DX0XUsuxWHRQd",
  },
  {
    title: "Most Necessary",
    subtitle: "Culture-driving hip-hop & street records",
    spotifyEmbed: "https://open.spotify.com/embed/playlist/37i9dQZF1DX2RxBh64BHjQ",
    spotifyLink: "https://open.spotify.com/playlist/37i9dQZF1DX2RxBh64BHjQ",
  },
  {
    title: "Signed XOXO",
    subtitle: "New rap artists on the rise",
    spotifyEmbed: "https://open.spotify.com/embed/playlist/37i9dQZF1DXaQm3ZVg9Z2X",
    spotifyLink: "https://open.spotify.com/playlist/37i9dQZF1DXaQm3ZVg9Z2X",
  },
];

const RNB_ERAS: ExplorePlaylist[] = [
  {
    title: "90s R&B Slow Jams",
    subtitle: "Timeless slow jams & late-night classics",
    spotifyEmbed: "https://open.spotify.com/embed/playlist/37i9dQZF1DX6VDO8a6cQME",
    spotifyLink: "https://open.spotify.com/playlist/37i9dQZF1DX6VDO8a6cQME",
  },
  {
    title: "80s R&B Classics",
    subtitle: "Soulful 80s grooves & legends",
    spotifyEmbed: "https://open.spotify.com/embed/playlist/37i9dQZF1DXbITWG1ZJKYt",
    spotifyLink: "https://open.spotify.com/playlist/37i9dQZF1DXbITWG1ZJKYt",
  },
  {
    title: "70s Soul & R&B",
    subtitle: "Golden era soul music",
    spotifyEmbed: "https://open.spotify.com/embed/playlist/37i9dQZF1DX2UgsUIg75Vg",
    spotifyLink: "https://open.spotify.com/playlist/37i9dQZF1DX2UgsUIg75Vg",
  },
];

const CHILL_FOCUS: ExplorePlaylist[] = [
  {
    title: "Lo-Fi Beats",
    subtitle: "Chill beats to relax & study",
    spotifyEmbed: "https://open.spotify.com/embed/playlist/37i9dQZF1DXdLK5lj7o4vM",
    spotifyLink: "https://open.spotify.com/playlist/37i9dQZF1DXdLK5lj7o4vM",
  },
  {
    title: "Deep Focus",
    subtitle: "Minimal distractions, maximum focus",
    spotifyEmbed: "https://open.spotify.com/embed/playlist/37i9dQZF1DWZeKCadgRdKQ",
    spotifyLink: "https://open.spotify.com/playlist/37i9dQZF1DWZeKCadgRdKQ",
  },
];

function ExploreRow({ title, items }: { title: string; items: ExplorePlaylist[] }) {
  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold">{title}</h2>

      <div className="flex gap-6 overflow-x-auto pb-4">
        {items.map((item) => (
          <div key={item.title} className="min-w-[300px] max-w-[300px] rounded-xl overflow-hidden border bg-black">
            <iframe
              src={item.spotifyEmbed}
              width="100%"
              height="380"
              frameBorder="0"
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
              loading="lazy"
            />

            <div className="p-3 bg-background flex justify-between items-center">
              <div>
                <p className="font-medium text-sm">{item.title}</p>
                <p className="text-xs text-muted-foreground">{item.subtitle}</p>
              </div>

              <a
                href={item.spotifyLink}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-md bg-muted hover:bg-muted/70"
              >
                <ExternalLink className="w-3 h-3" />
                Spotify
              </a>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default function ListeningExplore() {
  const navigate = useNavigate();

  return (
    <main className="w-full min-h-screen px-4 md:px-8 py-6 space-y-10">
      {/* Header */}
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/listening-mode")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>

          <div className="flex items-center gap-2">
            <Compass className="w-6 h-6 text-primary" />
            <h1 className="text-3xl font-bold">Explore</h1>
          </div>
        </div>

        <Button variant="outline" size="sm" onClick={() => navigate("/")}>
          Home
        </Button>
      </header>

      {/* Sections */}
      <ExploreRow title="🔥 Editorial Playlists" items={EDITORIAL} />
      <ExploreRow title="❤️ R&B Eras" items={RNB_ERAS} />
      <ExploreRow title="🌿 Chill & Focus" items={CHILL_FOCUS} />
    </main>
  );
}
