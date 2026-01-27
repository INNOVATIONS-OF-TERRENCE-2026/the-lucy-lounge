/**
 * ┌─────────────────────────────────────────────────────────────────────────────┐
 * │ LUCY ARCADE — GLOBAL PROGRESSION SYSTEM                                     │
 * │                                                                             │
 * │ Platform-wide progression that persists across all games                    │
 * │                                                                             │
 * │ FEATURES:                                                                  │
 * │ • Player XP and Levels (1-100+)                                            │
 * │ • Skill Trees per game category                                            │
 * │ • Unlockable cosmetics, titles, emotes                                     │
 * │ • Seasonal progression and resets                                          │
 * │ • Achievement system                                                       │
 * │ • Battle Pass integration                                                  │
 * └─────────────────────────────────────────────────────────────────────────────┘
 */

import { supabase } from '@/integrations/supabase/client';

// ============================================================================
// TYPES
// ============================================================================

export interface PlayerProgression {
  playerId: string;
  totalXp: number;
  level: number;
  prestige: number;
  seasonXp: number;
  seasonLevel: number;
  skillPoints: number;
  unlockedItems: string[];
  equippedItems: EquippedItems;
  achievements: string[];
  battlePassTier: number;
  battlePassPremium: boolean;
  stats: GlobalStats;
  skillTrees: Record<string, SkillTreeProgress>;
  lastUpdated: Date;
}

export interface EquippedItems {
  title: string | null;
  nameplate: string | null;
  avatar: string | null;
  avatarBorder: string | null;
  profileBanner: string | null;
  emotes: string[];
  victoryPose: string | null;
  loadingScreen: string | null;
}

export interface GlobalStats {
  totalGamesPlayed: number;
  totalWins: number;
  totalLosses: number;
  totalPlaytime: number; // seconds
  totalKills: number;
  totalDeaths: number;
  totalHeadshots: number;
  totalDamageDealt: number;
  totalScore: number;
  highestKillStreak: number;
  perfectGames: number;
  tournamentsEntered: number;
  tournamentsWon: number;
}

export interface SkillTreeProgress {
  categoryId: string;
  unlockedNodes: string[];
  nodeProgress: Record<string, number>;
  totalPoints: number;
}

export interface SkillNode {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  tier: number;
  cost: number;
  maxLevel: number;
  prerequisites: string[];
  effects: SkillEffect[];
  position: { x: number; y: number };
}

export interface SkillEffect {
  type: 'stat_boost' | 'unlock' | 'ability' | 'passive';
  stat?: string;
  value: number;
  unit?: 'percent' | 'flat';
  unlockId?: string;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'combat' | 'progression' | 'social' | 'mastery' | 'secret';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  xpReward: number;
  coinReward: number;
  unlockReward?: string;
  requirement: AchievementRequirement;
  hidden: boolean;
}

export interface AchievementRequirement {
  type: 'stat' | 'game' | 'streak' | 'collection' | 'special';
  stat?: string;
  target: number;
  gameId?: string;
  condition?: string;
}

export interface BattlePassTier {
  tier: number;
  xpRequired: number;
  freeReward: BattlePassReward | null;
  premiumReward: BattlePassReward | null;
}

export interface BattlePassReward {
  type: 'cosmetic' | 'currency' | 'xp_boost' | 'title';
  itemId: string;
  quantity: number;
}

export interface UnlockableItem {
  id: string;
  name: string;
  description: string;
  type: 'title' | 'nameplate' | 'avatar' | 'avatar_border' | 'banner' | 'emote' | 'victory_pose' | 'loading_screen';
  rarity: 'common' | 'rare' | 'epic' | 'legendary' | 'mythic';
  preview: string;
  unlockMethod: 'level' | 'achievement' | 'purchase' | 'battlepass' | 'tournament' | 'seasonal';
  unlockRequirement?: number | string;
  price?: number;
  seasonalOnly?: boolean;
}

// ============================================================================
// XP & LEVEL CONSTANTS
// ============================================================================

const BASE_XP_PER_LEVEL = 1000;
const XP_SCALING_FACTOR = 1.08;
const MAX_LEVEL = 100;
const PRESTIGE_LEVELS = 10;

// XP Sources
export const XP_SOURCES = {
  GAME_WIN: 100,
  GAME_LOSS: 25,
  GAME_DRAW: 50,
  KILL: 10,
  HEADSHOT: 15,
  ASSIST: 5,
  OBJECTIVE: 25,
  FIRST_BLOOD: 20,
  MULTI_KILL_2: 15,
  MULTI_KILL_3: 25,
  MULTI_KILL_4: 40,
  MULTI_KILL_5: 60,
  STREAK_5: 30,
  STREAK_10: 75,
  STREAK_15: 150,
  MATCH_MVP: 100,
  DAILY_LOGIN: 50,
  WEEKLY_CHALLENGE: 200,
  ACHIEVEMENT_COMMON: 50,
  ACHIEVEMENT_RARE: 100,
  ACHIEVEMENT_EPIC: 250,
  ACHIEVEMENT_LEGENDARY: 500,
  TOURNAMENT_PARTICIPATION: 150,
  TOURNAMENT_WIN: 1000,
  SEASON_PLACEMENT: 300,
};

// ============================================================================
// SKILL TREES
// ============================================================================

export const SKILL_TREE_CATEGORIES = {
  fps: {
    id: 'fps',
    name: 'FPS Mastery',
    description: 'Skills for first-person shooters',
    icon: '🎯',
    games: ['sentinel-*', 'fps-shooter', 'tactical-assault'],
  },
  racing: {
    id: 'racing',
    name: 'Speed Demon',
    description: 'Skills for racing games',
    icon: '🏎️',
    games: ['neon-racer', 'drift-masters', 'jet-ski'],
  },
  sports: {
    id: 'sports',
    name: 'Athletic Champion',
    description: 'Skills for sports games',
    icon: '🏆',
    games: ['basketball-*', 'soccer', 'tennis', 'volleyball', 'boxing'],
  },
  strategy: {
    id: 'strategy',
    name: 'Tactical Mind',
    description: 'Skills for strategy games',
    icon: '🧠',
    games: ['chess', 'checkers', 'commander-rts', 'go', 'battleship'],
  },
  action: {
    id: 'action',
    name: 'Action Hero',
    description: 'Skills for action and arcade games',
    icon: '⚡',
    games: ['space-combat', 'tank-battle', 'robot-battle', 'parkour'],
  },
};

export const FPS_SKILL_TREE: SkillNode[] = [
  // Tier 1 - Foundation
  {
    id: 'fps_accuracy_1',
    name: 'Steady Aim I',
    description: 'Reduce weapon spread by 3%',
    icon: '🎯',
    category: 'fps',
    tier: 1,
    cost: 1,
    maxLevel: 3,
    prerequisites: [],
    effects: [{ type: 'stat_boost', stat: 'accuracy', value: 3, unit: 'percent' }],
    position: { x: 0, y: 0 },
  },
  {
    id: 'fps_movement_1',
    name: 'Quick Feet I',
    description: 'Increase movement speed by 2%',
    icon: '👟',
    category: 'fps',
    tier: 1,
    cost: 1,
    maxLevel: 3,
    prerequisites: [],
    effects: [{ type: 'stat_boost', stat: 'movement_speed', value: 2, unit: 'percent' }],
    position: { x: 2, y: 0 },
  },
  {
    id: 'fps_reload_1',
    name: 'Quick Hands I',
    description: 'Reduce reload time by 5%',
    icon: '🔄',
    category: 'fps',
    tier: 1,
    cost: 1,
    maxLevel: 3,
    prerequisites: [],
    effects: [{ type: 'stat_boost', stat: 'reload_speed', value: 5, unit: 'percent' }],
    position: { x: 4, y: 0 },
  },
  
  // Tier 2 - Intermediate
  {
    id: 'fps_recoil_control',
    name: 'Recoil Control',
    description: 'Reduce weapon recoil by 5%',
    icon: '📉',
    category: 'fps',
    tier: 2,
    cost: 2,
    maxLevel: 3,
    prerequisites: ['fps_accuracy_1'],
    effects: [{ type: 'stat_boost', stat: 'recoil', value: -5, unit: 'percent' }],
    position: { x: 0, y: 1 },
  },
  {
    id: 'fps_headshot_bonus',
    name: 'Precision Killer',
    description: 'Increase headshot damage by 5%',
    icon: '💀',
    category: 'fps',
    tier: 2,
    cost: 2,
    maxLevel: 3,
    prerequisites: ['fps_accuracy_1'],
    effects: [{ type: 'stat_boost', stat: 'headshot_damage', value: 5, unit: 'percent' }],
    position: { x: 1, y: 1 },
  },
  {
    id: 'fps_slide_boost',
    name: 'Tactical Slide',
    description: 'Increase slide distance by 10%',
    icon: '🏃',
    category: 'fps',
    tier: 2,
    cost: 2,
    maxLevel: 2,
    prerequisites: ['fps_movement_1'],
    effects: [{ type: 'stat_boost', stat: 'slide_distance', value: 10, unit: 'percent' }],
    position: { x: 2, y: 1 },
  },
  {
    id: 'fps_sprint_regen',
    name: 'Marathon Runner',
    description: 'Increase stamina regen by 10%',
    icon: '💨',
    category: 'fps',
    tier: 2,
    cost: 2,
    maxLevel: 3,
    prerequisites: ['fps_movement_1'],
    effects: [{ type: 'stat_boost', stat: 'stamina_regen', value: 10, unit: 'percent' }],
    position: { x: 3, y: 1 },
  },
  {
    id: 'fps_ammo_capacity',
    name: 'Deep Pockets',
    description: 'Increase reserve ammo by 15%',
    icon: '🎒',
    category: 'fps',
    tier: 2,
    cost: 2,
    maxLevel: 3,
    prerequisites: ['fps_reload_1'],
    effects: [{ type: 'stat_boost', stat: 'ammo_capacity', value: 15, unit: 'percent' }],
    position: { x: 4, y: 1 },
  },
  
  // Tier 3 - Advanced
  {
    id: 'fps_bullet_penetration',
    name: 'Armor Piercing',
    description: 'Increase bullet penetration by 10%',
    icon: '🔫',
    category: 'fps',
    tier: 3,
    cost: 3,
    maxLevel: 2,
    prerequisites: ['fps_recoil_control', 'fps_headshot_bonus'],
    effects: [{ type: 'stat_boost', stat: 'penetration', value: 10, unit: 'percent' }],
    position: { x: 0.5, y: 2 },
  },
  {
    id: 'fps_ads_speed',
    name: 'Quick Scope',
    description: 'Increase ADS speed by 15%',
    icon: '🔭',
    category: 'fps',
    tier: 3,
    cost: 3,
    maxLevel: 2,
    prerequisites: ['fps_headshot_bonus'],
    effects: [{ type: 'stat_boost', stat: 'ads_speed', value: 15, unit: 'percent' }],
    position: { x: 1.5, y: 2 },
  },
  {
    id: 'fps_tactical_mastery',
    name: 'Tactical Mastery',
    description: 'Unlock tactical emotes and titles',
    icon: '🎖️',
    category: 'fps',
    tier: 3,
    cost: 3,
    maxLevel: 1,
    prerequisites: ['fps_slide_boost', 'fps_sprint_regen'],
    effects: [{ type: 'unlock', unlockId: 'fps_tactical_bundle', value: 1 }],
    position: { x: 2.5, y: 2 },
  },
  {
    id: 'fps_swap_speed',
    name: 'Quick Draw',
    description: 'Increase weapon swap speed by 20%',
    icon: '⚡',
    category: 'fps',
    tier: 3,
    cost: 3,
    maxLevel: 2,
    prerequisites: ['fps_ammo_capacity'],
    effects: [{ type: 'stat_boost', stat: 'swap_speed', value: 20, unit: 'percent' }],
    position: { x: 3.5, y: 2 },
  },
  
  // Tier 4 - Expert
  {
    id: 'fps_elite_accuracy',
    name: 'Elite Marksman',
    description: 'Reduce spread recovery time by 20%',
    icon: '🏆',
    category: 'fps',
    tier: 4,
    cost: 5,
    maxLevel: 2,
    prerequisites: ['fps_bullet_penetration', 'fps_ads_speed'],
    effects: [{ type: 'stat_boost', stat: 'spread_recovery', value: 20, unit: 'percent' }],
    position: { x: 1, y: 3 },
  },
  {
    id: 'fps_combat_mastery',
    name: 'Combat Master',
    description: 'Unlock legendary combat title and border',
    icon: '👑',
    category: 'fps',
    tier: 4,
    cost: 5,
    maxLevel: 1,
    prerequisites: ['fps_tactical_mastery'],
    effects: [
      { type: 'unlock', unlockId: 'title_combat_master', value: 1 },
      { type: 'unlock', unlockId: 'border_fps_legendary', value: 1 },
    ],
    position: { x: 2.5, y: 3 },
  },
  {
    id: 'fps_lethal_efficiency',
    name: 'Lethal Efficiency',
    description: 'All FPS XP gains increased by 10%',
    icon: '💎',
    category: 'fps',
    tier: 4,
    cost: 5,
    maxLevel: 3,
    prerequisites: ['fps_swap_speed'],
    effects: [{ type: 'stat_boost', stat: 'xp_multiplier', value: 10, unit: 'percent' }],
    position: { x: 3.5, y: 3 },
  },
];

// ============================================================================
// ACHIEVEMENTS
// ============================================================================

export const ACHIEVEMENTS: Achievement[] = [
  // Combat Achievements
  {
    id: 'ach_first_kill',
    name: 'First Blood',
    description: 'Get your first kill in any FPS game',
    icon: '🩸',
    category: 'combat',
    rarity: 'common',
    xpReward: 50,
    coinReward: 25,
    requirement: { type: 'stat', stat: 'totalKills', target: 1 },
    hidden: false,
  },
  {
    id: 'ach_100_kills',
    name: 'Century Slayer',
    description: 'Eliminate 100 enemies',
    icon: '💯',
    category: 'combat',
    rarity: 'common',
    xpReward: 100,
    coinReward: 50,
    requirement: { type: 'stat', stat: 'totalKills', target: 100 },
    hidden: false,
  },
  {
    id: 'ach_1000_kills',
    name: 'Apex Predator',
    description: 'Eliminate 1,000 enemies',
    icon: '🦁',
    category: 'combat',
    rarity: 'rare',
    xpReward: 250,
    coinReward: 150,
    requirement: { type: 'stat', stat: 'totalKills', target: 1000 },
    hidden: false,
  },
  {
    id: 'ach_headshot_master',
    name: 'Headshot Master',
    description: 'Land 500 headshots',
    icon: '🎯',
    category: 'combat',
    rarity: 'epic',
    xpReward: 400,
    coinReward: 250,
    unlockReward: 'title_headhunter',
    requirement: { type: 'stat', stat: 'totalHeadshots', target: 500 },
    hidden: false,
  },
  {
    id: 'ach_killstreak_10',
    name: 'Unstoppable',
    description: 'Achieve a 10 kill streak',
    icon: '🔥',
    category: 'combat',
    rarity: 'epic',
    xpReward: 300,
    coinReward: 200,
    requirement: { type: 'stat', stat: 'highestKillStreak', target: 10 },
    hidden: false,
  },
  {
    id: 'ach_killstreak_20',
    name: 'Legendary Warrior',
    description: 'Achieve a 20 kill streak',
    icon: '⚔️',
    category: 'combat',
    rarity: 'legendary',
    xpReward: 500,
    coinReward: 400,
    unlockReward: 'title_legend',
    requirement: { type: 'stat', stat: 'highestKillStreak', target: 20 },
    hidden: false,
  },
  
  // Progression Achievements
  {
    id: 'ach_level_10',
    name: 'Rising Star',
    description: 'Reach level 10',
    icon: '⭐',
    category: 'progression',
    rarity: 'common',
    xpReward: 100,
    coinReward: 50,
    requirement: { type: 'stat', stat: 'level', target: 10 },
    hidden: false,
  },
  {
    id: 'ach_level_50',
    name: 'Veteran',
    description: 'Reach level 50',
    icon: '🎖️',
    category: 'progression',
    rarity: 'rare',
    xpReward: 300,
    coinReward: 200,
    unlockReward: 'border_veteran',
    requirement: { type: 'stat', stat: 'level', target: 50 },
    hidden: false,
  },
  {
    id: 'ach_level_100',
    name: 'Grand Master',
    description: 'Reach level 100',
    icon: '👑',
    category: 'progression',
    rarity: 'legendary',
    xpReward: 1000,
    coinReward: 500,
    unlockReward: 'title_grand_master',
    requirement: { type: 'stat', stat: 'level', target: 100 },
    hidden: false,
  },
  {
    id: 'ach_prestige_1',
    name: 'Prestige I',
    description: 'Enter Prestige mode for the first time',
    icon: '🌟',
    category: 'progression',
    rarity: 'epic',
    xpReward: 500,
    coinReward: 300,
    unlockReward: 'avatar_prestige_1',
    requirement: { type: 'stat', stat: 'prestige', target: 1 },
    hidden: false,
  },
  
  // Game Mastery
  {
    id: 'ach_100_games',
    name: 'Dedicated Player',
    description: 'Play 100 games',
    icon: '🎮',
    category: 'mastery',
    rarity: 'common',
    xpReward: 150,
    coinReward: 75,
    requirement: { type: 'stat', stat: 'totalGamesPlayed', target: 100 },
    hidden: false,
  },
  {
    id: 'ach_win_streak_5',
    name: 'On Fire',
    description: 'Win 5 games in a row',
    icon: '🔥',
    category: 'mastery',
    rarity: 'rare',
    xpReward: 200,
    coinReward: 100,
    requirement: { type: 'streak', target: 5 },
    hidden: false,
  },
  {
    id: 'ach_all_games',
    name: 'Arcade Explorer',
    description: 'Play every game in the arcade at least once',
    icon: '🗺️',
    category: 'mastery',
    rarity: 'epic',
    xpReward: 500,
    coinReward: 300,
    unlockReward: 'title_explorer',
    requirement: { type: 'collection', target: 33 },
    hidden: false,
  },
  
  // Tournament Achievements
  {
    id: 'ach_tournament_entry',
    name: 'Competitor',
    description: 'Enter your first tournament',
    icon: '🏅',
    category: 'social',
    rarity: 'common',
    xpReward: 100,
    coinReward: 50,
    requirement: { type: 'stat', stat: 'tournamentsEntered', target: 1 },
    hidden: false,
  },
  {
    id: 'ach_tournament_win',
    name: 'Champion',
    description: 'Win a tournament',
    icon: '🏆',
    category: 'social',
    rarity: 'legendary',
    xpReward: 1000,
    coinReward: 500,
    unlockReward: 'title_champion',
    requirement: { type: 'stat', stat: 'tournamentsWon', target: 1 },
    hidden: false,
  },
  
  // Secret Achievements
  {
    id: 'ach_pacifist',
    name: 'Pacifist Victory',
    description: 'Win a survival wave without getting any kills',
    icon: '☮️',
    category: 'secret',
    rarity: 'legendary',
    xpReward: 500,
    coinReward: 300,
    unlockReward: 'emote_peace',
    requirement: { type: 'special', condition: 'pacifist_win' },
    hidden: true,
  },
];

// ============================================================================
// BATTLE PASS
// ============================================================================

export const CURRENT_BATTLE_PASS = {
  id: 'season_7_battlepass',
  name: 'Season 7: Ascension',
  description: 'Rise through the ranks and unlock exclusive rewards',
  startDate: new Date('2026-01-01'),
  endDate: new Date('2026-03-31'),
  maxTier: 100,
  premiumPrice: 950, // coins
  xpPerTier: 1000,
};

export function generateBattlePassTiers(): BattlePassTier[] {
  const tiers: BattlePassTier[] = [];
  
  for (let i = 1; i <= CURRENT_BATTLE_PASS.maxTier; i++) {
    const tier: BattlePassTier = {
      tier: i,
      xpRequired: i * CURRENT_BATTLE_PASS.xpPerTier,
      freeReward: i % 5 === 0 ? {
        type: i % 10 === 0 ? 'currency' : 'cosmetic',
        itemId: i % 10 === 0 ? 'coins' : `free_tier_${i}`,
        quantity: i % 10 === 0 ? 100 : 1,
      } : null,
      premiumReward: {
        type: i % 25 === 0 ? 'title' : (i % 10 === 0 ? 'currency' : 'cosmetic'),
        itemId: i % 25 === 0 ? `premium_title_tier_${i}` : (i % 10 === 0 ? 'coins' : `premium_tier_${i}`),
        quantity: i % 10 === 0 ? 200 : 1,
      },
    };
    
    tiers.push(tier);
  }
  
  return tiers;
}

// ============================================================================
// PROGRESSION SERVICE
// ============================================================================

export class ProgressionService {
  private static instance: ProgressionService;
  private cache: Map<string, PlayerProgression> = new Map();
  private dirtyPlayers: Set<string> = new Set();
  private saveInterval: NodeJS.Timeout | null = null;
  
  private constructor() {
    // Auto-save dirty data every 30 seconds
    this.saveInterval = setInterval(() => this.flushDirtyPlayers(), 30000);
  }
  
  public static getInstance(): ProgressionService {
    if (!ProgressionService.instance) {
      ProgressionService.instance = new ProgressionService();
    }
    return ProgressionService.instance;
  }
  
  // ============================================================================
  // XP & LEVELING
  // ============================================================================
  
  public static getXpForLevel(level: number): number {
    if (level <= 1) return 0;
    
    let totalXp = 0;
    for (let i = 1; i < level; i++) {
      totalXp += Math.floor(BASE_XP_PER_LEVEL * Math.pow(XP_SCALING_FACTOR, i - 1));
    }
    return totalXp;
  }
  
  public static getLevelFromXp(xp: number): number {
    let level = 1;
    let totalXp = 0;
    
    while (level < MAX_LEVEL * (PRESTIGE_LEVELS + 1)) {
      const xpForNext = Math.floor(BASE_XP_PER_LEVEL * Math.pow(XP_SCALING_FACTOR, level - 1));
      if (totalXp + xpForNext > xp) break;
      totalXp += xpForNext;
      level++;
    }
    
    return level;
  }
  
  public static getXpProgress(xp: number): { current: number; required: number; percent: number } {
    const level = this.getLevelFromXp(xp);
    const xpForCurrentLevel = this.getXpForLevel(level);
    const xpForNextLevel = this.getXpForLevel(level + 1);
    
    const current = xp - xpForCurrentLevel;
    const required = xpForNextLevel - xpForCurrentLevel;
    const percent = required > 0 ? (current / required) * 100 : 100;
    
    return { current, required, percent };
  }
  
  // ============================================================================
  // PLAYER PROGRESSION
  // ============================================================================
  
  public async getPlayerProgression(playerId: string): Promise<PlayerProgression | null> {
    // Check cache first
    if (this.cache.has(playerId)) {
      return this.cache.get(playerId)!;
    }
    
    try {
      const { data: profile, error } = await supabase
        .from('arcade_player_profiles')
        .select('*')
        .eq('user_id', playerId)
        .single();
      
      if (error) throw error;
      
      // Build progression object
      const progression: PlayerProgression = {
        playerId,
        totalXp: profile.total_xp || 0,
        level: ProgressionService.getLevelFromXp(profile.total_xp || 0),
        prestige: profile.prestige || 0,
        seasonXp: profile.season_xp || 0,
        seasonLevel: Math.floor((profile.season_xp || 0) / CURRENT_BATTLE_PASS.xpPerTier) + 1,
        skillPoints: profile.skill_points || 0,
        unlockedItems: profile.unlocked_items || [],
        equippedItems: profile.equipped_items || this.getDefaultEquippedItems(),
        achievements: profile.achievements || [],
        battlePassTier: Math.floor((profile.season_xp || 0) / CURRENT_BATTLE_PASS.xpPerTier),
        battlePassPremium: profile.battle_pass_premium || false,
        stats: profile.global_stats || this.getDefaultStats(),
        skillTrees: profile.skill_trees || {},
        lastUpdated: new Date(profile.updated_at),
      };
      
      this.cache.set(playerId, progression);
      return progression;
    } catch (error) {
      console.error('Error fetching player progression:', error);
      return null;
    }
  }
  
  public async addXp(
    playerId: string,
    amount: number,
    source: string
  ): Promise<{ levelsGained: number; newLevel: number; achievementsUnlocked: string[] }> {
    const progression = await this.getPlayerProgression(playerId);
    if (!progression) {
      return { levelsGained: 0, newLevel: 1, achievementsUnlocked: [] };
    }
    
    const oldLevel = progression.level;
    progression.totalXp += amount;
    progression.seasonXp += amount;
    
    const newLevel = ProgressionService.getLevelFromXp(progression.totalXp);
    const levelsGained = newLevel - oldLevel;
    
    // Award skill points for level ups
    if (levelsGained > 0) {
      progression.skillPoints += levelsGained;
      progression.level = newLevel;
      progression.seasonLevel = Math.floor(progression.seasonXp / CURRENT_BATTLE_PASS.xpPerTier) + 1;
      progression.battlePassTier = Math.floor(progression.seasonXp / CURRENT_BATTLE_PASS.xpPerTier);
    }
    
    // Check for achievements
    const achievementsUnlocked = await this.checkAchievements(progression);
    
    this.cache.set(playerId, progression);
    this.dirtyPlayers.add(playerId);
    
    return { levelsGained, newLevel, achievementsUnlocked };
  }
  
  public async recordGameResult(
    playerId: string,
    result: {
      won: boolean;
      kills: number;
      deaths: number;
      headshots: number;
      damage: number;
      score: number;
      playtime: number;
      gameId: string;
    }
  ): Promise<void> {
    const progression = await this.getPlayerProgression(playerId);
    if (!progression) return;
    
    // Update stats
    progression.stats.totalGamesPlayed++;
    if (result.won) progression.stats.totalWins++;
    else progression.stats.totalLosses++;
    
    progression.stats.totalKills += result.kills;
    progression.stats.totalDeaths += result.deaths;
    progression.stats.totalHeadshots += result.headshots;
    progression.stats.totalDamageDealt += result.damage;
    progression.stats.totalScore += result.score;
    progression.stats.totalPlaytime += result.playtime;
    
    // Calculate XP earned
    let xpEarned = result.won ? XP_SOURCES.GAME_WIN : XP_SOURCES.GAME_LOSS;
    xpEarned += result.kills * XP_SOURCES.KILL;
    xpEarned += result.headshots * XP_SOURCES.HEADSHOT;
    
    await this.addXp(playerId, xpEarned, 'game_result');
    
    this.cache.set(playerId, progression);
    this.dirtyPlayers.add(playerId);
  }
  
  // ============================================================================
  // SKILL TREES
  // ============================================================================
  
  public async unlockSkillNode(
    playerId: string,
    categoryId: string,
    nodeId: string
  ): Promise<{ success: boolean; error?: string }> {
    const progression = await this.getPlayerProgression(playerId);
    if (!progression) {
      return { success: false, error: 'Player not found' };
    }
    
    // Find the node
    const skillTree = categoryId === 'fps' ? FPS_SKILL_TREE : [];
    const node = skillTree.find(n => n.id === nodeId);
    
    if (!node) {
      return { success: false, error: 'Node not found' };
    }
    
    // Check prerequisites
    const treeProgress = progression.skillTrees[categoryId] || {
      categoryId,
      unlockedNodes: [],
      nodeProgress: {},
      totalPoints: 0,
    };
    
    for (const prereq of node.prerequisites) {
      if (!treeProgress.unlockedNodes.includes(prereq)) {
        return { success: false, error: 'Prerequisites not met' };
      }
    }
    
    // Check skill points
    const currentLevel = treeProgress.nodeProgress[nodeId] || 0;
    if (currentLevel >= node.maxLevel) {
      return { success: false, error: 'Node already maxed' };
    }
    
    if (progression.skillPoints < node.cost) {
      return { success: false, error: 'Insufficient skill points' };
    }
    
    // Unlock/upgrade node
    progression.skillPoints -= node.cost;
    treeProgress.nodeProgress[nodeId] = currentLevel + 1;
    
    if (!treeProgress.unlockedNodes.includes(nodeId)) {
      treeProgress.unlockedNodes.push(nodeId);
    }
    
    treeProgress.totalPoints += node.cost;
    progression.skillTrees[categoryId] = treeProgress;
    
    // Apply effects
    for (const effect of node.effects) {
      if (effect.type === 'unlock' && effect.unlockId) {
        progression.unlockedItems.push(effect.unlockId);
      }
    }
    
    this.cache.set(playerId, progression);
    this.dirtyPlayers.add(playerId);
    
    return { success: true };
  }
  
  public getSkillTreeProgress(
    progression: PlayerProgression,
    categoryId: string
  ): SkillTreeProgress {
    return progression.skillTrees[categoryId] || {
      categoryId,
      unlockedNodes: [],
      nodeProgress: {},
      totalPoints: 0,
    };
  }
  
  // ============================================================================
  // ACHIEVEMENTS
  // ============================================================================
  
  private async checkAchievements(progression: PlayerProgression): Promise<string[]> {
    const unlocked: string[] = [];
    
    for (const achievement of ACHIEVEMENTS) {
      if (progression.achievements.includes(achievement.id)) continue;
      
      let isUnlocked = false;
      
      switch (achievement.requirement.type) {
        case 'stat':
          const statValue = (progression.stats as any)[achievement.requirement.stat!] 
            || (progression as any)[achievement.requirement.stat!];
          isUnlocked = statValue >= achievement.requirement.target;
          break;
        
        // Other requirement types would be checked here
      }
      
      if (isUnlocked) {
        progression.achievements.push(achievement.id);
        
        // Award rewards
        progression.totalXp += achievement.xpReward;
        
        if (achievement.unlockReward) {
          progression.unlockedItems.push(achievement.unlockReward);
        }
        
        unlocked.push(achievement.id);
      }
    }
    
    return unlocked;
  }
  
  // ============================================================================
  // PRESTIGE
  // ============================================================================
  
  public async prestigePlayer(playerId: string): Promise<{ success: boolean; newPrestige: number }> {
    const progression = await this.getPlayerProgression(playerId);
    if (!progression) {
      return { success: false, newPrestige: 0 };
    }
    
    if (progression.level < MAX_LEVEL) {
      return { success: false, newPrestige: progression.prestige };
    }
    
    if (progression.prestige >= PRESTIGE_LEVELS) {
      return { success: false, newPrestige: progression.prestige };
    }
    
    // Prestige!
    progression.prestige++;
    progression.totalXp = 0;
    progression.level = 1;
    
    // Award prestige rewards
    const prestigeRewards = [
      `avatar_prestige_${progression.prestige}`,
      `border_prestige_${progression.prestige}`,
      `title_prestige_${progression.prestige}`,
    ];
    
    progression.unlockedItems.push(...prestigeRewards);
    
    this.cache.set(playerId, progression);
    this.dirtyPlayers.add(playerId);
    
    // Force save immediately
    await this.savePlayerProgression(playerId, progression);
    
    return { success: true, newPrestige: progression.prestige };
  }
  
  // ============================================================================
  // HELPERS
  // ============================================================================
  
  private getDefaultEquippedItems(): EquippedItems {
    return {
      title: null,
      nameplate: null,
      avatar: null,
      avatarBorder: null,
      profileBanner: null,
      emotes: [],
      victoryPose: null,
      loadingScreen: null,
    };
  }
  
  private getDefaultStats(): GlobalStats {
    return {
      totalGamesPlayed: 0,
      totalWins: 0,
      totalLosses: 0,
      totalPlaytime: 0,
      totalKills: 0,
      totalDeaths: 0,
      totalHeadshots: 0,
      totalDamageDealt: 0,
      totalScore: 0,
      highestKillStreak: 0,
      perfectGames: 0,
      tournamentsEntered: 0,
      tournamentsWon: 0,
    };
  }
  
  // ============================================================================
  // PERSISTENCE
  // ============================================================================
  
  private async flushDirtyPlayers(): Promise<void> {
    for (const playerId of this.dirtyPlayers) {
      const progression = this.cache.get(playerId);
      if (progression) {
        await this.savePlayerProgression(playerId, progression);
      }
    }
    this.dirtyPlayers.clear();
  }
  
  private async savePlayerProgression(playerId: string, progression: PlayerProgression): Promise<void> {
    try {
      await supabase
        .from('arcade_player_profiles')
        .update({
          total_xp: progression.totalXp,
          level: progression.level,
          prestige: progression.prestige,
          season_xp: progression.seasonXp,
          skill_points: progression.skillPoints,
          unlocked_items: progression.unlockedItems,
          equipped_items: progression.equippedItems,
          achievements: progression.achievements,
          battle_pass_premium: progression.battlePassPremium,
          global_stats: progression.stats,
          skill_trees: progression.skillTrees,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', playerId);
    } catch (error) {
      console.error('Error saving player progression:', error);
    }
  }
  
  public dispose(): void {
    if (this.saveInterval) {
      clearInterval(this.saveInterval);
      this.saveInterval = null;
    }
    
    // Final flush
    this.flushDirtyPlayers();
    this.cache.clear();
  }
}

export default ProgressionService;
