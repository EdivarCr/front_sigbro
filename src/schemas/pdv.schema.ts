import { z } from "zod"

export const pdvSchema = z.object({
  id_cliente: z.number({
    error: "Selecione um cliente válido",
  }).min(1, "Obrigatório selecionar um cliente vinculado"),
  name: z.string()
    .min(2, "O nome deve ter pelo menos 2 caracteres")
    .max(120, "O nome não pode passar de 120 caracteres"),
  tipo_zona: z.string().min(1, "Selecione uma zona"),
  endereco: z.string()
    .min(1, "O endereço é obrigatório")
    .max(120, "O endereço não pode passar de 120 caracteres"),

  telefone: z.string().optional(),
  instagram: z.string().max(50, "Máximo 50 caracteres").optional(),
  google_maps_url: z.string().max(500, "URL muito longa").optional(),
  latitude: z.string().max(20).optional(),
  longitude: z.string().max(20).optional(),
  
  ativo: z.boolean().default(true),
})

export type PDVFormData = z.infer<typeof pdvSchema>