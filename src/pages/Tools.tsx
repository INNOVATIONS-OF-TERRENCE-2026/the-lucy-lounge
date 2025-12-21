import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { Wrench } from "lucide-react";

/**
 * Tools Page
 * Disabled placeholder until January 2026 launch.
 */
const Tools = () => {
  const navigate = useNavigate();

  const TOOLS = [
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
            <Wrench className="w-5 h-5" /> Lucy Tools
          </h1>
          <Button variant="ghost" onClick={() => navigate(-1)}>
            Back
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 text-center space-y-10">
        <h2 className="text-3xl font-semibold mb-4">🚀 Lucy Tools Coming January 8 2026</h2>
        <p className="text-muted-foreground max-w-lg mx-auto">
          Our suite of AI-powered tools will be available soon. Until then, explore Lucy Lounge’s other experiences.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {TOOLS.map((tool) => (
            <Card key={tool} className="opacity-50 pointer-events-none select-none border-dashed">
              <CardHeader>
                <CardTitle>{tool}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Coming soon…</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Tools;
