import { useState, useMemo } from "react"
import { useFilter } from "@/context/FilterContext"
import { Breadcrumb } from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table } from "@/components/ui/table"
import { Modal } from "@/components/ui/modal"
import { 
  CalendarBlankIcon, 
  ArrowCounterClockwiseIcon, 
  FileTextIcon,
  MagnifyingGlassIcon,
} from "@phosphor-icons/react"
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip,
  Legend,
  PieChart, 
  Pie, 
  Cell, 
  Label,
  LabelList
} from "recharts"

import { exportarLucratividadeParaPDF } from "@/lib/relatorioLucratividade"

interface LucratividadeProduto {
  id: number
  nome: string
  receita: number
  custo: number
  lucro: number
  margem: string
  data: string
  tipo: "Atacado" | "Varejo"
}

export default function DashboardLucratividadePage() {
  const [viewMode, setViewMode] = useState<"tabela" | "grafico">("grafico")
  const [search, setSearch] = useState("")

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
  
  const [dataInicioTemp, setDataInicioTemp] = useState<string>(dataInicio)
  const [dataFimTemp, setDataFimTemp] = useState<string>(dataFim)

  const isFiltroAtivo = useMemo(() => {
    return dataInicio !== "" || dataFim !== ""
  }, [dataInicio, dataFim])

  // MOCK DATA (Com datas incluídas)
  const produtosData: LucratividadeProduto[] = useMemo(() => [
    { id: 1, nome: "Mormaço", receita: 4500, custo: 1850, lucro: 2650, margem: "58,89%", data: "2026-06-15", tipo: "Atacado" },
    { id: 2, nome: "Geleia de Morango & Pimenta", receita: 3200, custo: 1450, lucro: 1750, margem: "54,69%", data: "2026-06-10", tipo: "Varejo" },
    { id: 3, nome: "Fogo Eterno (Habanero)", receita: 5800, custo: 2100, lucro: 3700, margem: "63,79%", data: "2026-06-05", tipo: "Atacado" },
    { id: 4, nome: "Geleia de Abacaxi & Pimenta", receita: 2900, custo: 1250, lucro: 1650, margem: "56,90%", data: "2026-05-20", tipo: "Varejo" },
    { id: 5, nome: "Chipotle Defumado", receita: 4100, custo: 1900, lucro: 2200, margem: "53,66%", data: "2026-05-15", tipo: "Atacado" },
    { id: 6, nome: "Geleia de Pimenta Defumada", receita: 2550, custo: 1150, lucro: 1400, margem: "54,90%", data: "2026-05-10", tipo: "Varejo" },
    { id: 7, nome: "Jalapeño & F", receita: 3750, custo: 1400, lucro: 2350, margem: "62,66%", data: "2026-04-25", tipo: "Atacado" },
  ], [])

  // 4. ESTADOS DERIVADOS (CÁLCULOS E FILTRAGEM)
  // Filtro de Data
  const produtosFiltradosPorData = useMemo(() => {
    return produtosData.filter((item) => {
      if (!dataInicio && !dataFim) return true
      if (dataInicio && !dataFim) return item.data >= dataInicio
      if (!dataInicio && dataFim) return item.data <= dataFim
      return item.data >= dataInicio && item.data <= dataFim
    })
  }, [produtosData, dataInicio, dataFim])

  // Filtro de Busca (Texto) combinado com a Data para a Tabela
  const produtosParaTabela = useMemo(() => {
    return produtosFiltradosPorData.filter(p => 
      p.nome.toLowerCase().includes(search.toLowerCase())
    )
  }, [produtosFiltradosPorData, search])

  // KPIs calculados dinamicamente
  const kpis = useMemo(() => {
    if (produtosFiltradosPorData.length === 0) {
      return { lucroLiquido: 0, margemMedia: "0%", produtoMaisVendido: "-", produtoMaisRentavel: "-" }
    }

    const lucroTotal = produtosFiltradosPorData.reduce((acc, curr) => acc + curr.lucro, 0)
    const receitaTotal = produtosFiltradosPorData.reduce((acc, curr) => acc + curr.receita, 0)
    const margemMedia = receitaTotal > 0 ? ((lucroTotal / receitaTotal) * 100).toFixed(2) + "%" : "0%"
    
    const maisRentavel = [...produtosFiltradosPorData].sort((a, b) => b.lucro - a.lucro)[0]
    const maisVendido = [...produtosFiltradosPorData].sort((a, b) => b.receita - a.receita)[0] // Usando receita como proxy de venda no mock

    return {
      lucroLiquido: lucroTotal,
      margemMedia: margemMedia,
      produtoMaisVendido: maisVendido.nome,
      produtoMaisRentavel: maisRentavel.nome
    }
  }, [produtosFiltradosPorData])

  // Proporção calculada dinamicamente
  const proporcaoVendas = useMemo(() => {
    let atacado = 0
    let varejo = 0
    produtosFiltradosPorData.forEach((item) => {
      if (item.tipo === "Atacado") atacado += item.receita
      else varejo += item.receita
    })
    const total = atacado + varejo
    return [
      { name: "Atacado", value: atacado, percentage: total > 0 ? `${((atacado / total) * 100).toFixed(1)}%` : "0%", color: "#a4133c" },
      { name: "Varejo", value: varejo, percentage: total > 0 ? `${((varejo / total) * 100).toFixed(1)}%` : "0%", color: "#9e475e" },
    ]
  }, [produtosFiltradosPorData])

  const totalVendasGrafico = useMemo(() => proporcaoVendas.reduce((acc, curr) => acc + curr.value, 0), [proporcaoVendas])

  // 5. FUNÇÕES DE AÇÃO
  const formatarMoeda = (valor: number) => 
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(valor)

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
      setPeriodoTexto("Período Completo")
    }
    setIsFilterModalOpen(false)
  }

  const limparFiltroPeriodo = () => {
    limparFiltrosGlobal()
    setDataInicioTemp("")
    setDataFimTemp("")
    setIsFilterModalOpen(false)
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-(--bg-surface) border border-(--border-default) p-3 rounded-sm shadow-md text-sm z-50">
          <p className="font-bold text-(--txt-primary) mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-2 text-(--txt-secondary)">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
              <span>{entry.name}: {formatarMoeda(entry.value)}</span>
            </div>
          ))}
        </div>
      )
    }
    return null
  }

  return (
    <div className="flex h-full min-h-0 flex-col bg-(--bg-primary) font-sans">
      <Breadcrumb
        items={[
          { label: "Tela Inicial", to: "/" },
          { label: "Dashboard de Lucratividade" }
        ]}
      />
    
      <div className="flex flex-1 min-h-0 flex-col gap-(--spacing-md) overflow-hidden py-(--spacing-md)">
        <h1 className="text-h1 font-heading font-bold text-(--txt-primary)">Painel de Lucros</h1>
        
        <div className="flex flex-1 flex-col gap-(--spacing-lg) overflow-hidden">
          
          {/* Barra de Ações */}
          <div className="flex flex-wrap items-center gap-(--spacing-ms) shrink-0">
            <div className="flex items-center gap-1.5">
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

              {isFiltroAtivo && (
                <Button
                  variant="outlined"
                  size="md"
                  onClick={limparFiltroPeriodo}
                  title="Limpar filtros"
                  className="px-2.5 flex items-center gap-1"
                >
                  <ArrowCounterClockwiseIcon size={14} />
                  <span>Limpar Filtros</span>
                </Button>
              )}
            </div>

            <Button 
              variant="primary" 
              size="md"
              onClick={() => {
                exportarLucratividadeParaPDF({
                  dataInicio,
                  dataFim,
                  lucroLiquido: formatarMoeda(kpis.lucroLiquido),
                  margemMedia: kpis.margemMedia,
                  produtoMaisVendido: kpis.produtoMaisVendido,
                  produtoMaisRentavel: kpis.produtoMaisRentavel,
                  produtosData: produtosFiltradosPorData,
                  proporcaoVendas: proporcaoVendas
                })
              }}
            >
              <FileTextIcon />
              Gerar Relatório
            </Button>
          </div>

          <div className="flex-1 flex flex-col gap-(--spacing-lg) overflow-y-auto pr-2">
            
            {/* Cards de KPI */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-(--spacing-lg) shrink-0">
              <div className="flex flex-col justify-between rounded-(--radius-sm) border border-(--border-default)/15 bg-(--bg-surface) p-(--spacing-lg) shadow-(--shadow-md)">
                <span className="text-body-sm font-medium text-(--txt-secondary)">Lucro Líquido Total</span>
                <h2 className="text-h2 font-heading font-bold text-(--txt-primary) mt-1">{formatarMoeda(kpis.lucroLiquido)}</h2>
                <div className="flex items-center gap-1 text-(--txt-secondary) text-body-md mt-2">
                  <em>Dados do período</em>
                </div>
              </div>

              <div className="flex flex-col justify-between rounded-(--radius-sm) border border-(--border-default)/15 bg-(--bg-surface) p-(--spacing-lg) shadow-(--shadow-md)">
                <span className="text-body-sm font-medium text-(--txt-secondary)">Margem de Lucro Média</span>
                <h2 className="text-h2 font-heading font-bold text-(--txt-primary) mt-1">{kpis.margemMedia}</h2>
                <div className="flex items-center gap-1 text-(--txt-secondary) text-body-md mt-2">
                  <em>Rentabilidade global</em>
                </div>
              </div>

              <div className="flex flex-col justify-between rounded-(--radius-sm) border border-(--border-default)/15 bg-(--bg-surface) p-(--spacing-lg) shadow-(--shadow-md)">
                <span className="text-body-sm font-medium text-(--txt-secondary)">Produto de Maior Faturamento</span>
                <h2 className="text-h3 font-heading font-bold text-(--txt-primary) mt-1 truncate" title={kpis.produtoMaisVendido}>
                  {kpis.produtoMaisVendido}
                </h2>
                <div className="flex items-center gap-1 text-(--txt-secondary) text-body-md mt-2">
                  <em>Destaque em vendas</em>
                </div>
              </div>

              <div className="flex flex-col justify-between rounded-(--radius-sm) border border-(--border-default)/15 bg-(--bg-surface) p-(--spacing-lg) shadow-(--shadow-md)">
                <span className="text-body-sm font-medium text-(--txt-secondary)">Produto Mais Rentável</span>
                <h2 className="text-h3 font-heading font-bold text-(--txt-primary) mt-1 truncate" title={kpis.produtoMaisRentavel}>
                  {kpis.produtoMaisRentavel}
                </h2>
                <div className="flex items-center gap-1 text-(--txt-secondary) text-body-md mt-2">
                  <span>Maior margem de lucro</span>
                </div>
              </div>
            </div>

            {/* Toggle Tabs (Tabela / Gráfico) */}
            <div className="flex shrink-0">
              <div className="flex bg-(--bg-sidebar) p-1 rounded-full">
                <button
                  onClick={() => setViewMode("tabela")}
                  className={`px-4 py-1.5 text-body-sm font-semibold rounded-full transition-colors cursor-pointer ${
                    viewMode === "tabela" 
                      ? "bg-brand text-white shadow-sm" 
                      : "text-(--txt-secondary) hover:text-(--txt-primary)"
                  }`}
                >
                  Tabela
                </button>
                <button
                  onClick={() => setViewMode("grafico")}
                  className={`px-4 py-1.5 text-body-sm font-semibold rounded-full transition-colors cursor-pointer ${
                    viewMode === "grafico" 
                      ? "bg-brand text-white shadow-sm" 
                      : "text-(--txt-secondary) hover:text-(--txt-primary)"
                  }`}
                >
                  Gráfico
                </button>
              </div>
            </div>

            {/* Conteúdo Dinâmico das Abas */}
            <div className="flex flex-col pb-4 shrink-0">
              
              {viewMode === "grafico" && (
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-(--spacing-lg)">
                  
                  {/* Gráfico de Barras - Lucro Líquido por Produto  */}
                  <div className="xl:col-span-2 rounded-(--radius-sm) border border-(--border-default)/15 bg-(--bg-surface) p-(--spacing-lg) shadow-(--shadow-md) flex flex-col gap-(--spacing-md)">
                    <h4 className="text-body-md font-bold text-(--txt-primary)">Lucro Líquido por Produto</h4>
                    
                    <div className="w-full overflow-x-auto pb-4">
                      <div className="h-125 min-w-200">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={produtosFiltradosPorData}
                            margin={{ top: 20, right: 30, left: 0, bottom: 180 }}
                            barGap={2}
                            barCategoryGap="20%"
                          >
                            <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="var(--border-default)" strokeOpacity={0.3} />
                            <XAxis 
                              dataKey="nome" 
                              stroke="#4b5563" 
                              fontSize={11} 
                              tickMargin={35}
                              angle={-45}
                              textAnchor="end"
                              interval={0}
                            />
                            <YAxis stroke="#4b5563" fontSize={11} tickFormatter={(val) => val.toString()} />
                            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--bg-surface)', opacity: 0.4 }} />
                            
                            <Legend 
                              verticalAlign="bottom" 
                              height={36} 
                              iconType="square"
                              wrapperStyle={{ bottom: 10, left: 0 }}
                            />

                            <Bar dataKey="receita" name="Receita Bruta (R$)" fill="#a4133c" radius={[2, 2, 0, 0]}>
                              <LabelList dataKey="receita" position="top" fill="#4b5563" fontSize={10} />
                            </Bar>
                            <Bar dataKey="custo" name="Custo de Fabricação (R$)" fill="#8a7d82" radius={[2, 2, 0, 0]}>
                              <LabelList dataKey="custo" position="top" fill="#4b5563" fontSize={10} />
                            </Bar>
                            <Bar dataKey="lucro" name="Lucro Líquido (R$)" fill="#906c3e" radius={[2, 2, 0, 0]}>
                              <LabelList dataKey="lucro" position="top" fill="#4b5563" fontSize={10} />
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>

                  {/* Gráfico Donut */}
                  <div className="rounded-(--radius-sm) border border-(--border-default)/15 bg-(--bg-surface) p-(--spacing-lg) shadow-(--shadow-md) flex flex-col items-center justify-between gap-(--spacing-md)">
                    <h4 className="text-body-md font-bold text-(--txt-primary) self-start">Receita: Varejo x Atacado</h4>
                    
                    <div className="relative w-full h-52 flex items-center justify-center mt-4">
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
                              value={formatarMoeda(totalVendasGrafico).replace(",00", "")} 
                              position="center" 
                              className="fill-(--txt-primary) font-heading font-bold text-xl"
                            />
                          </Pie>
                          <Tooltip formatter={(value, name) => [formatarMoeda(value as number), name]} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>

                    <div className="flex flex-col gap-2 w-full text-body-xs font-medium px-2 mt-4">
                      <div className="flex justify-between items-center text-(--txt-primary)">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 bg-brand rounded-full"/>
                          <span>Atacado</span>
                        </div>
                        <span className="text-(--txt-secondary)">
                          {formatarMoeda(proporcaoVendas[0].value)} <strong className="text-brand">{proporcaoVendas[0].percentage}</strong>
                        </span>
                      </div>
                      
                      <div className="flex justify-between items-center text-(--txt-primary)">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 bg-[#9e475e] rounded-full"/>
                          <span>Varejo</span>
                        </div>
                        <span className="text-(--txt-secondary)">
                          {formatarMoeda(proporcaoVendas[1].value)} <strong className="text-[#9e475e]">{proporcaoVendas[1].percentage}</strong>
                        </span>
                      </div>
                    </div>
                  </div>

                </div>
              )}

              {viewMode === "tabela" && (
                <div className="flex flex-col gap-(--spacing-md)">
                  <div className="flex flex-col sm:flex-row gap-(--spacing-sm) justify-between mt-2">
                    <div className="flex-1 w-full">
                      <Input
                        type="text"
                        placeholder="Pesquisar produto no período selecionado..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full"
                        iconRight={<MagnifyingGlassIcon />}
                      />
                    </div>
                    {/*<Button variant="primary" size="lg" className="shrink-0">
                      Filtrar Produtos
                      <FadersIcon />
                    </Button>*/}
                  </div>

                  <Table
                    columns={[
                      { 
                        key: "nome", 
                        label: "Produto", 
                        render: (row) => <span>{row.nome}</span> 
                      },
                      { key: "receita", label: "Receita Bruta", render: (row) => formatarMoeda(row.receita) },
                      { key: "custo", label: "Custo de Fabricação", render: (row) => formatarMoeda(row.custo) },
                      { key: "lucro", label: "Lucro Líquido", render: (row) => formatarMoeda(row.lucro) },
                      { 
                        key: "margem", 
                        label: "Margem de Lucro",
                        render: (row) => <span className="text-(--color-green) font-semibold">{row.margem}</span>
                      },
                    ]}
                    data={produtosParaTabela}
                    pageSize={5}
                    emptyValue="Nenhum produto encontrado neste período."
                  />
                </div>
              )}

            </div>
          </div>
        </div>
      </div>

      {/* Modal: Filtrar por Período */}
      <Modal
        open={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        title="Filtrar Lucratividade por Período"
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