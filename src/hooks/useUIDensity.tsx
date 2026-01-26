/**
 * ┌─────────────────────────────────────────────────────────────────────────────┐
 * │ THE LUCY LOUNGE — UI DENSITY SYSTEM                                        │
 * │                                                                             │
 * │ Global density presets: Comfort / Standard / Compact                       │
 * │ Auto-detects device class and applies appropriate defaults                 │
 * │ User-controllable UI scale multiplier                                      │
 * └─────────────────────────────────────────────────────────────────────────────┘
 */

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export type DensityPreset = 'comfort' | 'standard' | 'compact';
export type DeviceClass = 'phone' | 'tablet' | 'desktop';

interface DensityConfig {
  // Base multipliers
  spacingMultiplier: number;
  fontSizeMultiplier: number;
  lineHeightMultiplier: number;
  
  // Specific values
  baseFontSize: number;        // px
  baseSpacing: number;         // px (maps to 1rem of spacing)
  containerPadding: number;    // px
  sidebarWidth: string;        // CSS value
  drawerWidth: string;         // CSS value
}

interface UIDensityContextValue {
  // Current state
  density: DensityPreset;
  deviceClass: DeviceClass;
  scale: number; // User scale multiplier (0.85 - 1.15)
  
  // Computed config
  config: DensityConfig;
  
  // Actions
  setDensity: (preset: DensityPreset) => void;
  setScale: (scale: number) => void;
  resetToDefaults: () => void;
}

// ═══════════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════════

const STORAGE_KEY = 'lucy-ui-density';
const SCALE_STORAGE_KEY = 'lucy-ui-scale';

// Breakpoints for device detection
const BREAKPOINTS = {
  phone: 640,   // < 640px = phone
  tablet: 1024, // 640-1024px = tablet
  // > 1024px = desktop
};

// Density preset configurations
// ENHANCED: More generous multipliers for cinematic mobile experience
const DENSITY_CONFIGS: Record<DensityPreset, Omit<DensityConfig, 'sidebarWidth' | 'drawerWidth'>> = {
  comfort: {
    spacingMultiplier: 1.2,        // ↑ from 1.15 - more spacious
    fontSizeMultiplier: 1.12,      // ↑ from 1.1 - slightly larger text
    lineHeightMultiplier: 1.15,    // ↑ from 1.1 - more readable line spacing
    baseFontSize: 17,              // Maintained - good mobile base
    baseSpacing: 20,               // ↑ from 18 - more breathing room
    containerPadding: 26,          // ↑ from 24 - generous padding
  },
  standard: {
    spacingMultiplier: 1.0,
    fontSizeMultiplier: 1.0,
    lineHeightMultiplier: 1.0,
    baseFontSize: 16,
    baseSpacing: 16,
    containerPadding: 20,
  },
  compact: {
    spacingMultiplier: 0.9,        // ↑ from 0.85 - not too cramped
    fontSizeMultiplier: 0.95,
    lineHeightMultiplier: 0.95,
    baseFontSize: 15,
    baseSpacing: 14,
    containerPadding: 18,          // ↑ from 16 - maintain some padding
  },
};

// Device-specific sidebar/drawer widths
// ENHANCED: Cinematic full-width mobile panels
const DEVICE_DIMENSIONS: Record<DeviceClass, { sidebarWidth: string; drawerWidth: string }> = {
  phone: {
    sidebarWidth: '92vw',          // ↓ from 100vw - leaves visual edge hint
    drawerWidth: '94vw',           // ↑ from 92vw - nearly full width
  },
  tablet: {
    sidebarWidth: '380px',         // ↑ from 320px - more content space
    drawerWidth: '88vw',           // ↑ from 85vw - generous drawer
  },
  desktop: {
    sidebarWidth: '280px',
    drawerWidth: '420px',
  },
};

// Default density per device class
const DEFAULT_DENSITY: Record<DeviceClass, DensityPreset> = {
  phone: 'comfort',
  tablet: 'standard',
  desktop: 'standard',
};

// ═══════════════════════════════════════════════════════════════════════════════
// DEVICE DETECTION
// ═══════════════════════════════════════════════════════════════════════════════

function detectDeviceClass(): DeviceClass {
  if (typeof window === 'undefined') return 'desktop';
  
  const width = window.innerWidth;
  
  if (width < BREAKPOINTS.phone) return 'phone';
  if (width < BREAKPOINTS.tablet) return 'tablet';
  return 'desktop';
}

// ═══════════════════════════════════════════════════════════════════════════════
// CSS VARIABLE APPLICATION
// ═══════════════════════════════════════════════════════════════════════════════

function applyDensityToDOM(config: DensityConfig, scale: number) {
  const root = document.documentElement;
  
  // Apply scaled values
  const scaledFontSize = config.baseFontSize * scale;
  const scaledSpacing = config.baseSpacing * scale;
  const scaledPadding = config.containerPadding * scale;
  
  // Set CSS custom properties
  root.style.setProperty('--ui-density-font-size', `${scaledFontSize}px`);
  root.style.setProperty('--ui-density-spacing', `${scaledSpacing}px`);
  root.style.setProperty('--ui-density-padding', `${scaledPadding}px`);
  root.style.setProperty('--ui-density-spacing-multiplier', String(config.spacingMultiplier * scale));
  root.style.setProperty('--ui-density-font-multiplier', String(config.fontSizeMultiplier * scale));
  root.style.setProperty('--ui-density-line-height-multiplier', String(config.lineHeightMultiplier * scale));
  root.style.setProperty('--ui-density-sidebar-width', config.sidebarWidth);
  root.style.setProperty('--ui-density-drawer-width', config.drawerWidth);
  
  // Set base font size on html element for rem scaling
  root.style.fontSize = `${scaledFontSize}px`;
  
  // Add data attribute for CSS selectors
  root.dataset.uiDensity = config.spacingMultiplier > 1 ? 'comfort' : 
                           config.spacingMultiplier < 1 ? 'compact' : 'standard';
}

// ═══════════════════════════════════════════════════════════════════════════════
// CONTEXT
// ═══════════════════════════════════════════════════════════════════════════════

const UIDensityContext = createContext<UIDensityContextValue | null>(null);

export function UIDensityProvider({ children }: { children: React.ReactNode }) {
  const [deviceClass, setDeviceClass] = useState<DeviceClass>('desktop');
  const [density, setDensityState] = useState<DensityPreset>('standard');
  const [scale, setScaleState] = useState(1.0);
  const [initialized, setInitialized] = useState(false);

  // Compute full config from density + device class
  const config = useMemo((): DensityConfig => {
    const baseConfig = DENSITY_CONFIGS[density];
    const dimensions = DEVICE_DIMENSIONS[deviceClass];
    
    return {
      ...baseConfig,
      ...dimensions,
    };
  }, [density, deviceClass]);

  // Initialize from storage and detect device
  useEffect(() => {
    const detected = detectDeviceClass();
    setDeviceClass(detected);
    
    // Load saved preferences
    try {
      const savedDensity = localStorage.getItem(STORAGE_KEY) as DensityPreset | null;
      const savedScale = localStorage.getItem(SCALE_STORAGE_KEY);
      
      if (savedDensity && DENSITY_CONFIGS[savedDensity]) {
        setDensityState(savedDensity);
      } else {
        // Use device default
        setDensityState(DEFAULT_DENSITY[detected]);
      }
      
      if (savedScale) {
        const parsed = parseFloat(savedScale);
        if (parsed >= 0.85 && parsed <= 1.15) {
          setScaleState(parsed);
        }
      }
    } catch {
      // Storage not available
      setDensityState(DEFAULT_DENSITY[detected]);
    }
    
    setInitialized(true);
  }, []);

  // Handle window resize for device class changes
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    let resizeTimeout: ReturnType<typeof setTimeout>;
    
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        const newDeviceClass = detectDeviceClass();
        if (newDeviceClass !== deviceClass) {
          setDeviceClass(newDeviceClass);
        }
      }, 150);
    };
    
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);
    
    return () => {
      clearTimeout(resizeTimeout);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, [deviceClass]);

  // Apply to DOM when config or scale changes
  useEffect(() => {
    if (!initialized) return;
    applyDensityToDOM(config, scale);
  }, [config, scale, initialized]);

  // Actions
  const setDensity = useCallback((preset: DensityPreset) => {
    setDensityState(preset);
    try {
      localStorage.setItem(STORAGE_KEY, preset);
    } catch {
      // Storage not available
    }
  }, []);

  const setScale = useCallback((newScale: number) => {
    const clamped = Math.max(0.85, Math.min(1.15, newScale));
    setScaleState(clamped);
    try {
      localStorage.setItem(SCALE_STORAGE_KEY, String(clamped));
    } catch {
      // Storage not available
    }
  }, []);

  const resetToDefaults = useCallback(() => {
    const defaultDensity = DEFAULT_DENSITY[deviceClass];
    setDensityState(defaultDensity);
    setScaleState(1.0);
    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(SCALE_STORAGE_KEY);
    } catch {
      // Storage not available
    }
  }, [deviceClass]);

  const value = useMemo((): UIDensityContextValue => ({
    density,
    deviceClass,
    scale,
    config,
    setDensity,
    setScale,
    resetToDefaults,
  }), [density, deviceClass, scale, config, setDensity, setScale, resetToDefaults]);

  return (
    <UIDensityContext.Provider value={value}>
      {children}
    </UIDensityContext.Provider>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// HOOK
// ═══════════════════════════════════════════════════════════════════════════════

export function useUIDensity() {
  const context = useContext(UIDensityContext);
  
  if (!context) {
    // Return safe defaults if used outside provider
    return {
      density: 'standard' as DensityPreset,
      deviceClass: 'desktop' as DeviceClass,
      scale: 1.0,
      config: {
        ...DENSITY_CONFIGS.standard,
        ...DEVICE_DIMENSIONS.desktop,
      },
      setDensity: () => {},
      setScale: () => {},
      resetToDefaults: () => {},
    };
  }
  
  return context;
}

// ═══════════════════════════════════════════════════════════════════════════════
// UTILITY HOOKS
// ═══════════════════════════════════════════════════════════════════════════════

export function useDeviceClass() {
  const { deviceClass } = useUIDensity();
  return deviceClass;
}

export function useIsPhone() {
  const { deviceClass } = useUIDensity();
  return deviceClass === 'phone';
}

export function useIsTablet() {
  const { deviceClass } = useUIDensity();
  return deviceClass === 'tablet';
}

export function useIsDesktop() {
  const { deviceClass } = useUIDensity();
  return deviceClass === 'desktop';
}

export function useIsMobileDevice() {
  const { deviceClass } = useUIDensity();
  return deviceClass === 'phone' || deviceClass === 'tablet';
}

export default useUIDensity;
