import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { AlertCircle, CheckCircle, Info, AlertTriangle, X } from "lucide-react"

const alertVariants = cva(
  "relative w-full rounded-lg border p-4 [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground",
  {
    variants: {
      variant: {
        default: "bg-background text-foreground",
        destructive:
          "border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive",
        success:
          "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/20 dark:text-emerald-300 [&>svg]:text-emerald-600 dark:[&>svg]:text-emerald-400",
        warning:
          "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-800 dark:bg-amber-950/20 dark:text-amber-300 [&>svg]:text-amber-600 dark:[&>svg]:text-amber-400",
        info:
          "border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-800 dark:bg-blue-950/20 dark:text-blue-300 [&>svg]:text-blue-600 dark:[&>svg]:text-blue-400",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

const Alert = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof alertVariants>
>(({ className, variant, ...props }, ref) => (
  <div
    ref={ref}
    role="alert"
    className={cn(alertVariants({ variant }), className)}
    {...props}
  />
))
Alert.displayName = "Alert"

const AlertTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h5
    ref={ref}
    className={cn("mb-1 font-medium leading-none tracking-tight", className)}
    {...props}
  />
))
AlertTitle.displayName = "AlertTitle"

const AlertDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm [&_p]:leading-relaxed", className)}
    {...props}
  />
))
AlertDescription.displayName = "AlertDescription"

// Pre-configured alert components
export function AlertDestructive({ 
  title, 
  description, 
  className,
  onClose 
}: { 
  title?: string
  description?: string
  className?: string
  onClose?: () => void
}) {
  return (
    <Alert variant="destructive" className={className}>
      <AlertCircle className="h-4 w-4" />
      <div className="flex-1">
        {title && <AlertTitle>{title}</AlertTitle>}
        {description && <AlertDescription>{description}</AlertDescription>}
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="ml-auto hover:bg-destructive/10 rounded p-1 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </Alert>
  )
}

export function AlertSuccess({ 
  title, 
  description, 
  className,
  onClose 
}: { 
  title?: string
  description?: string
  className?: string
  onClose?: () => void
}) {
  return (
    <Alert variant="success" className={className}>
      <CheckCircle className="h-4 w-4" />
      <div className="flex-1">
        {title && <AlertTitle>{title}</AlertTitle>}
        {description && <AlertDescription>{description}</AlertDescription>}
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="ml-auto hover:bg-emerald-100 dark:hover:bg-emerald-900/30 rounded p-1 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </Alert>
  )
}

export function AlertWarning({ 
  title, 
  description, 
  className,
  onClose 
}: { 
  title?: string
  description?: string
  className?: string
  onClose?: () => void
}) {
  return (
    <Alert variant="warning" className={className}>
      <AlertTriangle className="h-4 w-4" />
      <div className="flex-1">
        {title && <AlertTitle>{title}</AlertTitle>}
        {description && <AlertDescription>{description}</AlertDescription>}
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="ml-auto hover:bg-amber-100 dark:hover:bg-amber-900/30 rounded p-1 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </Alert>
  )
}

export function AlertInfo({ 
  title, 
  description, 
  className,
  onClose 
}: { 
  title?: string
  description?: string
  className?: string
  onClose?: () => void
}) {
  return (
    <Alert variant="info" className={className}>
      <Info className="h-4 w-4" />
      <div className="flex-1">
        {title && <AlertTitle>{title}</AlertTitle>}
        {description && <AlertDescription>{description}</AlertDescription>}
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="ml-auto hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded p-1 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </Alert>
  )
}

export { Alert, AlertTitle, AlertDescription }
