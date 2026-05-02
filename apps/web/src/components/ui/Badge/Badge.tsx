import { cn } from '@/lib/utils/cn'

type BadgeVariant = 'active' | 'pending' | 'error' | 'info' | 'lime' | 'default'

interface BadgeProps {
  variant?: BadgeVariant
  children: React.ReactNode
  className?: string
}

const variantClasses: Record<BadgeVariant, string> = {
  active: 'badge-active',
  pending: 'badge-pending',
  error: 'badge-error',
  info: 'badge-info',
  lime: 'badge-lime',
  default: 'bg-surface-3 text-text-secondary border border-border',
}

export function Badge({ variant = 'default', children, className }: BadgeProps) {
  return (
    <span className={cn('badge', variantClasses[variant], className)}>
      {children}
    </span>
  )
}
