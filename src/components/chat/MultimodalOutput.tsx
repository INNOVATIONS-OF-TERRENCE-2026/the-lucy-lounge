/**
 * THE LUCY LOUNGE - Multimodal Output Display
 * 
 * Displays AI-generated content with:
 * - Inline previews
 * - Progress bars
 * - One-click downloads
 * - Cinematic transitions
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Download, 
  Image as ImageIcon, 
  Video, 
  Music, 
  Mic, 
  FileText,
  Play,
  Pause,
  ExternalLink,
  Loader2,
  Check,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import type { AIIntent, GenerationResult } from '@/lib/aiRouter';

interface MultimodalOutputProps {
  type: AIIntent;
  result?: GenerationResult;
  isGenerating?: boolean;
  progress?: number;
  prompt?: string;
  onDownload?: () => void;
  onRegenerate?: () => void;
}

const TYPE_ICONS: Record<AIIntent, typeof ImageIcon> = {
  image: ImageIcon,
  video: Video,
  music: Music,
  voice: Mic,
  document: FileText,
  chat: Sparkles,
  code: FileText,
  analysis: Sparkles,
  creative: Sparkles,
};

const TYPE_LABELS: Record<AIIntent, string> = {
  image: 'Image',
  video: 'Video',
  music: 'Music',
  voice: 'Voice',
  document: 'Document',
  chat: 'Response',
  code: 'Code',
  analysis: 'Analysis',
  creative: 'Creative',
};

const TYPE_COLORS: Record<AIIntent, string> = {
  image: 'from-pink-500 to-purple-500',
  video: 'from-blue-500 to-cyan-500',
  music: 'from-green-500 to-emerald-500',
  voice: 'from-orange-500 to-amber-500',
  document: 'from-slate-500 to-zinc-500',
  chat: 'from-violet-500 to-purple-500',
  code: 'from-indigo-500 to-blue-500',
  analysis: 'from-teal-500 to-cyan-500',
  creative: 'from-rose-500 to-pink-500',
};

export function MultimodalOutput({
  type,
  result,
  isGenerating = false,
  progress = 0,
  prompt,
  onDownload,
  onRegenerate,
}: MultimodalOutputProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);

  const Icon = TYPE_ICONS[type] || Sparkles;
  const label = TYPE_LABELS[type] || 'Output';
  const colorClass = TYPE_COLORS[type] || 'from-purple-500 to-violet-500';

  const handlePlayPause = () => {
    if (!result?.url) return;

    if (audioElement) {
      if (isPlaying) {
        audioElement.pause();
      } else {
        audioElement.play();
      }
      setIsPlaying(!isPlaying);
    } else {
      const audio = new Audio(result.url);
      audio.onended = () => setIsPlaying(false);
      audio.play();
      setAudioElement(audio);
      setIsPlaying(true);
    }
  };

  const handleDownload = async () => {
    if (!result?.url) return;

    try {
      const response = await fetch(result.url);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `lucy_${type}_${Date.now()}.${getExtension(type)}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      onDownload?.();
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.95 }}
      transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
      className="relative rounded-2xl overflow-hidden border border-border/50 bg-card/80 backdrop-blur-lg"
    >
      {/* Header */}
      <div className={`relative px-4 py-3 bg-gradient-to-r ${colorClass}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-white/20 backdrop-blur">
            <Icon className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-white">{label} Generated</h4>
            {prompt && (
              <p className="text-xs text-white/80 truncate max-w-xs">
                {prompt.substring(0, 50)}...
              </p>
            )}
          </div>
          {result?.model && (
            <span className="text-xs px-2 py-1 rounded-full bg-white/20 text-white">
              {result.model.split('/').pop()}
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <AnimatePresence mode="wait">
          {isGenerating ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center py-8"
            >
              <div className="relative">
                <Loader2 className="w-12 h-12 text-primary animate-spin" />
                <motion.div
                  className={`absolute inset-0 rounded-full bg-gradient-to-r ${colorClass} opacity-20 blur-xl`}
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </div>
              <p className="mt-4 text-sm text-muted-foreground">
                Generating {label.toLowerCase()}...
              </p>
              {progress > 0 && (
                <div className="w-full max-w-xs mt-4">
                  <Progress value={progress} className="h-2" />
                  <p className="text-xs text-center mt-1 text-muted-foreground">
                    {Math.round(progress)}%
                  </p>
                </div>
              )}
            </motion.div>
          ) : result?.error ? (
            <motion.div
              key="error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center py-8 text-center"
            >
              <AlertCircle className="w-12 h-12 text-destructive mb-4" />
              <p className="text-sm text-muted-foreground">{result.error}</p>
              {onRegenerate && (
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4"
                  onClick={onRegenerate}
                >
                  Try Again
                </Button>
              )}
            </motion.div>
          ) : result?.url ? (
            <motion.div
              key="result"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {/* Image Preview */}
              {type === 'image' && (
                <div className="relative aspect-square max-w-md mx-auto rounded-lg overflow-hidden">
                  <img
                    src={result.url}
                    alt="Generated"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* Video Preview */}
              {type === 'video' && (
                <div className="relative aspect-video max-w-lg mx-auto rounded-lg overflow-hidden">
                  <video
                    src={result.url}
                    controls
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* Audio Preview (Music/Voice) */}
              {(type === 'music' || type === 'voice') && (
                <div className="flex flex-col items-center gap-4 py-4">
                  <motion.div
                    className={`relative p-8 rounded-full bg-gradient-to-br ${colorClass}`}
                    animate={isPlaying ? { scale: [1, 1.05, 1] } : {}}
                    transition={{ duration: 0.5, repeat: isPlaying ? Infinity : 0 }}
                  >
                    <Button
                      variant="ghost"
                      size="icon"
                      className="w-16 h-16 rounded-full bg-white/20 hover:bg-white/30"
                      onClick={handlePlayPause}
                    >
                      {isPlaying ? (
                        <Pause className="w-8 h-8 text-white" />
                      ) : (
                        <Play className="w-8 h-8 text-white ml-1" />
                      )}
                    </Button>
                    {isPlaying && (
                      <motion.div
                        className="absolute inset-0 rounded-full border-2 border-white/30"
                        animate={{ scale: [1, 1.3], opacity: [0.5, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      />
                    )}
                  </motion.div>
                  {result.metadata?.duration && (
                    <p className="text-sm text-muted-foreground">
                      Duration: {result.metadata.duration}s
                    </p>
                  )}
                </div>
              )}

              {/* Document Preview */}
              {type === 'document' && (
                <div className="flex flex-col items-center gap-4 py-4">
                  <div className="p-6 rounded-lg bg-muted/50 border border-border">
                    <FileText className="w-16 h-16 text-muted-foreground mx-auto" />
                    <p className="mt-2 font-medium text-center">
                      {result.metadata?.filename || 'Document.pdf'}
                    </p>
                  </div>
                  <a
                    href={result.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-primary hover:underline"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Open in new tab
                  </a>
                </div>
              )}

              {/* Success indicator */}
              <div className="flex items-center justify-center gap-2 mt-4 text-sm text-green-500">
                <Check className="w-4 h-4" />
                Generated successfully
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>

      {/* Footer Actions */}
      {result?.url && !result.error && (
        <div className="px-4 pb-4 flex gap-2 justify-end">
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={handleDownload}
          >
            <Download className="w-4 h-4" />
            Download
          </Button>
          {onRegenerate && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onRegenerate}
            >
              Regenerate
            </Button>
          )}
        </div>
      )}
    </motion.div>
  );
}

function getExtension(type: AIIntent): string {
  switch (type) {
    case 'image': return 'png';
    case 'video': return 'mp4';
    case 'music': return 'wav';
    case 'voice': return 'mp3';
    case 'document': return 'pdf';
    default: return 'txt';
  }
}

export default MultimodalOutput;
