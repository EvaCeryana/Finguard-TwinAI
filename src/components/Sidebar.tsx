import { NavLink } from "react-router-dom";
import {
  BarChart3,
  BookOpen,
  History,
  Home,
  PlayCircle,
  ShieldCheck,
} from "lucide-react";
import { useLanguage, type AppLanguage } from "../context/LanguageContext";

type SidebarTextKey =
  | "workspace"
  | "home"
  | "simulate"
  | "dashboard"
  | "history"
  | "method"
  | "status";

const sidebarText: Record<AppLanguage, Record<SidebarTextKey, string>> = {
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

const sidebarLinks = [
  {
    path: "/",
    labelKey: "home",
    icon: Home,
    exact: true,
  },
  {
    path: "/simulate",
    labelKey: "simulate",
    icon: PlayCircle,
  },
  {
    path: "/dashboard",
    labelKey: "dashboard",
    icon: BarChart3,
  },
  {
    path: "/history",
    labelKey: "history",
    icon: History,
  },
  {
    path: "/method",
    labelKey: "method",
    icon: BookOpen,
  },
] satisfies Array<{
  path: string;
  labelKey: SidebarTextKey;
  icon: typeof Home;
  exact?: boolean;
}>;

function getNavItemClass(isActive: boolean) {
  return isActive ? "nav-item nav-item--active" : "nav-item";
}

export function Sidebar() {
  const { language } = useLanguage();
  const text = sidebarText[language];

  return (
    <aside className="sidebar" aria-label="FinGuard sidebar">
      <div className="sidebar-brand">
        <div className="brand-icon" aria-hidden="true">
          <ShieldCheck size={17} />
        </div>

        <div className="brand-text">
          <span className="brand-name">FinGuard</span>
          <span className="brand-sub">Twin AI</span>
        </div>
      </div>

      <p className="nav-section-label">
        {text.workspace}
      </p>

      <nav className="sidebar-nav" aria-label="Main navigation">
        {sidebarLinks.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.exact}
              className={({ isActive }) => getNavItemClass(isActive)}
            >
              <Icon size={15} className="nav-icon" aria-hidden="true" />
              <span>{text[item.labelKey]}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <span className="status-dot status-dot--online" aria-hidden="true" />
        <span className="status-text">{text.status}</span>
      </div>
    </aside>
  );
}
