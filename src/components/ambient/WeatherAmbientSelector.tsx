import { useState } from 'react';
import { 
  Cloud, 
  CloudRain, 
  CloudSnow, 
  Sun, 
  CloudFog, 
  Wind, 
  Tornado,
  Flower2,
  Leaf,
  Snowflake,
  TreeDeciduous,
  X,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';
import { WeatherMode, SeasonMode, useWeatherAmbient } from '@/hooks/useWeatherAmbient';

const WEATHER_OPTIONS: { mode: WeatherMode; icon: React.ElementType; label: string }[] = [
  { mode: 'clear', icon: X, label: 'Clear' },
  { mode: 'rain', icon: CloudRain, label: 'Rain' },
  { mode: 'snow', icon: CloudSnow, label: 'Snow' },
  { mode: 'sunshine', icon: Sun, label: 'Sunshine' },
  { mode: 'cloudy', icon: Cloud, label: 'Cloudy' },
  { mode: 'bloomy', icon: CloudFog, label: 'Bloomy' },
  { mode: 'blizzard', icon: Snowflake, label: 'Blizzard' },
  { mode: 'hurricane', icon: Wind, label: 'Hurricane' },
  { mode: 'tornado', icon: Tornado, label: 'Tornado' },
];

const SEASON_OPTIONS: { mode: SeasonMode; icon: React.ElementType; label: string }[] = [
  { mode: 'none', icon: X, label: 'None' },
  { mode: 'spring', icon: Flower2, label: 'Spring' },
  { mode: 'summer', icon: Sun, label: 'Summer' },
  { mode: 'fall', icon: Leaf, label: 'Fall' },
  { mode: 'winter', icon: TreeDeciduous, label: 'Winter' },
];

export const WeatherAmbientSelector = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { 
    weather, 
    season, 
    intensity, 
    enabled,
    setWeather, 
    setSeason, 
    setIntensity,
    setEnabled 
  } = useWeatherAmbient();

  const activeWeatherOption = WEATHER_OPTIONS.find(w => w.mode === weather);
  const activeSeasonOption = SEASON_OPTIONS.find(s => s.mode === season);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-full">
      <CollapsibleTrigger asChild>
        <Button
          variant="ghost"
          className="w-full justify-between px-3 py-2 h-auto hover:bg-accent/50"
        >
          <div className="flex items-center gap-2">
            {activeWeatherOption && (
              <activeWeatherOption.icon className="h-4 w-4 text-muted-foreground" />
            )}
            <span className="text-sm font-medium">Weather & Seasons</span>
          </div>
          {isOpen ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          )}
        </Button>
      </CollapsibleTrigger>

      <CollapsibleContent className="px-2 pb-3 space-y-4">
        {/* Enable/Disable Toggle */}
        <div className="flex items-center justify-between pt-2">
          <span className="text-xs text-muted-foreground">Effects</span>
          <Button
            variant={enabled ? "default" : "outline"}
            size="sm"
            className="h-6 text-xs px-2"
            onClick={() => setEnabled(!enabled)}
          >
            {enabled ? 'On' : 'Off'}
          </Button>
        </div>

        {/* Weather Selection */}
        <div className="space-y-2">
          <span className="text-xs text-muted-foreground">Weather</span>
          <div className="grid grid-cols-3 gap-1">
            {WEATHER_OPTIONS.map(({ mode, icon: Icon, label }) => (
              <Button
                key={mode}
                variant={weather === mode ? "default" : "ghost"}
                size="sm"
                className={cn(
                  "h-8 text-xs flex-col gap-0.5 p-1",
                  weather === mode && "ring-1 ring-primary"
                )}
                onClick={() => setWeather(mode)}
                disabled={!enabled}
              >
                <Icon className="h-3 w-3" />
                <span className="text-[10px] truncate">{label}</span>
              </Button>
            ))}
          </div>
        </div>

        {/* Season Selection */}
        <div className="space-y-2">
          <span className="text-xs text-muted-foreground">Season</span>
          <div className="grid grid-cols-5 gap-1">
            {SEASON_OPTIONS.map(({ mode, icon: Icon, label }) => (
              <Button
                key={mode}
                variant={season === mode ? "default" : "ghost"}
                size="sm"
                className={cn(
                  "h-8 text-xs flex-col gap-0.5 p-1",
                  season === mode && "ring-1 ring-primary"
                )}
                onClick={() => setSeason(mode)}
                disabled={!enabled}
              >
                <Icon className="h-3 w-3" />
                <span className="text-[10px] truncate">{label}</span>
              </Button>
            ))}
          </div>
        </div>

        {/* Intensity Slider */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Intensity</span>
            <span className="text-xs text-muted-foreground">{Math.round(intensity * 100)}%</span>
          </div>
          <Slider
            value={[intensity * 100]}
            onValueChange={([value]) => setIntensity(value / 100)}
            min={10}
            max={100}
            step={10}
            disabled={!enabled}
            className="w-full"
          />
        </div>

        {/* Active State Display */}
        <div className="pt-1 border-t border-border/50">
          <p className="text-[10px] text-center text-muted-foreground">
            {enabled && weather !== 'clear' 
              ? `${activeWeatherOption?.label}${season !== 'none' ? ` • ${activeSeasonOption?.label}` : ''}`
              : 'No effects active'
            }
          </p>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};
