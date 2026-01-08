-- Lucy Arcade Player Profiles
CREATE TABLE public.arcade_player_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  display_name TEXT,
  avatar_url TEXT,
  total_xp INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  coins INTEGER DEFAULT 100,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Lucy Arcade Game Stats
CREATE TABLE public.arcade_game_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  game_id TEXT NOT NULL,
  plays INTEGER DEFAULT 0,
  wins INTEGER DEFAULT 0,
  losses INTEGER DEFAULT 0,
  high_score BIGINT DEFAULT 0,
  total_playtime_seconds INTEGER DEFAULT 0,
  last_played_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, game_id)
);

-- Lucy Arcade Achievements
CREATE TABLE public.arcade_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  achievement_id TEXT NOT NULL,
  unlocked_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, achievement_id)
);

-- Lucy Arcade Leaderboards
CREATE TABLE public.arcade_leaderboards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id TEXT NOT NULL,
  user_id UUID NOT NULL,
  score BIGINT NOT NULL,
  metadata JSONB,
  achieved_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.arcade_player_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.arcade_game_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.arcade_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.arcade_leaderboards ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Players manage their own data
CREATE POLICY "Users can view own arcade profile" ON public.arcade_player_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own arcade profile" ON public.arcade_player_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own arcade profile" ON public.arcade_player_profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- Game stats policies
CREATE POLICY "Users can view own game stats" ON public.arcade_game_stats
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own game stats" ON public.arcade_game_stats
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own game stats" ON public.arcade_game_stats
  FOR UPDATE USING (auth.uid() = user_id);

-- Achievements policies
CREATE POLICY "Users can view own achievements" ON public.arcade_achievements
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own achievements" ON public.arcade_achievements
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Leaderboards: public read, user write
CREATE POLICY "Anyone can view leaderboards" ON public.arcade_leaderboards
  FOR SELECT USING (true);

CREATE POLICY "Users can submit own scores" ON public.arcade_leaderboards
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Updated_at trigger for arcade_player_profiles
CREATE TRIGGER update_arcade_player_profiles_updated_at
  BEFORE UPDATE ON public.arcade_player_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();