"use client"

import { createContext, useContext, useEffect, useState } from "react"

interface ThemeContextType {
  theme: string;
  setTheme: (theme: string) => void;
}

const ThemeProviderContext = createContext<ThemeContextType>({
  theme: "light",
  setTheme: (theme: string) => {},
})

import { ReactNode } from "react";

interface ThemeProviderProps {
  children: ReactNode;
  defaultTheme?: string;
  storageKey?: string;
  [key: string]: any;
}

export function ThemeProvider({ children, defaultTheme = "system", storageKey = "chromo-theme", ...props }: ThemeProviderProps) {
  const [theme, setTheme] = useState(defaultTheme)

  useEffect(() => {
    const root = window.document.documentElement
    const savedTheme = localStorage.getItem(storageKey)

    if (savedTheme) {
      setTheme(savedTheme)
      root.classList.remove("light", "dark")
      root.classList.add(savedTheme)
    } else if (defaultTheme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
      setTheme(systemTheme)
      root.classList.remove("light", "dark")
      root.classList.add(systemTheme)
    } else {
      root.classList.remove("light", "dark")
      root.classList.add(defaultTheme)
    }
  }, [defaultTheme, storageKey])

  interface ThemeContextValue {
    theme: string;
    setTheme: (newTheme: string) => void;
  }

  const value: ThemeContextValue = {
    theme,
    setTheme: (newTheme: string) => {
      const root = window.document.documentElement
      localStorage.setItem(storageKey, newTheme)

      root.classList.remove("light", "dark")
      root.classList.add(newTheme)

      setTheme(newTheme)
    },
  }

  return (
    <ThemeProviderContext.Provider value={value} {...props}>
      {children}
    </ThemeProviderContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext)
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
}

