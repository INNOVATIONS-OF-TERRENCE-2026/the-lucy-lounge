/**
 * Lucy Arcade — 2048
 * Slide and merge tiles to reach 2048
 */

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RotateCcw } from 'lucide-react';

const GRID_SIZE = 4;

type Grid = (number | null)[][];

const TILE_COLORS: Record<number, string> = {
  2: 'bg-amber-100 text-amber-900',
  4: 'bg-amber-200 text-amber-900',
  8: 'bg-orange-300 text-white',
  16: 'bg-orange-400 text-white',
  32: 'bg-orange-500 text-white',
  64: 'bg-red-400 text-white',
  128: 'bg-yellow-300 text-yellow-900',
  256: 'bg-yellow-400 text-yellow-900',
  512: 'bg-yellow-500 text-white',
  1024: 'bg-yellow-600 text-white',
  2048: 'bg-yellow-500 text-white ring-4 ring-yellow-300',
};

function createEmptyGrid(): Grid {
  return Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(null));
}

function addRandomTile(grid: Grid): Grid {
  const empty: [number, number][] = [];
  grid.forEach((row, y) => {
    row.forEach((cell, x) => {
      if (cell === null) empty.push([y, x]);
    });
  });

  if (empty.length === 0) return grid;

  const [y, x] = empty[Math.floor(Math.random() * empty.length)];
  const newGrid = grid.map(row => [...row]);
  newGrid[y][x] = Math.random() < 0.9 ? 2 : 4;
  return newGrid;
}

function rotateGrid(grid: Grid): Grid {
  const newGrid = createEmptyGrid();
  for (let y = 0; y < GRID_SIZE; y++) {
    for (let x = 0; x < GRID_SIZE; x++) {
      newGrid[x][GRID_SIZE - 1 - y] = grid[y][x];
    }
  }
  return newGrid;
}

function slideLeft(grid: Grid): { grid: Grid; score: number; moved: boolean } {
  let score = 0;
  let moved = false;
  const newGrid = grid.map(row => {
    // Remove nulls
    const filtered = row.filter(cell => cell !== null) as number[];
    
    // Merge
    const merged: number[] = [];
    let i = 0;
    while (i < filtered.length) {
      if (i + 1 < filtered.length && filtered[i] === filtered[i + 1]) {
        const newValue = filtered[i] * 2;
        merged.push(newValue);
        score += newValue;
        i += 2;
      } else {
        merged.push(filtered[i]);
        i++;
      }
    }

    // Pad with nulls
    while (merged.length < GRID_SIZE) {
      merged.push(null as any);
    }

    // Check if moved
    if (JSON.stringify(merged) !== JSON.stringify(row)) {
      moved = true;
    }

    return merged;
  });

  return { grid: newGrid, score, moved };
}

function canMove(grid: Grid): boolean {
  // Check for empty cells
  for (let y = 0; y < GRID_SIZE; y++) {
    for (let x = 0; x < GRID_SIZE; x++) {
      if (grid[y][x] === null) return true;
    }
  }

  // Check for mergeable adjacent cells
  for (let y = 0; y < GRID_SIZE; y++) {
    for (let x = 0; x < GRID_SIZE; x++) {
      const cell = grid[y][x];
      if (x + 1 < GRID_SIZE && grid[y][x + 1] === cell) return true;
      if (y + 1 < GRID_SIZE && grid[y + 1][x] === cell) return true;
    }
  }

  return false;
}

export default function Game2048() {
  const [grid, setGrid] = useState<Grid>(() => {
    let g = createEmptyGrid();
    g = addRandomTile(g);
    g = addRandomTile(g);
    return g;
  });
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);

  const move = useCallback((direction: 'up' | 'down' | 'left' | 'right') => {
    if (gameOver) return;

    let rotations = 0;
    switch (direction) {
      case 'up': rotations = 1; break;
      case 'right': rotations = 2; break;
      case 'down': rotations = 3; break;
      default: rotations = 0;
    }

    let currentGrid = grid;
    for (let i = 0; i < rotations; i++) {
      currentGrid = rotateGrid(currentGrid);
    }

    const result = slideLeft(currentGrid);

    if (!result.moved) return;

    for (let i = 0; i < (4 - rotations) % 4; i++) {
      result.grid = rotateGrid(result.grid);
    }

    const newGrid = addRandomTile(result.grid);
    setGrid(newGrid);
    setScore(s => {
      const newScore = s + result.score;
      if (newScore > bestScore) setBestScore(newScore);
      return newScore;
    });

    // Check for 2048
    if (newGrid.some(row => row.some(cell => cell === 2048))) {
      setWon(true);
    }

    // Check game over
    if (!canMove(newGrid)) {
      setGameOver(true);
    }
  }, [grid, gameOver, bestScore]);

  const resetGame = useCallback(() => {
    let g = createEmptyGrid();
    g = addRandomTile(g);
    g = addRandomTile(g);
    setGrid(g);
    setScore(0);
    setGameOver(false);
    setWon(false);
  }, []);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowUp':
        case 'w':
          e.preventDefault();
          move('up');
          break;
        case 'ArrowDown':
        case 's':
          e.preventDefault();
          move('down');
          break;
        case 'ArrowLeft':
        case 'a':
          e.preventDefault();
          move('left');
          break;
        case 'ArrowRight':
        case 'd':
          e.preventDefault();
          move('right');
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [move]);

  return (
    <div className="flex flex-col items-center justify-center h-full p-4">
      {/* Score */}
      <div className="flex gap-8 mb-4">
        <div className="text-center bg-amber-100 dark:bg-amber-900/30 px-4 py-2 rounded-lg">
          <span className="text-amber-700 dark:text-amber-300 text-sm">Score</span>
          <span className="text-2xl font-bold block">{score}</span>
        </div>
        <div className="text-center bg-amber-100 dark:bg-amber-900/30 px-4 py-2 rounded-lg">
          <span className="text-amber-700 dark:text-amber-300 text-sm">Best</span>
          <span className="text-2xl font-bold block">{bestScore}</span>
        </div>
      </div>

      {/* Status */}
      <div className="mb-4 h-8">
        {gameOver ? (
          <Badge variant="destructive">Game Over!</Badge>
        ) : won ? (
          <Badge variant="default">You reached 2048! 🎉</Badge>
        ) : (
          <Badge variant="secondary">Use arrow keys to move</Badge>
        )}
      </div>

      {/* Grid */}
      <div className="bg-amber-200 dark:bg-amber-900/50 p-2 rounded-lg">
        <div className="grid grid-cols-4 gap-2">
          {grid.map((row, y) =>
            row.map((cell, x) => (
              <div
                key={`${y}-${x}`}
                className="w-16 h-16 bg-amber-100/50 dark:bg-amber-800/30 rounded flex items-center justify-center"
              >
                <AnimatePresence mode="popLayout">
                  {cell && (
                    <motion.div
                      key={`${y}-${x}-${cell}`}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className={`w-14 h-14 rounded flex items-center justify-center font-bold text-lg ${
                        TILE_COLORS[cell] || 'bg-amber-600 text-white'
                      }`}
                    >
                      {cell}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Reset */}
      <Button onClick={resetGame} variant="outline" className="mt-4">
        <RotateCcw className="w-4 h-4 mr-2" />
        New Game
      </Button>
    </div>
  );
}
