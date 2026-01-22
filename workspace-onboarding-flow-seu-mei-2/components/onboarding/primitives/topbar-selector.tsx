"use client"

import { motion } from "framer-motion"
import { Check, Search, Bell, Menu, Grid3X3 } from "lucide-react"
import { cn } from "@/lib/utils"
import type { TopBarVariant, BrandColors } from "@/types/workspace"
import { useReducedMotion } from "@/lib/hooks/use-reduced-motion"

interface TopBarSelectorProps {
  selected: TopBarVariant
  onChange: (variant: TopBarVariant) => void
  colors: BrandColors
}

const VARIANTS: { id: TopBarVariant; name: string; description: string }[] = [
  { id: "barTop-A", name: "Clássico", description: "Logo + busca + notificações" },
  { id: "barTop-B", name: "Compacto", description: "Menu hamburguer + busca central" },
  { id: "barTop-C", name: "Expansivo", description: "Navegação inline + ações" },
]

export function TopBarSelector({ selected, onChange, colors }: TopBarSelectorProps) {
  const reducedMotion = useReducedMotion()

  return (
    <div className="space-y-3">
      {VARIANTS.map((variant, idx) => (
        <motion.button
          key={variant.id}
          initial={reducedMotion ? false : { opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: idx * 0.1 }}
          onClick={() => onChange(variant.id)}
          className={cn(
            "w-full text-left p-3 rounded-xl border-2 transition-all duration-200",
            selected === variant.id ? "border-primary ring-2 ring-primary/20" : "border-border hover:border-primary/30",
          )}
        >
          {/* Preview */}
          <div className="h-10 rounded-lg mb-2 overflow-hidden" style={{ backgroundColor: colors.primary + "08" }}>
            <TopBarPreview variant={variant.id} colors={colors} />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium">{variant.name}</h4>
              <p className="text-xs text-muted-foreground">{variant.description}</p>
            </div>
            {selected === variant.id && (
              <motion.div
                initial={reducedMotion ? false : { scale: 0 }}
                animate={{ scale: 1 }}
                className="w-5 h-5 rounded-full bg-primary flex items-center justify-center"
              >
                <Check className="w-3 h-3 text-primary-foreground" />
              </motion.div>
            )}
          </div>
        </motion.button>
      ))}
    </div>
  )
}

function TopBarPreview({
  variant,
  colors,
}: {
  variant: TopBarVariant
  colors: BrandColors
}) {
  if (variant === "barTop-A") {
    return (
      <div className="h-full flex items-center justify-between px-3">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded" style={{ backgroundColor: colors.primary }} />
          <div className="w-16 h-2 rounded bg-muted" />
        </div>
        <div className="flex items-center gap-2">
          <Search className="w-4 h-4 text-muted-foreground" />
          <Bell className="w-4 h-4 text-muted-foreground" />
          <div className="w-6 h-6 rounded-full bg-muted" />
        </div>
      </div>
    )
  }

  if (variant === "barTop-B") {
    return (
      <div className="h-full flex items-center justify-between px-3">
        <Menu className="w-4 h-4 text-muted-foreground" />
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-muted/50">
          <Search className="w-3 h-3 text-muted-foreground" />
          <div className="w-20 h-2 rounded bg-muted" />
        </div>
        <div className="w-6 h-6 rounded-full bg-muted" />
      </div>
    )
  }

  // barTop-C
  return (
    <div className="h-full flex items-center justify-between px-3">
      <div className="flex items-center gap-3">
        <div className="w-5 h-5 rounded" style={{ backgroundColor: colors.primary }} />
        <div className="flex gap-2">
          <div className="w-10 h-2 rounded bg-muted" />
          <div className="w-10 h-2 rounded bg-muted" />
          <div className="w-10 h-2 rounded bg-muted" />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Grid3X3 className="w-4 h-4 text-muted-foreground" />
        <Bell className="w-4 h-4 text-muted-foreground" />
        <div className="w-6 h-6 rounded-full bg-muted" />
      </div>
    </div>
  )
}
