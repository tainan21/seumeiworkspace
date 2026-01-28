"use client"

import type React from "react"
import { motion } from "framer-motion"
import {
  LayoutDashboard,
  FolderKanban,
  FileText,
  Users,
  DollarSign,
  Building2,
  Calendar,
  BarChart3,
  Settings,
  Search,
  Bell,
  Menu,
} from "lucide-react"
import { cn } from "~/lib/utils"
import type { MenuItem, TopBarVariant, ThemeStyle, BrandColors } from "~/types/workspace"
import { useReducedMotion } from "~/lib/hooks/use-reduced-motion"

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  LayoutDashboard,
  FolderKanban,
  FileText,
  Users,
  DollarSign,
  Building2,
  Calendar,
  BarChart3,
  Settings,
}

interface WorkspacePreviewProps {
  menuItems: MenuItem[]
  topBarVariant: TopBarVariant
  theme: ThemeStyle
  colors: BrandColors
  companyName: string
  logo?: string | null
  animated?: boolean
}

export function WorkspacePreview({
  menuItems,
  topBarVariant,
  theme,
  colors,
  companyName,
  logo,
  animated = true,
}: WorkspacePreviewProps) {
  const reducedMotion = useReducedMotion()
  const shouldAnimate = animated && !reducedMotion

  // Estilos baseados no tema
  const themeStyles = {
    minimal: {
      bg: "#FAFAFA",
      sidebar: "#FFFFFF",
      border: "#E5E5E5",
      text: "#18181B",
      muted: "#71717A",
    },
    corporate: {
      bg: "#0F172A",
      sidebar: "#1E293B",
      border: "#334155",
      text: "#F8FAFC",
      muted: "#94A3B8",
    },
    playful: {
      bg: "#FFFBFE",
      sidebar: "#FDF4FF",
      border: "#F5D0FE",
      text: "#1F1F1F",
      muted: "#A855F7",
    },
  }

  const styles = themeStyles[theme]

  return (
    <motion.div
      initial={shouldAnimate ? { opacity: 0, scale: 0.95 } : false}
      animate={{ opacity: 1, scale: 1 }}
      className="relative w-full max-w-3xl mx-auto rounded-2xl overflow-hidden border shadow-xl"
      style={{ backgroundColor: styles.bg }}
    >
      {/* Window controls */}
      <div className="h-8 flex items-center px-4 gap-2 border-b" style={{ borderColor: styles.border }}>
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-400" />
          <div className="w-3 h-3 rounded-full bg-yellow-400" />
          <div className="w-3 h-3 rounded-full bg-green-400" />
        </div>
        <div className="flex-1 text-center text-xs" style={{ color: styles.muted }}>
          {companyName} - Seumei
        </div>
      </div>

      {/* TopBar - usa CSS variable para cor */}
      <motion.div
        initial={shouldAnimate ? { y: -40, opacity: 0 } : false}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="h-12 flex items-center px-4 border-b transition-colors duration-200"
        style={{
          backgroundColor: `${colors.primary}08`,
          borderColor: styles.border,
        }}
      >
        <TopBarContent variant={topBarVariant} colors={colors} styles={styles} logo={logo} companyName={companyName} />
      </motion.div>

      <div className="flex h-72">
        {/* Sidebar - usa CSS variable para cor ativa */}
        <motion.div
          initial={shouldAnimate ? { x: -60, opacity: 0 } : false}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="w-48 border-r flex flex-col transition-colors duration-200"
          style={{
            backgroundColor: styles.sidebar,
            borderColor: styles.border,
          }}
        >
          <div className="flex-1 py-2">
            {menuItems.slice(0, 7).map((item, idx) => {
              const Icon = ICON_MAP[item.icon] || FolderKanban
              const isActive = idx === 0

              return (
                <motion.div
                  key={item.id}
                  initial={shouldAnimate ? { x: -20, opacity: 0 } : false}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.4 + idx * 0.05 }}
                  className={cn(
                    "flex items-center gap-3 px-4 py-2 mx-2 rounded-lg text-sm transition-colors duration-200",
                    isActive ? "font-medium" : ""
                  )}
                  style={{
                    // Usar cor primaria para item ativo
                    backgroundColor: isActive ? `${colors.primary}15` : "transparent",
                    color: isActive ? colors.primary : styles.text,
                  }}
                >
                  <Icon className="w-4 h-4" />
                  <span className="truncate">{item.label}</span>
                </motion.div>
              )
            })}
          </div>

          {/* Settings at bottom */}
          <div className="border-t p-2" style={{ borderColor: styles.border }}>
            <div className="flex items-center gap-3 px-4 py-2 rounded-lg text-sm" style={{ color: styles.muted }}>
              <Settings className="w-4 h-4" />
              <span>Configuracoes</span>
            </div>
          </div>
        </motion.div>

        {/* Main content area */}
        <motion.div
          initial={shouldAnimate ? { opacity: 0 } : false}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex-1 p-6"
        >
          {/* Titulo usa cor primaria */}
          <div
            className="h-4 w-32 rounded mb-2 transition-colors duration-200"
            style={{ backgroundColor: colors.primary }}
          />
          <div className="h-3 w-48 rounded mb-6" style={{ backgroundColor: `${styles.muted}30` }} />

          <div className="grid grid-cols-3 gap-4">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                initial={shouldAnimate ? { y: 20, opacity: 0 } : false}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6 + i * 0.1 }}
                className="h-24 rounded-xl border transition-colors duration-200"
                style={{
                  // Primeiro card usa cor accent
                  borderColor: i === 0 ? colors.accent : styles.border,
                  backgroundColor: styles.sidebar,
                }}
              />
            ))}
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}

function TopBarContent({
  variant,
  colors,
  styles,
  logo,
  companyName,
}: {
  variant: TopBarVariant
  colors: BrandColors
  styles: { text: string; muted: string }
  logo?: string | null
  companyName: string
}) {
  if (variant === "barTop-A") {
    return (
      <>
        <div className="flex items-center gap-3">
          {logo ? (
            <img src={logo || "/placeholder.svg"} alt="" className="w-7 h-7 rounded object-cover" />
          ) : (
            <div
              className="w-7 h-7 rounded transition-colors duration-200"
              style={{ backgroundColor: colors.primary }}
            />
          )}
          <span className="font-medium text-sm" style={{ color: styles.text }}>
            {companyName}
          </span>
        </div>
        <div className="flex-1" />
        <div className="flex items-center gap-3">
          <Search className="w-4 h-4" style={{ color: styles.muted }} />
          <Bell className="w-4 h-4" style={{ color: styles.muted }} />
          <div className="w-7 h-7 rounded-full bg-muted" />
        </div>
      </>
    )
  }

  if (variant === "barTop-B") {
    return (
      <>
        <Menu className="w-5 h-5" style={{ color: styles.muted }} />
        <div className="flex-1 flex justify-center">
          <div
            className="flex items-center gap-2 px-4 py-1.5 rounded-full"
            style={{ backgroundColor: `${styles.muted}15` }}
          >
            <Search className="w-3.5 h-3.5" style={{ color: styles.muted }} />
            <span className="text-xs" style={{ color: styles.muted }}>
              Buscar...
            </span>
          </div>
        </div>
        <div className="w-7 h-7 rounded-full bg-muted" />
      </>
    )
  }

  // barTop-C
  return (
    <>
      <div className="flex items-center gap-4">
        {logo ? (
          <img src={logo || "/placeholder.svg"} alt="" className="w-6 h-6 rounded object-cover" />
        ) : (
          <div
            className="w-6 h-6 rounded transition-colors duration-200"
            style={{ backgroundColor: colors.primary }}
          />
        )}
        <nav className="flex items-center gap-1">
          {["Inicio", "Projetos", "Docs"].map((item, i) => (
            <span
              key={item}
              className="px-2 py-1 text-xs rounded transition-colors duration-200"
              style={{
                color: i === 0 ? colors.primary : styles.muted,
                backgroundColor: i === 0 ? `${colors.primary}15` : "transparent",
              }}
            >
              {item}
            </span>
          ))}
        </nav>
      </div>
      <div className="flex-1" />
      <div className="flex items-center gap-3">
        <Search className="w-4 h-4" style={{ color: styles.muted }} />
        <Bell className="w-4 h-4" style={{ color: styles.muted }} />
        <div className="w-7 h-7 rounded-full bg-muted" />
      </div>
    </>
  )
}
