import { useNavigate } from "react-router-dom";
import { ArrowLeft, Compass, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * =========================================================
 * LISTENING EXPLORE MODE (CLEAN)
 * =========================================================
 * - Editorial + era-based playlists
 * - No street / Dallas / lo-fi content
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
    subtitle: "Spotify flagship hip-hop playlist",
    spotifyEmbed: "https://open.spotify.com/embed/playlist/37i9dQZF1DX0XUsuxWHRQd",
    spotifyLink: "https://open.spotify.com/playlist/37i9dQZF1DX0XUsuxWHRQd",
  },
  {
    title: "Most Necessary",
    subtitle: "Culture-driving hip-hop records",
    spotifyEmbed: "https://open.spotify.com/embed/playlist/37i9dQZF1DX2RxBh64BHjQ",
    spotifyLink: "https://open.spotify.com/playlist/37i9dQZF1DX2RxBh64BHjQ",
  },
  {
    title: "Signed XOXO",
    subtitle: "New rap artists on the rise",
    spotifyEmbed: "https://open.spotify.com/embed/playlist/37i9dQZF1DWU0ScTcjJBdj",
    spotifyLink: "https://open.spotify.com/playlist/37i9dQZF1DWU0ScTcjJBdj",
  },
];

const RNB_ERAS: ExplorePlaylist[] = [
  {
    title: "90s R&B Slow Jams",
    subtitle: "Timeless slow jams",
    spotifyEmbed: "https://open.spotify.com/embed/playlist/37i9dQZF1DX6VDO8a6cQME",
    spotifyLink: "https://open.spotify.com/playlist/37i9dQZF1DX6VDO8a6cQME",
  },
  {
    title: "80s R&B Classics",
    subtitle: "Golden era R&B & soul",
    spotifyEmbed: "https://open.spotify.com/embed/playlist/37i9dQZF1DX2vYju3i0lNX",
    spotifyLink: "https://open.spotify.com/playlist/37i9dQZF1DX2vYju3i0lNX",
  },
  {
    title: "70s Soul & R&B",
    subtitle: "Timeless soul classics",
    spotifyEmbed: "https://open.spotify.com/embed/playlist/37i9dQZF1DWVlYsZJXqdym",
    spotifyLink: "https://open.spotify.com/playlist/37i9dQZF1DWVlYsZJXqdym",
  },
];

const FOCUS: ExplorePlaylist[] = [
  {
    title: "Deep Focus",
    subtitle: "Minimal distractions, maximum focus",
    spotifyEmbed: "https://open.spotify.com/embed/playlist/37i9dQZF1DWZeKCadgRdKQ",
    spotifyLink: "https://open.spotify.com/playlist/37i9dQZF1DWZeKCadgRdKQ",
  },
  {
    title: "Brain Food",
    subtitle: "Music to stay sharp",
    spotifyEmbed: "https://open.spotify.com/embed/playlist/37i9dQZF1DWXLeA8Omikj7",
    spotifyLink: "https://open.spotify.com/playlist/37i9dQZF1DWXLeA8Omikj7",
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

      <ExploreRow title="🔥 Editorial Playlists" items={EDITORIAL} />
      <ExploreRow title="❤️ R&B Eras" items={RNB_ERAS} />
      <ExploreRow title="🧠 Focus" items={FOCUS} />
    </main>
  );
}
