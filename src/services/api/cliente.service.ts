import apiClient from "./client"

export type TipoCliente = "PESSOA_FISICA" | "RESTAURANTE" | "COMERCIO"

export interface Cliente {
  id: number
  name: string
  tipo: TipoCliente
  identificador: string
  telefone: string
  email: string | null
  endereco: string
  total_compras: number
  quantidade_compras: number
  ultima_compra: string | null
}

export interface ClienteCreate {
  name: string
  tipo: TipoCliente
  identificador: string
  telefone: string
  email: string
  endereco: string
}

export interface ClienteUpdate {
  name?: string
  tipo?: TipoCliente
  identificador?: string
  telefone?: string
  email?: string
  endereco?: string
}

export interface ClienteListResponse {
  clientes: Cliente[]
  offset: number
  limit: number
}

export interface FilterCliente {
  offset?: number
  limit?: number
  name?: string
  tipo?: string
}