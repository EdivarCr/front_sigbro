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

export const resetPasswordSchema = z.object({
  access_token: z.string(),
  refresh_token: z.string(),
  new_password: z
    .string()
    .min(8, "A nova senha deve ter no mínimo 8 caracteres"),
  confirm_password: z.string() 
}).refine((data) => data.new_password === data.confirm_password, {
  message: "As senhas não coincidem",
  path: ["confirm_password"], // O erro aparecerá no campo de confirmação
})

export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>