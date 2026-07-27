/**
 * Reusable Modal component
 */

import React, { useEffect, useRef } from "react";
import { COLORS } from "../constants/colors";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  maxWidth?: string;
}

// A single global keydown listener and body-scroll lock per open Modal
// breaks when two Modals stack (e.g. AddCategoryModal opened from within an
// ExpenseForm modal): Escape would fire on both and close whichever one's
// listener runs, not just the topmost, and closing the inner one would
// unconditionally reset body scroll even though the outer one is still
// open. Track open instances so only the topmost responds to Escape, and
// scroll is only unlocked once none remain.
let openModalStack: symbol[] = [];

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = "500px",
}: ModalProps) {
  const instanceId = useRef(Symbol("modal")).current;

  useEffect(() => {
    if (!isOpen) return;

    openModalStack.push(instanceId);
    document.body.style.overflow = "hidden";

    return () => {
      openModalStack = openModalStack.filter((id) => id !== instanceId);
      if (openModalStack.length === 0) {
        document.body.style.overflow = "unset";
      }
    };
  }, [isOpen, instanceId]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      const isTopmost =
        openModalStack[openModalStack.length - 1] === instanceId;
      if (e.key === "Escape" && isTopmost) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose, instanceId]);

  if (!isOpen) return null;

  const overlayStyle: React.CSSProperties = {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
  };

  const modalStyle: React.CSSProperties = {
    backgroundColor: COLORS.background.main,
    borderRadius: "0.5rem",
    padding: "1.5rem",
    maxWidth,
    width: "90%",
    maxHeight: "90vh",
    overflow: "auto",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
  };

  const headerStyle: React.CSSProperties = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "1.5rem",
  };

  const titleStyle: React.CSSProperties = {
    fontSize: "1.25rem",
    fontWeight: 700,
    color: COLORS.text.primary,
  };

  const closeButtonStyle: React.CSSProperties = {
    background: "none",
    border: "none",
    fontSize: "1.5rem",
    cursor: "pointer",
    color: COLORS.text.secondary,
    padding: "0.25rem",
    lineHeight: 1,
  };

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
        {title && (
          <div style={headerStyle}>
            <h2 style={titleStyle}>{title}</h2>
            <button style={closeButtonStyle} onClick={onClose}>
              ×
            </button>
          </div>
        )}
        {children}
      </div>
    </div>
  );
}
