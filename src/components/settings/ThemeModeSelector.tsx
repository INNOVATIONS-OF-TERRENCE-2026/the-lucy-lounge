import { Settings } from 'lucide-react';
import { HolographicCard } from '../ui/HolographicCard';
import { RippleButton } from '../ui/RippleButton';
import { ThemeMode } from '@/hooks/useAmbientIntelligence';
import { useSoundSystem } from '@/hooks/useSoundSystem';

interface ThemeModeSelectorProps {
  currentMode: ThemeMode;
  onModeChange: (mode: ThemeMode) => void;
}

export const ThemeModeSelector = ({ currentMode, onModeChange }: ThemeModeSelectorProps) => {
  const { playClickSound } = useSoundSystem();
  
  const themes: { mode: ThemeMode; label: string; emoji: string }[] = [
    { mode: 'cosmic', label: 'Cosmic', emoji: '🌌' },
    { mode: 'neon', label: 'Neon Grid', emoji: '🎆' },
    { mode: 'nature', label: 'Nature', emoji: '🌿' },
    { mode: 'noir', label: 'Noir', emoji: '🌑' },
    { mode: 'rain', label: 'Rain', emoji: '🌧️' }
  ];

  const handleThemeChange = (mode: ThemeMode) => {
    playClickSound();
    onModeChange(mode);
    localStorage.setItem('theme-mode', mode);
  };

  return (
    <HolographicCard className="p-6">
      <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
        <Settings className="w-5 h-5 text-accent" />
        Environment Theme
      </h3>
      
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {themes.map((theme) => (
          <RippleButton
            key={theme.mode}
            variant={currentMode === theme.mode ? 'gradient' : 'outline'}
            className="h-20 flex flex-col items-center justify-center gap-2"
            onClick={() => handleThemeChange(theme.mode)}
          >
            <span className="text-2xl">{theme.emoji}</span>
            <span className="text-sm">{theme.label}</span>
          </RippleButton>
        ))}
      </div>
    </HolographicCard>
  );
};
