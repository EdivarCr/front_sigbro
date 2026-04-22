import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center border border-transparent rounded-sm bg-clip-padding text-xs font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring/50 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-1 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 cursor-pointer",
  {
    variants: {
      variant: {
        primary: "bg-(--brand-primary-default) text-(--bg-primary) hover:bg-(--brand-primary-hover)",
        secondary: "bg-(--color-brand) text-(--txt-on-brand) hover:bg-(--color-brand-hover)",
        outlined: "border border-(--txt-primary) bg-transparent text-(--txt-primary) hover:bg-(--bg-surface)",
        ghost: "bg-transparent text-(--txt-secondary) hover:bg-(--bg-surface)",
      },
      size: {
        sm: "h-8 gap-2 px-4 py-2 text-xs [&_svg]:size-4",
        md: "h-10 gap-2 px-4 py-2 text-sm [&_svg]:size-6",
        lg: "h-12 gap-2 px-4 py-2 text-base [&_svg]:size-6",
        icon: "size-10",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
)

function Button({
  className,
  variant = "primary",
  size = "md",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot.Root : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
