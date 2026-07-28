/**
 * Multi-select category filter (toggleable pill buttons)
 */

import React from "react";
import { Category } from "../types";
import { COLORS } from "../constants/colors";
import { TYPOGRAPHY } from "../constants/typography";

interface CategoryFilterProps {
  categories: Category[];
  selected: string[];
  onChange: (selected: string[]) => void;
}

export function CategoryFilter({
  categories,
  selected,
  onChange,
}: CategoryFilterProps) {
  const toggleCategory = (name: string) => {
    onChange(
      selected.includes(name)
        ? selected.filter((c) => c !== name)
        : [...selected, name],
    );
  };

  const containerStyle: React.CSSProperties = {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
    paddingTop: "16px",
    paddingBottom: "16px",
  };

  const getChipStyle = (isActive: boolean): React.CSSProperties => ({
    padding: "8px 14px",
    fontSize: TYPOGRAPHY.size.sm,
    fontWeight: TYPOGRAPHY.weight.medium,
    border: "none",
    borderRadius: "999px",
    cursor: "pointer",
    transition: "all 0.2s",
    background: isActive ? COLORS.primary.p05 : COLORS.background.main,
    color: isActive ? COLORS.onAccent : COLORS.secondary.s08,
    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
  });

  return (
    <div style={containerStyle} role="group" aria-label="Filter by category">
      <button
        type="button"
        style={getChipStyle(selected.length === 0)}
        aria-pressed={selected.length === 0}
        onClick={() => onChange([])}
      >
        All
      </button>
      {categories.map((category) => {
        const isActive = selected.includes(category.name);
        return (
          <button
            key={category.id}
            type="button"
            style={getChipStyle(isActive)}
            aria-pressed={isActive}
            onClick={() => toggleCategory(category.name)}
          >
            <span>{category.emoji}</span>
            <span>{category.name}</span>
          </button>
        );
      })}
    </div>
  );
}
