-- Create conversation_context table for storing conversation summaries and context
CREATE TABLE IF NOT EXISTS public.conversation_context (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid REFERENCES public.conversations(id) ON DELETE CASCADE NOT NULL,
  context_summary text,
  key_topics text[],
  user_preferences jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.conversation_context ENABLE ROW LEVEL SECURITY;

-- Users can view their own conversation context
CREATE POLICY "Users can view their own conversation context"
ON public.conversation_context FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.conversations
    WHERE conversations.id = conversation_context.conversation_id
    AND conversations.user_id = auth.uid()
  )
);

-- Users can insert context for their conversations
CREATE POLICY "Users can insert context for their conversations"
ON public.conversation_context FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.conversations
    WHERE conversations.id = conversation_context.conversation_id
    AND conversations.user_id = auth.uid()
  )
);

-- Users can update their conversation context
CREATE POLICY "Users can update their conversation context"
ON public.conversation_context FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.conversations
    WHERE conversations.id = conversation_context.conversation_id
    AND conversations.user_id = auth.uid()
  )
);

-- Create proactive_suggestions table
CREATE TABLE IF NOT EXISTS public.proactive_suggestions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid REFERENCES public.conversations(id) ON DELETE CASCADE NOT NULL,
  suggestion_text text NOT NULL,
  suggestion_type text NOT NULL DEFAULT 'follow_up',
  relevance_score float DEFAULT 0.5,
  shown boolean DEFAULT false,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.proactive_suggestions ENABLE ROW LEVEL SECURITY;

-- Users can view suggestions for their conversations
CREATE POLICY "Users can view their conversation suggestions"
ON public.proactive_suggestions FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.conversations
    WHERE conversations.id = proactive_suggestions.conversation_id
    AND conversations.user_id = auth.uid()
  )
);

-- Users can insert suggestions
CREATE POLICY "Users can insert suggestions"
ON public.proactive_suggestions FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.conversations
    WHERE conversations.id = proactive_suggestions.conversation_id
    AND conversations.user_id = auth.uid()
  )
);

-- Users can update suggestions (mark as shown)
CREATE POLICY "Users can update their suggestions"
ON public.proactive_suggestions FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.conversations
    WHERE conversations.id = proactive_suggestions.conversation_id
    AND conversations.user_id = auth.uid()
  )
);

-- Create search_results table for storing web search results
CREATE TABLE IF NOT EXISTS public.search_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id uuid REFERENCES public.messages(id) ON DELETE CASCADE,
  query text NOT NULL,
  results jsonb DEFAULT '[]'::jsonb,
  sources text[],
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.search_results ENABLE ROW LEVEL SECURITY;

-- Users can view search results for their messages
CREATE POLICY "Users can view their search results"
ON public.search_results FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.messages
    JOIN public.conversations ON conversations.id = messages.conversation_id
    WHERE messages.id = search_results.message_id
    AND conversations.user_id = auth.uid()
  )
);

-- Users can insert search results
CREATE POLICY "Users can insert search results"
ON public.search_results FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.messages
    JOIN public.conversations ON conversations.id = messages.conversation_id
    WHERE messages.id = search_results.message_id
    AND conversations.user_id = auth.uid()
  )
);

-- Create user_memories table for long-term memory system
CREATE TABLE IF NOT EXISTS public.user_memories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  memory_type text NOT NULL DEFAULT 'fact',
  content text NOT NULL,
  importance_score float DEFAULT 0.5,
  last_accessed timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.user_memories ENABLE ROW LEVEL SECURITY;

-- Users can view their own memories
CREATE POLICY "Users can view their own memories"
ON public.user_memories FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own memories
CREATE POLICY "Users can insert their own memories"
ON public.user_memories FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own memories
CREATE POLICY "Users can update their own memories"
ON public.user_memories FOR UPDATE
USING (auth.uid() = user_id);

-- Users can delete their own memories
CREATE POLICY "Users can delete their own memories"
ON public.user_memories FOR DELETE
USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_conversation_context_conversation_id ON public.conversation_context(conversation_id);
CREATE INDEX IF NOT EXISTS idx_proactive_suggestions_conversation_id ON public.proactive_suggestions(conversation_id);
CREATE INDEX IF NOT EXISTS idx_search_results_message_id ON public.search_results(message_id);
CREATE INDEX IF NOT EXISTS idx_user_memories_user_id ON public.user_memories(user_id);
CREATE INDEX IF NOT EXISTS idx_user_memories_memory_type ON public.user_memories(memory_type);

-- Add trigger for updating updated_at on conversation_context
CREATE TRIGGER update_conversation_context_updated_at
BEFORE UPDATE ON public.conversation_context
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();