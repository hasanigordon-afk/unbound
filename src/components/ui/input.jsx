import * as React from "react"

import { cn } from "@/lib/utils"

const Input = React.forwardRef(({ className, type, ...props }, ref) => {
  return (
    (<input
      type={type}
      className={cn(
        "flex min-h-[48px] w-full rounded-[22px] border border-white/14 bg-white/[.065] px-4 py-3 text-base text-[var(--text)] shadow-[inset_0_1px_0_rgba(255,255,255,.08)] backdrop-blur-xl transition-all duration-300 file:border-0 file:bg-transparent file:text-sm file:font-bold file:text-foreground placeholder:text-slate-400 focus-visible:border-cyan-200/45 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-cyan-300/12 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        className
      )}
      ref={ref}
      {...props} />)
  );
})
Input.displayName = "Input"

export { Input }