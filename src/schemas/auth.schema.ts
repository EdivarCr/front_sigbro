import { z } from "zod"

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "E-mail obrigatório")
    .check(z.email("Formato de e-mail inválido")),
  senha: z.string().min(1, "Senha obrigatória").min(8, "Mínimo 8 caracteres"),
})

export type LoginFormData = z.infer<typeof loginSchema>

export const forgotSchema = z.object({
  email: z
    .string()
    .min(1, "E-mail obrigatório")
    .check(z.email("Formato de e-mail inválido")),
})

export type ForgotFormData = z.infer<typeof forgotSchema>
