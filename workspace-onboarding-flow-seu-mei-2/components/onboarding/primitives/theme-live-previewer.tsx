"use client"

import React, { useMemo } from "react"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Users,
  Settings,
  Bell,
  Search,
  ChevronRight,
  MoreHorizontal,
  TrendingUp,
  Calendar,
  FileText,
  DollarSign,
  Menu,
} from "lucide-react"
import type { LayoutConfig } from "@/domains/layout-builder/layout-builder.types"

// ============================================
// TYPES
// ============================================

interface ThemeLivePreviewerProps {
  brandColors: {
    primary: string
    accent: string
  }
  layoutConfig: LayoutConfig
  topBarVariant: string
  className?: string
  scale?: number
}

interface ColorShade {
  50: string
  100: string
  200: string
  300: string
  400: string
  500: string
  600: string
  700: string
  800: string
  900: string
  950: string
}

// ============================================
// COLOR UTILITIES
// ============================================

function hexToHSL(hex: string): { h: number; s: number; l: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  if (!result) return { h: 0, s: 0, l: 0 }

  let r = parseInt(result[1], 16) / 255
  let g = parseInt(result[2], 16) / 255
  let b = parseInt(result[3], 16) / 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h = 0
  let s = 0
  const l = (max + min) / 2

  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6
        break
      case g:
        h = ((b - r) / d + 2) / 6
        break
      case b:
        h = ((r - g) / d + 4) / 6
        break
    }
  }

  return { h: h * 360, s: s * 100, l: l * 100 }
}

function hslToHex(h: number, s: number, l: number): string {
  s /= 100
  l /= 100

  const c = (1 - Math.abs(2 * l - 1)) * s
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1))
  const m = l - c / 2
  let r = 0,
    g = 0,
    b = 0

  if (0 <= h && h < 60) {
    r = c
    g = x
    b = 0
  } else if (60 <= h && h < 120) {
    r = x
    g = c
    b = 0
  } else if (120 <= h && h < 180) {
    r = 0
    g = c
    b = x
  } else if (180 <= h && h < 240) {
    r = 0
    g = x
    b = c
  } else if (240 <= h && h < 300) {
    r = x
    g = 0
    b = c
  } else if (300 <= h && h < 360) {
    r = c
    g = 0
    b = x
  }

  const toHex = (n: number) => {
    const hex = Math.round((n + m) * 255).toString(16)
    return hex.length === 1 ? "0" + hex : hex
  }

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}

function generateColorShades(baseColor: string): ColorShade {
  const { h, s } = hexToHSL(baseColor)
  
  return {
    50: hslToHex(h, Math.min(s, 30), 97),
    100: hslToHex(h, Math.min(s, 35), 94),
    200: hslToHex(h, Math.min(s, 40), 86),
    300: hslToHex(h, Math.min(s, 45), 76),
    400: hslToHex(h, Math.min(s, 55), 62),
    500: baseColor,
    600: hslToHex(h, Math.min(s + 5, 100), 47),
    700: hslToHex(h, Math.min(s + 10, 100), 39),
    800: hslToHex(h, Math.min(s + 10, 100), 32),
    900: hslToHex(h, Math.min(s + 10, 100), 24),
    950: hslToHex(h, Math.min(s + 10, 100), 14),
  }
}

function getContrastColor(hex: string): string {
  const { l } = hexToHSL(hex)
  return l > 55 ? "#000000" : "#ffffff"
}

// ============================================
// MINI COMPONENTS
// ============================================

function MiniButton({
  children,
  variant = "primary",
  bgColor,
  textColor,
}: {
  children: React.ReactNode
  variant?: "primary" | "secondary" | "ghost"
  bgColor?: string
  textColor?: string
}) {
  return (
    <div
      className={cn(
        "px-1.5 py-0.5 rounded text-[6px] font-medium transition-colors duration-200 truncate",
        variant === "primary" && "text-white",
        variant === "secondary" && "bg-muted/50",
        variant === "ghost" && "hover:bg-muted/30"
      )}
      style={{
        backgroundColor: variant === "primary" ? bgColor : undefined,
        color: variant === "primary" ? textColor : undefined,
      }}
    >
      {children}
    </div>
  )
}

function MiniCard({
  title,
  value,
  accentColor,
  showTrend,
}: {
  title: string
  value: string
  accentColor: string
  showTrend?: boolean
}) {
  return (
    <div className="bg-card border rounded p-1.5 transition-all duration-200">
      <div className="flex items-center justify-between mb-1">
        <span className="text-[5px] text-muted-foreground truncate">{title}</span>
        {showTrend && <TrendingUp className="w-2 h-2" style={{ color: accentColor }} />}
      </div>
      <div className="text-[8px] font-bold">{value}</div>
    </div>
  )
}

function MiniChart({ primaryColor, accentColor }: { primaryColor: string; accentColor: string }) {
  const bars = [40, 65, 45, 80, 55, 70, 90]
  return (
    <div className="flex items-end gap-0.5 h-8">
      {bars.map((height, i) => (
        <div
          key={i}
          className="flex-1 rounded-t transition-all duration-200"
          style={{
            height: `${height}%`,
            backgroundColor: i === bars.length - 1 ? accentColor : `${primaryColor}40`,
          }}
        />
      ))}
    </div>
  )
}

function MiniTable({ primaryColor }: { primaryColor: string }) {
  const rows = [
    { name: "Projeto Alpha", status: "Ativo", value: "R$ 12.450" },
    { name: "Projeto Beta", status: "Pendente", value: "R$ 8.320" },
    { name: "Projeto Gamma", status: "Ativo", value: "R$ 15.780" },
  ]
  return (
    <div className="border rounded overflow-hidden">
      <div
        className="flex text-[5px] font-medium p-1 border-b"
        style={{ backgroundColor: `${primaryColor}10` }}
      >
        <div className="flex-1">Nome</div>
        <div className="w-10">Status</div>
        <div className="w-12 text-right">Valor</div>
      </div>
      {rows.map((row, i) => (
        <div key={i} className="flex text-[5px] p-1 border-b last:border-b-0">
          <div className="flex-1 truncate">{row.name}</div>
          <div className="w-10">
            <span
              className="px-1 py-0.5 rounded text-[4px]"
              style={{
                backgroundColor: row.status === "Ativo" ? `${primaryColor}20` : "hsl(var(--muted))",
                color: row.status === "Ativo" ? primaryColor : "inherit",
              }}
            >
              {row.status}
            </span>
          </div>
          <div className="w-12 text-right">{row.value}</div>
        </div>
      ))}
    </div>
  )
}

// ============================================
// MAIN PREVIEW COMPONENT
// ============================================

export function ThemeLivePreviewer({
  brandColors = { primary: "#3b82f6", accent: "#8b5cf6" },
  layoutConfig = {
    sidebar: { variant: "standard", showHeader: true, showFooter: true, collapsible: false, showIcons: true },
    topBar: { isVisible: true, height: 64, sticky: false, showSearch: true, showNotifications: true, showBreadcrumb: true, variant: "barTop-A" },
    dashboard: { layoutType: "grid", columns: 12, gap: 16, padding: 24, density: "comfortable", borderStyle: "rounded" },
    footer: { isVisible: true, height: 48, showCopyright: true, showVersion: true },
  },
  topBarVariant = "barTop-A",
  className,
  scale = 1,
}: ThemeLivePreviewerProps) {
  const primaryShades = useMemo(() => generateColorShades(brandColors.primary), [brandColors.primary])
  const accentShades = useMemo(() => generateColorShades(brandColors.accent), [brandColors.accent])
  const primaryTextColor = useMemo(() => getContrastColor(brandColors.primary), [brandColors.primary])
  const accentTextColor = useMemo(() => getContrastColor(brandColors.accent), [brandColors.accent])

  const sidebarWidth = useMemo(() => {
    switch (layoutConfig.sidebar.variant) {
      case "hidden":
        return 0
      case "mini":
        return 32
      case "compact":
        return 44
      default:
        return 56
    }
  }, [layoutConfig.sidebar.variant])

  const menuItems = [
    { icon: LayoutDashboard, label: "Dashboard", active: true },
    { icon: FileText, label: "Projetos" },
    { icon: Users, label: "Equipe" },
    { icon: Calendar, label: "Agenda" },
    { icon: DollarSign, label: "Financeiro" },
    { icon: Settings, label: "Config" },
  ]

  return (
    <div
      className={cn("relative rounded-xl overflow-hidden border-2 border-border shadow-lg", className)}
      style={{ transform: `scale(${scale})`, transformOrigin: "top left" }}
    >
      {/* Browser Chrome */}
      <div className="bg-muted/80 border-b px-2 py-1.5 flex items-center gap-1.5">
        <div className="flex gap-1">
          <div className="w-2 h-2 rounded-full bg-red-400" />
          <div className="w-2 h-2 rounded-full bg-yellow-400" />
          <div className="w-2 h-2 rounded-full bg-green-400" />
        </div>
        <div className="flex-1 mx-2">
          <div className="bg-background rounded px-2 py-0.5 text-[7px] text-muted-foreground flex items-center">
            <span className="truncate">app.seumei.com/dashboard</span>
          </div>
        </div>
      </div>

      {/* Main Layout */}
      <div className="flex h-[200px] bg-background">
        {/* Sidebar */}
        {layoutConfig.sidebar.variant !== "hidden" && (
          <div
            className="border-r flex flex-col transition-all duration-300"
            style={{
              width: sidebarWidth,
              backgroundColor: `${brandColors.primary}08`,
            }}
          >
            {/* Logo Area */}
            {layoutConfig.sidebar.showHeader && (
              <div className="p-1.5 border-b">
                <div
                  className="rounded flex items-center justify-center transition-colors duration-200"
                  style={{
                    height: layoutConfig.sidebar.variant === "mini" ? 16 : 20,
                    backgroundColor: brandColors.primary,
                  }}
                >
                  {layoutConfig.sidebar.variant !== "mini" && (
                    <span className="text-[6px] font-bold" style={{ color: primaryTextColor }}>
                      SEUMEI
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Nav Items */}
            <div className="flex-1 p-1 space-y-0.5 overflow-hidden">
              {menuItems.map((item, i) => (
                <div
                  key={i}
                  className={cn(
                    "flex items-center gap-1 px-1 py-0.5 rounded transition-all duration-200",
                    item.active && "font-medium"
                  )}
                  style={{
                    backgroundColor: item.active ? `${brandColors.primary}15` : "transparent",
                    color: item.active ? brandColors.primary : undefined,
                  }}
                >
                  <item.icon className="w-2.5 h-2.5 shrink-0" />
                  {layoutConfig.sidebar.variant !== "mini" && (
                    <span className="text-[5px] truncate">{item.label}</span>
                  )}
                </div>
              ))}
            </div>

            {/* Sidebar Footer */}
            {layoutConfig.sidebar.showFooter && layoutConfig.sidebar.variant !== "mini" && (
              <div className="p-1.5 border-t">
                <div className="flex items-center gap-1">
                  <div
                    className="w-4 h-4 rounded-full flex items-center justify-center text-[5px] font-bold"
                    style={{ backgroundColor: brandColors.accent, color: accentTextColor }}
                  >
                    U
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[5px] font-medium truncate">Usuario</div>
                    <div className="text-[4px] text-muted-foreground">Admin</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* TopBar */}
          {layoutConfig.topBar.isVisible && (
            <div
              className={cn(
                "border-b px-2 flex items-center gap-2 transition-all duration-200",
                topBarVariant === "barTop-B" && "justify-between"
              )}
              style={{
                height: Math.round(layoutConfig.topBar.height / 2.5),
                backgroundColor:
                  topBarVariant === "barTop-B" ? `${brandColors.primary}08` : undefined,
              }}
            >
              {/* Mobile menu */}
              {layoutConfig.sidebar.variant === "hidden" && (
                <Menu className="w-3 h-3 text-muted-foreground" />
              )}

              {/* Breadcrumb */}
              {layoutConfig.topBar.showBreadcrumb && (
                <div className="flex items-center gap-0.5 text-[5px] text-muted-foreground">
                  <span>Home</span>
                  <ChevronRight className="w-2 h-2" />
                  <span style={{ color: brandColors.primary }}>Dashboard</span>
                </div>
              )}

              <div className="flex-1" />

              {/* Search */}
              {layoutConfig.topBar.showSearch && (
                <div className="flex items-center gap-1 px-1.5 py-0.5 bg-muted/50 rounded text-[5px] text-muted-foreground">
                  <Search className="w-2 h-2" />
                  <span>Buscar...</span>
                </div>
              )}

              {/* Notifications */}
              {layoutConfig.topBar.showNotifications && (
                <div className="relative">
                  <Bell className="w-3 h-3 text-muted-foreground" />
                  <div
                    className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: brandColors.accent }}
                  />
                </div>
              )}

              {/* User Menu */}
              <div
                className="w-4 h-4 rounded-full flex items-center justify-center text-[5px] font-bold"
                style={{ backgroundColor: brandColors.primary, color: primaryTextColor }}
              >
                U
              </div>
            </div>
          )}

          {/* Dashboard Content */}
          <div
            className="flex-1 overflow-hidden"
            style={{ padding: layoutConfig.dashboard.padding / 4 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-2">
              <div>
                <h1 className="text-[9px] font-bold">Dashboard</h1>
                <p className="text-[5px] text-muted-foreground">Bem-vindo de volta</p>
              </div>
              <div className="flex gap-1">
                <MiniButton variant="ghost">
                  <MoreHorizontal className="w-2 h-2" />
                </MiniButton>
                <MiniButton variant="primary" bgColor={brandColors.primary} textColor={primaryTextColor}>
                  + Novo
                </MiniButton>
              </div>
            </div>

            {/* Stats Cards */}
            <div
              className="grid mb-2"
              style={{
                gridTemplateColumns: `repeat(${Math.min(layoutConfig.dashboard.columns / 6, 4)}, 1fr)`,
                gap: layoutConfig.dashboard.gap / 4,
              }}
            >
              <MiniCard title="Receita" value="R$ 45.2k" accentColor={brandColors.accent} showTrend />
              <MiniCard title="Usuarios" value="1,234" accentColor={brandColors.accent} />
              <MiniCard title="Projetos" value="23" accentColor={brandColors.accent} />
              <MiniCard title="Tarefas" value="89" accentColor={brandColors.accent} showTrend />
            </div>

            {/* Content Grid */}
            <div
              className="grid"
              style={{
                gridTemplateColumns:
                  layoutConfig.dashboard.layoutType === "list" ? "1fr" : "1fr 1fr",
                gap: layoutConfig.dashboard.gap / 4,
              }}
            >
              {/* Chart Card */}
              <div className="bg-card border rounded p-1.5">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[6px] font-medium">Receita Mensal</span>
                  <span className="text-[5px] text-muted-foreground">Ultimos 7 dias</span>
                </div>
                <MiniChart primaryColor={brandColors.primary} accentColor={brandColors.accent} />
              </div>

              {/* Table Card */}
              <div className="bg-card border rounded p-1.5">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[6px] font-medium">Projetos Recentes</span>
                  <MiniButton variant="ghost">Ver todos</MiniButton>
                </div>
                <MiniTable primaryColor={brandColors.primary} />
              </div>
            </div>
          </div>

          {/* Footer */}
          {layoutConfig.footer.isVisible && (
            <div
              className="border-t flex items-center justify-center text-[5px] text-muted-foreground"
              style={{ height: Math.min(layoutConfig.footer.height / 3, 14) }}
            >
              {layoutConfig.footer.showCopyright && <span>2024 Seumei</span>}
              {layoutConfig.footer.showVersion && (
                <span className="ml-2">v1.0.0</span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Color Palette Display */}
      <div className="bg-muted/30 border-t p-2">
        <div className="flex gap-2">
          {/* Primary */}
          <div className="flex-1">
            <div className="text-[6px] font-medium mb-1">Primaria</div>
            <div className="flex rounded overflow-hidden">
              {Object.entries(primaryShades).slice(0, 6).map(([shade, color]) => (
                <div
                  key={shade}
                  className="flex-1 h-3 transition-colors duration-200"
                  style={{ backgroundColor: color }}
                  title={`${shade}: ${color}`}
                />
              ))}
            </div>
            <div className="text-[5px] text-muted-foreground mt-0.5 font-mono">
              {brandColors.primary}
            </div>
          </div>

          {/* Accent */}
          <div className="flex-1">
            <div className="text-[6px] font-medium mb-1">Destaque</div>
            <div className="flex rounded overflow-hidden">
              {Object.entries(accentShades).slice(0, 6).map(([shade, color]) => (
                <div
                  key={shade}
                  className="flex-1 h-3 transition-colors duration-200"
                  style={{ backgroundColor: color }}
                  title={`${shade}: ${color}`}
                />
              ))}
            </div>
            <div className="text-[5px] text-muted-foreground mt-0.5 font-mono">
              {brandColors.accent}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ThemeLivePreviewer
