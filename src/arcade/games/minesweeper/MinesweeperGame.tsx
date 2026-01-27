/**
 * Lucy Arcade — Minesweeper
 * Classic mine-clearing puzzle
 */

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RotateCcw, Flag, Bomb } from 'lucide-react';

const GRID_SIZE = 10;
const MINE_COUNT = 15;

type Cell = {
  isMine: boolean;
  isRevealed: boolean;
  isFlagged: boolean;
  adjacentMines: number;
};

function createBoard(): Cell[][] {
  // Create empty board
  const board: Cell[][] = Array(GRID_SIZE).fill(null).map(() =>
    Array(GRID_SIZE).fill(null).map(() => ({
      isMine: false,
      isRevealed: false,
      isFlagged: false,
      adjacentMines: 0,
    }))
  );

  // Place mines
  let minesPlaced = 0;
  while (minesPlaced < MINE_COUNT) {
    const x = Math.floor(Math.random() * GRID_SIZE);
    const y = Math.floor(Math.random() * GRID_SIZE);
    if (!board[y][x].isMine) {
      board[y][x].isMine = true;
      minesPlaced++;
    }
  }

  // Calculate adjacent mines
  for (let y = 0; y < GRID_SIZE; y++) {
    for (let x = 0; x < GRID_SIZE; x++) {
      if (!board[y][x].isMine) {
        let count = 0;
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            const ny = y + dy;
            const nx = x + dx;
            if (ny >= 0 && ny < GRID_SIZE && nx >= 0 && nx < GRID_SIZE) {
              if (board[ny][nx].isMine) count++;
            }
          }
        }
        board[y][x].adjacentMines = count;
      }
    }
  }

  return board;
}

export default function MinesweeperGame() {
  const [board, setBoard] = useState<Cell[][]>(createBoard);
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);
  const [flagsUsed, setFlagsUsed] = useState(0);

  const revealCell = useCallback((y: number, x: number, currentBoard: Cell[][]) => {
    if (y < 0 || y >= GRID_SIZE || x < 0 || x >= GRID_SIZE) return;
    if (currentBoard[y][x].isRevealed || currentBoard[y][x].isFlagged) return;

    currentBoard[y][x].isRevealed = true;

    if (currentBoard[y][x].adjacentMines === 0 && !currentBoard[y][x].isMine) {
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          revealCell(y + dy, x + dx, currentBoard);
        }
      }
    }
  }, []);

  const handleClick = useCallback((y: number, x: number) => {
    if (gameOver || board[y][x].isRevealed || board[y][x].isFlagged) return;

    const newBoard = board.map(row => row.map(cell => ({ ...cell })));

    if (newBoard[y][x].isMine) {
      // Game over - reveal all mines
      newBoard.forEach(row => row.forEach(cell => {
        if (cell.isMine) cell.isRevealed = true;
      }));
      setBoard(newBoard);
      setGameOver(true);
      return;
    }

    revealCell(y, x, newBoard);
    setBoard(newBoard);

    // Check win
    const allNonMinesRevealed = newBoard.every(row =>
      row.every(cell => cell.isMine || cell.isRevealed)
    );
    if (allNonMinesRevealed) {
      setWon(true);
      setGameOver(true);
    }
  }, [board, gameOver, revealCell]);

  const handleRightClick = useCallback((e: React.MouseEvent, y: number, x: number) => {
    e.preventDefault();
    if (gameOver || board[y][x].isRevealed) return;

    const newBoard = board.map(row => row.map(cell => ({ ...cell })));
    newBoard[y][x].isFlagged = !newBoard[y][x].isFlagged;
    setBoard(newBoard);
    setFlagsUsed(prev => newBoard[y][x].isFlagged ? prev + 1 : prev - 1);
  }, [board, gameOver]);

  const resetGame = () => {
    setBoard(createBoard());
    setGameOver(false);
    setWon(false);
    setFlagsUsed(0);
  };

  const getCellContent = (cell: Cell) => {
    if (cell.isFlagged) return <Flag className="w-4 h-4 text-red-500" />;
    if (!cell.isRevealed) return null;
    if (cell.isMine) return <Bomb className="w-4 h-4 text-black" />;
    if (cell.adjacentMines === 0) return null;
    
    const colors = ['', 'text-blue-500', 'text-green-500', 'text-red-500', 'text-purple-500', 'text-yellow-600', 'text-cyan-500', 'text-gray-700', 'text-gray-500'];
    return <span className={`font-bold ${colors[cell.adjacentMines]}`}>{cell.adjacentMines}</span>;
  };

  return (
    <div className="flex flex-col items-center justify-center h-full p-4">
      {/* Info */}
      <div className="flex gap-8 mb-4">
        <div className="text-center">
          <span className="text-muted-foreground text-sm">Mines</span>
          <span className="text-2xl font-bold block">{MINE_COUNT}</span>
        </div>
        <div className="text-center">
          <span className="text-muted-foreground text-sm">Flags</span>
          <span className="text-2xl font-bold block">{flagsUsed}/{MINE_COUNT}</span>
        </div>
      </div>

      {/* Status */}
      <div className="mb-4 h-8">
        {gameOver ? (
          <Badge variant={won ? 'default' : 'destructive'}>
            {won ? 'You Win!' : 'Game Over!'}
          </Badge>
        ) : (
          <Badge variant="secondary">Click to reveal • Right-click to flag</Badge>
        )}
      </div>

      {/* Board */}
      <div className="grid gap-0.5 bg-gray-700 p-1 rounded">
        {board.map((row, y) => (
          <div key={y} className="flex gap-0.5">
            {row.map((cell, x) => (
              <motion.button
                key={`${y}-${x}`}
                whileHover={{ scale: cell.isRevealed ? 1 : 1.05 }}
                onClick={() => handleClick(y, x)}
                onContextMenu={(e) => handleRightClick(e, y, x)}
                className={`w-8 h-8 flex items-center justify-center text-sm rounded ${
                  cell.isRevealed
                    ? cell.isMine
                      ? 'bg-red-500'
                      : 'bg-gray-300'
                    : 'bg-gray-500 hover:bg-gray-400'
                }`}
              >
                {getCellContent(cell)}
              </motion.button>
            ))}
          </div>
        ))}
      </div>

      {/* Reset */}
      <Button onClick={resetGame} variant="outline" className="mt-4">
        <RotateCcw className="w-4 h-4 mr-2" />
        New Game
      </Button>
    </div>
  );
}
