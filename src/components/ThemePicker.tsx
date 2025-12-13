/**
 * 🔒 BRAND LOCK: PREMIUM THEME PICKER COMPONENT
 * 🎨 UI-ONLY ENHANCEMENT - DO NOT MODIFY FROM BACKEND PROMPTS
 * 
 * Scrollable theme selector with collections and previews.
 * Provides emotional engagement through visual customization.
 * DO NOT modify unless explicitly requested by user.
 */

import { useState, useEffect } from "react";
import { applyTheme, getCurrentTheme, loadStoredTheme } from "@/theme/useTheme";
import { THEMES, THEME_COLLECTIONS, getThemeDisplayName } from "@/theme/themes";
import type { ThemeName, ThemeCollection } from "@/theme/themes";
import { Palette, X, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

export function ThemePicker() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTheme, setActiveTheme] = useState<ThemeName>("purple");
  const [activeCollection, setActiveCollection] = useState<string>("original");
  const [previewTheme, setPreviewTheme] = useState<ThemeName | null>(null);

  // Load persisted theme on mount
  useEffect(() => {
    const stored = loadStoredTheme();
    setActiveTheme(stored);
  }, []);

  const handleThemeSelect = (theme: ThemeName) => {
    applyTheme(theme);
    setActiveTheme(theme);
    setPreviewTheme(null);
  };

  const handlePreview = (theme: ThemeName) => {
    setPreviewTheme(theme);
    applyTheme(theme);
  };

  const handlePreviewEnd = () => {
    if (previewTheme && previewTheme !== activeTheme) {
      applyTheme(activeTheme);
    }
    setPreviewTheme(null);
  };

  const currentCollection = THEME_COLLECTIONS.find(c => c.id === activeCollection) || THEME_COLLECTIONS[0];
  const collectionIndex = THEME_COLLECTIONS.findIndex(c => c.id === activeCollection);

  const nextCollection = () => {
    const next = (collectionIndex + 1) % THEME_COLLECTIONS.length;
    setActiveCollection(THEME_COLLECTIONS[next].id);
  };

  const prevCollection = () => {
    const prev = collectionIndex === 0 ? THEME_COLLECTIONS.length - 1 : collectionIndex - 1;
    setActiveCollection(THEME_COLLECTIONS[prev].id);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isOpen && (
        <div className="absolute bottom-16 right-0 w-[320px] rounded-2xl bg-card/95 backdrop-blur-xl shadow-[0_0_40px_rgba(168,85,247,0.3)] border border-border/30 overflow-hidden animate-scale-in">
          {/* Collection Header */}
          <div className="p-4 border-b border-border/30">
            <div className="flex items-center justify-between mb-2">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={prevCollection}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              
              <div className="text-center flex-1">
                <div className="flex items-center justify-center gap-2">
                  <span className="text-xl">{currentCollection.emoji}</span>
                  <span className="font-semibold text-foreground">{currentCollection.name}</span>
                </div>
                <p className="text-xs text-muted-foreground">{currentCollection.vibe}</p>
              </div>
              
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={nextCollection}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            {/* Collection Pills */}
            <div className="flex gap-1 justify-center mt-2">
              {THEME_COLLECTIONS.map((col) => (
                <button
                  key={col.id}
                  onClick={() => setActiveCollection(col.id)}
                  className={cn(
                    "w-2 h-2 rounded-full transition-all duration-200",
                    activeCollection === col.id
                      ? "bg-primary w-4"
                      : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
                  )}
                />
              ))}
            </div>
          </div>

          {/* Theme Grid */}
          <ScrollArea className="h-[280px]">
            <div className="p-3 grid grid-cols-3 gap-2">
              {currentCollection.themes.map((themeName) => {
                const theme = THEMES[themeName];
                if (!theme) return null;
                
                const isActive = activeTheme === themeName;
                const isPreviewing = previewTheme === themeName;
                
                return (
                  <button
                    key={themeName}
                    onClick={() => handleThemeSelect(themeName)}
                    onMouseEnter={() => handlePreview(themeName)}
                    onMouseLeave={handlePreviewEnd}
                    className={cn(
                      "relative group rounded-xl p-2 transition-all duration-300",
                      "hover:scale-105 active:scale-95",
                      isActive && "ring-2 ring-primary ring-offset-2 ring-offset-background"
                    )}
                    style={{
                      background: theme.gradient || theme["bg-2"],
                      boxShadow: isActive || isPreviewing
                        ? `0 0 20px 4px ${theme.glow}40`
                        : "none",
                    }}
                  >
                    {/* Theme Preview */}
                    <div
                      className="h-12 rounded-lg mb-1.5 relative overflow-hidden"
                      style={{ backgroundColor: theme["bg-1"] }}
                    >
                      {/* Mini chat preview */}
                      <div className="absolute inset-1 flex flex-col justify-end gap-0.5">
                        <div
                          className="h-1.5 w-8 rounded-full opacity-60"
                          style={{ backgroundColor: theme.primary }}
                        />
                        <div
                          className="h-1.5 w-6 rounded-full ml-auto opacity-80"
                          style={{ backgroundColor: theme.accent }}
                        />
                      </div>
                      
                      {/* Glow effect */}
                      {(isActive || isPreviewing) && (
                        <div
                          className="absolute inset-0 opacity-30 animate-pulse"
                          style={{
                            background: `radial-gradient(circle at center, ${theme.glow} 0%, transparent 70%)`,
                          }}
                        />
                      )}
                    </div>
                    
                    {/* Theme Name */}
                    <p
                      className="text-[10px] font-medium truncate text-center"
                      style={{ color: theme.text }}
                    >
                      {getThemeDisplayName(themeName)}
                    </p>
                    
                    {/* Active Indicator */}
                    {isActive && (
                      <div className="absolute -top-1 -right-1">
                        <Sparkles className="h-3 w-3 text-primary" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </ScrollArea>

          {/* Current Theme Footer */}
          <div className="p-3 border-t border-border/30 bg-background/50">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Current:</span>
              <div className="flex items-center gap-2">
                <div
                  className="w-4 h-4 rounded-full"
                  style={{
                    backgroundColor: THEMES[activeTheme]?.primary,
                    boxShadow: `0 0 8px ${THEMES[activeTheme]?.glow}`,
                  }}
                />
                <span className="text-sm font-medium text-foreground">
                  {getThemeDisplayName(activeTheme)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Floating Trigger Button */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        size="icon"
        className={cn(
          "h-12 w-12 rounded-full transition-all duration-300",
          "bg-gradient-to-br from-primary to-accent",
          "hover:shadow-[0_0_25px_rgba(168,85,247,0.5)]",
          "shadow-[0_0_15px_rgba(168,85,247,0.3)]",
          isOpen && "rotate-180"
        )}
      >
        {isOpen ? <X className="w-5 h-5" /> : <Palette className="w-5 h-5" />}
      </Button>
    </div>
  );
}
