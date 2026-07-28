/**
 * Theme registry backing the hidden theme picker (opened via the "$" logo
 * icon in the sidebar — see components/ThemeModal.tsx). The actual color
 * values applied per theme live in ../theme.css as `[data-theme="..."]`
 * blocks; `swatches` here are literal hex duplicates used only to render
 * the small preview dots in the picker UI, so keep them in sync by hand
 * with theme.css if a palette changes.
 */

export type ThemeId = "default" | "wavez" | "modern-dolch" | "bento";

export interface ThemeDefinition {
  id: ThemeId;
  label: string;
  emoji: string;
  description: string;
  // [background, accent, sub, text] — matches theme.css's
  // background-main / primary-p05 / secondary-s06 / text-primary.
  swatches: [string, string, string, string];
}

export const THEMES: ThemeDefinition[] = [
  {
    id: "default",
    label: "Vibes",
    emoji: "💙",
    description: "The original look",
    swatches: ["#ffffff", "#2864f0", "#bebaba", "#464343"],
  },
  {
    id: "wavez",
    label: "Wavez",
    emoji: "🌊",
    description: "Dark ocean, glowing cyan",
    swatches: ["#071c26", "#22a8c9", "#2c5f6e", "#dff5fb"],
  },
  {
    id: "modern-dolch",
    label: "Modern Dolch",
    emoji: "🍃",
    description: "Charcoal with a mint accent",
    swatches: ["#2d2e30", "#4fa89e", "#797d82", "#e3e6eb"],
  },
  {
    id: "bento",
    label: "Bento",
    emoji: "🍱",
    description: "Warm cream and terracotta",
    swatches: ["#fdf8f2", "#ec8552", "#c7a97e", "#4a3628"],
  },
];

export const DEFAULT_THEME_ID: ThemeId = "default";
