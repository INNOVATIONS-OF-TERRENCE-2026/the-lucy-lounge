import { useState, useEffect } from "react";
import { THEMES, ThemeName } from "./themes";
import { supabase } from "@/integrations/supabase/client";

// Type-only export (required for isolatedModules)
export type { ThemeName };

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
 * Load theme from localStorage first
 */
export function loadStoredTheme(): ThemeName {
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

/**
 * React hook for theme management
 */
export function useThemeManager() {
  const [theme, setTheme] = useState<ThemeName>(() => {
    try {
      const stored = localStorage.getItem("lucy-theme") as ThemeName | null;
      return stored && THEMES[stored] ? stored : "purple";
    } catch {
      return "purple";
    }
  });

  useEffect(() => {
    applyTheme(theme);
  }, []);

  const handleApplyTheme = (newTheme: string) => {
    const themeName = newTheme as ThemeName;
    if (THEMES[themeName]) {
      setTheme(themeName);
      applyTheme(themeName);
      persistThemeRemote(themeName);
    }
  };

  return {
    theme,
    applyTheme: handleApplyTheme,
  };
}
