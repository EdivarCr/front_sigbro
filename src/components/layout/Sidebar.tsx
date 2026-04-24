import { NavLink, useLocation } from "react-router-dom"
import { useBreakpoint } from "@/hooks/useBreakpoint"
import { useSidebar } from "@/context/SidebarContext"
import { useEffect } from "react"

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: "📊" },
  { to: "/produtos", label: "Produtos", icon: "🌶️" },
  { to: "/vendas", label: "Vendas", icon: "💰" },
  { to: "/estoque", label: "Estoque", icon: "📦" },
  { to: "/pdvs", label: "PDVs", icon: "🏪" },
]

/**
 * Sidebar de navegação do sistema.
 *
 * - Desktop (lg+): sidebar fixa à esquerda, sempre visível.
 * - Mobile/Tablet (<lg): sidebar como overlay com backdrop, controlada via hamburger.
 */
export function Sidebar() {
  const { shouldCollapseSidebar } = useBreakpoint()
  const { isOpen, close } = useSidebar()
  const location = useLocation()

  // Fecha a sidebar mobile ao navegar
  useEffect(() => {
    if (shouldCollapseSidebar) {
      close()
    }
  }, [location.pathname, shouldCollapseSidebar, close])

  // Desktop: sidebar fixa
  if (!shouldCollapseSidebar) {
    return (
      <aside className="flex w-64 flex-col border-r border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        <SidebarHeader />
        <SidebarNav />
      </aside>
    )
  }

  // Mobile/Tablet: overlay
  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity"
          onClick={close}
          aria-hidden="true"
        />
      )}

      {/* Sidebar panel */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 max-w-[85vw] flex-col bg-white shadow-2xl transition-transform duration-300 ease-in-out dark:bg-gray-900 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Header com botão de fechar */}
        <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3 dark:border-gray-800">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🌶️</span>
            <h1 className="text-lg font-bold text-gray-900 dark:text-white">
              SisBro
            </h1>
          </div>
          <button
            onClick={close}
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
            aria-label="Fechar menu"
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
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <SidebarNav />
      </aside>
    </>
  )
}

// ---------------------------------------------------------------------------
// Sub-componentes internos
// ---------------------------------------------------------------------------

function SidebarHeader() {
  return (
    <div className="flex h-16 items-center gap-2 border-b border-gray-200 px-6 dark:border-gray-800">
      <span className="text-2xl">🌶️</span>
      <h1 className="text-lg font-bold text-gray-900 dark:text-white">
        SisBro
      </h1>
    </div>
  )
}

function SidebarNav() {
  return (
    <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
      {navItems.map(({ to, label, icon }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
              isActive
                ? "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300"
                : "text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
            }`
          }
        >
          <span className="text-lg">{icon}</span>
          {label}
        </NavLink>
      ))}
    </nav>
  )
}
