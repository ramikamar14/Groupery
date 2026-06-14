import { useState, useEffect } from "react";

type Theme = "light" | "dark" | "system";

function getSystemPreference(): "light" | "dark" {
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  const resolved = theme === "system" ? getSystemPreference() : theme;
  root.classList.toggle("dark", resolved === "dark");
}

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>(() => {
    try {
      return (localStorage.getItem("grouperry_theme") as Theme) || "system";
    } catch {
      return "system";
    }
  });

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  // Watch system preference changes
  useEffect(() => {
    if (theme !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => applyTheme("system");
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [theme]);

  const setTheme = (t: Theme) => {
    try {
      localStorage.setItem("grouperry_theme", t);
    } catch {}
    setThemeState(t);
  };

  const toggle = () => {
    const resolved = theme === "system" ? getSystemPreference() : theme;
    setTheme(resolved === "dark" ? "light" : "dark");
  };

  const resolved = theme === "system" ? getSystemPreference() : theme;

  return { theme, resolved, setTheme, toggle };
}
