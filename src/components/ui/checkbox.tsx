import { cn } from "@/lib/utils"
import { useState } from "react"
import { CheckIcon } from "@phosphor-icons/react"

interface CheckboxProps {
  label: string
  checked?: boolean
  onChange?: (checked: boolean) => void
}

export function Checkbox({ label, checked: externalChecked, onChange}: CheckboxProps) {
  const [internalChecked, setInternalChecked] = useState(false)

  // Decide se usa o estado de fora (RHF) ou o de dentro (standalone)
  const isChecked = externalChecked !== undefined ? externalChecked : internalChecked

  const handleToggle = () => {
    const newValue = !isChecked
    if (onChange) {
      onChange(newValue) // Avisa o React Hook Form
    } else {
      setInternalChecked(newValue) // Funciona sozinho se não tiver form
    }
  }

  return (
    <div
      className="flex w-fit cursor-pointer flex-row gap-2"
      onClick={handleToggle}
    >
      <div
        className={cn(
          "flex size-5 items-center justify-center rounded-xs border",
          isChecked
            ? "bg-brand border-brand"
            : "border-(--border-input) bg-transparent"
        )}
      >
        {isChecked && <CheckIcon size={12} className="text-(--txt-on-brand)" />}
      </div>
      <span className="text-body-md text-(--txt-primary)">{label}</span>
    </div>
  )
}
