import { useState, useEffect } from "react";
import { applyTheme, getCurrentTheme, loadStoredTheme } from "@/theme/useTheme";
import { THEMES } from "@/theme/themes";
import type { ThemeName } from "@/theme/themes";
import { Palette, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ThemePicker() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTheme, setActiveTheme] = useState<ThemeName>("purple");
  const themeNames = Object.keys(THEMES) as ThemeName[];

  // Load persisted theme on mount
  useEffect(() => {
    const stored = loadStoredTheme();
    setActiveTheme(stored);
  }, []);

  // Map theme names to their primary colors for display
  const themeColors: Record<ThemeName, string> = {
    purple: "#a855f7",
    forest: "#22c55e",
    ocean: "#38bdf8",
    gold: "#fbbf24",
    rose: "#fb7185",
    midnight: "#6366f1",
    memories: "#c084fc",
    sunset: "#f97316",
    neon: "#22c55e",
  };

  const handleThemeSelect = (theme: ThemeName) => {
    applyTheme(theme);
    setActiveTheme(theme);
    setIsOpen(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isOpen && (
        <div className="absolute bottom-14 right-0 p-3 rounded-2xl bg-card/95 backdrop-blur-xl shadow-[0_0_30px_rgba(168,85,247,0.25)]">
          <div className="flex gap-2 flex-wrap max-w-[200px]">
            {themeNames.map((theme) => (
              <button
                key={theme}
                onClick={() => handleThemeSelect(theme)}
                style={{ 
                  backgroundColor: themeColors[theme],
                  boxShadow: activeTheme === theme 
                    ? `0 0 12px 4px ${themeColors[theme]}` 
                    : 'none'
                }}
                className={`w-9 h-9 rounded-full hover:scale-110 transition-all duration-200 ${
                  activeTheme === theme ? 'scale-110' : ''
                }`}
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
