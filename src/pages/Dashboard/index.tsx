import { useState, useMemo } from "react"
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

interface UltimaVendaItem {
  id: number
  cliente: string
  zona: string
  data: string
  valor: number
  status: "PAGO" | "PENDENTE" | "CANCELADO"
}

interface HistoricoProdutoItem {
  name: string
  qtd: number
  tipo: "Atacado" | "Varejo"
  data: string
  valor: number
}

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

  // Controle de datas
  const hoje = useMemo(() => new Date().toISOString().split("T")[0], [])
  const primeiroDiaDoMes = useMemo(() => {
    const agora = new Date()
    const ano = agora.getFullYear()
    const mes = String(agora.getMonth() + 1).padStart(2, "0")
    return `${ano}-${mes}-01`
  }, [])
  const nomeMesAtual = useMemo(() => {
    return new Date().toLocaleDateString("pt-BR", { month: "long" })
  }, [])

  const formatarDataBR = (dataStr: string) => {
    if (!dataStr) return ""
    const [ano, mes, dia] = dataStr.split("-")
    return `${dia}/${mes}/${ano}`
  }

  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false)
  const [dataInicioTemp, setDataInicioTemp] = useState<string>(dataInicio)
  const [dataFimTemp, setDataFimTemp] = useState<string>(dataFim)

  const isFiltroAtivo = useMemo(() => {
    return dataInicio !== "" || dataFim !== ""
  }, [dataInicio, dataFim])

  const [metaMensal, setMetaMensal] = useState<number>(() => {
    const savedMeta = localStorage.getItem("sigbro_meta_mensal")
    return savedMeta ? Number(savedMeta) : 90.00
  })
  const [isMetaModalOpen, setIsMetaModalOpen] = useState(false)
  const [metaTemp, setMetaTemp] = useState<string>("")
  
  // --- BASE DE DADOS MOCKADA ---
  const historicoVendasProdutos: HistoricoProdutoItem[] = useMemo(() => [
    // Vendas de Abril 2026
    { name: "Produto 1", qtd: 40, tipo: "Atacado", data: "2026-04-05", valor: 400 },
    { name: "Produto 2", qtd: 20, tipo: "Atacado", data: "2026-04-05", valor: 200 },
    { name: "Produto 3", qtd: 25, tipo: "Atacado", data: "2026-04-03", valor: 250 },
    { name: "Produto 4", qtd: 15, tipo: "Varejo", data: "2026-04-04", valor: 150 },
    { name: "Produto 5", qtd: 10, tipo: "Varejo", data: "2026-04-04", valor: 100 },
    { name: "Produto 6", qtd: 12, tipo: "Atacado", data: "2026-04-01", valor: 120 },
    { name: "Produto 7", qtd: 10, tipo: "Varejo", data: "2026-04-02", valor: 100 },
    { name: "Produto 8", qtd: 8, tipo: "Varejo", data: "2026-04-02", valor: 80 },
    { name: "Produto 9", qtd: 2, tipo: "Varejo", data: "2026-04-03", valor: 20 },

    // Vendas de Maio 2026
    { name: "Produto 1", qtd: 15, tipo: "Atacado", data: "2026-05-12", valor: 150 },
    { name: "Produto 2", qtd: 20, tipo: "Varejo", data: "2026-05-14", valor: 200 },
    { name: "Produto 3", qtd: 10, tipo: "Atacado", data: "2026-05-15", valor: 100 },
    { name: "Produto 4", qtd: 12, tipo: "Atacado", data: "2026-05-18", valor: 120 },
    { name: "Produto 5", qtd: 12, tipo: "Varejo", data: "2026-05-19", valor: 120 },
    { name: "Produto 6", qtd: 5, tipo: "Varejo", data: "2026-05-20", valor: 50 },
    { name: "Produto 7", qtd: 4, tipo: "Varejo", data: "2026-05-22", valor: 40 },
    { name: "Produto 8", qtd: 4, tipo: "Varejo", data: "2026-05-25", valor: 40 },
    { name: "Produto 9", qtd: 3, tipo: "Varejo", data: "2026-05-26", valor: 30 },

    // Vendas de Junho 2026
    { name: "Produto 1", qtd: 5, tipo: "Varejo", data: "2026-06-02", valor: 50 },
    { name: "Produto 2", qtd: 10, tipo: "Atacado", data: "2026-06-05", valor: 100 },
    { name: "Produto 3", qtd: 8, tipo: "Atacado", data: "2026-06-10", valor: 80 },
    { name: "Produto 4", qtd: 5, tipo: "Varejo", data: "2026-06-12", valor: 50 },
    { name: "Produto 5", qtd: 3, tipo: "Varejo", data: "2026-06-15", valor: 30 },
    { name: "Produto 6", qtd: 2, tipo: "Varejo", data: "2026-06-18", valor: 20 },
    { name: "Produto 7", qtd: 2, tipo: "Varejo", data: "2026-06-20", valor: 20 },
    { name: "Produto 8", qtd: 2, tipo: "Varejo", data: "2026-06-22", valor: 20 },
    { name: "Produto 9", qtd: 1, tipo: "Varejo", data: "2026-06-25", valor: 10 },
  ], [])

  const ultimasVendas: UltimaVendaItem[] = useMemo(() => [
    { id: 1, cliente: "Empório Riverside", zona: "Zona Leste", data: "2026-06-05", valor: 485.5, status: "PAGO" },
    { id: 2, cliente: "Mercadinho Dirceu", zona: "Zona Sudeste", data: "2026-05-14", valor: 212.0, status: "PENDENTE" },
    { id: 3, cliente: "Parrilla Sul Gourmet", zona: "Zona Sul", data: "2026-04-03", valor: 740.0, status: "PAGO" },
  ], [])

  const produtosFiltrados = useMemo(() => {
    return historicoVendasProdutos.filter((item) => {
      if (!dataInicio && !dataFim) return true
      if (dataInicio && !dataFim) return item.data >= dataInicio
      if (!dataInicio && dataFim) return item.data <= dataFim
      return item.data >= dataInicio && item.data <= dataFim
    })
  }, [historicoVendasProdutos, dataInicio, dataFim])

  const ultimasVendasFiltradas = useMemo(() => {
    return ultimasVendas.filter((venda) => {
      if (!dataInicio && !dataFim) return true
      if (dataInicio && !dataFim) return venda.data >= dataInicio
      if (!dataInicio && dataFim) return venda.data <= dataFim
      return venda.data >= dataInicio && venda.data <= dataFim
    })
  }, [ultimasVendas, dataInicio, dataFim])

  // Meta fixa baseada no faturamento do mês atual
  const faturamentoMesAtual = useMemo(() => {
    return historicoVendasProdutos
      .filter((item) => item.data >= primeiroDiaDoMes && item.data <= hoje)
      .reduce((acc, curr) => acc + curr.valor, 0)
  }, [historicoVendasProdutos, primeiroDiaDoMes, hoje])

  // --- PROCESSAMENTO DOS GRÁFICOS ---
  const dadosAgrupadosGraficos = useMemo(() => {
    const contagem: Record<string, number> = {}
    produtosFiltrados.forEach((item) => {
      contagem[item.name] = (contagem[item.name] || 0) + item.qtd
    })
    return Object.keys(contagem).map((name) => ({ name, qtd: contagem[name] }))
  }, [produtosFiltrados])

  const maisVendidos = useMemo(() => {
    return [...dadosAgrupadosGraficos].sort((a, b) => b.qtd - a.qtd).slice(0, 5)
  }, [dadosAgrupadosGraficos])
  const menosVendidos = useMemo(() => {
    return [...dadosAgrupadosGraficos].sort((a, b) => a.qtd - b.qtd).slice(0, 5)
  }, [dadosAgrupadosGraficos])

  const proporcaoVendas = useMemo(() => {
    let atacadoCount = 0
    let varejoCount = 0
    produtosFiltrados.forEach((item) => {
      if (item.tipo === "Atacado") atacadoCount++
      else varejoCount++
    })
    const total = atacadoCount + varejoCount
    return [
      { name: "Atacado", value: atacadoCount, percentage: total > 0 ? `${((atacadoCount / total) * 100).toFixed(1)}%` : "0%", color: "#a4133c" },
      { name: "Varejo", value: varejoCount, percentage: total > 0 ? `${((varejoCount / total) * 100).toFixed(1)}%` : "0%", color: "#9e475e" },
    ]
  }, [produtosFiltrados])

  // --- CÁLCULO KPIs DO PERÍODO ---
  const totalVendas = useMemo(() => proporcaoVendas.reduce((acc, curr) => acc + curr.value, 0), [proporcaoVendas])
  const faturamentoPeriodo = useMemo(() => produtosFiltrados.reduce((acc, curr) => acc + curr.valor, 0), [produtosFiltrados])
  const ticketMedio = useMemo(() => totalVendas > 0 ? faturamentoPeriodo / totalVendas : 0, [faturamentoPeriodo, totalVendas])
  const formatarMoeda = (valor: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(valor)
  const porcentagemMeta = metaMensal > 0 ? ((faturamentoMesAtual / metaMensal) * 100).toFixed(1) : "0.0"

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
    limparFiltrosGlobal() // Reseta as datas no Contexto de forma limpa para string vazia
    setDataInicioTemp("")
    setDataFimTemp("")
    setIsFilterModalOpen(false)
  }

  return (
    <div className="flex h-full min-h-0 flex-col bg-(--bg-primary) font-sans">
      <Breadcrumb items={[{ label: "Tela Inicial", to: "/" }]} />

      <div className="flex min-h-0 flex-1 flex-col gap-(--spacing-md) overflow-hidden py-(--spacing-md)">
        <h1 className="text-h1 font-heading font-bold text-(--txt-primary)">
          Dashboard
        </h1>

        <div className="flex flex-1 flex-col gap-(--spacing-lg) overflow-hidden">
          {/* Barra de Filtros */}
          <div className="flex shrink-0 flex-col justify-between gap-(--spacing-md) sm:flex-row sm:items-center">
            <div className="flex flex-wrap items-center gap-(--spacing-ms)">
              <Button 
                variant="primary" 
                size="md"
                onClick={() => {
                  setDataInicioTemp(dataInicio)
                  setDataFimTemp(dataFim)
                  setIsFilterModalOpen(true)
                }}
              >
                <CalendarBlankIcon />
                {periodoTexto}
              </Button>
              
              {/* Botão de Limpeza visível para restaurar filtros históricos */}
              {isFiltroAtivo && (
                <Button variant="outlined" size="md" title="Limpar filtros e exibir histórico completo" onClick={limparFiltroPeriodo}>
                  <ArrowCounterClockwiseIcon />
                  Limpar Filtros
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
                    ultimasVendas: ultimasVendasFiltradas,
                    maisVendidos: maisVendidos,
                    proporcaoVendas: proporcaoVendas
                  })
                }}
              >
                <FileTextIcon />
                Gerar Relatório
              </Button>
            </div>

            <Button
              variant="secondary"
              size="md"
              className="self-start sm:self-auto"
              onClick={() => navigate("/vendas/cadastrar")}
            >
              <PlusIcon />
              Nova Venda
            </Button>
          </div>

          {/* Área de Conteúdo Única Rolável */}
          <div className="flex flex-1 flex-col gap-(--spacing-xl) overflow-y-auto pr-2">
            {/* 1. Cards de KPI */}
            <div className="grid shrink-0 grid-cols-1 gap-(--spacing-lg) sm:grid-cols-2 lg:grid-cols-4">
              <div className="flex flex-col justify-between rounded-(--radius-sm) border border-(--border-default)/15 bg-(--bg-surface) p-(--spacing-lg) shadow-(--shadow-md)">
                <span className="text-body-sm font-medium text-(--txt-secondary)">
                  Faturamento no Período
                </span>
                <h2 className="text-h2 font-heading mt-(--spacing-sm) font-bold text-(--txt-primary)">
                  {formatarMoeda(faturamentoPeriodo)}
                </h2>
                <div className="text-body-md mt-(--spacing-sm) flex items-center gap-(--spacing-xs) font-medium text-(--txt-secondary)">
                  <em>Dados filtrados do período</em>
                </div>
              </div>

              <div className="flex flex-col justify-between rounded-(--radius-sm) border border-(--border-default)/15 bg-(--bg-surface) p-(--spacing-lg) shadow-(--shadow-md)">
                <span className="text-body-sm font-medium text-(--txt-secondary)">
                  Total de Vendas
                </span>
                <h2 className="text-h2 font-heading mt-(--spacing-sm) font-bold text-(--txt-primary)">
                  {totalVendas} vendas
                </h2>
                <div className="text-body-md mt-(--spacing-sm) flex items-center gap-(--spacing-xs) font-medium text-(--txt-secondary)">
                  <em>Volume movimentado</em>
                </div>
              </div>

              <div className="flex flex-col justify-between rounded-(--radius-sm) border border-(--border-default)/15 bg-(--bg-surface) p-(--spacing-lg) shadow-(--shadow-md)">
                <span className="text-body-sm font-medium text-(--txt-secondary)">
                  Ticket Médio
                </span>
                <h2 className="text-h2 font-heading mt-(--spacing-sm) font-bold text-(--txt-primary)">
                  {formatarMoeda(ticketMedio)}
                </h2>
                <div className="text-body-md mt-(--spacing-sm) flex items-center gap-(--spacing-xs) font-medium text-(--txt-secondary)">
                  <em>Média ponderada por venda</em>
                </div>
              </div>

              <div className="flex flex-col justify-between rounded-(--radius-sm) border border-(--border-default)/15 bg-(--bg-surface) p-(--spacing-lg) shadow-(--shadow-md) group">
                <div className="flex items-center justify-between">
                  <span className="text-body-sm font-medium text-(--txt-secondary)">
                    Meta de {nomeMesAtual.charAt(0).toUpperCase() + nomeMesAtual.slice(1)}
                  </span>
                  <button 
                    onClick={() => {
                      setMetaTemp(metaMensal.toString())
                      setIsMetaModalOpen(true)
                    }}
                    className="text-(--txt-secondary) hover:text-brand transition-colors cursor-pointer"
                    title="Editar Meta"
                  >
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
                <h3 className="text-h3 font-heading font-bold text-(--txt-primary)">
                  Gráficos de Desempenho
                </h3>
                <button 
                  className="text-body-sm font-semibold text-(--txt-link) hover:underline"
                  onClick={() => navigate("/lucratividade")}
                >
                  Ver detalhes
                </button>
              </div>

              <div className="grid grid-cols-1 gap-(--spacing-lg) lg:grid-cols-3">
                <div className="flex flex-col gap-(--spacing-md) rounded-(--radius-sm) border border-(--border-default)/15 bg-(--bg-surface) p-(--spacing-lg) shadow-(--shadow-md) lg:col-span-2">
                  <h4 className="text-body-md font-bold text-(--txt-primary)">
                    Produtos Mais e Menos Vendidos
                  </h4>

                  <div className="grid h-64 grid-cols-1 gap-(--spacing-xl) md:grid-cols-2">
                    {/* Gráfico Esquerdo: Mais Vendidos */}
                    <div className="flex h-full flex-col">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={maisVendidos}
                          layout="vertical"
                          barCategoryGap="35%"
                          margin={{ top: 10, right: 20, left: 10, bottom: 5 }}
                        >
                          <CartesianGrid
                            strokeDasharray="4 4"
                            horizontal={false}
                            stroke="var(--border-default)"
                            strokeOpacity={0.3}
                          />
                          <XAxis
                            type="number"
                            orientation="top"
                            stroke="#4b5563"
                            fontSize={11}
                          />
                          <YAxis
                            dataKey="name"
                            type="category"
                            stroke="#4b5563"
                            fontSize={11}
                            tickLine={false}
                          />
                          <Tooltip cursor={{ fill: "transparent" }} />
                          <Bar
                            dataKey="qtd"
                            fill="#a4133c"
                            radius={[0, 4, 4, 0]}
                            name="Qtd. Vendida"
                          />
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
                        <BarChart
                          data={menosVendidos}
                          layout="vertical"
                          barCategoryGap="35%"
                          margin={{ top: 10, right: 20, left: 10, bottom: 5 }}
                        >
                          <CartesianGrid
                            strokeDasharray="4 4"
                            horizontal={false}
                            stroke="var(--border-default)"
                            strokeOpacity={0.3}
                          />
                          <XAxis
                            type="number"
                            orientation="top"
                            stroke="#4b5563"
                            fontSize={11}
                          />
                          <YAxis
                            dataKey="name"
                            type="category"
                            stroke="#4b5563"
                            fontSize={11}
                            tickLine={false}
                          />
                          <Tooltip cursor={{ fill: "transparent" }} />
                          <Bar
                            dataKey="qtd"
                            fill="#736d6e"
                            radius={[0, 4, 4, 0]}
                            name="Qtd. Vendida"
                          />
                        </BarChart>
                      </ResponsiveContainer>
                      <div className="text-body-xs mt-2 flex items-center justify-center gap-2 text-(--txt-secondary)">
                        <div className="h-3 w-3 rounded-xs bg-[#736d6e]" />{" "}
                        <span className="text-body-lg">Produtos Menos Vendidos</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Donut Chart */}
                <div className="flex flex-col items-center justify-between gap-(--spacing-md) rounded-(--radius-sm) border border-(--border-default)/15 bg-(--bg-surface) p-(--spacing-lg) shadow-(--shadow-md)">
                  <h4 className="text-body-md self-start font-bold text-(--txt-primary)">
                    Proporção Varejo x Atacado
                  </h4>

                  <div className="relative flex h-52 w-full items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={proporcaoVendas}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={2}
                          dataKey="value"
                        >
                          {proporcaoVendas.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                          <Label
                            value={totalVendas}
                            position="center"
                            className="font-heading fill-(--txt-primary) text-3xl font-bold"
                          />
                        </Pie>
                        <Tooltip
                          formatter={(value, name) => [`${value} vendas`, name]}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Legendas Laterais */}
                  <div className="text-body-xs flex w-full flex-col gap-2 px-2 font-medium">
                    <div className="flex items-center justify-between text-(--txt-primary)">
                      <div className="flex items-center gap-2">
                        <span className="bg-brand h-2.5 w-2.5 rounded-full" />
                        <span className="text-body-lg">Atacado</span>
                      </div>
                      <span className="text-body-lg text-(--txt-secondary)">
                        {proporcaoVendas[0].value}{" "}
                        <strong className="text-brand">
                          {proporcaoVendas[0].percentage}
                        </strong>
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-(--txt-primary)">
                      <div className="flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-full bg-[#9e475e]" />
                        <span className="text-body-lg">Varejo</span>
                      </div>
                      <span className="text-body-lg text-(--txt-secondary)">
                        {proporcaoVendas[1].value}{" "}
                        <strong className="text-[#9e475e]">
                          {proporcaoVendas[1].percentage}
                        </strong>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Seção: Últimas Vendas Realizadas */}
            <div className="flex shrink-0 flex-col gap-(--spacing-md) pb-4">
              <div className="flex items-center gap-(--spacing-sm)">
                <h3 className="text-h3 font-heading font-bold text-(--txt-primary)">
                  Últimas Vendas Realizadas
                </h3>
                <button
                  className="text-body-sm font-semibold text-(--txt-link) hover:underline"
                  onClick={() => navigate("/vendas")}
                >
                  Ver detalhes
                </button>
              </div>

              {/* Tabela Desktop */}
              <div className="hidden md:block">
                <Table
                  columns={[
                    {
                      key: "cliente",
                      label: "Cliente",
                      render: (row) => (
                        <span>{row.cliente}</span>
                      ),
                    },
                    { key: "zona", label: "Zona/Região" },
                    {
                      key: "data",
                      label: "Data da Última Venda",
                      render: (row) =>
                        new Date(row.data).toLocaleDateString("pt-BR", {
                          timeZone: "UTC",
                        }),
                    },
                    {
                      key: "valor",
                      label: "Valor",
                      render: (row) => formatarMoeda(row.valor),
                    },
                    {
                      key: "status",
                      label: "Status do Pedido",
                      render: (row) => {
                        const isPago = row.status === "PAGO"
                        return (
                          <span
                            className={`text-body-sm inline-flex items-center justify-center rounded-full px-2.5 py-0.5 leading-none font-medium ${
                              isPago
                                ? "bg-(--color-green)/15 text-(--color-green)"
                                : "bg-(--color-blue)/15 text-(--color-blue)"
                            }`}
                          >
                            {isPago ? "Pago" : "Pagamento Pendente"}
                          </span>
                        )
                      },
                    },
                  ]}
                  data={ultimasVendasFiltradas}
                  pageSize={3}
                  emptyValue="Nenhuma venda registrada no período selecionado."
                />
              </div>

              {/* Tabela Mobile */}
              <div className="block md:hidden">
                <MobileTable
                  columns={[
                    {
                      key: "cliente",
                      label: "Cliente",
                      render: (row) => (
                        <span>{row.cliente}</span>
                      ),
                    },
                    {
                      key: "valor",
                      label: "Valor",
                      render: (row) => formatarMoeda(row.valor),
                    },
                  ]}
                  renderBottomAction={(row) => (
                    <div className="text-body-sm flex w-full items-center justify-between px-2 text-(--txt-secondary)">
                      <span>{row.zona}</span>
                      <span>
                        {new Date(row.data).toLocaleDateString("pt-BR", {
                          timeZone: "UTC",
                        })}
                      </span>
                    </div>
                  )}
                  data={ultimasVendasFiltradas}
                  emptyValue="Nenhuma venda registrada."
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal: Definir Meta do Mês */}
      <Modal
        open={isMetaModalOpen}
        onClose={() => setIsMetaModalOpen(false)}
        title="Definir Meta do Mês"
        footer={
          <>
            <Button
              variant="outlined"
              onClick={() => setIsMetaModalOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                const valor = Number(metaTemp) || 0
                setMetaMensal(valor)
                localStorage.setItem("sigbro_meta_mensal", valor.toString())
                setIsMetaModalOpen(false)
              }}
            >
              Salvar Meta
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-2 py-2">
          <label className="text-body-sm font-semibold text-(--txt-secondary)">
            Valor da Meta (R$)
          </label>
          <Input
            type="number"
            placeholder="Ex: 5000.00"
            value={metaTemp}
            onChange={(e) => setMetaTemp(e.target.value)}
            min="0"
            step="0.01"
          />
          <span className="text-body-xs text-(--txt-secondary) mt-1">
            Isso atualizará o cálculo de progresso na sua tela inicial.
          </span>
        </div>
      </Modal>

      {/* Modal: Filtrar por Período */}
      <Modal
        open={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        title="Filtrar por Período"
        footer={
          <>
            <Button variant="outlined" onClick={limparFiltroPeriodo} disabled={!dataInicioTemp && !dataFimTemp}>
              Limpar Filtros
            </Button>
            <Button variant="outlined" onClick={() => setIsFilterModalOpen(false)}>Cancelar</Button>
            <Button
              variant="primary"
              onClick={aplicarFiltroPeriodo}
              disabled={!dataInicioTemp && !dataFimTemp}
            >
              Confirmar Filtro
            </Button>
          </>
        }
      >
        <div className="grid grid-cols-1 gap-4 py-2 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <label className="text-body-sm font-semibold text-(--txt-secondary)">Data Inicial</label>
            <Input 
              type="date" 
              value={dataInicioTemp} 
              onChange={(e) => setDataInicioTemp(e.target.value)} 
              max={hoje}
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-body-sm font-semibold text-(--txt-secondary)">Data Final</label>
            <Input 
              type="date" 
              value={dataFimTemp} 
              onChange={(e) => setDataFimTemp(e.target.value)} 
              min={dataInicioTemp || undefined} 
              max={hoje}
            />
          </div>
        </div>
      </Modal>

    </div>
  )
}