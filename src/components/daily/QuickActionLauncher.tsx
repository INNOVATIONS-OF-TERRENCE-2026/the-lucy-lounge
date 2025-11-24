import { MessageSquare, Zap, Wrench, Mic, FileText, Image } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { HolographicCard } from '../ui/HolographicCard';
import { RippleButton } from '../ui/RippleButton';
import { useSoundSystem } from '@/hooks/useSoundSystem';

export const QuickActionLauncher = () => {
  const navigate = useNavigate();
  const { playClickSound } = useSoundSystem();

  const actions = [
    { icon: MessageSquare, label: 'New Chat', action: () => navigate('/chat'), color: 'primary' },
    { icon: Zap, label: 'Continue', action: () => navigate('/chat'), color: 'accent' },
    { icon: Wrench, label: 'Tools', action: () => navigate('/tools'), color: 'secondary' },
    { icon: FileText, label: 'Analyze', action: () => navigate('/chat'), color: 'primary' },
    { icon: Image, label: 'Generate', action: () => navigate('/chat'), color: 'accent' },
    { icon: Mic, label: 'Voice', action: () => navigate('/chat'), color: 'secondary' },
  ];

  const handleAction = (action: () => void) => {
    playClickSound();
    action();
  };

  return (
    <HolographicCard className="p-6">
      <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
        <Zap className="w-5 h-5 text-accent" />
        Quick Actions
      </h3>
      
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {actions.map((item, index) => {
          const Icon = item.icon;
          return (
            <RippleButton
              key={index}
              variant="outline"
              className="h-20 flex flex-col items-center justify-center gap-2 hover:bg-white/10"
              onClick={() => handleAction(item.action)}
            >
              <Icon className="w-6 h-6" />
              <span className="text-sm">{item.label}</span>
            </RippleButton>
          );
        })}
      </div>
    </HolographicCard>
  );
};
