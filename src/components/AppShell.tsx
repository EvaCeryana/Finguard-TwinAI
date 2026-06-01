import { Outlet } from "react-router-dom";
import { Languages, Moon, Sun } from "lucide-react";
import { Sidebar } from "./Sidebar";
import { LanguageProvider, useLanguage, type AppLanguage } from "../context/LanguageContext";

const LANGUAGE_OPTIONS: { value: AppLanguage; labelKey: string }[] = [
  { value: "en", labelKey: "english" },
  { value: "zh", labelKey: "chinese" },
  { value: "id", labelKey: "indonesia" },
  { value: "ms", labelKey: "malay" },
];

function AppShellInner() {
  const { language, setLanguage, theme, setTheme, t } = useLanguage();

  return (
    <div className="app-shell">
      <Sidebar />
      <main className="main-content">
        <div className="app-toolbar" aria-label="Application settings">
          <label className="toolbar-select-label">
            <Languages size={14} />
            <span className="toolbar-label-text">{t("language")}</span>
            <select
              className="toolbar-select"
              value={language}
              onChange={(event) => setLanguage(event.target.value as AppLanguage)}
              aria-label={t("language")}
            >
              {LANGUAGE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {t(option.labelKey)}
                </option>
              ))}
            </select>
          </label>

          <button
            type="button"
            className="btn btn--ghost btn--sm theme-toggle-btn"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            aria-label={theme === "dark" ? t("lightMode") : t("darkMode")}
          >
            {theme === "dark" ? <Sun size={14} /> : <Moon size={14} />}
            {theme === "dark" ? t("lightMode") : t("darkMode")}
          </button>
        </div>
        <Outlet />
      </main>
    </div>
  );
}

export function AppShell() {
  return (
    <LanguageProvider>
      <AppShellInner />
    </LanguageProvider>
  );
}
