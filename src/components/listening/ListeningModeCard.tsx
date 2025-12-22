import React from "react";
import { SpotifyEmbed } from "./SpotifyEmbed";

/**
 * =========================================================
 * ListeningModeCard
 * =========================================================
 * Unified card component for all Listening Mode content.
 * - Editorial playlists (full playback)
 * - Albums / singles / EPs (preview where applicable)
 * - Used in both legacy sections and new streaming UI
 * =========================================================
 */

export type PlaybackType = "full" | "preview";

export interface ListeningModeCardProps {
  title: string;
  embedUrl: string;
  playbackType: PlaybackType;
  description?: string;
  height?: number;
}

export function ListeningModeCard({ title, embedUrl, playbackType, description, height }: ListeningModeCardProps) {
  return (
    <div className="w-full rounded-2xl border bg-card p-4 space-y-3 shadow-sm">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <h3 className="text-base font-semibold leading-tight">{title}</h3>

          {description && <p className="text-xs opacity-70">{description}</p>}
        </div>

        {/* Playback badge */}
        <span
          className={`text-[11px] px-2 py-1 rounded-full font-medium whitespace-nowrap ${
            playbackType === "full" ? "bg-green-500/15 text-green-500" : "bg-yellow-500/15 text-yellow-500"
          }`}
        >
          {playbackType === "full" ? "Full Songs" : "Preview"}
        </span>
      </div>

      {/* Spotify Embed */}
      <SpotifyEmbed embedUrl={embedUrl} title={title} height={height} />
    </div>
  );
}
