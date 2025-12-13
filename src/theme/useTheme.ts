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
 */
export function applyTheme(theme: ThemeName) {
  const config = THEMES[theme];
  if (!config) return;

  // Apply CSS vars to all chat area elements
  const chatAreas = document.querySelectorAll('[data-theme-area="chat"]');
  
  chatAreas.forEach((chatArea) => {
    Object.entries(config).forEach(([key, value]) => {
      (chatArea as HTMLElement).style.setProperty(`--theme-${key}`, String(value));
    });
    chatArea.setAttribute("data-theme", theme);
  });

  // Also apply to root for CSS variable access
  const root = document.documentElement;
  Object.entries(config).forEach(([key, value]) => {
    root.style.setProperty(`--theme-${key}`, String(value));
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
