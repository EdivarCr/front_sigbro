import apiClient from "./client"

export type TipoInsumo = "materia_prima" | "embalagem" 
export type UnidadeMedida = "kg" | "g" | "l" | "ml" | "un"

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

// O back só aceita estes campos na criação (InsumoBase)
export interface InsumoCreate {
  nome: string
  tipo: TipoInsumo
  unidade_de_medida: UnidadeMedida
  estoque_minimo: number
}

// Update permite campos opcionais, incluindo a mudança de status (ativo)
export interface InsumoUpdate {
  nome?: string
  tipo?: TipoInsumo
  estoque_minimo?: number
  ativo?: boolean
}

export interface InsumoListResponse {
  insumos: Insumo[]
  offset: number
  limit: number
}

export interface FilterInsumo {
  offset?: number
  limit?: number
  nome?: string
  tipo?: string
  ativo?: boolean
}

export async function listarInsumos(filtros?: FilterInsumo) {
  // Se tem filtro (além de offset/limit), usa a rota de pesquisa
  const isPesquisa = filtros?.nome || filtros?.tipo || typeof filtros?.ativo === "boolean"
  const url = isPesquisa ? "/insumos/pesquisa" : "/insumos/"

  const response = await apiClient.get<InsumoListResponse>(url, {
    params: filtros
  })
  return response.data
}

export async function obterInsumoPorId(id: number) {
  const response = await apiClient.get<Insumo>(`/insumos/${id}`)
  return response.data
}

export async function criarInsumo(data: any) {
  const payload: InsumoCreate = {
    nome: data.nome,
    tipo: data.tipo,
    unidade_de_medida: data.unidade_de_medida,
    estoque_minimo: data.estoque_minimo
  }
  
  const response = await apiClient.post<Insumo>("/insumos/", payload)
  return response.data
}

export async function atualizarInsumo(id: number, data: InsumoUpdate) {
  const response = await apiClient.patch<Insumo>(`/insumos/${id}`, data)
  return response.data
}

// Delete usando a rota de patch, para mudar apenas o status de insumo
export async function removerInsumo(id: number) {
  const response = await apiClient.patch<Insumo>(`/insumos/${id}`, {
    ativo: false
  })
  return response.data
}