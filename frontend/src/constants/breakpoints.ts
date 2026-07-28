/**
 * Shared responsive breakpoints (px), referenced by useMediaQuery.ts and by
 * any component that needs its own custom query built from the same
 * numbers, so the cutoffs stay consistent instead of drifting per call site.
 */
export const BREAKPOINTS = {
  compactMobile: 430,
  tablet: 768,
  laptop: 1024,
} as const;
