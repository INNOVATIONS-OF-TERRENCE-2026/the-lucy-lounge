/**
 * UI Density Control Panel
 * 
 * User-accessible controls for:
 * - Density preset (Comfort / Standard / Compact)
 * - UI scale multiplier (0.85x - 1.15x)
 */

import React from 'react';
import { useUIDensity, DensityPreset } from '@/hooks/useUIDensity';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { RotateCcw, Maximize2, Monitor, Minimize2 } from 'lucide-react';

interface UIDensityControlProps {
  showLabels?: boolean;
  className?: string;
}

const PRESET_INFO: Record<DensityPreset, { label: string; description: string; icon: React.ReactNode }> = {
  comfort: {
    label: 'Comfort',
    description: 'Spacious & breathable',
    icon: <Maximize2 className="w-4 h-4" />,
  },
  standard: {
    label: 'Standard',
    description: 'Balanced density',
    icon: <Monitor className="w-4 h-4" />,
  },
  compact: {
    label: 'Compact',
    description: 'Information dense',
    icon: <Minimize2 className="w-4 h-4" />,
  },
};

export function UIDensityControl({ showLabels = true, className = '' }: UIDensityControlProps) {
  const { density, scale, deviceClass, setDensity, setScale, resetToDefaults } = useUIDensity();

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Density Presets */}
      <div className="space-y-2">
        {showLabels && (
          <Label className="text-sm font-medium text-muted-foreground">
            UI Density
          </Label>
        )}
        <div className="flex gap-2">
          {(Object.keys(PRESET_INFO) as DensityPreset[]).map((preset) => {
            const { label, icon } = PRESET_INFO[preset];
            const isActive = density === preset;
            
            return (
              <Button
                key={preset}
                variant={isActive ? 'default' : 'outline'}
                size="sm"
                onClick={() => setDensity(preset)}
                className={`flex-1 gap-2 ${isActive ? 'ring-2 ring-primary/50' : ''}`}
              >
                {icon}
                <span className="hidden sm:inline">{label}</span>
              </Button>
            );
          })}
        </div>
        {showLabels && (
          <p className="text-xs text-muted-foreground">
            {PRESET_INFO[density].description}
          </p>
        )}
      </div>

      {/* Scale Slider */}
      <div className="space-y-2">
        {showLabels && (
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium text-muted-foreground">
              UI Scale
            </Label>
            <span className="text-xs font-mono text-muted-foreground">
              {(scale * 100).toFixed(0)}%
            </span>
          </div>
        )}
        <Slider
          value={[scale]}
          onValueChange={([value]) => setScale(value)}
          min={0.85}
          max={1.15}
          step={0.01}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>85%</span>
          <span>100%</span>
          <span>115%</span>
        </div>
      </div>

      {/* Device Info & Reset */}
      <div className="flex items-center justify-between pt-2 border-t border-border/50">
        <span className="text-xs text-muted-foreground capitalize">
          Detected: {deviceClass}
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={resetToDefaults}
          className="gap-1 text-xs h-7"
        >
          <RotateCcw className="w-3 h-3" />
          Reset
        </Button>
      </div>
    </div>
  );
}

// Compact version for settings menus
export function UIDensityControlCompact({ className = '' }: { className?: string }) {
  return <UIDensityControl showLabels={false} className={className} />;
}

export default UIDensityControl;
