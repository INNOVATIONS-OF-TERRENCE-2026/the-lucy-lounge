// src/theme/themes.ts

export type ThemeConfig = {
  "bg-1": string;
  "bg-2": string;
  primary: string;
  text: string;
  accent: string;
};

export const THEMES = {
  purple: {
    "bg-1": "#050013",
    "bg-2": "#12052e",
    primary: "#a855f7",
    text: "#f9fafb",
    accent: "#f97316",
  },
  forest: {
    "bg-1": "#020810",
    "bg-2": "#032012",
    primary: "#22c55e",
    text: "#ecfdf5",
    accent: "#a3e635",
  },
  ocean: {
    "bg-1": "#020617",
    "bg-2": "#020b30",
    primary: "#38bdf8",
    text: "#e0f2fe",
    accent: "#22d3ee",
  },
  gold: {
    "bg-1": "#09090b",
    "bg-2": "#1c1917",
    primary: "#fbbf24",
    text: "#fefce8",
    accent: "#f97316",
  },
  rose: {
    "bg-1": "#13020b",
    "bg-2": "#3b0218",
    primary: "#fb7185",
    text: "#ffe4e6",
    accent: "#f97316",
  },
  midnight: {
    "bg-1": "#020617",
    "bg-2": "#020617",
    primary: "#6366f1",
    text: "#e5e7eb",
    accent: "#22c55e",
  },
  sunset: {
    "bg-1": "#1b0b16",
    "bg-2": "#3b0f2f",
    primary: "#f97316",
    text: "#fffbeb",
    accent: "#facc15",
  },
  neon: {
    "bg-1": "#020617",
    "bg-2": "#020617",
    primary: "#22c55e",
    text: "#f9fafb",
    accent: "#22d3ee",
  },
} as const;

export type ThemeName = keyof typeof THEMES;
export const THEME_NAMES = Object.keys(THEMES) as ThemeName[];
