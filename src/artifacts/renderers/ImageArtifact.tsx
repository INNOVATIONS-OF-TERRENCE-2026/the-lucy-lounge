// src/artifacts/renderers/ImageArtifact.tsx

import { ImageArtifact } from "../types";

interface Props {
  artifact: ImageArtifact;
}

export function ImageArtifactRenderer({ artifact }: Props) {
  return (
    <div className="rounded-2xl overflow-hidden bg-black/30 backdrop-blur-md border border-primary/20 shadow-[0_0_30px_rgba(168,85,247,0.25)]">
      <img
        src={artifact.imageUrl}
        alt="Lucy Generated Image"
        className="w-full object-contain"
      />

      <div className="flex justify-between items-center px-4 py-2 text-xs text-muted-foreground bg-black/40">
        <span>Engine: {artifact.engine}</span>
        <span>Confidence: {(artifact.provenance.confidence * 100).toFixed(1)}%</span>
      </div>
    </div>
  );
}
