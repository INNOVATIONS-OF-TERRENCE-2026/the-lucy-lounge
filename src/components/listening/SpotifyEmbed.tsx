import { memo } from "react";

/**
 * =========================================================
 * SpotifyEmbed
 * =========================================================
 * Centralized iframe renderer for all Spotify content:
 * - Editorial playlists (full songs where allowed)
 * - Albums / singles / EPs (preview where applicable)
 * - Used across Listening Mode (legacy + new UI)
 * =========================================================
 */

export interface SpotifyEmbedProps {
  embedUrl: string;
  title: string;
  height?: number;
}

function SpotifyEmbedComponent({ embedUrl, title, height = 380 }: SpotifyEmbedProps) {
  return (
    <div className="w-full overflow-hidden rounded-xl bg-black">
      <iframe
        title={title}
        src={embedUrl}
        width="100%"
        height={height}
        frameBorder="0"
        loading="lazy"
        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
        referrerPolicy="strict-origin-when-cross-origin"
        className="w-full"
      />
    </div>
  );
}

export const SpotifyEmbed = memo(SpotifyEmbedComponent);
SpotifyEmbed.displayName = "SpotifyEmbed";
