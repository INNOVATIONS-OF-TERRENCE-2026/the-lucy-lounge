import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Compass } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LOUNGES } from "@/config/lounges";
import { useState } from "react";

export function LoungeSwitcher() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setOpen((v) => !v)}
        className="glass-card border-primary/30 h-8 w-8"
      >
        <Compass className="w-4 h-4" />
      </Button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-56 rounded-xl border bg-background/95 backdrop-blur shadow-xl z-50"
          >
            <div className="p-2 space-y-1">
              {LOUNGES.map((l) => (
                <button
                  key={l.path}
                  onClick={() => {
                    navigate(l.path);
                    setOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-md hover:bg-muted text-sm transition"
                >
                  <l.icon className="w-4 h-4 text-primary" />
                  {l.label}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
