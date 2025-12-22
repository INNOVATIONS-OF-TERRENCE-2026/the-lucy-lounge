import React, { useEffect, useState } from "react";
import { ChevronUp, Pause, Play } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * =========================================================
 * MiniPlayer
 * =========================================================
 * Persistent bottom mini-player shell for Listening Mode.
 * - Does NOT control Spotify iframe directly (policy-safe)
 * - Provides UX continuity and quick return to Listening Mode
 * - Designed for mobile-first usage
 * =========================================================
 */

export interface MiniPlayerProps {
  title?: string;
  subtitle?: string;
  isPlaying?: boolean;
  onPlayPause?: () => void;
  onExpand?: () => void;
}

export function MiniPlayer({
  title = "Listening Mode",
  subtitle = "Tap to return",
  isPlaying = false,
  onPlayPause,
  onExpand,
}: MiniPlayerProps) {
  const [visible, setVisible] = useState(false);

  // Show mini-player after first interaction
  useEffect(() => {
    setVisible(true);
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 inset-x-0 z-50">
      <div className="mx-auto max-w-3xl px-3 pb-3">
        <div className="flex items-center justify-between gap-3 rounded-2xl border bg-background/90 backdrop-blur shadow-lg p-3">
          {/* Info */}
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-medium truncate">
              {title}
            </span>
            <span className="text-xs opacity-70 truncate">
              {subtitle}
            </span>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2">
            <Button
              size="icon"
              variant="ghost"
              onClick={onPlayPause}
              aria-label="Play / Pause"
            >
              {isPlaying ? (
                <Pause className="w-4 h-4" />
              ) : (
                <Play className="w-4 h-4" />
              )}
            </Button>

            <Button
              size="icon"
              variant="ghost"
              onClick={onExpand}
              aria-label="Expand player"
            >
              <ChevronUp className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
