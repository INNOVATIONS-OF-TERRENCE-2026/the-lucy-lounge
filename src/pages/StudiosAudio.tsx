import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { StudiosSEO } from "@/components/seo/StudiosSEO";

import { AudioStudioHero } from "@/components/studios/AudioStudioHero";
import { AudioStudioFeatures } from "@/components/studios/AudioStudioFeatures";
import { AudioStudioWorkspaces } from "@/components/studios/AudioStudioWorkspaces";
import { AudioStudioCTA } from "@/components/studios/AudioStudioCTA";

const StudiosAudio = () => {
  const navigate = useNavigate();

  return (
    <>
      <StudiosSEO studio="audio" />

      <div className="min-h-screen bg-gradient-primary relative overflow-hidden">

        {/* Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse-glow" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: "1s" }} />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/25 to-black/35 pointer-events-none" />

        <div className="relative z-10 container mx-auto px-6 py-12">

          <Button
            variant="ghost"
            onClick={() => navigate("/studios")}
            className="mb-8 text-white hover:bg-white/10"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Studios
          </Button>

          <AudioStudioHero />
          <AudioStudioFeatures />
          <AudioStudioWorkspaces />
          <AudioStudioCTA />

        </div>
      </div>
    </>
  );
};

export default StudiosAudio;
