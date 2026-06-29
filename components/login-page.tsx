"use client"

import { useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Milk, Eye, EyeOff, ShieldCheck, ArrowLeft, Loader2 } from "lucide-react"

interface LoginPageProps {
  onBackToLanding: () => void
}

export function LoginPage({ onBackToLanding }: LoginPageProps) {
  const { login } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const success = await login(email, password)
      if (!success) {
        setError("Invalid email or password")
      }
    } catch (err) {
      console.error(err)
      setError("An error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row overflow-hidden bg-slate-50 text-slate-900">
      {/* ───────── Left Hero Panel ───────── */}
      <div
        className="relative lg:w-[45%] lg:h-screen lg:max-h-screen flex flex-col justify-between overflow-hidden p-6 sm:p-8 lg:p-10 shrink-0 shadow-lg"
        style={{
          background: "linear-gradient(145deg, #0f361d 0%, #15803d 50%, #0c2b17 100%)",
        }}
      >
        {/* Animated Background Spotlights */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[10%] left-[10%] w-[300px] h-[300px] rounded-full bg-emerald-400/10 blur-[80px]" />
          <div className="absolute bottom-[20%] right-0 w-[250px] h-[250px] rounded-full bg-green-400/10 blur-[90px]" />
        </div>

        {/* Top Header */}
        <div className="relative z-10">
          <button
            onClick={onBackToLanding}
            className="inline-flex items-center gap-2 text-xs font-bold text-white bg-[#0f361d] border border-white/10 hover:border-white/30 px-3.5 py-1.5 rounded-full transition-all uppercase tracking-wider mb-5 cursor-pointer shadow-sm hover:bg-[#0c2b17]"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Website
          </button>

          <div className="flex items-center gap-2.5 mb-4">
            <div className="h-10 w-10 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center shadow-md">
              <Milk className="h-5.5 w-5.5 text-white" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-white animate-fade-in">Digital Dairy Farming</h1>
          </div>
        </div>

        {/* Center Panel Pitch */}
        <div className="relative z-10 my-auto py-4 lg:py-0">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-[#0f361d] border border-white/15 px-3 py-0.5 text-[10px] font-semibold text-white mb-3">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
            <span>Master Admin Authentication</span>
          </div>
          <h2 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight leading-tight mb-3">
            Modernize Your Dairy Farm Operations
          </h2>
          <p className="text-green-100/90 text-xs sm:text-sm leading-relaxed max-w-md mb-5">
            Log daily milk yields, track heat and calving lifecycle stages, and reconcile cash flow ledgers on a single secure dashboard system.
          </p>

          {/* Solid White Feature Cards - Non-Glassy & Very Compact */}
          <div className="space-y-2.5 max-w-md font-sans">
            {[
              {
                title: "Milk Revenue Calculator",
                desc: "Log daily collection rates, FAT & SNF averages, and forecast center payouts.",
                icon: <Milk className="h-4.5 w-4.5 text-[#15803d]" />
              },
              {
                title: "Automated Heat & Vaccine Alerts",
                desc: "Get scheduled system countdowns for heat periods, dry cycles, and vaccine checks.",
                icon: <ShieldCheck className="h-4.5 w-4.5 text-[#15803d]" />
              },
              {
                title: "Audit-Ready Ledger Sheets",
                desc: "Calculate workers shift advance logs and generate monthly ledger sheets in PDF.",
                icon: <ArrowLeft className="h-4.5 w-4.5 text-[#15803d] rotate-180" />
              }
            ].map((item, idx) => (
              <div
                key={idx}
                className="bg-white border border-slate-100 rounded-xl p-3 flex items-start gap-3 shadow-md transition-all hover:-translate-y-0.5 hover:shadow-lg duration-300"
              >
                <div className="h-8 w-8 rounded-lg bg-green-50 flex items-center justify-center shrink-0 border border-green-100">
                  {item.icon}
                </div>
                <div>
                  <h4 className="text-[11px] font-bold text-slate-900">{item.title}</h4>
                  <p className="text-[10px] text-slate-500 mt-0.5 font-medium leading-normal">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Tagline */}
        <div className="relative z-10 hidden lg:block border-t border-white/15 pt-4">
          <p className="text-[10px] text-white/50 font-medium">
            Authorized Personnel Only • Secure Session Tokens Configured
          </p>
        </div>
      </div>

      {/* ───────── Right Login Form Panel ───────── */}
      <div className="flex-1 flex flex-col justify-center items-center px-6 py-12 lg:py-0 bg-slate-50">
        <div className="w-full max-w-md">
          {/* Welcome Text */}
          <div className="mb-8 text-center lg:text-left">
            <h2 className="text-2xl lg:text-3xl font-bold text-slate-900 mb-2">Master Login</h2>
            <p className="text-slate-600 text-sm">
              Please enter your credentials to open the management portal.
            </p>
          </div>

          <Card className="border-slate-200 bg-white shadow-md">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg text-slate-900">Sign In</CardTitle>
              <CardDescription className="text-slate-500">Validate admin email and password</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="flex flex-col gap-5">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="email" className="text-xs font-semibold text-slate-700">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-11 border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-[#15803d]/45 focus-visible:border-[#15803d]"
                    required
                    disabled={isLoading}
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <Label htmlFor="password" className="text-xs font-semibold text-slate-700">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="h-11 pr-10 border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-[#15803d]/45 focus-visible:border-[#15803d]"
                      required
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      disabled={isLoading}
                    >
                      {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="flex items-center gap-2 text-xs text-rose-600 bg-rose-50 border border-rose-100 p-3 rounded-lg animate-shake">
                    <svg className="h-4 w-4 shrink-0 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {error}
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full h-11 text-sm font-semibold bg-[#15803d] hover:bg-[#166534] text-white cursor-pointer active:scale-[0.99] transition-transform flex items-center justify-center gap-2"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Connecting to Database...
                    </>
                  ) : (
                    "Authorize & Enter"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Footer Back Button */}
          <div className="text-center mt-6">
            <button
              onClick={onBackToLanding}
              className="text-xs text-slate-600 hover:text-slate-800 font-medium inline-flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Return to Landing Page
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
