/**
 * Modal for creating a new expense category
 */

import React, { useState } from "react";
import { Category } from "../types";
import { COLORS } from "../constants/colors";
import { TYPOGRAPHY } from "../constants/typography";
import { Modal, TextField, Button } from "../vibes";

const EMOJI_OPTIONS = [
  "📦",
  "🍔",
  "🚗",
  "🎬",
  "🛍️",
  "📄",
  "🏥",
  "📚",
  "✈️",
  "💰",
  "🎁",
  "🐾",
  "💡",
  "🏠",
  "🎮",
  "☕",
  "🎵",
  "🧾",
  "🚕",
  "💊",
];

interface AddCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  existingNames: string[];
  onCreate: (name: string, emoji: string) => Promise<Category>;
  onCreated: (category: Category) => void;
}

export function AddCategoryModal({
  isOpen,
  onClose,
  existingNames,
  onCreate,
  onCreated,
}: AddCategoryModalProps) {
  const [name, setName] = useState("");
  const [emoji, setEmoji] = useState(EMOJI_OPTIONS[0]);
  const [nameError, setNameError] = useState<string | undefined>();
  const [submitError, setSubmitError] = useState<string | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetAndClose = () => {
    setName("");
    setEmoji(EMOJI_OPTIONS[0]);
    setNameError(undefined);
    setSubmitError(undefined);
    setIsSubmitting(false);
    onClose();
  };

  // Escape / backdrop click / the modal's "x" button all funnel through this;
  // ignore them mid-submit so they can't abandon an in-flight request the
  // Cancel button (disabled while isSubmitting) already blocks.
  const handleModalClose = () => {
    if (!isSubmitting) {
      resetAndClose();
    }
  };

  const validateName = (value: string): string | undefined => {
    const trimmed = value.trim();
    if (!trimmed) {
      return "Category name is required";
    }
    if (trimmed.length > 100) {
      return "Category name must be 100 characters or fewer";
    }
    if (existingNames.some((n) => n.toLowerCase() === trimmed.toLowerCase())) {
      return "A category with this name already exists";
    }
    return undefined;
  };

  const handleNameChange = (value: string) => {
    setName(value);
    if (nameError) {
      setNameError(undefined);
    }
    if (submitError) {
      setSubmitError(undefined);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const error = validateName(name);
    if (error) {
      setNameError(error);
      return;
    }

    setIsSubmitting(true);
    setSubmitError(undefined);
    try {
      const category = await onCreate(name.trim(), emoji);
      onCreated(category);
      resetAndClose();
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : "Failed to create category",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const formStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
  };

  const errorBannerStyle: React.CSSProperties = {
    fontSize: TYPOGRAPHY.size.sm,
    color: COLORS.danger,
    backgroundColor: COLORS.red.re02,
    padding: "0.5rem 0.75rem",
    borderRadius: "0.375rem",
  };

  const emojiLabelStyle: React.CSSProperties = {
    fontSize: TYPOGRAPHY.size.sm,
    fontWeight: TYPOGRAPHY.weight.semibold,
    color: COLORS.text.primary,
  };

  const gridStyle: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: "repeat(6, 1fr)",
    gap: "0.5rem",
    marginTop: "0.5rem",
  };

  const emojiButtonStyle = (selected: boolean): React.CSSProperties => ({
    fontSize: TYPOGRAPHY.size.lg,
    lineHeight: TYPOGRAPHY.lineHeight.none,
    padding: "0.5rem",
    borderRadius: "0.375rem",
    border: `1px solid ${selected ? COLORS.primary.p06 : COLORS.border}`,
    backgroundColor: selected ? COLORS.primary.p01 : COLORS.background.main,
    cursor: "pointer",
  });

  const buttonGroupStyle: React.CSSProperties = {
    display: "flex",
    gap: "0.5rem",
    marginTop: "0.5rem",
  };

  return (
    <Modal isOpen={isOpen} onClose={handleModalClose} title="Add Category">
      <form onSubmit={handleSubmit} style={formStyle}>
        {submitError && <div style={errorBannerStyle}>{submitError}</div>}

        <TextField
          label="Category Name"
          type="text"
          placeholder="e.g. Groceries"
          value={name}
          onChange={(e) => handleNameChange(e.target.value)}
          error={nameError}
          fullWidth
        />

        <div>
          <label style={emojiLabelStyle}>Emoji</label>
          <div style={gridStyle}>
            {EMOJI_OPTIONS.map((option) => (
              <button
                type="button"
                key={option}
                style={emojiButtonStyle(option === emoji)}
                onClick={() => setEmoji(option)}
                aria-label={`Choose ${option} emoji`}
                aria-pressed={option === emoji}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        <div style={buttonGroupStyle}>
          <Button
            type="submit"
            variant="primary"
            disabled={isSubmitting}
            fullWidth
          >
            {isSubmitting ? "Adding..." : "Add Category"}
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={resetAndClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
        </div>
      </form>
    </Modal>
  );
}