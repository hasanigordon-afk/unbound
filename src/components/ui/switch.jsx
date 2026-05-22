import * as React from "react"
import * as SwitchPrimitives from "@radix-ui/react-switch"

import { cn } from "@/lib/utils"

const Switch = React.forwardRef(({ className, ...props }, ref) => (
  <SwitchPrimitives.Root
    className={cn(
      "peer inline-flex h-8 w-14 shrink-0 cursor-pointer items-center rounded-full border border-white/14 bg-white/10 p-1 shadow-[inset_0_1px_0_rgba(255,255,255,.10),0_10px_24px_rgba(0,0,0,.22)] transition-all duration-300 active:scale-95 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-cyan-300/12 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-emerald-300/35 data-[state=unchecked]:bg-white/10",
      className
    )}
    {...props}
    ref={ref}>
    <SwitchPrimitives.Thumb
      className={cn(
        "pointer-events-none block h-6 w-6 rounded-full bg-white shadow-[0_0_18px_rgba(255,255,255,.28)] ring-0 transition-transform duration-300 data-[state=checked]:translate-x-6 data-[state=unchecked]:translate-x-0"
      )} />
  </SwitchPrimitives.Root>
))
Switch.displayName = SwitchPrimitives.Root.displayName

export { Switch }