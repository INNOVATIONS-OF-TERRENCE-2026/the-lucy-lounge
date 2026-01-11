import React from "react";
import { cn } from "@/lib/utils";

const PRESETS = [
  { id: "cinematic", name: "Cinematic", emoji: "🎬" },
  { id: "cyberpunk", name: "Cyberpunk", emoji: "🌃" },
  { id: "luxury", name: "Luxury", emoji: "✨" },
  { id: "anime", name: "Anime", emoji: "🎌" },
  { id: "cartoon", name: "Cartoon", emoji: "🎨" },
  { id: "realism", name: "Realistic", emoji: "📸" },
  { id: "advertisement", name: "Advertisement", emoji: "📢" },
  { id: "horror", name: "Horror", emoji: "👻" },
  { id: "scifi", name: "Sci-Fi", emoji: "🚀" },
];

export const LucyPresetPicker: React.FC<{
  value: string;
  onChange: (v: string) => void;
}> = ({ value, onChange }) => {
  return (
    <div className="grid grid-cols-3 md:grid-cols-3 gap-2">
      {PRESETS.map((p) => (
        <button
          key={p.id}
          onClick={() => onChange(p.id)}
          className={cn(
            "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all",
            "border hover:border-primary/50",
            value === p.id
              ? "bg-primary text-primary-foreground border-primary"
              : "bg-muted/30 text-muted-foreground border-border hover:bg-muted/50"
          )}
        >
          <span>{p.emoji}</span>
          <span className="hidden sm:inline">{p.name}</span>
        </button>
      ))}
    </div>
  );
};
