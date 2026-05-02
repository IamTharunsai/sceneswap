'use client'

import { useState, useEffect, useRef } from 'react'
import { Bell } from 'lucide-react'
import { getIdToken } from '@/lib/clients/firebase'

interface Notification {
  id: string
  type: string
  title: string
  body: string
  read: boolean
  created_at: string
  data: Record<string, string> | null
}

export function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unread, setUnread] = useState(0)
  const [open, setOpen] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)

  async function fetchNotifications() {
    try {
      const token = await getIdToken()
      if (!token) return
      const res = await fetch('/api/notifications', {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) return
      const data = await res.json()
      setNotifications(data.notifications ?? [])
      setUnread(data.unreadCount ?? 0)
    } catch {
      // silent fail — bell is non-critical
    }
  }

  // Poll every 30s
  useEffect(() => {
    fetchNotifications()
    const interval = setInterval(fetchNotifications, 30_000)
    return () => clearInterval(interval)
  }, [])

  // Close on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    if (open) document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  async function handleOpen() {
    setOpen(o => !o)
    if (!open && unread > 0) {
      try {
        const token = await getIdToken()
        await fetch('/api/notifications', {
          method: 'PATCH',
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ ids: [] }),
        })
        setUnread(0)
        setNotifications(prev => prev.map(n => ({ ...n, read: true })))
      } catch {
        // silent
      }
    }
  }

  return (
    <div className="relative" ref={panelRef}>
      <button
        onClick={handleOpen}
        className="relative p-2 rounded-lg hover:bg-surface-3 transition-colors"
        aria-label="Notifications"
      >
        <Bell size={18} className="text-text-secondary" />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-lime text-black text-[10px] font-bold rounded-full flex items-center justify-center">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-10 w-80 bg-surface-1 border border-border rounded-xl shadow-2xl z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <p className="text-sm font-semibold text-text-primary">Notifications</p>
            {notifications.some(n => !n.read) && (
              <button className="text-xs text-lime hover:underline" onClick={handleOpen}>
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="py-8 text-center">
                <p className="text-text-muted text-sm">No notifications yet</p>
              </div>
            ) : (
              notifications.map(n => (
                <div
                  key={n.id}
                  className={`px-4 py-3 border-b border-border/50 last:border-0 hover:bg-surface-2 transition-colors ${!n.read ? 'bg-lime/3' : ''}`}
                >
                  <div className="flex items-start gap-2">
                    {!n.read && <div className="w-1.5 h-1.5 rounded-full bg-lime mt-1.5 shrink-0" />}
                    <div className={!n.read ? '' : 'pl-3.5'}>
                      <p className="text-sm font-medium text-text-primary">{n.title}</p>
                      <p className="text-xs text-text-muted mt-0.5 leading-relaxed">{n.body}</p>
                      <p className="text-xs text-text-muted mt-1">
                        {new Date(n.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
