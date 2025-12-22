// =========================================================
// 🎧 EXPLORE PLAYLISTS — FULL FILE (NON-DESTRUCTIVE)
// File: src/data/explorePlaylists.ts
// =========================================================

export type ExplorePlaylist = {
  id: string;
  title: string;
  subtitle: string;
  spotifyEmbedUrl: string;
  category:
    | "trap"
    | "lofi"
    | "rnb-90s"
    | "rnb-80s"
    | "rnb-70s"
    | "dallas-drill"
    | "new-dallas"
    | "hiphop-editorial"
    | "chill"
    | "focus";
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
    subtitle: "Confidence, boss energy, full tracks",
    spotifyEmbedUrl: "https://open.spotify.com/embed/playlist/37i9dQZF1DX7ZUug1ANKRP",
    category: "hiphop-editorial",
  },
];

// =========================================================
// 🔥 TRAP (FULL SONG EDITORIAL)
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
    id: "trap-heat",
    title: "Trap Heat",
    subtitle: "Modern trap bangers",
    spotifyEmbedUrl: "https://open.spotify.com/embed/playlist/37i9dQZF1DXaW0vNOq2Cz0",
    category: "trap",
  },
  {
    id: "street-heat",
    title: "Street Heat",
    subtitle: "Raw street energy",
    spotifyEmbedUrl: "https://open.spotify.com/embed/playlist/37i9dQZF1DX5fwlF6KQw5S",
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
// 🌆 DALLAS DRILL (CURATED / FULL TRACKS WHERE AVAILABLE)
// =========================================================
export const dallasDrill: ExplorePlaylist[] = [
  {
    id: "dallas-drill",
    title: "Dallas Drill",
    subtitle: "DFW drill & underground energy",
    spotifyEmbedUrl: "https://open.spotify.com/embed/playlist/3KZ8nHn5rJpNwz3pXxU0pG",
    category: "dallas-drill",
  },
  {
    id: "dfw-street-rap",
    title: "DFW Street Rap",
    subtitle: "Dallas–Fort Worth street sound",
    spotifyEmbedUrl: "https://open.spotify.com/embed/playlist/6lYx9jzK5u4F2P0QJkT9xP",
    category: "dallas-drill",
  },
];

// =========================================================
// 🌆 NEW DALLAS ARTISTS (CURATED)
// =========================================================
export const newDallas: ExplorePlaylist[] = [
  {
    id: "new-dallas",
    title: "New Dallas",
    subtitle: "Next wave of Dallas artists",
    spotifyEmbedUrl: "https://open.spotify.com/embed/playlist/5f8E8K8UjvM1dD9Qx9k8mD",
    category: "new-dallas",
  },
  {
    id: "texas-new-heat",
    title: "Texas New Heat",
    subtitle: "Rising artists across Texas",
    spotifyEmbedUrl: "https://open.spotify.com/embed/playlist/37i9dQZF1DX6tTW0xDxScH",
    category: "new-dallas",
  },
];

// =========================================================
// 🎶 R&B — 1990s SLOW JAMS (FULL SONG PLAYLISTS)
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
// 🎶 R&B — 1970s SOUL
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
// 🌊 LO-FI / CHILL / FOCUS
// =========================================================
export const lofiChill: ExplorePlaylist[] = [
  {
    id: "lofi-beats",
    title: "Lo-Fi Beats",
    subtitle: "Chill beats to relax & study",
    spotifyEmbedUrl: "https://open.spotify.com/embed/playlist/37i9dQZF1DXdLK5lj7o4vM",
    category: "lofi",
  },
  {
    id: "chillhop",
    title: "Chillhop Essentials",
    subtitle: "Smooth lo-fi & chillhop",
    spotifyEmbedUrl: "https://open.spotify.com/embed/playlist/37i9dQZF1DX2yvmlOdMYzV",
    category: "lofi",
  },
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
// 🧠 MASTER EXPORT — USED BY EXPLORE MODE
// =========================================================
export const explorePlaylists = {
  hipHopEditorial,
  trapPlaylists,
  dallasDrill,
  newDallas,
  rnb90s,
  rnb80s,
  rnb70s,
  lofiChill,
};
