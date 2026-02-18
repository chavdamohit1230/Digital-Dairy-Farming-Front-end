"use client"

import { useState } from "react"
import { feedInventory } from "@/lib/data"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table"
import { Plus, AlertTriangle, Wheat, Package, IndianRupee } from "lucide-react"

export function FeedPage() {
  const [showAddDialog, setShowAddDialog] = useState(false)

  const totalStock = feedInventory.reduce((sum, f) => sum + f.stock, 0)
  const totalValue = feedInventory.reduce((sum, f) => sum + f.stock * f.costPerKg, 0)
  const lowStockItems = feedInventory.filter((f) => f.stock <= f.lowStockThreshold)
  const dailyFeedCost = 2200

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Feed Management</h1>
          <p className="text-sm text-muted-foreground">Track feed inventory, consumption, and costs</p>
        </div>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" /> Add Feed Stock</Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add Feed Stock</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <Label>Feed Type</Label>
                <Select>
                  <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Green Fodder">Green Fodder</SelectItem>
                    <SelectItem value="Dry Fodder">Dry Fodder</SelectItem>
                    <SelectItem value="Concentrate">Concentrate</SelectItem>
                    <SelectItem value="Mineral Mix">Mineral Mix</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Feed Name</Label>
                <Input placeholder="Feed name" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <Label>Quantity (kg)</Label>
                  <Input type="number" placeholder="0" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label>Cost/kg (Rs)</Label>
                  <Input type="number" placeholder="0" />
                </div>
              </div>
              <Button className="w-full" onClick={() => setShowAddDialog(false)}>Add Stock</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <Wheat className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Stock</p>
              <p className="text-xl font-bold text-card-foreground">{totalStock.toLocaleString()} kg</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-chart-2/10 flex items-center justify-center shrink-0">
              <IndianRupee className="h-5 w-5 text-chart-2" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Stock Value</p>
              <p className="text-xl font-bold text-card-foreground">Rs {totalValue.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-chart-3/10 flex items-center justify-center shrink-0">
              <Package className="h-5 w-5 text-chart-3" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Daily Cost</p>
              <p className="text-xl font-bold text-card-foreground">Rs {dailyFeedCost.toLocaleString()}</p>
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
              <p className="text-xl font-bold text-destructive">{lowStockItems.length} items</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Low Stock Alert */}
      {lowStockItems.length > 0 && (
        <Card className="border-destructive/30 bg-destructive/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-4 w-4 text-destructive" />
              <span className="text-sm font-semibold text-destructive">Low Stock Alert</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {lowStockItems.map((f) => (
                <Badge key={f.id} variant="outline" className="bg-destructive/10 text-destructive border-destructive/20">
                  {f.name}: {f.stock} kg remaining
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Inventory Table */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base text-card-foreground">Feed Inventory</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Stock Level</TableHead>
                  <TableHead>Cost/kg</TableHead>
                  <TableHead>Total Value</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {feedInventory.map((f) => {
                  const level = Math.min((f.stock / (f.lowStockThreshold * 5)) * 100, 100)
                  const isLow = f.stock <= f.lowStockThreshold
                  return (
                    <TableRow key={f.id}>
                      <TableCell>
                        <Badge variant="secondary" className="text-secondary-foreground">{f.type}</Badge>
                      </TableCell>
                      <TableCell className="font-medium">{f.name}</TableCell>
                      <TableCell>{f.stock} {f.unit}</TableCell>
                      <TableCell>
                        <div className="w-24">
                          <Progress value={level} className={isLow ? "[&>div]:bg-destructive" : "[&>div]:bg-primary"} />
                        </div>
                      </TableCell>
                      <TableCell>Rs {f.costPerKg}</TableCell>
                      <TableCell>Rs {(f.stock * f.costPerKg).toLocaleString()}</TableCell>
                      <TableCell>
                        {isLow ? (
                          <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20">Low</Badge>
                        ) : (
                          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">OK</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Feed Cost Analysis */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base text-card-foreground">Feed Cost Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">Feed Cost / Buffalo / Day</p>
              <p className="text-2xl font-bold text-foreground">Rs {(dailyFeedCost / 10).toFixed(0)}</p>
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">Feed Cost / Litre Milk</p>
              <p className="text-2xl font-bold text-foreground">Rs {(dailyFeedCost / 80).toFixed(1)}</p>
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">Monthly Feed Expense</p>
              <p className="text-2xl font-bold text-foreground">Rs {(dailyFeedCost * 30).toLocaleString()}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
