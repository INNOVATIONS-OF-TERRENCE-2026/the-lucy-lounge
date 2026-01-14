import React from "react";

const PRESETS = [
  "cinematic",
  "cyberpunk",
  "luxury",
  "anime",
  "cartoon",
  "realism",
  "advertisement",
];

export const LucyPresetPicker: React.FC<{
  value: string;
  onChange: (v: string) => void;
}> = ({ value, onChange }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
      {PRESETS.map((p) => (
        <button
          key={p}
          onClick={() => onChange(p)}
          className={`rounded-xl px-4 py-3 text-sm uppercase tracking-wide transition ${
            value === p
              ? "bg-gradient-to-r from-fuchsia-600 to-indigo-600 text-white"
              : "bg-white/10 text-white/70 hover:bg-white/20"
          }`}
        >
          {p}
        </button>
      ))}
    </div>
  );
};
