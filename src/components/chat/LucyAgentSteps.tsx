import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  Globe, 
  Code, 
  Image as ImageIcon, 
  Brain, 
  CheckCircle2,
  XCircle 
} from "lucide-react";

interface AgentStep {
  stepNumber: number;
  tool: string;
  arguments?: Record<string, any>;
  result?: any;
  durationMs?: number;
}

interface LucyAgentStepsProps {
  steps: AgentStep[];
  className?: string;
}

const toolIcons: Record<string, any> = {
  web_search: Search,
  browser_fetch: Globe,
  code_exec: Code,
  image_gen: ImageIcon,
  memory_search: Brain,
  chat: Brain,
};

export function LucyAgentSteps({ steps, className = '' }: LucyAgentStepsProps) {
  if (!steps || steps.length === 0) return null;

  return (
    <Card className={`p-4 space-y-2 bg-muted/30 ${className}`}>
      <div className="text-sm font-medium text-muted-foreground mb-3">
        Agent Process
      </div>
      {steps.map((step) => {
        const Icon = toolIcons[step.tool] || Brain;
        const hasError = step.result?.error;
        
        return (
          <div 
            key={step.stepNumber} 
            className="flex items-start gap-3 p-2 rounded-lg bg-background/50"
          >
            <div className="mt-0.5">
              {hasError ? (
                <XCircle className="w-4 h-4 text-destructive" />
              ) : (
                <CheckCircle2 className="w-4 h-4 text-primary" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Icon className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium capitalize">
                  {step.tool.replace('_', ' ')}
                </span>
                {step.durationMs && (
                  <Badge variant="secondary" className="text-xs">
                    {step.durationMs}ms
                  </Badge>
                )}
              </div>
              {step.arguments && Object.keys(step.arguments).length > 0 && (
                <div className="text-xs text-muted-foreground truncate">
                  {JSON.stringify(step.arguments).slice(0, 100)}
                </div>
              )}
              {hasError && (
                <div className="text-xs text-destructive mt-1">
                  {step.result.error}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </Card>
  );
}
