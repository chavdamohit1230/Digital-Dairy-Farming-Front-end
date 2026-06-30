"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { type User, type UserRole, users, rolePermissions } from "./data"

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<boolean>
  loginAs: (role: UserRole) => void
  logout: () => void
  hasPermission: (module: string) => boolean
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Restore session on load
    const savedUser = typeof window !== "undefined" ? localStorage.getItem("digital_dairy_user") : null
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser))
      } catch (err) {
        console.error("Failed to parse saved user from localStorage:", err)
      }
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
      const response = await fetch(`${backendUrl}/api/users/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()
      if (response.ok && data.success && data.user) {
        setUser(data.user)
        localStorage.setItem("digital_dairy_token", data.token)
        localStorage.setItem("digital_dairy_user", JSON.stringify(data.user))
        return true
      }
      return false
    } catch (error) {
      console.warn("Backend API login offline or failed. Using local fallback for master admin...", error)

      // Fallback: master admin credentials
      if (email.toLowerCase().trim() === "mohitchavda1230@gmail.com" && password === "Mohit@1230") {
        const fallbackUser: User = {
          id: "1",
          name: "Mohit Chavda",
          email: "mohitchavda1230@gmail.com",
          role: "admin",
          phone: "+91 98765 43210"
        }
        setUser(fallbackUser)
        localStorage.setItem("digital_dairy_user", JSON.stringify(fallbackUser))
        return true
      }
      return false
    }
  }

  const loginAs = (role: UserRole) => {
    const found = users.find((u) => u.role === role)
    if (found) {
      setUser(found)
      localStorage.setItem("digital_dairy_user", JSON.stringify(found))
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("digital_dairy_token")
    localStorage.removeItem("digital_dairy_user")
  }

  const hasPermission = (module: string) => {
    if (!user) return false
    return rolePermissions[user.role]?.includes(module) || false
  }

  if (isLoading) {
    return null // prevent flash of login screen during session restore
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
