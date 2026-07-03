import { useState, useMemo, useEffect } from "react"
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
} from "recharts"

import { exportarLucratividadeParaPDF } from "@/lib/relatorioLucratividade"
import { dashboardService, type DashboardLucratividadeData } from "@/services/api/dashboards.service"
import { getHojeLocal } from "@/lib/utils"

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

  const hoje = getHojeLocal()

  const formatarDataBR = (dataStr: string) => {
    if (!dataStr) return ""
    const [ano, mes, dia] = dataStr.split("-")
    return `${dia}/${mes}/${ano}`
  }
  
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false)
  const [dataInicioTemp, setDataInicioTemp] = useState<string>(dataInicio)
  const [dataFimTemp, setDataFimTemp] = useState<string>(dataFim)

  const isFiltroAtivo = useMemo(() => dataInicio !== "" || dataFim !== "", [dataInicio, dataFim])

  // --- ESTADOS DA API REAL ---
  const [dadosLucratividade, setDadosLucratividade] = useState<DashboardLucratividadeData | null>(null)
  
  useEffect(() => {
    const carregarLucratividade = async () => {
      try {
        const res = await dashboardService.obterDashboardLucratividade({ data_inicio: dataInicio || null, data_fim: dataFim || null })
        setDadosLucratividade(res)
      } catch (error) {
        console.error("Erro ao carregar lucratividade:", error)
      }
    }
    carregarLucratividade()
  }, [dataInicio, dataFim])

  // --- KPIs E LISTAS TRATADAS (Blindadas contra NaN) ---
  const kpis = useMemo(() => {
    const ranking = dadosLucratividade?.ranking_produtos || []
    
    // O mais rentável é o que gerou maior lucro_total
    const maisRentavel = [...ranking].sort((a, b) => Number(b.lucro_total) - Number(a.lucro_total))[0]
    // O mais vendido é o que teve maior faturamento (receita) ou qtd
    const maisVendido = [...ranking].sort((a, b) => Number(b.faturamento_total) - Number(a.faturamento_total))[0]

    return {
      faturamentoTotal: Number(dadosLucratividade?.faturamento_total) || 0,
      custoTotal: Number(dadosLucratividade?.custo_total) || 0,
      lucroLiquido: Number(dadosLucratividade?.lucro_liquido_total) || 0,
      margemMedia: dadosLucratividade?.margem_media || 0,
      produtoMaisVendido: maisVendido ? maisVendido.nome_produto : "-",
      produtoMaisRentavel: maisRentavel ? maisRentavel.nome_produto : "-"
    }
  }, [dadosLucratividade])

  const produtosParaTabela = useMemo(() => {
    const ranking = dadosLucratividade?.ranking_produtos || []
    return ranking
      .filter(p => p.nome_produto.toLowerCase().includes(search.toLowerCase()))
      .map(p => ({ ...p, id: p.produto_id })) 
  }, [dadosLucratividade, search])

  // Gráfico Donut de Custo vs Lucro
  const proporcaoVendas = useMemo(() => {
    const dadosProporcao = dadosLucratividade?.proporcao_vendas || [] 
    
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
  }, [dadosLucratividade])

  // Mapeamento dos produtos pro gráfico de barras (convertendo Strings p/ Numbers)
  const dadosGraficoBarras = useMemo(() => {
    return (dadosLucratividade?.ranking_produtos || []).map(p => ({
      nome: p.nome_produto,
      receita: Number(p.faturamento_total) || 0,
      custo: Number(p.custo_total) || 0,
      lucro: Number(p.lucro_total) || 0,
      margem: Number(p.margem_lucro) || 0
    }))
  }, [dadosLucratividade])

  // --- FUNÇÕES DE AÇÃO ---
  const formatarMoeda = (valor: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(valor)

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
      <Breadcrumb items={[{ label: "Tela Inicial", to: "/" }, { label: "Dashboard de Lucratividade" }]} />
    
      <div className="flex flex-1 min-h-0 flex-col gap-(--spacing-md) overflow-hidden py-(--spacing-md)">
        <h1 className="text-h1 font-heading font-bold text-(--txt-primary)">Painel de Lucros</h1>
        
        <div className="flex flex-1 flex-col gap-(--spacing-lg) overflow-hidden">
          
          <div className="flex flex-wrap items-center gap-(--spacing-ms) shrink-0">
            <div className="flex items-center gap-1.5">
              <Button variant="primary" size="md" onClick={() => { setDataInicioTemp(dataInicio); setDataFimTemp(dataFim); setIsFilterModalOpen(true); }}>
                <CalendarBlankIcon /> {periodoTexto}
              </Button>

              {isFiltroAtivo && (
                <Button variant="outlined" size="md" onClick={limparFiltroPeriodo} title="Limpar filtros" className="px-2.5 flex items-center gap-1">
                  <ArrowCounterClockwiseIcon size={14} /> <span>Limpar Filtros</span>
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
                  margemMedia: kpis.margemMedia + "%",
                  produtoMaisVendido: kpis.produtoMaisVendido,
                  produtoMaisRentavel: kpis.produtoMaisRentavel,
                  produtosData: dadosGraficoBarras as any,
                  proporcaoVendas: proporcaoVendas
                })
              }}
            >
              <FileTextIcon /> Gerar Relatório
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
                <h2 className="text-h2 font-heading font-bold text-(--txt-primary) mt-1">{kpis.margemMedia}%</h2>
                <div className="flex items-center gap-1 text-(--txt-secondary) text-body-md mt-2">
                  <em>Rentabilidade global</em>
                </div>
              </div>

              <div className="flex flex-col justify-between rounded-(--radius-sm) border border-(--border-default)/15 bg-(--bg-surface) p-(--spacing-lg) shadow-(--shadow-md)">
                <span className="text-body-sm font-medium text-(--txt-secondary)">Maior Faturamento</span>
                <h2 className="text-h3 font-heading font-bold text-(--txt-primary) mt-1 truncate" title={kpis.produtoMaisVendido}>{kpis.produtoMaisVendido}</h2>
                <div className="flex items-center gap-1 text-(--txt-secondary) text-body-md mt-2">
                  <em>Destaque em vendas</em>
                </div>
              </div>

              <div className="flex flex-col justify-between rounded-(--radius-sm) border border-(--border-default)/15 bg-(--bg-surface) p-(--spacing-lg) shadow-(--shadow-md)">
                <span className="text-body-sm font-medium text-(--txt-secondary)">Produto Mais Rentável</span>
                <h2 className="text-h3 font-heading font-bold text-(--txt-primary) mt-1 truncate" title={kpis.produtoMaisRentavel}>{kpis.produtoMaisRentavel}</h2>
                <div className="flex items-center gap-1 text-(--txt-secondary) text-body-md mt-2">
                  <span>Maior margem líquida</span>
                </div>
              </div>
            </div>

            <div className="flex shrink-0">
              <div className="flex bg-(--bg-sidebar) p-1 rounded-full">
                <button onClick={() => setViewMode("tabela")} className={`px-4 py-1.5 text-body-sm font-semibold rounded-full transition-colors cursor-pointer ${viewMode === "tabela" ? "bg-brand text-white shadow-sm" : "text-(--txt-secondary) hover:text-(--txt-primary)"}`}>Tabela</button>
                <button onClick={() => setViewMode("grafico")} className={`px-4 py-1.5 text-body-sm font-semibold rounded-full transition-colors cursor-pointer ${viewMode === "grafico" ? "bg-brand text-white shadow-sm" : "text-(--txt-secondary) hover:text-(--txt-primary)"}`}>Gráfico</button>
              </div>
            </div>

            <div className="flex flex-col pb-4 shrink-0">
              {viewMode === "grafico" && (
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-(--spacing-lg)">
                  
                  <div className="xl:col-span-2 rounded-(--radius-sm) border border-(--border-default)/15 bg-(--bg-surface) p-(--spacing-lg) shadow-(--shadow-md) flex flex-col gap-(--spacing-md)">
                    <h4 className="text-body-md font-bold text-(--txt-primary)">Resultados por Produto</h4>
                    
                    <div className="w-full overflow-x-auto pb-4">
                      <div className="h-125 min-w-200">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={dadosGraficoBarras} margin={{ top: 20, right: 30, left: 0, bottom: 180 }} barGap={2} barCategoryGap="20%">
                            <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="var(--border-default)" strokeOpacity={0.3} />
                            <XAxis dataKey="nome" stroke="#4b5563" fontSize={11} tickMargin={35} angle={-45} textAnchor="end" interval={0} />
                            <YAxis stroke="#4b5563" fontSize={11} tickFormatter={(val) => `R$ ${val}`} />
                            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--bg-surface)', opacity: 0.4 }} />
                            <Legend verticalAlign="bottom" height={36} iconType="square" wrapperStyle={{ bottom: 10, left: 0 }} />
                            <Bar dataKey="receita" name="Receita Bruta (R$)" fill="#a4133c" radius={[2, 2, 0, 0]} />
                            <Bar dataKey="custo" name="Custo Operacional (R$)" fill="#8a7d82" radius={[2, 2, 0, 0]} />
                            <Bar dataKey="lucro" name="Lucro Líquido (R$)" fill="#906c3e" radius={[2, 2, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>

                  {/* Donut de Proporção de Vendas */}
                  <div className="flex flex-col items-center justify-between gap-(--spacing-md) rounded-(--radius-sm) border border-(--border-default)/15 bg-(--bg-surface) p-(--spacing-lg) shadow-(--shadow-md)">
                    <h4 className="text-body-md self-start font-bold text-(--txt-primary)">Proporção Varejo x Atacado</h4>

                    <div className="relative flex h-52 w-full items-center justify-center">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={proporcaoVendas} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={2} dataKey="value">
                            {proporcaoVendas.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                            <Label value={formatarMoeda(proporcaoVendas.reduce((sum, p) => sum + p.value, 0)).replace(",00", "")} position="center" className="font-heading fill-(--txt-primary) text-xl font-bold" />
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
              )}

              {viewMode === "tabela" && (
                <div className="flex flex-col gap-(--spacing-md)">
                  <div className="flex flex-col sm:flex-row gap-(--spacing-sm) justify-between mt-2">
                    <div className="flex-1 w-full">
                      <Input type="text" placeholder="Pesquisar produto no período selecionado..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full" iconRight={<MagnifyingGlassIcon />} />
                    </div>
                  </div>

                  <Table
                    columns={[
                      { key: "nome_produto", label: "Produto", render: (row) => <span>{row.nome_produto}</span> },
                      { key: "faturamento_total", label: "Receita Bruta", render: (row) => formatarMoeda(Number(row.faturamento_total)) },
                      { key: "custo_total", label: "Custos", render: (row) => formatarMoeda(Number(row.custo_total)) },
                      { key: "lucro_total", label: "Lucro Líquido", render: (row) => formatarMoeda(Number(row.lucro_total)) },
                      { key: "margem_lucro", label: "Margem de Lucro", render: (row) => <span className="text-(--color-green) font-semibold">{row.margem_lucro}%</span> },
                    ]}
                    data={produtosParaTabela}
                    pageSize={10}
                    emptyValue="Nenhum produto encontrado neste período."
                  />
                </div>
              )}

            </div>
          </div>
        </div>
      </div>

      <Modal open={isFilterModalOpen} onClose={() => setIsFilterModalOpen(false)} title="Filtrar Lucratividade por Período" footer={<><Button variant="outlined" onClick={limparFiltroPeriodo} disabled={!dataInicioTemp && !dataFimTemp}>Limpar Filtros</Button><Button variant="outlined" onClick={() => setIsFilterModalOpen(false)}>Cancelar</Button><Button variant="primary" onClick={aplicarFiltroPeriodo} disabled={!dataInicioTemp && !dataFimTemp}>Confirmar Filtro</Button></>}>
        <div className="grid grid-cols-1 gap-4 py-2 sm:grid-cols-2">
          <div className="flex flex-col gap-2"><label className="text-body-sm font-semibold text-(--txt-secondary)">Data Inicial</label><Input type="date" value={dataInicioTemp} onChange={(e) => setDataInicioTemp(e.target.value)} max={hoje} /></div>
          <div className="flex flex-col gap-2"><label className="text-body-sm font-semibold text-(--txt-secondary)">Data Final</label><Input type="date" value={dataFimTemp} onChange={(e) => setDataFimTemp(e.target.value)} min={dataInicioTemp || undefined} max={hoje} /></div>
        </div>
      </Modal>

    </div>
  )
}