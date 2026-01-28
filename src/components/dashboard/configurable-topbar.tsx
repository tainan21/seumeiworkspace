"use client"

import React from "react"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
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
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Menu, Search, Bell, LogOut, Plus, Settings, User } from "lucide-react"
import type { TopBarConfig } from "@/domains/component/component.types"
import type { BrandColors, ThemeStyle } from "@/types/workspace"

interface ConfigurableTopBarProps {
  config: TopBarConfig
  colors: BrandColors
  theme: ThemeStyle
  workspaceName: string
  onToggleSidebar: () => void
  onLogout: () => void
  className?: string
}

const THEME_STYLES: Record<ThemeStyle, { border: string; text: string; muted: string }> = {
  minimal: { border: "border-zinc-200", text: "text-zinc-900", muted: "text-zinc-500" },
  corporate: { border: "border-slate-700", text: "text-slate-50", muted: "text-slate-400" },
  playful: { border: "border-fuchsia-200", text: "text-zinc-900", muted: "text-fuchsia-600" },
}

export function ConfigurableTopBar({
  config,
  colors,
  theme,
  workspaceName,
  onToggleSidebar,
  onLogout,
  className,
}: ConfigurableTopBarProps) {
  const pathname = usePathname()
  const themeStyles = THEME_STYLES[theme]

  // Generate breadcrumbs from pathname
  const pathSegments = pathname.split("/").filter(Boolean)
  const breadcrumbs = pathSegments.map((segment, index) => ({
    label: segment.charAt(0).toUpperCase() + segment.slice(1),
    href: "/" + pathSegments.slice(0, index + 1).join("/"),
  }))

  return (
    <header
      className={cn(
        "flex items-center justify-between px-6 border-b",
        themeStyles.border,
        config.stickyOnScroll && "sticky top-0 z-20 bg-background",
        className,
      )}
      style={{
        height: config.height,
        backgroundColor: colors.primary + "05",
      }}
    >
      {/* Left Section */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onToggleSidebar}>
          <Menu className="w-5 h-5" />
        </Button>

        {config.showBreadcrumbs && breadcrumbs.length > 0 && (
          <Breadcrumb>
            <BreadcrumbList>
              {breadcrumbs.map((crumb, index) => (
                <React.Fragment key={crumb.href}>
                  <BreadcrumbItem>
                    <BreadcrumbLink href={crumb.href}>{crumb.label}</BreadcrumbLink>
                  </BreadcrumbItem>
                  {index < breadcrumbs.length - 1 && <BreadcrumbSeparator />}
                </React.Fragment>
              ))}
            </BreadcrumbList>
          </Breadcrumb>
        )}

        {config.layout === "split" && config.showSearch && (
          <div className="relative w-64 hidden md:block">
            <Search className={cn("absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4", themeStyles.muted)} />
            <Input placeholder="Buscar..." className="pl-9 bg-transparent border-none focus-visible:ring-1" />
          </div>
        )}
      </div>

      {/* Center Section - for centered layout */}
      {config.layout === "centered" && config.showSearch && (
        <div className="flex-1 max-w-md mx-4 hidden md:block">
          <div className="relative">
            <Search className={cn("absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4", themeStyles.muted)} />
            <Input
              placeholder={`Buscar em ${workspaceName}...`}
              className="pl-10 rounded-full bg-black/5 dark:bg-white/5 border-none"
            />
          </div>
        </div>
      )}

      {/* Right Section */}
      <div className="flex items-center gap-2">
        {config.showQuickActions && (
          <Button variant="outline" size="sm" className="hidden sm:flex gap-2 bg-transparent">
            <Plus className="w-4 h-4" />
            Novo
          </Button>
        )}

        {config.layout !== "split" && config.showSearch && (
          <Button variant="ghost" size="icon" className="md:hidden">
            <Search className="w-5 h-5" />
          </Button>
        )}

        {config.showNotifications && (
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
          </Button>
        )}

        {config.showUserMenu && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Avatar className="w-8 h-8">
                  <AvatarImage src="/diverse-avatars.png" />
                  <AvatarFallback>U</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem>
                <User className="w-4 h-4 mr-2" />
                Perfil
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="w-4 h-4 mr-2" />
                Configurações
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onLogout} className="text-destructive">
                <LogOut className="w-4 h-4 mr-2" />
                Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </header>
  )
}
