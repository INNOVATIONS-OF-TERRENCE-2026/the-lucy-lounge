import { useEffect, useState } from 'react';
import { HolographicCard } from '../ui/HolographicCard';
import { Flame, Trophy, Zap } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

export const UsageStreak = () => {
  const [streak, setStreak] = useState(0);
  const [todayXP, setTodayXP] = useState(0);
  const [level, setLevel] = useState(1);

  useEffect(() => {
    loadStreakData();
  }, []);

  const loadStreakData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Load from local storage first
      const localStreak = parseInt(localStorage.getItem('usage-streak') || '0');
      const lastUsed = localStorage.getItem('last-usage-date');
      const today = new Date().toDateString();
      
      if (lastUsed === today) {
        setStreak(localStreak);
      } else if (lastUsed === new Date(Date.now() - 86400000).toDateString()) {
        // Yesterday - increment streak
        const newStreak = localStreak + 1;
        setStreak(newStreak);
        localStorage.setItem('usage-streak', newStreak.toString());
      } else {
        // Streak broken
        setStreak(1);
        localStorage.setItem('usage-streak', '1');
      }
      
      localStorage.setItem('last-usage-date', today);

      // Load today's XP
      const localXP = parseInt(localStorage.getItem('today-xp') || '0');
      setTodayXP(localXP);
      
      // Calculate level (every 100 XP = 1 level)
      setLevel(Math.floor(localXP / 100) + 1);
    } catch (error) {
      console.error('Error loading streak:', error);
    }
  };

  const addXP = (amount: number) => {
    const newXP = todayXP + amount;
    setTodayXP(newXP);
    localStorage.setItem('today-xp', newXP.toString());
    setLevel(Math.floor(newXP / 100) + 1);
  };

  // Expose addXP globally for other components to use
  useEffect(() => {
    (window as any).addLucyXP = addXP;
    return () => {
      delete (window as any).addLucyXP;
    };
  }, [todayXP]);

  return (
    <HolographicCard className="p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-12 h-12 rounded-full bg-gradient-button flex items-center justify-center">
              <Flame className="w-6 h-6 text-white" />
            </div>
            {streak > 7 && (
              <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-accent flex items-center justify-center">
                <Trophy className="w-3 h-3 text-white" />
              </div>
            )}
          </div>
          <div>
            <div className="text-sm text-white/70">Daily Streak</div>
            <div className="text-2xl font-bold text-white flex items-center gap-1">
              {streak} <span className="text-sm text-white/70">days</span>
            </div>
          </div>
        </div>

        <div className="text-right">
          <div className="text-sm text-white/70 flex items-center gap-1 justify-end">
            <Zap className="w-4 h-4 text-accent" />
            Level {level}
          </div>
          <div className="text-lg font-semibold text-white">{todayXP} XP</div>
          <div className="w-24 h-1.5 bg-white/10 rounded-full mt-1 overflow-hidden">
            <div 
              className="h-full bg-gradient-button transition-all duration-500"
              style={{ width: `${(todayXP % 100)}%` }}
            />
          </div>
        </div>
      </div>
    </HolographicCard>
  );
};
