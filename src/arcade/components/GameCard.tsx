import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Play, Trophy, Users, Gamepad2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { GameConfig } from "../types/game.types";

interface GameCardProps {
  game: GameConfig;
  index: number;
}

export function GameCard({ game, index }: GameCardProps) {
  const navigate = useNavigate();

  const categoryColors: Record<string, string> = {
    sports: "bg-orange-500/20 text-orange-400 border-orange-500/30",
    action: "bg-red-500/20 text-red-400 border-red-500/30",
    strategy: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    social: "bg-green-500/20 text-green-400 border-green-500/30",
    puzzle: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.35, ease: "easeOut" }}
      whileHover={{ y: -4, scale: 1.02 }}
      className="
        group relative overflow-hidden rounded-2xl
        border border-border/50
        bg-gradient-to-br from-card/80 to-card/40
        backdrop-blur-sm
      "
    >
      {/* ✨ Cinematic glow overlay (VISUAL ONLY) */}
      <div
        aria-hidden
        className="
          pointer-events-none absolute inset-0
          bg-gradient-to-br from-primary/10 to-transparent
          opacity-0 transition-opacity duration-300
          group-hover:opacity-100
        "
      />

      {/* 🎮 Thumbnail */}
      <div className="relative flex h-32 items-center justify-center bg-gradient-to-br from-muted/50 to-muted/20">
        <motion.span
          aria-hidden
          whileHover={{ scale: 1.1 }}
          transition={{ type: "spring", stiffness: 200 }}
          className="text-5xl"
        >
          {game.icon}
        </motion.span>

        {/* Category badge */}
        <Badge
          variant="outline"
          className={`
            absolute top-3 right-3 capitalize
            ${categoryColors[game.category]}
          `}
        >
          {game.category}
        </Badge>
      </div>

      {/* 📋 Content */}
      <div className="relative z-10 space-y-3 p-4">
        <h3 className="text-lg font-semibold text-foreground">
          {game.title}
        </h3>

        <p className="line-clamp-2 text-sm text-muted-foreground">
          {game.description}
        </p>

        {/* Feature indicators */}
        <div className="flex flex-wrap gap-2">
          {game.hasAI && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Gamepad2 className="h-3 w-3" />
              AI Opponent
            </span>
          )}

          {game.hasLeaderboard && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Trophy className="h-3 w-3" />
              Leaderboard
            </span>
          )}

          {game.maxPlayers > 1 && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Users className="h-3 w-3" />
              {game.minPlayers}-{game.maxPlayers} Players
            </span>
          )}
        </div>

        {/* ▶️ PLAY BUTTON — GUARANTEED CLICKABLE */}
        <Button
          type="button"
          onClick={() => navigate(`/arcade/${game.id}`)}
          className="
            relative z-20 w-full gap-2
            bg-primary/90 hover:bg-primary
            transition-transform active:scale-[0.97]
          "
        >
          <Play className="h-4 w-4" />
          Play Now
        </Button>
      </div>
    </motion.div>
  );
}
