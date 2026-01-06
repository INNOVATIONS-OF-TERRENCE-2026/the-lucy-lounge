// src/services/lucyImageEngine.ts

const FLUX_ENDPOINT =
  "https://huggingface.co/spaces/black-forest-labs/FLUX.2-dev/+/api/predict/";

export interface LucyImageRequest {
  prompt: string;
  worldStyle?: string;
  width?: number;
  height?: number;
  steps?: number;
  guidanceScale?: number;
}

export interface LucyImageResult {
  imageBase64: string;
  seed: number;
}

const DEFAULT_WIDTH = 1024;
const DEFAULT_HEIGHT = 1024;
const DEFAULT_STEPS = 30;
const DEFAULT_GUIDANCE = 4;
const REQUEST_TIMEOUT = 120_000; // 2 minutes
const MAX_RETRIES = 2;

/**
 * Lucy Image Generation Engine
 * ----------------------------
 * Supreme multimodal image generator client.
 * Safe, resilient, world-aware.
 */
export async function generateLucyImage(
  request: LucyImageRequest
): Promise<LucyImageResult> {
  const {
    prompt,
    worldStyle,
    width = DEFAULT_WIDTH,
    height = DEFAULT_HEIGHT,
    steps = DEFAULT_STEPS,
    guidanceScale = DEFAULT_GUIDANCE,
  } = request;

  if (!prompt || prompt.trim().length < 3) {
    throw new Error("Prompt too short for image generation");
  }

  // World-aware prompt fusion
  const finalPrompt = worldStyle
    ? `${prompt}. Visual style: ${worldStyle}. Cinematic, high quality, detailed.`
    : prompt;

  const payload = {
    data: [
      finalPrompt,
      null,     // input_images
      0,        // seed
      true,     // randomize_seed
      width,
      height,
      steps,
      guidanceScale,
      true,     // prompt_upsampling
    ],
  };

  let attempt = 0;

  while (attempt <= MAX_RETRIES) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

      const response = await fetch(FLUX_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!response.ok) {
        throw new Error(`FLUX error ${response.status}`);
      }

      const result = await response.json();

      if (!result?.data?.[0]) {
        throw new Error("Invalid image response from FLUX");
      }

      return {
        imageBase64: result.data[0],
        seed: result.data[1] ?? 0,
      };
    } catch (error) {
      attempt++;

      if (attempt > MAX_RETRIES) {
        console.error("Lucy Image Engine failed:", error);
        throw new Error(
          "Lucy couldn’t generate the image right now. Please try again in a moment."
        );
      }

      // Small delay before retry
      await new Promise(res => setTimeout(res, 1000));
    }
  }

  // Should never reach here
  throw new Error("Unexpected Lucy image engine failure");
}
