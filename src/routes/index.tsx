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

import InsumosPage from "@/pages/Insumos"
import InsumoDetalhesPage from "@/pages/Insumos/detalhes"

import EstoquePage from "@/pages/Estoque"
import CadastrarEstoquePage from "@/pages/Estoque/Cadastrar"
import DetalhesEstoquePage from "@/pages/Estoque/Detalhes"
import EditarEstoquePage from "@/pages/Estoque/Editar"

import ClientesPage from "@/pages/Clientes"
import CadastrarClientePage from "@/pages/Clientes/Cadastrar"
import DetalhesClientePage from "@/pages/Clientes/Detalhes"
import EditarClientePage from "@/pages/Clientes/Editar"

import PDVsPage from "@/pages/PDVs"
import CadastrarPDVPage from "@/pages/PDVs/Cadastrar"
import DetalhesPDVPage from "@/pages/PDVs/Detalhes"
import EditarPDVPage from "@/pages/PDVs/Editar"

import VendasPage from "@/pages/Vendas"
import CadastrarVendaPage from "@/pages/Vendas/cadastrar"
import DetalhesVendaPage from "@/pages/Vendas/detalhes"
import EditarVendaPage from "@/pages/Vendas/editar"

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
          { path: "/insumos", 
            children: [
              { index: true, element: <InsumosPage/> },
              { path: ":id", element: <InsumoDetalhesPage/> }, 
            ]},
          { 
            path: "/estoque",
            children: [
              { index: true, element: <EstoquePage /> },
              { path: "cadastrar", element: <CadastrarEstoquePage /> },
              { path: ":id", element: <DetalhesEstoquePage /> },
              { path: "editar/:id", element: <EditarEstoquePage /> },
            ],
          },
          { 
            path: "/clientes",
            children: [
              { index: true, element: <ClientesPage /> },
              { path: "cadastrar", element: <CadastrarClientePage /> },
              { path: ":id", element: <DetalhesClientePage /> },
              { path: "editar/:id", element: <EditarClientePage /> },
            ],
          },
          { 
            path: "/pdvs",
            children: [
              { index: true, element: <PDVsPage /> },
              { path: "cadastrar", element: <CadastrarPDVPage /> },
              { path: ":id", element: <DetalhesPDVPage /> },
              { path: "editar/:id", element: <EditarPDVPage /> },
            ],
          },
          { 
            path: "/vendas",
            children: [
              { index: true, element: <VendasPage /> },
              { path: "cadastrar", element: <CadastrarVendaPage /> },
              { path: ":id", element: <DetalhesVendaPage /> },
              { path: "editar/:id", element: <EditarVendaPage /> },
            ],
          },
        ],
      },
    ],
  },
])