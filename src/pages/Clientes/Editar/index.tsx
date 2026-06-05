import { Breadcrumb } from "@/components/ui/breadcrumb"
import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useToast } from "@/context/ToastContext"
import { type ClienteFormData } from "@/schemas/cliente.schema"
import { ClienteForm } from "@/components/forms/ClienteForm"
import { Button } from "@/components/ui/button"

export default function EditarClientePage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { toast } = useToast()
  
  const [clienteMock, setClienteMock] = useState<Partial<ClienteFormData> | null>(null)
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const carregarDadosMock = () => {
      setTimeout(() => {
        setClienteMock({
          name: "Mock Cliente para Edição",
          tipo: "RESTAURANTE",
          identificador: "12.345.678/0001-90",
          telefone: "(11) 3456-7890",
          email: "contato@mock.com",
          endereco: "Av. Mockada, 1000",
        })
        setLoading(false)
      }, 500)
    }

    carregarDadosMock()
  }, [id])

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand border-t-transparent" />
      </div>
    )
  }

  if (!clienteMock) {
    return (
      <div className="flex flex-col items-center py-20">
        <h2 className="text-h2 text-(--txt-primary)">Cliente não encontrado.</h2>
        <Button onClick={() => navigate("/clientes")} variant="outlined" className="mt-4">
          Voltar para a lista
        </Button>
      </div>
    )
  }

  const handleEdit = async (data: ClienteFormData) => {
    setIsSubmitting(true)
    try {
      // Finge que está chamando a API (PATCH /cliente/:id)
      await new Promise((resolve) => setTimeout(resolve, 800))

      console.log("Edição que seria salva na API:", data)

      toast({
        title: "Cliente editado!",
        description: `Dados de ${data.name} foram atualizados.`,
        variant: "success",
      })
      navigate("/clientes")
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
          { label: "Gestão de Clientes", to: "/clientes" },
          { label: `Editar: ${clienteMock.name}` },
        ]}
      />
      <div className="flex flex-1 flex-col gap-6 py-8 overflow-y-auto">
        <h1 className="text-h1 text-(--txt-primary)">Editar Cliente</h1>
        <div className="flex justify-center pb-8">
          <div className={`flex flex-col w-full max-w-271 rounded-sm bg-(--bg-surface) p-6 shadow-md border border-(--bg-sidebar) ${isSubmitting ? 'opacity-50 pointer-events-none' : ''}`}>
            <ClienteForm 
              onSubmit={handleEdit} 
              defaultValues={clienteMock} 
              mode="edit" 
            />
          </div>
        </div>
      </div>
    </div>
  )
}