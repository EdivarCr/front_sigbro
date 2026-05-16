import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useNavigate } from "react-router-dom"
import { KeyIcon } from "@phosphor-icons/react"

import heroBanner from "@/assets/images/hero.jpg"
import { Button } from "@/components/ui/button"
import { InputPassword } from "@/components/ui/input-password"
import { useToast } from "@/context/ToastContext"
import { resetPasswordSchema, type ResetPasswordFormData } from "@/schemas/auth.schema"
import { redefinirSenha } from "@/services/api/auth.service"
import { supabase } from "@/services"


export default function ResetPasswordPage() {
  const navigate = useNavigate()
  const { toast } = useToast()

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting, isValid },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    mode: "onBlur",
  })

  useEffect(() => {
    const hash = window.location.hash // Pega o que vem depois do #
    if (hash) {
      const params = new URLSearchParams(hash.replace("#", "?"))
      const accessToken = params.get("access_token")
      const refreshToken = params.get("refresh_token")

      if (accessToken && refreshToken) {
        setValue("access_token", accessToken)
        setValue("refresh_token", refreshToken)
      } else {
        // Se entrou na página sem os tokens, manda pro login
        toast({
          title: "Link inválido",
          description: "O link de redefinição expirou ou é inválido.",
          variant: "danger",
        })
        navigate("/login")
      }
    }
  }, [setValue, navigate, toast])

  const onSubmit = async (data: ResetPasswordFormData) => {
    try {
      await redefinirSenha(data)
      
      toast({
        title: "Sucesso!",
        description: "Sua senha foi atualizada. Faça login com a nova senha.",
        variant: "success",
      })

      await supabase.auth.signOut()
      navigate("/login")
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar",
        description: error.response?.data?.detail || "Ocorreu um erro inesperado.",
        variant: "danger",
      })
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center p-4">
      <div className="absolute inset-0 z-0">
        <img
          src={heroBanner}
          alt="Banner mostrando uma série de produtos em conserva"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-black/90" />
      </div>
      
      <main className="flex flex-col flex-1 w-full max-w-[90%] lg:max-w-[40%] z-10 rounded-sm bg-(--bg-primary) p-8 shadow-lg border border-(--bg-primary) ">
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full text-brand">
            <KeyIcon size={28} weight="duotone" />
          </div>
          <h1 className="text-h2 text-(--txt-primary)">Nova Senha</h1>
          <p className="text-body-sm text-(--txt-secondary)">
            Crie uma senha forte para garantir a segurança da sua conta no SIGBRÓ.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-8 flex flex-col gap-4">
          <InputPassword 
            label="Nova Senha"
            placeholder="No mínimo 8 caracteres"
            error={errors.new_password?.message}
            {...register("new_password")}
          />
          <InputPassword 
            label="Confirmar Nova Senha"
            placeholder="Digite a mesma senha"
            error={errors.confirm_password?.message}
            {...register("confirm_password")}
          />
          <Button
            type="submit"
            variant="primary"
            disabled={!isValid || isSubmitting}
          >
            {isSubmitting ? "Atualizando..." : "Redefinir Senha"}
          </Button>
        </form>
      </main>
    </div>
  )
}