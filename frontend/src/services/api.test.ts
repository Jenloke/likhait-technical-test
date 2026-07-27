import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  createCategory,
  createExpense,
  deleteExpense,
  fetchCategories,
  fetchExpenses,
  getExpenses,
  updateExpense,
} from "./api";
import { Category } from "../types";

function jsonResponse(body: unknown, ok = true, status = ok ? 200 : 422) {
  return {
    ok,
    status,
    json: () => Promise.resolve(body),
  } as Response;
}

const categories: Category[] = [
  { id: 1, name: "Food", emoji: "🍔" },
  { id: 2, name: "Travel", emoji: "✈️" },
];

describe("api service", () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    vi.stubGlobal("fetch", fetchMock);
    fetchMock.mockReset();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("fetchExpenses hits the expenses endpoint", async () => {
    fetchMock.mockResolvedValue(jsonResponse([]));

    await fetchExpenses();

    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:3000/api/expenses",
    );
  });

  it("fetchExpenses throws when the response is not ok", async () => {
    fetchMock.mockResolvedValue(jsonResponse(null, false));

    await expect(fetchExpenses()).rejects.toThrow("Failed to fetch expenses");
  });

  it("getExpenses includes year and month query params", async () => {
    fetchMock.mockResolvedValue(jsonResponse([]));

    await getExpenses(2026, 7);

    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:3000/api/expenses?year=2026&month=7",
    );
  });

  it("fetchCategories hits the categories endpoint", async () => {
    fetchMock.mockResolvedValue(jsonResponse(categories));

    const result = await fetchCategories();

    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:3000/api/categories",
    );
    expect(result).toEqual(categories);
  });

  it("createCategory posts the name and emoji", async () => {
    const created = { id: 3, name: "Groceries", emoji: "🛒" };
    fetchMock.mockResolvedValue(jsonResponse(created, true, 201));

    const result = await createCategory("Groceries", "🛒");

    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:3000/api/categories",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ category: { name: "Groceries", emoji: "🛒" } }),
      }),
    );
    expect(result).toEqual(created);
  });

  it("createCategory surfaces the backend's error message on failure", async () => {
    fetchMock.mockResolvedValue(
      jsonResponse({ errors: ["Name has already been taken"] }, false),
    );

    await expect(createCategory("Food")).rejects.toThrow(
      "Name has already been taken",
    );
  });

  it("createCategory falls back to a generic message when the error body can't be parsed", async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      status: 500,
      json: () => Promise.reject(new Error("not json")),
    } as unknown as Response);

    await expect(createCategory("Food")).rejects.toThrow(
      "Failed to create category",
    );
  });

  it("createExpense resolves the category name to a category_id and sends the timezone offset", async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse(categories))
      .mockResolvedValueOnce(jsonResponse({ id: 1 }, true, 201));

    vi.spyOn(Date.prototype, "getTimezoneOffset").mockReturnValue(-480);

    await createExpense({
      amount: "10",
      description: "Lunch",
      category: "Travel",
      date: "2026-07-27",
    });

    const [, options] = fetchMock.mock.calls[1];
    const body = JSON.parse((options as RequestInit).body as string);

    expect(body.expense).toMatchObject({
      description: "Lunch",
      amount: "10",
      category_id: 2,
      date: "2026-07-27",
      timezone_offset_minutes: -480,
    });
  });

  it("createExpense throws when the create request fails", async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse(categories))
      .mockResolvedValueOnce(jsonResponse(null, false));

    await expect(
      createExpense({
        amount: "10",
        description: "Lunch",
        category: "Food",
        date: "2026-07-27",
      }),
    ).rejects.toThrow("Failed to create expense");
  });

  it("updateExpense sends the timezone offset alongside the partial data", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ id: 5 }));
    vi.spyOn(Date.prototype, "getTimezoneOffset").mockReturnValue(-480);

    await updateExpense(5, { amount: "20" });

    const [url, options] = fetchMock.mock.calls[0];
    const body = JSON.parse((options as RequestInit).body as string);

    expect(url).toBe("http://localhost:3000/api/expenses/5");
    expect(options).toMatchObject({ method: "PUT" });
    expect(body.expense).toMatchObject({
      amount: "20",
      timezone_offset_minutes: -480,
    });
  });

  it("deleteExpense issues a DELETE request", async () => {
    fetchMock.mockResolvedValue(jsonResponse(null));

    await deleteExpense(5);

    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:3000/api/expenses/5",
      expect.objectContaining({ method: "DELETE" }),
    );
  });

  it("deleteExpense throws when the response is not ok", async () => {
    fetchMock.mockResolvedValue(jsonResponse(null, false));

    await expect(deleteExpense(5)).rejects.toThrow(
      "Failed to delete expense",
    );
  });
});
