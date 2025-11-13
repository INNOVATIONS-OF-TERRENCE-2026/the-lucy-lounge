import { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  CloudRain, 
  Waves, 
  Mountain, 
  Moon, 
  Trees, 
  Sunset,
  Sparkles
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface VideoControlsProps {
  isPaused: boolean;
  isMuted: boolean;
  currentTheme: string;
  onTogglePause: () => void;
  onToggleMute: () => void;
  onChangeTheme: (theme: string) => void;
}

const themes = [
  { value: 'nature', label: 'Nature Mix', icon: Sparkles },
  { value: 'rain', label: 'Rain', icon: CloudRain },
  { value: 'ocean', label: 'Ocean', icon: Waves },
  { value: 'mountain', label: 'Mountains', icon: Mountain },
  { value: 'nightsky', label: 'Night Sky', icon: Moon },
  { value: 'forest', label: 'Forest', icon: Trees },
  { value: 'sunset', label: 'Sunset', icon: Sunset },
];

export function VideoControls({ 
  isPaused, 
  isMuted, 
  currentTheme, 
  onTogglePause, 
  onToggleMute, 
  onChangeTheme 
}: VideoControlsProps) {
  const currentThemeData = themes.find(t => t.value === currentTheme) || themes[0];

  return (
    <TooltipProvider>
      <div className="flex items-center gap-2">
        {/* Theme Selector */}
        <DropdownMenu>
          <Tooltip>
            <TooltipTrigger asChild>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2">
                  <currentThemeData.icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{currentThemeData.label}</span>
                </Button>
              </DropdownMenuTrigger>
            </TooltipTrigger>
            <TooltipContent>
              <p>Change background theme</p>
            </TooltipContent>
          </Tooltip>
          <DropdownMenuContent align="end" className="w-48 bg-background/95 backdrop-blur-xl border-border/50">
            <DropdownMenuLabel>Background Theme</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {themes.map((theme) => {
              const Icon = theme.icon;
              return (
                <DropdownMenuItem
                  key={theme.value}
                  onClick={() => onChangeTheme(theme.value)}
                  className={currentTheme === theme.value ? 'bg-primary/10' : ''}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {theme.label}
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Pause/Play */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="sm" onClick={onTogglePause}>
              {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{isPaused ? 'Play' : 'Pause'} background</p>
          </TooltipContent>
        </Tooltip>

        {/* Mute/Unmute */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="sm" onClick={onToggleMute}>
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{isMuted ? 'Unmute' : 'Mute'} background</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
}