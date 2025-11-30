import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Search,
  Globe,
  Code,
  Image as ImageIcon,
  Brain,
  Database,
  FileText,
  Calculator,
} from "lucide-react";

interface Tool {
  id: string;
  name: string;
  description: string;
  icon: any;
  category: string;
  status: "active" | "beta" | "coming-soon";
}

const LUCY_TOOLS: Tool[] = [
  {
    id: "web_search",
    name: "Web Search",
    description: "Search the internet for real-time information and sources",
    icon: Search,
    category: "Research",
    status: "active",
  },
  {
    id: "browser_fetch",
    name: "Web Scraper",
    description: "Fetch and analyze content from any URL",
    icon: Globe,
    category: "Research",
    status: "active",
  },
  {
    id: "code_exec",
    name: "Code Executor",
    description: "Run JavaScript code safely in a sandbox environment",
    icon: Code,
    category: "Development",
    status: "active",
  },
  {
    id: "image_gen",
    name: "Image Generator",
    description: "Create images from text descriptions using AI",
    icon: ImageIcon,
    category: "Creative",
    status: "active",
  },
  {
    id: "reasoning",
    name: "Deep Reasoning",
    description: "Advanced chain-of-thought analysis for complex problems",
    icon: Brain,
    category: "Analysis",
    status: "active",
  },
  {
    id: "memory_search",
    name: "Memory Search",
    description: "Search through your conversation history and saved context",
    icon: Database,
    category: "Personal",
    status: "active",
  },
  {
    id: "pdf_reader",
    name: "Document Analyzer",
    description: "Extract and analyze text from PDFs and documents",
    icon: FileText,
    category: "Productivity",
    status: "beta",
  },
  {
    id: "calculator",
    name: "Math Engine",
    description: "Perform complex calculations and mathematical analysis",
    icon: Calculator,
    category: "Productivity",
    status: "active",
  },
];

interface ToolsMarketplaceProps {
  onToolSelect?: (toolId: string) => void;
}

export function ToolsMarketplace({ onToolSelect }: ToolsMarketplaceProps) {
  const getStatusColor = (status: Tool['status']) => {
    switch (status) {
      case "active": return "bg-green-500/10 text-green-600 border-green-500/30";
      case "beta": return "bg-yellow-500/10 text-yellow-600 border-yellow-500/30";
      case "coming-soon": return "bg-gray-500/10 text-gray-600 border-gray-500/30";
      default: return "bg-gray-500/10 text-gray-600 border-gray-500/30";
    }
  };

  const categories = Array.from(new Set(LUCY_TOOLS.map(t => t.category)));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Lucy Tools</h2>
        <p className="text-muted-foreground">
          Powerful internal capabilities powered by Lucy's engineered system
        </p>
      </div>

      {categories.map((category) => (
        <div key={category}>
          <h3 className="text-lg font-semibold mb-3 text-primary">{category}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {LUCY_TOOLS.filter(tool => tool.category === category).map((tool) => {
              const Icon = tool.icon;
              
              return (
                <Card 
                  key={tool.id}
                  className="p-4 hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => onToolSelect?.(tool.id)}
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold">{tool.name}</h4>
                        <Badge 
                          variant="outline"
                          className={`text-xs ${getStatusColor(tool.status)}`}
                        >
                          {tool.status === 'coming-soon' ? 'Coming Soon' : tool.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {tool.description}
                      </p>
                    </div>
                  </div>
                  
                  {tool.status === 'active' && (
                    <Button 
                      className="w-full mt-3" 
                      variant="outline"
                      size="sm"
                    >
                      Use Tool
                    </Button>
                  )}
                </Card>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
