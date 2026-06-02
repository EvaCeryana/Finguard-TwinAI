import { Outlet } from "react-router-dom";
import { Languages, Moon, Sun } from "lucide-react";
import { Sidebar } from "./Sidebar";
import {
  LanguageProvider,
  useLanguage,
  type AppLanguage,
} from "../context/LanguageContext";

const supportedLanguages: Array<{ code: AppLanguage; textKey: string }> = [
  { code: "en", textKey: "english" },
  { code: "zh", textKey: "chinese" },
  { code: "id", textKey: "indonesia" },
  { code: "ms", textKey: "malay" },
];

function AppLayoutContent() {
  const { language, setLanguage, theme, setTheme, t } = useLanguage();

  const isDarkMode = theme === "dark";

  const handleLanguageChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setLanguage(event.target.value as AppLanguage);
  };

  const switchTheme = () => {
    setTheme(isDarkMode ? "light" : "dark");
  };

  return (
    <div className="app-shell">
      <Sidebar />

      <main className="main-content">
        <div className="app-toolbar" aria-label="Application settings">
          <label className="toolbar-select-label">
            <Languages size={14} />

            <span className="toolbar-label-text">
              {t("language")}
            </span>

            <select
              className="toolbar-select"
              value={language}
              onChange={handleLanguageChange}
              aria-label={t("language")}
            >
              {supportedLanguages.map((item) => (
                <option key={item.code} value={item.code}>
                  {t(item.textKey)}
                </option>
              ))}
            </select>
          </label>

          <button
            type="button"
            className="btn btn--ghost btn--sm theme-toggle-btn"
            onClick={switchTheme}
            aria-label={isDarkMode ? t("lightMode") : t("darkMode")}
          >
            {isDarkMode ? <Sun size={14} /> : <Moon size={14} />}
            {isDarkMode ? t("lightMode") : t("darkMode")}
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
      <AppLayoutContent />
    </LanguageProvider>
  );
}
