import apiClient from "./client";
import { 
  type ForgotFormData, 
  type ResetPasswordFormData 
} from "@/schemas/auth.schema";

// Dispara o e-mail de recuperação
export async function solicitarRecuperacaoSenha(data: ForgotFormData) {
  const response = await apiClient.post('/auth/forgot-password', {
    email: data.email,
    redirect_url: "http://localhost:5173/reset-password"
  });
  return response.data;
}

// Envia os tokens e a nova senha para o Back
export async function redefinirSenha(data: ResetPasswordFormData) {
  const { confirm_password, ...payload } = data;
  const response = await apiClient.post('/auth/reset-password', payload);
  return response.data;
}