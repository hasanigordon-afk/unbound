import * as React from "react"
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils"

const alertVariants = cva(
  "relative w-full rounded-[24px] border px-5 py-4 text-sm shadow-[0_16px_38px_rgba(0,0,0,.24)] backdrop-blur-2xl transition-all duration-300 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-5 [&>svg]:top-5 [&>svg~*]:pl-8",
  {
    variants: {
      variant: {
        default: "border-cyan-200/18 bg-cyan-300/10 text-cyan-50 [&>svg]:text-cyan-200",
        destructive:
          "border-amber-200/24 bg-amber-300/10 text-amber-50 [&>svg]:text-amber-200",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

const Alert = React.forwardRef(({ className, variant, ...props }, ref) => (
  <div
    ref={ref}
    role="alert"
    className={cn(alertVariants({ variant }), className)}
    {...props} />
))
Alert.displayName = "Alert"

const AlertTitle = React.forwardRef(({ className, ...props }, ref) => (
  <h5
    ref={ref}
    className={cn("mb-1 font-medium leading-none tracking-tight", className)}
    {...props} />
))
AlertTitle.displayName = "AlertTitle"

const AlertDescription = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm [&_p]:leading-relaxed", className)}
    {...props} />
))
AlertDescription.displayName = "AlertDescription"

export { Alert, AlertTitle, AlertDescription }