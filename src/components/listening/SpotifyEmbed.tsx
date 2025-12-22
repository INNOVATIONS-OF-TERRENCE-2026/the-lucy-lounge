interface SpotifyEmbedProps {
  contentId: string;
  type?: 'playlist' | 'album';
  title?: string;
}

export const SpotifyEmbed = ({ contentId, type = 'playlist', title }: SpotifyEmbedProps) => {
  return (
    <iframe
      data-testid="embed-iframe"
      title={title || `Spotify ${type}`}
      style={{ borderRadius: '12px' }}
      src={`https://open.spotify.com/embed/${type}/${contentId}?utm_source=generator`}
      width="100%"
      height="352"
      frameBorder="0"
      allowFullScreen
      allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
      loading="lazy"
    />
  );
};
