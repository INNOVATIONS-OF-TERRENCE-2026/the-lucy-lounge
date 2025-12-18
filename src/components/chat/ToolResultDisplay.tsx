import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Image, Search, Brain, Code, Sparkles } from "lucide-react";

interface ToolResult {
  tool: string;
  params: any;
  result?: any;
  error?: string;
}

interface ToolResultDisplayProps {
  results: ToolResult[];
}

export const ToolResultDisplay = ({ results }: ToolResultDisplayProps) => {
  const safeResults = Array.isArray(results) ? results : [];

  const getToolIcon = (tool: string) => {
    switch (tool) {
      case 'generate_image': return <Image className="h-4 w-4" />;
      case 'web_search': return <Search className="h-4 w-4" />;
      case 'reasoning_engine': return <Brain className="h-4 w-4" />;
      case 'code_executor': return <Code className="h-4 w-4" />;
      default: return <Sparkles className="h-4 w-4" />;
    }
  };

  const getToolLabel = (tool: string) => {
    return tool.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <div className="space-y-2 my-3">
      {safeResults.map((result, idx) => (
        <Card key={idx} className="p-3 bg-secondary/20 border-primary/20">
          <div className="flex items-start gap-3">
            <div className="mt-1 text-primary">
              {getToolIcon(result.tool)}
            </div>
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  {getToolLabel(result.tool)}
                </Badge>
                {result.error && (
                  <Badge variant="destructive" className="text-xs">
                    Error
                  </Badge>
                )}
              </div>
              
              {result.error ? (
                <p className="text-sm text-destructive">{result.error}</p>
              ) : result.tool === 'generate_image' && result.result?.imageUrl ? (
                <div className="space-y-2">
                  <img 
                    src={result.result.imageUrl} 
                    alt="Generated" 
                    className="rounded-lg max-h-64 object-cover"
                  />
                  <p className="text-xs text-muted-foreground">{result.result.enhancedPrompt}</p>
                </div>
              ) : result.tool === 'web_search' && result.result?.results ? (
                <div className="space-y-1">
                  {result.result.results.slice(0, 3).map((r: any, i: number) => (
                    <div key={i} className="text-sm">
                      <a href={r.url} target="_blank" rel="noopener noreferrer" 
                         className="text-primary hover:underline font-medium">
                        {r.title}
                      </a>
                      <p className="text-xs text-muted-foreground line-clamp-2">{r.snippet}</p>
                    </div>
                  ))}
                </div>
              ) : result.tool === 'reasoning_engine' && result.result?.reasoning ? (
                <div className="text-sm space-y-1">
                  <p className="font-medium">Deep Analysis:</p>
                  <p className="text-muted-foreground whitespace-pre-wrap">{result.result.reasoning}</p>
                </div>
              ) : result.tool === 'code_executor' && result.result?.output ? (
                <div className="text-sm font-mono bg-background/50 p-2 rounded">
                  {result.result.output}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Tool executed successfully
                </p>
              )}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};