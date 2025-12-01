import { applyTheme } from "@/theme/useTheme";

export function ThemePicker() {
  const themes = ["purple", "forest", "ocean", "gold", "rose"];

  return (
    <div className="flex gap-3 p-3">
      {themes.map((t) => (
        <button key={t} onClick={() => applyTheme(t)} className="px-3 py-2 rounded-lg border bg-background">
          {t}
        </button>
      ))}
    </div>
  );
}
