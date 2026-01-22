"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowRight, ArrowLeft, RefreshCw } from "lucide-react"
import { useOnboardingStore } from "@/lib/stores/onboarding-store"
import { useReducedMotion } from "@/lib/hooks/use-reduced-motion"
import { getTemplateById } from "@/lib/mock-data/templates"
import { ColorPicker } from "../primitives/color-picker"
import { MenuBuilder } from "../primitives/menu-builder"
import { Button } from "@/components/ui/button"
import type { Template } from "@/types/workspace"

export function TemplateCustomizeStep() {
  const reducedMotion = useReducedMotion()
  const [template, setTemplate] = useState<Template | null>(null)
  const [isReconfiguring, setIsReconfiguring] = useState(false)

  const {
    selectedTemplate,
    brandColors,
    setBrandColors,
    menuComponents,
    setMenuComponents,
    selectedFeatures,
    canProceed,
    nextStep,
    prevStep,
    markStepComplete,
  } = useOnboardingStore()

  useEffect(() => {
    if (selectedTemplate) {
      const t = getTemplateById(selectedTemplate)
      if (t) {
        setTemplate(t)
        // Aplicar preset do template
        if (!brandColors.primary || brandColors.primary === "#18181B") {
          setBrandColors(t.colors)
        }
        if (menuComponents.length <= 2) {
          setMenuComponents(t.menuPreset)
        }
      }
    }
  }, [selectedTemplate, setBrandColors, setMenuComponents, brandColors.primary, menuComponents.length])

  const handleColorChange = (colors: typeof brandColors) => {
    setIsReconfiguring(true)
    setBrandColors(colors)
    setTimeout(() => setIsReconfiguring(false), 400)
  }

  const handleContinue = () => {
    if (canProceed(6)) {
      markStepComplete(6)
      nextStep()
    }
  }

  if (!template) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <motion.div
      initial={reducedMotion ? { opacity: 0 } : { opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="max-w-4xl mx-auto p-6"
    >
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-foreground mb-2">Personalize o Template</h2>
        <p className="text-muted-foreground">Ajuste cores e reorganize o menu do "{template.name}"</p>
      </div>

      {/* Reconfiguration animation indicator */}
      <AnimatePresence>
        {isReconfiguring && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed top-4 right-4 flex items-center gap-2 px-3 py-2 rounded-full bg-primary text-primary-foreground text-sm z-50"
          >
            <RefreshCw className="w-4 h-4 animate-spin" />
            Aplicando...
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Colors */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-foreground">Ajustar cores</h3>
          <ColorPicker colors={brandColors} onChange={handleColorChange} />
        </div>

        {/* Menu */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-foreground">Reorganizar menu</h3>
          <MenuBuilder
            items={menuComponents}
            onChange={setMenuComponents}
            enabledFeatures={[...selectedFeatures, ...template.supportedFeatures]}
          />
        </div>
      </div>

      {/* Navigation */}
      <div className="flex gap-3 mt-8">
        <Button variant="outline" onClick={prevStep} className="flex-1 bg-transparent">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>
        <Button onClick={handleContinue} disabled={!canProceed(6)} className="flex-1">
          Continuar
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </motion.div>
  )
}
