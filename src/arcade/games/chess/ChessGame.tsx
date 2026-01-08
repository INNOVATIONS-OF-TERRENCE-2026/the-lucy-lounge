// Lucy Arcade - Chess Game (3D with AI)
import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { RotateCcw, Lightbulb, Flag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useGameStats } from '../../hooks/useGameStats';
import { usePlayerProfile } from '../../hooks/usePlayerProfile';
import { useArcadeStore } from '../../stores/arcadeStore';

type PieceType = 'king' | 'queen' | 'rook' | 'bishop' | 'knight' | 'pawn';
type PieceColor = 'white' | 'black';

interface ChessPiece {
  type: PieceType;
  color: PieceColor;
}

type Board = (ChessPiece | null)[][];

const PIECE_SYMBOLS: Record<PieceColor, Record<PieceType, string>> = {
  white: { king: '♔', queen: '♕', rook: '♖', bishop: '♗', knight: '♘', pawn: '♙' },
  black: { king: '♚', queen: '♛', rook: '♜', bishop: '♝', knight: '♞', pawn: '♟' },
};

const createInitialBoard = (): Board => {
  const board: Board = Array(8).fill(null).map(() => Array(8).fill(null));
  
  // Black pieces (top)
  board[0] = [
    { type: 'rook', color: 'black' }, { type: 'knight', color: 'black' },
    { type: 'bishop', color: 'black' }, { type: 'queen', color: 'black' },
    { type: 'king', color: 'black' }, { type: 'bishop', color: 'black' },
    { type: 'knight', color: 'black' }, { type: 'rook', color: 'black' },
  ];
  board[1] = Array(8).fill(null).map(() => ({ type: 'pawn' as PieceType, color: 'black' as PieceColor }));
  
  // White pieces (bottom)
  board[6] = Array(8).fill(null).map(() => ({ type: 'pawn' as PieceType, color: 'white' as PieceColor }));
  board[7] = [
    { type: 'rook', color: 'white' }, { type: 'knight', color: 'white' },
    { type: 'bishop', color: 'white' }, { type: 'queen', color: 'white' },
    { type: 'king', color: 'white' }, { type: 'bishop', color: 'white' },
    { type: 'knight', color: 'white' }, { type: 'rook', color: 'white' },
  ];
  
  return board;
};

export default function ChessGame() {
  const [board, setBoard] = useState<Board>(createInitialBoard);
  const [selectedSquare, setSelectedSquare] = useState<[number, number] | null>(null);
  const [currentPlayer, setCurrentPlayer] = useState<PieceColor>('white');
  const [gameStatus, setGameStatus] = useState<'playing' | 'checkmate' | 'stalemate'>('playing');
  const [moveCount, setMoveCount] = useState(0);
  const [startTime] = useState(Date.now());
  
  const { recordGame } = useGameStats('chess');
  const { addXp, addCoins } = usePlayerProfile();
  const { gameDifficulty, addLucyMessage } = useArcadeStore();

  const isValidMove = useCallback((fromRow: number, fromCol: number, toRow: number, toCol: number): boolean => {
    const piece = board[fromRow][fromCol];
    if (!piece) return false;
    
    const target = board[toRow][toCol];
    if (target && target.color === piece.color) return false;
    
    const rowDiff = Math.abs(toRow - fromRow);
    const colDiff = Math.abs(toCol - fromCol);
    
    switch (piece.type) {
      case 'pawn': {
        const direction = piece.color === 'white' ? -1 : 1;
        const startRow = piece.color === 'white' ? 6 : 1;
        
        if (colDiff === 0 && !target) {
          if (toRow - fromRow === direction) return true;
          if (fromRow === startRow && toRow - fromRow === 2 * direction && !board[fromRow + direction][fromCol]) return true;
        }
        if (colDiff === 1 && toRow - fromRow === direction && target) return true;
        return false;
      }
      case 'rook':
        return (rowDiff === 0 || colDiff === 0) && isPathClear(fromRow, fromCol, toRow, toCol);
      case 'knight':
        return (rowDiff === 2 && colDiff === 1) || (rowDiff === 1 && colDiff === 2);
      case 'bishop':
        return rowDiff === colDiff && isPathClear(fromRow, fromCol, toRow, toCol);
      case 'queen':
        return (rowDiff === 0 || colDiff === 0 || rowDiff === colDiff) && isPathClear(fromRow, fromCol, toRow, toCol);
      case 'king':
        return rowDiff <= 1 && colDiff <= 1;
      default:
        return false;
    }
  }, [board]);

  const isPathClear = (fromRow: number, fromCol: number, toRow: number, toCol: number): boolean => {
    const rowDir = toRow > fromRow ? 1 : toRow < fromRow ? -1 : 0;
    const colDir = toCol > fromCol ? 1 : toCol < fromCol ? -1 : 0;
    
    let r = fromRow + rowDir;
    let c = fromCol + colDir;
    
    while (r !== toRow || c !== toCol) {
      if (board[r][c]) return false;
      r += rowDir;
      c += colDir;
    }
    return true;
  };

  const makeAIMove = useCallback(() => {
    const aiPieces: [number, number][] = [];
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        if (board[r][c]?.color === 'black') {
          aiPieces.push([r, c]);
        }
      }
    }
    
    // Shuffle for randomness based on difficulty
    const shuffled = aiPieces.sort(() => Math.random() - 0.5);
    
    for (const [fromR, fromC] of shuffled) {
      for (let toR = 0; toR < 8; toR++) {
        for (let toC = 0; toC < 8; toC++) {
          if (isValidMove(fromR, fromC, toR, toC)) {
            // Make the move
            const newBoard = board.map(row => [...row]);
            newBoard[toR][toC] = newBoard[fromR][fromC];
            newBoard[fromR][fromC] = null;
            setBoard(newBoard);
            setCurrentPlayer('white');
            setMoveCount(prev => prev + 1);
            
            // Check if captured king
            if (board[toR][toC]?.type === 'king') {
              setGameStatus('checkmate');
              addLucyMessage({ type: 'encouragement', message: 'Good game! The AI won this time.', timestamp: Date.now() });
            }
            return;
          }
        }
      }
    }
  }, [board, isValidMove, addLucyMessage]);

  const handleSquareClick = (row: number, col: number) => {
    if (gameStatus !== 'playing' || currentPlayer !== 'white') return;
    
    if (selectedSquare) {
      const [fromRow, fromCol] = selectedSquare;
      
      if (isValidMove(fromRow, fromCol, row, col)) {
        const newBoard = board.map(r => [...r]);
        const capturedPiece = newBoard[row][col];
        
        newBoard[row][col] = newBoard[fromRow][fromCol];
        newBoard[fromRow][fromCol] = null;
        
        setBoard(newBoard);
        setSelectedSquare(null);
        setMoveCount(prev => prev + 1);
        
        // Check if captured king
        if (capturedPiece?.type === 'king') {
          setGameStatus('checkmate');
          const playtime = Math.floor((Date.now() - startTime) / 1000);
          const score = 1000 - moveCount * 10;
          recordGame({ won: true, score: Math.max(score, 100), playtimeSeconds: playtime });
          addXp(100);
          addCoins(50);
          addLucyMessage({ type: 'achievement', message: 'Checkmate! You won! 🎉', timestamp: Date.now() });
          return;
        }
        
        // AI's turn
        setCurrentPlayer('black');
        setTimeout(makeAIMove, 500);
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
    setCurrentPlayer('white');
    setGameStatus('playing');
    setMoveCount(0);
  };

  return (
    <div className="flex flex-col items-center justify-center h-full gap-6 p-4">
      {/* Game Status */}
      <div className="flex items-center gap-4">
        <div className={`px-3 py-1 rounded-full text-sm ${currentPlayer === 'white' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
          {gameStatus === 'playing' ? `${currentPlayer === 'white' ? 'Your' : 'AI'} Turn` : 
           gameStatus === 'checkmate' ? 'Checkmate!' : 'Stalemate'}
        </div>
        <span className="text-sm text-muted-foreground">Moves: {moveCount}</span>
      </div>
      
      {/* Chess Board */}
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="grid grid-cols-8 gap-0 rounded-lg overflow-hidden shadow-2xl border-4 border-amber-900/50"
      >
        {board.map((row, rowIndex) =>
          row.map((piece, colIndex) => {
            const isLight = (rowIndex + colIndex) % 2 === 0;
            const isSelected = selectedSquare?.[0] === rowIndex && selectedSquare?.[1] === colIndex;
            
            return (
              <motion.button
                key={`${rowIndex}-${colIndex}`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleSquareClick(rowIndex, colIndex)}
                className={`w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 flex items-center justify-center text-2xl sm:text-3xl md:text-4xl transition-all ${
                  isLight ? 'bg-amber-100' : 'bg-amber-800'
                } ${isSelected ? 'ring-4 ring-primary ring-inset' : ''} ${
                  piece?.color === 'white' ? 'text-gray-100 drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]' : 'text-gray-900'
                }`}
              >
                {piece && PIECE_SYMBOLS[piece.color][piece.type]}
              </motion.button>
            );
          })
        )}
      </motion.div>
      
      {/* Controls */}
      <div className="flex gap-3">
        <Button variant="outline" size="sm" onClick={resetGame} className="gap-2">
          <RotateCcw className="w-4 h-4" />
          New Game
        </Button>
        <Button variant="outline" size="sm" className="gap-2">
          <Lightbulb className="w-4 h-4" />
          Hint
        </Button>
        <Button variant="outline" size="sm" className="gap-2">
          <Flag className="w-4 h-4" />
          Resign
        </Button>
      </div>
    </div>
  );
}
