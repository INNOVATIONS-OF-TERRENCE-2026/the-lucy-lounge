import { themes } from "./themes";

export function applyTheme(name: keyof typeof themes) {
  const theme = themes[name];

  Object.entries(theme).forEach(([varName, value]) => {
    document.documentElement.style.setProperty(varName, value);
  });

  localStorage.setItem("lucy-theme", name);
}

export function loadStoredTheme() {
  const saved = localStorage.getItem("lucy-theme");
  if (saved && saved in themes) {
    applyTheme(saved as keyof typeof themes);
  }
}
