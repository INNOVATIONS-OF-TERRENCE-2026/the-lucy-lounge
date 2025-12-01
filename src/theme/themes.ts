// src/theme/themes.ts

export type ThemeConfig = {
  "bg-1": string;
  "bg-2": string;
  primary: string;
  text: string;
  accent: string;
};

export const THEMES: Record<string, ThemeConfig> = {
  purple: {
    "bg-1": "#050013",
    "bg-2": "#12052e",
    primary: "#a855f7",
    text: "#f9fafb",
    accent: "#f97316",
  },

  forest: {
    "bg-1": "#022b1b",
    "bg-2": "#014325",
    primary: "#22c55e",
    text: "#ffffff",
    accent: "#a3e635",
  },

  ocean: {
    "bg-1": "#001f2d",
    "bg-2": "#00384f",
    primary: "#38bdf8",
    text: "#e0f2fe",
    accent: "#22d3ee",
  },

  gold: {
    "bg-1": "#2c1c00",
    "bg-2": "#4b3200",
    primary: "#fbbf24",
    text: "#ffffff",
    accent: "#f97316",
  },

  rose: {
    "bg-1": "#2a000b",
    "bg-2": "#4b0018",
    primary: "#fb7185",
    text: "#ffffff",
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

// Array of theme keys
export const THEME_NAMES = Object.keys(THEMES) as ThemeName[];
