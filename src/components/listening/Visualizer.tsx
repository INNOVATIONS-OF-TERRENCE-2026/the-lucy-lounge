import React, { useEffect, useMemo } from "react";

/**
 * =========================================================
 * Visualizer
 * =========================================================
 * Lightweight, futuristic ambient visual layer for Listening Mode.
 * - Decorative only (no audio capture)
 * - Performance-safe on mobile
 * - Reacts to mood + playback state
 * =========================================================
 */

export interface VisualizerProps {
  mood?: "focus" | "chill" | "rnb" | "rap" | "ambient" | "lofi" | "all";
  isActive?: boolean;
}

export function Visualizer({
  mood = "all",
  isActive = true,
}: VisualizerProps) {
  const gradient = useMemo(() => {
    switch (mood) {
      case "focus":
        return "from-indigo-500/20 via-blue-500/10 to-transparent";
      case "chill":
        return "from-cyan-400/20 via-sky-500/10 to-transparent";
      case "rnb":
        return "from-pink-500/20 via-rose-500/10 to-transparent";
      case "rap":
        return "from-amber-500/20 via-orange-500/10 to-transparent";
      case "ambient":
        return "from-emerald-500/20 via-teal-500/10 to-transparent";
      case "lofi":
        return "from-violet-500/20 via-purple-500/10 to-transparent";
      default:
        return "from-slate-500/20 via-slate-400/10 to-transparent";
    }
  }, [mood]);

  useEffect(() => {
    // Hook for future enhancements (e.g., motion sync)
  }, [mood, isActive]);

  if (!isActive) return null;

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
    >
      {/* Soft animated gradient wash */}
      <div
        className={`absolute inset-0 bg-gradient-to-b ${gradient} animate-pulse`}
      />

      {/* Subtle grain overlay */}
      <div className="absolute inset-0 opacity-[0.04] mix-blend-overlay bg-[radial-gradient(#000_1px,transparent_1px)] bg-[length:6px_6px]" />
    </div>
  );
}
