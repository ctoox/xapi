import * as React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface StatCardProps {
  title: string
  value: string | number
  change?: number
  icon?: React.ReactNode
  trend?: 'up' | 'down' | 'neutral'
  color?: 'default' | 'success' | 'warning' | 'danger'
}

export function StatCard({
  title,
  value,
  change,
  icon,
  trend = 'neutral',
  color = 'default'
}: StatCardProps) {
  const colorClasses = {
    default: 'text-primary',
    success: 'text-green-600 dark:text-green-400',
    warning: 'text-yellow-600 dark:text-yellow-400',
    danger: 'text-red-600 dark:text-red-400'
  }

  const trendIcon = {
    up: '↑',
    down: '↓',
    neutral: '→'
  }

  return (
    <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-md border border-white/20 dark:border-gray-700/50">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className={cn("text-2xl font-bold mt-1", colorClasses[color])}>
              {value}
            </p>
            {change !== undefined && (
              <p className={cn(
                "text-xs mt-1",
                change >= 0 ? "text-green-600" : "text-red-600"
              )}>
                {trendIcon[trend]} {Math.abs(change)}%
                {change >= 0 ? ' increase' : ' decrease'}
              </p>
            )}
          </div>
          {icon && (
            <div className="p-3 bg-primary/10 rounded-full">
              {icon}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
