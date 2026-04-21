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
        <label className="text-sm font-medium text-(--txt-primary)">
          {label}
          {required && (
            <span className="ml-1 text-(--color-brand)">*</span>
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