import { describe, it, expect } from "vitest";
import {
  calculateTotal,
  formatCurrency,
  formatDate,
  getDaysInMonth,
  groupExpensesByDay,
} from "./expenseUtils";
import { Expense } from "../types";

function makeExpense(overrides: Partial<Expense>): Expense {
  return {
    id: 1,
    amount: 10,
    description: "Test",
    category: "Food",
    date: "2026-07-15",
    created_at: "2026-07-15T00:00:00.000Z",
    updated_at: "2026-07-15T00:00:00.000Z",
    ...overrides,
  };
}

describe("calculateTotal", () => {
  it("sums the amount across expenses", () => {
    const expenses = [
      makeExpense({ amount: 10.5 }),
      makeExpense({ amount: 5.25 }),
    ];
    expect(calculateTotal(expenses)).toBe(15.75);
  });

  it("returns 0 for an empty list", () => {
    expect(calculateTotal([])).toBe(0);
  });

  it("coerces string amounts to numbers", () => {
    const expenses = [makeExpense({ amount: "20" as unknown as number })];
    expect(calculateTotal(expenses)).toBe(20);
  });
});

describe("formatCurrency", () => {
  it("formats a whole number with two decimal places", () => {
    expect(formatCurrency(10)).toBe("$10.00");
  });

  it("formats a fractional amount, rounding to two decimals", () => {
    expect(formatCurrency(10.005)).toBe("$10.01");
  });
});

describe("formatDate", () => {
  it("formats a date as YYYY-MM-DD, zero-padded", () => {
    expect(formatDate(new Date(2026, 0, 5))).toBe("2026-01-05");
  });

  it("pads single-digit months and days", () => {
    expect(formatDate(new Date(2026, 8, 9))).toBe("2026-09-09");
  });
});

describe("getDaysInMonth", () => {
  it("returns 31 for January", () => {
    expect(getDaysInMonth(2026, 1)).toBe(31);
  });

  it("returns 28 for February in a non-leap year", () => {
    expect(getDaysInMonth(2026, 2)).toBe(28);
  });

  it("returns 29 for February in a leap year", () => {
    expect(getDaysInMonth(2024, 2)).toBe(29);
  });
});

describe("groupExpensesByDay", () => {
  it("groups expenses by their day-of-month", () => {
    const expenses = [
      makeExpense({ id: 1, date: "2026-07-05" }),
      makeExpense({ id: 2, date: "2026-07-05" }),
      makeExpense({ id: 3, date: "2026-07-12" }),
    ];

    const grouped = groupExpensesByDay(expenses);

    expect(grouped.get(5)).toHaveLength(2);
    expect(grouped.get(12)).toHaveLength(1);
    expect(grouped.get(1)).toBeUndefined();
  });

  it("returns an empty map for an empty list", () => {
    expect(groupExpensesByDay([]).size).toBe(0);
  });
});
