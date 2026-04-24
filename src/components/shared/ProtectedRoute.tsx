import { Navigate, Outlet } from "react-router-dom"
import { useAuth } from "@/context/AuthContext"

/**
 * Wrapper que protege rotas autenticadas.
 * Redireciona para /login se o usuário não estiver autenticado.
 */
export function ProtectedRoute() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-red-500 border-t-transparent" />
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}
