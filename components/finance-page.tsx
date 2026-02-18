"use client"

import { useState } from "react"
import { transactions, monthlyFinanceData } from "@/lib/data"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table"
import { Plus, Download, TrendingUp, TrendingDown, IndianRupee, ArrowUpRight, ArrowDownRight } from "lucide-react"
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  PieChart, Pie, Cell
} from "recharts"

const incomeCategories = ["Milk Sales", "Manure Sales", "Buffalo Sales", "Government Subsidy", "Other"]
const expenseCategories = ["Feed", "Labour", "Medicine", "Electricity", "Water", "Maintenance", "Loan EMI", "Other"]

const COLORS = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)"]

export function FinancePage() {
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [txnType, setTxnType] = useState<"income" | "expense">("income")

  const totalIncome = transactions.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0)
  const totalExpense = transactions.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0)
  const netProfit = totalIncome - totalExpense

  // Group expenses by category for pie chart
  const expenseByCategory = expenseCategories.map((cat) => ({
    name: cat,
    value: transactions.filter((t) => t.type === "expense" && t.category === cat).reduce((s, t) => s + t.amount, 0)
  })).filter((e) => e.value > 0)

  const incomeByCategory = incomeCategories.map((cat) => ({
    name: cat,
    value: transactions.filter((t) => t.type === "income" && t.category === cat).reduce((s, t) => s + t.amount, 0)
  })).filter((e) => e.value > 0)

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Finance & Accounting</h1>
          <p className="text-sm text-muted-foreground">Track income, expenses, and profitability</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" /> Export
          </Button>
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4 mr-2" /> Add Transaction</Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Add Transaction</DialogTitle>
              </DialogHeader>
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <Label>Type</Label>
                  <Select value={txnType} onValueChange={(v) => setTxnType(v as "income" | "expense")}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="income">Income</SelectItem>
                      <SelectItem value="expense">Expense</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label>Category</Label>
                  <Select>
                    <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                    <SelectContent>
                      {(txnType === "income" ? incomeCategories : expenseCategories).map((cat) => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <Label>Amount (Rs)</Label>
                    <Input type="number" placeholder="0" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label>Date</Label>
                    <Input type="date" defaultValue="2026-02-17" />
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label>Description</Label>
                  <Input placeholder="Transaction description" />
                </div>
                <Button className="w-full" onClick={() => setShowAddDialog(false)}>Save Transaction</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <ArrowUpRight className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Income</p>
              <p className="text-2xl font-bold text-primary">Rs {totalIncome.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-destructive/10 flex items-center justify-center shrink-0">
              <ArrowDownRight className="h-6 w-6 text-destructive" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Expense</p>
              <p className="text-2xl font-bold text-destructive">Rs {totalExpense.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-chart-2/10 flex items-center justify-center shrink-0">
              <IndianRupee className="h-6 w-6 text-chart-2" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Net Profit</p>
              <p className={`text-2xl font-bold ${netProfit >= 0 ? "text-primary" : "text-destructive"}`}>
                Rs {netProfit.toLocaleString()}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Chart */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base text-card-foreground">Monthly Income vs Expense</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-56">
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
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Expense Breakdown */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base text-card-foreground">Expense Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={expenseByCategory}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                    fontSize={11}
                  >
                    {expenseByCategory.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--card)',
                      border: '1px solid var(--border)',
                      borderRadius: '8px',
                      color: 'var(--card-foreground)',
                    }}
                    formatter={(value: number) => `Rs ${value.toLocaleString()}`}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Transaction List */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base text-card-foreground">Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Tabs defaultValue="all" className="p-4 pb-0">
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="income">Income</TabsTrigger>
              <TabsTrigger value="expense">Expense</TabsTrigger>
            </TabsList>
            <TabsContent value="all">
              <TransactionTable data={transactions} />
            </TabsContent>
            <TabsContent value="income">
              <TransactionTable data={transactions.filter((t) => t.type === "income")} />
            </TabsContent>
            <TabsContent value="expense">
              <TransactionTable data={transactions.filter((t) => t.type === "expense")} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}

function TransactionTable({ data }: { data: typeof transactions }) {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Amount</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((t) => (
            <TableRow key={t.id}>
              <TableCell>{t.date}</TableCell>
              <TableCell>
                {t.type === "income" ? (
                  <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                    <TrendingUp className="h-3 w-3 mr-1" /> Income
                  </Badge>
                ) : (
                  <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20">
                    <TrendingDown className="h-3 w-3 mr-1" /> Expense
                  </Badge>
                )}
              </TableCell>
              <TableCell>{t.category}</TableCell>
              <TableCell>{t.description}</TableCell>
              <TableCell className={`font-semibold ${t.type === "income" ? "text-primary" : "text-destructive"}`}>
                {t.type === "income" ? "+" : "-"}Rs {t.amount.toLocaleString()}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
