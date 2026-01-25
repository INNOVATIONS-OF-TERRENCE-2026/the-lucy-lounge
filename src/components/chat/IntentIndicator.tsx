/**
 * THE LUCY LOUNGE - Intent Indicator
 * 
 * Visual indicator showing Lucy's detected intent mode.
 * Appears above the input when a non-chat modality is detected.
 */

import { motion, AnimatePresence } from 'framer-motion';
import { Music, Image, Video, FileText, MessageSquare, Sparkles, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { LucyIntent, IntentResult } from '@/hooks/useLucyIntentRouter';

interface IntentIndicatorProps {
  result: IntentResult | null;
  onAccept?: () => void;
  onDismiss?: () => void;
}

const INTENT_CONFIG: Record<LucyIntent, { 
  icon: React.ElementType; 
  label: string; 
  color: string;
  bgColor: string;
  borderColor: string;
}> = {
  chat: {
    icon: MessageSquare,
    label: 'Chat Mode',
    color: 'text-primary',
    bgColor: 'bg-primary/10',
    borderColor: 'border-primary/30',
  },
  audio: {
    icon: Music,
    label: 'Audio Studio',
    color: 'text-cyan-500',
    bgColor: 'bg-cyan-500/10',
    borderColor: 'border-cyan-500/30',
  },
  image: {
    icon: Image,
    label: 'Image Generation',
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/30',
  },
  video: {
    icon: Video,
    label: 'Video Generation',
    color: 'text-rose-500',
    bgColor: 'bg-rose-500/10',
    borderColor: 'border-rose-500/30',
  },
  document: {
    icon: FileText,
    label: 'Document Export',
    color: 'text-amber-500',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/30',
  },
};

export function IntentIndicator({ result, onAccept, onDismiss }: IntentIndicatorProps) {
  if (!result || result.intent === 'chat') {
    return null;
  }

  const config = INTENT_CONFIG[result.intent];
  const Icon = config.icon;
  const confidencePercent = Math.round(result.confidence * 100);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 10, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -10, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className={`flex items-center gap-3 px-4 py-2 rounded-xl ${config.bgColor} border ${config.borderColor} backdrop-blur-sm`}
      >
        <div className={`flex items-center gap-2 ${config.color}`}>
          <Sparkles className="w-3 h-3 animate-pulse" />
          <Icon className="w-4 h-4" />
          <span className="font-medium text-sm">{config.label}</span>
        </div>

        <span className="text-xs text-muted-foreground">
          {confidencePercent}% match
        </span>

        {result.suggestedAction && onAccept && (
          <Button
            size="sm"
            variant="ghost"
            onClick={onAccept}
            className={`h-7 px-3 text-xs ${config.color} hover:${config.bgColor}`}
          >
            {result.suggestedAction}
            <ArrowRight className="w-3 h-3 ml-1" />
          </Button>
        )}

        {onDismiss && (
          <button
            onClick={onDismiss}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors ml-auto"
          >
            ×
          </button>
        )}
      </motion.div>
    </AnimatePresence>
  );
}

export default IntentIndicator;
