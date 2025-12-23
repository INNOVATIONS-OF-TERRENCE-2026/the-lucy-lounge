import { memo } from 'react';
import { motion } from 'framer-motion';
import { useLucyWorlds, LUCY_WORLDS, LucyWorld } from '@/contexts/LucyWorldsContext';
import { cn } from '@/lib/utils';
import { Power } from 'lucide-react';

interface WorldCardProps {
  world: typeof LUCY_WORLDS[0];
  isActive: boolean;
  onSelect: () => void;
}

const WorldCard = memo(function WorldCard({ world, isActive, onSelect }: WorldCardProps) {
  return (
    <motion.button
      onClick={onSelect}
      className={cn(
        "w-full p-3 rounded-lg text-left transition-all duration-200",
        "border border-transparent",
        "hover:bg-accent/50 hover:border-primary/20",
        isActive && "bg-primary/20 border-primary/40 shadow-glow-violet"
      )}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="flex items-center gap-3">
        <span className="text-xl" role="img" aria-label={world.name}>
          {world.emoji}
        </span>
        <div className="flex-1 min-w-0">
          <p className={cn(
            "text-sm font-medium truncate",
            isActive ? "text-primary" : "text-foreground"
          )}>
            {world.name}
          </p>
          <p className="text-xs text-muted-foreground truncate">
            {world.lucyPresence}
          </p>
        </div>
        {isActive && (
          <motion.div
            className="w-2 h-2 rounded-full bg-primary"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            layoutId="activeWorldIndicator"
          />
        )}
      </div>
    </motion.button>
  );
});

export const LucyWorldsSelector = memo(function LucyWorldsSelector() {
  const { activeWorld, setActiveWorld, isWorldEnabled, toggleWorld } = useLucyWorlds();

  return (
    <div className="space-y-3">
      {/* Header with toggle */}
      <div className="flex items-center justify-between px-1">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Lucy's Worlds™</h3>
          <p className="text-xs text-muted-foreground">Cinematic AI Environments</p>
        </div>
        <motion.button
          onClick={toggleWorld}
          className={cn(
            "p-2 rounded-lg transition-colors",
            isWorldEnabled 
              ? "bg-primary/20 text-primary hover:bg-primary/30" 
              : "bg-muted text-muted-foreground hover:bg-muted/80"
          )}
          whileTap={{ scale: 0.95 }}
          title={isWorldEnabled ? "Disable Worlds" : "Enable Worlds"}
        >
          <Power className="w-4 h-4" />
        </motion.button>
      </div>

      {/* World Grid */}
      <div className="space-y-1 max-h-[300px] overflow-y-auto pr-1 scrollbar-thin">
        {LUCY_WORLDS.map((world) => (
          <WorldCard
            key={world.id}
            world={world}
            isActive={activeWorld === world.id}
            onSelect={() => setActiveWorld(world.id as LucyWorld)}
          />
        ))}
      </div>

      {/* Current World Info */}
      {isWorldEnabled && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 rounded-lg bg-card/50 border border-border/50"
        >
          <p className="text-xs text-muted-foreground">
            {LUCY_WORLDS.find(w => w.id === activeWorld)?.description}
          </p>
        </motion.div>
      )}
    </div>
  );
});
