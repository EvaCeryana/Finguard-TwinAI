import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { PHRASE_TRANSLATIONS, UI_TEXT } from "../locales/uiText";

export type AppLanguage = "en" | "zh" | "id" | "ms";
export type AppTheme = "dark" | "light";

interface LanguageContextValue {
  language: AppLanguage;
  setLanguage: (language: AppLanguage) => void;
  theme: AppTheme;
  setTheme: (theme: AppTheme) => void;
  t: (key: string) => string;
  tx: (text?: string) => string;
}

function replaceCommonTerms(text: string, language: AppLanguage) {
  if (language === "en") return text;
  const terms = PHRASE_TRANSLATIONS[language];
  let output = text;
  Object.entries(terms).forEach(([from, to]) => {
    output = output.split(from).join(to);
  });
  return output;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<AppLanguage>(() => {
    const saved = localStorage.getItem("finguard-language") as AppLanguage | null;
    return saved === "zh" || saved === "id" || saved === "ms" || saved === "en" ? saved : "en";
  });

  const [theme, setThemeState] = useState<AppTheme>(() => {
    const saved = localStorage.getItem("finguard-theme") as AppTheme | null;
    return saved === "light" || saved === "dark" ? saved : "dark";
  });

  useEffect(() => {
    localStorage.setItem("finguard-language", language);
    document.documentElement.lang = language === "zh" ? "zh-CN" : language === "ms" ? "ms-MY" : language === "id" ? "id-ID" : "en";
  }, [language]);

  useEffect(() => {
    localStorage.setItem("finguard-theme", theme);
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  const value = useMemo<LanguageContextValue>(() => ({
    language,
    setLanguage: setLanguageState,
    theme,
    setTheme: setThemeState,
    t: (key: string) => UI_TEXT[language][key] ?? UI_TEXT.en[key] ?? key,
    tx: (text?: string) => {
      if (!text) return "";
      const exact = PHRASE_TRANSLATIONS[language][text];
      return exact ?? replaceCommonTerms(text, language);
    },
  }), [language, theme]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used inside LanguageProvider");
  }
  return context;
}
