import { z } from "zod"

export const FormaPagamentoEnum = z.enum(["PIX", "DINHEIRO", "CARTAO_CREDITO", "CARTAO_DEBITO", "BOLETO"])
export const StatusPagamentoEnum = z.enum(["PAGO", "PENDENTE", "CANCELADO"])
export const TipoVendaEnum = z.enum(["ATACADO", "VAREJO"])
export const TipoContaDestinoEnum = z.enum(["INTER", "MAQUININHA_TON", "DINHEIRO"])
export const UnidadeMedidaEnum = z.enum(["kg", "g", "l", "ml", "un"])

export type FormaPagamento = z.infer<typeof FormaPagamentoEnum>
export type StatusPagamento = z.infer<typeof StatusPagamentoEnum>
export type TipoVenda = z.infer<typeof TipoVendaEnum>
export type TipoContaDestino = z.infer<typeof TipoContaDestinoEnum>
export type UnidadeMedida = z.infer<typeof UnidadeMedidaEnum>

export const itemVendaSchema = z.object({
  produto_id: z.number({ error: "O produto é obrigatório" }),
  quantidade: z.number().min(1, "A quantidade mínima é 1").default(1),
  preco_unitario: z.number().min(0, "O preço unitário não pode ser negativo"),
  subtotal: z.number().min(0, "O subtotal não pode ser negativo"),
  unidade_medida: UnidadeMedidaEnum.default("un"),
})

export const vendaSchema = z.object({
  cliente_id: z.number().nullable().optional(),
  pvd_id: z.number().nullable().optional(),
  
  tipo_venda: TipoVendaEnum.default("ATACADO"),
  forma_pagamento: FormaPagamentoEnum.nullable().optional(),
  status_pagamento: StatusPagamentoEnum.default("PAGO"),
  tipo_conta_destino: TipoContaDestinoEnum.nullable().optional(),
  
  valor_subtotal: z.number().min(0, "Subtotal inválido"),
  valor_desconto: z.number().min(0).default(0),
  valor_total: z.number().min(0, "Total inválido"),
  
  data_venda: z.string().or(z.date()).optional(),
  data_pagamento: z.string().or(z.date()).nullable().optional(),
  
  itens: z.array(itemVendaSchema).min(1, "A venda deve conter pelo menos um item"),
})

export type ItemVendaFormData = z.infer<typeof itemVendaSchema>
export type VendaFormData = z.infer<typeof vendaSchema>