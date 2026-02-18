"use client"

import { useState } from "react"
import { workers } from "@/lib/data"
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
import { Plus, Users, IndianRupee, Clock, CalendarCheck } from "lucide-react"

const shiftColors: Record<string, string> = {
  Morning: "bg-chart-3/10 text-chart-3 border-chart-3/20",
  Evening: "bg-chart-2/10 text-chart-2 border-chart-2/20",
  "Full Day": "bg-primary/10 text-primary border-primary/20",
}

export function LabourPage() {
  const [showAddDialog, setShowAddDialog] = useState(false)

  const totalSalary = workers.reduce((s, w) => s + w.salary, 0)
  const totalAdvance = workers.reduce((s, w) => s + w.advance, 0)
  const avgAttendance = (workers.reduce((s, w) => s + w.attendance, 0) / workers.length).toFixed(1)

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Labour Management</h1>
          <p className="text-sm text-muted-foreground">Track workers, attendance, and payroll</p>
        </div>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" /> Add Worker</Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Worker</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <Label>Name</Label>
                <Input placeholder="Worker name" />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Role</Label>
                <Input placeholder="e.g., Milking, Feeding" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <Label>Salary (Rs/month)</Label>
                  <Input type="number" placeholder="0" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label>Phone</Label>
                  <Input placeholder="+91" />
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Shift</Label>
                <Select>
                  <SelectTrigger><SelectValue placeholder="Select shift" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Morning">Morning</SelectItem>
                    <SelectItem value="Evening">Evening</SelectItem>
                    <SelectItem value="Full Day">Full Day</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Join Date</Label>
                <Input type="date" />
              </div>
              <Button className="w-full" onClick={() => setShowAddDialog(false)}>Add Worker</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Workers</p>
              <p className="text-xl font-bold text-card-foreground">{workers.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-chart-2/10 flex items-center justify-center shrink-0">
              <IndianRupee className="h-5 w-5 text-chart-2" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Monthly Salary</p>
              <p className="text-xl font-bold text-card-foreground">Rs {totalSalary.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-chart-3/10 flex items-center justify-center shrink-0">
              <CalendarCheck className="h-5 w-5 text-chart-3" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Avg Attendance</p>
              <p className="text-xl font-bold text-card-foreground">{avgAttendance} days</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-destructive/10 flex items-center justify-center shrink-0">
              <Clock className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Pending Advance</p>
              <p className="text-xl font-bold text-card-foreground">Rs {totalAdvance.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Workers Table */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base text-card-foreground">Workers List</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Shift</TableHead>
                  <TableHead>Salary</TableHead>
                  <TableHead>Attendance</TableHead>
                  <TableHead>Advance</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Joined</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {workers.map((w) => (
                  <TableRow key={w.id}>
                    <TableCell className="font-medium">{w.name}</TableCell>
                    <TableCell>{w.role}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={shiftColors[w.shift]}>{w.shift}</Badge>
                    </TableCell>
                    <TableCell>Rs {w.salary.toLocaleString()}</TableCell>
                    <TableCell>{w.attendance}/30 days</TableCell>
                    <TableCell>
                      {w.advance > 0 ? (
                        <span className="text-destructive font-medium">Rs {w.advance.toLocaleString()}</span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-sm">{w.phone}</TableCell>
                    <TableCell className="text-sm">{w.joinDate}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Payroll Summary */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base text-card-foreground">Monthly Payroll Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">Total Gross Salary</p>
              <p className="text-2xl font-bold text-foreground">Rs {totalSalary.toLocaleString()}</p>
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">Advance Deductions</p>
              <p className="text-2xl font-bold text-foreground">Rs {totalAdvance.toLocaleString()}</p>
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">Net Payable</p>
              <p className="text-2xl font-bold text-primary">Rs {(totalSalary - totalAdvance).toLocaleString()}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
