import { create } from 'zustand'
import type { User } from 'firebase/auth'
import type { CreatorProfile, BrandProfile, UserRole } from '@sceneswap/types'

interface AuthState {
  user: User | null
  role: UserRole | null
  creatorProfile: CreatorProfile | null
  brandProfile: BrandProfile | null
  loading: boolean
  error: string | null

  setUser: (user: User | null) => void
  setRole: (role: UserRole | null) => void
  setCreatorProfile: (profile: CreatorProfile | null) => void
  setBrandProfile: (profile: BrandProfile | null) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  clearAll: () => void
}

export const useAuthStore = create<AuthState>(set => ({
  user: null,
  role: null,
  creatorProfile: null,
  brandProfile: null,
  loading: true,
  error: null,

  setUser: user => set({ user }),
  setRole: role => set({ role }),
  setCreatorProfile: creatorProfile => set({ creatorProfile }),
  setBrandProfile: brandProfile => set({ brandProfile }),
  setLoading: loading => set({ loading }),
  setError: error => set({ error }),
  clearAll: () =>
    set({ user: null, role: null, creatorProfile: null, brandProfile: null, loading: false, error: null }),
}))
