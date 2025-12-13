/**
 * 🔒 BRAND LOCK: LUCY THEME DEFINITIONS
 * 🎨 UI-ONLY ENHANCEMENT - DO NOT MODIFY FROM BACKEND PROMPTS
 * 
 * Premium theme collections for emotional engagement.
 * All themes must be preserved: original 9 + new collections.
 * DO NOT remove or modify themes unless explicitly requested by user.
 */

export type ThemeConfig = {
  "bg-1": string;
  "bg-2": string;
  primary: string;
  text: string;
  accent: string;
  glow: string;
  gradient?: string;
};

export type ThemeCollection = {
  id: string;
  name: string;
  emoji: string;
  vibe: string;
  themes: ThemeName[];
};

// ============================================
// 🎨 ORIGINAL LUCY THEMES (PROTECTED)
// ============================================

const ORIGINAL_THEMES = {
  purple: {
    "bg-1": "#050013",
    "bg-2": "#12052e",
    primary: "#a855f7",
    text: "#f9fafb",
    accent: "#f97316",
    glow: "#a855f7",
  },
  forest: {
    "bg-1": "#022b1b",
    "bg-2": "#014325",
    primary: "#22c55e",
    text: "#ffffff",
    accent: "#a3e635",
    glow: "#22c55e",
  },
  ocean: {
    "bg-1": "#001f2d",
    "bg-2": "#00384f",
    primary: "#38bdf8",
    text: "#e0f2fe",
    accent: "#22d3ee",
    glow: "#38bdf8",
  },
  gold: {
    "bg-1": "#2c1c00",
    "bg-2": "#4b3200",
    primary: "#fbbf24",
    text: "#ffffff",
    accent: "#f97316",
    glow: "#fbbf24",
  },
  rose: {
    "bg-1": "#2a000b",
    "bg-2": "#4b0018",
    primary: "#fb7185",
    text: "#ffffff",
    accent: "#f97316",
    glow: "#fb7185",
  },
  midnight: {
    "bg-1": "#020617",
    "bg-2": "#020617",
    primary: "#6366f1",
    text: "#e5e7eb",
    accent: "#22c55e",
    glow: "#6366f1",
  },
  memories: {
    "bg-1": "#1a0a2e",
    "bg-2": "#2d1b4e",
    primary: "#c084fc",
    text: "#faf5ff",
    accent: "#f0abfc",
    glow: "#c084fc",
  },
  sunset: {
    "bg-1": "#1b0b16",
    "bg-2": "#3b0f2f",
    primary: "#f97316",
    text: "#fffbeb",
    accent: "#facc15",
    glow: "#f97316",
  },
  neon: {
    "bg-1": "#020617",
    "bg-2": "#020617",
    primary: "#22c55e",
    text: "#f9fafb",
    accent: "#22d3ee",
    glow: "#22c55e",
  },
} as const;

// ============================================
// 🌈 90s NOSTALGIA COLLECTION
// ============================================

const NOSTALGIA_THEMES = {
  retroArcade: {
    "bg-1": "#0a0a0a",
    "bg-2": "#1a0a2a",
    primary: "#00ffff",
    text: "#ffffff",
    accent: "#ff1493",
    glow: "#00ffff",
    gradient: "linear-gradient(135deg, #00ffff 0%, #ff1493 50%, #9400d3 100%)",
  },
  acidDream: {
    "bg-1": "#0a0a0a",
    "bg-2": "#0a1a0a",
    primary: "#39ff14",
    text: "#ffffff",
    accent: "#ffff00",
    glow: "#39ff14",
    gradient: "linear-gradient(135deg, #39ff14 0%, #ffff00 100%)",
  },
  cyberPink: {
    "bg-1": "#1a0a1a",
    "bg-2": "#2a0a2a",
    primary: "#ff00ff",
    text: "#ffffff",
    accent: "#00bfff",
    glow: "#ff00ff",
    gradient: "linear-gradient(135deg, #ff00ff 0%, #00bfff 100%)",
  },
  orangeSoda: {
    "bg-1": "#1a0a00",
    "bg-2": "#2a1500",
    primary: "#ff6b00",
    text: "#ffffff",
    accent: "#87ceeb",
    glow: "#ff6b00",
    gradient: "linear-gradient(135deg, #ff6b00 0%, #87ceeb 100%)",
  },
  vaporwave: {
    "bg-1": "#0d0d2b",
    "bg-2": "#1a1a3e",
    primary: "#ff71ce",
    text: "#ffffff",
    accent: "#01cdfe",
    glow: "#ff71ce",
    gradient: "linear-gradient(135deg, #ff71ce 0%, #01cdfe 50%, #b967ff 100%)",
  },
} as const;

// ============================================
// 🧘 ZEN / CALM COLLECTION
// ============================================

const ZEN_THEMES = {
  sandSage: {
    "bg-1": "#f5f0e8",
    "bg-2": "#e8e0d5",
    primary: "#6b8e6b",
    text: "#2d2d2d",
    accent: "#c9a961",
    glow: "#6b8e6b",
  },
  lavenderCloud: {
    "bg-1": "#f8f5ff",
    "bg-2": "#ede5ff",
    primary: "#9b8bb8",
    text: "#3d3d3d",
    accent: "#c5b3d9",
    glow: "#9b8bb8",
  },
  oceanBreeze: {
    "bg-1": "#e8f4f8",
    "bg-2": "#d5eaef",
    primary: "#5f9ea0",
    text: "#2d3d3d",
    accent: "#87ceeb",
    glow: "#5f9ea0",
  },
  warmBlush: {
    "bg-1": "#faf5f2",
    "bg-2": "#f5ebe5",
    primary: "#c9a89a",
    text: "#3d2d2d",
    accent: "#e8c4b8",
    glow: "#c9a89a",
  },
  forestMist: {
    "bg-1": "#e8efe8",
    "bg-2": "#d5e5d5",
    primary: "#4a7c59",
    text: "#2d3d2d",
    accent: "#8fbc8f",
    glow: "#4a7c59",
  },
} as const;

// ============================================
// 🚀 SPACE / FUTURISTIC COLLECTION
// ============================================

const SPACE_THEMES = {
  deepSpace: {
    "bg-1": "#000005",
    "bg-2": "#05050f",
    primary: "#00ffff",
    text: "#e0e0ff",
    accent: "#9400d3",
    glow: "#00ffff",
    gradient: "linear-gradient(135deg, #00ffff 0%, #9400d3 100%)",
  },
  plasmaPink: {
    "bg-1": "#050010",
    "bg-2": "#0a0020",
    primary: "#ff1493",
    text: "#ffffff",
    accent: "#ffffff",
    glow: "#ff1493",
    gradient: "linear-gradient(135deg, #0a0a2e 0%, #ff1493 100%)",
  },
  galacticPurple: {
    "bg-1": "#0a0015",
    "bg-2": "#15002a",
    primary: "#8b00ff",
    text: "#e0d0ff",
    accent: "#00bfff",
    glow: "#8b00ff",
    gradient: "linear-gradient(135deg, #8b00ff 0%, #00bfff 100%)",
  },
  cyberTeal: {
    "bg-1": "#0a0a0a",
    "bg-2": "#101515",
    primary: "#00ffc8",
    text: "#e0fff5",
    accent: "#adff2f",
    glow: "#00ffc8",
    gradient: "linear-gradient(135deg, #00ffc8 0%, #adff2f 100%)",
  },
  nebula: {
    "bg-1": "#0d0015",
    "bg-2": "#1a002a",
    primary: "#e040fb",
    text: "#f0e0ff",
    accent: "#536dfe",
    glow: "#e040fb",
    gradient: "linear-gradient(135deg, #e040fb 0%, #536dfe 50%, #00bcd4 100%)",
  },
} as const;

// ============================================
// 🔥 DOPAMINE / GLOW COLLECTION
// ============================================

const DOPAMINE_THEMES = {
  redNeon: {
    "bg-1": "#0a0000",
    "bg-2": "#150505",
    primary: "#ff0040",
    text: "#ffffff",
    accent: "#ff6b6b",
    glow: "#ff0040",
    gradient: "linear-gradient(135deg, #ff0040 0%, #ff6b6b 100%)",
  },
  electricBlue: {
    "bg-1": "#000510",
    "bg-2": "#000a1a",
    primary: "#00bfff",
    text: "#e0f5ff",
    accent: "#87ceeb",
    glow: "#00bfff",
    gradient: "linear-gradient(135deg, #00bfff 0%, #00ffff 100%)",
  },
  goldObsidian: {
    "bg-1": "#0a0805",
    "bg-2": "#151008",
    primary: "#ffd700",
    text: "#fff8e0",
    accent: "#ffb347",
    glow: "#ffd700",
    gradient: "linear-gradient(135deg, #ffd700 0%, #ff8c00 100%)",
  },
  pinkPulse: {
    "bg-1": "#0a050a",
    "bg-2": "#150a15",
    primary: "#ff69b4",
    text: "#ffe0f0",
    accent: "#ff1493",
    glow: "#ff69b4",
    gradient: "linear-gradient(135deg, #ff69b4 0%, #ff1493 100%)",
  },
  limeShock: {
    "bg-1": "#050a05",
    "bg-2": "#0a150a",
    primary: "#00ff00",
    text: "#e0ffe0",
    accent: "#7cfc00",
    glow: "#00ff00",
    gradient: "linear-gradient(135deg, #00ff00 0%, #7cfc00 100%)",
  },
} as const;

// ============================================
// COMBINED THEMES EXPORT
// ============================================

export const THEMES: Record<string, ThemeConfig> = {
  // Original Lucy themes
  ...ORIGINAL_THEMES,
  // 90s Nostalgia
  ...NOSTALGIA_THEMES,
  // Zen / Calm
  ...ZEN_THEMES,
  // Space / Futuristic
  ...SPACE_THEMES,
  // Dopamine / Glow
  ...DOPAMINE_THEMES,
} as const;

export type ThemeName = keyof typeof THEMES;

// Theme names array
export const THEME_NAMES = Object.keys(THEMES) as ThemeName[];

// ============================================
// THEME COLLECTIONS FOR UI
// ============================================

export const THEME_COLLECTIONS: ThemeCollection[] = [
  {
    id: "original",
    name: "Lucy Originals",
    emoji: "💜",
    vibe: "Classic elegance",
    themes: ["purple", "forest", "ocean", "gold", "rose", "midnight", "memories", "sunset", "neon"],
  },
  {
    id: "nostalgia",
    name: "90s Nostalgia",
    emoji: "🌈",
    vibe: "Retro arcade vibes",
    themes: ["retroArcade", "acidDream", "cyberPink", "orangeSoda", "vaporwave"],
  },
  {
    id: "zen",
    name: "Zen & Calm",
    emoji: "🧘",
    vibe: "Peace & focus",
    themes: ["sandSage", "lavenderCloud", "oceanBreeze", "warmBlush", "forestMist"],
  },
  {
    id: "space",
    name: "Space & Future",
    emoji: "🚀",
    vibe: "Cosmic AI power",
    themes: ["deepSpace", "plasmaPink", "galacticPurple", "cyberTeal", "nebula"],
  },
  {
    id: "dopamine",
    name: "Dopamine Glow",
    emoji: "🔥",
    vibe: "Pure energy",
    themes: ["redNeon", "electricBlue", "goldObsidian", "pinkPulse", "limeShock"],
  },
];

// Helper to get theme display name
export function getThemeDisplayName(theme: ThemeName): string {
  const displayNames: Record<string, string> = {
    // Original
    purple: "Royal Purple",
    forest: "Forest",
    ocean: "Ocean",
    gold: "Gold",
    rose: "Rose",
    midnight: "Midnight",
    memories: "Memories",
    sunset: "Sunset",
    neon: "Neon",
    // Nostalgia
    retroArcade: "Retro Arcade",
    acidDream: "Acid Dream",
    cyberPink: "Cyber Pink",
    orangeSoda: "Orange Soda",
    vaporwave: "Vaporwave",
    // Zen
    sandSage: "Sand & Sage",
    lavenderCloud: "Lavender Cloud",
    oceanBreeze: "Ocean Breeze",
    warmBlush: "Warm Blush",
    forestMist: "Forest Mist",
    // Space
    deepSpace: "Deep Space",
    plasmaPink: "Plasma Pink",
    galacticPurple: "Galactic Purple",
    cyberTeal: "Cyber Teal",
    nebula: "Nebula",
    // Dopamine
    redNeon: "Red Neon",
    electricBlue: "Electric Blue",
    goldObsidian: "Gold Obsidian",
    pinkPulse: "Pink Pulse",
    limeShock: "Lime Shock",
  };
  return displayNames[theme] || theme;
}
