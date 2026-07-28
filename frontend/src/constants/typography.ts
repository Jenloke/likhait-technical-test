/**
 * Typography scale
 *
 * Components today hardcode their own fontSize literals, mixing px and rem
 * for what are often the same visual size (e.g. "32px" in one file and
 * "2rem" in another). This is the single scale to reference instead —
 * expressed in rem (matching the existing convention in vibes/) so text
 * still respects the user's browser font-size/zoom setting.
 */

export const TYPOGRAPHY = {
  // Primitive size scale. Reach for the semantic role names below first;
  // fall back to these directly only when a role doesn't fit.
  size: {
    xs: "0.75rem", // 12px — fine print, helper/error text
    sm: "0.875rem", // 14px — secondary/meta text, small buttons
    base: "1rem", // 16px — body text, inputs, default buttons
    md: "1.125rem", // 18px — nav items, emphasized body text
    lg: "1.25rem", // 20px — compact headings, modal titles
    xl: "1.5rem", // 24px — section headings, card totals
    "2xl": "2rem", // 32px — large stat numbers
    "3xl": "2.5rem", // 40px — page titles
  },

  weight: {
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },

  lineHeight: {
    none: 1, // tightly-packed glyph buttons (×, chevrons)
    tight: 1.2,
    normal: 1.5,
  },

  // Named by role rather than raw size, so a component picks "what this
  // text IS" (a page title, a caption) rather than a pixel value — the
  // underlying size can evolve in one place without hunting call sites.
  role: {
    pageTitle: { size: "2.5rem", weight: 700 }, // 40px
    sectionTitle: { size: "1.5rem", weight: 700 }, // 24px
    statNumber: { size: "2rem", weight: 700 }, // 32px
    modalTitle: { size: "1.25rem", weight: 700 }, // 20px
    navItem: { size: "1.125rem", weight: 500 }, // 18px
    body: { size: "1rem", weight: 400 }, // 16px
    label: { size: "0.875rem", weight: 600 }, // 14px
    caption: { size: "0.75rem", weight: 400 }, // 12px
  },
} as const;
