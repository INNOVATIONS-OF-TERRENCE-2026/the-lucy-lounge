// src/data/explorePlaylists.ts

export type ExploreCategory =
  | "editorial"
  | "rap"
  | "trap"
  | "rnb"
  | "lofi"
  | "ambient"
  | "focus"
  | "chill"
  | "eras"
  | "dallas";

export type ExplorePlaylist = {
  id: string;
  title: string;
  subtitle: string;
  spotifyId: string;
  type: "playlist";
  category: ExploreCategory;
  fullTrackFriendly?: boolean;
  city?: "Dallas";
};

export const explorePlaylists: ExplorePlaylist[] = [
  /* ===========================
     🔥 EDITORIAL (FULL TRACK)
     =========================== */
  {
    id: "editorial-rapcaviar",
    title: "RapCaviar",
    subtitle: "The biggest names in hip-hop right now",
    spotifyId: "37i9dQZF1DX0XUsuxWHRQd",
    type: "playlist",
    category: "editorial",
    fullTrackFriendly: true,
  },
  {
    id: "editorial-most-necessary",
    title: "Most Necessary",
    subtitle: "Hip-hop culture’s essential tracks",
    spotifyId: "37i9dQZF1DX2RxBh64BHjQ",
    type: "playlist",
    category: "editorial",
    fullTrackFriendly: true,
  },
  {
    id: "editorial-signed-xoxo",
    title: "Signed XOXO",
    subtitle: "Breaking artists before they break out",
    spotifyId: "37i9dQZF1DXcRXFNfZr7Tp",
    type: "playlist",
    category: "editorial",
    fullTrackFriendly: true,
  },
  {
    id: "editorial-chill-hits",
    title: "Chill Hits",
    subtitle: "Laid-back hits for easy listening",
    spotifyId: "37i9dQZF1DX4WYpdgoIcn6",
    type: "playlist",
    category: "chill",
    fullTrackFriendly: true,
  },

  /* ===========================
     💣 TRAP / RAP
     =========================== */
  {
    id: "trap-trap-mojito",
    title: "Trap Mojito",
    subtitle: "Hard trap energy",
    spotifyId: "37i9dQZF1DX4eRPd9frC1m",
    type: "playlist",
    category: "trap",
    fullTrackFriendly: true,
  },
  {
    id: "rap-feelin-myself",
    title: "Feelin’ Myself",
    subtitle: "Confidence & boss vibes",
    spotifyId: "37i9dQZF1DX6GwdWRQMQpq",
    type: "playlist",
    category: "rap",
  },
  {
    id: "rap-get-turnt",
    title: "Get Turnt",
    subtitle: "High-energy rap anthems",
    spotifyId: "37i9dQZF1DX0HRj9P7NxeE",
    type: "playlist",
    category: "rap",
  },

  /* ===========================
     ❤️ R&B / SOUL
     =========================== */
  {
    id: "rnb-90s-slow-jams",
    title: "90s R&B Slow Jams",
    subtitle: "Classic love songs from the 90s",
    spotifyId: "37i9dQZF1DX6VDO8a6cQME",
    type: "playlist",
    category: "eras",
    fullTrackFriendly: true,
  },
  {
    id: "rnb-80s-slow-jams",
    title: "80s R&B Classics",
    subtitle: "Timeless soul & smooth grooves",
    spotifyId: "37i9dQZF1DWXbttAJcbphz",
    type: "playlist",
    category: "eras",
  },
  {
    id: "rnb-70s-soul",
    title: "70s Soul & R&B",
    subtitle: "Golden-era soul music",
    spotifyId: "37i9dQZF1DWV7EzJMK2FUI",
    type: "playlist",
    category: "eras",
  },
  {
    id: "rnb-rnb-vibes",
    title: "R&B Vibes",
    subtitle: "Smooth modern R&B",
    spotifyId: "37i9dQZF1DX4SBhb3fqCJd",
    type: "playlist",
    category: "rnb",
    fullTrackFriendly: true,
  },

  /* ===========================
     🌿 LO-FI / CHILL
     =========================== */
  {
    id: "lofi-lofi-beats",
    title: "Lo-Fi Beats",
    subtitle: "Chill beats to relax or study",
    spotifyId: "37i9dQZF1DXdLK5lj7o4vM",
    type: "playlist",
    category: "lofi",
    fullTrackFriendly: true,
  },
  {
    id: "lofi-jazzhop",
    title: "Jazzhop Café",
    subtitle: "Jazz-infused lo-fi",
    spotifyId: "37i9dQZF1DXbITWG1ZJKYt",
    type: "playlist",
    category: "lofi",
  },

  /* ===========================
     🧠 FOCUS / AMBIENT
     =========================== */
  {
    id: "focus-deep-focus",
    title: "Deep Focus",
    subtitle: "Instrumental concentration",
    spotifyId: "37i9dQZF1DWZeKCadgRdKQ",
    type: "playlist",
    category: "focus",
    fullTrackFriendly: true,
  },
  {
    id: "focus-brain-food",
    title: "Brain Food",
    subtitle: "Music for deep thinking",
    spotifyId: "37i9dQZF1DWXLeA8Omikj7",
    type: "playlist",
    category: "focus",
    fullTrackFriendly: true,
  },
  {
    id: "ambient-ambient-chill",
    title: "Ambient Chill",
    subtitle: "Atmospheric calm",
    spotifyId: "37i9dQZF1DX3Ogo9pFvBkY",
    type: "playlist",
    category: "ambient",
  },

  /* ===========================
     🏙️ DALLAS (LOCAL)
     =========================== */
  {
    id: "dallas-drill",
    title: "Dallas Drill",
    subtitle: "Raw Dallas drill energy",
    spotifyId: "6u2G9F0R0Tt8nKXrj9DALL",
    type: "playlist",
    category: "dallas",
    city: "Dallas",
  },
  {
    id: "dallas-new-wave",
    title: "New Dallas Artists",
    subtitle: "Next-up Dallas talent",
    spotifyId: "2W3ZPq9DALLASNEW",
    type: "playlist",
    category: "dallas",
    city: "Dallas",
  },
];

// Helper selectors (used by Explore UI)
export const getExploreByCategory = (category: ExploreCategory) =>
  explorePlaylists.filter((p) => p.category === category);

export const getFullTrackEditorial = () =>
  explorePlaylists.filter((p) => p.fullTrackFriendly);
