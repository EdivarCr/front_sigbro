import { createContext, useContext, useState, type ReactNode } from 'react'

// ---------------------------------------------------------------------------
// Tipos
// ---------------------------------------------------------------------------
export interface CartItem {
  id: string
  nome: string
  preco: number
  quantidade: number
  imagemUrl?: string
}

interface CartContextData {
  items: CartItem[]
  totalItens: number
  totalPreco: number
  addItem: (item: Omit<CartItem, 'quantidade'>) => void
  removeItem: (id: string) => void
  updateQuantidade: (id: string, quantidade: number) => void
  clearCart: () => void
}

// ---------------------------------------------------------------------------
// Contexto
// ---------------------------------------------------------------------------
const CartContext = createContext<CartContextData>({} as CartContextData)

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------
export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])

  const totalItens = items.reduce((acc, item) => acc + item.quantidade, 0)
  const totalPreco = items.reduce((acc, item) => acc + item.preco * item.quantidade, 0)

  function addItem(newItem: Omit<CartItem, 'quantidade'>) {
    setItems((prev) => {
      const existing = prev.find((i) => i.id === newItem.id)
      if (existing) {
        return prev.map((i) =>
          i.id === newItem.id ? { ...i, quantidade: i.quantidade + 1 } : i
        )
      }
      return [...prev, { ...newItem, quantidade: 1 }]
    })
  }

  function removeItem(id: string) {
    setItems((prev) => prev.filter((i) => i.id !== id))
  }

  function updateQuantidade(id: string, quantidade: number) {
    if (quantidade <= 0) {
      removeItem(id)
      return
    }
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, quantidade } : i))
    )
  }

  function clearCart() {
    setItems([])
  }

  return (
    <CartContext.Provider
      value={{ items, totalItens, totalPreco, addItem, removeItem, updateQuantidade, clearCart }}
    >
      {children}
    </CartContext.Provider>
  )
}

// ---------------------------------------------------------------------------
// Hook de conveniência
// ---------------------------------------------------------------------------
export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart deve ser usado dentro de um CartProvider')
  }
  return context
}
