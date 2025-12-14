import { useState, useEffect } from 'react';
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
  Volume2,
  VolumeX,
  Music,
  SkipForward
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';
import { WeatherMode, SeasonMode, useWeatherAmbient } from '@/hooks/useWeatherAmbient';
import { useFocusMode } from '@/hooks/useFocusMode';
import { useAudioManager, MusicGenre } from '@/hooks/useAudioManager';

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

const MUSIC_OPTIONS: { genre: MusicGenre; label: string }[] = [
  { genre: 'none', label: 'Off' },
  { genre: 'jazz', label: 'Jazz' },
  { genre: 'rnb', label: "90's R&B" },
  { genre: 'lofi', label: 'Lo-Fi' },
  { genre: 'ambient', label: 'Ambient' },
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
  const {
    audioState,
    currentMusic,
    currentTrackName,
    volume,
    soundEnabled,
    musicEnabled,
    setSoundEnabled,
    setMusicEnabled,
    setVolume,
    playWeatherSound,
    playMusic,
    stopAll,
    skipTrack,
  } = useAudioManager();

  const activeWeatherOption = WEATHER_OPTIONS.find(w => w.mode === weather);
  const activeSeasonOption = SEASON_OPTIONS.find(s => s.mode === season);

  // Trigger weather sound when weather/season changes and sound is enabled
  useEffect(() => {
    if (soundEnabled && enabled && !focusMode && weather !== 'clear') {
      playWeatherSound(weather, season);
    } else if (!soundEnabled || !enabled || focusMode || weather === 'clear') {
      if (audioState === 'weather') {
        stopAll();
      }
    }
  }, [weather, season, soundEnabled, enabled, focusMode]);

  const handleWeatherChange = (mode: WeatherMode) => {
    setWeather(mode);
    if (soundEnabled && enabled && !focusMode && mode !== 'clear') {
      playWeatherSound(mode, season);
    }
  };

  const handleSeasonChange = (mode: SeasonMode) => {
    setSeason(mode);
    if (soundEnabled && enabled && !focusMode && weather !== 'clear') {
      playWeatherSound(weather, mode);
    }
  };

  const handleSoundToggle = () => {
    const newEnabled = !soundEnabled;
    setSoundEnabled(newEnabled);
    if (newEnabled && enabled && !focusMode && weather !== 'clear') {
      playWeatherSound(weather, season);
    } else if (!newEnabled) {
      stopAll();
    }
    // Disable music when sound is enabled
    if (newEnabled) {
      setMusicEnabled(false);
    }
  };

  const handleMusicSelect = (genre: MusicGenre) => {
    if (genre === 'none') {
      setMusicEnabled(false);
      stopAll();
    } else {
      setMusicEnabled(true);
      setSoundEnabled(false);
      playMusic(genre);
    }
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

        {/* Sound Toggle */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            {soundEnabled && !focusMode ? (
              <Volume2 className="h-3.5 w-3.5 text-muted-foreground" />
            ) : (
              <VolumeX className="h-3.5 w-3.5 text-muted-foreground" />
            )}
            <span className="text-xs text-muted-foreground">Weather Sound</span>
          </div>
          <Button
            variant={soundEnabled && !focusMode ? "default" : "outline"}
            size="sm"
            className="h-6 text-xs px-2"
            onClick={handleSoundToggle}
            disabled={focusMode}
          >
            {soundEnabled && !focusMode ? 'On' : 'Off'}
          </Button>
        </div>

        {/* Volume Slider */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Volume</span>
            <span className="text-xs text-muted-foreground">{Math.round(volume * 100)}%</span>
          </div>
          <Slider
            value={[volume * 100]}
            onValueChange={([val]) => setVolume(val / 100)}
            min={0}
            max={100}
            step={5}
            disabled={focusMode}
            className="w-full"
          />
        </div>

        {/* Music Selection */}
        <div className="space-y-2">
          <div className="flex items-center gap-1.5">
            <Music className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Music Genre</span>
          </div>
          <div className="grid grid-cols-5 gap-1">
            {MUSIC_OPTIONS.map(({ genre, label }) => (
              <Button
                key={genre}
                variant={currentMusic === genre ? "default" : "ghost"}
                size="sm"
                className={cn(
                  "h-7 text-[10px] p-1",
                  currentMusic === genre && "ring-1 ring-primary"
                )}
                onClick={() => handleMusicSelect(genre)}
                disabled={focusMode}
              >
                {label}
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

        {/* Now Playing Display with Skip Button */}
        {(audioState === 'weather' || audioState === 'music') && currentTrackName && !focusMode && (
          <div className="flex items-center justify-between gap-2 py-2 px-2 rounded-md bg-primary/5 border border-primary/10">
            <div className="flex-1 min-w-0">
              <p className="text-[10px] text-muted-foreground truncate">Now Playing</p>
              <p className="text-xs font-medium text-foreground/90 truncate">{currentTrackName}</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 shrink-0 hover:bg-primary/10"
              onClick={skipTrack}
              title="Skip to next track"
            >
              <SkipForward className="h-3.5 w-3.5" />
            </Button>
          </div>
        )}

        {/* Active State Display */}
        <div className="pt-1 border-t border-border/50">
          <p className="text-[10px] text-center text-muted-foreground">
            {focusMode 
              ? 'Focus Mode Active • All Audio Stopped'
              : audioState === 'music' && currentMusic !== 'none'
                ? `${MUSIC_OPTIONS.find(m => m.genre === currentMusic)?.label || 'Music'} Playlist`
                : audioState === 'weather' && weather !== 'clear'
                  ? `${activeWeatherOption?.label} Mix${season !== 'none' ? ` • ${activeSeasonOption?.label}` : ''}`
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
