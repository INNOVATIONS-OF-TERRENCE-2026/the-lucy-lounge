// =========================================================
// 🎧 EXPLORE PLAYLISTS — FULL FILE (CLEANED)
// File: src/data/explorePlaylists.ts
// =========================================================

export type ExplorePlaylist = {
  id: string;
  title: string;
  subtitle: string;
  spotifyEmbedUrl: string;
  category: "trap" | "rnb-90s" | "rnb-80s" | "rnb-70s" | "hiphop-editorial" | "chill" | "focus";
};

// =========================================================
// 🔥 HIP-HOP / RAP EDITORIAL (FULL SONG PLAYLISTS)
// =========================================================
export const hipHopEditorial: ExplorePlaylist[] = [
  {
    id: "rap-caviar",
    title: "Rap Caviar",
    subtitle: "Top-tier hip-hop editorial (full tracks)",
    spotifyEmbedUrl: "https://open.spotify.com/embed/playlist/37i9dQZF1DX0XUsuxWHRQd",
    category: "hiphop-editorial",
  },
  {
    id: "most-necessary",
    title: "Most Necessary",
    subtitle: "Essential hip-hop right now",
    spotifyEmbedUrl: "https://open.spotify.com/embed/playlist/37i9dQZF1DX2RxBh64BHjQ",
    category: "hiphop-editorial",
  },
  {
    id: "signed-xoxo",
    title: "Signed XOXO",
    subtitle: "New hip-hop & emerging voices",
    spotifyEmbedUrl: "https://open.spotify.com/embed/playlist/37i9dQZF1DWU0ScTcjJBdj",
    category: "hiphop-editorial",
  },
  {
    id: "feelin-myself",
    title: "Feelin’ Myself",
    subtitle: "Confidence, boss energy",
    spotifyEmbedUrl: "https://open.spotify.com/embed/playlist/37i9dQZF1DX7ZUug1ANKRP",
    category: "hiphop-editorial",
  },
];

// =========================================================
// 🔥 TRAP (CLEANED — NO STREET / HEAT)
// =========================================================
export const trapPlaylists: ExplorePlaylist[] = [
  {
    id: "trap-classics",
    title: "Trap Classics",
    subtitle: "Foundations of trap music",
    spotifyEmbedUrl: "https://open.spotify.com/embed/playlist/37i9dQZF1DWY4xHQp97fN6",
    category: "trap",
  },
  {
    id: "dirty-south",
    title: "Dirty South Classics",
    subtitle: "Southern trap roots",
    spotifyEmbedUrl: "https://open.spotify.com/embed/playlist/37i9dQZF1DWZjqjZMudx9T",
    category: "trap",
  },
];

// =========================================================
// 🎶 R&B — 1990s
// =========================================================
export const rnb90s: ExplorePlaylist[] = [
  {
    id: "90s-rnb-slow-jams",
    title: "90s R&B Slow Jams",
    subtitle: "Classic love songs & slow vibes",
    spotifyEmbedUrl: "https://open.spotify.com/embed/playlist/37i9dQZF1DX6VDO8a6cQME",
    category: "rnb-90s",
  },
  {
    id: "throwback-rnb",
    title: "Throwback R&B",
    subtitle: "90s & early 2000s R&B",
    spotifyEmbedUrl: "https://open.spotify.com/embed/playlist/37i9dQZF1DX4SBhb3fqCJd",
    category: "rnb-90s",
  },
];

// =========================================================
// 🎶 R&B — 1980s
// =========================================================
export const rnb80s: ExplorePlaylist[] = [
  {
    id: "80s-rnb",
    title: "80s R&B Classics",
    subtitle: "Golden era R&B & soul",
    spotifyEmbedUrl: "https://open.spotify.com/embed/playlist/37i9dQZF1DX2vYju3i0lNX",
    category: "rnb-80s",
  },
];

// =========================================================
// 🎶 R&B — 1970s
// =========================================================
export const rnb70s: ExplorePlaylist[] = [
  {
    id: "70s-soul",
    title: "70s Soul & R&B",
    subtitle: "Timeless soul classics",
    spotifyEmbedUrl: "https://open.spotify.com/embed/playlist/37i9dQZF1DWVlYsZJXqdym",
    category: "rnb-70s",
  },
];

// =========================================================
// 🌿 CHILL / FOCUS (NO LO-FI BEATS)
// =========================================================
export const chillFocus: ExplorePlaylist[] = [
  {
    id: "deep-focus",
    title: "Deep Focus",
    subtitle: "Music for deep concentration",
    spotifyEmbedUrl: "https://open.spotify.com/embed/playlist/37i9dQZF1DWZeKCadgRdKQ",
    category: "focus",
  },
  {
    id: "brain-food",
    title: "Brain Food",
    subtitle: "Focus-enhancing tracks",
    spotifyEmbedUrl: "https://open.spotify.com/embed/playlist/37i9dQZF1DWXLeA8Omikj7",
    category: "focus",
  },
];

// =========================================================
// 🧠 MASTER EXPORT
// =========================================================
export const explorePlaylists = {
  hipHopEditorial,
  trapPlaylists,
  rnb90s,
  rnb80s,
  rnb70s,
  chillFocus,
};
