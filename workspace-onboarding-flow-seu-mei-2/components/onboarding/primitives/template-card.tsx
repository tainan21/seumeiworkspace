"use client"

import type React from "react"

import { motion } from "framer-motion"
import { Check, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Template } from "@/types/workspace"
import { useReducedMotion } from "@/lib/hooks/use-reduced-motion"

interface TemplateCardProps {
  template: Template
  isSelected: boolean
  onSelect: () => void
  isLoading?: boolean
}

export function TemplateCard({ template, isSelected, onSelect, isLoading }: TemplateCardProps) {
  const reducedMotion = useReducedMotion()

  return (
    <motion.button
      whileHover={reducedMotion ? undefined : { y: -4 }}
      whileTap={reducedMotion ? undefined : { scale: 0.98 }}
      onClick={onSelect}
      disabled={isLoading}
      className={cn(
        "relative group text-left w-full rounded-2xl border-2 overflow-hidden transition-all duration-300",
        isSelected ? "border-primary ring-2 ring-primary/20" : "border-border hover:border-primary/30",
        isLoading && "opacity-50 pointer-events-none",
      )}
    >
      {/* Thumbnail */}
      <div className="relative h-36 overflow-hidden bg-muted">
        <img
          src={`/.jpg?height=144&width=320&query=${template.name} dashboard preview`}
          alt={template.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent" />

        {/* Badge de tema */}
        <span className="absolute top-3 left-3 text-[10px] font-medium px-2 py-1 rounded-full bg-background/80 backdrop-blur-sm">
          {template.theme}
        </span>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-semibold text-foreground">{template.name}</h3>
          <div
            className="flex gap-1"
            style={
              {
                "--template-primary": template.colors.primary,
                "--template-accent": template.colors.accent,
              } as React.CSSProperties
            }
          >
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: template.colors.primary }} />
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: template.colors.accent }} />
          </div>
        </div>

        <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{template.description}</p>

        {/* Features preview */}
        <div className="flex flex-wrap gap-1">
          {template.supportedFeatures.slice(0, 4).map((feature) => (
            <span key={feature} className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
              {feature}
            </span>
          ))}
          {template.supportedFeatures.length > 4 && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
              +{template.supportedFeatures.length - 4}
            </span>
          )}
        </div>
      </div>

      {/* Selection indicator */}
      {isSelected && (
        <motion.div
          initial={reducedMotion ? false : { scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="absolute top-3 right-3 w-6 h-6 rounded-full bg-primary flex items-center justify-center shadow-lg"
        >
          <Check className="w-3.5 h-3.5 text-primary-foreground" />
        </motion.div>
      )}

      {/* Hover glow */}
      <div
        className={cn(
          "absolute inset-0 opacity-0 transition-opacity duration-300 pointer-events-none",
          "group-hover:opacity-100",
        )}
        style={{
          background: `radial-gradient(circle at 50% 0%, ${template.colors.primary}15, transparent 70%)`,
        }}
      />
    </motion.button>
  )
}

// Card especial para "Montar do zero"
export function CustomBuildCard({
  isSelected,
  onSelect,
}: {
  isSelected: boolean
  onSelect: () => void
}) {
  const reducedMotion = useReducedMotion()

  return (
    <motion.button
      whileHover={reducedMotion ? undefined : { y: -4 }}
      whileTap={reducedMotion ? undefined : { scale: 0.98 }}
      onClick={onSelect}
      className={cn(
        "relative group text-left w-full rounded-2xl border-2 overflow-hidden transition-all duration-300",
        isSelected
          ? "border-primary ring-2 ring-primary/20"
          : "border-dashed border-muted-foreground/30 hover:border-primary/50",
      )}
    >
      <div className="h-36 flex items-center justify-center bg-gradient-to-br from-muted/50 to-muted">
        <motion.div
          animate={reducedMotion ? undefined : { rotate: [0, 5, -5, 0], scale: [1, 1.05, 1] }}
          transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY }}
          className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center"
        >
          <Sparkles className="w-8 h-8 text-primary" />
        </motion.div>
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-foreground mb-1">Montar do Zero</h3>
        <p className="text-xs text-muted-foreground">
          Escolha cada módulo, cor e componente manualmente. Controle total.
        </p>
      </div>

      {isSelected && (
        <motion.div
          initial={reducedMotion ? false : { scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="absolute top-3 right-3 w-6 h-6 rounded-full bg-primary flex items-center justify-center"
        >
          <Check className="w-3.5 h-3.5 text-primary-foreground" />
        </motion.div>
      )}
    </motion.button>
  )
}
