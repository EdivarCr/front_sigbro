import { cn } from "@/lib/utils"
import { useState } from "react"
import { EyeIcon, EyeSlashIcon } from "@phosphor-icons/react"

interface InputProps {
  label?: string
  helper?: string
  error?: string
  required?: boolean
  className?: string
}

export function InputPassword({
  label,
  helper,
  error,
  required,
  className,
  ...props
}: InputProps & React.ComponentProps<"input">) {
  const [isVisible, setIsVisible] = useState(false)

  return (
    <div className="flex flex-col gap-1">
      {/* Label — só aparece se for passado */}
      {label && (
        <label className="text-body-sm text-(--txt-secondary) text-body-sm">
          {label}
          {required && (
            <span className="ml-1 text-brand">*</span>
          )}
        </label>
      )}

      {/* Wrapper do input — posiciona ícones */}
      <div className="relative flex items-center">
        {/* Input */}
        <input
          type={isVisible ? "text" : "password"}
          autoComplete="current-password"
          className={cn(
            // Base
            "w-full rounded-sm border bg-(--bg-surface) text-body-md h-12 px-2",
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

        <button
          type="button"
          onClick={() => setIsVisible(!isVisible)}
          className="absolute right-2 z-10 text-(--txt-secondary) cursor-pointer"
        >
          {isVisible ? <EyeSlashIcon size={16} /> : <EyeIcon size={16} />}
        </button>
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