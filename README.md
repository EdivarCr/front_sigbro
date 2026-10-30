<div align="center">
  <img src="src/assets/images/base-alt-logo-v2.svg" alt="SIGBRÓ Logo" width="350" />

  <sub><strong>Sistema de Gestão de Estoque e Finanças para Produção de Pimentas Artesanais</strong></sub>

  <p>
    <a href="https://react.dev/"><img src="https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React 19" /></a>
    <a href="https://www.typescriptlang.org/"><img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" /></a>
    <a href="https://tailwindcss.com/"><img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" /></a>
    <a href="https://supabase.com/"><img src="https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white" alt="Supabase" /></a>
  </p>
</div>

---

## ⚡ Visão Geral

O **SIGBRÓ** é uma aplicação web (SPA) desenvolvida para digitalizar e otimizar o fluxo de produção, controle de estoque e gestão financeira de um cliente comercial real no ramo de pimentas artesanais (B-R-Ó-Bró). 

Desenvolvido para substituir o controle descentralizado por planilhas, o sistema oferece um painel administrativo seguro com métricas de lucratividade, gestão de insumos, pontos de venda (PDVs), controle de pagamentos e um catálogo público de produtos.

---

## 🚀 Stack Tecnológica e Arquitetura

O projeto foi construído utilizando as ferramentas mais modernas do ecossistema React, com foco em tipagem estrita, componentização escalável e integrações em nuvem:

| Categoria | Tecnologias Utilizadas |
| :--- | :--- |
| **Framework & Core** | **React 19** (Vite), **TypeScript**, **React Router v7** |
| **UI & Estilização** | **Tailwind CSS v4**, **shadcn/ui**, Componentes Radix UI |
| **Backend & Auth** | **Supabase** (PostgreSQL, Authentication via Row Level Security) |
| **Integrações** | **Axios** (Cliente HTTP configurado com interceptors) |
| **Estado & Validação** | Context API (React), Zod (Schemas e Validação de Formulários) |

---

## 🏗️ Estrutura de Diretórios

A arquitetura do projeto foi desenhada para manter a separação de responsabilidades (Clean Code), isolando lógicas de autenticação, serviços de API e componentes de interface:

```text
front_sigbro/
├── public/                 # Favicons e assets servidos diretamente
├── src/
│   ├── assets/             # Imagens e SVGs (logos, ícones)
│   ├── components/         # Componentes reutilizáveis
│   │   ├── forms/          # Inputs genéricos e controle de formulários
│   │   ├── layout/         # Layouts base (MainLayout, Sidebar, Navbar)
│   │   ├── shared/         # Componentes globais (Rotas Protegidas, Modais)
│   │   └── ui/             # Componentes baseados em shadcn/ui (Botões, Cards, etc.)
│   ├── context/            # Gerenciamento de estado global (AuthContext, etc.)
│   ├── hooks/              # Custom React Hooks
│   ├── lib/                # Funções utilitárias e configurações de bibliotecas
│   ├── pages/              # Módulos do Sistema e Telas (Dashboards e CRUDs)
│   │   ├── Clientes/
│   │   ├── Dashboard/
│   │   ├── DashboardLucratividade/
│   │   ├── Estoque/
│   │   ├── Insumos/
│   │   ├── Login/
│   │   ├── PDVs/
│   │   ├── Pagamentos/
│   │   ├── Perfil/
│   │   ├── Produtos/
│   │   ├── ResetPassword/
│   │   └── Vendas/
│   ├── routes/             # Configuração e mapeamento do React Router
│   ├── schemas/            # Schemas de validação de dados (Zod)
│   ├── services/           # Comunicação externa
│   │   ├── api/            # Instâncias e requisições Axios
│   │   └── supabase/       # Cliente e configurações do Supabase
│   ├── styles/             # Estilos globais (.css) e configurações do Tailwind
│   ├── App.tsx             # Componente raiz (Providers + Router)
│   └── main.tsx            # Ponto de entrada (Entry point)
├── .env.example            # Template de variáveis de ambiente
├── components.json         # Configuração do shadcn/ui
├── package.json            # Dependências e scripts do projeto
├── tsconfig.json           # Configurações estritas do TypeScript
└── vite.config.ts          # Configuração do build e path aliases (@/)
```

---

## 🔒 Arquitetura de Rotas e Autenticação

A aplicação possui um fluxo de navegação aninhada gerenciada pelo `react-router-dom` (v7), estruturada em módulos (Listagem, Cadastro, Detalhes, Edição).

### 🔑 Rotas de Autenticação (Públicas)
Renderizadas através do `AuthLayout`, não exigem sessão ativa.
* `/login` — Tela de login do administrador.
* `/reset-password` — Fluxo de recuperação de senha.

### 🛡️ Rotas Administrativas (Protegidas)
As rotas abaixo estão envoltas no componente `ProtectedRoute` (que valida a sessão com o Supabase via `AuthContext`) e renderizadas dentro do `MainLayout`.

| Módulo | Endpoint Raiz (Listagem) | Sub-rotas (Ações CRUD) |
| :--- | :--- | :--- |
| **Dashboards** | `/` (Geral) | `/lucratividade` (Métricas Financeiras) |
| **Produtos** | `/produtos` | `/cadastrar`, `/:id` (Detalhes), `/editar/:id` |
| **Insumos** | `/insumos` | `/:id` (Detalhes) |
| **Estoque** | `/estoque` | `/cadastrar`, `/:id` (Detalhes), `/editar/:id` |
| **Clientes** | `/clientes` | `/cadastrar`, `/:id` (Detalhes), `/editar/:id` |
| **PDVs** | `/pdvs` | `/cadastrar`, `/:id` (Detalhes), `/editar/:id` |
| **Vendas** | `/vendas` | `/cadastrar`, `/:id` (Detalhes), `/editar/:id` |
| **Utilitários** | `/pagamentos` | `/perfil` |

---

## 📦 Guia de Instalação e Execução

Para rodar o projeto localmente, certifique-se de ter o **Node.js** instalado (v18+ recomendado).

```bash
# 1. Clone este repositório
git clone [https://github.com/fel0psmya/SIGBRO.git](https://github.com/fel0psmya/SIGBRO.git)
cd front_sigbro

# 2. Instale todas as dependências do projeto
npm install

# 3. Configure as variáveis de ambiente
cp .env.example .env
# Abra o arquivo .env e adicione suas chaves:
# VITE_SUPABASE_URL=sua-url
# VITE_SUPABASE_ANON_KEY=sua-chave-anon

# 4. Inicie o servidor de desenvolvimento do Vite
npm run dev
```
O servidor estará acessível em `http://localhost:5173`.
