import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, Instagram, Youtube, Twitter } from "lucide-react";

const PLATFORMS = [
  { id: "tiktok", name: "TikTok", icon: "📱" },
  { id: "instagram", name: "Instagram", icon: "📷" },
  { id: "youtube", name: "YouTube", icon: "▶️" },
  { id: "twitter", name: "X", icon: "𝕏" },
  { id: "facebook", name: "Facebook", icon: "📘" },
];

export const LucyExportPanel: React.FC<{
  videoUrl?: string;
  onExport: (platforms: string[]) => void;
}> = ({ videoUrl, onExport }) => {
  const [selected, setSelected] = useState<string[]>([]);

  const toggle = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
        {PLATFORMS.map((p) => (
          <Button
            key={p.id}
            variant={selected.includes(p.id) ? "default" : "outline"}
            size="sm"
            onClick={() => toggle(p.id)}
            className="flex items-center gap-2"
          >
            <span>{p.icon}</span>
            <span className="hidden sm:inline">{p.name}</span>
          </Button>
        ))}
      </div>
      <Button
        onClick={() => onExport(selected)}
        disabled={selected.length === 0}
        className="w-full"
      >
        <Download className="w-4 h-4 mr-2" />
        Export to {selected.length} Platform{selected.length !== 1 ? "s" : ""}
      </Button>
    </div>
  );
};
