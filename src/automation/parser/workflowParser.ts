// Workflow JSON Parser
// Extracts metadata from n8n workflow JSON files

import type { WorkflowBlueprint, WorkflowRegistryEntry, TriggerType } from '../types/automation.types';

// Detect trigger type from nodes
function detectTriggerType(nodes: WorkflowBlueprint['nodes']): TriggerType {
  for (const node of nodes) {
    const type = node.type.toLowerCase();
    
    if (type.includes('webhook')) return 'webhook';
    if (type.includes('chattrigger')) return 'chat';
    if (type.includes('schedule') || type.includes('cron')) return 'schedule';
    if (type.includes('errortrigger')) return 'event';
    if (type.includes('trigger')) return 'manual';
  }
  
  return 'manual';
}

// Extract required secrets/credentials from nodes
function extractRequiredSecrets(nodes: WorkflowBlueprint['nodes']): string[] {
  const secrets = new Set<string>();
  
  for (const node of nodes) {
    if (node.credentials) {
      Object.keys(node.credentials).forEach(key => {
        // Convert credential key to readable name
        const name = key
          .replace(/Api$/i, '')
          .replace(/([A-Z])/g, ' $1')
          .trim()
          .toUpperCase();
        secrets.add(name);
      });
    }
    
    // Check for API keys in parameters
    if (node.parameters) {
      const paramStr = JSON.stringify(node.parameters);
      if (paramStr.includes('api_key') || paramStr.includes('apiKey')) {
        const nodeType = node.type.split('.').pop() || node.name;
        secrets.add(`${nodeType.toUpperCase()}_API_KEY`);
      }
    }
  }
  
  return Array.from(secrets);
}

// Extract tags from workflow
function extractTags(workflow: WorkflowBlueprint): string[] {
  const tags: string[] = [];
  
  // Get explicit tags
  if (workflow.tags) {
    workflow.tags.forEach(tag => {
      if (typeof tag === 'string') {
        tags.push(tag);
      } else if (tag.name) {
        tags.push(tag.name);
      }
    });
  }
  
  // Infer tags from node types
  const nodeTypes = new Set<string>();
  for (const node of workflow.nodes) {
    const type = node.type.toLowerCase();
    
    if (type.includes('openai') || type.includes('langchain')) nodeTypes.add('AI');
    if (type.includes('youtube')) nodeTypes.add('YouTube');
    if (type.includes('shopify')) nodeTypes.add('Shopify');
    if (type.includes('email') || type.includes('gmail')) nodeTypes.add('Email');
    if (type.includes('airtable')) nodeTypes.add('Airtable');
    if (type.includes('linkedin')) nodeTypes.add('LinkedIn');
    if (type.includes('replicate')) nodeTypes.add('Replicate');
    if (type.includes('agent')) nodeTypes.add('Agent');
  }
  
  return [...tags, ...Array.from(nodeTypes)];
}

// Generate description from workflow
function generateDescription(workflow: WorkflowBlueprint): string {
  const nodeNames = workflow.nodes
    .filter(n => !n.type.includes('stickyNote'))
    .slice(0, 5)
    .map(n => n.name)
    .join(' → ');
  
  return `Automation: ${nodeNames}${workflow.nodes.length > 5 ? '...' : ''}`;
}

// Main parser function
export function parseWorkflowJson(json: string | WorkflowBlueprint): WorkflowRegistryEntry {
  const workflow: WorkflowBlueprint = typeof json === 'string' ? JSON.parse(json) : json;
  
  // Filter out sticky notes and comments
  const functionalNodes = workflow.nodes.filter(
    n => !n.type.includes('stickyNote') && !n.type.includes('noOp')
  );
  
  return {
    externalId: workflow.id || `workflow_${Date.now()}`,
    name: workflow.name || 'Untitled Workflow',
    description: generateDescription(workflow),
    triggerType: detectTriggerType(workflow.nodes),
    requiredSecrets: extractRequiredSecrets(workflow.nodes),
    nodeCount: functionalNodes.length,
    tags: extractTags(workflow),
    blueprint: workflow,
  };
}

// Parse multiple workflows
export function parseMultipleWorkflows(jsons: (string | WorkflowBlueprint)[]): WorkflowRegistryEntry[] {
  return jsons.map(json => parseWorkflowJson(json));
}

// Validate workflow structure
export function validateWorkflow(workflow: WorkflowBlueprint): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!workflow.nodes || !Array.isArray(workflow.nodes)) {
    errors.push('Workflow must have a nodes array');
  }
  
  if (workflow.nodes?.length === 0) {
    errors.push('Workflow has no nodes');
  }
  
  if (!workflow.name) {
    errors.push('Workflow must have a name');
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
}
