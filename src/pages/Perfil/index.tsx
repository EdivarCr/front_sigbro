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
  TrashIcon
} from "@phosphor-icons/react"
import { useState } from "react"

export default function PerfilPage() {
  const [registerModalOpen, setRegisterModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [removeModalOpen, setRemoveModalOpen] = useState(false)

  return (
    <div className="flex flex-col">
      <Breadcrumb
        items={[
          { label: "Tela Inicial", to: "/" },
          { label: "Perfil de Usuário" },
        ]}
      />

      <div className="flex flex-col py-8 gap-6">
        <h1 className="text-h1 text-(--txt-primary)">Perfil de Usuário</h1>
        <div className="flex flex-col justify-center items-center">
          <div className="flex flex-col w-[80%] bg-(--bg-surface) rounded-sm p-6 shadow-2xs"> {/*Criar tokens de sombra*/}
            <div className="flex flex-col gap-4">
              <div className="flex flex-row gap-2">
                <div className="flex flex-col flex-1 gap-1">
                  <h2 className="text-h2 text-(--txt-primary)">Jane Doe</h2>
                  <h4 className="text-h4 text-(--txt-secondary)">jane.doe@email.com</h4>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="hover:bg-(--bg-sidebar)">
                      <DotsThreeOutlineVerticalIcon size={24} weight="fill"/>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => setEditModalOpen(true)}>
                      <PencilSimpleIcon />
                      Editar Perfil
                    </DropdownMenuItem>
                    <DropdownMenuItem className="hover:text-(--color-red)" onClick={() => setRemoveModalOpen(true)}>
                      <TrashIcon />
                      Remover Perfil
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="flex flex-row gap-2">
                <div className="flex flex-col gap-1 flex-1 bg-(--bg-primary) rounded-sm p-3">
                  <span className="text-table-header text-(--txt-secondary)">Perfil de Acesso:</span>
                  <span className="text-body-md text-(--txt-primary)">Administrador</span>
                </div>
                <div className="flex flex-col gap-1 flex-1 bg-(--bg-primary) rounded-sm p-3">
                  <span className="text-table-header text-(--txt-secondary)">Data de Criação:</span>
                  <span className="text-body-md text-(--txt-primary)">09/04/2026</span>
                </div>
              </div>

              <div className="flex flex-row gap-2 pt-3">
                <Button variant="primary" size="sm" className="gap-2 flex-1">
                  Listagem de Usuários
                  <ListBulletsIcon />
                </Button>
                <Button variant="secondary" size="sm" className="gap-2 flex-1" onClick={() => setRegisterModalOpen(true)}>
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
        open={registerModalOpen}
        onClose={() => setRegisterModalOpen(false)}
        title="Cadastrar Usuário"
        footer={
          <>
            <Button variant="outlined" onClick={() => setRegisterModalOpen(false)}>
              Cancelar
            </Button>
            <Button variant="primary">
              Cadastrar Usuário
            </Button>
          </>
        }
      >
        {/* Inputs de cadastro */}
      </Modal>

      {/* Modal de Edição */}
      <Modal
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title="Editar Perfil"
        footer={
          <>
            <Button variant="outlined" onClick={() => setEditModalOpen(false)}>
              Cancelar
            </Button>
            <Button variant="primary">
              Salvar Alterações
            </Button>
          </>
        }
      >
        {/* Inputs de edição */}
      </Modal>

      {/* Modal de Remoção */}
      <Modal
        open={removeModalOpen}
        onClose={() => setRemoveModalOpen(false)}
        title="Remover Perfil"
        description="Tem certeza que deseja excluir seu perfil? Esta ação não poderá ser desfeita."
        footer={
          <>
            <Button variant="outlined" onClick={() => setRemoveModalOpen(false)}>
              Cancelar
            </Button>
            <Button variant="secondary">
              Remover Perfil
            </Button>
          </>
        }
      />

    </div>
  )
}