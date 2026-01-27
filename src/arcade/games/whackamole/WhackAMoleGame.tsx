/**
 * Lucy Arcade — Whack-a-Mole
 * Fast-paced reaction game
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, RotateCcw } from 'lucide-react';

const GRID_SIZE = 9;
const GAME_DURATION = 30;

export default function WhackAMoleGame() {
  const [activeMole, setActiveMole] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [isPlaying, setIsPlaying] = useState(false);
  const [difficulty, setDifficulty] = useState(1000); // ms between moles
  
  const moleTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const gameIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const showNewMole = useCallback(() => {
    const newMole = Math.floor(Math.random() * GRID_SIZE);
    setActiveMole(newMole);
    
    // Hide mole after a while
    moleTimeoutRef.current = setTimeout(() => {
      setActiveMole(null);
    }, difficulty * 0.8);
  }, [difficulty]);

  const startGame = useCallback(() => {
    setScore(0);
    setTimeLeft(GAME_DURATION);
    setDifficulty(1000);
    setIsPlaying(true);
    showNewMole();
  }, [showNewMole]);

  const whackMole = useCallback((index: number) => {
    if (!isPlaying || index !== activeMole) return;

    setScore(s => s + 1);
    setActiveMole(null);
    
    // Increase difficulty
    setDifficulty(d => Math.max(400, d - 20));
    
    // Clear existing timeout and show new mole
    if (moleTimeoutRef.current) {
      clearTimeout(moleTimeoutRef.current);
    }
    
    setTimeout(showNewMole, 200);
  }, [isPlaying, activeMole, showNewMole]);

  // Game timer
  useEffect(() => {
    if (!isPlaying) return;

    gameIntervalRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          setIsPlaying(false);
          setActiveMole(null);
          if (score > highScore) setHighScore(score);
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => {
      if (gameIntervalRef.current) clearInterval(gameIntervalRef.current);
    };
  }, [isPlaying, score, highScore]);

  // Mole spawner
  useEffect(() => {
    if (!isPlaying) return;

    const spawnInterval = setInterval(() => {
      if (activeMole === null) {
        showNewMole();
      }
    }, difficulty);

    return () => clearInterval(spawnInterval);
  }, [isPlaying, activeMole, difficulty, showNewMole]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (moleTimeoutRef.current) clearTimeout(moleTimeoutRef.current);
      if (gameIntervalRef.current) clearInterval(gameIntervalRef.current);
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-full p-4">
      {/* Score & Timer */}
      <div className="flex gap-8 mb-4">
        <div className="text-center">
          <span className="text-muted-foreground text-sm">Score</span>
          <span className="text-3xl font-bold block">{score}</span>
        </div>
        <div className="text-center">
          <span className="text-muted-foreground text-sm">Time</span>
          <span className={`text-3xl font-bold block ${timeLeft <= 5 ? 'text-red-500' : ''}`}>
            {timeLeft}s
          </span>
        </div>
        <div className="text-center">
          <span className="text-muted-foreground text-sm">Best</span>
          <span className="text-3xl font-bold block text-yellow-400">{highScore}</span>
        </div>
      </div>

      {/* Status */}
      <div className="mb-4 h-8">
        {!isPlaying && timeLeft === 0 ? (
          <Badge variant="secondary">Game Over! Score: {score}</Badge>
        ) : isPlaying ? (
          <Badge variant="default">Whack the moles!</Badge>
        ) : (
          <Badge variant="secondary">Press Start to play</Badge>
        )}
      </div>

      {/* Game Grid */}
      <div className="grid grid-cols-3 gap-4 mb-6 p-4 bg-green-800 rounded-xl">
        {Array(GRID_SIZE).fill(null).map((_, index) => (
          <motion.button
            key={index}
            whileTap={{ scale: 0.9 }}
            onClick={() => whackMole(index)}
            className="w-20 h-20 bg-green-900 rounded-full relative overflow-hidden border-4 border-green-950"
            disabled={!isPlaying}
          >
            {/* Hole */}
            <div className="absolute inset-2 bg-brown-800 rounded-full bg-gradient-to-b from-amber-950 to-amber-900" />
            
            {/* Mole */}
            <AnimatePresence>
              {activeMole === index && (
                <motion.div
                  initial={{ y: 60 }}
                  animate={{ y: 10 }}
                  exit={{ y: 60 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  className="absolute inset-0 flex items-end justify-center"
                >
                  <div className="w-14 h-14 bg-amber-700 rounded-full relative">
                    {/* Face */}
                    <div className="absolute top-2 left-2 w-3 h-3 bg-black rounded-full" />
                    <div className="absolute top-2 right-2 w-3 h-3 bg-black rounded-full" />
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 w-4 h-2 bg-pink-400 rounded-full" />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        ))}
      </div>

      {/* Controls */}
      <div className="flex gap-2">
        {!isPlaying ? (
          <Button onClick={startGame} variant="default">
            <Play className="w-4 h-4 mr-2" />
            {timeLeft === 0 ? 'Play Again' : 'Start Game'}
          </Button>
        ) : (
          <Button onClick={() => setIsPlaying(false)} variant="outline">
            <RotateCcw className="w-4 h-4 mr-2" />
            Stop
          </Button>
        )}
      </div>
    </div>
  );
}
