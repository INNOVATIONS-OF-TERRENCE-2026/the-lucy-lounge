-- Create favorites table for Listening Mode
CREATE TABLE public.listening_favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content_id TEXT NOT NULL,
  title TEXT NOT NULL,
  subtitle TEXT,
  genre TEXT NOT NULL,
  content_type TEXT NOT NULL CHECK (content_type IN ('playlist', 'album')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE (user_id, content_id)
);

-- Enable RLS
ALTER TABLE public.listening_favorites ENABLE ROW LEVEL SECURITY;

-- Users can view their own favorites
CREATE POLICY "Users can view their own favorites"
ON public.listening_favorites
FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own favorites
CREATE POLICY "Users can insert their own favorites"
ON public.listening_favorites
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can delete their own favorites
CREATE POLICY "Users can delete their own favorites"
ON public.listening_favorites
FOR DELETE
USING (auth.uid() = user_id);