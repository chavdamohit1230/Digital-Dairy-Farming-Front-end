"use client"

import { useState } from "react"
import { medicalRecords, buffaloes } from "@/lib/data"
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
import { Plus, Stethoscope, Syringe, CalendarClock, IndianRupee, AlertTriangle } from "lucide-react"

const typeColors: Record<string, string> = {
  Vaccination: "bg-primary/10 text-primary border-primary/20",
  Deworming: "bg-chart-4/10 text-chart-4 border-chart-4/20",
  Treatment: "bg-destructive/10 text-destructive border-destructive/20",
  Checkup: "bg-chart-2/10 text-chart-2 border-chart-2/20",
}

export function MedicalPage() {
  const [showAddDialog, setShowAddDialog] = useState(false)

  const totalMedicalCost = medicalRecords.reduce((s, r) => s + r.cost, 0)
  const upcomingVacc = medicalRecords.filter((r) => r.nextDue).length
  const treatments = medicalRecords.filter((r) => r.type === "Treatment").length

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Medical & Veterinary</h1>
          <p className="text-sm text-muted-foreground">Health tracking, vaccinations, and treatments</p>
        </div>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" /> Add Record</Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add Medical Record</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <Label>Buffalo</Label>
                <Select>
                  <SelectTrigger><SelectValue placeholder="Select buffalo" /></SelectTrigger>
                  <SelectContent>
                    {buffaloes.map((b) => (
                      <SelectItem key={b.id} value={b.id}>{b.name} ({b.id})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Type</Label>
                <Select>
                  <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Vaccination">Vaccination</SelectItem>
                    <SelectItem value="Deworming">Deworming</SelectItem>
                    <SelectItem value="Treatment">Treatment</SelectItem>
                    <SelectItem value="Checkup">Checkup</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Date</Label>
                <Input type="date" />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Description</Label>
                <Input placeholder="Description of treatment" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <Label>Cost (Rs)</Label>
                  <Input type="number" placeholder="0" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label>Doctor</Label>
                  <Input placeholder="Doctor name" />
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Next Due Date (optional)</Label>
                <Input type="date" />
              </div>
              <Button className="w-full" onClick={() => setShowAddDialog(false)}>Save Record</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <Stethoscope className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Records</p>
              <p className="text-xl font-bold text-card-foreground">{medicalRecords.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-chart-3/10 flex items-center justify-center shrink-0">
              <Syringe className="h-5 w-5 text-chart-3" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Upcoming Vacc.</p>
              <p className="text-xl font-bold text-card-foreground">{upcomingVacc}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-destructive/10 flex items-center justify-center shrink-0">
              <AlertTriangle className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Active Treatments</p>
              <p className="text-xl font-bold text-card-foreground">{treatments}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-chart-2/10 flex items-center justify-center shrink-0">
              <IndianRupee className="h-5 w-5 text-chart-2" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Cost</p>
              <p className="text-xl font-bold text-card-foreground">Rs {totalMedicalCost.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Schedule */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <CalendarClock className="h-5 w-5 text-chart-3" />
            <CardTitle className="text-base text-card-foreground">Upcoming Schedule</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-2">
            {medicalRecords.filter((r) => r.nextDue).map((r) => (
              <div key={r.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div>
                  <p className="text-sm font-medium text-foreground">{r.buffaloName} - {r.description}</p>
                  <p className="text-xs text-muted-foreground">Due: {r.nextDue}</p>
                </div>
                <Badge variant="outline" className={typeColors[r.type]}>{r.type}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Records Table */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base text-card-foreground">Medical Records</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Buffalo</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Doctor</TableHead>
                  <TableHead>Cost</TableHead>
                  <TableHead>Next Due</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {medicalRecords.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell>{r.date}</TableCell>
                    <TableCell className="font-medium">{r.buffaloName}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={typeColors[r.type]}>{r.type}</Badge>
                    </TableCell>
                    <TableCell>{r.description}</TableCell>
                    <TableCell>{r.doctor || "-"}</TableCell>
                    <TableCell>Rs {r.cost.toLocaleString()}</TableCell>
                    <TableCell>{r.nextDue || "-"}</TableCell>
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
