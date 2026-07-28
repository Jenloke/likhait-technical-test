/**
 * Hidden theme picker — opened by clicking the "$" logo icon in the
 * sidebar (see Sidebar.tsx). Modeled after monkeytype's own theme picker:
 * a grid of swatch cards, clicking one applies it immediately and the
 * modal stays open so you can keep browsing.
 */

import React from "react";
import { COLORS } from "../constants/colors";
import { TYPOGRAPHY } from "../constants/typography";
import { useTheme } from "../hooks/useTheme";
import { Modal } from "../vibes";

interface ThemeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ThemeModal({ isOpen, onClose }: ThemeModalProps) {
  const { theme, setTheme, themes } = useTheme();

  const gridStyle: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
    gap: "0.75rem",
  };

  const cardStyle = (isActive: boolean): React.CSSProperties => ({
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "0.5rem",
    padding: "1rem 0.75rem",
    borderRadius: "0.5rem",
    border: `2px solid ${isActive ? COLORS.primary.p06 : COLORS.border}`,
    backgroundColor: isActive ? COLORS.primary.p01 : COLORS.background.main,
    cursor: "pointer",
    position: "relative",
  });

  const emojiStyle: React.CSSProperties = {
    fontSize: TYPOGRAPHY.size.xl,
    lineHeight: TYPOGRAPHY.lineHeight.none,
  };

  const labelStyle: React.CSSProperties = {
    fontSize: TYPOGRAPHY.size.sm,
    fontWeight: TYPOGRAPHY.weight.semibold,
    color: COLORS.text.primary,
  };

  const descriptionStyle: React.CSSProperties = {
    fontSize: TYPOGRAPHY.size.xs,
    color: COLORS.text.secondary,
    textAlign: "center",
  };

  const swatchRowStyle: React.CSSProperties = {
    display: "flex",
    gap: "0.25rem",
  };

  const swatchDotStyle = (color: string): React.CSSProperties => ({
    width: "14px",
    height: "14px",
    borderRadius: "50%",
    backgroundColor: color,
    border: `1px solid ${COLORS.border}`,
  });

  const checkBadgeStyle: React.CSSProperties = {
    position: "absolute",
    top: "0.5rem",
    right: "0.5rem",
    fontSize: TYPOGRAPHY.size.sm,
    color: COLORS.primary.p07,
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Choose a theme" maxWidth="480px">
      <div style={gridStyle}>
        {themes.map((option) => {
          const isActive = option.id === theme;
          return (
            <button
              type="button"
              key={option.id}
              style={cardStyle(isActive)}
              onClick={() => setTheme(option.id)}
              aria-label={`Use ${option.label} theme`}
              aria-pressed={isActive}
            >
              {isActive && <span style={checkBadgeStyle}>✓</span>}
              <span style={emojiStyle}>{option.emoji}</span>
              <span style={labelStyle}>{option.label}</span>
              <span style={descriptionStyle}>{option.description}</span>
              <span style={swatchRowStyle}>
                {option.swatches.map((color, index) => (
                  <span key={index} style={swatchDotStyle(color)} />
                ))}
              </span>
            </button>
          );
        })}
      </div>
    </Modal>
  );
}
