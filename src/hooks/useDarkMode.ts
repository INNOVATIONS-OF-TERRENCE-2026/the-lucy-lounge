import { useEffect, useState } from 'react';

export const useDarkMode = () => {
  const [isDark, setIsDark] = useState(true); // Default to dark mode

  useEffect(() => {
    // Check for stored preference
    const stored = localStorage.getItem('lucy-theme');
    
    if (stored) {
      const prefersDark = stored === 'dark';
      setIsDark(prefersDark);
      applyTheme(prefersDark);
    } else {
      // Force dark mode on first visit
      setIsDark(true);
      localStorage.setItem('lucy-theme', 'dark');
      applyTheme(true);
    }
  }, []);

  const applyTheme = (dark: boolean) => {
    if (dark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const toggleDarkMode = () => {
    const newMode = !isDark;
    setIsDark(newMode);
    localStorage.setItem('lucy-theme', newMode ? 'dark' : 'light');
    applyTheme(newMode);
  };

  return { isDark, toggleDarkMode };
};
