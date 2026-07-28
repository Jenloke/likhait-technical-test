/**
 * Calendar expense table component
 */

import React, { useState } from "react";
import { Expense, ExpenseFormData } from "../types";
import { formatCurrency, formatDate } from "../utils/expenseUtils";
import { useCategories } from "../hooks/useCategories";
import { useIsMobile } from "../hooks/useMediaQuery";
import { COLORS } from "../constants/colors";
import { TYPOGRAPHY } from "../constants/typography";
import { AnimatedCollapse, Button, Modal, Pagination, SelectBox } from "../vibes";
import { ExpenseForm } from "./ExpenseForm.tsx";
import { deleteExpense, updateExpense } from "../services/api";

interface CalendarExpenseTableProps {
  expenses: Expense[];
  onExpenseUpdated: () => void;
}

const PAGE_SIZE_OPTIONS = [10, 25, 50];

export function CalendarExpenseTable({
  expenses,
  onExpenseUpdated,
}: CalendarExpenseTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGE_SIZE_OPTIONS[0]);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [deletingExpense, setDeletingExpense] = useState<Expense | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const isMobile = useIsMobile();
  const { categories } = useCategories();
  const emojiByName = new Map(categories.map((c) => [c.name, c.emoji]));
  const getCategoryEmoji = (category: string) =>
    emojiByName.get(category) || "📦";

  const totalPages = Math.ceil(expenses.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const currentExpenses = expenses.slice(startIndex, endIndex);

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setCurrentPage(1);
  };

  const handleEdit = (expense: Expense) => {
    setEditingExpense(expense);
    setIsEditModalOpen(true);
  };

  const handleDelete = (expense: Expense) => {
    setDeletingExpense(expense);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!deletingExpense) return;
    try {
      await deleteExpense(deletingExpense.id);
      setIsDeleteModalOpen(false);
      setDeletingExpense(null);
      onExpenseUpdated();
    } catch (error) {
      console.error("Failed to delete expense:", error);
      alert("Failed to delete expense");
    }
  };

  const handleUpdate = async (data: ExpenseFormData) => {
    if (!editingExpense) return;
    try {
      await updateExpense(editingExpense.id, data);
      setIsEditModalOpen(false);
      setEditingExpense(null);
      onExpenseUpdated();
    } catch (error) {
      console.error("Failed to update expense:", error);
      throw error;
    }
  };

  const tableStyle: React.CSSProperties = {
    width: "100%",
    borderCollapse: "collapse",
    backgroundColor: COLORS.background.main,
    borderRadius: "0.5rem",
    overflow: "hidden",
    border: `1px solid ${COLORS.border}`,
  };

  const theadStyle: React.CSSProperties = {
    backgroundColor: COLORS.background.card,
  };

  const thStyle: React.CSSProperties = {
    padding: "0.75rem",
    textAlign: "left",
    fontWeight: TYPOGRAPHY.weight.semibold,
    color: COLORS.text.primary,
    borderBottom: `2px solid ${COLORS.border}`,
  };

  const tdStyle: React.CSSProperties = {
    padding: "0.75rem",
    borderBottom: `1px solid ${COLORS.border}`,
    color: COLORS.text.primary,
  };

  const emptyStyle: React.CSSProperties = {
    padding: "2rem",
    textAlign: "center",
    color: COLORS.text.secondary,
  };

  const actionButtonsStyle: React.CSSProperties = {
    display: "flex",
    gap: "0.5rem",
  };

  const cardListStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem",
  };

  const cardStyle: React.CSSProperties = {
    backgroundColor: COLORS.background.main,
    border: `1px solid ${COLORS.border}`,
    borderRadius: "0.5rem",
    overflow: "hidden",
  };

  const cardSummaryStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
    padding: "0.75rem",
    cursor: "pointer",
  };

  const cardMainInfoStyle: React.CSSProperties = {
    flex: 1,
    minWidth: 0,
    display: "flex",
    flexDirection: "column",
    gap: "0.15rem",
  };

  const cardDescStyle: React.CSSProperties = {
    fontWeight: TYPOGRAPHY.weight.semibold,
    color: COLORS.text.primary,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  };

  const cardDateStyle: React.CSSProperties = {
    fontSize: TYPOGRAPHY.size.xs,
    color: COLORS.text.secondary,
  };

  const cardAmountStyle: React.CSSProperties = {
    fontWeight: TYPOGRAPHY.weight.semibold,
    color: COLORS.text.primary,
    flexShrink: 0,
  };

  const cardChevronStyle = (isOpen: boolean): React.CSSProperties => ({
    flexShrink: 0,
    transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
    transition: "transform 0.2s ease",
    color: COLORS.text.secondary,
  });

  const cardDetailStyle: React.CSSProperties = {
    padding: "0 0.75rem 0.75rem",
    borderTop: `1px solid ${COLORS.border}`,
    display: "flex",
    flexDirection: "column",
    gap: "0.75rem",
  };

  const cardCategoryRowStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    color: COLORS.text.primary,
    paddingTop: "0.75rem",
  };

  const paginationBarStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexWrap: "wrap",
    gap: "0.5rem",
  };

  if (expenses.length === 0) {
    return (
      <div style={tableStyle}>
        <div style={emptyStyle}>
          No expenses found. Add your first expense to get started!
        </div>
      </div>
    );
  }

  return (
    <>
      {isMobile ? (
        <div style={cardListStyle}>
          {currentExpenses.map((expense) => {
            const isExpanded = expandedId === expense.id;
            return (
              <div key={expense.id} style={cardStyle}>
                <div
                  style={cardSummaryStyle}
                  role="button"
                  tabIndex={0}
                  onClick={() =>
                    setExpandedId(isExpanded ? null : expense.id)
                  }
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setExpandedId(isExpanded ? null : expense.id);
                    }
                  }}
                >
                  <span>{getCategoryEmoji(expense.category)}</span>
                  <div style={cardMainInfoStyle}>
                    <span style={cardDescStyle}>{expense.description}</span>
                    <span style={cardDateStyle}>
                      {formatDate(new Date(expense.date))}
                    </span>
                  </div>
                  <span style={cardAmountStyle}>
                    {formatCurrency(expense.amount)}
                  </span>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="currentColor"
                    style={cardChevronStyle(isExpanded)}
                  >
                    <path d="M8 11l-5-5h10z" />
                  </svg>
                </div>
                <AnimatedCollapse isOpen={isExpanded}>
                  <div style={cardDetailStyle}>
                    <div style={cardCategoryRowStyle}>
                      <span>Category:</span>
                      <strong>{expense.category}</strong>
                    </div>
                    <div style={actionButtonsStyle}>
                      <Button
                        variant="secondary"
                        size="small"
                        onClick={() => handleEdit(expense)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="danger"
                        size="small"
                        onClick={() => handleDelete(expense)}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </AnimatedCollapse>
              </div>
            );
          })}
        </div>
      ) : (
        <table style={tableStyle}>
          <thead style={theadStyle}>
            <tr>
              <th style={thStyle}>Date</th>
              <th style={thStyle}>Description</th>
              <th style={thStyle}>Category</th>
              <th style={thStyle}>Amount</th>
              <th style={{ ...thStyle, textAlign: "center" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentExpenses.map((expense) => (
              <tr key={expense.id}>
                <td style={tdStyle}>{formatDate(new Date(expense.date))}</td>
                <td style={tdStyle}>{expense.description}</td>
                <td style={tdStyle}>
                  <span
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                    }}
                  >
                    <span>{getCategoryEmoji(expense.category)}</span>
                    <span>{expense.category}</span>
                  </span>
                </td>
                <td
                  style={{
                    ...tdStyle,
                    textAlign: "left",
                    fontWeight: TYPOGRAPHY.weight.semibold,
                  }}
                >
                  {formatCurrency(expense.amount)}
                </td>
                <td style={{ ...tdStyle, textAlign: "center" }}>
                  <div style={actionButtonsStyle}>
                    <Button
                      variant="secondary"
                      size="small"
                      onClick={() => handleEdit(expense)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="danger"
                      size="small"
                      onClick={() => handleDelete(expense)}
                    >
                      Delete
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <div style={paginationBarStyle}>
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
        <SelectBox
          label="Rows"
          value={String(pageSize)}
          onChange={(e) => handlePageSizeChange(Number(e.target.value))}
          options={PAGE_SIZE_OPTIONS.map((size) => ({
            value: String(size),
            label: String(size),
          }))}
          includePlaceholder={false}
        />
      </div>

      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingExpense(null);
        }}
        title="Edit Expense"
      >
        {editingExpense && (
          <ExpenseForm
            initialData={{
              amount: editingExpense.amount.toString(),
              description: editingExpense.description,
              category: editingExpense.category,
              date: formatDate(new Date(editingExpense.date)),
            }}
            onSubmit={handleUpdate}
            onCancel={() => {
              setIsEditModalOpen(false);
              setEditingExpense(null);
            }}
            submitLabel="Update Expense"
          />
        )}
      </Modal>

      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setDeletingExpense(null);
        }}
        title="Delete Expense"
      >
        <div style={{ padding: "1rem 0" }}>
          <p style={{ marginBottom: "1.5rem", color: COLORS.text.primary }}>
            Are you sure you want to delete this expense?
          </p>
          {deletingExpense && (
            <p style={{ marginBottom: "1.5rem", color: COLORS.text.secondary }}>
              <strong>{deletingExpense.description}</strong> -{" "}
              {formatCurrency(deletingExpense.amount)}
            </p>
          )}
          <div
            style={{
              display: "flex",
              gap: "0.5rem",
              justifyContent: "flex-end",
            }}
          >
            <Button
              variant="secondary"
              onClick={() => {
                setIsDeleteModalOpen(false);
                setDeletingExpense(null);
              }}
            >
              Cancel
            </Button>
            <Button variant="danger" onClick={confirmDelete}>
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
