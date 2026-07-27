import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ExpenseForm } from "./ExpenseForm";
import * as api from "../services/api";
import { Category } from "../types";

vi.mock("../services/api");

const food: Category = { id: 1, name: "Food", emoji: "🍔" };
const travel: Category = { id: 2, name: "Travel", emoji: "✈️" };

describe("ExpenseForm", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(api.fetchCategories).mockResolvedValue([food, travel]);
  });

  it("renders category options loaded from useCategories", async () => {
    render(<ExpenseForm onSubmit={vi.fn()} />);

    await waitFor(() =>
      expect(
        screen.getByRole("option", { name: "🍔 Food" }),
      ).toBeInTheDocument(),
    );
    expect(screen.getByRole("option", { name: "✈️ Travel" })).toBeInTheDocument();
  });

  it("shows a validation error and does not submit for a zero amount", async () => {
    // Every field here except amount is filled in deliberately: amount="0"
    // still satisfies the native `required` attribute (it's non-blank), so
    // this is the validation path that's actually reachable through a real
    // submit click -- an entirely blank form gets intercepted by the
    // browser's own required-field validation before React's onSubmit ever
    // runs, which is covered instead at the hook level in useExpenseForm.test.ts.
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<ExpenseForm onSubmit={onSubmit} />);

    await waitFor(() =>
      expect(screen.getByRole("option", { name: "🍔 Food" })).toBeInTheDocument(),
    );

    await user.type(screen.getByLabelText("Amount"), "0");
    await user.type(screen.getByLabelText("Description"), "Lunch");
    await user.selectOptions(screen.getByLabelText("Category"), "Food");
    await user.click(screen.getByRole("button", { name: "Add Expense" }));

    expect(
      await screen.findByText("Amount must be greater than 0"),
    ).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("sets the date input's max attribute to today, blocking future dates", async () => {
    render(<ExpenseForm onSubmit={vi.fn()} />);
    await waitFor(() => expect(api.fetchCategories).toHaveBeenCalled());

    const dateInput = screen.getByLabelText("Date") as HTMLInputElement;
    const today = new Date().toISOString().slice(0, 10);
    expect(dateInput.max).toBe(today);
  });

  it("opens the AddCategoryModal from the '+ Add Category' button and auto-selects the created category", async () => {
    const user = userEvent.setup();
    const created: Category = { id: 3, name: "Groceries", emoji: "🛒" };
    vi.mocked(api.createCategory).mockResolvedValue(created);

    render(<ExpenseForm onSubmit={vi.fn()} />);

    await waitFor(() =>
      expect(screen.getByRole("option", { name: "🍔 Food" })).toBeInTheDocument(),
    );

    await user.click(screen.getByRole("button", { name: "+ Add Category" }));
    await user.type(screen.getByLabelText("Category Name"), "Groceries");
    await user.click(screen.getByRole("button", { name: "Add Category" }));

    await waitFor(() =>
      expect(screen.getByLabelText("Category")).toHaveValue("Groceries"),
    );
  });
});
