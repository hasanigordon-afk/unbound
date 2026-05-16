import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "rez-button inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-extrabold tracking-[0.01em] transition-all duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 active:scale-[0.97] [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "border border-white/25 bg-[linear-gradient(135deg,rgba(91,141,239,.95),rgba(34,211,238,.72),rgba(167,139,250,.88))] text-white shadow-[0_0_34px_rgba(91,141,239,.34),0_16px_36px_rgba(0,0,0,.28),inset_0_1px_0_rgba(255,255,255,.28)] hover:-translate-y-0.5 hover:shadow-[0_0_52px_rgba(34,211,238,.42),0_22px_48px_rgba(0,0,0,.35),inset_0_1px_0_rgba(255,255,255,.36)]",
        destructive:
          "border border-red-300/25 bg-[linear-gradient(135deg,rgba(248,113,113,.92),rgba(168,85,247,.54))] text-white shadow-[0_0_32px_rgba(248,113,113,.26),0_16px_34px_rgba(0,0,0,.28)] hover:-translate-y-0.5",
        outline:
          "border border-cyan-200/20 bg-white/[.065] text-[var(--text)] backdrop-blur-2xl shadow-[inset_0_1px_0_rgba(255,255,255,.12),0_14px_32px_rgba(0,0,0,.22)] hover:-translate-y-0.5 hover:border-cyan-200/40 hover:bg-white/[.105] hover:shadow-[0_0_34px_rgba(34,211,238,.20),0_18px_42px_rgba(0,0,0,.30)]",
        secondary:
          "border border-blue-200/18 bg-[linear-gradient(135deg,rgba(255,255,255,.10),rgba(91,141,239,.12))] text-[var(--text)] backdrop-blur-2xl shadow-[inset_0_1px_0_rgba(255,255,255,.10),0_12px_28px_rgba(0,0,0,.24)] hover:-translate-y-0.5 hover:border-blue-200/34 hover:bg-white/[.115]",
        ghost: "border border-transparent text-[var(--text-muted)] hover:-translate-y-0.5 hover:border-cyan-200/18 hover:bg-white/[.075] hover:text-[var(--text)] hover:shadow-[0_0_26px_rgba(91,141,239,.16)]",
        link: "text-cyan-200 underline-offset-4 hover:text-white hover:no-underline",
      },
      size: {
        default: "h-11 px-5 py-2.5",
        sm: "h-9 px-4 text-xs",
        lg: "h-13 min-h-[52px] px-8 text-base",
        icon: "h-11 w-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

const Button = React.forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "button"
  return (
    (<Comp
      className={cn(buttonVariants({ variant, size, className }))}
      ref={ref}
      {...props} />)
  );
})
Button.displayName = "Button"

export { Button, buttonVariants }