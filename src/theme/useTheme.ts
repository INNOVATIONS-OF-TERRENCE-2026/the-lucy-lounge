/**
 * 🔒 BRAND LOCK: LUCY THEME SYSTEM
 * 
 * Theme application logic for Lucy Lounge.
 * Themes persist to localStorage and sync to Supabase user metadata.
 * Theme colors apply to chat elements only, NOT header/matrix/profile.
 * DO NOT modify unless explicitly requested by user.
 */

import { THEMES, ThemeName } from "./themes";
import { supabase } from "@/integrations/supabase/client";

/**
 * Let TS know this is ONLY a type re-export
 * (required when isolatedModules is enabled)
 */
export type { ThemeName };

/**
 * Get current theme from localStorage
 */
export function getCurrentTheme(): ThemeName {
  try {
    const stored = localStorage.getItem("lucy-theme") as ThemeName | null;
    if (stored && THEMES[stored]) {
      return stored;
    }
  } catch (e) {
    console.warn("Unable to read theme from localStorage", e);
  }
  return "purple";
}

/**
 * Apply theme + animate transition + store local
 * Supports glow effects and gradients for premium themes
 */
export function applyTheme(theme: ThemeName) {
  const config = THEMES[theme];
  if (!config) return;

  const root = document.documentElement;

  // Apply all theme CSS variables to root
  Object.entries(config).forEach(([key, value]) => {
    root.style.setProperty(`--theme-${key}`, String(value));
  });

  // Apply glow color for effects
  if (config.glow) {
    root.style.setProperty("--theme-glow", config.glow);
    root.style.setProperty("--theme-glow-soft", `${config.glow}40`);
    root.style.setProperty("--theme-glow-strong", `${config.glow}80`);
  }

  // Apply gradient if available
  if (config.gradient) {
    root.style.setProperty("--theme-gradient", config.gradient);
  } else {
    root.style.setProperty("--theme-gradient", `linear-gradient(135deg, ${config.primary} 0%, ${config.accent} 100%)`);
  }

  // Apply to chat area elements
  const chatAreas = document.querySelectorAll('[data-theme-area="chat"]');
  chatAreas.forEach((chatArea) => {
    Object.entries(config).forEach(([key, value]) => {
      (chatArea as HTMLElement).style.setProperty(`--theme-${key}`, String(value));
    });
    chatArea.setAttribute("data-theme", theme);
  });

  // Persist locally
  try {
    localStorage.setItem("lucy-theme", theme);
  } catch (e) {
    console.warn("Unable to store theme in localStorage", e);
  }

  // Mark theme attribute on root for reference
  root.setAttribute("data-theme", theme);

  // Smooth UI transition
  root.classList.add("theme-transition");
  window.setTimeout(() => {
    root.classList.remove("theme-transition");
  }, 350);
}

/**
 * Load theme from localStorage and apply it
 */
export function loadStoredTheme(): ThemeName {
  const theme = getCurrentTheme();
  applyTheme(theme);
  return theme;
}

/**
 * Save theme to Supabase user metadata so it syncs across devices
 */
export async function persistThemeRemote(theme: ThemeName) {
  try {
    await supabase.auth.updateUser({
      data: { theme },
    });
  } catch (e) {
    console.warn("Failed to sync theme to Supabase", e);
  }
}

/**
 * Load theme from Supabase user metadata
 */
export async function loadThemeFromRemote(): Promise<ThemeName | null> {
  try {
    const { data } = await supabase.auth.getSession();
    const session = data.session;

    const metaTheme = session?.user?.user_metadata?.theme as ThemeName | undefined;

    if (metaTheme && THEMES[metaTheme]) {
      applyTheme(metaTheme);
      return metaTheme;
    }
  } catch (e) {
    console.warn("Failed to load theme from Supabase", e);
  }

  return null;
}
