// src/artifacts/LucyArtifactEngine.ts

import { LucyArtifact, TextArtifact, ImageArtifact } from "./types";
import { detectLucyIntent } from "./intent";
import { generateFluxImage } from "./providers/flux";
import crypto from "crypto";

export interface ArtifactEngineResult {
  artifact: LucyArtifact;
  confidence: number;
}

export async function createLucyArtifact(
  userInput: string,
): Promise<ArtifactEngineResult> {
  const intent = detectLucyIntent(userInput);

  const base = {
    id: crypto.randomUUID(),
    status: "ready" as const,
    engine: intent.engine,
    createdAt: new Date().toISOString(),
    provenance: {
      prompt: userInput,
      revisedPrompt: intent.revisedPrompt,
      confidence: intent.confidence,
      detectedIntent: intent.type,
      engine: intent.engine,
    },
  };

  if (intent.type === "image") {
    const image = await generateFluxImage(intent.revisedPrompt ?? userInput);

    const artifact: ImageArtifact = {
      ...base,
      type: "image",
      imageUrl: image.url,
      width: image.width,
      height: image.height,
      seed: image.seed,
      style: intent.style,
    };

    return { artifact, confidence: intent.confidence };
  }

  const artifact: TextArtifact = {
    ...base,
    type: "text",
    content: userInput,
    format: "markdown",
  };

  return { artifact, confidence: intent.confidence };
}
