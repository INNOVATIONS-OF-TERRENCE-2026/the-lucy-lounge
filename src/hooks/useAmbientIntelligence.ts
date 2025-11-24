import { useState, useEffect } from 'react';

export type TimeOfDay = 'morning' | 'afternoon' | 'evening' | 'night';
export type ThemeMode = 'cosmic' | 'neon' | 'nature' | 'noir' | 'rain';

export const useAmbientIntelligence = () => {
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>('morning');
  const [isIdle, setIsIdle] = useState(false);
  const [lastActivity, setLastActivity] = useState(Date.now());
  const [themeMode, setThemeMode] = useState<ThemeMode>('cosmic');

  // Detect time of day
  useEffect(() => {
    const updateTimeOfDay = () => {
      const hour = new Date().getHours();
      if (hour >= 5 && hour < 12) setTimeOfDay('morning');
      else if (hour >= 12 && hour < 17) setTimeOfDay('afternoon');
      else if (hour >= 17 && hour < 21) setTimeOfDay('evening');
      else setTimeOfDay('night');
    };

    updateTimeOfDay();
    const interval = setInterval(updateTimeOfDay, 60000); // Check every minute

    return () => clearInterval(interval);
  }, []);

  // Track user activity
  useEffect(() => {
    const resetActivity = () => {
      setLastActivity(Date.now());
      setIsIdle(false);
    };

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    events.forEach(event => window.addEventListener(event, resetActivity));

    // Check for idle state every 5 seconds
    const idleCheck = setInterval(() => {
      const idleTime = Date.now() - lastActivity;
      setIsIdle(idleTime > 30000); // 30 seconds = idle
    }, 5000);

    return () => {
      events.forEach(event => window.removeEventListener(event, resetActivity));
      clearInterval(idleCheck);
    };
  }, [lastActivity]);

  // Get greeting based on time of day
  const getGreeting = () => {
    const greetings = {
      morning: ['Good morning! ☀️', 'Rise and shine! 🌅', 'Morning, sunshine! ✨'],
      afternoon: ['Good afternoon! 🌤️', 'Hope your day is going well! 💫', 'Afternoon! Let\'s make magic ✨'],
      evening: ['Good evening! 🌆', 'Evening! Ready to wind down? 🌙', 'Perfect time to chat! 🌃'],
      night: ['Good night! 🌙', 'Burning the midnight oil? 🌌', 'Late night session? ⭐']
    };
    
    const options = greetings[timeOfDay];
    return options[Math.floor(Math.random() * options.length)];
  };

  // Get theme colors for time of day
  const getThemeColors = () => {
    const themes = {
      morning: { primary: 'hsl(45, 90%, 60%)', secondary: 'hsl(200, 80%, 70%)' },
      afternoon: { primary: 'hsl(200, 90%, 55%)', secondary: 'hsl(265, 70%, 58%)' },
      evening: { primary: 'hsl(265, 80%, 65%)', secondary: 'hsl(340, 85%, 60%)' },
      night: { primary: 'hsl(265, 90%, 40%)', secondary: 'hsl(200, 80%, 50%)' }
    };
    
    return themes[timeOfDay];
  };

  return {
    timeOfDay,
    isIdle,
    themeMode,
    setThemeMode,
    getGreeting,
    getThemeColors
  };
};
