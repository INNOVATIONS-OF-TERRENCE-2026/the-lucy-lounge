import { ExploreCard } from "./ExploreCard";
import type { ExplorePlaylist } from "@/data/explorePlaylists";

type ExploreRowProps = {
  title: string;
  subtitle?: string;
  playlists: ExplorePlaylist[];
};

export function ExploreRow({ title, subtitle, playlists }: ExploreRowProps) {
  if (!playlists || playlists.length === 0) return null;

  return (
    <section className="space-y-3">
      {/* Header */}
      <div className="px-1">
        <h2 className="text-lg font-semibold text-foreground">{title}</h2>
        {subtitle && (
          <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
        )}
      </div>

      {/* Horizontal Scroll */}
      <div className="relative">
        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide px-1">
          {playlists.map((playlist) => (
            <ExploreCard
              key={playlist.id}
              title={playlist.title}
              subtitle={playlist.subtitle}
              spotifyId={playlist.spotifyId}
              fullTrackFriendly={playlist.fullTrackFriendly}
              accent={
                playlist.category === "dallas"
                  ? "from-emerald-500/20 to-green-500/5"
                  : playlist.category === "trap"
                  ? "from-red-500/20 to-orange-500/5"
                  : playlist.category === "rnb"
                  ? "from-pink-500/20 to-rose-500/5"
                  : playlist.category === "lofi"
                  ? "from-violet-500/20 to-purple-500/5"
                  : playlist.category === "ambient"
                  ? "from-cyan-500/20 to-teal-500/5"
                  : "from-primary/20 to-primary/5"
              }
            />
          ))}
        </div>
      </div>
    </section>
  );
}
