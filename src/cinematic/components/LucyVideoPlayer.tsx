import React from "react";

interface Props {
  videoUrl: string | null;
}

export const LucyVideoPlayer: React.FC<Props> = ({ videoUrl }) => {
  if (!videoUrl) {
    return (
      <div className="rounded-xl border border-white/10 p-6 text-center text-white/50">
        No video generated yet
      </div>
    );
  }

  return (
    <video
      src={videoUrl}
      controls
      autoPlay
      className="w-full rounded-xl shadow-2xl border border-white/10"
    />
  );
};
