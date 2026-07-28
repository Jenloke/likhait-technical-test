/**
 * Month navigation component
 */

import React from "react";
import { COLORS } from "../constants/colors";
import { TYPOGRAPHY } from "../constants/typography";
import { useIsMobile } from "../hooks/useMediaQuery";

interface MonthNavigationProps {
  currentMonth: number;
  currentYear: number;
  onMonthChange: (month: number, year: number) => void;
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

const MONTHS = [
  { label: "Jan", value: 1 },
  { label: "Feb", value: 2 },
  { label: "Mar", value: 3 },
  { label: "Apr", value: 4 },
  { label: "May", value: 5 },
  { label: "Jun", value: 6 },
  { label: "Jul", value: 7 },
  { label: "Aug", value: 8 },
  { label: "Sep", value: 9 },
  { label: "Oct", value: 10 },
  { label: "Nov", value: 11 },
  { label: "Dec", value: 12 },
];

export function MonthNavigation({
  currentMonth,
  currentYear,
  onMonthChange,
}: MonthNavigationProps) {
  const isMobile = useIsMobile();

  const handlePreviousMonth = () => {
    if (currentMonth === 1) {
      onMonthChange(12, currentYear - 1);
    } else {
      onMonthChange(currentMonth - 1, currentYear);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 12) {
      onMonthChange(1, currentYear + 1);
    } else {
      onMonthChange(currentMonth + 1, currentYear);
    }
  };

  const wrapperStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: isMobile ? "8px" : "16px",
    paddingTop: "16px",
    paddingBottom: "16px",
    paddingLeft: 0,
    // A bit of breathing room after the right-hand arrow so it doesn't sit
    // flush against the page edge on narrow screens.
    paddingRight: isMobile ? "12px" : 0,
    minWidth: 0,
  };

  const containerStyle: React.CSSProperties = {
    display: "grid",
    // minmax(0, 1fr), not bare 1fr — a bare <flex> track won't shrink below
    // its content's intrinsic width, so the row overflowed its container
    // (and the page) at any viewport narrower than the content's natural sum.
    gridTemplateColumns: "repeat(12, minmax(0, 1fr))",
    gap: "6px",
    maxWidth: "900px",
    // No separate marginRight — wrapperStyle's own gap already separates
    // this from the next-month arrow; a second margin on top of that was
    // stealing width the 12 columns needed to avoid truncating.
    flex: "1 1 0%",
    minWidth: 0,
  };

  const navigationButtonStyle: React.CSSProperties = {
    padding: isMobile ? "10px 12px" : "10px 10px",
    fontWeight: TYPOGRAPHY.weight.medium,
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    transition: "all 0.2s",
    background: COLORS.primary.p05,
    color: COLORS.onAccent,
    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
    minWidth: "40px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  };

  const getMonthButtonStyle = (month: number): React.CSSProperties => ({
    padding: "10px 2px",
    fontSize: TYPOGRAPHY.size.sm,
    fontWeight: TYPOGRAPHY.weight.medium,
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    transition: "all 0.2s",
    minWidth: 0,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    background:
      currentMonth === month ? COLORS.primary.p05 : COLORS.background.main,
    color: currentMonth === month ? COLORS.onAccent : COLORS.secondary.s08,
    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
  });

  const mobileSelectStyle: React.CSSProperties = {
    // A fixed, modest width instead of flex:1 — letting it fill the whole
    // row between the arrows made it balloon far wider than the month name
    // it displays actually needs.
    flex: "0 1 auto",
    width: "150px",
    maxWidth: "55vw",
    padding: "10px 8px",
    fontSize: TYPOGRAPHY.size.base,
    fontWeight: TYPOGRAPHY.weight.semibold,
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    background: COLORS.primary.p05,
    color: COLORS.onAccent,
    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
    textAlign: "center",
    textAlignLast: "center",
  };

  return (
    <div style={wrapperStyle}>
      <button
        style={navigationButtonStyle}
        onClick={handlePreviousMonth}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = COLORS.primary.p04;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = COLORS.primary.p05;
        }}
        title="Previous month"
      >
        <ChevronIcon direction="left" />
      </button>
      {isMobile ? (
        <select
          aria-label="Select month"
          style={mobileSelectStyle}
          value={currentMonth}
          onChange={(e) => onMonthChange(Number(e.target.value), currentYear)}
        >
          {MONTHS.map((month) => (
            <option key={month.value} value={month.value}>
              {month.label}
            </option>
          ))}
        </select>
      ) : (
        <div style={containerStyle}>
          {MONTHS.map((month) => (
            <button
              key={month.value}
              style={getMonthButtonStyle(month.value)}
              onClick={() => onMonthChange(month.value, currentYear)}
              onMouseEnter={(e) => {
                if (currentMonth !== month.value) {
                  e.currentTarget.style.background = COLORS.secondary.s02;
                }
              }}
              onMouseLeave={(e) => {
                if (currentMonth !== month.value) {
                  e.currentTarget.style.background = COLORS.background.main;
                }
              }}
            >
              {month.label}
            </button>
          ))}
        </div>
      )}
      <button
        style={navigationButtonStyle}
        onClick={handleNextMonth}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = COLORS.primary.p04;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = COLORS.primary.p05;
        }}
        title="Next month"
      >
        <ChevronIcon direction="right" />
      </button>
    </div>
  );
}
