import { Breadcrumb } from "@/components/ui/breadcrumb"
import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useToast } from "@/context/ToastContext"
import { Button } from "@/components/ui/button"

import { VendaForm } from "@/components/forms/VendaForm"
import { vendaService } from "@/services/api/vendas.service"
import { listarClientes } from "@/services/api/cliente.service"
import { listarProdutos } from "@/services/api/produtos.service"

export default function EditarVendaPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { toast } = useToast()
  
  const [vendaData, setVendaData] = useState<any | null>(null)
  const [clientesDisponiveis, setClientesDisponiveis] = useState<any[]>([])
  const [produtosDisponiveis, setProdutosDisponiveis] = useState<any[]>([])
  
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const carregarDados = async () => {
      if (!id) return

      try {
        const [vendaRes, clientesRes, produtosRes] = await Promise.all([
          vendaService.obterVendaPorId(Number(id)),
          listarClientes({ limit: 1000 }),
          listarProdutos({ limit: 1000 })
        ])

        const clientesFormatados = (clientesRes.costumers || []).map((c: any) => ({
          id: c.id,
          name: c.name
        }))

        const produtosFormatados = (produtosRes.products || []).map((p: any) => ({
          id: p.id,
          nome: p.nome,
          preco_base: Number(p.preco_varejo || 0),
          unidade: p.unidade_medida?.toLowerCase() || "un"
        }))

        setClientesDisponiveis(clientesFormatados)
        setProdutosDisponiveis(produtosFormatados)

        setVendaData({
          cliente_id: vendaRes.cliente_id || null,
          tipo_venda: vendaRes.tipo_venda,
          status_pagamento: vendaRes.status_pagamento,
          forma_pagamento: vendaRes.forma_pagamento || null,
          data_venda: vendaRes.data_venda,
          valor_desconto: Number(vendaRes.valor_desconto || 0),
          itens: (vendaRes.itens || []).map(item => ({
            produto_id: item.produto_id,
            quantidade: item.quantidade,
            preco_unitario: Number(item.preco_unitario),
            subtotal: Number(item.subtotal),
            unidade_medida: "un"
          }))
        })

      } catch (error) {
        console.error("Erro ao buscar dados da venda:", error)
        toast({
          title: "Erro ao carregar",
          description: "Não foi possível encontrar os dados desta venda.",
          variant: "danger",
        })
      } finally {
        setLoading(false)
      }
    }

    carregarDados()
  }, [id, toast])

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand border-t-transparent" />
      </div>
    )
  }

  if (!vendaData) {
    return (
      <div className="flex flex-col items-center py-20">
        <h2 className="text-h2 text-(--txt-primary)">Venda não encontrada.</h2>
        <Button onClick={() => navigate("/vendas")} variant="outlined" className="mt-4">
          Voltar para a lista
        </Button>
      </div>
    )
  }

  const handleEdit = async (data: any) => {
    if (!id) return
    setIsSubmitting(true)
    
    try {
      const payload = {
        forma_pagamento: data.forma_pagamento,
        status_pagamento: data.status_pagamento,
        valor_desconto: data.valor_desconto,
        tipo_venda: data.tipo_venda,
        cliente_id: data.cliente_id,
      }

      await vendaService.atualizarVenda(Number(id), payload)

      toast({
        title: "Venda atualizada!",
        description: `As informações da venda #${id} foram salvas.`,
        variant: "success",
      })
      navigate("/vendas")
    } catch (error: any) {
      console.error("Erro ao editar venda:", error)
      toast({
        title: "Erro ao editar",
        description: "Ocorreu um erro ao tentar salvar as alterações.",
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
          { label: `Editar Venda #${id}` },
        ]}
      />
      <div className="flex flex-1 flex-col gap-6 py-8 overflow-y-auto">
        <h1 className="text-h1 text-(--txt-primary)">Editar Venda</h1>
        <div className="flex justify-center pb-8">
          <div className={`flex flex-col w-full max-w-6xl rounded-sm bg-(--bg-surface) p-6 shadow-md border border-(--bg-sidebar) ${isSubmitting ? 'opacity-50 pointer-events-none' : ''}`}>
            
            <VendaForm 
              onSubmit={handleEdit} 
              defaultValues={vendaData} 
              mode="edit" 
              clientesDisponiveis={clientesDisponiveis}
              produtosDisponiveis={produtosDisponiveis}
            />

          </div>
        </div>
      </div>
    </div>
  )
}