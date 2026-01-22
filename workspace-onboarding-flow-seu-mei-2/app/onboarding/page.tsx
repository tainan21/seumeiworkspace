"use client"

import { AnimatePresence, motion } from "framer-motion"
import { useOnboardingStore } from "@/lib/stores/onboarding-store"
import { useReducedMotion } from "@/lib/hooks/use-reduced-motion"
import { StepIndicator } from "@/components/onboarding/primitives/step-indicator"
import { IntroStep } from "@/components/onboarding/steps/intro-step"
import { ThemeFeaturesStep } from "@/components/onboarding/steps/theme-features-step"
import { CompanyTypeStep } from "@/components/onboarding/steps/company-type-step"
import { TemplateChoiceStep } from "@/components/onboarding/steps/template-choice-step"
import { CustomBuilderStep } from "@/components/onboarding/steps/custom-builder-step"
import { TemplateCustomizeStep } from "@/components/onboarding/steps/template-customize-step"
import { PreviewStep } from "@/components/onboarding/steps/preview-step"
import { CreateStep } from "@/components/onboarding/steps/create-step"

const STEPS = [
  { id: 1, label: "Início" },
  { id: 2, label: "Estilo" },
  { id: 3, label: "Empresa" },
  { id: 4, label: "Template" },
  { id: 5, label: "Montar" },
  { id: 6, label: "Ajustes" },
  { id: 7, label: "Preview" },
  { id: 8, label: "Criar" },
]

export default function OnboardingPage() {
  const reducedMotion = useReducedMotion()
  const { currentStep, buildChoice, completedSteps } = useOnboardingStore()

  // Determine which step to show based on currentStep and buildChoice
  const getVisibleStep = () => {
    // Steps 5 and 6 are conditional based on buildChoice
    if (currentStep === 5) {
      return buildChoice === "custom" ? 5 : 6
    }
    if (currentStep === 6) {
      return buildChoice === "template" ? 6 : 7
    }
    return currentStep
  }

  const visibleStep = getVisibleStep()

  // Adjust step indicator to show correct flow
  const getDisplaySteps = () => {
    if (buildChoice === "custom") {
      // Custom flow skips step 6 (template customize)
      return STEPS.filter((s) => s.id !== 6)
    }
    if (buildChoice === "template") {
      // Template flow skips step 5 (custom builder)
      return STEPS.filter((s) => s.id !== 5)
    }
    // Before choice, show all
    return STEPS
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <IntroStep />
      case 2:
        return <ThemeFeaturesStep />
      case 3:
        return <CompanyTypeStep />
      case 4:
        return <TemplateChoiceStep />
      case 5:
        // After template choice, route accordingly
        return buildChoice === "custom" ? <CustomBuilderStep /> : <TemplateCustomizeStep />
      case 6:
        return buildChoice === "template" ? <TemplateCustomizeStep /> : <PreviewStep />
      case 7:
        return <PreviewStep />
      case 8:
        return <CreateStep />
      default:
        return <IntroStep />
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header with Step Indicator */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b border-border">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-lg font-semibold text-foreground">Seumei</h1>
            <span className="text-sm text-muted-foreground">Passo {currentStep} de 8</span>
          </div>
          <StepIndicator steps={getDisplaySteps()} currentStep={currentStep} completedSteps={completedSteps} />
        </div>
      </header>

      {/* Step Content */}
      <main className="py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={reducedMotion ? { opacity: 0 } : { opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={reducedMotion ? { opacity: 0 } : { opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {renderStep()}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  )
}
