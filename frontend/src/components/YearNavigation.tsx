import React from "react";
import { COLORS } from "../constants/colors";
import { TYPOGRAPHY } from "../constants/typography";
import { useIsMobile } from "../hooks/useMediaQuery";

interface YearNavigationProps {
  currentYear: number;
  onYearChange: (year: number) => void;
}

function ChevronIcon({ direction }: { direction: "left" | "right" }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={direction === "left" ? "M15 18l-6-6 6-6" : "M9 18l6-6-6-6"} />
    </svg>
  );
}

export function YearNavigation({
  currentYear,
  onYearChange,
}: YearNavigationProps) {
  const isMobile = useIsMobile();

  const containerStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: isMobile ? "10px" : "16px",
  };

  const buttonStyle: React.CSSProperties = {
    width: isMobile ? "36px" : "48px",
    height: isMobile ? "36px" : "48px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: COLORS.background.main,
    border: `1px solid ${COLORS.secondary.s04}`,
    borderRadius: "8px",
    cursor: "pointer",
    color: COLORS.secondary.s08,
    transition: "all 0.2s",
    flexShrink: 0,
  };

  // Deliberately smaller than the "Expense History" title (xl/24px on
  // mobile, 3xl/40px on desktop) and a step lighter (s09 vs s10) so this
  // reads as a subordinate control, not a second heading competing with it.
  // Desktop uses the same "statNumber" size as the TOTAL amount elsewhere —
  // a big number, but clearly not the page title.
  const yearStyle: React.CSSProperties = {
    fontSize: isMobile ? TYPOGRAPHY.size.lg : TYPOGRAPHY.role.statNumber.size,
    fontWeight: TYPOGRAPHY.weight.bold,
    color: isMobile ? COLORS.secondary.s09 : COLORS.secondary.s10,
    minWidth: isMobile ? "56px" : "120px",
    textAlign: "center",
  };

  return (
    <div style={containerStyle}>
      <button
        style={buttonStyle}
        onClick={() => onYearChange(currentYear - 1)}
        aria-label="Previous year"
        onMouseEnter={(e) => {
          e.currentTarget.style.background = COLORS.secondary.s02;
          e.currentTarget.style.borderColor = COLORS.secondary.s05;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = COLORS.background.main;
          e.currentTarget.style.borderColor = COLORS.secondary.s04;
        }}
      >
        <ChevronIcon direction="left" />
      </button>
      <div style={yearStyle}>{currentYear}</div>
      <button
        style={buttonStyle}
        onClick={() => onYearChange(currentYear + 1)}
        aria-label="Next year"
        onMouseEnter={(e) => {
          e.currentTarget.style.background = COLORS.secondary.s02;
          e.currentTarget.style.borderColor = COLORS.secondary.s05;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = COLORS.background.main;
          e.currentTarget.style.borderColor = COLORS.secondary.s04;
        }}
      >
        <ChevronIcon direction="right" />
      </button>
    </div>
  );
}

export default YearNavigation;
