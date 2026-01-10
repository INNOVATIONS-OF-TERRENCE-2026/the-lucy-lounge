// Cinematic Studio Type Definitions

export type CinematicJobStatus = 'queued' | 'running' | 'complete' | 'failed' | 'canceled';
export type CinematicJobType = 'video' | 'voice' | 'music' | 'composite' | 'export_pack' | 'cutscene';

export interface CinematicShot {
  id: string;
  name: string;
  prompt: string;
  duration: number;
  camera: string;
  movement: string;
  transition: string;
  notes?: string;
}

export interface CinematicJob {
  id: string;
  user_id: string;
  status: CinematicJobStatus;
  job_type: CinematicJobType;
  parent_job_id?: string;
  title: string;
  prompt_raw: string;
  prompt_enhanced?: string;
  style_preset: string;
  shots: CinematicShot[];
  duration_seconds: number;
  aspect_ratio: string;
  seed?: number;
  mcp_payload?: Record<string, unknown>;
  result_video_url?: string;
  result_audio_url?: string;
  result_music_url?: string;
  result_composite_url?: string;
  export_urls?: Record<string, string>;
  error_message?: string;
  attempt_count: number;
  idempotency_key?: string;
  created_at: string;
  updated_at: string;
}

export interface PromptMemory {
  id: string;
  user_id: string;
  prompt_raw: string;
  prompt_enhanced?: string;
  style_preset?: string;
  shots?: CinematicShot[];
  success: boolean;
  final_score?: number;
  tags?: string[];
  created_at: string;
}

export interface UsageLedgerEntry {
  id: string;
  user_id: string;
  action: string;
  credits_delta: number;
  job_id?: string;
  created_at: string;
}

export interface CinematicPlan {
  id: string;
  plan_key: string;
  name: string;
  monthly_price: number;
  credits_per_month: number;
  max_parallel_jobs: number;
  max_duration_seconds: number;
  max_exports_per_job: number;
  features: {
    watermark?: boolean;
    voice?: boolean;
    music?: boolean;
    '4k'?: boolean;
    api?: boolean;
  };
  created_at: string;
}

export interface UserPlan {
  user_id: string;
  plan_key: string;
  credits_balance: number;
  renewal_date: string;
  created_at: string;
  updated_at: string;
}

export interface StylePreset {
  id: string;
  name: string;
  description: string;
  promptInjection: string;
  cameraDefaults: string;
  lightingDefaults: string;
  colorGrading: string;
  moodKeywords: string[];
  thumbnail?: string;
}

export interface ExportPlatform {
  id: string;
  name: string;
  aspectRatio: string;
  maxDuration: number;
  icon: string;
}
