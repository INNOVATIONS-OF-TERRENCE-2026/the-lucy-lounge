/**
 * ┌─────────────────────────────────────────────────────────────────────────────┐
 * │ THE LUCY LOUNGE — DIVERSITY PASS                                           │
 * │                                                                             │
 * │ Third stage of the recommendation pipeline: ensures diversity in the       │
 * │ final list by avoiding repetition and promoting variety                    │
 * │ PHASE 2 IMPLEMENTATION                                                      │
 * └─────────────────────────────────────────────────────────────────────────────┘
 */

import type { MediaNode, MediaType, MediaCategory } from '@/media/types';
import type { RankedCandidate } from './ranker';

// =============================================================================
// TYPES
// =============================================================================

export interface DiversityConfig {
  // Maximum same-type items in sequence
  maxSameTypeInRow: number;
  maxSameGenreInRow: number;
  maxSameCreatorInRow: number;
  
  // Diversity targets (percentages)
  minMediaTypeVariety: number; // 0-1, minimum unique media types
  minGenreVariety: number; // 0-1, minimum unique genres
  
  // Serendipity
  serendipityRate: number; // 0-1, chance to insert unexpected content
  
  // Position rules
  heroSlotMinScore: number; // Minimum score for hero position
  mustIncludeNewRelease: boolean;
  mustIncludeTrending: boolean;
}

export interface DiversityContext {
  targetSize: number;
  category?: MediaCategory;
  recentlyShownIds?: string[];
}

export interface DiversifiedResult {
  items: RankedCandidate[];
  diversityScore: number;
  diversityReport: DiversityReport;
}

export interface DiversityReport {
  uniqueMediaTypes: number;
  uniqueGenres: number;
  uniqueCreators: number;
  serendipityItems: number;
  demotedItems: number;
  promotedItems: number;
}

// =============================================================================
// DEFAULT CONFIG
// =============================================================================

export const DEFAULT_DIVERSITY_CONFIG: DiversityConfig = {
  maxSameTypeInRow: 3,
  maxSameGenreInRow: 3,
  maxSameCreatorInRow: 2,
  minMediaTypeVariety: 0.3,
  minGenreVariety: 0.4,
  serendipityRate: 0.1,
  heroSlotMinScore: 0.7,
  mustIncludeNewRelease: true,
  mustIncludeTrending: true,
};

// =============================================================================
// DIVERSITY PASS CLASS
// =============================================================================

export class DiversityPass {
  private config: DiversityConfig;

  constructor(config: Partial<DiversityConfig> = {}) {
    this.config = { ...DEFAULT_DIVERSITY_CONFIG, ...config };
  }

  /**
   * Main entry point: applies diversity constraints to ranked candidates
   */
  applyDiversity(
    rankedCandidates: RankedCandidate[],
    context: DiversityContext
  ): DiversifiedResult {
    const report: DiversityReport = {
      uniqueMediaTypes: 0,
      uniqueGenres: 0,
      uniqueCreators: 0,
      serendipityItems: 0,
      demotedItems: 0,
      promotedItems: 0,
    };

    // 1. Filter out recently shown
    let candidates = this.filterRecentlyShown(
      rankedCandidates,
      context.recentlyShownIds || []
    );

    // 2. Ensure required items are included
    candidates = this.ensureRequiredItems(candidates, report);

    // 3. Apply interleaving for diversity
    candidates = this.applyInterleaving(candidates, report);

    // 4. Inject serendipity
    candidates = this.injectSerendipity(candidates, rankedCandidates, report);

    // 5. Trim to target size
    const finalItems = candidates.slice(0, context.targetSize);

    // 6. Calculate diversity score
    const diversityScore = this.calculateDiversityScore(finalItems, report);

    return {
      items: finalItems,
      diversityScore,
      diversityReport: report,
    };
  }

  /**
   * Filter out items recently shown to the user
   */
  private filterRecentlyShown(
    candidates: RankedCandidate[],
    recentlyShownIds: string[]
  ): RankedCandidate[] {
    const recentSet = new Set(recentlyShownIds);
    return candidates.filter(c => !recentSet.has(c.node.id));
  }

  /**
   * Ensure required items (new releases, trending) are in the list
   */
  private ensureRequiredItems(
    candidates: RankedCandidate[],
    report: DiversityReport
  ): RankedCandidate[] {
    const result = [...candidates];

    if (this.config.mustIncludeNewRelease) {
      const hasNewRelease = result.slice(0, 10).some(c => 
        c.sources.includes('new_release')
      );

      if (!hasNewRelease) {
        const newReleaseIndex = result.findIndex(c => 
          c.sources.includes('new_release')
        );

        if (newReleaseIndex > 10) {
          // Promote new release to position 3-5
          const [newRelease] = result.splice(newReleaseIndex, 1);
          const insertPosition = Math.min(4, result.length);
          result.splice(insertPosition, 0, newRelease);
          report.promotedItems++;
        }
      }
    }

    if (this.config.mustIncludeTrending) {
      const hasTrending = result.slice(0, 10).some(c => 
        c.sources.includes('trending')
      );

      if (!hasTrending) {
        const trendingIndex = result.findIndex(c => 
          c.sources.includes('trending')
        );

        if (trendingIndex > 10) {
          const [trending] = result.splice(trendingIndex, 1);
          const insertPosition = Math.min(6, result.length);
          result.splice(insertPosition, 0, trending);
          report.promotedItems++;
        }
      }
    }

    return result;
  }

  /**
   * Apply interleaving to prevent monotonous sequences
   */
  private applyInterleaving(
    candidates: RankedCandidate[],
    report: DiversityReport
  ): RankedCandidate[] {
    const result: RankedCandidate[] = [];
    const remaining = [...candidates];
    
    // Track consecutive items
    let consecutiveType = 0;
    let lastType: MediaType | undefined;

    while (remaining.length > 0 && result.length < candidates.length) {
      let selectedIndex = 0;

      // Check if we need to break monotony
      if (consecutiveType >= this.config.maxSameTypeInRow && result.length > 0) {
        // Find next item with different type
        const differentTypeIndex = remaining.findIndex(c => 
          c.node.media_type !== lastType
        );

        if (differentTypeIndex !== -1) {
          selectedIndex = differentTypeIndex;
          report.demotedItems++;
        }
      }

      const selected = remaining[selectedIndex];
      remaining.splice(selectedIndex, 1);
      result.push(selected);

      // Update tracking
      if (selected.node.media_type === lastType) {
        consecutiveType++;
      } else {
        consecutiveType = 1;
        lastType = selected.node.media_type;
      }
    }

    return result;
  }

  /**
   * Inject serendipitous items for discovery
   */
  private injectSerendipity(
    candidates: RankedCandidate[],
    allCandidates: RankedCandidate[],
    report: DiversityReport
  ): RankedCandidate[] {
    if (this.config.serendipityRate <= 0) {
      return candidates;
    }

    const result = [...candidates];
    const usedIds = new Set(result.map(c => c.node.id));

    // Find "surprise" candidates (lower ranked but interesting)
    const surpriseCandidates = allCandidates.filter(c => 
      !usedIds.has(c.node.id) && 
      c.sources.includes('editorial_pick')
    );

    // Calculate number of serendipity slots
    const serendipitySlots = Math.floor(result.length * this.config.serendipityRate);

    for (let i = 0; i < serendipitySlots && i < surpriseCandidates.length; i++) {
      // Insert at random position in latter half
      const insertPosition = Math.floor(result.length / 2) + 
        Math.floor(Math.random() * (result.length / 2));
      
      result.splice(insertPosition, 0, surpriseCandidates[i]);
      report.serendipityItems++;
    }

    return result;
  }

  /**
   * Calculate overall diversity score
   */
  private calculateDiversityScore(
    items: RankedCandidate[],
    report: DiversityReport
  ): number {
    if (items.length === 0) return 0;

    // Count unique values
    const mediaTypes = new Set(items.map(i => i.node.media_type));
    const creators = new Set<string>();
    
    // Collect creator IDs (would come from credits in real implementation)
    report.uniqueMediaTypes = mediaTypes.size;
    report.uniqueCreators = creators.size;

    // Calculate diversity score (0-1)
    const typeVariety = mediaTypes.size / Math.min(items.length, 5);
    const targetMet = typeVariety >= this.config.minMediaTypeVariety ? 1 : typeVariety / this.config.minMediaTypeVariety;

    return Math.min(1, targetMet);
  }
}

// =============================================================================
// FACTORY
// =============================================================================

export function createDiversityPass(
  config?: Partial<DiversityConfig>
): DiversityPass {
  return new DiversityPass(config);
}

export default DiversityPass;
