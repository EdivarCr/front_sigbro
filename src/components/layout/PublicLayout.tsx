import { useState } from 'react'
import { Outlet, Link } from 'react-router-dom'
import { useBreakpoint } from '@/hooks/useBreakpoint'

/**
 * Layout para rotas públicas (Catálogo, Login, etc.).
 *
 * Responsividade:
 * - Mobile: menu hamburger com dropdown
 * - Desktop: nav horizontal inline
 */
export function PublicLayout() {
  const { isMobile } = useBreakpoint()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <header className="border-b border-gray-200 dark:border-gray-800">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
          {/* Logo */}
          <Link to="/catalogo" className="flex items-center gap-2">
            <span className="text-2xl">🌶️</span>
            <span className="text-base font-bold text-gray-900 sm:text-lg dark:text-white">
              Pimenta Dr. Broa
            </span>
          </Link>

          {/* Nav Desktop */}
          {!isMobile && (
            <nav className="flex items-center gap-4">
              <Link
                to="/catalogo"
                className="text-sm font-medium text-gray-600 transition-colors hover:text-red-600 dark:text-gray-400"
              >
                Catálogo
              </Link>
              <Link
                to="/login"
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-700"
              >
                Entrar
              </Link>
            </nav>
          )}

          {/* Hamburger Mobile */}
          {isMobile && (
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
              aria-label="Menu"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                {menuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          )}
        </div>

        {/* Menu Mobile dropdown */}
        {isMobile && menuOpen && (
          <nav className="border-t border-gray-200 px-4 py-3 dark:border-gray-800">
            <div className="flex flex-col gap-1">
              <Link
                to="/catalogo"
                onClick={() => setMenuOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
              >
                Catálogo
              </Link>
              <Link
                to="/login"
                onClick={() => setMenuOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950"
              >
                Entrar
              </Link>
            </div>
          </nav>
        )}
      </header>

      {/* Conteúdo — padding responsivo */}
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
        <Outlet />
      </main>
    </div>
  )
}
