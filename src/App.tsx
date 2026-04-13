import { RouterProvider } from 'react-router-dom'
import { AuthProvider } from '@/context/AuthContext'
import { CartProvider } from '@/context/CartContext'
import { router } from '@/routes'

/**
 * App — Ponto de entrada da aplicação.
 *
 * Estrutura de providers:
 *   AuthProvider → CartProvider → RouterProvider
 */
export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <RouterProvider router={router} />
      </CartProvider>
    </AuthProvider>
  )
}
