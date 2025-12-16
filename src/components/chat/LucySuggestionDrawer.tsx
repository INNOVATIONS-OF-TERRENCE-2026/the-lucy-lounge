import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, X, Play, ThumbsUp, ThumbsDown, Brain, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useLucyDJ } from "@/contexts/LucyDJContext";
import { useGlobalSpotify } from "@/contexts/GlobalSpotifyContext";

export const LucySuggestionDrawer = () => {
  const { state, closeSuggestionDrawer, dismissSuggestion, recordSelection } = useLucyDJ();
  const { setPlayback, openDrawer } = useGlobalSpotify();

  // HC-03: OPT-IN ONLY - User must click to apply
  const handleApplySuggestion = (item: typeof state.suggestedQueue[0]) => {
    setPlayback(item.spotifyId, item.genre, item.contentType);
    openDrawer();
    recordSelection(item.genre);
    closeSuggestionDrawer();
  };

  if (!state.showSuggestionDrawer) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-end justify-center sm:items-center"
        onClick={closeSuggestionDrawer}
      >
        {/* Backdrop */}
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" />
        
        {/* Drawer */}
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
          className={cn(
            "relative w-full max-w-md mx-4 mb-4 sm:mb-0",
            "bg-background/95 backdrop-blur-xl border border-border/50",
            "rounded-2xl shadow-2xl overflow-hidden"
          )}
        >
          {/* Header */}
          <div className="px-5 py-4 border-b border-border/30 flex items-center justify-between bg-gradient-to-r from-primary/10 to-violet-500/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-violet-500 flex items-center justify-center">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                  Lucy DJ Autopilot
                  <Sparkles className="w-4 h-4 text-primary" />
                </h3>
                <p className="text-xs text-muted-foreground">Intelligent suggestions based on your vibe</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={closeSuggestionDrawer}
              className="h-8 w-8 rounded-full"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Current Suggestion */}
          {state.currentSuggestion && (
            <div className="p-4 border-b border-border/30">
              <div className="flex items-center gap-2 mb-3">
                <Zap className="w-4 h-4 text-amber-500" />
                <span className="text-sm font-medium text-foreground">Top Pick for You</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-primary/20 text-primary">
                  {state.currentSuggestion.confidence}% match
                </span>
              </div>
              
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="p-4 rounded-xl bg-gradient-to-br from-primary/10 to-violet-500/10 border border-primary/20"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-foreground">{state.currentSuggestion.title}</h4>
                    <p className="text-sm text-muted-foreground">{state.currentSuggestion.reason}</p>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handleApplySuggestion(state.currentSuggestion!)}
                    className="h-9 px-4 rounded-full bg-gradient-to-r from-primary to-violet-500 text-white hover:opacity-90"
                  >
                    <Play className="w-4 h-4 mr-1" />
                    Play
                  </Button>
                </div>
              </motion.div>
            </div>
          )}

          {/* Queue Suggestions */}
          <div className="p-4">
            <p className="text-xs text-muted-foreground mb-3 flex items-center gap-2">
              <Sparkles className="w-3 h-3" />
              Lucy thinks you'll like these next
            </p>
            
            <div className="space-y-2">
              {state.suggestedQueue.slice(0, 3).map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className={cn(
                    "flex items-center justify-between p-3 rounded-xl",
                    "bg-muted/30 hover:bg-muted/50 transition-colors",
                    "border border-transparent hover:border-border/30"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center text-sm font-medium text-primary">
                      {index + 1}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{item.title}</p>
                      <p className="text-xs text-muted-foreground">{item.reason}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-muted-foreground mr-2">{item.confidence}%</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleApplySuggestion(item)}
                      className="h-8 w-8 rounded-full hover:bg-primary/20 hover:text-primary"
                    >
                      <Play className="w-4 h-4" />
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="px-4 py-3 border-t border-border/30 flex items-center justify-between bg-muted/20">
            <p className="text-xs text-muted-foreground">
              Suggestions update based on your listening
            </p>
            <Button
              variant="ghost"
              size="sm"
              onClick={dismissSuggestion}
              className="text-xs h-7"
            >
              Dismiss All
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
