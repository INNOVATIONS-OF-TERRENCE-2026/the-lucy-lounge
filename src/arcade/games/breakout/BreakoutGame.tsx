/**
 * Lucy Arcade — Breakout
 * Classic brick-breaking game
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, Pause, RotateCcw } from 'lucide-react';

const CANVAS_WIDTH = 600;
const CANVAS_HEIGHT = 400;
const PADDLE_WIDTH = 100;
const PADDLE_HEIGHT = 12;
const BALL_SIZE = 10;
const BRICK_ROWS = 5;
const BRICK_COLS = 10;
const BRICK_WIDTH = 54;
const BRICK_HEIGHT = 20;
const BRICK_GAP = 4;

type Brick = { x: number; y: number; color: string; alive: boolean };

const BRICK_COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6'];

function createBricks(): Brick[] {
  const bricks: Brick[] = [];
  const startX = (CANVAS_WIDTH - (BRICK_COLS * (BRICK_WIDTH + BRICK_GAP) - BRICK_GAP)) / 2;
  
  for (let row = 0; row < BRICK_ROWS; row++) {
    for (let col = 0; col < BRICK_COLS; col++) {
      bricks.push({
        x: startX + col * (BRICK_WIDTH + BRICK_GAP),
        y: 40 + row * (BRICK_HEIGHT + BRICK_GAP),
        color: BRICK_COLORS[row],
        alive: true,
      });
    }
  }
  return bricks;
}

export default function BreakoutGame() {
  const [paddleX, setPaddleX] = useState(CANVAS_WIDTH / 2 - PADDLE_WIDTH / 2);
  const [ballX, setBallX] = useState(CANVAS_WIDTH / 2);
  const [ballY, setBallY] = useState(CANVAS_HEIGHT - 60);
  const [ballVelX, setBallVelX] = useState(4);
  const [ballVelY, setBallVelY] = useState(-4);
  const [bricks, setBricks] = useState<Brick[]>(createBricks);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);

  const keysPressed = useRef<Set<string>>(new Set());

  const resetBall = useCallback(() => {
    setBallX(CANVAS_WIDTH / 2);
    setBallY(CANVAS_HEIGHT - 60);
    setBallVelX(4 * (Math.random() > 0.5 ? 1 : -1));
    setBallVelY(-4);
    setIsPlaying(false);
  }, []);

  const resetGame = useCallback(() => {
    setPaddleX(CANVAS_WIDTH / 2 - PADDLE_WIDTH / 2);
    setBricks(createBricks());
    setScore(0);
    setLives(3);
    setGameOver(false);
    setWon(false);
    resetBall();
  }, [resetBall]);

  // Game loop
  useEffect(() => {
    if (!isPlaying || gameOver) return;

    const gameLoop = setInterval(() => {
      // Move paddle
      if (keysPressed.current.has('a') || keysPressed.current.has('ArrowLeft')) {
        setPaddleX(x => Math.max(0, x - 8));
      }
      if (keysPressed.current.has('d') || keysPressed.current.has('ArrowRight')) {
        setPaddleX(x => Math.min(CANVAS_WIDTH - PADDLE_WIDTH, x + 8));
      }

      // Move ball
      setBallX(x => {
        let newX = x + ballVelX;
        if (newX <= 0 || newX >= CANVAS_WIDTH - BALL_SIZE) {
          setBallVelX(v => -v);
          newX = Math.max(0, Math.min(CANVAS_WIDTH - BALL_SIZE, newX));
        }
        return newX;
      });

      setBallY(y => {
        let newY = y + ballVelY;
        
        // Top wall
        if (newY <= 0) {
          setBallVelY(v => Math.abs(v));
          return 0;
        }
        
        // Bottom - lose life
        if (newY >= CANVAS_HEIGHT - BALL_SIZE) {
          setLives(l => {
            const newLives = l - 1;
            if (newLives <= 0) {
              setGameOver(true);
              setIsPlaying(false);
            } else {
              resetBall();
            }
            return newLives;
          });
          return CANVAS_HEIGHT - 60;
        }
        
        return newY;
      });

      // Paddle collision
      setBallY(y => {
        const paddleTop = CANVAS_HEIGHT - 30 - PADDLE_HEIGHT;
        if (y + BALL_SIZE >= paddleTop && y + BALL_SIZE <= paddleTop + PADDLE_HEIGHT) {
          if (ballX + BALL_SIZE >= paddleX && ballX <= paddleX + PADDLE_WIDTH) {
            setBallVelY(v => -Math.abs(v));
            // Add angle based on where ball hits paddle
            const hitPos = (ballX + BALL_SIZE / 2 - paddleX) / PADDLE_WIDTH;
            setBallVelX((hitPos - 0.5) * 8);
            return paddleTop - BALL_SIZE;
          }
        }
        return y;
      });

      // Brick collision
      setBricks(currentBricks => {
        let updated = false;
        const newBricks = currentBricks.map(brick => {
          if (!brick.alive) return brick;
          
          if (
            ballX + BALL_SIZE >= brick.x &&
            ballX <= brick.x + BRICK_WIDTH &&
            ballY + BALL_SIZE >= brick.y &&
            ballY <= brick.y + BRICK_HEIGHT
          ) {
            updated = true;
            setBallVelY(v => -v);
            setScore(s => s + 10);
            return { ...brick, alive: false };
          }
          return brick;
        });

        // Check win
        if (updated && newBricks.every(b => !b.alive)) {
          setWon(true);
          setGameOver(true);
          setIsPlaying(false);
        }

        return updated ? newBricks : currentBricks;
      });
    }, 16);

    return () => clearInterval(gameLoop);
  }, [isPlaying, gameOver, ballVelX, ballVelY, paddleX, ballX, resetBall]);

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
      {/* Score & Lives */}
      <div className="flex gap-8 mb-4">
        <div className="text-center">
          <span className="text-muted-foreground text-sm">Score</span>
          <span className="text-3xl font-bold block">{score}</span>
        </div>
        <div className="text-center">
          <span className="text-muted-foreground text-sm">Lives</span>
          <span className="text-3xl font-bold block text-red-400">{'❤️'.repeat(lives)}</span>
        </div>
      </div>

      {/* Status */}
      <div className="mb-4 h-8">
        {gameOver ? (
          <Badge variant={won ? 'default' : 'destructive'}>
            {won ? 'You Win!' : 'Game Over!'}
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
        {/* Bricks */}
        {bricks.filter(b => b.alive).map((brick, i) => (
          <motion.div
            key={i}
            initial={{ scale: 1 }}
            className="absolute rounded"
            style={{
              width: BRICK_WIDTH,
              height: BRICK_HEIGHT,
              left: brick.x,
              top: brick.y,
              backgroundColor: brick.color,
            }}
          />
        ))}

        {/* Paddle */}
        <motion.div
          className="absolute bg-white rounded"
          style={{
            width: PADDLE_WIDTH,
            height: PADDLE_HEIGHT,
            left: paddleX,
            bottom: 30,
          }}
        />

        {/* Ball */}
        <motion.div
          className="absolute bg-yellow-400 rounded-full"
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
        Use A/D or Arrow keys to move
      </p>
    </div>
  );
}
