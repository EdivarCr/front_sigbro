import { type Column } from "./table"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { CaretLeftIcon, CaretRightIcon } from "@phosphor-icons/react"

interface MobileTableProps<T> {
  columns: Column<T>[]
  data: T[]
  emptyValue?: string
  pageSize?: number
  renderRightActions?: (row: T) => React.ReactNode
  renderBottomAction?: (row: T) => React.ReactNode
}

export function MobileTable<T extends { id?: string | number }>({
  columns,
  data,
  emptyValue,
  pageSize = 10,
  renderRightActions,
  renderBottomAction
}: MobileTableProps<T>) {
  const [currentPage, setCurrentPage] = useState(1)

  const totalPages = Math.ceil(data.length / pageSize)
  const start = (currentPage - 1) * pageSize
  const pageData = data.slice(start, start + pageSize)

  return (
    <div className="flex h-full flex-col gap-4">
      <div className="flex-1 space-y-4 pb-4">
        {pageData.map((row, rowIndex) => (
          <div 
            key={row.id ?? rowIndex}
            className="flex flex-col gap-3 rounded-sm border border-(--bg-sidebar) bg-(--bg-surface) p-4 shadow-sm"
          >
            {/* Parte Superior: Info + Ações Laterais */}
            <div className="flex p-4 gap-4">
              {/* Esquerda: Mapeia as colunas para virarem linhas no Card */}
              <div className="flex-1 flex flex-col gap-3">
                {columns.map((col) => (
                  <div key={String(col.key)} className="flex justify-between items-start gap-4">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-(--txt-secondary)">
                      {col.label}
                    </span>
                    <div className="text-sm font-medium text-(--txt-primary) text-right">
                      {(row[col.key as keyof T] ?? "") !== "" || col.key === "acoes" ? (
                        col.render ? col.render(row) : String(row[col.key as keyof T] ?? "")
                      ) : (
                        <span className="text-(--txt-secondary) opacity-50 italic font-normal">
                          {emptyValue || "—"}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Direita: Botões de Edição/Remoção */}
              {renderRightActions && (
                <div className="flex flex-col gap-2 shrink-0">
                  {renderRightActions(row)}
                </div>
              )}
            </div>
            {/* Parte Inferior: Botão "Ver Detalhes" */}
            {renderBottomAction && (
              <div className="border-t border-(--bg-sidebar) p-2">
                {renderBottomAction(row)}
              </div>
            )}
          </div>
        ))}
      </div>
      

      {/* Paginação Mobile Simplificada */}
      <div className="sticky bottom-0 z-10 flex items-center justify-between bg-(--bg-primary) border-t border-(--bg-sidebar) px-2 py-2 mt-auto">
        <span className="text-xs text-(--txt-secondary)">
          Página {currentPage} de {totalPages}
        </span>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(p => p - 1)}
          >
            <CaretLeftIcon size={18} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(p => p + 1)}
          >
            <CaretRightIcon size={18} />
          </Button>
        </div>
      </div>
    </div>
  )
}