/**
 * THE LUCY LOUNGE - Cinematic Sidebar Enhancements
 * 
 * Upgrades to existing sidebar:
 * - Lounge constellation grouping
 * - Ambient hover previews
 * - Active lounge glow lock-in
 * 
 * Rules:
 * - Does NOT change navigation logic
 * - Does NOT affect chat history visibility
 * - No data loss
 */

import React, { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import { useCinematicSafe } from '@/contexts/CinematicContext';
import {
  Brain,
  MoonStar,
  Eye,
  Users,
  History,
  Command,
  Atom,
  Sparkles,
  Globe,
  Headphones,
  Film,
} from 'lucide-react';

// Lounge configuration with groupings
export interface LoungeConfig {
  id: string;
  label: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  group: 'experience' | 'creative' | 'utility';
  glowColor: string;
}

export const loungeConfig: LoungeConfig[] = [
  // Experience Group
  {
    id: 'listening',
    label: 'Listening Mode',
    path: '/listening-mode',
    icon: Headphones,
    description: 'Immerse in curated soundscapes',
    group: 'experience',
    glowColor: 'rgba(29, 185, 84, 0.5)',
  },
  {
    id: 'dream',
    label: 'Dream Mode',
    path: '/dream',
    icon: MoonStar,
    description: 'Explore subconscious creativity',
    group: 'experience',
    glowColor: 'rgba(167, 139, 250, 0.5)',
  },
  {
    id: 'presence',
    label: 'Presence Mode',
    path: '/presence',
    icon: Sparkles,
    description: 'Mindful awareness space',
    group: 'experience',
    glowColor: 'rgba(255, 255, 255, 0.4)',
  },
  {
    id: 'silent',
    label: 'Silent Room',
    path: '/silent-room',
    icon: Users,
    description: 'Quiet contemplation',
    group: 'experience',
    glowColor: 'rgba(156, 163, 175, 0.4)',
  },
  // Creative Group
  {
    id: 'neural',
    label: 'Neural Mode',
    path: '/neural',
    icon: Brain,
    description: 'Deep cognitive exploration',
    group: 'creative',
    glowColor: 'rgba(66, 133, 244, 0.5)',
  },
  {
    id: 'vision',
    label: 'Vision Mode',
    path: '/vision',
    icon: Eye,
    description: 'Visual ideation space',
    group: 'creative',
    glowColor: 'rgba(245, 195, 66, 0.5)',
  },
  {
    id: 'media',
    label: 'Media Mode',
    path: '/media',
    icon: Film,
    description: 'Rich media experiences',
    group: 'creative',
    glowColor: 'rgba(239, 68, 68, 0.5)',
  },
  {
    id: 'quantum',
    label: 'Quantum Mode',
    path: '/quantum',
    icon: Atom,
    description: 'Probabilistic exploration',
    group: 'creative',
    glowColor: 'rgba(34, 211, 238, 0.5)',
  },
  // Utility Group
  {
    id: 'timeline',
    label: 'Memory Timeline',
    path: '/timeline',
    icon: History,
    description: 'Journey through memories',
    group: 'utility',
    glowColor: 'rgba(245, 158, 66, 0.5)',
  },
  {
    id: 'events',
    label: 'World Events',
    path: '/events',
    icon: Globe,
    description: 'Global happenings',
    group: 'utility',
    glowColor: 'rgba(239, 68, 68, 0.5)',
  },
  {
    id: 'command',
    label: 'Command Center',
    path: '/command',
    icon: Command,
    description: 'System controls',
    group: 'utility',
    glowColor: 'rgba(100, 116, 139, 0.5)',
  },
];

const groupLabels: Record<string, string> = {
  experience: 'Experience',
  creative: 'Creative',
  utility: 'Utility',
};

/**
 * Cinematic Lounge Item
 */
interface CinematicLoungeItemProps {
  lounge: LoungeConfig;
  isActive: boolean;
  isHovered: boolean;
  onHover: (hovered: boolean) => void;
  onClick: () => void;
  isEnabled: boolean;
  intensity: number;
}

function CinematicLoungeItem({
  lounge,
  isActive,
  isHovered,
  onHover,
  onClick,
  isEnabled,
  intensity,
}: CinematicLoungeItemProps) {
  const Icon = lounge.icon;

  return (
    <motion.button
      className={`
        w-full flex items-center gap-3 px-3 py-2 rounded-lg
        transition-colors duration-200 text-left
        ${isActive 
          ? 'bg-primary/20 text-primary' 
          : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
        }
      `}
      onClick={onClick}
      onMouseEnter={() => onHover(true)}
      onMouseLeave={() => onHover(false)}
      whileHover={isEnabled ? { x: 4 } : {}}
      whileTap={isEnabled ? { scale: 0.98 } : {}}
    >
      {/* Icon with glow effect */}
      <div className="relative">
        <Icon className="w-4 h-4" />
        
        {/* Active glow ring */}
        <AnimatePresence>
          {isActive && isEnabled && (
            <motion.div
              className="absolute inset-0 -m-2 rounded-full"
              style={{ 
                background: `radial-gradient(circle, ${lounge.glowColor} 0%, transparent 70%)`,
              }}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ 
                opacity: [0.5, 0.8, 0.5],
                scale: [1, 1.2, 1],
              }}
              exit={{ opacity: 0, scale: 0.5 }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          )}
        </AnimatePresence>
      </div>

      <span className="flex-1 text-sm">{lounge.label}</span>

      {/* Hover preview indicator */}
      <AnimatePresence>
        {isHovered && !isActive && isEnabled && (
          <motion.div
            className="w-1.5 h-1.5 rounded-full"
            style={{ backgroundColor: lounge.glowColor }}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
          />
        )}
      </AnimatePresence>
    </motion.button>
  );
}

/**
 * Lounge Constellation Group
 */
interface LoungeConstellationGroupProps {
  group: string;
  lounges: LoungeConfig[];
  activePath: string;
  hoveredLounge: string | null;
  onHover: (id: string | null) => void;
  onNavigate: (path: string) => void;
  isEnabled: boolean;
  intensity: number;
  collapsed?: boolean;
}

function LoungeConstellationGroup({
  group,
  lounges,
  activePath,
  hoveredLounge,
  onHover,
  onNavigate,
  isEnabled,
  intensity,
  collapsed = false,
}: LoungeConstellationGroupProps) {
  const [isExpanded, setIsExpanded] = useState(!collapsed);

  return (
    <div className="mb-4">
      {/* Group header */}
      <button
        className="w-full flex items-center gap-2 px-3 py-1.5 text-xs uppercase tracking-wide text-muted-foreground hover:text-foreground transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <motion.span
          animate={{ rotate: isExpanded ? 90 : 0 }}
          transition={{ duration: 0.2 }}
        >
          ›
        </motion.span>
        {groupLabels[group]}
        
        {/* Active indicator dot */}
        {lounges.some(l => l.path === activePath) && (
          <motion.div
            className="w-1.5 h-1.5 rounded-full bg-primary ml-auto"
            animate={isEnabled ? { scale: [1, 1.2, 1] } : {}}
            transition={{ duration: 2, repeat: Infinity }}
          />
        )}
      </button>

      {/* Lounge items */}
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="space-y-1 py-1">
              {lounges.map(lounge => (
                <CinematicLoungeItem
                  key={lounge.id}
                  lounge={lounge}
                  isActive={activePath === lounge.path}
                  isHovered={hoveredLounge === lounge.id}
                  onHover={(hovered) => onHover(hovered ? lounge.id : null)}
                  onClick={() => onNavigate(lounge.path)}
                  isEnabled={isEnabled}
                  intensity={intensity}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * Main Cinematic Lounges List Component
 */
interface CinematicLoungesListProps {
  className?: string;
}

export function CinematicLoungesList({ className = '' }: CinematicLoungesListProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const cinematic = useCinematicSafe();
  const shouldReduceMotion = useReducedMotion();
  
  const [hoveredLounge, setHoveredLounge] = useState<string | null>(null);

  const isEnabled = !shouldReduceMotion && (cinematic?.isEnabled ?? true);
  const intensity = cinematic?.intensity ?? 0.5;

  // Group lounges by category
  const groupedLounges = useMemo(() => {
    const groups: Record<string, LoungeConfig[]> = {};
    loungeConfig.forEach(lounge => {
      if (!groups[lounge.group]) {
        groups[lounge.group] = [];
      }
      groups[lounge.group].push(lounge);
    });
    return groups;
  }, []);

  const handleNavigate = useCallback((path: string) => {
    navigate(path);
  }, [navigate]);

  // Find active lounge for preview
  const activeLounge = useMemo(() => {
    return loungeConfig.find(l => l.path === location.pathname);
  }, [location.pathname]);

  const hoveredLoungeData = useMemo(() => {
    return hoveredLounge ? loungeConfig.find(l => l.id === hoveredLounge) : null;
  }, [hoveredLounge]);

  return (
    <div className={`cinematic-lounges ${className}`}>
      {/* Hover preview card */}
      <AnimatePresence>
        {hoveredLoungeData && isEnabled && (
          <motion.div
            className="mb-4 p-3 rounded-lg border border-white/10 backdrop-blur-sm"
            style={{ 
              background: `linear-gradient(135deg, ${hoveredLoungeData.glowColor.replace('0.5', '0.1')} 0%, transparent 100%)`,
            }}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
          >
            <div className="flex items-center gap-2 mb-1">
              <hoveredLoungeData.icon className="w-4 h-4" />
              <span className="font-medium text-sm">{hoveredLoungeData.label}</span>
            </div>
            <p className="text-xs text-muted-foreground">
              {hoveredLoungeData.description}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Constellation groups */}
      {Object.entries(groupedLounges).map(([group, lounges]) => (
        <LoungeConstellationGroup
          key={group}
          group={group}
          lounges={lounges}
          activePath={location.pathname}
          hoveredLounge={hoveredLounge}
          onHover={setHoveredLounge}
          onNavigate={handleNavigate}
          isEnabled={isEnabled}
          intensity={intensity}
        />
      ))}

      {/* Active lounge glow indicator at bottom */}
      {activeLounge && isEnabled && (
        <motion.div
          className="mt-4 h-1 rounded-full mx-3"
          style={{ backgroundColor: activeLounge.glowColor }}
          animate={{
            opacity: [0.5, 0.8, 0.5],
          }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      )}
    </div>
  );
}

export default CinematicLoungesList;
