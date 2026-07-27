import { describe, it, expect, vi, beforeEach } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";
import { useCategories } from "./useCategories";
import * as api from "../services/api";
import { Category } from "../types";

vi.mock("../services/api");

const food: Category = { id: 1, name: "Food", emoji: "🍔" };
const travel: Category = { id: 2, name: "Travel", emoji: "✈️" };

describe("useCategories", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("fetches categories on mount and toggles loading", async () => {
    vi.mocked(api.fetchCategories).mockResolvedValue([food, travel]);

    const { result } = renderHook(() => useCategories());

    expect(result.current.loading).toBe(true);

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.categories).toEqual([food, travel]);
    expect(api.fetchCategories).toHaveBeenCalledTimes(1);
  });

  it("appends a newly created category and keeps the list sorted by name", async () => {
    vi.mocked(api.fetchCategories).mockResolvedValue([food, travel]);
    const groceries: Category = { id: 3, name: "Groceries", emoji: "🛒" };
    vi.mocked(api.createCategory).mockResolvedValue(groceries);

    const { result } = renderHook(() => useCategories());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.addCategory("Groceries", "🛒");
    });

    expect(result.current.categories.map((c) => c.name)).toEqual([
      "Food",
      "Groceries",
      "Travel",
    ]);
  });

  it("refetch re-runs fetchCategories", async () => {
    vi.mocked(api.fetchCategories).mockResolvedValue([food]);

    const { result } = renderHook(() => useCategories());
    await waitFor(() => expect(result.current.loading).toBe(false));

    vi.mocked(api.fetchCategories).mockResolvedValue([food, travel]);
    await act(async () => {
      await result.current.refetch();
    });

    expect(result.current.categories).toEqual([food, travel]);
  });
});
