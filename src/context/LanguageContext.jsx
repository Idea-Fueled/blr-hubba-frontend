import React, { createContext, useContext, useState, useEffect } from "react";
import { applyGoogleTranslate } from "../utils/googleTranslate";

const LanguageContext = createContext({
  language: "en",
  setLanguage: () => {},
  toggleLanguage: () => {},
  t: (en, kn) => en
});

const STORAGE_KEY = "blr_hubba_language";

export const LanguageProvider = ({ children }) => {
  const [language, setLanguageState] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === "kn" || saved === "en") return saved;
    } catch (e) {
      // Ignore localStorage errors
    }
    return "en";
  });

  const setLanguage = (lang) => {
    const validLang = lang === "kn" ? "kn" : "en";
    setLanguageState(validLang);
    try {
      localStorage.setItem(STORAGE_KEY, validLang);
    } catch (e) {}
  };

  const toggleLanguage = () => {
    setLanguage(language === "en" ? "kn" : "en");
  };

  // Helper function to pick localized value with safe fallback to English
  const t = (enValue, knValue) => {
    if (language === "kn" && knValue && String(knValue).trim().length > 0) {
      return knValue;
    }
    return enValue ?? "";
  };

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.setAttribute("data-language", language);
    applyGoogleTranslate(language);
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);

export default LanguageContext;
