import { cn } from "@/lib/utils"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select"

interface SelectOption {
  label: string
  value: string
}

interface SelectFieldProps {
  label?: string
  helper?: string
  error?: string
  required?: boolean
  placeholder?: string
  options: SelectOption[]
  value?: string
  onValueChange?: (value: string) => void
  disabled?: boolean
  className?: string
}

export function SelectField({
  label,
  helper,
  error,
  required,
  placeholder = "Selecione...",
  options,
  value,
  onValueChange,
  disabled,
  className,
}: SelectFieldProps) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="text-body-sm text-(--txt-secondary)">
          {label}
          {required && <span className="text-brand ml-1">*</span>}
        </label>
      )}

      <Select value={value} onValueChange={onValueChange} disabled={disabled}>
        <SelectTrigger
          className={cn(
            error && "border-(--color-red)",
            "cursor-pointer",
            className
          )}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {(helper || error) && (
        <span
          className={cn(
            "text-body-sm",
            error ? "text-(--color-red)" : "text-(--txt-secondary)"
          )}
        >
          {error ?? helper}
        </span>
      )}
    </div>
  )
}
