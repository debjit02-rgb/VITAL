import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

const ThemeContext = createContext(null);

const STORAGE_KEY = "vital.theme";

function resolveEffectiveTheme(theme) {
  if (theme === "system") {
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }
  return theme;
}

function applyTheme(theme) {
  const effective = resolveEffectiveTheme(theme);
  document.documentElement.setAttribute("data-theme", effective);
}

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(() => {
    return localStorage.getItem(STORAGE_KEY) || "dark";
  });

  // Apply on mount and whenever theme changes
  useEffect(() => {
    applyTheme(theme);
    localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  // Listen for OS preference changes when system mode is active
  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => {
      if (theme === "system") applyTheme("system");
    };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [theme]);

  const setTheme = useCallback((t) => {
    setThemeState(t);
  }, []);

  const isDark = resolveEffectiveTheme(theme) === "dark";

  return (
    <ThemeContext.Provider value={{ theme, setTheme, isDark }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
