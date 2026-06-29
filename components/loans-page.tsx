"use client"

import { useState, useEffect } from "react"
import { useI18n } from "@/lib/i18n/context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Landmark, IndianRupee, CalendarClock, AlertTriangle, Plus, Loader2, RefreshCw, AlertCircle, Trash2 } from "lucide-react"

interface Loan {
  id: string
  source: string
  amount: number
  interestRate: number
  emiAmount: number
  emiDueDate: string
  totalPaid: number
  remainingBalance: number
  startDate: string
}

export function LoansPage() {
  const { t } = useI18n()
  const [loans, setLoans] = useState<Loan[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formError, setFormError] = useState("")

  const [formSource, setFormSource] = useState("")
  const [formAmount, setFormAmount] = useState("")
  const [formInterest, setFormInterest] = useState("")
  const [formEmi, setFormEmi] = useState("")
  const [formEmiDue, setFormEmiDue] = useState("")
  const [formStartDate, setFormStartDate] = useState(new Date().toISOString().slice(0, 10))

  const fetchLoans = async () => {
    setIsLoading(true); setFetchError(null)
    try {
      const res = await fetch("/api/loans")
      const json = await res.json()
      if (json.success) setLoans(json.data)
      else setFetchError(json.message || "Failed to load loans.")
    } catch { setFetchError("Cannot reach the database.") }
    finally { setIsLoading(false) }
  }

  useEffect(() => { fetchLoans() }, [])

  const totalLoan = loans.reduce((s, l) => s + l.amount, 0)
  const totalRemaining = loans.reduce((s, l) => s + l.remainingBalance, 0)
  const totalPaid = loans.reduce((s, l) => s + l.totalPaid, 0)
  const monthlyEMI = loans.reduce((s, l) => s + l.emiAmount, 0)

  const resetForm = () => {
    setFormSource(""); setFormAmount(""); setFormInterest(""); setFormEmi(""); setFormEmiDue(""); setFormStartDate(new Date().toISOString().slice(0, 10)); setFormError("")
  }

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formSource || !formAmount || !formStartDate) { setFormError("Source, amount and start date are required."); return }
    setIsSubmitting(true)
    try {
      const res = await fetch("/api/loans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ source: formSource, amount: Number(formAmount), interestRate: Number(formInterest), emiAmount: Number(formEmi), emiDueDate: formEmiDue, startDate: formStartDate }),
      })
      const data = await res.json()
      if (data.success) { resetForm(); setShowAddDialog(false); fetchLoans() }
      else setFormError(data.message || "Failed to save.")
    } catch { setFormError("Cannot reach the database.") }
    finally { setIsSubmitting(false) }
  }

  const handleDelete = async (id: string, source: string) => {
    if (!window.confirm(`Delete loan from ${source}?`)) return
    try {
      const res = await fetch(`/api/loans?id=${id}`, { method: "DELETE" })
      const data = await res.json()
      if (data.success) setLoans((prev) => prev.filter((l) => l.id !== id))
      else alert(data.message || "Delete failed.")
    } catch { alert("Cannot reach the database.") }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t.loans.title}</h1>
          <p className="text-sm text-muted-foreground">Track loans, EMIs, and government subsidies — live from database</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={fetchLoans} title="Refresh"><RefreshCw className="h-4 w-4" /></Button>
          <Dialog open={showAddDialog} onOpenChange={(open) => { setShowAddDialog(open); if (!open) resetForm() }}>
            <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-2" /> Add Loan</Button></DialogTrigger>
            <DialogContent className="max-w-md p-0 overflow-hidden rounded-2xl">
        <DialogTitle className="sr-only">Dialog</DialogTitle>
              <div className="bg-slate-800 px-6 py-4 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                  <Landmark className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="text-white font-bold text-base">{t.common.add} Loan / {t.loans.subsidy}</p>
                  <p className="text-slate-400 text-xs">Record bank loans or government subsidies</p>
                </div>
              </div>
              <div className="px-6 py-5">
                {formError && <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-xl p-3 mb-4"><AlertCircle className="h-4 w-4 shrink-0" />{formError}</div>}
                <form onSubmit={handleAdd} className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1.5">
                    <Label>Source / Bank <span className="text-destructive">*</span></Label>
                    <Input placeholder="e.g. SBI Bank" value={formSource} onChange={(e) => setFormSource(e.target.value)} required className="rounded-xl h-10" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <Label>Loan Amount <span className="text-destructive">*</span></Label>
                      <Input type="number" placeholder="500000" value={formAmount} onChange={(e) => setFormAmount(e.target.value)} required className="rounded-xl h-10" />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <Label>Interest Rate %</Label>
                      <Input type="number" step="0.1" placeholder="7.5" value={formInterest} onChange={(e) => setFormInterest(e.target.value)} className="rounded-xl h-10" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <Label>{t.loans.emi} Amount</Label>
                      <Input type="number" placeholder="9875" value={formEmi} onChange={(e) => setFormEmi(e.target.value)} className="rounded-xl h-10" />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <Label>{t.loans.emi} Due Date</Label>
                      <Input type="date" value={formEmiDue} onChange={(e) => setFormEmiDue(e.target.value)} className="rounded-xl h-10" />
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label>Start Date <span className="text-destructive">*</span></Label>
                    <Input type="date" value={formStartDate} onChange={(e) => setFormStartDate(e.target.value)} required className="rounded-xl h-10" />
                  </div>
                  <Button type="submit" className="w-full h-11 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white mt-2" disabled={isSubmitting}>
                    {isSubmitting ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Saving...</> : <><Plus className="h-4 w-4 mr-2" />Save Loan</>}
                  </Button>
                </form>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {isLoading && <div className="flex items-center justify-center h-40 gap-3"><Loader2 className="h-8 w-8 animate-spin text-primary" /><p className="text-muted-foreground text-sm">Loading from database…</p></div>}
      {!isLoading && fetchError && <div className="flex flex-col items-center justify-center h-40 gap-3"><AlertCircle className="h-8 w-8 text-destructive" /><p className="text-sm text-destructive">{fetchError}</p><Button variant="outline" size="sm" onClick={fetchLoans}><RefreshCw className="h-3.5 w-3.5 mr-1" />Retry</Button></div>}

      {!isLoading && !fetchError && (
        <>
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card><CardContent className="p-4 flex items-center gap-3"><div className="h-10 w-10 rounded-lg bg-chart-2/10 flex items-center justify-center shrink-0"><Landmark className="h-5 w-5 text-chart-2" /></div><div><p className="text-xs text-muted-foreground">{t.common.total} Loans</p><p className="text-xl font-bold text-card-foreground">Rs {totalLoan.toLocaleString()}</p></div></CardContent></Card>
            <Card><CardContent className="p-4 flex items-center gap-3"><div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0"><IndianRupee className="h-5 w-5 text-primary" /></div><div><p className="text-xs text-muted-foreground">{t.common.total} Paid</p><p className="text-xl font-bold text-primary">Rs {totalPaid.toLocaleString()}</p></div></CardContent></Card>
            <Card><CardContent className="p-4 flex items-center gap-3"><div className="h-10 w-10 rounded-lg bg-destructive/10 flex items-center justify-center shrink-0"><AlertTriangle className="h-5 w-5 text-destructive" /></div><div><p className="text-xs text-muted-foreground">Remaining</p><p className="text-xl font-bold text-destructive">Rs {totalRemaining.toLocaleString()}</p></div></CardContent></Card>
            <Card><CardContent className="p-4 flex items-center gap-3"><div className="h-10 w-10 rounded-lg bg-chart-3/10 flex items-center justify-center shrink-0"><CalendarClock className="h-5 w-5 text-chart-3" /></div><div><p className="text-xs text-muted-foreground">Monthly {t.loans.emi}</p><p className="text-xl font-bold text-card-foreground">Rs {monthlyEMI.toLocaleString()}</p></div></CardContent></Card>
          </div>

          {/* Loan Cards */}
          {loans.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-3">
              <Landmark className="h-12 w-12 opacity-20" />
              <p>No loans recorded yet. Click &quot;Add Loan&quot; to get started.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {loans.map((loan) => {
                const paidPercent = loan.amount > 0 ? (loan.totalPaid / loan.amount) * 100 : 0
                return (
                  <Card key={loan.id}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg text-card-foreground">{loan.source}</CardTitle>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="bg-chart-2/10 text-chart-2 border-chart-2/20">Active</Badge>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => handleDelete(loan.id, loan.source)}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-4">
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div><p className="text-muted-foreground">Loan Amount</p><p className="font-semibold text-card-foreground">Rs {loan.amount.toLocaleString()}</p></div>
                        <div><p className="text-muted-foreground">Interest Rate</p><p className="font-semibold text-card-foreground">{loan.interestRate}%</p></div>
                        <div><p className="text-muted-foreground">EMI Amount</p><p className="font-semibold text-card-foreground">Rs {loan.emiAmount.toLocaleString()}</p></div>
                        <div><p className="text-muted-foreground">Next EMI Due</p><p className="font-semibold text-chart-3">{loan.emiDueDate || "—"}</p></div>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-muted-foreground">Repayment Progress</span>
                          <span className="font-medium text-card-foreground">{paidPercent.toFixed(1)}%</span>
                        </div>
                        <Progress value={paidPercent} className="[&>div]:bg-primary" />
                        <div className="flex justify-between text-xs text-muted-foreground mt-1">
                          <span>Paid: Rs {loan.totalPaid.toLocaleString()}</span>
                          <span>Remaining: Rs {loan.remainingBalance.toLocaleString()}</span>
                        </div>
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground border-t border-border pt-3">
                        <span>Started: {loan.startDate}</span>
                        <Button variant="outline" size="sm">Pay EMI</Button>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </>
      )}
    </div>
  )
}
