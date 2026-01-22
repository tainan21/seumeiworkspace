"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import {
  LayoutDashboard,
  FolderKanban,
  FileText,
  Users,
  DollarSign,
  Building2,
  Calendar,
  BarChart3,
  FileBarChart,
  Puzzle,
  Map,
  Settings,
  Search,
  Bell,
  Menu,
  LogOut,
  Paintbrush,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useReducedMotion } from "@/lib/hooks/use-reduced-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { Workspace, MenuItem, TopBarVariant, ThemeStyle, BrandColors } from "@/types/workspace"
import { Suspense } from "react"

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  LayoutDashboard,
  FolderKanban,
  FileText,
  Users,
  DollarSign,
  Building2,
  Calendar,
  BarChart3,
  FileBarChart,
  Puzzle,
  Map,
  Settings,
  Paintbrush,
}

// Theme styles
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

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const reducedMotion = useReducedMotion()
  const [workspace, setWorkspace] = useState<Workspace | null>(null)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const activeItem = pathname === "/dashboard" ? "dashboard" : pathname.split("/").filter(Boolean).pop() || "dashboard"

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

  if (!workspace) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const theme = THEME_STYLES[workspace.theme]
  const colors = workspace.brand.colors

  const handleLogout = () => {
    localStorage.removeItem("seumei-workspace")
    localStorage.removeItem("seumei-onboarding")
    router.push("/onboarding")
  }

  return (
    <div className={cn("min-h-screen flex", theme.bg)}>
      {/* Sidebar */}
      <motion.aside
        initial={reducedMotion ? false : { x: -240 }}
        animate={{ x: 0, width: sidebarCollapsed ? 72 : 240 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className={cn("flex flex-col border-r h-screen sticky top-0 z-10", theme.sidebar, theme.border)}
      >
        {/* Logo */}
        <div className="h-14 flex items-center px-4 border-b gap-3" style={{ borderColor: "inherit" }}>
          {workspace.brand.logo ? (
            <img
              src={workspace.brand.logo || "/placeholder.svg"}
              alt=""
              className="w-8 h-8 rounded-lg object-cover shrink-0"
            />
          ) : (
            <div className="w-8 h-8 rounded-lg shrink-0" style={{ backgroundColor: colors.primary }} />
          )}
          <AnimatePresence>
            {!sidebarCollapsed && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                className={cn("font-semibold truncate", theme.text)}
              >
                {workspace.name}
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 px-2 overflow-y-auto">
          {workspace.menuItems
            .filter((item) => item.id !== "settings")
            .map((item, idx) => (
              <SidebarItem
                key={item.id}
                item={item}
                isActive={activeItem === item.id}
                isCollapsed={sidebarCollapsed}
                colors={colors}
                theme={theme}
                delay={idx * 0.05}
                reducedMotion={reducedMotion}
              />
            ))}
        </nav>

        {/* Settings at bottom */}
        <div className="border-t p-2" style={{ borderColor: "inherit" }}>
          <SidebarItem
            item={
              workspace.menuItems.find((i) => i.id === "settings") || {
                id: "settings",
                label: "Configurações",
                icon: "Settings",
                order: 99,
                route: "/dashboard/settings",
              }
            }
            isActive={activeItem === "settings"}
            isCollapsed={sidebarCollapsed}
            colors={colors}
            theme={theme}
            reducedMotion={reducedMotion}
          />
        </div>
      </motion.aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* TopBar */}
        <Suspense fallback={<div>Loading...</div>}>
          <TopBar
            variant={workspace.topBarVariant}
            workspace={workspace}
            colors={colors}
            theme={theme}
            onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
            onLogout={handleLogout}
          />
        </Suspense>

        {/* Page Content */}
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  )
}

// Sidebar Item Component
function SidebarItem({
  item,
  isActive,
  isCollapsed,
  colors,
  theme,
  delay = 0,
  reducedMotion,
}: {
  item: MenuItem
  isActive: boolean
  isCollapsed: boolean
  colors: BrandColors
  theme: typeof THEME_STYLES.minimal
  delay?: number
  reducedMotion: boolean
}) {
  const Icon = ICON_MAP[item.icon] || FolderKanban

  return (
    <motion.div
      initial={reducedMotion ? false : { opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay }}
    >
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
        <Icon className={cn("w-5 h-5 shrink-0", !isActive && theme.muted)} />
        <AnimatePresence>
          {!isCollapsed && (
            <motion.span
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: "auto" }}
              exit={{ opacity: 0, width: 0 }}
              className={cn("text-sm font-medium truncate", isActive ? "" : theme.text)}
            >
              {item.label}
            </motion.span>
          )}
        </AnimatePresence>
      </Link>
    </motion.div>
  )
}

// TopBar Component
function TopBar({
  variant,
  workspace,
  colors,
  theme,
  onToggleSidebar,
  onLogout,
}: {
  variant: TopBarVariant
  workspace: Workspace
  colors: BrandColors
  theme: typeof THEME_STYLES.minimal
  onToggleSidebar: () => void
  onLogout: () => void
}) {
  if (variant === "barTop-A") {
    return (
      <header
        className={cn("h-14 flex items-center justify-between px-6 border-b", theme.border)}
        style={{ backgroundColor: colors.primary + "05" }}
      >
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onToggleSidebar}>
            <Menu className="w-5 h-5" />
          </Button>
          <div className={cn("relative w-64")}>
            <Search className={cn("absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4", theme.muted)} />
            <Input placeholder="Buscar..." className="pl-9 bg-transparent border-none focus-visible:ring-1" />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon">
            <Bell className="w-5 h-5" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Avatar className="w-8 h-8">
                  <AvatarImage src="/diverse-avatars.png" />
                  <AvatarFallback>U</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Perfil</DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/dashboard/settings">Configurações</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/dashboard/settings/layout-builder">
                  <Paintbrush className="w-4 h-4 mr-2" />
                  Layout Builder
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onLogout} className="text-destructive">
                <LogOut className="w-4 h-4 mr-2" />
                Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>
    )
  }

  if (variant === "barTop-B") {
    return (
      <header
        className={cn("h-14 flex items-center justify-between px-6 border-b", theme.border)}
        style={{ backgroundColor: colors.primary + "05" }}
      >
        <Button variant="ghost" size="icon" onClick={onToggleSidebar}>
          <Menu className="w-5 h-5" />
        </Button>
        <div className="flex-1 max-w-md mx-4">
          <div className="relative">
            <Search className={cn("absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4", theme.muted)} />
            <Input
              placeholder="Buscar em todo o workspace..."
              className="pl-10 rounded-full bg-black/5 dark:bg-white/5 border-none"
            />
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
              <Avatar className="w-8 h-8">
                <AvatarImage src="/diverse-avatars.png" />
                <AvatarFallback>U</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>Perfil</DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/dashboard/settings">Configurações</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/dashboard/settings/layout-builder">
                <Paintbrush className="w-4 h-4 mr-2" />
                Layout Builder
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onLogout} className="text-destructive">
              <LogOut className="w-4 h-4 mr-2" />
              Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>
    )
  }

  // barTop-C
  return (
    <header
      className={cn("h-14 flex items-center justify-between px-6 border-b", theme.border)}
      style={{ backgroundColor: colors.primary + "05" }}
    >
      <div className="flex items-center gap-6">
        <Button variant="ghost" size="icon" onClick={onToggleSidebar}>
          <Menu className="w-5 h-5" />
        </Button>
        <nav className="flex items-center gap-1">
          {["Dashboard", "Projetos", "Docs"].map((item, i) => (
            <button
              key={item}
              className={cn("px-3 py-1.5 text-sm rounded-lg transition-colors", i === 0 ? "font-medium" : theme.muted)}
              style={{
                backgroundColor: i === 0 ? colors.primary + "15" : "transparent",
                color: i === 0 ? colors.primary : undefined,
              }}
            >
              {item}
            </button>
          ))}
        </nav>
      </div>
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon">
          <Search className="w-5 h-5" />
        </Button>
        <Button variant="ghost" size="icon">
          <Bell className="w-5 h-5" />
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
              <Avatar className="w-8 h-8">
                <AvatarImage src="/diverse-avatars.png" />
                <AvatarFallback>U</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>Perfil</DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/dashboard/settings">Configurações</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/dashboard/settings/layout-builder">
                <Paintbrush className="w-4 h-4 mr-2" />
                Layout Builder
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onLogout} className="text-destructive">
              <LogOut className="w-4 h-4 mr-2" />
              Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
