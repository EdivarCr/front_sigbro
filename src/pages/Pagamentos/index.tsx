import { useState, useMemo, useEffect } from "react"
import { useFilter } from "@/context/FilterContext"
import { useToast } from "@/context/ToastContext"
import { Breadcrumb } from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import { Table } from "@/components/ui/table"
import { Modal } from "@/components/ui/modal"
import { SelectField } from "@/components/ui/select-field"
import { Input } from "@/components/ui/input"
import { 
  CheckCircleIcon,
  ClockIcon,
  BankIcon,
  CurrencyDollarIcon,
  CreditCardIcon,
  DownloadSimpleIcon,
  CalendarBlankIcon,
  ArrowCounterClockwiseIcon
} from "@phosphor-icons/react"

import { exportarPagamentosParaPDF } from "@/lib/relatorioPagamentos"
import { vendaService, type Venda, type FilterVenda } from "@/services/api/vendas.service"
import { listarClientes, type Cliente } from "@/services/api/cliente.service"
import { getHojeLocal } from "@/lib/utils"

export default function PagamentosPage() {
  const { toast } = useToast()
  const [viewMode, setViewMode] = useState<"pendentes" | "historico">("pendentes")
  
  const {
    dataInicio,
    dataFim,
    periodoTexto,
    setDataInicio,
    setDataFim,
    setPeriodoTexto,
    limparFiltrosGlobal
  } = useFilter()
  
  const hoje = useMemo(() => getHojeLocal(), [])

  const [vendas, setVendas] = useState<Venda[]>([])
  const [loading, setLoading] = useState(false)

  const [clientes, setClientes] = useState<Cliente[]>([])
  useEffect(() => {
    const carregarClientes = async () => {
      try {
        const response = await listarClientes({ limit: 1000 })
        setClientes(response.costumers || [])
      } catch (error) {
        toast({
          title: "Erro",
          description: "Não foi possível carregar os clientes.",
          variant: "danger"
        })
      }
    }
    carregarClientes()
  }, [])

  const obterNomeCliente = (clienteId: number | null) => {
    if (!clienteId) return "Avulso"
    const cliente = clientes.find(c => c.id === clienteId)
    return cliente ? cliente.name : `Cliente #${clienteId}`
  }

  const formatarDataBR = (dataStr: string) => {
    if (!dataStr) return ""
    const [ano, mes, dia] = dataStr.split("-")
    return `${dia}/${mes}/${ano}`
  }

  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false)

  // Filtros Ativos (Exclusivos desta página)
  const [filtroStatus, setFiltroStatus] = useState<string>("TODOS")
  const [filtroConta, setFiltroConta] = useState<string>("TODOS")

  // Filtros Temporários do Modal
  const [dataInicioTemp, setDataInicioTemp] = useState<string>(dataInicio)
  const [dataFimTemp, setDataFimTemp] = useState<string>(dataFim)
  const [filtroStatusTemp, setFiltroStatusTemp] = useState<string>(filtroStatus)
  const [filtroContaTemp, setFiltroContaTemp] = useState<string>(filtroConta)

  const isFiltroAtivo = useMemo(() => {
    return dataInicio !== "" || dataFim !== "" || filtroStatus !== "TODOS" || filtroConta !== "TODOS"
  }, [dataInicio, dataFim, filtroStatus, filtroConta])

  const labelBotaoFiltro = useMemo(() => {
    const statusLabel = filtroStatus !== "TODOS" ? ` (${filtroStatus})` : ""
    return `${periodoTexto}${statusLabel}`
  }, [periodoTexto, filtroStatus])

  // Estados para o Modal de Baixa
  const [isModalBaixaOpen, setIsModalBaixaOpen] = useState(false)
  const [vendaSelecionada, setVendaSelecionada] = useState<Venda | null>(null)
  const [contaDestino, setContaDestino] = useState<string>("")
  const [erroConta, setErroConta] = useState<string>("")

  // Função que busca os dados na API
  const carregarVendas = async () => {
    setLoading(true)
    try {
      let payloadFiltros: FilterVenda = {}
      
      if (viewMode === "pendentes") {
        payloadFiltros = { status_pagamento: "PENDENTE" }
      } else {
        payloadFiltros = {
          data_inicio: dataInicio || null,
          data_fim: dataFim || null,
          status_pagamento: filtroStatus !== "TODOS" ? (filtroStatus as any) : null,
          tipo_conta_destino: filtroConta !== "TODOS" ? (filtroConta as any) : null
        }
      }

      const response = await vendaService.listarVendas(payloadFiltros)
      setVendas(response.itens || [])
    } catch (error) {
      console.error("Erro ao carregar pagamentos:", error)
      toast({
        title: "Erro",
        description: "Não foi possível carregar os pagamentos.",
        variant: "danger"
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    carregarVendas()
  }, [viewMode, dataInicio, dataFim, filtroStatus, filtroConta])

  const vendasPendentes = useMemo(() => vendas.filter(v => v.status_pagamento === "PENDENTE"), [vendas])
  const vendasHistorico = useMemo(() => vendas, [vendas])

  const totais = useMemo(() => {
    return vendasHistorico.reduce((acc, curr) => {
      if (curr.status_pagamento === "PAGO") {
        const valorNum = Number(curr.valor_total) || 0;

        acc.totalRecebido += valorNum
        if (curr.tipo_conta_destino === "INTER") acc.inter += valorNum
        if (curr.tipo_conta_destino === "MAQUININHA_TON") acc.ton += valorNum
        if (curr.tipo_conta_destino === "DINHEIRO") acc.dinheiro += valorNum
      }
      return acc
    }, { totalRecebido: 0, inter: 0, ton: 0, dinheiro: 0 })
  }, [vendasHistorico])

  const formatarMoeda = (valor: number | string) => 
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(valor))

  const formatarData = (dataStr: string) => 
    new Date(dataStr).toLocaleDateString('pt-BR', { timeZone: 'UTC' })

  const abrirModalBaixa = (venda: Venda) => {
    setVendaSelecionada(venda)
    setContaDestino("")
    setErroConta("")
    setIsModalBaixaOpen(true)
  }

  const confirmarBaixa = async () => {
    if (!contaDestino) {
      setErroConta("Você deve selecionar uma conta de destino.")
      return
    }
    if (!vendaSelecionada) return

    try {
      const dataLiquidacao = getHojeLocal()
      
      await vendaService.atualizarVenda(vendaSelecionada.id, {
        status_pagamento: "PAGO",
        tipo_conta_destino: contaDestino as any,
        data_pagamento: dataLiquidacao
      })

      toast({
        title: "Sucesso!",
        description: "Recebimento confirmado e baixado com sucesso.",
        variant: "success"
      })
      
      setIsModalBaixaOpen(false)
      setVendaSelecionada(null)
      carregarVendas()
      
    } catch (error) {
      console.error("Erro ao baixar pagamento:", error)
      toast({
        title: "Erro na Baixa",
        description: "Houve um problema ao confirmar o recebimento.",
        variant: "danger"
      })
    }
  }

  const aplicarFiltroPeriodo = () => {
    setDataInicio(dataInicioTemp)
    setDataFim(dataFimTemp)
    
    setFiltroStatus(filtroStatusTemp)
    if (filtroStatusTemp === "PENDENTE") {
      setFiltroConta("TODOS")
    } else {
      setFiltroConta(filtroContaTemp)
    }
    
    if (dataInicioTemp && dataFimTemp) {
      setPeriodoTexto(`${formatarDataBR(dataInicioTemp)} - ${formatarDataBR(dataFimTemp)}`)
    } else if (dataInicioTemp) {
      setPeriodoTexto(`A partir de ${formatarDataBR(dataInicioTemp)}`)
    } else if (dataFimTemp) {
      setPeriodoTexto(`Até ${formatarDataBR(dataFimTemp)}`)
    } else {
      setPeriodoTexto(`Período Completo`)
    }
    
    setIsFilterModalOpen(false)
  }

  const limparFiltroPeriodo = () => {
    limparFiltrosGlobal() 
    setFiltroStatus("TODOS")
    setFiltroConta("TODOS")
    
    setDataInicioTemp("")
    setDataFimTemp("")
    setFiltroStatusTemp("TODOS")
    setFiltroContaTemp("TODOS")
    
    setIsFilterModalOpen(false)
  }

  const columnsBase = [
    { key: "id", label: "Cód.", render: (row: Venda) => <span className="text-(--txt-secondary)">#{row.id}</span> },
    { key: "cliente_id", label: "Cliente", render: (row: Venda) => <span>{obterNomeCliente(row.cliente_id)}</span> },
    { key: "data_venda", label: "Data da Venda", render: (row: Venda) => formatarData(row.data_venda) },
    { key: "valor_total", label: "Valor", render: (row: Venda) => <span>{formatarMoeda(row.valor_total)}</span> },
  ]

  return (
    <div className="flex h-full min-h-0 flex-col bg-(--bg-primary) font-sans">
      <Breadcrumb
        items={[
          { label: "Tela Inicial", to: "/" },
          { label: "Gestão de Pagamentos" }
        ]}
      />
      
      <div className="flex flex-1 min-h-0 flex-col gap-(--spacing-md) overflow-hidden py-(--spacing-md)">
        <div className="flex items-center justify-between shrink-0">
          <h1 className="text-h1 font-heading font-bold text-(--txt-primary)">Pagamentos e Recebimentos</h1>
        </div>
        
        <div className="flex flex-1 flex-col gap-(--spacing-lg) overflow-hidden">
          
          {/* Toggle Tabs */}
          <div className="flex shrink-0">
            <div className="flex bg-(--bg-sidebar) p-1 rounded-full border border-(--border-default)/50">
              <button
                onClick={() => setViewMode("pendentes")}
                className={`px-4 py-1.5 text-body-sm font-semibold rounded-full transition-colors cursor-pointer flex items-center gap-2 ${
                  viewMode === "pendentes" ? "bg-brand text-white shadow-sm" : "text-(--txt-secondary) hover:text-(--txt-primary)"
                }`}
              >
                <ClockIcon size={16} weight={viewMode === "pendentes" ? "bold" : "regular"} />
                Baixas Pendentes
                {vendasPendentes.length > 0 && (
                  <span className={`ml-1 px-1.5 py-0.5 rounded-full text-[10px] ${viewMode === "pendentes" ? "bg-white text-brand" : "bg-brand text-white"}`}>
                    {vendasPendentes.length}
                  </span>
                )}
              </button>
              <button
                onClick={() => setViewMode("historico")}
                className={`px-4 py-1.5 text-body-sm font-semibold rounded-full transition-colors cursor-pointer flex items-center gap-2 ${
                  viewMode === "historico" ? "bg-brand text-white shadow-sm" : "text-(--txt-secondary) hover:text-(--txt-primary)"
                }`}
              >
                <BankIcon size={16} weight={viewMode === "historico" ? "bold" : "regular"} />
                Consultar Histórico
              </button>
            </div>
          </div>

          <div className="flex-1 flex flex-col gap-(--spacing-lg) overflow-y-auto pr-2 pb-4">
            
            {/* ABA 1: BAIXAS PENDENTES */}
            {viewMode === "pendentes" && (
              <div className="flex flex-col gap-(--spacing-md)">
                <div className="rounded-(--radius-sm) border border-(--border-default)/15 bg-(--bg-surface) shadow-(--shadow-md) overflow-hidden">
                  <div className="p-(--spacing-md) border-b border-(--border-default)/30 bg-(--bg-sidebar)">
                    <h3 className="text-body-md font-bold text-(--txt-primary)">Aguardando Recebimento</h3>
                    <p className="text-body-sm text-(--txt-secondary)">Selecione as vendas abaixo para confirmar a entrada do dinheiro no caixa.</p>
                  </div>
                  
                  <Table
                    columns={[
                      ...columnsBase,
                      { 
                        key: "acoes", 
                        label: "Ação", 
                        render: (row: Venda) => (
                          <Button 
                            variant="primary" 
                            size="sm" 
                            onClick={() => abrirModalBaixa(row)}
                            className="bg-(--color-green) text-white hover:bg-(--color-green)/90 border-none"
                          >
                            <CheckCircleIcon size={16} /> Confirmar Recebimento
                          </Button>
                        ) 
                      }
                    ]}
                    data={vendasPendentes}
                    pageSize={10}
                    emptyValue={loading ? "Carregando..." : "Nenhum pagamento pendente no momento. Tudo em dia!"}
                  />
                </div>
              </div>
            )}

            {/* ABA 2: CONSULTAR HISTÓRICO */}
            {viewMode === "historico" && (
              <div className="flex flex-col gap-(--spacing-lg)">
                
                <div className="flex flex-wrap items-center justify-between gap-(--spacing-md) bg-(--bg-surface) p-4 rounded-(--radius-sm) border border-(--border-default)/15 shadow-sm">
                  <div className="flex flex-wrap items-center gap-2">
                    <Button 
                      variant="primary" 
                      size="md"
                      onClick={() => {
                        setDataInicioTemp(dataInicio)
                        setDataFimTemp(dataFim)
                        setFiltroStatusTemp(filtroStatus)
                        setFiltroContaTemp(filtroConta)
                        setIsFilterModalOpen(true)
                      }}
                    >
                      <CalendarBlankIcon />
                      {labelBotaoFiltro}
                    </Button>

                    {isFiltroAtivo && (
                      <Button variant="outlined" size="md" onClick={limparFiltroPeriodo}>
                        <ArrowCounterClockwiseIcon />
                        <span>Limpar Filtros</span>
                      </Button>
                    )}
                  </div>
                  
                 <Button 
                    variant="outlined" 
                    size="md"
                    onClick={() => {
                      const vendasMapeadasParaPDF = vendasHistorico.map(venda => ({
                        id: venda.id,
                        cliente: obterNomeCliente(venda.cliente_id), 
                        valor: Number(venda.valor_total) || 0, 
                        data_venda: venda.data_venda,
                        data_baixa: venda.data_pagamento || null,
                        status: venda.status_pagamento,
                        conta_destino: venda.tipo_conta_destino === "MAQUININHA_TON" ? "TON" : venda.tipo_conta_destino
                      }))

                      exportarPagamentosParaPDF({
                        dataInicio,
                        dataFim,
                        filtroStatus,
                        filtroConta: filtroConta === "MAQUININHA_TON" ? "TON" : filtroConta,
                        totalLiquidado: formatarMoeda(totais.totalRecebido),
                        totalInter: formatarMoeda(totais.inter),
                        totalTon: formatarMoeda(totais.ton),
                        totalDinheiro: formatarMoeda(totais.dinheiro),
                        vendasFiltradas: vendasMapeadasParaPDF as any 
                      })
                    }}
                  >
                    <DownloadSimpleIcon size={18} /> Exportar
                  </Button>
                </div>

                {/* Cards de Totalização */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-(--spacing-lg)">
                  <div className="flex flex-col p-4 rounded-(--radius-sm) border border-(--border-default)/15 bg-(--bg-surface) shadow-sm border-l-4 border-l-(--txt-primary)">
                    <span className="text-body-sm font-medium text-(--txt-secondary)">Total Liquidado (Filtro)</span>
                    <h2 className="text-h2 font-heading font-bold text-(--txt-primary) mt-1">{formatarMoeda(totais.totalRecebido)}</h2>
                  </div>
                  <div className="flex flex-col p-4 rounded-(--radius-sm) border border-(--border-default)/15 bg-(--bg-surface) shadow-sm border-l-4 border-l-[#FF7A00]">
                    <span className="text-body-sm font-medium text-(--txt-secondary) flex items-center gap-1"><BankIcon size={16}/> Banco Inter</span>
                    <h2 className="text-h2 font-heading font-bold text-(--txt-primary) mt-1">{formatarMoeda(totais.inter)}</h2>
                  </div>
                  <div className="flex flex-col p-4 rounded-(--radius-sm) border border-(--border-default)/15 bg-(--bg-surface) shadow-sm border-l-4 border-l-[#00B85C]">
                    <span className="text-body-sm font-medium text-(--txt-secondary) flex items-center gap-1"><CreditCardIcon size={16}/> Maquininha Ton</span>
                    <h2 className="text-h2 font-heading font-bold text-(--txt-primary) mt-1">{formatarMoeda(totais.ton)}</h2>
                  </div>
                  <div className="flex flex-col p-4 rounded-(--radius-sm) border border-(--border-default)/15 bg-(--bg-surface) shadow-sm border-l-4 border-l-brand">
                    <span className="text-body-sm font-medium text-(--txt-secondary) flex items-center gap-1"><CurrencyDollarIcon size={16}/> Caixa (Dinheiro)</span>
                    <h2 className="text-h2 font-heading font-bold text-(--txt-primary) mt-1">{formatarMoeda(totais.dinheiro)}</h2>
                  </div>
                </div>

                {/* Tabela do Histórico */}
                <div className="rounded-(--radius-sm) border border-(--border-default)/15 bg-(--bg-surface) shadow-(--shadow-md) overflow-hidden">
                  <Table
                    columns={[
                      ...columnsBase,
                      { 
                        key: "status_pagamento", 
                        label: "Status", 
                        render: (row: Venda) => (
                          <span className={`inline-flex items-center justify-center text-body-sm rounded-full px-2.5 py-0.5 font-medium leading-none ${
                            row.status_pagamento === "PAGO" ? "bg-(--color-green)/15 text-(--color-green)" : "bg-(--color-blue)/15 text-(--color-blue)"
                          }`}>
                            {row.status_pagamento === "PAGO" ? "Liquidado" : "Pendente"}
                          </span>
                        ) 
                      },
                      { 
                        key: "data_pagamento", 
                        label: "Data Liquidação", 
                        render: (row: Venda) => row.data_pagamento ? formatarData(row.data_pagamento) : "-" 
                      },
                      { 
                        key: "tipo_conta_destino", 
                        label: "Conta Destino", 
                        render: (row: Venda) => (
                          <span className="text-(--txt-secondary) font-medium">
                            {row.tipo_conta_destino === "INTER" && "Banco Inter"}
                            {row.tipo_conta_destino === "MAQUININHA_TON" && "Ton"}
                            {row.tipo_conta_destino === "DINHEIRO" && "Dinheiro"}
                            {!row.tipo_conta_destino && "-"}
                          </span>
                        ) 
                      },
                    ]}
                    data={vendasHistorico}
                    pageSize={10}
                    emptyValue={loading ? "Carregando histórico..." : "Nenhum pagamento encontrado para este critério."}
                  />
                </div>
              </div>
            )}

          </div>
        </div>
      </div>

      {/* Modal de Conciliação Financeira (Baixa) */}
      <Modal
        open={isModalBaixaOpen}
        onClose={() => setIsModalBaixaOpen(false)}
        title="Confirmar Recebimento"
        footer={
          <>
            <Button variant="outlined" onClick={() => setIsModalBaixaOpen(false)}>Cancelar</Button>
            <Button variant="primary" onClick={confirmarBaixa}>Confirmar Recebimento</Button>
          </>
        }
      >
        {vendaSelecionada && (
          <div className="flex flex-col gap-4 py-2">
            <div className="bg-(--bg-sidebar) p-4 rounded-sm border border-(--border-default)/50 flex justify-between items-center">
              <div>
                <p className="text-body-sm text-(--txt-secondary)">Cliente</p>
                <p className="text-(--txt-primary)">
                  {obterNomeCliente(vendaSelecionada.cliente_id)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-body-sm text-(--txt-secondary)">Valor a Receber</p>
                <p className="text-h3 font-heading font-bold text-(--color-green)">{formatarMoeda(vendaSelecionada.valor_total)}</p>
              </div>
            </div>

            <div className="flex flex-col gap-1 mt-2">
              <SelectField
                label="Conta de Destino"
                placeholder="Onde o dinheiro caiu?"
                options={[
                  { label: "Banco Inter (Transferência/Pix)", value: "INTER" },
                  { label: "Maquininha Ton (Cartão)", value: "MAQUININHA_TON" },
                  { label: "Dinheiro Físico (Caixa)", value: "DINHEIRO" },
                ]}
                value={contaDestino}
                onValueChange={(val) => { setContaDestino(val); setErroConta(""); }}
                error={erroConta}
                required
              />
              <span className="text-body-sm text-(--txt-secondary)">A data de liquidação será registrada automaticamente como hoje.</span>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal de Filtros de Histórico */}
      <Modal
        open={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        title="Filtrar Histórico de Pagamentos"
        footer={
          <>
            <Button variant="outlined" onClick={limparFiltroPeriodo} disabled={!dataInicioTemp && !dataFimTemp && filtroStatusTemp === "TODOS" && filtroContaTemp === "TODOS"}>
              Limpar Filtros
            </Button>
            <Button variant="outlined" onClick={() => setIsFilterModalOpen(false)}>Cancelar</Button>
            <Button variant="primary" onClick={aplicarFiltroPeriodo}>Confirmar Filtros</Button>
          </>
        }
      >
        <div className="flex flex-col gap-4 py-2">
          {/* Seleção do Período Cronológico */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <label className="text-body-sm font-semibold text-(--txt-secondary)">Data Inicial</label>
              <Input type="date" value={dataInicioTemp} onChange={(e) => setDataInicioTemp(e.target.value)} max={hoje} />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-body-sm font-semibold text-(--txt-secondary)">Data Final</label>
              <Input type="date" value={dataFimTemp} onChange={(e) => setDataFimTemp(e.target.value)} min={dataInicioTemp || undefined} max={hoje} />
            </div>
          </div>

          {/* Seleção de Status e Contas Destino */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <SelectField
              label="Status Financeiro"
              options={[
                { label: "Todos", value: "TODOS" },
                { label: "Pagos (Liquidados)", value: "PAGO" },
                { label: "Pendentes", value: "PENDENTE" },
              ]}
              value={filtroStatusTemp}
              onValueChange={setFiltroStatusTemp}
            />

            <SelectField
              label="Conta / Destino"
              options={[
                { label: "Todas as Contas", value: "TODOS" },
                { label: "Banco Inter", value: "INTER" },
                { label: "Maquininha Ton", value: "MAQUININHA_TON" },
                { label: "Dinheiro (Físico)", value: "DINHEIRO" },
              ]}
              value={filtroContaTemp}
              onValueChange={setFiltroContaTemp}
              disabled={filtroStatusTemp === "PENDENTE"} 
            />
          </div>
        </div>
      </Modal>

    </div>
  )
}