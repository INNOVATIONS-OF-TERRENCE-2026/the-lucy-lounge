import React from "react";
import { Button } from "@/components/ui/button";

/**
 * =========================================================
 * MoodNavigator
 * =========================================================
 * Unified mood / vibe selector for Listening Mode.
 * - Works with existing mood filtering logic
 * - Designed for streaming-app UX
 * - Mobile-first and accessible
 * =========================================================
 */

export type ListeningMood =
  | "all"
  | "focus"
  | "chill"
  | "rnb"
  | "rap"
  | "ambient"
  | "lofi";

export interface MoodNavigatorProps {
  activeMood: ListeningMood;
  onChange: (mood: ListeningMood) => void;
}

const MOODS: { key: ListeningMood; label: string }[] = [
  { key: "all", label: "All" },
  { key: "focus", label: "Focus" },
  { key: "chill", label: "Chill" },
  { key: "rnb", label: "R&B" },
  { key: "rap", label: "Rap" },
  { key: "ambient", label: "Ambient" },
  { key: "lofi", label: "Lo-Fi" },
];

export function MoodNavigator({
  activeMood,
  onChange,
}: MoodNavigatorProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {MOODS.map(mood => (
        <Button
          key={mood.key}
          size="sm"
          variant={activeMood === mood.key ? "default" : "secondary"}
          onClick={() => onChange(mood.key)}
        >
          {mood.label}
        </Button>
      ))}
    </div>
  );
}
