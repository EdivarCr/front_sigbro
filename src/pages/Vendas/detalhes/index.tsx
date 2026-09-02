import { Breadcrumb } from "@/components/ui/breadcrumb"
import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Table } from "@/components/ui/table"
import { MobileTable } from "@/components/ui/mobile-table"
import { useToast } from "@/context/ToastContext"
import { 
  PencilSimpleIcon, 
  UserIcon, 
  StorefrontIcon,
  CurrencyDollarIcon,
  CalendarBlankIcon,
  ReceiptIcon,
  TagIcon,
  CreditCardIcon,
  MinusCircleIcon,
  BankIcon
} from "@phosphor-icons/react"

import { vendaService, type Venda } from "@/services/api/vendas.service"
import { obterClientePorId, type Cliente } from "@/services/api/cliente.service"
import { listarProdutos, type ProdutoListItem } from "@/services/api/produtos.service"

export default function DetalhesVendaPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { toast } = useToast()

  const [venda, setVenda] = useState<Venda | null>(null)
  const [cliente, setCliente] = useState<Cliente | null>(null)
  const [produtos, setProdutos] = useState<ProdutoListItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const carregarDados = async () => {
      if (!id) return
      try {
        setLoading(true)

        // 1. Busca a Venda e a lista de Produtos em paralelo
        const [vendaDados, produtosDados] = await Promise.all([
          vendaService.obterVendaPorId(Number(id)),
          listarProdutos({ limit: 1000 })
        ])

        setVenda(vendaDados)
        setProdutos(produtosDados.products || [])

        // 2. Se a venda tiver um cliente vinculado, busca os dados dele
        if (vendaDados.cliente_id) {
          const clienteDados = await obterClientePorId(vendaDados.cliente_id)
          setCliente(clienteDados)
        }

      } catch (error) {
        console.error("Erro ao buscar dados da venda:", error)
        toast({
          title: "Erro ao carregar informações",
          description: "Não foi possível carregar os detalhes desta venda.",
          variant: "danger",
        })
        navigate("/vendas")
      } finally {
        setLoading(false)
      }
    }

    carregarDados()
  }, [id, navigate, toast])

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand border-t-transparent" />
      </div>
    )
  }

  if (!venda) {
    return (
      <div className="flex flex-col items-center py-20">
        <h2 className="text-h2 text-(--txt-primary)">Venda não encontrada.</h2>
        <Button onClick={() => navigate("/vendas")} variant="outlined" className="mt-4">
          Voltar para o histórico
        </Button>
      </div>
    )
  }

  // Helpers de formatação
  const formatarMoeda = (valor: number | string) => 
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(valor))

  const formatarData = (dataStr: string) => 
    new Date(dataStr).toLocaleDateString('pt-BR', { timeZone: 'UTC' })

  const renderStatusPagamento = (status: string) => {
    let colorClass = "bg-gray-100 text-gray-600"
    let label = status

    if (status === "PAGO") {
      colorClass = "bg-(--color-green)/15 text-(--color-green)"
      label = "Pago"
    } else if (status === "PENDENTE") {
      colorClass = "bg-(--color-yellow)/15 text-(--color-yellow)"
      label = "Pendente"
    } else if (status === "CANCELADO") {
      colorClass = "bg-(--color-red)/15 text-(--color-red)"
      label = "Cancelado"
    }

    return (
      <span className={`inline-flex items-center justify-center text-body-sm rounded-full px-2.5 py-1 font-medium leading-none ${colorClass}`}>
        {label}
      </span>
    )
  }

  const renderTipoVenda = (tipo: string) => {
    const isAtacado = tipo === "ATACADO"
    return (
      <span className={`inline-flex items-center justify-center text-body-sm rounded-full px-2.5 py-1 font-medium leading-none ${
        isAtacado ? "bg-(--color-blue)/15 text-(--color-blue)" : "bg-(--color-green)/15 text-(--color-green)"
      }`}>
        {isAtacado ? "Atacado" : "Varejo"}
      </span>
    )
  }
  
  const renderContaDestino = (conta: string | null | undefined) => {
    if (!conta) return <span className="text-body-sm font-medium text-(--txt-secondary)">Aguardando Liquidação</span>

    let colorClass = "bg-gray-100 text-gray-600"
    let label = conta

    if (conta === "INTER") {
      colorClass = "bg-[#ff7a00]/15 text-[#cc6200]" // Laranja da marca Inter
      label = "Banco Inter"
    } else if (conta === "MAQUININHA_TON") {
      colorClass = "bg-[#00d84a]/15 text-[#009b35]" // Verde da marca Ton
      label = "Ton (Cartão)"
    } else if (conta === "DINHEIRO") {
      colorClass = "bg-(--color-blue)/15 text-(--color-blue)" // Azul neutro para dinheiro físico
      label = "Caixa (Dinheiro)"
    }

    return (
      <span className={`inline-flex items-center justify-center text-body-sm rounded-full px-2.5 py-1 font-medium leading-none ${colorClass}`}>
        {label}
      </span>
    )
  }

  return (
    <div className="flex h-full flex-col min-h-0">
      <Breadcrumb
        items={[
          { label: "Tela Inicial", to: "/" },
          { label: "Histórico de Vendas", to: "/vendas" },
          { label: `Venda #${venda.id}` },
        ]}
      />
      
      <div className="flex flex-col gap-6 py-8 overflow-y-auto pr-2">
        
        {/* Cabeçalho */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <h1 className="text-h1 text-(--txt-primary)">Detalhes da Venda #{venda.id}</h1>
            {renderStatusPagamento(venda.status_pagamento)}
          </div>
          <Button
            variant="primary"
            onClick={() => navigate(`/vendas/editar/${venda.id}`)}
            disabled={venda.status_pagamento === "CANCELADO"} // Venda cancelada não deve ser editada
          >
            <PencilSimpleIcon size={20} />
            Editar Venda
          </Button>
        </div>

        {/* Cards de Informação */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Card 1: Operação */}
          <div className="flex flex-col gap-4 rounded-sm border border-(--bg-sidebar) bg-(--bg-surface) p-6 shadow-sm">
            <h3 className="text-body-md font-bold uppercase tracking-wider text-(--txt-secondary) pb-2 border-b border-(--border-default)">
              Dados da Operação
            </h3>
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between text-(--txt-primary)">
                <div className="flex items-center gap-2">
                  <CalendarBlankIcon size={20} className="text-(--txt-secondary)" />
                  <span className="text-body-sm font-medium">Data:</span>
                </div>
                <span className="text-body-sm">{formatarData(venda.data_venda)}</span>
              </div>
              <div className="flex items-center justify-between text-(--txt-primary)">
                <div className="flex items-center gap-2">
                  <TagIcon size={20} className="text-(--txt-secondary)" />
                  <span className="text-body-sm font-medium">Modalidade:</span>
                </div>
                {renderTipoVenda(venda.tipo_venda)}
              </div>
              <div className="flex items-center justify-between text-(--txt-primary)">
                <div className="flex items-center gap-2">
                  <CreditCardIcon size={20} className="text-(--txt-secondary)" />
                  <span className="text-body-sm font-medium">Pagamento:</span>
                </div>
                <span className="text-body-sm font-semibold">{venda.forma_pagamento || "Não informado"}</span>
              </div>
              <div className="flex items-center justify-between text-(--txt-primary)">
                <div className="flex items-center gap-2">
                  <BankIcon size={20} className="text-(--txt-secondary)" />
                  <span className="text-body-sm font-medium">Conta Destino:</span>
                </div>
                {renderContaDestino(venda.tipo_conta_destino)}
              </div>
            </div>
          </div>

          {/* Card 2: Cliente */}
          <div className="flex flex-col gap-4 rounded-sm border border-(--bg-sidebar) bg-(--bg-surface) p-6 shadow-sm">
            <h3 className="text-body-md font-bold uppercase tracking-wider text-(--txt-secondary) pb-2 border-b border-(--border-default)">
              Cliente Vinculado
            </h3>
            {cliente ? (
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3 text-(--txt-primary)">
                  <UserIcon size={20} className="text-(--txt-secondary)" />
                  <span className="text-body-md">{cliente.name}</span>
                </div>
                <div className="flex items-center gap-3 text-(--txt-primary)">
                  <StorefrontIcon size={20} className="text-(--txt-secondary)" />
                  <span className="text-body-sm text-(--txt-secondary)">ID: {cliente.identificador}</span>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="mt-2 w-fit -ml-3 text-brand"
                  onClick={() => navigate(`/clientes/${cliente.id}`)}
                >
                  Ver Perfil do Cliente
                </Button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center text-(--txt-secondary) gap-2">
                <UserIcon size={32} className="opacity-50" />
                <span className="text-body-sm">Cliente Balcão (Avulso)</span>
              </div>
            )}
          </div>

          {/* Card 3: Financeiro */}
          <div className="flex flex-col gap-4 rounded-sm border border-(--bg-sidebar) bg-(--bg-surface) p-6 shadow-sm">
            <h3 className="text-body-md font-bold uppercase tracking-wider text-(--txt-secondary) pb-2 border-b border-(--border-default)">
              Resumo Financeiro
            </h3>
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between text-(--txt-primary)">
                <div className="flex items-center gap-2">
                  <ReceiptIcon size={20} className="text-(--txt-secondary)" />
                  <span className="text-body-sm text-(--txt-secondary)">Subtotal:</span>
                </div>
                <span className="text-body-sm">{formatarMoeda(venda.valor_subtotal)}</span>
              </div>
              <div className="flex items-center justify-between text-(--txt-primary)">
                <div className="flex items-center gap-2">
                  <MinusCircleIcon size={20} className="text-(--txt-secondary)" />
                  <span className="text-body-sm text-(--txt-secondary)">Desconto:</span>
                </div>
                <span className="text-body-sm">- {formatarMoeda(venda.valor_desconto)}</span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-(--border-default)">
                <div className="flex items-center gap-2">
                  <CurrencyDollarIcon size={24} className="text-(--txt-secondary)" />
                  <span className="text-body-md text-(--txt-secondary) font-semibold uppercase">Total da Venda:</span>
                </div>
                <span className="text-body-lg font-bold text-brand">
                  {formatarMoeda(venda.valor_total)}
                </span>
              </div>
            </div>
          </div>

        </div>

        {/* Seção de Produtos */}
        <div className="flex flex-col mt-6 gap-4 border-t border-(--border-default) pt-8">
          <div className="flex flex-col">
            <h2 className="text-h2 text-(--txt-primary)">Produtos Comprados</h2>
            <span className="text-body-sm text-(--txt-secondary)">Lista de itens registrados nesta venda.</span>
          </div>

          {/* Tabela Desktop */}
          <div className="hidden md:block">
            <Table
              columns={[
                { 
                  key: "produto_id", 
                  label: "Produto",
                  render: (row) => {
                    const prod = produtos.find(p => p.id === row.produto_id)
                    return <span className="font-medium">{prod ? prod.nome : `Produto ID #${row.produto_id}`}</span>
                  }
                },
                { 
                  key: "quantidade", 
                  label: "Qtd.",
                  render: (row) => `${row.quantidade} un`
                },
                { 
                  key: "preco_unitario", 
                  label: "Preço Unitário",
                  render: (row) => formatarMoeda(row.preco_unitario)
                },
                { 
                  key: "subtotal", 
                  label: "Subtotal",
                  render: (row) => (
                    <span className="font-semibold text-(--txt-primary)">
                      {formatarMoeda(row.subtotal)}
                    </span>
                  )
                },
              ]}
              data={venda.itens || []}
              pageSize={10}
              emptyValue="Nenhum produto registrado."
            />
          </div>

          {/* Tabela Mobile */}
          <div className="block md:hidden">
            <MobileTable 
              columns={[
                { 
                  key: "produto_id", 
                  label: "Produto",
                  render: (row) => {
                    const prod = produtos.find(p => p.id === row.produto_id)
                    return prod ? prod.nome : `ID #${row.produto_id}`
                  }
                },
                { 
                  key: "subtotal", 
                  label: "Total Item",
                  render: (row) => formatarMoeda(row.subtotal)
                },
              ]}
              renderBottomAction={(row) => (
                <div className="flex w-full justify-between text-body-sm text-(--txt-secondary) px-2">
                  <span>{row.quantidade}x</span>
                  <span>{formatarMoeda(row.preco_unitario)} cada</span>
                </div>
              )}
              data={venda.itens || []}
              emptyValue="Nenhum produto registrado."
            />
          </div>
        </div>

      </div>
    </div>
  )
}