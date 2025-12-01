import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { MessageSquare, Music, Code, Sparkles, ArrowLeft } from "lucide-react";
import { LucyAvatar } from "@/components/avatar/LucyAvatar";
import { StudioCard } from "@/components/studios/StudioCard";
import { ToolCard } from "@/components/studios/ToolCard";
import { StudiosSEO } from "@/components/seo/StudiosSEO";

const Studios = () => {
  const navigate = useNavigate();

  const tools = [
    {
      title: "Tools Dashboard",
      description: "Access all Lucy's internal tools and utilities.",
      route: "/tools",
      category: "Utilities"
    },
    {
      title: "Tools Marketplace",
      description: "Browse and explore available Lucy tools.",
      route: "/tools/marketplace",
      category: "Discovery"
    },
    {
      title: "Creator Studio",
      description: "Content creation and media generation workspace.",
      route: "/creator-studio",
      category: "Creation"
    },
    {
      title: "Analytics Dashboard",
      description: "View usage statistics and insights.",
      route: "/analytics",
      category: "Analytics"
    },
    {
      title: "About Lucy",
      description: "Learn about Lucy AI's capabilities and vision.",
      route: "/about",
      category: "Information"
    },
    {
      title: "Features Overview",
      description: "Explore all of Lucy's advanced features.",
      route: "/features",
      category: "Information"
    },
    {
      title: "Launch Page",
      description: "Special launch announcements and updates.",
      route: "/launch",
      category: "Information"
    },
    {
      title: "Blog",
      description: "Read the latest updates and insights from Lucy.",
      route: "/blog",
      category: "Content"
    },
    {
      title: "Admin Panel",
      description: "System administration and management.",
      route: "/admin",
      category: "Admin",
      badge: "Admin Only"
    },
    {
      title: "Chat Rooms",
      description: "Collaborative chat spaces with other users.",
      route: "/rooms",
      category: "Collaboration",
      badge: "Beta"
    }
  ];

  return (
    <>
      <StudiosSEO />
      <div className="min-h-screen bg-gradient-primary relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse-glow" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/20 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: "1s" }} />
        </div>

        <div className="absolute inset-0 bg-gradient-to-b from-black/25 to-black/35 pointer-events-none" />

        <div className="relative z-10 container mx-auto px-6 py-12">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="mb-8 text-white hover:bg-white/10"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>

          <div className="text-center mb-16">
            <div className="mb-8 flex justify-center">
              <LucyAvatar size="lg" state="happy" className="drop-shadow-2xl" />
            </div>
            <h1 className="text-6xl md:text-7xl font-bold mb-6 text-white text-shadow-strong">
              Lucy Studios
            </h1>
            <p className="text-xl md:text-2xl text-white/90 mb-4 max-w-3xl mx-auto text-shadow-soft">
              Choose your workspace: AI, Audio, and Development, with more coming soon.
            </p>
          </div>

          <div className="mb-20">
            <h2 className="text-3xl font-bold text-white mb-8 text-center">
              Primary Studios
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              <StudioCard
                title="AI Studio"
                description="Chat, reasoning, and intelligent workflows powered by Lucy."
                icon={MessageSquare}
                route="/studios/ai"
                gradient="from-violet-500 to-purple-600"
              />
              <StudioCard
                title="Audio Studio"
                description="Express Audio Power workspace for music, sound design, and audio intelligence."
                icon={Music}
                route="/studios/audio"
                gradient="from-pink-500 to-rose-600"
              />
              <StudioCard
                title="Dev Studio"
                description="Express Development workspace for building websites, apps, and automation."
                icon={Code}
                route="/studios/dev"
                gradient="from-blue-500 to-cyan-600"
              />
            </div>
          </div>

          <div className="mb-12">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-white mb-4">
                <Sparkles className="inline-block w-8 h-8 mr-3 mb-1" />
                Tools & Labs
              </h2>
              <p className="text-xl text-white/80 max-w-2xl mx-auto">
                All experimental, utility, and advanced tools available in Lucy.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
              {tools.map((tool, index) => (
                <ToolCard
                  key={index}
                  title={tool.title}
                  description={tool.description}
                  route={tool.route}
                  category={tool.category}
                  badge={tool.badge}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Studios;
