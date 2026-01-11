import React, { useState, useEffect } from "react";
import { LucyVideoPlayer } from "../components/LucyVideoPlayer";
import { LucyTimelineEditor } from "../components/LucyTimelineEditor";
import { LucyPresetPicker } from "../components/LucyPresetPicker";
import { LucyExportPanel } from "../components/LucyExportPanel";
import { LucyQueuePanel } from "../components/LucyQueuePanel";
import { useCinematicJobs } from "../hooks/useCinematicJobs";
import { useUserPlan } from "../hooks/useUserPlan";
import { quickEnhance } from "../ai/lucyPromptEnhancer";
import { createShotPlan } from "../ai/lucyShotDirector";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Sparkles, Film, Zap, CreditCard } from "lucide-react";
import { Slider } from "@/components/ui/slider";

export default function CinematicStudio() {
  const { toast } = useToast();
  const { createJob, jobQueue, activeJobs, cancelJob, retryJob, fetchJobs } = useCinematicJobs();
  const { userPlan, hasCredits, getCreditCost, getCurrentPlanDetails } = useUserPlan();
  
  const [prompt, setPrompt] = useState("");
  const [preset, setPreset] = useState("cinematic");
  const [duration, setDuration] = useState(5);
  const [aspectRatio, setAspectRatio] = useState("16:9");
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState("");

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const creditCost = getCreditCost("generate_video", duration);
  const canGenerate = hasCredits(creditCost) && prompt.trim().length > 0;
  const plan = getCurrentPlanDetails();

  const generate = async () => {
    if (!prompt.trim()) {
      toast({ title: "Please enter a prompt", variant: "destructive" });
      return;
    }

    if (!hasCredits(creditCost)) {
      toast({ 
        title: "Insufficient credits", 
        description: "Please upgrade your plan to continue generating videos.",
        variant: "destructive" 
      });
      return;
    }

    setIsGenerating(true);
    setGenerationProgress("🎬 Preparing your cinematic scene...");
    setVideoUrl(null);

    try {
      // Get session for auth
      const { data: { session } } = await supabase.auth.getSession();
      
      setGenerationProgress("✨ Enhancing prompt with cinematic grammar...");
      const enhanced = quickEnhance(prompt, preset);
      
      setGenerationProgress("🎥 Generating video via AI...");

      // Call the edge function directly
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/lucy-generate-video`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session?.access_token}`,
          },
          body: JSON.stringify({
            prompt: enhanced,
            duration,
            width: aspectRatio === "9:16" ? 720 : 1280,
            height: aspectRatio === "9:16" ? 1280 : 720,
            enhance_prompt: true,
            style_preset: preset,
          }),
        }
      );

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Video generation failed");
      }

      const result = await res.json();
      
      if (result.video_url) {
        setVideoUrl(result.video_url);
        setGenerationProgress("✅ Your cinematic video is ready!");
        toast({ title: "Video generated successfully!" });
      } else {
        throw new Error("No video URL returned");
      }
    } catch (error: any) {
      console.error("Generation error:", error);
      toast({ 
        title: "Generation failed", 
        description: error.message,
        variant: "destructive" 
      });
      setGenerationProgress("");
    } finally {
      setIsGenerating(false);
      fetchJobs();
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Film className="w-8 h-8 text-primary" />
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">
              Lucy Cinematic Studio
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="flex items-center gap-1">
              <CreditCard className="w-3 h-3" />
              {userPlan?.credits_balance || 0} credits
            </Badge>
            <Badge variant="secondary">{plan?.name || "Free"}</Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Controls */}
          <div className="lg:col-span-2 space-y-6">
            {/* Prompt Input */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  Describe Your Scene
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="A majestic eagle soaring through golden sunset clouds over a mountain range..."
                  className="min-h-[120px] resize-none"
                  disabled={isGenerating}
                />
                
                {/* Duration Slider */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Duration</span>
                    <span className="font-medium">{duration} seconds</span>
                  </div>
                  <Slider
                    value={[duration]}
                    onValueChange={([v]) => setDuration(v)}
                    min={3}
                    max={plan?.max_duration_seconds || 10}
                    step={1}
                    disabled={isGenerating}
                  />
                </div>

                {/* Aspect Ratio */}
                <div className="flex gap-2">
                  {["16:9", "9:16", "1:1"].map((ratio) => (
                    <Button
                      key={ratio}
                      variant={aspectRatio === ratio ? "default" : "outline"}
                      size="sm"
                      onClick={() => setAspectRatio(ratio)}
                      disabled={isGenerating}
                    >
                      {ratio}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Style Presets */}
            <Card>
              <CardHeader>
                <CardTitle>Style Preset</CardTitle>
              </CardHeader>
              <CardContent>
                <LucyPresetPicker value={preset} onChange={setPreset} />
              </CardContent>
            </Card>

            {/* Generate Button */}
            <Button
              onClick={generate}
              disabled={!canGenerate || isGenerating}
              className="w-full h-14 text-lg font-semibold"
              size="lg"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Zap className="w-5 h-5 mr-2" />
                  Generate Video ({creditCost} credits)
                </>
              )}
            </Button>

            {/* Progress Message */}
            {generationProgress && (
              <div className="p-4 rounded-lg bg-muted/50 text-center">
                <p className="text-muted-foreground">{generationProgress}</p>
              </div>
            )}

            {/* Video Player */}
            <LucyVideoPlayer videoUrl={videoUrl} />

            {/* Export Panel */}
            {videoUrl && (
              <LucyExportPanel 
                videoUrl={videoUrl}
                onExport={(platforms) => {
                  toast({ 
                    title: "Export started", 
                    description: `Preparing exports for ${platforms.join(", ")}` 
                  });
                }} 
              />
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Queue Panel */}
            <Card>
              <CardHeader>
                <CardTitle>Generation Queue</CardTitle>
              </CardHeader>
              <CardContent>
                <LucyQueuePanel
                  queued={jobQueue}
                  running={activeJobs}
                  onCancel={cancelJob}
                  onRetry={retryJob}
                />
              </CardContent>
            </Card>

            {/* Timeline Editor */}
            <Card>
              <CardHeader>
                <CardTitle>Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <LucyTimelineEditor shots={[]} />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
