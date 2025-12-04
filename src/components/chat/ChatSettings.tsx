import { Settings2, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ReadingMode } from "@/hooks/useReadingMode";
import { StreamingSpeed } from "@/hooks/useStreamingSpeed";

import { useThemeManager } from "@/theme/useTheme";
import { THEMES } from "@/theme/themes";

interface ChatSettingsProps {
  readingMode: ReadingMode;
  setReadingMode: (mode: ReadingMode) => void;
  streamingSpeed: StreamingSpeed;
  setStreamingSpeed: (speed: StreamingSpeed) => void;
}

export function ChatSettings({ readingMode, setReadingMode, streamingSpeed, setStreamingSpeed }: ChatSettingsProps) {
  const { theme, applyTheme } = useThemeManager();

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
            <h3 className="font-semibold text-sm mb-3">Theme</h3>

            <div className="grid grid-cols-4 gap-2">
              {Object.keys(THEMES).map((name) => (
                <button
                  key={name}
                  onClick={() => applyTheme(name)}
                  className={`
                    w-8 h-8 rounded-full ring-2
                    ${theme === name ? "ring-primary" : "ring-transparent"}
                    transition
                  `}
                  style={{
                    background: THEMES[name]["bg-1"],
                  }}
                />
              ))}
            </div>
          </div>

          {/* Reading Mode */}
          <div className="border-t border-border/50 pt-4">
            <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
              <Settings2 className="h-4 w-4 text-primary" />
              Reading Mode
            </h3>

            <RadioGroup value={readingMode} onValueChange={(value) => setReadingMode(value as ReadingMode)}>
              <div className="space-y-2">
                {["compact", "comfortable", "expanded"].map((item) => (
                  <div
                    key={item}
                    className="flex items-center space-x-2 p-2 rounded-lg hover:bg-primary/5 transition-colors"
                  >
                    <RadioGroupItem value={item} id={item} />
                    <Label htmlFor={item} className="cursor-pointer flex-1 capitalize">
                      {item}
                    </Label>
                  </div>
                ))}
              </div>
            </RadioGroup>
          </div>

          {/* Streaming Speed */}
          <div className="border-t border-border/50 pt-4">
            <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
              <Zap className="h-4 w-4 text-primary" />
              Streaming Speed
            </h3>

            <RadioGroup value={streamingSpeed} onValueChange={(value) => setStreamingSpeed(value as StreamingSpeed)}>
              <div className="space-y-2">
                {["slow", "medium", "fast", "instant"].map((item) => (
                  <div
                    key={item}
                    className="flex items-center space-x-2 p-2 rounded-lg hover:bg-primary/5 transition-colors"
                  >
                    <RadioGroupItem value={item} id={item} />
                    <Label htmlFor={item} className="cursor-pointer flex-1 capitalize">
                      {item}
                    </Label>
                  </div>
                ))}
              </div>
            </RadioGroup>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
