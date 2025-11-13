import { Sparkles } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

interface ModelSelectorProps {
  selectedModel: string | null;
  onModelChange: (model: string | null) => void;
  fusionEnabled: boolean;
  onFusionToggle: (enabled: boolean) => void;
}

const models = [
  { value: 'auto', label: 'Auto-Select (Smart Routing)', description: 'Let Lucy choose the best model' },
  { value: 'google/gemini-2.5-flash', label: 'Gemini 2.5 Flash', description: 'Balanced & fast' },
  { value: 'google/gemini-2.5-pro', label: 'Gemini 2.5 Pro', description: 'Deep reasoning' },
  { value: 'google/gemini-2.5-flash-lite', label: 'Gemini Flash Lite', description: 'Quick responses' },
  { value: 'openai/gpt-5-mini', label: 'GPT-5 Mini', description: 'Creative & versatile' },
  { value: 'openai/gpt-5', label: 'GPT-5', description: 'Maximum intelligence' },
];

export function ModelSelector({ selectedModel, onModelChange, fusionEnabled, onFusionToggle }: ModelSelectorProps) {
  return (
    <div className="space-y-4 p-4 border-t border-border">
      <div className="space-y-2">
        <Label className="text-sm font-medium">AI Model</Label>
        <Select
          value={selectedModel || 'auto'}
          onValueChange={(value) => onModelChange(value === 'auto' ? null : value)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {models.map((model) => (
              <SelectItem key={model.value} value={model.value}>
                <div>
                  <div className="font-medium">{model.label}</div>
                  <div className="text-xs text-muted-foreground">{model.description}</div>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label className="text-sm font-medium flex items-center gap-1">
            <Sparkles className="w-4 h-4 text-primary" />
            Fusion Mode
          </Label>
          <p className="text-xs text-muted-foreground">
            Combine multiple AI models for complex queries
          </p>
        </div>
        <Switch
          checked={fusionEnabled}
          onCheckedChange={onFusionToggle}
        />
      </div>
    </div>
  );
}