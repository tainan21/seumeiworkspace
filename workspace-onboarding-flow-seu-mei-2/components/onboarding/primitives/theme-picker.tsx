"use client"

import { motion } from "framer-motion"
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"
import type { ThemeStyle } from "@/types/workspace"
import { useReducedMotion } from "@/lib/hooks/use-reduced-motion"

interface ThemeOption {
  id: ThemeStyle
  name: string
  description: string
  colors: { bg: string; accent: string; text: string }
}

const THEMES: ThemeOption[] = [
  {
    id: "minimal",
    name: "Minimalista",
    description: "Clean, espaço negativo, foco no conteúdo",
    colors: { bg: "#FAFAFA", accent: "#18181B", text: "#71717A" },
  },
  {
    id: "corporate",
    name: "Corporativo",
    description: "Profissional, estruturado, confiável",
    colors: { bg: "#1E293B", accent: "#3B82F6", text: "#94A3B8" },
  },
  {
    id: "playful",
    name: "Vibrante",
    description: "Criativo, colorido, dinâmico",
    colors: { bg: "#FDF4FF", accent: "#D946EF", text: "#A855F7" },
  },
]

interface ThemePickerProps {
  selected: ThemeStyle
  onChange: (theme: ThemeStyle) => void
}

export function ThemePicker({ selected, onChange }: ThemePickerProps) {
  const reducedMotion = useReducedMotion()

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {THEMES.map((theme, idx) => (
        <motion.button
          key={theme.id}
          initial={reducedMotion ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.1 }}
          onClick={() => onChange(theme.id)}
          className={cn(
            "relative group text-left p-4 rounded-xl border-2 transition-all duration-200",
            selected === theme.id
              ? "border-primary bg-primary/5 ring-2 ring-primary/20"
              : "border-border hover:border-primary/30 hover:bg-muted/50",
          )}
        >
          {/* Preview do tema */}
          <div className="h-20 rounded-lg mb-3 overflow-hidden" style={{ backgroundColor: theme.colors.bg }}>
            <div className="p-2 h-full flex flex-col">
              <div className="flex gap-1.5 mb-2">
                <div className="w-2 h-2 rounded-full bg-red-400" />
                <div className="w-2 h-2 rounded-full bg-yellow-400" />
                <div className="w-2 h-2 rounded-full bg-green-400" />
              </div>
              <div className="flex-1 flex gap-2">
                <div className="w-8 rounded" style={{ backgroundColor: theme.colors.accent + "20" }} />
                <div className="flex-1 flex flex-col gap-1.5">
                  <div className="h-2 rounded w-2/3" style={{ backgroundColor: theme.colors.accent }} />
                  <div className="h-1.5 rounded w-full" style={{ backgroundColor: theme.colors.text + "30" }} />
                  <div className="h-1.5 rounded w-4/5" style={{ backgroundColor: theme.colors.text + "30" }} />
                </div>
              </div>
            </div>
          </div>

          <h3 className="font-semibold text-foreground">{theme.name}</h3>
          <p className="text-xs text-muted-foreground mt-0.5">{theme.description}</p>

          {/* Indicador de seleção */}
          {selected === theme.id && (
            <motion.div
              initial={reducedMotion ? false : { scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute top-3 right-3 w-5 h-5 rounded-full bg-primary flex items-center justify-center"
            >
              <Check className="w-3 h-3 text-primary-foreground" />
            </motion.div>
          )}
        </motion.button>
      ))}
    </div>
  )
}
