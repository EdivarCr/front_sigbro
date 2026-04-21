import { cn } from "@/lib/utils"

interface DateInputProps {
  label?: string
  helper?: string
  error?: string
  required?: boolean
  className?: string
}

export function DateInput ({
  label,
  helper,
  error,
  required,
  className,
  ...props
}: DateInputProps & React.ComponentProps<"input">) {
  return (
    <div className="flex flex-col gap-1">
      {/* Label — só aparece se for passado */}
      {label && (
        <label className="text-sm font-medium text-(--txt-primary)">
          {label}
          {required && (
            <span className="ml-1 text-(--color-brand)">*</span>
          )}
        </label>
      )}

      <input
        type="date"
        className={cn(
          // Base
          "w-full rounded-lg border bg-transparent px-2 py-2 text-sm",
            "text-(--txt-primary) placeholder:text-(--txt-placeholder)",
          // Borda padrão
          "border-(--border-input)",
          // Hover
          "hover:border-(--txt-secondary)",
          // Focus
          "focus:outline-none focus:border-(--border-active)",
          // Disabled
          "disabled:opacity-50 disabled:cursor-not-allowed",
          // Erro
          error && "border-(--color-red)",
          className
        )}
        {...props}
      />

      {/* Helper ou mensagem de erro */}
      {(helper || error) && (
        <span className={cn(
          "text-xs",
          error
            ? "text-(--color-red)"
            : "text-(--txt-secondary)"
        )}>
          {error ?? helper}
        </span>
      )}
    </div>
  )
}