import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AddCategoryModal } from "./AddCategoryModal";
import { Category } from "../types";

const noop = () => {};

describe("AddCategoryModal", () => {
  it("rejects a blank category name", async () => {
    const user = userEvent.setup();
    render(
      <AddCategoryModal
        isOpen
        onClose={noop}
        existingNames={["Food"]}
        onCreate={vi.fn()}
        onCreated={noop}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Add Category" }));

    expect(
      await screen.findByText("Category name is required"),
    ).toBeInTheDocument();
  });

  it("rejects a name over 100 characters", async () => {
    const user = userEvent.setup();
    render(
      <AddCategoryModal
        isOpen
        onClose={noop}
        existingNames={[]}
        onCreate={vi.fn()}
        onCreated={noop}
      />,
    );

    await user.type(
      screen.getByLabelText("Category Name"),
      "A".repeat(101),
    );
    await user.click(screen.getByRole("button", { name: "Add Category" }));

    expect(
      await screen.findByText(
        "Category name must be 100 characters or fewer",
      ),
    ).toBeInTheDocument();
  });

  it("rejects a duplicate name case-insensitively", async () => {
    const user = userEvent.setup();
    render(
      <AddCategoryModal
        isOpen
        onClose={noop}
        existingNames={["Food"]}
        onCreate={vi.fn()}
        onCreated={noop}
      />,
    );

    await user.type(screen.getByLabelText("Category Name"), "food");
    await user.click(screen.getByRole("button", { name: "Add Category" }));

    expect(
      await screen.findByText("A category with this name already exists"),
    ).toBeInTheDocument();
  });

  it("creates the category, reports it upward, and closes on success", async () => {
    const user = userEvent.setup();
    const created: Category = { id: 5, name: "Groceries", emoji: "🍔" };
    const onCreate = vi.fn().mockResolvedValue(created);
    const onCreated = vi.fn();
    const onClose = vi.fn();

    render(
      <AddCategoryModal
        isOpen
        onClose={onClose}
        existingNames={[]}
        onCreate={onCreate}
        onCreated={onCreated}
      />,
    );

    await user.type(screen.getByLabelText("Category Name"), "Groceries");
    await user.click(screen.getByLabelText("Choose 🍔 emoji"));
    await user.click(screen.getByRole("button", { name: "Add Category" }));

    await waitFor(() => expect(onCreated).toHaveBeenCalledWith(created));
    expect(onCreate).toHaveBeenCalledWith("Groceries", "🍔");
    expect(onClose).toHaveBeenCalled();
  });

  it("shows the backend error message and stays open when creation fails", async () => {
    const user = userEvent.setup();
    const onCreate = vi.fn().mockRejectedValue(new Error("Name has already been taken"));

    render(
      <AddCategoryModal
        isOpen
        onClose={vi.fn()}
        existingNames={[]}
        onCreate={onCreate}
        onCreated={vi.fn()}
      />,
    );

    await user.type(screen.getByLabelText("Category Name"), "Groceries");
    await user.click(screen.getByRole("button", { name: "Add Category" }));

    expect(
      await screen.findByText("Name has already been taken"),
    ).toBeInTheDocument();
  });

  it("blocks Escape and backdrop dismissal while a submission is in flight", async () => {
    const user = userEvent.setup();
    let resolveCreate: (value: Category) => void = () => {};
    const onCreate = vi.fn(
      () =>
        new Promise<Category>((resolve) => {
          resolveCreate = resolve;
        }),
    );
    const onClose = vi.fn();

    render(
      <AddCategoryModal
        isOpen
        onClose={onClose}
        existingNames={[]}
        onCreate={onCreate}
        onCreated={vi.fn()}
      />,
    );

    await user.type(screen.getByLabelText("Category Name"), "Groceries");
    await user.click(screen.getByRole("button", { name: "Add Category" }));

    fireEvent.keyDown(document, { key: "Escape" });
    expect(onClose).not.toHaveBeenCalled();

    expect(screen.getByRole("button", { name: "Cancel" })).toBeDisabled();

    resolveCreate({ id: 1, name: "Groceries", emoji: "🍔" });
    await waitFor(() => expect(onClose).toHaveBeenCalled());
  });
});
