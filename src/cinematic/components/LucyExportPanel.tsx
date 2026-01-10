import React from "react";

const PLATFORMS = ["tiktok", "instagram", "youtube", "twitter", "facebook"];

export const LucyExportPanel: React.FC<{
  onExport: (platform: string) => void;
}> = ({ onExport }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
      {PLATFORMS.map((p) => (
        <button
          key={p}
          onClick={() => onExport(p)}
          className="rounded-xl bg-gradient-to-br from-indigo-600 to-fuchsia-600 py-3 text-white text-sm uppercase tracking-wide hover:opacity-90"
        >
          {p}
        </button>
      ))}
    </div>
  );
};
