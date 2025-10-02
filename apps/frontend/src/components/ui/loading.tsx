import * as React from "react"
import { cn } from "@/lib/utils"
import { Loader2 } from "lucide-react"

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

export function LoadingSpinner({ size = 'md', className }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
    xl: 'h-12 w-12',
  }

  return (
    <Loader2 
      className={cn(
        "animate-spin text-primary",
        sizeClasses[size],
        className
      )} 
    />
  )
}

interface LoadingCardProps {
  className?: string
  lines?: number
}

export function LoadingCard({ className, lines = 3 }: LoadingCardProps) {
  return (
    <div className={cn("rounded-xl border bg-card p-6", className)}>
      <div className="space-y-4">
        <div className="h-4 bg-muted rounded animate-pulse" />
        {Array.from({ length: lines }).map((_, i) => (
          <div key={i} className="h-3 bg-muted rounded animate-pulse" />
        ))}
      </div>
    </div>
  )
}

interface LoadingListProps {
  className?: string
  items?: number
}

export function LoadingList({ className, items = 5 }: LoadingListProps) {
  return (
    <div className={cn("space-y-4", className)}>
      {Array.from({ length: items }).map((_, i) => (
        <div key={i} className="flex items-center space-x-4 p-4 rounded-lg border">
          <div className="h-12 w-12 bg-muted rounded-lg animate-pulse" />
          <div className="space-y-2 flex-1">
            <div className="h-4 bg-muted rounded animate-pulse w-3/4" />
            <div className="h-3 bg-muted rounded animate-pulse w-1/2" />
          </div>
          <div className="h-6 w-16 bg-muted rounded animate-pulse" />
        </div>
      ))}
    </div>
  )
}

interface LoadingPageProps {
  className?: string
}

export function LoadingPage({ className }: LoadingPageProps) {
  return (
    <div className={cn("container py-8", className)}>
      <div className="space-y-8">
        {/* Header skeleton */}
        <div className="space-y-4">
          <div className="h-8 bg-muted rounded animate-pulse w-64" />
          <div className="h-4 bg-muted rounded animate-pulse w-96" />
        </div>
        
        {/* Stats cards skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-xl border bg-card p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="h-4 bg-muted rounded animate-pulse w-24" />
                  <div className="h-8 bg-muted rounded animate-pulse w-16" />
                </div>
                <div className="h-12 w-12 bg-muted rounded-lg animate-pulse" />
              </div>
            </div>
          ))}
        </div>
        
        {/* Content skeleton */}
        <div className="space-y-6">
          <div className="h-32 bg-muted rounded-xl animate-pulse" />
          <div className="h-64 bg-muted rounded-xl animate-pulse" />
        </div>
      </div>
    </div>
  )
}

interface LoadingButtonProps {
  className?: string
  children?: React.ReactNode
}

export function LoadingButton({ className, children }: LoadingButtonProps) {
  return (
    <button
      disabled
      className={cn(
        "inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium",
        "bg-muted text-muted-foreground cursor-not-allowed",
        className
      )}
    >
      <LoadingSpinner size="sm" className="mr-2" />
      {children || "Loading..."}
    </button>
  )
}

interface LoadingOverlayProps {
  className?: string
  message?: string
}

export function LoadingOverlay({ className, message = "Loading..." }: LoadingOverlayProps) {
  return (
    <div className={cn(
      "fixed inset-0 z-50 flex items-center justify-center",
      "bg-background/80 backdrop-blur-sm",
      className
    )}>
      <div className="flex flex-col items-center space-y-4">
        <LoadingSpinner size="lg" />
        <p className="text-sm text-muted-foreground">{message}</p>
      </div>
    </div>
  )
}
