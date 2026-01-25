import { useEffect, useState } from 'react';

/**
 * iOS-SAFE storage helper - never throws
 */
function safeGetItem(key: string): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeSetItem(key: string, value: string): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Storage unavailable - silent fail
  }
}

export const useDarkMode = () => {
  const [isDark, setIsDark] = useState(true); // Default to dark mode

  useEffect(() => {
    // Check for stored preference (iOS-safe)
    const stored = safeGetItem('lucy-theme');
    
    if (stored) {
      const prefersDark = stored === 'dark';
      setIsDark(prefersDark);
      applyTheme(prefersDark);
    } else {
      // Force dark mode on first visit
      setIsDark(true);
      safeSetItem('lucy-theme', 'dark');
      applyTheme(true);
    }
  }, []);

  const applyTheme = (dark: boolean) => {
    if (typeof document === 'undefined') return;
    if (dark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const toggleDarkMode = () => {
    const newMode = !isDark;
    setIsDark(newMode);
    safeSetItem('lucy-theme', newMode ? 'dark' : 'light');
    applyTheme(newMode);
  };

  return { isDark, toggleDarkMode };
};
