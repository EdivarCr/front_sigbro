import { z } from "zod"

export const TipoClienteEnum = z.enum(["PESSOA_FISICA", "RESTAURANTE", "COMERCIO"])
export type TipoCliente = z.infer<typeof TipoClienteEnum>

// Schema para o Formulário de Criação/Edição
export const clienteSchema = z
  .object({
    name: z.string()
      .min(1, "Nome é obrigatório")
      .max(120, "Máximo de 120 caracteres"),
    tipo: TipoClienteEnum,
    identificador: z
    .string()
    .min(1, "Identificador é obrigatório (CPF/CNPJ)")
    .refine(
      (val) => {
        const apenasNumeros = val.replace(/\D/g, "")
        return apenasNumeros.length === 11 || apenasNumeros.length === 14
      },
      { message: "Deve ser um CPF (11 números) ou CNPJ (14 números) válido" }
    ),
    telefone: z
    .string()
    .min(1, "Telefone é obrigatório")
    .refine(
      (val) => {
        const apenasNumeros = val.replace(/\D/g, "")
        return apenasNumeros.length === 10 || apenasNumeros.length === 11
      },
      { message: "Telefone inválido. Lembre-se de incluir o DDD" }
    ),
    email: z
      .string()
      .min(1, "E-mail obrigatório")
      .check(z.email("Formato de e-mail inválido")),
    endereco: z.string()
      .min(1, "Endereço é obrigatório")
      .max(220, "Máximo de 220 caracteres"),
})

export type ClienteFormData = z.infer<typeof clienteSchema>