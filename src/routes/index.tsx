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
import ResetPasswordPage from "@/pages/ResetPassword"
import DashboardPage from "@/pages/Dashboard"

import ProdutosPage from "@/pages/Produtos"
import CadastrarProdutoPage from "@/pages/Produtos/cadastrar"
import EditarProdutoPage from "@/pages/Produtos/editar"
import VisualizarProdutoPage from "@/pages/Produtos/detalhes"

import VendasPage from "@/pages/Vendas"
import PDVsPage from "@/pages/PDVs"

// Módulo de Estoque (Estrutura Simplificada)
import EstoquePage from "@/pages/Estoque"
import CadastrarEstoquePage from "@/pages/Estoque/Cadastrar"
import DetalhesEstoquePage from "@/pages/Estoque/Detalhes"
import EditarEstoquePage from "@/pages/Estoque/Editar"

export const router = createBrowserRouter([
  // Rotas públicas
  {
    element: <AuthLayout />,
    children: [
      { path: "/login", element: <LoginPage /> },
      { path: "/reset-password", element: <ResetPasswordPage /> },
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

  // ROTA TEMPORÁRIA (Acesso livre para testes)
  {
    element: <MainLayout />,
    children: [
      {
        path: "/estoque",
        children: [
          { index: true, element: <EstoquePage /> },
          { path: "cadastrar", element: <CadastrarEstoquePage /> },
          { path: ":id", element: <DetalhesEstoquePage /> },
          { path: "editar/:id", element: <EditarEstoquePage /> },
        ],
      },
    ],
  },

  // Rotas protegidas (Originais)
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <MainLayout />,
        children: [
          { path: "/", element: <DashboardPage /> },
          { path: "/perfil", element: <PerfilPage /> },
          
          {
            path: "/produtos",
            children: [
              { index: true, element: <ProdutosPage /> },
              { path: "cadastrar", element: <CadastrarProdutoPage /> },
              { path: ":id", element: <VisualizarProdutoPage /> },
              { path: "editar/:id", element: <EditarProdutoPage /> },
            ],
          },
          
          { path: "/vendas", element: <VendasPage /> },
          { path: "/pdvs", element: <PDVsPage /> },
        ],
      },
    ],
  },
])