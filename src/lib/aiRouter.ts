/**
 * THE LUCY LOUNGE - AI Router Client
 * 
 * Frontend service for intelligent model routing.
 * Lucy decides the best model based on user intent.
 */

import { supabase } from '@/integrations/supabase/client';

export type AIIntent = 'chat' | 'image' | 'video' | 'music' | 'voice' | 'document' | 'code' | 'analysis' | 'creative';

export interface RouteDecision {
  intent: AIIntent;
  model: string;
  service: 'lovable' | 'huggingface' | 'elevenlabs' | 'internal';
  confidence: number;
  reasoning: string;
}

export interface AIRouterResponse {
  route: RouteDecision;
  endpoints: {
    image: string;
    video: string;
    music: string;
    voice: string;
    document: string;
    chat: string;
  };
}

export interface GenerationResult {
  success: boolean;
  url?: string;
  storagePath?: string;
  error?: string;
  model?: string;
  metadata?: Record<string, unknown>;
}

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://vabrcwdngngdbjmtpwxp.supabase.co';

class AIRouter {
  private baseUrl = `${SUPABASE_URL}/functions/v1`;

  /**
   * Route a prompt to the best AI service
   */
  async route(prompt: string, options?: {
    mode?: 'auto' | 'manual';
    outputType?: AIIntent;
    preferredModel?: string;
  }): Promise<AIRouterResponse> {
    const { data: { session } } = await supabase.auth.getSession();
    
    const response = await fetch(`${this.baseUrl}/ai-router`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(session?.access_token && { Authorization: `Bearer ${session.access_token}` }),
      },
      body: JSON.stringify({
        prompt,
        mode: options?.mode || 'auto',
        outputType: options?.outputType,
        preferredModel: options?.preferredModel,
        userId: session?.user?.id,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to route request');
    }

    return response.json();
  }

  /**
   * Generate an image
   */
  async generateImage(prompt: string, options?: {
    model?: 'sdxl' | 'sdxlTurbo' | 'realistic' | 'anime' | 'flux';
    width?: number;
    height?: number;
    negativePrompt?: string;
  }): Promise<GenerationResult> {
    const { data: { session } } = await supabase.auth.getSession();

    const response = await fetch(`${this.baseUrl}/hf-image-gen`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(session?.access_token && { Authorization: `Bearer ${session.access_token}` }),
      },
      body: JSON.stringify({
        prompt,
        ...options,
        userId: session?.user?.id,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return { success: false, error: data.error || 'Image generation failed' };
    }

    return {
      success: true,
      url: data.imageUrl,
      storagePath: data.storagePath,
      model: data.model,
      metadata: data.dimensions,
    };
  }

  /**
   * Generate a video
   */
  async generateVideo(prompt: string, options?: {
    model?: 'modelscope' | 'zeroscope' | 'animatediff';
    duration?: number;
    fps?: number;
  }): Promise<GenerationResult> {
    const { data: { session } } = await supabase.auth.getSession();

    const response = await fetch(`${this.baseUrl}/hf-video-gen`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(session?.access_token && { Authorization: `Bearer ${session.access_token}` }),
      },
      body: JSON.stringify({
        prompt,
        ...options,
        userId: session?.user?.id,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return { success: false, error: data.error || 'Video generation failed' };
    }

    return {
      success: true,
      url: data.videoUrl,
      storagePath: data.storagePath,
      model: data.model,
      metadata: { duration: data.duration },
    };
  }

  /**
   * Generate music
   */
  async generateMusic(prompt: string, options?: {
    style?: 'lofi' | 'ambient' | 'hiphop' | 'cinematic' | 'electronic' | 'jazz' | 'classical' | 'rock';
    model?: 'small' | 'medium' | 'large' | 'melody' | 'stereo';
    duration?: number;
  }): Promise<GenerationResult> {
    const { data: { session } } = await supabase.auth.getSession();

    const response = await fetch(`${this.baseUrl}/hf-music-gen`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(session?.access_token && { Authorization: `Bearer ${session.access_token}` }),
      },
      body: JSON.stringify({
        prompt,
        ...options,
        userId: session?.user?.id,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return { success: false, error: data.error || 'Music generation failed' };
    }

    return {
      success: true,
      url: data.audioUrl,
      storagePath: data.storagePath,
      model: data.model,
      metadata: { style: data.style, duration: data.duration },
    };
  }

  /**
   * Generate voice/speech
   */
  async generateVoice(text: string, options?: {
    voice?: 'rachel' | 'domi' | 'bella' | 'antoni' | 'elli' | 'josh' | 'arnold' | 'adam' | 'sam' | string;
    model?: 'eleven_multilingual_v2' | 'eleven_monolingual_v1' | 'eleven_turbo_v2';
    style?: 'default' | 'stable' | 'expressive' | 'narrative';
  }): Promise<GenerationResult> {
    const { data: { session } } = await supabase.auth.getSession();

    const response = await fetch(`${this.baseUrl}/elevenlabs-voice`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(session?.access_token && { Authorization: `Bearer ${session.access_token}` }),
      },
      body: JSON.stringify({
        text,
        ...options,
        userId: session?.user?.id,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return { success: false, error: data.error || 'Voice generation failed' };
    }

    return {
      success: true,
      url: data.audioUrl,
      storagePath: data.storagePath,
      model: data.model,
      metadata: { voice: data.voice, textLength: data.textLength },
    };
  }

  /**
   * Generate PDF document
   */
  async generatePDF(content: string, options?: {
    title?: string;
    type?: 'document' | 'contract' | 'report' | 'invoice';
    options?: {
      fontSize?: number;
      includeDate?: boolean;
      includePageNumbers?: boolean;
    };
  }): Promise<GenerationResult> {
    const { data: { session } } = await supabase.auth.getSession();

    const response = await fetch(`${this.baseUrl}/pdf-generator`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(session?.access_token && { Authorization: `Bearer ${session.access_token}` }),
      },
      body: JSON.stringify({
        content,
        ...options,
        userId: session?.user?.id,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return { success: false, error: data.error || 'PDF generation failed' };
    }

    return {
      success: true,
      url: data.pdfUrl,
      storagePath: data.storagePath,
      metadata: { title: data.title, type: data.type, filename: data.filename },
    };
  }

  /**
   * Smart generate - automatically routes and generates
   */
  async smartGenerate(prompt: string): Promise<{
    route: RouteDecision;
    result: GenerationResult;
  }> {
    // First, route the request
    const { route } = await this.route(prompt);

    // Then generate based on intent
    let result: GenerationResult;

    switch (route.intent) {
      case 'image':
        result = await this.generateImage(prompt);
        break;
      case 'video':
        result = await this.generateVideo(prompt);
        break;
      case 'music':
        result = await this.generateMusic(prompt);
        break;
      case 'voice':
        result = await this.generateVoice(prompt);
        break;
      case 'document':
        result = await this.generatePDF(prompt, { title: 'Generated Document' });
        break;
      default:
        // For chat/code/analysis/creative, return route info only
        result = { success: true, metadata: { intent: route.intent, model: route.model } };
    }

    return { route, result };
  }
}

export const aiRouter = new AIRouter();
export default aiRouter;
