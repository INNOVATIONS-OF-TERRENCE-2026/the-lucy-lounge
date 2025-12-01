import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import lucyLogo from "@/assets/lucy-logo.png";

export type AvatarState = string;

interface LucyAvatarProps {
  state?: AvatarState;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

export const LucyAvatar = ({ state = "idle", size = "md", className }: LucyAvatarProps) => {
  const [blink, setBlink] = useState(false);

  // Blinking animation
  useEffect(() => {
    const blinkInterval = setInterval(
      () => {
        setBlink(true);
        setTimeout(() => setBlink(false), 150);
      },
      3000 + Math.random() * 2000,
    );

    return () => clearInterval(blinkInterval);
  }, []);

  const sizeClasses = {
    sm: "w-12 h-12",
    md: "w-20 h-20",
    lg: "w-32 h-32",
    xl: "w-48 h-48",
  };

  const haloSizes = {
    sm: "w-16 h-16",
    md: "w-28 h-28",
    lg: "w-40 h-40",
    xl: "w-60 h-60",
  };

  const getAvatarStyles = () => {
    const baseStyles = "rounded-full transition-all duration-300 relative z-10";

    switch (state) {
      case "thinking":
        return `${baseStyles} shadow-glow-violet animate-divine-breathe`;
      case "responding":
        return `${baseStyles} shadow-glow-magenta animate-halo-glow`;
      case "happy":
        return `${baseStyles} shadow-glow-gold scale-105`;
      case "focused":
        return `${baseStyles} shadow-glow-divine`;
      default:
        return `${baseStyles} shadow-glow-violet`;
    }
  };

  return (
    <div className={cn("relative flex items-center justify-center", className)}>
      {/* Divine Halo Background */}
      <div
        className={cn("absolute rounded-full animate-halo-glow", haloSizes[size])}
        style={{
          background:
            "radial-gradient(circle, hsl(277 100% 30% / 0.4) 0%, hsl(320 100% 50% / 0.2) 50%, transparent 70%)",
          filter: "blur(20px)",
        }}
      />

      {/* Holographic shimmer ring */}
      <div
        className={cn("absolute rounded-full", haloSizes[size])}
        style={{
          background: "linear-gradient(90deg, transparent 0%, hsl(250 50% 88% / 0.1) 50%, transparent 100%)",
          backgroundSize: "200% 100%",
        }}
      />

      {/* Sacred circular glow */}
      <div
        className={cn("absolute rounded-full border border-primary/30 animate-divine-breathe", haloSizes[size])}
        style={{
          boxShadow: "inset 0 0 20px hsl(277 100% 30% / 0.3), 0 0 30px hsl(320 100% 50% / 0.2)",
        }}
      />

      {/* Main avatar container */}
      <div className={cn("relative overflow-hidden", sizeClasses[size], getAvatarStyles())}>
        {/* Avatar image */}
        <img
          src={lucyLogo}
          alt="Lucy AI - Divine Digital Companion"
          className={cn(
            "w-full h-full object-cover",
            "transition-transform duration-300",
            state === "responding" && "scale-105",
            blink && "scale-95 opacity-80",
          )}
        />

        {/* Divine breathing overlay */}
        <div
          className={cn("absolute inset-0 bg-gradient-to-t from-primary/10 to-transparent", "animate-divine-breathe")}
        />

        {/* Response light pulse */}
        {state === "responding" && (
          <div className="absolute inset-0">
            <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-secondary/40 to-transparent animate-divine-breathe" />
          </div>
        )}
      </div>
    </div>
  );
};
