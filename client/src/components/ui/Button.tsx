import * as React from "react"
import { cn } from "@/src/lib/utils"

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost" | "link"
  size?: "default" | "sm" | "lg" | "icon"
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 dark:ring-offset-brand-950 dark:focus-visible:ring-brand-300",
          {
            "bg-brand-900 text-white hover:bg-brand-900/90 dark:bg-brand-50 dark:text-brand-900 dark:hover:bg-brand-50/90": variant === "default",
            "border border-brand-100 bg-white hover:bg-brand-50 text-brand-900 dark:border-brand-800 dark:bg-brand-950 dark:hover:bg-brand-900 dark:text-brand-50": variant === "outline",
            "hover:bg-brand-50 text-brand-900 dark:hover:bg-brand-900 dark:text-brand-50": variant === "ghost",
            "text-brand-900 dark:text-brand-50 underline-offset-4 hover:underline": variant === "link",
            "h-10 px-4 py-2": size === "default",
            "h-9 rounded-md px-3": size === "sm",
            "h-11 rounded-md px-8": size === "lg",
            "h-10 w-10": size === "icon",
          },
          className
        )}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }
