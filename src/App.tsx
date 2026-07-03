import { RouterProvider } from "react-router-dom"
import { AuthProvider } from "@/context/AuthContext"
import { FilterProvider } from "@/context/FilterContext"
import { router } from "@/routes"

/**
 * App — Ponto de entrada estrutural da aplicação.
 *
 * Estrutura de providers:
 * AuthProvider → FilterProvider → RouterProvider
 */
export default function App() {
  return (
    <AuthProvider>
      <FilterProvider>
        <RouterProvider router={router} />
      </FilterProvider>
    </AuthProvider>
  )
}