/**
 * Form component for adding/editing expenses
 */

import React, { useState } from "react";
import { Category, ExpenseFormData } from "../types";
import { TextField, SelectBox, Button } from "../vibes";
import { useExpenseForm } from "../hooks/useExpenseForm";
import { useCategories } from "../hooks/useCategories";
import { formatDate } from "../utils/expenseUtils";
import { AddCategoryModal } from "./AddCategoryModal";

interface ExpenseFormProps {
  initialData?: Partial<ExpenseFormData>;
  onSubmit: (data: ExpenseFormData) => Promise<void>;
  onCancel?: () => void;
  submitLabel?: string;
}

export function ExpenseForm({
  initialData,
  onSubmit,
  onCancel,
  submitLabel = "Add Expense",
}: ExpenseFormProps) {
  const { formData, errors, isSubmitting, handleChange, handleSubmit } =
    useExpenseForm({
      initialData,
      onSubmit,
    });
  const { categories, addCategory } = useCategories();
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);

  const formStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
  };

  const buttonGroupStyle: React.CSSProperties = {
    display: "flex",
    gap: "0.5rem",
    marginTop: "0.5rem",
  };

  const categoryRowStyle: React.CSSProperties = {
    display: "flex",
    gap: "0.5rem",
    alignItems: "flex-end",
  };

  const categoryOptions = categories.map((category) => ({
    value: category.name,
    label: `${category.emoji} ${category.name}`,
  }));

  const handleCategoryCreated = (category: Category) => {
    handleChange("category", category.name);
  };

  return (
    <>
      <form onSubmit={handleSubmit} style={formStyle}>
        <TextField
          label="Amount"
          type="number"
          step="0.01"
          placeholder="0.00"
          value={formData.amount}
          onChange={(e) => handleChange("amount", e.target.value)}
          error={errors.amount}
          fullWidth
          required
        />

        <TextField
          label="Description"
          type="text"
          placeholder="Enter description"
          value={formData.description}
          onChange={(e) => handleChange("description", e.target.value)}
          error={errors.description}
          fullWidth
          required
        />

        <div style={categoryRowStyle}>
          <div style={{ flex: 1 }}>
            <SelectBox
              label="Category"
              options={categoryOptions}
              value={formData.category}
              onChange={(e) => handleChange("category", e.target.value)}
              error={errors.category}
              fullWidth
              required
            />
          </div>
          <Button
            type="button"
            variant="secondary"
            onClick={() => setIsAddCategoryOpen(true)}
          >
            + Add Category
          </Button>
        </div>

        <TextField
          label="Date"
          type="date"
          max={formatDate(new Date())}
          value={formData.date}
          onChange={(e) => handleChange("date", e.target.value)}
          error={errors.date}
          fullWidth
          required
        />

        <div style={buttonGroupStyle}>
          <Button
            type="submit"
            variant="primary"
            disabled={isSubmitting}
            fullWidth
          >
            {isSubmitting ? "Submitting..." : submitLabel}
          </Button>
          {onCancel && (
            <Button
              type="button"
              variant="secondary"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
          )}
        </div>
      </form>

      <AddCategoryModal
        isOpen={isAddCategoryOpen}
        onClose={() => setIsAddCategoryOpen(false)}
        existingNames={categories.map((c) => c.name)}
        onCreate={addCategory}
        onCreated={handleCategoryCreated}
      />
    </>
  );
}