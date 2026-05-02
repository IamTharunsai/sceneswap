import type { LucideIcon } from 'lucide-react'
import { Button } from '../Button/Button'

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description: string
  action?: { label: string; onClick: () => void }
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-16 h-16 rounded-xl bg-surface-2 flex items-center justify-center mb-4">
        <Icon size={28} className="text-text-muted" />
      </div>
      <h3 className="text-h3 text-text-primary mb-2">{title}</h3>
      <p className="text-text-secondary max-w-sm">{description}</p>
      {action && (
        <div className="mt-6">
          <Button onClick={action.onClick}>{action.label}</Button>
        </div>
      )}
    </div>
  )
}
