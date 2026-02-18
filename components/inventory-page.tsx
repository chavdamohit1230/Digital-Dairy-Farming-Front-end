"use client"

import { feedInventory } from "@/lib/data"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Package, Wrench, Droplets, Zap, AlertTriangle } from "lucide-react"

const equipment = [
  { name: "Milking Machine - Unit 1", status: "Working", lastService: "2026-01-15", nextService: "2026-04-15" },
  { name: "Milking Machine - Unit 2", status: "Working", lastService: "2026-02-01", nextService: "2026-05-01" },
  { name: "Chaff Cutter", status: "Needs Repair", lastService: "2025-11-20", nextService: "2026-02-20" },
  { name: "Fodder Chopper", status: "Working", lastService: "2026-01-10", nextService: "2026-04-10" },
  { name: "Water Pump", status: "Working", lastService: "2025-12-05", nextService: "2026-03-05" },
]

const medicines = [
  { name: "Calcium Borogluconate", stock: 10, unit: "bottles", threshold: 3 },
  { name: "Oxytocin Injection", stock: 15, unit: "vials", threshold: 5 },
  { name: "Antibiotic (Enrofloxacin)", stock: 8, unit: "bottles", threshold: 3 },
  { name: "Deworming Tablets", stock: 2, unit: "strips", threshold: 5 },
  { name: "Teat Dip Solution", stock: 5, unit: "liters", threshold: 2 },
  { name: "Wound Spray", stock: 3, unit: "cans", threshold: 2 },
]

export function InventoryPage() {
  const lowFeed = feedInventory.filter((f) => f.stock <= f.lowStockThreshold)
  const lowMeds = medicines.filter((m) => m.stock <= m.threshold)
  const needsRepair = equipment.filter((e) => e.status === "Needs Repair")

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Inventory Management</h1>
        <p className="text-sm text-muted-foreground">Track all farm assets, stock, and equipment</p>
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
              {lowFeed.map((f) => (
                <Badge key={f.id} variant="outline" className="bg-destructive/10 text-destructive border-destructive/20">
                  Feed: {f.name} low ({f.stock} kg)
                </Badge>
              ))}
              {lowMeds.map((m) => (
                <Badge key={m.name} variant="outline" className="bg-chart-3/10 text-chart-3 border-chart-3/20">
                  Medicine: {m.name} low ({m.stock} {m.unit})
                </Badge>
              ))}
              {needsRepair.map((e) => (
                <Badge key={e.name} variant="outline" className="bg-chart-2/10 text-chart-2 border-chart-2/20">
                  Equipment: {e.name} needs repair
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <Package className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Feed Items</p>
              <p className="text-xl font-bold text-card-foreground">{feedInventory.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-chart-2/10 flex items-center justify-center shrink-0">
              <Droplets className="h-5 w-5 text-chart-2" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Medicine Items</p>
              <p className="text-xl font-bold text-card-foreground">{medicines.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-chart-3/10 flex items-center justify-center shrink-0">
              <Wrench className="h-5 w-5 text-chart-3" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Equipment</p>
              <p className="text-xl font-bold text-card-foreground">{equipment.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-destructive/10 flex items-center justify-center shrink-0">
              <AlertTriangle className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Low Stock</p>
              <p className="text-xl font-bold text-destructive">{lowFeed.length + lowMeds.length}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Medicine Stock */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base text-card-foreground">Medicine Inventory</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {medicines.map((m) => {
              const level = Math.min((m.stock / (m.threshold * 4)) * 100, 100)
              const isLow = m.stock <= m.threshold
              return (
                <div key={m.name} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-medium text-foreground truncate">{m.name}</p>
                      {isLow && <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20 text-xs ml-2">Low</Badge>}
                    </div>
                    <div className="flex items-center gap-3">
                      <Progress value={level} className={`flex-1 ${isLow ? "[&>div]:bg-destructive" : "[&>div]:bg-primary"}`} />
                      <span className="text-xs text-muted-foreground whitespace-nowrap">{m.stock} {m.unit}</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Equipment */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base text-card-foreground">Equipment & Machinery</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-3">
            {equipment.map((e) => (
              <div key={e.name} className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`h-3 w-3 rounded-full ${e.status === "Working" ? "bg-primary" : "bg-destructive"}`} />
                  <div>
                    <p className="text-sm font-medium text-foreground">{e.name}</p>
                    <p className="text-xs text-muted-foreground">Last service: {e.lastService}</p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge
                    variant="outline"
                    className={e.status === "Working"
                      ? "bg-primary/10 text-primary border-primary/20"
                      : "bg-destructive/10 text-destructive border-destructive/20"
                    }
                  >
                    {e.status}
                  </Badge>
                  <p className="text-xs text-muted-foreground mt-1">Next: {e.nextService}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
