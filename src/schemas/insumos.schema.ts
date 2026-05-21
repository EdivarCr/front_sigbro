import { z } from "zod"

export const insumoSchema = z.object({
  nome: z.string()
    .min(2, "O nome deve ter pelo menos 2 caracteres")
    .max(120, "O nome não pode passar de 120 caracteres"),

  tipo: z.string().min(1, "Selecione um tipo"),

  unidade_de_medida: z.string().min(1, "Selecione uma unidade de medida"),

  estoque_minimo: z.number({
    error: "Informe um valor numérico válido",
  }).min(0, "O estoque mínimo não pode ser negativo"),
    
  quantidade_estoque: z.number().optional(),
  custo_unitario: z.number().optional(),
    
  ativo: z.boolean().default(true),
})

export type InsumoFormData = z.infer<typeof insumoSchema>