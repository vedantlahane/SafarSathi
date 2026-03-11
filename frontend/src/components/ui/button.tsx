import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[16px] text-sm font-medium transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] active:scale-[0.95] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive relative overflow-hidden",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow-[inset_0_1px_1px_rgba(255,255,255,0.3),_inset_0_-2px_1px_rgba(0,0,0,0.1),_0_8px_16px_-4px_var(--theme-glow),_0_4px_8px_-4px_rgba(0,0,0,0.1)] hover:-translate-y-[1px] hover:brightness-110 active:brightness-95 active:-translate-y-[0px] active:shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)] border border-primary/20",
        destructive: "bg-destructive text-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.3),_inset_0_-2px_1px_rgba(0,0,0,0.1),_0_8px_16px_-4px_rgba(239,68,68,0.4),_0_4px_8px_-4px_rgba(0,0,0,0.1)] hover:-translate-y-[1px] hover:brightness-110 active:brightness-95 active:-translate-y-[0px] active:shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)] border border-destructive/20",
        outline: "border border-border/40 bg-background/40 backdrop-blur-[30px] backdrop-saturate-[200%] shadow-[inset_0_1px_1px_rgba(255,255,255,0.6),_inset_0_-1px_1px_rgba(0,0,0,0.05),_0_8px_16px_-8px_rgba(0,0,0,0.15)] dark:shadow-[inset_0_1px_1px_rgba(255,255,255,0.15),_inset_0_-1px_1px_rgba(0,0,0,0.2),_0_8px_16px_-8px_rgba(0,0,0,0.4)] hover:bg-accent/40 hover:text-accent-foreground hover:-translate-y-[1px] active:shadow-[inset_0_2px_4px_rgba(0,0,0,0.1)]",
        secondary: "bg-secondary/75 backdrop-blur-[30px] backdrop-saturate-[200%] text-secondary-foreground shadow-[inset_0_1px_1px_rgba(255,255,255,0.6),_inset_0_-1px_1px_rgba(0,0,0,0.05),_0_8px_16px_-8px_rgba(0,0,0,0.15)] dark:shadow-[inset_0_1px_1px_rgba(255,255,255,0.15),_inset_0_-1px_1px_rgba(0,0,0,0.3),_0_8px_16px_-8px_rgba(0,0,0,0.5)] hover:bg-secondary/90 hover:-translate-y-[1px] active:shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)] border border-white/20 dark:border-white/10",
        ghost: "hover:bg-accent/40 hover:text-accent-foreground active:scale-[0.95] active:bg-accent/60",
        link: "text-primary underline-offset-4 hover:underline active:opacity-70",
      },
      size: {
        default: "h-11 px-5 py-2 has-[>svg]:px-4",
        xs: "h-7 gap-1 rounded-lg px-3 text-xs has-[>svg]:px-2.5 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-9 rounded-lg gap-1.5 px-4 has-[>svg]:px-3",
        lg: "h-12 rounded-2xl px-8 has-[>svg]:px-6 text-base",
        icon: "size-9",
        "icon-xs": "size-6 rounded-md [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-8",
        "icon-lg": "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
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
