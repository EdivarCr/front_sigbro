import { useState, useMemo } from "react"
import { useFilter } from "@/context/FilterContext"
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

interface PagamentoData {
  id: number
  cliente: string
  valor: number
  data_venda: string
  data_baixa: string | null
  status: "PAGO" | "PENDENTE"
  conta_destino: "INTER" | "TON" | "DINHEIRO" | null
}

export default function PagamentosPage() {
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
  
  const hoje = useMemo(() => new Date().toISOString().split("T")[0], [])

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

  // 3. ESTADOS PARA O MODAL DE BAIXA
  const [isModalBaixaOpen, setIsModalBaixaOpen] = useState(false)
  const [vendaSelecionada, setVendaSelecionada] = useState<PagamentoData | null>(null)
  const [contaDestino, setContaDestino] = useState<string>("")
  const [erroConta, setErroConta] = useState<string>("")

  // 4. BASE DE DADOS MOCKADA
  const [pagamentos, setPagamentos] = useState<PagamentoData[]>([
    { id: 101, cliente: "Mercadinho Dirceu", valor: 212.00, data_venda: "2026-06-04", data_baixa: null, status: "PENDENTE", conta_destino: null },
    { id: 102, cliente: "Empório Riverside", valor: 485.50, data_venda: "2026-06-05", data_baixa: "2026-06-06", status: "PAGO", conta_destino: "TON" },
    { id: 103, cliente: "Parrilla Sul Gourmet", valor: 740.00, data_venda: "2026-06-03", data_baixa: "2026-06-03", status: "PAGO", conta_destino: "INTER" },
    { id: 104, cliente: "Cliente Avulso", valor: 45.00, data_venda: "2026-05-06", data_baixa: "2026-05-06", status: "PAGO", conta_destino: "DINHEIRO" },
    { id: 105, cliente: "Restaurante Sabor", valor: 320.00, data_venda: "2026-05-07", data_baixa: null, status: "PENDENTE", conta_destino: null },
  ])

  const vendasPendentes = useMemo(() => {
    return pagamentos.filter(p => p.status === "PENDENTE")
  }, [pagamentos])
  
  const vendasFiltradas = useMemo(() => {
    return pagamentos.filter(p => {
      // Filtro de Status
      if (filtroStatus !== "TODOS" && p.status !== filtroStatus) return false
      
      // Filtro de Conta Destino
      if (filtroConta !== "TODOS" && p.conta_destino !== filtroConta) return false
      
      // Filtro de Período Cronológico (Baseado na data efetiva da movimentação)
      const dataEfetiva = p.data_baixa || p.data_venda
      if (dataInicio && dataEfetiva < dataInicio) return false
      if (dataFim && dataEfetiva > dataFim) return false
      
      return true
    }).sort((a, b) => {
      const dataA = a.data_baixa || a.data_venda;
      const dataB = b.data_baixa || b.data_venda;
      return new Date(dataB).getTime() - new Date(dataA).getTime();
    })
  }, [pagamentos, dataInicio, dataFim, filtroStatus, filtroConta])

  const totais = useMemo(() => {
    return vendasFiltradas.reduce((acc, curr) => {
      if (curr.status === "PAGO") {
        acc.totalRecebido += curr.valor
        if (curr.conta_destino === "INTER") acc.inter += curr.valor
        if (curr.conta_destino === "TON") acc.ton += curr.valor
        if (curr.conta_destino === "DINHEIRO") acc.dinheiro += curr.valor
      }
      return acc
    }, { totalRecebido: 0, inter: 0, ton: 0, dinheiro: 0 })
  }, [vendasFiltradas])

  const formatarMoeda = (valor: number) => 
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(valor)

  const formatarData = (dataStr: string) => 
    new Date(dataStr).toLocaleDateString('pt-BR', { timeZone: 'UTC' })

  const abrirModalBaixa = (venda: PagamentoData) => {
    setVendaSelecionada(venda)
    setContaDestino("")
    setErroConta("")
    setIsModalBaixaOpen(true)
  }

  const confirmarBaixa = () => {
    if (!contaDestino) {
      setErroConta("Você deve selecionar uma conta de destino.")
      return
    }
    const dataLiquidacao = new Date().toISOString().split("T")[0]
    setPagamentos(prev => prev.map(p => 
      p.id === vendaSelecionada?.id 
        ? { ...p, status: "PAGO", conta_destino: contaDestino as any, data_baixa: dataLiquidacao } 
        : p
    ))
    setIsModalBaixaOpen(false)
    setVendaSelecionada(null)
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
    { key: "id", label: "Cód.", render: (row: PagamentoData) => <span className="text-(--txt-secondary)">#{row.id}</span> },
    { key: "cliente", label: "Cliente", render: (row: PagamentoData) => <span className="font-semibold">{row.cliente}</span> },
    { key: "data_venda", label: "Data da Venda", render: (row: PagamentoData) => formatarData(row.data_venda) },
    { key: "valor", label: "Valor", render: (row: PagamentoData) => <span className="font-bold">{formatarMoeda(row.valor)}</span> },
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

          <div className="flex-1 flex flex-col gap-(--spacing-lg) overflow-y-auto pr-2 Logan pb-4">
            
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
                        render: (row: PagamentoData) => (
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
                    emptyValue="Nenhum pagamento pendente no momento. Tudo em dia!"
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
                      exportarPagamentosParaPDF({
                        dataInicio,
                        dataFim,
                        filtroStatus,
                        filtroConta,
                        totalLiquidado: formatarMoeda(totais.totalRecebido),
                        totalInter: formatarMoeda(totais.inter),
                        totalTon: formatarMoeda(totais.ton),
                        totalDinheiro: formatarMoeda(totais.dinheiro),
                        vendasFiltradas: vendasFiltradas
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
                        key: "status", 
                        label: "Status", 
                        render: (row: PagamentoData) => (
                          <span className={`inline-flex items-center justify-center text-body-sm rounded-full px-2.5 py-0.5 font-medium leading-none ${
                            row.status === "PAGO" ? "bg-(--color-green)/15 text-(--color-green)" : "bg-(--color-blue)/15 text-(--color-blue)"
                          }`}>
                            {row.status === "PAGO" ? "Liquidado" : "Pendente"}
                          </span>
                        ) 
                      },
                      { 
                        key: "data_baixa", 
                        label: "Data Liquidação", 
                        render: (row: PagamentoData) => row.data_baixa ? formatarData(row.data_baixa) : "-" 
                      },
                      { 
                        key: "conta", 
                        label: "Conta Destino", 
                        render: (row: PagamentoData) => (
                          <span className="text-(--txt-secondary) font-medium">
                            {row.conta_destino === "INTER" && "Banco Inter"}
                            {row.conta_destino === "TON" && "Ton"}
                            {row.conta_destino === "DINHEIRO" && "Dinheiro"}
                            {!row.conta_destino && "-"}
                          </span>
                        ) 
                      },
                    ]}
                    data={vendasFiltradas}
                    pageSize={10}
                    emptyValue="Nenhum pagamento encontrado para este critério."
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
                <p className="font-bold text-(--txt-primary)">{vendaSelecionada.cliente}</p>
              </div>
              <div className="text-right">
                <p className="text-body-sm text-(--txt-secondary)">Valor a Receber</p>
                <p className="text-h3 font-heading font-bold text-(--color-green)">{formatarMoeda(vendaSelecionada.valor)}</p>
              </div>
            </div>

            <div className="flex flex-col gap-1 mt-2">
              <SelectField
                label="Conta de Destino"
                placeholder="Onde o dinheiro caiu?"
                options={[
                  { label: "Banco Inter (Transferência/Pix)", value: "INTER" },
                  { label: "Maquininha Ton (Cartão)", value: "TON" },
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
                { label: "Maquininha Ton", value: "TON" },
                { label: "Dinheiro (Físico)", value: "DINHEIRO" },
              ]}
              value={filtroContaTemp}
              onValueChange={setFiltroContaTemp}
              // Se está pendente, o dinheiro não entrou em nenhuma conta ainda
              disabled={filtroStatusTemp === "PENDENTE"} 
            />
          </div>
        </div>
      </Modal>

    </div>
  )
}