import * as React from "react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface KeyStatusBadgeProps {
  status: 'active' | 'inactive' | 'exhausted' | 'checking'
  showLabel?: boolean
}

export function KeyStatusBadge({ status, showLabel = true }: KeyStatusBadgeProps) {
  const statusConfig = {
    active: {
      variant: 'success' as const,
      label: 'Active',
      dotColor: 'bg-green-500'
    },
    inactive: {
      variant: 'secondary' as const,
      label: 'Inactive',
      dotColor: 'bg-gray-400'
    },
    exhausted: {
      variant: 'destructive' as const,
      label: 'Exhausted',
      dotColor: 'bg-red-500'
    },
    checking: {
      variant: 'warning' as const,
      label: 'Checking',
      dotColor: 'bg-yellow-500'
    }
  }

  const config = statusConfig[status]

  return (
    <Badge variant={config.variant} className="gap-2">
      <span className={cn("w-2 h-2 rounded-full", config.dotColor)} />
      {showLabel && config.label}
    </Badge>
  )
}

// Helper component for key table row
export function KeyStatusCell({ keyInfo }: { keyInfo: any }) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-600 bg-green-50 dark:bg-green-900/20'
      case 'inactive':
        return 'text-gray-600 bg-gray-50 dark:bg-gray-800/20'
      case 'exhausted':
        return 'text-red-600 bg-red-50 dark:bg-red-900/20'
      default:
        return 'text-gray-600 bg-gray-50 dark:bg-gray-800/20'
    }
  }

  return (
    <div className="flex items-center gap-2">
      <KeyStatusBadge status={keyInfo.status} showLabel={false} />
      <span className={cn("text-xs px-2 py-1 rounded-full", getStatusColor(keyInfo.status))}>
        {keyInfo.status}
      </span>
      {keyInfo.failureCount > 0 && (
        <span className="text-xs text-red-600">
          ({keyInfo.failureCount} failures)
        </span>
      )}
    </div>
  )
}
