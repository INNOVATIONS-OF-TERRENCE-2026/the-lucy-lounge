import { Settings2, Zap, Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ReadingMode } from "@/hooks/useReadingMode";
import { StreamingSpeed } from "@/hooks/useStreamingSpeed";
import { applyTheme } from "@/theme/useTheme";
import { THEMES, ThemeName } from "@/theme/themes";

interface ChatSettingsProps {
  readingMode: ReadingMode;
  setReadingMode: (mode: ReadingMode) => void;
  streamingSpeed: StreamingSpeed;
  setStreamingSpeed: (speed: StreamingSpeed) => void;
}

export function ChatSettings({ readingMode, setReadingMode, streamingSpeed, setStreamingSpeed }: ChatSettingsProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="icon" className="glass-card border-primary/30 hover:shadow-glow-violet">
          <Settings2 className="h-4 w-4" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-80 glass-card-enhanced border-primary/40" align="end">
        <div className="space-y-6">
          {/* Theme Picker */}
          <div>
            <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
              <Palette className="h-4 w-4 text-primary" />
              Theme
            </h3>

            <div className="grid grid-cols-4 gap-2">
              {Object.keys(THEMES).map((name) => {
                const theme = name as ThemeName;
                return (
                  <button
                    key={name}
                    className="h-8 w-8 rounded-full border"
                    style={{ background: THEMES[theme]["bg-1"] }}
                    onClick={() => applyTheme(theme)}
                  />
                );
              })}
            </div>
          </div>

          {/* Reading mode settings */}
          <div className="border-t border-border/50 pt-4">
            <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
              <Settings2 className="h-4 w-4 text-primary" />
              Reading Mode
            </h3>

            <RadioGroup value={readingMode} onValueChange={(value) => setReadingMode(value as ReadingMode)}>
              <div className="space-y-2">
                <div className="flex items-center p-2 hover:bg-primary/5 rounded-lg gap-2">
                  <RadioGroupItem value="compact" id="compact" />
                  <Label htmlFor="compact">Compact</Label>
                </div>
                <div className="flex items-center p-2 hover:bg-primary/5 rounded-lg gap-2">
                  <RadioGroupItem value="comfortable" id="comfortable" />
                  <Label htmlFor="comfortable">Comfortable</Label>
                </div>
                <div className="flex items-center p-2 hover:bg-primary/5 rounded-lg gap-2">
                  <RadioGroupItem value="expanded" id="expanded" />
                  <Label htmlFor="expanded">Expanded</Label>
                </div>
              </div>
            </RadioGroup>
          </div>

          {/* Streaming speed settings */}
          <div className="border-t border-border/50 pt-4">
            <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
              <Zap className="h-4 w-4 text-primary" />
              Streaming Speed
            </h3>

            <RadioGroup value={streamingSpeed} onValueChange={(value) => setStreamingSpeed(value as StreamingSpeed)}>
              <div className="space-y-2">
                <div className="flex items-center p-2 hover:bg-primary/5 rounded-lg gap-2">
                  <RadioGroupItem value="slow" id="slow" />
                  <Label htmlFor="slow">Slow</Label>
                </div>
                <div className="flex items-center p-2 hover:bg-primary/5 rounded-lg gap-2">
                  <RadioGroupItem value="medium" id="medium" />
                  <Label htmlFor="medium">Medium</Label>
                </div>
                <div className="flex items-center p-2 hover:bg-primary/5 rounded-lg gap-2">
                  <RadioGroupItem value="fast" id="fast" />
                  <Label htmlFor="fast">Fast</Label>
                </div>
                <div className="flex items-center p-2 hover:bg-primary/5 rounded-lg gap-2">
                  <RadioGroupItem value="instant" id="instant" />
                  <Label htmlFor="instant">Instant</Label>
                </div>
              </div>
            </RadioGroup>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
