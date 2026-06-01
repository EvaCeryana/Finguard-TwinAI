import { NavLink } from "react-router-dom";
import { BarChart3, BookOpen, History, Home, PlayCircle, ShieldCheck } from "lucide-react";
import { useLanguage, type AppLanguage } from "../context/LanguageContext";

const LABELS: Record<AppLanguage, Record<string, string>> = {
  en: {
    workspace: "Workspace",
    home: "Home",
    simulate: "New Simulation",
    dashboard: "Dashboard",
    history: "History",
    method: "Framework",
    status: "Demo Environment",
  },
  zh: {
    workspace: "工作区",
    home: "首页",
    simulate: "新模拟",
    dashboard: "仪表盘",
    history: "历史记录",
    method: "方法框架",
    status: "演示环境",
  },
  id: {
    workspace: "Workspace",
    home: "Beranda",
    simulate: "Simulasi Baru",
    dashboard: "Dashboard",
    history: "Riwayat",
    method: "Kerangka",
    status: "Lingkungan Demo",
  },
  ms: {
    workspace: "Workspace",
    home: "Laman Utama",
    simulate: "Simulasi Baharu",
    dashboard: "Dashboard",
    history: "Sejarah",
    method: "Rangka Kerja",
    status: "Persekitaran Demo",
  },
};

const NAV_ITEMS = [
  { to: "/", key: "home", icon: Home, end: true },
  { to: "/simulate", key: "simulate", icon: PlayCircle },
  { to: "/dashboard", key: "dashboard", icon: BarChart3 },
  { to: "/history", key: "history", icon: History },
  { to: "/method", key: "method", icon: BookOpen },
];

export function Sidebar() {
  const { language } = useLanguage();
  const labels = LABELS[language];

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="brand-icon">
          <ShieldCheck size={17} />
        </div>
        <div className="brand-text">
          <span className="brand-name">FinGuard</span>
          <span className="brand-sub">Twin AI</span>
        </div>
      </div>

      <p className="nav-section-label">{labels.workspace}</p>

      <nav className="sidebar-nav" aria-label="Main navigation">
        {NAV_ITEMS.map(({ to, key, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) => `nav-item ${isActive ? "nav-item--active" : ""}`}
          >
            <Icon size={15} className="nav-icon" />
            {labels[key]}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <span className="status-dot status-dot--online" />
        <span className="status-text">{labels.status}</span>
      </div>
    </aside>
  );
}
