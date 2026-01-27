/**
 * Lucy Arcade — Simon Says
 * Memory pattern game
 */

import { useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, RotateCcw } from 'lucide-react';

const COLORS = ['red', 'blue', 'green', 'yellow'];
const COLOR_CLASSES = {
  red: { base: 'bg-red-600', active: 'bg-red-400', ring: 'ring-red-400' },
  blue: { base: 'bg-blue-600', active: 'bg-blue-400', ring: 'ring-blue-400' },
  green: { base: 'bg-green-600', active: 'bg-green-400', ring: 'ring-green-400' },
  yellow: { base: 'bg-yellow-500', active: 'bg-yellow-300', ring: 'ring-yellow-300' },
};

export default function SimonGame() {
  const [sequence, setSequence] = useState<string[]>([]);
  const [playerSequence, setPlayerSequence] = useState<string[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isShowingSequence, setIsShowingSequence] = useState(false);
  const [activeColor, setActiveColor] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  const playSound = useCallback((color: string) => {
    // Visual feedback only for now
    setActiveColor(color);
    setTimeout(() => setActiveColor(null), 300);
  }, []);

  const showSequence = useCallback(async () => {
    setIsShowingSequence(true);
    for (let i = 0; i < sequence.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 500));
      playSound(sequence[i]);
      await new Promise(resolve => setTimeout(resolve, 300));
    }
    setIsShowingSequence(false);
  }, [sequence, playSound]);

  const addToSequence = useCallback(() => {
    const newColor = COLORS[Math.floor(Math.random() * COLORS.length)];
    setSequence(prev => [...prev, newColor]);
    setPlayerSequence([]);
  }, []);

  const startGame = useCallback(() => {
    setSequence([]);
    setPlayerSequence([]);
    setScore(0);
    setGameOver(false);
    setIsPlaying(true);
    // Add first color
    const firstColor = COLORS[Math.floor(Math.random() * COLORS.length)];
    setSequence([firstColor]);
  }, []);

  const handleColorClick = useCallback((color: string) => {
    if (!isPlaying || isShowingSequence || gameOver) return;

    playSound(color);
    const newPlayerSequence = [...playerSequence, color];
    setPlayerSequence(newPlayerSequence);

    // Check if correct
    const currentIndex = newPlayerSequence.length - 1;
    if (newPlayerSequence[currentIndex] !== sequence[currentIndex]) {
      // Wrong!
      setGameOver(true);
      setIsPlaying(false);
      if (score > highScore) setHighScore(score);
      return;
    }

    // Check if sequence complete
    if (newPlayerSequence.length === sequence.length) {
      setScore(s => s + 1);
      setTimeout(() => {
        addToSequence();
      }, 1000);
    }
  }, [isPlaying, isShowingSequence, gameOver, playerSequence, sequence, score, highScore, playSound, addToSequence]);

  // Show sequence when it changes
  useEffect(() => {
    if (sequence.length > 0 && isPlaying) {
      showSequence();
    }
  }, [sequence, isPlaying, showSequence]);

  return (
    <div className="flex flex-col items-center justify-center h-full p-4">
      {/* Score */}
      <div className="flex gap-8 mb-6">
        <div className="text-center">
          <span className="text-muted-foreground text-sm">Score</span>
          <span className="text-3xl font-bold block">{score}</span>
        </div>
        <div className="text-center">
          <span className="text-muted-foreground text-sm">High Score</span>
          <span className="text-3xl font-bold block text-yellow-400">{highScore}</span>
        </div>
      </div>

      {/* Status */}
      <div className="mb-6 h-8">
        {gameOver ? (
          <Badge variant="destructive">Game Over!</Badge>
        ) : isShowingSequence ? (
          <Badge variant="secondary">Watch the pattern...</Badge>
        ) : isPlaying ? (
          <Badge variant="default">Your turn! ({playerSequence.length}/{sequence.length})</Badge>
        ) : (
          <Badge variant="secondary">Press Start to play</Badge>
        )}
      </div>

      {/* Simon Board */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {COLORS.map(color => (
          <motion.button
            key={color}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleColorClick(color)}
            disabled={!isPlaying || isShowingSequence || gameOver}
            className={`w-32 h-32 rounded-2xl transition-all duration-150 ${
              activeColor === color
                ? `${COLOR_CLASSES[color as keyof typeof COLOR_CLASSES].active} ring-4 ${COLOR_CLASSES[color as keyof typeof COLOR_CLASSES].ring}`
                : COLOR_CLASSES[color as keyof typeof COLOR_CLASSES].base
            } ${!isPlaying || isShowingSequence ? 'opacity-60' : 'hover:brightness-110'}`}
          />
        ))}
      </div>

      {/* Controls */}
      <div className="flex gap-2">
        {!isPlaying || gameOver ? (
          <Button onClick={startGame} variant="default">
            <Play className="w-4 h-4 mr-2" />
            {gameOver ? 'Play Again' : 'Start Game'}
          </Button>
        ) : (
          <Button onClick={startGame} variant="outline">
            <RotateCcw className="w-4 h-4 mr-2" />
            Restart
          </Button>
        )}
      </div>
    </div>
  );
}
