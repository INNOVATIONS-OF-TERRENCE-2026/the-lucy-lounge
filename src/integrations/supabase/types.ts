export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      ai_generated_scenes: {
        Row: {
          created_at: string
          id: string
          image_url: string | null
          mood_tags: string[] | null
          prompt: string
          scene_data: Json
          usage_count: number | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          image_url?: string | null
          mood_tags?: string[] | null
          prompt: string
          scene_data: Json
          usage_count?: number | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          image_url?: string | null
          mood_tags?: string[] | null
          prompt?: string
          scene_data?: Json
          usage_count?: number | null
          user_id?: string
        }
        Relationships: []
      }
      analytics_events: {
        Row: {
          created_at: string
          event_data: Json | null
          event_type: string
          id: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          event_data?: Json | null
          event_type: string
          id?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          event_data?: Json | null
          event_type?: string
          id?: string
          user_id?: string | null
        }
        Relationships: []
      }
      app_settings: {
        Row: {
          created_at: string
          id: string
          setting_key: string
          setting_value: Json
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          setting_key: string
          setting_value?: Json
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          setting_key?: string
          setting_value?: Json
          updated_at?: string
        }
        Relationships: []
      }
      arcade_achievements: {
        Row: {
          achievement_id: string
          id: string
          unlocked_at: string | null
          user_id: string
        }
        Insert: {
          achievement_id: string
          id?: string
          unlocked_at?: string | null
          user_id: string
        }
        Update: {
          achievement_id?: string
          id?: string
          unlocked_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      arcade_game_stats: {
        Row: {
          created_at: string | null
          game_id: string
          high_score: number | null
          id: string
          last_played_at: string | null
          losses: number | null
          plays: number | null
          total_playtime_seconds: number | null
          user_id: string
          wins: number | null
        }
        Insert: {
          created_at?: string | null
          game_id: string
          high_score?: number | null
          id?: string
          last_played_at?: string | null
          losses?: number | null
          plays?: number | null
          total_playtime_seconds?: number | null
          user_id: string
          wins?: number | null
        }
        Update: {
          created_at?: string | null
          game_id?: string
          high_score?: number | null
          id?: string
          last_played_at?: string | null
          losses?: number | null
          plays?: number | null
          total_playtime_seconds?: number | null
          user_id?: string
          wins?: number | null
        }
        Relationships: []
      }
      arcade_leaderboards: {
        Row: {
          achieved_at: string | null
          game_id: string
          id: string
          metadata: Json | null
          score: number
          user_id: string
        }
        Insert: {
          achieved_at?: string | null
          game_id: string
          id?: string
          metadata?: Json | null
          score: number
          user_id: string
        }
        Update: {
          achieved_at?: string | null
          game_id?: string
          id?: string
          metadata?: Json | null
          score?: number
          user_id?: string
        }
        Relationships: []
      }
      arcade_player_profiles: {
        Row: {
          avatar_url: string | null
          coins: number | null
          created_at: string | null
          display_name: string | null
          id: string
          level: number | null
          total_xp: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          coins?: number | null
          created_at?: string | null
          display_name?: string | null
          id?: string
          level?: number | null
          total_xp?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          coins?: number | null
          created_at?: string | null
          display_name?: string | null
          id?: string
          level?: number | null
          total_xp?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      attachments: {
        Row: {
          conversation_id: string
          created_at: string
          file_name: string
          file_path: string
          file_size: number
          file_type: string
          id: string
          message_id: string | null
        }
        Insert: {
          conversation_id: string
          created_at?: string
          file_name: string
          file_path: string
          file_size: number
          file_type: string
          id?: string
          message_id?: string | null
        }
        Update: {
          conversation_id?: string
          created_at?: string
          file_name?: string
          file_path?: string
          file_size?: number
          file_type?: string
          id?: string
          message_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "attachments_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attachments_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
        ]
      }
      audio_generations: {
        Row: {
          audio_url: string | null
          bpm: number | null
          created_at: string | null
          credits_used: number | null
          duration_seconds: number | null
          genre: string | null
          id: string
          key: string | null
          mood: string | null
          project_id: string | null
          prompt: string
          status: string | null
          user_id: string
        }
        Insert: {
          audio_url?: string | null
          bpm?: number | null
          created_at?: string | null
          credits_used?: number | null
          duration_seconds?: number | null
          genre?: string | null
          id?: string
          key?: string | null
          mood?: string | null
          project_id?: string | null
          prompt: string
          status?: string | null
          user_id: string
        }
        Update: {
          audio_url?: string | null
          bpm?: number | null
          created_at?: string | null
          credits_used?: number | null
          duration_seconds?: number | null
          genre?: string | null
          id?: string
          key?: string | null
          mood?: string | null
          project_id?: string | null
          prompt?: string
          status?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "audio_generations_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "audio_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      audio_playlist_items: {
        Row: {
          created_at: string | null
          generation_id: string | null
          id: string
          playlist_id: string
          position: number
          sample_id: string | null
        }
        Insert: {
          created_at?: string | null
          generation_id?: string | null
          id?: string
          playlist_id: string
          position?: number
          sample_id?: string | null
        }
        Update: {
          created_at?: string | null
          generation_id?: string | null
          id?: string
          playlist_id?: string
          position?: number
          sample_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audio_playlist_items_generation_id_fkey"
            columns: ["generation_id"]
            isOneToOne: false
            referencedRelation: "audio_generations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audio_playlist_items_playlist_id_fkey"
            columns: ["playlist_id"]
            isOneToOne: false
            referencedRelation: "audio_playlists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audio_playlist_items_sample_id_fkey"
            columns: ["sample_id"]
            isOneToOne: false
            referencedRelation: "audio_samples"
            referencedColumns: ["id"]
          },
        ]
      }
      audio_playlists: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_public: boolean | null
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_public?: boolean | null
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_public?: boolean | null
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      audio_projects: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_public: boolean | null
          settings: Json | null
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_public?: boolean | null
          settings?: Json | null
          title?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_public?: boolean | null
          settings?: Json | null
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      audio_samples: {
        Row: {
          bpm: number | null
          category: string
          created_at: string | null
          download_count: number | null
          file_url: string
          genre: string | null
          id: string
          is_premium: boolean | null
          key: string | null
          preview_url: string | null
          title: string
        }
        Insert: {
          bpm?: number | null
          category: string
          created_at?: string | null
          download_count?: number | null
          file_url: string
          genre?: string | null
          id?: string
          is_premium?: boolean | null
          key?: string | null
          preview_url?: string | null
          title: string
        }
        Update: {
          bpm?: number | null
          category?: string
          created_at?: string | null
          download_count?: number | null
          file_url?: string
          genre?: string | null
          id?: string
          is_premium?: boolean | null
          key?: string | null
          preview_url?: string | null
          title?: string
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          created_at: string
          details: Json | null
          event_type: string
          id: string
          ip_address: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          details?: Json | null
          event_type: string
          id?: string
          ip_address?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          details?: Json | null
          event_type?: string
          id?: string
          ip_address?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      chat_rooms: {
        Row: {
          created_at: string
          created_by: string
          description: string | null
          id: string
          is_private: boolean
          max_participants: number | null
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          description?: string | null
          id?: string
          is_private?: boolean
          max_participants?: number | null
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          description?: string | null
          id?: string
          is_private?: boolean
          max_participants?: number | null
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      conversation_context: {
        Row: {
          context_summary: string | null
          conversation_id: string
          created_at: string
          id: string
          key_topics: string[] | null
          updated_at: string
          user_preferences: Json | null
        }
        Insert: {
          context_summary?: string | null
          conversation_id: string
          created_at?: string
          id?: string
          key_topics?: string[] | null
          updated_at?: string
          user_preferences?: Json | null
        }
        Update: {
          context_summary?: string | null
          conversation_id?: string
          created_at?: string
          id?: string
          key_topics?: string[] | null
          updated_at?: string
          user_preferences?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "conversation_context_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          archived: boolean
          created_at: string
          folder_id: string | null
          id: string
          pinned: boolean
          tags: string[] | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          archived?: boolean
          created_at?: string
          folder_id?: string | null
          id?: string
          pinned?: boolean
          tags?: string[] | null
          title?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          archived?: boolean
          created_at?: string
          folder_id?: string | null
          id?: string
          pinned?: boolean
          tags?: string[] | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversations_folder_id_fkey"
            columns: ["folder_id"]
            isOneToOne: false
            referencedRelation: "folders"
            referencedColumns: ["id"]
          },
        ]
      }
      custom_backgrounds: {
        Row: {
          created_at: string
          id: string
          theme_category: string
          thumbnail_url: string | null
          user_id: string
          video_name: string
          video_path: string
        }
        Insert: {
          created_at?: string
          id?: string
          theme_category?: string
          thumbnail_url?: string | null
          user_id: string
          video_name: string
          video_path: string
        }
        Update: {
          created_at?: string
          id?: string
          theme_category?: string
          thumbnail_url?: string | null
          user_id?: string
          video_name?: string
          video_path?: string
        }
        Relationships: []
      }
      email_leads: {
        Row: {
          created_at: string
          email: string
          id: string
          source: string
          subscribed: boolean
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          source?: string
          subscribed?: boolean
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          source?: string
          subscribed?: boolean
        }
        Relationships: []
      }
      folders: {
        Row: {
          color: string | null
          created_at: string | null
          icon: string | null
          id: string
          name: string
          position: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          icon?: string | null
          id?: string
          name: string
          position?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          color?: string | null
          created_at?: string | null
          icon?: string | null
          id?: string
          name?: string
          position?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      listening_favorites: {
        Row: {
          content_id: string
          content_type: string
          created_at: string | null
          genre: string
          id: string
          subtitle: string | null
          title: string
          user_id: string
        }
        Insert: {
          content_id: string
          content_type: string
          created_at?: string | null
          genre: string
          id?: string
          subtitle?: string | null
          title: string
          user_id: string
        }
        Update: {
          content_id?: string
          content_type?: string
          created_at?: string | null
          genre?: string
          id?: string
          subtitle?: string | null
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      lucy_agent_decisions: {
        Row: {
          confidence_score: number | null
          created_at: string | null
          decision_output: Json | null
          decision_type: string
          execution_time_ms: number | null
          id: string
          input_context: Json | null
          model_used: string | null
          reasoning: string | null
          run_id: string
          user_id: string
        }
        Insert: {
          confidence_score?: number | null
          created_at?: string | null
          decision_output?: Json | null
          decision_type: string
          execution_time_ms?: number | null
          id?: string
          input_context?: Json | null
          model_used?: string | null
          reasoning?: string | null
          run_id: string
          user_id: string
        }
        Update: {
          confidence_score?: number | null
          created_at?: string | null
          decision_output?: Json | null
          decision_type?: string
          execution_time_ms?: number | null
          id?: string
          input_context?: Json | null
          model_used?: string | null
          reasoning?: string | null
          run_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lucy_agent_decisions_run_id_fkey"
            columns: ["run_id"]
            isOneToOne: false
            referencedRelation: "lucy_workflow_runs"
            referencedColumns: ["id"]
          },
        ]
      }
      lucy_cinematic_jobs: {
        Row: {
          aspect_ratio: string | null
          attempt_count: number | null
          created_at: string | null
          duration_seconds: number | null
          error_message: string | null
          export_urls: Json | null
          id: string
          idempotency_key: string | null
          job_type: Database["public"]["Enums"]["cinematic_job_type"]
          mcp_payload: Json | null
          parent_job_id: string | null
          prompt_enhanced: string | null
          prompt_raw: string
          result_audio_url: string | null
          result_composite_url: string | null
          result_music_url: string | null
          result_video_url: string | null
          seed: number | null
          shots: Json | null
          status: Database["public"]["Enums"]["cinematic_job_status"]
          style_preset: string | null
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          aspect_ratio?: string | null
          attempt_count?: number | null
          created_at?: string | null
          duration_seconds?: number | null
          error_message?: string | null
          export_urls?: Json | null
          id?: string
          idempotency_key?: string | null
          job_type?: Database["public"]["Enums"]["cinematic_job_type"]
          mcp_payload?: Json | null
          parent_job_id?: string | null
          prompt_enhanced?: string | null
          prompt_raw: string
          result_audio_url?: string | null
          result_composite_url?: string | null
          result_music_url?: string | null
          result_video_url?: string | null
          seed?: number | null
          shots?: Json | null
          status?: Database["public"]["Enums"]["cinematic_job_status"]
          style_preset?: string | null
          title?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          aspect_ratio?: string | null
          attempt_count?: number | null
          created_at?: string | null
          duration_seconds?: number | null
          error_message?: string | null
          export_urls?: Json | null
          id?: string
          idempotency_key?: string | null
          job_type?: Database["public"]["Enums"]["cinematic_job_type"]
          mcp_payload?: Json | null
          parent_job_id?: string | null
          prompt_enhanced?: string | null
          prompt_raw?: string
          result_audio_url?: string | null
          result_composite_url?: string | null
          result_music_url?: string | null
          result_video_url?: string | null
          seed?: number | null
          shots?: Json | null
          status?: Database["public"]["Enums"]["cinematic_job_status"]
          style_preset?: string | null
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lucy_cinematic_jobs_parent_job_id_fkey"
            columns: ["parent_job_id"]
            isOneToOne: false
            referencedRelation: "lucy_cinematic_jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      lucy_healing_events: {
        Row: {
          created_at: string | null
          diagnosis: string | null
          healed_at: string | null
          healing_type: string
          id: string
          original_error: string | null
          remedy_applied: string | null
          retry_attempt: number | null
          run_id: string
          success: boolean | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          diagnosis?: string | null
          healed_at?: string | null
          healing_type: string
          id?: string
          original_error?: string | null
          remedy_applied?: string | null
          retry_attempt?: number | null
          run_id: string
          success?: boolean | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          diagnosis?: string | null
          healed_at?: string | null
          healing_type?: string
          id?: string
          original_error?: string | null
          remedy_applied?: string | null
          retry_attempt?: number | null
          run_id?: string
          success?: boolean | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lucy_healing_events_run_id_fkey"
            columns: ["run_id"]
            isOneToOne: false
            referencedRelation: "lucy_workflow_runs"
            referencedColumns: ["id"]
          },
        ]
      }
      lucy_plans: {
        Row: {
          created_at: string | null
          credits_per_month: number | null
          features: Json | null
          id: string
          max_duration_seconds: number | null
          max_exports_per_job: number | null
          max_parallel_jobs: number | null
          monthly_price: number | null
          name: string
          plan_key: string
        }
        Insert: {
          created_at?: string | null
          credits_per_month?: number | null
          features?: Json | null
          id?: string
          max_duration_seconds?: number | null
          max_exports_per_job?: number | null
          max_parallel_jobs?: number | null
          monthly_price?: number | null
          name: string
          plan_key: string
        }
        Update: {
          created_at?: string | null
          credits_per_month?: number | null
          features?: Json | null
          id?: string
          max_duration_seconds?: number | null
          max_exports_per_job?: number | null
          max_parallel_jobs?: number | null
          monthly_price?: number | null
          name?: string
          plan_key?: string
        }
        Relationships: []
      }
      lucy_prompt_memory: {
        Row: {
          created_at: string | null
          final_score: number | null
          id: string
          prompt_enhanced: string | null
          prompt_raw: string
          shots: Json | null
          style_preset: string | null
          success: boolean | null
          tags: string[] | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          final_score?: number | null
          id?: string
          prompt_enhanced?: string | null
          prompt_raw: string
          shots?: Json | null
          style_preset?: string | null
          success?: boolean | null
          tags?: string[] | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          final_score?: number | null
          id?: string
          prompt_enhanced?: string | null
          prompt_raw?: string
          shots?: Json | null
          style_preset?: string | null
          success?: boolean | null
          tags?: string[] | null
          user_id?: string
        }
        Relationships: []
      }
      lucy_usage_ledger: {
        Row: {
          action: string
          created_at: string | null
          credits_delta: number
          id: string
          job_id: string | null
          user_id: string
        }
        Insert: {
          action: string
          created_at?: string | null
          credits_delta: number
          id?: string
          job_id?: string | null
          user_id: string
        }
        Update: {
          action?: string
          created_at?: string | null
          credits_delta?: number
          id?: string
          job_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lucy_usage_ledger_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "lucy_cinematic_jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      lucy_user_plan: {
        Row: {
          created_at: string | null
          credits_balance: number | null
          plan_key: string
          renewal_date: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          credits_balance?: number | null
          plan_key?: string
          renewal_date?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          credits_balance?: number | null
          plan_key?: string
          renewal_date?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      lucy_workflow_registry: {
        Row: {
          created_at: string | null
          description: string | null
          external_id: string | null
          failure_count: number | null
          id: string
          is_active: boolean | null
          last_run_at: string | null
          name: string
          node_count: number | null
          required_secrets: string[] | null
          run_count: number | null
          success_count: number | null
          tags: string[] | null
          trigger_type: Database["public"]["Enums"]["automation_trigger_type"]
          updated_at: string | null
          user_id: string
          workflow_json: Json
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          external_id?: string | null
          failure_count?: number | null
          id?: string
          is_active?: boolean | null
          last_run_at?: string | null
          name: string
          node_count?: number | null
          required_secrets?: string[] | null
          run_count?: number | null
          success_count?: number | null
          tags?: string[] | null
          trigger_type?: Database["public"]["Enums"]["automation_trigger_type"]
          updated_at?: string | null
          user_id: string
          workflow_json: Json
        }
        Update: {
          created_at?: string | null
          description?: string | null
          external_id?: string | null
          failure_count?: number | null
          id?: string
          is_active?: boolean | null
          last_run_at?: string | null
          name?: string
          node_count?: number | null
          required_secrets?: string[] | null
          run_count?: number | null
          success_count?: number | null
          tags?: string[] | null
          trigger_type?: Database["public"]["Enums"]["automation_trigger_type"]
          updated_at?: string | null
          user_id?: string
          workflow_json?: Json
        }
        Relationships: []
      }
      lucy_workflow_runs: {
        Row: {
          completed_at: string | null
          created_at: string | null
          duration_ms: number | null
          error_message: string | null
          error_node: string | null
          id: string
          parent_run_id: string | null
          result_data: Json | null
          retry_count: number | null
          started_at: string | null
          status: Database["public"]["Enums"]["automation_workflow_status"]
          trigger_payload: Json | null
          trigger_source: string | null
          user_id: string
          workflow_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          duration_ms?: number | null
          error_message?: string | null
          error_node?: string | null
          id?: string
          parent_run_id?: string | null
          result_data?: Json | null
          retry_count?: number | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["automation_workflow_status"]
          trigger_payload?: Json | null
          trigger_source?: string | null
          user_id: string
          workflow_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          duration_ms?: number | null
          error_message?: string | null
          error_node?: string | null
          id?: string
          parent_run_id?: string | null
          result_data?: Json | null
          retry_count?: number | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["automation_workflow_status"]
          trigger_payload?: Json | null
          trigger_source?: string | null
          user_id?: string
          workflow_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lucy_workflow_runs_parent_run_id_fkey"
            columns: ["parent_run_id"]
            isOneToOne: false
            referencedRelation: "lucy_workflow_runs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lucy_workflow_runs_workflow_id_fkey"
            columns: ["workflow_id"]
            isOneToOne: false
            referencedRelation: "lucy_workflow_registry"
            referencedColumns: ["id"]
          },
        ]
      }
      message_reactions: {
        Row: {
          created_at: string
          emoji: string
          id: string
          message_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          emoji: string
          id?: string
          message_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          emoji?: string
          id?: string
          message_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "message_reactions_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          metadata: Json | null
          model_used: string | null
          role: string
          search_vector: unknown
          tokens_used: number | null
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          metadata?: Json | null
          model_used?: string | null
          role: string
          search_vector?: unknown
          tokens_used?: number | null
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          metadata?: Json | null
          model_used?: string | null
          role?: string
          search_vector?: unknown
          tokens_used?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      page_analytics: {
        Row: {
          browser: string | null
          country: string | null
          created_at: string | null
          device_type: string | null
          id: string
          page_path: string
          referrer: string | null
          session_id: string | null
          user_agent: string | null
        }
        Insert: {
          browser?: string | null
          country?: string | null
          created_at?: string | null
          device_type?: string | null
          id?: string
          page_path: string
          referrer?: string | null
          session_id?: string | null
          user_agent?: string | null
        }
        Update: {
          browser?: string | null
          country?: string | null
          created_at?: string | null
          device_type?: string | null
          id?: string
          page_path?: string
          referrer?: string | null
          session_id?: string | null
          user_agent?: string | null
        }
        Relationships: []
      }
      performance_metrics: {
        Row: {
          device_info: Json
          fps_average: number | null
          id: string
          memory_usage: number | null
          recommended_quality: string | null
          timestamp: string
          user_id: string | null
          video_quality: string | null
        }
        Insert: {
          device_info: Json
          fps_average?: number | null
          id?: string
          memory_usage?: number | null
          recommended_quality?: string | null
          timestamp?: string
          user_id?: string | null
          video_quality?: string | null
        }
        Update: {
          device_info?: Json
          fps_average?: number | null
          id?: string
          memory_usage?: number | null
          recommended_quality?: string | null
          timestamp?: string
          user_id?: string | null
          video_quality?: string | null
        }
        Relationships: []
      }
      proactive_suggestions: {
        Row: {
          conversation_id: string
          created_at: string
          id: string
          relevance_score: number | null
          shown: boolean | null
          suggestion_text: string
          suggestion_type: string
        }
        Insert: {
          conversation_id: string
          created_at?: string
          id?: string
          relevance_score?: number | null
          shown?: boolean | null
          suggestion_text: string
          suggestion_type?: string
        }
        Update: {
          conversation_id?: string
          created_at?: string
          id?: string
          relevance_score?: number | null
          shown?: boolean | null
          suggestion_text?: string
          suggestion_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "proactive_suggestions_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          id: string
          name: string | null
          preferences: Json | null
          pro_trial_until: string | null
          referral_code: string | null
          referred_by: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          id: string
          name?: string | null
          preferences?: Json | null
          pro_trial_until?: string | null
          referral_code?: string | null
          referred_by?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          id?: string
          name?: string | null
          preferences?: Json | null
          pro_trial_until?: string | null
          referral_code?: string | null
          referred_by?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_referred_by_fkey"
            columns: ["referred_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      referrals: {
        Row: {
          converted_at: string | null
          created_at: string | null
          id: string
          referral_code: string
          referred_user_id: string | null
          referrer_user_id: string
          reward_granted: boolean | null
          status: string | null
        }
        Insert: {
          converted_at?: string | null
          created_at?: string | null
          id?: string
          referral_code: string
          referred_user_id?: string | null
          referrer_user_id: string
          reward_granted?: boolean | null
          status?: string | null
        }
        Update: {
          converted_at?: string | null
          created_at?: string | null
          id?: string
          referral_code?: string
          referred_user_id?: string | null
          referrer_user_id?: string
          reward_granted?: boolean | null
          status?: string | null
        }
        Relationships: []
      }
      room_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          metadata: Json | null
          room_id: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          metadata?: Json | null
          room_id: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          metadata?: Json | null
          room_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "room_messages_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "chat_rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      room_participants: {
        Row: {
          id: string
          joined_at: string
          last_read_at: string
          role: string
          room_id: string
          user_id: string
        }
        Insert: {
          id?: string
          joined_at?: string
          last_read_at?: string
          role?: string
          room_id: string
          user_id: string
        }
        Update: {
          id?: string
          joined_at?: string
          last_read_at?: string
          role?: string
          room_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "room_participants_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "chat_rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      scene_activity_log: {
        Row: {
          chat_context: Json | null
          duration_seconds: number | null
          id: string
          interaction_quality: string | null
          scene_type: string
          timestamp: string
          user_id: string
        }
        Insert: {
          chat_context?: Json | null
          duration_seconds?: number | null
          id?: string
          interaction_quality?: string | null
          scene_type: string
          timestamp?: string
          user_id: string
        }
        Update: {
          chat_context?: Json | null
          duration_seconds?: number | null
          id?: string
          interaction_quality?: string | null
          scene_type?: string
          timestamp?: string
          user_id?: string
        }
        Relationships: []
      }
      scene_playlists: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_default: boolean
          mood: string
          name: string
          scenes: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_default?: boolean
          mood: string
          name: string
          scenes?: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_default?: boolean
          mood?: string
          name?: string
          scenes?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      scene_preferences: {
        Row: {
          active_playlist_id: string | null
          auto_theme_enabled: boolean | null
          created_at: string
          favorite_scenes: Json | null
          geolocation_enabled: boolean | null
          id: string
          location_data: Json | null
          parallax_intensity: number | null
          time_based_themes: Json | null
          transition_duration: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          active_playlist_id?: string | null
          auto_theme_enabled?: boolean | null
          created_at?: string
          favorite_scenes?: Json | null
          geolocation_enabled?: boolean | null
          id?: string
          location_data?: Json | null
          parallax_intensity?: number | null
          time_based_themes?: Json | null
          transition_duration?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          active_playlist_id?: string | null
          auto_theme_enabled?: boolean | null
          created_at?: string
          favorite_scenes?: Json | null
          geolocation_enabled?: boolean | null
          id?: string
          location_data?: Json | null
          parallax_intensity?: number | null
          time_based_themes?: Json | null
          transition_duration?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "scene_preferences_active_playlist_id_fkey"
            columns: ["active_playlist_id"]
            isOneToOne: false
            referencedRelation: "scene_playlists"
            referencedColumns: ["id"]
          },
        ]
      }
      search_results: {
        Row: {
          created_at: string
          id: string
          message_id: string | null
          query: string
          results: Json | null
          sources: string[] | null
        }
        Insert: {
          created_at?: string
          id?: string
          message_id?: string | null
          query: string
          results?: Json | null
          sources?: string[] | null
        }
        Update: {
          created_at?: string
          id?: string
          message_id?: string | null
          query?: string
          results?: Json | null
          sources?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "search_results_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
        ]
      }
      shared_conversations: {
        Row: {
          conversation_id: string
          created_at: string
          created_by: string
          expires_at: string | null
          id: string
          is_public: boolean
          last_accessed_at: string | null
          password_hash: string | null
          share_token: string
          view_count: number
        }
        Insert: {
          conversation_id: string
          created_at?: string
          created_by: string
          expires_at?: string | null
          id?: string
          is_public?: boolean
          last_accessed_at?: string | null
          password_hash?: string | null
          share_token?: string
          view_count?: number
        }
        Update: {
          conversation_id?: string
          created_at?: string
          created_by?: string
          expires_at?: string | null
          id?: string
          is_public?: boolean
          last_accessed_at?: string | null
          password_hash?: string | null
          share_token?: string
          view_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "shared_conversations_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      usage_stats: {
        Row: {
          cost_usd: number | null
          created_at: string
          date: string
          id: string
          messages_sent: number
          model_used: string | null
          tokens_used: number
          updated_at: string
          user_id: string | null
        }
        Insert: {
          cost_usd?: number | null
          created_at?: string
          date?: string
          id?: string
          messages_sent?: number
          model_used?: string | null
          tokens_used?: number
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          cost_usd?: number | null
          created_at?: string
          date?: string
          id?: string
          messages_sent?: number
          model_used?: string | null
          tokens_used?: number
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      user_audio_credits: {
        Row: {
          created_at: string | null
          credits_remaining: number | null
          credits_total: number | null
          id: string
          last_reset: string | null
          plan_tier: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          credits_remaining?: number | null
          credits_total?: number | null
          id?: string
          last_reset?: string | null
          plan_tier?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          credits_remaining?: number | null
          credits_total?: number | null
          id?: string
          last_reset?: string | null
          plan_tier?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_memories: {
        Row: {
          content: string
          created_at: string
          id: string
          importance_score: number | null
          last_accessed: string | null
          memory_type: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          importance_score?: number | null
          last_accessed?: string | null
          memory_type?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          importance_score?: number | null
          last_accessed?: string | null
          memory_type?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      promote_admin_by_email: { Args: { user_email: string }; Returns: Json }
      search_messages: {
        Args: { search_query: string }
        Returns: {
          content: string
          conversation_id: string
          conversation_title: string
          created_at: string
          id: string
          rank: number
          role: string
        }[]
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
      automation_trigger_type:
        | "manual"
        | "chat"
        | "schedule"
        | "webhook"
        | "event"
      automation_workflow_status:
        | "idle"
        | "running"
        | "failed"
        | "healed"
        | "complete"
        | "canceled"
      cinematic_job_status:
        | "queued"
        | "running"
        | "complete"
        | "failed"
        | "canceled"
      cinematic_job_type:
        | "video"
        | "voice"
        | "music"
        | "composite"
        | "export_pack"
        | "cutscene"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "moderator", "user"],
      automation_trigger_type: [
        "manual",
        "chat",
        "schedule",
        "webhook",
        "event",
      ],
      automation_workflow_status: [
        "idle",
        "running",
        "failed",
        "healed",
        "complete",
        "canceled",
      ],
      cinematic_job_status: [
        "queued",
        "running",
        "complete",
        "failed",
        "canceled",
      ],
      cinematic_job_type: [
        "video",
        "voice",
        "music",
        "composite",
        "export_pack",
        "cutscene",
      ],
    },
  },
} as const
