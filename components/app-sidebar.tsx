"use client"

import { useAuth } from "@/lib/auth-context"
import {
  LayoutDashboard, Bug as Buffalo, Milk, Wheat, Stethoscope, Users, IndianRupee,
  Landmark, Package, FileBarChart, LogOut, ChevronLeft, ChevronRight, Menu, Settings
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useState } from "react"

export type ActivePage =
  | "dashboard" | "buffalo" | "milk" | "feed" | "medical"
  | "labour" | "finance" | "loans" | "inventory" | "reports" | "settings"

const navItems: { id: ActivePage; label: string; icon: React.ReactNode; module: string }[] = [
  { id: "dashboard", label: "Dashboard", icon: <LayoutDashboard className="h-5 w-5" />, module: "dashboard" },
  { id: "buffalo", label: "Buffalo", icon: <Buffalo className="h-5 w-5" />, module: "buffalo" },
  { id: "milk", label: "Milk Production", icon: <Milk className="h-5 w-5" />, module: "milk" },
  { id: "feed", label: "Feed Management", icon: <Wheat className="h-5 w-5" />, module: "feed" },
  { id: "medical", label: "Medical & Vet", icon: <Stethoscope className="h-5 w-5" />, module: "medical" },
  { id: "labour", label: "Labour", icon: <Users className="h-5 w-5" />, module: "labour" },
  { id: "finance", label: "Finance", icon: <IndianRupee className="h-5 w-5" />, module: "finance" },
  { id: "loans", label: "Loans & Subsidy", icon: <Landmark className="h-5 w-5" />, module: "loans" },
  { id: "inventory", label: "Inventory", icon: <Package className="h-5 w-5" />, module: "inventory" },
  { id: "reports", label: "Reports", icon: <FileBarChart className="h-5 w-5" />, module: "reports" },
  { id: "settings", label: "Settings", icon: <Settings className="h-5 w-5" />, module: "settings" },
]

interface AppSidebarProps {
  activePage: ActivePage
  onNavigate: (page: ActivePage) => void
}

export function AppSidebar({ activePage, onNavigate }: AppSidebarProps) {
  const { user, logout, hasPermission } = useAuth()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  const filteredNav = navItems.filter((item) => hasPermission(item.module))

  const roleBadgeColor: Record<string, string> = {
    admin: "bg-amber-500/20 text-amber-200",
    manager: "bg-blue-500/20 text-blue-200",
    worker: "bg-green-500/20 text-green-200",
    accountant: "bg-purple-500/20 text-purple-200",
  }

  const sidebar = (
    <aside
      className={cn(
        "h-screen bg-sidebar text-sidebar-foreground flex flex-col transition-all duration-300",
        collapsed ? "w-[72px]" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 h-16 border-b border-sidebar-border shrink-0">
        <div className="h-9 w-9 rounded-lg bg-sidebar-primary flex items-center justify-center shrink-0">
          <Milk className="h-5 w-5 text-sidebar-primary-foreground" />
        </div>
        {!collapsed && <span className="text-lg font-bold tracking-tight">DairyPro</span>}
      </div>

      {/* User Info */}
      {!collapsed && user && (
        <div className="px-4 py-3 border-b border-sidebar-border">
          <p className="text-sm font-medium truncate">{user.name}</p>
          <span className={cn("text-xs px-2 py-0.5 rounded-full mt-1 inline-block capitalize", roleBadgeColor[user.role])}>
            {user.role}
          </span>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 py-3 overflow-y-auto">
        <div className="flex flex-col gap-1 px-2">
          {filteredNav.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                onNavigate(item.id)
                setMobileOpen(false)
              }}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                activePage === item.id
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
              )}
              title={collapsed ? item.label : undefined}
            >
              {item.icon}
              {!collapsed && <span>{item.label}</span>}
            </button>
          ))}
        </div>
      </nav>

      {/* Collapse & Logout */}
      <div className="px-2 py-3 border-t border-sidebar-border flex flex-col gap-1">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden lg:flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground transition-colors"
        >
          {collapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
          {!collapsed && <span>Collapse</span>}
        </button>
        <button
          onClick={logout}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-sidebar-foreground/70 hover:bg-destructive/20 hover:text-red-300 transition-colors"
        >
          <LogOut className="h-5 w-5" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  )

  return (
    <>
      {/* Mobile Toggle */}
      <Button
        size="icon"
        variant="outline"
        className="lg:hidden fixed top-3 left-3 z-50 bg-card text-card-foreground border-border"
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-label="Toggle menu"
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-foreground/40 z-40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <div
        className={cn(
          "lg:hidden fixed top-0 left-0 z-50 h-full transition-transform duration-300",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {sidebar}
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden lg:block shrink-0">{sidebar}</div>
    </>
  )
}
