import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CategoryFilter } from "./CategoryFilter";
import { Category } from "../types";

const categories: Category[] = [
  { id: 1, name: "Food", emoji: "🍔" },
  { id: 2, name: "Bills", emoji: "📄" },
];

describe("CategoryFilter", () => {
  it("renders an All pill plus one pill per category", () => {
    render(
      <CategoryFilter categories={categories} selected={[]} onChange={vi.fn()} />,
    );

    expect(screen.getByRole("button", { name: "All" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Food/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Bills/ })).toBeInTheDocument();
  });

  it("marks All as pressed when nothing is selected", () => {
    render(
      <CategoryFilter categories={categories} selected={[]} onChange={vi.fn()} />,
    );

    expect(screen.getByRole("button", { name: "All" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });

  it("adds a category to the selection on click, without clearing others", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(
      <CategoryFilter
        categories={categories}
        selected={["Food"]}
        onChange={onChange}
      />,
    );

    await user.click(screen.getByRole("button", { name: /Bills/ }));

    expect(onChange).toHaveBeenCalledWith(["Food", "Bills"]);
  });

  it("removes a category from the selection when its pill is clicked again", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(
      <CategoryFilter
        categories={categories}
        selected={["Food", "Bills"]}
        onChange={onChange}
      />,
    );

    await user.click(screen.getByRole("button", { name: /Food/ }));

    expect(onChange).toHaveBeenCalledWith(["Bills"]);
  });

  it("resets the selection to empty when All is clicked", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(
      <CategoryFilter
        categories={categories}
        selected={["Food", "Bills"]}
        onChange={onChange}
      />,
    );

    await user.click(screen.getByRole("button", { name: "All" }));

    expect(onChange).toHaveBeenCalledWith([]);
  });

  it("treats every category being individually selected the same as All", () => {
    render(
      <CategoryFilter
        categories={categories}
        selected={["Food", "Bills"]}
        onChange={vi.fn()}
      />,
    );

    expect(screen.getByRole("button", { name: "All" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });

  it("does not mark All as pressed for a partial selection", () => {
    render(
      <CategoryFilter
        categories={categories}
        selected={["Food"]}
        onChange={vi.fn()}
      />,
    );

    expect(screen.getByRole("button", { name: "All" })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
    expect(screen.getByRole("button", { name: /Food/ })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(screen.getByRole("button", { name: /Bills/ })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
  });
});
