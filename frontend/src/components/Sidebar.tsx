import React from "react";
import { COLORS } from "../constants/colors";
import { TYPOGRAPHY } from "../constants/typography";
import { useIsMobile } from "../hooks/useMediaQuery";

interface SidebarProps {
  onNavigate?: (page: string) => void;
  currentPage?: string;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  onNavigate,
  currentPage = "history",
  isCollapsed = false,
  onToggleCollapse,
  isMobileOpen = false,
  onCloseMobile,
}) => {
  const isMobile = useIsMobile();
  // The drawer is always "expanded" content-wise on mobile; only its
  // slide-in/out state matters there. On desktop, isCollapsed drives width.
  const collapsed = isMobile ? false : isCollapsed;

  const sidebarStyle: React.CSSProperties = {
    width: isMobile ? "280px" : collapsed ? "80px" : "360px",
    height: "100vh",
    background: `linear-gradient(180deg, ${COLORS.primary.p01} 0%, ${COLORS.primary.p02} 100%)`,
    display: "flex",
    flexDirection: "column",
    borderRight: `1px solid ${COLORS.secondary.s04}`,
    position: "fixed",
    left: 0,
    top: 0,
    zIndex: 1100,
    transition: isMobile
      ? "transform 0.25s ease"
      : "width 0.25s ease",
    transform: isMobile
      ? `translateX(${isMobileOpen ? "0" : "-100%"})`
      : "translateX(0)",
  };

  const backdropStyle: React.CSSProperties = {
    position: "fixed",
    inset: 0,
    background: "rgba(0, 0, 0, 0.4)",
    opacity: isMobileOpen ? 1 : 0,
    pointerEvents: isMobileOpen ? "auto" : "none",
    transition: "opacity 0.25s ease",
    zIndex: 1050,
  };

  const headerStyle: React.CSSProperties = {
    // Horizontal inset matches navItemStyle below (24px expanded, 16px
    // collapsed) so the logo and nav icons share the same left edge when
    // expanded, and both land dead-center of the 80px rail when collapsed.
    padding: isMobile ? "20px 24px" : collapsed ? "24px 16px" : "24px 24px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottom: `1px solid ${COLORS.secondary.s04}`,
  };

  const logoStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: isMobile ? "12px" : "16px",
    minWidth: 0,
    overflow: "hidden",
  };

  const logoIconStyle: React.CSSProperties = {
    width: isMobile ? "40px" : "48px",
    height: isMobile ? "40px" : "48px",
    background: COLORS.primary.p07,
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: isMobile ? "22px" : "28px",
    fontWeight: TYPOGRAPHY.weight.bold,
    color: "white",
    flexShrink: 0,
  };

  const logoTextStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    minWidth: 0,
    maxWidth: collapsed ? 0 : "220px",
    opacity: collapsed ? 0 : 1,
    overflow: "hidden",
    whiteSpace: "nowrap",
    transition: "max-width 0.25s ease, opacity 0.2s ease",
  };

  const logoTitleStyle: React.CSSProperties = {
    // Mobile is intentionally off-scale (between sm/14px and md/18px) — at
    // md, "Expense Tracker" doesn't fit the 280px drawer without truncating.
    fontSize: isMobile ? "17px" : TYPOGRAPHY.size.xl,
    fontWeight: TYPOGRAPHY.weight.bold,
    color: COLORS.primary.p09,
    lineHeight: TYPOGRAPHY.lineHeight.tight,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  };

  // A small circular button vertically centered on the sidebar's own edge —
  // deliberately kept away from the header row so it never crowds the $
  // logo, and its position never has to fit inside the collapsed 80px
  // header content (so it can't overflow/clip either).
  const desktopToggleButtonStyle: React.CSSProperties = {
    position: "absolute",
    top: "50%",
    right: "-16px",
    transform: "translateY(-50%)",
    width: "32px",
    height: "32px",
    background: "white",
    border: `1px solid ${COLORS.secondary.s04}`,
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    boxShadow: "0 1px 4px rgba(0, 0, 0, 0.15)",
    transition: "background 0.2s",
    zIndex: 1101,
  };

  const mobileCloseButtonStyle: React.CSSProperties = {
    width: "40px",
    height: "40px",
    background: "transparent",
    border: "none",
    borderRadius: "8px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    fontSize: TYPOGRAPHY.size.xl,
    color: COLORS.primary.p09,
    flexShrink: 0,
  };

  const navStyle: React.CSSProperties = {
    flex: 1,
    padding: "16px 0",
  };

  const navItemStyle: React.CSSProperties = {
    width: "100%",
    padding: collapsed ? "16px" : "16px 24px",
    display: "flex",
    alignItems: "center",
    justifyContent: collapsed ? "center" : "flex-start",
    // Collapses to 0 alongside the text (below) rather than staying fixed —
    // a fixed gap next to a zero-width (but still present) text span was
    // pushing the icon off-center in the collapsed 80px rail.
    gap: collapsed ? "0px" : "16px",
    background: currentPage === "history" ? COLORS.primary.p03 : "transparent",
    border: "none",
    cursor: "pointer",
    fontSize: TYPOGRAPHY.size.md,
    fontWeight: TYPOGRAPHY.weight.medium,
    color: COLORS.primary.p09,
    textAlign: "left",
    transition: "background 0.2s, gap 0.25s ease",
  };

  const navTextStyle: React.CSSProperties = {
    display: "inline-block",
    maxWidth: collapsed ? 0 : "200px",
    opacity: collapsed ? 0 : 1,
    overflow: "hidden",
    whiteSpace: "nowrap",
    transition: "max-width 0.25s ease, opacity 0.2s ease",
  };

  const handleNavigate = (page: string) => {
    onNavigate?.(page);
    if (isMobile) onCloseMobile?.();
  };

  return (
    <>
      {isMobile && (
        <div
          style={backdropStyle}
          onClick={onCloseMobile}
          aria-hidden={!isMobileOpen}
        />
      )}
      <aside style={sidebarStyle}>
        <div style={headerStyle}>
          <div style={logoStyle}>
            <span style={logoIconStyle}>$</span>
            <div style={logoTextStyle}>
              <div style={logoTitleStyle}>Expense Tracker</div>
            </div>
          </div>
          {isMobile ? (
            <button
              style={mobileCloseButtonStyle}
              aria-label="Close menu"
              onClick={onCloseMobile}
            >
              ×
            </button>
          ) : null}
        </div>

        {!isMobile && (
          <button
            style={desktopToggleButtonStyle}
            aria-label="Toggle sidebar"
            onClick={onToggleCollapse}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = COLORS.secondary.s02;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "white";
            }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#464343"
              strokeWidth="2"
              style={{
                transform: collapsed ? "rotate(180deg)" : "rotate(0deg)",
                transition: "transform 0.25s ease",
              }}
            >
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
        )}

        <nav style={navStyle}>
          <button
            style={navItemStyle}
            onClick={() => handleNavigate("history")}
            onMouseEnter={(e) => {
              if (currentPage !== "history") {
                e.currentTarget.style.background = COLORS.primary.p02;
              }
            }}
            onMouseLeave={(e) => {
              if (currentPage !== "history") {
                e.currentTarget.style.background = "transparent";
              }
            }}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              style={{ flexShrink: 0 }}
            >
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            <span style={navTextStyle}>History</span>
          </button>
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
