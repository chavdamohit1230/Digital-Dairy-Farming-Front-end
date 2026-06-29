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
import { Progress } from "@/components/ui/progress"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Plus, AlertTriangle, Wheat, Package, IndianRupee,
  Loader2, RefreshCw, AlertCircle, Trash2,
  TrendingDown, TrendingUp, Beef, FlaskConical, Clock, Minus,
} from "lucide-react"

// ─── Types ────────────────────────────────────────────────────────────────────
interface FeedItem {
  id: string
  type: string
  name: string
  stock: number
  unit: string
  costPerKg: number
  lowStockThreshold: number
  lastRestocked?: string | null
}

interface AnimalSummary {
  Lactating: number
  Pregnant: number
  Dry: number
  Sick: number
  Other: number
}

// ─── Nutrition requirements per animal per day (kg) ───────────────────────────
const NUTRITION_PLAN: Record<string, Record<string, number>> = {
  Lactating: { "Green Fodder": 15, "Dry Fodder": 8,  Concentrate: 4,   "Mineral Mix": 0.1 },
  Pregnant:  { "Green Fodder": 12, "Dry Fodder": 8,  Concentrate: 3,   "Mineral Mix": 0.1 },
  Dry:       { "Green Fodder": 10, "Dry Fodder": 8,  Concentrate: 2,   "Mineral Mix": 0.05 },
  Sick:      { "Green Fodder": 6,  "Dry Fodder": 5,  Concentrate: 1.5, "Mineral Mix": 0.05 },
  Other:     { "Green Fodder": 8,  "Dry Fodder": 6,  Concentrate: 2,   "Mineral Mix": 0.05 },
}

const TYPE_COLORS: Record<string, string> = {
  "Green Fodder":  "bg-emerald-100 text-emerald-800 border-emerald-200",
  "Dry Fodder":    "bg-amber-100 text-amber-800 border-amber-200",
  Concentrate:     "bg-blue-100 text-blue-800 border-blue-200",
  "Mineral Mix":   "bg-purple-100 text-purple-800 border-purple-200",
}

const FEED_TYPES = ["Green Fodder", "Dry Fodder", "Concentrate", "Mineral Mix"]

// ─── Component ────────────────────────────────────────────────────────────────
export function FeedPage() {
  const { t } = useI18n()
  const [feedInventory, setFeedInventory] = useState<FeedItem[]>([])
  const [animalSummary, setAnimalSummary]   = useState<AnimalSummary>({ Lactating: 0, Pregnant: 0, Dry: 0, Sick: 0, Other: 0 })
  const [isLoading, setIsLoading]           = useState(true)
  const [fetchError, setFetchError]         = useState<string | null>(null)

  // Add dialog
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [isSubmitting, setIsSubmitting]   = useState(false)
  const [formError, setFormError]         = useState("")
  const [formType, setFormType]           = useState("Green Fodder")
  const [formName, setFormName]           = useState("")
  const [formStock, setFormStock]         = useState("")
  const [formUnit, setFormUnit]           = useState("kg")
  const [formCost, setFormCost]           = useState("")
  const [formThreshold, setFormThreshold] = useState("")

  // Stock update dialog
  const [stockDialogItem, setStockDialogItem]     = useState<FeedItem | null>(null)
  const [stockAction, setStockAction]             = useState<"restock" | "consume">("restock")
  const [stockQty, setStockQty]                   = useState("")
  const [isStockSubmitting, setIsStockSubmitting] = useState(false)
  const [stockError, setStockError]               = useState("")

  // ─── Fetch ────────────────────────────────────────────────────────────────
  const fetchAll = async () => {
    setIsLoading(true); setFetchError(null)
    try {
      const [feedRes, animalRes] = await Promise.all([
        fetch("/api/feed-inventory"),
        fetch("/api/animals"),
      ])
      const feedJson   = await feedRes.json()
      const animalJson = await animalRes.json()

      if (feedJson.success) setFeedInventory(feedJson.data)
      else setFetchError(feedJson.message || "Failed to load feed inventory.")

      if (animalJson.success && Array.isArray(animalJson.data)) {
        const summary: AnimalSummary = { Lactating: 0, Pregnant: 0, Dry: 0, Sick: 0, Other: 0 }
        for (const a of animalJson.data) {
          const s = a.status as string
          if (s in summary) (summary as Record<string, number>)[s]++
          else summary.Other++
        }
        setAnimalSummary(summary)
      }
    } catch { setFetchError("Cannot reach the database.") }
    finally { setIsLoading(false) }
  }

  useEffect(() => { fetchAll() }, [])

  // ─── Stats ────────────────────────────────────────────────────────────────
  const totalStock   = feedInventory.reduce((s, f) => s + f.stock, 0)
  const totalValue   = feedInventory.reduce((s, f) => s + f.stock * f.costPerKg, 0)
  const lowStockItems = feedInventory.filter((f) => f.lowStockThreshold > 0 && f.stock <= f.lowStockThreshold)

  // ─── Daily Nutrition Calculation ──────────────────────────────────────────
  const dailyNeeds: Record<string, number> = {}
  for (const [status, count] of Object.entries(animalSummary)) {
    const plan = NUTRITION_PLAN[status] ?? NUTRITION_PLAN.Other
    for (const [feedType, kg] of Object.entries(plan)) {
      dailyNeeds[feedType] = (dailyNeeds[feedType] ?? 0) + kg * count
    }
  }

  // Days of stock remaining per feed type
  const stockByType: Record<string, number> = {}
  for (const f of feedInventory) {
    stockByType[f.type] = (stockByType[f.type] ?? 0) + f.stock
  }

  // ─── Add Feed ─────────────────────────────────────────────────────────────
  const resetForm = () => {
    setFormType("Green Fodder"); setFormName(""); setFormStock("")
    setFormUnit("kg"); setFormCost(""); setFormThreshold(""); setFormError("")
  }

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formName || !formStock || !formUnit) { setFormError("Name, stock and unit are required."); return }
    setIsSubmitting(true)
    try {
      const res  = await fetch("/api/feed-inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: formType, name: formName, stock: Number(formStock), unit: formUnit, costPerKg: Number(formCost), lowStockThreshold: Number(formThreshold) }),
      })
      const data = await res.json()
      if (data.success) { resetForm(); setShowAddDialog(false); fetchAll() }
      else setFormError(data.message || "Failed to save.")
    } catch { setFormError("Cannot reach the database.") }
    finally { setIsSubmitting(false) }
  }

  // ─── Update Stock ─────────────────────────────────────────────────────────
  const openStockDialog = (item: FeedItem, action: "restock" | "consume") => {
    setStockDialogItem(item); setStockAction(action); setStockQty(""); setStockError("")
  }

  const handleStockUpdate = async () => {
    if (!stockDialogItem || !stockQty || Number(stockQty) <= 0) { setStockError("Enter a valid quantity."); return }
    setIsStockSubmitting(true)
    try {
      const res  = await fetch(`/api/feed-inventory?id=${stockDialogItem.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: stockAction, quantity: Number(stockQty) }),
      })
      const data = await res.json()
      if (data.success) {
        setFeedInventory((prev) => prev.map((f) => f.id === stockDialogItem.id ? { ...f, stock: data.data.stock } : f))
        setStockDialogItem(null)
      } else setStockError(data.message || "Failed to update stock.")
    } catch { setStockError("Cannot reach the database.") }
    finally { setIsStockSubmitting(false) }
  }

  // ─── Delete ───────────────────────────────────────────────────────────────
  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Delete "${name}" from inventory?`)) return
    try {
      const res  = await fetch(`/api/feed-inventory?id=${id}`, { method: "DELETE" })
      const data = await res.json()
      if (data.success) setFeedInventory((prev) => prev.filter((f) => f.id !== id))
      else alert(data.message || "Delete failed.")
    } catch { alert("Cannot reach the database.") }
  }

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-6">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t.feed.title}</h1>
          <p className="text-sm text-muted-foreground">Manage feed inventory, nutrition plans, and daily consumption</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={fetchAll} title="Refresh"><RefreshCw className="h-4 w-4" /></Button>
          <Dialog open={showAddDialog} onOpenChange={(open) => { setShowAddDialog(open); if (!open) resetForm() }}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4 mr-2" />{t.common.add} Stock</Button>
            </DialogTrigger>
            <DialogContent className="max-w-md p-0 overflow-hidden rounded-2xl">
        <DialogTitle className="sr-only">Dialog</DialogTitle>
              {/* Header strip */}
              <div className="bg-emerald-600 px-6 py-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                    <Package className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <p className="text-white font-bold text-base leading-tight">{t.common.add} Stock</p>
                    <p className="text-emerald-100 text-xs">Add new feed item to your inventory</p>
                  </div>
                </div>
              </div>

              <div className="px-6 py-5">
                {formError && (
                  <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-xl p-3 mb-4">
                    <AlertCircle className="h-4 w-4 shrink-0" />{formError}
                  </div>
                )}

                <form onSubmit={handleAdd} className="flex flex-col gap-5">

                  {/* Feed Type — Visual Button Selector */}
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">Feed Type</p>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { value: "Green Fodder",  emoji: "🌿", color: "border-emerald-400 bg-emerald-50 text-emerald-700" },
                        { value: "Dry Fodder",    emoji: "🌾", color: "border-amber-400  bg-amber-50  text-amber-700"  },
                        { value: "Concentrate",   emoji: "🌽", color: "border-blue-400   bg-blue-50   text-blue-700"   },
                        { value: "Mineral Mix",   emoji: "💊", color: "border-purple-400 bg-purple-50 text-purple-700" },
                      ].map((item) => (
                        <button
                          key={item.value}
                          type="button"
                          onClick={() => setFormType(item.value)}
                          className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border-2 text-sm font-semibold transition-all
                            ${formType === item.value
                              ? `${item.color} shadow-sm scale-[1.02]`
                              : "border-border bg-background text-muted-foreground hover:border-border hover:bg-muted/40"
                            }`}
                        >
                          <span className="text-base">{item.emoji}</span>
                          <span className="text-xs font-semibold leading-tight">
                            {item.value === "Green Fodder" ? t.feed?.greenFodder ?? item.value : 
                             item.value === "Dry Fodder" ? t.feed?.dryFodder ?? item.value :
                             item.value === "Concentrate" ? t.feed?.concentrate ?? item.value :
                             item.value === "Mineral Mix" ? t.feed?.mineralMix ?? item.value : item.value}
                          </span>
                          {formType === item.value && (
                            <span className="ml-auto w-2 h-2 rounded-full bg-current opacity-60" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Feed Name */}
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">Feed Details</p>
                    <div className="flex flex-col gap-1.5">
                      <Label className="text-sm font-medium">
                        Name <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        placeholder="e.g. Napier Grass, Wheat Straw…"
                        value={formName}
                        onChange={(e) => setFormName(e.target.value)}
                        required
                        className="rounded-xl h-10"
                      />
                    </div>
                  </div>

                  {/* Quantity + Unit */}
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">Stock Info</p>
                    <div className="grid grid-cols-5 gap-3">
                      <div className="col-span-3 flex flex-col gap-1.5">
                        <Label className="text-sm font-medium">
                          Quantity <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          type="number" min={0}
                          placeholder="0"
                          value={formStock}
                          onChange={(e) => setFormStock(e.target.value)}
                          required
                          className="rounded-xl h-10"
                        />
                      </div>
                      <div className="col-span-2 flex flex-col gap-1.5">
                        <Label className="text-sm font-medium">Unit</Label>
                        <Select value={formUnit} onValueChange={setFormUnit}>
                          <SelectTrigger className="rounded-xl h-10"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="kg">kg</SelectItem>
                            <SelectItem value="g">g</SelectItem>
                            <SelectItem value="ton">ton</SelectItem>
                            <SelectItem value="litre">litre</SelectItem>
                            <SelectItem value="bundle">bundle</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  {/* Cost + Low Stock */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1.5">
                      <Label className="text-sm font-medium">Cost / {formUnit} (₹)</Label>
                      <Input
                        type="number" min={0} step={0.01}
                        placeholder="0.00"
                        value={formCost}
                        onChange={(e) => setFormCost(e.target.value)}
                        className="rounded-xl h-10"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <Label className="text-sm font-medium">Low Stock Alert</Label>
                      <Input
                        type="number" min={0}
                        placeholder={`0 ${formUnit}`}
                        value={formThreshold}
                        onChange={(e) => setFormThreshold(e.target.value)}
                        className="rounded-xl h-10"
                      />
                    </div>
                  </div>

                  {/* Value preview */}
                  {formStock && formCost && Number(formStock) > 0 && Number(formCost) > 0 && (
                    <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-2.5">
                      <span className="text-xs text-emerald-700 font-medium">Estimated Stock Value</span>
                      <span className="text-sm font-bold text-emerald-700">
                        ₹ {(Number(formStock) * Number(formCost)).toLocaleString()}
                      </span>
                    </div>
                  )}

                  <Button
                    type="submit"
                    className="w-full h-11 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm"
                    disabled={isSubmitting}
                  >
                    {isSubmitting
                      ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Saving...</>
                      : <><Plus className="h-4 w-4 mr-2" />{t.common?.save ?? "Save"}</>
                    }
                  </Button>
                </form>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* ── Loading / Error ── */}
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
          <Button variant="outline" size="sm" onClick={fetchAll}><RefreshCw className="h-3.5 w-3.5 mr-1" />Retry</Button>
        </div>
      )}

      {!isLoading && !fetchError && (
        <>
          {/* ── Summary Stats ── */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
                  <Wheat className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{t.common?.total ?? "Total"} Stock</p>
                  <p className="text-xl font-bold">{totalStock.toLocaleString()} kg</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">
                  <IndianRupee className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Stock Value</p>
                  <p className="text-xl font-bold">₹ {totalValue.toLocaleString()}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
                  <Package className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Feed Items</p>
                  <p className="text-xl font-bold">{feedInventory.length}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-red-100 flex items-center justify-center shrink-0">
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Low Stock</p>
                  <p className="text-xl font-bold text-destructive">{lowStockItems.length} items</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* ── Low Stock Alert ── */}
          {lowStockItems.length > 0 && (
            <Card className="border-destructive/30 bg-destructive/5">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="h-4 w-4 text-destructive" />
                  <span className="text-sm font-semibold text-destructive">Low Stock Alert — Restock Required</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {lowStockItems.map((f) => (
                    <Badge key={f.id} variant="outline" className="bg-destructive/10 text-destructive border-destructive/20">
                      {f.name}: {f.stock} {f.unit} remaining
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* ── Nutrition Planning ── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Daily Feed Plan */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-green-100 flex items-center justify-center">
                    <Beef className="h-4 w-4 text-green-600" />
                  </div>
                  <CardTitle className="text-base">Daily Nutrition Plan</CardTitle>
                </div>
                <p className="text-xs text-muted-foreground">
                  Required feed based on your herd:
                  {animalSummary.Lactating > 0 && ` ${animalSummary.Lactating} Lactating`}
                  {animalSummary.Pregnant > 0 && `, ${animalSummary.Pregnant} Pregnant`}
                  {animalSummary.Dry > 0 && `, ${animalSummary.Dry} Dry`}
                  {animalSummary.Sick > 0 && `, ${animalSummary.Sick} Sick`}
                </p>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-border">
                  {FEED_TYPES.map((feedType) => {
                    const needed = dailyNeeds[feedType] ?? 0
                    const inStock = stockByType[feedType] ?? 0
                    const daysLeft = needed > 0 ? Math.floor(inStock / needed) : null
                    const isLow = daysLeft !== null && daysLeft <= 3
                    return (
                      <div key={feedType} className="flex items-center justify-between px-5 py-3">
                        <div className="flex items-center gap-2.5">
                          <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-md border ${TYPE_COLORS[feedType]}`}>
                            {feedType}
                          </span>
                        </div>
                        <div className="flex items-center gap-6 text-right">
                          <div>
                            <p className="text-[10px] text-muted-foreground">Daily Need</p>
                            <p className="text-sm font-bold text-foreground">{needed.toFixed(1)} kg</p>
                          </div>
                          <div>
                            <p className="text-[10px] text-muted-foreground">In Stock</p>
                            <p className={`text-sm font-bold ${isLow ? "text-destructive" : "text-foreground"}`}>
                              {inStock.toFixed(0)} kg
                            </p>
                          </div>
                          <div>
                            <p className="text-[10px] text-muted-foreground">Days Left</p>
                            <div className="flex items-center gap-1">
                              {daysLeft === null ? (
                                <p className="text-sm font-bold text-muted-foreground">—</p>
                              ) : (
                                <>
                                  <p className={`text-sm font-bold ${isLow ? "text-destructive" : daysLeft <= 7 ? "text-amber-600" : "text-emerald-600"}`}>
                                    {daysLeft}d
                                  </p>
                                  {isLow && <AlertTriangle className="h-3 w-3 text-destructive" />}
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Per-Status Nutrition Table */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-purple-100 flex items-center justify-center">
                    <FlaskConical className="h-4 w-4 text-purple-600" />
                  </div>
                  <CardTitle className="text-base">Nutrition Standard (per animal/day)</CardTitle>
                </div>
                <p className="text-xs text-muted-foreground">Recommended daily feed quantity by animal status</p>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-xs">Status</TableHead>
                        <TableHead className="text-xs text-center">Green Fodder</TableHead>
                        <TableHead className="text-xs text-center">Dry Fodder</TableHead>
                        <TableHead className="text-xs text-center">Concentrate</TableHead>
                        <TableHead className="text-xs text-center">Mineral Mix</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {Object.entries(NUTRITION_PLAN).map(([status, plan]) => (
                        <TableRow key={status}>
                          <TableCell>
                            <Badge variant="outline" className="text-[11px] font-medium">
                              {status}
                              {animalSummary[status as keyof AnimalSummary] > 0 && (
                                <span className="ml-1 text-primary font-bold">×{animalSummary[status as keyof AnimalSummary]}</span>
                              )}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center text-xs font-semibold">{plan["Green Fodder"]} kg</TableCell>
                          <TableCell className="text-center text-xs font-semibold">{plan["Dry Fodder"]} kg</TableCell>
                          <TableCell className="text-center text-xs font-semibold">{plan["Concentrate"]} kg</TableCell>
                          <TableCell className="text-center text-xs font-semibold">{plan["Mineral Mix"] * 1000}g</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* ── Inventory Table ── */}
          <Card>
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-amber-100 flex items-center justify-center">
                  <Package className="h-4 w-4 text-amber-600" />
                </div>
                <CardTitle className="text-base">Feed Inventory</CardTitle>
              </div>
              <span className="text-xs text-muted-foreground">{feedInventory.length} items</span>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Stock</TableHead>
                      <TableHead>Level</TableHead>
                      <TableHead>Cost/kg</TableHead>
                      <TableHead>{t.common?.total ?? "Total"} Value</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {feedInventory.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-10 text-muted-foreground">
                          No feed items yet. Click &quot;Add Feed Stock&quot; to get started.
                        </TableCell>
                      </TableRow>
                    ) : feedInventory.map((f) => {
                      const level  = f.lowStockThreshold > 0 ? Math.min((f.stock / (f.lowStockThreshold * 5)) * 100, 100) : 100
                      const isLow  = f.lowStockThreshold > 0 && f.stock <= f.lowStockThreshold
                      const dailyUse = dailyNeeds[f.type] ? dailyNeeds[f.type] : null
                      return (
                        <TableRow key={f.id}>
                          <TableCell>
                            <Badge variant="outline" className={`text-[11px] font-semibold border ${TYPE_COLORS[f.type] ?? ""}`}>
                              {f.type}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-medium">{f.name}</TableCell>
                          <TableCell className="font-mono text-sm">{f.stock} {f.unit}</TableCell>
                          <TableCell>
                            <div className="w-24">
                              <Progress
                                value={level}
                                className={isLow ? "[&>div]:bg-destructive" : level < 50 ? "[&>div]:bg-amber-500" : "[&>div]:bg-emerald-500"}
                              />
                            </div>
                          </TableCell>
                          <TableCell className="text-sm">₹ {f.costPerKg}</TableCell>
                          <TableCell className="text-sm font-semibold">₹ {(f.stock * f.costPerKg).toLocaleString()}</TableCell>
                          <TableCell>
                            {isLow
                              ? <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20 text-[11px]">Low</Badge>
                              : <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[11px]">OK</Badge>
                            }
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              {/* Restock */}
                              <Button
                                variant="ghost" size="icon"
                                className="h-7 w-7 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                                title="Restock"
                                onClick={() => openStockDialog(f, "restock")}
                              >
                                <TrendingUp className="h-3.5 w-3.5" />
                              </Button>
                              {/* Consume */}
                              <Button
                                variant="ghost" size="icon"
                                className="h-7 w-7 text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                                title="Record consumption"
                                onClick={() => openStockDialog(f, "consume")}
                              >
                                <TrendingDown className="h-3.5 w-3.5" />
                              </Button>
                              {/* Delete */}
                              <Button
                                variant="ghost" size="icon"
                                className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10"
                                title="Delete"
                                onClick={() => handleDelete(f.id, f.name)}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* ── Stock Update Dialog ── */}
      <Dialog open={!!stockDialogItem} onOpenChange={(open) => { if (!open) setStockDialogItem(null) }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>
              {stockAction === "restock" ? "Restock" : "Record Consumption"} — {stockDialogItem?.name}
            </DialogTitle>
          </DialogHeader>
          {stockError && (
            <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg p-3">
              <AlertCircle className="h-4 w-4 shrink-0" />{stockError}
            </div>
          )}
          <div className="flex flex-col gap-4">
            <div className="flex rounded-xl overflow-hidden border border-border">
              <button
                type="button"
                className={`flex-1 py-2 text-sm font-semibold transition-colors ${stockAction === "restock" ? "bg-emerald-600 text-white" : "bg-background text-muted-foreground hover:bg-muted"}`}
                onClick={() => setStockAction("restock")}
              >
                <TrendingUp className="h-4 w-4 inline mr-1" />Restock
              </button>
              <button
                type="button"
                className={`flex-1 py-2 text-sm font-semibold transition-colors ${stockAction === "consume" ? "bg-amber-500 text-white" : "bg-background text-muted-foreground hover:bg-muted"}`}
                onClick={() => setStockAction("consume")}
              >
                <Minus className="h-4 w-4 inline mr-1" />Consume
              </button>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">
                Current stock: <span className="font-semibold text-foreground">{stockDialogItem?.stock} {stockDialogItem?.unit}</span>
              </p>
              <Label className="text-sm">
                {stockAction === "restock" ? "Add Quantity" : "Consumed Quantity"} ({stockDialogItem?.unit})
              </Label>
              <Input
                type="number" min={1} placeholder="0" className="mt-1.5"
                value={stockQty}
                onChange={(e) => setStockQty(e.target.value)}
                autoFocus
              />
              {stockQty && Number(stockQty) > 0 && (
                <p className="text-xs text-muted-foreground mt-1.5">
                  New stock will be:{" "}
                  <span className="font-bold text-foreground">
                    {stockAction === "restock"
                      ? (stockDialogItem?.stock ?? 0) + Number(stockQty)
                      : Math.max(0, (stockDialogItem?.stock ?? 0) - Number(stockQty))
                    } {stockDialogItem?.unit}
                  </span>
                </p>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setStockDialogItem(null)}>Cancel</Button>
              <Button
                className={`flex-1 ${stockAction === "restock" ? "bg-emerald-600 hover:bg-emerald-700" : "bg-amber-500 hover:bg-amber-600"}`}
                onClick={handleStockUpdate}
                disabled={isStockSubmitting}
              >
                {isStockSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Confirm"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
