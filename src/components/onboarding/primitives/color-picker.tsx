"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import {   Check, Pipette } from "lucide-react"
import { cn } from "~/lib/utils"
import type { BrandColors } from "~/types/workspace"
import { MOCK_COLOR_PALETTES } from "~/lib/mock-data/colors"
import { useReducedMotion } from "~/lib/hooks/use-reduced-motion"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

interface ColorPickerProps {
  colors: BrandColors
  onChange: (colors: BrandColors) => void
}

export function ColorPicker({ colors, onChange }: ColorPickerProps) {
  const reducedMotion = useReducedMotion()
  const [activeField, setActiveField] = useState<"primary" | "accent" | null>(null)

  const handlePaletteSelect = (palette: (typeof MOCK_COLOR_PALETTES)[0]) => {
    onChange({ primary: palette.primary, accent: palette.accent })
  }

  return (
    <div className="space-y-4">
      {/* Paletas predefinidas */}
      <div>
        <Label className="text-xs text-muted-foreground mb-2 block">Paletas sugeridas</Label>
        <div className="flex flex-wrap gap-2">
          {MOCK_COLOR_PALETTES.map((palette, idx) => {
            const isSelected = colors.primary === palette.primary && colors.accent === palette.accent

            return (
              <motion.button
                key={palette.id}
                initial={reducedMotion ? false : { opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.05 }}
                onClick={() => handlePaletteSelect(palette)}
                className={cn(
                  "relative flex items-center gap-1 p-1.5 rounded-lg border-2 transition-all",
                  isSelected
                    ? "border-primary ring-2 ring-primary/20"
                    : "border-transparent hover:border-muted-foreground/20",
                )}
              >
                <div className="w-6 h-6 rounded-md" style={{ backgroundColor: palette.primary }} />
                <div className="w-6 h-6 rounded-md" style={{ backgroundColor: palette.accent }} />
                {isSelected && (
                  <motion.div
                    initial={reducedMotion ? false : { scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-primary flex items-center justify-center"
                  >
                    <Check className="w-2.5 h-2.5 text-primary-foreground" />
                  </motion.div>
                )}
              </motion.button>
            )
          })}
        </div>
      </div>

      {/* Cores customizadas */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="primary" className="text-xs text-muted-foreground">
            Cor primária
          </Label>
          <Popover>
            <PopoverTrigger asChild>
              <button className="w-full flex items-center gap-2 mt-1 px-3 py-2 rounded-lg border bg-background hover:bg-muted/50 transition-colors">
                <div className="w-5 h-5 rounded" style={{ backgroundColor: colors.primary }} />
                <span className="flex-1 text-left text-sm font-mono">{colors.primary}</span>
                <Pipette className="w-4 h-4 text-muted-foreground" />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-48 p-3">
              <Input
                type="color"
                value={colors.primary}
                onChange={(e) => onChange({ ...colors, primary: e.target.value })}
                className="w-full h-24 p-0 border-0 cursor-pointer"
              />
              <Input
                type="text"
                value={colors.primary}
                onChange={(e) => onChange({ ...colors, primary: e.target.value })}
                className="mt-2 font-mono text-xs"
                placeholder="#000000"
              />
            </PopoverContent>
          </Popover>
        </div>

        <div>
          <Label htmlFor="accent" className="text-xs text-muted-foreground">
            Cor de destaque
          </Label>
          <Popover>
            <PopoverTrigger asChild>
              <button className="w-full flex items-center gap-2 mt-1 px-3 py-2 rounded-lg border bg-background hover:bg-muted/50 transition-colors">
                <div className="w-5 h-5 rounded" style={{ backgroundColor: colors.accent }} />
                <span className="flex-1 text-left text-sm font-mono">{colors.accent}</span>
                <Pipette className="w-4 h-4 text-muted-foreground" />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-48 p-3">
              <Input
                type="color"
                value={colors.accent}
                onChange={(e) => onChange({ ...colors, accent: e.target.value })}
                className="w-full h-24 p-0 border-0 cursor-pointer"
              />
              <Input
                type="text"
                value={colors.accent}
                onChange={(e) => onChange({ ...colors, accent: e.target.value })}
                className="mt-2 font-mono text-xs"
                placeholder="#000000"
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </div>
  )
}
