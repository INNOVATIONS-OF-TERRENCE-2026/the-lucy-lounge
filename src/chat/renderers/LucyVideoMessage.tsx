import React from "react";

export const LucyVideoMessage: React.FC<{ url: string }> = ({ url }) => {
  return (
    <video
      src={url}
      controls
      className="w-full rounded-xl mt-2 border border-white/10"
    />
  );
};
