import React, { useState, useEffect } from "react";
import { getExpenses, createExpense } from "../services/api";
import { Expense, ExpenseFormData } from "../types";
import YearNavigation from "../components/YearNavigation";
import { MonthNavigation } from "../components/MonthNavigation";
import CategoryBreakdown from "../components/CategoryBreakdown";
import { CalendarExpenseTable } from "../components/CalendarExpenseTable";
import { CategoryFilter } from "../components/CategoryFilter";
import { ExpenseForm } from "../components/ExpenseForm";
import { AddCategoryModal } from "../components/AddCategoryModal";
import { useCategories } from "../hooks/useCategories";
import { Modal, Button } from "../vibes";
import { COLORS } from "../constants/colors";
import { TYPOGRAPHY } from "../constants/typography";
import { useIsMobile, useMediaQuery } from "../hooks/useMediaQuery";
import { BREAKPOINTS } from "../constants/breakpoints";

interface HistoryPageProps {
  // Reports the currently viewed year/month up to the caller whenever it
  // changes (including the initial value resolved on mount), so App can
  // remember where History was left and restore it on the next visit
  // instead of resetting to the current month every time the tab is
  // re-entered.
  onYearMonthChange?: (year: number, month: number) => void;
}

const HistoryPage: React.FC<HistoryPageProps> = ({ onYearMonthChange }) => {
  const isMobile = useIsMobile();
  // Below this, "Expense History" and the year nav no longer fit on one
  // line, so the header switches from a single space-between row (title
  // left, year right) to title and year stacked on their own centered rows.
  const isCompactMobile = useMediaQuery(
    `(max-width: ${BREAKPOINTS.compactMobile}px)`,
  );
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddCategoryModalOpen, setIsAddCategoryModalOpen] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const { categories: allCategories, addCategory } = useCategories();

  // Get year and month from URL params, default to current date if not provided
  const getInitialYearMonth = () => {
    const params = new URLSearchParams(window.location.search);
    const currentDate = new Date();
    const yearParam = params.get("year");
    const monthParam = params.get("month");

    return {
      year: yearParam ? parseInt(yearParam) : currentDate.getFullYear(),
      month: monthParam ? parseInt(monthParam) : currentDate.getMonth() + 1,
    };
  };

  const initial = getInitialYearMonth();
  const [selectedYear, setSelectedYear] = useState(initial.year);
  const [selectedMonth, setSelectedMonth] = useState(initial.month);

  // Update URL when year or month changes
  const updateURL = (year: number, month: number) => {
    const params = new URLSearchParams();
    params.set("year", year.toString());
    params.set("month", month.toString());
    const newURL = `${window.location.pathname}?${params.toString()}`;
    window.history.pushState({}, "", newURL);
  };

  // Initialize URL params if not present
  useEffect(() => {
    updateURL(selectedYear, selectedMonth);
  }, []);

  useEffect(() => {
    fetchExpenses();
  }, [selectedYear, selectedMonth]);

  useEffect(() => {
    onYearMonthChange?.(selectedYear, selectedMonth);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedYear, selectedMonth]);

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const data = await getExpenses(selectedYear, selectedMonth);
      setExpenses(data);
    } catch (error) {
      console.error("Error fetching expenses:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleYearChange = (year: number) => {
    setSelectedYear(year);
    updateURL(year, selectedMonth);
  };

  const handleMonthChange = (month: number, year: number) => {
    setSelectedMonth(month);
    setSelectedYear(year);
    updateURL(year, month);
  };

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

  const filteredExpenses =
    selectedCategories.length === 0
      ? expenses
      : expenses.filter((expense) =>
          selectedCategories.includes(expense.category),
        );

  // Calculate category breakdown
  const categoryData = filteredExpenses.reduce(
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

  const categories = Object.values(categoryData).sort(
    (a, b) => b.amount - a.amount,
  );
  const total = categories.reduce((sum, cat) => sum + cat.amount, 0);
  const totalCount = categories.reduce((sum, cat) => sum + cat.count, 0);

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

  const leftHeaderStyle: React.CSSProperties = {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    gap: isMobile ? "12px" : "24px",
    justifyContent: isMobile ? "space-between" : "flex-start",
    width: isMobile ? "100%" : "auto",
  };

  // Compact mobile: title and year no longer fit on one line, so the year
  // nav wraps onto its own full-width row — center it there. Once there's
  // room for both (still mobile, just not compact), leftHeaderStyle's own
  // space-between already spreads title/year apart, so this stays inert.
  const yearWrapperStyle: React.CSSProperties = isCompactMobile
    ? { width: "100%", display: "flex", justifyContent: "center" }
    : {};

  const actionButtonsRowStyle: React.CSSProperties = {
    display: "flex",
    gap: "12px",
    ...(isMobile ? { width: "100%", justifyContent: "center" } : {}),
  };

  const titleStyle: React.CSSProperties = {
    fontSize: isMobile
      ? TYPOGRAPHY.role.sectionTitle.size
      : TYPOGRAPHY.role.pageTitle.size,
    fontWeight: TYPOGRAPHY.role.pageTitle.weight,
    color: COLORS.secondary.s10,
    margin: 0,
    flexShrink: 0,
  };

  const loadingStyle: React.CSSProperties = {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "48px",
    fontSize: TYPOGRAPHY.size.md,
    color: COLORS.secondary.s08,
  };

  return (
    <div style={pageStyle}>
      <div style={headerStyle}>
        <div style={leftHeaderStyle}>
          <h1 style={titleStyle}>Expense History</h1>
          <div style={yearWrapperStyle}>
            <YearNavigation
              currentYear={selectedYear}
              onYearChange={handleYearChange}
            />
          </div>
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

      <MonthNavigation
        currentMonth={selectedMonth}
        currentYear={selectedYear}
        onMonthChange={handleMonthChange}
      />

      <CategoryFilter
        categories={allCategories}
        selected={selectedCategories}
        onChange={setSelectedCategories}
      />

      <div>
        {loading ? (
          <div style={loadingStyle}>Loading...</div>
        ) : (
          <>
            <CategoryBreakdown
              categories={categories}
              total={total}
              totalCount={totalCount}
            />
            <div style={{ marginTop: "32px" }}>
              <CalendarExpenseTable
                expenses={filteredExpenses}
                onExpenseUpdated={fetchExpenses}
                resetPaginationKey={selectedCategories.slice().sort().join(",")}
              />
            </div>
          </>
        )}
      </div>

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

export default HistoryPage;
