/**
 * Reusable Button component
 */

import React from "react";
import { COLORS } from "../constants/colors";
import { TYPOGRAPHY } from "../constants/typography";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "success";
  size?: "small" | "medium" | "large";
  fullWidth?: boolean;
}

export function Button({
  variant = "primary",
  size = "medium",
  fullWidth = false,
  children,
  disabled,
  ...props
}: ButtonProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case "primary":
        return {
          backgroundColor: COLORS.primary.p06,
          color: "white",
          border: "none",
        };
      case "secondary":
        return {
          backgroundColor: COLORS.secondary.s02,
          color: COLORS.text.primary,
          border: `1px solid ${COLORS.border}`,
        };
      case "danger":
        return {
          backgroundColor: COLORS.danger,
          color: "white",
          border: "none",
        };
      case "success":
        return {
          backgroundColor: COLORS.success,
          color: "white",
          border: "none",
        };
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case "small":
        return { padding: "0.375rem 0.75rem", fontSize: TYPOGRAPHY.size.sm };
      case "medium":
        return { padding: "0.5rem 1rem", fontSize: TYPOGRAPHY.size.base };
      case "large":
        return { padding: "0.75rem 1.5rem", fontSize: TYPOGRAPHY.size.md };
    }
  };

  const styles: React.CSSProperties = {
    ...getVariantStyles(),
    ...getSizeStyles(),
    width: fullWidth ? "100%" : "auto",
    borderRadius: "0.375rem",
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.6 : 1,
    fontWeight: TYPOGRAPHY.weight.semibold,
    transition: "all 0.2s",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "0.5rem",
  };

  return (
    <button style={styles} disabled={disabled} {...props}>
      {children}
    </button>
  );
}
