import apiClient from "./client"

// insumo.schema

export type TipoInsumo = "MP" | "EMBALAGEM" | "OUTRO" 
export type UnidadeMedida = "KG" | "G" | "L" | "ML" | "UN"

export interface Insumo {
  id: number
  nome: string
  tipo: TipoInsumo
  unidade_de_medida: UnidadeMedida
  quantidade_estoque: number
  estoque_minimo: number
  custo_unitario: number
  ativo: boolean
  criado_em: string
  atualizado_em: string
}

export type InsumoCreate = Omit<Insumo, "id" | "criado_em" | "atualizado_em">
export type InsumoUpdate = Partial<InsumoCreate>

export async function listarInsumos() {
  const response = await apiClient.get<Insumo[]>("/insumos")
  return response.data
}

export async function obterInsumoPorId(id: number) {
  const response = await apiClient.get<Insumo>(`/insumos/${id}`)
  return response.data
}

export async function criarInsumo(data: InsumoCreate) {
  const response = await apiClient.post<Insumo>("/insumos", data)
  return response.data
}

export async function atualizarInsumo(id: number, data: InsumoUpdate) {
  const response = await apiClient.put<Insumo>(`/insumos/${id}`, data)
  return response.data
}

export async function removerInsumo(id: number) {
  const response = await apiClient.delete<Insumo>(`/insumos/${id}`)
  return response.data
}