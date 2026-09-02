import { Breadcrumb } from "@/components/ui/breadcrumb"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useAuth } from "@/context/AuthContext"
import { 
  UserIcon, 
  CalendarBlankIcon, 
  EnvelopeSimpleIcon, 
  KeyIcon, 
} from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
import { Modal } from "@/components/ui/modal"
import { useNavigate } from "react-router-dom"
import { useState } from "react"
import { Input } from "@/components/ui/input"
import { useToast } from "@/context/ToastContext"
import {
  forgotSchema,
  type ForgotFormData,
} from "@/schemas/auth.schema"
import { solicitarRecuperacaoSenha } from "@/services/api/auth.service"

export default function PerfilPage() {
  const navigate = useNavigate()
  const { toast } = useToast()

  const { user } = useAuth()
  
  const dataCriacao = user?.created_at
    ? new Date(user.created_at).toLocaleDateString("pt-BR")
    : "-"
  const nome = user?.user_metadata?.full_name
    ?? user?.user_metadata?.name
    ?? user?.email
    ?? "-"

  const { signOut } = useAuth()
  const [logOutModalOpen, setLogoutModalOpen] = useState(false)

  const [passResetModalOpen, setPassResetModalOpen] = useState(false)
  const forgotForm = useForm<ForgotFormData>({
    resolver: zodResolver(forgotSchema),
    mode: "onChange",
  })

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
          <div className="flex w-full flex-col rounded-sm bg-(--bg-surface) p-6 shadow-md md:w-[80%] lg:w-[60%] gap-4">

            <div className="flex flex-col gap-3">
              <div className="flex flex-row gap-2">
                <div className="flex items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-(--bg-primary) text-brand">
                    <UserIcon size={32} weight="duotone" />
                  </div>
                  <div className="flex flex-col">
                    <h2 className="text-h2 text-(--txt-primary)">{nome}</h2>
                    <div className="flex items-center gap-1.5 text-(--txt-secondary)">
                      <EnvelopeSimpleIcon size={16} />
                    <span className="text-body-sm">{user?.email}</span>
                  </div>
                </div>
              </div>
              </div>
              <div className="flex flex-1 flex-col gap-1 rounded-sm bg-(--bg-primary) p-3">
                <div className="flex items-center gap-2 text-(--txt-secondary)">
                  <CalendarBlankIcon size={16} />
                  <span className="text-table-header">Membro desde:</span>
                </div>
                <span className="text-body-md text-(--txt-primary)">
                  {dataCriacao}
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Button 
                variant="primary"
                size="sm"
                className="flex flex-1"
                onClick={() => setPassResetModalOpen(true)}
              >
                <KeyIcon />
                Alterar Senha
              </Button>
              
              <Button 
                variant="ghost" 
                size="sm"
                className="flex flex-1 hover:text-(--color-red) hover:bg-(--bg-sidebar)"
                onClick={() => setLogoutModalOpen(true)}
              >
                Sair da Conta
              </Button>
            </div>
            
          </div>
        </div>
      </div>

      <Modal
        key={logOutModalOpen ? "logout-open" : "logout-closed"}
        open={logOutModalOpen}
        onClose={() => {
          setLogoutModalOpen(false)
        }}
        title="Sair"
        description="Tem certeza que deseja sair do sistema?"
        footer={
          <>
            <Button
              variant="outlined"
              onClick={() => {
                setLogoutModalOpen(false)
              }}
            >
              Cancelar
            </Button>
            <Button
              variant="secondary"
              onClick={async () => {
                await signOut()
                navigate("/login")
              }}
            >
              Sair
            </Button>
          </>
        }
      ></Modal>

      <Modal
        key={passResetModalOpen ? "passReset-open" : "passReset-closed"}
        open={passResetModalOpen}
        onClose={() => {
          setPassResetModalOpen(false)
        }}
        title="Redefinir Senha"
        description="Insira seu e-mail cadastrado. Um e-mail será enviado para você redefinir sua senha."
        footer={
          <>
            <Button
              variant="outlined"
              onClick={() => {
                forgotForm.reset()
                setPassResetModalOpen(false)
              }}
            >
              Cancelar
            </Button>
            <Button
              variant="primary"
              onClick={forgotForm.handleSubmit(async (data) => {
                try {
                  await solicitarRecuperacaoSenha({ email: data.email})

                  toast({
                    title: "E-mail enviado!",
                    description: `E-mail eviado para ${data.email}`,
                    variant: "success",
                  })
                  
                  forgotForm.reset()
                  setPassResetModalOpen(false)
                } catch (error: any) {
                  toast({
                    title: "Erro ao solicitar",
                    description: error.response?.data?.detail || "Não foi possível enviar o e-mail.",
                    variant: "danger",
                  })
                }
              })}
              disabled={!forgotForm.formState.isValid || forgotForm.formState.isSubmitting}
            >
              {forgotForm.formState.isSubmitting ? "Enviando..." : "Enviar E-mail"}
            </Button>
          </>
        }
      >
        <Input
          label="E-mail"
          placeholder="janedoe@email.com"
          error={forgotForm.formState.errors.email?.message}
          {...forgotForm.register("email")}
          required
        />
      </Modal>
    </div>
  )
}
