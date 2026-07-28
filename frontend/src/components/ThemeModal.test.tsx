import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ThemeModal } from "./ThemeModal";

describe("ThemeModal", () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute("data-theme");
  });

  it("lists every theme with the default one marked active", () => {
    render(<ThemeModal isOpen onClose={() => {}} />);

    expect(
      screen.getByRole("button", { name: "Use Vibes theme" }),
    ).toHaveAttribute("aria-pressed", "true");
    expect(
      screen.getByRole("button", { name: "Use Wavez theme" }),
    ).toHaveAttribute("aria-pressed", "false");
    expect(
      screen.getByRole("button", { name: "Use Modern Dolch theme" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Use Bento theme" }),
    ).toBeInTheDocument();
  });

  it("clicking a theme card applies it immediately and keeps the modal open", () => {
    render(<ThemeModal isOpen onClose={() => {}} />);

    fireEvent.click(screen.getByRole("button", { name: "Use Bento theme" }));

    expect(document.documentElement.getAttribute("data-theme")).toBe("bento");
    expect(localStorage.getItem("expense-tracker-theme")).toBe("bento");
    expect(
      screen.getByRole("button", { name: "Use Bento theme" }),
    ).toHaveAttribute("aria-pressed", "true");
    expect(
      screen.getByRole("button", { name: "Use Vibes theme" }),
    ).toHaveAttribute("aria-pressed", "false");
    expect(screen.getByText("Choose a theme")).toBeInTheDocument();
  });

  it("renders nothing when closed", () => {
    const { container } = render(<ThemeModal isOpen={false} onClose={() => {}} />);

    expect(container).toBeEmptyDOMElement();
  });
});
