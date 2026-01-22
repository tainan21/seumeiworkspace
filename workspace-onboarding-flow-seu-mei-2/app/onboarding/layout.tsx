import type React from "react"
import type { Metadata } from "next"
import { RealTimeThemeProvider } from "@/components/providers/real-time-theme-provider"

export const metadata: Metadata = {
  title: "Criar Workspace | Seumei",
  description: "Configure seu workspace personalizado em poucos minutos",
}

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <RealTimeThemeProvider source="onboarding" debounceMs={30} enableTransitions>
      {children}
    </RealTimeThemeProvider>
  )
}
