import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Music, Activity, Mic, Volume2, Radio, Headphones } from "lucide-react";
import { StudiosSEO } from "@/components/seo/StudiosSEO";

const StudiosAudio = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: Activity,
      title: "Audio Production",
      description: "Professional-grade audio editing and mixing tools"
    },
    {
      icon: Mic,
      title: "Voice Processing",
      description: "Advanced voice enhancement and modification"
    },
    {
      icon: Volume2,
      title: "Sound Design",
      description: "Create unique soundscapes and audio effects"
    },
    {
      icon: Radio,
      title: "Music Generation",
      description: "AI-powered music composition and arrangement"
    },
    {
      icon: Headphones,
      title: "Audio Analysis",
      description: "Intelligent audio recognition and analysis"
    },
    {
      icon: Music,
      title: "Beat Making",
      description: "Drum programming and rhythm creation tools"
    }
  ];

  const workspaces = [
    {
      title: "Recording Studio",
      description: "Multi-track recording with professional effects",
      status: "Coming Soon"
    },
    {
      title: "Mixing Console",
      description: "Advanced mixing and mastering workspace",
      status: "Coming Soon"
    },
    {
      title: "Sound Library",
      description: "Access thousands of samples and presets",
      status: "Coming Soon"
    }
  ];

  return (
    <>
      <StudiosSEO studio="audio" />
      <div className="min-h-screen bg-gradient-primary relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl animate-pulse-glow" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-rose-500/20 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: "1s" }} />
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

          <div className="text-center mb-16 max-w-4xl mx-auto">
            <div className="mb-8 flex justify-center">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center shadow-glow-violet">
                <Music className="w-12 h-12 text-white" />
              </div>
            </div>
            <h1 className="text-6xl md:text-7xl font-bold mb-6 text-white text-shadow-strong">
              Audio Studio
            </h1>
            <p className="text-xl md:text-2xl text-white/90 mb-8 text-shadow-soft">
              Express Audio Power
            </p>
            <p className="text-lg text-white/80 mb-12">
              Professional audio creation, sound design, and music production workspace powered by AI.
            </p>
          </div>

          <div className="max-w-6xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-white mb-8 text-center">
              Audio Capabilities
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="glass-card-enhanced p-6 hover:scale-105 transition-transform"
                >
                  <feature.icon className="w-10 h-10 text-white mb-4" />
                  <h3 className="text-lg font-semibold text-white mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-white/80 text-sm">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="max-w-5xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-white mb-8 text-center">
              Audio Workspaces
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {workspaces.map((workspace, index) => (
                <div
                  key={index}
                  className="glass-card-enhanced p-8 text-center"
                >
                  <h3 className="text-xl font-semibold text-white mb-3">
                    {workspace.title}
                  </h3>
                  <p className="text-white/70 mb-4 text-sm">
                    {workspace.description}
                  </p>
                  <span className="inline-block px-4 py-2 bg-yellow-500/20 text-yellow-300 rounded-full text-sm font-medium">
                    {workspace.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-white mb-6">
              Ready to Create?
            </h2>
            <p className="text-white/80 mb-8">
              Express Audio Power is being integrated into Lucy Studios.
              More features coming soon!
            </p>
            <Button
              size="lg"
              className="bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white px-8 py-6 text-lg"
              disabled
            >
              <Music className="w-5 h-5 mr-2" />
              Launch Audio Studio (Coming Soon)
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default StudiosAudio;
