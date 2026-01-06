// src/artifacts/types.ts

export type ArtifactType =
  | "text"
  | "image"
  | "code"
  | "diagram"
  | "audio"
  | "video";

export type ArtifactStatus =
  | "pending"
  | "generating"
  | "ready"
  | "failed"
  | "archived";

export type ArtifactEngine =
  | "flux.2-dev"
  | "openai"
  | "local"
  | "future";

export interface ArtifactProvenance {
  prompt: string;
  revisedPrompt?: string;
  confidence: number; // 0 → 1
  detectedIntent: ArtifactType;
  engine: ArtifactEngine;
}

export interface LucyArtifactBase {
  id: string;
  type: ArtifactType;
  status: ArtifactStatus;
  engine: ArtifactEngine;
  createdAt: string;
  updatedAt?: string;
  provenance: ArtifactProvenance;
}

export interface TextArtifact extends LucyArtifactBase {
  type: "text";
  content: string;
  format: "markdown" | "plain" | "rich";
}

export interface ImageArtifact extends LucyArtifactBase {
  type: "image";
  imageUrl: string;
  width?: number;
  height?: number;
  seed?: number;
  style?: string;
}

export type LucyArtifact =
  | TextArtifact
  | ImageArtifact;
