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
  FileText,
  Calculator,
  Image,
  Code,
  Database,
} from "lucide-react";

const Tools = () => {
  const navigate = useNavigate();

  const LOUNGES = [
    { title: "Listening Mode", icon: Headphones, path: "/listening-mode", description: "AI-powered music discovery" },
    { title: "Media Mode", icon: Film, path: "/media", description: "Free movies & TV shows" },
    { title: "Neural Mode", icon: Brain, path: "/neural", description: "Deep thinking & analysis" },
    { title: "Dream Mode", icon: MoonStar, path: "/dream", description: "Creative visualization" },
    { title: "Vision Mode", icon: Eye, path: "/vision", description: "Visual intelligence" },
    { title: "Silent Room", icon: Users, path: "/silent-room", description: "Focused work space" },
    { title: "Memory Timeline", icon: History, path: "/timeline", description: "Your conversation history" },
    { title: "Quantum Mode", icon: Atom, path: "/quantum", description: "Advanced reasoning" },
    { title: "Presence Mode", icon: Sparkles, path: "/presence", description: "Mindful AI companion" },
    { title: "World Events", icon: Globe, path: "/events", description: "Global news & insights" },
    { title: "Command Center", icon: Command, path: "/command", description: "Admin dashboard" },
  ];

  const AI_TOOLS = [
    { title: "PDF Text Extractor", icon: FileText, path: "/tools/pdf-extractor", description: "Extract text from PDF files" },
    { title: "Website Summarizer", icon: Globe, path: "/tools/website-summarizer", description: "AI-powered webpage summaries" },
    { title: "Image Captioning", icon: Image, path: "/tools/image-captioning", description: "Generate image descriptions" },
    { title: "Math Calculator", icon: Calculator, path: "/tools/calculator", description: "Scientific calculator with AI" },
    { title: "HTML to Text", icon: Code, path: "/tools/html-to-text", description: "Clean text from HTML" },
    { title: "Data Table Analyzer", icon: Database, path: "/tools/data-analyzer", description: "Analyze CSV data with AI" },
    { title: "Code Executor", icon: Code, path: "/tools/code-executor", description: "Safe code analysis & simulation" },
    { title: "Web Fetcher", icon: Globe, path: "/tools/web-fetcher", description: "Fetch content from websites" },
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
        {/* AI TOOLS */}
        <section>
          <h2 className="text-2xl font-semibold mb-6">🚀 AI Tools</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {AI_TOOLS.map((tool) => (
              <Card 
                key={tool.path} 
                className="cursor-pointer hover:shadow-lg hover:border-primary/50 transition group"
                onClick={() => navigate(tool.path)}
              >
                <CardHeader className="flex flex-row items-center gap-3 pb-2">
                  <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition">
                    <tool.icon className="h-5 w-5 text-primary" />
                  </div>
                  <CardTitle className="text-base">{tool.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{tool.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* LOUNGES */}
        <section>
          <h2 className="text-2xl font-semibold mb-6">🌌 Lucy Lounges</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {LOUNGES.map((l) => (
              <Card 
                key={l.path} 
                className="cursor-pointer hover:shadow-lg hover:border-primary/50 transition group" 
                onClick={() => navigate(l.path)}
              >
                <CardHeader className="flex flex-row items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition">
                    <l.icon className="h-5 w-5 text-primary" />
                  </div>
                  <CardTitle>{l.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{l.description}</p>
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
