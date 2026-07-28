import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CalendarExpenseTable } from "./CalendarExpenseTable";
import * as api from "../services/api";
import { Category, Expense } from "../types";

vi.mock("../services/api");

const food: Category = { id: 1, name: "Food", emoji: "🍔" };

function makeExpense(overrides: Partial<Expense>): Expense {
  return {
    id: 1,
    amount: 10,
    description: "Lunch",
    category: "Food",
    date: "2026-07-15",
    created_at: "2026-07-15T00:00:00.000Z",
    updated_at: "2026-07-15T00:00:00.000Z",
    ...overrides,
  };
}

describe("CalendarExpenseTable", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(api.fetchCategories).mockResolvedValue([food]);
  });

  it("shows an empty state when there are no expenses", async () => {
    render(<CalendarExpenseTable expenses={[]} onExpenseUpdated={vi.fn()} />);
    await waitFor(() => expect(api.fetchCategories).toHaveBeenCalled());

    expect(
      screen.getByText("No expenses found. Add your first expense to get started!"),
    ).toBeInTheDocument();
  });

  it("renders rows in the order given, without re-sorting client-side", async () => {
    const expenses = [
      makeExpense({ id: 2, description: "Second", date: "2026-07-10" }),
      makeExpense({ id: 1, description: "First", date: "2026-07-20" }),
    ];

    render(
      <CalendarExpenseTable expenses={expenses} onExpenseUpdated={vi.fn()} />,
    );
    await waitFor(() => expect(api.fetchCategories).toHaveBeenCalled());

    const descriptionCells = screen
      .getAllByRole("row")
      .slice(1)
      .map((row) => row.textContent);

    expect(descriptionCells[0]).toContain("Second");
    expect(descriptionCells[1]).toContain("First");
  });

  it("paginates beyond the first 10 rows", async () => {
    const expenses = Array.from({ length: 11 }, (_, i) =>
      makeExpense({ id: i + 1, description: `Expense ${i + 1}` }),
    );

    render(
      <CalendarExpenseTable expenses={expenses} onExpenseUpdated={vi.fn()} />,
    );

    await waitFor(() => expect(api.fetchCategories).toHaveBeenCalled());
    expect(screen.queryByText("Expense 11")).not.toBeInTheDocument();
    expect(screen.getByText("Expense 1")).toBeInTheDocument();
  });

  it("shows more rows per page when a larger page size is selected", async () => {
    const user = userEvent.setup();
    const expenses = Array.from({ length: 30 }, (_, i) =>
      makeExpense({ id: i + 1, description: `Expense ${i + 1}` }),
    );

    render(
      <CalendarExpenseTable expenses={expenses} onExpenseUpdated={vi.fn()} />,
    );
    await waitFor(() => expect(api.fetchCategories).toHaveBeenCalled());

    expect(screen.queryByText("Expense 25")).not.toBeInTheDocument();

    await user.selectOptions(
      screen.getByLabelText("Rows"),
      "25",
    );

    expect(screen.getByText("Expense 25")).toBeInTheDocument();
    expect(screen.queryByText("Expense 26")).not.toBeInTheDocument();
  });

  it("resets to the first page when the page size changes", async () => {
    const user = userEvent.setup();
    const expenses = Array.from({ length: 15 }, (_, i) =>
      makeExpense({ id: i + 1, description: `Expense ${i + 1}` }),
    );

    render(
      <CalendarExpenseTable expenses={expenses} onExpenseUpdated={vi.fn()} />,
    );
    await waitFor(() => expect(api.fetchCategories).toHaveBeenCalled());

    await user.click(screen.getByRole("button", { name: "Next" }));
    expect(screen.getByText("Expense 11")).toBeInTheDocument();

    await user.selectOptions(
      screen.getByLabelText("Rows"),
      "25",
    );

    expect(screen.getByText("Expense 1")).toBeInTheDocument();
    expect(screen.getByText("Expense 15")).toBeInTheDocument();
  });

  it("clamps to the last valid page when the expenses prop shrinks out from under it", async () => {
    const user = userEvent.setup();
    const manyExpenses = Array.from({ length: 15 }, (_, i) =>
      makeExpense({ id: i + 1, description: `Expense ${i + 1}` }),
    );

    const { rerender } = render(
      <CalendarExpenseTable expenses={manyExpenses} onExpenseUpdated={vi.fn()} />,
    );
    await waitFor(() => expect(api.fetchCategories).toHaveBeenCalled());

    await user.click(screen.getByRole("button", { name: "Next" }));
    expect(screen.getByText("Expense 11")).toBeInTheDocument();

    const fewExpenses = [makeExpense({ id: 1, description: "Only expense" })];
    rerender(
      <CalendarExpenseTable expenses={fewExpenses} onExpenseUpdated={vi.fn()} />,
    );

    expect(await screen.findByText("Only expense")).toBeInTheDocument();
    expect(
      screen.queryByText("No expenses found. Add your first expense to get started!"),
    ).not.toBeInTheDocument();
  });

  it("jumps back to page 1 when resetPaginationKey changes, even if the new page would still be in range", async () => {
    const user = userEvent.setup();
    const expenses = Array.from({ length: 15 }, (_, i) =>
      makeExpense({ id: i + 1, description: `Expense ${i + 1}` }),
    );

    const { rerender } = render(
      <CalendarExpenseTable
        expenses={expenses}
        onExpenseUpdated={vi.fn()}
        resetPaginationKey="Food"
      />,
    );
    await waitFor(() => expect(api.fetchCategories).toHaveBeenCalled());

    await user.click(screen.getByRole("button", { name: "Next" }));
    expect(screen.getByText("Expense 11")).toBeInTheDocument();

    // Same 15-row list, so a page-count clamp alone wouldn't move anything —
    // only the changed key should force it back to page 1.
    rerender(
      <CalendarExpenseTable
        expenses={expenses}
        onExpenseUpdated={vi.fn()}
        resetPaginationKey="Bills"
      />,
    );

    expect(screen.getByText("Expense 1")).toBeInTheDocument();
    expect(screen.queryByText("Expense 11")).not.toBeInTheDocument();
  });

  it("opens the edit modal pre-filled with the selected expense", async () => {
    const user = userEvent.setup();
    render(
      <CalendarExpenseTable
        expenses={[makeExpense({ description: "Groceries" })]}
        onExpenseUpdated={vi.fn()}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Edit" }));

    expect(screen.getByText("Edit Expense")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Groceries")).toBeInTheDocument();
  });

  it("confirms and deletes an expense, then notifies the parent", async () => {
    const user = userEvent.setup();
    vi.mocked(api.deleteExpense).mockResolvedValue(undefined);
    const onExpenseUpdated = vi.fn();

    render(
      <CalendarExpenseTable
        expenses={[makeExpense({ id: 7 })]}
        onExpenseUpdated={onExpenseUpdated}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Delete" }));
    expect(
      screen.getByText("Are you sure you want to delete this expense?"),
    ).toBeInTheDocument();

    const deleteButtons = screen.getAllByRole("button", { name: "Delete" });
    await user.click(deleteButtons[deleteButtons.length - 1]);

    await waitFor(() => expect(api.deleteExpense).toHaveBeenCalledWith(7));
    await waitFor(() => expect(onExpenseUpdated).toHaveBeenCalled());
  });
});
