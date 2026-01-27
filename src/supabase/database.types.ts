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
    PostgrestVersion: "14.1"
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      achievements: {
        Row: {
          category: string
          coin_reward: number | null
          cosmetic_reward: string | null
          created_at: string | null
          description: string | null
          game_slug: string | null
          icon_url: string | null
          id: string
          is_enabled: boolean | null
          is_hidden: boolean | null
          name: string
          rarity: string | null
          requirement_config: Json | null
          requirement_type: string
          requirement_value: number
          slug: string
          title_reward: string | null
          total_unlocks: number | null
          unlock_percentage: number | null
          unlocked_icon_url: string | null
          xp_reward: number | null
        }
        Insert: {
          category: string
          coin_reward?: number | null
          cosmetic_reward?: string | null
          created_at?: string | null
          description?: string | null
          game_slug?: string | null
          icon_url?: string | null
          id?: string
          is_enabled?: boolean | null
          is_hidden?: boolean | null
          name: string
          rarity?: string | null
          requirement_config?: Json | null
          requirement_type: string
          requirement_value: number
          slug: string
          title_reward?: string | null
          total_unlocks?: number | null
          unlock_percentage?: number | null
          unlocked_icon_url?: string | null
          xp_reward?: number | null
        }
        Update: {
          category?: string
          coin_reward?: number | null
          cosmetic_reward?: string | null
          created_at?: string | null
          description?: string | null
          game_slug?: string | null
          icon_url?: string | null
          id?: string
          is_enabled?: boolean | null
          is_hidden?: boolean | null
          name?: string
          rarity?: string | null
          requirement_config?: Json | null
          requirement_type?: string
          requirement_value?: number
          slug?: string
          title_reward?: string | null
          total_unlocks?: number | null
          unlock_percentage?: number | null
          unlocked_icon_url?: string | null
          xp_reward?: number | null
        }
        Relationships: []
      }
      affiliate_clicks: {
        Row: {
          clicked_at: string | null
          commission_earned: number | null
          component_path: string | null
          converted_at: string | null
          created_at: string | null
          deep_link_url: string
          id: string
          media_node_id: string | null
          partner: string
          revenue_generated: number | null
          session_id: string
          source: string
          user_id: string | null
        }
        Insert: {
          clicked_at?: string | null
          commission_earned?: number | null
          component_path?: string | null
          converted_at?: string | null
          created_at?: string | null
          deep_link_url: string
          id?: string
          media_node_id?: string | null
          partner: string
          revenue_generated?: number | null
          session_id: string
          source: string
          user_id?: string | null
        }
        Update: {
          clicked_at?: string | null
          commission_earned?: number | null
          component_path?: string | null
          converted_at?: string | null
          created_at?: string | null
          deep_link_url?: string
          id?: string
          media_node_id?: string | null
          partner?: string
          revenue_generated?: number | null
          session_id?: string
          source?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "affiliate_clicks_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_usage_summary"
            referencedColumns: ["user_id"]
          },
        ]
      }
      affiliate_conversions: {
        Row: {
          click_id: string | null
          commission: number
          conversion_type: string
          converted_at: string | null
          currency: string | null
          id: string
          lucy_influence_score: number | null
          partner: string
          revenue: number
        }
        Insert: {
          click_id?: string | null
          commission: number
          conversion_type: string
          converted_at?: string | null
          currency?: string | null
          id?: string
          lucy_influence_score?: number | null
          partner: string
          revenue: number
        }
        Update: {
          click_id?: string | null
          commission?: number
          conversion_type?: string
          converted_at?: string | null
          currency?: string | null
          id?: string
          lucy_influence_score?: number | null
          partner?: string
          revenue?: number
        }
        Relationships: [
          {
            foreignKeyName: "affiliate_conversions_click_id_fkey"
            columns: ["click_id"]
            isOneToOne: false
            referencedRelation: "affiliate_clicks"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_opponents: {
        Row: {
          adaptation_rate: number | null
          avatar_url: string | null
          average_deaths: number | null
          average_kills: number | null
          behavior_profile: Json
          created_at: string | null
          difficulty: string
          difficulty_multiplier: number | null
          display_name: string | null
          game_id: string | null
          game_slug: string | null
          id: string
          is_enabled: boolean | null
          learning_enabled: boolean | null
          name: string
          personality: string
          total_losses: number | null
          total_matches: number | null
          total_wins: number | null
          updated_at: string | null
        }
        Insert: {
          adaptation_rate?: number | null
          avatar_url?: string | null
          average_deaths?: number | null
          average_kills?: number | null
          behavior_profile?: Json
          created_at?: string | null
          difficulty: string
          difficulty_multiplier?: number | null
          display_name?: string | null
          game_id?: string | null
          game_slug?: string | null
          id?: string
          is_enabled?: boolean | null
          learning_enabled?: boolean | null
          name: string
          personality: string
          total_losses?: number | null
          total_matches?: number | null
          total_wins?: number | null
          updated_at?: string | null
        }
        Update: {
          adaptation_rate?: number | null
          avatar_url?: string | null
          average_deaths?: number | null
          average_kills?: number | null
          behavior_profile?: Json
          created_at?: string | null
          difficulty?: string
          difficulty_multiplier?: number | null
          display_name?: string | null
          game_id?: string | null
          game_slug?: string | null
          id?: string
          is_enabled?: boolean | null
          learning_enabled?: boolean | null
          name?: string
          personality?: string
          total_losses?: number | null
          total_matches?: number | null
          total_wins?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_opponents_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "games"
            referencedColumns: ["id"]
          },
        ]
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
        Relationships: [
          {
            foreignKeyName: "analytics_events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_usage_summary"
            referencedColumns: ["user_id"]
          },
        ]
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
      arcade_game_listings: {
        Row: {
          avg_rating: number | null
          banner: string | null
          category: string | null
          creator_id: string
          description: string | null
          favorite_count: number | null
          id: string
          play_count: number | null
          price: number | null
          pricing_model: string | null
          project_id: string
          published_at: string | null
          rating_count: number | null
          revenue: number | null
          screenshots: string[] | null
          short_description: string | null
          status: string | null
          tags: string[] | null
          thumbnail: string | null
          title: string
          trailer_url: string | null
          unique_players: number | null
          updated_at: string | null
          version: string
        }
        Insert: {
          avg_rating?: number | null
          banner?: string | null
          category?: string | null
          creator_id: string
          description?: string | null
          favorite_count?: number | null
          id?: string
          play_count?: number | null
          price?: number | null
          pricing_model?: string | null
          project_id: string
          published_at?: string | null
          rating_count?: number | null
          revenue?: number | null
          screenshots?: string[] | null
          short_description?: string | null
          status?: string | null
          tags?: string[] | null
          thumbnail?: string | null
          title: string
          trailer_url?: string | null
          unique_players?: number | null
          updated_at?: string | null
          version: string
        }
        Update: {
          avg_rating?: number | null
          banner?: string | null
          category?: string | null
          creator_id?: string
          description?: string | null
          favorite_count?: number | null
          id?: string
          play_count?: number | null
          price?: number | null
          pricing_model?: string | null
          project_id?: string
          published_at?: string | null
          rating_count?: number | null
          revenue?: number | null
          screenshots?: string[] | null
          short_description?: string | null
          status?: string | null
          tags?: string[] | null
          thumbnail?: string | null
          title?: string
          trailer_url?: string | null
          unique_players?: number | null
          updated_at?: string | null
          version?: string
        }
        Relationships: [
          {
            foreignKeyName: "arcade_game_listings_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "user_usage_summary"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "arcade_game_listings_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "game_studio_projects"
            referencedColumns: ["id"]
          },
        ]
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
      arcade_games_catalog: {
        Row: {
          banner_url: string | null
          category: string
          controls_info: Json | null
          created_at: string | null
          default_difficulty: string | null
          description: string | null
          difficulty_levels: string[] | null
          icon_url: string | null
          id: string
          instructions: string | null
          is_enabled: boolean | null
          is_featured: boolean | null
          is_new: boolean | null
          max_players: number | null
          min_players: number | null
          name: string
          sort_order: number | null
          supports_ai: boolean | null
          supports_controller: boolean | null
          supports_pvp: boolean | null
          thumbnail_url: string | null
          tips: string[] | null
          updated_at: string | null
        }
        Insert: {
          banner_url?: string | null
          category: string
          controls_info?: Json | null
          created_at?: string | null
          default_difficulty?: string | null
          description?: string | null
          difficulty_levels?: string[] | null
          icon_url?: string | null
          id: string
          instructions?: string | null
          is_enabled?: boolean | null
          is_featured?: boolean | null
          is_new?: boolean | null
          max_players?: number | null
          min_players?: number | null
          name: string
          sort_order?: number | null
          supports_ai?: boolean | null
          supports_controller?: boolean | null
          supports_pvp?: boolean | null
          thumbnail_url?: string | null
          tips?: string[] | null
          updated_at?: string | null
        }
        Update: {
          banner_url?: string | null
          category?: string
          controls_info?: Json | null
          created_at?: string | null
          default_difficulty?: string | null
          description?: string | null
          difficulty_levels?: string[] | null
          icon_url?: string | null
          id?: string
          instructions?: string | null
          is_enabled?: boolean | null
          is_featured?: boolean | null
          is_new?: boolean | null
          max_players?: number | null
          min_players?: number | null
          name?: string
          sort_order?: number | null
          supports_ai?: boolean | null
          supports_controller?: boolean | null
          supports_pvp?: boolean | null
          thumbnail_url?: string | null
          tips?: string[] | null
          updated_at?: string | null
        }
        Relationships: []
      }
      arcade_input_validations: {
        Row: {
          anomaly_flags: string[] | null
          anomaly_score: number | null
          created_at: string | null
          id: string
          input_hash: string
          is_valid: boolean
          match_id: string
          player_id: string
          server_hash: string
          tick: number
        }
        Insert: {
          anomaly_flags?: string[] | null
          anomaly_score?: number | null
          created_at?: string | null
          id?: string
          input_hash: string
          is_valid: boolean
          match_id: string
          player_id: string
          server_hash: string
          tick: number
        }
        Update: {
          anomaly_flags?: string[] | null
          anomaly_score?: number | null
          created_at?: string | null
          id?: string
          input_hash?: string
          is_valid?: boolean
          match_id?: string
          player_id?: string
          server_hash?: string
          tick?: number
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
      arcade_lobbies: {
        Row: {
          created_at: string | null
          difficulty: string | null
          ended_at: string | null
          game_id: string
          host_user_id: string
          id: string
          invite_code: string | null
          is_public: boolean | null
          max_players: number | null
          name: string | null
          started_at: string | null
          status: string
        }
        Insert: {
          created_at?: string | null
          difficulty?: string | null
          ended_at?: string | null
          game_id: string
          host_user_id: string
          id?: string
          invite_code?: string | null
          is_public?: boolean | null
          max_players?: number | null
          name?: string | null
          started_at?: string | null
          status?: string
        }
        Update: {
          created_at?: string | null
          difficulty?: string | null
          ended_at?: string | null
          game_id?: string
          host_user_id?: string
          id?: string
          invite_code?: string | null
          is_public?: boolean | null
          max_players?: number | null
          name?: string | null
          started_at?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "arcade_lobbies_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "arcade_games_catalog"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "arcade_lobbies_host_user_id_fkey"
            columns: ["host_user_id"]
            isOneToOne: false
            referencedRelation: "user_usage_summary"
            referencedColumns: ["user_id"]
          },
        ]
      }
      arcade_lobby_participants: {
        Row: {
          id: string
          is_host: boolean | null
          is_ready: boolean | null
          joined_at: string | null
          lobby_id: string
          slot_number: number | null
          user_id: string
        }
        Insert: {
          id?: string
          is_host?: boolean | null
          is_ready?: boolean | null
          joined_at?: string | null
          lobby_id: string
          slot_number?: number | null
          user_id: string
        }
        Update: {
          id?: string
          is_host?: boolean | null
          is_ready?: boolean | null
          joined_at?: string | null
          lobby_id?: string
          slot_number?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "arcade_lobby_participants_lobby_id_fkey"
            columns: ["lobby_id"]
            isOneToOne: false
            referencedRelation: "arcade_lobbies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "arcade_lobby_participants_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_usage_summary"
            referencedColumns: ["user_id"]
          },
        ]
      }
      arcade_match_events: {
        Row: {
          created_at: string | null
          event_data: Json
          event_type: string
          id: string
          match_id: string
          player_id: string | null
          sequence: number
        }
        Insert: {
          created_at?: string | null
          event_data: Json
          event_type: string
          id?: string
          match_id: string
          player_id?: string | null
          sequence: number
        }
        Update: {
          created_at?: string | null
          event_data?: Json
          event_type?: string
          id?: string
          match_id?: string
          player_id?: string | null
          sequence?: number
        }
        Relationships: [
          {
            foreignKeyName: "arcade_match_events_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "arcade_matches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "arcade_match_events_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "user_usage_summary"
            referencedColumns: ["user_id"]
          },
        ]
      }
      arcade_matches: {
        Row: {
          ai_difficulty: string | null
          anti_cheat_validated: boolean | null
          created_at: string | null
          duration_seconds: number | null
          ended_at: string | null
          final_scores: Json | null
          game_id: string
          game_mode_id: string | null
          game_state: Json | null
          id: string
          is_draw: boolean | null
          is_ranked: boolean | null
          is_tournament: boolean | null
          is_vs_ai: boolean | null
          lobby_id: string | null
          match_stats: Json | null
          player1_id: string | null
          player1_score: number | null
          player2_id: string | null
          player2_score: number | null
          players: Json | null
          replay_id: string | null
          server_id: string | null
          server_region: string | null
          started_at: string | null
          status: string
          teams: Json | null
          tournament_id: string | null
          winner_id: string | null
        }
        Insert: {
          ai_difficulty?: string | null
          anti_cheat_validated?: boolean | null
          created_at?: string | null
          duration_seconds?: number | null
          ended_at?: string | null
          final_scores?: Json | null
          game_id: string
          game_mode_id?: string | null
          game_state?: Json | null
          id?: string
          is_draw?: boolean | null
          is_ranked?: boolean | null
          is_tournament?: boolean | null
          is_vs_ai?: boolean | null
          lobby_id?: string | null
          match_stats?: Json | null
          player1_id?: string | null
          player1_score?: number | null
          player2_id?: string | null
          player2_score?: number | null
          players?: Json | null
          replay_id?: string | null
          server_id?: string | null
          server_region?: string | null
          started_at?: string | null
          status?: string
          teams?: Json | null
          tournament_id?: string | null
          winner_id?: string | null
        }
        Update: {
          ai_difficulty?: string | null
          anti_cheat_validated?: boolean | null
          created_at?: string | null
          duration_seconds?: number | null
          ended_at?: string | null
          final_scores?: Json | null
          game_id?: string
          game_mode_id?: string | null
          game_state?: Json | null
          id?: string
          is_draw?: boolean | null
          is_ranked?: boolean | null
          is_tournament?: boolean | null
          is_vs_ai?: boolean | null
          lobby_id?: string | null
          match_stats?: Json | null
          player1_id?: string | null
          player1_score?: number | null
          player2_id?: string | null
          player2_score?: number | null
          players?: Json | null
          replay_id?: string | null
          server_id?: string | null
          server_region?: string | null
          started_at?: string | null
          status?: string
          teams?: Json | null
          tournament_id?: string | null
          winner_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "arcade_matches_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "arcade_games_catalog"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "arcade_matches_game_mode_id_fkey"
            columns: ["game_mode_id"]
            isOneToOne: false
            referencedRelation: "game_modes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "arcade_matches_lobby_id_fkey"
            columns: ["lobby_id"]
            isOneToOne: false
            referencedRelation: "arcade_lobbies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "arcade_matches_player1_id_fkey"
            columns: ["player1_id"]
            isOneToOne: false
            referencedRelation: "user_usage_summary"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "arcade_matches_player2_id_fkey"
            columns: ["player2_id"]
            isOneToOne: false
            referencedRelation: "user_usage_summary"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "arcade_matches_winner_id_fkey"
            columns: ["winner_id"]
            isOneToOne: false
            referencedRelation: "user_usage_summary"
            referencedColumns: ["user_id"]
          },
        ]
      }
      arcade_matchmaking_tickets: {
        Row: {
          created_at: string | null
          expires_at: string
          game_id: string
          game_mode_id: string | null
          id: string
          match_id: string | null
          max_ping_ms: number | null
          mmr: number
          mmr_range: number
          mode: string
          party_members: string[] | null
          player_id: string
          preferred_server: string | null
          priority: number | null
          region: string
          search_duration_seconds: number | null
          search_start_time: string | null
          status: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          expires_at: string
          game_id: string
          game_mode_id?: string | null
          id?: string
          match_id?: string | null
          max_ping_ms?: number | null
          mmr?: number
          mmr_range?: number
          mode?: string
          party_members?: string[] | null
          player_id: string
          preferred_server?: string | null
          priority?: number | null
          region?: string
          search_duration_seconds?: number | null
          search_start_time?: string | null
          status?: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          expires_at?: string
          game_id?: string
          game_mode_id?: string | null
          id?: string
          match_id?: string | null
          max_ping_ms?: number | null
          mmr?: number
          mmr_range?: number
          mode?: string
          party_members?: string[] | null
          player_id?: string
          preferred_server?: string | null
          priority?: number | null
          region?: string
          search_duration_seconds?: number | null
          search_start_time?: string | null
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "arcade_matchmaking_tickets_game_mode_id_fkey"
            columns: ["game_mode_id"]
            isOneToOne: false
            referencedRelation: "game_modes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "arcade_matchmaking_tickets_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "user_usage_summary"
            referencedColumns: ["user_id"]
          },
        ]
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
      arcade_player_rankings: {
        Row: {
          created_at: string | null
          current_loss_streak: number | null
          current_win_streak: number | null
          game_id: string
          id: string
          last_match_at: string | null
          longest_win_streak: number | null
          mmr: number | null
          peak_mmr: number | null
          placement_matches_played: number | null
          placement_matches_required: number | null
          player_id: string
          rank_division: number | null
          rank_tier: string | null
          season_draws: number | null
          season_id: string | null
          season_losses: number | null
          season_wins: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          current_loss_streak?: number | null
          current_win_streak?: number | null
          game_id: string
          id?: string
          last_match_at?: string | null
          longest_win_streak?: number | null
          mmr?: number | null
          peak_mmr?: number | null
          placement_matches_played?: number | null
          placement_matches_required?: number | null
          player_id: string
          rank_division?: number | null
          rank_tier?: string | null
          season_draws?: number | null
          season_id?: string | null
          season_losses?: number | null
          season_wins?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          current_loss_streak?: number | null
          current_win_streak?: number | null
          game_id?: string
          id?: string
          last_match_at?: string | null
          longest_win_streak?: number | null
          mmr?: number | null
          peak_mmr?: number | null
          placement_matches_played?: number | null
          placement_matches_required?: number | null
          player_id?: string
          rank_division?: number | null
          rank_tier?: string | null
          season_draws?: number | null
          season_id?: string | null
          season_losses?: number | null
          season_wins?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "arcade_player_rankings_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "user_usage_summary"
            referencedColumns: ["user_id"]
          },
        ]
      }
      arcade_player_reports: {
        Row: {
          action_taken: string | null
          category: string
          created_at: string | null
          description: string | null
          evidence_urls: string[] | null
          id: string
          match_id: string | null
          reason: string
          reported_id: string
          reporter_id: string
          resolution: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string | null
        }
        Insert: {
          action_taken?: string | null
          category: string
          created_at?: string | null
          description?: string | null
          evidence_urls?: string[] | null
          id?: string
          match_id?: string | null
          reason: string
          reported_id: string
          reporter_id: string
          resolution?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
        }
        Update: {
          action_taken?: string | null
          category?: string
          created_at?: string | null
          description?: string | null
          evidence_urls?: string[] | null
          id?: string
          match_id?: string | null
          reason?: string
          reported_id?: string
          reporter_id?: string
          resolution?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "arcade_player_reports_reported_id_fkey"
            columns: ["reported_id"]
            isOneToOne: false
            referencedRelation: "user_usage_summary"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "arcade_player_reports_reporter_id_fkey"
            columns: ["reporter_id"]
            isOneToOne: false
            referencedRelation: "user_usage_summary"
            referencedColumns: ["user_id"]
          },
        ]
      }
      arcade_player_sanctions: {
        Row: {
          expires_at: string | null
          id: string
          issued_by: string | null
          permanent: boolean | null
          player_id: string
          reason: string
          report_id: string | null
          starts_at: string | null
          type: string
        }
        Insert: {
          expires_at?: string | null
          id?: string
          issued_by?: string | null
          permanent?: boolean | null
          player_id: string
          reason: string
          report_id?: string | null
          starts_at?: string | null
          type: string
        }
        Update: {
          expires_at?: string | null
          id?: string
          issued_by?: string | null
          permanent?: boolean | null
          player_id?: string
          reason?: string
          report_id?: string | null
          starts_at?: string | null
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "arcade_player_sanctions_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "user_usage_summary"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "arcade_player_sanctions_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "arcade_player_reports"
            referencedColumns: ["id"]
          },
        ]
      }
      arcade_rank_tiers: {
        Row: {
          color: string | null
          division_count: number | null
          icon_url: string | null
          id: string
          max_mmr: number
          min_mmr: number
          name: string
        }
        Insert: {
          color?: string | null
          division_count?: number | null
          icon_url?: string | null
          id: string
          max_mmr: number
          min_mmr: number
          name: string
        }
        Update: {
          color?: string | null
          division_count?: number | null
          icon_url?: string | null
          id?: string
          max_mmr?: number
          min_mmr?: number
          name?: string
        }
        Relationships: []
      }
      arcade_replay_snapshots: {
        Row: {
          id: string
          replay_id: string
          snapshot_data: Json
          tick: number
          timestamp_ms: number
        }
        Insert: {
          id?: string
          replay_id: string
          snapshot_data: Json
          tick: number
          timestamp_ms: number
        }
        Update: {
          id?: string
          replay_id?: string
          snapshot_data?: Json
          tick?: number
          timestamp_ms?: number
        }
        Relationships: [
          {
            foreignKeyName: "arcade_replay_snapshots_replay_id_fkey"
            columns: ["replay_id"]
            isOneToOne: false
            referencedRelation: "arcade_replays"
            referencedColumns: ["id"]
          },
        ]
      }
      arcade_replays: {
        Row: {
          compressed: boolean | null
          description: string | null
          duration_seconds: number | null
          expires_at: string | null
          featured: boolean | null
          file_size_bytes: number | null
          file_url: string | null
          game_id: string
          id: string
          is_public: boolean | null
          like_count: number | null
          match_id: string
          players: Json
          recorded_at: string | null
          search_vector: unknown
          tick_rate: number | null
          title: string | null
          total_ticks: number | null
          version: string
          view_count: number | null
          winner_id: string | null
        }
        Insert: {
          compressed?: boolean | null
          description?: string | null
          duration_seconds?: number | null
          expires_at?: string | null
          featured?: boolean | null
          file_size_bytes?: number | null
          file_url?: string | null
          game_id: string
          id?: string
          is_public?: boolean | null
          like_count?: number | null
          match_id: string
          players?: Json
          recorded_at?: string | null
          search_vector?: unknown
          tick_rate?: number | null
          title?: string | null
          total_ticks?: number | null
          version: string
          view_count?: number | null
          winner_id?: string | null
        }
        Update: {
          compressed?: boolean | null
          description?: string | null
          duration_seconds?: number | null
          expires_at?: string | null
          featured?: boolean | null
          file_size_bytes?: number | null
          file_url?: string | null
          game_id?: string
          id?: string
          is_public?: boolean | null
          like_count?: number | null
          match_id?: string
          players?: Json
          recorded_at?: string | null
          search_vector?: unknown
          tick_rate?: number | null
          title?: string | null
          total_ticks?: number | null
          version?: string
          view_count?: number | null
          winner_id?: string | null
        }
        Relationships: []
      }
      arcade_spectator_sessions: {
        Row: {
          delay_seconds: number | null
          following_player_id: string | null
          id: string
          joined_at: string | null
          last_heartbeat: string | null
          match_id: string
          quality: string | null
          session_token: string
          spectator_id: string | null
          total_watch_time_seconds: number | null
          view_mode: string | null
        }
        Insert: {
          delay_seconds?: number | null
          following_player_id?: string | null
          id?: string
          joined_at?: string | null
          last_heartbeat?: string | null
          match_id: string
          quality?: string | null
          session_token: string
          spectator_id?: string | null
          total_watch_time_seconds?: number | null
          view_mode?: string | null
        }
        Update: {
          delay_seconds?: number | null
          following_player_id?: string | null
          id?: string
          joined_at?: string | null
          last_heartbeat?: string | null
          match_id?: string
          quality?: string | null
          session_token?: string
          spectator_id?: string | null
          total_watch_time_seconds?: number | null
          view_mode?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "arcade_spectator_sessions_spectator_id_fkey"
            columns: ["spectator_id"]
            isOneToOne: false
            referencedRelation: "user_usage_summary"
            referencedColumns: ["user_id"]
          },
        ]
      }
      arcade_tournament_matches: {
        Row: {
          bracket_match_id: string
          completed_at: string | null
          dispute_reason: string | null
          dispute_resolved_by: string | null
          disputed: boolean | null
          game_match_id: string | null
          id: string
          loser_id: string | null
          participant1_id: string | null
          participant2_id: string | null
          replay_id: string | null
          scheduled_time: string | null
          score_team1: number | null
          score_team2: number | null
          started_at: string | null
          status: string | null
          tournament_id: string
          winner_id: string | null
        }
        Insert: {
          bracket_match_id: string
          completed_at?: string | null
          dispute_reason?: string | null
          dispute_resolved_by?: string | null
          disputed?: boolean | null
          game_match_id?: string | null
          id?: string
          loser_id?: string | null
          participant1_id?: string | null
          participant2_id?: string | null
          replay_id?: string | null
          scheduled_time?: string | null
          score_team1?: number | null
          score_team2?: number | null
          started_at?: string | null
          status?: string | null
          tournament_id: string
          winner_id?: string | null
        }
        Update: {
          bracket_match_id?: string
          completed_at?: string | null
          dispute_reason?: string | null
          dispute_resolved_by?: string | null
          disputed?: boolean | null
          game_match_id?: string | null
          id?: string
          loser_id?: string | null
          participant1_id?: string | null
          participant2_id?: string | null
          replay_id?: string | null
          scheduled_time?: string | null
          score_team1?: number | null
          score_team2?: number | null
          started_at?: string | null
          status?: string | null
          tournament_id?: string
          winner_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "arcade_tournament_matches_tournament_id_fkey"
            columns: ["tournament_id"]
            isOneToOne: false
            referencedRelation: "arcade_tournaments"
            referencedColumns: ["id"]
          },
        ]
      }
      arcade_tournament_registrations: {
        Row: {
          checked_in: boolean | null
          checked_in_at: string | null
          eliminated: boolean | null
          entry_paid: boolean | null
          entry_transaction_id: string | null
          final_placement: number | null
          id: string
          player_id: string
          registered_at: string | null
          seed: number | null
          team_id: string | null
          tournament_id: string
        }
        Insert: {
          checked_in?: boolean | null
          checked_in_at?: string | null
          eliminated?: boolean | null
          entry_paid?: boolean | null
          entry_transaction_id?: string | null
          final_placement?: number | null
          id?: string
          player_id: string
          registered_at?: string | null
          seed?: number | null
          team_id?: string | null
          tournament_id: string
        }
        Update: {
          checked_in?: boolean | null
          checked_in_at?: string | null
          eliminated?: boolean | null
          entry_paid?: boolean | null
          entry_transaction_id?: string | null
          final_placement?: number | null
          id?: string
          player_id?: string
          registered_at?: string | null
          seed?: number | null
          team_id?: string | null
          tournament_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "arcade_tournament_registrations_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "user_usage_summary"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "arcade_tournament_registrations_tournament_id_fkey"
            columns: ["tournament_id"]
            isOneToOne: false
            referencedRelation: "arcade_tournaments"
            referencedColumns: ["id"]
          },
        ]
      }
      arcade_tournaments: {
        Row: {
          banner_url: string | null
          best_of: number | null
          bracket: Json | null
          completed_at: string | null
          config: Json
          created_at: string | null
          current_round: number | null
          description: string | null
          entry_fee: number | null
          format: string
          game_id: string
          id: string
          max_participants: number
          name: string
          organizer_id: string
          participants: Json | null
          prize_pool: number | null
          registration_end: string
          registration_start: string
          rules: string | null
          start_time: string
          started_at: string | null
          status: string
          team_size: number | null
        }
        Insert: {
          banner_url?: string | null
          best_of?: number | null
          bracket?: Json | null
          completed_at?: string | null
          config?: Json
          created_at?: string | null
          current_round?: number | null
          description?: string | null
          entry_fee?: number | null
          format: string
          game_id: string
          id?: string
          max_participants?: number
          name: string
          organizer_id: string
          participants?: Json | null
          prize_pool?: number | null
          registration_end: string
          registration_start: string
          rules?: string | null
          start_time: string
          started_at?: string | null
          status?: string
          team_size?: number | null
        }
        Update: {
          banner_url?: string | null
          best_of?: number | null
          bracket?: Json | null
          completed_at?: string | null
          config?: Json
          created_at?: string | null
          current_round?: number | null
          description?: string | null
          entry_fee?: number | null
          format?: string
          game_id?: string
          id?: string
          max_participants?: number
          name?: string
          organizer_id?: string
          participants?: Json | null
          prize_pool?: number | null
          registration_end?: string
          registration_start?: string
          rules?: string | null
          start_time?: string
          started_at?: string | null
          status?: string
          team_size?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "arcade_tournaments_organizer_id_fkey"
            columns: ["organizer_id"]
            isOneToOne: false
            referencedRelation: "user_usage_summary"
            referencedColumns: ["user_id"]
          },
        ]
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
            referencedRelation: "chat_conversations"
            referencedColumns: ["id"]
          },
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
            referencedRelation: "chat_messages"
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
          audio_path: string | null
          created_at: string | null
          duration_seconds: number | null
          error: string | null
          generation_type: string
          id: string
          metadata: Json | null
          prompt: string
          provider_job_id: string | null
          public_url: string | null
          status: string
          style: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          audio_path?: string | null
          created_at?: string | null
          duration_seconds?: number | null
          error?: string | null
          generation_type?: string
          id?: string
          metadata?: Json | null
          prompt: string
          provider_job_id?: string | null
          public_url?: string | null
          status?: string
          style?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          audio_path?: string | null
          created_at?: string | null
          duration_seconds?: number | null
          error?: string | null
          generation_type?: string
          id?: string
          metadata?: Json | null
          prompt?: string
          provider_job_id?: string | null
          public_url?: string | null
          status?: string
          style?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "audio_generations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_usage_summary"
            referencedColumns: ["user_id"]
          },
        ]
      }
      audio_projects: {
        Row: {
          assets: Json | null
          bpm: number | null
          created_at: string | null
          description: string | null
          duration_seconds: number | null
          export_format: string | null
          export_path: string | null
          export_quality: string | null
          id: string
          is_public: boolean | null
          key: string | null
          metadata: Json | null
          name: string
          project_type: string
          status: string | null
          time_signature: string | null
          tracks: Json | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          assets?: Json | null
          bpm?: number | null
          created_at?: string | null
          description?: string | null
          duration_seconds?: number | null
          export_format?: string | null
          export_path?: string | null
          export_quality?: string | null
          id?: string
          is_public?: boolean | null
          key?: string | null
          metadata?: Json | null
          name: string
          project_type: string
          status?: string | null
          time_signature?: string | null
          tracks?: Json | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          assets?: Json | null
          bpm?: number | null
          created_at?: string | null
          description?: string | null
          duration_seconds?: number | null
          export_format?: string | null
          export_path?: string | null
          export_quality?: string | null
          id?: string
          is_public?: boolean | null
          key?: string | null
          metadata?: Json | null
          name?: string
          project_type?: string
          status?: string | null
          time_signature?: string | null
          tracks?: Json | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "audio_projects_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_usage_summary"
            referencedColumns: ["user_id"]
          },
        ]
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
        Relationships: [
          {
            foreignKeyName: "audit_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_usage_summary"
            referencedColumns: ["user_id"]
          },
        ]
      }
      brain_routing_analytics: {
        Row: {
          created_at: string | null
          error_type: string | null
          fallback_used: boolean | null
          final_model: string | null
          id: string
          latency_ms: number | null
          model_slot: string
          models_tried: string[] | null
          prompt_length: number | null
          response_length: number | null
          success: boolean | null
          task_type: string
          tokens_input: number | null
          tokens_output: number | null
        }
        Insert: {
          created_at?: string | null
          error_type?: string | null
          fallback_used?: boolean | null
          final_model?: string | null
          id?: string
          latency_ms?: number | null
          model_slot: string
          models_tried?: string[] | null
          prompt_length?: number | null
          response_length?: number | null
          success?: boolean | null
          task_type: string
          tokens_input?: number | null
          tokens_output?: number | null
        }
        Update: {
          created_at?: string | null
          error_type?: string | null
          fallback_used?: boolean | null
          final_model?: string | null
          id?: string
          latency_ms?: number | null
          model_slot?: string
          models_tried?: string[] | null
          prompt_length?: number | null
          response_length?: number | null
          success?: boolean | null
          task_type?: string
          tokens_input?: number | null
          tokens_output?: number | null
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
        Relationships: [
          {
            foreignKeyName: "chat_rooms_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_usage_summary"
            referencedColumns: ["user_id"]
          },
        ]
      }
      chat_sessions: {
        Row: {
          avg_latency_ms: number | null
          brain_mode: string | null
          conversation_id: string | null
          created_at: string | null
          ended_at: string | null
          id: string
          is_active: boolean | null
          memory_loaded: boolean | null
          messages_count: number | null
          model_slot_used: string | null
          response_quality_score: number | null
          started_at: string | null
          tools_used: string[] | null
          total_tokens_used: number | null
          updated_at: string | null
          user_id: string
          user_satisfaction: number | null
        }
        Insert: {
          avg_latency_ms?: number | null
          brain_mode?: string | null
          conversation_id?: string | null
          created_at?: string | null
          ended_at?: string | null
          id?: string
          is_active?: boolean | null
          memory_loaded?: boolean | null
          messages_count?: number | null
          model_slot_used?: string | null
          response_quality_score?: number | null
          started_at?: string | null
          tools_used?: string[] | null
          total_tokens_used?: number | null
          updated_at?: string | null
          user_id: string
          user_satisfaction?: number | null
        }
        Update: {
          avg_latency_ms?: number | null
          brain_mode?: string | null
          conversation_id?: string | null
          created_at?: string | null
          ended_at?: string | null
          id?: string
          is_active?: boolean | null
          memory_loaded?: boolean | null
          messages_count?: number | null
          model_slot_used?: string | null
          response_quality_score?: number | null
          started_at?: string | null
          tools_used?: string[] | null
          total_tokens_used?: number | null
          updated_at?: string | null
          user_id?: string
          user_satisfaction?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "chat_sessions_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "chat_conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_sessions_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_usage_summary"
            referencedColumns: ["user_id"]
          },
        ]
      }
      conversation_context: {
        Row: {
          context_summary: string | null
          conversation_id: string
          created_at: string
          id: string
          key_topics: string[] | null
          message_count: number | null
          mood: string | null
          persona: string | null
          updated_at: string
          user_preferences: Json | null
        }
        Insert: {
          context_summary?: string | null
          conversation_id: string
          created_at?: string
          id?: string
          key_topics?: string[] | null
          message_count?: number | null
          mood?: string | null
          persona?: string | null
          updated_at?: string
          user_preferences?: Json | null
        }
        Update: {
          context_summary?: string | null
          conversation_id?: string
          created_at?: string
          id?: string
          key_topics?: string[] | null
          message_count?: number | null
          mood?: string | null
          persona?: string | null
          updated_at?: string
          user_preferences?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "conversation_context_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "chat_conversations"
            referencedColumns: ["id"]
          },
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
          {
            foreignKeyName: "conversations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_usage_summary"
            referencedColumns: ["user_id"]
          },
        ]
      }
      creator_profiles: {
        Row: {
          accepts_tips: boolean | null
          avatar_url: string | null
          banner_url: string | null
          bio: string | null
          created_at: string | null
          display_name: string
          id: string
          is_verified: boolean | null
          payout_method_id: string | null
          pending_balance: number | null
          tip_minimum: number | null
          total_followers: number | null
          total_plays: number | null
          total_subscribers: number | null
          total_tips_received: number | null
          updated_at: string | null
          user_id: string
          verified_at: string | null
        }
        Insert: {
          accepts_tips?: boolean | null
          avatar_url?: string | null
          banner_url?: string | null
          bio?: string | null
          created_at?: string | null
          display_name: string
          id?: string
          is_verified?: boolean | null
          payout_method_id?: string | null
          pending_balance?: number | null
          tip_minimum?: number | null
          total_followers?: number | null
          total_plays?: number | null
          total_subscribers?: number | null
          total_tips_received?: number | null
          updated_at?: string | null
          user_id: string
          verified_at?: string | null
        }
        Update: {
          accepts_tips?: boolean | null
          avatar_url?: string | null
          banner_url?: string | null
          bio?: string | null
          created_at?: string | null
          display_name?: string
          id?: string
          is_verified?: boolean | null
          payout_method_id?: string | null
          pending_balance?: number | null
          tip_minimum?: number | null
          total_followers?: number | null
          total_plays?: number | null
          total_subscribers?: number | null
          total_tips_received?: number | null
          updated_at?: string | null
          user_id?: string
          verified_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "creator_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "user_usage_summary"
            referencedColumns: ["user_id"]
          },
        ]
      }
      creator_subscriptions: {
        Row: {
          canceled_at: string | null
          created_at: string | null
          creator_id: string
          currency: string | null
          id: string
          price: number
          renews_at: string | null
          started_at: string | null
          status: string | null
          stripe_subscription_id: string | null
          subscriber_id: string
          tier: string
          updated_at: string | null
        }
        Insert: {
          canceled_at?: string | null
          created_at?: string | null
          creator_id: string
          currency?: string | null
          id?: string
          price: number
          renews_at?: string | null
          started_at?: string | null
          status?: string | null
          stripe_subscription_id?: string | null
          subscriber_id: string
          tier: string
          updated_at?: string | null
        }
        Update: {
          canceled_at?: string | null
          created_at?: string | null
          creator_id?: string
          currency?: string | null
          id?: string
          price?: number
          renews_at?: string | null
          started_at?: string | null
          status?: string | null
          stripe_subscription_id?: string | null
          subscriber_id?: string
          tier?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "creator_subscriptions_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "creator_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "creator_subscriptions_subscriber_id_fkey"
            columns: ["subscriber_id"]
            isOneToOne: false
            referencedRelation: "user_usage_summary"
            referencedColumns: ["user_id"]
          },
        ]
      }
      creator_tips: {
        Row: {
          amount: number
          created_at: string | null
          creator_received: number
          currency: string | null
          from_user_id: string
          id: string
          media_node_id: string | null
          message: string | null
          platform_fee: number
          room_id: string | null
          status: string | null
          to_creator_id: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          creator_received: number
          currency?: string | null
          from_user_id: string
          id?: string
          media_node_id?: string | null
          message?: string | null
          platform_fee: number
          room_id?: string | null
          status?: string | null
          to_creator_id: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          creator_received?: number
          currency?: string | null
          from_user_id?: string
          id?: string
          media_node_id?: string | null
          message?: string | null
          platform_fee?: number
          room_id?: string | null
          status?: string | null
          to_creator_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "creator_tips_from_user_id_fkey"
            columns: ["from_user_id"]
            isOneToOne: false
            referencedRelation: "user_usage_summary"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "creator_tips_to_creator_id_fkey"
            columns: ["to_creator_id"]
            isOneToOne: false
            referencedRelation: "creator_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      creator_uploads: {
        Row: {
          artwork_url: string | null
          audio_url: string
          created_at: string | null
          creator_id: string
          description: string | null
          duration_seconds: number | null
          genre: string | null
          id: string
          is_featured: boolean | null
          is_public: boolean | null
          like_count: number | null
          play_count: number | null
          share_count: number | null
          tags: string[] | null
          title: string
          type: string
          updated_at: string | null
          waveform_data: Json | null
        }
        Insert: {
          artwork_url?: string | null
          audio_url: string
          created_at?: string | null
          creator_id: string
          description?: string | null
          duration_seconds?: number | null
          genre?: string | null
          id?: string
          is_featured?: boolean | null
          is_public?: boolean | null
          like_count?: number | null
          play_count?: number | null
          share_count?: number | null
          tags?: string[] | null
          title: string
          type: string
          updated_at?: string | null
          waveform_data?: Json | null
        }
        Update: {
          artwork_url?: string | null
          audio_url?: string
          created_at?: string | null
          creator_id?: string
          description?: string | null
          duration_seconds?: number | null
          genre?: string | null
          id?: string
          is_featured?: boolean | null
          is_public?: boolean | null
          like_count?: number | null
          play_count?: number | null
          share_count?: number | null
          tags?: string[] | null
          title?: string
          type?: string
          updated_at?: string | null
          waveform_data?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "creator_uploads_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "creator_profiles"
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
        Relationships: [
          {
            foreignKeyName: "custom_backgrounds_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_usage_summary"
            referencedColumns: ["user_id"]
          },
        ]
      }
      devstudio_files: {
        Row: {
          content: string | null
          content_binary: string | null
          created_at: string | null
          file_type: string
          id: string
          is_generated: boolean | null
          mime_type: string | null
          name: string
          path: string
          project_id: string
          size_bytes: number | null
          updated_at: string | null
        }
        Insert: {
          content?: string | null
          content_binary?: string | null
          created_at?: string | null
          file_type?: string
          id?: string
          is_generated?: boolean | null
          mime_type?: string | null
          name: string
          path: string
          project_id: string
          size_bytes?: number | null
          updated_at?: string | null
        }
        Update: {
          content?: string | null
          content_binary?: string | null
          created_at?: string | null
          file_type?: string
          id?: string
          is_generated?: boolean | null
          mime_type?: string | null
          name?: string
          path?: string
          project_id?: string
          size_bytes?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "devstudio_files_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "devstudio_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      devstudio_projects: {
        Row: {
          build_config: Json | null
          created_at: string | null
          custom_domain: string | null
          deployed_url: string | null
          description: string | null
          forks_count: number | null
          framework: string | null
          id: string
          is_public: boolean | null
          name: string
          project_type: string
          slug: string
          status: string
          tags: string[] | null
          template_id: string | null
          thumbnail_url: string | null
          updated_at: string | null
          user_id: string
          views_count: number | null
        }
        Insert: {
          build_config?: Json | null
          created_at?: string | null
          custom_domain?: string | null
          deployed_url?: string | null
          description?: string | null
          forks_count?: number | null
          framework?: string | null
          id?: string
          is_public?: boolean | null
          name: string
          project_type?: string
          slug: string
          status?: string
          tags?: string[] | null
          template_id?: string | null
          thumbnail_url?: string | null
          updated_at?: string | null
          user_id: string
          views_count?: number | null
        }
        Update: {
          build_config?: Json | null
          created_at?: string | null
          custom_domain?: string | null
          deployed_url?: string | null
          description?: string | null
          forks_count?: number | null
          framework?: string | null
          id?: string
          is_public?: boolean | null
          name?: string
          project_type?: string
          slug?: string
          status?: string
          tags?: string[] | null
          template_id?: string | null
          thumbnail_url?: string | null
          updated_at?: string | null
          user_id?: string
          views_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "devstudio_projects_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_usage_summary"
            referencedColumns: ["user_id"]
          },
        ]
      }
      devstudio_versions: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string | null
          files_snapshot: Json | null
          id: string
          project_id: string
          version_name: string | null
          version_number: number
          version_type: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          files_snapshot?: Json | null
          id?: string
          project_id: string
          version_name?: string | null
          version_number: number
          version_type?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          files_snapshot?: Json | null
          id?: string
          project_id?: string
          version_name?: string | null
          version_number?: number
          version_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "devstudio_versions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_usage_summary"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "devstudio_versions_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "devstudio_projects"
            referencedColumns: ["id"]
          },
        ]
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
        Relationships: [
          {
            foreignKeyName: "folders_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_usage_summary"
            referencedColumns: ["user_id"]
          },
        ]
      }
      game_modes: {
        Row: {
          created_at: string | null
          description: string | null
          friendly_fire: boolean | null
          game_id: string
          id: string
          is_casual: boolean | null
          is_custom: boolean | null
          is_enabled: boolean | null
          is_ranked: boolean | null
          is_tournament: boolean | null
          max_players: number | null
          min_players: number | null
          mode_name: string
          players_per_team: number | null
          respawn_enabled: boolean | null
          respawn_time_seconds: number | null
          round_count: number | null
          score_limit: number | null
          settings: Json | null
          slug: string
          team_count: number | null
          time_limit_seconds: number | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          friendly_fire?: boolean | null
          game_id: string
          id?: string
          is_casual?: boolean | null
          is_custom?: boolean | null
          is_enabled?: boolean | null
          is_ranked?: boolean | null
          is_tournament?: boolean | null
          max_players?: number | null
          min_players?: number | null
          mode_name: string
          players_per_team?: number | null
          respawn_enabled?: boolean | null
          respawn_time_seconds?: number | null
          round_count?: number | null
          score_limit?: number | null
          settings?: Json | null
          slug: string
          team_count?: number | null
          time_limit_seconds?: number | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          friendly_fire?: boolean | null
          game_id?: string
          id?: string
          is_casual?: boolean | null
          is_custom?: boolean | null
          is_enabled?: boolean | null
          is_ranked?: boolean | null
          is_tournament?: boolean | null
          max_players?: number | null
          min_players?: number | null
          mode_name?: string
          players_per_team?: number | null
          respawn_enabled?: boolean | null
          respawn_time_seconds?: number | null
          round_count?: number | null
          score_limit?: number | null
          settings?: Json | null
          slug?: string
          team_count?: number | null
          time_limit_seconds?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "game_modes_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "games"
            referencedColumns: ["id"]
          },
        ]
      }
      game_studio_ai_configs: {
        Row: {
          config: Json
          created_at: string | null
          id: string
          name: string
          project_id: string
          updated_at: string | null
        }
        Insert: {
          config?: Json
          created_at?: string | null
          id?: string
          name: string
          project_id: string
          updated_at?: string | null
        }
        Update: {
          config?: Json
          created_at?: string | null
          id?: string
          name?: string
          project_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "game_studio_ai_configs_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "game_studio_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      game_studio_assets: {
        Row: {
          created_at: string | null
          id: string
          is_processed: boolean | null
          metadata: Json | null
          name: string
          path: string
          processing_error: string | null
          processing_status: string | null
          project_id: string
          size_bytes: number
          type: string
          updated_at: string | null
          url: string
          variants: Json | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_processed?: boolean | null
          metadata?: Json | null
          name: string
          path: string
          processing_error?: string | null
          processing_status?: string | null
          project_id: string
          size_bytes: number
          type: string
          updated_at?: string | null
          url: string
          variants?: Json | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_processed?: boolean | null
          metadata?: Json | null
          name?: string
          path?: string
          processing_error?: string | null
          processing_status?: string | null
          project_id?: string
          size_bytes?: number
          type?: string
          updated_at?: string | null
          url?: string
          variants?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "game_studio_assets_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "game_studio_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      game_studio_projects: {
        Row: {
          arcade_listing_id: string | null
          average_rating: number | null
          config: Json
          created_at: string | null
          creator_id: string
          description: string | null
          id: string
          is_published: boolean | null
          main_scene: string | null
          name: string
          play_count: number | null
          published_at: string | null
          published_version: string | null
          rating_count: number | null
          settings: Json
          status: string | null
          template: string
          total_revenue: number | null
          updated_at: string | null
          version: string | null
        }
        Insert: {
          arcade_listing_id?: string | null
          average_rating?: number | null
          config?: Json
          created_at?: string | null
          creator_id: string
          description?: string | null
          id?: string
          is_published?: boolean | null
          main_scene?: string | null
          name: string
          play_count?: number | null
          published_at?: string | null
          published_version?: string | null
          rating_count?: number | null
          settings?: Json
          status?: string | null
          template: string
          total_revenue?: number | null
          updated_at?: string | null
          version?: string | null
        }
        Update: {
          arcade_listing_id?: string | null
          average_rating?: number | null
          config?: Json
          created_at?: string | null
          creator_id?: string
          description?: string | null
          id?: string
          is_published?: boolean | null
          main_scene?: string | null
          name?: string
          play_count?: number | null
          published_at?: string | null
          published_version?: string | null
          rating_count?: number | null
          settings?: Json
          status?: string | null
          template?: string
          total_revenue?: number | null
          updated_at?: string | null
          version?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "game_studio_projects_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "user_usage_summary"
            referencedColumns: ["user_id"]
          },
        ]
      }
      game_studio_scenes: {
        Row: {
          created_at: string | null
          description: string | null
          environment: Json | null
          id: string
          lighting: Json | null
          name: string
          physics: Json | null
          project_id: string
          root_objects: Json | null
          scripts: string[] | null
          spawn_points: Json | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          environment?: Json | null
          id?: string
          lighting?: Json | null
          name: string
          physics?: Json | null
          project_id: string
          root_objects?: Json | null
          scripts?: string[] | null
          spawn_points?: Json | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          environment?: Json | null
          id?: string
          lighting?: Json | null
          name?: string
          physics?: Json | null
          project_id?: string
          root_objects?: Json | null
          scripts?: string[] | null
          spawn_points?: Json | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "game_studio_scenes_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "game_studio_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      game_studio_scripts: {
        Row: {
          code: string
          compile_errors: Json | null
          compile_warnings: Json | null
          compiled_code: string | null
          created_at: string | null
          id: string
          is_compiled: boolean | null
          name: string
          project_id: string
          type: string
          updated_at: string | null
        }
        Insert: {
          code?: string
          compile_errors?: Json | null
          compile_warnings?: Json | null
          compiled_code?: string | null
          created_at?: string | null
          id?: string
          is_compiled?: boolean | null
          name: string
          project_id: string
          type: string
          updated_at?: string | null
        }
        Update: {
          code?: string
          compile_errors?: Json | null
          compile_warnings?: Json | null
          compiled_code?: string | null
          created_at?: string | null
          id?: string
          is_compiled?: boolean | null
          name?: string
          project_id?: string
          type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "game_studio_scripts_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "game_studio_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      games: {
        Row: {
          active_players: number | null
          average_rating: number | null
          banner_url: string | null
          created_at: string | null
          description: string | null
          engine: string | null
          genre: string
          icon_url: string | null
          id: string
          is_flagship: boolean | null
          max_players: number | null
          min_players: number | null
          peak_players: number | null
          rating_count: number | null
          released_at: string | null
          screenshots: string[] | null
          short_description: string | null
          slug: string
          status: string | null
          supports_ai: boolean | null
          supports_controller: boolean | null
          supports_crossplay: boolean | null
          supports_multiplayer: boolean | null
          supports_ranked: boolean | null
          supports_replay: boolean | null
          supports_spectator: boolean | null
          supports_touch: boolean | null
          team_sizes: number[] | null
          thumbnail_url: string | null
          title: string
          total_matches: number | null
          total_plays: number | null
          trailer_url: string | null
          updated_at: string | null
          version: string | null
        }
        Insert: {
          active_players?: number | null
          average_rating?: number | null
          banner_url?: string | null
          created_at?: string | null
          description?: string | null
          engine?: string | null
          genre: string
          icon_url?: string | null
          id?: string
          is_flagship?: boolean | null
          max_players?: number | null
          min_players?: number | null
          peak_players?: number | null
          rating_count?: number | null
          released_at?: string | null
          screenshots?: string[] | null
          short_description?: string | null
          slug: string
          status?: string | null
          supports_ai?: boolean | null
          supports_controller?: boolean | null
          supports_crossplay?: boolean | null
          supports_multiplayer?: boolean | null
          supports_ranked?: boolean | null
          supports_replay?: boolean | null
          supports_spectator?: boolean | null
          supports_touch?: boolean | null
          team_sizes?: number[] | null
          thumbnail_url?: string | null
          title: string
          total_matches?: number | null
          total_plays?: number | null
          trailer_url?: string | null
          updated_at?: string | null
          version?: string | null
        }
        Update: {
          active_players?: number | null
          average_rating?: number | null
          banner_url?: string | null
          created_at?: string | null
          description?: string | null
          engine?: string | null
          genre?: string
          icon_url?: string | null
          id?: string
          is_flagship?: boolean | null
          max_players?: number | null
          min_players?: number | null
          peak_players?: number | null
          rating_count?: number | null
          released_at?: string | null
          screenshots?: string[] | null
          short_description?: string | null
          slug?: string
          status?: string | null
          supports_ai?: boolean | null
          supports_controller?: boolean | null
          supports_crossplay?: boolean | null
          supports_multiplayer?: boolean | null
          supports_ranked?: boolean | null
          supports_replay?: boolean | null
          supports_spectator?: boolean | null
          supports_touch?: boolean | null
          team_sizes?: number[] | null
          thumbnail_url?: string | null
          title?: string
          total_matches?: number | null
          total_plays?: number | null
          trailer_url?: string | null
          updated_at?: string | null
          version?: string | null
        }
        Relationships: []
      }
      health_check: {
        Row: {
          checked_at: string | null
          id: string
          status: string | null
        }
        Insert: {
          checked_at?: string | null
          id?: string
          status?: string | null
        }
        Update: {
          checked_at?: string | null
          id?: string
          status?: string | null
        }
        Relationships: []
      }
      leaderboard_entries: {
        Row: {
          id: string
          leaderboard_id: string
          player_id: string
          previous_rank: number | null
          previous_score: number | null
          rank: number
          score: number
          stats: Json | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          leaderboard_id: string
          player_id: string
          previous_rank?: number | null
          previous_score?: number | null
          rank: number
          score: number
          stats?: Json | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          leaderboard_id?: string
          player_id?: string
          previous_rank?: number | null
          previous_score?: number | null
          rank?: number
          score?: number
          stats?: Json | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "leaderboard_entries_leaderboard_id_fkey"
            columns: ["leaderboard_id"]
            isOneToOne: false
            referencedRelation: "leaderboards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leaderboard_entries_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "user_usage_summary"
            referencedColumns: ["user_id"]
          },
        ]
      }
      leaderboards: {
        Row: {
          created_at: string | null
          game_slug: string
          id: string
          is_active: boolean | null
          leaderboard_type: string
          period_end: string | null
          period_start: string | null
          season_id: string | null
          stat_type: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          game_slug: string
          id?: string
          is_active?: boolean | null
          leaderboard_type: string
          period_end?: string | null
          period_start?: string | null
          season_id?: string | null
          stat_type: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          game_slug?: string
          id?: string
          is_active?: boolean | null
          leaderboard_type?: string
          period_end?: string | null
          period_start?: string | null
          season_id?: string | null
          stat_type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      legacy_import_log: {
        Row: {
          created_at: string | null
          entity_id: string | null
          entity_type: string
          error_message: string | null
          id: string
          import_status: string
          processed_at: string | null
          source: string
          source_data: Json | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          entity_id?: string | null
          entity_type: string
          error_message?: string | null
          id?: string
          import_status?: string
          processed_at?: string | null
          source: string
          source_data?: Json | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          entity_id?: string | null
          entity_type?: string
          error_message?: string | null
          id?: string
          import_status?: string
          processed_at?: string | null
          source?: string
          source_data?: Json | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "legacy_import_log_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_usage_summary"
            referencedColumns: ["user_id"]
          },
        ]
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
        Relationships: [
          {
            foreignKeyName: "listening_favorites_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_usage_summary"
            referencedColumns: ["user_id"]
          },
        ]
      }
      lounge_artifacts: {
        Row: {
          ai_generated: boolean | null
          ai_model: string | null
          artifact_type: string
          category: string | null
          content: string | null
          content_json: Json | null
          created_at: string | null
          id: string
          is_private: boolean | null
          is_starred: boolean | null
          metadata: Json | null
          session_id: string | null
          tags: string[] | null
          title: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          ai_generated?: boolean | null
          ai_model?: string | null
          artifact_type: string
          category?: string | null
          content?: string | null
          content_json?: Json | null
          created_at?: string | null
          id?: string
          is_private?: boolean | null
          is_starred?: boolean | null
          metadata?: Json | null
          session_id?: string | null
          tags?: string[] | null
          title?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          ai_generated?: boolean | null
          ai_model?: string | null
          artifact_type?: string
          category?: string | null
          content?: string | null
          content_json?: Json | null
          created_at?: string | null
          id?: string
          is_private?: boolean | null
          is_starred?: boolean | null
          metadata?: Json | null
          session_id?: string | null
          tags?: string[] | null
          title?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lounge_artifacts_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "lounge_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lounge_artifacts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_usage_summary"
            referencedColumns: ["user_id"]
          },
        ]
      }
      lounge_presence: {
        Row: {
          activity_type: string | null
          avatar_seed: string | null
          display_name: string | null
          id: string
          is_active: boolean | null
          last_seen: string | null
          lounge_type: string
          user_id: string
        }
        Insert: {
          activity_type?: string | null
          avatar_seed?: string | null
          display_name?: string | null
          id?: string
          is_active?: boolean | null
          last_seen?: string | null
          lounge_type: string
          user_id: string
        }
        Update: {
          activity_type?: string | null
          avatar_seed?: string | null
          display_name?: string | null
          id?: string
          is_active?: boolean | null
          last_seen?: string | null
          lounge_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lounge_presence_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_usage_summary"
            referencedColumns: ["user_id"]
          },
        ]
      }
      lounge_sessions: {
        Row: {
          ai_mode: string | null
          ai_model: string | null
          artifacts_count: number | null
          created_at: string | null
          duration_seconds: number | null
          ended_at: string | null
          id: string
          interactions_count: number | null
          lounge_type: string
          preferences: Json | null
          session_data: Json | null
          started_at: string | null
          status: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          ai_mode?: string | null
          ai_model?: string | null
          artifacts_count?: number | null
          created_at?: string | null
          duration_seconds?: number | null
          ended_at?: string | null
          id?: string
          interactions_count?: number | null
          lounge_type: string
          preferences?: Json | null
          session_data?: Json | null
          started_at?: string | null
          status?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          ai_mode?: string | null
          ai_model?: string | null
          artifacts_count?: number | null
          created_at?: string | null
          duration_seconds?: number | null
          ended_at?: string | null
          id?: string
          interactions_count?: number | null
          lounge_type?: string
          preferences?: Json | null
          session_data?: Json | null
          started_at?: string | null
          status?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lounge_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_usage_summary"
            referencedColumns: ["user_id"]
          },
        ]
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
      lucy_brain_events: {
        Row: {
          created_at: string | null
          event_type: string
          id: string
          payload: Json
          processed: boolean | null
          processed_at: string | null
          source: string
          target: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          event_type: string
          id?: string
          payload?: Json
          processed?: boolean | null
          processed_at?: string | null
          source: string
          target?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          event_type?: string
          id?: string
          payload?: Json
          processed?: boolean | null
          processed_at?: string | null
          source?: string
          target?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lucy_brain_events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_usage_summary"
            referencedColumns: ["user_id"]
          },
        ]
      }
      lucy_brain_memory: {
        Row: {
          access_count: number | null
          content: string
          created_at: string | null
          decay_factor: number | null
          expires_at: string | null
          id: string
          importance_score: number | null
          last_accessed: string | null
          memory_type: string
          source: string
          source_id: string | null
          summary: string | null
          user_id: string
        }
        Insert: {
          access_count?: number | null
          content: string
          created_at?: string | null
          decay_factor?: number | null
          expires_at?: string | null
          id?: string
          importance_score?: number | null
          last_accessed?: string | null
          memory_type?: string
          source?: string
          source_id?: string | null
          summary?: string | null
          user_id: string
        }
        Update: {
          access_count?: number | null
          content?: string
          created_at?: string | null
          decay_factor?: number | null
          expires_at?: string | null
          id?: string
          importance_score?: number | null
          last_accessed?: string | null
          memory_type?: string
          source?: string
          source_id?: string | null
          summary?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lucy_brain_memory_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_usage_summary"
            referencedColumns: ["user_id"]
          },
        ]
      }
      lucy_brain_preferences: {
        Row: {
          ambient_style: string | null
          audio_energy: string | null
          created_at: string | null
          creativity_level: number | null
          expertise_areas: string[] | null
          humor_level: string | null
          learning_style: string | null
          music_style: string[] | null
          preferred_genres: string[] | null
          risk_tolerance: string | null
          tempo_preference: string | null
          tone_preference: string | null
          topics_of_interest: string[] | null
          updated_at: string | null
          user_id: string
          verbosity: string | null
          visual_intensity: string | null
        }
        Insert: {
          ambient_style?: string | null
          audio_energy?: string | null
          created_at?: string | null
          creativity_level?: number | null
          expertise_areas?: string[] | null
          humor_level?: string | null
          learning_style?: string | null
          music_style?: string[] | null
          preferred_genres?: string[] | null
          risk_tolerance?: string | null
          tempo_preference?: string | null
          tone_preference?: string | null
          topics_of_interest?: string[] | null
          updated_at?: string | null
          user_id: string
          verbosity?: string | null
          visual_intensity?: string | null
        }
        Update: {
          ambient_style?: string | null
          audio_energy?: string | null
          created_at?: string | null
          creativity_level?: number | null
          expertise_areas?: string[] | null
          humor_level?: string | null
          learning_style?: string | null
          music_style?: string[] | null
          preferred_genres?: string[] | null
          risk_tolerance?: string | null
          tempo_preference?: string | null
          tone_preference?: string | null
          topics_of_interest?: string[] | null
          updated_at?: string | null
          user_id?: string
          verbosity?: string | null
          visual_intensity?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lucy_brain_preferences_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "user_usage_summary"
            referencedColumns: ["user_id"]
          },
        ]
      }
      lucy_brain_sessions: {
        Row: {
          active_context: string
          created_at: string | null
          current_intent: string | null
          current_topic: string | null
          device_type: string | null
          emotional_state: string | null
          id: string
          is_active: boolean | null
          last_active_at: string | null
          metadata: Json | null
          session_start: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          active_context?: string
          created_at?: string | null
          current_intent?: string | null
          current_topic?: string | null
          device_type?: string | null
          emotional_state?: string | null
          id?: string
          is_active?: boolean | null
          last_active_at?: string | null
          metadata?: Json | null
          session_start?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          active_context?: string
          created_at?: string | null
          current_intent?: string | null
          current_topic?: string | null
          device_type?: string | null
          emotional_state?: string | null
          id?: string
          is_active?: boolean | null
          last_active_at?: string | null
          metadata?: Json | null
          session_start?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lucy_brain_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_usage_summary"
            referencedColumns: ["user_id"]
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
      lucy_journeys: {
        Row: {
          best_time_of_day: string | null
          cover_image_url: string | null
          created_at: string | null
          created_by: string | null
          curator_id: string | null
          description: string | null
          estimated_duration_minutes: number | null
          gradient_colors: string[] | null
          id: string
          is_featured: boolean | null
          journey_type: Database["public"]["Enums"]["journey_type"]
          media_categories:
            | Database["public"]["Enums"]["media_category"][]
            | null
          moods: string[] | null
          popularity_score: number | null
          steps: Json
          title: string
          updated_at: string | null
        }
        Insert: {
          best_time_of_day?: string | null
          cover_image_url?: string | null
          created_at?: string | null
          created_by?: string | null
          curator_id?: string | null
          description?: string | null
          estimated_duration_minutes?: number | null
          gradient_colors?: string[] | null
          id?: string
          is_featured?: boolean | null
          journey_type: Database["public"]["Enums"]["journey_type"]
          media_categories?:
            | Database["public"]["Enums"]["media_category"][]
            | null
          moods?: string[] | null
          popularity_score?: number | null
          steps?: Json
          title: string
          updated_at?: string | null
        }
        Update: {
          best_time_of_day?: string | null
          cover_image_url?: string | null
          created_at?: string | null
          created_by?: string | null
          curator_id?: string | null
          description?: string | null
          estimated_duration_minutes?: number | null
          gradient_colors?: string[] | null
          id?: string
          is_featured?: boolean | null
          journey_type?: Database["public"]["Enums"]["journey_type"]
          media_categories?:
            | Database["public"]["Enums"]["media_category"][]
            | null
          moods?: string[] | null
          popularity_score?: number | null
          steps?: Json
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lucy_journeys_curator_id_fkey"
            columns: ["curator_id"]
            isOneToOne: false
            referencedRelation: "user_usage_summary"
            referencedColumns: ["user_id"]
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
      match_players: {
        Row: {
          ability_stats: Json | null
          accuracy: number | null
          ai_difficulty: string | null
          ai_opponent_id: string | null
          assists: number | null
          coins_earned: number | null
          damage_dealt: number | null
          damage_taken: number | null
          deaths: number | null
          headshots: number | null
          healing_done: number | null
          id: string
          is_ai: boolean | null
          joined_at: string | null
          kda_ratio: number | null
          kills: number | null
          left_at: string | null
          match_id: string
          mmr_change: number | null
          movement_stats: Json | null
          objectives_completed: number | null
          player_id: string | null
          result: string | null
          score: number | null
          slot: number | null
          team: number | null
          time_played_seconds: number | null
          weapon_stats: Json | null
          xp_earned: number | null
        }
        Insert: {
          ability_stats?: Json | null
          accuracy?: number | null
          ai_difficulty?: string | null
          ai_opponent_id?: string | null
          assists?: number | null
          coins_earned?: number | null
          damage_dealt?: number | null
          damage_taken?: number | null
          deaths?: number | null
          headshots?: number | null
          healing_done?: number | null
          id?: string
          is_ai?: boolean | null
          joined_at?: string | null
          kda_ratio?: number | null
          kills?: number | null
          left_at?: string | null
          match_id: string
          mmr_change?: number | null
          movement_stats?: Json | null
          objectives_completed?: number | null
          player_id?: string | null
          result?: string | null
          score?: number | null
          slot?: number | null
          team?: number | null
          time_played_seconds?: number | null
          weapon_stats?: Json | null
          xp_earned?: number | null
        }
        Update: {
          ability_stats?: Json | null
          accuracy?: number | null
          ai_difficulty?: string | null
          ai_opponent_id?: string | null
          assists?: number | null
          coins_earned?: number | null
          damage_dealt?: number | null
          damage_taken?: number | null
          deaths?: number | null
          headshots?: number | null
          healing_done?: number | null
          id?: string
          is_ai?: boolean | null
          joined_at?: string | null
          kda_ratio?: number | null
          kills?: number | null
          left_at?: string | null
          match_id?: string
          mmr_change?: number | null
          movement_stats?: Json | null
          objectives_completed?: number | null
          player_id?: string | null
          result?: string | null
          score?: number | null
          slot?: number | null
          team?: number | null
          time_played_seconds?: number | null
          weapon_stats?: Json | null
          xp_earned?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "match_players_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "arcade_matches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "match_players_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "user_usage_summary"
            referencedColumns: ["user_id"]
          },
        ]
      }
      media_availability: {
        Row: {
          availability_type: Database["public"]["Enums"]["availability_type"]
          available_from: string | null
          available_until: string | null
          created_at: string | null
          currency: string | null
          embed_url: string | null
          id: string
          is_verified: boolean | null
          last_verified_at: string | null
          media_node_id: string
          playback_url: string | null
          price_cents: number | null
          provider_content_id: string
          provider_id: string
          quality: string | null
          regions: string[] | null
          updated_at: string | null
        }
        Insert: {
          availability_type: Database["public"]["Enums"]["availability_type"]
          available_from?: string | null
          available_until?: string | null
          created_at?: string | null
          currency?: string | null
          embed_url?: string | null
          id?: string
          is_verified?: boolean | null
          last_verified_at?: string | null
          media_node_id: string
          playback_url?: string | null
          price_cents?: number | null
          provider_content_id: string
          provider_id: string
          quality?: string | null
          regions?: string[] | null
          updated_at?: string | null
        }
        Update: {
          availability_type?: Database["public"]["Enums"]["availability_type"]
          available_from?: string | null
          available_until?: string | null
          created_at?: string | null
          currency?: string | null
          embed_url?: string | null
          id?: string
          is_verified?: boolean | null
          last_verified_at?: string | null
          media_node_id?: string
          playback_url?: string | null
          price_cents?: number | null
          provider_content_id?: string
          provider_id?: string
          quality?: string | null
          regions?: string[] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "media_availability_media_node_id_fkey"
            columns: ["media_node_id"]
            isOneToOne: false
            referencedRelation: "media_nodes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "media_availability_media_node_id_fkey"
            columns: ["media_node_id"]
            isOneToOne: false
            referencedRelation: "trending_content"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "media_availability_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "media_providers"
            referencedColumns: ["id"]
          },
        ]
      }
      media_credits: {
        Row: {
          character_name: string | null
          created_at: string | null
          department: string | null
          id: string
          is_primary: boolean | null
          job: string | null
          media_node_id: string | null
          media_series_id: string | null
          order: number | null
          person_id: string
          role: Database["public"]["Enums"]["credit_role"]
        }
        Insert: {
          character_name?: string | null
          created_at?: string | null
          department?: string | null
          id?: string
          is_primary?: boolean | null
          job?: string | null
          media_node_id?: string | null
          media_series_id?: string | null
          order?: number | null
          person_id: string
          role: Database["public"]["Enums"]["credit_role"]
        }
        Update: {
          character_name?: string | null
          created_at?: string | null
          department?: string | null
          id?: string
          is_primary?: boolean | null
          job?: string | null
          media_node_id?: string | null
          media_series_id?: string | null
          order?: number | null
          person_id?: string
          role?: Database["public"]["Enums"]["credit_role"]
        }
        Relationships: [
          {
            foreignKeyName: "media_credits_media_node_id_fkey"
            columns: ["media_node_id"]
            isOneToOne: false
            referencedRelation: "media_nodes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "media_credits_media_node_id_fkey"
            columns: ["media_node_id"]
            isOneToOne: false
            referencedRelation: "trending_content"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "media_credits_media_series_id_fkey"
            columns: ["media_series_id"]
            isOneToOne: false
            referencedRelation: "media_series"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "media_credits_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "media_people"
            referencedColumns: ["id"]
          },
        ]
      }
      media_items: {
        Row: {
          backdrop_url: string | null
          created_at: string | null
          deep_link_url: string | null
          duration_minutes: number | null
          embed_url: string | null
          genres: string[] | null
          id: string
          poster_url: string | null
          provider: string
          rating: number | null
          synopsis: string | null
          tags: string[] | null
          title: string
          type: string
          updated_at: string | null
          year: number | null
        }
        Insert: {
          backdrop_url?: string | null
          created_at?: string | null
          deep_link_url?: string | null
          duration_minutes?: number | null
          embed_url?: string | null
          genres?: string[] | null
          id?: string
          poster_url?: string | null
          provider: string
          rating?: number | null
          synopsis?: string | null
          tags?: string[] | null
          title: string
          type?: string
          updated_at?: string | null
          year?: number | null
        }
        Update: {
          backdrop_url?: string | null
          created_at?: string | null
          deep_link_url?: string | null
          duration_minutes?: number | null
          embed_url?: string | null
          genres?: string[] | null
          id?: string
          poster_url?: string | null
          provider?: string
          rating?: number | null
          synopsis?: string | null
          tags?: string[] | null
          title?: string
          type?: string
          updated_at?: string | null
          year?: number | null
        }
        Relationships: []
      }
      media_node_tags: {
        Row: {
          created_at: string | null
          id: string
          media_node_id: string
          relevance: number | null
          tag_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          media_node_id: string
          relevance?: number | null
          tag_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          media_node_id?: string
          relevance?: number | null
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "media_node_tags_media_node_id_fkey"
            columns: ["media_node_id"]
            isOneToOne: false
            referencedRelation: "media_nodes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "media_node_tags_media_node_id_fkey"
            columns: ["media_node_id"]
            isOneToOne: false
            referencedRelation: "trending_content"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "media_node_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "media_tags"
            referencedColumns: ["id"]
          },
        ]
      }
      media_nodes: {
        Row: {
          apple_id: string | null
          average_rating: number | null
          backdrop_url: string | null
          canonical_id: string
          category: Database["public"]["Enums"]["media_category"]
          chapter_number: number | null
          content_rating: Database["public"]["Enums"]["content_rating"] | null
          created_at: string | null
          description: string | null
          disc_number: number | null
          duration_seconds: number | null
          embedding: string | null
          episode_number: number | null
          id: string
          imdb_id: string | null
          isbn: string | null
          isrc: string | null
          last_synced_at: string | null
          media_type: Database["public"]["Enums"]["media_type"]
          original_title: string | null
          parent_series_id: string | null
          popularity_score: number | null
          poster_url: string | null
          preview_url: string | null
          release_date: string | null
          release_year: number | null
          season_number: number | null
          spotify_id: string | null
          tagline: string | null
          thumbnail_url: string | null
          title: string
          tmdb_id: number | null
          track_number: number | null
          updated_at: string | null
          vote_count: number | null
          waveform_data: Json | null
          youtube_id: string | null
        }
        Insert: {
          apple_id?: string | null
          average_rating?: number | null
          backdrop_url?: string | null
          canonical_id: string
          category: Database["public"]["Enums"]["media_category"]
          chapter_number?: number | null
          content_rating?: Database["public"]["Enums"]["content_rating"] | null
          created_at?: string | null
          description?: string | null
          disc_number?: number | null
          duration_seconds?: number | null
          embedding?: string | null
          episode_number?: number | null
          id?: string
          imdb_id?: string | null
          isbn?: string | null
          isrc?: string | null
          last_synced_at?: string | null
          media_type: Database["public"]["Enums"]["media_type"]
          original_title?: string | null
          parent_series_id?: string | null
          popularity_score?: number | null
          poster_url?: string | null
          preview_url?: string | null
          release_date?: string | null
          release_year?: number | null
          season_number?: number | null
          spotify_id?: string | null
          tagline?: string | null
          thumbnail_url?: string | null
          title: string
          tmdb_id?: number | null
          track_number?: number | null
          updated_at?: string | null
          vote_count?: number | null
          waveform_data?: Json | null
          youtube_id?: string | null
        }
        Update: {
          apple_id?: string | null
          average_rating?: number | null
          backdrop_url?: string | null
          canonical_id?: string
          category?: Database["public"]["Enums"]["media_category"]
          chapter_number?: number | null
          content_rating?: Database["public"]["Enums"]["content_rating"] | null
          created_at?: string | null
          description?: string | null
          disc_number?: number | null
          duration_seconds?: number | null
          embedding?: string | null
          episode_number?: number | null
          id?: string
          imdb_id?: string | null
          isbn?: string | null
          isrc?: string | null
          last_synced_at?: string | null
          media_type?: Database["public"]["Enums"]["media_type"]
          original_title?: string | null
          parent_series_id?: string | null
          popularity_score?: number | null
          poster_url?: string | null
          preview_url?: string | null
          release_date?: string | null
          release_year?: number | null
          season_number?: number | null
          spotify_id?: string | null
          tagline?: string | null
          thumbnail_url?: string | null
          title?: string
          tmdb_id?: number | null
          track_number?: number | null
          updated_at?: string | null
          vote_count?: number | null
          waveform_data?: Json | null
          youtube_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "media_nodes_parent_series_id_fkey"
            columns: ["parent_series_id"]
            isOneToOne: false
            referencedRelation: "media_series"
            referencedColumns: ["id"]
          },
        ]
      }
      media_people: {
        Row: {
          also_known_as: string[] | null
          biography: string | null
          birth_date: string | null
          birth_place: string | null
          canonical_id: string
          created_at: string | null
          death_date: string | null
          embedding: string | null
          id: string
          imdb_id: string | null
          name: string
          popularity_score: number | null
          profile_image_url: string | null
          spotify_id: string | null
          tmdb_id: number | null
          updated_at: string | null
        }
        Insert: {
          also_known_as?: string[] | null
          biography?: string | null
          birth_date?: string | null
          birth_place?: string | null
          canonical_id: string
          created_at?: string | null
          death_date?: string | null
          embedding?: string | null
          id?: string
          imdb_id?: string | null
          name: string
          popularity_score?: number | null
          profile_image_url?: string | null
          spotify_id?: string | null
          tmdb_id?: number | null
          updated_at?: string | null
        }
        Update: {
          also_known_as?: string[] | null
          biography?: string | null
          birth_date?: string | null
          birth_place?: string | null
          canonical_id?: string
          created_at?: string | null
          death_date?: string | null
          embedding?: string | null
          id?: string
          imdb_id?: string | null
          name?: string
          popularity_score?: number | null
          profile_image_url?: string | null
          spotify_id?: string | null
          tmdb_id?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      media_providers: {
        Row: {
          api_base_url: string | null
          created_at: string | null
          deep_link_template: string | null
          id: string
          is_active: boolean | null
          logo_url: string | null
          name: string
          priority: number | null
          provider_type: Database["public"]["Enums"]["provider_type"]
          requires_auth: boolean | null
          supports_offline: boolean | null
          supports_playback: boolean | null
          updated_at: string | null
          website_url: string | null
        }
        Insert: {
          api_base_url?: string | null
          created_at?: string | null
          deep_link_template?: string | null
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          name: string
          priority?: number | null
          provider_type: Database["public"]["Enums"]["provider_type"]
          requires_auth?: boolean | null
          supports_offline?: boolean | null
          supports_playback?: boolean | null
          updated_at?: string | null
          website_url?: string | null
        }
        Update: {
          api_base_url?: string | null
          created_at?: string | null
          deep_link_template?: string | null
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          name?: string
          priority?: number | null
          provider_type?: Database["public"]["Enums"]["provider_type"]
          requires_auth?: boolean | null
          supports_offline?: boolean | null
          supports_playback?: boolean | null
          updated_at?: string | null
          website_url?: string | null
        }
        Relationships: []
      }
      media_relationships: {
        Row: {
          created_at: string | null
          id: string
          metadata: Json | null
          relationship_type: Database["public"]["Enums"]["relationship_type"]
          source_id: string
          source_type: string
          target_id: string
          target_type: string
          weight: number | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          metadata?: Json | null
          relationship_type: Database["public"]["Enums"]["relationship_type"]
          source_id: string
          source_type: string
          target_id: string
          target_type: string
          weight?: number | null
        }
        Update: {
          created_at?: string | null
          id?: string
          metadata?: Json | null
          relationship_type?: Database["public"]["Enums"]["relationship_type"]
          source_id?: string
          source_type?: string
          target_id?: string
          target_type?: string
          weight?: number | null
        }
        Relationships: []
      }
      media_series: {
        Row: {
          apple_id: string | null
          average_rating: number | null
          backdrop_url: string | null
          canonical_id: string
          category: Database["public"]["Enums"]["media_category"]
          content_rating: Database["public"]["Enums"]["content_rating"] | null
          created_at: string | null
          description: string | null
          embedding: string | null
          end_year: number | null
          id: string
          imdb_id: string | null
          last_synced_at: string | null
          media_type: Database["public"]["Enums"]["media_type"]
          original_title: string | null
          poster_url: string | null
          rss_feed_url: string | null
          spotify_id: string | null
          start_year: number | null
          status: string | null
          title: string
          tmdb_id: number | null
          total_chapters: number | null
          total_episodes: number | null
          total_seasons: number | null
          total_tracks: number | null
          updated_at: string | null
          vote_count: number | null
        }
        Insert: {
          apple_id?: string | null
          average_rating?: number | null
          backdrop_url?: string | null
          canonical_id: string
          category: Database["public"]["Enums"]["media_category"]
          content_rating?: Database["public"]["Enums"]["content_rating"] | null
          created_at?: string | null
          description?: string | null
          embedding?: string | null
          end_year?: number | null
          id?: string
          imdb_id?: string | null
          last_synced_at?: string | null
          media_type: Database["public"]["Enums"]["media_type"]
          original_title?: string | null
          poster_url?: string | null
          rss_feed_url?: string | null
          spotify_id?: string | null
          start_year?: number | null
          status?: string | null
          title: string
          tmdb_id?: number | null
          total_chapters?: number | null
          total_episodes?: number | null
          total_seasons?: number | null
          total_tracks?: number | null
          updated_at?: string | null
          vote_count?: number | null
        }
        Update: {
          apple_id?: string | null
          average_rating?: number | null
          backdrop_url?: string | null
          canonical_id?: string
          category?: Database["public"]["Enums"]["media_category"]
          content_rating?: Database["public"]["Enums"]["content_rating"] | null
          created_at?: string | null
          description?: string | null
          embedding?: string | null
          end_year?: number | null
          id?: string
          imdb_id?: string | null
          last_synced_at?: string | null
          media_type?: Database["public"]["Enums"]["media_type"]
          original_title?: string | null
          poster_url?: string | null
          rss_feed_url?: string | null
          spotify_id?: string | null
          start_year?: number | null
          status?: string | null
          title?: string
          tmdb_id?: number | null
          total_chapters?: number | null
          total_episodes?: number | null
          total_seasons?: number | null
          total_tracks?: number | null
          updated_at?: string | null
          vote_count?: number | null
        }
        Relationships: []
      }
      media_tags: {
        Row: {
          color: string | null
          created_at: string | null
          description: string | null
          icon: string | null
          id: string
          name: string
          parent_tag_id: string | null
          slug: string
          tag_type: Database["public"]["Enums"]["tag_type"]
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          name: string
          parent_tag_id?: string | null
          slug: string
          tag_type: Database["public"]["Enums"]["tag_type"]
        }
        Update: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          name?: string
          parent_tag_id?: string | null
          slug?: string
          tag_type?: Database["public"]["Enums"]["tag_type"]
        }
        Relationships: [
          {
            foreignKeyName: "media_tags_parent_tag_id_fkey"
            columns: ["parent_tag_id"]
            isOneToOne: false
            referencedRelation: "media_tags"
            referencedColumns: ["id"]
          },
        ]
      }
      memory_items: {
        Row: {
          access_count: number | null
          content: string
          created_at: string | null
          id: string
          importance: number | null
          last_accessed: string | null
          memory_type: string
          metadata: Json | null
          source: string | null
          user_id: string
        }
        Insert: {
          access_count?: number | null
          content: string
          created_at?: string | null
          id?: string
          importance?: number | null
          last_accessed?: string | null
          memory_type?: string
          metadata?: Json | null
          source?: string | null
          user_id: string
        }
        Update: {
          access_count?: number | null
          content?: string
          created_at?: string | null
          id?: string
          importance?: number | null
          last_accessed?: string | null
          memory_type?: string
          metadata?: Json | null
          source?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "memory_items_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_usage_summary"
            referencedColumns: ["user_id"]
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
            referencedRelation: "chat_messages"
            referencedColumns: ["id"]
          },
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
          brain_metadata: Json | null
          content: string
          conversation_id: string
          created_at: string
          id: string
          metadata: Json | null
          model_used: string | null
          response_latency_ms: number | null
          role: string
          search_vector: unknown
          tokens_used: number | null
        }
        Insert: {
          brain_metadata?: Json | null
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          metadata?: Json | null
          model_used?: string | null
          response_latency_ms?: number | null
          role: string
          search_vector?: unknown
          tokens_used?: number | null
        }
        Update: {
          brain_metadata?: Json | null
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          metadata?: Json | null
          model_used?: string | null
          response_latency_ms?: number | null
          role?: string
          search_vector?: unknown
          tokens_used?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "chat_conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      model_usage_logs: {
        Row: {
          confidence: number | null
          created_at: string | null
          downgrade_reason: string | null
          error_message: string | null
          estimated_cost: number | null
          id: string
          intent: string
          latency_ms: number | null
          model: string
          prompt_length: number | null
          quota_remaining: number | null
          response_length: number | null
          service: string
          session_id: string | null
          success: boolean | null
          tokens_used: number | null
          user_id: string | null
          user_tier: string | null
          was_downgraded: boolean | null
        }
        Insert: {
          confidence?: number | null
          created_at?: string | null
          downgrade_reason?: string | null
          error_message?: string | null
          estimated_cost?: number | null
          id?: string
          intent: string
          latency_ms?: number | null
          model: string
          prompt_length?: number | null
          quota_remaining?: number | null
          response_length?: number | null
          service: string
          session_id?: string | null
          success?: boolean | null
          tokens_used?: number | null
          user_id?: string | null
          user_tier?: string | null
          was_downgraded?: boolean | null
        }
        Update: {
          confidence?: number | null
          created_at?: string | null
          downgrade_reason?: string | null
          error_message?: string | null
          estimated_cost?: number | null
          id?: string
          intent?: string
          latency_ms?: number | null
          model?: string
          prompt_length?: number | null
          quota_remaining?: number | null
          response_length?: number | null
          service?: string
          session_id?: string | null
          success?: boolean | null
          tokens_used?: number | null
          user_id?: string | null
          user_tier?: string | null
          was_downgraded?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "model_usage_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_usage_summary"
            referencedColumns: ["user_id"]
          },
        ]
      }
      mood_discovery_config: {
        Row: {
          background_image_url: string | null
          created_at: string | null
          description: string | null
          display_name: string
          energy_range: Json | null
          genre_weights: Json | null
          gradient_colors: string[]
          icon: string | null
          id: string
          mood_slug: string
          tag_filters: string[] | null
          tempo_range: Json | null
          time_of_day_weights: Json | null
        }
        Insert: {
          background_image_url?: string | null
          created_at?: string | null
          description?: string | null
          display_name: string
          energy_range?: Json | null
          genre_weights?: Json | null
          gradient_colors: string[]
          icon?: string | null
          id?: string
          mood_slug: string
          tag_filters?: string[] | null
          tempo_range?: Json | null
          time_of_day_weights?: Json | null
        }
        Update: {
          background_image_url?: string | null
          created_at?: string | null
          description?: string | null
          display_name?: string
          energy_range?: Json | null
          genre_weights?: Json | null
          gradient_colors?: string[]
          icon?: string | null
          id?: string
          mood_slug?: string
          tag_filters?: string[] | null
          tempo_range?: Json | null
          time_of_day_weights?: Json | null
        }
        Relationships: []
      }
      organization_audit_log: {
        Row: {
          action: string
          actor_type: string
          actor_user_id: string | null
          created_at: string | null
          id: string
          ip_address: string | null
          metadata: Json | null
          new_value: Json | null
          old_value: Json | null
          org_id: string
          resource_id: string | null
          resource_type: string | null
          user_agent: string | null
        }
        Insert: {
          action: string
          actor_type?: string
          actor_user_id?: string | null
          created_at?: string | null
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          new_value?: Json | null
          old_value?: Json | null
          org_id: string
          resource_id?: string | null
          resource_type?: string | null
          user_agent?: string | null
        }
        Update: {
          action?: string
          actor_type?: string
          actor_user_id?: string | null
          created_at?: string | null
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          new_value?: Json | null
          old_value?: Json | null
          org_id?: string
          resource_id?: string | null
          resource_type?: string | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "organization_audit_log_actor_user_id_fkey"
            columns: ["actor_user_id"]
            isOneToOne: false
            referencedRelation: "user_usage_summary"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "organization_audit_log_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_branding: {
        Row: {
          border_radius: string | null
          brand_description: string | null
          brand_name: string | null
          brand_tagline: string | null
          color_accent: string | null
          color_background: string | null
          color_primary: string | null
          color_secondary: string | null
          color_text: string | null
          created_at: string | null
          custom_css: string | null
          favicon_url: string | null
          font_body: string | null
          font_heading: string | null
          glass_intensity: number | null
          gradient_intensity: number | null
          id: string
          logo_dark_url: string | null
          logo_url: string | null
          metadata: Json | null
          og_image_url: string | null
          org_id: string
          privacy_url: string | null
          seo_default_description: string | null
          seo_title_suffix: string | null
          support_email: string | null
          support_url: string | null
          terms_url: string | null
          twitter_handle: string | null
          updated_at: string | null
        }
        Insert: {
          border_radius?: string | null
          brand_description?: string | null
          brand_name?: string | null
          brand_tagline?: string | null
          color_accent?: string | null
          color_background?: string | null
          color_primary?: string | null
          color_secondary?: string | null
          color_text?: string | null
          created_at?: string | null
          custom_css?: string | null
          favicon_url?: string | null
          font_body?: string | null
          font_heading?: string | null
          glass_intensity?: number | null
          gradient_intensity?: number | null
          id?: string
          logo_dark_url?: string | null
          logo_url?: string | null
          metadata?: Json | null
          og_image_url?: string | null
          org_id: string
          privacy_url?: string | null
          seo_default_description?: string | null
          seo_title_suffix?: string | null
          support_email?: string | null
          support_url?: string | null
          terms_url?: string | null
          twitter_handle?: string | null
          updated_at?: string | null
        }
        Update: {
          border_radius?: string | null
          brand_description?: string | null
          brand_name?: string | null
          brand_tagline?: string | null
          color_accent?: string | null
          color_background?: string | null
          color_primary?: string | null
          color_secondary?: string | null
          color_text?: string | null
          created_at?: string | null
          custom_css?: string | null
          favicon_url?: string | null
          font_body?: string | null
          font_heading?: string | null
          glass_intensity?: number | null
          gradient_intensity?: number | null
          id?: string
          logo_dark_url?: string | null
          logo_url?: string | null
          metadata?: Json | null
          og_image_url?: string | null
          org_id?: string
          privacy_url?: string | null
          seo_default_description?: string | null
          seo_title_suffix?: string | null
          support_email?: string | null
          support_url?: string | null
          terms_url?: string | null
          twitter_handle?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "organization_branding_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: true
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_domains: {
        Row: {
          created_at: string | null
          domain: string
          id: string
          is_primary: boolean | null
          is_verified: boolean | null
          org_id: string
          ssl_expires_at: string | null
          ssl_status: string | null
          status: string
          updated_at: string | null
          verification_method: string | null
          verification_token: string | null
          verified_at: string | null
        }
        Insert: {
          created_at?: string | null
          domain: string
          id?: string
          is_primary?: boolean | null
          is_verified?: boolean | null
          org_id: string
          ssl_expires_at?: string | null
          ssl_status?: string | null
          status?: string
          updated_at?: string | null
          verification_method?: string | null
          verification_token?: string | null
          verified_at?: string | null
        }
        Update: {
          created_at?: string | null
          domain?: string
          id?: string
          is_primary?: boolean | null
          is_verified?: boolean | null
          org_id?: string
          ssl_expires_at?: string | null
          ssl_status?: string | null
          status?: string
          updated_at?: string | null
          verification_method?: string | null
          verification_token?: string | null
          verified_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "organization_domains_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_invitations: {
        Row: {
          accepted_at: string | null
          accepted_by: string | null
          created_at: string | null
          email: string
          expires_at: string | null
          id: string
          invited_by: string
          org_id: string
          role: string
          status: string
          token: string
        }
        Insert: {
          accepted_at?: string | null
          accepted_by?: string | null
          created_at?: string | null
          email: string
          expires_at?: string | null
          id?: string
          invited_by: string
          org_id: string
          role?: string
          status?: string
          token?: string
        }
        Update: {
          accepted_at?: string | null
          accepted_by?: string | null
          created_at?: string | null
          email?: string
          expires_at?: string | null
          id?: string
          invited_by?: string
          org_id?: string
          role?: string
          status?: string
          token?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_invitations_accepted_by_fkey"
            columns: ["accepted_by"]
            isOneToOne: false
            referencedRelation: "user_usage_summary"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "organization_invitations_invited_by_fkey"
            columns: ["invited_by"]
            isOneToOne: false
            referencedRelation: "user_usage_summary"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "organization_invitations_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_members: {
        Row: {
          created_at: string | null
          id: string
          invited_at: string | null
          invited_by: string | null
          joined_at: string | null
          metadata: Json | null
          org_id: string
          role: string
          status: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          invited_at?: string | null
          invited_by?: string | null
          joined_at?: string | null
          metadata?: Json | null
          org_id: string
          role?: string
          status?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          invited_at?: string | null
          invited_by?: string | null
          joined_at?: string | null
          metadata?: Json | null
          org_id?: string
          role?: string
          status?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_members_invited_by_fkey"
            columns: ["invited_by"]
            isOneToOne: false
            referencedRelation: "user_usage_summary"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "organization_members_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_usage_summary"
            referencedColumns: ["user_id"]
          },
        ]
      }
      organization_settings: {
        Row: {
          allow_public_profiles: boolean | null
          allow_public_rooms: boolean | null
          created_at: string | null
          default_density: string | null
          default_theme: string | null
          features_enabled: Json | null
          id: string
          locale: string | null
          max_ai_calls_per_day: number | null
          max_members: number | null
          max_storage_gb: number | null
          metadata: Json | null
          model_access: Json | null
          org_id: string
          require_2fa: boolean | null
          timezone: string | null
          tool_access: Json | null
          updated_at: string | null
        }
        Insert: {
          allow_public_profiles?: boolean | null
          allow_public_rooms?: boolean | null
          created_at?: string | null
          default_density?: string | null
          default_theme?: string | null
          features_enabled?: Json | null
          id?: string
          locale?: string | null
          max_ai_calls_per_day?: number | null
          max_members?: number | null
          max_storage_gb?: number | null
          metadata?: Json | null
          model_access?: Json | null
          org_id: string
          require_2fa?: boolean | null
          timezone?: string | null
          tool_access?: Json | null
          updated_at?: string | null
        }
        Update: {
          allow_public_profiles?: boolean | null
          allow_public_rooms?: boolean | null
          created_at?: string | null
          default_density?: string | null
          default_theme?: string | null
          features_enabled?: Json | null
          id?: string
          locale?: string | null
          max_ai_calls_per_day?: number | null
          max_members?: number | null
          max_storage_gb?: number | null
          metadata?: Json | null
          model_access?: Json | null
          org_id?: string
          require_2fa?: boolean | null
          timezone?: string | null
          tool_access?: Json | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "organization_settings_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: true
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_subscriptions: {
        Row: {
          billing_cycle: string | null
          canceled_at: string | null
          created_at: string | null
          current_period_end: string | null
          current_period_start: string | null
          id: string
          metadata: Json | null
          org_id: string
          plan_id: string
          price_per_seat: number | null
          seats_included: number | null
          seats_used: number | null
          started_at: string | null
          status: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          tier: string
          trial_end: string | null
          updated_at: string | null
        }
        Insert: {
          billing_cycle?: string | null
          canceled_at?: string | null
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          metadata?: Json | null
          org_id: string
          plan_id?: string
          price_per_seat?: number | null
          seats_included?: number | null
          seats_used?: number | null
          started_at?: string | null
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          tier?: string
          trial_end?: string | null
          updated_at?: string | null
        }
        Update: {
          billing_cycle?: string | null
          canceled_at?: string | null
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          metadata?: Json | null
          org_id?: string
          plan_id?: string
          price_per_seat?: number | null
          seats_included?: number | null
          seats_used?: number | null
          started_at?: string | null
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          tier?: string
          trial_end?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "organization_subscriptions_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_usage: {
        Row: {
          created_at: string | null
          estimated_cost: number | null
          id: string
          org_id: string
          total_ai_calls: number | null
          total_requests: number | null
          total_storage_bytes: number | null
          total_tool_uses: number | null
          updated_at: string | null
          usage_by_tool: Json | null
          usage_by_user: Json | null
          usage_date: string
        }
        Insert: {
          created_at?: string | null
          estimated_cost?: number | null
          id?: string
          org_id: string
          total_ai_calls?: number | null
          total_requests?: number | null
          total_storage_bytes?: number | null
          total_tool_uses?: number | null
          updated_at?: string | null
          usage_by_tool?: Json | null
          usage_by_user?: Json | null
          usage_date?: string
        }
        Update: {
          created_at?: string | null
          estimated_cost?: number | null
          id?: string
          org_id?: string
          total_ai_calls?: number | null
          total_requests?: number | null
          total_storage_bytes?: number | null
          total_tool_uses?: number | null
          updated_at?: string | null
          usage_by_tool?: Json | null
          usage_by_user?: Json | null
          usage_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_usage_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_platform_org: boolean | null
          is_verified: boolean | null
          metadata: Json | null
          name: string
          owner_user_id: string
          slug: string
          status: string
          type: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_platform_org?: boolean | null
          is_verified?: boolean | null
          metadata?: Json | null
          name: string
          owner_user_id: string
          slug: string
          status?: string
          type?: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_platform_org?: boolean | null
          is_verified?: boolean | null
          metadata?: Json | null
          name?: string
          owner_user_id?: string
          slug?: string
          status?: string
          type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "organizations_owner_user_id_fkey"
            columns: ["owner_user_id"]
            isOneToOne: false
            referencedRelation: "user_usage_summary"
            referencedColumns: ["user_id"]
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
      platform_admins: {
        Row: {
          created_at: string | null
          granted_at: string | null
          granted_by: string | null
          id: string
          is_active: boolean | null
          permissions: Json | null
          role: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          granted_at?: string | null
          granted_by?: string | null
          id?: string
          is_active?: boolean | null
          permissions?: Json | null
          role?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          granted_at?: string | null
          granted_by?: string | null
          id?: string
          is_active?: boolean | null
          permissions?: Json | null
          role?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "platform_admins_granted_by_fkey"
            columns: ["granted_by"]
            isOneToOne: false
            referencedRelation: "user_usage_summary"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "platform_admins_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "user_usage_summary"
            referencedColumns: ["user_id"]
          },
        ]
      }
      platform_telemetry: {
        Row: {
          created_at: string | null
          details: Json | null
          device_type: string | null
          duration_ms: number | null
          event_category: string
          event_name: string
          function_name: string | null
          id: string
          ip_hash: string | null
          message: string | null
          route_path: string | null
          session_id: string | null
          severity: string | null
          stack_trace: string | null
          status_code: number | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          details?: Json | null
          device_type?: string | null
          duration_ms?: number | null
          event_category: string
          event_name: string
          function_name?: string | null
          id?: string
          ip_hash?: string | null
          message?: string | null
          route_path?: string | null
          session_id?: string | null
          severity?: string | null
          stack_trace?: string | null
          status_code?: number | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          details?: Json | null
          device_type?: string | null
          duration_ms?: number | null
          event_category?: string
          event_name?: string
          function_name?: string | null
          id?: string
          ip_hash?: string | null
          message?: string | null
          route_path?: string | null
          session_id?: string | null
          severity?: string | null
          stack_trace?: string | null
          status_code?: number | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "platform_telemetry_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_usage_summary"
            referencedColumns: ["user_id"]
          },
        ]
      }
      player_achievements: {
        Row: {
          achievement_id: string
          completed_at: string | null
          id: string
          is_completed: boolean | null
          player_id: string
          progress: number | null
          started_at: string | null
        }
        Insert: {
          achievement_id: string
          completed_at?: string | null
          id?: string
          is_completed?: boolean | null
          player_id: string
          progress?: number | null
          started_at?: string | null
        }
        Update: {
          achievement_id?: string
          completed_at?: string | null
          id?: string
          is_completed?: boolean | null
          player_id?: string
          progress?: number | null
          started_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "player_achievements_achievement_id_fkey"
            columns: ["achievement_id"]
            isOneToOne: false
            referencedRelation: "achievements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "player_achievements_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "user_usage_summary"
            referencedColumns: ["user_id"]
          },
        ]
      }
      player_friends: {
        Row: {
          accepted_at: string | null
          favorite: boolean | null
          friend_id: string
          games_played_together: number | null
          id: string
          last_played_together: string | null
          nickname: string | null
          player_id: string
          requested_at: string | null
          status: string | null
        }
        Insert: {
          accepted_at?: string | null
          favorite?: boolean | null
          friend_id: string
          games_played_together?: number | null
          id?: string
          last_played_together?: string | null
          nickname?: string | null
          player_id: string
          requested_at?: string | null
          status?: string | null
        }
        Update: {
          accepted_at?: string | null
          favorite?: boolean | null
          friend_id?: string
          games_played_together?: number | null
          id?: string
          last_played_together?: string | null
          nickname?: string | null
          player_id?: string
          requested_at?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "player_friends_friend_id_fkey"
            columns: ["friend_id"]
            isOneToOne: false
            referencedRelation: "user_usage_summary"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "player_friends_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "user_usage_summary"
            referencedColumns: ["user_id"]
          },
        ]
      }
      player_parties: {
        Row: {
          created_at: string | null
          game_id: string | null
          game_mode_id: string | null
          id: string
          invite_code: string | null
          is_public: boolean | null
          leader_id: string
          match_id: string | null
          max_size: number | null
          members: string[] | null
          status: string | null
          updated_at: string | null
          voice_channel_id: string | null
        }
        Insert: {
          created_at?: string | null
          game_id?: string | null
          game_mode_id?: string | null
          id?: string
          invite_code?: string | null
          is_public?: boolean | null
          leader_id: string
          match_id?: string | null
          max_size?: number | null
          members?: string[] | null
          status?: string | null
          updated_at?: string | null
          voice_channel_id?: string | null
        }
        Update: {
          created_at?: string | null
          game_id?: string | null
          game_mode_id?: string | null
          id?: string
          invite_code?: string | null
          is_public?: boolean | null
          leader_id?: string
          match_id?: string | null
          max_size?: number | null
          members?: string[] | null
          status?: string | null
          updated_at?: string | null
          voice_channel_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "player_parties_leader_id_fkey"
            columns: ["leader_id"]
            isOneToOne: false
            referencedRelation: "user_usage_summary"
            referencedColumns: ["user_id"]
          },
        ]
      }
      player_progress: {
        Row: {
          achievement_points: number | null
          achievements: Json | null
          battle_pass_premium: boolean | null
          battle_pass_tier: number | null
          battle_pass_xp: number | null
          equipped_items: Json | null
          fastest_win_seconds: number | null
          first_played_at: string | null
          game_id: string | null
          game_slug: string
          highest_killstreak: number | null
          highest_score: number | null
          id: string
          last_played_at: string | null
          level: number | null
          longest_match_seconds: number | null
          player_id: string
          season_id: string | null
          season_level: number | null
          season_xp: number | null
          skill_points: number | null
          skill_tree: Json | null
          total_abandons: number | null
          total_assists: number | null
          total_damage_dealt: number | null
          total_deaths: number | null
          total_draws: number | null
          total_headshots: number | null
          total_kills: number | null
          total_losses: number | null
          total_matches: number | null
          total_playtime_seconds: number | null
          total_wins: number | null
          unlocked_items: Json | null
          updated_at: string | null
          xp: number | null
          xp_to_next_level: number | null
        }
        Insert: {
          achievement_points?: number | null
          achievements?: Json | null
          battle_pass_premium?: boolean | null
          battle_pass_tier?: number | null
          battle_pass_xp?: number | null
          equipped_items?: Json | null
          fastest_win_seconds?: number | null
          first_played_at?: string | null
          game_id?: string | null
          game_slug: string
          highest_killstreak?: number | null
          highest_score?: number | null
          id?: string
          last_played_at?: string | null
          level?: number | null
          longest_match_seconds?: number | null
          player_id: string
          season_id?: string | null
          season_level?: number | null
          season_xp?: number | null
          skill_points?: number | null
          skill_tree?: Json | null
          total_abandons?: number | null
          total_assists?: number | null
          total_damage_dealt?: number | null
          total_deaths?: number | null
          total_draws?: number | null
          total_headshots?: number | null
          total_kills?: number | null
          total_losses?: number | null
          total_matches?: number | null
          total_playtime_seconds?: number | null
          total_wins?: number | null
          unlocked_items?: Json | null
          updated_at?: string | null
          xp?: number | null
          xp_to_next_level?: number | null
        }
        Update: {
          achievement_points?: number | null
          achievements?: Json | null
          battle_pass_premium?: boolean | null
          battle_pass_tier?: number | null
          battle_pass_xp?: number | null
          equipped_items?: Json | null
          fastest_win_seconds?: number | null
          first_played_at?: string | null
          game_id?: string | null
          game_slug?: string
          highest_killstreak?: number | null
          highest_score?: number | null
          id?: string
          last_played_at?: string | null
          level?: number | null
          longest_match_seconds?: number | null
          player_id?: string
          season_id?: string | null
          season_level?: number | null
          season_xp?: number | null
          skill_points?: number | null
          skill_tree?: Json | null
          total_abandons?: number | null
          total_assists?: number | null
          total_damage_dealt?: number | null
          total_deaths?: number | null
          total_draws?: number | null
          total_headshots?: number | null
          total_kills?: number | null
          total_losses?: number | null
          total_matches?: number | null
          total_playtime_seconds?: number | null
          total_wins?: number | null
          unlocked_items?: Json | null
          updated_at?: string | null
          xp?: number | null
          xp_to_next_level?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "player_progress_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "games"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "player_progress_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "user_usage_summary"
            referencedColumns: ["user_id"]
          },
        ]
      }
      player_transactions: {
        Row: {
          amount: number
          balance_after: number
          balance_before: number
          created_at: string | null
          currency_type: string
          description: string | null
          id: string
          metadata: Json | null
          player_id: string
          reference_id: string | null
          reference_type: string | null
          transaction_type: string
        }
        Insert: {
          amount: number
          balance_after: number
          balance_before: number
          created_at?: string | null
          currency_type: string
          description?: string | null
          id?: string
          metadata?: Json | null
          player_id: string
          reference_id?: string | null
          reference_type?: string | null
          transaction_type: string
        }
        Update: {
          amount?: number
          balance_after?: number
          balance_before?: number
          created_at?: string | null
          currency_type?: string
          description?: string | null
          id?: string
          metadata?: Json | null
          player_id?: string
          reference_id?: string | null
          reference_type?: string | null
          transaction_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "player_transactions_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "user_usage_summary"
            referencedColumns: ["user_id"]
          },
        ]
      }
      players: {
        Row: {
          avatar_url: string | null
          banner_url: string | null
          bio: string | null
          coins: number | null
          created_at: string | null
          current_game_id: string | null
          current_match_id: string | null
          display_name: string | null
          follower_count: number | null
          following_count: number | null
          friend_count: number | null
          id: string
          is_creator: boolean | null
          is_pro: boolean | null
          is_verified: boolean | null
          last_online_at: string | null
          level: number | null
          mmr: number | null
          notification_settings: Json | null
          peak_mmr: number | null
          premium_currency: number | null
          prestige: number | null
          privacy_settings: Json | null
          rank: string | null
          status: string | null
          updated_at: string | null
          username: string
          xp: number | null
        }
        Insert: {
          avatar_url?: string | null
          banner_url?: string | null
          bio?: string | null
          coins?: number | null
          created_at?: string | null
          current_game_id?: string | null
          current_match_id?: string | null
          display_name?: string | null
          follower_count?: number | null
          following_count?: number | null
          friend_count?: number | null
          id: string
          is_creator?: boolean | null
          is_pro?: boolean | null
          is_verified?: boolean | null
          last_online_at?: string | null
          level?: number | null
          mmr?: number | null
          notification_settings?: Json | null
          peak_mmr?: number | null
          premium_currency?: number | null
          prestige?: number | null
          privacy_settings?: Json | null
          rank?: string | null
          status?: string | null
          updated_at?: string | null
          username: string
          xp?: number | null
        }
        Update: {
          avatar_url?: string | null
          banner_url?: string | null
          bio?: string | null
          coins?: number | null
          created_at?: string | null
          current_game_id?: string | null
          current_match_id?: string | null
          display_name?: string | null
          follower_count?: number | null
          following_count?: number | null
          friend_count?: number | null
          id?: string
          is_creator?: boolean | null
          is_pro?: boolean | null
          is_verified?: boolean | null
          last_online_at?: string | null
          level?: number | null
          mmr?: number | null
          notification_settings?: Json | null
          peak_mmr?: number | null
          premium_currency?: number | null
          prestige?: number | null
          privacy_settings?: Json | null
          rank?: string | null
          status?: string | null
          updated_at?: string | null
          username?: string
          xp?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "players_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "user_usage_summary"
            referencedColumns: ["user_id"]
          },
        ]
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
            referencedRelation: "chat_conversations"
            referencedColumns: ["id"]
          },
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
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "user_usage_summary"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "profiles_referred_by_fkey"
            columns: ["referred_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      project_domains: {
        Row: {
          created_at: string | null
          dns_records: Json | null
          domain: string
          id: string
          is_verified: boolean | null
          project_id: string
          ssl_expires_at: string | null
          ssl_status: string | null
          status: string | null
          subdomain: string | null
          updated_at: string | null
          verification_method: string | null
          verification_token: string | null
          verified_at: string | null
        }
        Insert: {
          created_at?: string | null
          dns_records?: Json | null
          domain: string
          id?: string
          is_verified?: boolean | null
          project_id: string
          ssl_expires_at?: string | null
          ssl_status?: string | null
          status?: string | null
          subdomain?: string | null
          updated_at?: string | null
          verification_method?: string | null
          verification_token?: string | null
          verified_at?: string | null
        }
        Update: {
          created_at?: string | null
          dns_records?: Json | null
          domain?: string
          id?: string
          is_verified?: boolean | null
          project_id?: string
          ssl_expires_at?: string | null
          ssl_status?: string | null
          status?: string | null
          subdomain?: string | null
          updated_at?: string | null
          verification_method?: string | null
          verification_token?: string | null
          verified_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_domains_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "devstudio_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      provider_sync_jobs: {
        Row: {
          completed_at: string | null
          created_at: string | null
          error_log: Json | null
          failed_items: number | null
          filters: Json | null
          id: string
          job_type: string
          processed_items: number | null
          provider_id: string
          started_at: string | null
          status: string | null
          total_items: number | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          error_log?: Json | null
          failed_items?: number | null
          filters?: Json | null
          id?: string
          job_type: string
          processed_items?: number | null
          provider_id: string
          started_at?: string | null
          status?: string | null
          total_items?: number | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          error_log?: Json | null
          failed_items?: number | null
          filters?: Json | null
          id?: string
          job_type?: string
          processed_items?: number | null
          provider_id?: string
          started_at?: string | null
          status?: string | null
          total_items?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "provider_sync_jobs_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "media_providers"
            referencedColumns: ["id"]
          },
        ]
      }
      recently_played: {
        Row: {
          artist: string | null
          content_id: string
          content_type: string
          duration_seconds: number | null
          genre: string | null
          id: string
          play_count: number | null
          played_at: string | null
          thumbnail_url: string | null
          title: string | null
          user_id: string
        }
        Insert: {
          artist?: string | null
          content_id: string
          content_type: string
          duration_seconds?: number | null
          genre?: string | null
          id?: string
          play_count?: number | null
          played_at?: string | null
          thumbnail_url?: string | null
          title?: string | null
          user_id: string
        }
        Update: {
          artist?: string | null
          content_id?: string
          content_type?: string
          duration_seconds?: number | null
          genre?: string | null
          id?: string
          play_count?: number | null
          played_at?: string | null
          thumbnail_url?: string | null
          title?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "recently_played_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_usage_summary"
            referencedColumns: ["user_id"]
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
        Relationships: [
          {
            foreignKeyName: "referrals_referred_user_id_fkey"
            columns: ["referred_user_id"]
            isOneToOne: false
            referencedRelation: "user_usage_summary"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "referrals_referrer_user_id_fkey"
            columns: ["referrer_user_id"]
            isOneToOne: false
            referencedRelation: "user_usage_summary"
            referencedColumns: ["user_id"]
          },
        ]
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
          {
            foreignKeyName: "room_messages_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_usage_summary"
            referencedColumns: ["user_id"]
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
          {
            foreignKeyName: "room_participants_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_usage_summary"
            referencedColumns: ["user_id"]
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
        Relationships: [
          {
            foreignKeyName: "scene_activity_log_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_usage_summary"
            referencedColumns: ["user_id"]
          },
        ]
      }
      scene_playlists: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_default: boolean | null
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
          is_default?: boolean | null
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
          is_default?: boolean | null
          mood?: string
          name?: string
          scenes?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "scene_playlists_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_usage_summary"
            referencedColumns: ["user_id"]
          },
        ]
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
          {
            foreignKeyName: "scene_preferences_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "user_usage_summary"
            referencedColumns: ["user_id"]
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
            referencedRelation: "chat_messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "search_results_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
        ]
      }
      seasons: {
        Row: {
          battle_pass_price: number | null
          battle_pass_tiers: number | null
          created_at: string | null
          description: string | null
          end_date: string
          id: string
          is_active: boolean | null
          name: string
          premium_rewards: Json | null
          start_date: string
          theme: string | null
          tier_rewards: Json | null
        }
        Insert: {
          battle_pass_price?: number | null
          battle_pass_tiers?: number | null
          created_at?: string | null
          description?: string | null
          end_date: string
          id: string
          is_active?: boolean | null
          name: string
          premium_rewards?: Json | null
          start_date: string
          theme?: string | null
          tier_rewards?: Json | null
        }
        Update: {
          battle_pass_price?: number | null
          battle_pass_tiers?: number | null
          created_at?: string | null
          description?: string | null
          end_date?: string
          id?: string
          is_active?: boolean | null
          name?: string
          premium_rewards?: Json | null
          start_date?: string
          theme?: string | null
          tier_rewards?: Json | null
        }
        Relationships: []
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
            referencedRelation: "chat_conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shared_conversations_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shared_conversations_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_usage_summary"
            referencedColumns: ["user_id"]
          },
        ]
      }
      spotify_connections: {
        Row: {
          access_token: string | null
          connected_at: string | null
          display_name: string | null
          email: string | null
          id: string
          is_active: boolean | null
          last_sync_at: string | null
          refresh_token: string | null
          scopes: string[] | null
          spotify_user_id: string | null
          token_expires_at: string | null
          user_id: string
        }
        Insert: {
          access_token?: string | null
          connected_at?: string | null
          display_name?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          last_sync_at?: string | null
          refresh_token?: string | null
          scopes?: string[] | null
          spotify_user_id?: string | null
          token_expires_at?: string | null
          user_id: string
        }
        Update: {
          access_token?: string | null
          connected_at?: string | null
          display_name?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          last_sync_at?: string | null
          refresh_token?: string | null
          scopes?: string[] | null
          spotify_user_id?: string | null
          token_expires_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "spotify_connections_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "user_usage_summary"
            referencedColumns: ["user_id"]
          },
        ]
      }
      subscription_history: {
        Row: {
          created_at: string | null
          event_type: string
          from_tier: string | null
          id: string
          metadata: Json | null
          mrr_change: number | null
          to_tier: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          event_type: string
          from_tier?: string | null
          id?: string
          metadata?: Json | null
          mrr_change?: number | null
          to_tier?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          event_type?: string
          from_tier?: string | null
          id?: string
          metadata?: Json | null
          mrr_change?: number | null
          to_tier?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscription_history_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_usage_summary"
            referencedColumns: ["user_id"]
          },
        ]
      }
      tier_quotas: {
        Row: {
          allowed_models: string[] | null
          cost_per_use: number | null
          created_at: string | null
          daily_limit: number | null
          id: string
          is_enabled: boolean | null
          max_output_length: number | null
          max_prompt_length: number | null
          monthly_limit: number | null
          priority_queue: boolean | null
          tier: string
          tool_id: string
          updated_at: string | null
        }
        Insert: {
          allowed_models?: string[] | null
          cost_per_use?: number | null
          created_at?: string | null
          daily_limit?: number | null
          id?: string
          is_enabled?: boolean | null
          max_output_length?: number | null
          max_prompt_length?: number | null
          monthly_limit?: number | null
          priority_queue?: boolean | null
          tier: string
          tool_id: string
          updated_at?: string | null
        }
        Update: {
          allowed_models?: string[] | null
          cost_per_use?: number | null
          created_at?: string | null
          daily_limit?: number | null
          id?: string
          is_enabled?: boolean | null
          max_output_length?: number | null
          max_prompt_length?: number | null
          monthly_limit?: number | null
          priority_queue?: boolean | null
          tier?: string
          tool_id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      tool_run_outputs: {
        Row: {
          content: string | null
          content_json: Json | null
          created_at: string | null
          file_size: number | null
          file_type: string | null
          file_url: string | null
          id: string
          output_type: string
          run_id: string
          sequence: number | null
        }
        Insert: {
          content?: string | null
          content_json?: Json | null
          created_at?: string | null
          file_size?: number | null
          file_type?: string | null
          file_url?: string | null
          id?: string
          output_type: string
          run_id: string
          sequence?: number | null
        }
        Update: {
          content?: string | null
          content_json?: Json | null
          created_at?: string | null
          file_size?: number | null
          file_type?: string | null
          file_url?: string | null
          id?: string
          output_type?: string
          run_id?: string
          sequence?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "tool_run_outputs_run_id_fkey"
            columns: ["run_id"]
            isOneToOne: false
            referencedRelation: "tool_runs"
            referencedColumns: ["id"]
          },
        ]
      }
      tool_runs: {
        Row: {
          completed_at: string | null
          created_at: string | null
          duration_ms: number | null
          error_code: string | null
          error_message: string | null
          estimated_cost: number | null
          id: string
          input_data: Json
          input_hash: string | null
          input_type: string
          metadata: Json | null
          started_at: string | null
          status: string
          tokens_used: number | null
          tool_id: string
          tool_version: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          duration_ms?: number | null
          error_code?: string | null
          error_message?: string | null
          estimated_cost?: number | null
          id?: string
          input_data: Json
          input_hash?: string | null
          input_type: string
          metadata?: Json | null
          started_at?: string | null
          status?: string
          tokens_used?: number | null
          tool_id: string
          tool_version?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          duration_ms?: number | null
          error_code?: string | null
          error_message?: string | null
          estimated_cost?: number | null
          id?: string
          input_data?: Json
          input_hash?: string | null
          input_type?: string
          metadata?: Json | null
          started_at?: string | null
          status?: string
          tokens_used?: number | null
          tool_id?: string
          tool_version?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tool_runs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_usage_summary"
            referencedColumns: ["user_id"]
          },
        ]
      }
      usage_events: {
        Row: {
          created_at: string
          created_date: string | null
          error_code: string | null
          error_message: string | null
          estimated_cost: number | null
          event_type: string
          id: string
          latency_ms: number | null
          metadata: Json | null
          model_used: string | null
          session_id: string | null
          source: string | null
          tokens_input: number | null
          tokens_output: number | null
          tool_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          created_date?: string | null
          error_code?: string | null
          error_message?: string | null
          estimated_cost?: number | null
          event_type: string
          id?: string
          latency_ms?: number | null
          metadata?: Json | null
          model_used?: string | null
          session_id?: string | null
          source?: string | null
          tokens_input?: number | null
          tokens_output?: number | null
          tool_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          created_date?: string | null
          error_code?: string | null
          error_message?: string | null
          estimated_cost?: number | null
          event_type?: string
          id?: string
          latency_ms?: number | null
          metadata?: Json | null
          model_used?: string | null
          session_id?: string | null
          source?: string | null
          tokens_input?: number | null
          tokens_output?: number | null
          tool_id?: string
          user_id?: string
        }
        Relationships: []
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
        Relationships: [
          {
            foreignKeyName: "usage_stats_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_usage_summary"
            referencedColumns: ["user_id"]
          },
        ]
      }
      user_ai_outputs: {
        Row: {
          created_at: string | null
          id: string
          is_favorite: boolean | null
          is_public: boolean | null
          metadata: Json | null
          model_used: string
          output_type: string
          prompt: string | null
          public_url: string | null
          storage_path: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_favorite?: boolean | null
          is_public?: boolean | null
          metadata?: Json | null
          model_used: string
          output_type: string
          prompt?: string | null
          public_url?: string | null
          storage_path?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_favorite?: boolean | null
          is_public?: boolean | null
          metadata?: Json | null
          model_used?: string
          output_type?: string
          prompt?: string | null
          public_url?: string | null
          storage_path?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_ai_outputs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_usage_summary"
            referencedColumns: ["user_id"]
          },
        ]
      }
      user_collection_items: {
        Row: {
          added_by: string | null
          collection_id: string
          created_at: string | null
          id: string
          media_node_id: string
          note: string | null
          position: number
        }
        Insert: {
          added_by?: string | null
          collection_id: string
          created_at?: string | null
          id?: string
          media_node_id: string
          note?: string | null
          position: number
        }
        Update: {
          added_by?: string | null
          collection_id?: string
          created_at?: string | null
          id?: string
          media_node_id?: string
          note?: string | null
          position?: number
        }
        Relationships: [
          {
            foreignKeyName: "user_collection_items_collection_id_fkey"
            columns: ["collection_id"]
            isOneToOne: false
            referencedRelation: "user_collections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_collection_items_collection_id_fkey"
            columns: ["collection_id"]
            isOneToOne: false
            referencedRelation: "user_library"
            referencedColumns: ["collection_id"]
          },
          {
            foreignKeyName: "user_collection_items_media_node_id_fkey"
            columns: ["media_node_id"]
            isOneToOne: false
            referencedRelation: "media_nodes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_collection_items_media_node_id_fkey"
            columns: ["media_node_id"]
            isOneToOne: false
            referencedRelation: "trending_content"
            referencedColumns: ["id"]
          },
        ]
      }
      user_collections: {
        Row: {
          collection_type: Database["public"]["Enums"]["collection_type"]
          cover_image_url: string | null
          created_at: string | null
          description: string | null
          id: string
          is_public: boolean | null
          is_smart: boolean | null
          item_count: number | null
          media_category: Database["public"]["Enums"]["media_category"] | null
          name: string
          smart_rules: Json | null
          total_duration_seconds: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          collection_type: Database["public"]["Enums"]["collection_type"]
          cover_image_url?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_public?: boolean | null
          is_smart?: boolean | null
          item_count?: number | null
          media_category?: Database["public"]["Enums"]["media_category"] | null
          name: string
          smart_rules?: Json | null
          total_duration_seconds?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          collection_type?: Database["public"]["Enums"]["collection_type"]
          cover_image_url?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_public?: boolean | null
          is_smart?: boolean | null
          item_count?: number | null
          media_category?: Database["public"]["Enums"]["media_category"] | null
          name?: string
          smart_rules?: Json | null
          total_duration_seconds?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_collections_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_usage_summary"
            referencedColumns: ["user_id"]
          },
        ]
      }
      user_daily_usage: {
        Row: {
          created_at: string | null
          failure_count: number | null
          first_request_at: string | null
          id: string
          last_request_at: string | null
          request_count: number | null
          success_count: number | null
          tool_id: string
          total_cost: number | null
          total_latency_ms: number | null
          total_tokens_input: number | null
          total_tokens_output: number | null
          updated_at: string | null
          usage_date: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          failure_count?: number | null
          first_request_at?: string | null
          id?: string
          last_request_at?: string | null
          request_count?: number | null
          success_count?: number | null
          tool_id: string
          total_cost?: number | null
          total_latency_ms?: number | null
          total_tokens_input?: number | null
          total_tokens_output?: number | null
          updated_at?: string | null
          usage_date?: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          failure_count?: number | null
          first_request_at?: string | null
          id?: string
          last_request_at?: string | null
          request_count?: number | null
          success_count?: number | null
          tool_id?: string
          total_cost?: number | null
          total_latency_ms?: number | null
          total_tokens_input?: number | null
          total_tokens_output?: number | null
          updated_at?: string | null
          usage_date?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_daily_usage_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_usage_summary"
            referencedColumns: ["user_id"]
          },
        ]
      }
      user_devices: {
        Row: {
          can_play: boolean | null
          created_at: string | null
          device_id: string
          device_name: string | null
          device_type: string | null
          id: string
          is_online: boolean | null
          last_seen_at: string | null
          metadata: Json | null
          supports_hq: boolean | null
          supports_lossless: boolean | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          can_play?: boolean | null
          created_at?: string | null
          device_id: string
          device_name?: string | null
          device_type?: string | null
          id?: string
          is_online?: boolean | null
          last_seen_at?: string | null
          metadata?: Json | null
          supports_hq?: boolean | null
          supports_lossless?: boolean | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          can_play?: boolean | null
          created_at?: string | null
          device_id?: string
          device_name?: string | null
          device_type?: string | null
          id?: string
          is_online?: boolean | null
          last_seen_at?: string | null
          metadata?: Json | null
          supports_hq?: boolean | null
          supports_lossless?: boolean | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_devices_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_usage_summary"
            referencedColumns: ["user_id"]
          },
        ]
      }
      user_listen_events: {
        Row: {
          created_at: string | null
          device_type: string | null
          duration_listened_seconds: number | null
          ended_at: string | null
          id: string
          liked_during_play: boolean | null
          media_node_id: string
          repeat_mode: string | null
          session_id: string
          shuffle_mode: boolean | null
          skip_position_seconds: number | null
          skipped: boolean | null
          source: string | null
          started_at: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          device_type?: string | null
          duration_listened_seconds?: number | null
          ended_at?: string | null
          id?: string
          liked_during_play?: boolean | null
          media_node_id: string
          repeat_mode?: string | null
          session_id: string
          shuffle_mode?: boolean | null
          skip_position_seconds?: number | null
          skipped?: boolean | null
          source?: string | null
          started_at: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          device_type?: string | null
          duration_listened_seconds?: number | null
          ended_at?: string | null
          id?: string
          liked_during_play?: boolean | null
          media_node_id?: string
          repeat_mode?: string | null
          session_id?: string
          shuffle_mode?: boolean | null
          skip_position_seconds?: number | null
          skipped?: boolean | null
          source?: string | null
          started_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_listen_events_media_node_id_fkey"
            columns: ["media_node_id"]
            isOneToOne: false
            referencedRelation: "media_nodes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_listen_events_media_node_id_fkey"
            columns: ["media_node_id"]
            isOneToOne: false
            referencedRelation: "trending_content"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_listen_events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_usage_summary"
            referencedColumns: ["user_id"]
          },
        ]
      }
      user_media_state: {
        Row: {
          completed_at: string | null
          completed_count: number | null
          created_at: string | null
          id: string
          last_device: string | null
          last_played_at: string | null
          last_position_seconds: number | null
          media_node_id: string
          progress_percent: number | null
          progress_seconds: number | null
          status: Database["public"]["Enums"]["media_status"] | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          completed_count?: number | null
          created_at?: string | null
          id?: string
          last_device?: string | null
          last_played_at?: string | null
          last_position_seconds?: number | null
          media_node_id: string
          progress_percent?: number | null
          progress_seconds?: number | null
          status?: Database["public"]["Enums"]["media_status"] | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          completed_at?: string | null
          completed_count?: number | null
          created_at?: string | null
          id?: string
          last_device?: string | null
          last_played_at?: string | null
          last_position_seconds?: number | null
          media_node_id?: string
          progress_percent?: number | null
          progress_seconds?: number | null
          status?: Database["public"]["Enums"]["media_status"] | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_media_state_media_node_id_fkey"
            columns: ["media_node_id"]
            isOneToOne: false
            referencedRelation: "media_nodes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_media_state_media_node_id_fkey"
            columns: ["media_node_id"]
            isOneToOne: false
            referencedRelation: "trending_content"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_media_state_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_usage_summary"
            referencedColumns: ["user_id"]
          },
        ]
      }
      user_memories: {
        Row: {
          content: string
          created_at: string
          decay_factor: number | null
          id: string
          importance: number | null
          importance_score: number | null
          last_accessed: string | null
          memory_type: string
          source: string | null
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          decay_factor?: number | null
          id?: string
          importance?: number | null
          importance_score?: number | null
          last_accessed?: string | null
          memory_type?: string
          source?: string | null
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          decay_factor?: number | null
          id?: string
          importance?: number | null
          importance_score?: number | null
          last_accessed?: string | null
          memory_type?: string
          source?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_memories_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_usage_summary"
            referencedColumns: ["user_id"]
          },
        ]
      }
      user_playback_state: {
        Row: {
          created_at: string | null
          id: string
          is_playing: boolean | null
          last_device_id: string | null
          last_device_name: string | null
          last_device_type: string | null
          last_synced_at: string | null
          position_seconds: number | null
          queue_data: Json | null
          track_data: Json | null
          updated_at: string | null
          user_id: string
          volume: number | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_playing?: boolean | null
          last_device_id?: string | null
          last_device_name?: string | null
          last_device_type?: string | null
          last_synced_at?: string | null
          position_seconds?: number | null
          queue_data?: Json | null
          track_data?: Json | null
          updated_at?: string | null
          user_id: string
          volume?: number | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_playing?: boolean | null
          last_device_id?: string | null
          last_device_name?: string | null
          last_device_type?: string | null
          last_synced_at?: string | null
          position_seconds?: number | null
          queue_data?: Json | null
          track_data?: Json | null
          updated_at?: string | null
          user_id?: string
          volume?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "user_playback_state_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "user_usage_summary"
            referencedColumns: ["user_id"]
          },
        ]
      }
      user_preferences: {
        Row: {
          active_world: string | null
          arcade_difficulty: string | null
          arcade_muted: boolean | null
          created_at: string | null
          focus_mode: boolean | null
          music_enabled: boolean | null
          music_volume: number | null
          reading_mode: string | null
          shuffle_enabled: boolean | null
          sound_enabled: boolean | null
          spotify_content_id: string | null
          spotify_content_type: string | null
          spotify_genre: string | null
          streaming_speed: string | null
          theme: string | null
          updated_at: string | null
          user_id: string
          voice_enabled: boolean | null
          weather_enabled: boolean | null
          weather_season: string | null
          world_enabled: boolean | null
        }
        Insert: {
          active_world?: string | null
          arcade_difficulty?: string | null
          arcade_muted?: boolean | null
          created_at?: string | null
          focus_mode?: boolean | null
          music_enabled?: boolean | null
          music_volume?: number | null
          reading_mode?: string | null
          shuffle_enabled?: boolean | null
          sound_enabled?: boolean | null
          spotify_content_id?: string | null
          spotify_content_type?: string | null
          spotify_genre?: string | null
          streaming_speed?: string | null
          theme?: string | null
          updated_at?: string | null
          user_id: string
          voice_enabled?: boolean | null
          weather_enabled?: boolean | null
          weather_season?: string | null
          world_enabled?: boolean | null
        }
        Update: {
          active_world?: string | null
          arcade_difficulty?: string | null
          arcade_muted?: boolean | null
          created_at?: string | null
          focus_mode?: boolean | null
          music_enabled?: boolean | null
          music_volume?: number | null
          reading_mode?: string | null
          shuffle_enabled?: boolean | null
          sound_enabled?: boolean | null
          spotify_content_id?: string | null
          spotify_content_type?: string | null
          spotify_genre?: string | null
          streaming_speed?: string | null
          theme?: string | null
          updated_at?: string | null
          user_id?: string
          voice_enabled?: boolean | null
          weather_enabled?: boolean | null
          weather_season?: string | null
          world_enabled?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "user_preferences_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "user_usage_summary"
            referencedColumns: ["user_id"]
          },
        ]
      }
      user_ratings: {
        Row: {
          contains_spoilers: boolean | null
          created_at: string | null
          id: string
          media_node_id: string | null
          media_series_id: string | null
          rating: number
          rating_type: string | null
          review_text: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          contains_spoilers?: boolean | null
          created_at?: string | null
          id?: string
          media_node_id?: string | null
          media_series_id?: string | null
          rating: number
          rating_type?: string | null
          review_text?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          contains_spoilers?: boolean | null
          created_at?: string | null
          id?: string
          media_node_id?: string | null
          media_series_id?: string | null
          rating?: number
          rating_type?: string | null
          review_text?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_ratings_media_node_id_fkey"
            columns: ["media_node_id"]
            isOneToOne: false
            referencedRelation: "media_nodes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_ratings_media_node_id_fkey"
            columns: ["media_node_id"]
            isOneToOne: false
            referencedRelation: "trending_content"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_ratings_media_series_id_fkey"
            columns: ["media_series_id"]
            isOneToOne: false
            referencedRelation: "media_series"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_ratings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_usage_summary"
            referencedColumns: ["user_id"]
          },
        ]
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
        Relationships: [
          {
            foreignKeyName: "user_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_usage_summary"
            referencedColumns: ["user_id"]
          },
        ]
      }
      user_sessions: {
        Row: {
          device_info: Json | null
          ended_at: string | null
          id: string
          ip_address: unknown
          is_active: boolean | null
          last_active_at: string | null
          session_token: string
          started_at: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          device_info?: Json | null
          ended_at?: string | null
          id?: string
          ip_address?: unknown
          is_active?: boolean | null
          last_active_at?: string | null
          session_token: string
          started_at?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          device_info?: Json | null
          ended_at?: string | null
          id?: string
          ip_address?: unknown
          is_active?: boolean | null
          last_active_at?: string | null
          session_token?: string
          started_at?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_usage_summary"
            referencedColumns: ["user_id"]
          },
        ]
      }
      user_subscriptions: {
        Row: {
          canceled_at: string | null
          created_at: string | null
          current_period_end: string | null
          current_period_start: string | null
          id: string
          metadata: Json | null
          started_at: string | null
          status: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          tier: string
          trial_end: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          canceled_at?: string | null
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          metadata?: Json | null
          started_at?: string | null
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          tier?: string
          trial_end?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          canceled_at?: string | null
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          metadata?: Json | null
          started_at?: string | null
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          tier?: string
          trial_end?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "user_usage_summary"
            referencedColumns: ["user_id"]
          },
        ]
      }
      user_taste_profiles: {
        Row: {
          average_listen_completion: number | null
          average_watch_completion: number | null
          binge_tendency: number | null
          computation_version: number | null
          created_at: string | null
          depth_preference: number | null
          era_scores: Json | null
          genre_scores: Json | null
          id: string
          last_computed_at: string | null
          media_type_scores: Json | null
          mood_scores: Json | null
          novelty_preference: number | null
          preferred_listening_hours: number[] | null
          preferred_watching_hours: number[] | null
          taste_embedding: string | null
          top_creators: Json | null
          updated_at: string | null
          user_id: string
          weekend_preference: number | null
        }
        Insert: {
          average_listen_completion?: number | null
          average_watch_completion?: number | null
          binge_tendency?: number | null
          computation_version?: number | null
          created_at?: string | null
          depth_preference?: number | null
          era_scores?: Json | null
          genre_scores?: Json | null
          id?: string
          last_computed_at?: string | null
          media_type_scores?: Json | null
          mood_scores?: Json | null
          novelty_preference?: number | null
          preferred_listening_hours?: number[] | null
          preferred_watching_hours?: number[] | null
          taste_embedding?: string | null
          top_creators?: Json | null
          updated_at?: string | null
          user_id: string
          weekend_preference?: number | null
        }
        Update: {
          average_listen_completion?: number | null
          average_watch_completion?: number | null
          binge_tendency?: number | null
          computation_version?: number | null
          created_at?: string | null
          depth_preference?: number | null
          era_scores?: Json | null
          genre_scores?: Json | null
          id?: string
          last_computed_at?: string | null
          media_type_scores?: Json | null
          mood_scores?: Json | null
          novelty_preference?: number | null
          preferred_listening_hours?: number[] | null
          preferred_watching_hours?: number[] | null
          taste_embedding?: string | null
          top_creators?: Json | null
          updated_at?: string | null
          user_id?: string
          weekend_preference?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "user_taste_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "user_usage_summary"
            referencedColumns: ["user_id"]
          },
        ]
      }
      user_watch_events: {
        Row: {
          completed: boolean | null
          created_at: string | null
          device_type: string | null
          duration_watched_seconds: number | null
          end_position_seconds: number | null
          ended_at: string | null
          id: string
          media_node_id: string
          paused_count: number | null
          player_type: string | null
          quality_level: string | null
          seeked_count: number | null
          session_id: string
          start_position_seconds: number | null
          started_at: string
          user_id: string
        }
        Insert: {
          completed?: boolean | null
          created_at?: string | null
          device_type?: string | null
          duration_watched_seconds?: number | null
          end_position_seconds?: number | null
          ended_at?: string | null
          id?: string
          media_node_id: string
          paused_count?: number | null
          player_type?: string | null
          quality_level?: string | null
          seeked_count?: number | null
          session_id: string
          start_position_seconds?: number | null
          started_at: string
          user_id: string
        }
        Update: {
          completed?: boolean | null
          created_at?: string | null
          device_type?: string | null
          duration_watched_seconds?: number | null
          end_position_seconds?: number | null
          ended_at?: string | null
          id?: string
          media_node_id?: string
          paused_count?: number | null
          player_type?: string | null
          quality_level?: string | null
          seeked_count?: number | null
          session_id?: string
          start_position_seconds?: number | null
          started_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_watch_events_media_node_id_fkey"
            columns: ["media_node_id"]
            isOneToOne: false
            referencedRelation: "media_nodes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_watch_events_media_node_id_fkey"
            columns: ["media_node_id"]
            isOneToOne: false
            referencedRelation: "trending_content"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_watch_events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_usage_summary"
            referencedColumns: ["user_id"]
          },
        ]
      }
    }
    Views: {
      analytics_summary: {
        Row: {
          audio_plays: number | null
          chat_messages: number | null
          day: string | null
          event_type: string | null
          page_views: number | null
          total_events: number | null
          unique_users: number | null
        }
        Relationships: []
      }
      chat_conversations: {
        Row: {
          archived: boolean | null
          created_at: string | null
          folder_id: string | null
          id: string | null
          pinned: boolean | null
          tags: string[] | null
          title: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          archived?: boolean | null
          created_at?: string | null
          folder_id?: string | null
          id?: string | null
          pinned?: boolean | null
          tags?: string[] | null
          title?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          archived?: boolean | null
          created_at?: string | null
          folder_id?: string | null
          id?: string | null
          pinned?: boolean | null
          tags?: string[] | null
          title?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "conversations_folder_id_fkey"
            columns: ["folder_id"]
            isOneToOne: false
            referencedRelation: "folders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_usage_summary"
            referencedColumns: ["user_id"]
          },
        ]
      }
      chat_messages: {
        Row: {
          content: string | null
          conversation_id: string | null
          created_at: string | null
          id: string | null
          metadata: Json | null
          model_used: string | null
          role: string | null
          search_vector: unknown
          tokens_used: number | null
        }
        Insert: {
          content?: string | null
          conversation_id?: string | null
          created_at?: string | null
          id?: string | null
          metadata?: Json | null
          model_used?: string | null
          role?: string | null
          search_vector?: unknown
          tokens_used?: number | null
        }
        Update: {
          content?: string | null
          conversation_id?: string | null
          created_at?: string | null
          id?: string | null
          metadata?: Json | null
          model_used?: string | null
          role?: string | null
          search_vector?: unknown
          tokens_used?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "chat_conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      continue_listening: {
        Row: {
          category: Database["public"]["Enums"]["media_category"] | null
          duration_seconds: number | null
          last_played_at: string | null
          media_node_id: string | null
          media_type: Database["public"]["Enums"]["media_type"] | null
          parent_series_id: string | null
          poster_url: string | null
          progress_percent: number | null
          progress_seconds: number | null
          series_title: string | null
          thumbnail_url: string | null
          title: string | null
          user_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "media_nodes_parent_series_id_fkey"
            columns: ["parent_series_id"]
            isOneToOne: false
            referencedRelation: "media_series"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_media_state_media_node_id_fkey"
            columns: ["media_node_id"]
            isOneToOne: false
            referencedRelation: "media_nodes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_media_state_media_node_id_fkey"
            columns: ["media_node_id"]
            isOneToOne: false
            referencedRelation: "trending_content"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_media_state_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_usage_summary"
            referencedColumns: ["user_id"]
          },
        ]
      }
      continue_watching: {
        Row: {
          category: Database["public"]["Enums"]["media_category"] | null
          duration_seconds: number | null
          last_played_at: string | null
          media_node_id: string | null
          media_type: Database["public"]["Enums"]["media_type"] | null
          parent_series_id: string | null
          poster_url: string | null
          progress_percent: number | null
          progress_seconds: number | null
          series_title: string | null
          thumbnail_url: string | null
          title: string | null
          user_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "media_nodes_parent_series_id_fkey"
            columns: ["parent_series_id"]
            isOneToOne: false
            referencedRelation: "media_series"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_media_state_media_node_id_fkey"
            columns: ["media_node_id"]
            isOneToOne: false
            referencedRelation: "media_nodes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_media_state_media_node_id_fkey"
            columns: ["media_node_id"]
            isOneToOne: false
            referencedRelation: "trending_content"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_media_state_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_usage_summary"
            referencedColumns: ["user_id"]
          },
        ]
      }
      tool_health_status: {
        Row: {
          avg_latency_ms: number | null
          failure_count: number | null
          last_used: string | null
          success_count: number | null
          success_rate: number | null
          tool_id: string | null
        }
        Relationships: []
      }
      trending_content: {
        Row: {
          average_rating: number | null
          category: Database["public"]["Enums"]["media_category"] | null
          id: string | null
          media_type: Database["public"]["Enums"]["media_type"] | null
          popularity_score: number | null
          poster_url: string | null
          recent_listen_count: number | null
          recent_watch_count: number | null
          release_date: string | null
          thumbnail_url: string | null
          title: string | null
        }
        Relationships: []
      }
      user_library: {
        Row: {
          added_at: string | null
          added_by: string | null
          category: Database["public"]["Enums"]["media_category"] | null
          collection_id: string | null
          collection_name: string | null
          collection_type: Database["public"]["Enums"]["collection_type"] | null
          duration_seconds: number | null
          media_category: Database["public"]["Enums"]["media_category"] | null
          media_node_id: string | null
          media_type: Database["public"]["Enums"]["media_type"] | null
          position: number | null
          poster_url: string | null
          series_title: string | null
          thumbnail_url: string | null
          title: string | null
          user_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_collection_items_media_node_id_fkey"
            columns: ["media_node_id"]
            isOneToOne: false
            referencedRelation: "media_nodes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_collection_items_media_node_id_fkey"
            columns: ["media_node_id"]
            isOneToOne: false
            referencedRelation: "trending_content"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_collections_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_usage_summary"
            referencedColumns: ["user_id"]
          },
        ]
      }
      user_usage_summary: {
        Row: {
          cost_this_month: number | null
          email: string | null
          last_activity: string | null
          requests_today: number | null
          tier: string | null
          user_id: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      accept_org_invitation: { Args: { p_token: string }; Returns: string }
      arcade_accept_match: {
        Args: { p_match_id: string; p_player_id: string }
        Returns: undefined
      }
      arcade_update_mmr: {
        Args: {
          p_game_id: string
          p_opponent_mmr: number
          p_player_id: string
          p_won: boolean
        }
        Returns: number
      }
      arcade_update_rank_tier: {
        Args: { p_game_id: string; p_player_id: string }
        Returns: undefined
      }
      award_player_xp: {
        Args: { p_game_slug?: string; p_player_id: string; p_xp_amount: number }
        Returns: Json
      }
      calculate_xp_for_level: { Args: { p_level: number }; Returns: number }
      check_tool_access: {
        Args: { p_model?: string; p_tool_id: string; p_user_id: string }
        Returns: {
          allowed: boolean
          daily_remaining: number
          reason: string
          tier: string
          upgrade_available: boolean
        }[]
      }
      complete_tool_run: {
        Args: {
          p_content: string
          p_content_json?: Json
          p_error_message?: string
          p_output_type: string
          p_run_id: string
          p_status: string
        }
        Returns: boolean
      }
      create_arcade_lobby: {
        Args: {
          p_game_id: string
          p_is_public?: boolean
          p_max_players?: number
          p_name?: string
        }
        Returns: string
      }
      create_devstudio_project: {
        Args: {
          p_name: string
          p_project_type?: string
          p_template_id?: string
        }
        Returns: string
      }
      create_organization: {
        Args: { p_name: string; p_slug: string; p_type?: string }
        Returns: string
      }
      create_tool_run: {
        Args: { p_input_data: Json; p_input_type: string; p_tool_id: string }
        Returns: string
      }
      decay_brain_memories: { Args: never; Returns: undefined }
      decay_user_memories: { Args: never; Returns: undefined }
      disconnect_spotify: { Args: { p_user_id: string }; Returns: undefined }
      emit_brain_event: {
        Args: {
          p_event_type: string
          p_payload?: Json
          p_source: string
          p_target?: string
          p_user_id: string
        }
        Returns: string
      }
      end_lounge_session: { Args: { p_session_id: string }; Returns: boolean }
      ensure_user_preferences: {
        Args: { p_defaults?: Json; p_user_id: string }
        Returns: {
          active_world: string | null
          arcade_difficulty: string | null
          arcade_muted: boolean | null
          created_at: string | null
          focus_mode: boolean | null
          music_enabled: boolean | null
          music_volume: number | null
          reading_mode: string | null
          shuffle_enabled: boolean | null
          sound_enabled: boolean | null
          spotify_content_id: string | null
          spotify_content_type: string | null
          spotify_genre: string | null
          streaming_speed: string | null
          theme: string | null
          updated_at: string | null
          user_id: string
          voice_enabled: boolean | null
          weather_enabled: boolean | null
          weather_season: string | null
          world_enabled: boolean | null
        }
        SetofOptions: {
          from: "*"
          to: "user_preferences"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      ensure_user_profile: {
        Args: {
          p_avatar_url?: string
          p_email: string
          p_name?: string
          p_user_id: string
        }
        Returns: {
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
        SetofOptions: {
          from: "*"
          to: "profiles"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      find_orphaned_records: {
        Args: never
        Returns: {
          orphan_count: number
          table_name: string
        }[]
      }
      get_admin_dashboard_stats: {
        Args: never
        Returns: {
          active_users_today: number
          errors_today: number
          tier_distribution: Json
          top_tools: Json
          total_ai_calls_today: number
          total_requests_today: number
          total_users: number
        }[]
      }
      get_conversation_with_context: {
        Args: { p_conversation_id: string }
        Returns: {
          context: Database["public"]["Tables"]["conversation_context"]["Row"]
          conversation: Database["public"]["Tables"]["conversations"]["Row"]
          last_message_at: string
          message_count: number
        }[]
      }
      get_lounge_presence: {
        Args: { p_lounge_type: string }
        Returns: {
          active_count: number
          recent_activity: Json
        }[]
      }
      get_online_players_count: { Args: never; Returns: number }
      get_or_create_brain_preferences: {
        Args: { p_user_id: string }
        Returns: {
          ambient_style: string | null
          audio_energy: string | null
          created_at: string | null
          creativity_level: number | null
          expertise_areas: string[] | null
          humor_level: string | null
          learning_style: string | null
          music_style: string[] | null
          preferred_genres: string[] | null
          risk_tolerance: string | null
          tempo_preference: string | null
          tone_preference: string | null
          topics_of_interest: string[] | null
          updated_at: string | null
          user_id: string
          verbosity: string | null
          visual_intensity: string | null
        }
        SetofOptions: {
          from: "*"
          to: "lucy_brain_preferences"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      get_or_create_brain_session: {
        Args: { p_context?: string; p_user_id: string }
        Returns: {
          active_context: string
          created_at: string | null
          current_intent: string | null
          current_topic: string | null
          device_type: string | null
          emotional_state: string | null
          id: string
          is_active: boolean | null
          last_active_at: string | null
          metadata: Json | null
          session_start: string | null
          updated_at: string | null
          user_id: string
        }
        SetofOptions: {
          from: "*"
          to: "lucy_brain_sessions"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      get_or_create_chat_session: {
        Args: {
          p_brain_mode?: string
          p_conversation_id?: string
          p_user_id: string
        }
        Returns: {
          avg_latency_ms: number | null
          brain_mode: string | null
          conversation_id: string | null
          created_at: string | null
          ended_at: string | null
          id: string
          is_active: boolean | null
          memory_loaded: boolean | null
          messages_count: number | null
          model_slot_used: string | null
          response_quality_score: number | null
          started_at: string | null
          tools_used: string[] | null
          total_tokens_used: number | null
          updated_at: string | null
          user_id: string
          user_satisfaction: number | null
        }
        SetofOptions: {
          from: "*"
          to: "chat_sessions"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      get_or_create_taste_profile: {
        Args: { p_user_id: string }
        Returns: {
          average_listen_completion: number | null
          average_watch_completion: number | null
          binge_tendency: number | null
          computation_version: number | null
          created_at: string | null
          depth_preference: number | null
          era_scores: Json | null
          genre_scores: Json | null
          id: string
          last_computed_at: string | null
          media_type_scores: Json | null
          mood_scores: Json | null
          novelty_preference: number | null
          preferred_listening_hours: number[] | null
          preferred_watching_hours: number[] | null
          taste_embedding: string | null
          top_creators: Json | null
          updated_at: string | null
          user_id: string
          weekend_preference: number | null
        }
        SetofOptions: {
          from: "*"
          to: "user_taste_profiles"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      get_org_dashboard_stats: {
        Args: { p_org_id: string }
        Returns: {
          active_members: number
          seats_included: number
          seats_used: number
          subscription_tier: string
          total_ai_calls_today: number
          total_members: number
          total_usage_today: number
        }[]
      }
      get_recommendations_by_genre: {
        Args: { p_limit?: number; p_user_id: string }
        Returns: {
          media_type: Database["public"]["Enums"]["media_type"]
          node_id: string
          poster_url: string
          reason: string
          score: number
          title: string
        }[]
      }
      get_relevant_brain_memories: {
        Args: {
          p_limit?: number
          p_memory_types?: string[]
          p_sources?: string[]
          p_user_id: string
        }
        Returns: {
          content: string
          created_at: string
          id: string
          importance_score: number
          memory_type: string
          source: string
          summary: string
        }[]
      }
      get_tool_history: {
        Args: { p_limit?: number; p_tool_id: string }
        Returns: {
          created_at: string
          id: string
          input_data: Json
          outputs: Json
          status: string
          tool_id: string
        }[]
      }
      get_user_preferences: {
        Args: { p_user_id: string }
        Returns: {
          active_world: string | null
          arcade_difficulty: string | null
          arcade_muted: boolean | null
          created_at: string | null
          focus_mode: boolean | null
          music_enabled: boolean | null
          music_volume: number | null
          reading_mode: string | null
          shuffle_enabled: boolean | null
          sound_enabled: boolean | null
          spotify_content_id: string | null
          spotify_content_type: string | null
          spotify_genre: string | null
          streaming_speed: string | null
          theme: string | null
          updated_at: string | null
          user_id: string
          voice_enabled: boolean | null
          weather_enabled: boolean | null
          weather_season: string | null
          world_enabled: boolean | null
        }
        SetofOptions: {
          from: "*"
          to: "user_preferences"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      get_user_primary_org: { Args: { p_user_id?: string }; Returns: string }
      get_user_tier_quotas: {
        Args: { p_user_id: string }
        Returns: {
          allowed_models: string[]
          daily_limit: number
          daily_used: number
          is_enabled: boolean
          monthly_limit: number
          monthly_used: number
          tier: string
          tool_id: string
        }[]
      }
      grant_admin_role: { Args: { p_email: string }; Returns: undefined }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      invite_org_member: {
        Args: { p_email: string; p_org_id: string; p_role?: string }
        Returns: string
      }
      is_admin: { Args: never; Returns: boolean }
      is_org_admin: {
        Args: { p_org_id: string; p_user_id?: string }
        Returns: boolean
      }
      is_org_member: {
        Args: { p_org_id: string; p_user_id?: string }
        Returns: boolean
      }
      is_platform_admin: { Args: { p_user_id?: string }; Returns: boolean }
      join_arcade_lobby: { Args: { p_lobby_id: string }; Returns: boolean }
      learn_brain_preference: {
        Args: {
          p_preference_key: string
          p_preference_value: string
          p_user_id: string
        }
        Returns: undefined
      }
      log_platform_event: {
        Args: {
          p_category: string
          p_details?: Json
          p_duration_ms?: number
          p_event_name: string
          p_function_name?: string
          p_message?: string
          p_severity?: string
          p_stack_trace?: string
          p_status_code?: number
          p_user_id?: string
        }
        Returns: undefined
      }
      promote_admin_by_email: { Args: { user_email: string }; Returns: Json }
      record_match_result: {
        Args: { p_match_id: string; p_winning_team?: number }
        Returns: undefined
      }
      record_tool_usage: {
        Args: {
          p_cost?: number
          p_error_code?: string
          p_error_message?: string
          p_event_type: string
          p_latency_ms?: number
          p_metadata?: Json
          p_model?: string
          p_tokens_input?: number
          p_tokens_output?: number
          p_tool_id: string
          p_user_id: string
        }
        Returns: undefined
      }
      resolve_org_by_domain: {
        Args: { p_domain: string }
        Returns: {
          branding: Json
          org_id: string
          org_name: string
          org_slug: string
          settings: Json
        }[]
      }
      save_lounge_artifact: {
        Args: {
          p_artifact_type: string
          p_content: string
          p_content_json?: Json
          p_session_id: string
          p_tags?: string[]
          p_title: string
        }
        Returns: string
      }
      score_memory_importance: {
        Args: { p_content: string; p_memory_type: string; p_metadata?: Json }
        Returns: number
      }
      search_media_semantic: {
        Args: {
          p_category?: Database["public"]["Enums"]["media_category"]
          p_limit?: number
          p_media_type?: Database["public"]["Enums"]["media_type"]
          p_query_embedding: string
        }
        Returns: {
          category: Database["public"]["Enums"]["media_category"]
          media_type: Database["public"]["Enums"]["media_type"]
          node_id: string
          poster_url: string
          similarity: number
          title: string
        }[]
      }
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
      search_user_memories: {
        Args: { p_match_count?: number; p_user_id: string }
        Returns: {
          content: string
          created_at: string
          id: string
          importance: number
          memory_type: string
        }[]
      }
      show_limit: { Args: never; Returns: number }
      show_trgm: { Args: { "": string }; Returns: string[] }
      start_lounge_session: {
        Args: { p_ai_mode?: string; p_lounge_type: string }
        Returns: string
      }
      store_brain_memory: {
        Args: {
          p_content: string
          p_importance?: number
          p_memory_type?: string
          p_source: string
          p_source_id?: string
          p_user_id: string
        }
        Returns: {
          access_count: number | null
          content: string
          created_at: string | null
          decay_factor: number | null
          expires_at: string | null
          id: string
          importance_score: number | null
          last_accessed: string | null
          memory_type: string
          source: string
          source_id: string | null
          summary: string | null
          user_id: string
        }
        SetofOptions: {
          from: "*"
          to: "lucy_brain_memory"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      update_chat_session_metrics: {
        Args: {
          p_latency_ms?: number
          p_model_slot?: string
          p_session_id: string
          p_tokens?: number
          p_tools?: string[]
        }
        Returns: undefined
      }
      update_user_preference: {
        Args: { p_key: string; p_user_id: string; p_value: string }
        Returns: {
          active_world: string | null
          arcade_difficulty: string | null
          arcade_muted: boolean | null
          created_at: string | null
          focus_mode: boolean | null
          music_enabled: boolean | null
          music_volume: number | null
          reading_mode: string | null
          shuffle_enabled: boolean | null
          sound_enabled: boolean | null
          spotify_content_id: string | null
          spotify_content_type: string | null
          spotify_genre: string | null
          streaming_speed: string | null
          theme: string | null
          updated_at: string | null
          user_id: string
          voice_enabled: boolean | null
          weather_enabled: boolean | null
          weather_season: string | null
          world_enabled: boolean | null
        }
        SetofOptions: {
          from: "*"
          to: "user_preferences"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      upsert_media_state: {
        Args: {
          p_device?: string
          p_media_node_id: string
          p_progress_percent: number
          p_progress_seconds: number
          p_status?: Database["public"]["Enums"]["media_status"]
          p_user_id: string
        }
        Returns: {
          completed_at: string | null
          completed_count: number | null
          created_at: string | null
          id: string
          last_device: string | null
          last_played_at: string | null
          last_position_seconds: number | null
          media_node_id: string
          progress_percent: number | null
          progress_seconds: number | null
          status: Database["public"]["Enums"]["media_status"] | null
          updated_at: string | null
          user_id: string
        }
        SetofOptions: {
          from: "*"
          to: "user_media_state"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      upsert_recently_played: {
        Args: {
          p_artist?: string
          p_content_id: string
          p_content_type: string
          p_duration_seconds?: number
          p_genre?: string
          p_thumbnail_url?: string
          p_title?: string
          p_user_id: string
        }
        Returns: {
          artist: string | null
          content_id: string
          content_type: string
          duration_seconds: number | null
          genre: string | null
          id: string
          play_count: number | null
          played_at: string | null
          thumbnail_url: string | null
          title: string | null
          user_id: string
        }
        SetofOptions: {
          from: "*"
          to: "recently_played"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      upsert_spotify_connection: {
        Args: {
          p_access_token: string
          p_display_name: string
          p_email: string
          p_expires_at: string
          p_refresh_token: string
          p_scopes: string[]
          p_spotify_user_id: string
          p_user_id: string
        }
        Returns: {
          access_token: string | null
          connected_at: string | null
          display_name: string | null
          email: string | null
          id: string
          is_active: boolean | null
          last_sync_at: string | null
          refresh_token: string | null
          scopes: string[] | null
          spotify_user_id: string | null
          token_expires_at: string | null
          user_id: string
        }
        SetofOptions: {
          from: "*"
          to: "spotify_connections"
          isOneToOne: true
          isSetofReturn: false
        }
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
      availability_type:
        | "free"
        | "free_with_ads"
        | "subscription"
        | "rental"
        | "purchase"
        | "premium_only"
        | "geo_restricted"
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
      collection_type:
        | "watchlist"
        | "favorites"
        | "playlist"
        | "queue"
        | "history"
        | "custom"
      content_rating:
        | "G"
        | "PG"
        | "PG-13"
        | "R"
        | "NC-17"
        | "TV-Y"
        | "TV-Y7"
        | "TV-G"
        | "TV-PG"
        | "TV-14"
        | "TV-MA"
        | "E"
        | "CLEAN"
        | "UNRATED"
      credit_role:
        | "actor"
        | "director"
        | "writer"
        | "producer"
        | "composer"
        | "artist"
        | "featured_artist"
        | "host"
        | "narrator"
        | "author"
        | "creator"
      journey_type:
        | "mood"
        | "theme"
        | "era"
        | "director"
        | "artist"
        | "story"
        | "curated"
      media_category: "video" | "audio" | "live"
      media_status: "not_started" | "in_progress" | "completed" | "abandoned"
      media_type:
        | "movie"
        | "tv_show"
        | "tv_season"
        | "tv_episode"
        | "music_album"
        | "music_track"
        | "podcast_show"
        | "podcast_episode"
        | "audiobook"
        | "audiobook_chapter"
        | "creator_video"
        | "creator_audio"
        | "live_stream"
        | "fast_channel"
      provider_type:
        | "tmdb"
        | "youtube"
        | "spotify"
        | "apple_music"
        | "soundcloud"
        | "rss_podcast"
        | "librivox"
        | "archive_org"
        | "pluto_tv"
        | "tubi"
        | "plex_free"
        | "vimeo"
        | "twitch"
        | "custom"
      relationship_type:
        | "sequel_to"
        | "prequel_to"
        | "spin_off_of"
        | "remake_of"
        | "part_of"
        | "soundtrack_of"
        | "same_creator"
        | "same_franchise"
        | "similar_to"
        | "recommended_after"
        | "mood_match"
        | "theme_match"
        | "remix_of"
        | "cover_of"
        | "features"
      tag_type:
        | "genre"
        | "mood"
        | "era"
        | "topic"
        | "language"
        | "theme"
        | "style"
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
  graphql_public: {
    Enums: {},
  },
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
      availability_type: [
        "free",
        "free_with_ads",
        "subscription",
        "rental",
        "purchase",
        "premium_only",
        "geo_restricted",
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
      collection_type: [
        "watchlist",
        "favorites",
        "playlist",
        "queue",
        "history",
        "custom",
      ],
      content_rating: [
        "G",
        "PG",
        "PG-13",
        "R",
        "NC-17",
        "TV-Y",
        "TV-Y7",
        "TV-G",
        "TV-PG",
        "TV-14",
        "TV-MA",
        "E",
        "CLEAN",
        "UNRATED",
      ],
      credit_role: [
        "actor",
        "director",
        "writer",
        "producer",
        "composer",
        "artist",
        "featured_artist",
        "host",
        "narrator",
        "author",
        "creator",
      ],
      journey_type: [
        "mood",
        "theme",
        "era",
        "director",
        "artist",
        "story",
        "curated",
      ],
      media_category: ["video", "audio", "live"],
      media_status: ["not_started", "in_progress", "completed", "abandoned"],
      media_type: [
        "movie",
        "tv_show",
        "tv_season",
        "tv_episode",
        "music_album",
        "music_track",
        "podcast_show",
        "podcast_episode",
        "audiobook",
        "audiobook_chapter",
        "creator_video",
        "creator_audio",
        "live_stream",
        "fast_channel",
      ],
      provider_type: [
        "tmdb",
        "youtube",
        "spotify",
        "apple_music",
        "soundcloud",
        "rss_podcast",
        "librivox",
        "archive_org",
        "pluto_tv",
        "tubi",
        "plex_free",
        "vimeo",
        "twitch",
        "custom",
      ],
      relationship_type: [
        "sequel_to",
        "prequel_to",
        "spin_off_of",
        "remake_of",
        "part_of",
        "soundtrack_of",
        "same_creator",
        "same_franchise",
        "similar_to",
        "recommended_after",
        "mood_match",
        "theme_match",
        "remix_of",
        "cover_of",
        "features",
      ],
      tag_type: ["genre", "mood", "era", "topic", "language", "theme", "style"],
    },
  },
} as const
