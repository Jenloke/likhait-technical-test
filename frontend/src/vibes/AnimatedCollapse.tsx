/**
 * Reusable animated expand/collapse primitive
 */

import React from "react";

interface AnimatedCollapseProps {
  isOpen: boolean;
  children: React.ReactNode;
}

export function AnimatedCollapse({ isOpen, children }: AnimatedCollapseProps) {
  const outerStyle: React.CSSProperties = {
    display: "grid",
    gridTemplateRows: isOpen ? "1fr" : "0fr",
    transition: "grid-template-rows 0.25s ease",
  };

  const innerStyle: React.CSSProperties = {
    overflow: "hidden",
  };

  return (
    <div style={outerStyle}>
      <div style={innerStyle}>{children}</div>
    </div>
  );
}
