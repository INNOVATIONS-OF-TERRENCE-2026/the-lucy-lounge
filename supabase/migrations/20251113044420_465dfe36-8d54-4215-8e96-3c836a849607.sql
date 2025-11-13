-- Add preferences column to profiles for personality settings
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS preferences JSONB DEFAULT '{"personality": "balanced", "tone": "warm", "verbosity": "moderate", "language_style": "clear"}';

-- Add full-text search index on messages content
CREATE INDEX IF NOT EXISTS messages_content_fts ON messages 
USING gin(to_tsvector('english', content));

-- Add GIN index on conversations tags for faster filtering
CREATE INDEX IF NOT EXISTS conversations_tags_idx ON conversations USING gin(tags);

-- Add model tracking to messages
ALTER TABLE messages ADD COLUMN IF NOT EXISTS model_used TEXT DEFAULT 'google/gemini-2.5-flash';
ALTER TABLE messages ADD COLUMN IF NOT EXISTS tokens_used INTEGER DEFAULT 0;

-- Add search vector column for better full-text search performance
ALTER TABLE messages ADD COLUMN IF NOT EXISTS search_vector tsvector;

-- Create trigger to automatically update search_vector
CREATE OR REPLACE FUNCTION messages_search_vector_update() RETURNS trigger AS $$
BEGIN
  NEW.search_vector := to_tsvector('english', COALESCE(NEW.content, ''));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER messages_search_vector_trigger
BEFORE INSERT OR UPDATE OF content ON messages
FOR EACH ROW EXECUTE FUNCTION messages_search_vector_update();

-- Update existing messages to populate search_vector
UPDATE messages SET search_vector = to_tsvector('english', content) WHERE search_vector IS NULL;

-- Create index on search_vector for performance
CREATE INDEX IF NOT EXISTS messages_search_vector_idx ON messages USING gin(search_vector);

-- Add folder support via enhanced tags
CREATE TABLE IF NOT EXISTS folders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT DEFAULT '#8b5cf6',
  icon TEXT DEFAULT 'folder',
  position INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on folders
ALTER TABLE folders ENABLE ROW LEVEL SECURITY;

-- Folders RLS policies
CREATE POLICY "Users can view their own folders"
  ON folders FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own folders"
  ON folders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own folders"
  ON folders FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own folders"
  ON folders FOR DELETE
  USING (auth.uid() = user_id);

-- Add folder_id to conversations
ALTER TABLE conversations ADD COLUMN IF NOT EXISTS folder_id UUID REFERENCES folders(id) ON DELETE SET NULL;

-- Create index on folder_id
CREATE INDEX IF NOT EXISTS conversations_folder_id_idx ON conversations(folder_id);

-- Add updated_at trigger for folders
CREATE TRIGGER update_folders_updated_at
  BEFORE UPDATE ON folders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();