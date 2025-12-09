import { useState } from "react";
import { applyTheme } from "@/theme/useTheme";
import { THEMES } from "@/theme/themes";
import type { ThemeName } from "@/theme/themes";
import { Palette, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ThemePicker() {
  const [isOpen, setIsOpen] = useState(false);
  const themeNames = Object.keys(THEMES) as ThemeName[];

  const themeColors: Record<ThemeName, string> = {
    purple: "bg-purple-500",
    cyan: "bg-cyan-500",
    amber: "bg-amber-500",
    rose: "bg-rose-500",
  };

  return (
    <div className="fixed bottom-6 right-6 z-50" data-theme-area="chat">
      {isOpen && (
        <div className="absolute bottom-14 right-0 p-3 rounded-2xl bg-card/95 backdrop-blur-xl shadow-[0_0_30px_rgba(168,85,247,0.25)] border border-primary/20 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <div className="flex gap-2">
            {themeNames.map((theme) => (
              <button
                key={theme}
                onClick={() => {
                  applyTheme(theme);
                  setIsOpen(false);
                }}
                className={`w-10 h-10 rounded-full ${themeColors[theme] || "bg-primary"} hover:scale-110 transition-transform shadow-lg ring-2 ring-white/20`}
                title={theme.charAt(0).toUpperCase() + theme.slice(1)}
              />
            ))}
          </div>
        </div>
      )}

      <Button
        onClick={() => setIsOpen(!isOpen)}
        size="icon"
        className="h-12 w-12 rounded-full bg-gradient-primary hover:shadow-[0_0_20px_rgba(168,85,247,0.4)] shadow-[0_0_15px_rgba(168,85,247,0.3)] transition-all"
      >
        {isOpen ? <X className="w-5 h-5" /> : <Palette className="w-5 h-5" />}
      </Button>
    </div>
  );
}
