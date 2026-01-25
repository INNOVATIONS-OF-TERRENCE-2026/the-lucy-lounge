# AI STACK SPECIFICATION

> **Complete specification for The Lucy Lounge multi-model AI system.**
> **All AI execution is server-side via Supabase Edge Functions.**

---

## 🧠 ARCHITECTURE OVERVIEW

```
┌─────────────────────────────────────────────────────────────────────┐
│                         CLIENT (React)                               │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────────┐  │
│  │  LucyChat   │  │MediaControls│  │   Agent Orchestrator        │  │
│  └──────┬──────┘  └──────┬──────┘  └──────────────┬──────────────┘  │
│         │                │                         │                 │
│         └────────────────┼─────────────────────────┘                 │
│                          │                                           │
│                   ┌──────▼──────┐                                    │
│                   │  LLM Router │                                    │
│                   └──────┬──────┘                                    │
└──────────────────────────┼───────────────────────────────────────────┘
                           │
                    Supabase Edge Functions
                           │
┌──────────────────────────┼───────────────────────────────────────────┐
│                          ▼                                           │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │                    AI ROUTER                                  │   │
│  │  Intent Detection → Model Selection → Tool Orchestration      │   │
│  └──────┬───────────────────┬───────────────────┬───────────────┘   │
│         │                   │                   │                    │
│  ┌──────▼──────┐    ┌───────▼───────┐   ┌──────▼──────┐             │
│  │   ai-chat   │    │ ai-embeddings │   │  ai-image   │             │
│  │ ┌─────────┐ │    │ ┌───────────┐ │   │ ┌─────────┐ │             │
│  │ │Qwen 72B │ │    │ │BGE-large  │ │   │ │  SDXL   │ │             │
│  │ │Llama 70B│ │    │ │MiniLM-L6  │ │   │ │ DALL-E  │ │             │
│  │ │DeepSeek │ │    │ └───────────┘ │   │ └─────────┘ │             │
│  │ │Gemini   │ │    └───────────────┘   └─────────────┘             │
│  │ └─────────┘ │                                                     │
│  └─────────────┘    ┌───────────────┐   ┌─────────────┐             │
│                     │  ai-whisper   │   │   ai-tts    │             │
│                     │ ┌───────────┐ │   │ ┌─────────┐ │             │
│                     │ │ Whisper-1 │ │   │ │ElevenLab│ │             │
│                     │ └───────────┘ │   │ │OpenAI   │ │             │
│                     └───────────────┘   │ └─────────┘ │             │
│                                         └─────────────┘             │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 📦 MODEL INVENTORY

### Text / Reasoning Models

| Model | Provider | Use Case | Latency | Cost |
|-------|----------|----------|---------|------|
| Qwen2.5-72B-Instruct | HuggingFace | Complex reasoning | ~3000ms | Medium |
| Llama-3.1-70B-Instruct | HuggingFace | General purpose | ~2500ms | Medium |
| DeepSeek-R1 | DeepSeek | Chain-of-thought | ~5000ms | High |
| Gemini 2.5 Flash | Lovable | Fast responses | ~800ms | Low |
| Gemini 2.5 Pro | Lovable | Complex tasks | ~1500ms | Medium |
| GPT-5 Mini | Lovable | Balanced | ~1200ms | Medium |

### Embedding Models

| Model | Provider | Dimensions | Use Case |
|-------|----------|------------|----------|
| BGE-large-en-v1.5 | HuggingFace | 1024 | Semantic search (primary) |
| e5-large-v2 | HuggingFace | 1024 | Semantic search (fallback) |
| all-MiniLM-L6-v2 | HuggingFace | 384 | Fast embedding (fallback) |

### Speech Models

| Model | Provider | Use Case |
|-------|----------|----------|
| Whisper-1 | OpenAI (via Lovable) | Speech-to-text |
| ElevenLabs v2 | ElevenLabs | Text-to-speech (primary) |
| OpenAI TTS-1 | OpenAI (via Lovable) | Text-to-speech (fallback) |

### Image Models

| Model | Provider | Use Case |
|-------|----------|----------|
| SDXL 1.0 | HuggingFace | Image generation (primary) |
| SD 1.5 | HuggingFace | Image generation (fallback) |
| DALL-E 3 | OpenAI (via Lovable) | Image generation (fallback) |

---

## 🔀 ROUTING LOGIC

### Complexity Detection

The LLM Router analyzes user messages to determine complexity:

```typescript
type TaskComplexity = 'simple' | 'moderate' | 'complex' | 'reasoning';

// Pattern matching for complexity
const COMPLEXITY_PATTERNS = {
  reasoning: [
    /prove|derive|deduce|logic|theorem/i,
    /step.?by.?step|chain.?of.?thought/i,
  ],
  complex: [
    /analyze|synthesize|evaluate|research/i,
    /code|program|implement.*system/i,
  ],
  moderate: [
    /explain|describe|summarize/i,
    /write|draft.*email|letter/i,
  ],
  simple: [
    /^(hi|hello|hey)/i,
    /\?$/,  // Simple questions
  ],
};
```

### Model Selection

| Complexity | Primary Model | Fallback |
|------------|---------------|----------|
| reasoning | DeepSeek-R1 | Gemini Pro |
| complex | Gemini Pro | Qwen 72B |
| moderate | GPT-5 Mini | Gemini Flash |
| simple | Gemini Flash | GPT-5 Mini |

---

## 🤖 AGENT ORCHESTRATOR

### Agent Modes

| Mode | Triggers | Tools Used |
|------|----------|------------|
| chat | Default | None or memory_search |
| music | "play", "spotify", "playlist" | spotify_control |
| vision | "image", "generate", "picture" | image_gen |
| dev | "code", "debug", "implement" | code_exec |
| research | "search", "find", "latest" | web_search, browser_fetch |
| memory | "remember", "recall", "last time" | memory_search, memory_store |
| creative | "write", "story", "poem" | None (direct LLM) |
| document | "pdf", "export", "document" | document_gen |

### Tool Registry

```typescript
const TOOLS = [
  {
    name: 'web_search',
    description: 'Search the web for current information',
    edgeFunction: 'web-search',
  },
  {
    name: 'browser_fetch',
    description: 'Fetch and parse a URL',
    edgeFunction: 'browser-fetch',
  },
  {
    name: 'code_exec',
    description: 'Execute JavaScript in sandbox',
    edgeFunction: 'code-executor',
  },
  {
    name: 'image_gen',
    description: 'Generate images from prompts',
    edgeFunction: 'ai-image',
  },
  {
    name: 'memory_search',
    description: 'Search user memories',
    edgeFunction: 'memory-search',
  },
  {
    name: 'memory_store',
    description: 'Store important information',
    edgeFunction: 'memory-save',
  },
  {
    name: 'tts',
    description: 'Convert text to speech',
    edgeFunction: 'ai-tts',
  },
  {
    name: 'document_gen',
    description: 'Generate PDF documents',
    edgeFunction: 'pdf-generator',
  },
];
```

---

## 💾 MEMORY SYSTEM

### Memory Types

| Type | TTL | Importance | Use Case |
|------|-----|------------|----------|
| conversation | 7 days | Decays | Recent chat context |
| preference | Forever | 1.0 | User settings |
| fact | 30 days | 0.8 | User-provided info |
| context | 1 day | Decays | Session context |
| instruction | Forever | 1.0 | User rules |

### Semantic Search

Memory search uses pgvector for cosine similarity:

```sql
-- Example: Search memories by embedding similarity
SELECT 
  id,
  content,
  memory_type,
  importance_score,
  1 - (embedding <=> $query_embedding) as similarity
FROM user_memories
WHERE user_id = $user_id
  AND importance_score > 0.1
ORDER BY embedding <=> $query_embedding
LIMIT 5;
```

### Memory Decay

Memories decay over time to prevent context overflow:

```typescript
// Daily decay (run via cron)
newImportance = currentImportance * (1 - decayRate);

// If importance < 0.1, memory can be pruned
```

---

## 🔊 SPEECH PIPELINE

### Speech-to-Text (Whisper)

```
User speaks → MediaRecorder → WebM blob → Base64 → Edge Function → Whisper API → Text
```

**Supported formats:** WebM, MP3, WAV, OGG, M4A

### Text-to-Speech (ElevenLabs/OpenAI)

```
Text → Edge Function → TTS API → Base64 MP3 → AudioContext (gesture-gated) → Speaker
```

**Voice options:**
- `lucy` - Warm, professional (ElevenLabs Rachel)
- `aria` - Expressive (ElevenLabs Aria)
- `nova` - Friendly (OpenAI Nova)
- `alloy` - Neutral (OpenAI Alloy)

---

## 🖼️ IMAGE PIPELINE

### Generation Flow

```
Prompt → Content Safety → Style Enhancement → SDXL/DALL-E → Base64 PNG → Display
```

**Style presets:**
- `photorealistic` - 8K, detailed, professional
- `artistic` - Painted, vibrant
- `anime` - Cel-shaded, stylized
- `cinematic` - Dramatic lighting
- `minimal` - Clean, simple

**Size options:**
- `square` - 1024x1024
- `portrait` - 768x1024
- `landscape` - 1024x768
- `wide` - 1280x720

---

## 🔐 SECURITY

### API Key Management

All API keys are stored in Supabase Edge Function secrets:

| Key | Purpose |
|-----|---------|
| `HF_TOKEN` | HuggingFace Inference API |
| `LOVABLE_API_KEY` | Lovable AI Gateway |
| `ELEVENLABS_API_KEY` | ElevenLabs TTS |
| `SUPABASE_SERVICE_ROLE_KEY` | Database access |

### Privacy Rules

1. **Never reveal** model names, API keys, or providers to users
2. **Never log** user credentials or sensitive data
3. **Always sanitize** error messages before returning to client
4. **Rate limit** all AI endpoints

### Content Safety

Image generation includes basic content filtering:

```typescript
const UNSAFE_PATTERNS = [
  /nude|naked|nsfw|explicit/i,
  /child|minor.*sexy|erotic/i,
  /violence|gore|blood/i,
];

if (UNSAFE_PATTERNS.some(p => p.test(prompt))) {
  return { error: 'Content guidelines violation' };
}
```

---

## 📊 MONITORING

### Key Metrics

| Metric | Target |
|--------|--------|
| ai-chat p95 latency | < 3000ms |
| ai-embeddings p95 latency | < 500ms |
| ai-whisper p95 latency | < 5000ms |
| ai-tts p95 latency | < 2000ms |
| ai-image p95 latency | < 30000ms |
| Error rate | < 1% |
| Fallback rate | < 10% |

### Logging

All edge functions log:
- Request timestamp
- Model used
- Latency
- Token count (if available)
- Error (sanitized)

---

## 🚀 DEPLOYMENT

### Edge Function Deployment

```bash
# Deploy all AI functions
supabase functions deploy ai-chat
supabase functions deploy ai-embeddings
supabase functions deploy ai-whisper
supabase functions deploy ai-tts
supabase functions deploy ai-image
```

### Environment Variables

```bash
# Set secrets
supabase secrets set HF_TOKEN=hf_xxxxx
supabase secrets set LOVABLE_API_KEY=xxxxx
supabase secrets set ELEVENLABS_API_KEY=xxxxx
```

---

**Last Updated:** 2026-01-25
**Maintained By:** AI Platform Team
