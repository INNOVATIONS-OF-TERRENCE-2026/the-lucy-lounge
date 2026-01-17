// Lucy Automation Studio Type Definitions

export type WorkflowStatus = 'idle' | 'running' | 'failed' | 'healed' | 'complete' | 'canceled';
export type TriggerType = 'manual' | 'chat' | 'schedule' | 'webhook' | 'event';

export interface WorkflowNode {
  id: string;
  name: string;
  type: string;
  position?: [number, number];
  parameters?: Record<string, unknown>;
  credentials?: Record<string, { id: string; name: string }>;
}

export interface WorkflowConnection {
  node: string;
  type: string;
  index: number;
}

export interface WorkflowBlueprint {
  id?: string;
  meta?: {
    instanceId?: string;
    templateCredsSetupCompleted?: boolean;
  };
  name: string;
  tags?: Array<{ id?: string; name: string }>;
  nodes: WorkflowNode[];
  connections?: Record<string, { main?: WorkflowConnection[][] }>;
  settings?: Record<string, unknown>;
  pinData?: Record<string, unknown>;
}

export interface RegisteredWorkflow {
  id: string;
  user_id: string;
  external_id?: string;
  name: string;
  description?: string;
  trigger_type: TriggerType;
  required_secrets: string[];
  node_count: number;
  workflow_json: WorkflowBlueprint;
  tags: string[];
  is_active: boolean;
  last_run_at?: string;
  run_count: number;
  success_count: number;
  failure_count: number;
  created_at: string;
  updated_at: string;
}

export interface WorkflowRun {
  id: string;
  workflow_id: string;
  user_id: string;
  status: WorkflowStatus;
  trigger_source: string;
  trigger_payload?: Record<string, unknown>;
  started_at: string;
  completed_at?: string;
  duration_ms?: number;
  result_data?: Record<string, unknown>;
  error_message?: string;
  error_node?: string;
  retry_count: number;
  parent_run_id?: string;
  created_at: string;
}

export interface AgentDecision {
  id: string;
  run_id: string;
  user_id: string;
  decision_type: string;
  model_used?: string;
  input_context?: Record<string, unknown>;
  decision_output?: Record<string, unknown>;
  confidence_score?: number;
  reasoning?: string;
  execution_time_ms?: number;
  created_at: string;
}

export interface HealingEvent {
  id: string;
  run_id: string;
  user_id: string;
  healing_type: string;
  original_error: string;
  diagnosis?: string;
  remedy_applied?: string;
  success: boolean;
  retry_attempt: number;
  healed_at: string;
  created_at: string;
}

// Parsed workflow info for registry
export interface WorkflowRegistryEntry {
  externalId: string;
  name: string;
  description: string;
  triggerType: TriggerType;
  requiredSecrets: string[];
  nodeCount: number;
  tags: string[];
  blueprint: WorkflowBlueprint;
}
