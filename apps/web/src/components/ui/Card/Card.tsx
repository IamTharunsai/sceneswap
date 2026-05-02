import { cn } from '@/lib/utils/cn'

interface CardProps {
  variant?: 'default' | 'highlighted'
  className?: string
  children: React.ReactNode
  onClick?: () => void
}

export function Card({ variant = 'default', className, children, onClick }: CardProps) {
  return (
    <div
      className={cn(variant === 'highlighted' ? 'card-highlight' : 'card', className)}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {children}
    </div>
  )
}
