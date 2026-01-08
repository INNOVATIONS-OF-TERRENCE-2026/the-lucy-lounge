// Lucy Arcade - Memory Match Game
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCcw, Star, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useGameStats } from '../../hooks/useGameStats';
import { usePlayerProfile } from '../../hooks/usePlayerProfile';
import { useArcadeStore } from '../../stores/arcadeStore';

const CARD_EMOJIS = ['🎮', '🎯', '🎲', '🎪', '🎨', '🎭', '🎪', '🎸', '🎺', '🎻', '🎹', '🎷'];

interface Card {
  id: number;
  emoji: string;
  isFlipped: boolean;
  isMatched: boolean;
}

const shuffleArray = <T,>(array: T[]): T[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

const createCards = (pairCount: number): Card[] => {
  const emojis = CARD_EMOJIS.slice(0, pairCount);
  const pairs = [...emojis, ...emojis];
  const shuffled = shuffleArray(pairs);
  
  return shuffled.map((emoji, index) => ({
    id: index,
    emoji,
    isFlipped: false,
    isMatched: false,
  }));
};

export default function MemoryGame() {
  const [cards, setCards] = useState<Card[]>(() => createCards(8));
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [matches, setMatches] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [gameStatus, setGameStatus] = useState<'playing' | 'won'>('playing');
  const [startTime] = useState(Date.now());
  const [elapsedTime, setElapsedTime] = useState(0);
  
  const { recordGame } = useGameStats('memory-match');
  const { addXp, addCoins } = usePlayerProfile();
  const { addLucyMessage, gameDifficulty } = useArcadeStore();

  const pairCount = gameDifficulty === 'easy' ? 6 : gameDifficulty === 'hard' ? 10 : 8;

  useEffect(() => {
    if (gameStatus !== 'playing') return;
    
    const timer = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    
    return () => clearInterval(timer);
  }, [startTime, gameStatus]);

  const checkForMatch = useCallback(() => {
    if (flippedCards.length !== 2) return;
    
    const [first, second] = flippedCards;
    const firstCard = cards[first];
    const secondCard = cards[second];
    
    if (firstCard.emoji === secondCard.emoji) {
      // Match found
      setCards(prev => prev.map(card => 
        card.id === first || card.id === second
          ? { ...card, isMatched: true }
          : card
      ));
      setMatches(prev => {
        const newMatches = prev + 1;
        if (newMatches === cards.length / 2) {
          setGameStatus('won');
          const playtime = Math.floor((Date.now() - startTime) / 1000);
          const score = Math.max(1000 - moves * 10 - playtime, 100);
          recordGame({ won: true, score, playtimeSeconds: playtime });
          addXp(50);
          addCoins(25);
          addLucyMessage({ type: 'achievement', message: `Perfect! Completed in ${moves} moves! 🧠`, timestamp: Date.now() });
        }
        return newMatches;
      });
      setFlippedCards([]);
      setIsLocked(false);
    } else {
      // No match
      setTimeout(() => {
        setCards(prev => prev.map(card => 
          card.id === first || card.id === second
            ? { ...card, isFlipped: false }
            : card
        ));
        setFlippedCards([]);
        setIsLocked(false);
      }, 1000);
    }
  }, [flippedCards, cards, moves, startTime, recordGame, addXp, addCoins, addLucyMessage]);

  useEffect(() => {
    if (flippedCards.length === 2) {
      checkForMatch();
    }
  }, [flippedCards, checkForMatch]);

  const handleCardClick = (id: number) => {
    if (isLocked || gameStatus !== 'playing') return;
    
    const card = cards[id];
    if (card.isFlipped || card.isMatched) return;
    
    setCards(prev => prev.map(c => 
      c.id === id ? { ...c, isFlipped: true } : c
    ));
    
    setFlippedCards(prev => {
      if (prev.length === 0) {
        return [id];
      } else if (prev.length === 1) {
        setMoves(m => m + 1);
        setIsLocked(true);
        return [...prev, id];
      }
      return prev;
    });
  };

  const resetGame = () => {
    setCards(createCards(pairCount));
    setFlippedCards([]);
    setMoves(0);
    setMatches(0);
    setIsLocked(false);
    setGameStatus('playing');
    setElapsedTime(0);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const gridCols = cards.length <= 12 ? 'grid-cols-4' : cards.length <= 16 ? 'grid-cols-4' : 'grid-cols-5';

  return (
    <div className="flex flex-col items-center justify-center h-full gap-6 p-4">
      {/* Stats */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Star className="w-4 h-4" />
          <span>Moves: {moves}</span>
        </div>
        <div className={`px-4 py-2 rounded-full ${gameStatus === 'won' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
          {gameStatus === 'won' ? '🎉 You Won!' : `Matches: ${matches}/${cards.length / 2}`}
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Clock className="w-4 h-4" />
          <span>{formatTime(elapsedTime)}</span>
        </div>
      </div>
      
      {/* Card Grid */}
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className={`grid ${gridCols} gap-3 p-4`}
      >
        {cards.map((card) => (
          <motion.button
            key={card.id}
            onClick={() => handleCardClick(card.id)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`relative w-16 h-20 sm:w-20 sm:h-24 rounded-xl cursor-pointer perspective-1000 ${
              card.isMatched ? 'opacity-50' : ''
            }`}
          >
            <AnimatePresence initial={false} mode="wait">
              {card.isFlipped || card.isMatched ? (
                <motion.div
                  key="front"
                  initial={{ rotateY: -90 }}
                  animate={{ rotateY: 0 }}
                  exit={{ rotateY: 90 }}
                  transition={{ duration: 0.3 }}
                  className="absolute inset-0 flex items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 border-2 border-primary/30 text-3xl sm:text-4xl"
                >
                  {card.emoji}
                </motion.div>
              ) : (
                <motion.div
                  key="back"
                  initial={{ rotateY: 90 }}
                  animate={{ rotateY: 0 }}
                  exit={{ rotateY: -90 }}
                  transition={{ duration: 0.3 }}
                  className="absolute inset-0 flex items-center justify-center rounded-xl bg-gradient-to-br from-muted to-muted/50 border-2 border-border"
                >
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                    <span className="text-xl">?</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        ))}
      </motion.div>
      
      {/* Controls */}
      <Button variant="outline" size="sm" onClick={resetGame} className="gap-2">
        <RotateCcw className="w-4 h-4" />
        New Game
      </Button>
    </div>
  );
}
