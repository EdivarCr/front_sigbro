import { Outlet } from "react-router-dom"
import { Sidebar } from "./Sidebar"
import { SidebarProvider, useSidebar } from "@/context/SidebarContext"
import { useBreakpoint } from "@/hooks/useBreakpoint"
import { ListIcon } from "@phosphor-icons/react"
import { useTheme } from "@/context/ThemeContext"

/**
 * Layout principal do sistema autenticado.
 *
 * Responsividade:
 * - Mobile: header fixo com hamburger + conteúdo full-width
 * - Desktop (lg+): sidebar fixa à esquerda + conteúdo ao lado
 */
export function MainLayout() {
  return (
    <SidebarProvider>
      <div className="flex h-screen bg-(--bg-primary)">
        <Sidebar />
        <div className="flex flex-1 flex-col overflow-hidden px-12 pb-4">
          <Header />
          <main className="flex-1 overflow-y-auto py-6">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}

function Header() {
  const { toggle } = useSidebar()
  const { isDark, toggle: toggleTheme } = useTheme()
  
  return (
    <header className="flex h-20 shrink-0 items-center justify-between bg-(--bg-primary)">
      <button
        onClick={toggle}
        className="rounded-sm text-(--txt-secondary) hover:bg-(--bg-surface) cursor-pointer"
        aria-label="Abrir menu"
      >
        <ListIcon size={32} />
      </button>

      {/* Toggle tema escuro */}
      <div className="flex items-center gap-2">
        <span className="text-body-sm text-(--txt-secondary)">
          Modo Escuro:
        </span>
        <button
          className={ `relative h-6 w-11 rounded-full transition-colors cursor-pointer ${
            isDark ? "bg-brand" : "bg-(--border-default)"
          }`}
          aria-label="Alternar tema"
          onClick={toggleTheme}
        >
          <span className={`absolute top-1 left-1 h-4 w-4 rounded-full bg-white transition-transform duration-300 ${
            isDark ? "translate-x-5" : "translate-x-0"
          }`} />
        </button>
      </div>
    </header>
  )
}
