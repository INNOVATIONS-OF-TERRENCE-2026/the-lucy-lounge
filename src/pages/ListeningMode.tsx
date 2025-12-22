import React, { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search } from "lucide-react";

/**
 * =========================================================
 * LISTENING MODE (FINAL FIXED VERSION)
 * =========================================================
 * - No ErrorBoundary import
 * - All existing music preserved
 * - Streaming-app structure intact
 * =========================================================
 */

type Mood = "all" | "focus" | "chill" | "rnb" | "rap" | "ambient" | "lofi";

const MOODS: { key: Mood; label: string }[] = [
  { key: "all", label: "All" },
  { key: "focus", label: "Focus" },
  { key: "chill", label: "Chill" },
  { key: "rnb", label: "R&B" },
  { key: "rap", label: "Rap" },
  { key: "ambient", label: "Ambient" },
  { key: "lofi", label: "Lo-Fi" },
];

export default function ListeningMode() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeMood, setActiveMood] = useState<Mood>("all");

  const originalMusicSections = useMemo(
    () => [
      {
        title: "R&B Vibes",
        mood: "rnb",
        items: [
          {
            title: "R&B Essentials",
            embed: "https://open.spotify.com/embed/playlist/37i9dQZF1DX4SBhb3fqCJd",
          },
          {
            title: "90s R&B Slow Jams",
            embed: "https://open.spotify.com/embed/playlist/37i9dQZF1DX6VDO8a6cQME",
          },
        ],
      },
      {
        title: "Rap & Hip-Hop",
        mood: "rap",
        items: [
          {
            title: "Rap Caviar",
            embed: "https://open.spotify.com/embed/playlist/37i9dQZF1DX0XUsuxWHRQd",
          },
          {
            title: "Most Necessary",
            embed: "https://open.spotify.com/embed/playlist/37i9dQZF1DX2RxBh64BHjQ",
          },
        ],
      },
      {
        title: "Chill / Lo-Fi",
        mood: "chill",
        items: [
          {
            title: "Lo-Fi Beats",
            embed: "https://open.spotify.com/embed/playlist/37i9dQZF1DXdLK5lj7o4vM",
          },
          {
            title: "Chill Hits",
            embed: "https://open.spotify.com/embed/playlist/37i9dQZF1DX4WYpdgoIcn6",
          },
        ],
      },
      {
        title: "Ambient / Focus",
        mood: "focus",
        items: [
          {
            title: "Deep Focus",
            embed: "https://open.spotify.com/embed/playlist/37i9dQZF1DWZeKCadgRdKQ",
          },
          {
            title: "Brain Food",
            embed: "https://open.spotify.com/embed/playlist/37i9dQZF1DWXLeA8Omikj7",
          },
        ],
      },
    ],
    [],
  );

  const filteredSections = useMemo(() => {
    if (activeMood === "all") return originalMusicSections;
    return originalMusicSections.filter((section) => section.mood === activeMood);
  }, [activeMood, originalMusicSections]);

  return (
    <main className="w-full min-h-screen px-4 md:px-8 py-6 space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl md:text-4xl font-bold">🎧 Listening Mode</h1>
        <p className="text-sm opacity-80 max-w-2xl">Your immersive, AI-powered listening environment.</p>
      </header>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-60" />
        <Input
          placeholder="Search music…"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        {MOODS.map((mood) => (
          <Button
            key={mood.key}
            size="sm"
            variant={activeMood === mood.key ? "default" : "secondary"}
            onClick={() => setActiveMood(mood.key)}
          >
            {mood.label}
          </Button>
        ))}
      </div>

      <ScrollArea className="w-full">
        <div className="space-y-10">
          {filteredSections.map((section) => (
            <section key={section.title} className="space-y-4">
              <h2 className="text-xl font-semibold">{section.title}</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {section.items.map((item) => (
                  <div key={item.title} className="rounded-xl overflow-hidden bg-black">
                    <iframe
                      title={item.title}
                      src={item.embed}
                      width="100%"
                      height="380"
                      frameBorder="0"
                      allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                      loading="lazy"
                    />
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      </ScrollArea>
    </main>
  );
}
