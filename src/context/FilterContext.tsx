import { createContext, useContext, useState, type ReactNode, useMemo } from "react"

interface FilterContextType {
  dataInicio: string
  dataFim: string
  periodoTexto: string
  setDataInicio: (data: string) => void
  setDataFim: (data: string) => void
  setPeriodoTexto: (texto: string) => void
  limparFiltrosGlobal: () => void
}

const FilterContext = createContext<FilterContextType | undefined>(undefined)

export function FilterProvider({ children }: { children: ReactNode }) {
  const datasPadrao = useMemo(() => {
    const agora = new Date()
    const ano = agora.getFullYear()
    const mes = String(agora.getMonth() + 1).padStart(2, "0")
    const dia = String(agora.getDate()).padStart(2, "0")
    
    return {
      primeiroDia: `${ano}-${mes}-01`,
      hoje: `${ano}-${mes}-${dia}`,
    }
  }, [])

  const formatarDataBR = (dataStr: string) => {
    if (!dataStr) return ""
    return dataStr.split("-").reverse().join("/")
  }

  // O estado global começa com o mês vigente
  const [dataInicio, setDataInicio] = useState<string>(datasPadrao.primeiroDia)
  const [dataFim, setDataFim] = useState<string>(datasPadrao.hoje)
  const [periodoTexto, setPeriodoTexto] = useState<string>(
    `${formatarDataBR(datasPadrao.primeiroDia)} - ${formatarDataBR(datasPadrao.hoje)}`
  )

  const limparFiltrosGlobal = () => {
    setDataInicio("")
    setDataFim("")
    setPeriodoTexto("Período Completo")
  }

  return (
    <FilterContext.Provider 
      value={{ 
        dataInicio, 
        dataFim, 
        periodoTexto, 
        setDataInicio, 
        setDataFim, 
        setPeriodoTexto, 
        limparFiltrosGlobal 
      }}
    >
      {children}
    </FilterContext.Provider>
  )
}

// Hook customizado para facilitar o uso nas páginas
export function useFilter() {
  const context = useContext(FilterContext)
  if (!context) {
    throw new Error("useFilter deve ser usado dentro de um FilterProvider")
  }
  return context
}