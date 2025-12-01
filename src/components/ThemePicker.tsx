import { applyTheme } from "@/theme/useTheme";

const themes = ["purple", "forest", "ocean", "gold", "rose"] as const;
type ThemeName = (typeof themes)[number];

export function ThemePicker() {
  return (
    <div className="flex gap-2 justify-center items-center p-2">
      {themes.map((t: ThemeName) => (
        <button
          key={t}
          onClick={() => applyTheme(t)}
          className="px-3 py-2 rounded-xl border text-xs capitalize bg-black/40"
        >
          {t}
        </button>
      ))}
    </div>
  );
}
