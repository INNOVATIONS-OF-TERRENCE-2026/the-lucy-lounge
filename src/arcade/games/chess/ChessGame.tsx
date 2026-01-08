import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

/**
 * Lucy Arcade — ChessGame
 * Minimal, fully executable prototype
 * (Purpose: guarantee GameFrame mount + Play works)
 */

type Player = "white" | "black";
type Square = Player | null;

const BOARD_SIZE = 8;

export default function ChessGame() {
  const [board, setBoard] = useState<Square[]>(
    () => Array(BOARD_SIZE * BOARD_SIZE).fill(null)
  );
  const [turn, setTurn] = useState<Player>("white");

  const handleMove = (index: number) => {
    if (board[index] !== null) return;

    setBoard(prev => {
      const next = [...prev];
      next[index] = turn;
      return next;
    });

    setTurn(t => (t === "white" ? "black" : "white"));
  };

  const resetGame = () => {
    setBoard(Array(BOARD_SIZE * BOARD_SIZE).fill(null));
    setTurn("white");
  };

  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-6">
      <h2 className="text-2xl font-bold">Lucy Chess (Prototype)</h2>

      <div className="grid grid-cols-8 gap-1 rounded-xl bg-muted p-2">
        {board.map((square, i) => (
          <motion.button
            key={i}
            whileTap={{ scale: 0.92 }}
            onClick={() => handleMove(i)}
            className="flex h-10 w-10 items-center justify-center rounded-md bg-background text-lg shadow-sm"
          >
            {square === "white" && "♙"}
            {square === "black" && "♟︎"}
          </motion.button>
        ))}
      </div>

      <div className="text-sm text-muted-foreground">
        Turn:&nbsp;
        <span className="font-semibold text-foreground">
          {turn}
        </span>
      </div>

      <Button variant="outline" size="sm" onClick={resetGame}>
        Reset Game
      </Button>
    </div>
  );
}
