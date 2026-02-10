/**
 * Auth module barrel export — The Lucy Lounge (OS Shell)
 * 
 * Exports all auth-related utilities including cross-domain session handoff.
 */

export {
  generateHandoffToken,
  buildHandoffURL,
  navigateToVision,
  consumeHandoffToken,
  isHandoffSession,
  getAllowedRedirectDomains,
  isAllowedRedirect,
} from './sessionHandoff';

export type {
  HandoffToken,
  HandoffResult,
} from './sessionHandoff';
