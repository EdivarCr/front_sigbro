import { z } from "zod"

export const producaoCreateSchema = z.object({
  produto_id: z.preprocess(
    (val) => Number(val),
    z.number().min(1, "Obrigatório selecionar um produto.")
  ),
  quantidade: z.preprocess(
    (val) => Number(val),
    z.number().int("Não pode ser fracionado.").min(1, "A quantidade deve ser maior que zero.")
  ),
  validade: z.string().min(1, "Informe a data de validade."), // ← adicionar
})

export const producaoEditSchema = z.object({
  quantidade: z.preprocess(
    (val) => Number(val),
    z.number().int("Não pode ser fracionado.").min(0, "A quantidade não pode ser negativa.")
  ),
  status: z.enum(["ATIVO", "ESGOTADO", "VENCIDO", "CANCELADO"]),
})

export type ProducaoCreateData = z.infer<typeof producaoCreateSchema>
export type ProducaoEditData = z.infer<typeof producaoEditSchema>