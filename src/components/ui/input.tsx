import { cn } from "@/lib/utils"

interface InputProps {
  label?: string
  helper?: string
  error?: string
  required?: boolean
  iconLeft?: React.ReactNode
  iconRight?: React.ReactNode
  className?: string
}

export function Input({
  label,
  helper,
  error,
  required,
  iconLeft,
  iconRight,
  className,
  ...props
}: InputProps & React.ComponentProps<"input">) {
  return (
    <div className="flex flex-col gap-1">
      {/* Label — só aparece se for passado */}
      {label && (
        <label className="text-body-sm text-(--txt-secondary)">
          {label}
          {required && (
            <span className="text-body-sm ml-1 text-(--txt-link)">*</span>
          )}
        </label>
      )}

      {/* Wrapper do input — posiciona ícones */}
      <div className="relative flex items-center">
        {/* Ícone esquerdo */}
        {iconLeft && (
          <div className="absolute left-2 text-(--txt-secondary)">
            {iconLeft}
          </div>
        )}

        {/* Input */}
        <input
          className={cn(
            // Base
            "h-12 w-full rounded-sm border bg-(--bg-surface) px-2 text-[14px]",
            "text-(--txt-primary) placeholder:text-(--txt-placeholder)",
            // Borda padrão
            "border-(--border-input)",
            // Hover
            "hover:border-(--txt-secondary)",
            // Focus
            "focus:border-(--border-active) focus:outline-none",
            // Disabled
            "disabled:cursor-not-allowed disabled:opacity-50",
            // Erro
            error && "border-(--color-red)",
            // Padding extra quando tem ícone
            iconLeft && "pl-8",
            iconRight && "pr-8",
            className
          )}
          {...props}
        />

        {/* Ícone direito */}
        {iconRight && (
          <div className="absolute right-2 text-(--txt-secondary)">
            {iconRight}
          </div>
        )}
      </div>

      {/* Helper ou mensagem de erro */}
      {(helper || error) && (
        <span
          className={cn(
            "text-xs",
            error ? "text-(--color-red)" : "text-(--txt-secondary)"
          )}
        >
          {error ?? helper}
        </span>
      )}
    </div>
  )
}
