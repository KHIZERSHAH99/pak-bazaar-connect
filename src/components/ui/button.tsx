
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 font-poppins",
  {
    variants: {
      variant: {
        default: "bg-pakistani_green-600 text-white hover:bg-pakistani_green-700 shadow-md hover:shadow-lg active:scale-[0.98]",
        destructive:
          "bg-red-500 text-white hover:bg-red-600 shadow-md hover:shadow-lg active:scale-[0.98]",
        outline:
          "border-2 border-pakistani_green-600 bg-background text-pakistani_green-600 hover:bg-pakistani_green-50 hover:text-pakistani_green-700 dark:border-pakistani_green-400 dark:text-pakistani_green-200 dark:hover:bg-pakistani_green-900/30 dark:hover:text-white shadow-sm hover:shadow-md active:scale-[0.98]",
        secondary:
          "bg-gray-100 text-gray-900 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700 shadow-sm hover:shadow-md active:scale-[0.98]",
        ghost: "hover:bg-pakistani_green-50 hover:text-pakistani_green-700 dark:hover:bg-pakistani_green-900/20 dark:hover:text-pakistani_green-300",
        link: "text-pakistani_green-600 underline-offset-4 hover:underline dark:text-pakistani_green-400",
        success: "bg-green-500 text-white hover:bg-green-600 shadow-md hover:shadow-lg active:scale-[0.98]",
        warning: "bg-yellow-500 text-white hover:bg-yellow-600 shadow-md hover:shadow-lg active:scale-[0.98]",
      },
      size: {
        default: "h-9 md:h-10 px-3 md:px-4 py-2 text-sm",
        sm: "h-8 rounded-md px-2.5 text-xs",
        lg: "h-11 md:h-12 rounded-lg px-6 md:px-8 text-sm md:text-base",
        xl: "h-12 md:h-14 rounded-lg px-8 md:px-10 text-base md:text-lg",
        icon: "h-9 w-9 md:h-10 md:w-10",
        "icon-sm": "h-8 w-8",
        "icon-lg": "h-11 w-11 md:h-12 md:w-12",
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
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
