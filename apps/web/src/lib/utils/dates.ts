import { format, formatDistanceToNow, isAfter, isBefore } from 'date-fns'

export function formatDate(date: string | Date): string {
  return format(new Date(date), 'dd MMM yyyy')
}

export function formatDateTime(date: string | Date): string {
  return format(new Date(date), 'dd MMM yyyy, h:mm a')
}

export function timeAgo(date: string | Date): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true })
}

export function isCampaignActive(startDate: string, endDate: string): boolean {
  const now = new Date()
  return isAfter(now, new Date(startDate)) && isBefore(now, new Date(endDate))
}

export function daysRemaining(endDate: string): number {
  const diff = new Date(endDate).getTime() - Date.now()
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
}
