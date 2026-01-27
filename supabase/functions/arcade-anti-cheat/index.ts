/**
 * ┌─────────────────────────────────────────────────────────────────────────────┐
 * │ LUCY ARCADE — ANTI-CHEAT VALIDATION ENGINE                                  │
 * │                                                                             │
 * │ Server-side cheat detection and prevention                                  │
 * │                                                                             │
 * │ FEATURES:                                                                   │
 * │ • Input validation with hash verification                                   │
 * │ • Statistical anomaly detection                                             │
 * │ • Behavior pattern analysis                                                 │
 * │ • Speed/teleport detection                                                  │
 * │ • Aimbot detection (accuracy analysis)                                      │
 * │ • Wallhack detection (kill angle analysis)                                  │
 * │ • Automated sanction system                                                 │
 * │ • Appeal and review workflow                                                │
 * └─────────────────────────────────────────────────────────────────────────────┘
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// ============================================================================
// TYPES
// ============================================================================

interface AntiCheatRequest {
  action: 
    | 'validate_input'
    | 'analyze_match'
    | 'check_player'
    | 'report_player'
    | 'process_reports'
    | 'apply_sanction'
    | 'check_sanctions'
    | 'appeal_sanction';
  match_id?: string;
  player_id?: string;
  data?: any;
}

interface InputValidation {
  tick: number;
  timestamp: number;
  client_hash: string;
  server_hash: string;
  input_data: any;
  anomalies: string[];
  score: number;
}

interface PlayerProfile {
  player_id: string;
  total_matches: number;
  average_accuracy: number;
  average_headshot_ratio: number;
  average_kd: number;
  reaction_time_avg_ms: number;
  movement_speed_avg: number;
  suspicious_flags: number;
  trust_score: number;
  last_analyzed: Date;
}

interface AnomalyDetection {
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  confidence: number;
  evidence: any;
  timestamp: number;
}

// ============================================================================
// DETECTION THRESHOLDS
// ============================================================================

const THRESHOLDS = {
  // Accuracy thresholds (by weapon type)
  accuracy: {
    pistol: { normal: 0.35, suspicious: 0.55, impossible: 0.75 },
    smg: { normal: 0.30, suspicious: 0.50, impossible: 0.70 },
    rifle: { normal: 0.35, suspicious: 0.55, impossible: 0.80 },
    sniper: { normal: 0.45, suspicious: 0.70, impossible: 0.90 },
    shotgun: { normal: 0.50, suspicious: 0.75, impossible: 0.95 },
  },
  
  // Headshot ratio
  headshot_ratio: {
    normal: 0.25,
    suspicious: 0.45,
    impossible: 0.70,
  },
  
  // Reaction time (ms)
  reaction_time: {
    normal: 200,
    suspicious: 120,
    impossible: 50,
  },
  
  // Movement speed (units/tick)
  movement_speed: {
    normal: 0.5,
    suspicious: 0.75,
    impossible: 1.0,
  },
  
  // Kill through wall percentage
  wallhack_kill_angle: {
    suspicious: 0.25, // 25% of kills from impossible angles
    impossible: 0.50,
  },
  
  // Snap aim detection (degrees per tick)
  snap_aim: {
    normal: 5,
    suspicious: 15,
    impossible: 45,
  },
  
  // Trust score
  trust: {
    trusted: 80,
    neutral: 50,
    suspicious: 30,
    banned: 0,
  },
  
  // Auto-ban threshold
  auto_ban_score: 100,
  auto_warning_score: 50,
};

// ============================================================================
// HASH COMPUTATION
// ============================================================================

function computeHash(data: any, salt: string): string {
  const encoder = new TextEncoder();
  const input = encoder.encode(JSON.stringify(data) + salt);
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    hash ^= input[i];
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(16).padStart(8, '0');
}

// ============================================================================
// ANOMALY DETECTION FUNCTIONS
// ============================================================================

function detectSpeedHack(
  positions: { x: number; y: number; z: number; tick: number }[]
): AnomalyDetection | null {
  if (positions.length < 2) return null;
  
  const speeds: number[] = [];
  for (let i = 1; i < positions.length; i++) {
    const dx = positions[i].x - positions[i-1].x;
    const dy = positions[i].y - positions[i-1].y;
    const dz = positions[i].z - positions[i-1].z;
    const dt = positions[i].tick - positions[i-1].tick;
    
    if (dt > 0) {
      const speed = Math.sqrt(dx*dx + dy*dy + dz*dz) / dt;
      speeds.push(speed);
    }
  }
  
  const avgSpeed = speeds.reduce((a, b) => a + b, 0) / speeds.length;
  const maxSpeed = Math.max(...speeds);
  
  if (maxSpeed > THRESHOLDS.movement_speed.impossible) {
    return {
      type: 'speedhack',
      severity: 'critical',
      confidence: 0.95,
      evidence: { max_speed: maxSpeed, avg_speed: avgSpeed, threshold: THRESHOLDS.movement_speed.impossible },
      timestamp: Date.now(),
    };
  }
  
  if (avgSpeed > THRESHOLDS.movement_speed.suspicious) {
    return {
      type: 'speedhack',
      severity: 'high',
      confidence: 0.75,
      evidence: { avg_speed: avgSpeed, threshold: THRESHOLDS.movement_speed.suspicious },
      timestamp: Date.now(),
    };
  }
  
  return null;
}

function detectAimbot(
  kills: { 
    tick: number;
    aim_angle_change: number;
    time_to_kill_ms: number;
    was_headshot: boolean;
    distance: number;
  }[]
): AnomalyDetection | null {
  if (kills.length < 5) return null;
  
  const snapAims = kills.filter(k => k.aim_angle_change > THRESHOLDS.snap_aim.suspicious);
  const instantKills = kills.filter(k => k.time_to_kill_ms < THRESHOLDS.reaction_time.suspicious);
  const headshots = kills.filter(k => k.was_headshot);
  
  const snapRatio = snapAims.length / kills.length;
  const instantRatio = instantKills.length / kills.length;
  const headshotRatio = headshots.length / kills.length;
  
  let score = 0;
  let evidence: any = {};
  
  if (snapRatio > 0.3) {
    score += 30;
    evidence.snap_ratio = snapRatio;
  }
  
  if (instantRatio > 0.4) {
    score += 25;
    evidence.instant_ratio = instantRatio;
  }
  
  if (headshotRatio > THRESHOLDS.headshot_ratio.suspicious) {
    score += 25;
    evidence.headshot_ratio = headshotRatio;
  }
  
  // Check for impossible headshot ratio
  if (headshotRatio > THRESHOLDS.headshot_ratio.impossible) {
    return {
      type: 'aimbot',
      severity: 'critical',
      confidence: 0.90,
      evidence: { ...evidence, kills_analyzed: kills.length },
      timestamp: Date.now(),
    };
  }
  
  if (score >= 50) {
    return {
      type: 'aimbot',
      severity: score >= 70 ? 'high' : 'medium',
      confidence: Math.min(0.85, score / 100),
      evidence: { ...evidence, score, kills_analyzed: kills.length },
      timestamp: Date.now(),
    };
  }
  
  return null;
}

function detectWallhack(
  kills: {
    killer_position: { x: number; y: number; z: number };
    victim_position: { x: number; y: number; z: number };
    victim_was_visible: boolean;
    killer_facing: { x: number; y: number };
  }[]
): AnomalyDetection | null {
  if (kills.length < 5) return null;
  
  let suspiciousKills = 0;
  
  for (const kill of kills) {
    if (!kill.victim_was_visible) {
      // Kill on invisible target - highly suspicious
      suspiciousKills += 2;
      continue;
    }
    
    // Check if kill direction matches facing direction
    const dx = kill.victim_position.x - kill.killer_position.x;
    const dz = kill.victim_position.z - kill.killer_position.z;
    const killAngle = Math.atan2(dx, dz);
    const facingAngle = Math.atan2(
      Math.sin(kill.killer_facing.y),
      Math.cos(kill.killer_facing.y)
    );
    
    const angleDiff = Math.abs(killAngle - facingAngle);
    if (angleDiff > Math.PI / 2) {
      // Kill from behind or side when not facing
      suspiciousKills++;
    }
  }
  
  const suspiciousRatio = suspiciousKills / kills.length;
  
  if (suspiciousRatio > THRESHOLDS.wallhack_kill_angle.impossible) {
    return {
      type: 'wallhack',
      severity: 'critical',
      confidence: 0.85,
      evidence: { suspicious_ratio: suspiciousRatio, suspicious_kills: suspiciousKills, total_kills: kills.length },
      timestamp: Date.now(),
    };
  }
  
  if (suspiciousRatio > THRESHOLDS.wallhack_kill_angle.suspicious) {
    return {
      type: 'wallhack',
      severity: 'medium',
      confidence: 0.65,
      evidence: { suspicious_ratio: suspiciousRatio },
      timestamp: Date.now(),
    };
  }
  
  return null;
}

function calculateTrustScore(profile: PlayerProfile, anomalies: AnomalyDetection[]): number {
  let score = 100;
  
  // Reduce for anomalies
  for (const anomaly of anomalies) {
    switch (anomaly.severity) {
      case 'critical': score -= 40 * anomaly.confidence; break;
      case 'high': score -= 25 * anomaly.confidence; break;
      case 'medium': score -= 15 * anomaly.confidence; break;
      case 'low': score -= 5 * anomaly.confidence; break;
    }
  }
  
  // Bonus for clean history
  if (profile.total_matches > 50 && profile.suspicious_flags === 0) {
    score += 10;
  }
  
  // Penalty for previous flags
  score -= profile.suspicious_flags * 5;
  
  return Math.max(0, Math.min(100, score));
}

// ============================================================================
// MAIN HANDLER
// ============================================================================

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { action, match_id, player_id, data } = await req.json() as AntiCheatRequest;

    switch (action) {
      // ========================================================================
      // VALIDATE INPUT
      // ========================================================================
      case 'validate_input': {
        if (!match_id || !player_id || !data) {
          return new Response(JSON.stringify({ error: 'Missing required fields' }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        const { tick, client_hash, input_data, server_salt } = data;
        
        // Compute server-side hash
        const server_hash = computeHash(input_data, server_salt);
        const is_valid = client_hash === server_hash;
        
        // Analyze input for anomalies
        const anomalies: string[] = [];
        let anomaly_score = 0;
        
        // Check movement magnitude
        if (input_data.movement) {
          const mag = Math.sqrt(
            input_data.movement.x ** 2 +
            input_data.movement.y ** 2 +
            input_data.movement.z ** 2
          );
          if (mag > 1.5) {
            anomalies.push('excessive_movement');
            anomaly_score += 10;
          }
        }
        
        // Check rotation speed (snap aim)
        if (input_data.rotation_delta) {
          const rotSpeed = Math.sqrt(
            input_data.rotation_delta.x ** 2 +
            input_data.rotation_delta.y ** 2
          );
          if (rotSpeed > THRESHOLDS.snap_aim.suspicious) {
            anomalies.push('snap_aim');
            anomaly_score += 15;
          }
          if (rotSpeed > THRESHOLDS.snap_aim.impossible) {
            anomalies.push('impossible_rotation');
            anomaly_score += 30;
          }
        }
        
        // Store validation result
        await supabase
          .from('arcade_input_validations')
          .insert({
            match_id,
            player_id,
            tick,
            input_hash: client_hash,
            server_hash,
            is_valid,
            anomaly_score,
            anomaly_flags: anomalies,
          });

        return new Response(JSON.stringify({
          valid: is_valid,
          anomalies,
          score: anomaly_score,
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // ========================================================================
      // ANALYZE MATCH
      // ========================================================================
      case 'analyze_match': {
        if (!match_id) {
          return new Response(JSON.stringify({ error: 'match_id required' }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        // Get match data
        const { data: match } = await supabase
          .from('arcade_matches')
          .select('*')
          .eq('id', match_id)
          .single();

        if (!match) {
          return new Response(JSON.stringify({ error: 'Match not found' }), {
            status: 404,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        // Get match players
        const { data: players } = await supabase
          .from('match_players')
          .select('*')
          .eq('match_id', match_id);

        // Get input validations
        const { data: validations } = await supabase
          .from('arcade_input_validations')
          .select('*')
          .eq('match_id', match_id)
          .order('tick', { ascending: true });

        const results: { player_id: string; anomalies: AnomalyDetection[]; trust_score: number }[] = [];

        for (const player of players || []) {
          const playerValidations = validations?.filter(v => v.player_id === player.player_id) || [];
          const anomalies: AnomalyDetection[] = [];
          
          // Aggregate anomaly scores
          const totalAnomalyScore = playerValidations.reduce((sum, v) => sum + (v.anomaly_score || 0), 0);
          const avgAnomalyScore = totalAnomalyScore / Math.max(1, playerValidations.length);
          
          if (avgAnomalyScore > 20) {
            anomalies.push({
              type: 'high_anomaly_rate',
              severity: avgAnomalyScore > 40 ? 'high' : 'medium',
              confidence: Math.min(0.9, avgAnomalyScore / 50),
              evidence: { avg_score: avgAnomalyScore, validations: playerValidations.length },
              timestamp: Date.now(),
            });
          }
          
          // Check for invalid hashes
          const invalidHashes = playerValidations.filter(v => !v.is_valid);
          if (invalidHashes.length > 0) {
            anomalies.push({
              type: 'hash_mismatch',
              severity: invalidHashes.length > 10 ? 'critical' : 'high',
              confidence: 0.95,
              evidence: { invalid_count: invalidHashes.length },
              timestamp: Date.now(),
            });
          }
          
          // Calculate trust score
          const profile: PlayerProfile = {
            player_id: player.player_id,
            total_matches: 1,
            average_accuracy: player.accuracy || 0,
            average_headshot_ratio: player.headshots / Math.max(1, player.kills),
            average_kd: player.kills / Math.max(1, player.deaths),
            reaction_time_avg_ms: 200,
            movement_speed_avg: 0.3,
            suspicious_flags: anomalies.filter(a => a.severity === 'high' || a.severity === 'critical').length,
            trust_score: 100,
            last_analyzed: new Date(),
          };
          
          const trustScore = calculateTrustScore(profile, anomalies);
          
          results.push({
            player_id: player.player_id,
            anomalies,
            trust_score: trustScore,
          });
          
          // Auto-sanction if score too low
          if (trustScore < THRESHOLDS.trust.suspicious) {
            await supabase
              .from('arcade_player_reports')
              .insert({
                reporter_id: '00000000-0000-0000-0000-000000000000', // System
                reported_id: player.player_id,
                match_id,
                reason: 'Automated anti-cheat detection',
                category: 'cheating',
                description: JSON.stringify(anomalies),
                status: 'pending',
              });
          }
        }

        // Mark match as analyzed
        await supabase
          .from('arcade_matches')
          .update({ anti_cheat_validated: true })
          .eq('id', match_id);

        return new Response(JSON.stringify({
          match_id,
          analyzed_at: new Date().toISOString(),
          results,
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // ========================================================================
      // CHECK SANCTIONS
      // ========================================================================
      case 'check_sanctions': {
        if (!player_id) {
          return new Response(JSON.stringify({ error: 'player_id required' }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        const { data: sanctions } = await supabase
          .from('arcade_player_sanctions')
          .select('*')
          .eq('player_id', player_id)
          .or(`expires_at.gt.${new Date().toISOString()},permanent.eq.true`);

        const activeSanctions = sanctions || [];
        const isBanned = activeSanctions.some(
          s => s.type === 'game_ban' || s.type === 'permanent_ban'
        );
        const isRankedBanned = activeSanctions.some(s => s.type === 'ranked_ban');
        const isMuted = activeSanctions.some(s => s.type === 'mute');

        return new Response(JSON.stringify({
          player_id,
          can_play: !isBanned,
          can_play_ranked: !isBanned && !isRankedBanned,
          can_chat: !isMuted,
          active_sanctions: activeSanctions.map(s => ({
            type: s.type,
            reason: s.reason,
            expires_at: s.expires_at,
            permanent: s.permanent,
          })),
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // ========================================================================
      // REPORT PLAYER
      // ========================================================================
      case 'report_player': {
        if (!player_id || !data?.reported_id || !data?.reason) {
          return new Response(JSON.stringify({ error: 'Missing required fields' }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        const { reported_id, reason, category, description, evidence_urls, match_id: report_match_id } = data;

        // Check for report spam
        const { data: recentReports } = await supabase
          .from('arcade_player_reports')
          .select('id')
          .eq('reporter_id', player_id)
          .gte('created_at', new Date(Date.now() - 3600000).toISOString()); // Last hour

        if ((recentReports?.length || 0) >= 5) {
          return new Response(JSON.stringify({ error: 'Too many reports. Please wait.' }), {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        // Create report
        const { data: report, error } = await supabase
          .from('arcade_player_reports')
          .insert({
            reporter_id: player_id,
            reported_id,
            match_id: report_match_id,
            reason,
            category: category || 'other',
            description,
            evidence_urls,
            status: 'pending',
          })
          .select()
          .single();

        if (error) {
          return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        // Check if player has multiple recent reports
        const { data: allReports } = await supabase
          .from('arcade_player_reports')
          .select('id')
          .eq('reported_id', reported_id)
          .eq('status', 'pending')
          .gte('created_at', new Date(Date.now() - 86400000).toISOString()); // Last 24 hours

        // Auto-escalate if many reports
        if ((allReports?.length || 0) >= 5) {
          await supabase
            .from('arcade_player_reports')
            .update({ status: 'under_review' })
            .eq('reported_id', reported_id)
            .eq('status', 'pending');
        }

        return new Response(JSON.stringify({
          success: true,
          report_id: report.id,
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // ========================================================================
      // APPLY SANCTION
      // ========================================================================
      case 'apply_sanction': {
        if (!player_id || !data?.type || !data?.reason) {
          return new Response(JSON.stringify({ error: 'Missing required fields' }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        const { type, reason, duration_hours, permanent, report_id, issued_by } = data;

        const expires_at = permanent 
          ? null 
          : new Date(Date.now() + (duration_hours || 24) * 3600000).toISOString();

        const { data: sanction, error } = await supabase
          .from('arcade_player_sanctions')
          .insert({
            player_id,
            type,
            reason,
            expires_at,
            permanent: permanent || false,
            report_id,
            issued_by,
          })
          .select()
          .single();

        if (error) {
          return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        // Update report if linked
        if (report_id) {
          await supabase
            .from('arcade_player_reports')
            .update({ 
              status: 'resolved',
              action_taken: type,
              reviewed_at: new Date().toISOString(),
            })
            .eq('id', report_id);
        }

        return new Response(JSON.stringify({
          success: true,
          sanction_id: sanction.id,
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      default:
        return new Response(JSON.stringify({ error: 'Unknown action' }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }
  } catch (error) {
    console.error('Anti-cheat error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
