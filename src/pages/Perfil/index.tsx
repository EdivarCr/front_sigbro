import { Breadcrumb } from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import { Modal } from "@/components/ui/modal"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu"
import {
  PlusIcon,
  ListBulletsIcon,
  DotsThreeOutlineVerticalIcon,
  PencilSimpleIcon,
  TrashIcon,
} from "@phosphor-icons/react"
import { useState } from "react"
import { useToast } from "@/context/ToastContext"
import { InputPassword } from "@/components/ui/input-password"
import { Input } from "@/components/ui/input"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useNavigate } from "react-router-dom"
import {
  cadastroUsuarioSchema,
  editarUsuarioSchema,
  removerUsuarioSchema,
  type CadastroUsuarioFormData,
  type EditarUsuarioFormData,
  type RemoverUsuarioFormData,
} from "@/schemas/usuario.schema"
import { useAuth } from "@/context/AuthContext"

export default function PerfilPage() {
  const { user } = useAuth()
  const dataCriacao = user?.created_at
    ? new Date(user.created_at).toLocaleDateString("pt-BR")
    : "-"
  const nome = user?.user_metadata?.full_name
    ?? user?.user_metadata?.name
    ?? user?.email
    ?? "-"

  const { toast } = useToast()
  const navigate = useNavigate()

  const [registerModalOpen, setRegisterModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [removeModalOpen, setRemoveModalOpen] = useState(false)

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
    navigate("/login") // Rota TEMPORÁRIA de desenvolvimento
    removerForm.reset()
    toast({
      title: "Perfil removido!",
      description: "O perfil foi removido do sistema.",
      variant: "danger",
    })
  }

  return (
    <div className="flex flex-col">
      <Breadcrumb
        items={[
          { label: "Tela Inicial", to: "/" },
          { label: "Perfil de Usuário" },
        ]}
      />
      <div className="flex flex-col gap-6 py-8">
        <h1 className="text-h1 text-(--txt-primary)">Perfil de Usuário</h1>
        <div className="flex flex-col items-center justify-center">
          <div className="flex w-full flex-col rounded-sm bg-(--bg-surface) p-6 shadow-md md:w-[80%]">
            <div className="flex flex-col gap-4">
              <div className="flex flex-row gap-2">
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <h2 className="text-h2 text-(--txt-primary)">{nome}</h2>
                  <h4 className="text-h4 text-(--txt-secondary)">
                    {user?.email}
                  </h4>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="hover:bg-(--bg-sidebar)"
                    >
                      <DotsThreeOutlineVerticalIcon size={24} weight="fill" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => setEditModalOpen(true)}>
                      <PencilSimpleIcon />
                      Editar Perfil
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="hover:text-(--color-red)"
                      onClick={() => setRemoveModalOpen(true)}
                    >
                      <TrashIcon />
                      Remover Perfil
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <div className="flex flex-1 flex-col gap-1 rounded-sm bg-(--bg-primary) p-3">
                  <span className="text-table-header text-(--txt-secondary)">
                    Perfil de Acesso:
                  </span>
                  <span className="text-body-md text-(--txt-primary)">
                    Administrador {/*TODO: Verficar questão do nível de acesso*/}
                  </span>
                </div>
                <div className="flex flex-1 flex-col gap-1 rounded-sm bg-(--bg-primary) p-3">
                  <span className="text-table-header text-(--txt-secondary)">
                    Data de Criação:
                  </span>
                  <span className="text-body-md text-(--txt-primary)">
                    {dataCriacao}
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-2 pt-3 sm:flex-row">
                <Button
                  variant="primary"
                  size="sm"
                  className="flex-1 gap-2"
                  onClick={() => navigate("/usuarios")}
                >
                  Listagem de Usuários
                  <ListBulletsIcon />
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  className="flex-1 gap-2"
                  onClick={() => setRegisterModalOpen(true)}
                >
                  Cadastrar Novo Usuário
                  <PlusIcon />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

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
        title="Editar Perfil"
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
        title="Remover Perfil"
        description="Tem certeza que deseja excluir seu perfil? Esta ação não poderá ser desfeita."
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
