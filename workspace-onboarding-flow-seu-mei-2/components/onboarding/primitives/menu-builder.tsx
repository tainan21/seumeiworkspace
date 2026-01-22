"use client"

import type React from "react"
import { Reorder, useDragControls } from "framer-motion"
import {
  GripVertical,
  Plus,
  X,
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
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { MenuComponent } from "@/types/workspace"
import { useReducedMotion } from "@/lib/hooks/use-reduced-motion"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MOCK_FEATURES } from "@/lib/mock-data/features"

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
}

interface MenuBuilderProps {
  items: MenuComponent[]
  onChange: (items: MenuComponent[]) => void
  enabledFeatures: string[]
}

export function MenuBuilder({ items, onChange, enabledFeatures }: MenuBuilderProps) {
  const reducedMotion = useReducedMotion()

  const availableToAdd = MOCK_FEATURES.filter(
    (f) => enabledFeatures.includes(f.id) && !items.find((i) => i.id === f.id),
  )

  const handleReorder = (newOrder: MenuComponent[]) => {
    // Manter dashboard no topo e settings no final
    const dashboard = newOrder.find((i) => i.id === "dashboard")
    const settings = newOrder.find((i) => i.id === "settings")
    const rest = newOrder.filter((i) => i.id !== "dashboard" && i.id !== "settings")

    const ordered: MenuComponent[] = []
    if (dashboard) ordered.push(dashboard)
    ordered.push(...rest)
    if (settings) ordered.push(settings)

    onChange(ordered)
  }

  const handleRemove = (id: string) => {
    if (id === "dashboard" || id === "settings") return // Sistema
    onChange(items.filter((i) => i.id !== id))
  }

  const handleAdd = (featureId: string) => {
    const feature = MOCK_FEATURES.find((f) => f.id === featureId)
    if (!feature) return

    const newItem: MenuComponent = {
      id: feature.id,
      type: "item",
      label: feature.name,
      icon: feature.icon,
    }

    // Inserir antes de settings
    const settingsIdx = items.findIndex((i) => i.id === "settings")
    if (settingsIdx > -1) {
      const newItems = [...items]
      newItems.splice(settingsIdx, 0, newItem)
      onChange(newItems)
    } else {
      onChange([...items, newItem])
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Arraste para reordenar o menu lateral</p>
        {availableToAdd.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Plus className="w-4 h-4 mr-1" />
                Adicionar
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {availableToAdd.map((feature) => {
                const Icon = ICON_MAP[feature.icon] || FolderKanban
                return (
                  <DropdownMenuItem key={feature.id} onClick={() => handleAdd(feature.id)}>
                    <Icon className="w-4 h-4 mr-2" />
                    {feature.name}
                  </DropdownMenuItem>
                )
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      <div className="rounded-xl border bg-card overflow-hidden">
        <Reorder.Group axis="y" values={items} onReorder={handleReorder} className="divide-y">
          {items.map((item) => (
            <MenuItemRow
              key={item.id}
              item={item}
              onRemove={handleRemove}
              isSystem={item.id === "dashboard" || item.id === "settings"}
              reducedMotion={reducedMotion}
            />
          ))}
        </Reorder.Group>
      </div>
    </div>
  )
}

function MenuItemRow({
  item,
  onRemove,
  isSystem,
  reducedMotion,
}: {
  item: MenuComponent
  onRemove: (id: string) => void
  isSystem: boolean
  reducedMotion: boolean
}) {
  const controls = useDragControls()
  const Icon = ICON_MAP[item.icon || ""] || FolderKanban

  return (
    <Reorder.Item
      value={item}
      dragListener={false}
      dragControls={controls}
      className={cn("flex items-center gap-3 px-4 py-3 bg-card", !isSystem && "cursor-grab active:cursor-grabbing")}
      whileDrag={reducedMotion ? undefined : { scale: 1.02, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
    >
      <button
        onPointerDown={(e) => !isSystem && controls.start(e)}
        className={cn("touch-none", isSystem ? "opacity-30 cursor-not-allowed" : "cursor-grab")}
        disabled={isSystem}
      >
        <GripVertical className="w-4 h-4 text-muted-foreground" />
      </button>

      <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
        <Icon className="w-4 h-4" />
      </div>

      <span className="flex-1 text-sm font-medium">{item.label}</span>

      {isSystem ? (
        <span className="text-[10px] text-muted-foreground px-1.5 py-0.5 rounded bg-muted">Sistema</span>
      ) : (
        <button
          onClick={() => onRemove(item.id)}
          className="p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </Reorder.Item>
  )
}
