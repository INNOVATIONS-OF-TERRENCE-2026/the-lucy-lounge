// ==========================================================
// 🎧 LUCY LISTENING MODE — MASTER CONTENT DATA
// ==========================================================
// This file is the SINGLE SOURCE OF TRUTH for:
// - ListeningMode
// - Lucy recommendations
// - Future Explore reuse
// ==========================================================

/* =========================
   TYPES
   ========================= */

export type ContentType = "album" | "playlist";

export type ListeningContentItem = {
  title: string;
  subtitle: string;
  contentId: string;
  contentType: ContentType;
  icon: any;
  accentColor: string;
  genre: string;
};

/* =========================
   ICON IMPORTS
   ========================= */

import {
  Heart,
  Music,
  Coffee,
  Waves,
  Mic,
  Gem,
  Disc3,
  CloudMoon,
  Cloud,
} from "lucide-react";

/* =========================
   CORE VIBES / PLAYLISTS
   ========================= */

export const genres: ListeningContentItem[] = [
  {
    title: "R&B Vibes",
    subtitle: "Curated R&B for smooth listening",
    contentId: "1kMyrcNKPws587cSAOjyDP",
    contentType: "playlist",
    icon: Heart,
    accentColor: "from-pink-500/20 to-rose-500/5",
    genre: "vibes",
  },
  {
    title: "Jazz Vibes",
    subtitle: "Smooth jazz for focus and relaxation",
    contentId: "37i9dQZF1DXbITWG1ZJKYt",
    contentType: "playlist",
    icon: Music,
    accentColor: "from-amber-500/20 to-orange-500/5",
    genre: "vibes",
  },
  {
    title: "Lo-Fi Vibes",
    subtitle: "Chill beats to study and relax",
    contentId: "37i9dQZF1DWWQRwui0ExPn",
    contentType: "playlist",
    icon: Coffee,
    accentColor: "from-violet-500/20 to-purple-500/5",
    genre: "vibes",
  },
  {
    title: "Ambient Vibes",
    subtitle: "Atmospheric sounds for deep focus",
    contentId: "37i9dQZF1DX3Ogo9pFvBkY",
    contentType: "playlist",
    icon: Waves,
    accentColor: "from-cyan-500/20 to-teal-500/5",
    genre: "vibes",
  },
];

/* =========================
   RAP / TRAP PLAYLISTS
   ========================= */

export const rapPlaylists: ListeningContentItem[] = [
  {
    title: "🔥 Best of Jeezy",
    subtitle: "Street anthems and trap classics",
    contentId: "62FBSHL4fu93EYWT18tgL7",
    contentType: "playlist",
    icon: Mic,
    accentColor: "from-red-500/20 to-orange-500/5",
    genre: "rap",
  },
  {
    title: "🏁 Best of Nipsey Hussle",
    subtitle: "Marathon energy, West Coast legacy",
    contentId: "1SIx1DgtH8YrQoiq4Wx4L2",
    contentType: "playlist",
    icon: Mic,
    accentColor: "from-blue-500/20 to-indigo-500/5",
    genre: "rap",
  },
  {
    title: "🐬 Best of Young Dolph",
    subtitle: "Memphis hustle, boss motivation",
    contentId: "5TkM6OUHeFujrujopXrzua",
    contentType: "playlist",
    icon: Mic,
    accentColor: "from-emerald-500/20 to-teal-500/5",
    genre: "rap",
  },
];

/* =========================
   SMOOTH RAP / HUSTLE
   ========================= */

export const smoothRapContent: ListeningContentItem[] = [
  {
    title: "💎 Larry June — Smooth Hustle",
    subtitle: "Game-spitting, boss-level smooth rap",
    contentId: "37i9dQZF1DZ06evO0GIXLs",
    contentType: "playlist",
    icon: Gem,
    accentColor: "from-yellow-500/20 to-amber-500/5",
    genre: "smooth-rap",
  },
];

/* =========================
   R&B ALBUMS
   ========================= */

export const rnbContent: ListeningContentItem[] = [
  {
    title: "🌙 SZA — Ctrl",
    subtitle: "Vulnerable R&B for late nights",
    contentId: "76290XdXVF9rPzGdNRWdCh",
    contentType: "album",
    icon: Heart,
    accentColor: "from-rose-500/20 to-pink-500/5",
    genre: "rnb",
  },
  {
    title: "🌊 Frank Ocean — Blonde",
    subtitle: "Ethereal modern R&B masterpiece",
    contentId: "3mH6qwIy9crq0I9YQbOuDf",
    contentType: "album",
    icon: Waves,
    accentColor: "from-amber-500/20 to-yellow-500/5",
    genre: "rnb",
  },
  {
    title: "🎤 Daniel Caesar — Freudian",
    subtitle: "Soulful R&B with gospel influence",
    contentId: "3xybjP7r2VsWzwvDQipdM0",
    contentType: "album",
    icon: Heart,
    accentColor: "from-indigo-500/20 to-blue-500/5",
    genre: "rnb",
  },
];

/* =========================
   LO-FI CONTENT
   ========================= */

export const lofiContent: ListeningContentItem[] = [
  {
    title: "🌙 Jinsang — Solitude",
    subtitle: "Melancholic lo-fi introspection",
    contentId: "6bEwlXAYCTYl3vfvZ9hG8T",
    contentType: "album",
    icon: CloudMoon,
    accentColor: "from-pink-500/20 to-rose-500/5",
    genre: "lofi",
  },
  {
    title: "☕ J’san — Coffee Break",
    subtitle: "Warm lo-fi for productive mornings",
    contentId: "7tZqH9jKGxFQeN2PxMcFwm",
    contentType: "album",
    icon: CloudMoon,
    accentColor: "from-yellow-500/20 to-amber-500/5",
    genre: "lofi",
  },
];

/* =========================
   AMBIENT CONTENT
   ========================= */

export const ambientContent: ListeningContentItem[] = [
  {
    title: "🌅 Tycho — Dive",
    subtitle: "Warm ambient soundscapes",
    contentId: "6IK80FcQ0vDiLAPpZ23Wvq",
    contentType: "album",
    icon: Cloud,
    accentColor: "from-sky-500/20 to-cyan-500/5",
    genre: "ambient",
  },
  {
    title: "🌿 Bonobo — Migration",
    subtitle: "Cinematic ambient journey",
    contentId: "5m1RkwKeU7MV0Ni6KI6OVU",
    contentType: "album",
    icon: Cloud,
    accentColor: "from-emerald-500/20 to-green-500/5",
    genre: "ambient",
  },
];
