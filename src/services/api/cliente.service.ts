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
  costumers: Cliente[]
  offset: number
  limit: number
}

export interface FilterCliente {
  offset?: number
  limit?: number
  name?: string
  tipo?: string
}

export async function listarClientes(filtros?: FilterCliente) {
  const isPesquisa = filtros?.name || filtros?.tipo
  const url = isPesquisa ? "/clientes/pesquisa" : "/clientes/"

  const response = await apiClient.get<ClienteListResponse>(url, {
    params: filtros
  })
  return response.data
}

export async function obterClientePorId(id: number) {
  const response = await apiClient.get<Cliente>(`/clientes/${id}`)
  return response.data
}

export async function criarCliente(data: any) {
  const payload: ClienteCreate = {
    name: data.name,
    tipo: data.tipo,
    identificador: data.identificador,
    telefone: data.telefone,
    email: data.email,
    endereco: data.endereco
  }
  
  const response = await apiClient.post<Cliente>("/clientes/", payload)
  return response.data
}

export async function atualizarCliente(id: number, data: ClienteUpdate) {
  const response = await apiClient.patch<Cliente>(`/clientes/${id}`, data)
  return response.data
}

export async function removerCliente(id: number) {
  // TODO: O back-end ainda precisa implementar o DELETE /clientes/{client_id}
  const response = await apiClient.delete(`/clientes/${id}`)
  return response.data
}

export const clienteService = {
  listarClientes,
  obterClientePorId,
  criarCliente,
  atualizarCliente,
  removerCliente
}