
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { Loader2 } from "lucide-react"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 font-poppins relative overflow-hidden",
  {
    variants: {
      variant: {
        default: "bg-pakistani_green-600 text-white hover:bg-pakistani_green-700 shadow-lg hover:shadow-xl hover:shadow-pakistani_green-600/25 active:scale-[0.98] active:shadow-md",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-lg hover:shadow-xl hover:shadow-destructive/25 active:scale-[0.98]",
        outline: "border-2 border-pakistani_green-600 bg-background text-pakistani_green-600 hover:bg-pakistani_green-50 hover:text-pakistani_green-700 hover:border-pakistani_green-700 dark:border-pakistani_green-400 dark:text-pakistani_green-200 dark:hover:bg-pakistani_green-900/30 dark:hover:text-white shadow-sm hover:shadow-md active:scale-[0.98]",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80 shadow-sm hover:shadow-md active:scale-[0.98]",
        ghost: "hover:bg-pakistani_green-50 hover:text-pakistani_green-700 dark:hover:bg-pakistani_green-900/20 dark:hover:text-pakistani_green-300 active:scale-[0.98]",
        link: "text-pakistani_green-600 underline-offset-4 hover:underline dark:text-pakistani_green-400 hover:text-pakistani_green-700",
        success: "bg-green-600 text-white hover:bg-green-700 shadow-lg hover:shadow-xl hover:shadow-green-600/25 active:scale-[0.98]",
        warning: "bg-yellow-500 text-white hover:bg-yellow-600 shadow-lg hover:shadow-xl hover:shadow-yellow-500/25 active:scale-[0.98]",
        gradient: "bg-gradient-to-r from-pakistani_green-600 to-pakistani_green-700 text-white hover:from-pakistani_green-700 hover:to-pakistani_green-800 shadow-lg hover:shadow-xl hover:shadow-pakistani_green-600/30 active:scale-[0.98]",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-12 rounded-lg px-8 text-base font-semibold",
        xl: "h-14 rounded-xl px-10 text-lg font-semibold",
        icon: "h-10 w-10",
        "icon-sm": "h-8 w-8",
        "icon-lg": "h-12 w-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  loading?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, loading = false, children, disabled, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <>
            <Loader2 className="absolute h-4 w-4 animate-spin" />
            <span className="opacity-0">{children}</span>
          </>
        )}
        {!loading && children}
      </Comp>
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
