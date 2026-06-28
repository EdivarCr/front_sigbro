import { useState } from "react"
import { Breadcrumb } from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table } from "@/components/ui/table"
import { 
  CalendarBlankIcon, 
  ArrowCounterClockwiseIcon, 
  FileTextIcon,
  TrendUpIcon,
  MagnifyingGlassIcon,
  FadersIcon
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

interface LucratividadeProduto {
  id: number
  nome: string
  receita: number
  custo: number
  lucro: number
  margem: string
}

export default function DashboardLucratividadePage() {
  const [viewMode, setViewMode] = useState<"tabela" | "grafico">("grafico")
  const [search, setSearch] = useState("")

  const kpiData = {
    lucroLiquido: 1716.20,
    margemMedia: "89 vendas", 
    produtoMaisVendido: "Molho Habanero",
    produtoMaisRentavel: "Pinga do Diabo"
  }

  const produtosData: LucratividadeProduto[] = [
    { id: 1, nome: "Mormaço", receita: 4500, custo: 1850, lucro: 2650, margem: "58,89%" },
    { id: 2, nome: "Geleia de Morango & Pimenta", receita: 3200, custo: 1450, lucro: 1750, margem: "54,69%" },
    { id: 3, nome: "Fogo Eterno (Habanero)", receita: 5800, custo: 2100, lucro: 3700, margem: "63,79%" },
    { id: 4, nome: "Geleia de Abacaxi & Pimenta", receita: 2900, custo: 1250, lucro: 1650, margem: "56,90%" },
    { id: 5, nome: "Chipotle Defumado", receita: 4100, custo: 1900, lucro: 2200, margem: "53,66%" },
    { id: 6, nome: "Geleia de Pimenta Defumada", receita: 2550, custo: 1150, lucro: 1400, margem: "54,90%" },
    { id: 7, nome: "Jalapeño & F", receita: 3750, custo: 1400, lucro: 2350, margem: "62,66%" },
  ]

  const proporcaoVendas = [
    { name: "Atacado", value: 67, percentage: "75.28%", color: "#a4133c" },
    { name: "Varejo", value: 22, percentage: "24.72%", color: "#9e475e" },
  ]

  const totalVendas = proporcaoVendas.reduce((acc, curr) => acc + curr.value, 0)

  const formatarMoeda = (valor: number) => 
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(valor)

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
            <Button variant="primary" size="md">
              <CalendarBlankIcon />
              10 Out. - 29 Nov, 2025
            </Button>
            <Button variant="primary" size="md">
              <ArrowCounterClockwiseIcon />
              Restaurar Filtros
            </Button>
            <Button variant="primary" size="md">
              <FileTextIcon />
              Gerar Relatório
            </Button>
          </div>

          <div className="flex-1 flex flex-col gap-(--spacing-lg) overflow-y-auto pr-2">
            
            {/* Cards de KPI */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-(--spacing-lg) shrink-0">
              <div className="flex flex-col justify-between rounded-(--radius-sm) border border-(--border-default)/15 bg-(--bg-surface) p-(--spacing-lg) shadow-(--shadow-md)">
                <span className="text-body-sm font-medium text-(--txt-secondary)">Lucro Líquido Total</span>
                <h2 className="text-h2 font-heading font-bold text-(--txt-primary) mt-1">{formatarMoeda(kpiData.lucroLiquido)}</h2>
                <div className="flex items-center gap-1 text-(--color-green) text-body-xs mt-2 font-medium">
                  <TrendUpIcon size={14} />
                  <span>+3% em relação ao mês passado</span>
                </div>
              </div>

              <div className="flex flex-col justify-between rounded-(--radius-sm) border border-(--border-default)/15 bg-(--bg-surface) p-(--spacing-lg) shadow-(--shadow-md)">
                <span className="text-body-sm font-medium text-(--txt-secondary)">Margem de Lucro Média</span>
                <h2 className="text-h2 font-heading font-bold text-(--txt-primary) mt-1">{kpiData.margemMedia}</h2>
                <div className="flex items-center gap-1 text-(--color-green) text-body-xs mt-2 font-medium">
                  <TrendUpIcon size={14} />
                  <span>+1% em relação ao mês passado</span>
                </div>
              </div>

              <div className="flex flex-col justify-between rounded-(--radius-sm) border border-(--border-default)/15 bg-(--bg-surface) p-(--spacing-lg) shadow-(--shadow-md)">
                <span className="text-body-sm font-medium text-(--txt-secondary)">Produto Mais Vendido</span>
                <h2 className="text-h3 font-heading font-bold text-(--txt-primary) mt-1">{kpiData.produtoMaisVendido}</h2>
                <div className="flex items-center gap-1 text-(--color-green) text-body-xs mt-2 font-medium">
                  <TrendUpIcon size={14} />
                  <span>20 vendas realizadas</span>
                </div>
              </div>

              <div className="flex flex-col justify-between rounded-(--radius-sm) border border-(--border-default)/15 bg-(--bg-surface) p-(--spacing-lg) shadow-(--shadow-md)">
                <span className="text-body-sm font-medium text-(--txt-secondary)">Produto Mais Rentável</span>
                <h2 className="text-h3 font-heading font-bold text-(--txt-primary) mt-1">{kpiData.produtoMaisRentavel}</h2>
                <div className="flex items-center gap-1 text-(--color-green) text-body-xs mt-2 font-medium">
                  <TrendUpIcon size={14} />
                  <span>Lucro de R$ 22,50 por frasco.</span>
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
                  
                  {/* Gráfico de Barras - Lucro Líquido por Produto (Agora em Card) */}
                  <div className="xl:col-span-2 rounded-(--radius-sm) border border-(--border-default)/15 bg-(--bg-surface) p-(--spacing-lg) shadow-(--shadow-md) flex flex-col gap-(--spacing-md)">
                    <h4 className="text-body-md font-bold text-(--txt-primary)">Lucro Líquido por Produto</h4>
                    
                    <div className="w-full overflow-x-auto pb-4">
                      <div className="h-125 min-w-200">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={produtosData}
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
                    <h4 className="text-body-md font-bold text-(--txt-primary) self-start">Proporção Varejo x Atacado</h4>
                    
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
                              value={totalVendas} 
                              position="center" 
                              className="fill-(--txt-primary) font-heading font-bold text-3xl"
                            />
                          </Pie>
                          <Tooltip formatter={(value, name) => [`${value} vendas`, name]} />
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
                          {proporcaoVendas[0].value} <strong className="text-brand">{proporcaoVendas[0].percentage}</strong>
                        </span>
                      </div>
                      
                      <div className="flex justify-between items-center text-(--txt-primary)">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 bg-[#9e475e] rounded-full"/>
                          <span>Varejo</span>
                        </div>
                        <span className="text-(--txt-secondary)">
                          {proporcaoVendas[1].value} <strong className="text-[#9e475e]">{proporcaoVendas[1].percentage}</strong>
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
                        placeholder="Nome do Produto"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full"
                        iconRight={<MagnifyingGlassIcon />}
                      />
                    </div>
                    <Button variant="primary" size="lg" className="shrink-0">
                      Filtrar Produtos
                      <FadersIcon />
                    </Button>
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
                    data={produtosData.filter(p => p.nome.toLowerCase().includes(search.toLowerCase()))}
                    pageSize={5}
                    emptyValue="Nenhum produto encontrado."
                  />
                </div>
              )}

            </div>
          </div>
        </div>
      </div>
    </div>
  )
}