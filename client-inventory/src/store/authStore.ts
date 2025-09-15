import { create } from "zustand"
import { persist } from 'zustand/middleware'

type User = {
  id: string
  fullName: string
  familyName: null
  givenName: null
  email: string
  avatar: string
  avatarFallback: string
  token: string
  role: string
  status: string
  createdAt: string
  accounts?: { provider: 'google' | 'github' }[]
  salesforceAccountId?: string
}

type AuthState = {
  user: User | null
  setUser: (user: User) => void
  clearUser: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      setUser: (user) => set({ user }),
      clearUser: () => set({ user: null }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user }),
    }
  )
)
