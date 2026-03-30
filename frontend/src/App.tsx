import React, { useState } from "react";
import Sidebar from "./components/Sidebar";
import HistoryPage from "./pages/HistoryPage";
import { COLORS } from "./constants/colors";
import CategoryPage from "./pages/CategoryPage";

function App() {
  const [currentPage, setCurrentPage] = useState("history");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);

  const appStyle: React.CSSProperties = {
    display: "flex",
    minHeight: "100vh",
    background: COLORS.secondary.s01,
  };

  const mainStyle: React.CSSProperties = {
    flex: 1,
    marginLeft: "80px",
    transition: "margin-left 0.3s linear",
  };

  const handleToggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  return (
    <div style={appStyle}>
      <Sidebar
        currentPage={currentPage}
        onNavigate={setCurrentPage}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={handleToggleSidebar}
      />
      <main style={mainStyle}>
        {currentPage === "history" && <HistoryPage />}
        {currentPage === "category" && <CategoryPage />}
      </main>
    </div>
  );
}

export default App;
