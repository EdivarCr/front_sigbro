import { Breadcrumb } from "@/components/ui/breadcrumb"
import { Table } from "@/components/ui/table"
import {
  FadersIcon,
  MagnifyingGlassIcon,
  PencilSimpleIcon,
  PlusIcon,
  TrashIcon,
  XIcon,
} from "@phosphor-icons/react"
import { Input } from "@/components/ui/input"
import { InputPassword } from "@/components/ui/input-password"
import { Button } from "@/components/ui/button"
import { Modal } from "@/components/ui/modal"
import { SelectField } from "@/components/ui/select-field"
import { useState } from "react"
import { useToast } from "@/context/ToastContext"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  cadastroUsuarioSchema,
  editarUsuarioSchema,
  removerUsuarioSchema,
  type CadastroUsuarioFormData,
  type EditarUsuarioFormData,
  type RemoverUsuarioFormData,
} from "@/schemas/usuario.schema"

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
  const { toast } = useToast()
  const [search, setSearch] = useState("")

  const [statusFiltro, setStatusFiltro] = useState<string>("")
  const [filterModalOpen, setFilterModalOpen] = useState(false)
  const [statusTemp, setStatusTemp] = useState<string>("")

  const filteredUsuarios = usuarios.filter((u) => {
    const matchSearch =
      u.nome.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFiltro === "" || u.status === statusFiltro
    return matchSearch && matchStatus
  })

  const [registerModalOpen, setRegisterModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [removeModalOpen, setRemoveModalOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<(typeof usuarios)[0] | null>(
    null
  )

  const cadastroForm = useForm<CadastroUsuarioFormData>({
    resolver: zodResolver(cadastroUsuarioSchema),
    mode: "onBlur",
  })

  const editarForm = useForm<EditarUsuarioFormData>({
    resolver: zodResolver(editarUsuarioSchema),
    mode: "onBlur",
  })

  const removerForm = useForm<RemoverUsuarioFormData>({
    resolver: zodResolver(removerUsuarioSchema),
    mode: "onBlur",
  })

  const onCadastro = (data: CadastroUsuarioFormData) => {
    console.log("Cadastro:", data)
    setRegisterModalOpen(false)
    cadastroForm.reset()
    toast({
      title: "Usuário cadastrado!",
      description: "O novo usuário foi criado com sucesso.",
      variant: "success",
    })
  }

  const onEditar = (data: EditarUsuarioFormData) => {
    console.log("Editar:", data)
    setEditModalOpen(false)
    editarForm.reset()
    toast({
      title: "Perfil atualizado!",
      description: "As alterações foram salvas com sucesso.",
      variant: "success",
    })
  }

  const onRemover = (data: RemoverUsuarioFormData) => {
    console.log("Remover:", data)
    setRemoveModalOpen(false)
    removerForm.reset()
    toast({
      title: "Perfil removido!",
      description: "O perfil foi removido do sistema.",
      variant: "danger",
    })
  }

  return (
    <div className="flex h-full flex-col">
      <Breadcrumb
        items={[{ label: "Tela Inicial", to: "/" }, { label: "Usuários" }]}
      />
      <div className="flex flex-1 flex-col gap-6 overflow-hidden py-8">
        <h1 className="text-h1 text-(--txt-primary)">Usuários</h1>
        <div className="flex flex-1 flex-col gap-4 overflow-hidden">
          <div className="flex flex-col gap-3 md:flex-row">
            <div className="flex-1">
              <Input
                type="search"
                placeholder="Nome ou E-mail"
                iconRight={<MagnifyingGlassIcon />}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex shrink-0 flex-col gap-2 md:flex-row">
              <Button
                variant="primary"
                size="lg"
                onClick={() => setFilterModalOpen(true)}
              >
                Filtrar Usuários
                <FadersIcon />
              </Button>
              <Button
                variant="secondary"
                size="lg"
                onClick={() => setRegisterModalOpen(true)}
              >
                Cadastrar Usuário
                <PlusIcon />
              </Button>
            </div>
          </div>
          {statusFiltro && (
            <div className="flex flex-wrap gap-2">
              <div className="text-body-sm flex items-center gap-1 rounded-xs bg-(--bg-sidebar) px-2 py-1 text-(--txt-primary)">
                Status: {statusFiltro}
                <button
                  onClick={() => setStatusFiltro("")}
                  className="ml-1 cursor-pointer text-(--txt-secondary) hover:text-(--color-red)"
                >
                  <XIcon size={12} />
                </button>
              </div>
            </div>
          )}
          <div className="flex-1 overflow-y-auto">
            {/* Visível apenas no Desktop */}
            <div className="hidden md:block">
              <Table
                columns={[
                  { key: "nome", label: "Nome", sortable: true },
                  { key: "email", label: "E-mail", sortable: true },
                  { key: "status", label: "Status" },
                  {
                    key: "acoes",
                    label: "Ações",
                    className: "w-46",
                    render: (row) => (
                      <div className="-ml-2 flex gap-1">
                        {/*<Button variant="ghost" size="sm">
                          <EyeIcon size={16} />
                        </Button>*/}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedUser(row)
                            setEditModalOpen(true)
                          }}
                        >
                          <PencilSimpleIcon size={16} />
                        </Button>
                        {row.status === "Ativo" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="hover:text-(--color-red)"
                            onClick={() => {
                              setSelectedUser(row)
                              setRemoveModalOpen(true)
                            }}
                          >
                            <TrashIcon size={16} />
                          </Button>
                        )}
                      </div>
                    ),
                  },
                ]}
                data={filteredUsuarios}
                pageSize={10}
              />
            </div>

            {/* Visível apenas no Mobile */}
            {/*TODO - Transformar essa visualização em cards em um coomponente com rodapé*/}
            <div className="flex flex-col gap-3 md:hidden">
              {filteredUsuarios.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between rounded-sm border bg-(--bg-surface) p-4 shadow-(--shadow-sm)"
                >
                  <div className="flex flex-col">
                    <span className="text-body-md font-bold text-(--txt-primary)">
                      {user.nome}
                    </span>
                    <span className="text-body-sm text-(--txt-secondary)">
                      {user.email}
                    </span>
                    <span
                      className={`text-label w-fit rounded-full px-2 py-0.5 ${
                        user.status === "Ativo"
                          ? "bg-(--color-green) text-(--txt-on-brand)"
                          : "bg-(--bg-sidebar) text-(--txt-secondary)"
                      }`}
                    >
                      {user.status}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedUser(user)
                        setEditModalOpen(true)
                      }}
                    >
                      <PencilSimpleIcon size={16} />
                    </Button>
                    {user.status === "Ativo" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="hover:text-(--color-red)"
                        onClick={() => {
                          setSelectedUser(user)
                          setRemoveModalOpen(true)
                        }}
                      >
                        <TrashIcon size={16} />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <Modal
        open={filterModalOpen}
        onClose={() => setFilterModalOpen(false)}
        title="Filtrar Usuários"
        footer={
          <>
            <Button
              variant="outlined"
              onClick={() => {
                setStatusFiltro("")
                setStatusTemp("")
                setFilterModalOpen(false)
              }}
            >
              Limpar Filtros
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                setStatusFiltro(statusTemp)
                setFilterModalOpen(false)
              }}
            >
              Aplicar
            </Button>
          </>
        }
      >
        <SelectField
          label="Status"
          placeholder="Todos os status"
          options={[
            { label: "Ativo", value: "Ativo" },
            { label: "Inativo", value: "Inativo" },
          ]}
          value={statusTemp}
          onValueChange={setStatusTemp}
        />
      </Modal>

      {/* Modal de Cadastro */}
      <Modal
        key={registerModalOpen ? "register-open" : "register-closed"}
        open={registerModalOpen}
        onClose={() => {
          setRegisterModalOpen(false)
          cadastroForm.reset()
        }}
        title="Cadastrar Usuário"
        footer={
          <>
            <Button
              variant="outlined"
              onClick={() => {
                setRegisterModalOpen(false)
                cadastroForm.reset()
              }}
            >
              Cancelar
            </Button>
            <Button
              variant="primary"
              disabled={!cadastroForm.formState.isValid}
              onClick={cadastroForm.handleSubmit(onCadastro)}
            >
              Cadastrar Usuário
            </Button>
          </>
        }
      >
        <Input
          label="Nome"
          type="text"
          placeholder="Seu nome"
          required
          error={cadastroForm.formState.errors.nome?.message}
          {...cadastroForm.register("nome")}
        />
        <Input
          label="E-mail"
          type="email"
          placeholder="janedoe@gmail.com"
          required
          error={cadastroForm.formState.errors.email?.message}
          {...cadastroForm.register("email")}
        />
        <InputPassword
          label="Senha"
          placeholder="Sua senha"
          required
          error={cadastroForm.formState.errors.senha?.message}
          {...cadastroForm.register("senha")}
        />
        <InputPassword
          label="Repetir Senha"
          placeholder="Repetir Senha"
          required
          error={cadastroForm.formState.errors.confirmarSenha?.message}
          {...cadastroForm.register("confirmarSenha")}
        />
      </Modal>

      {/* Modal de Edição */}
      <Modal
        key={editModalOpen ? "edit-open" : "edit-closed"}
        open={editModalOpen}
        onClose={() => {
          setEditModalOpen(false)
          editarForm.reset()
        }}
        title="Editar Usuário"
        footer={
          <>
            <Button
              variant="outlined"
              onClick={() => {
                setEditModalOpen(false)
                editarForm.reset()
              }}
            >
              Cancelar
            </Button>
            <Button
              variant="primary"
              disabled={!editarForm.formState.isValid}
              onClick={editarForm.handleSubmit(onEditar)}
            >
              Salvar Alterações
            </Button>
          </>
        }
      >
        <Input
          label="Nome"
          type="text"
          placeholder="Seu nome"
          required
          error={editarForm.formState.errors.nome?.message}
          {...editarForm.register("nome")}
        />
        <Input
          label="E-mail"
          type="email"
          placeholder="janedoe@gmail.com"
          required
          error={editarForm.formState.errors.email?.message}
          {...editarForm.register("email")}
        />
        <InputPassword
          label="Senha atual"
          placeholder="Sua senha atual"
          required
          error={editarForm.formState.errors.senhaAtual?.message}
          {...editarForm.register("senhaAtual")}
        />
        <InputPassword
          label="Nova senha"
          placeholder="Nova senha (opcional)"
          error={editarForm.formState.errors.novaSenha?.message}
          {...editarForm.register("novaSenha")}
        />
        <InputPassword
          label="Repetir nova senha"
          placeholder="Repetir nova senha"
          error={editarForm.formState.errors.confirmarNovaSenha?.message}
          {...editarForm.register("confirmarNovaSenha")}
        />
      </Modal>

      {/* Modal de Remoção */}
      <Modal
        key={removeModalOpen ? "remove-open" : "remove-closed"}
        open={removeModalOpen}
        onClose={() => {
          setRemoveModalOpen(false)
          removerForm.reset()
        }}
        title="Remover Usuário"
        description="Tem certeza que deseja excluir esse usuário? Esta ação não poderá ser desfeita."
        footer={
          <>
            <Button
              variant="outlined"
              onClick={() => {
                setRemoveModalOpen(false)
                removerForm.reset()
              }}
            >
              Cancelar
            </Button>
            <Button
              variant="secondary"
              disabled={!removerForm.formState.isValid}
              onClick={removerForm.handleSubmit(onRemover)}
            >
              Remover Perfil
            </Button>
          </>
        }
      >
        <InputPassword
          label="Senha"
          placeholder="Sua senha"
          required
          error={removerForm.formState.errors.senha?.message}
          {...removerForm.register("senha")}
        />
      </Modal>
    </div>
  )
}
