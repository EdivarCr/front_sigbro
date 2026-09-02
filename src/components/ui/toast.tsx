import { cn } from "@/lib/utils"
import {
  XIcon,
  InfoIcon,
  XCircleIcon,
  WarningIcon,
  CheckCircleIcon,
} from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"

type ToastVariant = "default" | "danger" | "attention" | "success"

interface ToastProps {
  title: string
  description?: string
  variant?: ToastVariant
  onClose?: () => void
  progress?: number
  className?: string
}

const variantConfig = {
  default: {
    icon: InfoIcon,
    color: "text-(--txt-secondary)",
    bg: "bg-(--txt-secondary)",
    border: "border-l-[4px] border-(--txt-secondary)",
  },
  danger: {
    icon: XCircleIcon,
    color: "text-(--color-red)",
    bg: "bg-(--color-red)",
    border: "border-l-[4px] border-(--color-red)",
  },
  attention: {
    icon: WarningIcon,
    color: "text-(--color-yellow)",
    bg: "bg-(--color-yellow",
    border: "border-l-[4px] border-(--color-yellow)",
  },
  success: {
    icon: CheckCircleIcon,
    color: "text-(--color-green)",
    bg: "bg-(--color-green)",
    border: "border-l-[4px] border-(--color-green)",
  },
}

export function Toast({
  title,
  description,
  variant = "default",
  onClose,
  progress,
  className,
}: ToastProps) {
  const { icon: Icon, color, bg, border } = variantConfig[variant]

  return (
    <div
      className={cn(
        "relative flex min-h-19.5 w-fit flex-row items-center gap-4 overflow-hidden rounded-sm bg-(--bg-surface) p-4 shadow-md",
        border,
        className
      )}
    >
      {/* Ícone + conteúdo */}
      <div className="flex flex-row items-center gap-2">
        <Icon size={32} weight="fill" className={cn("shrink-0", color)} />
        <div className="flex flex-col gap-2">
          <h4 className={cn("font-heading text-base font-semibold", color)}>
            {title}
          </h4>
          {description && (
            <p className="text-body-md text-(--txt-secondary)">{description}</p>
          )}
        </div>
      </div>

      {/* Botão fechar */}
      {onClose && (
        <Button
          variant="ghost"
          size="md"
          onClick={onClose}
          className="-mr-2 shrink-0 self-start p-1"
        >
          <XIcon size={24} />
        </Button>
      )}

      {progress !== undefined && (
        <div className="absolute bottom-0 left-0 h-0.5 w-full bg-(--bg-sidebar)">
          <div
            className={cn("h-full transition-all duration-100", bg)}
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  )
}
