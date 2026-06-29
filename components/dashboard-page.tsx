"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/lib/auth-context"
import { useI18n } from "@/lib/i18n/context"
import {
  Bug as Buffalo, Milk, Baby, HeartPulse, IndianRupee, TrendingUp,
  AlertTriangle, CalendarClock, Droplets, Activity, Loader2, RefreshCw, AlertCircle
} from "lucide-react"
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, Legend, AreaChart, Area
} from "recharts"
import { Button } from "@/components/ui/button"

// ─── Types ─────────────────────────────────────────────────────────────────
interface DashboardData {
  animals: { total: number; lactating: number; pregnant: number; dry: number; sick: number }
  milk: { todayMilk: number; avgMilkPerBuffalo: number; bestPerformer: string; avgFatPercent: number }
  finance: { todayIncome: number; todayExpense: number; todayProfit: number; monthProfit: number; monthExpense: number }
  charts: {
    dailyMilk: { day: string; morning: number; evening: number; total: number }[]
    monthlyFinance: { month: string; income: number; expense: number; profit: number }[]
  }
  alerts: { id: number; type: string; message: string; severity: "info" | "warning" | "error" }[]
}

const severityStyles = {
  error: "bg-destructive/10 text-destructive border-destructive/20",
  warning: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800",
  info: "bg-chart-2/10 text-chart-2 border-chart-2/20",
}

const today = new Date().toLocaleDateString("en-IN", {
  day: "numeric", month: "long", year: "numeric"
})

export function DashboardPage() {
  const { user } = useAuth()
  const { t } = useI18n()
  const [data, setData] = useState<DashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchDashboard = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/dashboard")
      const json = await res.json()
      if (json.success) {
        setData(json.data)
      } else {
        setError(json.message || "Failed to load dashboard data.")
      }
    } catch {
      setError("Cannot reach the database. Check your MongoDB connection in .env.local.")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => { fetchDashboard() }, [])

  // ─── Derived stat cards from live data ────────────────────────────────────
  const statCards = data
    ? [
        { label: `${t.common.total} ${t.nav.buffalo}`, value: data.animals.total, icon: <Buffalo className="h-5 w-5" />, color: "bg-primary/10 text-primary" },
        { label: t.animal.stages.lactating, value: data.animals.lactating, icon: <Milk className="h-5 w-5" />, color: "bg-chart-1/10 text-chart-1" },
        { label: t.animal.stages.pregnant, value: data.animals.pregnant, icon: <Baby className="h-5 w-5" />, color: "bg-chart-2/10 text-chart-2" },
        { label: t.animal.stages.dry, value: data.animals.dry, icon: <Droplets className="h-5 w-5" />, color: "bg-chart-3/10 text-chart-3" },
        { label: t.animal.stages.sick, value: data.animals.sick, icon: <HeartPulse className="h-5 w-5" />, color: "bg-destructive/10 text-destructive" },
        { label: `${t.common.today} ${t.milk.totalYield}`, value: data.milk.todayMilk, icon: <Activity className="h-5 w-5" />, color: "bg-chart-4/10 text-chart-4" },
        { label: `${t.common.today} ${t.finance.income}`, value: `Rs ${data.finance.todayIncome.toLocaleString()}`, icon: <TrendingUp className="h-5 w-5" />, color: "bg-chart-1/10 text-chart-1" },
        { label: `${t.common.today} ${t.finance.profitLoss}`, value: `Rs ${data.finance.todayProfit.toLocaleString()}`, icon: <IndianRupee className="h-5 w-5" />, color: "bg-primary/10 text-primary" },
      ]
    : []

  // ─── Loading state ─────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-80 gap-3">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-muted-foreground text-sm">Loading live data from database…</p>
      </div>
    )
  }

  // ─── Error state ──────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-80 gap-4">
        <AlertCircle className="h-10 w-10 text-destructive" />
        <p className="text-sm font-medium text-destructive text-center max-w-sm">{error}</p>
        <Button variant="outline" onClick={fetchDashboard}>
          <RefreshCw className="h-4 w-4 mr-2" /> Retry
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Welcome back, {user?.name}</h1>
          <p className="text-muted-foreground text-sm">
            Live overview of your dairy farm · {today}
          </p>
        </div>
        <Button variant="outline" size="icon" onClick={fetchDashboard} title="Refresh from database">
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-4 flex items-center gap-3">
              <div className={`h-10 w-10 rounded-lg flex items-center justify-center shrink-0 ${stat.color}`}>
                {stat.icon}
              </div>
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground truncate">{stat.label}</p>
                <p className="text-xl font-bold text-card-foreground">{stat.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Row */}
      {data && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Milk Production Chart */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base text-card-foreground">Daily Milk Production (Last 7 Days)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                {data.charts.dailyMilk.every((d) => d.total === 0) ? (
                  <div className="h-full flex flex-col items-center justify-center text-muted-foreground gap-2">
                    <Milk className="h-8 w-8 opacity-30" />
                    <p className="text-sm">No milk entries recorded yet.</p>
                    <p className="text-xs">Add entries in the Milk Production page.</p>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.charts.dailyMilk}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                      <XAxis dataKey="day" fontSize={12} tick={{ fill: 'var(--muted-foreground)' }} />
                      <YAxis fontSize={12} tick={{ fill: 'var(--muted-foreground)' }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'var(--card)',
                          border: '1px solid var(--border)',
                          borderRadius: '8px',
                          color: 'var(--card-foreground)',
                        }}
                      />
                      <Legend />
                      <Bar dataKey="morning" name="Morning" fill="var(--chart-1)" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="evening" name="Evening" fill="var(--chart-4)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Income vs Expense */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base text-card-foreground">Income vs Expense (Monthly)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                {data.charts.monthlyFinance.every((d) => d.income === 0 && d.expense === 0) ? (
                  <div className="h-full flex flex-col items-center justify-center text-muted-foreground gap-2">
                    <IndianRupee className="h-8 w-8 opacity-30" />
                    <p className="text-sm">No financial transactions recorded yet.</p>
                    <p className="text-xs">Add transactions in the Finance page.</p>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data.charts.monthlyFinance}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                      <XAxis dataKey="month" fontSize={12} tick={{ fill: 'var(--muted-foreground)' }} />
                      <YAxis fontSize={12} tick={{ fill: 'var(--muted-foreground)' }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'var(--card)',
                          border: '1px solid var(--border)',
                          borderRadius: '8px',
                          color: 'var(--card-foreground)',
                        }}
                        formatter={(value: number) => `Rs ${value.toLocaleString()}`}
                      />
                      <Legend />
                      <Area type="monotone" dataKey="income" name="Income" stroke="var(--chart-1)" fill="var(--chart-1)" fillOpacity={0.15} />
                      <Area type="monotone" dataKey="expense" name="Expense" stroke="var(--chart-3)" fill="var(--chart-3)" fillOpacity={0.15} />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Profit Trend */}
      {data && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base text-card-foreground">Monthly Profit Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48">
              {data.charts.monthlyFinance.every((d) => d.profit === 0) ? (
                <div className="h-full flex flex-col items-center justify-center text-muted-foreground gap-2">
                  <TrendingUp className="h-8 w-8 opacity-30" />
                  <p className="text-sm">No profit data available yet.</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data.charts.monthlyFinance}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="month" fontSize={12} tick={{ fill: 'var(--muted-foreground)' }} />
                    <YAxis fontSize={12} tick={{ fill: 'var(--muted-foreground)' }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'var(--card)',
                        border: '1px solid var(--border)',
                        borderRadius: '8px',
                        color: 'var(--card-foreground)',
                      }}
                      formatter={(value: number) => `Rs ${value.toLocaleString()}`}
                    />
                    <Line type="monotone" dataKey="profit" name="Profit" stroke="var(--chart-1)" strokeWidth={3} dot={{ fill: 'var(--chart-1)', strokeWidth: 2 }} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Key Info & Alerts */}
      {data && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Production Summary */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base text-card-foreground">Production Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-3">
                <div className="flex justify-between items-center py-2 border-b border-border">
                  <span className="text-sm text-muted-foreground">Avg per Buffalo</span>
                  <span className="font-semibold text-card-foreground">{data.milk.avgMilkPerBuffalo} L/day</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-border">
                  <span className="text-sm text-muted-foreground">Best Performer</span>
                  <span className="font-semibold text-card-foreground">{data.milk.bestPerformer}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-border">
                  <span className="text-sm text-muted-foreground">Avg Fat %</span>
                  <span className="font-semibold text-card-foreground">{data.milk.avgFatPercent}%</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-border">
                  <span className="text-sm text-muted-foreground">Monthly Expense</span>
                  <span className="font-semibold text-card-foreground">Rs {data.finance.monthExpense.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm text-muted-foreground">Monthly Net Profit</span>
                  <span className="font-bold text-primary">Rs {data.finance.monthProfit.toLocaleString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Alerts from DB */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
                <CardTitle className="text-base text-card-foreground">
                  Alerts & Reminders
                  {data.alerts.length > 0 && (
                    <Badge variant="destructive" className="ml-2 text-xs">{data.alerts.length}</Badge>
                  )}
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-2 max-h-72 overflow-y-auto">
                {data.alerts.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-muted-foreground gap-2">
                    <AlertTriangle className="h-8 w-8 opacity-30" />
                    <p className="text-sm">No alerts — everything looks good! 🎉</p>
                  </div>
                ) : (
                  data.alerts.map((alert) => (
                    <div
                      key={alert.id}
                      className={`flex items-start gap-2 p-3 rounded-lg border text-sm ${severityStyles[alert.severity]}`}
                    >
                      <CalendarClock className="h-4 w-4 mt-0.5 shrink-0" />
                      <span>{alert.message}</span>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
