/**
 * ┌─────────────────────────────────────────────────────────────────────────────┐
 * │ THE LUCY LOUNGE — BRANDING CONTEXT                                         │
 * │                                                                             │
 * │ Runtime branding system for white-label support                            │
 * │ Loads org branding from Supabase, applies to UI                            │
 * │                                                                             │
 * │ Lucy adapts to any brand, but her intelligence remains.                    │
 * └─────────────────────────────────────────────────────────────────────────────┘
 */

import { createContext, useContext, useState, useEffect, useCallback, ReactNode, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';

// =============================================================================
// TYPES
// =============================================================================

export interface OrganizationBranding {
  // Identity
  brandName: string;
  brandTagline: string;
  brandDescription: string;
  
  // Visual
  logoUrl: string;
  logoDarkUrl: string;
  faviconUrl: string;
  ogImageUrl: string;
  
  // Colors
  colorPrimary: string;
  colorSecondary: string;
  colorAccent: string;
  colorBackground: string;
  colorText: string;
  
  // Theme
  glassIntensity: number;
  gradientIntensity: number;
  borderRadius: 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
  
  // Typography
  fontHeading: string;
  fontBody: string;
  
  // Custom CSS
  customCss: string;
  
  // SEO
  seoTitleSuffix: string;
  seoDefaultDescription: string;
  
  // Social
  twitterHandle: string;
  supportEmail: string;
  supportUrl: string;
  privacyUrl: string;
  termsUrl: string;
}

export interface OrganizationSettings {
  featuresEnabled: Record<string, boolean>;
  toolAccess: Record<string, boolean>;
  modelAccess: Record<string, boolean>;
  maxMembers: number;
  maxStorageGb: number;
  maxAiCallsPerDay: number;
  defaultTheme: string;
  defaultDensity: 'compact' | 'comfortable' | 'spacious';
  timezone: string;
  locale: string;
  allowPublicProfiles: boolean;
  allowPublicRooms: boolean;
  require2fa: boolean;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  type: 'personal' | 'team' | 'enterprise' | 'platform';
  status: 'active' | 'suspended' | 'pending' | 'archived';
  isPlatformOrg: boolean;
  isVerified: boolean;
}

export interface BrandingContextValue {
  // State
  organization: Organization | null;
  branding: OrganizationBranding;
  settings: OrganizationSettings;
  loading: boolean;
  error: string | null;
  
  // Derived
  isWhiteLabeled: boolean;
  isPlatformOrg: boolean;
  
  // Actions
  refreshBranding: () => Promise<void>;
  
  // Helpers
  getLogoUrl: (preferDark?: boolean) => string;
  getAppName: () => string;
  getPageTitle: (pageTitle: string) => string;
}

// =============================================================================
// DEFAULT BRANDING (Lucy HQ)
// =============================================================================

export const DEFAULT_BRANDING: OrganizationBranding = {
  brandName: 'The Lucy Lounge',
  brandTagline: 'Beyond Intelligence',
  brandDescription: 'AI-native, multimodal intelligence OS',
  
  logoUrl: '/lucy-logo.png',
  logoDarkUrl: '/lucy-logo.png',
  faviconUrl: '/favicon.ico',
  ogImageUrl: '/og-image.png',
  
  colorPrimary: '#7B3FF2',
  colorSecondary: '#4F46E5',
  colorAccent: '#F59E0B',
  colorBackground: '#1a0f2e',
  colorText: '#FFFFFF',
  
  glassIntensity: 0.15,
  gradientIntensity: 0.5,
  borderRadius: 'lg',
  
  fontHeading: 'Montserrat',
  fontBody: 'Inter',
  
  customCss: '',
  
  seoTitleSuffix: ' | The Lucy Lounge',
  seoDefaultDescription: 'Lucy AI - Your intelligent AI companion for media, creativity, and productivity.',
  
  twitterHandle: '@LucyAI',
  supportEmail: 'support@thelucylounge.com',
  supportUrl: 'https://thelucylounge.com/support',
  privacyUrl: 'https://thelucylounge.com/privacy',
  termsUrl: 'https://thelucylounge.com/terms',
};

export const DEFAULT_SETTINGS: OrganizationSettings = {
  featuresEnabled: {
    chat: true,
    tools: true,
    media: true,
    rooms: true,
    arcade: true,
    studios: true,
    ai_generation: true,
  },
  toolAccess: {},
  modelAccess: {},
  maxMembers: 5,
  maxStorageGb: 10,
  maxAiCallsPerDay: 1000,
  defaultTheme: 'purple',
  defaultDensity: 'comfortable',
  timezone: 'UTC',
  locale: 'en-US',
  allowPublicProfiles: true,
  allowPublicRooms: true,
  require2fa: false,
};

// =============================================================================
// CONTEXT
// =============================================================================

const BrandingContext = createContext<BrandingContextValue | null>(null);

// =============================================================================
// PROVIDER
// =============================================================================

interface BrandingProviderProps {
  children: ReactNode;
}

export function BrandingProvider({ children }: BrandingProviderProps) {
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [branding, setBranding] = useState<OrganizationBranding>(DEFAULT_BRANDING);
  const [settings, setSettings] = useState<OrganizationSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Resolve organization by current domain
  const resolveOrganization = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const hostname = window.location.hostname;
      
      // Skip resolution for localhost/development
      if (hostname === 'localhost' || hostname === '127.0.0.1') {
        console.log('[Branding] Development mode, using defaults');
        setLoading(false);
        return;
      }

      // Try to resolve by domain
      const { data, error: resolveError } = await supabase
        .rpc('resolve_org_by_domain', { p_domain: hostname });

      if (resolveError) {
        console.error('[Branding] Domain resolution error:', resolveError);
        // Fall back to defaults (Lucy HQ)
        setLoading(false);
        return;
      }

      if (data && data.length > 0) {
        const orgData = data[0];
        
        // Set organization
        setOrganization({
          id: orgData.org_id,
          name: orgData.org_name,
          slug: orgData.org_slug,
          type: 'team', // Will be fetched properly
          status: 'active',
          isPlatformOrg: false,
          isVerified: true,
        });

        // Set branding from database
        if (orgData.branding) {
          const b = orgData.branding;
          setBranding({
            brandName: b.brand_name || DEFAULT_BRANDING.brandName,
            brandTagline: b.brand_tagline || DEFAULT_BRANDING.brandTagline,
            brandDescription: b.brand_description || DEFAULT_BRANDING.brandDescription,
            logoUrl: b.logo_url || DEFAULT_BRANDING.logoUrl,
            logoDarkUrl: b.logo_dark_url || DEFAULT_BRANDING.logoDarkUrl,
            faviconUrl: b.favicon_url || DEFAULT_BRANDING.faviconUrl,
            ogImageUrl: b.og_image_url || DEFAULT_BRANDING.ogImageUrl,
            colorPrimary: b.color_primary || DEFAULT_BRANDING.colorPrimary,
            colorSecondary: b.color_secondary || DEFAULT_BRANDING.colorSecondary,
            colorAccent: b.color_accent || DEFAULT_BRANDING.colorAccent,
            colorBackground: b.color_background || DEFAULT_BRANDING.colorBackground,
            colorText: b.color_text || DEFAULT_BRANDING.colorText,
            glassIntensity: b.glass_intensity ?? DEFAULT_BRANDING.glassIntensity,
            gradientIntensity: b.gradient_intensity ?? DEFAULT_BRANDING.gradientIntensity,
            borderRadius: b.border_radius || DEFAULT_BRANDING.borderRadius,
            fontHeading: b.font_heading || DEFAULT_BRANDING.fontHeading,
            fontBody: b.font_body || DEFAULT_BRANDING.fontBody,
            customCss: b.custom_css || '',
            seoTitleSuffix: b.seo_title_suffix || ` | ${b.brand_name || DEFAULT_BRANDING.brandName}`,
            seoDefaultDescription: b.seo_default_description || DEFAULT_BRANDING.seoDefaultDescription,
            twitterHandle: b.twitter_handle || DEFAULT_BRANDING.twitterHandle,
            supportEmail: b.support_email || DEFAULT_BRANDING.supportEmail,
            supportUrl: b.support_url || DEFAULT_BRANDING.supportUrl,
            privacyUrl: b.privacy_url || DEFAULT_BRANDING.privacyUrl,
            termsUrl: b.terms_url || DEFAULT_BRANDING.termsUrl,
          });
        }

        // Set settings from database
        if (orgData.settings) {
          const s = orgData.settings;
          setSettings({
            featuresEnabled: s.features_enabled || DEFAULT_SETTINGS.featuresEnabled,
            toolAccess: s.tool_access || DEFAULT_SETTINGS.toolAccess,
            modelAccess: s.model_access || DEFAULT_SETTINGS.modelAccess,
            maxMembers: s.max_members ?? DEFAULT_SETTINGS.maxMembers,
            maxStorageGb: s.max_storage_gb ?? DEFAULT_SETTINGS.maxStorageGb,
            maxAiCallsPerDay: s.max_ai_calls_per_day ?? DEFAULT_SETTINGS.maxAiCallsPerDay,
            defaultTheme: s.default_theme || DEFAULT_SETTINGS.defaultTheme,
            defaultDensity: s.default_density || DEFAULT_SETTINGS.defaultDensity,
            timezone: s.timezone || DEFAULT_SETTINGS.timezone,
            locale: s.locale || DEFAULT_SETTINGS.locale,
            allowPublicProfiles: s.allow_public_profiles ?? DEFAULT_SETTINGS.allowPublicProfiles,
            allowPublicRooms: s.allow_public_rooms ?? DEFAULT_SETTINGS.allowPublicRooms,
            require2fa: s.require_2fa ?? DEFAULT_SETTINGS.require2fa,
          });
        }

        console.log('[Branding] Loaded org branding:', orgData.org_name);
      } else {
        console.log('[Branding] No custom domain found, using defaults');
      }
    } catch (err) {
      console.error('[Branding] Error:', err);
      setError(err instanceof Error ? err.message : 'Failed to load branding');
    } finally {
      setLoading(false);
    }
  }, []);

  // Apply branding to DOM
  useEffect(() => {
    if (loading) return;

    // Apply CSS variables
    const root = document.documentElement;
    root.style.setProperty('--brand-primary', branding.colorPrimary);
    root.style.setProperty('--brand-secondary', branding.colorSecondary);
    root.style.setProperty('--brand-accent', branding.colorAccent);
    root.style.setProperty('--brand-background', branding.colorBackground);
    root.style.setProperty('--brand-text', branding.colorText);
    root.style.setProperty('--brand-glass-intensity', branding.glassIntensity.toString());
    root.style.setProperty('--brand-gradient-intensity', branding.gradientIntensity.toString());

    // Update favicon
    const favicon = document.querySelector('link[rel="icon"]') as HTMLLinkElement;
    if (favicon && branding.faviconUrl) {
      favicon.href = branding.faviconUrl;
    }

    // Update theme-color meta
    const themeColor = document.querySelector('meta[name="theme-color"]') as HTMLMetaElement;
    if (themeColor) {
      themeColor.content = branding.colorPrimary;
    }

    // Inject custom CSS
    let customStyleEl = document.getElementById('org-custom-css');
    if (branding.customCss) {
      if (!customStyleEl) {
        customStyleEl = document.createElement('style');
        customStyleEl.id = 'org-custom-css';
        document.head.appendChild(customStyleEl);
      }
      customStyleEl.textContent = branding.customCss;
    } else if (customStyleEl) {
      customStyleEl.remove();
    }

    console.log('[Branding] Applied branding to DOM');
  }, [branding, loading]);

  // Initial load
  useEffect(() => {
    resolveOrganization();
  }, [resolveOrganization]);

  // Derived values
  const isWhiteLabeled = organization !== null && !organization.isPlatformOrg;
  const isPlatformOrg = organization?.isPlatformOrg ?? true;

  // Helper functions
  const getLogoUrl = useCallback((preferDark = false): string => {
    if (preferDark && branding.logoDarkUrl) {
      return branding.logoDarkUrl;
    }
    return branding.logoUrl;
  }, [branding.logoUrl, branding.logoDarkUrl]);

  const getAppName = useCallback((): string => {
    return branding.brandName;
  }, [branding.brandName]);

  const getPageTitle = useCallback((pageTitle: string): string => {
    return `${pageTitle}${branding.seoTitleSuffix}`;
  }, [branding.seoTitleSuffix]);

  const refreshBranding = useCallback(async () => {
    await resolveOrganization();
  }, [resolveOrganization]);

  const value: BrandingContextValue = useMemo(() => ({
    organization,
    branding,
    settings,
    loading,
    error,
    isWhiteLabeled,
    isPlatformOrg,
    refreshBranding,
    getLogoUrl,
    getAppName,
    getPageTitle,
  }), [
    organization,
    branding,
    settings,
    loading,
    error,
    isWhiteLabeled,
    isPlatformOrg,
    refreshBranding,
    getLogoUrl,
    getAppName,
    getPageTitle,
  ]);

  return (
    <BrandingContext.Provider value={value}>
      {children}
    </BrandingContext.Provider>
  );
}

// =============================================================================
// HOOK
// =============================================================================

export function useBranding(): BrandingContextValue {
  const context = useContext(BrandingContext);
  if (!context) {
    throw new Error('useBranding must be used within a BrandingProvider');
  }
  return context;
}

// =============================================================================
// UTILITY HOOKS
// =============================================================================

/**
 * Hook to check if a feature is enabled for the current org
 */
export function useFeatureEnabled(featureKey: string): boolean {
  const { settings } = useBranding();
  return settings.featuresEnabled[featureKey] ?? true;
}

/**
 * Hook to check if a tool is accessible for the current org
 */
export function useToolEnabled(toolId: string): boolean {
  const { settings } = useBranding();
  // If explicitly set, use that value; otherwise default to true
  if (toolId in settings.toolAccess) {
    return settings.toolAccess[toolId];
  }
  return true;
}

/**
 * Hook to get branding colors as CSS variables
 */
export function useBrandColors() {
  const { branding } = useBranding();
  return {
    primary: branding.colorPrimary,
    secondary: branding.colorSecondary,
    accent: branding.colorAccent,
    background: branding.colorBackground,
    text: branding.colorText,
  };
}

export default BrandingProvider;
