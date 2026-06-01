import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import { Languages, Moon, Sun } from "lucide-react";
import { Sidebar } from "./Sidebar";

type AppLanguage = "en" | "zh" | "id" | "ms";
type AppTheme = "dark" | "light";

const LANGUAGE_OPTIONS: { value: AppLanguage; label: string }[] = [
  { value: "en", label: "English" },
  { value: "zh", label: "中文" },
  { value: "id", label: "Indonesia" },
  { value: "ms", label: "Melayu" },
];

export function AppShell() {
  const [language, setLanguage] = useState<AppLanguage>(() => {
    const saved = localStorage.getItem("finguard-language") as AppLanguage | null;
    return saved ?? "en";
  });

  const [theme, setTheme] = useState<AppTheme>(() => {
    const saved = localStorage.getItem("finguard-theme") as AppTheme | null;
    return saved ?? "dark";
  });

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("finguard-theme", theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem("finguard-language", language);
    window.dispatchEvent(
      new CustomEvent("finguard-language-change", {
        detail: language,
      })
    );
  }, [language]);

  return (
    <div className="app-shell">
      <Sidebar />
      <main className="main-content">
        <div className="app-toolbar" aria-label="Application controls">
          <div className="language-switcher">
            <Languages size={14} />
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as AppLanguage)}
              aria-label="Select language"
            >
              {LANGUAGE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            className="theme-toggle"
            onClick={() => setTheme((current) => (current === "dark" ? "light" : "dark"))}
            aria-label="Toggle dark and light mode"
          >
            {theme === "dark" ? <Sun size={14} /> : <Moon size={14} />}
            {theme === "dark" ? "Light" : "Dark"}
          </button>
        </div>

        <Outlet />
      </main>
    </div>
  );
}
