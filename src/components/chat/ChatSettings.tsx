import { Settings2, Zap, Monitor, Smartphone, Tablet, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Slider } from '@/components/ui/slider';
import { ReadingMode } from '@/hooks/useReadingMode';
import { StreamingSpeed } from '@/hooks/useStreamingSpeed';
import { useUIDensity, type DensityPreset } from '@/hooks/useUIDensity';

interface ChatSettingsProps {
  readingMode: ReadingMode;
  setReadingMode: (mode: ReadingMode) => void;
  streamingSpeed: StreamingSpeed;
  setStreamingSpeed: (speed: StreamingSpeed) => void;
}

export function ChatSettings({
  readingMode,
  setReadingMode,
  streamingSpeed,
  setStreamingSpeed,
}: ChatSettingsProps) {
  const { density, deviceClass, scale, setDensity, setScale, resetToDefaults } = useUIDensity();
  
  const DeviceIcon = deviceClass === 'phone' ? Smartphone : deviceClass === 'tablet' ? Tablet : Monitor;
  
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
      <PopoverContent className="w-80 glass-card-enhanced border-primary/40 max-h-[85vh] overflow-y-auto" align="end">
        <div className="space-y-6">
          {/* UI DENSITY SECTION */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-sm flex items-center gap-2">
                <DeviceIcon className="h-4 w-4 text-primary" />
                UI Density
              </h3>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={resetToDefaults}
                className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
              >
                <RotateCcw className="h-3 w-3 mr-1" />
                Reset
              </Button>
            </div>
            <RadioGroup value={density} onValueChange={(value) => setDensity(value as DensityPreset)}>
              <div className="space-y-2">
                <div className="flex items-center space-x-2 p-2 rounded-lg hover:bg-primary/5 transition-colors">
                  <RadioGroupItem value="comfort" id="density-comfort" />
                  <Label htmlFor="density-comfort" className="cursor-pointer flex-1">
                    <div className="font-medium">Comfort</div>
                    <div className="text-xs text-muted-foreground">Spacious, easy on eyes</div>
                  </Label>
                </div>
                <div className="flex items-center space-x-2 p-2 rounded-lg hover:bg-primary/5 transition-colors">
                  <RadioGroupItem value="standard" id="density-standard" />
                  <Label htmlFor="density-standard" className="cursor-pointer flex-1">
                    <div className="font-medium">Standard</div>
                    <div className="text-xs text-muted-foreground">Balanced layout</div>
                  </Label>
                </div>
                <div className="flex items-center space-x-2 p-2 rounded-lg hover:bg-primary/5 transition-colors">
                  <RadioGroupItem value="compact" id="density-compact" />
                  <Label htmlFor="density-compact" className="cursor-pointer flex-1">
                    <div className="font-medium">Compact</div>
                    <div className="text-xs text-muted-foreground">More content on screen</div>
                  </Label>
                </div>
              </div>
            </RadioGroup>
            
            {/* Scale Slider */}
            <div className="mt-4 pt-3 border-t border-border/30">
              <div className="flex items-center justify-between mb-2">
                <Label className="text-xs text-muted-foreground">Fine-tune Scale</Label>
                <span className="text-xs font-mono text-primary">{Math.round(scale * 100)}%</span>
              </div>
              <Slider
                value={[scale]}
                onValueChange={([val]) => setScale(val)}
                min={0.85}
                max={1.15}
                step={0.01}
                className="w-full"
              />
              <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                <span>85%</span>
                <span>100%</span>
                <span>115%</span>
              </div>
            </div>
          </div>

          <div className="border-t border-border/50 pt-4">
            <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
              <Settings2 className="h-4 w-4 text-primary" />
              Reading Mode
            </h3>
            <RadioGroup value={readingMode} onValueChange={(value) => setReadingMode(value as ReadingMode)}>
              <div className="space-y-2">
                <div className="flex items-center space-x-2 p-2 rounded-lg hover:bg-primary/5 transition-colors">
                  <RadioGroupItem value="compact" id="compact" />
                  <Label htmlFor="compact" className="cursor-pointer flex-1">
                    <div className="font-medium">Compact</div>
                    <div className="text-xs text-muted-foreground">Tight spacing, more content</div>
                  </Label>
                </div>
                <div className="flex items-center space-x-2 p-2 rounded-lg hover:bg-primary/5 transition-colors">
                  <RadioGroupItem value="comfortable" id="comfortable" />
                  <Label htmlFor="comfortable" className="cursor-pointer flex-1">
                    <div className="font-medium">Comfortable</div>
                    <div className="text-xs text-muted-foreground">Balanced spacing (default)</div>
                  </Label>
                </div>
                <div className="flex items-center space-x-2 p-2 rounded-lg hover:bg-primary/5 transition-colors">
                  <RadioGroupItem value="expanded" id="expanded" />
                  <Label htmlFor="expanded" className="cursor-pointer flex-1">
                    <div className="font-medium">Expanded</div>
                    <div className="text-xs text-muted-foreground">Large spacing, easy reading</div>
                  </Label>
                </div>
              </div>
            </RadioGroup>
          </div>

          <div className="border-t border-border/50 pt-4">
            <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
              <Zap className="h-4 w-4 text-primary" />
              Streaming Speed
            </h3>
            <RadioGroup value={streamingSpeed} onValueChange={(value) => setStreamingSpeed(value as StreamingSpeed)}>
              <div className="space-y-2">
                <div className="flex items-center space-x-2 p-2 rounded-lg hover:bg-primary/5 transition-colors">
                  <RadioGroupItem value="slow" id="slow" />
                  <Label htmlFor="slow" className="cursor-pointer flex-1">
                    <div className="font-medium">Slow</div>
                    <div className="text-xs text-muted-foreground">Cinematic typing effect</div>
                  </Label>
                </div>
                <div className="flex items-center space-x-2 p-2 rounded-lg hover:bg-primary/5 transition-colors">
                  <RadioGroupItem value="medium" id="medium" />
                  <Label htmlFor="medium" className="cursor-pointer flex-1">
                    <div className="font-medium">Medium</div>
                    <div className="text-xs text-muted-foreground">Balanced speed (default)</div>
                  </Label>
                </div>
                <div className="flex items-center space-x-2 p-2 rounded-lg hover:bg-primary/5 transition-colors">
                  <RadioGroupItem value="fast" id="fast" />
                  <Label htmlFor="fast" className="cursor-pointer flex-1">
                    <div className="font-medium">Fast</div>
                    <div className="text-xs text-muted-foreground">Quick responses</div>
                  </Label>
                </div>
                <div className="flex items-center space-x-2 p-2 rounded-lg hover:bg-primary/5 transition-colors">
                  <RadioGroupItem value="instant" id="instant" />
                  <Label htmlFor="instant" className="cursor-pointer flex-1">
                    <div className="font-medium">Instant</div>
                    <div className="text-xs text-muted-foreground">No animation</div>
                  </Label>
                </div>
              </div>
            </RadioGroup>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
