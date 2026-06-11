import apiClient from "./client"

export type TipoZona = "ZONA_SUL" | "ZONA_NORTE" | "ZONA_LESTE" | "ZONA_OESTE"

export interface PontoDeVenda {
  id: number
  id_cliente: number
  name: string
  tipo_zona: TipoZona
  endereco: string
  telefone: string | null
  instagram: string | null
  google_maps_url: string | null
  latitude: string | null
  longitude: string | null
  ultima_reposicao: string | null
  ativo: boolean
  criado_em: string
  atualizado_em: string
}

export interface PontoDeVendaCreate {
  id_cliente: number
  name: string
  tipo_zona: TipoZona
  endereco: string
  telefone?: string | null
  instagram?: string | null
  google_maps_url?: string | null
  latitude?: string | null
  longitude?: string | null
}

export interface PontoDeVendaUpdate {
  name?: string
  tipo_zona?: TipoZona
  endereco?: string
  telefone?: string | null
  instagram?: string | null
  google_maps_url?: string | null
  latitude?: string | null
  longitude?: string | null
  ativo?: boolean
}

export interface PontoDeVendaListResponse {
  pdvs: PontoDeVenda[]
  offset: number
  limit: number
}

export interface FilterPontoDeVenda {
  id_cliente?: number
  offset?: number
  limit?: number
  name?: string
  tipo_zona?: string
  ativo?: boolean
}

export async function listarPDVs(filtros?: FilterPontoDeVenda): Promise<PontoDeVenda[]> {
  const isPesquisa = !!(
    filtros?.name || 
    filtros?.tipo_zona || 
    typeof filtros?.ativo === "boolean" || 
    filtros?.id_cliente
  )

  const url = isPesquisa ? "/pvd/pesquisa" : "/pvd/"
  
  const response = await apiClient.get<any>(url, {
    params: filtros
  })

  return response.data.pvds || []
}

export async function obterPDVPorId(id: number) {
  const response = await apiClient.get<PontoDeVenda>(`/pvd/${id}`)
  return response.data
}

export async function criarPDV(data: any) {
  const payload: PontoDeVendaCreate = {
    id_cliente: data.id_cliente,
    name: data.name,
    tipo_zona: data.tipo_zona,
    endereco: data.endereco,
    telefone: data.telefone || null,
    instagram: data.instagram || null,
    google_maps_url: data.google_maps_url || null,
    latitude: data.latitude || null,
    longitude: data.longitude || null
  }
  
  const response = await apiClient.post<PontoDeVenda>("/pvd/", payload)
  return response.data
}

export async function atualizarPDV(id: number, data: PontoDeVendaUpdate) {
  const response = await apiClient.patch<PontoDeVenda>(`/pvd/${id}`, data)
  return response.data
}

// Soft delete
export async function inativarPDV(id: number) {
  const response = await apiClient.patch<PontoDeVenda>(`/pvd/${id}`, {
    ativo: false
  })
  return response.data
}

export const pdvService = {
  listarPDVs,
  obterPDVPorId,
  criarPDV,
  atualizarPDV,
  inativarPDV
}