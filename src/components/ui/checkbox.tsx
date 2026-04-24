import { cn } from "@/lib/utils"
import { useState } from "react"
import { CheckIcon } from "@phosphor-icons/react"

interface CheckboxProps {
  label: string
}

export function Checkbox({ label }: CheckboxProps) {
  const [checked, setChecked] = useState(false)

  return (
    <div
      className="flex w-fit cursor-pointer flex-row gap-2"
      onClick={() => setChecked(!checked)}
    >
      <div
        className={cn(
          "flex size-5 items-center justify-center rounded-xs border",
          checked
            ? "bg-brand border-brand"
            : "border-(--border-input) bg-transparent"
        )}
      >
        {checked && <CheckIcon size={12} className="text-(--txt-on-brand)" />}
      </div>
      <span className="text-body-md text-(--txt-primary)">{label}</span>
    </div>
  )
}
