import { THEMES, ThemeName } from "./themes";
import { supabase } from "@/integrations/supabase/client";

/**
 * Let TS know this is ONLY a type re-export
 * (required when isolatedModules is enabled)
 */
export type { ThemeName };

/**
 * Apply theme + animate transition + store local
 */
export function applyTheme(theme: ThemeName) {
  const config = THEMES[theme];
  if (!config) return;

  const root = document.documentElement;

  // Apply CSS vars
  Object.entries(config).forEach(([key, value]) => {
    root.style.setProperty(`--${key}`, String(value));
  });

  // Persist locally
  try {
    localStorage.setItem("lucy-theme", theme);
  } catch (e) {
    console.warn("Unable to store theme in localStorage", e);
  }

  // Mark theme attribute
  root.setAttribute("data-theme", theme);

  // Smooth UI transition
  root.classList.add("theme-transition");
  window.setTimeout(() => {
    root.classList.remove("theme-transition");
  }, 350);
}

/**
 * Load theme from localStorage first
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

  // fallback
  const fallback: ThemeName = "purple";
  applyTheme(fallback);
  return fallback;
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
