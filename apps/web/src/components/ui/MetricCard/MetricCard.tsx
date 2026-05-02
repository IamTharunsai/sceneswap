import { cn } from '@/lib/utils/cn'
import type { LucideIcon } from 'lucide-react'

interface MetricCardProps {
  label: string
  value: string
  icon?: LucideIcon
  trend?: { value: string; positive: boolean }
  highlight?: boolean
  className?: string
}

export function MetricCard({ label, value, icon: Icon, trend, highlight, className }: MetricCardProps) {
  return (
    <div className={cn('card', highlight && 'border-lime/30', className)}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-text-secondary">{label}</span>
        {Icon && (
          <div className="w-8 h-8 rounded-lg bg-surface-2 flex items-center justify-center">
            <Icon size={16} className="text-text-secondary" />
          </div>
        )}
      </div>
      <p className={cn('text-metric-sm font-mono', highlight ? 'text-lime' : 'text-text-primary')}>
        {value}
      </p>
      {trend && (
        <p className={cn('text-xs mt-1.5', trend.positive ? 'text-success' : 'text-error')}>
          {trend.positive ? '↑' : '↓'} {trend.value}
        </p>
      )}
    </div>
  )
}
