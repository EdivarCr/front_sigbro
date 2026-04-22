  import { useState } from "react"
  import { Input } from "@/components/ui/input"
  import { InputPassword } from "@/components/ui/input-password"
  import { Button } from "@/components/ui/button"
  import heroBanner from "@/assets/images/hero.jpg"
  import logo from "@/assets/images/base-logo-v1.png"

  type AuthView = "login" | "register" | "forgot" | "email-sent"

  export default function LoginPage() {
    const [view, setView] = useState<AuthView>("login")
    const [emailError, setEmailError] = useState<string>("");
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
                    setEmailError("E-mail inválido")
                  } else {
                    setEmailError("")
                  }
                }}
                error={emailError}
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
            </div>

            <Button className="w-full" size="lg">
              Entrar
            </Button>

            
          </div>
        )}

      </div>
      </div>
    )
  }
