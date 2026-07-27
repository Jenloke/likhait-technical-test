import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { act, renderHook } from "@testing-library/react";
import type { FormEvent } from "react";
import { useExpenseForm } from "./useExpenseForm";
import { formatDate } from "../utils/expenseUtils";

const submitEvent = { preventDefault: () => {} } as FormEvent;

describe("useExpenseForm", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 6, 28));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("defaults the date field to today", () => {
    const { result } = renderHook(() =>
      useExpenseForm({ onSubmit: vi.fn() }),
    );

    expect(result.current.formData.date).toBe(formatDate(new Date()));
  });

  it("seeds fields from initialData when provided", () => {
    const { result } = renderHook(() =>
      useExpenseForm({
        initialData: { amount: "42", description: "Lunch", category: "Food" },
        onSubmit: vi.fn(),
      }),
    );

    expect(result.current.formData).toMatchObject({
      amount: "42",
      description: "Lunch",
      category: "Food",
    });
  });

  it("rejects a zero or negative amount on submit", () => {
    const onSubmit = vi.fn();
    const { result } = renderHook(() => useExpenseForm({ onSubmit }));

    act(() => {
      result.current.handleChange("description", "Lunch");
      result.current.handleChange("category", "Food");
      result.current.handleChange("amount", "0");
    });

    act(() => {
      result.current.handleSubmit(submitEvent);
    });

    expect(result.current.errors.amount).toBe("Amount must be greater than 0");
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("rejects a future date on submit with an explanatory message", () => {
    const onSubmit = vi.fn();
    const { result } = renderHook(() => useExpenseForm({ onSubmit }));

    act(() => {
      result.current.handleChange("description", "Lunch");
      result.current.handleChange("category", "Food");
      result.current.handleChange("amount", "10");
      result.current.handleChange("date", "2026-07-29");
    });

    act(() => {
      result.current.handleSubmit(submitEvent);
    });

    expect(result.current.errors.date).toBe(
      "Date cannot be in the future. Please select today or an earlier date.",
    );
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("accepts today's date on submit", async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    const { result } = renderHook(() => useExpenseForm({ onSubmit }));

    act(() => {
      result.current.handleChange("description", "Lunch");
      result.current.handleChange("category", "Food");
      result.current.handleChange("amount", "10");
    });

    await act(async () => {
      await result.current.handleSubmit(submitEvent);
    });

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ amount: "10", description: "Lunch" }),
    );
  });

  it("clears a field's error as soon as it changes", () => {
    const { result } = renderHook(() => useExpenseForm({ onSubmit: vi.fn() }));

    act(() => {
      result.current.handleSubmit(submitEvent);
    });
    expect(result.current.errors.description).toBeDefined();

    act(() => {
      result.current.handleChange("description", "Lunch");
    });
    expect(result.current.errors.description).toBeUndefined();
  });

  it("resets the form and clears isSubmitting after a successful submit", async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    const { result } = renderHook(() => useExpenseForm({ onSubmit }));

    act(() => {
      result.current.handleChange("description", "Lunch");
      result.current.handleChange("category", "Food");
      result.current.handleChange("amount", "10");
    });

    await act(async () => {
      await result.current.handleSubmit(submitEvent);
    });

    expect(result.current.formData.description).toBe("");
    expect(result.current.formData.amount).toBe("");
    expect(result.current.isSubmitting).toBe(false);
  });

  it("keeps the submitted data and stops submitting when onSubmit rejects", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const onSubmit = vi.fn().mockRejectedValue(new Error("network error"));
    const { result } = renderHook(() => useExpenseForm({ onSubmit }));

    act(() => {
      result.current.handleChange("description", "Lunch");
      result.current.handleChange("category", "Food");
      result.current.handleChange("amount", "10");
    });

    await act(async () => {
      await result.current.handleSubmit(submitEvent);
    });

    expect(result.current.formData.description).toBe("Lunch");
    expect(result.current.isSubmitting).toBe(false);
  });
});
