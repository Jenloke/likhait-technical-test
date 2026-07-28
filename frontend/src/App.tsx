import React, { useState } from "react";
import Sidebar from "./components/Sidebar";
import HistoryPage from "./pages/HistoryPage";
import { COLORS } from "./constants/colors";
import { TYPOGRAPHY } from "./constants/typography";
import { useIsMobile } from "./hooks/useMediaQuery";

function App() {
  const [currentPage, setCurrentPage] = useState("history");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const isMobile = useIsMobile();

  const appStyle: React.CSSProperties = {
    display: "flex",
    minHeight: "100vh",
    background: COLORS.secondary.s01,
  };

  const mainStyle: React.CSSProperties = {
    flex: 1,
    minWidth: 0,
    marginLeft: isMobile ? 0 : isSidebarCollapsed ? "80px" : "360px",
    marginTop: isMobile ? "56px" : 0,
    transition: "margin-left 0.25s ease",
  };

  const mobileTopBarStyle: React.CSSProperties = {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    height: "56px",
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "0 16px",
    background: COLORS.primary.p01,
    borderBottom: `1px solid ${COLORS.secondary.s04}`,
    zIndex: 1000,
  };

  const hamburgerButtonStyle: React.CSSProperties = {
    width: "40px",
    height: "40px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "transparent",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
  };

  const mobileTitleStyle: React.CSSProperties = {
    fontSize: TYPOGRAPHY.size.md,
    fontWeight: TYPOGRAPHY.weight.bold,
    color: COLORS.primary.p09,
  };

  const handleToggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  return (
    <div style={appStyle}>
      {isMobile && (
        <div style={mobileTopBarStyle}>
          <button
            style={hamburgerButtonStyle}
            aria-label="Open menu"
            onClick={() => setIsMobileDrawerOpen(true)}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke={COLORS.text.primary}
              strokeWidth="2"
            >
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
          <span style={mobileTitleStyle}>Expense Tracker</span>
        </div>
      )}
      <Sidebar
        currentPage={currentPage}
        onNavigate={setCurrentPage}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={handleToggleSidebar}
        isMobileOpen={isMobileDrawerOpen}
        onCloseMobile={() => setIsMobileDrawerOpen(false)}
      />
      <main style={mainStyle}>
        {currentPage === "history" && <HistoryPage />}
      </main>
    </div>
  );
}

export default App;
