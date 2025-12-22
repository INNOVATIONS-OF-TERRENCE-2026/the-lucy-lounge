import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import {
  Wrench,
  Brain,
  MoonStar,
  Eye,
  Users,
  History,
  Command,
  Atom,
  Sparkles,
  Globe,
  Headphones,
  Film,
} from "lucide-react";

const Tools = () => {
  const navigate = useNavigate();

  const LOUNGES = [
    { title: "Listening Mode", icon: Headphones, path: "/listening-mode" },
    { title: "Media Mode", icon: Film, path: "/media" },

    { title: "Neural Mode", icon: Brain, path: "/neural" },
    { title: "Dream Mode", icon: MoonStar, path: "/dream" },
    { title: "Vision Mode", icon: Eye, path: "/vision" },
    { title: "Silent Room", icon: Users, path: "/silent-room" },
    { title: "Memory Timeline", icon: History, path: "/timeline" },
    { title: "Quantum Mode", icon: Atom, path: "/quantum" },
    { title: "Presence Mode", icon: Sparkles, path: "/presence" },
    { title: "World Events", icon: Globe, path: "/events" },
    { title: "Command Center", icon: Command, path: "/command" },
  ];

  const COMING_SOON_TOOLS = [
    "PDF Text Extractor",
    "Website Summarizer",
    "Image Captioning",
    "Math Calculator",
    "HTML to Text",
    "Data Table Analyzer",
    "Code Executor",
    "Safe Web Fetcher",
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b bg-muted/20">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Wrench className="w-5 h-5" /> Lucy Tools & Lounges
          </h1>
          <Button variant="ghost" onClick={() => navigate(-1)}>
            Back
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-10 space-y-12">
        {/* LOUNGES */}
        <section>
          <h2 className="text-2xl font-semibold mb-6">🌌 Lucy Lounges</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {LOUNGES.map((l) => (
              <Card key={l.path} className="cursor-pointer hover:shadow-lg transition" onClick={() => navigate(l.path)}>
                <CardHeader className="flex flex-row items-center gap-3">
                  <l.icon className="h-5 w-5" />
                  <CardTitle>{l.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">Enter this cinematic Lucy Lounge experience.</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* COMING SOON TOOLS */}
        <section>
          <h2 className="text-2xl font-semibold mb-6">🚀 AI Tools (Coming January 2026)</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {COMING_SOON_TOOLS.map((tool) => (
              <Card key={tool} className="opacity-50 pointer-events-none border-dashed">
                <CardHeader>
                  <CardTitle>{tool}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">Coming soon…</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

export default Tools;
