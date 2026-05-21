import apiClient from "./client"

export interface EntradaInsumoCreate {
  insumo_id: number
  quantidade_comprada: number
  valor_total_pago: number
}

export interface EntradaInsumoResponse extends EntradaInsumoCreate {
  id: number
  criado_por_id: number
  data_entrada: string
}

export interface EntradaInsumoListResponse {
  entradaInsumo: EntradaInsumoResponse[]
  offset: number
  limit: number
}

export interface FilterEntradaInsumo {
  offset?: number
  limit?: number
  insumo_nome?: string
  insumo_tipo?: string
  insumo_ativo?: boolean
  data_entrada?: string
}

export async function registrarEntradaInsumo(data: EntradaInsumoCreate) {
  const response = await apiClient.post<EntradaInsumoResponse>("/entrada_insumo/", data)
  return response.data
}

export async function listarEntradas(filtros?: FilterEntradaInsumo) {
  const response = await apiClient.get<EntradaInsumoListResponse>("/entrada_insumo/pesquisa", {
    params: filtros
  })
  return response.data
}

// Deleta (estorna) uma entrada de insumo
export async function estornarEntrada(id: number) {
  const response = await apiClient.delete(`/entrada_insumo/${id}`)
  return response.data
}