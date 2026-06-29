"use client"

import { AuthProvider } from "@/lib/auth-context"
import { I18nProvider } from "@/lib/i18n/context"
import { AppShell } from "@/components/app-shell"

export default function Home() {
  return (
    <I18nProvider>
      <AuthProvider>
        <AppShell />
      </AuthProvider>
    </I18nProvider>
  )
}
