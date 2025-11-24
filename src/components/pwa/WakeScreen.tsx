import { useEffect, useState } from 'react';
import { AdvancedLucyAvatar } from '../avatar/AdvancedLucyAvatar';
import { Sparkles } from 'lucide-react';

export const WakeScreen = () => {
  const [isWaking, setIsWaking] = useState(false);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        const lastHidden = localStorage.getItem('last-hidden-time');
        if (lastHidden) {
          const hiddenDuration = Date.now() - parseInt(lastHidden);
          // If hidden for more than 5 minutes, show wake screen
          if (hiddenDuration > 300000) {
            setIsWaking(true);
            setTimeout(() => setIsWaking(false), 2000);
          }
        }
      } else {
        localStorage.setItem('last-hidden-time', Date.now().toString());
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  if (!isWaking) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-purple-950 via-indigo-950 to-black animate-fade-in">
      <div className="text-center">
        <div className="mb-6 flex justify-center animate-bounce">
          <AdvancedLucyAvatar size="xl" state="happy" />
        </div>
        <h2 className="text-3xl font-bold text-white mb-2 flex items-center gap-2 justify-center">
          <Sparkles className="w-6 h-6 text-accent" />
          Welcome back!
        </h2>
        <p className="text-white/80 text-lg">
          Lucy missed you ✨
        </p>
      </div>
    </div>
  );
};
