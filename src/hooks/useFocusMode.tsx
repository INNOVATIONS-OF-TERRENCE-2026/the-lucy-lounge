import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

interface FocusModeContextType {
  focusMode: boolean;
  setFocusMode: (enabled: boolean) => void;
  toggleFocusMode: () => void;
}

const STORAGE_KEY = 'lucy-focus-mode';

const FocusModeContext = createContext<FocusModeContextType | null>(null);

export const FocusModeProvider = ({ children }: { children: ReactNode }) => {
  const [focusMode, setFocusModeState] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored === 'true';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, String(focusMode));
    } catch {
      // Ignore storage errors
    }
  }, [focusMode]);

  const setFocusMode = useCallback((enabled: boolean) => {
    setFocusModeState(enabled);
  }, []);

  const toggleFocusMode = useCallback(() => {
    setFocusModeState(prev => !prev);
  }, []);

  return (
    <FocusModeContext.Provider value={{ focusMode, setFocusMode, toggleFocusMode }}>
      {children}
    </FocusModeContext.Provider>
  );
};

export const useFocusMode = (): FocusModeContextType => {
  const context = useContext(FocusModeContext);
  if (!context) {
    // Fallback for components outside provider
    let stored = false;
    try {
      stored = localStorage.getItem(STORAGE_KEY) === 'true';
    } catch {
      // Ignore
    }
    return {
      focusMode: stored,
      setFocusMode: () => {},
      toggleFocusMode: () => {},
    };
  }
  return context;
};
