import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { User } from '@/lib/auth'
import { authService } from '@/lib/auth'

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  setUser: (user: User | null) => void
  init: () => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      setUser: (user) => {
        set({ user, isAuthenticated: !!user })
        if (user) {
          authService.setAuth(localStorage.getItem('access_token') || '', user)
        }
      },
      init: () => {
        const { user } = authService.getAuth()
        set({ user, isAuthenticated: !!user })
      },
      logout: () => {
        authService.logout()
        set({ user: null, isAuthenticated: false })
      },
    }),
    {
      name: 'auth-storage',
    }
  )
)

