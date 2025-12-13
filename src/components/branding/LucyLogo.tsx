/**
 * 🔒 BRAND LOCK: LUCY LOGO COMPONENT
 * 
 * This component renders the official Lucy AI logo.
 * DO NOT modify unless explicitly requested by user.
 * The logo must always remain visible in the chat header.
 */

import lucyLogo from "@/assets/lucy-logo.png";
import { cn } from "@/lib/utils";

interface LucyLogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  showGlow?: boolean;
}

const sizeClasses = {
  sm: "w-8 h-8",
  md: "w-12 h-12",
  lg: "w-20 h-20",
  xl: "w-32 h-32",
};

export const LucyLogo = ({ size = "md", className, showGlow = true }: LucyLogoProps) => {
  return (
    <div
      className={cn(
        "rounded-full overflow-hidden flex items-center justify-center lucy-logo-protected",
        sizeClasses[size],
        showGlow && "shadow-glow-violet animate-neural-pulse",
        className
      )}
    >
      <img 
        src={lucyLogo} 
        alt="Lucy AI" 
        className="w-full h-full object-cover"
      />
    </div>
  );
};
