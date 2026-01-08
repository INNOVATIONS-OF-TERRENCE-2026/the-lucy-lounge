// Lucy Arcade - Player Stats Panel
import { motion } from 'framer-motion';
import { Trophy, Coins, Star, TrendingUp } from 'lucide-react';
import { usePlayerProfile } from '../hooks/usePlayerProfile';

export function PlayerStatsPanel() {
  const { profile, isLoading } = usePlayerProfile();

  if (isLoading) {
    return (
      <div className="rounded-xl bg-card/50 border border-border/50 p-4 animate-pulse">
        <div className="h-4 bg-muted rounded w-24 mb-2" />
        <div className="h-8 bg-muted rounded w-32" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="rounded-xl bg-card/50 border border-border/50 p-4 text-center">
        <p className="text-sm text-muted-foreground">Sign in to track your progress</p>
      </div>
    );
  }

  const xpToNextLevel = 1000 - (profile.totalXp % 1000);
  const xpProgress = ((profile.totalXp % 1000) / 1000) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="rounded-xl bg-gradient-to-br from-card/80 to-card/40 border border-border/50 p-4 space-y-4 backdrop-blur-sm"
    >
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary/50 flex items-center justify-center text-primary-foreground font-bold text-lg">
          {profile.displayName?.charAt(0).toUpperCase() || 'P'}
        </div>
        <div>
          <h3 className="font-semibold text-foreground">{profile.displayName || 'Player'}</h3>
          <p className="text-sm text-muted-foreground">Level {profile.level}</p>
        </div>
      </div>

      {/* XP Progress */}
      <div className="space-y-1">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Experience</span>
          <span>{xpToNextLevel} XP to next level</span>
        </div>
        <div className="h-2 rounded-full bg-muted/50 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${xpProgress}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="h-full bg-gradient-to-r from-primary to-primary/70 rounded-full"
          />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/30">
          <Star className="w-4 h-4 text-yellow-500" />
          <div>
            <p className="text-xs text-muted-foreground">Total XP</p>
            <p className="font-semibold text-foreground">{profile.totalXp.toLocaleString()}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/30">
          <Coins className="w-4 h-4 text-amber-500" />
          <div>
            <p className="text-xs text-muted-foreground">Coins</p>
            <p className="font-semibold text-foreground">{profile.coins.toLocaleString()}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/30">
          <Trophy className="w-4 h-4 text-primary" />
          <div>
            <p className="text-xs text-muted-foreground">Level</p>
            <p className="font-semibold text-foreground">{profile.level}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/30">
          <TrendingUp className="w-4 h-4 text-green-500" />
          <div>
            <p className="text-xs text-muted-foreground">Rank</p>
            <p className="font-semibold text-foreground">—</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
