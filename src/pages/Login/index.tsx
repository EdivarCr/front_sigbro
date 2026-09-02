import { supabase } from "@/services"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  loginSchema,
  forgotSchema,
  type LoginFormData,
  type ForgotFormData,
} from "@/schemas/auth.schema"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Input } from "@/components/ui/input"
import { InputPassword } from "@/components/ui/input-password"
import { Button } from "@/components/ui/button"
import heroBanner from "@/assets/images/hero.jpg"
import logo from "@/assets/images/base-alt-logo-v2.svg"
import { ArrowUDownLeftIcon } from "@phosphor-icons/react"
import { useToast } from "@/context/ToastContext"
import { solicitarRecuperacaoSenha } from "@/services/api/auth.service"

type AuthView = "login" | "forgot" | "email-sent"

export default function LoginPage() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [view, setView] = useState<AuthView>("login")

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: "onChange",
  })

  const forgotForm = useForm<ForgotFormData>({
    resolver: zodResolver(forgotSchema),
    mode: "onChange",
  })

  const onLogin = async (data: LoginFormData) => {
    const { error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.senha,
    })

    if (error) {
      loginForm.setError("email", {
        message: "E-mail ou senha inválidos",
      })
      return
    }

    navigate("/")
  }

  const onForgot = async (data: ForgotFormData) => {
    console.log("onForgot disparado! Dados recebidos do formulário:", data)
    try {
      await solicitarRecuperacaoSenha(data)
      console.log("API respondeu com sucesso!")
      setTimeout(() => {
        setView("email-sent")
      }, 0)
    } catch (error: any) {
      toast({
        title: "Erro ao enviar e-mail",
        description: error.response?.data?.detail || "Não foi possível processar sua solicitação. O usuário existe?",
        variant: "danger",
      })
    }
  }

  return (
    <div className="flex min-h-screen">
      {/* Lado esquerdo — 60% — esconde em mobile */}
      <div className="relative hidden md:flex md:w-[60%]">
        <img
          src={heroBanner}
          alt="Banner mostrando uma série de produtos em conserva"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-black/90" />
        <div className="relative z-10 flex w-full items-center justify-center">
          <img src={logo} alt="Logotipo do sistema SIGBRÓ" className="h-24" />
        </div>
      </div>

      {/* Lado direito — 40% */}
      <div className="flex flex-1 flex-col items-center justify-center bg-(--bg-primary) px-12">
        {view === "login" && (
          <form
            onSubmit={loginForm.handleSubmit(onLogin)}
            className="flex w-full flex-col gap-6"
          >
            <h1 className="text-h1 text-(--txt-primary)">
              Bem-vindo de volta!
            </h1>

            <div className="flex flex-col gap-4">
              <Input
                label="E-mail"
                type="email"
                placeholder="janedoe@email.com"
                error={loginForm.formState.errors.email?.message}
                {...loginForm.register("email")}
              />
              <div className="flex flex-col gap-1">
                <InputPassword
                  label="Senha"
                  placeholder="Sua senha"
                  error={loginForm.formState.errors.senha?.message}
                  {...loginForm.register("senha")}
                />
                <button
                  type="button"
                  onClick={() => {
                    loginForm.reset()
                    setView("forgot")
                  }}
                  className="text-table-header cursor-pointer self-end text-(--txt-link) hover:underline"
                >
                  Esqueceu a senha?
                </button>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <Button
                className="w-full"
                size="lg"
                disabled={!loginForm.formState.isValid}
              >
                Entrar
              </Button>

              {/*<div className="flex items-center gap-3">
                <div className="h-[0.5px] flex-1 bg-(--border-default)" />
                  <span className="text-body-sm text-(--txt-secondary)">ou</span>
                <div className="h-[0.5px] flex-1 bg-(--border-default)" />
              </div>

              <Button
                type="button"
                variant="outlined"
                size="lg"
                className="w-full gap-2"
                onClick={async () => {
                  const { error } = await supabase.auth.signInWithOAuth({
                    provider: "google",
                    options: {
                      redirectTo: "http://localhost:5173/"
                    }
                  })
                  if (error) {
                    toast({
                      title: "Erro ao entrar com Google",
                      description: error.message,
                      variant: "danger",
                    })
                  }
                }}
              >
                <img 
                  src="https://www.google.com/favicon.ico" 
                  alt="Google" 
                  className="h-4 w-4" 
                />
                Entrar com Google
              </Button>*/}
            </div>
            
          </form>
        )}

        {view === "forgot" && (
          <form
            onSubmit={forgotForm.handleSubmit(onForgot)}
            className="flex w-full flex-col gap-8"
          >
            <div className="flex flex-col gap-4">
              <Button
                className="w-fit"
                size="md"
                variant="outlined"
                onClick={() => {
                  forgotForm.reset()
                  setView("login")
                }}
              >
                <ArrowUDownLeftIcon />
                Voltar
              </Button>
              <h1 className="text-h1 text-(--txt-primary)">
                Recuperação de Senha
              </h1>
            </div>

            <div className="flex flex-col gap-4">
              <p className="text-body-md text-(--txt-secondary)">
                Insira seu e-mail cadastrado. Um e-mail será enviado para você
                redefinir sua senha.
              </p>
              <Input
                label="E-mail"
                type="email"
                placeholder="janedoe@email.com"
                error={forgotForm.formState.errors.email?.message}
                {...forgotForm.register("email")}
              />
            </div>

            <Button
              className="w-full"
              size="lg"
              onClick={() => console.log("Botão de enviar clicado!")}
              disabled={!forgotForm.formState.isValid || forgotForm.formState.isSubmitting}
            >
              {forgotForm.formState.isSubmitting ? "Enviando..." : "Enviar E-mail"}
            </Button>
          </form>
        )}

        {view === "email-sent" && (
          <div className="flex w-full flex-col gap-8">
            <div className="flex flex-col gap-4">
              <Button
                type="submit"
                className="w-fit"
                size="md"
                variant="outlined"
                onClick={() => {
                  forgotForm.reset()
                  setView("forgot")
                }}
              >
                <ArrowUDownLeftIcon />
                Voltar
              </Button>
              <h1 className="text-h1 text-(--txt-primary)">E-mail enviado</h1>
            </div>
            <p className="text-body-md text-(--txt-secondary)">
              E-mail de recuperação enviado para <span className="font-bold">{forgotForm.getValues("email")}</span>
            </p>
            <Button
              className="w-full"
              size="lg"
              onClick={() => {
                forgotForm.reset()
                setView("login")
              }}
            >
              Voltar para a Tela de Login
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
