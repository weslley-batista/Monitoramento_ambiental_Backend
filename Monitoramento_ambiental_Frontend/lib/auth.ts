import { api } from './api'

export interface User {
  id: string
  email: string
  name: string
  role: string
}

export interface LoginResponse {
  access_token: string
  user: User
}

class AuthService {
  async login(email: string, password: string): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>('/auth/login', {
      email,
      password,
    })
    return response.data
  }

  setAuth(token: string, user: User) {
    localStorage.setItem('access_token', token)
    localStorage.setItem('user', JSON.stringify(user))
  }

  getAuth(): { token: string | null; user: User | null } {
    const token = localStorage.getItem('access_token')
    const userStr = localStorage.getItem('user')
    const user = userStr ? JSON.parse(userStr) : null
    return { token, user }
  }

  logout() {
    localStorage.removeItem('access_token')
    localStorage.removeItem('user')
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('access_token')
  }
}

export const authService = new AuthService()

