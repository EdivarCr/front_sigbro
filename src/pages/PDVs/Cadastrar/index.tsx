import { Breadcrumb } from "@/components/ui/breadcrumb"
import { useNavigate, useSearchParams } from "react-router-dom"
import { useToast } from "@/context/ToastContext"
import { type PDVFormData } from "@/schemas/pdv.schema"
import { PDVForm } from "@/components/forms/PDVForm"
import { useState, useEffect } from "react"

import { criarPDV } from "@/services/api/pdv.service"
import { listarClientes } from "@/services/api/cliente.service"

export default function CadastrarPDVPage() {
  const { toast } = useToast()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const clienteParamId = searchParams.get("clienteId")

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [clientesOptions, setClientesOptions] = useState<{label: string, value: string}[]>([])

  useEffect(() => {
    const fetchClientes = async () => {
      try {
        const response = await listarClientes()
        
        const options = (response.costumers || []).map((cliente) => ({
          label: cliente.name,
          value: String(cliente.id) 
        }))
        
        setClientesOptions(options)
      } catch (error) {
        console.error("Erro ao carregar clientes para o select:", error)
        toast({
          title: "Aviso",
          description: "Não foi possível carregar a lista de clientes para vinculação.",
          variant: "danger",
        })
      }
    }

    fetchClientes()
  }, [toast])

  const handleCadastro = async (data: PDVFormData) => {
    setIsSubmitting(true)
    try {
      const payload = {
        ...data,
        id_cliente: Number(data.id_cliente)
      }
      
      await criarPDV(payload as PDVFormData)
      
      toast({
        title: "PDV cadastrado com sucesso!",
        description: `O ponto de venda "${data.name}" foi adicionado ao sistema.`,
        variant: "success",
      })
      
      navigate("/pdvs")
    } catch (error: any) {
      console.error("Erro ao cadastrar PDV:", error)
      toast({
        title: "Erro ao cadastrar",
        description: error.response?.data?.detail || "Ocorreu um erro ao tentar cadastrar o PDV.",
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
              defaultValues={clienteParamId ? { id_cliente: Number(clienteParamId) } : undefined}
            />
          </div>
        </div>
      </div>
    </div>
  )
}