"use client"

import * as React from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress"

import { cn } from "@/lib/utils"

const Progress = React.forwardRef(({ className, value, ...props }, ref) => (
  <ProgressPrimitive.Root
    ref={ref}
    className={cn(
      "relative h-4 w-full overflow-hidden rounded-full border border-white/10 bg-white/8 shadow-inner before:absolute before:inset-y-1 before:left-2 before:right-2 before:rounded-full before:bg-white/5",
      className
    )}
    {...props}>
    <ProgressPrimitive.Indicator
      className="h-full w-full flex-1 rounded-full bg-[linear-gradient(90deg,rgba(52,211,153,.95),rgba(34,211,238,.88),rgba(240,183,83,.85))] shadow-[0_0_24px_rgba(52,211,153,.28)] transition-transform duration-700 ease-out"
      style={{ transform: `translateX(-${100 - (value || 0)}%)` }} />
  </ProgressPrimitive.Root>
))
Progress.displayName = ProgressPrimitive.Root.displayName

export { Progress }