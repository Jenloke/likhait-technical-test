/**
 * Generic donut chart + legend primitive. Consumers supply pre-aggregated,
 * pre-colored slices (identity/color assignment is the caller's job — this
 * component only lays the ring and legend out) plus a value formatter.
 */

import React from "react";
import { COLORS } from "../constants/colors";
import { TYPOGRAPHY } from "../constants/typography";

export interface PieChartDatum {
  label: string;
  value: number;
  color: string;
  icon?: string;
  // Optional secondary count shown in the legend alongside the formatted
  // value (e.g. "12 transactions") — the "countable" requirement this
  // chart exists for: identity and magnitude must both be readable from
  // the legend text, never from the slice color/size alone.
  count?: number;
}

interface PieChartProps {
  data: PieChartDatum[];
  formatValue: (value: number) => string;
  size?: number;
  centerLabel?: string;
  centerValue?: string;
  countLabel?: (count: number) => string;
}

const STROKE_WIDTH = 28;
// Visual break between adjacent slices — the "surface gap" spacer instead
// of an outline, so neighbors read as distinct without adding mark-weight ink.
const GAP_DEGREES = 2;
// Below this share, a slice is too thin for its own percentage label to sit
// on the ring without colliding with its neighbors — the legend still
// carries the exact figure.
const MIN_LABEL_SHARE = 0.08;

export function PieChart({
  data,
  formatValue,
  size = 220,
  centerLabel,
  centerValue,
  countLabel,
}: PieChartProps) {
  const total = data.reduce((sum, d) => sum + d.value, 0);
  const radius = size / 2;
  const ringRadius = radius - STROKE_WIDTH / 2;
  const circumference = 2 * Math.PI * ringRadius;

  const containerStyle: React.CSSProperties = {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    gap: "32px",
  };

  const svgWrapperStyle: React.CSSProperties = {
    position: "relative",
    width: size,
    height: size,
    flexShrink: 0,
  };

  const centerTextWrapStyle: React.CSSProperties = {
    position: "absolute",
    inset: 0,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    padding: "0 12px",
    pointerEvents: "none",
  };

  const centerValueStyle: React.CSSProperties = {
    fontSize: TYPOGRAPHY.role.statNumber.size,
    fontWeight: TYPOGRAPHY.role.statNumber.weight,
    color: COLORS.text.primary,
    lineHeight: TYPOGRAPHY.lineHeight.tight,
  };

  const centerLabelStyle: React.CSSProperties = {
    fontSize: TYPOGRAPHY.size.xs,
    color: COLORS.text.secondary,
  };

  const legendStyle: React.CSSProperties = {
    flex: "1 1 220px",
    minWidth: 0,
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  };

  const legendRowStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  };

  const swatchStyle = (color: string): React.CSSProperties => ({
    width: "12px",
    height: "12px",
    borderRadius: "3px",
    background: color,
    flexShrink: 0,
  });

  const legendLabelStyle: React.CSSProperties = {
    flex: 1,
    minWidth: 0,
    display: "flex",
    alignItems: "center",
    gap: "6px",
    color: COLORS.text.primary,
    fontSize: TYPOGRAPHY.size.sm,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  };

  const legendValueStyle: React.CSSProperties = {
    fontSize: TYPOGRAPHY.size.sm,
    fontWeight: TYPOGRAPHY.weight.semibold,
    color: COLORS.text.primary,
    flexShrink: 0,
  };

  const legendMetaStyle: React.CSSProperties = {
    fontSize: TYPOGRAPHY.size.xs,
    color: COLORS.text.secondary,
    flexShrink: 0,
  };

  if (total <= 0) {
    return null;
  }

  let cumulativeDegrees = 0;

  return (
    <div style={containerStyle}>
      <div style={svgWrapperStyle}>
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          role="img"
          aria-label={
            centerLabel && centerValue
              ? `${centerLabel}: ${centerValue}`
              : "Pie chart"
          }
        >
          {data.map((slice, index) => {
            const share = slice.value / total;
            const grossDegrees = share * 360;
            const netDegrees = Math.max(grossDegrees - GAP_DEGREES, 0);
            const arcLength = (netDegrees / 360) * circumference;
            const rotation = cumulativeDegrees - 90 + GAP_DEGREES / 2;
            cumulativeDegrees += grossDegrees;

            const showLabel = share >= MIN_LABEL_SHARE;
            const midAngleRad =
              ((rotation + netDegrees / 2) * Math.PI) / 180;
            const labelX = radius + ringRadius * Math.cos(midAngleRad);
            const labelY = radius + ringRadius * Math.sin(midAngleRad);

            return (
              <React.Fragment key={index}>
                <circle
                  cx={radius}
                  cy={radius}
                  r={ringRadius}
                  fill="none"
                  stroke={slice.color}
                  strokeWidth={STROKE_WIDTH}
                  strokeDasharray={`${arcLength} ${circumference - arcLength}`}
                  transform={`rotate(${rotation} ${radius} ${radius})`}
                />
                {showLabel && (
                  <text
                    x={labelX}
                    y={labelY}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fontSize={TYPOGRAPHY.size.xs}
                    fontWeight={TYPOGRAPHY.weight.semibold}
                    fill={COLORS.onAccent}
                  >
                    {Math.round(share * 100)}%
                  </text>
                )}
              </React.Fragment>
            );
          })}
        </svg>
        {(centerLabel || centerValue) && (
          <div style={centerTextWrapStyle}>
            {centerValue && <span style={centerValueStyle}>{centerValue}</span>}
            {centerLabel && <span style={centerLabelStyle}>{centerLabel}</span>}
          </div>
        )}
      </div>

      <div style={legendStyle} role="list" aria-label="Chart legend">
        {data.map((slice, index) => (
          <div key={index} style={legendRowStyle} role="listitem">
            <span style={swatchStyle(slice.color)} aria-hidden="true" />
            <span style={legendLabelStyle}>
              {slice.icon && <span aria-hidden="true">{slice.icon}</span>}
              <span
                style={{ overflow: "hidden", textOverflow: "ellipsis" }}
              >
                {slice.label}
              </span>
            </span>
            {typeof slice.count === "number" && (
              <span style={legendMetaStyle}>
                {countLabel ? countLabel(slice.count) : `${slice.count}×`}
              </span>
            )}
            <span style={legendValueStyle}>{formatValue(slice.value)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
