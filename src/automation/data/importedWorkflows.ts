// Pre-imported Workflow Blueprints
// These are parsed from the uploaded JSON files and stored as registry entries

import type { WorkflowRegistryEntry } from '../types/automation.types';

export const importedWorkflows: WorkflowRegistryEntry[] = [
  {
    externalId: 'dQC8kExvbCrovWf0',
    name: 'Dynamically Switch Between LLMs',
    description: 'Template for dynamically switching between multiple LLM models based on context',
    triggerType: 'chat',
    requiredSecrets: ['OPENAI_API_KEY', 'ANTHROPIC_API_KEY'],
    nodeCount: 8,
    tags: ['AI', 'LLM', 'Agent', 'Template'],
    blueprint: {
      id: 'dQC8kExvbCrovWf0',
      name: 'Dynamically switch between LLMs Template',
      nodes: [],
    },
  },
  {
    externalId: '3b1q6ZJTxeONrpUV',
    name: 'Error Alert and Summarizer (FloWatch)',
    description: 'Analyze and diagnose workflow errors via AI and send email alerts',
    triggerType: 'event',
    requiredSecrets: ['OPENAI_API_KEY', 'EMAIL_SMTP'],
    nodeCount: 12,
    tags: ['AI', 'Email', 'Error Handling', 'Diagnostics'],
    blueprint: {
      id: '3b1q6ZJTxeONrpUV',
      name: 'Error Alert and Summarizer',
      nodes: [],
    },
  },
  {
    externalId: 'horror-shorts-workflow',
    name: 'Horror Faceless Shorts Generator',
    description: 'Generate horror shorts with OpenAI TTS, Replicate video, and YouTube upload',
    triggerType: 'manual',
    requiredSecrets: ['OPENAI_API_KEY', 'REPLICATE_API_KEY', 'YOUTUBE_API_KEY'],
    nodeCount: 45,
    tags: ['AI', 'Video', 'YouTube', 'Content Creation'],
    blueprint: {
      id: 'horror-shorts-workflow',
      name: 'Horror Faceless Shorts with Replicate and OpenAI',
      nodes: [],
    },
  },
  {
    externalId: 'shopify-seo-workflow',
    name: 'Shopify SEO Content Creator',
    description: 'Automate Shopify SEO content creation with GPT-4o and Claude multi-agent system',
    triggerType: 'manual',
    requiredSecrets: ['OPENAI_API_KEY', 'ANTHROPIC_API_KEY', 'SHOPIFY_API_KEY', 'PERPLEXITY_API_KEY'],
    nodeCount: 85,
    tags: ['AI', 'Shopify', 'SEO', 'Multi-Agent', 'E-commerce'],
    blueprint: {
      id: 'shopify-seo-workflow',
      name: 'Automate Shopify SEO Content Creation with GPT-4o + Claude Multi-Agent System',
      nodes: [],
    },
  },
  {
    externalId: 'lead-gen-workflow',
    name: 'AI-Powered Lead Generation & Outreach',
    description: 'Automate lead generation and personalized outreach with Apollo, AI, and Instantly',
    triggerType: 'webhook',
    requiredSecrets: ['APOLLO_API_KEY', 'INSTANTLY_API_KEY', 'AIRTABLE_API_KEY', 'EMAILABLE_API_KEY'],
    nodeCount: 120,
    tags: ['AI', 'Lead Generation', 'Outreach', 'Sales', 'CRM'],
    blueprint: {
      id: 'lead-gen-workflow',
      name: 'Automate Lead Generation & Personalized Outreach',
      nodes: [],
    },
  },
  {
    externalId: 'flux-image-gen',
    name: 'Flux AI Image Generator',
    description: 'Generate images with various artistic styles using Flux AI',
    triggerType: 'manual',
    requiredSecrets: ['FLUX_API_KEY'],
    nodeCount: 18,
    tags: ['AI', 'Image Generation', 'Art', 'Creative'],
    blueprint: {
      id: 'flux-image-gen',
      name: 'Flux AI Image Generator',
      nodes: [],
    },
  },
  {
    externalId: 'product-video-gen',
    name: 'AI Product Video Generator',
    description: 'Generate product videos with Foreplay, Gemini, and Sora 2',
    triggerType: 'manual',
    requiredSecrets: ['FOREPLAY_API_KEY', 'GEMINI_API_KEY', 'KIE_API_KEY', 'GOOGLE_DRIVE_API'],
    nodeCount: 22,
    tags: ['AI', 'Video', 'Product', 'Marketing'],
    blueprint: {
      id: 'product-video-gen',
      name: 'AI-Powered Product Video Generator',
      nodes: [],
    },
  },
  {
    externalId: 'faceless-youtube-gen',
    name: 'Faceless YouTube Video Generator',
    description: 'Generate faceless YouTube videos with Leonardo AI and Creatomate',
    triggerType: 'manual',
    requiredSecrets: ['LEONARDO_API_KEY', 'CREATOMATE_API_KEY', 'OPENAI_API_KEY', 'YOUTUBE_API_KEY'],
    nodeCount: 35,
    tags: ['AI', 'YouTube', 'Video', 'Content Creation', 'Automation'],
    blueprint: {
      id: 'faceless-youtube-gen',
      name: 'GenerateFacelessYoutubeVideo',
      nodes: [],
    },
  },
];

// Get workflow by ID
export function getWorkflowById(id: string): WorkflowRegistryEntry | undefined {
  return importedWorkflows.find(w => w.externalId === id);
}

// Get workflows by tag
export function getWorkflowsByTag(tag: string): WorkflowRegistryEntry[] {
  return importedWorkflows.filter(w => 
    w.tags.some(t => t.toLowerCase() === tag.toLowerCase())
  );
}

// Get workflows by trigger type
export function getWorkflowsByTrigger(trigger: string): WorkflowRegistryEntry[] {
  return importedWorkflows.filter(w => w.triggerType === trigger);
}
