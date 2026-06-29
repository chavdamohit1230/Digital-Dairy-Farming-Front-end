"use client"

import { useState, useEffect, useCallback } from "react"
import { useI18n } from "@/lib/i18n/context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Download, FileText, Printer, BarChart3, TrendingUp, Milk, Loader2, AlertCircle } from "lucide-react"
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from "recharts"

export function ReportsPage() {
  const { t } = useI18n()
  const [buffaloes, setBuffaloes] = useState<any[]>([])
  const [milkEntries, setMilkEntries] = useState<any[]>([])
  const [monthlyFinance, setMonthlyFinance] = useState<any[]>([])
  const [dashData, setDashData] = useState({ todayMilk: 0, monthMilk: 0, avgMilkPerBuffalo: 0, avgFatPercent: 0 })
  const [isLoading, setIsLoading] = useState(true)

  const fetchData = useCallback(async () => {
    setIsLoading(true)
    try {
      const [resA, resM, resT] = await Promise.all([
        fetch("/api/animals"),
        fetch("/api/milk-entries"),
        fetch("/api/transactions")
      ])
      const [jsonA, jsonM, jsonT] = await Promise.all([resA.json(), resM.json(), resT.json()])
      
      const buffaloList = jsonA.success ? jsonA.data : []
      const milkList = jsonM.success ? jsonM.data : []
      const txns = jsonT.success ? jsonT.data : []

      setBuffaloes(buffaloList)
      setMilkEntries(milkList)

      // Calculate production stats
      const today = new Date().toISOString().slice(0, 10)
      const currentMonth = today.slice(0, 7)
      
      let todayTotal = 0; let monthTotal = 0; let totalFat = 0; let fatCount = 0;
      milkList.forEach((m: any) => {
        if (m.date === today) todayTotal += m.totalQty
        if (m.date.startsWith(currentMonth)) monthTotal += m.totalQty
        if (m.fatPercent) { totalFat += m.fatPercent; fatCount++ }
      })
      const avgFat = fatCount > 0 ? (totalFat / fatCount).toFixed(1) : 0
      const activeBufs = buffaloList.filter((b: any) => b.status === "Active" || b.status === "Milking").length
      const avgMilk = activeBufs > 0 ? (todayTotal / activeBufs).toFixed(1) : 0

      setDashData({ todayMilk: todayTotal, monthMilk: monthTotal, avgMilkPerBuffalo: Number(avgMilk), avgFatPercent: Number(avgFat) })

      // Calculate monthly finance
      const monthMap: Record<string, { income: number, expense: number }> = {}
      txns.forEach((t: any) => {
        if (!t.date) return
        const m = t.date.slice(0, 7)
        if (!monthMap[m]) monthMap[m] = { income: 0, expense: 0 }
        if (t.type === "income") monthMap[m].income += t.amount
        else monthMap[m].expense += t.amount
      })
      
      const financeArr = Object.keys(monthMap).sort().map(m => ({
        month: m,
        income: monthMap[m].income,
        expense: monthMap[m].expense,
        profit: monthMap[m].income - monthMap[m].expense
      })).slice(-6) // last 6 months
      
      setMonthlyFinance(financeArr)

    } catch (e) {
      console.error(e)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const handlePrint = () => { window.print() }

  const handleExportCSV = () => {
    const headers = ["Buffalo", "Morning (L)", "Evening (L)", "Total (L)", "Fat %", "SNF %", "Rating"];
    const rows = milkEntries.map(e => {
      const rating = e.totalQty >= 14 ? "Excellent" : e.totalQty >= 11 ? "Good" : "Average"
      return [e.buffaloName, e.morningQty, e.eveningQty, e.totalQty, e.fatPercent, e.snfPercent, rating]
    });
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "milk_production_report.csv");
    document.body.appendChild(link);
    link.click();
    link.remove();
  }

  // Charts prep
  const buffaloPerformance = buffaloes
    .filter((b) => b.milkYieldPerDay > 0)
    .map((b) => ({
      name: b.name,
      milk: b.milkYieldPerDay,
      fat: b.fatPercentage || 6.5,
      score: Math.round(b.milkYieldPerDay * (b.fatPercentage || 6.5) / 10),
    }))
    .sort((a, b) => b.milk - a.milk)

  const radarData = buffaloPerformance.slice(0, 6).map((b) => ({
    name: b.name,
    milk: b.milk,
    fat: b.fat,
  }))

  if (isLoading) {
    return <div className="flex items-center justify-center h-80 gap-3"><Loader2 className="h-8 w-8 animate-spin text-primary" /><p className="text-muted-foreground text-sm">Loading reports...</p></div>
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t.nav.reports}</h1>
          <p className="text-sm text-muted-foreground">Comprehensive farm reports and analysis from live data</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-2" /> Print
          </Button>
          <Button variant="outline" onClick={handlePrint}>
            <Download className="h-4 w-4 mr-2" /> {t.common.pdf}
          </Button>
          <Button onClick={handleExportCSV} className="bg-emerald-600 hover:bg-emerald-700 text-white">
            <FileText className="h-4 w-4 mr-2" /> {t.common.excel} ({t.common.csv})
          </Button>
        </div>
      </div>

      <Tabs defaultValue="production" className="w-full">
        <TabsList className="w-full flex flex-wrap h-auto gap-1">
          <TabsTrigger value="production">Production</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="profit">{t.finance.profitLoss}</TabsTrigger>
          <TabsTrigger value="feed">Feed Efficiency</TabsTrigger>
        </TabsList>

        {/* Production Report */}
        <TabsContent value="production" className="flex flex-col gap-6 mt-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-xs text-muted-foreground">Today</p>
                <p className="text-2xl font-bold text-primary">{dashData.todayMilk} L</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-xs text-muted-foreground">This Month</p>
                <p className="text-2xl font-bold text-card-foreground">{dashData.monthMilk} L</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-xs text-muted-foreground">Avg/Buffalo</p>
                <p className="text-2xl font-bold text-card-foreground">{dashData.avgMilkPerBuffalo} L</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-xs text-muted-foreground">Avg Fat</p>
                <p className="text-2xl font-bold text-card-foreground">{dashData.avgFatPercent}%</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base text-card-foreground">Milk Production Log</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>{t.nav.buffalo}</TableHead>
                      <TableHead>Morning</TableHead>
                      <TableHead>Evening</TableHead>
                      <TableHead>{t.common.total}</TableHead>
                      <TableHead>Fat %</TableHead>
                      <TableHead>SNF %</TableHead>
                      <TableHead>Rating</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {milkEntries.slice(0, 15).map((e) => (
                      <TableRow key={e.id}>
                        <TableCell className="text-muted-foreground text-xs">{e.date}</TableCell>
                        <TableCell className="font-medium">{e.buffaloName}</TableCell>
                        <TableCell>{e.morningQty} L</TableCell>
                        <TableCell>{e.eveningQty} L</TableCell>
                        <TableCell className="font-semibold">{e.totalQty} L</TableCell>
                        <TableCell>{e.fatPercent}%</TableCell>
                        <TableCell>{e.snfPercent}%</TableCell>
                        <TableCell>
                          {e.totalQty >= 14 ? (
                            <Badge className="bg-emerald-500 text-white border-transparent">Excellent</Badge>
                          ) : e.totalQty >= 11 ? (
                            <Badge variant="outline" className="bg-chart-4/10 text-chart-4">Good</Badge>
                          ) : (
                            <Badge variant="outline" className="bg-chart-3/10 text-chart-3">Average</Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                    {milkEntries.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-6 text-muted-foreground">No milk records found.</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Performance Report */}
        <TabsContent value="performance" className="flex flex-col gap-6 mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base text-card-foreground">Buffalo Milk Yield Ranking</CardTitle>
              </CardHeader>
              <CardContent>
                {buffaloPerformance.length === 0 ? (
                  <div className="h-64 flex items-center justify-center text-sm text-muted-foreground">No active milking buffaloes found.</div>
                ) : (
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={buffaloPerformance} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                        <XAxis type="number" fontSize={12} tick={{ fill: 'var(--muted-foreground)' }} />
                        <YAxis dataKey="name" type="category" fontSize={12} tick={{ fill: 'var(--muted-foreground)' }} width={80} />
                        <Tooltip
                          contentStyle={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--card-foreground)' }}
                        />
                        <Bar dataKey="milk" name="Milk (L/day)" fill="var(--chart-1)" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base text-card-foreground">Milk vs Fat Comparison (Top 6)</CardTitle>
              </CardHeader>
              <CardContent>
                {radarData.length === 0 ? (
                  <div className="h-64 flex items-center justify-center text-sm text-muted-foreground">Not enough data.</div>
                ) : (
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart data={radarData}>
                        <PolarGrid stroke="var(--border)" />
                        <PolarAngleAxis dataKey="name" fontSize={11} tick={{ fill: 'var(--muted-foreground)' }} />
                        <PolarRadiusAxis fontSize={10} tick={{ fill: 'var(--muted-foreground)' }} />
                        <Radar name="Milk (L)" dataKey="milk" stroke="var(--chart-1)" fill="var(--chart-1)" fillOpacity={0.3} />
                        <Radar name="Fat %" dataKey="fat" stroke="var(--chart-3)" fill="var(--chart-3)" fillOpacity={0.3} />
                        <Legend />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Profit Analysis */}
        <TabsContent value="profit" className="flex flex-col gap-6 mt-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base text-card-foreground">Monthly Profit & Loss</CardTitle>
            </CardHeader>
            <CardContent>
              {monthlyFinance.length === 0 ? (
                <div className="h-64 flex items-center justify-center text-sm text-muted-foreground">No financial transactions recorded yet.</div>
              ) : (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlyFinance}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                      <XAxis dataKey="month" fontSize={12} tick={{ fill: 'var(--muted-foreground)' }} />
                      <YAxis fontSize={12} tick={{ fill: 'var(--muted-foreground)' }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                      <Tooltip
                        contentStyle={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--card-foreground)' }}
                        formatter={(value: number) => `₹${value.toLocaleString()}`}
                      />
                      <Legend />
                      <Bar dataKey="income" name="Income" fill="var(--chart-2)" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="expense" name="Expense" fill="var(--destructive)" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="profit" name="Profit" fill="var(--chart-4)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base text-card-foreground">P&L Summary</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Month</TableHead>
                      <TableHead>Income</TableHead>
                      <TableHead>Expense</TableHead>
                      <TableHead>Profit</TableHead>
                      <TableHead>Margin</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {monthlyFinance.map((m) => (
                      <TableRow key={m.month}>
                        <TableCell className="font-medium">{m.month}</TableCell>
                        <TableCell className="text-emerald-600 font-medium">₹{m.income.toLocaleString()}</TableCell>
                        <TableCell className="text-destructive font-medium">₹{m.expense.toLocaleString()}</TableCell>
                        <TableCell className="font-bold text-chart-4">₹{m.profit.toLocaleString()}</TableCell>
                        <TableCell>
                          <Badge className="bg-primary/10 text-primary border-primary/20">
                            {m.income > 0 ? ((m.profit / m.income) * 100).toFixed(1) : 0}%
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                    {monthlyFinance.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">No financial data available.</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Feed Efficiency */}
        <TabsContent value="feed" className="flex flex-col gap-6 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-5 text-center">
                <Milk className="h-8 w-8 mx-auto text-primary mb-2" />
                <p className="text-sm text-muted-foreground">Cost per Litre Milk</p>
                <p className="text-3xl font-bold text-foreground">₹27.5</p>
                <p className="text-xs text-muted-foreground mt-1">Estimated feed cost only</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5 text-center">
                <BarChart3 className="h-8 w-8 mx-auto text-chart-2 mb-2" />
                <p className="text-sm text-muted-foreground">Feed per Buffalo/Day</p>
                <p className="text-3xl font-bold text-foreground">₹220</p>
                <p className="text-xs text-muted-foreground mt-1">All feed types avg</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5 text-center">
                <TrendingUp className="h-8 w-8 mx-auto text-chart-3 mb-2" />
                <p className="text-sm text-muted-foreground">Feed Efficiency</p>
                <p className="text-3xl font-bold text-foreground">3.6x</p>
                <p className="text-xs text-muted-foreground mt-1">Return per ₹ spent</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base text-card-foreground">Per Buffalo Estimated Feed Efficiency</CardTitle>
            </CardHeader>
            <CardContent>
              {buffaloPerformance.length === 0 ? (
                <div className="py-10 text-center text-sm text-muted-foreground">No active milking buffaloes found.</div>
              ) : (
                <div className="flex flex-col gap-3">
                  {buffaloPerformance.map((b) => {
                    const feedCost = 220
                    const milkIncome = b.milk * 60 // Assumes Rs 60 / L
                    const efficiency = milkIncome / feedCost
                    return (
                      <div key={b.name} className="flex items-center justify-between p-3 bg-muted/50 border border-border rounded-xl">
                        <div>
                          <p className="text-sm font-semibold text-foreground">{b.name}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{b.milk} L/day, {b.fat}% fat</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-emerald-600">₹{milkIncome}/day income</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{efficiency.toFixed(1)}x return on feed</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
