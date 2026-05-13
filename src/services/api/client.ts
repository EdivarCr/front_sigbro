import axios from "axios"
import { supabase } from "@/services/supabase/client"

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
})

// Interceptor: injeta o token de autenticação do Supabase em cada request
apiClient.interceptors.request.use(async (config) => {
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (session?.access_token) {
    config.headers.Authorization = `Bearer ${session.access_token}`
  }

  return config
})

// Interceptor: tratamento centralizado de erros
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // TODO: implementar tratamento global (ex: redirect 401, toast de erro)
    console.error("[API Error]", error.response?.status, error.message)
    return Promise.reject(error)
  }
)

export default apiClient
