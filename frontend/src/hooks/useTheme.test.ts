import { describe, it, expect, beforeEach } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { useTheme } from "./useTheme";

const STORAGE_KEY = "expense-tracker-theme";

describe("useTheme", () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute("data-theme");
  });

  it("defaults to the default theme when nothing is stored", () => {
    const { result } = renderHook(() => useTheme());

    expect(result.current.theme).toBe("default");
    expect(document.documentElement.getAttribute("data-theme")).toBe(
      "default",
    );
  });

  it("reads a previously persisted theme on mount", () => {
    localStorage.setItem(STORAGE_KEY, "bento");

    const { result } = renderHook(() => useTheme());

    expect(result.current.theme).toBe("bento");
    expect(document.documentElement.getAttribute("data-theme")).toBe("bento");
  });

  it("ignores a garbage stored value and falls back to default", () => {
    localStorage.setItem(STORAGE_KEY, "not-a-real-theme");

    const { result } = renderHook(() => useTheme());

    expect(result.current.theme).toBe("default");
  });

  it("setTheme updates state, the DOM attribute, and persists the choice", () => {
    const { result } = renderHook(() => useTheme());

    act(() => {
      result.current.setTheme("wavez");
    });

    expect(result.current.theme).toBe("wavez");
    expect(document.documentElement.getAttribute("data-theme")).toBe("wavez");
    expect(localStorage.getItem(STORAGE_KEY)).toBe("wavez");
  });

  it("exposes the full theme registry", () => {
    const { result } = renderHook(() => useTheme());

    expect(result.current.themes.map((t) => t.id)).toEqual([
      "default",
      "wavez",
      "modern-dolch",
      "bento",
    ]);
  });
});
