// Lucy Arcade — GameFrame (Execution Container)
// This component is the HEART of game execution

import { Suspense, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, ArrowLeft, Volume2, VolumeX, Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

import { useArcadeStore } from "../stores/arcadeStore";
import { resolveGameComponent } from "../engine/gameRegistry";
import { getGameById } from "../data/games";

interface GameFrameProps {
  gameId: string;
}

function GameLoader() {
  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center bg-background/80 backdrop-blur-md">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Initializing game engine…</p>
      </div>
    </div>
  );
}

export function GameFrame({ gameId }: GameFrameProps) {
  const navigate = useNavigate();
  const { isMuted, toggleMute, setActiveGame } = useArcadeStore();

  const game = getGameById(gameId);

  const GameComponent = useMemo(
    () => resolveGameComponent(gameId),
    [gameId],
  );

  // 🔒 Lifecycle ownership
  useEffect(() => {
    setActiveGame(gameId);
    return () => setActiveGame(null);
  }, [gameId, setActiveGame]);

  // ❌ Invalid game guard
  if (!game || !GameComponent) {
    return (
      <div className="flex h-full min-h-[400px] flex-col items-center justify-center gap-4 text-center">
        <p className="text-muted-foreground">This game is unavailable.</p>
        <Button onClick={() => navigate("/arcade")} variant="outline">
          Back to Arcade
        </Button>
      </div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={gameId}
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.98 }}
        transition={{ duration: 0.25 }}
        className="relative h-full w-full min-h-[520px] overflow-hidden rounded-xl border border-border/50 bg-gradient-to-br from-background to-muted/20"
      >
        {/* Header */}
        <div className="absolute left-0 right-0 top-0 z-10 flex items-center justify-between px-4 py-3 bg-gradient-to-b from-background/90 to-transparent">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/arcade")}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>

          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" onClick={toggleMute}>
              {isMuted ? (
                <VolumeX className="h-4 w-4" />
              ) : (
                <Volume2 className="h-4 w-4" />
              )}
            </Button>

            <Button variant="ghost" size="icon" disabled>
              <Settings className="h-4 w-4 opacity-60" />
            </Button>
          </div>
        </div>

        {/* Game Mount */}
        <Suspense fallback={<GameLoader />}>
          <div className="h-full w-full pt-14">
            <GameComponent />
          </div>
        </Suspense>
      </motion.div>
    </AnimatePresence>
  );
}
