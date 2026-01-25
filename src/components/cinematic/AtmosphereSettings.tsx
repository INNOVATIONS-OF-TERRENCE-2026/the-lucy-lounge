/**
 * THE LUCY LOUNGE - Atmosphere Settings Panel
 * 
 * User control for cinematic features:
 * - Cinematic Level: Low / Medium / Ultra
 * - Motion Intensity Slider
 * - Audio-Visual Sync Toggle
 * - Reset to Calm
 * 
 * Rules:
 * - No forced presets
 * - Persist preferences in Supabase
 * - Offline fallback supported
 */

import React, { useCallback } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Settings2, Sparkles, Volume2, Eye, Palette, RotateCcw } from 'lucide-react';
import { useCinematic } from '@/contexts/CinematicContext';
import { CinematicLevel } from '@/hooks/useCinematicMode';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

interface AtmosphereSettingsProps {
  trigger?: React.ReactNode;
  className?: string;
}

const levelDescriptions: Record<CinematicLevel, string> = {
  off: 'Minimal effects for maximum performance',
  low: 'Subtle animations and transitions',
  medium: 'Balanced cinematic experience',
  ultra: 'Full immersive atmosphere',
};

const levelColors: Record<CinematicLevel, string> = {
  off: 'bg-slate-500',
  low: 'bg-blue-500',
  medium: 'bg-purple-500',
  ultra: 'bg-amber-500',
};

export function AtmosphereSettings({ trigger, className = '' }: AtmosphereSettingsProps) {
  const {
    settings,
    rawSettings,
    updateSettings,
    setLevel,
    resetToCalm,
    reducedMotion,
    lowPower,
  } = useCinematic();

  const shouldReduceMotion = useReducedMotion();

  const handleLevelChange = useCallback((level: CinematicLevel) => {
    setLevel(level);
  }, [setLevel]);

  const handleMotionIntensityChange = useCallback((value: number[]) => {
    updateSettings({ motionIntensity: value[0] });
  }, [updateSettings]);

  const handleToggle = useCallback((key: keyof typeof settings) => {
    updateSettings({ [key]: !settings[key] });
  }, [updateSettings, settings]);

  return (
    <Sheet>
      <SheetTrigger asChild>
        {trigger || (
          <Button variant="ghost" size="icon" className={className}>
            <Settings2 className="h-5 w-5" />
          </Button>
        )}
      </SheetTrigger>
      
      <SheetContent className="w-[340px] sm:w-[400px]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-500" />
            Atmosphere
          </SheetTitle>
          <SheetDescription>
            Customize your cinematic experience
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* System notices */}
          {(reducedMotion || lowPower) && (
            <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-sm">
              {reducedMotion && (
                <p className="text-amber-200">
                  ⚡ Reduced motion preference detected. Some effects are disabled.
                </p>
              )}
              {lowPower && (
                <p className="text-amber-200">
                  🔋 Low-power device detected. Effects are optimized.
                </p>
              )}
            </div>
          )}

          {/* Cinematic Level */}
          <div className="space-y-3">
            <Label className="text-sm font-medium flex items-center gap-2">
              <Palette className="h-4 w-4" />
              Cinematic Level
            </Label>
            
            <div className="grid grid-cols-4 gap-2">
              {(['off', 'low', 'medium', 'ultra'] as CinematicLevel[]).map((level) => (
                <motion.button
                  key={level}
                  className={`
                    px-3 py-2 rounded-lg text-xs font-medium capitalize
                    transition-colors duration-200
                    ${rawSettings.level === level 
                      ? `${levelColors[level]} text-white` 
                      : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                    }
                  `}
                  onClick={() => handleLevelChange(level)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={reducedMotion && level !== 'off'}
                >
                  {level}
                </motion.button>
              ))}
            </div>
            
            <p className="text-xs text-muted-foreground">
              {levelDescriptions[rawSettings.level]}
            </p>
          </div>

          {/* Motion Intensity Slider */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium flex items-center gap-2">
                <Eye className="h-4 w-4" />
                Motion Intensity
              </Label>
              <span className="text-xs text-muted-foreground">
                {rawSettings.motionIntensity}%
              </span>
            </div>
            
            <Slider
              value={[rawSettings.motionIntensity]}
              onValueChange={handleMotionIntensityChange}
              max={100}
              min={0}
              step={5}
              disabled={reducedMotion || rawSettings.level === 'off'}
              className="w-full"
            />
            
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Subtle</span>
              <span>Intense</span>
            </div>
          </div>

          {/* Toggle Options */}
          <div className="space-y-4">
            <Label className="text-sm font-medium">Features</Label>
            
            {/* Audio-Visual Sync */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Volume2 className="h-4 w-4 text-muted-foreground" />
                <div>
                  <Label className="text-sm">Audio-Visual Sync</Label>
                  <p className="text-xs text-muted-foreground">
                    Visuals react to music
                  </p>
                </div>
              </div>
              <Switch
                checked={rawSettings.audioVisualSync}
                onCheckedChange={() => handleToggle('audioVisualSync')}
                disabled={rawSettings.level === 'off'}
              />
            </div>

            {/* Film Grain */}
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm">Film Grain</Label>
                <p className="text-xs text-muted-foreground">
                  Subtle texture overlay
                </p>
              </div>
              <Switch
                checked={rawSettings.filmGrain}
                onCheckedChange={() => handleToggle('filmGrain')}
                disabled={rawSettings.level === 'off'}
              />
            </div>

            {/* Ambient Glow */}
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm">Ambient Glow</Label>
                <p className="text-xs text-muted-foreground">
                  Background lighting effects
                </p>
              </div>
              <Switch
                checked={rawSettings.ambientGlow}
                onCheckedChange={() => handleToggle('ambientGlow')}
                disabled={rawSettings.level === 'off'}
              />
            </div>

            {/* Particle Effects */}
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm">Particle Effects</Label>
                <p className="text-xs text-muted-foreground">
                  Floating ambient particles
                </p>
              </div>
              <Switch
                checked={rawSettings.particleEffects}
                onCheckedChange={() => handleToggle('particleEffects')}
                disabled={rawSettings.level === 'off' || lowPower}
              />
            </div>

            {/* Page Transitions */}
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm">Page Transitions</Label>
                <p className="text-xs text-muted-foreground">
                  Smooth route animations
                </p>
              </div>
              <Switch
                checked={rawSettings.pageTransitions}
                onCheckedChange={() => handleToggle('pageTransitions')}
                disabled={rawSettings.level === 'off' || reducedMotion}
              />
            </div>

            {/* Lucy Presence */}
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm">Lucy Presence</Label>
                <p className="text-xs text-muted-foreground">
                  Avatar micro-interactions
                </p>
              </div>
              <Switch
                checked={rawSettings.lucyPresence}
                onCheckedChange={() => handleToggle('lucyPresence')}
                disabled={rawSettings.level === 'off'}
              />
            </div>
          </div>

          {/* Reset Button */}
          <div className="pt-4 border-t">
            <Button
              variant="outline"
              className="w-full"
              onClick={resetToCalm}
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset to Calm
            </Button>
            <p className="text-xs text-muted-foreground mt-2 text-center">
              Restores a peaceful, low-intensity experience
            </p>
          </div>

          {/* Preview indicator */}
          <div className="pt-4">
            <div className="p-4 rounded-lg bg-gradient-to-br from-purple-500/10 via-transparent to-blue-500/10 border border-white/5">
              <div className="flex items-center gap-3">
                <motion.div
                  className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500"
                  animate={rawSettings.level !== 'off' ? {
                    scale: [1, 1.05, 1],
                    opacity: [0.8, 1, 0.8],
                  } : {}}
                  transition={{ 
                    duration: 2 / (rawSettings.motionIntensity / 50 || 1),
                    repeat: Infinity,
                  }}
                />
                <div>
                  <p className="text-sm font-medium">Live Preview</p>
                  <p className="text-xs text-muted-foreground">
                    {rawSettings.level === 'off' ? 'Effects disabled' : 'Feeling the atmosphere'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

/**
 * Compact Atmosphere Toggle - For toolbar/header use
 */
interface AtmosphereToggleProps {
  className?: string;
}

export function AtmosphereToggle({ className = '' }: AtmosphereToggleProps) {
  const { settings, setLevel } = useCinematic();
  
  const levels: CinematicLevel[] = ['off', 'low', 'medium', 'ultra'];
  const currentIndex = levels.indexOf(settings.level);
  
  const cycleLevel = useCallback(() => {
    const nextIndex = (currentIndex + 1) % levels.length;
    setLevel(levels[nextIndex]);
  }, [currentIndex, setLevel]);

  return (
    <Button
      variant="ghost"
      size="sm"
      className={`gap-2 ${className}`}
      onClick={cycleLevel}
    >
      <motion.div
        className={`w-2 h-2 rounded-full ${levelColors[settings.level]}`}
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
      />
      <span className="text-xs capitalize">{settings.level}</span>
    </Button>
  );
}

export default AtmosphereSettings;
