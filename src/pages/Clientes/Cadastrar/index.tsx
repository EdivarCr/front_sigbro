import { Breadcrumb } from "@/components/ui/breadcrumb"
import { useNavigate } from "react-router-dom"
import { useToast } from "@/context/ToastContext"
import { type ClienteFormData } from "@/schemas/cliente.schema"
import { ClienteForm } from "@/components/forms/ClienteForm"
import { useState } from "react"

import { criarCliente } from "@/services/api/cliente.service"

export default function CadastrarClientePage() {
  const { toast } = useToast()
  const navigate = useNavigate()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleCadastro = async (data: ClienteFormData) => {
    setIsSubmitting(true)
    try {
      await criarCliente(data)
      
      console.log("Dados que seriam enviados para API:", data)

      toast({
        title: "Cliente cadastrado!",
        description: `${data.name} foi adicionado com sucesso.`,
        variant: "success",
      })
      
      navigate("/clientes")
    } catch (error: any) {
      console.error("Erro ao cadastrar cliente:", error)
      toast({
        title: "Erro ao cadastrar",
        description: error.response?.data?.detail || "Ocorreu um erro ao tentar cadastrar o cliente.",
        variant: "danger",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex h-full flex-col">
      <Breadcrumb
        items={[
          { label: "Tela Inicial", to: "/" },
          { label: "Gestão de Clientes", to: "/clientes" },
          { label: "Cadastrar Cliente" },
        ]}
      />
      <div className="flex flex-1 flex-col gap-6 py-8 overflow-y-auto">
        <h1 className="text-h1 text-(--txt-primary)">Cadastrar Cliente</h1>
        <div className="flex justify-center pb-8">
          <div className={`flex flex-col w-full max-w-271 rounded-sm bg-(--bg-surface) p-6 shadow-md border border-(--bg-sidebar) ${isSubmitting ? 'opacity-50 pointer-events-none' : ''}`}>
            <ClienteForm onSubmit={handleCadastro} mode="create" />
          </div>
        </div>
      </div>
    </div>
  )
}