// src/components/ThemePicker.tsx

import { useEffect, useState } from "react";
import { applyTheme, persistThemeRemote, THEME_NAMES, ThemeName } from "@/theme/useTheme";
import { THEMES } from "@/theme/themes";

export function ThemePicker() {
  const [active, setActive] = useState<ThemeName>("purple");

  // Initialize active state from localStorage (what App already applied)
  useEffect(() => {
    try {
      const stored = localStorage.getItem("lucy-theme") as ThemeName | null;
      if (stored && THEME_NAMES.includes(stored)) {
        setActive(stored);
      }
    } catch {
      // ignore
    }
  }, []);

  const handleClick = async (t: ThemeName) => {
    applyTheme(t);
    setActive(t);
    // sync to Supabase so it's the same on every device
    await persistThemeRemote(t);
  };

  return (
    <div className="flex items-center gap-2 rounded-2xl bg-black/50 backdrop-blur-md border border-white/10 px-3 py-2 shadow-lg">
      {THEME_NAMES.map((t: ThemeName) => (
        <button
          key={t}
          onClick={() => handleClick(t)}
          className={`h-7 w-7 rounded-full border transition-all duration-200
            ${active === t ? "scale-110 ring-2 ring-white shadow-lg" : "opacity-75 hover:opacity-100 hover:scale-105"}`}
          aria-label={`Switch to ${t} theme`}
          style={{
            background: `radial-gradient(circle at 30% 30%, ${THEMES[t].accent}, ${THEMES[t]["bg-2"]})`,
            borderColor: THEMES[t].primary,
          }}
        />
      ))}
    </div>
  );
}
