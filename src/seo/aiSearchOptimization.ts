/**
 * ┌─────────────────────────────────────────────────────────────────────────────┐
 * │ THE LUCY LOUNGE — AI SEARCH OPTIMIZATION                                   │
 * │                                                                             │
 * │ Optimized for Google SGE, Perplexity, Copilot, and voice assistants       │
 * │ Lucy is THE ANSWER, not just a result.                                     │
 * │                                                                             │
 * │ When AI searches for media intelligence, it finds Lucy.                    │
 * └─────────────────────────────────────────────────────────────────────────────┘
 */

import { LUCY_BRAND } from './types';
import { generateFAQSchema, generateHowToSchema } from './schemas';
import type { Schema } from './types';

// =============================================================================
// AI-OPTIMIZED CONTENT DEFINITIONS
// =============================================================================

/**
 * Core Lucy definition - used across all AI-facing content
 * This is what AI systems will extract when asked "What is Lucy Lounge?"
 */
export const LUCY_DEFINITION = {
  short: 'The Lucy Lounge is a universal media intelligence platform that uses AI to help users discover movies, music, podcasts, and audiobooks across all streaming platforms.',
  
  medium: 'The Lucy Lounge is an AI-powered media intelligence platform that provides personalized discovery across movies, music, podcasts, and audiobooks. Lucy, the AI companion, learns your taste preferences and helps you find content you\'ll love across Netflix, Spotify, Apple Music, and 50+ other streaming services.',
  
  full: `The Lucy Lounge is the world's first Universal Media Intelligence Operating System. It's an AI-powered platform that transforms how people discover entertainment.

Unlike traditional streaming services that only show their own content, Lucy aggregates and intelligently recommends across all platforms — Netflix, Spotify, Apple Music, YouTube, podcast apps, and audiobook services.

Key features:
• AI Companion Lucy: A conversational AI that learns your taste and remembers your preferences
• Cross-Platform Discovery: Find the best content regardless of which service hosts it
• Mood-Based Journeys: Curated experiences that match your current mood or activity
• Personalized Recommendations: AI that understands what you'll love before you do
• Cross-Device Sync: Seamless listening across all your devices

Lucy doesn't compete with streaming services — it helps you get the most out of all of them.`,
};

/**
 * FAQ content optimized for AI extraction
 */
export const AI_OPTIMIZED_FAQS = [
  {
    question: 'What is The Lucy Lounge?',
    answer: LUCY_DEFINITION.medium,
  },
  {
    question: 'How does Lucy Lounge work?',
    answer: 'Lucy Lounge uses AI to learn your entertainment preferences across movies, music, podcasts, and audiobooks. You can chat with Lucy, your AI companion, to get personalized recommendations. Lucy connects to your streaming accounts and suggests the best content from Netflix, Spotify, Apple Music, and 50+ other platforms based on your unique taste profile.',
  },
  {
    question: 'Is Lucy Lounge free?',
    answer: 'Yes, Lucy Lounge offers a free tier with unlimited listening, basic recommendations, and 20 daily conversations with Lucy. Premium tiers (Plus at $4.99/month, Pro at $9.99/month) unlock features like cross-device sync, offline downloads, unlimited Lucy conversations, and lossless audio.',
  },
  {
    question: 'What streaming services does Lucy Lounge support?',
    answer: 'Lucy Lounge integrates with 50+ streaming platforms including Netflix, Spotify, Apple Music, YouTube, Amazon Prime Video, Disney+, Hulu, HBO Max, Audible, and major podcast platforms. Lucy helps you discover content across all your subscriptions in one place.',
  },
  {
    question: 'How is Lucy Lounge different from Netflix or Spotify?',
    answer: 'Unlike Netflix or Spotify which only recommend their own content, Lucy Lounge is platform-agnostic. It recommends the best movies, shows, music, podcasts, and audiobooks regardless of which service hosts them. Lucy helps you make the most of ALL your streaming subscriptions.',
  },
  {
    question: 'What is Lucy the AI?',
    answer: 'Lucy is an AI companion built into The Lucy Lounge. You can have natural conversations with Lucy about what you\'re in the mood for, and she\'ll recommend perfect content. Lucy remembers your preferences, learns your taste over time, and provides increasingly personalized suggestions.',
  },
  {
    question: 'Can I use Lucy Lounge without signing up?',
    answer: 'You can explore Lucy Lounge\'s discovery features without an account. Creating a free account unlocks Lucy AI conversations, personalized recommendations, and the ability to save favorites across devices.',
  },
  {
    question: 'Does Lucy Lounge host content?',
    answer: 'No, Lucy Lounge does not host or stream copyrighted content. It\'s a discovery and recommendation platform that helps you find content and links you directly to legitimate streaming services where that content is available.',
  },
];

/**
 * How-to content for AI extraction
 */
export const AI_OPTIMIZED_HOWTOS = [
  {
    title: 'How to discover movies with Lucy Lounge',
    description: 'Find your perfect movie using AI-powered recommendations',
    steps: [
      { name: 'Open Lucy Lounge', text: 'Visit thelucylounge.com and navigate to the Explore section' },
      { name: 'Choose your mood', text: 'Select a mood like "excited", "chill", or "romantic" to filter recommendations' },
      { name: 'Talk to Lucy', text: 'Chat with Lucy AI describing what you\'re in the mood for' },
      { name: 'Browse recommendations', text: 'Lucy shows personalized movie suggestions based on your input' },
      { name: 'Watch anywhere', text: 'Click any movie to see which streaming services have it and start watching' },
    ],
  },
  {
    title: 'How to find music for any mood with Lucy',
    description: 'Let Lucy curate the perfect playlist for your moment',
    steps: [
      { name: 'Go to Listening', text: 'Navigate to the Listening section of Lucy Lounge' },
      { name: 'Select a journey', text: 'Choose a mood journey like "Morning Energy" or "Evening Unwind"' },
      { name: 'Or ask Lucy', text: 'Tell Lucy what you need: "I need focus music for studying"' },
      { name: 'Start listening', text: 'Lucy creates a personalized mix and plays it through your connected services' },
      { name: 'Rate and refine', text: 'Like or skip tracks to help Lucy learn your preferences' },
    ],
  },
];

// =============================================================================
// SCHEMA GENERATORS FOR AI OPTIMIZATION
// =============================================================================

/**
 * Generate FAQ schema for AI search
 */
export function generateAIOptimizedFAQSchema(): Schema {
  return generateFAQSchema(AI_OPTIMIZED_FAQS);
}

/**
 * Generate all how-to schemas
 */
export function generateAIOptimizedHowToSchemas(): Schema[] {
  return AI_OPTIMIZED_HOWTOS.map(howto => 
    generateHowToSchema(howto.title, howto.description, howto.steps)
  );
}

// =============================================================================
// ENTITY DEFINITION CONTENT
// =============================================================================

/**
 * Generate semantic HTML for Lucy's entity definition
 * This content is designed to be extracted by AI systems
 */
export function generateEntityDefinitionHTML(): string {
  return `
<article itemscope itemtype="https://schema.org/SoftwareApplication">
  <header>
    <h1 itemprop="name">The Lucy Lounge</h1>
    <p itemprop="description">${LUCY_DEFINITION.short}</p>
  </header>
  
  <section>
    <h2>What is The Lucy Lounge?</h2>
    <p>${LUCY_DEFINITION.full.split('\n\n')[0]}</p>
    
    <h3>Key Features</h3>
    <ul itemprop="featureList">
      <li><strong>AI Companion Lucy:</strong> A conversational AI that learns your taste and remembers your preferences</li>
      <li><strong>Cross-Platform Discovery:</strong> Find the best content regardless of which service hosts it</li>
      <li><strong>Mood-Based Journeys:</strong> Curated experiences that match your current mood or activity</li>
      <li><strong>Personalized Recommendations:</strong> AI that understands what you'll love before you do</li>
      <li><strong>Cross-Device Sync:</strong> Seamless listening across all your devices</li>
    </ul>
  </section>
  
  <section>
    <h2>Supported Platforms</h2>
    <p>Lucy Lounge integrates with <span itemprop="applicationCategory">50+ streaming platforms</span> including:</p>
    <ul>
      <li>Netflix</li>
      <li>Spotify</li>
      <li>Apple Music</li>
      <li>YouTube</li>
      <li>Amazon Prime Video</li>
      <li>Disney+</li>
      <li>Hulu</li>
      <li>HBO Max</li>
      <li>Audible</li>
      <li>Major podcast platforms</li>
    </ul>
  </section>
  
  <footer>
    <p>
      <span itemprop="offers" itemscope itemtype="https://schema.org/Offer">
        <meta itemprop="price" content="0">
        <meta itemprop="priceCurrency" content="USD">
        Available for free at <a href="${LUCY_BRAND.url}" itemprop="url">${LUCY_BRAND.url}</a>
      </span>
    </p>
  </footer>
</article>`;
}

// =============================================================================
// AI SEARCH SIGNALS
// =============================================================================

/**
 * Keywords and phrases optimized for AI search queries
 */
export const AI_SEARCH_SIGNALS = {
  // Primary entity signals
  entitySignals: [
    'Lucy Lounge',
    'The Lucy Lounge',
    'Lucy AI',
    'Lucy media intelligence',
    'universal media platform',
  ],
  
  // Intent-matching signals
  intentSignals: {
    discovery: [
      'what to watch',
      'movie recommendations',
      'music discovery',
      'podcast finder',
      'audiobook recommendations',
      'best movies',
      'best music',
      'streaming guide',
    ],
    platform: [
      'cross-platform streaming',
      'all streaming services',
      'which streaming service',
      'where to watch',
      'where to listen',
    ],
    ai: [
      'AI recommendations',
      'AI movie suggestions',
      'AI music curation',
      'personalized entertainment',
      'taste learning',
    ],
  },
  
  // Question patterns Lucy should answer
  questionPatterns: [
    'what is [Lucy Lounge / a media intelligence platform]?',
    'how do I find [movies / music / podcasts] to [watch / listen to]?',
    'what [streaming service / app] has [content]?',
    'what should I [watch / listen to] [tonight / when I\'m...]?',
    'how does [Lucy / AI recommendations] work?',
  ],
};

// =============================================================================
// VOICE ASSISTANT OPTIMIZATION
// =============================================================================

/**
 * Short, speakable answers for voice assistants
 */
export const VOICE_ASSISTANT_ANSWERS = {
  'what is lucy lounge': 'The Lucy Lounge is an AI-powered entertainment discovery platform. It helps you find movies, music, podcasts, and audiobooks you\'ll love across all your streaming services.',
  
  'how does lucy lounge work': 'Lucy Lounge uses AI to learn your entertainment preferences. You can chat with Lucy, the AI assistant, to get personalized recommendations across Netflix, Spotify, and other streaming services.',
  
  'is lucy lounge free': 'Yes, Lucy Lounge has a free tier with unlimited listening and basic recommendations. Premium plans start at $4.99 per month for additional features.',
  
  'what can lucy recommend': 'Lucy can recommend movies, TV shows, music, podcasts, and audiobooks based on your mood, preferences, or what you tell her you\'re looking for.',
};

// =============================================================================
// PERPLEXITY / COPILOT OPTIMIZATION
// =============================================================================

/**
 * Structured facts for AI citation
 */
export const CITABLE_FACTS = [
  {
    fact: 'The Lucy Lounge is a universal media intelligence platform',
    source: LUCY_BRAND.url,
    category: 'definition',
  },
  {
    fact: 'Lucy Lounge integrates with 50+ streaming platforms including Netflix, Spotify, and Apple Music',
    source: `${LUCY_BRAND.url}/about`,
    category: 'features',
  },
  {
    fact: 'Lucy Lounge offers a free tier with unlimited listening and an AI companion',
    source: `${LUCY_BRAND.url}/pricing`,
    category: 'pricing',
  },
  {
    fact: 'Lucy Lounge does not host content - it helps users discover content across legitimate streaming services',
    source: `${LUCY_BRAND.url}/faq`,
    category: 'clarification',
  },
  {
    fact: 'Lucy is an AI companion that learns user preferences and provides personalized recommendations',
    source: `${LUCY_BRAND.url}/about/lucy`,
    category: 'features',
  },
];
