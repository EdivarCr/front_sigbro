import { z } from "zod"

export const cadastroUsuarioSchema = z
  .object({
    nome: z.string().min(1, "Nome obrigatório"),
    email: z
      .string()
      .min(1, "E-mail obrigatório")
      .check(z.email("Formato de e-mail inválido")),
    senha: z.string().min(1, "Senha obrigatória").min(8, "Mínimo 8 caracteres"),
    confirmarSenha: z.string().min(1, "Confirmação obrigatória"),
  })
  .refine((data) => data.senha === data.confirmarSenha, {
    message: "As senhas não coincidem",
    path: ["confirmarSenha"],
  })

export const editarUsuarioSchema = z
  .object({
    nome: z.string().min(1, "Nome obrigatório"),
    email: z
      .string()
      .min(1, "E-mail obrigatório")
      .check(z.email("Formato de e-mail inválido")),
    senha: z.string().min(1, "Senha obrigatória").min(8, "Mínimo 8 caracteres"),
    confirmarSenha: z.string().min(1, "Confirmação obrigatória"),
  })
  .refine((data) => data.senha === data.confirmarSenha, {
    message: "As senhas não coincidem",
    path: ["confirmarSenha"],
  })

export const removerUsuarioSchema = z.object({
  senha: z.string().min(1, "Senha obrigatória").min(8, "Mínimo 8 caracteres"),
})

export type CadastroUsuarioFormData = z.infer<typeof cadastroUsuarioSchema>
export type EditarUsuarioFormData = z.infer<typeof editarUsuarioSchema>
export type RemoverUsuarioFormData = z.infer<typeof removerUsuarioSchema>
