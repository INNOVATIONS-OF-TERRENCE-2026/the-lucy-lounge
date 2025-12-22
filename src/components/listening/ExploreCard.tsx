import { motion } from "framer-motion";
import { ExternalLink, Play } from "lucide-react";
import { cn } from "@/lib/utils";

export type ExploreCardProps = {
  title: string;
  subtitle: string;
  spotifyId: string;
  fullTrackFriendly?: boolean;
  accent?: string;
};

export function ExploreCard({
  title,
  subtitle,
  spotifyId,
  fullTrackFriendly = false,
  accent = "from-primary/20 to-primary/5",
}: ExploreCardProps) {
  const embedSrc = `https://open.spotify.com/embed/playlist/${spotifyId}`;
  const spotifyAppLink = `https://open.spotify.com/playlist/${spotifyId}`;

  return (
    <motion.div
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      className="relative min-w-[260px] max-w-[260px] rounded-xl overflow-hidden border border-border/50 bg-background shadow-sm"
    >
      {/* Header */}
      <div className={cn("p-4 bg-gradient-to-br", accent)}>
        <h3 className="font-semibold text-foreground leading-tight line-clamp-2">
          {title}
        </h3>
        <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
          {subtitle}
        </p>
      </div>

      {/* Embed */}
      <div className="bg-black">
        <iframe
          src={embedSrc}
          width="100%"
          height={152}
          frameBorder="0"
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          loading="lazy"
        />
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between gap-2 p-3 border-t border-border/50">
        <div className="text-[10px] text-muted-foreground">
          {fullTrackFriendly ? "Full tracks available" : "Preview playback"}
        </div>

        <div className="flex items-center gap-2">
          <a
            href={spotifyAppLink}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium bg-muted hover:bg-muted/70 transition"
            aria-label="Open in Spotify"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Spotify
          </a>

          <button
            className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium bg-primary text-primary-foreground hover:opacity-90 transition"
            aria-label="Play in Lucy"
          >
            <Play className="w-3.5 h-3.5" />
            Play
          </button>
        </div>
      </div>
    </motion.div>
  );
}
