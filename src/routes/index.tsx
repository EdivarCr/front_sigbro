import { createBrowserRouter } from 'react-router-dom'

// Layouts
import { MainLayout } from '@/components/layout/MainLayout'
import { PublicLayout } from '@/components/layout/PublicLayout'
import { ProtectedRoute } from '@/components/shared/ProtectedRoute'

// Páginas públicas
import CatalogoPage from '@/pages/Catalogo'
import LoginPage from '@/pages/Login'

// Páginas protegidas
import DashboardPage from '@/pages/Dashboard'
import ProdutosPage from '@/pages/Produtos'
import VendasPage from '@/pages/Vendas'
import EstoquePage from '@/pages/Estoque'
import PDVsPage from '@/pages/PDVs'

// ==========================================================================
// Configuração centralizada de rotas
// ==========================================================================
export const router = createBrowserRouter([
  // -----------------------------------------------------------------------
  // Rotas Públicas (sem autenticação)
  // -----------------------------------------------------------------------
  {
    element: <PublicLayout />,
    children: [
      {
        path: '/catalogo',
        element: <CatalogoPage />,
      },
      {
        path: '/login',
        element: <LoginPage />,
      },
    ],
  },

  // -----------------------------------------------------------------------
  // Rotas Protegidas (requerem autenticação)
  // -----------------------------------------------------------------------
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <MainLayout />,
        children: [
          {
            path: '/',
            element: <DashboardPage />,
          },
          {
            path: '/dashboard',
            element: <DashboardPage />,
          },
          {
            path: '/produtos',
            element: <ProdutosPage />,
          },
          {
            path: '/vendas',
            element: <VendasPage />,
          },
          {
            path: '/estoque',
            element: <EstoquePage />,
          },
          {
            path: '/pdvs',
            element: <PDVsPage />,
          },
        ],
      },
    ],
  },
])
