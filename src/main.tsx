import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import App from "./App"
import "@/styles/index.css"
import { ThemeProvider } from "./context/ThemeContext"
import { ToastProvider } from "./context/ToastContext"

createRoot(document.getElementById("root")!).render(
  <ThemeProvider>
    <ToastProvider>
      <StrictMode>
        <App />
      </StrictMode>
    </ToastProvider>
  </ThemeProvider>
)
