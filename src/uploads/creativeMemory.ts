/**
 * PHASE 2 — Creative Memory Upload System
 * 
 * Upgrades file uploads from simple asset storage to "Creative Memory" —
 * uploads that persist, preview, and actively influence AI generation.
 * 
 * Every upload is tagged with:
 * - referenceRole: how it should influence generation
 * - metadata: extracted insights (dimensions, duration, colors)
 * - context: how it was used in past generations
 * 
 * Used by: Image gen, Audio gen, Cinema storyboard, Chat
 */

import { supabase } from '@/integrations/supabase/client';

// ─── Types ────────────────────────────────────────────────────────

export type CreativeMemoryRole = 
  | 'style'          // Visual style reference
  | 'composition'    // Layout/framing reference
  | 'mood'           // Emotional tone reference
  | 'subject'        // Subject matter reference
  | 'audio_reference' // Audio mood/tempo reference
  | 'color_palette'  // Color extraction reference
  | 'storyboard_ref' // Used in cinema storyboard context
  | 'general';       // Unspecified creative input

export interface CreativeMemoryAsset {
  id: string;
  userId: string;
  fileName: string;
  fileType: 'image' | 'video' | 'audio' | 'document' | 'other';
  mimeType: string;
  url: string;
  thumbnailUrl?: string;
  referenceRole: CreativeMemoryRole;
  /** Extracted metadata (dimensions, duration, dominant colors, etc.) */
  extractedMeta: ExtractedMetadata;
  /** How many times this asset has been used in generations */
  usageCount: number;
  /** Tags for searchability */
  tags: string[];
  uploadedAt: string;
  lastUsedAt?: string;
}

export interface ExtractedMetadata {
  width?: number;
  height?: number;
  durationSeconds?: number;
  dominantColors?: string[];
  hasAlpha?: boolean;
  fileSize: number;
  /** AI-extracted description (if image) */
  aiDescription?: string;
}

// ─── Context Builder ──────────────────────────────────────────────

/**
 * Build a context injection string from creative memory assets.
 * This string is appended to AI prompts to make uploads influence generation.
 */
export function buildCreativeContext(assets: CreativeMemoryAsset[]): string {
  if (!assets.length) return '';

  const parts: string[] = ['[Creative Context from uploaded references:]'];

  const grouped = groupByRole(assets);

  if (grouped.style?.length) {
    parts.push(`Visual style references: ${grouped.style.map(a => a.extractedMeta.aiDescription || a.fileName).join(', ')}.`);
  }
  if (grouped.composition?.length) {
    parts.push(`Composition/layout references: ${grouped.composition.map(a => a.extractedMeta.aiDescription || a.fileName).join(', ')}.`);
  }
  if (grouped.mood?.length) {
    parts.push(`Mood/tone references: ${grouped.mood.map(a => a.extractedMeta.aiDescription || a.fileName).join(', ')}.`);
  }
  if (grouped.subject?.length) {
    parts.push(`Subject references: ${grouped.subject.map(a => a.extractedMeta.aiDescription || a.fileName).join(', ')}.`);
  }
  if (grouped.audio_reference?.length) {
    parts.push(`Audio mood references: ${grouped.audio_reference.map(a => a.fileName).join(', ')}.`);
  }
  if (grouped.color_palette?.length) {
    const colors = grouped.color_palette.flatMap(a => a.extractedMeta.dominantColors || []);
    if (colors.length) {
      parts.push(`Color palette: ${colors.join(', ')}.`);
    }
  }
  if (grouped.general?.length) {
    parts.push(`Additional references: ${grouped.general.map(a => a.extractedMeta.aiDescription || a.fileName).join(', ')}. `);
  }

  return parts.join(' ');
}

function groupByRole(assets: CreativeMemoryAsset[]): Partial<Record<CreativeMemoryRole, CreativeMemoryAsset[]>> {
  const grouped: Partial<Record<CreativeMemoryRole, CreativeMemoryAsset[]>> = {};
  for (const asset of assets) {
    if (!grouped[asset.referenceRole]) {
      grouped[asset.referenceRole] = [];
    }
    grouped[asset.referenceRole]!.push(asset);
  }
  return grouped;
}

// ─── Metadata Extraction ──────────────────────────────────────────

/**
 * Extract metadata from a file before upload.
 * Runs client-side for instant feedback.
 */
export async function extractFileMetadata(file: File): Promise<ExtractedMetadata> {
  const base: ExtractedMetadata = {
    fileSize: file.size,
  };

  if (file.type.startsWith('image/')) {
    return extractImageMetadata(file, base);
  }

  if (file.type.startsWith('video/')) {
    return extractVideoMetadata(file, base);
  }

  if (file.type.startsWith('audio/')) {
    return extractAudioMetadata(file, base);
  }

  return base;
}

async function extractImageMetadata(file: File, base: ExtractedMetadata): Promise<ExtractedMetadata> {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      // Extract dominant colors from a canvas sample
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const sampleSize = 50;
      canvas.width = sampleSize;
      canvas.height = sampleSize;

      let dominantColors: string[] = [];
      if (ctx) {
        ctx.drawImage(img, 0, 0, sampleSize, sampleSize);
        const imageData = ctx.getImageData(0, 0, sampleSize, sampleSize).data;
        dominantColors = extractDominantColors(imageData);
      }

      URL.revokeObjectURL(url);
      resolve({
        ...base,
        width: img.naturalWidth,
        height: img.naturalHeight,
        dominantColors,
        hasAlpha: file.type === 'image/png' || file.type === 'image/webp',
      });
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(base);
    };

    img.src = url;
  });
}

async function extractVideoMetadata(file: File, base: ExtractedMetadata): Promise<ExtractedMetadata> {
  return new Promise((resolve) => {
    const video = document.createElement('video');
    const url = URL.createObjectURL(file);
    video.preload = 'metadata';

    video.onloadedmetadata = () => {
      URL.revokeObjectURL(url);
      resolve({
        ...base,
        width: video.videoWidth,
        height: video.videoHeight,
        durationSeconds: Math.round(video.duration),
      });
    };

    video.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(base);
    };

    video.src = url;
  });
}

async function extractAudioMetadata(file: File, base: ExtractedMetadata): Promise<ExtractedMetadata> {
  return new Promise((resolve) => {
    const audio = document.createElement('audio');
    const url = URL.createObjectURL(file);
    audio.preload = 'metadata';

    audio.onloadedmetadata = () => {
      URL.revokeObjectURL(url);
      resolve({
        ...base,
        durationSeconds: Math.round(audio.duration),
      });
    };

    audio.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(base);
    };

    audio.src = url;
  });
}

/**
 * Simple dominant color extraction from image data.
 * Returns up to 5 hex color strings.
 */
function extractDominantColors(data: Uint8ClampedArray): string[] {
  const colorCounts: Record<string, number> = {};
  const step = 16; // Sample every 16th pixel for performance

  for (let i = 0; i < data.length; i += step * 4) {
    // Quantize to reduce color space
    const r = Math.round(data[i] / 32) * 32;
    const g = Math.round(data[i + 1] / 32) * 32;
    const b = Math.round(data[i + 2] / 32) * 32;
    const hex = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    colorCounts[hex] = (colorCounts[hex] || 0) + 1;
  }

  return Object.entries(colorCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([hex]) => hex);
}

// ─── Upload with Creative Memory ──────────────────────────────────

const BUCKET = 'generations';
const UPLOAD_PREFIX = 'creative-memory';
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

export interface UploadResult {
  asset: CreativeMemoryAsset | null;
  error: string | null;
}

/**
 * Upload a file as creative memory — persists with metadata and context.
 */
export async function uploadCreativeMemory(
  file: File,
  userId: string,
  role: CreativeMemoryRole = 'general',
  tags: string[] = []
): Promise<UploadResult> {
  if (file.size > MAX_FILE_SIZE) {
    return { asset: null, error: `File too large: ${file.name} (max 50MB)` };
  }

  try {
    // Extract metadata before upload
    const extractedMeta = await extractFileMetadata(file);

    // Generate unique path
    const ext = file.name.split('.').pop() || 'bin';
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const path = `${UPLOAD_PREFIX}/${userId}/${id}.${ext}`;

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(path, file, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) throw uploadError;

    const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(path);

    const fileType = detectFileType(file.type);
    const thumbnailUrl = fileType === 'image' ? urlData.publicUrl : undefined;

    const asset: CreativeMemoryAsset = {
      id,
      userId,
      fileName: file.name,
      fileType,
      mimeType: file.type,
      url: urlData.publicUrl,
      thumbnailUrl,
      referenceRole: role,
      extractedMeta,
      usageCount: 0,
      tags,
      uploadedAt: new Date().toISOString(),
    };

    return { asset, error: null };
  } catch (err: any) {
    return { asset: null, error: err?.message || 'Upload failed' };
  }
}

function detectFileType(mimeType: string): CreativeMemoryAsset['fileType'] {
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType.startsWith('video/')) return 'video';
  if (mimeType.startsWith('audio/')) return 'audio';
  if (mimeType.includes('pdf') || mimeType.includes('document')) return 'document';
  return 'other';
}

// ─── Prompt Injection ─────────────────────────────────────────────

/**
 * Inject creative memory context into an AI prompt.
 * This ensures uploads ALWAYS influence generation output.
 */
export function injectCreativeMemory(
  originalPrompt: string,
  assets: CreativeMemoryAsset[]
): string {
  const context = buildCreativeContext(assets);
  if (!context) return originalPrompt;
  return `${originalPrompt}\n\n${context}`;
}
