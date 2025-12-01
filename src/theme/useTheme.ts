// src/theme/useTheme.ts

import { THEMES, THEME_NAMES, ThemeName } from "./themes";
import { supabase } from "@/integrations/supabase/client";

export type { ThemeName };
/**
 * Apply theme to <html> via CSS variables + localStorage
 * + animated transition.
 */
export function applyTheme(theme: ThemeName) {
  const config = THEMES[theme];
  if (!config) return;

  const root = document.documentElement;

  // Set CSS variables
  Object.entries(config).forEach(([key, value]) => {
    root.style.setProperty(`--${key}`, String(value));
  });

  // Persist locally
  try {
    localStorage.setItem("lucy-theme", theme);
  } catch (e) {
    console.warn("Unable to store theme in localStorage", e);
  }

  // Mark current theme on root
  root.setAttribute("data-theme", theme);

  // Smooth transition animation
  root.classList.add("theme-transition");
  window.setTimeout(() => {
    root.classList.remove("theme-transition");
  }, 350);
}

/**
 * Load theme from localStorage (fast, no network).
 */
export function loadStoredTheme(): ThemeName {
  try {
    const stored = localStorage.getItem("lucy-theme") as ThemeName | null;
    if (stored && THEMES[stored]) {
      applyTheme(stored);
      return stored;
    }
  } catch (e) {
    console.warn("Unable to read theme from localStorage", e);
  }

  // default
  const fallback: ThemeName = "purple";
  applyTheme(fallback);
  return fallback;
}

/**
 * Save theme to Supabase user metadata so it syncs across devices.
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
 * Load theme from Supabase user metadata (if logged in).
 * Overrides localStorage when available.
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
