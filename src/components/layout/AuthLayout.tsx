import { Outlet } from 'react-router-dom'

/**
 * Layout para telas de autenticação (Login).
 * Sem header, sem padding — tela totalmente livre.
 */
export function AuthLayout() {
  return <Outlet />
}