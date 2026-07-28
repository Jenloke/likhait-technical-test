import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import HistoryPage from "./HistoryPage";
import * as api from "../services/api";

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
