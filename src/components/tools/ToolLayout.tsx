/**
 * ┌─────────────────────────────────────────────────────────────────────────────┐
 * │ THE LUCY LOUNGE — TOOL LAYOUT COMPONENT                                    │
 * │                                                                             │
 * │ Unified layout for all AI tools with model selection, history,             │
 * │ streaming output, and export capabilities                                  │
 * │                                                                             │
 * │ Lucy's tools share a consistent, premium experience.                       │
 * └─────────────────────────────────────────────────────────────────────────────┘
 */

import { ReactNode, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  History,
  Download,
  Trash2,
  Copy,
  ChevronDown,
  Loader2,
  Sparkles,
  Clock,
  Zap,
  Check,
  X,
  Settings2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { useToast } from '@/hooks/use-toast';
import { ToolErrorBoundary } from '@/components/platform/ErrorBoundary';
import { 
  useToolExecution, 
  ToolId, 
  AIModel, 
  ModelOption, 
  ToolRun,
  UseToolExecutionReturn 
} from '@/hooks/useToolExecution';

// =============================================================================
// TYPES
// =============================================================================

export interface ToolLayoutProps {
  toolId: ToolId;
  toolName: string;
  toolDescription: string;
  toolIcon: ReactNode;
  children: (props: ToolChildProps) => ReactNode;
  defaultModel?: AIModel;
  showModelSelector?: boolean;
  showHistory?: boolean;
  enableStreaming?: boolean;
}

export interface ToolChildProps extends UseToolExecutionReturn {
  // Additional helpers
  copyToClipboard: (text: string) => void;
}

// =============================================================================
// MODEL SELECTOR
// =============================================================================

interface ModelSelectorProps {
  selectedModel: AIModel;
  onSelect: (model: AIModel) => void;
  models: ModelOption[];
  disabled?: boolean;
}

function ModelSelector({ selectedModel, onSelect, models, disabled }: ModelSelectorProps) {
  const getSpeedIcon = (speed: string) => {
    switch (speed) {
      case 'fast': return <Zap className="w-3 h-3 text-green-500" />;
      case 'medium': return <Clock className="w-3 h-3 text-amber-500" />;
      case 'slow': return <Clock className="w-3 h-3 text-red-500" />;
    }
  };

  const getQualityBadge = (quality: string) => {
    switch (quality) {
      case 'standard': return <Badge variant="outline" className="text-xs">Standard</Badge>;
      case 'high': return <Badge variant="secondary" className="text-xs">High</Badge>;
      case 'premium': return <Badge className="text-xs bg-gradient-to-r from-purple-500 to-pink-500">Premium</Badge>;
    }
  };

  return (
    <Select value={selectedModel} onValueChange={(v) => onSelect(v as AIModel)} disabled={disabled}>
      <SelectTrigger className="w-[200px]">
        <SelectValue placeholder="Select model" />
      </SelectTrigger>
      <SelectContent>
        {models.map((model) => (
          <SelectItem key={model.id} value={model.id}>
            <div className="flex items-center gap-2">
              {getSpeedIcon(model.speed)}
              <span>{model.name}</span>
              {getQualityBadge(model.quality)}
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

// =============================================================================
// HISTORY PANEL
// =============================================================================

interface HistoryPanelProps {
  history: ToolRun[];
  onClear: () => void;
  onSelect: (run: ToolRun) => void;
}

function HistoryPanel({ history, onClear, onSelect }: HistoryPanelProps) {
  const formatDate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <Check className="w-3 h-3 text-green-500" />;
      case 'failed': return <X className="w-3 h-3 text-red-500" />;
      default: return <Loader2 className="w-3 h-3 animate-spin" />;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium">History</h3>
        {history.length > 0 && (
          <Button variant="ghost" size="sm" onClick={onClear}>
            <Trash2 className="w-4 h-4 mr-1" />
            Clear
          </Button>
        )}
      </div>

      {history.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">
          No history yet. Run the tool to see results here.
        </p>
      ) : (
        <ScrollArea className="h-[400px]">
          <div className="space-y-2">
            {history.map((run) => (
              <Card 
                key={run.id} 
                className="cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => onSelect(run)}
              >
                <CardContent className="p-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(run.status)}
                        <span className="text-sm font-medium truncate">
                          {JSON.stringify(run.inputData).slice(0, 50)}...
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                        <span>{run.model}</span>
                        <span>•</span>
                        <span>{formatDate(run.createdAt)}</span>
                        {run.executionTime && (
                          <>
                            <span>•</span>
                            <span>{Math.round(run.executionTime)}ms</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}

// =============================================================================
// STREAMING OUTPUT
// =============================================================================

interface StreamingOutputProps {
  content: string;
  isStreaming: boolean;
}

function StreamingOutput({ content, isStreaming }: StreamingOutputProps) {
  return (
    <div className="relative">
      <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap">
        {content}
        {isStreaming && (
          <span className="inline-block w-2 h-4 bg-primary animate-pulse ml-1" />
        )}
      </div>
    </div>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function ToolLayout({
  toolId,
  toolName,
  toolDescription,
  toolIcon,
  children,
  defaultModel = 'gpt-4o-mini',
  showModelSelector = true,
  showHistory = true,
  enableStreaming = true,
}: ToolLayoutProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'tool' | 'history'>('tool');
  const [selectedHistoryRun, setSelectedHistoryRun] = useState<ToolRun | null>(null);

  const toolExecution = useToolExecution({
    toolId,
    defaultModel,
    enableStreaming,
    persistHistory: showHistory,
  });

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({ title: 'Copied to clipboard' });
    } catch {
      toast({ title: 'Failed to copy', variant: 'destructive' });
    }
  };

  const handleExport = (format: 'json' | 'text' | 'markdown') => {
    const content = toolExecution.exportResult(format);
    if (!content) {
      toast({ title: 'No result to export', variant: 'destructive' });
      return;
    }

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${toolId}-result.${format === 'markdown' ? 'md' : format}`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: 'Exported successfully' });
  };

  const handleHistorySelect = (run: ToolRun) => {
    setSelectedHistoryRun(run);
    setActiveTab('tool');
  };

  return (
    <ToolErrorBoundary toolName={toolName}>
        <div className="min-h-screen bg-background">
          {/* Header */}
          <header className="sticky top-0 z-50 bg-background/80 backdrop-blur border-b">
            <div className="container mx-auto px-4 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
                    <ArrowLeft className="h-5 w-5" />
                  </Button>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      {toolIcon}
                    </div>
                    <div>
                      <h1 className="text-xl font-bold">{toolName}</h1>
                      <p className="text-sm text-muted-foreground">{toolDescription}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {showModelSelector && (
                    <ModelSelector
                      selectedModel={toolExecution.selectedModel}
                      onSelect={toolExecution.setSelectedModel}
                      models={toolExecution.availableModels}
                      disabled={toolExecution.isExecuting}
                    />
                  )}

                  {toolExecution.result && (
                    <Select onValueChange={(v) => handleExport(v as 'json' | 'text' | 'markdown')}>
                      <SelectTrigger className="w-[120px]">
                        <Download className="w-4 h-4 mr-2" />
                        Export
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="text">Text</SelectItem>
                        <SelectItem value="json">JSON</SelectItem>
                        <SelectItem value="markdown">Markdown</SelectItem>
                      </SelectContent>
                    </Select>
                  )}

                  {showHistory && (
                    <Sheet>
                      <SheetTrigger asChild>
                        <Button variant="outline" size="icon">
                          <History className="w-4 h-4" />
                        </Button>
                      </SheetTrigger>
                      <SheetContent>
                        <SheetHeader>
                          <SheetTitle>Tool History</SheetTitle>
                        </SheetHeader>
                        <div className="mt-4">
                          <HistoryPanel
                            history={toolExecution.history}
                            onClear={toolExecution.clearHistory}
                            onSelect={handleHistorySelect}
                          />
                        </div>
                      </SheetContent>
                    </Sheet>
                  )}
                </div>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="container mx-auto px-4 py-8">
            {/* Status Bar */}
            {(toolExecution.isExecuting || toolExecution.isStreaming) && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4"
              >
                <Card className="bg-primary/5 border-primary/20">
                  <CardContent className="py-3">
                    <div className="flex items-center gap-3">
                      <Loader2 className="w-4 h-4 animate-spin text-primary" />
                      <span className="text-sm">
                        {toolExecution.isStreaming ? 'Streaming response...' : 'Processing...'}
                      </span>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={toolExecution.cancel}
                      >
                        Cancel
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Error Display */}
            {toolExecution.error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4"
              >
                <Card className="bg-destructive/5 border-destructive/20">
                  <CardContent className="py-3">
                    <div className="flex items-center gap-3 text-destructive">
                      <X className="w-4 h-4" />
                      <span className="text-sm">{toolExecution.error}</span>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={toolExecution.reset}
                      >
                        Dismiss
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Streaming Output */}
            {toolExecution.isStreaming && toolExecution.streamedOutput && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mb-6"
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-primary" />
                      Live Output
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <StreamingOutput 
                      content={toolExecution.streamedOutput} 
                      isStreaming={toolExecution.isStreaming} 
                    />
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Tool Content */}
            {children({
              ...toolExecution,
              copyToClipboard,
            })}

            {/* Selected History Run */}
            {selectedHistoryRun && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6"
              >
                <Card className="border-primary/20">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <History className="w-5 h-5" />
                        Previous Result
                      </CardTitle>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => setSelectedHistoryRun(null)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                    <CardDescription>
                      {selectedHistoryRun.model} • {selectedHistoryRun.createdAt.toLocaleString()}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                      <pre className="whitespace-pre-wrap text-sm">
                        {selectedHistoryRun.output || JSON.stringify(selectedHistoryRun.outputJson, null, 2)}
                      </pre>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => copyToClipboard(selectedHistoryRun.output || '')}
                      >
                        <Copy className="w-4 h-4 mr-2" />
                        Copy
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </main>
        </div>
    </ToolErrorBoundary>
  );
}

export default ToolLayout;
