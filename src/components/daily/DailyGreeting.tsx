import { useEffect, useState } from 'react';
import { useAmbientIntelligence } from '@/hooks/useAmbientIntelligence';
import { AdvancedLucyAvatar } from '../avatar/AdvancedLucyAvatar';
import { HolographicCard } from '../ui/HolographicCard';
import { Button } from '../ui/button';
import { X, Sparkles } from 'lucide-react';

export const DailyGreeting = () => {
  const [show, setShow] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const { getGreeting, timeOfDay } = useAmbientIntelligence();

  useEffect(() => {
    const lastGreeting = localStorage.getItem('last-greeting-date');
    const today = new Date().toDateString();
    
    if (lastGreeting !== today && !dismissed) {
      setTimeout(() => setShow(true), 2000);
    }
  }, [dismissed]);

  const handleDismiss = () => {
    setShow(false);
    setDismissed(true);
    localStorage.setItem('last-greeting-date', new Date().toDateString());
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
      <HolographicCard className="max-w-md mx-4 text-center">
        <button
          onClick={handleDismiss}
          className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-6 flex justify-center">
          <AdvancedLucyAvatar size="xl" state="happy" />
        </div>

        <h2 className="text-3xl font-bold bg-gradient-button bg-clip-text text-transparent mb-3">
          {getGreeting()}
        </h2>

        <p className="text-white/80 mb-6 text-lg">
          I'm Lucy, your AI companion. Ready to create something amazing together?
        </p>

        <div className="flex gap-3 justify-center">
          <Button 
            variant="gradient" 
            size="lg"
            onClick={handleDismiss}
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Let's Go!
          </Button>
          <Button 
            variant="outline" 
            size="lg"
            onClick={handleDismiss}
          >
            Maybe Later
          </Button>
        </div>
      </HolographicCard>
    </div>
  );
};
