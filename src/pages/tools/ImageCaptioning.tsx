/**
 * ┌─────────────────────────────────────────────────────────────────────────────┐
 * │ THE LUCY LOUNGE — IMAGE CAPTIONING TOOL                                    │
 * │                                                                             │
 * │ AI-powered image analysis with captions, tags, and object detection        │
 * │                                                                             │
 * │ Lucy sees what you see.                                                    │
 * └─────────────────────────────────────────────────────────────────────────────┘
 */

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  Image as ImageIcon, 
  Loader2, 
  Copy, 
  Upload,
  Link,
  Tag,
  Eye,
  Palette,
  Sparkles,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ToolLayout } from '@/components/tools/ToolLayout';

// =============================================================================
// COMPONENT
// =============================================================================

const ImageCaptioning = () => {
  return (
    <ToolLayout
      toolId="captioning"
      toolName="Image Captioning"
      toolDescription="Generate AI descriptions and tags for any image"
      toolIcon={<ImageIcon className="w-5 h-5 text-primary" />}
      defaultModel="gpt-4o-mini"
      showModelSelector={true}
      showHistory={true}
      enableStreaming={false}
    >
      {(props) => <CaptioningContent {...props} />}
    </ToolLayout>
  );
};

interface CaptioningContentProps {
  execute: <T>(input: Record<string, unknown>, processor?: (data: unknown) => T) => Promise<T | null>;
  isExecuting: boolean;
  result: any;
  error: string | null;
  copyToClipboard: (text: string) => void;
}

function CaptioningContent({ 
  execute, 
  isExecuting, 
  result, 
  error,
  copyToClipboard 
}: CaptioningContentProps) {
  const [inputMode, setInputMode] = useState<'url' | 'upload'>('url');
  const [imageUrl, setImageUrl] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleUrlSubmit = async () => {
    if (!imageUrl.trim()) return;
    setImagePreview(imageUrl);
    await execute({ imageUrl });
  };

  const handleFileUpload = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64 = e.target?.result as string;
      setImagePreview(base64);
      await execute({ imageBase64: base64.split(',')[1] });
    };
    reader.readAsDataURL(file);
  }, [execute]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    
    const file = e.dataTransfer.files[0];
    if (file) handleFileUpload(file);
  }, [handleFileUpload]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = () => {
    setDragActive(false);
  };

  const clearImage = () => {
    setImageUrl('');
    setImagePreview(null);
  };

  const caption = result?.outputJson?.caption || result?.output;
  const tags = result?.outputJson?.tags || [];
  const objects = result?.outputJson?.objects || [];
  const colors = result?.outputJson?.colors || [];
  const confidence = result?.outputJson?.confidence || 0;

  return (
    <div className="space-y-6">
      {/* Input Section */}
      <Card>
        <CardHeader>
          <CardTitle>Upload or Link an Image</CardTitle>
          <CardDescription>
            Provide an image URL or upload a file to analyze
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Tabs value={inputMode} onValueChange={(v) => setInputMode(v as 'url' | 'upload')}>
            <TabsList>
              <TabsTrigger value="url">
                <Link className="w-4 h-4 mr-2" />
                URL
              </TabsTrigger>
              <TabsTrigger value="upload">
                <Upload className="w-4 h-4 mr-2" />
                Upload
              </TabsTrigger>
            </TabsList>

            <TabsContent value="url" className="mt-4">
              <div className="flex gap-2">
                <Input
                  placeholder="https://example.com/image.jpg"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  disabled={isExecuting}
                  onKeyDown={(e) => e.key === 'Enter' && handleUrlSubmit()}
                />
                <Button 
                  onClick={handleUrlSubmit} 
                  disabled={isExecuting || !imageUrl.trim()}
                >
                  {isExecuting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Analyze
                    </>
                  )}
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="upload" className="mt-4">
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  dragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'
                }`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
              >
                <Upload className="w-10 h-10 mx-auto text-muted-foreground mb-4" />
                <p className="text-sm text-muted-foreground mb-2">
                  Drag and drop an image here, or
                </p>
                <label>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
                    disabled={isExecuting}
                  />
                  <Button variant="outline" disabled={isExecuting} asChild>
                    <span>Browse Files</span>
                  </Button>
                </label>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Preview & Results */}
      {imagePreview && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Image Preview */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Image Preview</CardTitle>
                  <Button variant="ghost" size="icon" onClick={clearImage}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-full object-contain"
                  />
                  {isExecuting && (
                    <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                      <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Results */}
          {caption && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Eye className="w-5 h-5 text-primary" />
                      Analysis Results
                    </CardTitle>
                    {confidence > 0 && (
                      <Badge variant="secondary">
                        {Math.round(confidence * 100)}% confidence
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Caption */}
                  <div>
                    <h4 className="text-sm font-medium mb-2">Caption</h4>
                    <p className="text-muted-foreground">{caption}</p>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="mt-2"
                      onClick={() => copyToClipboard(caption)}
                    >
                      <Copy className="w-3 h-3 mr-2" />
                      Copy
                    </Button>
                  </div>

                  {/* Tags */}
                  {tags.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                        <Tag className="w-4 h-4" />
                        Tags
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {tags.map((tag: string, i: number) => (
                          <Badge key={i} variant="outline">{tag}</Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Objects */}
                  {objects.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                        <Eye className="w-4 h-4" />
                        Detected Objects
                      </h4>
                      <div className="space-y-1">
                        {objects.map((obj: { name: string; confidence: number }, i: number) => (
                          <div key={i} className="flex items-center justify-between text-sm">
                            <span>{obj.name}</span>
                            <span className="text-muted-foreground">
                              {Math.round(obj.confidence * 100)}%
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Colors */}
                  {colors.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                        <Palette className="w-4 h-4" />
                        Dominant Colors
                      </h4>
                      <div className="flex gap-2">
                        {colors.map((color: string, i: number) => (
                          <div
                            key={i}
                            className="w-8 h-8 rounded-full border"
                            style={{ backgroundColor: color }}
                            title={color}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      )}

      {/* Features */}
      {!imagePreview && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-card/50">
            <CardContent className="pt-6">
              <Eye className="w-8 h-8 text-primary mb-3" />
              <h3 className="font-medium mb-1">Smart Captions</h3>
              <p className="text-sm text-muted-foreground">
                Generate detailed descriptions of any image
              </p>
            </CardContent>
          </Card>
          <Card className="bg-card/50">
            <CardContent className="pt-6">
              <Tag className="w-8 h-8 text-primary mb-3" />
              <h3 className="font-medium mb-1">Auto Tagging</h3>
              <p className="text-sm text-muted-foreground">
                Automatically extract relevant tags and keywords
              </p>
            </CardContent>
          </Card>
          <Card className="bg-card/50">
            <CardContent className="pt-6">
              <Palette className="w-8 h-8 text-primary mb-3" />
              <h3 className="font-medium mb-1">Color Analysis</h3>
              <p className="text-sm text-muted-foreground">
                Identify dominant colors in the image
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

export default ImageCaptioning;
