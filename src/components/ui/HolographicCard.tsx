import { ReactNode, useState } from 'react';
import { cn } from '@/lib/utils';

interface HolographicCardProps {
  children: ReactNode;
  className?: string;
  glowColor?: 'primary' | 'accent' | 'secondary';
  interactive?: boolean;
}

export const HolographicCard = ({ 
  children, 
  className,
  glowColor = 'primary',
  interactive = true 
}: HolographicCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!interactive) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 20;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 20;
    setMousePosition({ x, y });
  };

  const glowColors = {
    primary: 'shadow-[0_0_30px_rgba(123,63,242,0.4)] hover:shadow-[0_0_50px_rgba(123,63,242,0.6)]',
    accent: 'shadow-[0_0_30px_rgba(32,164,243,0.4)] hover:shadow-[0_0_50px_rgba(32,164,243,0.6)]',
    secondary: 'shadow-[0_0_30px_rgba(198,163,255,0.4)] hover:shadow-[0_0_50px_rgba(198,163,255,0.6)]'
  };

  return (
    <div
      className={cn(
        'relative backdrop-blur-xl bg-white/5 border border-white/10 rounded-[14px] p-6',
        'transition-all duration-300 ease-out',
        glowColors[glowColor],
        interactive && 'hover:scale-[1.02] hover:bg-white/8',
        className
      )}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setMousePosition({ x: 0, y: 0 });
      }}
      style={
        interactive && isHovered
          ? {
              transform: `perspective(1000px) rotateX(${-mousePosition.y * 0.05}deg) rotateY(${mousePosition.x * 0.05}deg)`
            }
          : undefined
      }
    >
      {/* Animated border gradient */}
      <div 
        className={cn(
          'absolute inset-0 rounded-[14px] opacity-0 transition-opacity duration-300',
          'bg-gradient-to-br from-primary/20 via-accent/20 to-secondary/20',
          isHovered && 'opacity-100'
        )}
        style={{
          maskImage: 'linear-gradient(white, white) padding-box, linear-gradient(white, white)',
          maskComposite: 'exclude'
        }}
      />

      {/* Holographic shine effect */}
      {isHovered && (
        <div 
          className="absolute inset-0 rounded-[14px] opacity-30 pointer-events-none"
          style={{
            background: `radial-gradient(circle at ${mousePosition.x * 5 + 50}% ${mousePosition.y * 5 + 50}%, rgba(255,255,255,0.3), transparent 50%)`
          }}
        />
      )}

      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};
