import React from "react";
import type { CinematicShot } from "../types/cinematic.types";

export const LucyTimelineEditor: React.FC<{
  shots: CinematicShot[];
}> = ({ shots }) => {
  return (
    <div className="flex gap-2 overflow-x-auto p-4 bg-black/30 rounded-xl">
      {shots.map((s) => (
        <div
          key={s.id}
          className="min-w-[140px] rounded-lg bg-gradient-to-br from-purple-600/30 to-blue-600/30 p-3 text-xs text-white"
        >
          <p className="font-semibold">{s.name}</p>
          <p>{s.duration}s</p>
        </div>
      ))}
    </div>
  );
};
