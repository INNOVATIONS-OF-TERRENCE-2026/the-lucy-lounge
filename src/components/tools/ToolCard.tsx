import { LucideIcon } from 'lucide-react';
import { HolographicCard } from '../ui/HolographicCard';
import { RippleButton } from '../ui/RippleButton';
import { useSoundSystem } from '@/hooks/useSoundSystem';

interface ToolCardProps {
  icon: LucideIcon;
  name: string;
  description: string;
  category: string;
  onLaunch: () => void;
  isPinned?: boolean;
  isActive?: boolean;
}

export const ToolCard = ({ 
  icon: Icon, 
  name, 
  description, 
  category,
  onLaunch,
  isPinned = false,
  isActive = false
}: ToolCardProps) => {
  const { playClickSound } = useSoundSystem();

  const handleLaunch = () => {
    playClickSound();
    onLaunch();
  };

  return (
    <HolographicCard 
      className={`p-5 transition-all ${isActive ? 'ring-2 ring-accent' : ''}`}
      glowColor={isActive ? 'accent' : 'primary'}
    >
      <div className="flex items-start gap-4">
        <div className={`p-3 rounded-[12px] bg-gradient-button ${isActive ? 'animate-pulse' : ''}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        
        <div className="flex-1">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h3 className="font-bold text-white text-lg">{name}</h3>
              <span className="text-xs text-accent">{category}</span>
            </div>
            {isPinned && (
              <div className="text-accent text-xs px-2 py-1 bg-accent/10 rounded-full">
                Pinned
              </div>
            )}
          </div>
          
          <p className="text-sm text-white/70 mb-4">{description}</p>
          
          <RippleButton 
            variant={isActive ? 'gradient' : 'outline'} 
            size="sm" 
            className="w-full"
            onClick={handleLaunch}
          >
            {isActive ? 'Active' : 'Launch'}
          </RippleButton>
        </div>
      </div>

      {/* Hologram effect when active */}
      {isActive && (
        <div className="absolute inset-0 rounded-[14px] border border-accent/50 animate-pulse pointer-events-none" />
      )}
    </HolographicCard>
  );
};
