import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react"
import { Toast } from "@/components/ui/toast"

type ToastVariant = "default" | "danger" | "attention" | "success"

interface ToastData {
  title: string
  description?: string
  variant?: ToastVariant
}

interface ToastContextData {
  toast: (data: ToastData) => void
}

const ToastContext = createContext<ToastContextData>({} as ToastContextData)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [current, setCurrent] = useState<ToastData | null>(null)
  const [progress, setProgress] = useState(100)

  const toast = useCallback((data: ToastData) => {
    setCurrent(data)
    setProgress(100)

    // Anima a barra de progresso
    const interval = setInterval(() => {
      // TODO: alterar duração da animação
      setProgress((prev) => {
        if (prev <= 0) {
          clearInterval(interval)
          return 0
        }
        return prev - 100 / 50 // 50 steps em 5s (100ms cada)
      })
    }, 100)

    setTimeout(() => {
      clearInterval(interval)
      setCurrent(null)
      setProgress(100)
    }, 5000)
  }, [])

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}

      {/* Container fixo no canto inferior direito */}
      {current && (
        <div className="fixed right-6 bottom-6 z-100">
          <Toast
            title={current.title}
            description={current.description}
            variant={current.variant}
            onClose={() => setCurrent(null)}
            progress={progress}
          />
        </div>
      )}
    </ToastContext.Provider>
  )
}

export function useToast() {
  return useContext(ToastContext)
}
