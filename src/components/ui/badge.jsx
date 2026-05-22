import * as React from "react"
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full border px-3 py-1 text-[11px] font-black tracking-[0.04em] transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-ring active:scale-95",
  {
    variants: {
      variant: {
        default:
          "border-cyan-200/25 bg-cyan-300/12 text-cyan-100 shadow-[0_0_18px_rgba(34,211,238,0.14)] hover:bg-cyan-300/18",
        secondary:
          "border-emerald-200/22 bg-emerald-300/12 text-emerald-100 hover:bg-emerald-300/18",
        destructive:
          "border-amber-200/24 bg-amber-300/12 text-amber-100 shadow-[0_0_18px_rgba(240,183,83,0.13)] hover:bg-amber-300/18",
        outline: "border-white/16 bg-white/7 text-slate-200 hover:bg-white/10",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant,
  ...props
}) {
  return (<div className={cn(badgeVariants({ variant }), className)} {...props} />);
}

export { Badge, badgeVariants }