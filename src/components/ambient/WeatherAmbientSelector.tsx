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
  ChevronUp,
  Focus,
  Music,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';
import { WeatherMode, SeasonMode, useWeatherAmbient } from '@/hooks/useWeatherAmbient';
import { useFocusMode } from '@/hooks/useFocusMode';
import { useGlobalSpotify } from '@/contexts/GlobalSpotifyContext';

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

// Spotify playlist IDs for music genres
const SPOTIFY_GENRES = [
  { id: 'lofi', label: 'Lo-Fi', spotifyId: '37i9dQZF1DWWQRwui0ExPn' },
  { id: 'jazz', label: 'Jazz', spotifyId: '37i9dQZF1DX0SM0LYsmbMT' },
  { id: 'rnb', label: "R&B", spotifyId: '37i9dQZF1DX4SBhb3fqCJd' },
  { id: 'ambient', label: 'Ambient', spotifyId: '37i9dQZF1DX3Ogo9pFvBkY' },
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
  const { focusMode, toggleFocusMode } = useFocusMode();
  const { state, setPlayback, toggleDrawer } = useGlobalSpotify();

  const activeWeatherOption = WEATHER_OPTIONS.find(w => w.mode === weather);
  const activeSeasonOption = SEASON_OPTIONS.find(s => s.mode === season);

  const handleWeatherChange = (mode: WeatherMode) => {
    setWeather(mode);
  };

  const handleSeasonChange = (mode: SeasonMode) => {
    setSeason(mode);
  };

  // HC-03 & HC-09: User-initiated only, one-way data flow
  const handleMusicSelect = (genre: typeof SPOTIFY_GENRES[number]) => {
    setPlayback(genre.spotifyId, genre.id, 'playlist');
    toggleDrawer();
  };

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
        {/* Focus Mode Toggle */}
        <div className="flex items-center justify-between pt-2 pb-2 border-b border-border/30">
          <div className="flex items-center gap-1.5">
            <Focus className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Focus Mode</span>
          </div>
          <Button
            variant={focusMode ? "default" : "outline"}
            size="sm"
            className={cn(
              "h-6 text-xs px-2",
              focusMode && "bg-primary text-primary-foreground"
            )}
            onClick={toggleFocusMode}
          >
            {focusMode ? 'On' : 'Off'}
          </Button>
        </div>

        {/* Enable/Disable Toggle */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Visual Effects</span>
          <Button
            variant={enabled && !focusMode ? "default" : "outline"}
            size="sm"
            className="h-6 text-xs px-2"
            onClick={() => setEnabled(!enabled)}
            disabled={focusMode}
          >
            {enabled && !focusMode ? 'On' : 'Off'}
          </Button>
        </div>

        {/* Music Selection - Now uses Spotify */}
        <div className="space-y-2">
          <div className="flex items-center gap-1.5">
            <Music className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Music (Spotify)</span>
          </div>
          <div className="grid grid-cols-4 gap-1">
            {SPOTIFY_GENRES.map((genre) => (
              <Button
                key={genre.id}
                variant={state.currentGenre === genre.id ? "default" : "ghost"}
                size="sm"
                className={cn(
                  "h-7 text-[10px] p-1",
                  state.currentGenre === genre.id && "ring-1 ring-primary"
                )}
                onClick={() => handleMusicSelect(genre)}
                disabled={focusMode}
              >
                {genre.label}
              </Button>
            ))}
          </div>
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
                onClick={() => handleWeatherChange(mode)}
                disabled={!enabled || focusMode}
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
                onClick={() => handleSeasonChange(mode)}
                disabled={!enabled || focusMode}
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
            <span className="text-xs text-muted-foreground">Visual Intensity</span>
            <span className="text-xs text-muted-foreground">{Math.round(intensity * 100)}%</span>
          </div>
          <Slider
            value={[intensity * 100]}
            onValueChange={([value]) => setIntensity(value / 100)}
            min={10}
            max={100}
            step={10}
            disabled={!enabled || focusMode}
            className="w-full"
          />
        </div>

        {/* Spotify Now Playing Indicator */}
        {state.isDrawerOpen && !focusMode && (
          <div className="flex items-center justify-between gap-2 py-2 px-2 rounded-md bg-primary/5 border border-primary/10">
            <div className="flex-1 min-w-0">
              <p className="text-[10px] text-muted-foreground truncate">Now Playing</p>
              <p className="text-xs font-medium text-foreground/90 truncate">
                {state.currentGenre.toUpperCase()} via Spotify
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-[10px] px-2"
              onClick={toggleDrawer}
            >
              {state.isDrawerOpen ? 'Hide' : 'Show'}
            </Button>
          </div>
        )}

        {/* Active State Display */}
        <div className="pt-1 border-t border-border/50">
          <p className="text-[10px] text-center text-muted-foreground">
            {focusMode 
              ? 'Focus Mode Active'
              : state.isDrawerOpen
                ? `${state.currentGenre.toUpperCase()} • Spotify`
                : enabled && weather !== 'clear' 
                  ? `${activeWeatherOption?.label}${season !== 'none' ? ` • ${activeSeasonOption?.label}` : ''} (Visual Only)`
                  : 'No effects active'
            }
          </p>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};
