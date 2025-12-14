import { useState, useEffect, useCallback } from 'react';

export type WeatherMode = 
  | 'clear'
  | 'rain'
  | 'snow'
  | 'sunshine'
  | 'cloudy'
  | 'bloomy'
  | 'blizzard'
  | 'hurricane'
  | 'tornado';

export type SeasonMode = 'spring' | 'summer' | 'fall' | 'winter' | 'none';

interface WeatherAmbientState {
  weather: WeatherMode;
  season: SeasonMode;
  intensity: number; // 0-1
  enabled: boolean;
}

const STORAGE_KEY = 'lucy-weather-ambient';

const defaultState: WeatherAmbientState = {
  weather: 'clear',
  season: 'none',
  intensity: 0.7,
  enabled: true,
};

export const useWeatherAmbient = () => {
  const [state, setState] = useState<WeatherAmbientState>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return { ...defaultState, ...JSON.parse(stored) };
      }
    } catch (e) {
      console.warn('Failed to load weather ambient state');
    }
    return defaultState;
  });

  // Persist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.warn('Failed to save weather ambient state');
    }
  }, [state]);

  const setWeather = useCallback((weather: WeatherMode) => {
    setState(prev => ({ ...prev, weather }));
  }, []);

  const setSeason = useCallback((season: SeasonMode) => {
    setState(prev => ({ ...prev, season }));
  }, []);

  const setIntensity = useCallback((intensity: number) => {
    setState(prev => ({ ...prev, intensity: Math.max(0, Math.min(1, intensity)) }));
  }, []);

  const setEnabled = useCallback((enabled: boolean) => {
    setState(prev => ({ ...prev, enabled }));
  }, []);

  const reset = useCallback(() => {
    setState(defaultState);
  }, []);

  return {
    ...state,
    setWeather,
    setSeason,
    setIntensity,
    setEnabled,
    reset,
  };
};
