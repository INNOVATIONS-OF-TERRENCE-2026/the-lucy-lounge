import React, { useState } from "react";
import { LucyVideoPlayer } from "../components/LucyVideoPlayer";
import { LucyTimelineEditor } from "../components/LucyTimelineEditor";
import { LucyPresetPicker } from "../components/LucyPresetPicker";
import { LucyExportPanel } from "../components/LucyExportPanel";
import { useCinematicJobs } from "../hooks/useCinematicJobs";
import { quickEnhance } from "../ai/lucyPromptEnhancer";

export default function CinematicStudio() {
  const { createJob } = useCinematicJobs();
  const [prompt, setPrompt] = useState("");
  const [preset, setPreset] = useState("cinematic");
  const [videoUrl, setVideoUrl] = useState<string | null>(null);

  const generate = async () => {
    const enhanced = quickEnhance(prompt, preset);
    const job = await createJob({
      title: "Lucy Cinematic",
      promptRaw: prompt,
      promptEnhanced: enhanced,
      stylePreset: preset,
      shots: [],
      duration: 6,
      aspectRatio: "16:9",
    });

    if (job?.result_video_url) {
      setVideoUrl(job.result_video_url);
    }
  };

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-3xl font-bold text-white">Lucy Cinematic Studio</h1>

      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Describe the cinematic scene..."
        className="w-full rounded-xl bg-black/40 p-4 text-white"
      />

      <LucyPresetPicker value={preset} onChange={setPreset} />

      <button
        onClick={generate}
        className="w-full rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 py-4 text-white font-semibold"
      >
        Generate Cinematic Video
      </button>

      <LucyVideoPlayer videoUrl={videoUrl} />

      <LucyTimelineEditor shots={[]} />

      <LucyExportPanel onExport={(p) => console.log("Export:", p)} />
    </div>
  );
}
