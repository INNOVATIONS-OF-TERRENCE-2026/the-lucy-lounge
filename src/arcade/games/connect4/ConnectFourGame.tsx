/**
 * Lucy Arcade — Connect Four
 * Drop discs to connect four in a row
 */

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RotateCcw, Bot, User } from 'lucide-react';

type Player = 'red' | 'yellow' | null;
type Board = Player[][];

const ROWS = 6;
const COLS = 7;

function createEmptyBoard(): Board {
  return Array(ROWS).fill(null).map(() => Array(COLS).fill(null));
}

function checkWinner(board: Board): Player {
  // Check horizontal
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS - 3; c++) {
      const cell = board[r][c];
      if (cell && cell === board[r][c+1] && cell === board[r][c+2] && cell === board[r][c+3]) {
        return cell;
      }
    }
  }
  
  // Check vertical
  for (let r = 0; r < ROWS - 3; r++) {
    for (let c = 0; c < COLS; c++) {
      const cell = board[r][c];
      if (cell && cell === board[r+1][c] && cell === board[r+2][c] && cell === board[r+3][c]) {
        return cell;
      }
    }
  }
  
  // Check diagonal (down-right)
  for (let r = 0; r < ROWS - 3; r++) {
    for (let c = 0; c < COLS - 3; c++) {
      const cell = board[r][c];
      if (cell && cell === board[r+1][c+1] && cell === board[r+2][c+2] && cell === board[r+3][c+3]) {
        return cell;
      }
    }
  }
  
  // Check diagonal (down-left)
  for (let r = 0; r < ROWS - 3; r++) {
    for (let c = 3; c < COLS; c++) {
      const cell = board[r][c];
      if (cell && cell === board[r+1][c-1] && cell === board[r+2][c-2] && cell === board[r+3][c-3]) {
        return cell;
      }
    }
  }
  
  return null;
}

function getLowestEmptyRow(board: Board, col: number): number {
  for (let r = ROWS - 1; r >= 0; r--) {
    if (board[r][col] === null) return r;
  }
  return -1;
}

function getAIMove(board: Board): number {
  // Try to win
  for (let c = 0; c < COLS; c++) {
    const row = getLowestEmptyRow(board, c);
    if (row === -1) continue;
    const testBoard = board.map(r => [...r]);
    testBoard[row][c] = 'yellow';
    if (checkWinner(testBoard) === 'yellow') return c;
  }
  
  // Block player
  for (let c = 0; c < COLS; c++) {
    const row = getLowestEmptyRow(board, c);
    if (row === -1) continue;
    const testBoard = board.map(r => [...r]);
    testBoard[row][c] = 'red';
    if (checkWinner(testBoard) === 'red') return c;
  }
  
  // Prefer center
  if (getLowestEmptyRow(board, 3) !== -1) return 3;
  
  // Random valid column
  const validCols = [];
  for (let c = 0; c < COLS; c++) {
    if (getLowestEmptyRow(board, c) !== -1) validCols.push(c);
  }
  return validCols[Math.floor(Math.random() * validCols.length)];
}

export default function ConnectFourGame() {
  const [board, setBoard] = useState<Board>(createEmptyBoard());
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState<Player>(null);
  const [scores, setScores] = useState({ player: 0, ai: 0, draws: 0 });

  const dropDisc = useCallback((col: number) => {
    if (gameOver || !isPlayerTurn) return;
    
    const row = getLowestEmptyRow(board, col);
    if (row === -1) return;

    const newBoard = board.map(r => [...r]);
    newBoard[row][col] = 'red';
    setBoard(newBoard);

    const playerWinner = checkWinner(newBoard);
    if (playerWinner) {
      setWinner(playerWinner);
      setGameOver(true);
      setScores(s => ({ ...s, player: s.player + 1 }));
      return;
    }

    // Check for draw
    const isFull = newBoard[0].every(cell => cell !== null);
    if (isFull) {
      setGameOver(true);
      setScores(s => ({ ...s, draws: s.draws + 1 }));
      return;
    }

    setIsPlayerTurn(false);

    // AI move
    setTimeout(() => {
      const aiCol = getAIMove(newBoard);
      const aiRow = getLowestEmptyRow(newBoard, aiCol);
      if (aiRow !== -1) {
        newBoard[aiRow][aiCol] = 'yellow';
        setBoard([...newBoard.map(r => [...r])]);

        const aiWinner = checkWinner(newBoard);
        if (aiWinner) {
          setWinner(aiWinner);
          setGameOver(true);
          setScores(s => ({ ...s, ai: s.ai + 1 }));
          return;
        }

        const isFull = newBoard[0].every(cell => cell !== null);
        if (isFull) {
          setGameOver(true);
          setScores(s => ({ ...s, draws: s.draws + 1 }));
          return;
        }
      }
      setIsPlayerTurn(true);
    }, 500);
  }, [board, gameOver, isPlayerTurn]);

  const resetGame = () => {
    setBoard(createEmptyBoard());
    setIsPlayerTurn(true);
    setGameOver(false);
    setWinner(null);
  };

  return (
    <div className="flex flex-col items-center justify-center h-full p-4">
      {/* Score */}
      <div className="flex gap-6 mb-4">
        <div className="text-center">
          <div className="flex items-center gap-2 text-red-400">
            <User className="w-4 h-4" />
            <span className="font-bold">You</span>
          </div>
          <span className="text-2xl font-bold">{scores.player}</span>
        </div>
        <div className="text-center">
          <span className="text-muted-foreground">Draws</span>
          <span className="text-2xl font-bold block">{scores.draws}</span>
        </div>
        <div className="text-center">
          <div className="flex items-center gap-2 text-yellow-400">
            <Bot className="w-4 h-4" />
            <span className="font-bold">AI</span>
          </div>
          <span className="text-2xl font-bold">{scores.ai}</span>
        </div>
      </div>

      {/* Status */}
      <div className="mb-4 h-8">
        {gameOver ? (
          <Badge variant={winner === 'red' ? 'default' : winner === 'yellow' ? 'destructive' : 'secondary'}>
            {winner === 'red' ? 'You Win!' : winner === 'yellow' ? 'AI Wins!' : 'Draw!'}
          </Badge>
        ) : (
          <Badge variant={isPlayerTurn ? 'default' : 'secondary'}>
            {isPlayerTurn ? 'Your Turn' : 'AI Thinking...'}
          </Badge>
        )}
      </div>

      {/* Board */}
      <div className="bg-blue-600 p-2 rounded-lg">
        <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${COLS}, 1fr)` }}>
          {board.map((row, rowIndex) =>
            row.map((cell, colIndex) => (
              <motion.button
                key={`${rowIndex}-${colIndex}`}
                whileHover={{ scale: 1.05 }}
                onClick={() => dropDisc(colIndex)}
                className="w-10 h-10 rounded-full bg-blue-800 flex items-center justify-center"
                disabled={gameOver || !isPlayerTurn}
              >
                {cell && (
                  <motion.div
                    initial={{ y: -100 }}
                    animate={{ y: 0 }}
                    className={`w-8 h-8 rounded-full ${
                      cell === 'red' ? 'bg-red-500' : 'bg-yellow-400'
                    }`}
                  />
                )}
              </motion.button>
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
