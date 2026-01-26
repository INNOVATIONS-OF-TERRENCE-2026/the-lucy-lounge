import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Image as ImageIcon, Upload, Copy, Loader2, AlertCircle, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const ImageCaptioning = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const [detailedDescription, setDetailedDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      if (!selected.type.startsWith("image/")) {
        setError("Please select an image file");
        return;
      }
      if (selected.size > 5 * 1024 * 1024) {
        setError("File size must be under 5MB");
        return;
      }
      
      setFile(selected);
      setError(null);
      setCaption("");
      setDetailedDescription("");
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target?.result as string);
      reader.readAsDataURL(selected);
    }
  };

  const analyzeImage = async () => {
    if (!file || !preview) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Use HuggingFace vision model for image analysis
      const { data, error: apiError } = await supabase.functions.invoke("hf-vision", {
        body: {
          imageBase64: preview.split(",")[1],
          prompt: "Describe this image in detail. Include: 1) A brief one-line caption, 2) Detailed description of what's shown, 3) Any notable elements, colors, composition, or context."
        }
      });

      if (apiError) throw apiError;

      if (data?.description) {
        // Parse the response
        const text = data.description;
        
        // Try to extract caption and description
        const lines = text.split("\n").filter((l: string) => l.trim());
        if (lines.length > 0) {
          setCaption(lines[0]);
          setDetailedDescription(lines.slice(1).join("\n") || text);
        } else {
          setCaption(text.slice(0, 100));
          setDetailedDescription(text);
        }
        
        toast({ title: "Success", description: "Image analyzed successfully" });
      } else {
        // Fallback to lucy-router with text description
        const { data: fallbackData } = await supabase.functions.invoke("lucy-router", {
          body: {
            userId: "anonymous",
            messages: [
              {
                role: "user",
                content: `Generate a detailed caption for this image. The image is a ${file.type} file named "${file.name}".`
              }
            ]
          }
        });

        const fallbackText = fallbackData?.plan?.finalAnswer || "Unable to analyze image";
        setCaption(fallbackText.slice(0, 100));
        setDetailedDescription(fallbackText);
      }
    } catch (err: any) {
      console.error("[ImageCaptioning] Error:", err);
      setError(err.message || "Failed to analyze image");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text);
    toast({ title: "Copied", description: "Text copied to clipboard" });
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur border-b">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <ImageIcon className="h-6 w-6 text-primary" />
              Image Captioning
            </h1>
            <p className="text-sm text-muted-foreground">Generate AI descriptions for images</p>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Upload Image</CardTitle>
            <CardDescription>
              Select an image to generate an AI-powered caption and description
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
            
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
            >
              {preview ? (
                <img 
                  src={preview} 
                  alt="Preview" 
                  className="max-h-64 mx-auto rounded-lg object-contain"
                />
              ) : (
                <>
                  <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-lg font-medium">Click to upload image</p>
                  <p className="text-sm text-muted-foreground">PNG, JPG, GIF up to 5MB</p>
                </>
              )}
            </div>

            {file && (
              <p className="text-sm text-muted-foreground text-center">
                {file.name} ({(file.size / 1024).toFixed(1)} KB)
              </p>
            )}

            {error && (
              <div className="flex items-center gap-2 text-destructive">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            <Button 
              onClick={analyzeImage} 
              disabled={!file || loading}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate Caption
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {caption && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Caption</CardTitle>
                <CardDescription>Short description of the image</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={() => copyToClipboard(caption)}>
                <Copy className="h-4 w-4 mr-2" />
                Copy
              </Button>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-medium">{caption}</p>
            </CardContent>
          </Card>
        )}

        {detailedDescription && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Detailed Description</CardTitle>
                <CardDescription>Complete analysis of the image</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={() => copyToClipboard(detailedDescription)}>
                <Copy className="h-4 w-4 mr-2" />
                Copy
              </Button>
            </CardHeader>
            <CardContent>
              <Textarea
                value={detailedDescription}
                readOnly
                rows={8}
                className="text-sm"
              />
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
};

export default ImageCaptioning;
