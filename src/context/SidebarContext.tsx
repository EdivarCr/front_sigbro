import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react"
import { useBreakpoint } from "@/hooks/useBreakpoint"

// ---------------------------------------------------------------------------
// Tipos
// ---------------------------------------------------------------------------
interface SidebarContextData {
  isOpen: boolean
  toggle: () => void
  open: () => void
  close: () => void
}

// ---------------------------------------------------------------------------
// Contexto
// ---------------------------------------------------------------------------
const SidebarContext = createContext<SidebarContextData>(
  {} as SidebarContextData
)

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------
export function SidebarProvider({ children }: { children: ReactNode }) {
  const { shouldCollapseSidebar } = useBreakpoint()
  const [isOpen, setIsOpen] = useState(false)

  const toggle = useCallback(() => setIsOpen((prev) => !prev), [])
  const open = useCallback(() => setIsOpen(true), [])
  const close = useCallback(() => setIsOpen(false), [])

  // Fecha automaticamente ao redimensionar para desktop
  useEffect(() => {
    if (!shouldCollapseSidebar) {
      setIsOpen(false)
    }
  }, [shouldCollapseSidebar])

  return (
    <SidebarContext.Provider value={{ isOpen, toggle, open, close }}>
      {children}
    </SidebarContext.Provider>
  )
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------
export function useSidebar() {
  const context = useContext(SidebarContext)
  if (!context) {
    throw new Error("useSidebar deve ser usado dentro de um SidebarProvider")
  }
  return context
}
