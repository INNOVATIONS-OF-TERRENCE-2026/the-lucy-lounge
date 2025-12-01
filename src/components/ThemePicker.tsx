import { applyTheme } from "@/theme/useTheme";
import { THEMES } from "@/theme/themes";
import type { ThemeName } from "@/theme/themes";

export function ThemePicker() {
  const themeNames = Object.keys(THEMES) as ThemeName[];

  return (
    <div className="flex gap-2 items-center">
      {themeNames.map((theme) => (
        <button
          key={theme}
          onClick={() => applyTheme(theme)}
          className="p-3 rounded-xl border border-white/20 hover:scale-105 transition"
        >
          {theme}
        </button>
      ))}
    </div>
  );
}
