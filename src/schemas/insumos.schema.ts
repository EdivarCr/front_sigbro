import { z } from "zod"

export const insumoSchema = z.object({
  nome: z.string()
    .min(2, "O nome deve ter pelo menos 2 caracteres")
    .max(120, "O nome não pode passar de 120 caracteres"),
  tipo: z.string().min(1, "Selecione um tipo"),
  unidade_de_medida: z.string().min(1, "Selecione uma unidade de medida"),
  quantidade_estoque: z.coerce
    .number()
    .min(0, "A quantidade em estoque não pode ser negativa")
    .default(0),
  estoque_minimo: z.coerce
    .number()
    .min(0, "O estoque mínimo não pode ser negativo")
    .default(0),
  custo_unitario: z.coerce
    .number()
    .min(0, "O custo unitário não pode ser negativo")
    .default(0),
  ativo: z.boolean().default(true),
})

export type InsumoFormData = z.infer<typeof insumoSchema>