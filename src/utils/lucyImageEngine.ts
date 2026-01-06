// src/utils/lucyImageEngine.ts

export interface LucyImageResult {
  imageUrl: string;
  seed?: number;
}

export async function generateLucyImage(prompt: string): Promise<LucyImageResult> {
  const response = await fetch(
    "https://black-forest-labs-flux-2-dev.hf.space/api/predict",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        data: [
          prompt,
          null,
          0,
          true,
          1024,
          1024,
          30,
          4,
          true
        ]
      })
    }
  );

  if (!response.ok) {
    throw new Error("Image generation failed");
  }

  const json = await response.json();
  const base64 = json?.data?.[0];

  return {
    imageUrl: base64.startsWith("data:")
      ? base64
      : `data:image/png;base64,${base64}`,
  };
}
