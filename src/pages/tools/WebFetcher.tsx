/**
 * ┌─────────────────────────────────────────────────────────────────────────────┐
 * │ THE LUCY LOUNGE — WEB FETCHER TOOL                                         │
 * │                                                                             │
 * │ Safe web content extraction with metadata and link analysis                │
 * │                                                                             │
 * │ Lucy fetches the web safely.                                               │
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
  Link,
  Image as ImageIcon,
  Hash,
  Tag,
  User,
  Calendar,
  Download
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ToolLayout } from '@/components/tools/ToolLayout';

// =============================================================================
// COMPONENT
// =============================================================================

const WebFetcher = () => {
  return (
    <ToolLayout
      toolId="web-fetcher"
      toolName="Web Fetcher"
      toolDescription="Extract content, metadata, and links from any webpage"
      toolIcon={<Globe className="w-5 h-5 text-primary" />}
      defaultModel="gpt-4o-mini"
      showModelSelector={false}
      showHistory={true}
      enableStreaming={false}
    >
      {(props) => <FetcherContent {...props} />}
    </ToolLayout>
  );
};

interface FetcherContentProps {
  execute: <T>(input: Record<string, unknown>, processor?: (data: unknown) => T) => Promise<T | null>;
  isExecuting: boolean;
  result: any;
  error: string | null;
  copyToClipboard: (text: string) => void;
}

function FetcherContent({ 
  execute, 
  isExecuting, 
  result, 
  error,
  copyToClipboard 
}: FetcherContentProps) {
  const [url, setUrl] = useState('');
  const [extractMode, setExtractMode] = useState<'text' | 'html' | 'metadata' | 'all'>('all');

  const isValidUrl = (str: string): boolean => {
    try {
      const parsed = new URL(str.startsWith('http') ? str : `https://${str}`);
      return ['http:', 'https:'].includes(parsed.protocol);
    } catch {
      return false;
    }
  };

  const handleFetch = async () => {
    if (!url.trim()) return;

    let targetUrl = url.trim();
    if (!targetUrl.startsWith('http')) {
      targetUrl = 'https://' + targetUrl;
    }

    if (!isValidUrl(targetUrl)) return;

    await execute({ url: targetUrl, extractMode });
  };

  const data = result?.outputJson || {};
  const title = data.title;
  const text = data.text || data.textPreview;
  const html = data.html;
  const metadata = data.metadata || {};
  const links = data.links || [];
  const images = data.images || [];
  const wordCount = data.wordCount || (text?.split(/\s+/).length || 0);

  return (
    <div className="space-y-6">
      {/* Input Section */}
      <Card>
        <CardHeader>
          <CardTitle>Fetch Web Content</CardTitle>
          <CardDescription>
            Enter a URL to extract its content, metadata, and links
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="https://example.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              disabled={isExecuting}
              onKeyDown={(e) => e.key === 'Enter' && handleFetch()}
              className="flex-1"
            />
            <Select value={extractMode} onValueChange={(v) => setExtractMode(v as typeof extractMode)}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Data</SelectItem>
                <SelectItem value="text">Text Only</SelectItem>
                <SelectItem value="html">HTML</SelectItem>
                <SelectItem value="metadata">Metadata</SelectItem>
              </SelectContent>
            </Select>
            <Button 
              onClick={handleFetch} 
              disabled={isExecuting || !url.trim() || !isValidUrl(url)}
            >
              {isExecuting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Fetch
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {(title || text) && (
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
                    {title || 'Fetched Content'}
                  </CardTitle>
                  <CardDescription className="flex items-center gap-4 mt-2">
                    <span className="flex items-center gap-1">
                      <Hash className="w-3 h-3" />
                      {wordCount.toLocaleString()} words
                    </span>
                    <span className="flex items-center gap-1">
                      <Link className="w-3 h-3" />
                      {links.length} links
                    </span>
                    <span className="flex items-center gap-1">
                      <ImageIcon className="w-3 h-3" />
                      {images.length} images
                    </span>
                  </CardDescription>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => window.open(url.startsWith('http') ? url : `https://${url}`, '_blank')}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Visit
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="content">
                <TabsList>
                  <TabsTrigger value="content">Content</TabsTrigger>
                  <TabsTrigger value="metadata">Metadata</TabsTrigger>
                  <TabsTrigger value="links">Links ({links.length})</TabsTrigger>
                  <TabsTrigger value="images">Images ({images.length})</TabsTrigger>
                  {html && <TabsTrigger value="html">HTML</TabsTrigger>}
                </TabsList>

                <TabsContent value="content" className="mt-4">
                  <div className="space-y-4">
                    <div className="flex justify-end">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => copyToClipboard(text || '')}
                      >
                        <Copy className="w-4 h-4 mr-2" />
                        Copy Text
                      </Button>
                    </div>
                    <Textarea
                      value={text || ''}
                      readOnly
                      rows={15}
                      className="font-mono text-sm"
                    />
                  </div>
                </TabsContent>

                <TabsContent value="metadata" className="mt-4">
                  <div className="space-y-4">
                    {metadata.description && (
                      <div>
                        <h4 className="text-sm font-medium mb-1">Description</h4>
                        <p className="text-sm text-muted-foreground">{metadata.description}</p>
                      </div>
                    )}
                    {metadata.keywords && metadata.keywords.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                          <Tag className="w-4 h-4" />
                          Keywords
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {metadata.keywords.map((keyword: string, i: number) => (
                            <Badge key={i} variant="outline">{keyword}</Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    {metadata.author && (
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">{metadata.author}</span>
                      </div>
                    )}
                    {metadata.publishedDate && (
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">{metadata.publishedDate}</span>
                      </div>
                    )}
                    {metadata.ogImage && (
                      <div>
                        <h4 className="text-sm font-medium mb-2">OG Image</h4>
                        <img 
                          src={metadata.ogImage} 
                          alt="OG" 
                          className="max-w-md rounded-lg border"
                        />
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="links" className="mt-4">
                  <ScrollArea className="h-[400px]">
                    <div className="space-y-2">
                      {links.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-8">
                          No links found
                        </p>
                      ) : (
                        links.map((link: { text: string; href: string }, i: number) => (
                          <div 
                            key={i}
                            className="flex items-center justify-between p-2 rounded hover:bg-muted/50"
                          >
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium truncate">
                                {link.text || '(no text)'}
                              </div>
                              <div className="text-xs text-muted-foreground truncate">
                                {link.href}
                              </div>
                            </div>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => window.open(link.href, '_blank')}
                            >
                              <ExternalLink className="w-4 h-4" />
                            </Button>
                          </div>
                        ))
                      )}
                    </div>
                  </ScrollArea>
                </TabsContent>

                <TabsContent value="images" className="mt-4">
                  <ScrollArea className="h-[400px]">
                    {images.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-8">
                        No images found
                      </p>
                    ) : (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {images.map((img: { src: string; alt: string }, i: number) => (
                          <div 
                            key={i}
                            className="relative group"
                          >
                            <img 
                              src={img.src} 
                              alt={img.alt || 'Image'}
                              className="w-full h-32 object-cover rounded-lg border"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                              }}
                            />
                            {img.alt && (
                              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center p-2">
                                <span className="text-xs text-white text-center">
                                  {img.alt}
                                </span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </ScrollArea>
                </TabsContent>

                {html && (
                  <TabsContent value="html" className="mt-4">
                    <div className="space-y-4">
                      <div className="flex justify-end">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => copyToClipboard(html)}
                        >
                          <Copy className="w-4 h-4 mr-2" />
                          Copy HTML
                        </Button>
                      </div>
                      <Textarea
                        value={html}
                        readOnly
                        rows={15}
                        className="font-mono text-xs"
                      />
                    </div>
                  </TabsContent>
                )}
              </Tabs>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Features */}
      {!title && !text && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-card/50">
            <CardContent className="pt-6">
              <FileText className="w-8 h-8 text-primary mb-3" />
              <h3 className="font-medium mb-1">Content Extraction</h3>
              <p className="text-sm text-muted-foreground">
                Extract clean text from any webpage
              </p>
            </CardContent>
          </Card>
          <Card className="bg-card/50">
            <CardContent className="pt-6">
              <Tag className="w-8 h-8 text-primary mb-3" />
              <h3 className="font-medium mb-1">Metadata</h3>
              <p className="text-sm text-muted-foreground">
                Get title, description, keywords, and more
              </p>
            </CardContent>
          </Card>
          <Card className="bg-card/50">
            <CardContent className="pt-6">
              <Link className="w-8 h-8 text-primary mb-3" />
              <h3 className="font-medium mb-1">Link Analysis</h3>
              <p className="text-sm text-muted-foreground">
                Extract all links and images from the page
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

export default WebFetcher;
