"use client"

import { useState, useEffect } from "react"
import { useI18n } from "@/lib/i18n/context"
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
import { Plus, Download, TrendingUp, TrendingDown, IndianRupee, ArrowUpRight, ArrowDownRight, Loader2, RefreshCw, AlertCircle, Trash2 } from "lucide-react"
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  PieChart, Pie, Cell
} from "recharts"

interface Transaction {
  id: string
  type: "income" | "expense"
  category: string
  amount: number
  date: string
  description: string
}

const incomeCategories = ["Milk Sales", "Manure Sales", "Buffalo Sales", "Government Subsidy", "Other"]
const expenseCategories = ["Feed", "Labour", "Medicine", "Electricity", "Water", "Maintenance", "Loan EMI", "Other"]
const COLORS = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)"]

export function FinancePage() {
  const { t } = useI18n()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formError, setFormError] = useState("")

  // Form state
  const [txnType, setTxnType] = useState<"income" | "expense">("income")
  const [formCategory, setFormCategory] = useState("")
  const [formAmount, setFormAmount] = useState("")
  const [formDate, setFormDate] = useState(new Date().toISOString().slice(0, 10))
  const [formDesc, setFormDesc] = useState("")

  // Monthly chart data computed from transactions
  const [monthlyChart, setMonthlyChart] = useState<{ month: string; income: number; expense: number; profit: number }[]>([])

  const fetchTransactions = async () => {
    setIsLoading(true)
    setFetchError(null)
    try {
      const res = await fetch("/api/transactions")
      const json = await res.json()
      if (json.success) {
        setTransactions(json.data)
        buildMonthlyChart(json.data)
      } else {
        setFetchError(json.message || "Failed to load transactions.")
      }
    } catch {
      setFetchError("Cannot reach the database. Check your MongoDB connection.")
    } finally {
      setIsLoading(false)
    }
  }

  const buildMonthlyChart = (data: Transaction[]) => {
    const last6: { month: string; income: number; expense: number; profit: number }[] = []
    for (let i = 5; i >= 0; i--) {
      const d = new Date()
      d.setMonth(d.getMonth() - i)
      const monthKey = d.toISOString().slice(0, 7)
      const monthLabel = d.toLocaleDateString("en-IN", { month: "short" })
      const mTx = data.filter((t) => t.date && t.date.startsWith(monthKey))
      const inc = mTx.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0)
      const exp = mTx.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0)
      last6.push({ month: monthLabel, income: inc, expense: exp, profit: inc - exp })
    }
    setMonthlyChart(last6)
  }

  useEffect(() => { fetchTransactions() }, [])

  const totalIncome = transactions.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0)
  const totalExpense = transactions.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0)
  const netProfit = totalIncome - totalExpense

  const expenseByCategory = expenseCategories.map((cat) => ({
    name: cat,
    value: transactions.filter((t) => t.type === "expense" && t.category === cat).reduce((s, t) => s + t.amount, 0)
  })).filter((e) => e.value > 0)

  const resetForm = () => {
    setTxnType("income"); setFormCategory(""); setFormAmount("")
    setFormDate(new Date().toISOString().slice(0, 10)); setFormDesc(""); setFormError("")
  }

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formCategory || !formAmount || !formDate) {
      setFormError("Please fill in all required fields.")
      return
    }
    setIsSubmitting(true)
    try {
      const res = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: txnType, category: formCategory, amount: Number(formAmount), date: formDate, description: formDesc }),
      })
      const data = await res.json()
      if (data.success) {
        resetForm()
        setShowAddDialog(false)
        fetchTransactions()
      } else {
        setFormError(data.message || "Failed to save transaction.")
      }
    } catch {
      setFormError("Cannot reach the database.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this transaction?")) return
    try {
      const res = await fetch(`/api/transactions?id=${id}`, { method: "DELETE" })
      const data = await res.json()
      if (data.success) {
        const updated = transactions.filter((t) => t.id !== id)
        setTransactions(updated)
        buildMonthlyChart(updated)
      } else {
        alert(data.message || "Delete failed.")
      }
    } catch {
      alert("Cannot reach the database.")
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t.finance.title}</h1>
          <p className="text-sm text-muted-foreground">Track all farm income, expenses, and profitability</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={fetchTransactions} title="Refresh">
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Dialog open={showAddDialog} onOpenChange={(open) => { setShowAddDialog(open); if (!open) resetForm() }}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4 mr-2" /> {t.common.add} {t.finance.transaction}</Button>
            </DialogTrigger>
            <DialogContent className="max-w-md p-0 overflow-hidden rounded-2xl">
        <DialogTitle className="sr-only">Dialog</DialogTitle>
              <div className="bg-slate-800 px-6 py-4 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                  <IndianRupee className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="text-white font-bold text-base">{t.common.add} {t.finance.transaction}</p>
                  <p className="text-slate-400 text-xs">Record income or expense</p>
                </div>
              </div>
              <div className="px-6 py-5">
              {formError && (
                <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-xl p-3 mb-4">
                  <AlertCircle className="h-4 w-4 shrink-0" /> {formError}
                </div>
              )}
                <form onSubmit={handleAdd} className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1.5">
                    <Label>Type <span className="text-destructive">*</span></Label>
                    <Select value={txnType} onValueChange={(v) => { setTxnType(v as "income" | "expense"); setFormCategory("") }}>
                      <SelectTrigger className="rounded-xl h-10"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="income">{t.finance.income}</SelectItem>
                        <SelectItem value="expense">{t.finance.expense}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label>Category <span className="text-destructive">*</span></Label>
                    <Select value={formCategory} onValueChange={setFormCategory}>
                      <SelectTrigger className="rounded-xl h-10"><SelectValue placeholder="Select category" /></SelectTrigger>
                      <SelectContent>
                        {(txnType === "income" ? incomeCategories : expenseCategories).map((cat) => (
                          <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <Label>Amount (₹) <span className="text-destructive">*</span></Label>
                      <Input type="number" min="0" placeholder="0" value={formAmount} onChange={(e) => setFormAmount(e.target.value)} required className="rounded-xl h-10" />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <Label>Date <span className="text-destructive">*</span></Label>
                      <Input type="date" value={formDate} onChange={(e) => setFormDate(e.target.value)} required className="rounded-xl h-10" />
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label>Description</Label>
                    <Input placeholder="Transaction description" value={formDesc} onChange={(e) => setFormDesc(e.target.value)} className="rounded-xl h-10" />
                  </div>
                  <Button type="submit" className="w-full h-11 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white mt-2" disabled={isSubmitting}>
                    {isSubmitting ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Saving...</> : <><Plus className="h-4 w-4 mr-2" /> {t.common.add} {t.finance.transaction}</>}
                  </Button>
                </form>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Loading / Error */}
      {isLoading && (
        <div className="flex items-center justify-center h-40 gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground text-sm">Loading from database…</p>
        </div>
      )}
      {!isLoading && fetchError && (
        <div className="flex flex-col items-center justify-center h-40 gap-3">
          <AlertCircle className="h-8 w-8 text-destructive" />
          <p className="text-sm text-destructive">{fetchError}</p>
          <Button variant="outline" size="sm" onClick={fetchTransactions}><RefreshCw className="h-3.5 w-3.5 mr-1" /> Retry</Button>
        </div>
      )}

      {!isLoading && !fetchError && (
        <>
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-5 flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <ArrowUpRight className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t.common.total} {t.finance.income}</p>
                  <p className="text-2xl font-bold text-primary">
                    {totalIncome > 0 ? `Rs ${totalIncome.toLocaleString()}` : "Rs 0"}
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5 flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-destructive/10 flex items-center justify-center shrink-0">
                  <ArrowDownRight className="h-6 w-6 text-destructive" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t.common.total} {t.finance.expense}</p>
                  <p className="text-2xl font-bold text-destructive">
                    {totalExpense > 0 ? `Rs ${totalExpense.toLocaleString()}` : "Rs 0"}
                  </p>
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
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base text-card-foreground">Monthly Income vs Expense</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-56">
                  {monthlyChart.every((d) => d.income === 0 && d.expense === 0) ? (
                    <div className="h-full flex flex-col items-center justify-center text-muted-foreground gap-2">
                      <IndianRupee className="h-8 w-8 opacity-30" />
                      <p className="text-sm">No transactions recorded yet.</p>
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={monthlyChart}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                        <XAxis dataKey="month" fontSize={12} tick={{ fill: 'var(--muted-foreground)' }} />
                        <YAxis fontSize={12} tick={{ fill: 'var(--muted-foreground)' }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                        <Tooltip
                          contentStyle={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--card-foreground)' }}
                          formatter={(value: number) => `Rs ${value.toLocaleString()}`}
                        />
                        <Legend />
                        <Bar dataKey="income" name="Income" fill="var(--chart-1)" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="expense" name="Expense" fill="var(--chart-3)" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base text-card-foreground">Expense Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-56">
                  {expenseByCategory.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-muted-foreground gap-2">
                      <TrendingDown className="h-8 w-8 opacity-30" />
                      <p className="text-sm">No expense data yet.</p>
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={expenseByCategory}
                          cx="50%" cy="50%"
                          innerRadius={50} outerRadius={80}
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
                          contentStyle={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--card-foreground)' }}
                          formatter={(value: number) => `Rs ${value.toLocaleString()}`}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Transaction List */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base text-card-foreground">All Transactions</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Tabs defaultValue="all" className="p-4 pb-0">
                <TabsList>
                  <TabsTrigger value="all">All ({transactions.length})</TabsTrigger>
                  <TabsTrigger value="income">{t.finance.income} ({transactions.filter((t) => t.type === "income").length})</TabsTrigger>
                  <TabsTrigger value="expense">{t.finance.expense} ({transactions.filter((t) => t.type === "expense").length})</TabsTrigger>
                </TabsList>
                <TabsContent value="all">
                  <TransactionTable data={transactions} onDelete={handleDelete} />
                </TabsContent>
                <TabsContent value="income">
                  <TransactionTable data={transactions.filter((t) => t.type === "income")} onDelete={handleDelete} />
                </TabsContent>
                <TabsContent value="expense">
                  <TransactionTable data={transactions.filter((t) => t.type === "expense")} onDelete={handleDelete} />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}

function TransactionTable({ data, onDelete }: { data: Transaction[]; onDelete: (id: string) => void }) {
  const { t } = useI18n()
  if (data.length === 0) {
    return (
      <div className="text-center py-10 text-muted-foreground text-sm">
        No transactions found. Click &quot;Add Transaction&quot; to get started.
      </div>
    )
  }
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
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((txn) => (
            <TableRow key={txn.id}>
              <TableCell>{txn.date}</TableCell>
              <TableCell>
                {txn.type === "income" ? (
                  <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                    <TrendingUp className="h-3 w-3 mr-1" /> {t.finance.income}
                  </Badge>
                ) : (
                  <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20">
                    <TrendingDown className="h-3 w-3 mr-1" /> {t.finance.expense}
                  </Badge>
                )}
              </TableCell>
              <TableCell>{txn.category}</TableCell>
              <TableCell>{txn.description || "—"}</TableCell>
              <TableCell className={`font-semibold ${txn.type === "income" ? "text-primary" : "text-destructive"}`}>
                {txn.type === "income" ? "+" : "-"}Rs {txn.amount.toLocaleString()}
              </TableCell>
              <TableCell>
                <Button
                  variant="ghost" size="icon"
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={() => onDelete(txn.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
