"use client"

import { useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { LoginPage } from "@/components/login-page"
import { LandingPage } from "@/components/landing-page"
import { AppSidebar, type ActivePage } from "@/components/app-sidebar"
import { DashboardPage } from "@/components/dashboard-page"
import { BuffaloPage } from "@/components/buffalo-page"
import { MilkPage } from "@/components/milk-page"
import { FeedPage } from "@/components/feed-page"
import { MedicalPage } from "@/components/medical-page"
import { LabourPage } from "@/components/labour-page"
import { FinancePage } from "@/components/finance-page"
import { LoansPage } from "@/components/loans-page"
import { InventoryPage } from "@/components/inventory-page"
import { ReproductionPage } from "@/components/reproduction-page"
import { ReportsPage } from "@/components/reports-page"
import { SettingsPage } from "@/components/settings-page"
import { Bell, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

import { useI18n } from "@/lib/i18n/context"

const pages: Record<ActivePage, React.ComponentType> = {
  dashboard: DashboardPage,
  buffalo: BuffaloPage,
  milk: MilkPage,
  feed: FeedPage,
  reproduction: ReproductionPage,
  medical: MedicalPage,
  labour: LabourPage,
  finance: FinancePage,
  loans: LoansPage,
  inventory: InventoryPage,
  reports: ReportsPage,
  settings: SettingsPage,
}

export function AppShell() {
  const { user } = useAuth()
  const { t } = useI18n()
  const [activePage, setActivePage] = useState<ActivePage>("dashboard")
  const [showLogin, setShowLogin] = useState(false)

  if (!user) {
    if (showLogin) {
      return <LoginPage onBackToLanding={() => setShowLogin(false)} />
    }
    return <LandingPage onOpenLogin={() => setShowLogin(true)} />
  }

  const PageComponent = pages[activePage]

  // Some nav keys differ slightly from ActivePage (e.g. medical->health in messages? Wait, messages.ts has nav.medical)
  // Let's ensure type safety. ActivePage matches keys in t.nav exactly.
  const pageTitle = (t.nav as Record<string, string>)[activePage] || "Page"

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <AppSidebar activePage={activePage} onNavigate={setActivePage} />
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="h-16 border-b border-border bg-card flex items-center justify-between px-4 lg:px-6 shrink-0">
          <div className="pl-12 lg:pl-0">
            <h2 className="text-lg font-semibold text-card-foreground">{pageTitle}</h2>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5 text-muted-foreground" />
              <span className="absolute -top-0.5 -right-0.5 h-4 w-4 bg-destructive text-primary-foreground text-[10px] rounded-full flex items-center justify-center">
                3
              </span>
              <span className="sr-only">Notifications</span>
            </Button>
            <Button variant="ghost" size="icon">
              <Settings className="h-5 w-5 text-muted-foreground" />
              <span className="sr-only">Settings</span>
            </Button>
            <div className="hidden sm:flex items-center gap-2 ml-2 pl-2 border-l border-border">
              <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm font-medium">
                {user.name.split(" ").map((n) => n[0]).join("")}
              </div>
              <div className="text-sm">
                <p className="font-medium text-card-foreground leading-none">{user.name}</p>
                <p className="text-xs text-muted-foreground capitalize">{user.role}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <PageComponent />
        </main>
      </div>
    </div>
  )
}
