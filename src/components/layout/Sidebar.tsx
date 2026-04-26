import { NavLink, useLocation } from "react-router-dom"
import { useBreakpoint } from "@/hooks/useBreakpoint"
import { useSidebar } from "@/context/SidebarContext"
import { useEffect } from "react"
import { useTheme } from "@/context/ThemeContext"
import  {
  UserIcon,
  ChartPieSliceIcon,
  ChartLineUpIcon,
  PackageIcon,
  StackIcon,
  BasketIcon,
  UsersIcon,
  StorefrontIcon,
  ReceiptIcon,
  CreditCardIcon,
  SignOutIcon,
  CaretDoubleLeftIcon,
} from "@phosphor-icons/react"
import logo from "@/assets/images/base-logo-v1.png"
import logoDark from "@/assets/images/base-alt-logo-v1.png"

const navItems = [
  { to: "/dashboard", label: "Tela Inicial", icon: ChartPieSliceIcon },
  { to: "/lucros", label: "Painel de Lucros", icon: ChartLineUpIcon },
  { to: "/produtos", label: "Gestão de Produtos", icon: PackageIcon },
  { to: "/estoque", label: "Controle de Estoque", icon: StackIcon },
  { to: "/insumos", label: "Insumos", icon: BasketIcon },
  { to: "/clientes", label: "Clientes", icon: UsersIcon },
  { to: "/pdvs", label: "Pontos de Venda", icon: StorefrontIcon },
  { to: "/vendas", label: "Histórico de Vendas", icon: ReceiptIcon },
  { to: "/pagamentos", label: "Pagamentos", icon: CreditCardIcon },
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

  useEffect(() => {
    if (shouldCollapseSidebar) close()
  }, [location.pathname, shouldCollapseSidebar, close])

  if (!shouldCollapseSidebar) {
    if (!isOpen) return null
    return (
      <aside className="flex w-64 shrink-0 drop-shadow-sm flex-col bg-(--bg-sidebar)">
        <SidebarContent />
      </aside>
    )
  }

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
          onClick={close}
          aria-hidden="true"
        />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-(--bg-sidebar) shadow-2xl transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      > 
        <SidebarContent onClose={close} showClose/>
      </aside>
    </>
  )
}

function SidebarContent({ onClose, showClose }: { onClose?: () => void, showClose?: boolean }) {
  const { isDark } = useTheme()

  return (
    <div className="flex flex-1 flex-col gap-8 overflow-y-auto px-6 pt-6">
      <div className="flex items-center justify-between">
        {/* Logo */}
        <img 
          src={isDark ? logo : logoDark} 
          alt="SisBró" 
          className="w-40 h-auto" 
        />

        {showClose && (
          <button 
            onClick={onClose}
            className="rounded-sm p-2 text-(--txt-secondary) hover:bg-(--bg-sidebar-hover) cursor-pointer">
            <CaretDoubleLeftIcon size={24} />
          </button>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-6">
        {/* Perfil */}
        <NavLink
          to="/perfil"
          className={({ isActive }) =>
            `flex items-center gap-3 rounded-r-sm px-3 py-2 transition-colors ${
              isActive
                ? "border-l-2 border-(--border-active) text-brand"
                : "border-transparent text-(--txt-secondary) hover:bg-(--bg-sidebar-hover) hover:text-(--txt-primary)"
            }`
          }
        >
          <UserIcon size={24} />
          <div className="flex flex-col">
            <span className="text-body-md text-(--txt-primary)">User Profile</span>
            <span className="text-label text-(--txt-secondary)">johndoe@email.com</span>
          </div>
        </NavLink>

        {/* Itens de navegação */}
        <nav className="flex flex-col gap-1">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-r-sm px-3 py-2 transition-colors border-l-2 ${
                  isActive
                    ? "border-l-2 border-(--border-active) text-brand"
                    : "border-transparent text-(--txt-secondary) hover:bg-(--bg-sidebar-hover) hover:text-(--txt-primary)"
                }`
              }
            >
              <Icon size={24} />
              <span className="text-body-md">{label}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Sair */}
      <div className="border-t border-(--border-default) py-4">
        <button className="flex w-full items-center gap-3 rounded-sm px-3 py-2 text-(--txt-secondary) transition-colors hover:bg-(--bg-sidebar-hover) hover:text-(--color-red) cursor-pointer">
          <SignOutIcon size={24} />
          <span className="text-body-md">Sair</span>
        </button>
      </div>
    </div>
  )
}
