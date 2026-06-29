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
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table"
import { Plus, Users, IndianRupee, Clock, CalendarCheck, Loader2, RefreshCw, AlertCircle, Trash2 } from "lucide-react"

interface Worker {
  id: string
  name: string
  role: string
  salary: number
  phone: string
  joinDate: string
  shift: "Morning" | "Evening" | "Full Day"
  attendance: number
  advance: number
}

const shiftColors: Record<string, string> = {
  Morning: "bg-chart-3/10 text-chart-3 border-chart-3/20",
  Evening: "bg-chart-2/10 text-chart-2 border-chart-2/20",
  "Full Day": "bg-primary/10 text-primary border-primary/20",
}

export function LabourPage() {
  const { t } = useI18n()
  const [workers, setWorkers] = useState<Worker[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formError, setFormError] = useState("")

  const [formName, setFormName] = useState("")
  const [formRole, setFormRole] = useState("")
  const [formSalary, setFormSalary] = useState("")
  const [formPhone, setFormPhone] = useState("")
  const [formShift, setFormShift] = useState("Full Day")
  const [formJoinDate, setFormJoinDate] = useState(new Date().toISOString().slice(0, 10))

  const fetchWorkers = async () => {
    setIsLoading(true)
    setFetchError(null)
    try {
      const res = await fetch("/api/workers")
      const json = await res.json()
      if (json.success) {
        setWorkers(json.data)
      } else {
        setFetchError(json.message || "Failed to load workers.")
      }
    } catch {
      setFetchError("Cannot reach the database. Check your MongoDB connection.")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => { fetchWorkers() }, [])

  const totalSalary = workers.reduce((s, w) => s + w.salary, 0)
  const totalAdvance = workers.reduce((s, w) => s + w.advance, 0)
  const avgAttendance = workers.length > 0
    ? (workers.reduce((s, w) => s + w.attendance, 0) / workers.length).toFixed(1)
    : "0"

  const resetForm = () => {
    setFormName(""); setFormRole(""); setFormSalary(""); setFormPhone("")
    setFormShift("Full Day"); setFormJoinDate(new Date().toISOString().slice(0, 10)); setFormError("")
  }

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formName || !formSalary || !formJoinDate) {
      setFormError("Name, salary, and join date are required.")
      return
    }
    setIsSubmitting(true)
    try {
      const res = await fetch("/api/workers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: formName, role: formRole, salary: Number(formSalary), phone: formPhone, shift: formShift, joinDate: formJoinDate }),
      })
      const data = await res.json()
      if (data.success) { resetForm(); setShowAddDialog(false); fetchWorkers() }
      else { setFormError(data.message || "Failed to save.") }
    } catch { setFormError("Cannot reach the database.") }
    finally { setIsSubmitting(false) }
  }

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Delete ${name}?`)) return
    try {
      const res = await fetch(`/api/workers?id=${id}`, { method: "DELETE" })
      const data = await res.json()
      if (data.success) setWorkers((prev) => prev.filter((w) => w.id !== id))
      else alert(data.message || "Delete failed.")
    } catch { alert("Cannot reach the database.") }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t.labour.title}</h1>
          <p className="text-sm text-muted-foreground">Manage farm workers, shifts, salaries, and attendance</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={fetchWorkers} title="Refresh"><RefreshCw className="h-4 w-4" /></Button>
          <Dialog open={showAddDialog} onOpenChange={(open) => { setShowAddDialog(open); if (!open) resetForm() }}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4 mr-2" /> {t.common.add} {t.labour.worker}</Button>
            </DialogTrigger>
            <DialogContent className="max-w-md p-0 overflow-hidden rounded-2xl">
        <DialogTitle className="sr-only">Dialog</DialogTitle>
              <div className="bg-slate-800 px-6 py-4 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                  <Users className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="text-white font-bold text-base">{t.common.add} New {t.labour.worker}</p>
                  <p className="text-slate-400 text-xs">Record worker details and salary</p>
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
                    <Label>Name <span className="text-destructive">*</span></Label>
                    <Input placeholder="Worker name" value={formName} onChange={(e) => setFormName(e.target.value)} required className="rounded-xl h-10" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label>Role</Label>
                    <Input placeholder="e.g., Milking, Feeding" value={formRole} onChange={(e) => setFormRole(e.target.value)} className="rounded-xl h-10" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <Label>{t.labour.salary} (₹/month) <span className="text-destructive">*</span></Label>
                      <Input type="number" placeholder="0" value={formSalary} onChange={(e) => setFormSalary(e.target.value)} required className="rounded-xl h-10" />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <Label>Phone</Label>
                      <Input placeholder="+91" value={formPhone} onChange={(e) => setFormPhone(e.target.value)} className="rounded-xl h-10" />
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label>Shift</Label>
                    <Select value={formShift} onValueChange={setFormShift}>
                      <SelectTrigger className="rounded-xl h-10"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Morning">Morning</SelectItem>
                        <SelectItem value="Evening">Evening</SelectItem>
                        <SelectItem value="Full Day">Full Day</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label>Join Date <span className="text-destructive">*</span></Label>
                    <Input type="date" value={formJoinDate} onChange={(e) => setFormJoinDate(e.target.value)} required className="rounded-xl h-10" />
                  </div>
                  <Button type="submit" className="w-full h-11 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white mt-2" disabled={isSubmitting}>
                    {isSubmitting ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Saving...</> : <><Plus className="h-4 w-4 mr-2" /> {t.common.add} {t.labour.worker}</>}
                  </Button>
                </form>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {isLoading && <div className="flex items-center justify-center h-40 gap-3"><Loader2 className="h-8 w-8 animate-spin text-primary" /><p className="text-muted-foreground text-sm">Loading from database…</p></div>}
      {!isLoading && fetchError && <div className="flex flex-col items-center justify-center h-40 gap-3"><AlertCircle className="h-8 w-8 text-destructive" /><p className="text-sm text-destructive">{fetchError}</p><Button variant="outline" size="sm" onClick={fetchWorkers}><RefreshCw className="h-3.5 w-3.5 mr-1" /> Retry</Button></div>}

      {!isLoading && !fetchError && (
        <>
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card><CardContent className="p-4 flex items-center gap-3"><div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0"><Users className="h-5 w-5 text-primary" /></div><div><p className="text-xs text-muted-foreground">{t.common.total} {t.labour.worker}s</p><p className="text-xl font-bold text-card-foreground">{workers.length}</p></div></CardContent></Card>
            <Card><CardContent className="p-4 flex items-center gap-3"><div className="h-10 w-10 rounded-lg bg-chart-2/10 flex items-center justify-center shrink-0"><IndianRupee className="h-5 w-5 text-chart-2" /></div><div><p className="text-xs text-muted-foreground">Monthly {t.labour.salary}</p><p className="text-xl font-bold text-card-foreground">Rs {totalSalary.toLocaleString()}</p></div></CardContent></Card>
            <Card><CardContent className="p-4 flex items-center gap-3"><div className="h-10 w-10 rounded-lg bg-chart-3/10 flex items-center justify-center shrink-0"><CalendarCheck className="h-5 w-5 text-chart-3" /></div><div><p className="text-xs text-muted-foreground">Avg {t.labour.attendance}</p><p className="text-xl font-bold text-card-foreground">{avgAttendance} days</p></div></CardContent></Card>
            <Card><CardContent className="p-4 flex items-center gap-3"><div className="h-10 w-10 rounded-lg bg-destructive/10 flex items-center justify-center shrink-0"><Clock className="h-5 w-5 text-destructive" /></div><div><p className="text-xs text-muted-foreground">Pending Advance</p><p className="text-xl font-bold text-card-foreground">Rs {totalAdvance.toLocaleString()}</p></div></CardContent></Card>
          </div>

          {/* Workers Table */}
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base text-card-foreground">Workers List</CardTitle></CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead><TableHead>Role</TableHead><TableHead>Shift</TableHead>
                      <TableHead>{t.labour.salary}</TableHead><TableHead>{t.labour.attendance}</TableHead><TableHead>Advance</TableHead>
                      <TableHead>Phone</TableHead><TableHead>Joined</TableHead><TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {workers.length === 0 ? (
                      <TableRow><TableCell colSpan={9} className="text-center py-10 text-muted-foreground">No workers in database yet. Click &quot;Add Worker&quot; to get started.</TableCell></TableRow>
                    ) : workers.map((w) => (
                      <TableRow key={w.id}>
                        <TableCell className="font-medium">{w.name}</TableCell>
                        <TableCell>{w.role || "—"}</TableCell>
                        <TableCell><Badge variant="outline" className={shiftColors[w.shift] ?? ""}>{w.shift}</Badge></TableCell>
                        <TableCell>Rs {w.salary.toLocaleString()}</TableCell>
                        <TableCell>{w.attendance}/30 days</TableCell>
                        <TableCell>{w.advance > 0 ? <span className="text-destructive font-medium">Rs {w.advance.toLocaleString()}</span> : <span className="text-muted-foreground">—</span>}</TableCell>
                        <TableCell className="text-sm">{w.phone || "—"}</TableCell>
                        <TableCell className="text-sm">{w.joinDate}</TableCell>
                        <TableCell>
                          <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => handleDelete(w.id, w.name)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Payroll Summary */}
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base text-card-foreground">Monthly Payroll Summary</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-muted rounded-lg"><p className="text-sm text-muted-foreground">Total Gross Salary</p><p className="text-2xl font-bold text-foreground">Rs {totalSalary.toLocaleString()}</p></div>
                <div className="p-4 bg-muted rounded-lg"><p className="text-sm text-muted-foreground">Advance Deductions</p><p className="text-2xl font-bold text-foreground">Rs {totalAdvance.toLocaleString()}</p></div>
                <div className="p-4 bg-muted rounded-lg"><p className="text-sm text-muted-foreground">Net Payable</p><p className="text-2xl font-bold text-primary">Rs {(totalSalary - totalAdvance).toLocaleString()}</p></div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
