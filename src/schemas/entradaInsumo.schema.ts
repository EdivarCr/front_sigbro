import { z } from "zod"

export const entradaInsumoSchema = z.object({
  quantidade_comprada: z.number({
    error: "Informe um valor numérico válido",
  }).min(0.001, "A quantidade deve ser maior que zero"),
  
  valor_total_pago: z.number({
    error: "Informe um valor numérico válido",
  }).min(0, "O valor não pode ser negativo"),
})

export type EntradaInsumoFormData = z.infer<typeof entradaInsumoSchema>