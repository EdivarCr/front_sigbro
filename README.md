# 🌶️ SisBro v2.0 — Sistema Pimenta Dr. Broa (Front-end)

**SPA para gestão de produção e vendas de pimentas artesanais.**

---

## 🚀 Stack Tecnológica

| Tecnologia | Uso |
|---|---|
| **React 19** (Vite) | Framework de UI |
| **TypeScript** | Tipagem estática |
| **Tailwind CSS v4** | Estilização utility-first |
| **shadcn/ui** | Componentes reutilizáveis |
| **Supabase** | Autenticação e banco de dados |
| **React Router v7** | Navegação SPA |
| **Axios** | Cliente HTTP |

---

## 📦 Guia de Início

```bash
# 1. Clone o repositório
git clone <url-do-repo>
cd front_sigbro

# 2. Instale as dependências
npm install

# 3. Configure variáveis de ambiente
cp .env.example .env
# Preencha VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY e VITE_API_URL

# 4. Inicie o servidor de desenvolvimento
npm run dev
```

O servidor estará disponível em `http://localhost:5173`.

---

## 🗂️ Organização do Projeto

```
front_sigbro/
├── public/                     # Arquivos estáticos servidos diretamente
├── src/
│   ├── assets/                 # Imagens, ícones e recursos estáticos
│   ├── components/
│   │   ├── forms/              # Componentes de formulário reutilizáveis
│   │   ├── layout/             # Layouts (MainLayout, PublicLayout, Sidebar)
│   │   ├── shared/             # Componentes compartilhados (ProtectedRoute, etc.)
│   │   └── ui/                 # Componentes shadcn/ui (Button, Dialog, etc.)
│   ├── context/                # Contextos React globais
│   │   ├── AuthContext.tsx     #   └─ Autenticação via Supabase
│   │   └── CartContext.tsx     #   └─ Carrinho de compras
│   ├── hooks/                  # Hooks customizados reutilizáveis
│   │   └── useSupabaseQuery.ts #   └─ Consultas genéricas ao Supabase
│   ├── pages/                  # Páginas/módulos do sistema
│   │   ├── Catalogo/           #   └─ Catálogo público de produtos
│   │   ├── Dashboard/          #   └─ Painel principal (protegido)
│   │   ├── Estoque/            #   └─ Controle de estoque
│   │   ├── Login/              #   └─ Tela de autenticação
│   │   ├── PDVs/               #   └─ Pontos de venda
│   │   ├── Produtos/           #   └─ Gestão de produtos
│   │   └── Vendas/             #   └─ Registro de vendas
│   ├── routes/                 # Configuração centralizada do React Router
│   │   └── index.tsx           #   └─ Definição de rotas públicas/protegidas
│   ├── services/               # Clientes de API e serviços externos
│   │   ├── api/client.ts       #   └─ Axios com interceptors de auth
│   │   └── supabase/client.ts  #   └─ Cliente Supabase singleton
│   ├── App.tsx                 # Componente raiz (Providers + Router)
│   ├── main.tsx                # Ponto de entrada React
│   └── index.css               # Estilos globais + Tailwind
├── .env.example                # Template de variáveis de ambiente
├── index.html                  # HTML entry point
├── vite.config.ts              # Config Vite (aliases, plugins)
├── tsconfig.json               # Config TypeScript (paths, JSX)
└── package.json                # Dependências e scripts
```

---

## 🏗️ Arquitetura de Rotas

| Rota | Tipo | Página |
|---|---|---|
| `/catalogo` | Pública | Catálogo de pimentas |
| `/login` | Pública | Tela de login |
| `/` | Protegida | Dashboard |
| `/dashboard` | Protegida | Dashboard |
| `/produtos` | Protegida | Gestão de produtos |
| `/vendas` | Protegida | Registro de vendas |
| `/estoque` | Protegida | Controle de estoque |
| `/pdvs` | Protegida | Pontos de venda |

### Fluxo de Autenticação

1. Usuário acessa rota protegida → `ProtectedRoute` verifica sessão
2. Sem sessão → redireciona para `/login`
3. Com sessão → renderiza `MainLayout` com `Sidebar` + conteúdo
4. Rotas públicas usam `PublicLayout` com header simplificado

---

## 🔧 Aliases de Path

O alias `@/` aponta para `./src/`, possibilitando imports limpos:

```tsx
// Em vez de:
import { useAuth } from '../../../context/AuthContext'

// Use:
import { useAuth } from '@/context/AuthContext'
```

---

## 📝 Próximos Passos

- [ ] Instalar e configurar **shadcn/ui** (`npx shadcn-ui@latest init`)
- [ ] Implementar autenticação real no `LoginPage`
- [ ] Conectar dados do Supabase nas páginas
- [ ] Criar componentes de formulário para CRUD de produtos
- [ ] Implementar catálogo público consumindo dados reais
- [ ] Adicionar testes (Vitest + Testing Library)

---

> **SisBro v2.0** — Feito com 🌶️ por Dr. Broa
