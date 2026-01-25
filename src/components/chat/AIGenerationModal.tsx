import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { 
  Image, 
  Video, 
  Music, 
  Mic2, 
  FileText, 
  Sparkles,
  Loader2,
  Wand2
} from "lucide-react";
import { aiRouter } from "@/lib/aiRouter";
import { useToast } from "@/hooks/use-toast";

interface AIGenerationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGenerated: (result: {
    type: 'image' | 'video' | 'audio' | 'voice' | 'document';
    url: string;
    prompt: string;
    model?: string;
    style?: string;
    duration?: number;
  }) => void;
}

const IMAGE_MODELS = [
  { id: "sdxl", name: "SDXL (Best Quality)", description: "Stable Diffusion XL - Highest quality" },
  { id: "sdxl-turbo", name: "SDXL Turbo (Fast)", description: "Quick generation, good quality" },
  { id: "realistic", name: "Realistic Vision", description: "Photorealistic images" },
  { id: "anime", name: "Animagine XL", description: "Anime/illustration style" },
  { id: "flux", name: "FLUX Schnell", description: "Latest generation model" },
];

const VIDEO_MODELS = [
  { id: "modelscope", name: "ModelScope", description: "Text-to-video generation" },
  { id: "zeroscope", name: "Zeroscope", description: "Higher resolution video" },
  { id: "animatediff", name: "AnimateDiff", description: "Animation-style video" },
];

const MUSIC_STYLES = [
  { id: "lofi", name: "Lo-Fi", icon: "🎧" },
  { id: "ambient", name: "Ambient", icon: "🌙" },
  { id: "hiphop", name: "Hip-Hop", icon: "🎤" },
  { id: "cinematic", name: "Cinematic", icon: "🎬" },
  { id: "electronic", name: "Electronic", icon: "⚡" },
  { id: "jazz", name: "Jazz", icon: "🎷" },
  { id: "classical", name: "Classical", icon: "🎻" },
  { id: "rock", name: "Rock", icon: "🎸" },
];

const VOICE_PRESETS = [
  { id: "rachel", name: "Rachel", description: "Warm, professional female" },
  { id: "domi", name: "Domi", description: "Energetic female" },
  { id: "bella", name: "Bella", description: "Soft, gentle female" },
  { id: "antoni", name: "Antoni", description: "Deep male voice" },
  { id: "josh", name: "Josh", description: "Casual male" },
  { id: "arnold", name: "Arnold", description: "Strong male" },
];

export function AIGenerationModal({ open, onOpenChange, onGenerated }: AIGenerationModalProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("image");
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Image state
  const [imagePrompt, setImagePrompt] = useState("");
  const [imageModel, setImageModel] = useState("sdxl");
  const [negativePrompt, setNegativePrompt] = useState("");
  const [imageWidth, setImageWidth] = useState(1024);
  const [imageHeight, setImageHeight] = useState(1024);
  
  // Video state
  const [videoPrompt, setVideoPrompt] = useState("");
  const [videoModel, setVideoModel] = useState("modelscope");
  const [videoDuration, setVideoDuration] = useState(4);
  
  // Music state
  const [musicPrompt, setMusicPrompt] = useState("");
  const [musicStyle, setMusicStyle] = useState("lofi");
  const [musicDuration, setMusicDuration] = useState(15);
  
  // Voice state
  const [voiceText, setVoiceText] = useState("");
  const [voicePreset, setVoicePreset] = useState("rachel");
  
  // PDF state
  const [pdfTitle, setPdfTitle] = useState("");
  const [pdfContent, setPdfContent] = useState("");

  const handleGenerate = async () => {
    setIsGenerating(true);
    
    try {
      let result: any;
      
      switch (activeTab) {
        case "image":
          if (!imagePrompt.trim()) {
            toast({ title: "Error", description: "Please enter an image prompt", variant: "destructive" });
            return;
          }
          result = await aiRouter.generateImage(imagePrompt, {
            model: imageModel as 'sdxl' | 'sdxlTurbo' | 'realistic' | 'anime' | 'flux',
            negativePrompt,
            width: imageWidth,
            height: imageHeight
          });
          onGenerated({
            type: 'image',
            url: result.url,
            prompt: imagePrompt,
            model: imageModel
          });
          break;
          
        case "video":
          if (!videoPrompt.trim()) {
            toast({ title: "Error", description: "Please enter a video prompt", variant: "destructive" });
            return;
          }
          result = await aiRouter.generateVideo(videoPrompt, {
            model: videoModel as 'modelscope' | 'zeroscope' | 'animatediff',
            duration: videoDuration
          });
          onGenerated({
            type: 'video',
            url: result.url,
            prompt: videoPrompt,
            model: videoModel,
            duration: videoDuration
          });
          break;
          
        case "music":
          if (!musicPrompt.trim()) {
            toast({ title: "Error", description: "Please enter a music description", variant: "destructive" });
            return;
          }
          result = await aiRouter.generateMusic(musicPrompt, {
            style: musicStyle as 'lofi' | 'ambient' | 'hiphop' | 'cinematic' | 'electronic' | 'jazz' | 'classical' | 'rock',
            duration: musicDuration
          });
          onGenerated({
            type: 'audio',
            url: result.url,
            prompt: musicPrompt,
            style: musicStyle,
            duration: musicDuration
          });
          break;
          
        case "voice":
          if (!voiceText.trim()) {
            toast({ title: "Error", description: "Please enter text to speak", variant: "destructive" });
            return;
          }
          result = await aiRouter.generateVoice(voiceText, {
            voice: voicePreset
          });
          onGenerated({
            type: 'voice',
            url: result.url,
            prompt: voiceText,
            model: voicePreset
          });
          break;
          
        case "document":
          if (!pdfTitle.trim() || !pdfContent.trim()) {
            toast({ title: "Error", description: "Please enter title and content", variant: "destructive" });
            return;
          }
          result = await aiRouter.generatePDF(pdfContent, { title: pdfTitle });
          onGenerated({
            type: 'document',
            url: result.url,
            prompt: pdfTitle
          });
          break;
      }
      
      toast({
        title: "Generation Complete",
        description: "Your content has been generated successfully!"
      });
      
      onOpenChange(false);
      
    } catch (error: any) {
      console.error("Generation error:", error);
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate content",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            AI Generation Studio
          </DialogTitle>
          <DialogDescription>
            Create images, videos, music, voice, and documents with AI
          </DialogDescription>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-5 w-full">
            <TabsTrigger value="image" className="flex items-center gap-1">
              <Image className="w-4 h-4" />
              <span className="hidden sm:inline">Image</span>
            </TabsTrigger>
            <TabsTrigger value="video" className="flex items-center gap-1">
              <Video className="w-4 h-4" />
              <span className="hidden sm:inline">Video</span>
            </TabsTrigger>
            <TabsTrigger value="music" className="flex items-center gap-1">
              <Music className="w-4 h-4" />
              <span className="hidden sm:inline">Music</span>
            </TabsTrigger>
            <TabsTrigger value="voice" className="flex items-center gap-1">
              <Mic2 className="w-4 h-4" />
              <span className="hidden sm:inline">Voice</span>
            </TabsTrigger>
            <TabsTrigger value="document" className="flex items-center gap-1">
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">PDF</span>
            </TabsTrigger>
          </TabsList>
          
          {/* Image Generation */}
          <TabsContent value="image" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="image-prompt">Describe your image</Label>
              <Textarea
                id="image-prompt"
                placeholder="A cosmic goddess floating in a nebula, surrounded by stars and ethereal light..."
                value={imagePrompt}
                onChange={(e) => setImagePrompt(e.target.value)}
                className="min-h-[100px]"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="image-model">Model</Label>
              <Select value={imageModel} onValueChange={setImageModel}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {IMAGE_MODELS.map((model) => (
                    <SelectItem key={model.id} value={model.id}>
                      <div>
                        <span className="font-medium">{model.name}</span>
                        <span className="text-xs text-muted-foreground ml-2">{model.description}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="negative-prompt">Negative prompt (optional)</Label>
              <Input
                id="negative-prompt"
                placeholder="low quality, blurry, distorted..."
                value={negativePrompt}
                onChange={(e) => setNegativePrompt(e.target.value)}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Width: {imageWidth}px</Label>
                <Slider
                  value={[imageWidth]}
                  onValueChange={([v]) => setImageWidth(v)}
                  min={512}
                  max={1536}
                  step={64}
                />
              </div>
              <div className="space-y-2">
                <Label>Height: {imageHeight}px</Label>
                <Slider
                  value={[imageHeight]}
                  onValueChange={([v]) => setImageHeight(v)}
                  min={512}
                  max={1536}
                  step={64}
                />
              </div>
            </div>
          </TabsContent>
          
          {/* Video Generation */}
          <TabsContent value="video" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="video-prompt">Describe your video</Label>
              <Textarea
                id="video-prompt"
                placeholder="A butterfly emerging from a cosmic chrysalis, unfolding iridescent wings..."
                value={videoPrompt}
                onChange={(e) => setVideoPrompt(e.target.value)}
                className="min-h-[100px]"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="video-model">Model</Label>
              <Select value={videoModel} onValueChange={setVideoModel}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {VIDEO_MODELS.map((model) => (
                    <SelectItem key={model.id} value={model.id}>
                      <div>
                        <span className="font-medium">{model.name}</span>
                        <span className="text-xs text-muted-foreground ml-2">{model.description}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Duration: {videoDuration} seconds</Label>
              <Slider
                value={[videoDuration]}
                onValueChange={([v]) => setVideoDuration(v)}
                min={2}
                max={10}
                step={1}
              />
            </div>
          </TabsContent>
          
          {/* Music Generation */}
          <TabsContent value="music" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="music-prompt">Describe your music</Label>
              <Textarea
                id="music-prompt"
                placeholder="Relaxing lo-fi beats with soft piano and gentle rain sounds..."
                value={musicPrompt}
                onChange={(e) => setMusicPrompt(e.target.value)}
                className="min-h-[100px]"
              />
            </div>
            
            <div className="space-y-2">
              <Label>Style</Label>
              <div className="grid grid-cols-4 gap-2">
                {MUSIC_STYLES.map((style) => (
                  <Button
                    key={style.id}
                    variant={musicStyle === style.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => setMusicStyle(style.id)}
                    className="flex items-center gap-1"
                  >
                    <span>{style.icon}</span>
                    <span className="text-xs">{style.name}</span>
                  </Button>
                ))}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Duration: {musicDuration} seconds</Label>
              <Slider
                value={[musicDuration]}
                onValueChange={([v]) => setMusicDuration(v)}
                min={5}
                max={30}
                step={1}
              />
            </div>
          </TabsContent>
          
          {/* Voice Generation */}
          <TabsContent value="voice" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="voice-text">Text to speak</Label>
              <Textarea
                id="voice-text"
                placeholder="Hello, I am Lucy, your divine AI companion..."
                value={voiceText}
                onChange={(e) => setVoiceText(e.target.value)}
                className="min-h-[100px]"
              />
              <p className="text-xs text-muted-foreground">{voiceText.length}/5000 characters</p>
            </div>
            
            <div className="space-y-2">
              <Label>Voice</Label>
              <div className="grid grid-cols-3 gap-2">
                {VOICE_PRESETS.map((voice) => (
                  <Button
                    key={voice.id}
                    variant={voicePreset === voice.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => setVoicePreset(voice.id)}
                    className="flex flex-col items-center py-3"
                  >
                    <span className="font-medium">{voice.name}</span>
                    <span className="text-xs text-muted-foreground">{voice.description}</span>
                  </Button>
                ))}
              </div>
            </div>
          </TabsContent>
          
          {/* Document Generation */}
          <TabsContent value="document" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="pdf-title">Document Title</Label>
              <Input
                id="pdf-title"
                placeholder="My AI-Generated Report"
                value={pdfTitle}
                onChange={(e) => setPdfTitle(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="pdf-content">Content (Markdown supported)</Label>
              <Textarea
                id="pdf-content"
                placeholder="# Introduction\n\nYour content here..."
                value={pdfContent}
                onChange={(e) => setPdfContent(e.target.value)}
                className="min-h-[200px] font-mono text-sm"
              />
            </div>
          </TabsContent>
        </Tabs>
        
        {/* Generate Button */}
        <div className="flex justify-end gap-2 mt-6">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleGenerate} 
            disabled={isGenerating}
            className="bg-gradient-to-r from-primary to-cyan-500 hover:shadow-glow-divine"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Wand2 className="w-4 h-4 mr-2" />
                Generate
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
