/**
 * Lucy Arcade — Tic Tac Toe
 * Classic X and O game with AI opponent
 */

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RotateCcw, Bot, User } from 'lucide-react';

type Player = 'X' | 'O' | null;
type Board = Player[];

const WINNING_COMBINATIONS = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
  [0, 4, 8], [2, 4, 6], // Diagonals
];

function checkWinner(board: Board): Player {
  for (const [a, b, c] of WINNING_COMBINATIONS) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a];
    }
  }
  return null;
}

function getAIMove(board: Board): number {
  // Try to win
  for (const [a, b, c] of WINNING_COMBINATIONS) {
    if (board[a] === 'O' && board[b] === 'O' && board[c] === null) return c;
    if (board[a] === 'O' && board[c] === 'O' && board[b] === null) return b;
    if (board[b] === 'O' && board[c] === 'O' && board[a] === null) return a;
  }
  
  // Block player
  for (const [a, b, c] of WINNING_COMBINATIONS) {
    if (board[a] === 'X' && board[b] === 'X' && board[c] === null) return c;
    if (board[a] === 'X' && board[c] === 'X' && board[b] === null) return b;
    if (board[b] === 'X' && board[c] === 'X' && board[a] === null) return a;
  }
  
  // Take center
  if (board[4] === null) return 4;
  
  // Take corner
  const corners = [0, 2, 6, 8];
  const emptyCorners = corners.filter(i => board[i] === null);
  if (emptyCorners.length > 0) {
    return emptyCorners[Math.floor(Math.random() * emptyCorners.length)];
  }
  
  // Take any empty
  const empty = board.map((v, i) => v === null ? i : -1).filter(i => i !== -1);
  return empty[Math.floor(Math.random() * empty.length)];
}

export default function TicTacToeGame() {
  const [board, setBoard] = useState<Board>(Array(9).fill(null));
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState<Player>(null);
  const [scores, setScores] = useState({ player: 0, ai: 0, draws: 0 });

  const handleCellClick = useCallback((index: number) => {
    if (board[index] || gameOver || !isPlayerTurn) return;

    const newBoard = [...board];
    newBoard[index] = 'X';
    setBoard(newBoard);

    const playerWinner = checkWinner(newBoard);
    if (playerWinner) {
      setWinner(playerWinner);
      setGameOver(true);
      setScores(s => ({ ...s, player: s.player + 1 }));
      return;
    }

    if (!newBoard.includes(null)) {
      setGameOver(true);
      setScores(s => ({ ...s, draws: s.draws + 1 }));
      return;
    }

    setIsPlayerTurn(false);

    // AI move
    setTimeout(() => {
      const aiMove = getAIMove(newBoard);
      if (aiMove !== undefined) {
        newBoard[aiMove] = 'O';
        setBoard([...newBoard]);

        const aiWinner = checkWinner(newBoard);
        if (aiWinner) {
          setWinner(aiWinner);
          setGameOver(true);
          setScores(s => ({ ...s, ai: s.ai + 1 }));
          return;
        }

        if (!newBoard.includes(null)) {
          setGameOver(true);
          setScores(s => ({ ...s, draws: s.draws + 1 }));
          return;
        }
      }
      setIsPlayerTurn(true);
    }, 500);
  }, [board, gameOver, isPlayerTurn]);

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setIsPlayerTurn(true);
    setGameOver(false);
    setWinner(null);
  };

  return (
    <div className="flex flex-col items-center justify-center h-full p-4">
      {/* Score */}
      <div className="flex gap-6 mb-6">
        <div className="text-center">
          <div className="flex items-center gap-2 text-blue-400">
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
          <div className="flex items-center gap-2 text-red-400">
            <Bot className="w-4 h-4" />
            <span className="font-bold">AI</span>
          </div>
          <span className="text-2xl font-bold">{scores.ai}</span>
        </div>
      </div>

      {/* Status */}
      <div className="mb-4 h-8">
        {gameOver ? (
          <Badge variant={winner === 'X' ? 'default' : winner === 'O' ? 'destructive' : 'secondary'}>
            {winner === 'X' ? 'You Win!' : winner === 'O' ? 'AI Wins!' : 'Draw!'}
          </Badge>
        ) : (
          <Badge variant={isPlayerTurn ? 'default' : 'secondary'}>
            {isPlayerTurn ? 'Your Turn' : 'AI Thinking...'}
          </Badge>
        )}
      </div>

      {/* Board */}
      <div className="grid grid-cols-3 gap-2 mb-6">
        {board.map((cell, index) => (
          <motion.button
            key={index}
            whileHover={{ scale: cell ? 1 : 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleCellClick(index)}
            className={`w-20 h-20 rounded-lg text-4xl font-bold flex items-center justify-center transition-colors ${
              cell
                ? cell === 'X'
                  ? 'bg-blue-500/20 text-blue-400'
                  : 'bg-red-500/20 text-red-400'
                : 'bg-muted/50 hover:bg-muted'
            }`}
            disabled={!!cell || gameOver || !isPlayerTurn}
          >
            {cell}
          </motion.button>
        ))}
      </div>

      {/* Reset */}
      <Button onClick={resetGame} variant="outline">
        <RotateCcw className="w-4 h-4 mr-2" />
        New Game
      </Button>
    </div>
  );
}
