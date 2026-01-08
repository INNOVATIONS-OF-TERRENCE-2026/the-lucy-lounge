// Lucy Arcade - Leaderboard Panel
import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Medal, Crown } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useLeaderboard } from '../hooks/useLeaderboard';

interface LeaderboardPanelProps {
  gameId: string;
  title?: string;
}

export function LeaderboardPanel({ gameId, title = 'Leaderboard' }: LeaderboardPanelProps) {
  const { entries, isLoading, fetchLeaderboard } = useLeaderboard(gameId);

  useEffect(() => {
    fetchLeaderboard(10);
  }, [fetchLeaderboard]);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-4 h-4 text-yellow-500" />;
      case 2:
        return <Medal className="w-4 h-4 text-gray-400" />;
      case 3:
        return <Medal className="w-4 h-4 text-amber-600" />;
      default:
        return <span className="w-4 text-center text-xs text-muted-foreground">#{rank}</span>;
    }
  };

  if (isLoading) {
    return (
      <div className="rounded-xl bg-card/50 border border-border/50 p-4">
        <div className="flex items-center gap-2 mb-4">
          <Trophy className="w-5 h-5 text-primary" />
          <h3 className="font-semibold">{title}</h3>
        </div>
        <div className="space-y-2">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-10 bg-muted/30 rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-gradient-to-br from-card/80 to-card/40 border border-border/50 overflow-hidden backdrop-blur-sm">
      <div className="flex items-center gap-2 p-4 border-b border-border/50">
        <Trophy className="w-5 h-5 text-primary" />
        <h3 className="font-semibold">{title}</h3>
      </div>
      
      <ScrollArea className="h-64">
        <div className="p-2">
          {entries.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No scores yet. Be the first!
            </p>
          ) : (
            <div className="space-y-1">
              {entries.map((entry, index) => (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/30 transition-colors"
                >
                  <div className="w-6 flex justify-center">
                    {getRankIcon(entry.rank || index + 1)}
                  </div>
                  
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center text-sm font-medium">
                    {entry.displayName.charAt(0).toUpperCase()}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{entry.displayName}</p>
                  </div>
                  
                  <div className="text-right">
                    <p className="font-semibold text-primary">{entry.score.toLocaleString()}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
