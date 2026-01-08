// Lucy Arcade — Game Page
// Layout + metadata only (execution lives in GameFrame)

import { useParams } from "react-router-dom";
import { motion } from "framer-motion";

import { GameFrame } from "../components/GameFrame";
import { LeaderboardPanel } from "../components/LeaderboardPanel";
import { getGameById } from "../data/games";

export default function GamePage() {
  const { gameId } = useParams<{ gameId: string }>();

  const game = getGameById(gameId ?? "");

  if (!gameId || !game) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Game not found.</p>
      </div>
    );
  }

  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 px-4 py-6 md:px-8"
      data-theme-area="arcade"
    >
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
          {/* Game */}
          <div className="lg:col-span-3">
            <GameFrame gameId={gameId} />
          </div>

          {/* Sidebar */}
          <aside className="space-y-6">
            <div className="rounded-xl border border-border/50 bg-card/60 p-4 backdrop-blur">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{game.icon}</span>
                <div>
                  <h2 className="text-lg font-semibold">{game.title}</h2>
                  <p className="text-sm capitalize text-muted-foreground">
                    {game.category}
                  </p>
                </div>
              </div>

              <p className="mt-3 text-sm text-muted-foreground">
                {game.description}
              </p>

              <div className="mt-4 flex flex-wrap gap-2">
                {game.controls.map((control) => (
                  <span
                    key={control}
                    className="rounded-full bg-muted/50 px-2 py-1 text-xs capitalize text-muted-foreground"
                  >
                    {control}
                  </span>
                ))}
              </div>
            </div>

            {game.hasLeaderboard && (
              <LeaderboardPanel gameId={gameId} title="Top Scores" />
            )}
          </aside>
        </div>
      </div>
    </motion.main>
  );
}
