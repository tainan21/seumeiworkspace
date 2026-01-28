"use client"

import { motion } from "framer-motion"
import { ArrowRight, ArrowLeft } from "lucide-react"
import { useOnboardingStore } from "~/lib/stores/onboarding-store"
import { useReducedMotion } from "~/lib/hooks/use-reduced-motion"
import { ThemePicker } from "../primitives/theme-picker"
import { FeatureSelector } from "../primitives/feature-selector"
import { Button } from "~/components/ui/button"

export function ThemeFeaturesStep() {
  const reducedMotion = useReducedMotion()
  const { theme, setTheme, selectedFeatures, toggleFeature, canProceed, nextStep, prevStep, markStepComplete } =
    useOnboardingStore()

  const handleContinue = () => {
    if (canProceed(2)) {
      markStepComplete(2)
      nextStep()
    }
  }

  return (
    <motion.div
      initial={reducedMotion ? { opacity: 0 } : { opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="max-w-3xl mx-auto p-6 space-y-8"
    >
      <div className="text-center">
        <h2 className="text-2xl font-bold text-foreground mb-2">Estilo e Módulos</h2>
        <p className="text-muted-foreground">Escolha o visual e as funcionalidades do seu sistema</p>
      </div>

      {/* Theme Selection */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-foreground">Tema visual</h3>
        <ThemePicker selected={theme} onChange={setTheme} />
      </div>

      {/* Feature Selection */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-foreground">Módulos do sistema</h3>
        <FeatureSelector selected={selectedFeatures} onToggle={toggleFeature} />
      </div>

      {/* Navigation */}
      <div className="flex gap-3">
        <Button variant="outline" onClick={prevStep} className="flex-1 bg-transparent">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>
        <Button onClick={handleContinue} disabled={!canProceed(2)} className="flex-1">
          Continuar
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>

      {!canProceed(2) && (
        <p className="text-xs text-center text-muted-foreground">Selecione pelo menos 1 módulo para continuar</p>
      )}
    </motion.div>
  )
}
