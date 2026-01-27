/**
 * THE LUCY LOUNGE — SHARED ACCESS CONTROL MODULE
 * 
 * Provides consistent access control and telemetry logging
 * for all edge functions.
 */

import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

// =============================================================================
// TYPES
// =============================================================================

export type UserTier = 'free' | 'pro' | 'power' | 'enterprise';

export interface AccessCheckResult {
  allowed: boolean;
  reason: string;
  dailyRemaining: number;
  tier: UserTier;
  upgradeAvailable: boolean;
}

export interface TelemetryEvent {
  category: 'ai_routing' | 'edge_function' | 'rls_event' | 'auth_event' | 'error' | 'performance' | 'security' | 'billing' | 'admin';
  eventName: string;
  severity?: 'debug' | 'info' | 'warn' | 'error' | 'critical';
  userId?: string;
  functionName?: string;
  durationMs?: number;
  statusCode?: number;
  message?: string;
  details?: Record<string, any>;
  stackTrace?: string;
}

export interface UsageEvent {
  userId: string;
  toolId: string;
  eventType: 'request' | 'success' | 'failure' | 'limit_hit' | 'upgrade_prompt';
  model?: string;
  tokensInput?: number;
  tokensOutput?: number;
  latencyMs?: number;
  cost?: number;
  errorCode?: string;
  errorMessage?: string;
  metadata?: Record<string, any>;
}

// =============================================================================
// SUPABASE CLIENT HELPER
// =============================================================================

export function getSupabaseClient(): SupabaseClient | null {
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  
  if (!supabaseUrl || !supabaseKey) {
    console.error('[accessControl] Missing Supabase credentials');
    return null;
  }
  
  return createClient(supabaseUrl, supabaseKey);
}

// =============================================================================
// ACCESS CONTROL
// =============================================================================

/**
 * Check if a user can access a specific tool.
 * FAILS CLOSED - denies access on any error for security.
 */
export async function checkToolAccess(
  supabase: SupabaseClient,
  userId: string,
  toolId: string,
  model?: string
): Promise<AccessCheckResult> {
  try {
    const { data, error } = await supabase.rpc('check_tool_access', {
      p_user_id: userId,
      p_tool_id: toolId,
      p_model: model || null,
    });

    if (error) {
      console.error('[accessControl] Access check error:', error);
      await logTelemetry(supabase, {
        category: 'error',
        eventName: 'access_check_failed',
        severity: 'error',
        userId,
        message: error.message,
        details: { toolId, model },
      });
      
      // FAIL CLOSED
      return {
        allowed: false,
        reason: 'Access check temporarily unavailable',
        dailyRemaining: 0,
        tier: 'free',
        upgradeAvailable: true,
      };
    }

    if (data && data.length > 0) {
      return {
        allowed: data[0].allowed,
        reason: data[0].reason,
        dailyRemaining: data[0].daily_remaining,
        tier: data[0].tier as UserTier,
        upgradeAvailable: data[0].upgrade_available,
      };
    }

    // No data - default to free tier
    return {
      allowed: true,
      reason: 'Default access',
      dailyRemaining: 10,
      tier: 'free',
      upgradeAvailable: true,
    };
  } catch (e) {
    console.error('[accessControl] Access check exception:', e);
    
    // FAIL CLOSED
    return {
      allowed: false,
      reason: 'Access check failed',
      dailyRemaining: 0,
      tier: 'free',
      upgradeAvailable: true,
    };
  }
}

/**
 * Require authentication and return user ID.
 * Returns null if not authenticated.
 */
export async function requireAuth(
  supabase: SupabaseClient,
  authHeader: string | null
): Promise<string | null> {
  if (!authHeader) {
    return null;
  }

  try {
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      return null;
    }
    
    return user.id;
  } catch (e) {
    console.error('[accessControl] Auth check failed:', e);
    return null;
  }
}

// =============================================================================
// TELEMETRY
// =============================================================================

/**
 * Log a telemetry event to the platform_telemetry table.
 */
export async function logTelemetry(
  supabase: SupabaseClient,
  event: TelemetryEvent
): Promise<void> {
  try {
    await supabase.rpc('log_platform_event', {
      p_category: event.category,
      p_event_name: event.eventName,
      p_severity: event.severity || 'info',
      p_user_id: event.userId || null,
      p_function_name: event.functionName || null,
      p_duration_ms: event.durationMs || null,
      p_status_code: event.statusCode || null,
      p_message: event.message || null,
      p_details: event.details || {},
      p_stack_trace: event.stackTrace || null,
    });
  } catch (e) {
    console.error('[accessControl] Failed to log telemetry:', e);
  }
}

/**
 * Log a usage event to the usage_events table.
 */
export async function logUsage(
  supabase: SupabaseClient,
  event: UsageEvent
): Promise<void> {
  try {
    await supabase.rpc('record_tool_usage', {
      p_user_id: event.userId,
      p_tool_id: event.toolId,
      p_event_type: event.eventType,
      p_model: event.model || null,
      p_tokens_input: event.tokensInput || 0,
      p_tokens_output: event.tokensOutput || 0,
      p_latency_ms: event.latencyMs || 0,
      p_cost: event.cost || 0,
      p_error_code: event.errorCode || null,
      p_error_message: event.errorMessage || null,
      p_metadata: event.metadata || {},
    });
  } catch (e) {
    console.error('[accessControl] Failed to log usage:', e);
  }
}

// =============================================================================
// RESPONSE HELPERS
// =============================================================================

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

/**
 * Create a JSON response with CORS headers.
 */
export function jsonResponse(data: any, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

/**
 * Create an error response.
 */
export function errorResponse(message: string, status = 500, details?: any): Response {
  return jsonResponse({ error: message, details }, status);
}

/**
 * Create an access denied response.
 */
export function accessDeniedResponse(reason: string, upgradeAvailable = true): Response {
  return jsonResponse({
    error: 'Access denied',
    reason,
    upgradeAvailable,
    upgradeUrl: '/upgrade',
  }, 403);
}

/**
 * Handle CORS preflight requests.
 */
export function handleCors(req: Request): Response | null {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  return null;
}

// =============================================================================
// EDGE FUNCTION WRAPPER
// =============================================================================

interface EdgeFunctionOptions {
  toolId: string;
  requireAuth?: boolean;
  functionName: string;
}

type EdgeFunctionHandler = (
  req: Request,
  supabase: SupabaseClient,
  userId: string | null,
  accessResult: AccessCheckResult | null
) => Promise<Response>;

/**
 * Wrap an edge function with access control and telemetry.
 */
export function withAccessControl(
  options: EdgeFunctionOptions,
  handler: EdgeFunctionHandler
): (req: Request) => Promise<Response> {
  return async (req: Request): Promise<Response> => {
    const startTime = Date.now();
    
    // Handle CORS
    const corsResponse = handleCors(req);
    if (corsResponse) return corsResponse;

    // Get Supabase client
    const supabase = getSupabaseClient();
    if (!supabase) {
      return errorResponse('Service temporarily unavailable', 503);
    }

    let userId: string | null = null;
    let accessResult: AccessCheckResult | null = null;

    try {
      // Check authentication
      const authHeader = req.headers.get('authorization');
      userId = await requireAuth(supabase, authHeader);

      if (options.requireAuth && !userId) {
        await logTelemetry(supabase, {
          category: 'auth_event',
          eventName: 'auth_required',
          severity: 'warn',
          functionName: options.functionName,
        });
        return errorResponse('Authentication required', 401);
      }

      // Check access if user is authenticated
      if (userId) {
        accessResult = await checkToolAccess(supabase, userId, options.toolId);
        
        if (!accessResult.allowed) {
          await logTelemetry(supabase, {
            category: 'security',
            eventName: 'access_denied',
            severity: 'info',
            userId,
            functionName: options.functionName,
            details: { toolId: options.toolId, reason: accessResult.reason },
          });
          
          await logUsage(supabase, {
            userId,
            toolId: options.toolId,
            eventType: 'limit_hit',
          });
          
          return accessDeniedResponse(accessResult.reason, accessResult.upgradeAvailable);
        }

        // Log the request
        await logUsage(supabase, {
          userId,
          toolId: options.toolId,
          eventType: 'request',
        });
      }

      // Execute the handler
      const response = await handler(req, supabase, userId, accessResult);
      
      // Log success telemetry
      const durationMs = Date.now() - startTime;
      await logTelemetry(supabase, {
        category: 'edge_function',
        eventName: 'function_completed',
        severity: 'info',
        userId: userId || undefined,
        functionName: options.functionName,
        durationMs,
        statusCode: response.status,
      });

      // Log success usage
      if (userId && response.ok) {
        await logUsage(supabase, {
          userId,
          toolId: options.toolId,
          eventType: 'success',
          latencyMs: durationMs,
        });
      }

      return response;
    } catch (error) {
      const durationMs = Date.now() - startTime;
      
      // Log error telemetry
      await logTelemetry(supabase, {
        category: 'error',
        eventName: 'function_error',
        severity: 'error',
        userId: userId || undefined,
        functionName: options.functionName,
        durationMs,
        message: error instanceof Error ? error.message : 'Unknown error',
        stackTrace: error instanceof Error ? error.stack : undefined,
      });

      // Log failure usage
      if (userId) {
        await logUsage(supabase, {
          userId,
          toolId: options.toolId,
          eventType: 'failure',
          latencyMs: durationMs,
          errorMessage: error instanceof Error ? error.message : 'Unknown error',
        });
      }

      return errorResponse(
        'An error occurred processing your request',
        500,
        { errorId: `err_${Date.now()}` }
      );
    }
  };
}
