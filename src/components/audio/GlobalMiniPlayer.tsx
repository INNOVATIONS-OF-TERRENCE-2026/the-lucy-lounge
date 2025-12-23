import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Headphones, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { useGlobalSpotify } from "@/contexts/GlobalSpotifyContext";
import { explorePlaylists } from "@/data/explorePlaylists";

/* =========================================================
   🔑 BUILD QUICK SWITCH PLAYLISTS FROM EXPLORE DATA
   ========================================================= */

const QUICK_PLAYLISTS = Object.values(explorePlaylists)
  .flat()
  .map((p) => ({
    id: p.id,
    label: p.title,
    spotifyEmbedUrl: p.spotifyEmbedUrl,
    category: p.category,
  }));

/* =========================================================
   LABEL + ACCENT FALLBACKS
   ========================================================= */

const genreLabels: Record<string, string> = {
  "hiphop-editorial": "Hip-Hop",
  trap: "Trap",
  "rnb-90s": "90s R&B",
  "rnb-80s": "80s R&B",
  "rnb-70s": "70s Soul",
  chill: "Chill",
  focus: "Focus",
};

const genreAccentClasses: Record<string, { bg: string; text: string; glow: string; border: string }> = {
  trap: {
    bg: "bg-genre-rap/20",
    text: "text-genre-rap",
    glow: "shadow-[0_0_12px_hsl(var(--genre-rap)/0.3)]",
    border: "border-genre-rap/40",
  },
  "hiphop-editorial": {
    bg: "bg-genre-rap/20",
    text: "text-genre-rap",
    glow: "shadow-[0_0_12px_hsl(var(--genre-rap)/0.3)]",
    border: "border-genre-rap/40",
  },
  "rnb-90s": {
    bg: "bg-genre-rnb/20",
    text: "text-genre-rnb",
    glow: "shadow-[0_0_12px_hsl(var(--genre-rnb)/0.3)]",
    border: "border-genre-rnb/40",
  },
  "rnb-80s": {
    bg: "bg-genre-rnb/20",
    text: "text-genre-rnb",
    glow: "shadow-[0_0_12px_hsl(var(--genre-rnb)/0.3)]",
    border: "border-genre-rnb/40",
  },
  "rnb-70s": {
    bg: "bg-genre-rnb/20",
    text: "text-genre-rnb",
    glow: "shadow-[0_0_12px_hsl(var(--genre-rnb)/0.3)]",
    border: "border-genre-rnb/40",
  },
  chill: {
    bg: "bg-genre-lofi/20",
    text: "text-genre-lofi",
    glow: "shadow-[0_0_12px_hsl(var(--genre-lofi)/0.3)]",
    border: "border-genre-lofi/40",
  },
  focus: {
    bg: "bg-genre-ambient/20",
    text: "text-genre-ambient",
    glow: "shadow-[0_0_12px_hsl(var(--genre-ambient)/0.3)]",
    border: "border-genre-ambient/40",
  },
};

/* =========================================================
   MINI PLAYER
   ========================================================= */

export const GlobalMiniPlayer = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isHovering, setIsHovering] = useState(false);

  const { state, toggleDrawer, setPlayback, openDrawer } = useGlobalSpotify();

  if (!state.currentContentId) return null;

  const accent = genreAccentClasses[state.currentGenre ?? "focus"] ?? genreAccentClasses.focus;

  const label = genreLabels[state.currentGenre ?? "focus"] ?? "Now Playing";

  const handleSelect = (playlist: (typeof QUICK_PLAYLISTS)[number]) => {
    setPlayback(playlist.spotifyEmbedUrl, playlist.id, "playlist");
    openDrawer();
    setIsExpanded(false);
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed bottom-6 right-6 z-40"
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => {
          setIsHovering(false);
          setIsExpanded(false);
        }}
      >
        {/* QUICK SWITCH */}
        {(isExpanded || isHovering) && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className={cn(
              "absolute bottom-full right-0 mb-2 rounded-xl p-2",
              "bg-background/95 backdrop-blur border shadow-xl",
              accent.glow,
            )}
          >
            <p className="text-[10px] uppercase text-muted-foreground px-2 mb-2">Explore Playlists</p>

            <div className="flex flex-wrap gap-1.5 max-w-[260px]">
              {QUICK_PLAYLISTS.map((p) => {
                const a = genreAccentClasses[p.category] ?? accent;

                return (
                  <button
                    key={p.id}
                    onClick={() => handleSelect(p)}
                    className={cn("px-2.5 py-1 rounded-full text-xs border transition", a.bg, a.text, a.border)}
                  >
                    {p.label}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* MAIN BUTTON */}
        <motion.button
          onClick={toggleDrawer}
          onContextMenu={(e) => {
            e.preventDefault();
            setIsExpanded(!isExpanded);
          }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={cn("relative rounded-2xl px-4 py-3", "bg-background/80 backdrop-blur border", accent.glow)}
        >
          <div className="flex items-center gap-3">
            <Headphones className={accent.text} />

            <div className="flex flex-col items-start">
              <span className="text-[10px] uppercase text-muted-foreground">Now Playing</span>
              <span className={cn("text-sm font-medium", accent.text)}>{label}</span>
            </div>

            <ChevronUp className={cn("w-4 h-4 transition", accent.text, (isExpanded || isHovering) && "rotate-180")} />
          </div>
        </motion.button>
      </motion.div>
    </AnimatePresence>
  );
};
