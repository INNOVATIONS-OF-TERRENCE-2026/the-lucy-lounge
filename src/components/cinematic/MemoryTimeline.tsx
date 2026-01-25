/**
 * THE LUCY LOUNGE - Memory Timeline Visualizer
 * 
 * Emotional Memory Visualization:
 * - Sessions shown as glowing nodes
 * - Color-coded by mood/activity
 * - Click to revisit session context
 * 
 * Rules:
 * - Read-only by default
 * - Private by default
 * - Optional admin "reflection mode"
 */

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { format, formatDistanceToNow } from 'date-fns';
import { useCinematicSafe } from '@/contexts/CinematicContext';

export type SessionMood = 'creative' | 'productive' | 'reflective' | 'energetic' | 'calm' | 'neutral';
export type SessionActivity = 'chat' | 'listening' | 'creating' | 'exploring' | 'dreaming';

export interface MemorySession {
  id: string;
  timestamp: Date;
  mood: SessionMood;
  activity: SessionActivity;
  title?: string;
  summary?: string;
  duration?: number; // minutes
  highlights?: string[];
}

interface MemoryTimelineProps {
  sessions: MemorySession[];
  onSessionClick?: (session: MemorySession) => void;
  className?: string;
  reflectionMode?: boolean;
}

// Color schemes for moods
const moodColors: Record<SessionMood, { bg: string; glow: string; text: string }> = {
  creative: {
    bg: 'bg-purple-500/20',
    glow: 'rgba(168, 85, 247, 0.5)',
    text: 'text-purple-300',
  },
  productive: {
    bg: 'bg-green-500/20',
    glow: 'rgba(34, 197, 94, 0.5)',
    text: 'text-green-300',
  },
  reflective: {
    bg: 'bg-blue-500/20',
    glow: 'rgba(59, 130, 246, 0.5)',
    text: 'text-blue-300',
  },
  energetic: {
    bg: 'bg-orange-500/20',
    glow: 'rgba(249, 115, 22, 0.5)',
    text: 'text-orange-300',
  },
  calm: {
    bg: 'bg-cyan-500/20',
    glow: 'rgba(34, 211, 238, 0.5)',
    text: 'text-cyan-300',
  },
  neutral: {
    bg: 'bg-slate-500/20',
    glow: 'rgba(148, 163, 184, 0.5)',
    text: 'text-slate-300',
  },
};

// Icons for activities
const activityIcons: Record<SessionActivity, string> = {
  chat: '💬',
  listening: '🎧',
  creating: '✨',
  exploring: '🔍',
  dreaming: '🌙',
};

export function MemoryTimeline({
  sessions,
  onSessionClick,
  className = '',
  reflectionMode = false,
}: MemoryTimelineProps) {
  const cinematic = useCinematicSafe();
  const shouldReduceMotion = useReducedMotion();
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const [hoveredSession, setHoveredSession] = useState<string | null>(null);

  const isEnabled = !shouldReduceMotion && (cinematic?.isEnabled ?? true);
  const intensity = cinematic?.intensity ?? 0.5;

  // Group sessions by date
  const groupedSessions = useMemo(() => {
    const groups: Record<string, MemorySession[]> = {};
    
    sessions.forEach(session => {
      const dateKey = format(session.timestamp, 'yyyy-MM-dd');
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(session);
    });

    return Object.entries(groups)
      .sort(([a], [b]) => b.localeCompare(a)) // Most recent first
      .map(([date, sessions]) => ({
        date,
        displayDate: format(new Date(date), 'MMMM d, yyyy'),
        sessions: sessions.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()),
      }));
  }, [sessions]);

  const handleSessionClick = useCallback((session: MemorySession) => {
    setSelectedSession(session.id === selectedSession ? null : session.id);
    onSessionClick?.(session);
  }, [selectedSession, onSessionClick]);

  return (
    <div className={`memory-timeline ${className}`}>
      {/* Timeline header */}
      <div className="mb-6 flex items-center gap-3">
        <motion.div
          className="w-3 h-3 rounded-full bg-purple-500"
          animate={isEnabled ? {
            scale: [1, 1.2, 1],
            opacity: [0.5, 1, 0.5],
          } : {}}
          transition={{ duration: 2, repeat: Infinity }}
        />
        <h2 className="text-xl font-semibold text-foreground">Memory Timeline</h2>
        {reflectionMode && (
          <span className="px-2 py-1 text-xs rounded-full bg-purple-500/20 text-purple-300">
            Reflection Mode
          </span>
        )}
      </div>

      {/* Timeline content */}
      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-4 top-0 bottom-0 w-px bg-gradient-to-b from-purple-500/50 via-blue-500/30 to-transparent" />

        {/* Session groups */}
        <AnimatePresence>
          {groupedSessions.map(({ date, displayDate, sessions: daySessions }, groupIndex) => (
            <motion.div
              key={date}
              className="mb-8"
              initial={isEnabled ? { opacity: 0, x: -20 } : false}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: groupIndex * 0.1 }}
            >
              {/* Date header */}
              <div className="flex items-center gap-3 mb-4 ml-8">
                <span className="text-sm text-muted-foreground">{displayDate}</span>
              </div>

              {/* Session nodes */}
              <div className="space-y-3">
                {daySessions.map((session, index) => (
                  <MemoryNode
                    key={session.id}
                    session={session}
                    isSelected={selectedSession === session.id}
                    isHovered={hoveredSession === session.id}
                    onClick={() => handleSessionClick(session)}
                    onHover={(hovered) => setHoveredSession(hovered ? session.id : null)}
                    isEnabled={isEnabled}
                    intensity={intensity}
                    reflectionMode={reflectionMode}
                    index={index}
                  />
                ))}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Empty state */}
        {sessions.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <p>No memories yet. Your journey begins now.</p>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Individual Memory Node
 */
interface MemoryNodeProps {
  session: MemorySession;
  isSelected: boolean;
  isHovered: boolean;
  onClick: () => void;
  onHover: (hovered: boolean) => void;
  isEnabled: boolean;
  intensity: number;
  reflectionMode: boolean;
  index: number;
}

function MemoryNode({
  session,
  isSelected,
  isHovered,
  onClick,
  onHover,
  isEnabled,
  intensity,
  reflectionMode,
  index,
}: MemoryNodeProps) {
  const colors = moodColors[session.mood];

  return (
    <motion.div
      className="relative flex items-start gap-4 group cursor-pointer"
      onClick={onClick}
      onMouseEnter={() => onHover(true)}
      onMouseLeave={() => onHover(false)}
      initial={isEnabled ? { opacity: 0, y: 10 } : false}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      {/* Node dot */}
      <div className="relative z-10">
        <motion.div
          className={`w-8 h-8 rounded-full ${colors.bg} flex items-center justify-center border border-white/10`}
          animate={isEnabled && (isHovered || isSelected) ? {
            scale: 1.2,
            boxShadow: `0 0 20px ${colors.glow}`,
          } : {
            scale: 1,
            boxShadow: `0 0 10px ${colors.glow.replace('0.5', '0.2')}`,
          }}
          transition={{ duration: 0.2 }}
        >
          <span className="text-sm">{activityIcons[session.activity]}</span>
        </motion.div>

        {/* Pulse ring when selected */}
        <AnimatePresence>
          {isSelected && isEnabled && (
            <motion.div
              className="absolute inset-0 rounded-full border-2"
              style={{ borderColor: colors.glow }}
              initial={{ scale: 1, opacity: 0.8 }}
              animate={{ scale: 1.5, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1, repeat: Infinity }}
            />
          )}
        </AnimatePresence>
      </div>

      {/* Content card */}
      <motion.div
        className={`flex-1 p-4 rounded-lg ${colors.bg} backdrop-blur-sm border border-white/5`}
        animate={{
          scale: isSelected ? 1.02 : 1,
          backgroundColor: isHovered ? colors.bg.replace('/20', '/30') : undefined,
        }}
        transition={{ duration: 0.2 }}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <div>
            <h3 className={`font-medium ${colors.text}`}>
              {session.title || `${session.activity.charAt(0).toUpperCase() + session.activity.slice(1)} Session`}
            </h3>
            <p className="text-xs text-muted-foreground">
              {format(session.timestamp, 'h:mm a')} · {formatDistanceToNow(session.timestamp, { addSuffix: true })}
            </p>
          </div>
          
          {session.duration && (
            <span className="text-xs text-muted-foreground">
              {session.duration}m
            </span>
          )}
        </div>

        {/* Summary */}
        {session.summary && (
          <p className="text-sm text-muted-foreground mb-2">
            {session.summary}
          </p>
        )}

        {/* Highlights (shown in reflection mode or when selected) */}
        <AnimatePresence>
          {(reflectionMode || isSelected) && session.highlights && session.highlights.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-3 pt-3 border-t border-white/10"
            >
              <p className="text-xs text-muted-foreground mb-2">Highlights:</p>
              <ul className="space-y-1">
                {session.highlights.map((highlight, i) => (
                  <li key={i} className="text-sm flex items-start gap-2">
                    <span className="text-purple-400">•</span>
                    {highlight}
                  </li>
                ))}
              </ul>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mood indicator */}
        <div className="flex items-center gap-2 mt-3">
          <span className={`text-xs px-2 py-0.5 rounded-full ${colors.bg} ${colors.text}`}>
            {session.mood}
          </span>
          <span className="text-xs text-muted-foreground">
            {session.activity}
          </span>
        </div>
      </motion.div>
    </motion.div>
  );
}

/**
 * Constellation View - Alternative visualization
 */
interface ConstellationViewProps {
  sessions: MemorySession[];
  onSessionClick?: (session: MemorySession) => void;
  className?: string;
}

export function MemoryConstellation({
  sessions,
  onSessionClick,
  className = '',
}: ConstellationViewProps) {
  const cinematic = useCinematicSafe();
  const shouldReduceMotion = useReducedMotion();
  const isEnabled = !shouldReduceMotion && (cinematic?.isEnabled ?? true);

  // Calculate positions in a constellation pattern
  const nodes = useMemo(() => {
    return sessions.slice(0, 20).map((session, i) => {
      const angle = (i / Math.min(sessions.length, 20)) * Math.PI * 2;
      const radius = 100 + (i % 3) * 40;
      return {
        session,
        x: 150 + Math.cos(angle) * radius,
        y: 150 + Math.sin(angle) * radius,
        size: 8 + (session.duration || 10) / 10,
      };
    });
  }, [sessions]);

  return (
    <div className={`memory-constellation relative ${className}`} style={{ minHeight: 320 }}>
      <svg className="w-full h-full absolute inset-0" viewBox="0 0 300 300">
        {/* Connection lines */}
        {nodes.map((node, i) => {
          const next = nodes[(i + 1) % nodes.length];
          return (
            <motion.line
              key={`line-${i}`}
              x1={node.x}
              y1={node.y}
              x2={next.x}
              y2={next.y}
              stroke="rgba(147, 112, 219, 0.2)"
              strokeWidth="1"
              initial={isEnabled ? { pathLength: 0 } : {}}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1, delay: i * 0.05 }}
            />
          );
        })}

        {/* Nodes */}
        {nodes.map((node, i) => {
          const colors = moodColors[node.session.mood];
          return (
            <motion.circle
              key={node.session.id}
              cx={node.x}
              cy={node.y}
              r={node.size}
              fill={colors.glow}
              className="cursor-pointer"
              initial={isEnabled ? { scale: 0, opacity: 0 } : {}}
              animate={{ scale: 1, opacity: 0.8 }}
              whileHover={{ scale: 1.5, opacity: 1 }}
              transition={{ delay: i * 0.03 }}
              onClick={() => onSessionClick?.(node.session)}
            />
          );
        })}
      </svg>

      {/* Center label */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <span className="text-sm text-muted-foreground">
          {sessions.length} memories
        </span>
      </div>
    </div>
  );
}

export default MemoryTimeline;
