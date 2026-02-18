"use client"

import { dashboardData, monthlyFinanceData, buffaloes, milkEntries } from "@/lib/data"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table"
import { Download, FileText, Printer, BarChart3, TrendingUp, Milk } from "lucide-react"
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from "recharts"

const buffaloPerformance = buffaloes
  .filter((b) => b.milkYieldPerDay > 0)
  .map((b) => ({
    name: b.name,
    milk: b.milkYieldPerDay,
    fat: b.fatPercentage,
    score: Math.round(b.milkYieldPerDay * b.fatPercentage / 10),
  }))
  .sort((a, b) => b.milk - a.milk)

const radarData = buffaloPerformance.slice(0, 6).map((b) => ({
  name: b.name,
  milk: b.milk,
  fat: b.fat,
}))

export function ReportsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Reports & Analytics</h1>
          <p className="text-sm text-muted-foreground">Comprehensive farm reports and analysis</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Printer className="h-4 w-4 mr-2" /> Print
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" /> PDF
          </Button>
          <Button>
            <FileText className="h-4 w-4 mr-2" /> Excel
          </Button>
        </div>
      </div>

      <Tabs defaultValue="production" className="w-full">
        <TabsList className="w-full flex flex-wrap h-auto gap-1">
          <TabsTrigger value="production">Production</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="profit">Profit Analysis</TabsTrigger>
          <TabsTrigger value="feed">Feed Efficiency</TabsTrigger>
        </TabsList>

        {/* Production Report */}
        <TabsContent value="production" className="flex flex-col gap-6 mt-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-xs text-muted-foreground">Today</p>
                <p className="text-2xl font-bold text-primary">{dashboardData.todayMilk} L</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-xs text-muted-foreground">This Month</p>
                <p className="text-2xl font-bold text-card-foreground">{dashboardData.monthMilk} L</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-xs text-muted-foreground">Avg/Buffalo</p>
                <p className="text-2xl font-bold text-card-foreground">{dashboardData.avgMilkPerBuffalo} L</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-xs text-muted-foreground">Avg Fat</p>
                <p className="text-2xl font-bold text-card-foreground">{dashboardData.avgFatPercent}%</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base text-card-foreground">Daily Production Details</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Buffalo</TableHead>
                      <TableHead>Morning</TableHead>
                      <TableHead>Evening</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Fat %</TableHead>
                      <TableHead>SNF %</TableHead>
                      <TableHead>Rating</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {milkEntries.map((e) => (
                      <TableRow key={e.id}>
                        <TableCell className="font-medium">{e.buffaloName}</TableCell>
                        <TableCell>{e.morningQty} L</TableCell>
                        <TableCell>{e.eveningQty} L</TableCell>
                        <TableCell className="font-semibold">{e.totalQty} L</TableCell>
                        <TableCell>{e.fatPercent}%</TableCell>
                        <TableCell>{e.snfPercent}%</TableCell>
                        <TableCell>
                          {e.totalQty >= 14 ? (
                            <Badge className="bg-primary text-primary-foreground">Excellent</Badge>
                          ) : e.totalQty >= 11 ? (
                            <Badge variant="outline" className="bg-chart-4/10 text-chart-4">Good</Badge>
                          ) : (
                            <Badge variant="outline" className="bg-chart-3/10 text-chart-3">Average</Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
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
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={buffaloPerformance} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                      <XAxis type="number" fontSize={12} tick={{ fill: 'var(--muted-foreground)' }} />
                      <YAxis dataKey="name" type="category" fontSize={12} tick={{ fill: 'var(--muted-foreground)' }} width={60} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'var(--card)',
                          border: '1px solid var(--border)',
                          borderRadius: '8px',
                          color: 'var(--card-foreground)',
                        }}
                      />
                      <Bar dataKey="milk" name="Milk (L/day)" fill="var(--chart-1)" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base text-card-foreground">Milk vs Fat Comparison</CardTitle>
              </CardHeader>
              <CardContent>
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
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyFinanceData}>
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
                    <Bar dataKey="income" name="Income" fill="var(--chart-1)" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="expense" name="Expense" fill="var(--chart-3)" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="profit" name="Profit" fill="var(--chart-4)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
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
                    {monthlyFinanceData.map((m) => (
                      <TableRow key={m.month}>
                        <TableCell className="font-medium">{m.month} 2026</TableCell>
                        <TableCell className="text-primary">Rs {m.income.toLocaleString()}</TableCell>
                        <TableCell className="text-destructive">Rs {m.expense.toLocaleString()}</TableCell>
                        <TableCell className="font-semibold text-chart-4">Rs {m.profit.toLocaleString()}</TableCell>
                        <TableCell>
                          <Badge className="bg-primary text-primary-foreground">
                            {((m.profit / m.income) * 100).toFixed(1)}%
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
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
                <p className="text-3xl font-bold text-foreground">Rs 27.5</p>
                <p className="text-xs text-muted-foreground mt-1">Feed cost only</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5 text-center">
                <BarChart3 className="h-8 w-8 mx-auto text-chart-2 mb-2" />
                <p className="text-sm text-muted-foreground">Feed per Buffalo/Day</p>
                <p className="text-3xl font-bold text-foreground">Rs 220</p>
                <p className="text-xs text-muted-foreground mt-1">All feed types</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5 text-center">
                <TrendingUp className="h-8 w-8 mx-auto text-chart-3 mb-2" />
                <p className="text-sm text-muted-foreground">Feed Efficiency</p>
                <p className="text-3xl font-bold text-foreground">3.6x</p>
                <p className="text-xs text-muted-foreground mt-1">Return per Rs spent</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base text-card-foreground">Per Buffalo Feed Efficiency</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-3">
                {buffaloPerformance.map((b) => {
                  const feedCost = 220
                  const milkIncome = b.milk * 60
                  const efficiency = milkIncome / feedCost
                  return (
                    <div key={b.name} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-foreground">{b.name}</p>
                        <p className="text-xs text-muted-foreground">{b.milk} L/day, {b.fat}% fat</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-primary">Rs {milkIncome}/day income</p>
                        <p className="text-xs text-muted-foreground">{efficiency.toFixed(1)}x return on feed</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
