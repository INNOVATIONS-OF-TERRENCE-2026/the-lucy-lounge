/**
 * ┌─────────────────────────────────────────────────────────────────────────────┐
 * │ THE LUCY LOUNGE — WEBSITE SUMMARIZER TOOL                                  │
 * │                                                                             │
 * │ AI-powered website summarization with model selection and streaming        │
 * │                                                                             │
 * │ Lucy reads the web for you.                                                │
 * └─────────────────────────────────────────────────────────────────────────────┘
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Globe, 
  Loader2, 
  Copy, 
  ExternalLink, 
  FileText,
  Clock,
  Hash,
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ToolLayout } from '@/components/tools/ToolLayout';

// =============================================================================
// COMPONENT
// =============================================================================

const WebsiteSummarizer = () => {
  return (
    <ToolLayout
      toolId="summarizer"
      toolName="Website Summarizer"
      toolDescription="Get AI-powered summaries of any webpage"
      toolIcon={<Globe className="w-5 h-5 text-primary" />}
      defaultModel="gpt-4o-mini"
      showModelSelector={true}
      showHistory={true}
      enableStreaming={true}
    >
      {(props) => <SummarizerContent {...props} />}
    </ToolLayout>
  );
};

interface SummarizerContentProps {
  execute: <T>(input: Record<string, unknown>, processor?: (data: unknown) => T) => Promise<T | null>;
  isExecuting: boolean;
  isStreaming: boolean;
  streamedOutput: string;
  result: any;
  error: string | null;
  copyToClipboard: (text: string) => void;
}

function SummarizerContent({ 
  execute, 
  isExecuting, 
  isStreaming,
  streamedOutput,
  result, 
  error,
  copyToClipboard 
}: SummarizerContentProps) {
  const [url, setUrl] = useState('');
  const [activeTab, setActiveTab] = useState<'summary' | 'raw'>('summary');

  const isValidUrl = (str: string): boolean => {
    try {
      const parsed = new URL(str.startsWith('http') ? str : `https://${str}`);
      return ['http:', 'https:'].includes(parsed.protocol);
    } catch {
      return false;
    }
  };

  const handleSummarize = async () => {
    if (!url.trim()) return;

    let targetUrl = url.trim();
    if (!targetUrl.startsWith('http')) {
      targetUrl = 'https://' + targetUrl;
    }

    if (!isValidUrl(targetUrl)) return;

    await execute({ url: targetUrl });
  };

  const summary = result?.output || result?.outputJson?.summary || streamedOutput;
  const title = result?.outputJson?.title;
  const wordCount = result?.outputJson?.wordCount || 0;
  const readingTime = result?.outputJson?.readingTime || Math.ceil(wordCount / 200);

  return (
    <div className="space-y-6">
      {/* Input Section */}
      <Card>
        <CardHeader>
          <CardTitle>Enter Website URL</CardTitle>
          <CardDescription>
            Paste a URL to fetch and summarize its content using AI
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="https://example.com/article"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              disabled={isExecuting}
              onKeyDown={(e) => e.key === 'Enter' && handleSummarize()}
              className="flex-1"
            />
            <Button 
              onClick={handleSummarize} 
              disabled={isExecuting || !url.trim() || !isValidUrl(url)}
              className="min-w-[120px]"
            >
              {isExecuting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Summarize
                </>
              )}
            </Button>
          </div>

          {/* Quick Examples */}
          <div className="flex flex-wrap gap-2">
            <span className="text-sm text-muted-foreground">Try:</span>
            {[
              'wikipedia.org/wiki/Artificial_intelligence',
              'bbc.com/news',
              'techcrunch.com',
            ].map((example) => (
              <Button
                key={example}
                variant="outline"
                size="sm"
                onClick={() => setUrl(example)}
                disabled={isExecuting}
              >
                {example.split('/')[0]}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Results Section */}
      {(summary || isStreaming) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-primary" />
                    {title || 'Summary'}
                  </CardTitle>
                  <CardDescription className="flex items-center gap-4 mt-2">
                    {wordCount > 0 && (
                      <span className="flex items-center gap-1">
                        <Hash className="w-3 h-3" />
                        {wordCount.toLocaleString()} words
                      </span>
                    )}
                    {readingTime > 0 && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {readingTime} min read
                      </span>
                    )}
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => copyToClipboard(summary)}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy
                  </Button>
                  {url && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => window.open(url.startsWith('http') ? url : `https://${url}`, '_blank')}
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Visit
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'summary' | 'raw')}>
                <TabsList>
                  <TabsTrigger value="summary">Summary</TabsTrigger>
                  <TabsTrigger value="raw">Raw Data</TabsTrigger>
                </TabsList>
                <TabsContent value="summary" className="mt-4">
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    <p className="whitespace-pre-wrap leading-relaxed">
                      {summary}
                      {isStreaming && (
                        <span className="inline-block w-2 h-4 bg-primary animate-pulse ml-1" />
                      )}
                    </p>
                  </div>
                </TabsContent>
                <TabsContent value="raw" className="mt-4">
                  <Textarea
                    value={JSON.stringify(result?.outputJson || {}, null, 2)}
                    readOnly
                    rows={15}
                    className="font-mono text-sm"
                  />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Features */}
      {!summary && !isExecuting && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-card/50">
            <CardContent className="pt-6">
              <Globe className="w-8 h-8 text-primary mb-3" />
              <h3 className="font-medium mb-1">Any Website</h3>
              <p className="text-sm text-muted-foreground">
                Works with articles, blogs, news sites, and more
              </p>
            </CardContent>
          </Card>
          <Card className="bg-card/50">
            <CardContent className="pt-6">
              <Sparkles className="w-8 h-8 text-primary mb-3" />
              <h3 className="font-medium mb-1">AI-Powered</h3>
              <p className="text-sm text-muted-foreground">
                Choose from multiple AI models for best results
              </p>
            </CardContent>
          </Card>
          <Card className="bg-card/50">
            <CardContent className="pt-6">
              <FileText className="w-8 h-8 text-primary mb-3" />
              <h3 className="font-medium mb-1">Key Points</h3>
              <p className="text-sm text-muted-foreground">
                Extracts main ideas and important details
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

export default WebsiteSummarizer;
