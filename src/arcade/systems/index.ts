/**
 * ┌─────────────────────────────────────────────────────────────────────────────┐
 * │ LUCY ARCADE — SYSTEMS INDEX                                                 │
 * │                                                                             │
 * │ Export all platform systems                                                 │
 * └─────────────────────────────────────────────────────────────────────────────┘
 */

// Progression System
export {
  ProgressionService,
  type PlayerProgression,
  type GlobalStats,
  type SkillTreeProgress,
  type SkillNode,
  type SkillEffect,
  type Achievement,
  type AchievementRequirement,
  type BattlePassTier,
  type BattlePassReward,
  type UnlockableItem,
  type EquippedItems,
  XP_SOURCES,
  SKILL_TREE_CATEGORIES,
  FPS_SKILL_TREE,
  ACHIEVEMENTS,
  CURRENT_BATTLE_PASS,
  generateBattlePassTiers,
} from './ProgressionSystem';

// Esports System
export {
  EsportsService,
  type Tournament,
  type TournamentFormat,
  type TournamentStatus,
  type TournamentParticipant,
  type TournamentBracket,
  type TournamentMatch,
  type MatchStatus,
  type PrizeDistribution,
  type SpectatorSession,
  type SpectatorViewMode,
  type SpectatorDirectorState,
  type Replay,
  type ReplayPlayer,
  type ReplaySnapshot,
  type ReplayHighlight,
  type ReplayKeyMoment,
  type EntityState,
  type GameEvent,
  type AntiCheatReport,
  type AntiCheatReportType,
  type AntiCheatEvidence,
  type PlayerSanction,
  type InputValidation,
} from './EsportsSystem';
