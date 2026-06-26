import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useToast } from "@/context/ToastContext"
import { Breadcrumb } from "@/components/ui/breadcrumb"

import { type VendaFormData } from "@/schemas/vendas.schema"
import { VendaForm } from "@/components/forms/VendaForm"
import { criarVenda } from "@/services/api/vendas.service"

import { listarClientes } from "@/services/api/cliente.service"
import { listarProdutos } from "@/services/api/produtos.service"

export default function CadastrarVendaPage() {
  const { toast } = useToast()
  const navigate = useNavigate()
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoadingData, setIsLoadingData] = useState(true)

  const [clientesDisponiveis, setClientesDisponiveis] = useState<{ id: number; name: string }[]>([])
  const [produtosDisponiveis, setProdutosDisponiveis] = useState<{ id: number; nome: string; preco_base: number; unidade: string }[]>([])

  useEffect(() => {
    const carregarDadosDoFormulario = async () => {
      setIsLoadingData(true)
      try {
        const [clientesRes, produtosRes] = await Promise.all([
          listarClientes({ limit: 1000 }),
          listarProdutos({ limit: 1000 })
        ])

        const clientesFormatados = (clientesRes.costumers || []).map((c: any) => ({
          id: c.id,
          name: c.name
        }))

        const produtosFormatados = (produtosRes.products || [])
          .filter((p: any) => p.ativo === true) // Só produtos ativos podem participar de uma venda
          .map((p: any) => ({
            id: p.id,
            nome: p.nome,
            preco_base: Number(p.preco_varejo || 0),
            unidade: p.unidade_medida?.toLowerCase() || "un"
          }))

        setClientesDisponiveis(clientesFormatados)
        setProdutosDisponiveis(produtosFormatados)
      } catch (error) {
        console.error("Erro ao carregar dependências do formulário:", error)
        toast({
          title: "Erro de Conexão",
          description: "Não foi possível carregar a lista de clientes e produtos.",
          variant: "danger",
        })
      } finally {
        setIsLoadingData(false)
      }
    }

    carregarDadosDoFormulario()
  }, [toast])

  const handleCadastro = async (data: VendaFormData) => {
    setIsSubmitting(true)
    try {
      await criarVenda(data)
      
      toast({
        title: "Venda registrada!",
        description: `A venda no valor de R$ ${data.valor_total.toFixed(2).replace('.', ',')} foi adicionada ao histórico.`,
        variant: "success",
      })
      
      navigate("/vendas")
    } catch (error: any) {
      console.error("Erro ao registrar venda:", error)
      toast({
        title: "Erro ao registrar",
        description: error.response?.data?.detail || "Ocorreu um erro ao tentar registrar a venda.",
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
          { label: "Histórico de Vendas", to: "/vendas" },
          { label: "Nova Venda" },
        ]}
      />
      <div className="flex flex-1 flex-col gap-6 py-8 overflow-y-auto">
        <h1 className="text-h1 text-(--txt-primary)">Registrar Nova Venda</h1>
        <div className="flex justify-center pb-8 px-4 md:px-8">
          <div className={`flex flex-col w-full max-w-6xl rounded-sm bg-(--bg-surface) p-6 shadow-md transition-opacity duration-200 ${isSubmitting ? 'opacity-50 pointer-events-none' : ''}`}>
            {isLoadingData ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand border-t-transparent" />
                <span className="text-(--txt-secondary) text-body-sm">Sincronizando estoque e clientes...</span>
              </div>
            ) : (
              <VendaForm 
                onSubmit={handleCadastro} 
                mode="create" 
                clientesDisponiveis={clientesDisponiveis}
                produtosDisponiveis={produtosDisponiveis}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}