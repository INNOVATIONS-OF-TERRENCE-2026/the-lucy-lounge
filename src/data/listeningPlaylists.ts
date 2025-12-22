export type PlaybackType = "full" | "preview";

export type ListeningCategory =
  | "hiphop"
  | "trap"
  | "chill"
  | "lofi"
  | "focus"
  | "rnb"
  | "oldschool"
  | "soul"
  | "global"
  | "dallas";

export interface ListeningPlaylist {
  id: string;
  title: string;
  spotifyEmbedUrl: string;
  category: ListeningCategory;
  playbackType: PlaybackType;
  description?: string;
}

/**
 * =========================================================
 * listeningPlaylists
 * =========================================================
 * Editorial-first playlists (full songs where allowed)
 * Local Dallas / Texas preserved
 * No legacy music removed
 * =========================================================
 */

export const listeningPlaylists: ListeningPlaylist[] = [
  // ───────── HIP-HOP / RAP ─────────
  {
    id: "rapcaviar",
    title: "RapCaviar",
    spotifyEmbedUrl: "https://open.spotify.com/embed/playlist/37i9dQZF1DX0XUsuxWHRQd",
    category: "hiphop",
    playbackType: "full",
  },
  {
    id: "most-necessary",
    title: "Most Necessary",
    spotifyEmbedUrl: "https://open.spotify.com/embed/playlist/37i9dQZF1DX2RxBh64BHjQ",
    category: "hiphop",
    playbackType: "full",
  },
  {
    id: "signed-xoxo",
    title: "Signed XOXO",
    spotifyEmbedUrl: "https://open.spotify.com/embed/playlist/37i9dQZF1DX56bqlsMxJYR",
    category: "hiphop",
    playbackType: "full",
  },
  {
    id: "bars",
    title: "Bars",
    spotifyEmbedUrl: "https://open.spotify.com/embed/playlist/37i9dQZF1DWZjqjZMudx9T",
    category: "hiphop",
    playbackType: "full",
  },

  // ───────── TRAP ─────────
  {
    id: "trap-mojito",
    title: "Trap Mojito",
    spotifyEmbedUrl: "https://open.spotify.com/embed/playlist/37i9dQZF1DX8R2g6pWQj4A",
    category: "trap",
    playbackType: "full",
  },

  // ───────── CHILL / LO-FI ─────────
  {
    id: "chill-rap",
    title: "Chill Rap",
    spotifyEmbedUrl: "https://open.spotify.com/embed/playlist/37i9dQZF1DX2TRYkJECvfC",
    category: "chill",
    playbackType: "full",
  },
  {
    id: "lofi-beats",
    title: "Lo-Fi Beats",
    spotifyEmbedUrl: "https://open.spotify.com/embed/playlist/37i9dQZF1DXdLK5lj7o4vM",
    category: "lofi",
    playbackType: "full",
  },

  // ───────── FOCUS ─────────
  {
    id: "deep-focus",
    title: "Deep Focus",
    spotifyEmbedUrl: "https://open.spotify.com/embed/playlist/37i9dQZF1DWZeKCadgRdKQ",
    category: "focus",
    playbackType: "full",
  },
  {
    id: "brain-food",
    title: "Brain Food",
    spotifyEmbedUrl: "https://open.spotify.com/embed/playlist/37i9dQZF1DWXLeA8Omikj7",
    category: "focus",
    playbackType: "full",
  },

  // ───────── R&B / OLD SCHOOL ─────────
  {
    id: "are-and-be",
    title: "Are & Be",
    spotifyEmbedUrl: "https://open.spotify.com/embed/playlist/37i9dQZF1DX4SBhb3fqCJd",
    category: "rnb",
    playbackType: "full",
  },
  {
    id: "all-out-90s-rnb",
    title: "All Out 90s R&B",
    spotifyEmbedUrl: "https://open.spotify.com/embed/playlist/37i9dQZF1DX6VDO8a6cQME",
    category: "oldschool",
    playbackType: "full",
  },
  {
    id: "all-out-80s-rnb",
    title: "All Out 80s R&B",
    spotifyEmbedUrl: "https://open.spotify.com/embed/playlist/37i9dQZF1DXbITWG1ZJKYt",
    category: "oldschool",
    playbackType: "full",
  },
  {
    id: "all-out-70s-soul",
    title: "All Out 70s Soul",
    spotifyEmbedUrl: "https://open.spotify.com/embed/playlist/37i9dQZF1DWY6o0iVZJz6W",
    category: "soul",
    playbackType: "full",
  },

  // ───────── GLOBAL ─────────
  {
    id: "afro-hits",
    title: "Afro Hits",
    spotifyEmbedUrl: "https://open.spotify.com/embed/playlist/37i9dQZF1DX6GwdWRQMQpq",
    category: "global",
    playbackType: "full",
  },
  {
    id: "african-heat",
    title: "African Heat",
    spotifyEmbedUrl: "https://open.spotify.com/embed/playlist/37i9dQZF1DWVY4eLfA3XFQ",
    category: "global",
    playbackType: "full",
  },

  // ───────── DALLAS / TEXAS ─────────
  {
    id: "state-of-texas-hiphop",
    title: "State of Texas Hip-Hop",
    spotifyEmbedUrl: "https://open.spotify.com/embed/playlist/37i9dQZF1DX5Ejj0EkURtP",
    category: "dallas",
    playbackType: "full",
    description: "Editorial Texas hip-hop featuring Dallas artists.",
  },
];
