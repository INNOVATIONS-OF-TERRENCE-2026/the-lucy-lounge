import { forwardRef, useImperativeHandle, useRef, useState } from "react";

export interface SpotifyAudioHostRef {
  setPlaylist: (spotifyId: string, type?: 'playlist' | 'album') => void;
  getIframe: () => HTMLIFrameElement | null;
}

const genreToSpotifyId: Record<string, { id: string; type: 'playlist' | 'album' }> = {
  lofi: { id: '0vvXsWCC9xrXsKd4FyS8kM', type: 'playlist' }, // Lo-Fi Beats
  jazz: { id: '37i9dQZF1DWV7EzJMK2FUI', type: 'playlist' }, // Jazz Vibes
  rnb: { id: '37i9dQZF1DWXnexX7CktaI', type: 'playlist' }, // R&B Mix
  ambient: { id: '37i9dQZF1DWYoYGBbGKurt', type: 'playlist' }, // Ambient Chill
};

export const getSpotifyEmbedUrl = (genre: string): string => {
  const data = genreToSpotifyId[genre] || genreToSpotifyId.lofi;
  return `https://open.spotify.com/embed/${data.type}/${data.id}?utm_source=generator&theme=0`;
};

export const SpotifyAudioHost = forwardRef<SpotifyAudioHostRef>((_, ref) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [currentSrc, setCurrentSrc] = useState(getSpotifyEmbedUrl('lofi'));

  useImperativeHandle(ref, () => ({
    setPlaylist: (spotifyId: string, type: 'playlist' | 'album' = 'playlist') => {
      const newSrc = `https://open.spotify.com/embed/${type}/${spotifyId}?utm_source=generator&theme=0`;
      setCurrentSrc(newSrc);
    },
    getIframe: () => iframeRef.current,
  }));

  return (
    <iframe
      ref={iframeRef}
      src={currentSrc}
      width="300"
      height="80"
      frameBorder="0"
      allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
      loading="lazy"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        opacity: 0,
        pointerEvents: 'none',
        zIndex: -1,
      }}
      title="Spotify Audio Host"
    />
  );
});

SpotifyAudioHost.displayName = 'SpotifyAudioHost';
