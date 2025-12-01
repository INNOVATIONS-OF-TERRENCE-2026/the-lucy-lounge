import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, MessageSquare, Brain, Sparkles, Zap, Search, Code } from "lucide-react";
import { LucyAvatar } from "@/components/avatar/LucyAvatar";
import { StudiosSEO } from "@/components/seo/StudiosSEO";

const StudiosAI = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: Brain,
      title: "Advanced Reasoning",
      description: "Multi-step chain-of-thought analysis for complex problems",
    },
    {
      icon: Sparkles,
      title: "Creative Generation",
      description: "Generate images, content, and creative solutions",
    },
    {
      icon: Search,
      title: "Web Search",
      description: "Real-time information from the web when needed",
    },
    {
      icon: Code,
      title: "Code Execution",
      description: "Run and analyze code safely in isolated environments",
    },
  ];

  return (
    <>
      <StudiosSEO studio="ai" />
      <div className="min-h-screen bg-gradient-primary relative overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet-500/20 rounded-full blur-3xl animate-pulse-glow" />
          <div
            className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse-glow"
            style={{ animationDelay: "1s" }}
          />
        </div>

        <div className="absolute inset-0 bg-gradient-to-b from-black/25 to-black/35 pointer-events-none" />

        <div className="relative z-10 container mx-auto px-6 py-12">
          {/* Back Button */}
          <Button variant="ghost" onClick={() => navigate("/studios")} className="mb-8 text-white hover:bg-white/10">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Studios
          </Button>

          {/* Hero Section */}
          <div className="text-center mb-16 max-w-4xl mx-auto">
            <div className="mb-8 flex justify-center">
              <LucyAvatar size="lg" state="happy" className="drop-shadow-2xl" />
            </div>
            <h1 className="text-6xl md:text-7xl font-bold mb-6 text-white text-shadow-strong">AI Studio</h1>
            <p className="text-xl md:text-2xl text-white/90 mb-8 text-shadow-soft">
              Lucy's Core Intelligence Workspace
            </p>
            <p className="text-lg text-white/80 mb-12">
              Advanced reasoning, multi-modal understanding, and intelligent automation powered by Lucy's core AI
              system.
            </p>

            <Button
              size="lg"
              className="bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white px-8 py-6 text-lg"
              onClick={() => navigate("/chat")}
            >
              <MessageSquare className="w-5 h-5 mr-2" />
              Open AI Studio
            </Button>
          </div>

          {/* Features Grid */}
          <div className="max-w-5xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-white mb-8 text-center">Core Capabilities</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {features.map((feature, index) => (
                <div key={index} className="glass-card-enhanced p-8 hover:scale-105 transition-transform">
                  <feature.icon className="w-12 h-12 text-white mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
                  <p className="text-white/80">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-white mb-8">Get Started</h2>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white/10"
                onClick={() => navigate("/chat")}
              >
                <Zap className="w-5 h-5 mr-2" />
                Start New Chat
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white/10"
                onClick={() => navigate("/tools")}
              >
                <Sparkles className="w-5 h-5 mr-2" />
                Explore Tools
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default StudiosAI;
