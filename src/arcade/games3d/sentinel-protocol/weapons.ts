/**
 * ┌─────────────────────────────────────────────────────────────────────────────┐
 * │ LUCY: SENTINEL PROTOCOL — WEAPON DEFINITIONS                               │
 * │                                                                             │
 * │ Complete arsenal with realistic ballistics and handling                    │
 * └─────────────────────────────────────────────────────────────────────────────┘
 */

import type { WeaponDefinition } from './types';

// ============================================================================
// PISTOLS
// ============================================================================

export const SENTINEL_P9: WeaponDefinition = {
  id: 'sentinel_p9',
  name: 'Sentinel P9',
  category: 'pistol',
  ammoType: 'light',
  fireMode: 'semi',
  
  baseDamage: 26,
  headshotMultiplier: 2.0,
  limbDamageMultiplier: 0.75,
  damageDropoffStart: 20,
  damageDropoffEnd: 50,
  minDamagePercent: 0.6,
  
  bulletSpeed: 380,
  bulletDrop: 0.4,
  penetration: 0.2,
  
  fireRate: 400,
  
  magazineSize: 15,
  reloadTime: 1.6,
  reloadType: 'magazine',
  
  baseSpread: 0.015,
  moveSpreadPenalty: 0.02,
  jumpSpreadPenalty: 0.08,
  adsSpreadBonus: 0.4,
  spreadRecoveryRate: 3.0,
  maxSpread: 0.1,
  
  recoilVertical: 0.025,
  recoilHorizontal: 0.008,
  recoilRecoveryRate: 8.0,
  
  adsZoomLevel: 1.1,
  adsTime: 0.15,
  
  muzzleFlashSize: 0.8,
  tracerFrequency: 1,
};

export const HARBINGER_45: WeaponDefinition = {
  id: 'harbinger_45',
  name: 'Harbinger .45',
  category: 'pistol',
  ammoType: 'medium',
  fireMode: 'semi',
  
  baseDamage: 42,
  headshotMultiplier: 1.8,
  limbDamageMultiplier: 0.8,
  damageDropoffStart: 15,
  damageDropoffEnd: 40,
  minDamagePercent: 0.5,
  
  bulletSpeed: 320,
  bulletDrop: 0.5,
  penetration: 0.35,
  
  fireRate: 240,
  
  magazineSize: 8,
  reloadTime: 1.8,
  reloadType: 'magazine',
  
  baseSpread: 0.02,
  moveSpreadPenalty: 0.025,
  jumpSpreadPenalty: 0.1,
  adsSpreadBonus: 0.35,
  spreadRecoveryRate: 2.5,
  maxSpread: 0.12,
  
  recoilVertical: 0.04,
  recoilHorizontal: 0.012,
  recoilRecoveryRate: 6.0,
  
  adsZoomLevel: 1.15,
  adsTime: 0.18,
  
  muzzleFlashSize: 1.0,
  tracerFrequency: 1,
};

// ============================================================================
// SUBMACHINE GUNS
// ============================================================================

export const VIPER_SMG: WeaponDefinition = {
  id: 'viper_smg',
  name: 'Viper SMG',
  category: 'smg',
  ammoType: 'light',
  fireMode: 'auto',
  
  baseDamage: 18,
  headshotMultiplier: 1.6,
  limbDamageMultiplier: 0.85,
  damageDropoffStart: 12,
  damageDropoffEnd: 35,
  minDamagePercent: 0.55,
  
  bulletSpeed: 360,
  bulletDrop: 0.5,
  penetration: 0.15,
  
  fireRate: 900,
  
  magazineSize: 32,
  reloadTime: 2.0,
  reloadType: 'magazine',
  
  baseSpread: 0.03,
  moveSpreadPenalty: 0.015,
  jumpSpreadPenalty: 0.06,
  adsSpreadBonus: 0.45,
  spreadRecoveryRate: 4.0,
  maxSpread: 0.15,
  
  recoilVertical: 0.018,
  recoilHorizontal: 0.01,
  recoilRecoveryRate: 10.0,
  
  adsZoomLevel: 1.2,
  adsTime: 0.2,
  
  muzzleFlashSize: 0.7,
  tracerFrequency: 3,
};

export const SPECTRE_9: WeaponDefinition = {
  id: 'spectre_9',
  name: 'Spectre-9',
  category: 'smg',
  ammoType: 'light',
  fireMode: 'auto',
  
  baseDamage: 22,
  headshotMultiplier: 1.5,
  limbDamageMultiplier: 0.8,
  damageDropoffStart: 15,
  damageDropoffEnd: 40,
  minDamagePercent: 0.5,
  
  bulletSpeed: 380,
  bulletDrop: 0.45,
  penetration: 0.2,
  
  fireRate: 750,
  
  magazineSize: 25,
  reloadTime: 1.8,
  reloadType: 'magazine',
  
  baseSpread: 0.025,
  moveSpreadPenalty: 0.018,
  jumpSpreadPenalty: 0.07,
  adsSpreadBonus: 0.5,
  spreadRecoveryRate: 3.5,
  maxSpread: 0.12,
  
  recoilVertical: 0.022,
  recoilHorizontal: 0.008,
  recoilRecoveryRate: 9.0,
  
  adsZoomLevel: 1.25,
  adsTime: 0.22,
  
  muzzleFlashSize: 0.75,
  tracerFrequency: 3,
};

// ============================================================================
// ASSAULT RIFLES
// ============================================================================

export const PHANTOM_AR: WeaponDefinition = {
  id: 'phantom_ar',
  name: 'Phantom AR',
  category: 'rifle',
  ammoType: 'medium',
  fireMode: 'auto',
  
  baseDamage: 28,
  headshotMultiplier: 1.75,
  limbDamageMultiplier: 0.85,
  damageDropoffStart: 25,
  damageDropoffEnd: 75,
  minDamagePercent: 0.65,
  
  bulletSpeed: 550,
  bulletDrop: 0.25,
  penetration: 0.4,
  
  fireRate: 600,
  
  magazineSize: 30,
  reloadTime: 2.4,
  reloadType: 'magazine',
  
  baseSpread: 0.012,
  moveSpreadPenalty: 0.025,
  jumpSpreadPenalty: 0.1,
  adsSpreadBonus: 0.6,
  spreadRecoveryRate: 2.5,
  maxSpread: 0.08,
  
  recoilVertical: 0.032,
  recoilHorizontal: 0.01,
  recoilRecoveryRate: 7.0,
  
  adsZoomLevel: 1.4,
  adsTime: 0.25,
  
  muzzleFlashSize: 1.0,
  tracerFrequency: 3,
};

export const VANDAL_556: WeaponDefinition = {
  id: 'vandal_556',
  name: 'Vandal 5.56',
  category: 'rifle',
  ammoType: 'medium',
  fireMode: 'auto',
  
  baseDamage: 32,
  headshotMultiplier: 1.9,
  limbDamageMultiplier: 0.8,
  damageDropoffStart: 30,
  damageDropoffEnd: 85,
  minDamagePercent: 0.7,
  
  bulletSpeed: 600,
  bulletDrop: 0.2,
  penetration: 0.45,
  
  fireRate: 520,
  
  magazineSize: 25,
  reloadTime: 2.6,
  reloadType: 'magazine',
  
  baseSpread: 0.01,
  moveSpreadPenalty: 0.03,
  jumpSpreadPenalty: 0.12,
  adsSpreadBonus: 0.65,
  spreadRecoveryRate: 2.2,
  maxSpread: 0.07,
  
  recoilVertical: 0.038,
  recoilHorizontal: 0.014,
  recoilRecoveryRate: 6.0,
  
  adsZoomLevel: 1.5,
  adsTime: 0.28,
  
  muzzleFlashSize: 1.1,
  tracerFrequency: 2,
};

export const BULLDOG_762: WeaponDefinition = {
  id: 'bulldog_762',
  name: 'Bulldog 7.62',
  category: 'rifle',
  ammoType: 'heavy',
  fireMode: 'auto',
  
  baseDamage: 38,
  headshotMultiplier: 1.7,
  limbDamageMultiplier: 0.85,
  damageDropoffStart: 35,
  damageDropoffEnd: 90,
  minDamagePercent: 0.75,
  
  bulletSpeed: 620,
  bulletDrop: 0.18,
  penetration: 0.55,
  
  fireRate: 450,
  
  magazineSize: 20,
  reloadTime: 2.8,
  reloadType: 'magazine',
  
  baseSpread: 0.008,
  moveSpreadPenalty: 0.035,
  jumpSpreadPenalty: 0.14,
  adsSpreadBonus: 0.7,
  spreadRecoveryRate: 2.0,
  maxSpread: 0.06,
  
  recoilVertical: 0.045,
  recoilHorizontal: 0.016,
  recoilRecoveryRate: 5.0,
  
  adsZoomLevel: 1.6,
  adsTime: 0.3,
  
  muzzleFlashSize: 1.2,
  tracerFrequency: 2,
};

// ============================================================================
// SHOTGUNS
// ============================================================================

export const DEVASTATOR_SG: WeaponDefinition = {
  id: 'devastator_sg',
  name: 'Devastator SG',
  category: 'shotgun',
  ammoType: 'shells',
  fireMode: 'semi',
  
  baseDamage: 14, // Per pellet
  headshotMultiplier: 1.5,
  limbDamageMultiplier: 0.9,
  damageDropoffStart: 8,
  damageDropoffEnd: 20,
  minDamagePercent: 0.3,
  
  bulletSpeed: 280,
  bulletDrop: 0.8,
  penetration: 0.1,
  
  fireRate: 80,
  
  magazineSize: 6,
  reloadTime: 0.45,
  reloadType: 'shell',
  
  baseSpread: 0.08,
  moveSpreadPenalty: 0.02,
  jumpSpreadPenalty: 0.04,
  adsSpreadBonus: 0.3,
  spreadRecoveryRate: 2.0,
  maxSpread: 0.12,
  
  recoilVertical: 0.08,
  recoilHorizontal: 0.025,
  recoilRecoveryRate: 4.0,
  
  adsZoomLevel: 1.1,
  adsTime: 0.2,
  
  pelletCount: 8,
  
  muzzleFlashSize: 1.5,
  tracerFrequency: 1,
};

export const JUDGE_AUTO: WeaponDefinition = {
  id: 'judge_auto',
  name: 'Judge Auto',
  category: 'shotgun',
  ammoType: 'shells',
  fireMode: 'auto',
  
  baseDamage: 10,
  headshotMultiplier: 1.4,
  limbDamageMultiplier: 0.85,
  damageDropoffStart: 6,
  damageDropoffEnd: 15,
  minDamagePercent: 0.25,
  
  bulletSpeed: 260,
  bulletDrop: 0.9,
  penetration: 0.08,
  
  fireRate: 200,
  
  magazineSize: 10,
  reloadTime: 2.5,
  reloadType: 'magazine',
  
  baseSpread: 0.1,
  moveSpreadPenalty: 0.025,
  jumpSpreadPenalty: 0.05,
  adsSpreadBonus: 0.25,
  spreadRecoveryRate: 2.5,
  maxSpread: 0.15,
  
  recoilVertical: 0.06,
  recoilHorizontal: 0.03,
  recoilRecoveryRate: 5.0,
  
  adsZoomLevel: 1.0,
  adsTime: 0.18,
  
  pelletCount: 6,
  
  muzzleFlashSize: 1.3,
  tracerFrequency: 1,
};

// ============================================================================
// SNIPER RIFLES
// ============================================================================

export const OPERATOR_SR: WeaponDefinition = {
  id: 'operator_sr',
  name: 'Operator SR',
  category: 'sniper',
  ammoType: 'heavy',
  fireMode: 'semi',
  
  baseDamage: 115,
  headshotMultiplier: 2.5,
  limbDamageMultiplier: 0.7,
  damageDropoffStart: 100,
  damageDropoffEnd: 300,
  minDamagePercent: 0.85,
  
  bulletSpeed: 900,
  bulletDrop: 0.08,
  penetration: 0.8,
  
  fireRate: 40,
  
  magazineSize: 5,
  reloadTime: 3.2,
  reloadType: 'magazine',
  
  baseSpread: 0.001,
  moveSpreadPenalty: 0.05,
  jumpSpreadPenalty: 0.2,
  adsSpreadBonus: 0.95,
  spreadRecoveryRate: 1.5,
  maxSpread: 0.02,
  
  recoilVertical: 0.12,
  recoilHorizontal: 0.02,
  recoilRecoveryRate: 2.0,
  
  adsZoomLevel: 4.0,
  adsTime: 0.4,
  
  muzzleFlashSize: 1.8,
  tracerFrequency: 1,
};

export const MARSHAL_DMR: WeaponDefinition = {
  id: 'marshal_dmr',
  name: 'Marshal DMR',
  category: 'sniper',
  ammoType: 'heavy',
  fireMode: 'semi',
  
  baseDamage: 72,
  headshotMultiplier: 2.0,
  limbDamageMultiplier: 0.8,
  damageDropoffStart: 50,
  damageDropoffEnd: 150,
  minDamagePercent: 0.8,
  
  bulletSpeed: 750,
  bulletDrop: 0.12,
  penetration: 0.6,
  
  fireRate: 120,
  
  magazineSize: 10,
  reloadTime: 2.6,
  reloadType: 'magazine',
  
  baseSpread: 0.003,
  moveSpreadPenalty: 0.04,
  jumpSpreadPenalty: 0.15,
  adsSpreadBonus: 0.85,
  spreadRecoveryRate: 2.0,
  maxSpread: 0.03,
  
  recoilVertical: 0.06,
  recoilHorizontal: 0.015,
  recoilRecoveryRate: 4.0,
  
  adsZoomLevel: 2.5,
  adsTime: 0.32,
  
  muzzleFlashSize: 1.4,
  tracerFrequency: 1,
};

// ============================================================================
// HEAVY WEAPONS
// ============================================================================

export const ODIN_LMG: WeaponDefinition = {
  id: 'odin_lmg',
  name: 'Odin LMG',
  category: 'heavy',
  ammoType: 'heavy',
  fireMode: 'auto',
  
  baseDamage: 36,
  headshotMultiplier: 1.6,
  limbDamageMultiplier: 0.85,
  damageDropoffStart: 30,
  damageDropoffEnd: 80,
  minDamagePercent: 0.7,
  
  bulletSpeed: 580,
  bulletDrop: 0.22,
  penetration: 0.65,
  
  fireRate: 650,
  
  magazineSize: 100,
  reloadTime: 5.0,
  reloadType: 'belt',
  
  baseSpread: 0.025,
  moveSpreadPenalty: 0.04,
  jumpSpreadPenalty: 0.18,
  adsSpreadBonus: 0.55,
  spreadRecoveryRate: 1.8,
  maxSpread: 0.1,
  
  recoilVertical: 0.028,
  recoilHorizontal: 0.018,
  recoilRecoveryRate: 6.0,
  
  adsZoomLevel: 1.35,
  adsTime: 0.35,
  
  muzzleFlashSize: 1.3,
  tracerFrequency: 4,
};

export const ARES_HMG: WeaponDefinition = {
  id: 'ares_hmg',
  name: 'Ares HMG',
  category: 'heavy',
  ammoType: 'heavy',
  fireMode: 'auto',
  
  baseDamage: 42,
  headshotMultiplier: 1.5,
  limbDamageMultiplier: 0.9,
  damageDropoffStart: 35,
  damageDropoffEnd: 100,
  minDamagePercent: 0.75,
  
  bulletSpeed: 600,
  bulletDrop: 0.2,
  penetration: 0.75,
  
  fireRate: 500,
  
  magazineSize: 75,
  reloadTime: 4.5,
  reloadType: 'belt',
  
  baseSpread: 0.02,
  moveSpreadPenalty: 0.045,
  jumpSpreadPenalty: 0.2,
  adsSpreadBonus: 0.5,
  spreadRecoveryRate: 1.5,
  maxSpread: 0.09,
  
  recoilVertical: 0.035,
  recoilHorizontal: 0.02,
  recoilRecoveryRate: 5.0,
  
  adsZoomLevel: 1.4,
  adsTime: 0.38,
  
  muzzleFlashSize: 1.5,
  tracerFrequency: 3,
};

// ============================================================================
// WEAPON COLLECTION
// ============================================================================

export const ALL_WEAPONS: Record<string, WeaponDefinition> = {
  // Pistols
  sentinel_p9: SENTINEL_P9,
  harbinger_45: HARBINGER_45,
  
  // SMGs
  viper_smg: VIPER_SMG,
  spectre_9: SPECTRE_9,
  
  // Rifles
  phantom_ar: PHANTOM_AR,
  vandal_556: VANDAL_556,
  bulldog_762: BULLDOG_762,
  
  // Shotguns
  devastator_sg: DEVASTATOR_SG,
  judge_auto: JUDGE_AUTO,
  
  // Snipers
  operator_sr: OPERATOR_SR,
  marshal_dmr: MARSHAL_DMR,
  
  // Heavy
  odin_lmg: ODIN_LMG,
  ares_hmg: ARES_HMG,
};

export const WEAPON_CATEGORIES = {
  pistol: [SENTINEL_P9, HARBINGER_45],
  smg: [VIPER_SMG, SPECTRE_9],
  rifle: [PHANTOM_AR, VANDAL_556, BULLDOG_762],
  shotgun: [DEVASTATOR_SG, JUDGE_AUTO],
  sniper: [OPERATOR_SR, MARSHAL_DMR],
  heavy: [ODIN_LMG, ARES_HMG],
};

export const getWeaponById = (id: string): WeaponDefinition | undefined => {
  return ALL_WEAPONS[id];
};

export const getWeaponsByCategory = (category: string): WeaponDefinition[] => {
  return WEAPON_CATEGORIES[category as keyof typeof WEAPON_CATEGORIES] || [];
};
