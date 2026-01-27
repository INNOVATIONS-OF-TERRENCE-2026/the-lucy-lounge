/**
 * Lucy Arcade — Pong
 * Classic pong game with AI opponent
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, Pause, RotateCcw, Bot, User } from 'lucide-react';

const CANVAS_WIDTH = 600;
const CANVAS_HEIGHT = 400;
const PADDLE_WIDTH = 10;
const PADDLE_HEIGHT = 80;
const BALL_SIZE = 12;
const PADDLE_SPEED = 8;
const BALL_SPEED = 5;
const WINNING_SCORE = 5;

export default function PongGame() {
  const [playerY, setPlayerY] = useState(CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2);
  const [aiY, setAiY] = useState(CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2);
  const [ballX, setBallX] = useState(CANVAS_WIDTH / 2);
  const [ballY, setBallY] = useState(CANVAS_HEIGHT / 2);
  const [ballVelX, setBallVelX] = useState(BALL_SPEED);
  const [ballVelY, setBallVelY] = useState(BALL_SPEED * (Math.random() > 0.5 ? 1 : -1));
  const [playerScore, setPlayerScore] = useState(0);
  const [aiScore, setAiScore] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState<'player' | 'ai' | null>(null);

  const keysPressed = useRef<Set<string>>(new Set());

  const resetBall = useCallback((direction: number) => {
    setBallX(CANVAS_WIDTH / 2);
    setBallY(CANVAS_HEIGHT / 2);
    setBallVelX(BALL_SPEED * direction);
    setBallVelY(BALL_SPEED * (Math.random() > 0.5 ? 1 : -1));
  }, []);

  const resetGame = useCallback(() => {
    setPlayerY(CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2);
    setAiY(CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2);
    resetBall(1);
    setPlayerScore(0);
    setAiScore(0);
    setIsPlaying(false);
    setGameOver(false);
    setWinner(null);
  }, [resetBall]);

  // Game loop
  useEffect(() => {
    if (!isPlaying || gameOver) return;

    const gameLoop = setInterval(() => {
      // Move player paddle
      if (keysPressed.current.has('w') || keysPressed.current.has('ArrowUp')) {
        setPlayerY(y => Math.max(0, y - PADDLE_SPEED));
      }
      if (keysPressed.current.has('s') || keysPressed.current.has('ArrowDown')) {
        setPlayerY(y => Math.min(CANVAS_HEIGHT - PADDLE_HEIGHT, y + PADDLE_SPEED));
      }

      // Move AI paddle (simple tracking)
      setAiY(y => {
        const paddleCenter = y + PADDLE_HEIGHT / 2;
        const diff = ballY - paddleCenter;
        const aiSpeed = PADDLE_SPEED * 0.7; // AI is slightly slower
        if (Math.abs(diff) > 10) {
          return Math.max(0, Math.min(CANVAS_HEIGHT - PADDLE_HEIGHT, y + (diff > 0 ? aiSpeed : -aiSpeed)));
        }
        return y;
      });

      // Move ball
      setBallX(x => x + ballVelX);
      setBallY(y => {
        let newY = y + ballVelY;
        // Bounce off top/bottom
        if (newY <= 0 || newY >= CANVAS_HEIGHT - BALL_SIZE) {
          setBallVelY(v => -v);
          newY = Math.max(0, Math.min(CANVAS_HEIGHT - BALL_SIZE, newY));
        }
        return newY;
      });

      // Check paddle collisions
      setBallX(x => {
        // Player paddle collision
        if (x <= 30 + PADDLE_WIDTH && x >= 30) {
          if (ballY + BALL_SIZE >= playerY && ballY <= playerY + PADDLE_HEIGHT) {
            setBallVelX(v => Math.abs(v) * 1.05); // Speed up slightly
            return 30 + PADDLE_WIDTH;
          }
        }

        // AI paddle collision
        if (x >= CANVAS_WIDTH - 30 - PADDLE_WIDTH - BALL_SIZE && x <= CANVAS_WIDTH - 30 - BALL_SIZE) {
          if (ballY + BALL_SIZE >= aiY && ballY <= aiY + PADDLE_HEIGHT) {
            setBallVelX(v => -Math.abs(v) * 1.05);
            return CANVAS_WIDTH - 30 - PADDLE_WIDTH - BALL_SIZE;
          }
        }

        // Score
        if (x <= 0) {
          setAiScore(s => {
            const newScore = s + 1;
            if (newScore >= WINNING_SCORE) {
              setGameOver(true);
              setWinner('ai');
              setIsPlaying(false);
            }
            return newScore;
          });
          resetBall(1);
          return CANVAS_WIDTH / 2;
        }

        if (x >= CANVAS_WIDTH - BALL_SIZE) {
          setPlayerScore(s => {
            const newScore = s + 1;
            if (newScore >= WINNING_SCORE) {
              setGameOver(true);
              setWinner('player');
              setIsPlaying(false);
            }
            return newScore;
          });
          resetBall(-1);
          return CANVAS_WIDTH / 2;
        }

        return x;
      });
    }, 16);

    return () => clearInterval(gameLoop);
  }, [isPlaying, gameOver, ballVelX, ballVelY, playerY, aiY, ballY, resetBall]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysPressed.current.add(e.key);
      if (e.key === ' ' && !gameOver) {
        setIsPlaying(p => !p);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed.current.delete(e.key);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameOver]);

  return (
    <div className="flex flex-col items-center justify-center h-full p-4">
      {/* Score */}
      <div className="flex gap-12 mb-4">
        <div className="text-center">
          <div className="flex items-center gap-2 text-blue-400">
            <User className="w-4 h-4" />
            <span className="font-bold">You</span>
          </div>
          <span className="text-4xl font-bold">{playerScore}</span>
        </div>
        <div className="text-center">
          <div className="flex items-center gap-2 text-red-400">
            <Bot className="w-4 h-4" />
            <span className="font-bold">AI</span>
          </div>
          <span className="text-4xl font-bold">{aiScore}</span>
        </div>
      </div>

      {/* Status */}
      <div className="mb-4 h-8">
        {gameOver ? (
          <Badge variant={winner === 'player' ? 'default' : 'destructive'}>
            {winner === 'player' ? 'You Win!' : 'AI Wins!'}
          </Badge>
        ) : (
          <Badge variant={isPlaying ? 'default' : 'secondary'}>
            {isPlaying ? 'Playing' : 'Press Space to Start'}
          </Badge>
        )}
      </div>

      {/* Game Canvas */}
      <div 
        className="relative bg-gray-900 border-2 border-gray-700 rounded-lg overflow-hidden"
        style={{ width: CANVAS_WIDTH, height: CANVAS_HEIGHT }}
      >
        {/* Center line */}
        <div className="absolute left-1/2 top-0 bottom-0 w-0.5 border-l-2 border-dashed border-gray-600" />

        {/* Player paddle */}
        <motion.div
          className="absolute bg-blue-500 rounded"
          style={{
            width: PADDLE_WIDTH,
            height: PADDLE_HEIGHT,
            left: 30,
            top: playerY,
          }}
        />

        {/* AI paddle */}
        <motion.div
          className="absolute bg-red-500 rounded"
          style={{
            width: PADDLE_WIDTH,
            height: PADDLE_HEIGHT,
            right: 30,
            top: aiY,
          }}
        />

        {/* Ball */}
        <motion.div
          className="absolute bg-white rounded-full"
          style={{
            width: BALL_SIZE,
            height: BALL_SIZE,
            left: ballX,
            top: ballY,
          }}
        />
      </div>

      {/* Controls */}
      <div className="flex gap-2 mt-4">
        <Button 
          onClick={() => !gameOver && setIsPlaying(p => !p)} 
          variant="outline"
          disabled={gameOver}
        >
          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
        </Button>
        <Button onClick={resetGame} variant="outline">
          <RotateCcw className="w-4 h-4" />
        </Button>
      </div>

      <p className="text-xs text-muted-foreground mt-4">
        Use W/S or Arrow keys to move • First to {WINNING_SCORE} wins
      </p>
    </div>
  );
}
