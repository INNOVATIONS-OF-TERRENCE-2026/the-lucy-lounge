/**
 * ┌─────────────────────────────────────────────────────────────────────────────┐
 * │ THE LUCY LOUNGE — ARCADE AI SERVICE                                        │
 * │                                                                             │
 * │ AI opponent system with behavior trees and difficulty scaling              │
 * │ Provides intelligent opponents for all arcade games                        │
 * │                                                                             │
 * │ Lucy plays to win (but fairly).                                            │
 * └─────────────────────────────────────────────────────────────────────────────┘
 */

// =============================================================================
// TYPES
// =============================================================================

export type Difficulty = 'easy' | 'medium' | 'hard' | 'expert';

export interface AIConfig {
  difficulty: Difficulty;
  thinkingTime: number; // ms delay to simulate thinking
  mistakeRate: number; // 0-1, chance of making suboptimal move
  aggressiveness: number; // 0-1, preference for aggressive plays
}

export interface GameState {
  board?: any[][];
  currentPlayer?: number;
  score?: Record<string, number>;
  turn?: number;
  [key: string]: unknown;
}

export interface AIMove {
  action: string;
  data: Record<string, unknown>;
  confidence: number;
}

// =============================================================================
// DIFFICULTY CONFIGS
// =============================================================================

const DIFFICULTY_CONFIGS: Record<Difficulty, AIConfig> = {
  easy: {
    difficulty: 'easy',
    thinkingTime: 500,
    mistakeRate: 0.4,
    aggressiveness: 0.3,
  },
  medium: {
    difficulty: 'medium',
    thinkingTime: 800,
    mistakeRate: 0.2,
    aggressiveness: 0.5,
  },
  hard: {
    difficulty: 'hard',
    thinkingTime: 1200,
    mistakeRate: 0.05,
    aggressiveness: 0.7,
  },
  expert: {
    difficulty: 'expert',
    thinkingTime: 1500,
    mistakeRate: 0,
    aggressiveness: 0.8,
  },
};

// =============================================================================
// BASE AI CLASS
// =============================================================================

export abstract class GameAI {
  protected config: AIConfig;
  protected gameId: string;

  constructor(gameId: string, difficulty: Difficulty = 'medium') {
    this.gameId = gameId;
    this.config = DIFFICULTY_CONFIGS[difficulty];
  }

  abstract calculateMove(state: GameState): AIMove;

  async getMove(state: GameState): Promise<AIMove> {
    // Simulate thinking time
    await this.delay(this.config.thinkingTime * (0.5 + Math.random() * 0.5));

    const optimalMove = this.calculateMove(state);

    // Potentially make a mistake based on difficulty
    if (Math.random() < this.config.mistakeRate) {
      return this.makeSuboptimalMove(state, optimalMove);
    }

    return optimalMove;
  }

  protected makeSuboptimalMove(state: GameState, optimalMove: AIMove): AIMove {
    // Default: return optimal move (override in specific games)
    return optimalMove;
  }

  protected delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  protected randomChoice<T>(options: T[]): T {
    return options[Math.floor(Math.random() * options.length)];
  }
}

// =============================================================================
// CHESS AI
// =============================================================================

export class ChessAI extends GameAI {
  private pieceValues: Record<string, number> = {
    p: 1, n: 3, b: 3, r: 5, q: 9, k: 100,
  };

  calculateMove(state: GameState): AIMove {
    const board = state.board as string[][];
    const isWhite = state.currentPlayer === 1;
    
    const moves = this.getAllLegalMoves(board, isWhite);
    if (moves.length === 0) {
      return { action: 'resign', data: {}, confidence: 0 };
    }

    // Evaluate each move
    const scoredMoves = moves.map(move => ({
      move,
      score: this.evaluateMove(board, move, isWhite),
    }));

    // Sort by score
    scoredMoves.sort((a, b) => b.score - a.score);

    // Select based on difficulty
    const topMoves = scoredMoves.slice(0, Math.max(1, Math.floor(scoredMoves.length * 0.3)));
    const selectedMove = this.config.difficulty === 'expert' 
      ? scoredMoves[0].move 
      : this.randomChoice(topMoves).move;

    return {
      action: 'move',
      data: selectedMove,
      confidence: scoredMoves[0].score / 100,
    };
  }

  private getAllLegalMoves(board: string[][], isWhite: boolean): any[] {
    // Simplified move generation
    const moves: any[] = [];
    const color = isWhite ? 'w' : 'b';

    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = board[row]?.[col];
        if (piece && piece[0] === color) {
          const pieceMoves = this.getPieceMoves(board, row, col, piece);
          moves.push(...pieceMoves);
        }
      }
    }

    return moves;
  }

  private getPieceMoves(board: string[][], row: number, col: number, piece: string): any[] {
    // Simplified - return basic moves for each piece type
    const moves: any[] = [];
    const type = piece[1].toLowerCase();
    const isWhite = piece[0] === 'w';

    // Add some basic moves based on piece type
    const directions: Record<string, number[][]> = {
      r: [[0,1],[0,-1],[1,0],[-1,0]],
      b: [[1,1],[1,-1],[-1,1],[-1,-1]],
      q: [[0,1],[0,-1],[1,0],[-1,0],[1,1],[1,-1],[-1,1],[-1,-1]],
      n: [[2,1],[2,-1],[-2,1],[-2,-1],[1,2],[1,-2],[-1,2],[-1,-2]],
      k: [[0,1],[0,-1],[1,0],[-1,0],[1,1],[1,-1],[-1,1],[-1,-1]],
    };

    if (type === 'p') {
      const dir = isWhite ? -1 : 1;
      if (this.isValidSquare(row + dir, col) && !board[row + dir][col]) {
        moves.push({ from: [row, col], to: [row + dir, col] });
      }
    } else {
      const dirs = directions[type] || [];
      for (const [dr, dc] of dirs) {
        const newRow = row + dr;
        const newCol = col + dc;
        if (this.isValidSquare(newRow, newCol)) {
          const target = board[newRow]?.[newCol];
          if (!target || target[0] !== piece[0]) {
            moves.push({ from: [row, col], to: [newRow, newCol] });
          }
        }
      }
    }

    return moves;
  }

  private isValidSquare(row: number, col: number): boolean {
    return row >= 0 && row < 8 && col >= 0 && col < 8;
  }

  private evaluateMove(board: string[][], move: any, isWhite: boolean): number {
    let score = 0;
    const [toRow, toCol] = move.to;
    const target = board[toRow]?.[toCol];

    // Capture value
    if (target) {
      score += this.pieceValues[target[1].toLowerCase()] * 10;
    }

    // Center control
    const centerDist = Math.abs(toRow - 3.5) + Math.abs(toCol - 3.5);
    score += (7 - centerDist) * 0.5;

    // Add some randomness
    score += Math.random() * 2;

    return score;
  }
}

// =============================================================================
// TIC TAC TOE AI
// =============================================================================

export class TicTacToeAI extends GameAI {
  calculateMove(state: GameState): AIMove {
    const board = state.board as (string | null)[][];
    const aiSymbol = state.currentPlayer === 1 ? 'X' : 'O';
    const playerSymbol = aiSymbol === 'X' ? 'O' : 'X';

    // Get empty cells
    const emptyCells: [number, number][] = [];
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        if (!board[i][j]) {
          emptyCells.push([i, j]);
        }
      }
    }

    if (emptyCells.length === 0) {
      return { action: 'pass', data: {}, confidence: 0 };
    }

    // Check for winning move
    for (const [row, col] of emptyCells) {
      if (this.wouldWin(board, row, col, aiSymbol)) {
        return { action: 'place', data: { row, col }, confidence: 1 };
      }
    }

    // Block opponent's winning move
    for (const [row, col] of emptyCells) {
      if (this.wouldWin(board, row, col, playerSymbol)) {
        return { action: 'place', data: { row, col }, confidence: 0.9 };
      }
    }

    // Take center if available
    if (!board[1][1]) {
      return { action: 'place', data: { row: 1, col: 1 }, confidence: 0.8 };
    }

    // Take corner
    const corners: [number, number][] = [[0,0], [0,2], [2,0], [2,2]];
    const availableCorners = corners.filter(([r, c]) => !board[r][c]);
    if (availableCorners.length > 0) {
      const [row, col] = this.randomChoice(availableCorners);
      return { action: 'place', data: { row, col }, confidence: 0.7 };
    }

    // Take any available cell
    const [row, col] = this.randomChoice(emptyCells);
    return { action: 'place', data: { row, col }, confidence: 0.5 };
  }

  private wouldWin(board: (string | null)[][], row: number, col: number, symbol: string): boolean {
    const testBoard = board.map(r => [...r]);
    testBoard[row][col] = symbol;
    return this.checkWin(testBoard, symbol);
  }

  private checkWin(board: (string | null)[][], symbol: string): boolean {
    // Check rows
    for (let i = 0; i < 3; i++) {
      if (board[i][0] === symbol && board[i][1] === symbol && board[i][2] === symbol) return true;
    }
    // Check columns
    for (let j = 0; j < 3; j++) {
      if (board[0][j] === symbol && board[1][j] === symbol && board[2][j] === symbol) return true;
    }
    // Check diagonals
    if (board[0][0] === symbol && board[1][1] === symbol && board[2][2] === symbol) return true;
    if (board[0][2] === symbol && board[1][1] === symbol && board[2][0] === symbol) return true;
    return false;
  }
}

// =============================================================================
// CONNECT FOUR AI
// =============================================================================

export class ConnectFourAI extends GameAI {
  calculateMove(state: GameState): AIMove {
    const board = state.board as number[][];
    const aiPlayer = state.currentPlayer || 2;
    const opponent = aiPlayer === 1 ? 2 : 1;

    // Get valid columns
    const validCols: number[] = [];
    for (let col = 0; col < 7; col++) {
      if (board[0][col] === 0) {
        validCols.push(col);
      }
    }

    if (validCols.length === 0) {
      return { action: 'pass', data: {}, confidence: 0 };
    }

    // Check for winning move
    for (const col of validCols) {
      if (this.wouldWin(board, col, aiPlayer)) {
        return { action: 'drop', data: { column: col }, confidence: 1 };
      }
    }

    // Block opponent's winning move
    for (const col of validCols) {
      if (this.wouldWin(board, col, opponent)) {
        return { action: 'drop', data: { column: col }, confidence: 0.9 };
      }
    }

    // Prefer center columns
    const centerPreference = [3, 2, 4, 1, 5, 0, 6];
    for (const col of centerPreference) {
      if (validCols.includes(col)) {
        return { action: 'drop', data: { column: col }, confidence: 0.6 };
      }
    }

    const col = this.randomChoice(validCols);
    return { action: 'drop', data: { column: col }, confidence: 0.5 };
  }

  private wouldWin(board: number[][], col: number, player: number): boolean {
    // Find the row where the piece would land
    let row = 5;
    while (row >= 0 && board[row][col] !== 0) {
      row--;
    }
    if (row < 0) return false;

    // Check if this creates a win
    const testBoard = board.map(r => [...r]);
    testBoard[row][col] = player;
    return this.checkWin(testBoard, row, col, player);
  }

  private checkWin(board: number[][], row: number, col: number, player: number): boolean {
    const directions = [[0,1], [1,0], [1,1], [1,-1]];
    
    for (const [dr, dc] of directions) {
      let count = 1;
      // Check positive direction
      for (let i = 1; i < 4; i++) {
        const r = row + dr * i;
        const c = col + dc * i;
        if (r >= 0 && r < 6 && c >= 0 && c < 7 && board[r][c] === player) {
          count++;
        } else break;
      }
      // Check negative direction
      for (let i = 1; i < 4; i++) {
        const r = row - dr * i;
        const c = col - dc * i;
        if (r >= 0 && r < 6 && c >= 0 && c < 7 && board[r][c] === player) {
          count++;
        } else break;
      }
      if (count >= 4) return true;
    }
    return false;
  }
}

// =============================================================================
// PONG AI
// =============================================================================

export class PongAI extends GameAI {
  calculateMove(state: GameState): AIMove {
    const ballY = state.ballY as number || 0.5;
    const ballVelY = state.ballVelY as number || 0;
    const paddleY = state.aiPaddleY as number || 0.5;
    const paddleHeight = 0.15;

    // Predict where ball will be
    const predictedY = ballY + ballVelY * 10;
    const targetY = Math.max(paddleHeight / 2, Math.min(1 - paddleHeight / 2, predictedY));

    // Add some imperfection based on difficulty
    const error = (Math.random() - 0.5) * this.config.mistakeRate * 0.3;
    const adjustedTarget = targetY + error;

    // Determine direction
    let direction: 'up' | 'down' | 'stay' = 'stay';
    const threshold = 0.02;

    if (adjustedTarget < paddleY - threshold) {
      direction = 'up';
    } else if (adjustedTarget > paddleY + threshold) {
      direction = 'down';
    }

    return {
      action: 'move',
      data: { direction, targetY: adjustedTarget },
      confidence: 0.8,
    };
  }
}

// =============================================================================
// FACTORY
// =============================================================================

export function createGameAI(gameId: string, difficulty: Difficulty = 'medium'): GameAI {
  const aiClasses: Record<string, new (gameId: string, difficulty: Difficulty) => GameAI> = {
    chess: ChessAI,
    checkers: ChessAI, // Simplified - uses same logic
    'tic-tac-toe': TicTacToeAI,
    'connect-four': ConnectFourAI,
    pong: PongAI,
  };

  const AIClass = aiClasses[gameId];
  if (AIClass) {
    return new AIClass(gameId, difficulty);
  }

  // Default AI for games without specific implementation
  return new DefaultGameAI(gameId, difficulty);
}

class DefaultGameAI extends GameAI {
  calculateMove(state: GameState): AIMove {
    // Generic random move
    return {
      action: 'random',
      data: {},
      confidence: 0.5,
    };
  }
}

export default {
  createGameAI,
  ChessAI,
  TicTacToeAI,
  ConnectFourAI,
  PongAI,
  DIFFICULTY_CONFIGS,
};
