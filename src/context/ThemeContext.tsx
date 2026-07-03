import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react"

interface ThemeContextData {
  isDark: boolean
  toggle: () => void
}

const ThemeContext = createContext<ThemeContextData>({} as ThemeContextData)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [isDark, setIsDark] = useState<boolean>(() => {
    const saved = localStorage.getItem("sigbro_theme")
    return saved === "dark"
  })

  useEffect(() => {
    const root = window.document.documentElement
    if (isDark) {
      root.classList.add("dark")
      localStorage.setItem("sigbro_theme", "dark")
    } else {
      root.classList.remove("dark")
      localStorage.setItem("sigbro_theme", "light")
    }
  }, [isDark])

  const toggle = () => setIsDark((prev) => !prev)

  return (
    <ThemeContext.Provider value={{ isDark, toggle }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  return useContext(ThemeContext)
}
