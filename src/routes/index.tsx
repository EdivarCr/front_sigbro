import { createBrowserRouter } from "react-router-dom"

// Layouts
import { MainLayout } from "@/components/layout/MainLayout"
import { PublicLayout } from "@/components/layout/PublicLayout"
import { ProtectedRoute } from "@/components/shared/ProtectedRoute"
import { AuthLayout } from "@/components/layout/AuthLayout"

// Páginas públicas
import CatalogoPage from "@/pages/Catalogo"
import LoginPage from "@/pages/Login"

// Páginas protegidas
import PerfilPage from "@/pages/Perfil"
import UsuariosPage from "@/pages/Usuarios"
import DashboardPage from "@/pages/Dashboard"
import ProdutosPage from "@/pages/Produtos"
import VendasPage from "@/pages/Vendas"
import EstoquePage from "@/pages/Estoque"
import PDVsPage from "@/pages/PDVs"

export const router = createBrowserRouter([
  // Rotas públicas
  {
    element: <AuthLayout />,
    children: [
      { path: "/login", element: <LoginPage /> },
    ],
  },
  {
    element: <PublicLayout />,
    children: [
      {
        path: "/catalogo",
        element: <CatalogoPage />,
      },
    ],
  },

  // Rotas protegidas
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <MainLayout />,
        children: [
          { path: "/", element: <DashboardPage /> },
          { path: "/perfil", element: <PerfilPage /> },
          { path: "/usuarios", element: <UsuariosPage /> },
          { path: "/produtos", element: <ProdutosPage /> },
          { path: "/vendas", element: <VendasPage /> },
          { path: "/estoque", element: <EstoquePage /> },
          { path: "/pdvs", element: <PDVsPage /> },
        ],
      },
    ],
  },
])
