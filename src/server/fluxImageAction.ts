/* =========================================================
   FLUX Image Server Action
   Runs ONLY on Lovable Cloud
   Uses HF_TOKEN from Lovable Secrets
   ========================================================= */

import type { LucyImageArtifact } from "@/types/lucyArtifacts";

const FLUX_SPACE = "black-forest-labs/FLUX.2-dev";
const FLUX_ENDPOINT = `https://huggingface.co/spaces/${FLUX_SPACE}/+/api/predict/`;

interface FluxRequest {
  prompt: string;
  width: number;
  height: number;
  steps: number;
  guidance: number;
  seed: number;
}

export async function generateFluxImage(
  req: FluxRequest
): Promise<LucyImageArtifact> {
  const token = process.env.HF_TOKEN;
  if (!token) throw new Error("HF_TOKEN missing in Lovable Cloud secrets");

  const payload = {
    data: [
      req.prompt,
      null,
      req.seed,
      false,
      req.width,
      req.height,
      req.steps,
      req.guidance,
      true,
    ],
  };

  const res = await fetch(FLUX_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`FLUX generation failed: ${text}`);
  }

  const json = await res.json();
  const imageUrl = json?.data?.[0];

  if (!imageUrl) {
    throw new Error("FLUX returned no image");
  }

  return {
    kind: "image",
    provider: "flux.2-dev",
    prompt: req.prompt,
    url: imageUrl,
    width: req.width,
    height: req.height,
    createdAt: new Date().toISOString(),
  };
}
