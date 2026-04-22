  import { useState } from "react"
  import { Input } from "@/components/ui/input"
  import { InputPassword } from "@/components/ui/input-password"
  import { Button } from "@/components/ui/button"
  import heroBanner from "@/assets/images/hero.jpg"
  import logo from "@/assets/images/base-logo-v1.png"
  import { ArrowUDownLeftIcon } from "@phosphor-icons/react"
import { Checkbox } from "@/components/ui/checkbox"

  type AuthView = "login" | "register" | "forgot" | "email-sent"

  export default function LoginPage() {
    const [view, setView] = useState<AuthView>("login")
    const [loginEmailError, setLoginEmailError] = useState<string>("")
  const [forgotEmailError, setForgotEmailError] = useState<string>("")
    const isValidEmail = (email: string) => {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
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
          <img
            src={logo}
            alt="Logotipo do sistema SIGBRÓ"
            className="h-18"
          />
        </div>
      </div>

      {/* Lado direito — 40% */}
      <div className="flex flex-1 flex-col items-center justify-center bg-(--bg-primary) px-12">

        {view === "login" && (
          <div className="w-full flex flex-col gap-6">
            <h1 className="text-h1 text-(--txt-primary)">
              Bem-vindo de volta!
            </h1>

            <div className="flex flex-col gap-4">
              <Input
                label="E-mail"
                type="email"
                placeholder="janedoe@email.com"
                onBlur={(event) => {
                  const email = event.target.value
                  if (!isValidEmail(email)) {
                    setLoginEmailError("E-mail inválido")
                  } else {
                    setLoginEmailError("")
                  }
                }}
                error={loginEmailError}
              />
              <div className="flex flex-col gap-1">
                <InputPassword
                  label="Senha"
                  placeholder="Sua senha"
                />
                <button
                  type="button"
                  onClick={() => setView("forgot")}
                  className="self-end text-table-header text-(--txt-link) hover:underline cursor-pointer"
                >
                  Esqueceu a senha?
                </button>
              </div>

              {/*Checkbox rememember-me*/}
              <Checkbox label="Lembrar de Mim" />
            </div>

            <Button className="w-full" size="lg">
              Entrar
            </Button>

            
          </div>
        )}

        {view === "forgot" && (
          <div className="w-full flex flex-col gap-8">
            <div className="flex flex-col gap-4">
              <Button 
              className="w-fit"
              size="md"
              variant="outlined"
              onClick={() => setView("login")}
              >
                <ArrowUDownLeftIcon />
                Voltar
              </Button>
              <h1 className="text-h1 text-(--txt-primary)">
                Recuperação de Senha
              </h1>
            </div>

            <div className="flex flex-col gap-4">
              <p className="text-body-md text-(--txt-secondary)">Insira seu e-mail cadastrado. Um e-mail será enviado para você redefinir sua senha.</p>
              <Input
                label="E-mail"
                type="email"
                placeholder="janedoe@email.com"
                onBlur={(event) => {
                  const email = event.target.value
                  if (!isValidEmail(email)) {
                    setForgotEmailError("E-mail inválido")
                  } else {
                    setForgotEmailError("")
                  }
                }}
                error={forgotEmailError}
              />
            </div>

            <Button 
              className="w-full"
              size="lg"
              onClick={() => setView("email-sent")}
            >
              Enviar E-mail
            </Button>
          </div>
        )}

        {view === "email-sent" && (
          <div className="w-full flex flex-col gap-8">
            <div className="flex flex-col gap-4">
              <Button 
              className="w-fit"
              size="md"
              variant="outlined"
              onClick={() => setView("login")}
              >
                <ArrowUDownLeftIcon />
                Voltar
              </Button>
              <h1 className="text-h1 text-(--txt-primary)">
                E-mail enviado
              </h1>
            </div>

            <p className="text-body-md text-(--txt-secondary)">E-mail de recuperação enviado para janedoe@email.com.</p> {/*TODO: Mudar para variável posteriormente*/}
            <Button 
              className="w-full"
              size="lg"
              onClick={() => setView("login")}
            >
              Voltar para a Tela de Login
            </Button>
          </div>
        )}

      </div>
      </div>
    )
  }
