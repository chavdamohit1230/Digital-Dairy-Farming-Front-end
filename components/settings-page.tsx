"use client"

import { useAuth } from "@/lib/auth-context"
import { users } from "@/lib/data"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table"
import { ShieldCheck, Users, Bell, Globe, Database, Phone } from "lucide-react"

const roleBadgeColor: Record<string, string> = {
  admin: "bg-chart-3/10 text-chart-3 border-chart-3/20",
  manager: "bg-chart-2/10 text-chart-2 border-chart-2/20",
  worker: "bg-primary/10 text-primary border-primary/20",
  accountant: "bg-chart-5/10 text-chart-5 border-chart-5/20",
}

export function SettingsPage() {
  const { user } = useAuth()

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground">Manage your farm profile, users, and preferences</p>
      </div>

      {/* Farm Profile */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-primary" />
            <CardTitle className="text-base text-card-foreground">Farm Profile</CardTitle>
          </div>
          <CardDescription>Basic information about your dairy farm</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label>Farm Name</Label>
              <Input defaultValue="Patel Dairy Farm" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Owner Name</Label>
              <Input defaultValue="Rajesh Patel" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Location</Label>
              <Input defaultValue="Anand, Gujarat" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Phone</Label>
              <Input defaultValue="+91 98765 43210" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Milk Rate (Rs/Litre)</Label>
              <Input type="number" defaultValue="60" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Collection Center</Label>
              <Input defaultValue="Amul Chilling Center - Anand" />
            </div>
          </div>
          <Button className="mt-4">Save Changes</Button>
        </CardContent>
      </Card>

      {/* User Management */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-chart-2" />
            <CardTitle className="text-base text-card-foreground">User Management</CardTitle>
          </div>
          <CardDescription>Manage users and their access roles</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">
                          {u.name.split(" ").map((n) => n[0]).join("")}
                        </div>
                        {u.name}
                        {u.id === user?.id && (
                          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-[10px]">You</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">{u.email}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`capitalize ${roleBadgeColor[u.role]}`}>{u.role}</Badge>
                    </TableCell>
                    <TableCell className="text-sm">{u.phone}</TableCell>
                    <TableCell>
                      <Badge className="bg-primary/10 text-primary">Active</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-chart-3" />
            <CardTitle className="text-base text-card-foreground">Notification Preferences</CardTitle>
          </div>
          <CardDescription>Configure how you receive alerts and reminders</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            {[
              { label: "Vaccination Reminders", desc: "Get alerts before vaccination due dates", defaultChecked: true },
              { label: "Low Stock Alerts", desc: "Notify when feed or medicine stock is low", defaultChecked: true },
              { label: "EMI Due Reminders", desc: "Get reminders before loan EMI due dates", defaultChecked: true },
              { label: "Delivery Alerts", desc: "Notify when buffalo delivery date is approaching", defaultChecked: true },
              { label: "Daily Production Summary", desc: "Receive daily milk production summary", defaultChecked: false },
              { label: "SMS Notifications", desc: "Send alerts via SMS to your phone", defaultChecked: false },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div>
                  <p className="text-sm font-medium text-foreground">{item.label}</p>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </div>
                <Switch defaultChecked={item.defaultChecked} />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Data & Backup */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Database className="h-5 w-5 text-chart-4" />
            <CardTitle className="text-base text-card-foreground">Data & Backup</CardTitle>
          </div>
          <CardDescription>Export data and manage backups</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-muted rounded-lg text-center">
              <p className="text-sm font-medium text-foreground mb-2">Export All Data</p>
              <p className="text-xs text-muted-foreground mb-3">Download complete farm data as Excel</p>
              <Button variant="outline" size="sm">Export Excel</Button>
            </div>
            <div className="p-4 bg-muted rounded-lg text-center">
              <p className="text-sm font-medium text-foreground mb-2">Generate PDF Report</p>
              <p className="text-xs text-muted-foreground mb-3">Full monthly report with charts</p>
              <Button variant="outline" size="sm">Generate PDF</Button>
            </div>
            <div className="p-4 bg-muted rounded-lg text-center">
              <p className="text-sm font-medium text-foreground mb-2">Last Backup</p>
              <p className="text-xs text-muted-foreground mb-3">Feb 17, 2026 - 10:30 AM</p>
              <Button variant="outline" size="sm">Backup Now</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
