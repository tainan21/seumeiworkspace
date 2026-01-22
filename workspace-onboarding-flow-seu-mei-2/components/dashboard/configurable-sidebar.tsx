"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ChevronLeft, ChevronRight, Search } from "lucide-react"
import type { SidebarConfig } from "@/domains/component/component.types"
import type { MenuItem, BrandColors, ThemeStyle } from "@/types/workspace"

interface ConfigurableSidebarProps {
  config: SidebarConfig
  menuItems: MenuItem[]
  colors: BrandColors
  theme: ThemeStyle
  logo?: string
  workspaceName: string
  isCollapsed: boolean
  onToggleCollapse: () => void
  className?: string
}

const THEME_STYLES: Record<ThemeStyle, { bg: string; border: string; text: string; muted: string }> = {
  minimal: { bg: "bg-white", border: "border-zinc-200", text: "text-zinc-900", muted: "text-zinc-500" },
  corporate: { bg: "bg-slate-800", border: "border-slate-700", text: "text-slate-50", muted: "text-slate-400" },
  playful: { bg: "bg-white", border: "border-fuchsia-200", text: "text-zinc-900", muted: "text-fuchsia-600" },
}

export function ConfigurableSidebar({
  config,
  menuItems,
  colors,
  theme,
  logo,
  workspaceName,
  isCollapsed,
  onToggleCollapse,
  className,
}: ConfigurableSidebarProps) {
  const pathname = usePathname()
  const themeStyles = THEME_STYLES[theme]
  const activeItem = pathname === "/dashboard" ? "dashboard" : pathname.split("/").filter(Boolean).pop() || "dashboard"

  const sidebarWidth = isCollapsed ? config.width.collapsed : config.width.expanded

  return (
    <TooltipProvider delayDuration={0}>
      <motion.aside
        initial={false}
        animate={{ width: sidebarWidth }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className={cn(
          "flex flex-col border-r h-screen sticky top-0 z-10",
          themeStyles.bg,
          themeStyles.border,
          config.variant === "floating" && "absolute shadow-xl rounded-r-xl",
          className,
        )}
      >
        {/* Header */}
        {config.showLogo && (
          <div className="h-14 flex items-center px-4 border-b gap-3" style={{ borderColor: "inherit" }}>
            {logo ? (
              <img src={logo || "/placeholder.svg"} alt="" className="w-8 h-8 rounded-lg object-cover shrink-0" />
            ) : (
              <div className="w-8 h-8 rounded-lg shrink-0" style={{ backgroundColor: colors.primary }} />
            )}
            <AnimatePresence>
              {!isCollapsed && (
                <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "auto" }}
                  exit={{ opacity: 0, width: 0 }}
                  className={cn("font-semibold truncate", themeStyles.text)}
                >
                  {workspaceName}
                </motion.span>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Search */}
        {config.showSearch && !isCollapsed && (
          <div className="px-3 py-2 border-b" style={{ borderColor: "inherit" }}>
            <div className="relative">
              <Search className={cn("absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4", themeStyles.muted)} />
              <Input placeholder="Buscar..." className="pl-9 h-8 text-sm" />
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 py-4 px-2 overflow-y-auto">
          {menuItems
            .filter((item) => item.id !== "settings")
            .map((item) => (
              <SidebarNavItem
                key={item.id}
                item={item}
                isActive={activeItem === item.id}
                isCollapsed={isCollapsed}
                colors={colors}
                themeStyles={themeStyles}
                enableTooltips={config.enableTooltips}
              />
            ))}
        </nav>

        {/* User Profile */}
        {config.showUserProfile && (
          <div className="border-t p-3" style={{ borderColor: "inherit" }}>
            <div className={cn("flex items-center gap-3", isCollapsed && "justify-center")}>
              <Avatar className="w-8 h-8">
                <AvatarImage src="/diverse-avatars.png" />
                <AvatarFallback>U</AvatarFallback>
              </Avatar>
              {!isCollapsed && (
                <div className="flex-1 min-w-0">
                  <p className={cn("text-sm font-medium truncate", themeStyles.text)}>Usuário</p>
                  <p className={cn("text-xs truncate", themeStyles.muted)}>admin@empresa.com</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Settings at bottom */}
        <div className="border-t p-2" style={{ borderColor: "inherit" }}>
          <SidebarNavItem
            item={
              menuItems.find((i) => i.id === "settings") || {
                id: "settings",
                label: "Configurações",
                icon: "Settings",
                order: 99,
                route: "/dashboard/settings",
              }
            }
            isActive={activeItem === "settings"}
            isCollapsed={isCollapsed}
            colors={colors}
            themeStyles={themeStyles}
            enableTooltips={config.enableTooltips}
          />
        </div>

        {/* Collapse Toggle */}
        {config.behavior === "collapsible" && (
          <div className="border-t p-2" style={{ borderColor: "inherit" }}>
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleCollapse}
              className={cn("w-full", isCollapsed && "px-2")}
            >
              {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
              {!isCollapsed && <span className="ml-2 text-sm">Recolher</span>}
            </Button>
          </div>
        )}
      </motion.aside>
    </TooltipProvider>
  )
}

// Navigation Item Component
function SidebarNavItem({
  item,
  isActive,
  isCollapsed,
  colors,
  themeStyles,
  enableTooltips,
}: {
  item: MenuItem
  isActive: boolean
  isCollapsed: boolean
  colors: BrandColors
  themeStyles: { text: string; muted: string }
  enableTooltips: boolean
}) {
  const content = (
    <Link
      href={item.route}
      className={cn(
        "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200",
        isCollapsed && "justify-center px-2",
      )}
      style={{
        backgroundColor: isActive ? colors.primary + "15" : "transparent",
        color: isActive ? colors.primary : undefined,
      }}
    >
      <span className={cn("w-5 h-5 shrink-0 flex items-center justify-center", !isActive && themeStyles.muted)}>
        {item.icon === "Settings" && "⚙️"}
        {item.icon === "LayoutDashboard" && "📊"}
        {item.icon === "FolderKanban" && "📁"}
        {item.icon === "FileText" && "📄"}
        {item.icon === "Users" && "👥"}
        {item.icon === "DollarSign" && "💰"}
        {item.icon === "Building2" && "🏢"}
        {item.icon === "Calendar" && "📅"}
        {item.icon === "BarChart3" && "📈"}
        {item.icon === "FileBarChart" && "📋"}
        {item.icon === "Puzzle" && "🧩"}
        {item.icon === "Map" && "🗺️"}
      </span>
      <AnimatePresence>
        {!isCollapsed && (
          <motion.span
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: "auto" }}
            exit={{ opacity: 0, width: 0 }}
            className={cn("text-sm font-medium truncate", isActive ? "" : themeStyles.text)}
          >
            {item.label}
          </motion.span>
        )}
      </AnimatePresence>
    </Link>
  )

  if (isCollapsed && enableTooltips) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{content}</TooltipTrigger>
        <TooltipContent side="right">{item.label}</TooltipContent>
      </Tooltip>
    )
  }

  return content
}
