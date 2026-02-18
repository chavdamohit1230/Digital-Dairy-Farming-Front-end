"use client"

import { createContext, useContext, useState, type ReactNode } from "react"
import { type User, type UserRole, users, rolePermissions } from "./data"

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => boolean
  loginAs: (role: UserRole) => void
  logout: () => void
  hasPermission: (module: string) => boolean
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)

  const login = (email: string, _password: string) => {
    const found = users.find((u) => u.email === email)
    if (found) {
      setUser(found)
      return true
    }
    return false
  }

  const loginAs = (role: UserRole) => {
    const found = users.find((u) => u.role === role)
    if (found) setUser(found)
  }

  const logout = () => setUser(null)

  const hasPermission = (module: string) => {
    if (!user) return false
    return rolePermissions[user.role].includes(module)
  }

  return (
    <AuthContext.Provider value={{ user, login, loginAs, logout, hasPermission }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error("useAuth must be used within AuthProvider")
  return context
}
