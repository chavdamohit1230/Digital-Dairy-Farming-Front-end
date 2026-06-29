"use client"

import { useState, useEffect } from "react"
import { type Buffalo } from "@/lib/data"
import { useI18n } from "@/lib/i18n/context"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table"
import { Plus, Search, Eye, Trash2, RefreshCw, AlertCircle, Loader2,
  Tag, Dna, CalendarDays, Weight, Activity, ShieldCheck,
  Milk, Droplets, Thermometer, Syringe, Heart, MapPin, BadgeDollarSign, Hash } from "lucide-react"

// Next.js internal API (backed by MongoDB Atlas)
const API = "/api/animals"

const statusColors: Record<string, string> = {
  Lactating: "bg-primary/10 text-primary border-primary/20",
  Dry: "bg-muted text-muted-foreground border-border",
  Pregnant: "bg-chart-2/10 text-chart-2 border-chart-2/20",
  Sick: "bg-destructive/10 text-destructive border-destructive/20",
}
const stageColors: Record<string, string> = {
  Calf: "bg-amber-100 text-amber-800 border-amber-200",
  Heifer: "bg-blue-100 text-blue-800 border-blue-200",
  Pregnant: "bg-chart-2/10 text-chart-2 border-chart-2/20",
  Lactating: "bg-primary/10 text-primary border-primary/20",
  Dry: "bg-muted text-muted-foreground border-border",
  Sick: "bg-destructive/10 text-destructive border-destructive/20",
  Sold: "bg-slate-100 text-slate-700 border-slate-200",
  Dead: "bg-slate-100 text-slate-500 border-slate-200",
}

// Map stage → status for the backend enum
const stageToStatus = (stage: string): "Lactating" | "Dry" | "Pregnant" | "Sick" => {
  if (stage === "Sick") return "Sick"
  if (stage === "Pregnant") return "Pregnant"
  if (stage === "Dry") return "Dry"
  return "Lactating"
}

export function BuffaloPage() {
  const { t } = useI18n()
  // List state
  const [animals, setAnimals] = useState<Buffalo[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [fetchError, setFetchError] = useState<string | null>(null)

  // Filters
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [stageFilter, setStageFilter] = useState("all")

  // View detail
  const [selectedBuffalo, setSelectedBuffalo] = useState<Buffalo | null>(null)

  // Add dialog
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formError, setFormError] = useState("")

  // Form fields
  const [formName, setFormName] = useState("")
  const [formRfid, setFormRfid] = useState("")
  const [formBreed, setFormBreed] = useState("Murrah")
  const [formAge, setFormAge] = useState("")
  const [formWeight, setFormWeight] = useState("")
  const [formStage, setFormStage] = useState("Lactating")
  const [formBodyScore, setFormBodyScore] = useState("")
  const [formPurchaseDate, setFormPurchaseDate] = useState("")
  const [formPurchaseCost, setFormPurchaseCost] = useState("")
  const [formSource, setFormSource] = useState("")
  const [formMilkYield, setFormMilkYield] = useState("")
  const [formFatPct, setFormFatPct] = useState("")

  // ─── Fetch from MongoDB Atlas via /api/animals ─────────────────────────────
  const fetchAnimals = async () => {
    setIsLoading(true)
    setFetchError(null)
    try {
      const res = await fetch(API)
      const data = await res.json()
      if (data.success && Array.isArray(data.data)) {
        setAnimals(data.data as Buffalo[])
      } else {
        setFetchError(data.message || "Failed to fetch animals from database.")
        setAnimals([])
      }
    } catch {
      setFetchError("Cannot reach the database. Check your MongoDB connection in .env.local.")
      setAnimals([])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => { fetchAnimals() }, [])

  // ─── Add ───────────────────────────────────────────────────────────────────
  const resetForm = () => {
    setFormName(""); setFormRfid(""); setFormBreed("Murrah")
    setFormAge(""); setFormWeight(""); setFormStage("Lactating")
    setFormBodyScore(""); setFormPurchaseDate(""); setFormPurchaseCost("")
    setFormSource(""); setFormMilkYield(""); setFormFatPct(""); setFormError("")
  }

  const handleAddBuffalo = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError("")

    if (!formName.trim() || !formRfid.trim() || !formAge || !formWeight || !formPurchaseDate || !formPurchaseCost) {
      setFormError("Please fill in all required fields (marked with *).")
      return
    }

    setIsSubmitting(true)
    try {
      const res = await fetch(API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formName.trim(),
          tagNumber: formRfid.trim(),
          rfidTag: formRfid.trim(),
          breed: formBreed,
          age: Number(formAge),
          weight: Number(formWeight),
          status: stageToStatus(formStage),
          stage: formStage,
          bodyScore: formBodyScore ? Number(formBodyScore) : null,
          purchaseDate: formPurchaseDate,
          purchaseCost: Number(formPurchaseCost),
          source: formSource.trim(),
          milkYieldPerDay: formMilkYield ? Number(formMilkYield) : 0,
          fatPercentage: formFatPct ? Number(formFatPct) : 0,
        }),
      })
      const data = await res.json()
      if (data.success) {
        resetForm()
        setShowAddDialog(false)
        fetchAnimals() // Re-fetch from MongoDB
      } else {
        setFormError(data.message || "Failed to save animal. Please try again.")
      }
    } catch {
      setFormError("Cannot reach the database. Check your MongoDB connection.")
    } finally {
      setIsSubmitting(false)
    }
  }

  // ─── Delete ────────────────────────────────────────────────────────────────
  const handleDelete = async (animalId: string, name: string) => {
    if (!window.confirm(`Delete ${name}? This cannot be undone.`)) return
    try {
      const res = await fetch(`${API}?id=${animalId}`, { method: "DELETE" })
      const data = await res.json()
      if (data.success) {
        setAnimals((prev) => prev.filter((a) => a.id !== animalId))
      } else {
        alert(data.message || "Delete failed.")
      }
    } catch {
      alert("Cannot reach the database. Check your MongoDB connection.")
    }
  }

  // ─── Filter ────────────────────────────────────────────────────────────────
  const filtered = animals.filter((b) => {
    const q = search.toLowerCase()
    const matchSearch =
      b.name.toLowerCase().includes(q) ||
      b.id.toLowerCase().includes(q) ||
      (b.tagNumber && b.tagNumber.toLowerCase().includes(q))
    const matchStatus = statusFilter === "all" || b.status === statusFilter
    const stage = b.stage ?? b.status
    const matchStage = stageFilter === "all" || stage === stageFilter
    return matchSearch && matchStatus && matchStage
  })

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t.animal.title}</h1>
          <p className="text-sm text-muted-foreground">Manage buffalo profiles, stages, and RFID tracking</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={fetchAnimals} title="Refresh from database">
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Dialog open={showAddDialog} onOpenChange={(open) => { setShowAddDialog(open); if (!open) resetForm() }}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4 mr-2" /> {t.animal.addAnimal}</Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{t.animal.addAnimal}</DialogTitle>
              </DialogHeader>

              {/* Form Error */}
              {formError && (
                <div className="flex items-start gap-2 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg p-3">
                  <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                  {formError}
                </div>
              )}

              <form onSubmit={handleAddBuffalo} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {/* Name */}
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="f-name">Name *</Label>
                    <Input id="f-name" placeholder="e.g. Lakshmi" value={formName} onChange={(e) => setFormName(e.target.value)} required />
                  </div>
                  {/* RFID */}
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="f-rfid">{t.animal.rfidTag} *</Label>
                    <Input id="f-rfid" placeholder="RFID-XXX" value={formRfid} onChange={(e) => setFormRfid(e.target.value)} required />
                  </div>
                  {/* Breed */}
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="f-breed">{t.animal.breed}</Label>
                    <Input id="f-breed" value={formBreed} onChange={(e) => setFormBreed(e.target.value)} />
                  </div>
                  {/* Age */}
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="f-age">Age (years) *</Label>
                    <Input id="f-age" type="number" min={0} max={25} placeholder="e.g. 4" value={formAge} onChange={(e) => setFormAge(e.target.value)} required />
                  </div>
                  {/* Weight */}
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="f-weight">Weight (kg) *</Label>
                    <Input id="f-weight" type="number" min={0} placeholder="e.g. 520" value={formWeight} onChange={(e) => setFormWeight(e.target.value)} required />
                  </div>
                  {/* Stage */}
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="f-stage">{t.animal.stage} *</Label>
                    <Select value={formStage} onValueChange={setFormStage}>
                      <SelectTrigger id="f-stage"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Calf">{t.animal.stages.calf}</SelectItem>
                        <SelectItem value="Heifer">{t.animal.stages.heifer}</SelectItem>
                        <SelectItem value="Pregnant">{t.animal.stages.pregnant}</SelectItem>
                        <SelectItem value="Lactating">{t.animal.stages.lactating}</SelectItem>
                        <SelectItem value="Dry">{t.animal.stages.dry}</SelectItem>
                        <SelectItem value="Sick">{t.animal.stages.sick}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {/* Body Score */}
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="f-body">{t.animal.bodyScore}</Label>
                    <Input id="f-body" type="number" min={1} max={5} step={0.5} placeholder="e.g. 3.5" value={formBodyScore} onChange={(e) => setFormBodyScore(e.target.value)} />
                  </div>
                  {/* Purchase Date */}
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="f-date">Purchase Date *</Label>
                    <Input id="f-date" type="date" value={formPurchaseDate} onChange={(e) => setFormPurchaseDate(e.target.value)} required />
                  </div>
                  {/* Purchase Cost */}
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="f-cost">{t.animal.purchaseCost} *</Label>
                    <Input id="f-cost" type="number" min={0} placeholder="e.g. 95000" value={formPurchaseCost} onChange={(e) => setFormPurchaseCost(e.target.value)} required />
                  </div>
                  {/* Source */}
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="f-source">{t.animal.purchaseSource}</Label>
                    <Input id="f-source" placeholder="e.g. Hisar Mandi" value={formSource} onChange={(e) => setFormSource(e.target.value)} />
                  </div>
                  {/* Milk Yield */}
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="f-milk">{t.milk.totalYield}</Label>
                    <Input id="f-milk" type="number" min={0} step={0.5} placeholder="e.g. 12" value={formMilkYield} onChange={(e) => setFormMilkYield(e.target.value)} />
                  </div>
                  {/* Fat % */}
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="f-fat">{t.milk.fatPercent}</Label>
                    <Input id="f-fat" type="number" min={0} max={15} step={0.1} placeholder="e.g. 7.0" value={formFatPct} onChange={(e) => setFormFatPct(e.target.value)} />
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Saving...</>
                  ) : t.common.save}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: t.common.total, value: animals.length, color: "text-foreground" },
          { label: t.animal.stages.lactating, value: animals.filter((b) => b.status === "Lactating").length, color: "text-primary" },
          { label: t.animal.stages.pregnant, value: animals.filter((b) => b.status === "Pregnant").length, color: "text-chart-2" },
          { label: t.animal.stages.dry, value: animals.filter((b) => b.status === "Dry").length, color: "text-muted-foreground" },
          { label: t.animal.stages.sick, value: animals.filter((b) => b.status === "Sick").length, color: "text-destructive" },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="p-4 text-center">
              <p className="text-xs text-muted-foreground">{s.label}</p>
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search by name, ID or RFID..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-40"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="Lactating">Lactating</SelectItem>
            <SelectItem value="Dry">Dry</SelectItem>
            <SelectItem value="Pregnant">Pregnant</SelectItem>
            <SelectItem value="Sick">Sick</SelectItem>
          </SelectContent>
        </Select>
        <Select value={stageFilter} onValueChange={setStageFilter}>
          <SelectTrigger className="w-full sm:w-40"><SelectValue placeholder="Stage" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Stages</SelectItem>
            <SelectItem value="Calf">Calf</SelectItem>
            <SelectItem value="Heifer">Heifer</SelectItem>
            <SelectItem value="Pregnant">Pregnant</SelectItem>
            <SelectItem value="Lactating">Lactating</SelectItem>
            <SelectItem value="Dry">Dry</SelectItem>
            <SelectItem value="Sick">Sick</SelectItem>
            <SelectItem value="Sold">Sold</SelectItem>
            <SelectItem value="Dead">Dead</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t.animal.uniqueId}</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>{t.animal.breed}</TableHead>
                  <TableHead>{t.animal.stage}</TableHead>
                  <TableHead>Age</TableHead>
                  <TableHead>Weight</TableHead>
                  <TableHead>{t.animal.bodyScore}</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>{t.milk.totalYield}</TableHead>
                  <TableHead>{t.milk.fatPercent}</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {/* Loading */}
                {isLoading && (
                  <TableRow>
                    <TableCell colSpan={11} className="text-center py-12">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-primary" />
                      <p className="text-sm text-muted-foreground">Loading animals...</p>
                    </TableCell>
                  </TableRow>
                )}

                {/* Fetch Error */}
                {!isLoading && fetchError && (
                  <TableRow>
                    <TableCell colSpan={11} className="text-center py-12">
                      <AlertCircle className="h-6 w-6 mx-auto mb-2 text-destructive" />
                      <p className="text-sm font-medium text-destructive">{fetchError}</p>
                      <Button variant="outline" size="sm" className="mt-3" onClick={fetchAnimals}>
                        <RefreshCw className="h-3.5 w-3.5 mr-1" /> Retry
                      </Button>
                    </TableCell>
                  </TableRow>
                )}

                {/* Empty */}
                {!isLoading && !fetchError && filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={11} className="text-center py-12 text-muted-foreground">
                      {animals.length === 0
                        ? "No animals in database yet. Click \"Add Animal\" to get started."
                        : "No animals match your current search / filter."}
                    </TableCell>
                  </TableRow>
                )}

                {/* Data rows */}
                {!isLoading && !fetchError && filtered.map((b) => (
                  <TableRow key={b.id}>
                    <TableCell className="font-mono text-xs">
                      <div className="font-semibold">{b.id}</div>
                      {b.tagNumber && <div className="text-[10px] text-muted-foreground">{b.tagNumber}</div>}
                    </TableCell>
                    <TableCell className="font-medium">{b.name}</TableCell>
                    <TableCell>{b.breed}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={stageColors[b.stage ?? b.status] ?? statusColors[b.status]}>
                        {b.stage ?? b.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{b.age} yrs</TableCell>
                    <TableCell>{b.weight} kg</TableCell>
                    <TableCell>{b.bodyScore != null ? b.bodyScore : "—"}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={statusColors[b.status]}>{b.status}</Badge>
                    </TableCell>
                    <TableCell>{b.milkYieldPerDay > 0 ? b.milkYieldPerDay : "-"}</TableCell>
                    <TableCell>{b.fatPercentage > 0 ? `${b.fatPercentage}%` : "-"}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {/* View */}
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="icon" onClick={() => setSelectedBuffalo(b)}>
                              <Eye className="h-4 w-4" />
                              <span className="sr-only">View {b.name}</span>
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl p-0 overflow-hidden rounded-2xl shadow-2xl border-0">
        <DialogTitle className="sr-only">Dialog</DialogTitle>
                            <div className="flex min-h-[420px]">

                              {/* ══ LEFT DARK PANEL ══ */}
                              <div className="w-[220px] shrink-0 bg-slate-900 flex flex-col items-center justify-between px-5 py-7">
                                {/* Avatar */}
                                <div className="flex flex-col items-center gap-3 text-center">
                                  <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center text-3xl select-none">
                                    🐃
                                  </div>
                                  <div>
                                    <p className="text-white font-bold text-base leading-tight">{b.name}</p>
                                    <p className="text-slate-400 text-xs mt-1 font-mono">{b.id}</p>
                                    {b.tagNumber && <p className="text-slate-500 text-[10px] font-mono">{b.tagNumber}</p>}
                                  </div>
                                  <span className={`text-[11px] font-semibold px-3 py-1 rounded-full border ${stageColors[b.stage ?? b.status] ?? statusColors[b.status]}`}>
                                    {b.stage ?? b.status}
                                  </span>
                                </div>

                                {/* Divider */}
                                <div className="w-full border-t border-white/10 my-4" />

                                {/* Key Metrics */}
                                <div className="w-full flex flex-col gap-4">
                                  <div className="text-center">
                                    <p className="text-slate-400 text-[10px] uppercase tracking-widest font-medium">Milk / Day</p>
                                    <p className="text-white text-2xl font-bold mt-0.5">
                                      {b.milkYieldPerDay > 0 ? b.milkYieldPerDay : "—"}
                                      {b.milkYieldPerDay > 0 && <span className="text-slate-400 text-sm font-normal ml-1">L</span>}
                                    </p>
                                  </div>
                                  <div className="text-center">
                                    <p className="text-slate-400 text-[10px] uppercase tracking-widest font-medium">Fat Content</p>
                                    <p className="text-white text-2xl font-bold mt-0.5">
                                      {b.fatPercentage > 0 ? b.fatPercentage : "—"}
                                      {b.fatPercentage > 0 && <span className="text-slate-400 text-sm font-normal ml-0.5">%</span>}
                                    </p>
                                  </div>
                                  <div className="text-center">
                                    <p className="text-slate-400 text-[10px] uppercase tracking-widest font-medium">Body Score</p>
                                    <p className="text-white text-2xl font-bold mt-0.5">
                                      {b.bodyScore != null ? b.bodyScore : "—"}
                                      {b.bodyScore != null && <span className="text-slate-400 text-sm font-normal ml-0.5">/5</span>}
                                    </p>
                                  </div>
                                </div>

                                {/* Spacer */}
                                <div />
                              </div>

                              {/* ══ RIGHT WHITE PANEL ══ */}
                              <div className="flex-1 bg-background overflow-y-auto max-h-[520px]">

                                {/* Panel title */}
                                <div className="px-6 pt-5 pb-4 border-b border-border">
                                  <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Full Profile</p>
                                </div>

                                <div className="px-6 py-4 space-y-0">
                                  {/* Row helper */}
                                  {[
                                    { section: "Animal Info", rows: [
                                      { label: "Breed",   value: b.breed },
                                      { label: "Age",     value: `${b.age} years` },
                                      { label: "Weight",  value: `${b.weight} kg` },
                                      { label: "Status",  value: b.status },
                                      { label: "Stage",   value: b.stage ?? b.status },
                                    ]},
                                    { section: "Purchase Info", rows: [
                                      { label: "Purchase Date", value: b.purchaseDate },
                                      { label: "Cost",          value: `₹ ${b.purchaseCost?.toLocaleString()}` },
                                      { label: "Source",        value: b.source || "—" },
                                      { label: "Insurance",     value: b.insurance || "N/A" },
                                    ]},
                                    ...((b.pregnancyDate || b.deliveryDate || b.lastHeatDate || b.nextVaccination) ? [{
                                      section: "Health & Reproduction",
                                      rows: [
                                        ...(b.pregnancyDate   ? [{ label: "Pregnancy Date",    value: b.pregnancyDate }]   : []),
                                        ...(b.deliveryDate    ? [{ label: "Expected Delivery",  value: b.deliveryDate }]    : []),
                                        ...(b.lastHeatDate    ? [{ label: "Last Heat",           value: b.lastHeatDate }]   : []),
                                        ...(b.nextVaccination ? [{ label: "Next Vaccination",   value: b.nextVaccination }] : []),
                                      ]
                                    }] : []),
                                  ].map((group, gi) => (
                                    <div key={group.section} className={gi > 0 ? "mt-5" : ""}>
                                      <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 mb-2">{group.section}</p>
                                      <div className="rounded-xl border border-border overflow-hidden">
                                        {group.rows.map((row, ri) => (
                                          <div
                                            key={row.label}
                                            className={`flex items-center justify-between px-4 py-2.5 text-sm ${ri < group.rows.length - 1 ? "border-b border-border" : ""} ${ri % 2 === 0 ? "bg-background" : "bg-muted/30"}`}
                                          >
                                            <span className="text-muted-foreground text-xs font-medium">{row.label}</span>
                                            <span className="font-semibold text-foreground text-xs">{row.value}</span>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  ))}
                                </div>

                                <div className="h-4" />
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>

                        {/* Delete */}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => handleDelete(b.id, b.name)}
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Delete {b.name}</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
