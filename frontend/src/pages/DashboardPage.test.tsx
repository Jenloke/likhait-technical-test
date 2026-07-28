import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import DashboardPage from "./DashboardPage";
import * as api from "../services/api";
import { Category, Expense } from "../types";

vi.mock("../services/api");

const categories: Category[] = [
  { id: 1, name: "Food", emoji: "🍔" },
  { id: 2, name: "Bills", emoji: "📄" },
  { id: 3, name: "Fun", emoji: "🎉" },
];

function makeExpense(overrides: Partial<Expense>): Expense {
  return {
    id: 1,
    amount: 10,
    description: "Item",
    category: "Food",
    date: "2026-07-10",
    created_at: "2026-07-10T00:00:00.000Z",
    updated_at: "2026-07-10T00:00:00.000Z",
    ...overrides,
  };
}

describe("DashboardPage", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(api.fetchCategories).mockResolvedValue(categories);
  });

  it("shows an empty state when there are no expenses this month", async () => {
    vi.mocked(api.getExpenses).mockResolvedValue([]);
    render(<DashboardPage />);

    expect(
      await screen.findByText(
        "No expenses yet this month — add one to see the breakdown.",
      ),
    ).toBeInTheDocument();
    expect(screen.getByText("No expenses recorded yet.")).toBeInTheDocument();
  });

  it("renders a legend entry per category with its total and count", async () => {
    const expenses = [
      makeExpense({ id: 1, category: "Food", amount: 20, description: "Groceries" }),
      makeExpense({ id: 2, category: "Food", amount: 15, description: "Snacks" }),
      makeExpense({ id: 3, category: "Bills", amount: 30, description: "Water bill" }),
    ];
    vi.mocked(api.getExpenses).mockResolvedValue(expenses);
    render(<DashboardPage />);

    await screen.findByText("Spending by category");

    expect(screen.getByText("Food")).toBeInTheDocument();
    expect(screen.getByText("$35.00")).toBeInTheDocument();
    expect(screen.getByText("2×")).toBeInTheDocument();
    expect(screen.getByText("Bills")).toBeInTheDocument();
    // $30.00 also appears in the recent-expenses panel for the Water bill
    // entry itself, so at least one match (not exactly one) is the right bar.
    expect(screen.getAllByText("$30.00").length).toBeGreaterThan(0);
    expect(screen.getByText("1×")).toBeInTheDocument();
    // center total across both categories
    expect(screen.getByText("$65.00")).toBeInTheDocument();
  });

  it("folds categories past the 6-slice cap into an Other slice", async () => {
    const categoryNames = ["A", "B", "C", "D", "E", "F", "G"];
    const expenses = categoryNames.map((name, i) =>
      makeExpense({ id: i + 1, category: name, amount: 10, description: name }),
    );
    vi.mocked(api.getExpenses).mockResolvedValue(expenses);
    render(<DashboardPage />);

    await screen.findByText("Spending by category");

    expect(screen.getByText("Other")).toBeInTheDocument();
  });

  it("lists at most the 5 most recent expenses, most recent first", async () => {
    const expenses = Array.from({ length: 7 }, (_, i) =>
      makeExpense({
        id: i + 1,
        description: `Expense ${i + 1}`,
        date: `2026-07-0${i + 1}`,
        created_at: `2026-07-0${i + 1}T00:00:00.000Z`,
      }),
    );
    vi.mocked(api.getExpenses).mockResolvedValue(expenses);
    render(<DashboardPage />);

    await screen.findByText("Recent expenses");

    expect(screen.getByText("Expense 7")).toBeInTheDocument();
    expect(screen.getByText("Expense 3")).toBeInTheDocument();
    expect(screen.queryByText("Expense 2")).not.toBeInTheDocument();
    expect(screen.queryByText("Expense 1")).not.toBeInTheDocument();
  });

  it("opens the Add Expense and Add Category modals from the header buttons", async () => {
    vi.mocked(api.getExpenses).mockResolvedValue([]);
    const user = userEvent.setup();
    render(<DashboardPage />);
    await screen.findByText("Dashboard");

    await user.click(screen.getByRole("button", { name: "Add Expense" }));
    expect(screen.getByText("Add New Expense")).toBeInTheDocument();
    await user.click(screen.getByText("×"));

    await user.click(screen.getByRole("button", { name: "+ Add Category" }));
    await waitFor(() =>
      expect(
        screen.getByRole("heading", { name: "Add Category" }),
      ).toBeInTheDocument(),
    );
  });
});
