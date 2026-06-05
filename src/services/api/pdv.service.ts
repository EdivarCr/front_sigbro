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
  offset?: number
  limit?: number
  name?: string
  tipo_zona?: string
  ativo?: boolean
}