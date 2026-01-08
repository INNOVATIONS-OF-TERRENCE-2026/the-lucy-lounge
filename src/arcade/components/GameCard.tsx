// Lucy Arcade - Game Card Component
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Play, Trophy, Users, Gamepad2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { GameConfig } from '../types/game.types';

interface GameCardProps {
  game: GameConfig;
  index: number;
}

export function GameCard({ game, index }: GameCardProps) {
  const navigate = useNavigate();

  const categoryColors: Record<string, string> = {
    sports: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    action: 'bg-red-500/20 text-red-400 border-red-500/30',
    strategy: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    social: 'bg-green-500/20 text-green-400 border-green-500/30',
    puzzle: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
      whileHover={{ scale: 1.02, y: -4 }}
      className="group relative rounded-2xl bg-gradient-to-br from-card/80 to-card/40 border border-border/50 overflow-hidden backdrop-blur-sm"
    >
      {/* Glow effect on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      {/* Thumbnail area */}
      <div className="relative h-32 bg-gradient-to-br from-muted/50 to-muted/20 flex items-center justify-center overflow-hidden">
        <span className="text-5xl transform group-hover:scale-110 transition-transform duration-300">
          {game.icon}
        </span>
        
        {/* Category badge */}
        <Badge 
          variant="outline" 
          className={`absolute top-3 right-3 ${categoryColors[game.category]}`}
        >
          {game.category}
        </Badge>
      </div>
      
      {/* Content */}
      <div className="p-4 space-y-3">
        <h3 className="font-semibold text-lg text-foreground">{game.title}</h3>
        <p className="text-sm text-muted-foreground line-clamp-2">{game.description}</p>
        
        {/* Features */}
        <div className="flex flex-wrap gap-2">
          {game.hasAI && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Gamepad2 className="w-3 h-3" />
              <span>AI Opponent</span>
            </div>
          )}
          {game.hasLeaderboard && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Trophy className="w-3 h-3" />
              <span>Leaderboard</span>
            </div>
          )}
          {game.maxPlayers > 1 && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Users className="w-3 h-3" />
              <span>{game.minPlayers}-{game.maxPlayers} Players</span>
            </div>
          )}
        </div>
        
        {/* Play button */}
        <Button 
          onClick={() => navigate(`/arcade/${game.id}`)}
          className="w-full gap-2 bg-primary/90 hover:bg-primary"
        >
          <Play className="w-4 h-4" />
          Play Now
        </Button>
      </div>
    </motion.div>
  );
}
