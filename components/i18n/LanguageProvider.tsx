"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

export type Locale = "fa" | "en";

const LanguageContext = createContext<{
  locale: Locale;
  setLocale: (locale: Locale) => void;
}>({ locale: "fa", setLocale: () => undefined });

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("fa");

  useEffect(() => {
    const saved = window.localStorage.getItem("avoocado-locale");
    const initial: Locale = saved === "en" ? "en" : "fa";
    queueMicrotask(() => setLocaleState(initial));
    document.documentElement.lang = initial;
    document.documentElement.dir = initial === "fa" ? "rtl" : "ltr";
  }, []);

  function setLocale(next: Locale) {
    setLocaleState(next);
    window.localStorage.setItem("avoocado-locale", next);
    document.cookie = `avoocado-locale=${next}; path=/; max-age=31536000; samesite=lax`;
    document.documentElement.lang = next;
    document.documentElement.dir = next === "fa" ? "rtl" : "ltr";
    window.location.reload();
  }

  const value = useMemo(() => ({ locale, setLocale }), [locale]);
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  return useContext(LanguageContext);
}

export function LanguageSwitch({ inverted = false }: { inverted?: boolean }) {
  const { locale, setLocale } = useLanguage();
  return (
    <div
      className={`flex rounded-full border p-1 text-[11px] font-bold ${inverted ? "border-white/25" : "border-black/15"}`}
      aria-label={locale === "fa" ? "انتخاب زبان" : "Choose language"}
      dir="ltr"
    >
      {(["fa", "en"] as const).map((item) => (
        <button
          key={item}
          type="button"
          onClick={() => setLocale(item)}
          className={`rounded-full px-2.5 py-1 uppercase transition ${locale === item ? inverted ? "bg-white text-black" : "bg-black text-white" : inverted ? "text-white/55 hover:text-white" : "text-black/45 hover:text-black"}`}
          aria-pressed={locale === item}
        >
          {item}
        </button>
      ))}
    </div>
  );
}
