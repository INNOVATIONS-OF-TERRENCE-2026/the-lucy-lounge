import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Code, Layers, Zap, Globe, Database, GitBranch, Terminal, Boxes } from "lucide-react";
import { StudiosSEO } from "@/components/seo/StudiosSEO";

const StudiosDev = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: Code,
      title: "AI Code Generation",
      description: "Generate production-ready code from descriptions",
    },
    {
      icon: Globe,
      title: "Web App Builder",
      description: "Create full-stack web applications instantly",
    },
    {
      icon: Database,
      title: "Database Design",
      description: "Intelligent database schema generation and optimization",
    },
    {
      icon: Layers,
      title: "Component Library",
      description: "Reusable UI components and design systems",
    },
    {
      icon: GitBranch,
      title: "Version Control",
      description: "Built-in Git integration and collaboration tools",
    },
    {
      icon: Terminal,
      title: "CLI Tools",
      description: "Command-line utilities and automation scripts",
    },
  ];

  const projects = [
    {
      title: "Website Generator",
      description: "Create landing pages and marketing sites",
      status: "Coming Soon",
    },
    {
      title: "SaaS Builder",
      description: "Build full SaaS applications with auth and billing",
      status: "Coming Soon",
    },
    {
      title: "API Designer",
      description: "Design and deploy REST and GraphQL APIs",
      status: "Coming Soon",
    },
  ];

  return (
    <>
      <StudiosSEO studio="dev" />
      <div className="min-h-screen bg-gradient-primary relative overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse-glow" />
          <div
            className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-pulse-glow"
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
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center shadow-glow-violet">
                <Code className="w-12 h-12 text-white" />
              </div>
            </div>
            <h1 className="text-6xl md:text-7xl font-bold mb-6 text-white text-shadow-strong">Dev Studio</h1>
            <p className="text-xl md:text-2xl text-white/90 mb-8 text-shadow-soft">Express Development</p>
            <p className="text-lg text-white/80 mb-12">
              AI-powered development workspace for building websites, applications, and automation workflows.
            </p>
          </div>

          {/* Features Grid */}
          <div className="max-w-6xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-white mb-8 text-center">Development Capabilities</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {features.map((feature, index) => (
                <div key={index} className="glass-card-enhanced p-6 hover:scale-105 transition-transform">
                  <feature.icon className="w-10 h-10 text-white mb-4" />
                  <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                  <p className="text-white/80 text-sm">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Project Types */}
          <div className="max-w-5xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-white mb-8 text-center">
              <Boxes className="inline-block w-8 h-8 mr-2 mb-1" />
              Project Workspaces
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {projects.map((project, index) => (
                <div key={index} className="glass-card-enhanced p-8 text-center">
                  <h3 className="text-xl font-semibold text-white mb-3">{project.title}</h3>
                  <p className="text-white/70 mb-4 text-sm">{project.description}</p>
                  <span className="inline-block px-4 py-2 bg-yellow-500/20 text-yellow-300 rounded-full text-sm font-medium">
                    {project.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-white mb-6">Start Building</h2>
            <p className="text-white/80 mb-8">
              Express Development is being integrated into Lucy Studios. Full development workspace coming soon!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white px-8 py-6 text-lg"
                disabled
              >
                <Code className="w-5 h-5 mr-2" />
                Launch Dev Studio (Coming Soon)
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white/10"
                onClick={() => navigate("/creator-studio")}
              >
                <Zap className="w-5 h-5 mr-2" />
                Try Creator Studio
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default StudiosDev;
