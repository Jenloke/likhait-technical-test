import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Modal } from "./Modal";

describe("Modal", () => {
  it("renders its title and children when open", () => {
    render(
      <Modal isOpen onClose={vi.fn()} title="My Modal">
        <p>content</p>
      </Modal>,
    );

    expect(screen.getByText("My Modal")).toBeInTheDocument();
    expect(screen.getByText("content")).toBeInTheDocument();
  });

  it("renders nothing when closed", () => {
    const { container } = render(
      <Modal isOpen={false} onClose={vi.fn()} title="My Modal">
        <p>content</p>
      </Modal>,
    );

    expect(container).toBeEmptyDOMElement();
  });

  it("calls onClose when the backdrop or the close button is clicked", () => {
    const onClose = vi.fn();
    render(
      <Modal isOpen onClose={onClose} title="My Modal">
        <p>content</p>
      </Modal>,
    );

    fireEvent.click(screen.getByText("×"));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("clicking inside the modal body does not close it", () => {
    const onClose = vi.fn();
    render(
      <Modal isOpen onClose={onClose} title="My Modal">
        <p>content</p>
      </Modal>,
    );

    fireEvent.click(screen.getByText("content"));
    expect(onClose).not.toHaveBeenCalled();
  });

  it("Escape closes only the topmost of two stacked modals", () => {
    const onCloseOuter = vi.fn();
    const onCloseInner = vi.fn();

    // Mount the outer modal on its own first, then open the inner one in a
    // later, separate commit -- matching how AddCategoryModal actually opens
    // from within an already-open ExpenseForm modal. (Mounting both in the
    // same commit would run the inner's effect before the outer's, since
    // React fires child effects before parent effects, which inverts the
    // stack order this test is meant to exercise.)
    const { rerender } = render(
      <Modal isOpen onClose={onCloseOuter} title="Outer">
        <Modal isOpen={false} onClose={onCloseInner} title="Inner">
          <p>inner content</p>
        </Modal>
      </Modal>,
    );

    rerender(
      <Modal isOpen onClose={onCloseOuter} title="Outer">
        <Modal isOpen onClose={onCloseInner} title="Inner">
          <p>inner content</p>
        </Modal>
      </Modal>,
    );

    fireEvent.keyDown(document, { key: "Escape" });

    expect(onCloseInner).toHaveBeenCalledTimes(1);
    expect(onCloseOuter).not.toHaveBeenCalled();
  });

  it("keeps body scroll locked until every stacked modal has closed", () => {
    const { rerender } = render(
      <Modal isOpen onClose={vi.fn()} title="Outer">
        <Modal isOpen onClose={vi.fn()} title="Inner">
          <p>inner content</p>
        </Modal>
      </Modal>,
    );

    expect(document.body.style.overflow).toBe("hidden");

    // Close only the inner modal; the outer one is still open.
    rerender(
      <Modal isOpen onClose={vi.fn()} title="Outer">
        <Modal isOpen={false} onClose={vi.fn()} title="Inner">
          <p>inner content</p>
        </Modal>
      </Modal>,
    );

    expect(document.body.style.overflow).toBe("hidden");

    // Close the outer modal too; now scroll should unlock.
    rerender(
      <Modal isOpen={false} onClose={vi.fn()} title="Outer">
        <Modal isOpen={false} onClose={vi.fn()} title="Inner">
          <p>inner content</p>
        </Modal>
      </Modal>,
    );

    expect(document.body.style.overflow).toBe("unset");
  });
});
