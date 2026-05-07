import { cn } from "@/lib/utils"
import { useState } from "react"
import {
  CaretUpIcon,
  CaretDownIcon,
  CaretLeftIcon,
  CaretRightIcon,
} from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"

// Tipos
export interface Column<T> {
  key: keyof T | string
  label: string
  sortable?: boolean
  className?: string
  render?: (row: T) => React.ReactNode
}

interface TableProps<T> {
  columns: Column<T>[]
  data: T[]
  emptyValue?: string
  pageSize?: number
}

type SortDirection = "asc" | "desc" | null

// Componente principal
export function Table<T extends { id?: string | number }>({
  columns,
  data,
  emptyValue,
  pageSize = 10,
}: TableProps<T>) {
  const [currentPage, setCurrentPage] = useState(1)
  const [sortKey, setSortKey] = useState<string | null>(null)
  const [sortDirection, setSortDirection] = useState<SortDirection>(null)

  // Ordenação
  const sortedData = [...data].sort((a, b) => {
    if (!sortKey || !sortDirection) return 0
    const aVal = a[sortKey as keyof T]
    const bVal = b[sortKey as keyof T]
    if (aVal === bVal) return 0
    const result = aVal > bVal ? 1 : -1
    return sortDirection === "asc" ? result : -result
  })

  // Paginação
  const totalPages = Math.ceil(sortedData.length / pageSize)
  const start = (currentPage - 1) * pageSize
  const end = start + pageSize
  const pageData = sortedData.slice(start, end)

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDirection((prev) =>
        prev === "asc" ? "desc" : prev === "desc" ? null : "asc"
      )
      if (sortDirection === "desc") setSortKey(null)
    } else {
      setSortKey(key)
      setSortDirection("asc")
    }
  }

  return (
    <div className="flex h-full w-full flex-col overflow-hidden">
      <div className="flex-1 overflow-auto">
        <table className="w-full border-collapse">
          <thead className="sticky top-0 z-10 bg-(--bg-sidebar)">
            <tr className="relative z-10">
              {columns.map((col, index) => (
                <th
                  key={String(col.key)}
                  onClick={
                    col.sortable ? () => handleSort(String(col.key)) : undefined
                  }
                  className={cn(
                    "sticky top-0 z-10 h-10 border-b border-(--txt-secondary) px-4 py-2 text-left",
                    "font-sans text-xs font-bold text-(--txt-secondary)",
                    index === 0 && "rounded-tl-sm",
                    index === columns.length - 1 && "rounded-tr-sm",
                    col.sortable &&
                      "cursor-pointer select-none hover:text-(--txt-primary)",
                    col.className
                  )}
                >
                  <div className="flex items-center gap-1">
                    {col.label}
                    {col.sortable && (
                      <span className="flex flex-col">
                        <CaretUpIcon
                          size={10}
                          weight={
                            sortKey === String(col.key) &&
                            sortDirection === "asc"
                              ? "fill"
                              : "regular"
                          }
                        />
                        <CaretDownIcon
                          size={10}
                          weight={
                            sortKey === String(col.key) &&
                            sortDirection === "desc"
                              ? "fill"
                              : "regular"
                          }
                        />
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pageData.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="h-14 p-4 text-center font-sans text-sm text-(--txt-secondary)"
                >
                  Nenhum registro encontrado
                </td>
              </tr>
            ) : (
              pageData.map((row, rowIndex) => (
                <tr key={row.id ?? rowIndex}>
                  {columns.map((col) => (
                    <td
                      key={String(col.key)}
                      className={cn(
                        "h-14 border-b border-(--txt-placeholder) px-4 py-2 font-sans text-sm text-(--txt-primary)",
                        col.className
                      )}
                    >
                      {(row[col.key as keyof T] ?? "") !== "" || col.key === "acoes" ? (
                        col.render ? col.render(row) : String(row[col.key as keyof T] ?? "")
                      ) : (
                        <span className="text-(--txt-secondary) opacity-50 italic font-normal">
                          {emptyValue || "—"}
                        </span>
                      )}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <div className="sticky bottom-0 flex items-center justify-between gap-4 border-t border-(--border-default) bg-(--bg-primary) px-2 py-1">
        <span className="font-sans text-xs font-bold text-(--txt-primary)">
          {data.length === 0
            ? "0 registros"
            : `${start + 1}-${Math.min(end, data.length)} de ${data.length} registros`}
        </span>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            <CaretLeftIcon size={16} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages || totalPages === 0}
          >
            <CaretRightIcon size={16} />
          </Button>
        </div>
      </div>
    </div>
  )
}
