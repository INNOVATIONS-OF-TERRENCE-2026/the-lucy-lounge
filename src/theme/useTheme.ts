import { themes } from "./themes";

export function applyTheme(name: keyof typeof themes) {
  const theme = themes[name];

  Object.entries(theme).forEach(([key, value]) => {
    document.documentElement.style.setProperty(key, value);
  });

  localStorage.setItem("lucy-theme", name);
}

export function loadStoredTheme() {
  const saved = localStorage.getItem("lucy-theme") as keyof typeof themes;
  if (saved && themes[saved]) {
    applyTheme(saved);
  }
}
