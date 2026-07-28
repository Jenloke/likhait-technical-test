/**
 * Vibes Color System
 *
 * Every value here is a CSS custom property reference, not a literal hex
 * string — the actual hex values live in `../theme.css` as a `:root`
 * (default) block plus one `[data-theme="..."]` override block per theme
 * (see `themes.ts` for the theme registry, `hooks/useTheme.ts` for how the
 * active theme gets applied). Keeping this object's shape/keys unchanged
 * means every existing call site (`COLORS.primary.p05`, etc.) keeps working
 * untouched — the browser resolves the var() live, so switching the
 * `data-theme` attribute on <html> reskins the whole app with no
 * component-level code changes.
 */

export const COLORS = {
  // Primary colors (brand accent ramp)
  primary: {
    p01: "var(--ex-primary-p01)",
    p02: "var(--ex-primary-p02)",
    p03: "var(--ex-primary-p03)",
    p04: "var(--ex-primary-p04)",
    p05: "var(--ex-primary-p05)",
    p06: "var(--ex-primary-p06)",
    p07: "var(--ex-primary-p07)",
    p08: "var(--ex-primary-p08)",
    p09: "var(--ex-primary-p09)",
    p10: "var(--ex-primary-p10)",
  },
  // Secondary colors (neutral ramp)
  secondary: {
    s01: "var(--ex-secondary-s01)",
    s02: "var(--ex-secondary-s02)",
    s03: "var(--ex-secondary-s03)",
    s04: "var(--ex-secondary-s04)",
    s05: "var(--ex-secondary-s05)",
    s06: "var(--ex-secondary-s06)",
    s07: "var(--ex-secondary-s07)",
    s08: "var(--ex-secondary-s08)",
    s09: "var(--ex-secondary-s09)",
    s10: "var(--ex-secondary-s10)",
  },
  // Red — categorical hue, intentionally identical across all themes (see
  // module comment above): encodes category/status meaning, not brand chrome.
  red: {
    re02: "#fad2d7",
    re04: "#f07882",
    re05: "#dc1e32",
    re07: "#a51428",
    re10: "#6e0f19",
  },
  // Orange
  orange: {
    or02: "#ffe1d2",
    or04: "#ffaa78",
    or05: "#fa6414",
    or07: "#be4b0f",
    or10: "#7d320a",
  },
  // Yellow
  yellow: {
    ye02: "#fff0d2",
    ye04: "#ffd278",
    ye05: "#ffb91e",
    ye07: "#be8c14",
    ye10: "#825a0f",
  },
  // Yellow Green
  yellowGreen: {
    yg02: "#e6f0d2",
    yg04: "#b4dc7d",
    yg05: "#82c31e",
    yg07: "#50961e",
    yg10: "#3c5f14",
  },
  // Green
  green: {
    gr02: "#cdebd7",
    gr04: "#64be8c",
    gr05: "#00963c",
    gr07: "#006e2d",
    gr10: "#004b1e",
  },
  // Blue Green
  blueGreen: {
    bg02: "#cdf0f0",
    bg04: "#64d2d2",
    bg05: "#00b9b9",
    bg07: "#008c8c",
    bg10: "#146464",
  },
  // Backwards compatible mappings
  accent: {
    a01: "#dc1e32", // Maps to red.re05
    a02: "#f07882", // Maps to red.re04
    a03: "#a51428", // Maps to red.re07
  },
  success: "#00963c", // Maps to green.gr05
  warning: "#ffb91e", // Maps to yellow.ye05
  danger: "#dc1e32", // Maps to red.re05
  info: "#00b9b9", // Maps to blueGreen.bg05
  text: {
    primary: "var(--ex-text-primary)",
    secondary: "var(--ex-text-secondary)",
    light: "var(--ex-text-light)",
  },
  border: "var(--ex-border)",
  background: {
    main: "var(--ex-background-main)",
    card: "var(--ex-background-card)",
    hover: "var(--ex-background-hover)",
  },
  // Text/icon color to place on top of a solid accent fill (primary button
  // backgrounds, the selected month cell, etc.) — kept separate from
  // `text.*` because those are always read against `background.*`, while
  // this is read against `primary.p05`/`p06` or `danger`/`success`. Themed
  // per-theme so dark themes (whose accent fill is often already light/
  // saturated) can pick a dark on-accent color instead of white-on-white.
  onAccent: "var(--ex-on-accent)",
} as const;
