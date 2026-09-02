import { z } from "zod"

export const TipoZonaEnum = z.enum(["ZONA_SUL", "ZONA_NORTE", "ZONA_LESTE", "ZONA_OESTE"])
export type TipoZona = z.infer<typeof TipoZonaEnum>

export const pdvSchema = z.object({
  id_cliente: z.number({
    error: "Selecione um cliente válido",
  }).positive("Obrigatório selecionar um cliente vinculado"),

  name: z.string()
    .min(2, "O nome deve ter pelo menos 2 caracteres")
    .max(120, "O nome não pode passar de 120 caracteres"),

  tipo_zona: TipoZonaEnum,

  endereco: z.string()
    .min(1, "O endereço é obrigatório")
    .max(120, "O endereço não pode passar de 120 caracteres"),

  telefone: z
    .string()
    .optional()
    .refine(
      (val) => {
        if (!val || val.trim() === "") return true;
        const apenasNumeros = val.replace(/\D/g, "");
        return apenasNumeros.length === 10 || apenasNumeros.length === 11;
      },
      { message: "Telefone inválido. Lembre-se de incluir o DDD (10 ou 11 números)" }
    ),

  instagram: z
    .string()
    .max(50, "Máximo 50 caracteres")
    .optional()
    .transform((val) => (val?.trim() === "" ? undefined : val)), // Transforma "" em undefined para o back

  google_maps_url: z
    .string()
    .max(500, "URL muito longa")
    .optional()
    .refine(
      (val) => {
        if (!val || val.trim() === "") return true;
        // Validação simples para ver se o formato é de uma URL válida
        return val.startsWith("http://") || val.startsWith("https://");
      },
      { message: "Insira uma URL válida (ex: https://maps.google...)" }
    ),

  // Latitude e Longitude geralmente vêm como string da API do Maps, a trava de tamanho está ótima
  latitude: z.string().max(20).optional().transform((val) => val === "" ? undefined : val),
  longitude: z.string().max(20).optional().transform((val) => val === "" ? undefined : val),
  
  ativo: z.boolean().default(true),
})

export type PDVFormData = z.infer<typeof pdvSchema>