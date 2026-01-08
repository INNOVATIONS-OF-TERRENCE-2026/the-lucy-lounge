// Lucy Arcade - Game Frame (Isolated Container)
import { Suspense, lazy, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, ArrowLeft, Volume2, VolumeX, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useArcadeStore } from '../stores/arcadeStore';
import { getGameById } from '../data/games';

// Lazy load games
const ChessGame = lazy(() => import('../games/chess/ChessGame'));
const CheckersGame = lazy(() => import('../games/checkers/CheckersGame'));
const MemoryGame = lazy(() => import('../games/memory/MemoryGame'));

interface GameFrameProps {
  gameId: string;
}

const GameLoader = () => (
  <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm">
    <div className="flex flex-col items-center gap-4">
      <Loader2 className="w-10 h-10 text-primary animate-spin" />
      <p className="text-muted-foreground">Loading game...</p>
    </div>
  </div>
);

export function GameFrame({ gameId }: GameFrameProps) {
  const navigate = useNavigate();
  const { isMuted, toggleMute, setActiveGame } = useArcadeStore();
  const game = getGameById(gameId);

  useEffect(() => {
    setActiveGame(gameId);
    return () => setActiveGame(null);
  }, [gameId, setActiveGame]);

  if (!game) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <p className="text-muted-foreground">Game not found</p>
        <Button onClick={() => navigate('/arcade')}>Back to Arcade</Button>
      </div>
    );
  }

  const renderGame = () => {
    switch (gameId) {
      case 'chess':
        return <ChessGame />;
      case 'checkers':
        return <CheckersGame />;
      case 'memory-match':
        return <MemoryGame />;
      default:
        return (
          <div className="flex flex-col items-center justify-center h-full gap-4 text-center p-8">
            <span className="text-6xl">{game.icon}</span>
            <h2 className="text-2xl font-bold">{game.title}</h2>
            <p className="text-muted-foreground max-w-md">{game.description}</p>
            <p className="text-sm text-muted-foreground/70">Coming soon...</p>
            <Button onClick={() => navigate('/arcade')} variant="outline">
              Back to Arcade
            </Button>
          </div>
        );
    }
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={gameId}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="relative w-full h-full min-h-[500px] bg-gradient-to-br from-background to-muted/20 rounded-xl overflow-hidden border border-border/50"
      >
        {/* Game Header */}
        <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between p-4 bg-gradient-to-b from-background/90 to-transparent">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/arcade')}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={toggleMute}>
              {isMuted ? (
                <VolumeX className="w-4 h-4" />
              ) : (
                <Volume2 className="w-4 h-4" />
              )}
            </Button>
            <Button variant="ghost" size="icon">
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Game Container */}
        <Suspense fallback={<GameLoader />}>
          <div className="w-full h-full pt-16">
            {renderGame()}
          </div>
        </Suspense>
      </motion.div>
    </AnimatePresence>
  );
}
