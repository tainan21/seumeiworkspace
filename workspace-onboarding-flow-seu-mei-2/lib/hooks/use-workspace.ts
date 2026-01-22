"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import type { Workspace, ThemeStyle, Role } from "@/types/workspace"

const THEME_STYLES: Record<
  ThemeStyle,
  {
    bg: string
    sidebar: string
    card: string
    border: string
    text: string
    muted: string
  }
> = {
  minimal: {
    bg: "bg-zinc-50",
    sidebar: "bg-white",
    card: "bg-white",
    border: "border-zinc-200",
    text: "text-zinc-900",
    muted: "text-zinc-500",
  },
  corporate: {
    bg: "bg-slate-900",
    sidebar: "bg-slate-800",
    card: "bg-slate-800",
    border: "border-slate-700",
    text: "text-slate-50",
    muted: "text-slate-400",
  },
  playful: {
    bg: "bg-fuchsia-50",
    sidebar: "bg-white",
    card: "bg-white",
    border: "border-fuchsia-200",
    text: "text-zinc-900",
    muted: "text-fuchsia-600",
  },
}

export function useWorkspace() {
  const router = useRouter()
  const [workspace, setWorkspace] = useState<Workspace | null>(null)

  useEffect(() => {
    const stored = localStorage.getItem("seumei-workspace")
    if (stored) {
      try {
        setWorkspace(JSON.parse(stored))
      } catch {
        router.push("/onboarding")
      }
    } else {
      router.push("/onboarding")
    }
  }, [router])

  const theme = workspace ? THEME_STYLES[workspace.theme] : THEME_STYLES.minimal
  const colors = workspace?.brand.colors || { primary: "#000000", accent: "#666666" }

  const userRole: Role | null = workspace?.rbac?.roles?.find((r) => r.id === "owner") ?? null

  return { workspace, theme, colors, userRole }
}
