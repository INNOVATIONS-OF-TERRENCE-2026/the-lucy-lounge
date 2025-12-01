import { themes } from "./themes";

export type ThemeName = keyof typeof themes;

export function applyTheme(name: ThemeName) {
  const theme = themes[name];

  Object.entries(theme).forEach(([key, val]) => {
    document.documentElement.style.setProperty(key, val);
  });

  localStorage.setItem("theme", name);
}

export function loadStoredTheme() {
  const saved = localStorage.getItem("theme") as ThemeName | null;

  if (saved && themes[saved]) {
    applyTheme(saved);
  }
}
