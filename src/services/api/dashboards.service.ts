import apiClient from "./client"

export interface VendaMensalKPI {
  mes: string
  faturamento: string | number // O back-end pode mandar como string devido ao Decimal
  quantidade_vendas: number
}

export interface ProporcaoKPI {
  tipo: string
  valor: string | number
}

export interface DashboardGeralData {
  total_faturado: string | number
  total_recebido: string | number
  total_pendente: string | number
  quantidade_vendas: number
  faturamento_por_mes: VendaMensalKPI[]
  proporcao_vendas: ProporcaoKPI[]
  produtos_mais_vendidos: ProdutoLucroKPI[]
}

export interface ProdutoLucroKPI {
  produto_id: number
  nome_produto: string
  quantidade_vendida: number
  faturamento_total: string | number
  custo_total: string | number
  lucro_total: string | number
  margem_lucro: number
}

export interface DashboardLucratividadeData {
  faturamento_total: string | number
  custo_total: string | number
  lucro_liquido_total: string | number
  margem_media: number
  ranking_produtos: ProdutoLucroKPI[]
  proporcao_vendas: ProporcaoKPI[]
}

export interface FilterDashboard {
  data_inicio?: string | null
  data_fim?: string | null
}


export async function obterDashboardGeral(filtros?: FilterDashboard) {
  const response = await apiClient.get<DashboardGeralData>("/dashboards/geral", {
    params: {
      data_inicio: filtros?.data_inicio || undefined,
      data_fim: filtros?.data_fim || undefined,
    }
  })
  return response.data
}

export async function obterDashboardLucratividade(filtros?: FilterDashboard) {
  const response = await apiClient.get<DashboardLucratividadeData>("/dashboards/lucratividade", {
    params: {
      data_inicio: filtros?.data_inicio || undefined,
      data_fim: filtros?.data_fim || undefined,
    }
  })
  return response.data
}

export const dashboardService = {
  obterDashboardGeral,
  obterDashboardLucratividade
}