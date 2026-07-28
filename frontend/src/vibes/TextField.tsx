/**
 * Reusable TextField component
 */

import React from "react";
import { COLORS } from "../constants/colors";
import { TYPOGRAPHY } from "../constants/typography";

interface TextFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  fullWidth?: boolean;
}

export function TextField({
  label,
  error,
  fullWidth = false,
  id,
  ...props
}: TextFieldProps) {
  const generatedId = React.useId();
  const inputId = id ?? generatedId;

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

  const inputStyle: React.CSSProperties = {
    padding: "0.5rem 0.75rem",
    fontSize: TYPOGRAPHY.size.base,
    border: `1px solid ${error ? COLORS.danger : COLORS.border}`,
    borderRadius: "0.375rem",
    outline: "none",
    transition: "border-color 0.2s",
    backgroundColor: COLORS.background.main,
    color: COLORS.text.primary,
  };

  const errorStyle: React.CSSProperties = {
    fontSize: TYPOGRAPHY.size.xs,
    color: COLORS.danger,
    marginTop: "-0.25rem",
  };

  return (
    <div style={containerStyle}>
      {label && (
        <label style={labelStyle} htmlFor={inputId}>
          {label}
        </label>
      )}
      <input id={inputId} style={inputStyle} {...props} />
      {error && <span style={errorStyle}>{error}</span>}
    </div>
  );
}
