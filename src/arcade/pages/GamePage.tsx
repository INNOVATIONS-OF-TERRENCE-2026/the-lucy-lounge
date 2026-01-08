// Lucy Arcade - Game Page
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { GameFrame } from '../components/GameFrame';
import { LeaderboardPanel } from '../components/LeaderboardPanel';
import { getGameById } from '../data/games';

export default function GamePage() {
  const { gameId } = useParams<{ gameId: string }>();
  const game = getGameById(gameId || '');

  if (!game) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Game not found</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-4 md:p-8"
    >
      <div className="container mx-auto max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Game Area */}
          <div className="lg:col-span-3">
            <GameFrame gameId={gameId || ''} />
          </div>
          
          {/* Sidebar */}
          <div className="space-y-6">
            {/* Game Info */}
            <div className="rounded-xl bg-card/50 border border-border/50 p-4 space-y-3">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{game.icon}</span>
                <div>
                  <h2 className="font-semibold text-lg">{game.title}</h2>
                  <p className="text-sm text-muted-foreground capitalize">{game.category}</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">{game.description}</p>
              
              {/* Controls */}
              <div className="flex flex-wrap gap-2 pt-2">
                {game.controls.map(control => (
                  <span key={control} className="text-xs px-2 py-1 rounded-full bg-muted/50 text-muted-foreground capitalize">
                    {control}
                  </span>
                ))}
              </div>
            </div>
            
            {/* Leaderboard */}
            {game.hasLeaderboard && (
              <LeaderboardPanel gameId={gameId || ''} title="Top Scores" />
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
