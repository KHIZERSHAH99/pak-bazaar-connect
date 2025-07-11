
import * as React from "react"
import { cn } from "@/lib/utils"

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    variant?: "default" | "elevated" | "outlined" | "ghost" | "interactive"
    hover?: boolean
  }
>(({ className, variant = "default", hover = false, ...props }, ref) => {
  const variantClasses = {
    default: "bg-card text-card-foreground shadow-sm border border-border/50",
    elevated: "bg-card text-card-foreground shadow-lg border-0 shadow-black/5 dark:shadow-black/20",
    outlined: "bg-card text-card-foreground border-2 border-pakistani_green-200 dark:border-pakistani_green-800 shadow-none",
    ghost: "bg-transparent text-card-foreground shadow-none border-0",
    interactive: "bg-card text-card-foreground shadow-md border border-border/50 hover:shadow-lg hover:shadow-pakistani_green-600/10 hover:-translate-y-1 cursor-pointer transition-all duration-300"
  }
  
  return (
    <div
      ref={ref}
      className={cn(
        "rounded-xl transition-all duration-200",
        variantClasses[variant],
        hover && !variant.includes('interactive') && "hover:shadow-lg hover:shadow-black/5 hover:-translate-y-0.5",
        className
      )}
      {...props}
    />
  )
})
Card.displayName = "Card"

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-2 p-6", className)}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-xl font-semibold leading-tight tracking-tight font-poppins text-foreground",
      className
    )}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground font-poppins leading-relaxed", className)}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
