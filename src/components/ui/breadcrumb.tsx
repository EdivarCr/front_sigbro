import { NavLink } from "react-router-dom"
import { CaretRightIcon } from "@phosphor-icons/react"

interface BreadcrumbItem {
  label: string
  to?: string
}

interface BreadcrumbProps {
  items: BreadcrumbItem[]
}

export function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <div className="flex items-center gap-1">
      {items.map((item, index) => (
        <div key={index} className="flex items-center gap-1">
          {item.to ? (
            <NavLink
              to={item.to}
              className="text-table-header text-(--txt-secondary) transition-colors hover:text-(--txt-primary)"
            >
              {item.label}
            </NavLink>
          ) : (
            <span className="text-table-header text-(--txt-primary)">
              {item.label}
            </span>
          )}

          {index < items.length - 1 && (
            <CaretRightIcon
              size={12}
              weight="fill"
              className="text-(--txt-secondary)"
            />
          )}
        </div>
      ))}
    </div>
  )
}
