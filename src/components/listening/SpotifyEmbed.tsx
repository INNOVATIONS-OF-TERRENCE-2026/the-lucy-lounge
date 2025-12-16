interface SpotifyEmbedProps {
  playlistId: string;
  title?: string;
}

export const SpotifyEmbed = ({ playlistId, title }: SpotifyEmbedProps) => {
  return (
    <iframe
      data-testid="embed-iframe"
      title={title || "Spotify Playlist"}
      style={{ borderRadius: '12px' }}
      src={`https://open.spotify.com/embed/playlist/${playlistId}?utm_source=generator`}
      width="100%"
      height="352"
      frameBorder="0"
      allowFullScreen
      allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
      loading="lazy"
    />
  );
};
