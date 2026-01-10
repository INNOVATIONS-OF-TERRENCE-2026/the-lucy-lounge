// Lucy Timeline Engine
// Validates, recalculates, and manages shot sequences

import type { CinematicShot } from '../types/cinematic.types';

interface TimelineValidation {
  isValid: boolean;
  issues: string[];
  warnings: string[];
  totalDuration: number;
}

interface TimelineAdjustment {
  shots: CinematicShot[];
  adjustments: string[];
  newTotalDuration: number;
}

// Validate a timeline of shots
export function validateTimeline(
  shots: CinematicShot[],
  maxDuration: number
): TimelineValidation {
  const issues: string[] = [];
  const warnings: string[] = [];
  
  if (shots.length === 0) {
    issues.push('Timeline is empty - at least one shot required');
    return { isValid: false, issues, warnings, totalDuration: 0 };
  }
  
  let totalDuration = 0;
  const usedIds = new Set<string>();
  
  shots.forEach((shot, index) => {
    // Check for duplicate IDs
    if (usedIds.has(shot.id)) {
      issues.push(`Duplicate shot ID at position ${index + 1}`);
    }
    usedIds.add(shot.id);
    
    // Check for valid duration
    if (shot.duration <= 0) {
      issues.push(`Shot ${index + 1} "${shot.name}" has invalid duration: ${shot.duration}`);
    } else if (shot.duration < 1) {
      warnings.push(`Shot ${index + 1} "${shot.name}" is very short (${shot.duration}s)`);
    }
    
    // Check for empty prompts
    if (!shot.prompt || shot.prompt.trim().length < 5) {
      issues.push(`Shot ${index + 1} "${shot.name}" has no valid prompt`);
    }
    
    // Check for missing camera/movement
    if (!shot.camera) {
      warnings.push(`Shot ${index + 1} "${shot.name}" has no camera specification`);
    }
    
    totalDuration += shot.duration;
  });
  
  // Check total duration
  if (totalDuration > maxDuration) {
    issues.push(`Total duration (${totalDuration}s) exceeds maximum allowed (${maxDuration}s)`);
  }
  
  if (totalDuration < 1) {
    issues.push('Total duration is too short (minimum 1 second)');
  }
  
  return {
    isValid: issues.length === 0,
    issues,
    warnings,
    totalDuration,
  };
}

// Recalculate durations to fit within a target
export function fitToTarget(
  shots: CinematicShot[],
  targetDuration: number
): TimelineAdjustment {
  if (shots.length === 0) {
    return { shots: [], adjustments: ['No shots to adjust'], newTotalDuration: 0 };
  }
  
  const currentTotal = shots.reduce((sum, s) => sum + s.duration, 0);
  const adjustments: string[] = [];
  
  if (Math.abs(currentTotal - targetDuration) < 0.1) {
    return { shots, adjustments: ['No adjustment needed'], newTotalDuration: currentTotal };
  }
  
  const scale = targetDuration / currentTotal;
  adjustments.push(`Scaling all durations by ${(scale * 100).toFixed(1)}%`);
  
  const adjustedShots = shots.map((shot, index) => {
    const newDuration = Math.max(0.5, Math.round(shot.duration * scale * 10) / 10);
    
    if (newDuration !== shot.duration) {
      adjustments.push(`Shot ${index + 1}: ${shot.duration}s → ${newDuration}s`);
    }
    
    return {
      ...shot,
      duration: newDuration,
    };
  });
  
  // Handle rounding errors by adjusting the last shot
  const adjustedTotal = adjustedShots.reduce((sum, s) => sum + s.duration, 0);
  const diff = targetDuration - adjustedTotal;
  
  if (Math.abs(diff) > 0.1 && adjustedShots.length > 0) {
    const lastShot = adjustedShots[adjustedShots.length - 1];
    const correctedDuration = Math.max(0.5, lastShot.duration + diff);
    adjustedShots[adjustedShots.length - 1] = {
      ...lastShot,
      duration: Math.round(correctedDuration * 10) / 10,
    };
    adjustments.push(`Final correction: adjusted last shot to ${correctedDuration.toFixed(1)}s`);
  }
  
  const newTotalDuration = adjustedShots.reduce((sum, s) => sum + s.duration, 0);
  
  return {
    shots: adjustedShots,
    adjustments,
    newTotalDuration,
  };
}

// Reorder shots (for drag-and-drop)
export function reorderShots(
  shots: CinematicShot[],
  fromIndex: number,
  toIndex: number
): CinematicShot[] {
  if (fromIndex < 0 || fromIndex >= shots.length) return shots;
  if (toIndex < 0 || toIndex >= shots.length) return shots;
  if (fromIndex === toIndex) return shots;
  
  const result = [...shots];
  const [removed] = result.splice(fromIndex, 1);
  result.splice(toIndex, 0, removed);
  
  return result;
}

// Split a shot into multiple
export function splitShot(
  shots: CinematicShot[],
  shotIndex: number,
  splitCount: number = 2
): CinematicShot[] {
  if (shotIndex < 0 || shotIndex >= shots.length) return shots;
  if (splitCount < 2) return shots;
  
  const shot = shots[shotIndex];
  const newDuration = shot.duration / splitCount;
  
  const newShots: CinematicShot[] = [];
  for (let i = 0; i < splitCount; i++) {
    newShots.push({
      ...shot,
      id: `${shot.id}_split_${i}`,
      name: `${shot.name} (Part ${i + 1})`,
      duration: Math.round(newDuration * 10) / 10,
    });
  }
  
  const result = [...shots];
  result.splice(shotIndex, 1, ...newShots);
  
  return result;
}

// Merge consecutive shots
export function mergeShots(
  shots: CinematicShot[],
  startIndex: number,
  count: number = 2
): CinematicShot[] {
  if (startIndex < 0 || startIndex + count > shots.length) return shots;
  if (count < 2) return shots;
  
  const toMerge = shots.slice(startIndex, startIndex + count);
  const totalDuration = toMerge.reduce((sum, s) => sum + s.duration, 0);
  
  const merged: CinematicShot = {
    id: `merged_${Date.now()}`,
    name: toMerge.map(s => s.name).join(' + '),
    prompt: toMerge.map(s => s.prompt).join(', '),
    duration: totalDuration,
    camera: toMerge[0].camera,
    movement: 'continuous',
    transition: toMerge[toMerge.length - 1].transition,
    notes: `Merged from ${count} shots`,
  };
  
  const result = [...shots];
  result.splice(startIndex, count, merged);
  
  return result;
}

// Calculate timeline statistics
export function getTimelineStats(shots: CinematicShot[]) {
  if (shots.length === 0) {
    return {
      totalDuration: 0,
      averageDuration: 0,
      shortestShot: null,
      longestShot: null,
      shotCount: 0,
      transitions: [],
    };
  }
  
  const durations = shots.map(s => s.duration);
  const totalDuration = durations.reduce((a, b) => a + b, 0);
  
  return {
    totalDuration,
    averageDuration: totalDuration / shots.length,
    shortestShot: shots.reduce((min, s) => s.duration < min.duration ? s : min, shots[0]),
    longestShot: shots.reduce((max, s) => s.duration > max.duration ? s : max, shots[0]),
    shotCount: shots.length,
    transitions: shots.map(s => s.transition),
  };
}

// Generate timeline preview data (for visualization)
export function generateTimelinePreview(shots: CinematicShot[]) {
  let currentTime = 0;
  
  return shots.map(shot => {
    const start = currentTime;
    const end = currentTime + shot.duration;
    currentTime = end;
    
    return {
      id: shot.id,
      name: shot.name,
      start,
      end,
      duration: shot.duration,
      widthPercent: 0, // Will be calculated based on total
    };
  }).map((item, _, arr) => {
    const total = arr.length > 0 ? arr[arr.length - 1].end : 1;
    return {
      ...item,
      widthPercent: (item.duration / total) * 100,
    };
  });
}
