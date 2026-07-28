import React, { useEffect, useState } from "react";
import { getExpenses, createExpense } from "../services/api";
import { Expense, ExpenseFormData } from "../types";
import { useCategories } from "../hooks/useCategories";
import {
  formatCompactCurrency,
  formatCurrency,
  formatDate,
} from "../utils/expenseUtils";
import { ExpenseForm } from "../components/ExpenseForm";
import { AddCategoryModal } from "../components/AddCategoryModal";
import { Modal, Button, PieChart, PieChartDatum } from "../vibes";
import { COLORS } from "../constants/colors";
import { TYPOGRAPHY } from "../constants/typography";
import { useIsMobile } from "../hooks/useMediaQuery";

// Fixed categorical hue order (see constants/colors.ts) — never cycled or
// generated per-category. Categories beyond this fold into a neutral
// "Other" slice rather than seating a 7th hue.
const CATEGORICAL_COLORS = [
  COLORS.red.re05,
  COLORS.orange.or05,
  COLORS.yellow.ye05,
  COLORS.yellowGreen.yg05,
  COLORS.green.gr05,
  COLORS.blueGreen.bg05,
];
const MAX_SLICES = CATEGORICAL_COLORS.length;
const RECENT_COUNT = 5;

const DashboardPage: React.FC = () => {
  const isMobile = useIsMobile();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddCategoryModalOpen, setIsAddCategoryModalOpen] = useState(false);
  const { categories: allCategories, addCategory } = useCategories();
  const emojiByName = new Map(allCategories.map((c) => [c.name, c.emoji]));

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  const monthLabel = now.toLocaleString("en-US", { month: "long" });

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const data = await getExpenses(currentYear, currentMonth);
      setExpenses(data);
    } catch (error) {
      console.error("Error fetching expenses:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
    // Only the current month is ever shown here, so this runs once on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAddExpense = async (data: ExpenseFormData) => {
    try {
      await createExpense(data);
      setIsModalOpen(false);
      fetchExpenses();
    } catch (error) {
      console.error("Error creating expense:", error);
      throw error;
    }
  };

  const categoryTotals = expenses.reduce(
    (acc, expense) => {
      const category = expense.category || "Uncategorized";
      if (!acc[category]) {
        acc[category] = { category, amount: 0, count: 0 };
      }
      acc[category].amount += Number(expense.amount);
      acc[category].count += 1;
      return acc;
    },
    {} as Record<string, { category: string; amount: number; count: number }>,
  );

  const sortedCategories = Object.values(categoryTotals).sort(
    (a, b) => b.amount - a.amount,
  );
  const total = sortedCategories.reduce((sum, c) => sum + c.amount, 0);

  const topCategories = sortedCategories.slice(0, MAX_SLICES);
  const overflowCategories = sortedCategories.slice(MAX_SLICES);

  const pieData: PieChartDatum[] = topCategories.map((c, i) => ({
    label: c.category,
    value: c.amount,
    count: c.count,
    color: CATEGORICAL_COLORS[i],
    icon: emojiByName.get(c.category) || "📊",
  }));

  if (overflowCategories.length > 0) {
    // Guard against a real category actually named "Other" (or anything a
    // user has created) colliding in the legend with this synthetic bucket.
    const overflowLabel = topCategories.some((c) => c.category === "Other")
      ? "Other categories"
      : "Other";
    pieData.push({
      label: overflowLabel,
      value: overflowCategories.reduce((sum, c) => sum + c.amount, 0),
      count: overflowCategories.reduce((sum, c) => sum + c.count, 0),
      color: COLORS.secondary.s06,
      icon: "📦",
    });
  }

  const recentExpenses = [...expenses]
    .sort((a, b) => {
      const dateDiff = new Date(b.date).getTime() - new Date(a.date).getTime();
      if (dateDiff !== 0) return dateDiff;
      return (
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    })
    .slice(0, RECENT_COUNT);

  const pageStyle: React.CSSProperties = {
    padding: isMobile ? "20px 16px" : "48px 64px",
    minHeight: "100vh",
    background: COLORS.secondary.s01,
  };

  const headerStyle: React.CSSProperties = {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    gap: "16px",
    justifyContent: "space-between",
  };

  const titleGroupStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  };

  const titleStyle: React.CSSProperties = {
    fontSize: isMobile
      ? TYPOGRAPHY.role.sectionTitle.size
      : TYPOGRAPHY.role.pageTitle.size,
    fontWeight: TYPOGRAPHY.role.pageTitle.weight,
    color: COLORS.secondary.s10,
    margin: 0,
  };

  const subtitleStyle: React.CSSProperties = {
    fontSize: TYPOGRAPHY.size.sm,
    color: COLORS.secondary.s07,
  };

  const actionButtonsRowStyle: React.CSSProperties = {
    display: "flex",
    gap: "12px",
    ...(isMobile ? { width: "100%", justifyContent: "center" } : {}),
  };

  const loadingStyle: React.CSSProperties = {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "48px",
    fontSize: TYPOGRAPHY.size.md,
    color: COLORS.secondary.s08,
  };

  const gridStyle: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: isMobile ? "1fr" : "3fr 2fr",
    gap: "24px",
    marginTop: "32px",
    alignItems: "start",
  };

  const cardStyle: React.CSSProperties = {
    background: COLORS.background.main,
    borderRadius: "12px",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
    padding: isMobile ? "16px" : "24px",
  };

  const cardTitleStyle: React.CSSProperties = {
    fontSize: TYPOGRAPHY.size.lg,
    fontWeight: TYPOGRAPHY.weight.bold,
    color: COLORS.secondary.s10,
    margin: "0 0 16px 0",
  };

  const emptyStateStyle: React.CSSProperties = {
    padding: "24px 0",
    textAlign: "center",
    color: COLORS.secondary.s07,
    fontSize: TYPOGRAPHY.size.sm,
  };

  const recentListStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  };

  const recentItemStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "10px 8px",
    borderRadius: "8px",
  };

  const recentIconStyle: React.CSSProperties = {
    fontSize: TYPOGRAPHY.size.xl,
    width: "40px",
    height: "40px",
    flexShrink: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: COLORS.secondary.s01,
    borderRadius: "10px",
  };

  const recentInfoStyle: React.CSSProperties = {
    flex: 1,
    minWidth: 0,
    display: "flex",
    flexDirection: "column",
    gap: "2px",
  };

  const recentDescStyle: React.CSSProperties = {
    fontSize: TYPOGRAPHY.size.sm,
    fontWeight: TYPOGRAPHY.weight.semibold,
    color: COLORS.secondary.s10,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  };

  const recentMetaStyle: React.CSSProperties = {
    fontSize: TYPOGRAPHY.size.xs,
    color: COLORS.secondary.s07,
  };

  const recentAmountStyle: React.CSSProperties = {
    fontSize: TYPOGRAPHY.size.sm,
    fontWeight: TYPOGRAPHY.weight.bold,
    color: COLORS.secondary.s10,
    flexShrink: 0,
  };

  return (
    <div style={pageStyle}>
      <div style={headerStyle}>
        <div style={titleGroupStyle}>
          <h1 style={titleStyle}>Dashboard</h1>
          <span style={subtitleStyle}>
            {monthLabel} {currentYear}
          </span>
        </div>
        <div style={actionButtonsRowStyle}>
          <Button
            variant="secondary"
            onClick={() => setIsAddCategoryModalOpen(true)}
          >
            + Add Category
          </Button>
          <Button variant="primary" onClick={() => setIsModalOpen(true)}>
            Add Expense
          </Button>
        </div>
      </div>

      {loading ? (
        <div style={loadingStyle}>Loading...</div>
      ) : (
        <div style={gridStyle}>
          <div style={cardStyle}>
            <h2 style={cardTitleStyle}>Spending by category</h2>
            {pieData.length === 0 ? (
              <div style={emptyStateStyle}>
                No expenses yet this month — add one to see the breakdown.
              </div>
            ) : (
              <PieChart
                data={pieData}
                formatValue={formatCurrency}
                size={180}
                centerValue={formatCompactCurrency(total)}
                centerLabel={`${sortedCategories.reduce((sum, c) => sum + c.count, 0)} transactions`}
                countLabel={(count) => `${count}×`}
              />
            )}
          </div>

          <div style={cardStyle}>
            <h2 style={cardTitleStyle}>Recent expenses</h2>
            {recentExpenses.length === 0 ? (
              <div style={emptyStateStyle}>No expenses recorded yet.</div>
            ) : (
              <div style={recentListStyle}>
                {recentExpenses.map((expense) => (
                  <div key={expense.id} style={recentItemStyle}>
                    <span style={recentIconStyle}>
                      {emojiByName.get(expense.category) || "📦"}
                    </span>
                    <div style={recentInfoStyle}>
                      <span style={recentDescStyle}>
                        {expense.description}
                      </span>
                      <span style={recentMetaStyle}>
                        {expense.category} ·{" "}
                        {formatDate(new Date(expense.date))}
                      </span>
                    </div>
                    <span style={recentAmountStyle}>
                      {formatCurrency(expense.amount)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add New Expense"
      >
        <ExpenseForm
          onSubmit={handleAddExpense}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>

      <AddCategoryModal
        isOpen={isAddCategoryModalOpen}
        onClose={() => setIsAddCategoryModalOpen(false)}
        existingNames={allCategories.map((c) => c.name)}
        onCreate={addCategory}
        onCreated={() => {}}
      />
    </div>
  );
};

export default DashboardPage;
