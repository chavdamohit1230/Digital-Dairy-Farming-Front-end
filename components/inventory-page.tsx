"use client"

import { useState, useEffect, useCallback } from "react"
import { useI18n } from "@/lib/i18n/context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from "@/components/ui/dialog"
import { Package, Wrench, Droplets, Zap, AlertTriangle, Plus, Loader2, RefreshCw, AlertCircle, Trash2 } from "lucide-react"

interface FeedItem { id: string; name: string; stock: number; unit: string; lowStockThreshold: number; }
interface Medicine { id: string; name: string; stock: number; unit: string; threshold: number; }
interface Equipment { id: string; name: string; status: string; lastService: string; nextService: string; }

export function InventoryPage() {
  const { t } = useI18n()
  const [feed, setFeed] = useState<FeedItem[]>([])
  const [medicines, setMedicines] = useState<Medicine[]>([])
  const [equipment, setEquipment] = useState<Equipment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [fetchError, setFetchError] = useState("")

  const [activeDialog, setActiveDialog] = useState<"medicine" | "equipment" | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Medicine Form
  const [mName, setMName] = useState("")
  const [mStock, setMStock] = useState("")
  const [mUnit, setMUnit] = useState("bottles")
  const [mThreshold, setMThreshold] = useState("")

  // Equipment Form
  const [eName, setEName] = useState("")
  const [eStatus, setEStatus] = useState("Working")
  const [eLast, setELast] = useState("")
  const [eNext, setENext] = useState("")

  const fetchData = useCallback(async () => {
    setIsLoading(true); setFetchError("")
    try {
      const [resF, resM, resE] = await Promise.all([
        fetch("/api/feed-inventory"), fetch("/api/medicines"), fetch("/api/equipment")
      ])
      const [jsonF, jsonM, jsonE] = await Promise.all([resF.json(), resM.json(), resE.json()])
      if (jsonF.success) setFeed(jsonF.data)
      if (jsonM.success) setMedicines(jsonM.data)
      if (jsonE.success) setEquipment(jsonE.data)
    } catch {
      setFetchError("Cannot reach the database.")
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const handleAddMedicine = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      await fetch("/api/medicines", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: mName, stock: mStock, unit: mUnit, threshold: mThreshold })
      })
      setActiveDialog(null); setMName(""); setMStock(""); setMUnit("bottles"); setMThreshold(""); fetchData()
    } finally { setIsSubmitting(false) }
  }

  const handleAddEquipment = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      await fetch("/api/equipment", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: eName, status: eStatus, lastService: eLast, nextService: eNext })
      })
      setActiveDialog(null); setEName(""); setEStatus("Working"); setELast(""); setENext(""); fetchData()
    } finally { setIsSubmitting(false) }
  }

  const handleDelete = async (apiPath: string, id: string) => {
    if (!window.confirm("Delete this item?")) return
    await fetch(`/api/${apiPath}?id=${id}`, { method: "DELETE" })
    fetchData()
  }

  const lowFeed = feed.filter((f) => f.stock <= f.lowStockThreshold)
  const lowMeds = medicines.filter((m) => m.stock <= m.threshold)
  const needsRepair = equipment.filter((e) => e.status === "Needs Repair")

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t.nav.inventory}</h1>
          <p className="text-sm text-muted-foreground">Track all farm assets, stock, and equipment</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" size="icon" onClick={fetchData} title="Refresh"><RefreshCw className="h-4 w-4" /></Button>

          <Dialog open={activeDialog === "medicine"} onOpenChange={(o) => setActiveDialog(o ? "medicine" : null)}>
            <DialogTrigger asChild><Button variant="secondary"><Plus className="h-4 w-4 mr-2" /> {t.common.add} Medicine</Button></DialogTrigger>
            <DialogContent className="max-w-md p-0 overflow-hidden rounded-2xl">
        <DialogTitle className="sr-only">Dialog</DialogTitle>
              <div className="bg-slate-800 px-6 py-4 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center"><Droplets className="h-4 w-4 text-white" /></div>
                <div><p className="text-white font-bold text-base">{t.common.add} Medicine</p><p className="text-slate-400 text-xs">Record vet stock</p></div>
              </div>
              <form onSubmit={handleAddMedicine} className="px-6 py-5 flex flex-col gap-4">
                <div className="flex flex-col gap-1.5"><Label>Name *</Label><Input value={mName} onChange={e=>setMName(e.target.value)} required className="rounded-xl h-10" /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1.5"><Label>Stock Qty *</Label><Input type="number" value={mStock} onChange={e=>setMStock(e.target.value)} required className="rounded-xl h-10" /></div>
                  <div className="flex flex-col gap-1.5"><Label>Unit</Label><Input value={mUnit} onChange={e=>setMUnit(e.target.value)} className="rounded-xl h-10" /></div>
                </div>
                <div className="flex flex-col gap-1.5"><Label>Low Alert Threshold</Label><Input type="number" value={mThreshold} onChange={e=>setMThreshold(e.target.value)} className="rounded-xl h-10" /></div>
                <Button type="submit" className="w-full h-11 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white mt-2" disabled={isSubmitting}>
                  {isSubmitting ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Saving...</> : "Save Medicine"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog open={activeDialog === "equipment"} onOpenChange={(o) => setActiveDialog(o ? "equipment" : null)}>
            <DialogTrigger asChild><Button variant="secondary"><Plus className="h-4 w-4 mr-2" /> {t.common.add} Equipment</Button></DialogTrigger>
            <DialogContent className="max-w-md p-0 overflow-hidden rounded-2xl">
        <DialogTitle className="sr-only">Dialog</DialogTitle>
              <div className="bg-slate-800 px-6 py-4 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center"><Wrench className="h-4 w-4 text-white" /></div>
                <div><p className="text-white font-bold text-base">{t.common.add} Equipment</p><p className="text-slate-400 text-xs">Record machinery</p></div>
              </div>
              <form onSubmit={handleAddEquipment} className="px-6 py-5 flex flex-col gap-4">
                <div className="flex flex-col gap-1.5"><Label>Name *</Label><Input value={eName} onChange={e=>setEName(e.target.value)} required className="rounded-xl h-10" /></div>
                <div className="flex flex-col gap-1.5">
                  <Label>Status</Label>
                  <Select value={eStatus} onValueChange={setEStatus}>
                    <SelectTrigger className="rounded-xl h-10"><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="Working">Working</SelectItem><SelectItem value="Needs Repair">Needs Repair</SelectItem></SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1.5"><Label>Last Service</Label><Input type="date" value={eLast} onChange={e=>setELast(e.target.value)} className="rounded-xl h-10" /></div>
                  <div className="flex flex-col gap-1.5"><Label>Next Service</Label><Input type="date" value={eNext} onChange={e=>setENext(e.target.value)} className="rounded-xl h-10" /></div>
                </div>
                <Button type="submit" className="w-full h-11 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white mt-2" disabled={isSubmitting}>
                  {isSubmitting ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Saving...</> : "Save Equipment"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Alert Summary */}
      {(lowFeed.length + lowMeds.length + needsRepair.length) > 0 && (
        <Card className="border-destructive/30 bg-destructive/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              <span className="font-semibold text-destructive">Attention Required</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {lowFeed.map((f) => <Badge key={f.id} variant="outline" className="bg-destructive/10 text-destructive border-destructive/20">Feed: {f.name} low ({f.stock} {f.unit})</Badge>)}
              {lowMeds.map((m) => <Badge key={m.id} variant="outline" className="bg-amber-50 text-amber-600 border-amber-200">Medicine: {m.name} low ({m.stock} {m.unit})</Badge>)}
              {needsRepair.map((e) => <Badge key={e.id} variant="outline" className="bg-destructive/10 text-destructive border-destructive/20">Equipment: {e.name} needs repair</Badge>)}
            </div>
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center h-40 gap-3"><Loader2 className="h-8 w-8 animate-spin text-primary" /><p className="text-muted-foreground text-sm">Loading from database…</p></div>
      ) : fetchError ? (
        <div className="flex flex-col items-center justify-center h-40 gap-3"><AlertCircle className="h-8 w-8 text-destructive" /><p className="text-sm text-destructive">{fetchError}</p></div>
      ) : (
        <>
          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card><CardContent className="p-4 flex items-center gap-3"><div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0"><Package className="h-5 w-5 text-primary" /></div><div><p className="text-xs text-muted-foreground">Feed Items</p><p className="text-xl font-bold">{feed.length}</p></div></CardContent></Card>
            <Card><CardContent className="p-4 flex items-center gap-3"><div className="h-10 w-10 rounded-xl bg-blue-100 flex items-center justify-center shrink-0"><Droplets className="h-5 w-5 text-blue-600" /></div><div><p className="text-xs text-muted-foreground">Medicine Items</p><p className="text-xl font-bold">{medicines.length}</p></div></CardContent></Card>
            <Card><CardContent className="p-4 flex items-center gap-3"><div className="h-10 w-10 rounded-xl bg-orange-100 flex items-center justify-center shrink-0"><Wrench className="h-5 w-5 text-orange-600" /></div><div><p className="text-xs text-muted-foreground">Equipment</p><p className="text-xl font-bold">{equipment.length}</p></div></CardContent></Card>
            <Card><CardContent className="p-4 flex items-center gap-3"><div className="h-10 w-10 rounded-xl bg-destructive/10 flex items-center justify-center shrink-0"><AlertTriangle className="h-5 w-5 text-destructive" /></div><div><p className="text-xs text-muted-foreground">Alerts</p><p className="text-xl font-bold text-destructive">{lowFeed.length + lowMeds.length + needsRepair.length}</p></div></CardContent></Card>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {/* Medicine Stock */}
            <Card className="flex flex-col h-full">
              <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <CardTitle className="text-base text-card-foreground">Medicine Inventory</CardTitle>
              </CardHeader>
              <CardContent className="flex-1">
                {medicines.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-10">No medicines recorded.</p>
                ) : (
                  <div className="flex flex-col gap-3">
                    {medicines.map((m) => {
                      const level = Math.min((m.stock / Math.max(m.threshold * 4, 1)) * 100, 100)
                      const isLow = m.stock <= m.threshold
                      return (
                        <div key={m.id} className="flex flex-col p-3 bg-muted/50 border border-border rounded-xl">
                          <div className="flex items-center justify-between mb-1.5">
                            <p className="text-sm font-semibold">{m.name}</p>
                            <div className="flex items-center gap-2">
                              {isLow && <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20 text-[10px] h-5 px-1.5">Low</Badge>}
                              <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive hover:bg-destructive/10" onClick={() => handleDelete("medicines", m.id)}><Trash2 className="h-3 w-3" /></Button>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <Progress value={level} className={`flex-1 h-2 ${isLow ? "[&>div]:bg-destructive" : "[&>div]:bg-primary"}`} />
                            <span className="text-xs text-muted-foreground whitespace-nowrap min-w-[60px] text-right font-medium">{m.stock} {m.unit}</span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Equipment */}
            <Card className="flex flex-col h-full">
              <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <CardTitle className="text-base text-card-foreground">Equipment & Machinery</CardTitle>
              </CardHeader>
              <CardContent className="flex-1">
                {equipment.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-10">No equipment recorded.</p>
                ) : (
                  <div className="flex flex-col gap-3">
                    {equipment.map((e) => (
                      <div key={e.id} className="flex items-center justify-between p-3 bg-muted/50 border border-border rounded-xl">
                        <div className="flex items-start gap-3">
                          <div className={`mt-1 h-2.5 w-2.5 rounded-full shrink-0 ${e.status === "Working" ? "bg-emerald-500" : "bg-destructive"}`} />
                          <div>
                            <p className="text-sm font-semibold text-foreground">{e.name}</p>
                            <p className="text-[11px] text-muted-foreground mt-0.5">Service: {e.lastService || "—"} → {e.nextService || "—"}</p>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1.5">
                          <Badge variant="outline" className={e.status === "Working" ? "bg-emerald-50 text-emerald-600 border-emerald-200" : "bg-destructive/10 text-destructive border-destructive/20"}>
                            {e.status}
                          </Badge>
                          <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive hover:bg-destructive/10" onClick={() => handleDelete("equipment", e.id)}><Trash2 className="h-3 w-3" /></Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  )
}
