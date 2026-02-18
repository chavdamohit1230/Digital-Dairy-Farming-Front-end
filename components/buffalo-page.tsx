"use client"

import { useState } from "react"
import { buffaloes, type Buffalo } from "@/lib/data"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table"
import { Plus, Search, Eye, Edit, Filter } from "lucide-react"

const statusColors: Record<string, string> = {
  Lactating: "bg-primary/10 text-primary border-primary/20",
  Dry: "bg-muted text-muted-foreground border-border",
  Pregnant: "bg-chart-2/10 text-chart-2 border-chart-2/20",
  Sick: "bg-destructive/10 text-destructive border-destructive/20",
}

export function BuffaloPage() {
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [selectedBuffalo, setSelectedBuffalo] = useState<Buffalo | null>(null)
  const [showAddDialog, setShowAddDialog] = useState(false)

  const filtered = buffaloes.filter((b) => {
    const matchSearch = b.name.toLowerCase().includes(search.toLowerCase()) || b.id.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === "all" || b.status === statusFilter
    return matchSearch && matchStatus
  })

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Buffalo Management</h1>
          <p className="text-sm text-muted-foreground">Track and manage all your buffaloes</p>
        </div>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" /> Add Buffalo</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Buffalo</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <Label>Name</Label>
                <Input placeholder="Buffalo name" />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>RFID Tag</Label>
                <Input placeholder="RFID-XXX" />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Breed</Label>
                <Input defaultValue="Murrah" />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Age (years)</Label>
                <Input type="number" placeholder="Age" />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Weight (kg)</Label>
                <Input type="number" placeholder="Weight" />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Status</Label>
                <Select defaultValue="Lactating">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Lactating">Lactating</SelectItem>
                    <SelectItem value="Dry">Dry</SelectItem>
                    <SelectItem value="Pregnant">Pregnant</SelectItem>
                    <SelectItem value="Sick">Sick</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Purchase Date</Label>
                <Input type="date" />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Purchase Cost (Rs)</Label>
                <Input type="number" placeholder="Cost" />
              </div>
              <div className="col-span-2 flex flex-col gap-1.5">
                <Label>Source</Label>
                <Input placeholder="Where purchased from" />
              </div>
            </div>
            <Button className="mt-4 w-full" onClick={() => setShowAddDialog(false)}>Save Buffalo</Button>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total", value: buffaloes.length, color: "text-foreground" },
          { label: "Lactating", value: buffaloes.filter((b) => b.status === "Lactating").length, color: "text-primary" },
          { label: "Pregnant", value: buffaloes.filter((b) => b.status === "Pregnant").length, color: "text-chart-2" },
          { label: "Sick", value: buffaloes.filter((b) => b.status === "Sick").length, color: "text-destructive" },
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
          <Input
            placeholder="Search by name or ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-44">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="Lactating">Lactating</SelectItem>
            <SelectItem value="Dry">Dry</SelectItem>
            <SelectItem value="Pregnant">Pregnant</SelectItem>
            <SelectItem value="Sick">Sick</SelectItem>
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
                  <TableHead>ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Breed</TableHead>
                  <TableHead>Age</TableHead>
                  <TableHead>Weight</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Milk (L/day)</TableHead>
                  <TableHead>Fat %</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((b) => (
                  <TableRow key={b.id}>
                    <TableCell className="font-mono text-xs">{b.id}</TableCell>
                    <TableCell className="font-medium">{b.name}</TableCell>
                    <TableCell>{b.breed}</TableCell>
                    <TableCell>{b.age} yrs</TableCell>
                    <TableCell>{b.weight} kg</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={statusColors[b.status]}>{b.status}</Badge>
                    </TableCell>
                    <TableCell>{b.milkYieldPerDay > 0 ? b.milkYieldPerDay : "-"}</TableCell>
                    <TableCell>{b.fatPercentage > 0 ? `${b.fatPercentage}%` : "-"}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="icon" onClick={() => setSelectedBuffalo(b)}>
                              <Eye className="h-4 w-4" />
                              <span className="sr-only">View {b.name}</span>
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>{b.name} - Details</DialogTitle>
                            </DialogHeader>
                            <div className="grid grid-cols-2 gap-3 text-sm">
                              <div><span className="text-muted-foreground">ID:</span> <span className="font-medium">{b.id}</span></div>
                              <div><span className="text-muted-foreground">Tag:</span> <span className="font-medium">{b.tagNumber}</span></div>
                              <div><span className="text-muted-foreground">Breed:</span> <span className="font-medium">{b.breed}</span></div>
                              <div><span className="text-muted-foreground">Age:</span> <span className="font-medium">{b.age} years</span></div>
                              <div><span className="text-muted-foreground">Weight:</span> <span className="font-medium">{b.weight} kg</span></div>
                              <div><span className="text-muted-foreground">Status:</span> <Badge variant="outline" className={statusColors[b.status]}>{b.status}</Badge></div>
                              <div><span className="text-muted-foreground">Purchased:</span> <span className="font-medium">{b.purchaseDate}</span></div>
                              <div><span className="text-muted-foreground">Cost:</span> <span className="font-medium">Rs {b.purchaseCost.toLocaleString()}</span></div>
                              <div><span className="text-muted-foreground">Source:</span> <span className="font-medium">{b.source}</span></div>
                              <div><span className="text-muted-foreground">Insurance:</span> <span className="font-medium">{b.insurance || "N/A"}</span></div>
                              {b.milkYieldPerDay > 0 && (
                                <>
                                  <div><span className="text-muted-foreground">Milk/Day:</span> <span className="font-medium">{b.milkYieldPerDay} L</span></div>
                                  <div><span className="text-muted-foreground">Fat:</span> <span className="font-medium">{b.fatPercentage}%</span></div>
                                </>
                              )}
                              {b.lactationStart && <div className="col-span-2"><span className="text-muted-foreground">Lactation Start:</span> <span className="font-medium">{b.lactationStart}</span></div>}
                              {b.pregnancyDate && <div><span className="text-muted-foreground">Pregnancy:</span> <span className="font-medium">{b.pregnancyDate}</span></div>}
                              {b.deliveryDate && <div><span className="text-muted-foreground">Expected Delivery:</span> <span className="font-medium">{b.deliveryDate}</span></div>}
                              {b.lastHeatDate && <div className="col-span-2"><span className="text-muted-foreground">Last Heat:</span> <span className="font-medium">{b.lastHeatDate}</span></div>}
                              {b.nextVaccination && <div className="col-span-2"><span className="text-muted-foreground">Next Vaccination:</span> <span className="font-medium">{b.nextVaccination}</span></div>}
                            </div>
                          </DialogContent>
                        </Dialog>
                        <Button variant="ghost" size="icon">
                          <Edit className="h-4 w-4" />
                          <span className="sr-only">Edit {b.name}</span>
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
