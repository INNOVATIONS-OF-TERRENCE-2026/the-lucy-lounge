import React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";

/**
 * =========================================================
 * LISTENING MODE — CLASSIC LIBRARY (RESTORED)
 * =========================================================
 * GOAL:
 * - Restore original Listening Mode behavior
 * - Rich Spotify embeds with tracklists + artists
 * - Section-based layout (NOT cards, NOT grids)
 * - No Explore mode yet
 * - No deletions, no abstractions
 * =========================================================
 */

type Section = {
  title: string;
  embeds: {
    title: string;
    src: string;
  }[];
};

const SECTIONS: Section[] = [
  {
    title: "R&B Vibes",
    embeds: [
      {
        title: "R&B Essentials",
        src: "https://open.spotify.com/embed/playlist/37i9dQZF1DX4SBhb3fqCJd",
      },
      {
        title: "I Love My ’90s R&B",
        src: "https://open.spotify.com/embed/playlist/37i9dQZF1DX6VDO8a6cQME",
      },
    ],
  },
  {
    title: "Rap & Hip-Hop",
    embeds: [
      {
        title: "RapCaviar",
        src: "https://open.spotify.com/embed/playlist/37i9dQZF1DX0XUsuxWHRQd",
      },
      {
        title: "Most Necessary",
        src: "https://open.spotify.com/embed/playlist/37i9dQZF1DX2RxBh64BHjQ",
      },
    ],
  },
  {
    title: "Chill & Smooth",
    embeds: [
      {
        title: "Chill Hits",
        src: "https://open.spotify.com/embed/playlist/37i9dQZF1DX4WYpdgoIcn6",
      },
      {
        title: "Lo-Fi Beats",
        src: "https://open.spotify.com/embed/playlist/37i9dQZF1DXdLK5lj7o4vM",
      },
    ],
  },
  {
    title: "Focus & Ambient",
    embeds: [
      {
        title: "Deep Focus",
        src: "https://open.spotify.com/embed/playlist/37i9dQZF1DWZeKCadgRdKQ",
      },
      {
        title: "Brain Food",
        src: "https://open.spotify.com/embed/playlist/37i9dQZF1DWXLeA8Omikj7",
      },
    ],
  },
];

export default function ListeningMode() {
  return (
    <ScrollArea className="w-full h-screen">
      <main className="max-w-5xl mx-auto px-4 md:px-8 py-8 space-y-12">
        {/* Header */}
        <header className="space-y-2">
          <h1 className="text-3xl md:text-4xl font-bold">🎧 Listening Mode</h1>
          <p className="text-sm md:text-base opacity-80">
            Your personal music library — artists, albums, playlists, and track previews powered by Spotify.
          </p>
        </header>

        {/* Sections */}
        {SECTIONS.map((section) => (
          <section key={section.title} className="space-y-6">
            <h2 className="text-xl md:text-2xl font-semibold">{section.title}</h2>

            <div className="flex flex-col gap-6">
              {section.embeds.map((embed) => (
                <div key={embed.title} className="rounded-xl overflow-hidden bg-black">
                  <iframe
                    title={embed.title}
                    src={embed.src}
                    width="100%"
                    height="420"
                    frameBorder="0"
                    allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                    loading="lazy"
                  />
                </div>
              ))}
            </div>
          </section>
        ))}
      </main>
    </ScrollArea>
  );
}
