import { createContext, useContext, useState } from 'react'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('user')) || null
    } catch {
      return null
    }
  })
  const [token, setToken] = useState(
    localStorage.getItem('token') || null
  )

  const login = (userData, tokenData) => {
    setUser(userData)
    setToken(tokenData)
    localStorage.setItem('user', JSON.stringify(userData))
    localStorage.setItem('token', tokenData)
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('user')
    localStorage.removeItem('token')
  }

  // ADMIN has access to everything, others check permissions list
  const hasPermission = (page) => {
    if (!user) return false
    if (user.role === 'ADMIN') return true
    if (!user.permissions) return false
    return user.permissions.includes(page)
  }

  return (
    <AuthContext.Provider value={{
      user, token, login, logout,
      shopId: user?.shopId,
      userId: user?.userId,
      hasPermission
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}