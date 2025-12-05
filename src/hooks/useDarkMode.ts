import { useEffect, useState } from 'react';

const DARK_MODE_KEY = 'lucy-dark-mode';

export const useDarkMode = () => {
  const [isDark, setIsDark] = useState(true); // Default to dark mode

  useEffect(() => {
    // Check for stored preference
    const stored = localStorage.getItem(DARK_MODE_KEY);
    
    if (stored === 'light') {
      setIsDark(false);
      applyTheme(false);
    } else {
      // Force dark mode on first visit or if explicitly set to dark
      setIsDark(true);
      localStorage.setItem(DARK_MODE_KEY, 'dark');
      applyTheme(true);
    }
  }, []);

  const applyTheme = (dark: boolean) => {
    if (dark) {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    }
  };

  const toggleDarkMode = () => {
    const newMode = !isDark;
    setIsDark(newMode);
    localStorage.setItem(DARK_MODE_KEY, newMode ? 'dark' : 'light');
    applyTheme(newMode);
  };

  return { isDark, toggleDarkMode };
};
