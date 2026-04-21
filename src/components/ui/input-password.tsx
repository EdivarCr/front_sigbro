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
        <label className="text-sm font-medium text-(--txt-primary)">
          {label}
          {required && (
            <span className="ml-1 text-(--color-brand)">*</span>
          )}
        </label>
      )}

      {/* Wrapper do input — posiciona ícones */}
      <div className="relative flex items-center">
        {/* Input */}
        <input
          type={isVisible ? "text" : "password"}
          className={cn(
            // Base
            "w-full rounded-lg border bg-transparent px-2 py-2 text-sm",
            "text-(--txt-primary) placeholder:text-(--txt-placeholder) pr-8",
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
          className="absolute right-2 text-(--txt-secondary)"
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