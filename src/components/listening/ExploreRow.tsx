// =========================================================
// 🎧 EXPLORE ROW — FULLY TYPE-SAFE
// File: src/components/listening/ExploreRow.tsx
// =========================================================

import { motion } from "framer-motion";
import { ExplorePlaylist } from "@/data/explorePlaylists";

type ExploreRowProps = {
  title: string;
  subtitle?: string;
  items: ExplorePlaylist[];
};

export const ExploreRow = ({ title, subtitle, items }: ExploreRowProps) => {
  if (!items || items.length === 0) return null;

  return (
    <section className="space-y-3">
      {/* Header */}
      <div>
        <h2 className="text-lg font-semibold">{title}</h2>
        {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
      </div>

      {/* Horizontal rail */}
      <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
        {items.map((playlist, index) => (
          <motion.div
            key={playlist.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="min-w-[320px] max-w-[320px] rounded-xl overflow-hidden bg-black shadow-md"
          >
            {/* Spotify Embed */}
            <iframe
              title={playlist.title}
              src={playlist.spotifyEmbedUrl}
              width="100%"
              height="380"
              frameBorder="0"
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
              loading="lazy"
            />

            {/* Meta */}
            <div className="p-3 bg-background">
              <h4 className="text-sm font-semibold">{playlist.title}</h4>
              <p className="text-xs text-muted-foreground">{playlist.subtitle}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};
