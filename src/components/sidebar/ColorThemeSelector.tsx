/**
 * ColorThemeSelector - Standalone sidebar theme selector component
 * Uses existing theme system without modification
 * Safe to add/remove without affecting other components
 */

import { useState, useEffect } from "react";
import { Palette, ChevronDown, ChevronUp, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { 
  applyTheme, 
  getCurrentTheme, 
  persistThemeRemote 
} from "@/theme/useTheme";
import { 
  THEMES, 
  THEME_COLLECTIONS, 
  getThemeDisplayName,
  type ThemeName 
} from "@/theme/themes";
import { cn } from "@/lib/utils";

export function ColorThemeSelector() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTheme, setActiveTheme] = useState<ThemeName>("purple");
  const [activeCollection, setActiveCollection] = useState(0);

  useEffect(() => {
    setActiveTheme(getCurrentTheme());
  }, []);

  const handleThemeSelect = (theme: ThemeName) => {
    applyTheme(theme);
    setActiveTheme(theme);
    persistThemeRemote(theme);
  };

  const currentCollection = THEME_COLLECTIONS[activeCollection];

  return (
    <div className="px-2 py-1">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <Button
            variant="outline"
            className="w-full justify-between"
          >
            <div className="flex items-center gap-2">
              <Palette className="w-4 h-4" />
              <span className="text-sm">Color Theme</span>
            </div>
            <div className="flex items-center gap-2">
              <div
                className="w-4 h-4 rounded-full border border-border"
                style={{
                  background: THEMES[activeTheme]?.gradient || 
                    `linear-gradient(135deg, ${THEMES[activeTheme]?.primary} 0%, ${THEMES[activeTheme]?.accent} 100%)`
                }}
              />
              {isOpen ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </div>
          </Button>
        </CollapsibleTrigger>

        <CollapsibleContent className="mt-2">
          <div className="rounded-lg border border-border bg-card/80 backdrop-blur-sm p-2">
            {/* Collection tabs */}
            <div className="flex flex-wrap gap-1 mb-2 pb-2 border-b border-border/50">
              {THEME_COLLECTIONS.map((collection, idx) => (
                <button
                  key={collection.id}
                  onClick={() => setActiveCollection(idx)}
                  className={cn(
                    "text-xs px-2 py-1 rounded-full transition-all",
                    activeCollection === idx
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted/50 text-muted-foreground hover:bg-muted"
                  )}
                >
                  {collection.emoji} {collection.name}
                </button>
              ))}
            </div>

            {/* Theme grid */}
            <ScrollArea className="h-[160px]">
              <div className="grid grid-cols-3 gap-1.5">
                {currentCollection.themes.map((themeName) => {
                  const theme = THEMES[themeName];
                  if (!theme) return null;

                  const isActive = activeTheme === themeName;

                  return (
                    <button
                      key={themeName}
                      onClick={() => handleThemeSelect(themeName)}
                      className={cn(
                        "relative flex flex-col items-center p-1.5 rounded-md transition-all",
                        "hover:bg-muted/50",
                        isActive && "ring-2 ring-primary ring-offset-1 ring-offset-background"
                      )}
                    >
                      {/* Color preview circle */}
                      <div
                        className="w-8 h-8 rounded-full border border-border/50 shadow-sm"
                        style={{
                          background: theme.gradient || 
                            `linear-gradient(135deg, ${theme.primary} 0%, ${theme.accent} 100%)`
                        }}
                      />
                      
                      {/* Theme name */}
                      <span className="text-[10px] mt-1 text-muted-foreground truncate max-w-full">
                        {getThemeDisplayName(themeName).split(' ').slice(0, 2).join(' ')}
                      </span>

                      {/* Active indicator */}
                      {isActive && (
                        <div className="absolute top-0.5 right-0.5">
                          <Check className="w-3 h-3 text-primary" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </ScrollArea>

            {/* Current theme label */}
            <div className="mt-2 pt-2 border-t border-border/50 text-center">
              <span className="text-xs text-muted-foreground">
                Active: <span className="text-foreground font-medium">{getThemeDisplayName(activeTheme)}</span>
              </span>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
