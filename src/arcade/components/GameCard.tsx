import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Play, Trophy, Users, Gamepad2 } from "lucide-react";
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

  const handlePlay = () => {
    navigate(`/arcade/${game.id}`);
  };

  return (
    <motion.div
      onClick={handlePlay}
      role="button"
      tabIndex={0}
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -6, scale: 1.025 }}
      transition={{ duration: 0.35, ease: "easeOut", delay: index * 0.06 }}
      className="
        relative cursor-pointer
        pointer-events-auto
        rounded-2xl overflow-hidden
        border border-border/50
        bg-gradient-to-br from-card/80 to-card/40
        backdrop-blur-sm
        outline-none
        focus:ring-2 focus:ring-primary/50
      "
    >
      {/* 🔮 Glow (visual only) */}
      <div
        aria-hidden
        className="
          pointer-events-none absolute inset-0
          bg-gradient-to-br from-primary/10 to-transparent
          opacity-0 group-hover:opacity-100
          transition-opacity duration-300
        "
      />

      {/* 🎮 Icon / Preview */}
      <div className="relative flex h-36 items-center justify-center bg-gradient-to-br from-muted/50 to-muted/20">
        <span className="text-6xl select-none">{game.icon}</span>

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

      {/* 📋 Details */}
      <div className="relative z-10 p-4 space-y-3">
        <h3 className="text-lg font-semibold text-foreground">
          {game.title}
        </h3>

        <p className="text-sm text-muted-foreground line-clamp-2">
          {game.description}
        </p>

        {/* Features */}
        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
          {game.hasAI && (
            <span className="flex items-center gap-1">
              <Gamepad2 className="w-3 h-3" />
              AI Opponent
            </span>
          )}
          {game.hasLeaderboard && (
            <span className="flex items-center gap-1">
              <Trophy className="w-3 h-3" />
              Leaderboard
            </span>
          )}
          {game.maxPlayers > 1 && (
            <span className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              {game.minPlayers}-{game.maxPlayers} Players
            </span>
          )}
        </div>

        {/* ▶️ Visual Play CTA */}
        <div className="
          mt-2 flex items-center justify-center gap-2
          rounded-xl bg-primary/90 text-primary-foreground
          py-2 font-medium
        ">
          <Play className="w-4 h-4" />
          Play
        </div>
      </div>
    </motion.div>
  );
}
