// Lucy Arcade - Checkers Game
import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { RotateCcw, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useGameStats } from '../../hooks/useGameStats';
import { usePlayerProfile } from '../../hooks/usePlayerProfile';
import { useArcadeStore } from '../../stores/arcadeStore';

type PieceColor = 'red' | 'black';

interface CheckerPiece {
  color: PieceColor;
  isKing: boolean;
}

type Board = (CheckerPiece | null)[][];

const createInitialBoard = (): Board => {
  const board: Board = Array(8).fill(null).map(() => Array(8).fill(null));
  
  // Place black pieces (top)
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 8; col++) {
      if ((row + col) % 2 === 1) {
        board[row][col] = { color: 'black', isKing: false };
      }
    }
  }
  
  // Place red pieces (bottom)
  for (let row = 5; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      if ((row + col) % 2 === 1) {
        board[row][col] = { color: 'red', isKing: false };
      }
    }
  }
  
  return board;
};

export default function CheckersGame() {
  const [board, setBoard] = useState<Board>(createInitialBoard);
  const [selectedSquare, setSelectedSquare] = useState<[number, number] | null>(null);
  const [currentPlayer, setCurrentPlayer] = useState<PieceColor>('red');
  const [gameStatus, setGameStatus] = useState<'playing' | 'won' | 'lost'>('playing');
  const [capturedRed, setCapturedRed] = useState(0);
  const [capturedBlack, setCapturedBlack] = useState(0);
  const [startTime] = useState(Date.now());
  
  const { recordGame } = useGameStats('checkers');
  const { addXp, addCoins } = usePlayerProfile();
  const { addLucyMessage } = useArcadeStore();

  const getValidMoves = useCallback((row: number, col: number): [number, number, boolean][] => {
    const piece = board[row][col];
    if (!piece) return [];
    
    const moves: [number, number, boolean][] = [];
    const directions = piece.isKing ? [-1, 1] : piece.color === 'red' ? [-1] : [1];
    
    for (const rowDir of directions) {
      for (const colDir of [-1, 1]) {
        const newRow = row + rowDir;
        const newCol = col + colDir;
        
        // Simple move
        if (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8 && !board[newRow][newCol]) {
          moves.push([newRow, newCol, false]);
        }
        
        // Jump move
        const jumpRow = row + rowDir * 2;
        const jumpCol = col + colDir * 2;
        if (
          jumpRow >= 0 && jumpRow < 8 && jumpCol >= 0 && jumpCol < 8 &&
          board[newRow][newCol] && board[newRow][newCol]!.color !== piece.color &&
          !board[jumpRow][jumpCol]
        ) {
          moves.push([jumpRow, jumpCol, true]);
        }
      }
    }
    
    return moves;
  }, [board]);

  const checkWinner = useCallback((newBoard: Board) => {
    let redCount = 0;
    let blackCount = 0;
    
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        if (newBoard[r][c]?.color === 'red') redCount++;
        if (newBoard[r][c]?.color === 'black') blackCount++;
      }
    }
    
    if (redCount === 0) {
      setGameStatus('lost');
      addLucyMessage({ type: 'encouragement', message: 'Good effort! Try again?', timestamp: Date.now() });
    } else if (blackCount === 0) {
      setGameStatus('won');
      const playtime = Math.floor((Date.now() - startTime) / 1000);
      recordGame({ won: true, score: capturedBlack * 100 + 500, playtimeSeconds: playtime });
      addXp(75);
      addCoins(30);
      addLucyMessage({ type: 'achievement', message: 'Victory! You captured all pieces! 🏆', timestamp: Date.now() });
    }
  }, [capturedBlack, startTime, recordGame, addXp, addCoins, addLucyMessage]);

  const makeAIMove = useCallback(() => {
    const aiPieces: [number, number][] = [];
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        if (board[r][c]?.color === 'black') {
          aiPieces.push([r, c]);
        }
      }
    }
    
    // Prioritize jumps
    for (const [r, c] of aiPieces) {
      const moves = getValidMoves(r, c);
      const jumps = moves.filter(([, , isJump]) => isJump);
      if (jumps.length > 0) {
        const [toRow, toCol] = jumps[Math.floor(Math.random() * jumps.length)];
        executeMove(r, c, toRow, toCol, true);
        return;
      }
    }
    
    // Make random move
    const shuffled = aiPieces.sort(() => Math.random() - 0.5);
    for (const [r, c] of shuffled) {
      const moves = getValidMoves(r, c);
      if (moves.length > 0) {
        const [toRow, toCol] = moves[Math.floor(Math.random() * moves.length)];
        executeMove(r, c, toRow, toCol, false);
        return;
      }
    }
  }, [board, getValidMoves]);

  const executeMove = (fromRow: number, fromCol: number, toRow: number, toCol: number, isJump: boolean) => {
    const newBoard = board.map(row => [...row]);
    const piece = newBoard[fromRow][fromCol]!;
    
    newBoard[toRow][toCol] = piece;
    newBoard[fromRow][fromCol] = null;
    
    if (isJump) {
      const jumpedRow = (fromRow + toRow) / 2;
      const jumpedCol = (fromCol + toCol) / 2;
      const jumpedPiece = newBoard[jumpedRow][jumpedCol];
      newBoard[jumpedRow][jumpedCol] = null;
      
      if (jumpedPiece?.color === 'red') {
        setCapturedRed(prev => prev + 1);
      } else {
        setCapturedBlack(prev => prev + 1);
      }
    }
    
    // King promotion
    if ((piece.color === 'red' && toRow === 0) || (piece.color === 'black' && toRow === 7)) {
      newBoard[toRow][toCol] = { ...piece, isKing: true };
    }
    
    setBoard(newBoard);
    setCurrentPlayer(prev => prev === 'red' ? 'black' : 'red');
    checkWinner(newBoard);
    
    if (currentPlayer === 'red') {
      setTimeout(makeAIMove, 500);
    }
  };

  const handleSquareClick = (row: number, col: number) => {
    if (gameStatus !== 'playing' || currentPlayer !== 'red') return;
    
    if (selectedSquare) {
      const [fromRow, fromCol] = selectedSquare;
      const validMoves = getValidMoves(fromRow, fromCol);
      const move = validMoves.find(([r, c]) => r === row && c === col);
      
      if (move) {
        executeMove(fromRow, fromCol, row, col, move[2]);
        setSelectedSquare(null);
      } else {
        setSelectedSquare(null);
      }
    } else {
      const piece = board[row][col];
      if (piece && piece.color === currentPlayer) {
        setSelectedSquare([row, col]);
      }
    }
  };

  const resetGame = () => {
    setBoard(createInitialBoard());
    setSelectedSquare(null);
    setCurrentPlayer('red');
    setGameStatus('playing');
    setCapturedRed(0);
    setCapturedBlack(0);
  };

  const validMoves = selectedSquare ? getValidMoves(selectedSquare[0], selectedSquare[1]) : [];

  return (
    <div className="flex flex-col items-center justify-center h-full gap-6 p-4">
      {/* Score */}
      <div className="flex items-center gap-8">
        <div className="text-center">
          <div className="w-6 h-6 rounded-full bg-red-500 mx-auto mb-1" />
          <span className="text-sm text-muted-foreground">Captured: {capturedRed}</span>
        </div>
        <div className={`px-4 py-2 rounded-full ${gameStatus !== 'playing' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
          {gameStatus === 'playing' ? `${currentPlayer === 'red' ? 'Your' : 'AI'} Turn` : 
           gameStatus === 'won' ? '🎉 You Won!' : '😔 You Lost'}
        </div>
        <div className="text-center">
          <div className="w-6 h-6 rounded-full bg-gray-800 mx-auto mb-1" />
          <span className="text-sm text-muted-foreground">Captured: {capturedBlack}</span>
        </div>
      </div>
      
      {/* Checkers Board */}
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="grid grid-cols-8 gap-0 rounded-lg overflow-hidden shadow-2xl border-4 border-amber-900/50"
      >
        {board.map((row, rowIndex) =>
          row.map((piece, colIndex) => {
            const isDark = (rowIndex + colIndex) % 2 === 1;
            const isSelected = selectedSquare?.[0] === rowIndex && selectedSquare?.[1] === colIndex;
            const isValidTarget = validMoves.some(([r, c]) => r === rowIndex && c === colIndex);
            
            return (
              <motion.button
                key={`${rowIndex}-${colIndex}`}
                whileHover={isDark ? { scale: 1.05 } : undefined}
                whileTap={isDark ? { scale: 0.95 } : undefined}
                onClick={() => isDark && handleSquareClick(rowIndex, colIndex)}
                className={`w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 flex items-center justify-center transition-all ${
                  isDark ? 'bg-green-800 cursor-pointer' : 'bg-amber-100 cursor-default'
                } ${isSelected ? 'ring-4 ring-yellow-400 ring-inset' : ''} ${
                  isValidTarget ? 'ring-2 ring-yellow-300/50 ring-inset' : ''
                }`}
              >
                {piece && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center shadow-lg ${
                      piece.color === 'red' 
                        ? 'bg-gradient-to-br from-red-400 to-red-600 border-2 border-red-300' 
                        : 'bg-gradient-to-br from-gray-600 to-gray-900 border-2 border-gray-500'
                    }`}
                  >
                    {piece.isKing && <Crown className="w-4 h-4 text-yellow-400" />}
                  </motion.div>
                )}
              </motion.button>
            );
          })
        )}
      </motion.div>
      
      {/* Controls */}
      <Button variant="outline" size="sm" onClick={resetGame} className="gap-2">
        <RotateCcw className="w-4 h-4" />
        New Game
      </Button>
    </div>
  );
}
