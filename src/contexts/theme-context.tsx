"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

interface ThemeContextType {
  isRamadan: boolean;
  toggleRamadan: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [isRamadan, setIsRamadan] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem("theme-ramadan");
    if (savedTheme) {
      setIsRamadan(JSON.parse(savedTheme));
    }
  }, []);

  useEffect(() => {
    if (mounted) {
      localStorage.setItem("theme-ramadan", JSON.stringify(isRamadan));
      if (isRamadan) {
        document.documentElement.setAttribute("data-ramadan", "true");
      } else {
        document.documentElement.removeAttribute("data-ramadan");
      }
    }
  }, [isRamadan, mounted]);

  const toggleRamadan = () => {
    setIsRamadan((prev) => !prev);
  };

  if (!mounted) {
    return children;
  }

  return (
    <ThemeContext.Provider value={{ isRamadan, toggleRamadan }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
}
