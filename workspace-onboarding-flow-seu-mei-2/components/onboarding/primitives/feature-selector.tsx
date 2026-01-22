"use client"

import type React from "react"

import { motion } from "framer-motion"
import {
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
  Check,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { MOCK_FEATURES } from "@/lib/mock-data/features"
import { useReducedMotion } from "@/lib/hooks/use-reduced-motion"

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
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
}

interface FeatureSelectorProps {
  selected: string[]
  onToggle: (featureId: string) => void
  recommended?: string[]
}

export function FeatureSelector({ selected, onToggle, recommended = [] }: FeatureSelectorProps) {
  const reducedMotion = useReducedMotion()

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Selecione os módulos do seu sistema</p>
        <span className="text-xs font-medium px-2 py-1 rounded-full bg-primary/10 text-primary">
          {selected.length} selecionados
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {MOCK_FEATURES.map((feature, idx) => {
          const Icon = ICON_MAP[feature.icon] || FolderKanban
          const isSelected = selected.includes(feature.id)
          const isRecommended = recommended.includes(feature.id)

          return (
            <motion.button
              key={feature.id}
              initial={reducedMotion ? false : { opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.03 }}
              whileTap={reducedMotion ? undefined : { scale: 0.98 }}
              onClick={() => onToggle(feature.id)}
              className={cn(
                "relative flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200",
                isSelected ? "border-primary bg-primary/5" : "border-border hover:border-primary/30 hover:bg-muted/50",
              )}
            >
              {isRecommended && !isSelected && (
                <span className="absolute -top-2 left-1/2 -translate-x-1/2 text-[9px] font-medium px-1.5 py-0.5 rounded bg-accent text-accent-foreground">
                  Sugerido
                </span>
              )}

              <div
                className={cn(
                  "w-10 h-10 rounded-lg flex items-center justify-center transition-colors",
                  isSelected ? "bg-primary text-primary-foreground" : "bg-muted",
                )}
              >
                <Icon className="w-5 h-5" />
              </div>

              <span className="text-xs font-medium text-center">{feature.name}</span>

              {isSelected && (
                <motion.div
                  initial={reducedMotion ? false : { scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute top-2 right-2 w-4 h-4 rounded-full bg-primary flex items-center justify-center"
                >
                  <Check className="w-2.5 h-2.5 text-primary-foreground" />
                </motion.div>
              )}
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}
