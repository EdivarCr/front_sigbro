import apiClient from "./client"

export type StatusLote = "ATIVO" | "ESGOTADO" | "VENCIDO" | "CANCELADO"

export type TipoInsumo = "materia_prima" | "embalagem"

export interface InsumoEstoqueItem {
  id: number
  nome: string
  tipo: TipoInsumo
  unidade_de_medida: "kg" | "g" | "l" | "ml" | "un"
  quantidade_estoque: string | number
  estoque_minimo: string | number
  custo_unitario: string | number
  ativo: boolean
  criado_em: string
  atualizado_em: string
}

export interface InsumoEstoqueListResponse {
  insumos: InsumoEstoqueItem[]
  offset: number
  limit: number
}

export interface EntradaInsumoCreateRequest {
  insumo_id: number
  quantidade_comprada: number
  valor_total_pago: number
}

export interface EntradaInsumoResponse extends EntradaInsumoCreateRequest {
  id: number
  criado_por_id: number
  data_entrada: string
}

export interface ProducaoCreateRequest {
  produto_id: number
  quantidade: number
  validade?: string
}

export interface ProducaoUpdateRequest {
  quantidade?: number
  status?: StatusLote
  validade?: string
}

export interface ProducaoItem {
  id: number
  codigo_lote: string
  produto_id: number
  criado_por_id: number
  validade: string
  quantidade: number
  fabricacao: string
  custo_total: string | number
  custo_unitario: string | number
  status: StatusLote
  atualizado_em: string
}

export interface ProducaoListResponse {
  producao: ProducaoItem[]
  offset: number
  limit: number
}

export interface ProducaoFilters {
  offset?: number
  limit?: number
}

export interface InsumoFilters {
  offset?: number
  limit?: number
  nome?: string
  tipo?: string
  ativo?: boolean
}

export async function listarInsumosEstoque(filtros?: InsumoFilters): Promise<InsumoEstoqueListResponse> {
  const temPesquisa = Boolean(filtros?.nome || filtros?.tipo || typeof filtros?.ativo === "boolean")
  const url = temPesquisa ? "/insumos/pesquisa" : "/insumos/"

  const response = await apiClient.get<InsumoEstoqueListResponse>(url, {
    params: filtros,
  })

  return response.data
}

export async function registrarEntradaInsumo(
  data: EntradaInsumoCreateRequest
): Promise<EntradaInsumoResponse> {
  const response = await apiClient.post<EntradaInsumoResponse>("/entrada_insumo/", data)
  return response.data
}

export async function listarEstoque(filtros?: ProducaoFilters): Promise<ProducaoListResponse> {
  const response = await apiClient.get<ProducaoListResponse>("/producao/", {
    params: filtros,
  })

  return response.data
}

export async function criarEstoque(data: ProducaoCreateRequest): Promise<ProducaoItem> {
  const response = await apiClient.post<ProducaoItem>("/producao/", data)
  return response.data
}

export async function atualizarEstoque(
  id: number,
  data: ProducaoUpdateRequest
): Promise<ProducaoItem> {
  const response = await apiClient.patch<ProducaoItem>("/producao/", data, {
    params: { producao_id: id },
  })
  return response.data
}

export async function cancelarEstoque(id: number): Promise<ProducaoItem> {
  return atualizarEstoque(id, { status: "CANCELADO" })
}

export const estoqueService = {
  listarInsumosEstoque,
  registrarEntradaInsumo,
  listarEstoque,
  criarEstoque,
  atualizarEstoque,
  cancelarEstoque,
}