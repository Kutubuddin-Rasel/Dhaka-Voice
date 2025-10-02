import * as React from "react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { labels } from "@/lib/design-system"

export interface StatusBadgeProps {
  status: 'PENDING' | 'IN_PROGRESS' | 'RESOLVED'
  size?: 'sm' | 'default' | 'lg'
  className?: string
}

export function StatusBadge({ status, size = 'default', className }: StatusBadgeProps) {
  const statusStyles = {
    PENDING: "bg-amber-100 text-amber-800 border-amber-300 font-medium",
    IN_PROGRESS: "bg-blue-100 text-blue-800 border-blue-300 font-medium", 
    RESOLVED: "bg-emerald-100 text-emerald-800 border-emerald-300 font-medium"
  }
  
  return (
    <Badge
      variant="outline"
      size={size}
      className={cn(
        statusStyles[status],
        className
      )}
    >
      {labels.status[status]}
    </Badge>
  )
}

export interface ComplaintTypeBadgeProps {
  type: 'ROADS' | 'ELECTRICITY' | 'WATER' | 'POLLUTION' | 'TRANSPORT' | 'OTHERS'
  size?: 'sm' | 'default' | 'lg'
  className?: string
}

export function ComplaintTypeBadge({ type, size = 'default', className }: ComplaintTypeBadgeProps) {
  const typeStyles = {
    ROADS: "bg-orange-100 text-orange-800 border-orange-300 font-medium",
    ELECTRICITY: "bg-yellow-100 text-yellow-800 border-yellow-300 font-medium",
    WATER: "bg-cyan-100 text-cyan-800 border-cyan-300 font-medium",
    POLLUTION: "bg-red-100 text-red-800 border-red-300 font-medium",
    TRANSPORT: "bg-green-100 text-green-800 border-green-300 font-medium",
    OTHERS: "bg-slate-100 text-slate-800 border-slate-300 font-medium"
  }
  
  return (
    <Badge
      variant="outline"
      size={size}
      className={cn(
        typeStyles[type],
        className
      )}
    >
      {labels.complaintType[type]}
    </Badge>
  )
}

