/**
 * THE LUCY LOUNGE - Intelligent Intent Router
 * 
 * Analyzes user input and determines the optimal modality:
 * - chat: Normal conversation (LLM)
 * - audio: Music/sound generation (Audio Studio)
 * - image: Image generation (SDXL, etc.)
 * - video: Video generation
 * - document: PDF/document generation
 * 
 * This runs CLIENT-SIDE for instant feedback.
 * No API keys are used here - routing decisions only.
 */

import { useMemo, useCallback } from 'react';

export type LucyIntent = 'chat' | 'audio' | 'image' | 'video' | 'document';

export interface IntentResult {
  intent: LucyIntent;
  confidence: number; // 0-1
  reason: string;
  suggestedAction?: string;
}

// Pattern definitions for each modality
const INTENT_PATTERNS: Record<LucyIntent, { patterns: RegExp[]; keywords: string[] }> = {
  audio: {
    patterns: [
      /\b(make|create|generate|compose|produce)\b.*\b(beat|music|song|track|audio|sound|melody|tune|instrumental)\b/i,
      /\b(beat|music|song|track|audio|sound|melody|tune|instrumental)\b.*\b(for me|please)\b/i,
      /\blo-?fi\b/i,
      /\bhip[- ]?hop\b.*\b(beat|track)\b/i,
      /\bvoice\b.*\b(over|clone|generate|create)\b/i,
      /\b(text[- ]?to[- ]?speech|tts|speak this|read this aloud)\b/i,
      /\baudio\s+studio\b/i,
    ],
    keywords: ['beat', 'music', 'song', 'track', 'audio', 'sound', 'melody', 'compose', 'instrumental', 'lo-fi', 'lofi', 'voice', 'tts', 'speech'],
  },
  image: {
    patterns: [
      /\b(make|create|generate|draw|design|illustrate)\b.*\b(image|picture|art|artwork|illustration|logo|icon|cover|poster|graphic)\b/i,
      /\b(image|picture|art|artwork|illustration|logo|icon|cover|poster|graphic)\b.*\b(of|for|with)\b/i,
      /\bcover\s+art\b/i,
      /\balbum\s+(cover|art)\b/i,
      /\b(visualize|render)\b/i,
      /\bsdxl\b/i,
      /\bstable\s+diffusion\b/i,
    ],
    keywords: ['image', 'picture', 'art', 'draw', 'illustration', 'logo', 'icon', 'cover art', 'poster', 'graphic', 'visualize', 'render'],
  },
  video: {
    patterns: [
      /\b(make|create|generate|produce)\b.*\b(video|animation|clip|motion|movie)\b/i,
      /\b(turn|convert)\b.*\b(into|to)\b.*\bvideo\b/i,
      /\banimate\b.*\b(this|it|the)\b/i,
      /\bvideo\b.*\b(of|for|with)\b/i,
      /\btext[- ]?to[- ]?video\b/i,
    ],
    keywords: ['video', 'animation', 'animate', 'clip', 'motion', 'movie'],
  },
  document: {
    patterns: [
      /\b(export|create|generate|make)\b.*\b(pdf|document|report|file)\b/i,
      /\b(as|to)\s+a?\s*pdf\b/i,
      /\bdownload\b.*\b(as|this)\b/i,
      /\bsave\b.*\b(as|to)\b.*\b(pdf|document)\b/i,
      /\bpdf\s+(this|it|the)\b/i,
    ],
    keywords: ['pdf', 'document', 'report', 'export', 'download'],
  },
  chat: {
    patterns: [], // Default fallback
    keywords: [],
  },
};

// Calculate intent confidence based on pattern and keyword matches
function analyzeIntent(input: string): IntentResult {
  const normalizedInput = input.toLowerCase().trim();
  
  // Skip very short inputs - default to chat
  if (normalizedInput.length < 5) {
    return {
      intent: 'chat',
      confidence: 1.0,
      reason: 'Short input - conversational',
    };
  }

  let bestMatch: IntentResult = {
    intent: 'chat',
    confidence: 0.3,
    reason: 'Default conversational mode',
  };

  // Check each modality (except chat which is default)
  const modalities: LucyIntent[] = ['audio', 'image', 'video', 'document'];

  for (const modality of modalities) {
    const { patterns, keywords } = INTENT_PATTERNS[modality];
    let score = 0;
    let matchedPattern = false;
    let matchedKeywords: string[] = [];

    // Check regex patterns (stronger signal)
    for (const pattern of patterns) {
      if (pattern.test(normalizedInput)) {
        score += 0.5;
        matchedPattern = true;
        break; // One pattern match is enough
      }
    }

    // Check keywords (weaker signal, additive)
    for (const keyword of keywords) {
      if (normalizedInput.includes(keyword.toLowerCase())) {
        score += 0.15;
        matchedKeywords.push(keyword);
      }
    }

    // Cap score at 1.0
    score = Math.min(score, 1.0);

    if (score > bestMatch.confidence) {
      const reasons: string[] = [];
      if (matchedPattern) reasons.push('pattern match');
      if (matchedKeywords.length > 0) reasons.push(`keywords: ${matchedKeywords.slice(0, 3).join(', ')}`);

      bestMatch = {
        intent: modality,
        confidence: score,
        reason: reasons.join(' + ') || 'keyword detection',
        suggestedAction: getSuggestedAction(modality),
      };
    }
  }

  return bestMatch;
}

function getSuggestedAction(intent: LucyIntent): string {
  switch (intent) {
    case 'audio':
      return 'Open Audio Studio';
    case 'image':
      return 'Generate Image';
    case 'video':
      return 'Generate Video';
    case 'document':
      return 'Create PDF';
    default:
      return 'Send to Lucy';
  }
}

export function useLucyIntentRouter() {
  /**
   * Analyze input and return detected intent
   */
  const detectIntent = useCallback((input: string): IntentResult => {
    return analyzeIntent(input);
  }, []);

  /**
   * Check if input strongly suggests a specific modality
   * (confidence > 0.5 means we should suggest switching)
   */
  const shouldSuggestMode = useCallback((input: string): IntentResult | null => {
    const result = analyzeIntent(input);
    if (result.intent !== 'chat' && result.confidence >= 0.5) {
      return result;
    }
    return null;
  }, []);

  /**
   * Get route path for an intent
   */
  const getRoutePath = useCallback((intent: LucyIntent): string | null => {
    switch (intent) {
      case 'audio':
        return '/studios/audio';
      case 'image':
        return null; // Handled in-chat via AI Generation modal
      case 'video':
        return null; // Handled in-chat via AI Generation modal
      case 'document':
        return null; // Handled in-chat via AI Generation modal
      default:
        return null;
    }
  }, []);

  return {
    detectIntent,
    shouldSuggestMode,
    getRoutePath,
  };
}

export default useLucyIntentRouter;
