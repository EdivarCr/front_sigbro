import { useState, useMemo, useEffect } from "react"
import { useFilter } from "@/context/FilterContext"
import { Breadcrumb } from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import { Table } from "@/components/ui/table"
import { Modal } from "@/components/ui/modal"
import { MobileTable } from "@/components/ui/mobile-table"
import { Input } from "@/components/ui/input"
import { useNavigate } from "react-router-dom"

import {
  CalendarBlankIcon,
  ArrowCounterClockwiseIcon,
  FileTextIcon,
  PlusIcon,
  TrendUpIcon,
  PencilSimpleIcon
} from "@phosphor-icons/react"

import { exportarDashboardParaPDF } from "@/lib/relatorioDashboard"
import { dashboardService, type DashboardGeralData } from "@/services/api/dashboards.service"
import { vendaService, type Venda } from "@/services/api/vendas.service"
import { listarClientes, type Cliente } from "@/services/api/cliente.service"
import { getHojeLocal } from "@/lib/utils"

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Label,
} from "recharts"

export default function DashboardPage() {
  const navigate = useNavigate()

  const {
    dataInicio,
    dataFim,
    periodoTexto,
    setDataInicio,
    setDataFim,
    setPeriodoTexto,
    limparFiltrosGlobal
  } = useFilter()

  const hoje = getHojeLocal()
  const nomeMesAtual = useMemo(() => new Date().toLocaleDateString("pt-BR", { month: "long" }), [])

  const formatarDataBR = (dataStr: string) => {
    if (!dataStr) return ""
    const [ano, mes, dia] = dataStr.split("-")
    return `${dia}/${mes}/${ano}`
  }

  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false)
  const [dataInicioTemp, setDataInicioTemp] = useState<string>(dataInicio)
  const [dataFimTemp, setDataFimTemp] = useState<string>(dataFim)

  const isFiltroAtivo = useMemo(() => dataInicio !== "" || dataFim !== "", [dataInicio, dataFim])

  const [metaMensal, setMetaMensal] = useState<number>(() => {
    const savedMeta = localStorage.getItem("sigbro_meta_mensal")
    return savedMeta ? Number(savedMeta) : 5000.00
  })
  const [isMetaModalOpen, setIsMetaModalOpen] = useState(false)
  const [metaTemp, setMetaTemp] = useState<string>("")
  
  // --- ESTADOS DA API REAL ---
  const [dadosGerais, setDadosGerais] = useState<DashboardGeralData | null>(null)
  const [ultimasVendas, setUltimasVendas] = useState<Venda[]>([])
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const carregarDashboards = async () => {
      setLoading(true)
      try {
        const filtros = { data_inicio: dataInicio || null, data_fim: dataFim || null }
        
        const [resGeral, resVendas, resClientes] = await Promise.all([
          dashboardService.obterDashboardGeral(filtros),
          vendaService.listarVendas({ limit: 5 }),
          listarClientes({ limit: 1000 })
        ])

        setDadosGerais(resGeral)
        setUltimasVendas(resVendas.itens || [])
        setClientes(resClientes.costumers || [])
      } catch (error) {
        console.error("Erro ao carregar dashboard:", error)
      } finally {
        setLoading(false)
      }
    }
    carregarDashboards()
  }, [dataInicio, dataFim])

  // --- CÁLCULO KPIs DO PERÍODO ---
  const faturamentoPeriodo = Number(dadosGerais?.total_faturado) || 0
  const totalVendas = dadosGerais?.quantidade_vendas || 0
  const ticketMedio = totalVendas > 0 ? faturamentoPeriodo / totalVendas : 0
  
  const formatarMoeda = (valor: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(valor)

  const obterNomeCliente = (clienteId: number | null) => {
    if (!clienteId) return "Avulso"
    const cliente = clientes.find(c => c.id === clienteId)
    return cliente ? cliente.name : `Cliente #${clienteId}`
  }
  
  // Como a meta é baseada no mês atual, verificamos o faturamento do último mês retornado ou do período
  const faturamentoMesAtual = faturamentoPeriodo 
  const porcentagemMeta = metaMensal > 0 ? ((faturamentoMesAtual / metaMensal) * 100).toFixed(1) : "0.0"

  // --- PROCESSAMENTO DOS GRÁFICOS ---
  const proporcaoVendas = useMemo(() => {
    const dadosProporcao = dadosGerais?.proporcao_vendas || [] 
    
    const faturamentoCalculado = dadosProporcao.reduce((acc, curr) => acc + Number(curr.valor), 0)

    return dadosProporcao.map((p) => {
      const valor = Number(p.valor)
      return {
        name: p.tipo,
        value: valor,
        percentage: faturamentoCalculado > 0 ? `${((valor / faturamentoCalculado) * 100).toFixed(1)}%` : "0%",
        color: p.tipo.toUpperCase() === "ATACADO" ? "#a4133c" : "#9e475e"
      }
    })
  }, [dadosGerais])

  // --- GRÁFICOS DE PRODUTOS ---
  const maisVendidos = useMemo(() => {
    const lista = dadosGerais?.produtos_mais_vendidos || []
    return lista.slice(0, 5).map(p => ({ name: p.nome_produto, qtd: p.quantidade_vendida }))
  }, [dadosGerais])

  const menosVendidos = useMemo(() => {
    const lista = dadosGerais?.produtos_mais_vendidos || []
    if (lista.length === 0) return []
    return [...lista].reverse().slice(0, 5).map(p => ({ name: p.nome_produto, qtd: p.quantidade_vendida }))
  }, [dadosGerais])

  // --- AÇÕES DE FILTRAGEM ---
  const aplicarFiltroPeriodo = () => {
    setDataInicio(dataInicioTemp)
    setDataFim(dataFimTemp)
    
    if (dataInicioTemp && dataFimTemp) {
      setPeriodoTexto(`${formatarDataBR(dataInicioTemp)} - ${formatarDataBR(dataFimTemp)}`)
    } else if (dataInicioTemp) {
      setPeriodoTexto(`A partir de ${formatarDataBR(dataInicioTemp)}`)
    } else if (dataFimTemp) {
      setPeriodoTexto(`Até ${formatarDataBR(dataFimTemp)}`)
    } else {
      setPeriodoTexto("Filtrar por Período")
    }
    setIsFilterModalOpen(false)
  }

  const limparFiltroPeriodo = () => {
    limparFiltrosGlobal()
    setDataInicioTemp("")
    setDataFimTemp("")
    setIsFilterModalOpen(false)
  }

  return (
    <div className="flex h-full min-h-0 flex-col bg-(--bg-primary) font-sans">
      <Breadcrumb items={[{ label: "Tela Inicial", to: "/" }]} />

      <div className="flex min-h-0 flex-1 flex-col gap-(--spacing-md) overflow-hidden py-(--spacing-md)">
        <h1 className="text-h1 font-heading font-bold text-(--txt-primary)">Dashboard</h1>

        <div className="flex flex-1 flex-col gap-(--spacing-lg) overflow-hidden">
          {/* Barra de Filtros */}
          <div className="flex shrink-0 flex-col justify-between gap-(--spacing-md) sm:flex-row sm:items-center">
            <div className="flex flex-wrap items-center gap-(--spacing-ms)">
              <Button variant="primary" size="md" onClick={() => { setDataInicioTemp(dataInicio); setDataFimTemp(dataFim); setIsFilterModalOpen(true); }}>
                <CalendarBlankIcon /> {periodoTexto}
              </Button>
              
              {isFiltroAtivo && (
                <Button variant="outlined" size="md" onClick={limparFiltroPeriodo}>
                  <ArrowCounterClockwiseIcon /> Limpar Filtros
                </Button>
              )}

              <Button 
                variant="primary" 
                size="md"
                onClick={() => {
                  exportarDashboardParaPDF({
                    dataInicio,
                    dataFim,
                    faturamento: formatarMoeda(faturamentoPeriodo),
                    totalVendas: totalVendas,
                    ticketMedio: formatarMoeda(ticketMedio),
                    
                    ultimasVendas: ultimasVendas.map(v => ({
                      cliente: obterNomeCliente(v.cliente_id),
                      zona: "-",
                      data: v.data_venda,
                      valor: Number(v.valor_total) || 0,
                      status: v.status_pagamento
                    })) as any,
                    maisVendidos: maisVendidos as any,
                    proporcaoVendas: proporcaoVendas
                  })
                }}
              >
                <FileTextIcon /> Gerar Relatório
              </Button>
            </div>

            <Button variant="secondary" size="md" className="self-start sm:self-auto" onClick={() => navigate("/vendas/cadastrar")}>
              <PlusIcon /> Nova Venda
            </Button>
          </div>

          <div className="flex flex-1 flex-col gap-(--spacing-xl) overflow-y-auto pr-2">
            {/* 1. Cards de KPI */}
            <div className="grid shrink-0 grid-cols-1 gap-(--spacing-lg) sm:grid-cols-2 lg:grid-cols-4">
              <div className="flex flex-col justify-between rounded-(--radius-sm) border border-(--border-default)/15 bg-(--bg-surface) p-(--spacing-lg) shadow-(--shadow-md)">
                <span className="text-body-sm font-medium text-(--txt-secondary)">Faturamento no Período</span>
                <h2 className="text-h2 font-heading mt-(--spacing-sm) font-bold text-(--txt-primary)">{formatarMoeda(faturamentoPeriodo)}</h2>
                <div className="text-body-md mt-(--spacing-sm) flex items-center gap-(--spacing-xs) font-medium text-(--txt-secondary)">
                  <em>Dados filtrados do período</em>
                </div>
              </div>

              <div className="flex flex-col justify-between rounded-(--radius-sm) border border-(--border-default)/15 bg-(--bg-surface) p-(--spacing-lg) shadow-(--shadow-md)">
                <span className="text-body-sm font-medium text-(--txt-secondary)">Total de Vendas</span>
                <h2 className="text-h2 font-heading mt-(--spacing-sm) font-bold text-(--txt-primary)">{totalVendas} vendas</h2>
                <div className="text-body-md mt-(--spacing-sm) flex items-center gap-(--spacing-xs) font-medium text-(--txt-secondary)">
                  <em>Volume movimentado</em>
                </div>
              </div>

              <div className="flex flex-col justify-between rounded-(--radius-sm) border border-(--border-default)/15 bg-(--bg-surface) p-(--spacing-lg) shadow-(--shadow-md)">
                <span className="text-body-sm font-medium text-(--txt-secondary)">Ticket Médio</span>
                <h2 className="text-h2 font-heading mt-(--spacing-sm) font-bold text-(--txt-primary)">{formatarMoeda(ticketMedio)}</h2>
                <div className="text-body-md mt-(--spacing-sm) flex items-center gap-(--spacing-xs) font-medium text-(--txt-secondary)">
                  <em>Média ponderada por venda</em>
                </div>
              </div>

              <div className="flex flex-col justify-between rounded-(--radius-sm) border border-(--border-default)/15 bg-(--bg-surface) p-(--spacing-lg) shadow-(--shadow-md) group">
                <div className="flex items-center justify-between">
                  <span className="text-body-sm font-medium text-(--txt-secondary)">Meta de {nomeMesAtual.charAt(0).toUpperCase() + nomeMesAtual.slice(1)}</span>
                  <button onClick={() => { setMetaTemp(metaMensal.toString()); setIsMetaModalOpen(true); }} className="text-(--txt-secondary) hover:text-brand transition-colors cursor-pointer" title="Editar Meta">
                    <PencilSimpleIcon size={16} />
                  </button>
                </div>
                <h2 className="text-h2 font-heading font-bold text-(--txt-primary) mt-(--spacing-sm)">{formatarMoeda(metaMensal)}</h2>
                <div className="flex items-center gap-(--spacing-xs) text-(--txt-secondary) text-body-xs mt-(--spacing-sm) font-medium">
                  {Number(porcentagemMeta) >= 100 ? (
                    <span className="text-(--color-green) flex items-center gap-1"><TrendUpIcon size={14} /> Meta Atingida!</span>
                  ) : (
                    <span><strong className="text-(--txt-primary)">{porcentagemMeta}%</strong> alcançados</span>
                  )}
                </div>
              </div>
            </div>

            {/* 2. Seção de Gráficos de Desempenho */}
            <div className="flex shrink-0 flex-col gap-(--spacing-md)">
              <div className="flex items-center gap-(--spacing-sm)">
                <h3 className="text-h3 font-heading font-bold text-(--txt-primary)">Visão Financeira</h3>
              </div>

              <div className="flex flex-col lg:flex-row gap-6 w-full">
                {/* Gráfico de Barras: Mais e Menos Vendidos */}
                <div className="flex-1 rounded-(--radius-sm) border border-(--border-default)/15 bg-(--bg-surface) p-(--spacing-lg) shadow-(--shadow-md)">
                  <h4 className="text-body-md font-bold text-(--txt-primary)">
                    Produtos Mais e Menos Vendidos
                  </h4>

                  <div className="grid h-64 grid-cols-1 gap-(--spacing-xl) md:grid-cols-2">
                    {/* Gráfico Esquerdo: Mais Vendidos */}
                    <div className="flex h-full flex-col">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={maisVendidos} layout="vertical" barCategoryGap="35%" margin={{ top: 10, right: 20, left: 10, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="4 4" horizontal={false} stroke="var(--border-default)" strokeOpacity={0.3} />
                          <XAxis type="number" orientation="top" stroke="#4b5563" fontSize={11} />
                          <YAxis dataKey="name" type="category" stroke="#4b5563" fontSize={11} tickLine={false} width={100} />
                          <Tooltip cursor={{ fill: "transparent" }} />
                          <Bar dataKey="qtd" fill="#a4133c" radius={[0, 4, 4, 0]} name="Qtd. Vendida" />
                        </BarChart>
                      </ResponsiveContainer>
                      <div className="text-body-xs mt-2 flex items-center justify-center gap-2 text-(--txt-secondary)">
                        <div className="bg-brand h-3 w-3 rounded-xs" /> 
                        <span className="text-body-lg">Produtos Mais Vendidos</span>
                      </div>
                    </div>

                    {/* Gráfico Direito: Menos Vendidos */}
                    <div className="flex h-full flex-col">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={menosVendidos} layout="vertical" barCategoryGap="35%" margin={{ top: 10, right: 20, left: 10, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="4 4" horizontal={false} stroke="var(--border-default)" strokeOpacity={0.3} />
                          <XAxis type="number" orientation="top" stroke="#4b5563" fontSize={11} />
                          <YAxis dataKey="name" type="category" stroke="#4b5563" fontSize={11} tickLine={false} width={100} />
                          <Tooltip cursor={{ fill: "transparent" }} />
                          <Bar dataKey="qtd" fill="#736d6e" radius={[0, 4, 4, 0]} name="Qtd. Vendida" />
                        </BarChart>
                      </ResponsiveContainer>
                      <div className="text-body-xs mt-2 flex items-center justify-center gap-2 text-(--txt-secondary)">
                        <div className="h-3 w-3 rounded-xs bg-[#736d6e]" />
                        <span className="text-body-lg">Produtos Menos Vendidos</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Donut Chart Financeiro */}
                <div className="flex-1 items-center justify-between gap-(--spacing-md) rounded-(--radius-sm) border border-(--border-default)/15 bg-(--bg-surface) p-(--spacing-lg) shadow-(--shadow-md)">
                  <h4 className="text-body-md self-start font-bold text-(--txt-primary)">Proporção Varejo x Atacado</h4>

                  <div className="relative flex h-52 w-full items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={proporcaoVendas} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={2} dataKey="value">
                          {proporcaoVendas.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                          <Label value={formatarMoeda(faturamentoPeriodo).replace(",00", "")} position="center" className="font-heading fill-(--txt-primary) text-xl font-bold" />
                        </Pie>
                        <Tooltip formatter={(value: any, name: any) => [formatarMoeda(Number(value)), name]} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="text-body-xs flex w-full flex-col gap-2 px-2 font-medium">
                    <div className="flex items-center justify-between text-(--txt-primary)">
                      <div className="flex items-center gap-2">
                        <span className="bg-brand h-2.5 w-2.5 rounded-full" />
                        <span className="text-body-lg">Atacado</span>
                      </div>
                      <span className="text-body-lg text-(--txt-secondary)">
                        {formatarMoeda(proporcaoVendas.find(p => p.name.toUpperCase() === 'ATACADO')?.value || 0)}{" "}
                        <strong className="text-brand">{proporcaoVendas.find(p => p.name.toUpperCase() === 'ATACADO')?.percentage || '0%'}</strong>
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-(--txt-primary)">
                      <div className="flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-full bg-[#9e475e]" />
                        <span className="text-body-lg">Varejo</span>
                      </div>
                      <span className="text-body-lg text-(--txt-secondary)">
                        {formatarMoeda(proporcaoVendas.find(p => p.name.toUpperCase() === 'VAREJO')?.value || 0)}{" "}
                        <strong className="text-[#9e475e]">{proporcaoVendas.find(p => p.name.toUpperCase() === 'VAREJO')?.percentage || '0%'}</strong>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Seção: Últimas Vendas Realizadas */}
            <div className="flex shrink-0 flex-col gap-(--spacing-md) pb-4 mt-4">
              <div className="flex items-center gap-(--spacing-sm)">
                <h3 className="text-h3 font-heading font-bold text-(--txt-primary)">Últimas Vendas Realizadas</h3>
                <button className="text-body-sm font-semibold text-(--txt-link) hover:underline" onClick={() => navigate("/vendas")}>Ver histórico completo</button>
              </div>

              <div className="hidden md:block">
                <Table
                  columns={[
                    { key: "id", label: "ID", render: (row: Venda) => <span className="text-(--txt-secondary)">#{row.id}</span> },
                    { key: "cliente_id", label: "Cliente", render: (row: Venda) => <span className="font-semibold">{obterNomeCliente(row.cliente_id)}</span> },
                    { key: "data_venda", label: "Data da Venda", render: (row: Venda) => new Date(row.data_venda).toLocaleDateString("pt-BR", { timeZone: "UTC" }) },
                    { key: "valor_total", label: "Valor", render: (row: Venda) => <span className="font-bold">{formatarMoeda(Number(row.valor_total))}</span> },
                    {
                      key: "status_pagamento",
                      label: "Status do Pedido",
                      render: (row: Venda) => {
                        const isPago = row.status_pagamento === "PAGO"
                        return (
                          <span className={`text-body-sm inline-flex items-center justify-center rounded-full px-2.5 py-0.5 leading-none font-medium ${isPago ? "bg-(--color-green)/15 text-(--color-green)" : "bg-(--color-blue)/15 text-(--color-blue)"}`}>
                            {isPago ? "Pago" : "Pagamento Pendente"}
                          </span>
                        )
                      },
                    },
                  ]}
                  data={ultimasVendas}
                  pageSize={5}
                  emptyValue={loading ? "Carregando..." : "Nenhuma venda registrada no banco."}
                />
              </div>

              {/* Tabela Mobile */}
              <div className="block md:hidden">
                <MobileTable
                  columns={[
                    { key: "cliente", label: "Cliente", render: (row: Venda) => <span>{obterNomeCliente(row.cliente_id)}</span> },
                    { key: "valor", label: "Valor", render: (row: Venda) => formatarMoeda(Number(row.valor_total)) },
                  ]}
                  renderBottomAction={(row: Venda) => (
                    <div className="text-body-sm flex w-full items-center justify-between px-2 text-(--txt-secondary)">
                      <span>Venda #{row.id}</span>
                      <span>{new Date(row.data_venda).toLocaleDateString("pt-BR", { timeZone: "UTC" })}</span>
                    </div>
                  )}
                  data={ultimasVendas}
                  emptyValue={loading ? "Carregando..." : "Nenhuma venda registrada."}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Metas */}
      <Modal open={isMetaModalOpen} onClose={() => setIsMetaModalOpen(false)} title="Definir Meta do Mês" footer={<><Button variant="outlined" onClick={() => setIsMetaModalOpen(false)}>Cancelar</Button><Button variant="primary" onClick={() => { const valor = Number(metaTemp) || 0; setMetaMensal(valor); localStorage.setItem("sigbro_meta_mensal", valor.toString()); setIsMetaModalOpen(false); }}>Salvar Meta</Button></>}>
        <div className="flex flex-col gap-2 py-2">
          <label className="text-body-sm font-semibold text-(--txt-secondary)">Valor da Meta (R$)</label>
          <Input type="number" placeholder="Ex: 5000.00" value={metaTemp} onChange={(e) => setMetaTemp(e.target.value)} min="0" step="0.01" />
        </div>
      </Modal>

      {/* Modal de Filtro */}
      <Modal open={isFilterModalOpen} onClose={() => setIsFilterModalOpen(false)} title="Filtrar por Período" footer={<><Button variant="outlined" onClick={limparFiltroPeriodo} disabled={!dataInicioTemp && !dataFimTemp}>Limpar Filtros</Button><Button variant="outlined" onClick={() => setIsFilterModalOpen(false)}>Cancelar</Button><Button variant="primary" onClick={aplicarFiltroPeriodo} disabled={!dataInicioTemp && !dataFimTemp}>Confirmar Filtro</Button></>}>
        <div className="grid grid-cols-1 gap-4 py-2 sm:grid-cols-2">
          <div className="flex flex-col gap-2"><label className="text-body-sm font-semibold text-(--txt-secondary)">Data Inicial</label><Input type="date" value={dataInicioTemp} onChange={(e) => setDataInicioTemp(e.target.value)} max={hoje} /></div>
          <div className="flex flex-col gap-2"><label className="text-body-sm font-semibold text-(--txt-secondary)">Data Final</label><Input type="date" value={dataFimTemp} onChange={(e) => setDataFimTemp(e.target.value)} min={dataInicioTemp || undefined} max={hoje} /></div>
        </div>
      </Modal>
    </div>
  )
}