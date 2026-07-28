/**
 * Reusable SelectBox component
 */

import React from "react";
import { COLORS } from "../constants/colors";
import { TYPOGRAPHY } from "../constants/typography";

interface SelectBoxProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  fullWidth?: boolean;
  options: Array<{ value: string; label: string }>;
}

export function SelectBox({
  label,
  error,
  fullWidth = false,
  options,
  id,
  ...props
}: SelectBoxProps) {
  const generatedId = React.useId();
  const selectId = id ?? generatedId;

  const containerStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem",
    width: fullWidth ? "100%" : "auto",
  };

  const labelStyle: React.CSSProperties = {
    fontSize: TYPOGRAPHY.size.sm,
    fontWeight: TYPOGRAPHY.weight.semibold,
    color: COLORS.text.primary,
  };

  const selectStyle: React.CSSProperties = {
    padding: "0.5rem 0.75rem",
    fontSize: TYPOGRAPHY.size.base,
    border: `1px solid ${error ? COLORS.danger : COLORS.border}`,
    borderRadius: "0.375rem",
    outline: "none",
    transition: "border-color 0.2s",
    backgroundColor: COLORS.background.main,
    color: COLORS.text.primary,
    cursor: "pointer",
  };

  const errorStyle: React.CSSProperties = {
    fontSize: TYPOGRAPHY.size.xs,
    color: COLORS.danger,
    marginTop: "-0.25rem",
  };

  return (
    <div style={containerStyle}>
      {label && (
        <label style={labelStyle} htmlFor={selectId}>
          {label}
        </label>
      )}
      <select id={selectId} style={selectStyle} {...props}>
        <option value="">Select...</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <span style={errorStyle}>{error}</span>}
    </div>
  );
}
