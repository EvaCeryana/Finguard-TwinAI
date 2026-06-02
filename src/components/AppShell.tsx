import { Outlet } from "react-router-dom";
import { Languages, Moon, Sun } from "lucide-react";
import { Sidebar } from "./Sidebar";
import {
  LanguageProvider,
  useLanguage,
  type AppLanguage,
} from "../context/LanguageContext";

const appLanguageList: Array<{ code: AppLanguage; nameKey: string }> = [
  { code: "en", nameKey: "english" },
  { code: "zh", nameKey: "chinese" },
  { code: "id", nameKey: "indonesia" },
  { code: "ms", nameKey: "malay" },
];

function AppLayoutBody() {
  const { language, setLanguage, theme, setTheme, t } = useLanguage();

  const darkThemeActive = theme === "dark";

  function updateSelectedLanguage(event: React.ChangeEvent<HTMLSelectElement>) {
    const selectedLanguage = event.target.value as AppLanguage;
    setLanguage(selectedLanguage);
  }

  function updateThemeMode() {
    if (darkThemeActive) {
      setTheme("light");
    } else {
      setTheme("dark");
    }
  }

  return (
    <div className="app-shell">
      <Sidebar />

      <main className="main-content">
        <div className="app-toolbar" aria-label="FinGuard display settings">
          <label className="toolbar-select-label">
            <Languages size={14} />

            <span className="toolbar-label-text">{t("language")}</span>

            <select
              className="toolbar-select"
              value={language}
              onChange={updateSelectedLanguage}
              aria-label={t("language")}
            >
              {appLanguageList.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {t(lang.nameKey)}
                </option>
              ))}
            </select>
          </label>

          <button
            type="button"
            className="btn btn--ghost btn--sm theme-toggle-btn"
            onClick={updateThemeMode}
            aria-label={darkThemeActive ? t("lightMode") : t("darkMode")}
          >
            {darkThemeActive ? <Sun size={14} /> : <Moon size={14} />}
            {darkThemeActive ? t("lightMode") : t("darkMode")}
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
      <AppLayoutBody />
    </LanguageProvider>
  );
}
