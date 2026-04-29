import { Breadcrumb } from "@/components/ui/breadcrumb"
import { Table } from "@/components/ui/table"
import {
  EyeIcon,
  FadersIcon,
  MagnifyingGlassIcon,
  PencilSimpleIcon,
  PlusIcon,
  TrashIcon,
} from "@phosphor-icons/react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useState } from "react"

const usuarios = [
  { id: 1, nome: "Jane Doe", email: "jane.doe@email.com", status: "Ativo" },
  { id: 2, nome: "Glauco Silva", email: "glauco@email.com", status: "Ativo" },
  { id: 3, nome: "Maria Santos", email: "maria@email.com", status: "Inativo" },
  { id: 4, nome: "Pedro Alves", email: "pedro@email.com", status: "Ativo" },
  { id: 5, nome: "Ana Lima", email: "ana@email.com", status: "Ativo" },
  {
    id: 6,
    nome: "Carlos Mendes",
    email: "carlos@email.com",
    status: "Inativo",
  },
  { id: 7, nome: "Lucia Ferreira", email: "lucia@email.com", status: "Ativo" },
  { id: 8, nome: "Roberto Costa", email: "roberto@email.com", status: "Ativo" },
  {
    id: 9,
    nome: "Fernanda Rocha",
    email: "fernanda@email.com",
    status: "Inativo",
  },
  {
    id: 10,
    nome: "Marcos Oliveira",
    email: "marcos@email.com",
    status: "Ativo",
  },
  {
    id: 11,
    nome: "Juliana Barros",
    email: "juliana@email.com",
    status: "Ativo",
  },
  {
    id: 12,
    nome: "Thiago Nunes",
    email: "thiago@email.com",
    status: "Inativo",
  },
]

export default function UsuariosPage() {
  const [search, setSearch] = useState("")

  const filteredUsuarios = usuarios.filter(
    (u) =>
      u.nome.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="flex h-full flex-col">
      <Breadcrumb
        items={[{ label: "Tela Inicial", to: "/" }, { label: "Usuários" }]}
      />
      <div className="flex flex-1 flex-col gap-6 overflow-hidden py-8">
        <h1 className="text-h1 text-(--txt-primary)">Usuários</h1>
        <div className="flex flex-1 flex-col gap-4 overflow-hidden">
          <div className="flex flex-row gap-3">
            <div className="flex-1">
              <Input
                type="search"
                placeholder="Nome ou E-mail"
                iconRight={<MagnifyingGlassIcon />}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex shrink-0 flex-row gap-2">
              <Button variant="primary" size="lg">
                Filtrar Usuários
                <FadersIcon />
              </Button>
              <Button variant="secondary" size="lg">
                Cadastrar Usuário
                <PlusIcon />
              </Button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            <Table
              columns={[
                { key: "nome", label: "Nome", sortable: true },
                { key: "email", label: "E-mail", sortable: true },
                { key: "status", label: "Status" },
                {
                  key: "acoes",
                  label: "Ações",
                  className: "w-46",
                  render: (
                    _row // Tirar sublinhado quando os botões tiverem ações
                  ) => (
                    <div className="-ml-2 flex gap-1">
                      <Button variant="ghost" size="sm">
                        <EyeIcon size={16} />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <PencilSimpleIcon size={16} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="hover:text-(--color-red)"
                      >
                        <TrashIcon size={16} />
                      </Button>
                    </div>
                  ),
                },
              ]}
              data={filteredUsuarios}
              pageSize={10}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
