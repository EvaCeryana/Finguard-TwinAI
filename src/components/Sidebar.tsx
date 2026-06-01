import { NavLink } from "react-router-dom";
import {
  Shield,
  Plus,
  LayoutDashboard,
  Clock,
  BookOpen,
  Activity,
} from "lucide-react";

const NAV_ITEMS = [
  { to: "/",          label: "Overview",       icon: LayoutDashboard, end: true },
  { to: "/simulate",  label: "New Simulation",  icon: Plus },
  { to: "/dashboard", label: "Risk Dashboard",  icon: Activity },
  { to: "/history",   label: "History",         icon: Clock },
  { to: "/method",    label: "Framework",       icon: BookOpen },
];

export function Sidebar() {
  return (
    <aside className="sidebar">
      {/* Brand — Task 3 fix: "TWIN AI" → "Twin AI" */}
      <div className="sidebar-brand">
        <div className="brand-icon">
          <Shield size={18} />
        </div>
        <div className="brand-text">
          <span className="brand-name">FinGuard</span>
          <span className="brand-sub">Twin AI</span>
        </div>
      </div>

      <p className="nav-section-label">WORKSPACE</p>

      <nav className="sidebar-nav">
        {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `nav-item ${isActive ? "nav-item--active" : ""}`
            }
          >
            <Icon size={16} className="nav-icon" />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="status-dot status-dot--online" />
        <span className="status-text">Engine Ready</span>
      </div>
    </aside>
  );
}
