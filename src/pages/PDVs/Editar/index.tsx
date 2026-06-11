import { Breadcrumb } from "@/components/ui/breadcrumb"
import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useToast } from "@/context/ToastContext"
import { type PDVFormData } from "@/schemas/pdv.schema"
import { PDVForm } from "@/components/forms/PDVForm"
import { Button } from "@/components/ui/button"

import { obterPDVPorId, atualizarPDV } from "@/services/api/pdv.service"
import { listarClientes } from "@/services/api/cliente.service"

export default function EditarPDVPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { toast } = useToast()
  
  const [pdvData, setPdvData] = useState<Partial<PDVFormData> | null>(null)
  const [clientesOptions, setClientesOptions] = useState<{label: string, value: string}[]>([])
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const carregarDadosEdicao = async () => {
      if (!id) return

      try {
        setLoading(true)
        const [pontoDeVenda, responseClientes] = await Promise.all([
          obterPDVPorId(Number(id)),
          listarClientes()
        ])

        const options = (responseClientes.costumers || []).map((cliente) => ({
          label: cliente.name,
          value: String(cliente.id)
        }))
        setClientesOptions(options)

        setPdvData({
          id_cliente: pontoDeVenda.id_cliente,
          name: pontoDeVenda.name,
          tipo_zona: pontoDeVenda.tipo_zona,
          endereco: pontoDeVenda.endereco,
          telefone: pontoDeVenda.telefone || "",
          instagram: pontoDeVenda.instagram || "",
          google_maps_url: pontoDeVenda.google_maps_url || "",
          latitude: pontoDeVenda.latitude || "",
          longitude: pontoDeVenda.longitude || "",
          ativo: pontoDeVenda.ativo,
        })

      } catch (error) {
        console.error("Erro ao carregar dados para edição:", error)
        toast({
          title: "Erro ao carregar",
          description: "Não foi possível recuperar as informações do ponto de venda.",
          variant: "danger",
        })
        navigate("/pdvs")
      } finally {
        setLoading(false)
      }
    }

    carregarDadosEdicao()
  }, [id, navigate, toast])

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand border-t-transparent" />
      </div>
    )
  }

  if (!pdvData) {
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
    if (!id) return
    setIsSubmitting(true)
    try {
      const payload = {
        ...data,
        id_cliente: Number(data.id_cliente)
      }

      await atualizarPDV(Number(id), payload)

      toast({
        title: "PDV atualizado!",
        description: `As alterações do ponto de venda "${data.name}" foram salvas.`,
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
          { label: `Editar: ${pdvData.name}` },
        ]}
      />
      <div className="flex flex-1 flex-col gap-6 py-8 overflow-y-auto">
        <h1 className="text-h1 text-(--txt-primary)">Editar PDV</h1>
        <div className="flex justify-center pb-8">
          <div className={`flex flex-col w-full max-w-271 rounded-sm bg-(--bg-surface) p-6 shadow-md border border-(--bg-sidebar) ${isSubmitting ? 'opacity-50 pointer-events-none' : ''}`}>
            <PDVForm 
              onSubmit={handleEdit} 
              defaultValues={pdvData} 
              mode="edit" 
              clientesOptions={clientesOptions}
            />
          </div>
        </div>
      </div>
    </div>
  )
}