"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { ConfigProvider, theme as antdTheme } from "antd";

type ThemeMode = "light" | "dark";
const ThemeContext = createContext({
  theme: "light" as ThemeMode,
  toggle: () => {},
});

export function ThemeProvider({
  children,
  initialTheme,
}: {
  children: React.ReactNode;
  initialTheme?: ThemeMode;
}) {
  // Start with the server-provided initialTheme (or "light") so server and first client render match.
  const [theme, setTheme] = useState<ThemeMode>(() => initialTheme ?? "light");

  // After mount, sync with client-only preferences if no server-provided initialTheme.
  useEffect(() => {
    if (initialTheme) return;
    let rafId: number | null = null;
    let toId: number | null = null;

    try {
      const stored = localStorage.getItem("theme") as ThemeMode | null;
      if (stored) {
        if (typeof requestAnimationFrame !== "undefined") {
          rafId = requestAnimationFrame(() => setTheme(stored));
        } else {
          toId = window.setTimeout(() => setTheme(stored), 0);
        }
        return () => {
          if (rafId) cancelAnimationFrame(rafId);
          if (toId) clearTimeout(toId);
        };
      }
    } catch {}

    if (
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
    ) {
      if (typeof requestAnimationFrame !== "undefined") {
        rafId = requestAnimationFrame(() => setTheme("dark"));
      } else {
        toId = window.setTimeout(() => setTheme("dark"), 0);
      }
    }

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      if (toId) clearTimeout(toId);
    };
  }, [initialTheme]);

  useEffect(() => {
    try {
      localStorage.setItem("theme", theme);
    } catch {}
    document.documentElement.setAttribute("data-theme", theme);
    document.documentElement.classList.toggle("dark", theme === "dark");
    document.cookie = `theme=${theme}; path=/`;

    // sync app CSS variables in app/globals.css
    const vars =
      theme === "dark"
        ? {
            "--background": "#10182b",
            "--foreground": "#ededed",
            "--bg": "#10182b",
            "--text": "#e6eef8",
            "--btn-bg": "#10182b",
            "--btn-text": "#e6eef8",
            "--btn-border": "#374151",
          }
        : {
            "--background": "#ffffff",
            "--foreground": "#171717",
            "--bg": "#ffffff",
            "--text": "#111827",
            "--btn-bg": "#ffffff",
            "--btn-text": "#000000",
            "--btn-border": "#e5e7eb",
          };
    Object.entries(vars).forEach(([key, value]) =>
      document.documentElement.style.setProperty(key, value as string)
    );
  }, [theme]);

  return (
    <ThemeContext.Provider
      value={{
        theme,
        toggle: () => setTheme((t) => (t === "light" ? "dark" : "light")),
      }}
    >
      <ConfigProvider
        theme={{
          // algorithm controls whole AntD theme (dark/compact/etc)
          algorithm:
            theme === "dark"
              ? antdTheme.darkAlgorithm
              : antdTheme.defaultAlgorithm,
          // token overrides — customize seed / alias tokens per docs
          token:
            theme === "dark"
              ? {
                  colorPrimary: "#177ddc",
                  colorBgContainer: "#10182b",
                  colorText: "#e6eef8",
                }
              : {
                  colorPrimary: "#1677ff",
                  colorBgContainer: "#ffffff",
                  colorText: "rgba(0,0,0,0.88)",
                },
        }}
      >
        {children}
      </ConfigProvider>
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}

export function getTheme() {
  const html =
    typeof document !== "undefined" ? document.documentElement : null;
  if (!html) return "light";
  return (
    html.getAttribute("data-theme") ||
    (html.classList.contains("dark") ? "dark" : undefined) ||
    (window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light")
  );
}
