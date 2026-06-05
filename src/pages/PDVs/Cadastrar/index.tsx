import { Breadcrumb } from "@/components/ui/breadcrumb"
import { useNavigate, useSearchParams } from "react-router-dom"
import { useToast } from "@/context/ToastContext"
import { type PDVFormData } from "@/schemas/pdv.schema"
import { PDVForm } from "@/components/forms/PDVForm"
import { useState, useEffect } from "react"

export default function CadastrarPDVPage() {
  const { toast } = useToast()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const clienteParamId = searchParams.get("clienteId")

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [clientesOptions, setClientesOptions] = useState<{label: string, value: string}[]>([])

  useEffect(() => {
    // MOCK: Buscando clientes do banco para preencher o Select
    setTimeout(() => {
      setClientesOptions([
        { label: "João da Silva", value: "1" },
        { label: "Burger & Co.", value: "2" },
        { label: "Mercadinho São José", value: "3" },
      ])
    }, 300)
  }, [])

  const handleCadastro = async (data: PDVFormData) => {
    setIsSubmitting(true)
    try {
      // SIMULAÇÃO: Espera 800ms fingindo que está salvando na API
      await new Promise((resolve) => setTimeout(resolve, 800))
      
      console.log("Dados que seriam enviados para a API de PDV:", data)

      toast({
        title: "PDV cadastrado (Simulação)!",
        description: `${data.name} foi adicionado no mock com sucesso.`,
        variant: "success",
      })
      
      navigate("/pdvs")
    } catch (error) {
      toast({
        title: "Erro ao cadastrar",
        description: "Houve um problema na simulação.",
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
          { label: "Pontos de Venda", to: "/pdvs" },
          { label: "Cadastrar PDV" },
        ]}
      />
      <div className="flex flex-1 flex-col gap-6 py-8 overflow-y-auto">
        <h1 className="text-h1 text-(--txt-primary)">Cadastrar Novo PDV</h1>
        <div className="flex justify-center pb-8">
          <div className={`flex flex-col w-full max-w-271 rounded-sm bg-(--bg-surface) p-6 shadow-md border border-(--bg-sidebar) ${isSubmitting ? 'opacity-50 pointer-events-none' : ''}`}>
            <PDVForm 
              onSubmit={handleCadastro} 
              mode="create" 
              clientesOptions={clientesOptions}
              // Pré-seleciona o cliente se tiver vindo da tela de detalhes do cliente
              defaultValues={clienteParamId ? { id_cliente: Number(clienteParamId) } : undefined}
            />
          </div>
        </div>
      </div>
    </div>
  )
}