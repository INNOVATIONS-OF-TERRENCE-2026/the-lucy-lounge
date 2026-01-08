// Lucy Arcade - Player Profile Hook
import { useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useArcadeStore } from '../stores/arcadeStore';
import type { PlayerProfile } from '../types/game.types';

export function usePlayerProfile() {
  const { 
    playerProfile, 
    isLoadingProfile, 
    setPlayerProfile, 
    setLoadingProfile 
  } = useArcadeStore();

  const fetchProfile = useCallback(async () => {
    try {
      setLoadingProfile(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setPlayerProfile(null);
        return;
      }

      // Fetch existing profile
      const { data, error } = await supabase
        .from('arcade_player_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching arcade profile:', error);
        return;
      }

      if (data) {
        setPlayerProfile({
          id: data.id,
          userId: data.user_id,
          displayName: data.display_name,
          avatarUrl: data.avatar_url,
          totalXp: data.total_xp,
          level: data.level,
          coins: data.coins,
          createdAt: data.created_at,
          updatedAt: data.updated_at,
        });
      } else {
        // Create new profile
        const { data: newProfile, error: createError } = await supabase
          .from('arcade_player_profiles')
          .insert({
            user_id: user.id,
            display_name: user.email?.split('@')[0] || 'Player',
          })
          .select()
          .single();

        if (createError) {
          console.error('Error creating arcade profile:', createError);
          return;
        }

        if (newProfile) {
          setPlayerProfile({
            id: newProfile.id,
            userId: newProfile.user_id,
            displayName: newProfile.display_name,
            avatarUrl: newProfile.avatar_url,
            totalXp: newProfile.total_xp,
            level: newProfile.level,
            coins: newProfile.coins,
            createdAt: newProfile.created_at,
            updatedAt: newProfile.updated_at,
          });
        }
      }
    } catch (err) {
      console.error('Error in fetchProfile:', err);
    } finally {
      setLoadingProfile(false);
    }
  }, [setPlayerProfile, setLoadingProfile]);

  const addXp = useCallback(async (xp: number) => {
    if (!playerProfile) return;

    const newXp = playerProfile.totalXp + xp;
    const newLevel = Math.floor(newXp / 1000) + 1;

    const { error } = await supabase
      .from('arcade_player_profiles')
      .update({ 
        total_xp: newXp, 
        level: newLevel,
        updated_at: new Date().toISOString()
      })
      .eq('id', playerProfile.id);

    if (!error) {
      setPlayerProfile({
        ...playerProfile,
        totalXp: newXp,
        level: newLevel,
      });
    }
  }, [playerProfile, setPlayerProfile]);

  const addCoins = useCallback(async (coins: number) => {
    if (!playerProfile) return;

    const newCoins = playerProfile.coins + coins;

    const { error } = await supabase
      .from('arcade_player_profiles')
      .update({ 
        coins: newCoins,
        updated_at: new Date().toISOString()
      })
      .eq('id', playerProfile.id);

    if (!error) {
      setPlayerProfile({
        ...playerProfile,
        coins: newCoins,
      });
    }
  }, [playerProfile, setPlayerProfile]);

  useEffect(() => {
    fetchProfile();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      fetchProfile();
    });

    return () => subscription.unsubscribe();
  }, [fetchProfile]);

  return {
    profile: playerProfile,
    isLoading: isLoadingProfile,
    addXp,
    addCoins,
    refetch: fetchProfile,
  };
}
