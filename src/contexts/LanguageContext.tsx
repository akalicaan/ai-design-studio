import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import type { Lang, TranslationKey } from "@/lib/i18n";
import { t } from "@/lib/i18n";

interface LanguageContextValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
  toggleLang: () => void;
  _: (key: TranslationKey) => string;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>(() => {
    const saved = typeof window !== "undefined" ? localStorage.getItem("lang") : null;
    return (saved as Lang) ?? "en";
  });

  const handleSetLang = useCallback((newLang: Lang) => {
    setLang(newLang);
    localStorage.setItem("lang", newLang);
    document.documentElement.lang = newLang;
  }, []);

  const toggleLang = useCallback(() => {
    handleSetLang(lang === "en" ? "tr" : "en");
  }, [lang, handleSetLang]);

  const translate = useCallback(
    (key: TranslationKey) => t(key, lang),
    [lang]
  );

  return (
    <LanguageContext.Provider
      value={{ lang, setLang: handleSetLang, toggleLang, _: translate }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}
