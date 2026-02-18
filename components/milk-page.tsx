"use client"

import { useState } from "react"
import { milkEntries, buffaloes, dailyMilkData } from "@/lib/data"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table"
import { Plus, Download, Milk, TrendingUp, Award, BarChart3 } from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"

export function MilkPage() {
  const [showAddDialog, setShowAddDialog] = useState(false)

  const totalToday = milkEntries.reduce((sum, e) => sum + e.totalQty, 0)
  const avgFat = (milkEntries.reduce((sum, e) => sum + e.fatPercent, 0) / milkEntries.length).toFixed(1)
  const bestBuffalo = milkEntries.reduce((best, e) => (e.totalQty > best.totalQty ? e : best), milkEntries[0])

  const lactating = buffaloes.filter((b) => b.status === "Lactating" || (b.status === "Sick" && b.milkYieldPerDay > 0))

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Milk Production</h1>
          <p className="text-sm text-muted-foreground">Daily milk tracking and analytics</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" /> Export
          </Button>
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4 mr-2" /> Add Entry</Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Add Milk Entry</DialogTitle>
              </DialogHeader>
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <Label>Buffalo</Label>
                  <Select>
                    <SelectTrigger><SelectValue placeholder="Select buffalo" /></SelectTrigger>
                    <SelectContent>
                      {lactating.map((b) => (
                        <SelectItem key={b.id} value={b.id}>{b.name} ({b.id})</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label>Date</Label>
                  <Input type="date" defaultValue="2026-02-17" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <Label>Morning (L)</Label>
                    <Input type="number" step="0.5" placeholder="0.0" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label>Evening (L)</Label>
                    <Input type="number" step="0.5" placeholder="0.0" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <Label>Fat %</Label>
                    <Input type="number" step="0.1" placeholder="0.0" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label>SNF %</Label>
                    <Input type="number" step="0.1" placeholder="0.0" />
                  </div>
                </div>
                <Button className="w-full" onClick={() => setShowAddDialog(false)}>Save Entry</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <Milk className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Today Total</p>
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
              <p className="text-xs text-muted-foreground">Avg Fat %</p>
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
              <p className="text-xl font-bold text-card-foreground">{(totalToday / milkEntries.length).toFixed(1)} L</p>
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
              <p className="text-xl font-bold text-card-foreground">{bestBuffalo.buffaloName}</p>
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
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyMilkData}>
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
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base text-card-foreground">Today&apos;s Entries - Feb 17, 2026</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Buffalo</TableHead>
                  <TableHead>Morning (L)</TableHead>
                  <TableHead>Evening (L)</TableHead>
                  <TableHead>Total (L)</TableHead>
                  <TableHead>Fat %</TableHead>
                  <TableHead>SNF %</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {milkEntries.map((e) => (
                  <TableRow key={e.id}>
                    <TableCell className="font-medium">{e.buffaloName}</TableCell>
                    <TableCell>{e.morningQty}</TableCell>
                    <TableCell>{e.eveningQty}</TableCell>
                    <TableCell className="font-semibold">{e.totalQty}</TableCell>
                    <TableCell>{e.fatPercent}%</TableCell>
                    <TableCell>{e.snfPercent}%</TableCell>
                  </TableRow>
                ))}
                <TableRow className="bg-muted/50 font-bold">
                  <TableCell>Total</TableCell>
                  <TableCell>{milkEntries.reduce((s, e) => s + e.morningQty, 0)}</TableCell>
                  <TableCell>{milkEntries.reduce((s, e) => s + e.eveningQty, 0)}</TableCell>
                  <TableCell>{totalToday}</TableCell>
                  <TableCell>{avgFat}%</TableCell>
                  <TableCell>-</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
