/* =========================================================
   Lucy Artifact Contract
   Single source of truth for all non-text outputs
   ========================================================= */

export interface LucyBaseArtifact {
  kind: "image" | "video" | "audio" | "file";
  provider: string;
  createdAt: string;
}

export interface LucyImageArtifact extends LucyBaseArtifact {
  kind: "image";
  prompt: string;
  url: string;
  width: number;
  height: number;
}

export type LucyArtifact = LucyImageArtifact;

export function isLucyArtifact(obj: any): obj is LucyArtifact {
  return (
    obj &&
    typeof obj === "object" &&
    typeof obj.kind === "string" &&
    typeof obj.provider === "string"
  );
}
