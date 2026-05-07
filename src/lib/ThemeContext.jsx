import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { THEMES, DEFAULT_THEME_KEY, applyTheme } from "./themes";

const STORAGE_KEY = "resiliant.theme";

const ThemeContext = createContext({
  themeKey: DEFAULT_THEME_KEY,
  theme: THEMES[DEFAULT_THEME_KEY],
  setThemeKey: () => {},
  themes: THEMES,
});

export const ThemeProvider = ({ children }) => {
  const [themeKey, setKey] = useState(() => {
    if (typeof window === "undefined") return DEFAULT_THEME_KEY;
    const stored = window.localStorage?.getItem(STORAGE_KEY);
    return stored && THEMES[stored] ? stored : DEFAULT_THEME_KEY;
  });

  // Apply on mount + whenever theme changes
  useEffect(() => {
    applyTheme(themeKey);
    try { window.localStorage?.setItem(STORAGE_KEY, themeKey); } catch {}
  }, [themeKey]);

  const setThemeKey = useCallback((key) => {
    if (THEMES[key]) setKey(key);
  }, []);

  const value = {
    themeKey,
    theme: THEMES[themeKey],
    setThemeKey,
    themes: THEMES,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => useContext(ThemeContext);