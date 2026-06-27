import apiClient from "./client"
import { 
  type FormaPagamento, 
  type StatusPagamento, 
  type TipoVenda, 
  type UnidadeMedida 
} from "@/schemas/vendas.schema"

export interface ItemVenda {
  id: number
  venda_id: number
  produto_id: number
  preco_unitario: number
  subtotal: number
  quantidade: number
  unidade_medida: UnidadeMedida
}

export interface Venda {
  id: number
  forma_pagamento: FormaPagamento | null
  status_pagamento: StatusPagamento
  cliente_id: number | null
  pvd_id: number | null
  tipo_venda: TipoVenda
  valor_total: number
  valor_subtotal: number
  valor_desconto: number
  data_venda: string
  data_pagamento: string | null
  deleted_at: string | null
  itens?: ItemVenda[]
}

export interface ItemVendaCreate {
  produto_id: number
  preco_unitario: number
  subtotal: number
  quantidade?: number
  unidade_medida?: UnidadeMedida
}

export interface VendaCreate {
  forma_pagamento?: FormaPagamento | null
  status_pagamento?: StatusPagamento
  cliente_id?: number | null
  pvd_id?: number | null
  tipo_venda?: TipoVenda
  valor_total?: number
  valor_subtotal?: number
  valor_desconto?: number
  data_venda?: string | Date
  data_pagamento?: string | Date | null
  itens: ItemVendaCreate[]
}

export interface VendaUpdate {
  forma_pagamento?: FormaPagamento | null
  status_pagamento?: StatusPagamento
  cliente_id?: number | null
  pvd_id?: number | null
  tipo_venda?: TipoVenda
  valor_total?: number
  valor_subtotal?: number
  valor_desconto?: number
  data_pagamento?: string | Date | null
}

export interface VendaListResponse {
  itens: Venda[]
  offset: number
  limit: number
}

export interface FilterVenda {
  offset?: number
  limit?: number
  data_inicio?: string | null  
  data_fim?: string | null 
  status_pagamento?: StatusPagamento | null
  pvd_id?: number | null
  cliente_id?: number | null
  forma_pagamento?: FormaPagamento | null
  tipo_venda?: TipoVenda | null
}

// Funções da API
export async function listarVendas(filtros?: FilterVenda) {
  const response = await apiClient.get<VendaListResponse>("/vendas/", {
    params: filtros
  })
  return response.data
}

export async function obterVendaPorId(id: number) {
  const response = await apiClient.get<Venda>(`/vendas/${id}`)
  return response.data
}

export async function criarVenda(data: any) {
  const payload: VendaCreate = {
    cliente_id: data.cliente_id,
    pvd_id: data.pvd_id,
    tipo_venda: data.tipo_venda,
    forma_pagamento: data.forma_pagamento,
    status_pagamento: data.status_pagamento,
    valor_subtotal: data.valor_subtotal,
    valor_desconto: data.valor_desconto,
    valor_total: data.valor_total,
    data_venda: data.data_venda,
    data_pagamento: data.data_pagamento,
    itens: data.itens,
  }
  
  const response = await apiClient.post<Venda>("/vendas/", payload)
  return response.data
}

export async function atualizarVenda(id: number, data: VendaUpdate) {
  const response = await apiClient.put<Venda>(`/vendas/${id}`, data)
  return response.data
}

export const vendaService = {
  listarVendas,
  obterVendaPorId,
  criarVenda,
  atualizarVenda
}