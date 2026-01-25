import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { StudiosSEO } from "@/components/seo/StudiosSEO";
import { AudioStudioWorkspace } from "@/components/studios/AudioStudioWorkspace";

const StudiosAudio = () => {
  const navigate = useNavigate();

  return (
    <>
      <StudiosSEO studio="audio" />

      <div className="min-h-screen bg-gradient-to-b from-background via-background to-background/80 relative">
        {/* Background effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
        </div>

        <div className="relative z-10 container mx-auto px-6 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <Button
              variant="ghost"
              onClick={() => navigate("/studios")}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Studios
            </Button>
            
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-cyan-500 bg-clip-text text-transparent">
              Audio Studio
            </h1>
          </div>

          {/* Full workspace */}
          <AudioStudioWorkspace />
        </div>
      </div>
    </>
  );
};

export default StudiosAudio;
