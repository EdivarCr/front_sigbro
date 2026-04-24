import { Outlet } from "react-router-dom"
import { Sidebar } from "./Sidebar"
import { SidebarProvider, useSidebar } from "@/context/SidebarContext"
import { useBreakpoint } from "@/hooks/useBreakpoint"

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
      <div className="flex h-screen bg-gray-50 dark:bg-gray-950">
        <Sidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          <MobileHeader />
          <main className="flex-1 overflow-y-auto p-4 sm:p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}

/**
 * Header visível apenas em mobile/tablet (<lg).
 * Contém botão hamburger para abrir a sidebar.
 */
function MobileHeader() {
  const { shouldCollapseSidebar } = useBreakpoint()
  const { toggle } = useSidebar()

  if (!shouldCollapseSidebar) return null

  return (
    <header className="flex h-14 shrink-0 items-center gap-3 border-b border-gray-200 bg-white px-4 dark:border-gray-800 dark:bg-gray-900">
      <button
        onClick={toggle}
        className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
        aria-label="Abrir menu"
      >
        <svg
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
      </button>
      <div className="flex items-center gap-2">
        <span className="text-xl">🌶️</span>
        <span className="text-sm font-bold text-gray-900 dark:text-white">
          SisBro
        </span>
      </div>
    </header>
  )
}
