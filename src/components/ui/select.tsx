import * as React from "react"
import { Select as SelectPrimitive } from "radix-ui"
import { cn } from "@/lib/utils"
import { CaretLeftIcon, CheckIcon } from "@phosphor-icons/react"

function Select({
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Root>) {
  return <SelectPrimitive.Root {...props} />
}

function SelectValue({
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Value>) {
  return <SelectPrimitive.Value {...props} />
}

function SelectTrigger({
  className,
  children,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Trigger>) {
  return (
    <SelectPrimitive.Trigger
      className={cn(
        // Base
        "group flex w-full h-12 items-center justify-between gap-2 rounded-sm border px-3 py-2",
        "font-sans text-sm text-(--txt-primary)",
        // Borda
        "border-(--border-input)",
        // Hover
        "hover:border-(--txt-secondary)",
        // Focus
        "focus:border-(--border-active) focus:outline-none",
        // Placeholder
        "data-placeholder:text-(--txt-placeholder)",
        // Disabled
        "disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon asChild>
        <CaretLeftIcon
          size={16}
          className="shrink-0 text-(--txt-secondary) transition-transform duration-200 group-data-[state=open]:-rotate-90"
        />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  )
}

function SelectContent({
  className,
  children,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Content>) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        position="popper"
        sideOffset={4}
        className={cn(
          "z-50 min-w-36 overflow-hidden rounded-sm",
          "bg-(--bg-surface)",
          "shadow-md",
          "duration-100",
          "data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95",
          "data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95",
          "data-[side=bottom]:slide-in-from-top-2",
          "data-[side=top]:slide-in-from-bottom-2",
          "data-[position=popper]:w-(--radix-select-trigger-width)",
          className
        )}
        {...props}
      >
        <SelectPrimitive.Viewport className="p-1">
          {children}
        </SelectPrimitive.Viewport>
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  )
}

function SelectItem({
  className,
  children,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Item>) {
  return (
    <SelectPrimitive.Item
      className={cn(
        "relative flex cursor-pointer items-center gap-2 rounded-xs px-3 py-2 pr-8",
        "font-sans text-sm text-(--txt-primary) outline-none select-none",
        "focus:bg-(--bg-sidebar-hover)",
        "data-disabled:pointer-events-none data-disabled:opacity-50",
        className
      )}
      {...props}
    >
      <span className="pointer-events-none absolute right-2 flex size-4 items-center justify-center">
        <SelectPrimitive.ItemIndicator>
          <CheckIcon size={12} weight="bold" className="text-brand" />
        </SelectPrimitive.ItemIndicator>
      </span>
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  )
}

export { Select, SelectValue, SelectTrigger, SelectContent, SelectItem }
