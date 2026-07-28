import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import HistoryPage from "./HistoryPage";
import * as api from "../services/api";
import { Category, Expense } from "../types";

vi.mock("../services/api");

describe("HistoryPage month navigation", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(api.getExpenses).mockResolvedValue([]);
    vi.mocked(api.fetchCategories).mockResolvedValue([]);
  });

  it("rolls the year back when navigating to the previous month from January", async () => {
    window.history.pushState({}, "", "/?year=2026&month=1");
    const user = userEvent.setup();
    render(<HistoryPage />);

    await waitFor(() => expect(api.getExpenses).toHaveBeenCalledWith(2026, 1));
    expect(screen.getByText("2026")).toBeInTheDocument();

    await user.click(screen.getByTitle("Previous month"));

    await waitFor(() => expect(api.getExpenses).toHaveBeenCalledWith(2025, 12));
    expect(screen.getByText("2025")).toBeInTheDocument();
    expect(new URLSearchParams(window.location.search).get("year")).toBe("2025");
    expect(new URLSearchParams(window.location.search).get("month")).toBe("12");
  });

  it("rolls the year forward when navigating to the next month from December", async () => {
    window.history.pushState({}, "", "/?year=2025&month=12");
    const user = userEvent.setup();
    render(<HistoryPage />);

    await waitFor(() => expect(api.getExpenses).toHaveBeenCalledWith(2025, 12));
    expect(screen.getByText("2025")).toBeInTheDocument();

    await user.click(screen.getByTitle("Next month"));

    await waitFor(() => expect(api.getExpenses).toHaveBeenCalledWith(2026, 1));
    expect(screen.getByText("2026")).toBeInTheDocument();
    expect(new URLSearchParams(window.location.search).get("year")).toBe("2026");
    expect(new URLSearchParams(window.location.search).get("month")).toBe("1");
  });
});

describe("HistoryPage category filtering", () => {
  const categories: Category[] = [
    { id: 1, name: "Food", emoji: "🍔" },
    { id: 2, name: "Bills", emoji: "📄" },
  ];

  const expenses: Expense[] = [
    {
      id: 1,
      amount: 20,
      description: "Groceries",
      category: "Food",
      date: "2026-07-10",
      created_at: "2026-07-10T00:00:00.000Z",
      updated_at: "2026-07-10T00:00:00.000Z",
    },
    {
      id: 2,
      amount: 30,
      description: "Water bill",
      category: "Bills",
      date: "2026-07-12",
      created_at: "2026-07-12T00:00:00.000Z",
      updated_at: "2026-07-12T00:00:00.000Z",
    },
  ];

  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(api.getExpenses).mockResolvedValue(expenses);
    vi.mocked(api.fetchCategories).mockResolvedValue(categories);
    window.history.pushState({}, "", "/?year=2026&month=7");
  });

  it("shows every expense and the combined total with no filter applied", async () => {
    render(<HistoryPage />);

    expect(await screen.findByText("Groceries")).toBeInTheDocument();
    expect(screen.getByText("Water bill")).toBeInTheDocument();
    expect(screen.getByText("$50.00")).toBeInTheDocument();
    expect(screen.getByText("(2 transactions)")).toBeInTheDocument();
  });

  it("narrows the table and total to the selected category", async () => {
    const user = userEvent.setup();
    render(<HistoryPage />);
    await screen.findByText("Groceries");

    const filterGroup = screen.getByRole("group", {
      name: "Filter by category",
    });
    await user.click(within(filterGroup).getByRole("button", { name: /Food/ }));

    expect(screen.getByText("Groceries")).toBeInTheDocument();
    expect(screen.queryByText("Water bill")).not.toBeInTheDocument();
    expect(screen.getAllByText("$20.00").length).toBeGreaterThan(0);
    expect(screen.getByText("(1 transactions)")).toBeInTheDocument();
  });

  it("unions expenses across multiple selected categories", async () => {
    const user = userEvent.setup();
    render(<HistoryPage />);
    await screen.findByText("Groceries");

    const filterGroup = screen.getByRole("group", {
      name: "Filter by category",
    });
    await user.click(within(filterGroup).getByRole("button", { name: /Food/ }));
    await user.click(within(filterGroup).getByRole("button", { name: /Bills/ }));

    expect(screen.getByText("Groceries")).toBeInTheDocument();
    expect(screen.getByText("Water bill")).toBeInTheDocument();
    expect(screen.getByText("$50.00")).toBeInTheDocument();
  });

  it("returns to showing everything when All is clicked again", async () => {
    const user = userEvent.setup();
    render(<HistoryPage />);
    await screen.findByText("Groceries");

    const filterGroup = screen.getByRole("group", {
      name: "Filter by category",
    });
    await user.click(within(filterGroup).getByRole("button", { name: /Food/ }));
    expect(screen.queryByText("Water bill")).not.toBeInTheDocument();

    await user.click(within(filterGroup).getByRole("button", { name: "All" }));

    expect(screen.getByText("Groceries")).toBeInTheDocument();
    expect(screen.getByText("Water bill")).toBeInTheDocument();
    expect(screen.getByText("$50.00")).toBeInTheDocument();
  });
});
