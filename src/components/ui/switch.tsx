import { cn } from "@/lib/utils"

interface SwitchProps {
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  disabled?: boolean
  label?: string
  className?: string
}

export function Switch({ 
  checked, 
  onCheckedChange, 
  disabled = false, 
  label,
  className 
}: SwitchProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      {label && (
        <span className={cn(
          "text-[14px] transition-colors",
          disabled ? "text-(--txt-placeholder)" : "text-(--txt-secondary)"
        )}>
          {label}
        </span>
      )}
      
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onCheckedChange(!checked)}
        className={cn(
          "relative h-6 w-11 cursor-pointer rounded-full transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--txt-link)",
          checked ? "bg-(--txt-link)" : "bg-(--border-default)",
          disabled && "cursor-not-allowed opacity-50"
        )}
      >
        <span
          className={cn(
            "absolute top-1 left-1 h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-300",
            checked ? "translate-x-5" : "translate-x-0"
          )}
        />
      </button>
    </div>
  )
}