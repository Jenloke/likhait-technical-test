import React, { useState } from "react";
import Sidebar from "./components/Sidebar";
import DashboardPage from "./pages/DashboardPage";
import HistoryPage from "./pages/HistoryPage";
import { COLORS } from "./constants/colors";
import { TYPOGRAPHY } from "./constants/typography";
import { useIsMobile } from "./hooks/useMediaQuery";

function App() {
  const [currentPage, setCurrentPage] = useState("dashboard");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const isMobile = useIsMobile();
  // The last year/month History was showing, remembered across navigating
  // away and back so re-entering History restores that position instead of
  // resetting to the current month. Null until History has been visited at
  // least once in this session.
  const [historyYearMonth, setHistoryYearMonth] = useState<{
    year: number;
    month: number;
  } | null>(null);

  const handleNavigate = (page: string) => {
    if (page === "history" && historyYearMonth) {
      const params = new URLSearchParams();
      params.set("year", String(historyYearMonth.year));
      params.set("month", String(historyYearMonth.month));
      window.history.replaceState(
        {},
        "",
        `${window.location.pathname}?${params.toString()}`,
      );
    } else if (page === "dashboard") {
      // The year/month query params belong to History's URL state — strip
      // them so the address bar doesn't keep showing History's position
      // while looking at the Dashboard.
      window.history.replaceState({}, "", window.location.pathname);
    }
    setCurrentPage(page);
  };

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
        onNavigate={handleNavigate}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={handleToggleSidebar}
        isMobileOpen={isMobileDrawerOpen}
        onCloseMobile={() => setIsMobileDrawerOpen(false)}
      />
      <main style={mainStyle}>
        {currentPage === "dashboard" && <DashboardPage />}
        {currentPage === "history" && (
          <HistoryPage
            onYearMonthChange={(year, month) =>
              setHistoryYearMonth({ year, month })
            }
          />
        )}
      </main>
    </div>
  );
}

export default App;
