import { THEMES, ThemeName } from "./themes";
import { supabase } from "@/integrations/supabase/client";

// Type-only export (required for isolatedModules)
export type { ThemeName };

// Dark mode management
export type DarkModePreference = "dark" | "light";
const DARK_MODE_KEY = "lucy-dark-mode";

/**
 * Apply dark mode class to document
 */
export function applyDarkMode(mode: DarkModePreference) {
  const root = document.documentElement;
  root.classList.toggle("dark", mode === "dark");
  try {
    localStorage.setItem(DARK_MODE_KEY, mode);
  } catch (_) {}
}

/**
 * Load dark mode preference - defaults to DARK
 */
export function loadDarkModePreference(): DarkModePreference {
  try {
    const saved = localStorage.getItem(DARK_MODE_KEY) as DarkModePreference | null;
    if (saved === "light" || saved === "dark") {
      applyDarkMode(saved);
      return saved;
    }
  } catch (_) {}
  
  // DEFAULT TO DARK MODE
  applyDarkMode("dark");
  return "dark";
}

/**
 * Apply theme + animate transition + store local
 */
export function applyTheme(theme: ThemeName) {
  const config = THEMES[theme];
  if (!config) return;

  const root = document.documentElement;

  Object.entries(config).forEach(([key, value]) => {
    root.style.setProperty(`--${key}`, String(value));
  });

  try {
    localStorage.setItem("lucy-theme", theme);
  } catch (_) {}

  root.setAttribute("data-theme", theme);

  root.classList.add("theme-transition");
  setTimeout(() => {
    root.classList.remove("theme-transition");
  }, 350);
}

/**
 * Load theme from localStorage first - defaults to purple (dark theme)
 */
export function loadStoredTheme(): ThemeName {
  // Always ensure dark mode is applied first
  loadDarkModePreference();
  
  try {
    const stored = localStorage.getItem("lucy-theme") as ThemeName | null;
    if (stored && THEMES[stored]) {
      applyTheme(stored);
      return stored;
    }
  } catch (_) {}

  const fallback: ThemeName = "purple";
  applyTheme(fallback);
  return fallback;
}

/**
 * Save theme to Supabase user metadata
 */
export async function persistThemeRemote(theme: ThemeName) {
  try {
    await supabase.auth.updateUser({
      data: { theme },
    });
  } catch (_) {}
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
  } catch (_) {}

  return null;
}
