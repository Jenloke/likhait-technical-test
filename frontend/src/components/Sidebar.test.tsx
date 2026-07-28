import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import Sidebar from "./Sidebar";

describe("Sidebar", () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute("data-theme");
  });

  it("renders the History nav item", () => {
    render(<Sidebar />);

    expect(screen.getByText("History")).toBeInTheDocument();
  });

  it("clicking the $ logo opens the hidden theme picker", () => {
    render(<Sidebar />);

    expect(screen.queryByText("Choose a theme")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Open theme picker" }));

    expect(screen.getByText("Choose a theme")).toBeInTheDocument();
  });

  it("selecting a theme from the picker applies it", () => {
    render(<Sidebar />);

    fireEvent.click(screen.getByRole("button", { name: "Open theme picker" }));
    fireEvent.click(screen.getByRole("button", { name: "Use Wavez theme" }));

    expect(document.documentElement.getAttribute("data-theme")).toBe("wavez");
  });
});
