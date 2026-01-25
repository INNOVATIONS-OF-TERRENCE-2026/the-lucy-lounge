import * as React from "react";

const MOBILE_BREAKPOINT = 768;

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined);

  React.useEffect(() => {
    // Guard: Ensure we're in browser and matchMedia is available
    if (typeof window === 'undefined') return;
    
    try {
      const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
      const onChange = () => {
        setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
      };
      mql.addEventListener("change", onChange);
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
      return () => mql.removeEventListener("change", onChange);
    } catch {
      // matchMedia not supported - fallback to window check
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    }
  }, []);

  return !!isMobile;
}
