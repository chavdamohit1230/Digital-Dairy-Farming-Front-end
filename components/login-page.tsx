"use client"

import { useState } from "react"
import { useAuth } from "@/lib/auth-context"
import type { UserRole } from "@/lib/data"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Milk, ShieldCheck, Users, Calculator, Tractor, Eye, EyeOff } from "lucide-react"

const roleCards: { role: UserRole; label: string; icon: React.ReactNode; description: string }[] = [
  { role: "admin", label: "Admin (Owner)", icon: <ShieldCheck className="h-8 w-8" />, description: "Full access to all modules" },
  { role: "manager", label: "Manager", icon: <Users className="h-8 w-8" />, description: "Manage farm operations" },
  { role: "worker", label: "Worker", icon: <Tractor className="h-8 w-8" />, description: "Daily tasks & milk entry" },
  { role: "accountant", label: "Accountant", icon: <Calculator className="h-8 w-8" />, description: "Finance & reports" },
]

export function LoginPage() {
  const { login, loginAs } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [mode, setMode] = useState<"login" | "quick">("quick")

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    if (!login(email, password)) {
      setError("Invalid email or password")
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="h-14 w-14 rounded-xl bg-primary flex items-center justify-center">
              <Milk className="h-8 w-8 text-primary-foreground" />
            </div>
            <div className="text-left">
              <h1 className="text-3xl font-bold text-foreground tracking-tight">DairyPro</h1>
              <p className="text-sm text-muted-foreground">Digital Dairy Farm Management</p>
            </div>
          </div>
          <p className="text-muted-foreground max-w-md mx-auto">
            Complete buffalo dairy farm management solution for tracking milk production, finances, health, and operations.
          </p>
        </div>

        {/* Toggle */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <Button
            variant={mode === "quick" ? "default" : "outline"}
            onClick={() => setMode("quick")}
            className="text-sm"
          >
            Quick Login
          </Button>
          <Button
            variant={mode === "login" ? "default" : "outline"}
            onClick={() => setMode("login")}
            className="text-sm"
          >
            Email Login
          </Button>
        </div>

        {mode === "quick" ? (
          <div>
            <p className="text-center text-sm text-muted-foreground mb-4">Select a role to explore the application</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {roleCards.map((rc) => (
                <Card
                  key={rc.role}
                  className="cursor-pointer transition-all hover:shadow-lg hover:border-primary group"
                  onClick={() => loginAs(rc.role)}
                >
                  <CardContent className="flex items-center gap-4 p-6">
                    <div className="h-14 w-14 rounded-xl bg-secondary flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors shrink-0">
                      {rc.icon}
                    </div>
                    <div>
                      <h3 className="font-semibold text-card-foreground">{rc.label}</h3>
                      <p className="text-sm text-muted-foreground">{rc.description}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ) : (
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle className="text-card-foreground">Sign In</CardTitle>
              <CardDescription>Enter your credentials to access the farm dashboard</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@dairyfarm.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                {error && <p className="text-sm text-destructive">{error}</p>}
                <Button type="submit" className="w-full">
                  Sign In
                </Button>
                <p className="text-xs text-muted-foreground text-center">
                  Demo accounts: admin@dairyfarm.com, manager@dairyfarm.com, worker@dairyfarm.com, accountant@dairyfarm.com (any password)
                </p>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
