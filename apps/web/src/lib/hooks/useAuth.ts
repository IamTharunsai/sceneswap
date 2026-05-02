'use client'

import { useEffect } from 'react'
import { onAuthChange, getIdToken } from '@/lib/clients/firebase'
import { useAuthStore } from '@/store/useAuthStore'

export function useAuthInit() {
  const { setUser, setRole, setCreatorProfile, setBrandProfile, setLoading, clearAll } =
    useAuthStore()

  useEffect(() => {
    const unsubscribe = onAuthChange(async firebaseUser => {
      if (!firebaseUser) {
        clearAll()
        return
      }

      setUser(firebaseUser)

      try {
        const idToken = await getIdToken()
        if (!idToken) { clearAll(); return }

        const res = await fetch('/api/auth/session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ idToken }),
        })

        if (!res.ok) { clearAll(); return }

        const { role, creatorProfile, brandProfile } = await res.json()
        setRole(role)
        if (creatorProfile) setCreatorProfile(creatorProfile)
        if (brandProfile) setBrandProfile(brandProfile)
      } catch {
        clearAll()
      } finally {
        setLoading(false)
      }
    })

    return unsubscribe
  }, [setUser, setRole, setCreatorProfile, setBrandProfile, setLoading, clearAll])
}

export function useAuth() {
  return useAuthStore()
}
