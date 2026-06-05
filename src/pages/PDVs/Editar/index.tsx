import { Breadcrumb } from "@/components/ui/breadcrumb"
import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useToast } from "@/context/ToastContext"
import { type PDVFormData } from "@/schemas/pdv.schema"
import { PDVForm } from "@/components/forms/PDVForm"
import { Button } from "@/components/ui/button"

export default function EditarPDVPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { toast } = useToast()
  
  const [pdvMock, setPdvMock] = useState<Partial<PDVFormData> | null>(null)
  const [clientesOptions, setClientesOptions] = useState<{label: string, value: string}[]>([])
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    setTimeout(() => {
      // Mock das opções do Select
      setClientesOptions([
        { label: "João da Silva", value: "1" },
        { label: "Burger & Co.", value: "2" },
        { label: "Mercadinho São José", value: "3" },
      ])

      // Mock dos dados do PDV que veio do "Banco"
      setPdvMock({
        id_cliente: 2,
        name: "Burger & Co. (Shopping)",
        tipo_zona: "ZONA_OESTE",
        endereco: "Av. Washington Soares, 85 - Piso L2",
        telefone: "(85) 3232-0000",
        instagram: "@burgerco_shop",
        google_maps_url: "",
        latitude: "",
        longitude: "",
        ativo: true,
      })
      setLoading(false)
    }, 500)
  }, [id])

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand border-t-transparent" />
      </div>
    )
  }

  if (!pdvMock) {
    return (
      <div className="flex flex-col items-center py-20">
        <h2 className="text-h2 text-(--txt-primary)">PDV não encontrado.</h2>
        <Button onClick={() => navigate("/pdvs")} variant="outlined" className="mt-4">
          Voltar para a lista
        </Button>
      </div>
    )
  }

  const handleEdit = async (data: PDVFormData) => {
    setIsSubmitting(true)
    try {
      // Finge que está chamando a API (PATCH)
      await new Promise((resolve) => setTimeout(resolve, 800))
      
      console.log("Edição que seria salva na API de PDV:", data)

      toast({
        title: "PDV editado (Simulação)!",
        description: `Dados de ${data.name} foram atualizados no mock.`,
        variant: "success",
      })
      
      navigate("/pdvs")
    } catch (error) {
      toast({
        title: "Erro ao editar",
        description: "Não foi possível salvar as alterações (simulação).",
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
          { label: `Editar: ${pdvMock.name}` },
        ]}
      />
      <div className="flex flex-1 flex-col gap-6 py-8 overflow-y-auto">
        <h1 className="text-h1 text-(--txt-primary)">Editar PDV</h1>
        <div className="flex justify-center pb-8">
          <div className={`flex flex-col w-full max-w-271 rounded-sm bg-(--bg-surface) p-6 shadow-md border border-(--bg-sidebar) ${isSubmitting ? 'opacity-50 pointer-events-none' : ''}`}>
            <PDVForm 
              onSubmit={handleEdit} 
              defaultValues={pdvMock} 
              mode="edit" 
              clientesOptions={clientesOptions}
            />
          </div>
        </div>
      </div>
    </div>
  )
}