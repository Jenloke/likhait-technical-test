import React from "react";
import { COLORS } from "../constants/colors";

interface SidebarProps {
  onNavigate?: (page: string) => void;
  currentPage?: string;
  isCollapsed?: boolean;
  onToggleCollapse: () => void;
}

type NavItem = {
  key: "history" | "category";
  label: string;
  icon: React.ReactNode;
};

// prevent retrigger load svg icons
const NavIcon = React.memo(({ icon }: { icon: React.ReactNode }) => (
  <span style={{ flexShrink: 0, display: "flex" }}>{icon}</span>
));

const navItems: NavItem[] = [
  {
    key: "history",
    label: "History",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    ),
  },
  {
    key: "category",
    label: "Categories",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
  },
];

const Sidebar: React.FC<SidebarProps> = ({
  onNavigate,
  currentPage = "history",
  isCollapsed = false,
  onToggleCollapse,
}) => {

  const sidebarStyle: React.CSSProperties = {
    width: isCollapsed ? "80px" : "300px",
    height: "100vh",
    background: `linear-gradient(180deg, ${COLORS.primary.p01} 0%, ${COLORS.primary.p02} 100%)`,
    display: "flex",
    flexDirection: "column",
    borderRight: `1px solid ${COLORS.secondary.s04}`,
    position: "fixed",
    left: 0,
    top: 0,
    transition: "all 0.3s linear",
  };

  const headerStyle: React.CSSProperties = {
    padding: "24px 16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottom: `1px solid ${COLORS.secondary.s04}`,
  };

  const logoStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: "16px",
  };

  const logoIconStyle: React.CSSProperties = {
    width: "48px",
    height: "48px",
    background: COLORS.primary.p07,
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "28px",
    fontWeight: "bold",
    color: "white",
  };

  const logoTextStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    overflow: "hidden",
    width: isCollapsed ? "0px" : "160px",
    transition: "width 0.3s linear, opacity 0.3s linear",
  };

  const logoTitleStyle: React.CSSProperties = {
    fontSize: "24px",
    fontWeight: 700,
    color: COLORS.primary.p09,
    lineHeight: 1.2,
  };

  const navStyle: React.CSSProperties = {
    flex: 1,
    padding: "16px 0",
  };

  const navItemStyle: React.CSSProperties = {
    width: "100%",
    padding: "12px 24px",
    display: "flex",
    alignItems: "center",
    gap: isCollapsed ? "0px" : "24px",
    background: COLORS.primary.p01,
    border: "none",
    cursor: "pointer",
    fontSize: "18px",
    fontWeight: 500,
    color: COLORS.primary.p09,
    textAlign: "left",
    transition: "background 0.3s linear",
  };

  const navTextStyle: React.CSSProperties = {
    display: isCollapsed ? "none" : "inline",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  };

  return (
    <aside 
      style={sidebarStyle}
    >
      <div style={headerStyle}>
        <div style={logoStyle} onClick={() => {onToggleCollapse()}}>
          <span style={logoIconStyle}>{
            isCollapsed 
              ? <>$</>
              : <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  strokeWidth="2"
                  style={{
                    transform: isCollapsed ? "rotate(180deg)" : "rotate(0deg)",
                    transition: "transform 0.3s ease",
                }}>
                  <path d="M15 18l-6-6 6-6" />
                </svg>
          }</span>
          <div style={logoTextStyle}>
            <div style={logoTitleStyle}>Expense Tracker</div>
          </div>
        </div>
      </div>

      <nav style={navStyle}>
        {navItems.map((item) => (
          <button
            key={item.key}
            style={navItemStyle}
            onClick={() => onNavigate?.(item.key)}
            onMouseEnter={(e) => {e.currentTarget.style.background = COLORS.primary.p03;}}
            onMouseLeave={(e) => {e.currentTarget.style.background = COLORS.primary.p01;}}
          >
            <NavIcon icon={item.icon} />
            <span style={navTextStyle}>{item.label}</span>
          </button>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
