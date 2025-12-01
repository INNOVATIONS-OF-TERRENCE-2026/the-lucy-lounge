import { applyTheme } from "@/theme/useTheme";
import { themes } from "@/theme/themes";

export function ThemePicker() {
  return (
    <div className="flex gap-2 p-2 backdrop-blur-md bg-black/20 rounded-xl border border-white/10">
      {Object.keys(themes).map((t) => (
        <button
          key={t}
          onClick={() => applyTheme(t as any)}
          className="w-6 h-6 rounded-full border border-white/30 hover:scale-110 transition"
          style={{ background: themes[t as keyof typeof themes]["--primary"] }}
          title={t}
        />
      ))}
    </div>
  );
}
