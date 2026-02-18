"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { dashboardData, dailyMilkData, monthlyFinanceData, alerts } from "@/lib/data"
import { useAuth } from "@/lib/auth-context"
import {
  Bug as Buffalo, Milk, Baby, HeartPulse, IndianRupee, TrendingUp,
  AlertTriangle, CalendarClock, Droplets, Activity
} from "lucide-react"
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, Legend, AreaChart, Area
} from "recharts"

const statCards = [
  { label: "Total Buffalo", value: dashboardData.totalBuffalo, icon: <Buffalo className="h-5 w-5" />, color: "bg-primary/10 text-primary" },
  { label: "Lactating", value: dashboardData.lactating, icon: <Milk className="h-5 w-5" />, color: "bg-chart-1/10 text-chart-1" },
  { label: "Pregnant", value: dashboardData.pregnant, icon: <Baby className="h-5 w-5" />, color: "bg-chart-2/10 text-chart-2" },
  { label: "Dry", value: dashboardData.dry, icon: <Droplets className="h-5 w-5" />, color: "bg-chart-3/10 text-chart-3" },
  { label: "Sick", value: dashboardData.sick, icon: <HeartPulse className="h-5 w-5" />, color: "bg-destructive/10 text-destructive" },
  { label: "Today Milk (L)", value: dashboardData.todayMilk, icon: <Activity className="h-5 w-5" />, color: "bg-chart-4/10 text-chart-4" },
  { label: "Today Income", value: `Rs ${dashboardData.todayIncome.toLocaleString()}`, icon: <TrendingUp className="h-5 w-5" />, color: "bg-chart-1/10 text-chart-1" },
  { label: "Today Profit", value: `Rs ${dashboardData.todayProfit.toLocaleString()}`, icon: <IndianRupee className="h-5 w-5" />, color: "bg-primary/10 text-primary" },
]

const severityStyles = {
  error: "bg-destructive/10 text-destructive border-destructive/20",
  warning: "bg-warning/10 text-warning border-warning/20",
  info: "bg-chart-2/10 text-chart-2 border-chart-2/20",
}

export function DashboardPage() {
  const { user } = useAuth()

  return (
    <div className="flex flex-col gap-6">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Welcome back, {user?.name}</h1>
        <p className="text-muted-foreground text-sm">
          Here is an overview of your dairy farm today - Feb 17, 2026
        </p>
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Milk Production Chart */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base text-card-foreground">Daily Milk Production (Last 7 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailyMilkData}>
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
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyFinanceData}>
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
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Profit Trend */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base text-card-foreground">Monthly Profit Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyFinanceData}>
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
          </div>
        </CardContent>
      </Card>

      {/* Key Info & Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Stats */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base text-card-foreground">Production Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-3">
              <div className="flex justify-between items-center py-2 border-b border-border">
                <span className="text-sm text-muted-foreground">Month Milk Production</span>
                <span className="font-semibold text-card-foreground">{dashboardData.monthMilk} L</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-border">
                <span className="text-sm text-muted-foreground">Avg per Buffalo</span>
                <span className="font-semibold text-card-foreground">{dashboardData.avgMilkPerBuffalo} L/day</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-border">
                <span className="text-sm text-muted-foreground">Best Performer</span>
                <span className="font-semibold text-card-foreground">{dashboardData.bestPerformer}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-border">
                <span className="text-sm text-muted-foreground">Avg Fat %</span>
                <span className="font-semibold text-card-foreground">{dashboardData.avgFatPercent}%</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-border">
                <span className="text-sm text-muted-foreground">Monthly Expense</span>
                <span className="font-semibold text-card-foreground">Rs {(170000).toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-sm text-muted-foreground">Monthly Net Profit</span>
                <span className="font-bold text-primary">Rs {dashboardData.monthProfit.toLocaleString()}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Alerts */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-warning" />
              <CardTitle className="text-base text-card-foreground">Alerts & Reminders</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-2 max-h-72 overflow-y-auto">
              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`flex items-start gap-2 p-3 rounded-lg border text-sm ${severityStyles[alert.severity]}`}
                >
                  <CalendarClock className="h-4 w-4 mt-0.5 shrink-0" />
                  <span>{alert.message}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
