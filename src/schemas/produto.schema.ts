import * as z from "zod"

export const produtoInsumoSchema = z.object({
  insumo_id: z.number({ 
    error: "Selecione um insumo" 
  }),
  quantidade_necessaria: z.number({ 
    error: "Informe a quantidade",
  }).positive("A quantidade deve ser maior que zero")
})

export const produtoSchema = z.object({
  nome: z.string()
    .min(1, "O nome é obrigatório")
    .max(120, "Máximo de 120 caracteres"),
  descricao: z.string()
    .min(1, "A descrição (ingredientes) é obrigatória")
    .max(300, "Máximo de 300 caracteres"),
  tipo: z.string().min(1, "Selecione uma categoria"),
  
  preco_varejo: z.coerce.number()
    .positive("O preço deve ser maior que zero"),
  preco_atacado: z.coerce.number()
    .positive("O preço deve ser maior que zero"),

  nivel_picancia: z.coerce.number()
    .min(0, "Mínimo 0")
    .max(10, "Máximo 10")
    .optional(),
  alergenicos: z.string()
    .max(255, "Máximo de 255 caracteres")
    .optional()
    .or(z.literal("")),
  tem_carolina_reaper: z.boolean().default(false),

  estoque_minimo: z.coerce.number()
    .int()
    .min(10, "O estoque mínimo deve ser de pelo menos 10 unidades")
    .optional(),
  validade_meses: z.coerce.number()
    .int()
    .min(0, "Validade inválida")
    .optional(),
  unidades_por_caixa: z.coerce.number()
    .int()
    .min(1, "Mínimo 1 unidade"),
  peso_gramas: z.coerce.number()
    .gt(0, "Volume inválido: deve ser maior que zero"),

  receita: z.array(produtoInsumoSchema)
    .min(1, "A receita deve ter pelo menos um insumo cadastrado"),
  
  insumo_id_temp: z.number().optional(),
  quantidade_necessaria_temp: z.coerce.number()
    .positive("A quantidade deve ser maior que zero")
    .optional(),

  image: z.any().nullable().optional(),
  ativo: z.boolean().default(true)
})

export type ProdutoInsumoFormData = z.infer<typeof produtoInsumoSchema>
export type ProdutoFormData = z.infer<typeof produtoSchema>