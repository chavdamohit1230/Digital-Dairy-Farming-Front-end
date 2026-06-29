"use client"

import { useState, useEffect } from "react"
import { useI18n } from "@/lib/i18n/context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table"
import { Plus, Download, Milk, TrendingUp, Award, BarChart3, Loader2, RefreshCw, AlertCircle, Trash2 } from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"

interface MilkEntry {
  id: string
  buffaloId: string
  buffaloName: string
  date: string
  morningQty: number
  eveningQty: number
  totalQty: number
  fatPercent: number
  snfPercent: number
}

interface Animal {
  id: string
  name: string
  status: string
  milkYieldPerDay: number
}

export function MilkPage() {
  const { t } = useI18n()
  const [entries, setEntries] = useState<MilkEntry[]>([])
  const [animals, setAnimals] = useState<Animal[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formError, setFormError] = useState("")

  // Form state
  const [formBuffaloId, setFormBuffaloId] = useState("")
  const [formDate, setFormDate] = useState(new Date().toISOString().slice(0, 10))
  const [formMorning, setFormMorning] = useState("")
  const [formEvening, setFormEvening] = useState("")
  const [formFat, setFormFat] = useState("")
  const [formSnf, setFormSnf] = useState("")

  // Chart data – last 7 days from entries
  const [chartData, setChartData] = useState<{ day: string; morning: number; evening: number; total: number }[]>([])

  const todayStr = new Date().toISOString().slice(0, 10)

  const fetchData = async () => {
    setIsLoading(true)
    setFetchError(null)
    try {
      const [entriesRes, animalsRes] = await Promise.all([
        fetch("/api/milk-entries"),
        fetch("/api/animals"),
      ])
      const entriesJson = await entriesRes.json()
      const animalsJson = await animalsRes.json()

      if (entriesJson.success) {
        setEntries(entriesJson.data)
        buildChart(entriesJson.data)
      } else {
        setFetchError(entriesJson.message || "Failed to load milk entries.")
      }
      if (animalsJson.success) {
        // Only lactating or sick-with-milk animals can have milk entries
        setAnimals(
          (animalsJson.data as Animal[]).filter(
            (a) => a.status === "Lactating" || (a.status === "Sick" && a.milkYieldPerDay > 0)
          )
        )
      }
    } catch {
      setFetchError("Cannot reach the database. Check your MongoDB connection.")
    } finally {
      setIsLoading(false)
    }
  }

  const buildChart = (data: MilkEntry[]) => {
    const last7: { day: string; morning: number; evening: number; total: number }[] = []
    for (let i = 6; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const dateStr = d.toISOString().slice(0, 10)
      const dayLabel = d.toLocaleDateString("en-IN", { month: "short", day: "numeric" })
      const dayEntries = data.filter((e) => e.date === dateStr)
      const morning = dayEntries.reduce((s, e) => s + e.morningQty, 0)
      const evening = dayEntries.reduce((s, e) => s + e.eveningQty, 0)
      last7.push({ day: dayLabel, morning, evening, total: morning + evening })
    }
    setChartData(last7)
  }

  useEffect(() => { fetchData() }, [])

  // Today's entries
  const todayEntries = entries.filter((e) => e.date === todayStr)
  const totalToday = todayEntries.reduce((s, e) => s + e.totalQty, 0)
  const avgFat = todayEntries.length > 0
    ? (todayEntries.reduce((s, e) => s + e.fatPercent, 0) / todayEntries.length).toFixed(1)
    : "0.0"
  const avgPerBuffalo = todayEntries.length > 0
    ? (totalToday / todayEntries.length).toFixed(1)
    : "0.0"
  const bestEntry = todayEntries.length > 0
    ? todayEntries.reduce((best, e) => (e.totalQty > best.totalQty ? e : best), todayEntries[0])
    : null

  const resetForm = () => {
    setFormBuffaloId(""); setFormDate(new Date().toISOString().slice(0, 10))
    setFormMorning(""); setFormEvening(""); setFormFat(""); setFormSnf(""); setFormError("")
  }

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formBuffaloId || !formDate || !formMorning || !formEvening) {
      setFormError("Please fill in all required fields.")
      return
    }
    setIsSubmitting(true)
    try {
      const animal = animals.find((a) => a.id === formBuffaloId)
      const res = await fetch("/api/milk-entries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          buffaloId: formBuffaloId,
          buffaloName: animal?.name ?? formBuffaloId,
          date: formDate,
          morningQty: Number(formMorning),
          eveningQty: Number(formEvening),
          fatPercent: formFat ? Number(formFat) : 0,
          snfPercent: formSnf ? Number(formSnf) : 0,
        }),
      })
      const data = await res.json()
      if (data.success) {
        resetForm()
        setShowAddDialog(false)
        fetchData()
      } else {
        setFormError(data.message || "Failed to save entry.")
      }
    } catch {
      setFormError("Cannot reach the database.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this milk entry?")) return
    try {
      const res = await fetch(`/api/milk-entries?id=${id}`, { method: "DELETE" })
      const data = await res.json()
      if (data.success) {
        setEntries((prev) => prev.filter((e) => e.id !== id))
        buildChart(entries.filter((e) => e.id !== id))
      } else {
        alert(data.message || "Delete failed.")
      }
    } catch {
      alert("Cannot reach the database.")
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t.milk.title}</h1>
          <p className="text-sm text-muted-foreground">Track daily milk yields, fat content, and quality ratings</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={fetchData} title="Refresh">
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Dialog open={showAddDialog} onOpenChange={(open) => { setShowAddDialog(open); if (!open) resetForm() }}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4 mr-2" /> {t.common.add}</Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>{t.common.add}</DialogTitle>
              </DialogHeader>
              {formError && (
                <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg p-3">
                  <AlertCircle className="h-4 w-4 shrink-0" /> {formError}
                </div>
              )}
              <form onSubmit={handleAdd} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <Label>{t.nav.buffalo} *</Label>
                  <Select value={formBuffaloId} onValueChange={setFormBuffaloId}>
                    <SelectTrigger><SelectValue placeholder="Select buffalo" /></SelectTrigger>
                    <SelectContent>
                      {animals.length === 0 ? (
                        <SelectItem value="_none" disabled>No lactating animals in DB</SelectItem>
                      ) : (
                        animals.map((a) => (
                          <SelectItem key={a.id} value={a.id}>{a.name} ({a.id})</SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label>Date *</Label>
                  <Input type="date" value={formDate} onChange={(e) => setFormDate(e.target.value)} required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <Label>{t.milk.morningYield} *</Label>
                    <Input type="number" step="0.5" min="0" placeholder="0.0" value={formMorning} onChange={(e) => setFormMorning(e.target.value)} required />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label>{t.milk.eveningYield} *</Label>
                    <Input type="number" step="0.5" min="0" placeholder="0.0" value={formEvening} onChange={(e) => setFormEvening(e.target.value)} required />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <Label>{t.milk.fatPercent}</Label>
                    <Input type="number" step="0.1" min="0" placeholder="0.0" value={formFat} onChange={(e) => setFormFat(e.target.value)} />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label>{t.milk.snfPercent}</Label>
                    <Input type="number" step="0.1" min="0" placeholder="0.0" value={formSnf} onChange={(e) => setFormSnf(e.target.value)} />
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Saving...</> : t.common.save}
                </Button>
              </form>
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
          <Button variant="outline" size="sm" onClick={fetchData}><RefreshCw className="h-3.5 w-3.5 mr-1" /> Retry</Button>
        </div>
      )}

      {!isLoading && !fetchError && (
        <>
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Milk className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{t.common.today} {t.common.total}</p>
                  <p className="text-xl font-bold text-card-foreground">{totalToday} L</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-chart-2/10 flex items-center justify-center shrink-0">
                  <BarChart3 className="h-5 w-5 text-chart-2" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Avg {t.milk.fatPercent}</p>
                  <p className="text-xl font-bold text-card-foreground">{avgFat}%</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-chart-3/10 flex items-center justify-center shrink-0">
                  <TrendingUp className="h-5 w-5 text-chart-3" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Avg/Buffalo</p>
                  <p className="text-xl font-bold text-card-foreground">{avgPerBuffalo} L</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-chart-4/10 flex items-center justify-center shrink-0">
                  <Award className="h-5 w-5 text-chart-4" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Best Today</p>
                  <p className="text-xl font-bold text-card-foreground">
                    {bestEntry ? bestEntry.buffaloName : "—"}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Chart */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base text-card-foreground">7-Day Production Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-56">
                {chartData.every((d) => d.total === 0) ? (
                  <div className="h-full flex flex-col items-center justify-center text-muted-foreground gap-2">
                    <Milk className="h-8 w-8 opacity-30" />
                    <p className="text-sm">No milk data for last 7 days.</p>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
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

          {/* Today's Table */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base text-card-foreground">
                Today&apos;s Entries — {new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t.nav.buffalo}</TableHead>
                      <TableHead>{t.milk.morningYield}</TableHead>
                      <TableHead>{t.milk.eveningYield}</TableHead>
                      <TableHead>{t.milk.totalYield}</TableHead>
                      <TableHead>{t.milk.fatPercent}</TableHead>
                      <TableHead>{t.milk.snfPercent}</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {todayEntries.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-10 text-muted-foreground">
                          No entries for today. Click &quot;Add Entry&quot; to record milk production.
                        </TableCell>
                      </TableRow>
                    ) : (
                      <>
                        {todayEntries.map((e) => (
                          <TableRow key={e.id}>
                            <TableCell className="font-medium">{e.buffaloName}</TableCell>
                            <TableCell>{e.morningQty}</TableCell>
                            <TableCell>{e.eveningQty}</TableCell>
                            <TableCell className="font-semibold">{e.totalQty}</TableCell>
                            <TableCell>{e.fatPercent > 0 ? `${e.fatPercent}%` : "—"}</TableCell>
                            <TableCell>{e.snfPercent > 0 ? `${e.snfPercent}%` : "—"}</TableCell>
                            <TableCell>
                              <Button
                                variant="ghost" size="icon"
                                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                onClick={() => handleDelete(e.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                        <TableRow className="bg-muted/50 font-bold">
                          <TableCell>{t.common.total}</TableCell>
                          <TableCell>{todayEntries.reduce((s, e) => s + e.morningQty, 0)}</TableCell>
                          <TableCell>{todayEntries.reduce((s, e) => s + e.eveningQty, 0)}</TableCell>
                          <TableCell>{totalToday}</TableCell>
                          <TableCell>{avgFat}%</TableCell>
                          <TableCell>—</TableCell>
                          <TableCell />
                        </TableRow>
                      </>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
