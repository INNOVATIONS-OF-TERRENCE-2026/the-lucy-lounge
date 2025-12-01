import { Settings2, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

import { THEMES, ThemeName } from "@/theme/themes";
import { applyTheme, loadStoredTheme, persistThemeRemote } from "@/theme/useTheme";

import { ReadingMode } from "@/hooks/useReadingMode";
import { StreamingSpeed } from "@/hooks/useStreamingSpeed";
import { useState, useEffect } from "react";

interface ChatSettingsProps {
  readingMode: ReadingMode;
  setReadingMode: (mode: ReadingMode) => void;
  streamingSpeed: StreamingSpeed;
  setStreamingSpeed: (speed: StreamingSpeed) => void;
}

export function ChatSettings({ readingMode, setReadingMode, streamingSpeed, setStreamingSpeed }: ChatSettingsProps) {
  const [currentTheme, setCurrentTheme] = useState<ThemeName>("purple");

  // initialize theme from localStorage or remote
  useEffect(() => {
    const saved = loadStoredTheme();
    setCurrentTheme(saved);
  }, []);

  function changeTheme(theme: ThemeName) {
    setCurrentTheme(theme);
    applyTheme(theme);
    persistThemeRemote(theme);
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="glass-card border-primary/30 hover:shadow-glow-violet transition-all"
        >
          <Settings2 className="h-4 w-4" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-80 glass-card-enhanced border-primary/40" align="end">
        <div className="space-y-6">
          {/* Theme Picker */}
          <div>
            <h3 className="font-semibold text-sm mb-3">Appearance / Theme</h3>

            <div className="flex flex-wrap gap-2">
              {Object.keys(THEMES).map((theme) => {
                const t = theme as ThemeName;
                return (
                  <button
                    key={t}
                    onClick={() => changeTheme(t)}
                    className={`px-3 py-1 rounded-lg text-xs border transition-all 
                    ${currentTheme === t ? "border-primary bg-primary/20" : "border-border"}`}
                    style={{ background: `var(--bg-2)` }}
                  >
                    {t}
                  </button>
                );
              })}
            </div>
          </div>

          {/* ------- READING MODE ------- */}
          <div>
            <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
              <Settings2 className="h-4 w-4 text-primary" />
              Reading Mode
            </h3>
            <RadioGroup value={readingMode} onValueChange={(value) => setReadingMode(value as ReadingMode)}>
              <RadioGroupItem value="compact" id="compact" />
              <Label htmlFor="compact">Compact</Label>

              <RadioGroupItem value="comfortable" id="comfortable" />
              <Label htmlFor="comfortable">Comfortable</Label>

              <RadioGroupItem value="expanded" id="expanded" />
              <Label htmlFor="expanded">Expanded</Label>
            </RadioGroup>
          </div>

          {/* ------- SPEED ------- */}
          <div className="border-t border-border/50 pt-4">
            <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
              <Zap className="h-4 w-4 text-primary" />
              Streaming Speed
            </h3>

            <RadioGroup value={streamingSpeed} onValueChange={(value) => setStreamingSpeed(value as StreamingSpeed)}>
              <RadioGroupItem value="slow" id="slow" />
              <Label htmlFor="slow">Slow</Label>

              <RadioGroupItem value="medium" id="medium" />
              <Label htmlFor="medium">Medium</Label>

              <RadioGroupItem value="fast" id="fast" />
              <Label htmlFor="fast">Fast</Label>

              <RadioGroupItem value="instant" id="instant" />
              <Label htmlFor="instant">Instant</Label>
            </RadioGroup>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
