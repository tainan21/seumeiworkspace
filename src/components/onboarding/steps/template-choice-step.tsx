"use client"

import { useState, useEffect, useCallback } from "react"
import { motion } from "framer-motion"
import { ArrowLeft } from "lucide-react"
import { useOnboardingStore } from "~/lib/stores/onboarding-store"
import { useReducedMotion } from "~/lib/hooks/use-reduced-motion"
import { useApiCall } from "~/lib/hooks/use-api-call"
import { fetchTemplates } from "~/lib/api-client"
import { TemplateCard, CustomBuildCard } from "../primitives/template-card"
import { AssemblyAnimation } from "../primitives/assembly-animation"
import { TemplateSkeleton } from "../primitives/skeleton"
import { Button } from "~/components/ui/button"
import type { Template } from "~/types/workspace"

export function TemplateChoiceStep() {
  const reducedMotion = useReducedMotion()
  const [showAnimation, setShowAnimation] = useState(false)

  const {
    buildChoice,
    setBuildChoice,
    selectedTemplate,
    setSelectedTemplate,
    brandColors,
    nextStep,
    prevStep,
    markStepComplete,
  } = useOnboardingStore()

  const [templatesApi, loadTemplates] = useApiCall(fetchTemplates)

  useEffect(() => {
    loadTemplates()
  }, [loadTemplates])

  const handleSelectTemplate = (template: Template) => {
    setBuildChoice("template")
    setSelectedTemplate(template.id)
    setShowAnimation(true)
  }

  const handleSelectCustom = () => {
    setBuildChoice("custom")
    setSelectedTemplate(null)
    setShowAnimation(true)
  }

  const handleAnimationComplete = useCallback(() => {
    markStepComplete(4)
    nextStep()
  }, [markStepComplete, nextStep])

  // Show animation overlay
  if (showAnimation) {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center mb-6">
          <h2 className="text-xl font-bold text-foreground mb-2">
            {buildChoice === "template" ? "Aplicando template..." : "Preparando construtor..."}
          </h2>
        </motion.div>
        <AssemblyAnimation
          isPlaying={true}
          onComplete={handleAnimationComplete}
          variant={buildChoice === "template" ? "template" : "custom"}
          colors={brandColors}
        />
      </div>
    )
  }

  return (
    <motion.div
      initial={reducedMotion ? { opacity: 0 } : { opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="max-w-4xl mx-auto p-6 space-y-8"
    >
      <div className="text-center">
        <h2 className="text-2xl font-bold text-foreground mb-2">Como você quer começar?</h2>
        <p className="text-muted-foreground">Escolha um template pronto ou monte do zero</p>
      </div>

      {/* Custom Build Option */}
      <div className="max-w-sm mx-auto">
        <CustomBuildCard isSelected={buildChoice === "custom"} onSelect={handleSelectCustom} />
      </div>

      <div className="relative flex items-center gap-4">
        <div className="flex-1 h-px bg-border" />
        <span className="text-xs text-muted-foreground">ou escolha um template</span>
        <div className="flex-1 h-px bg-border" />
      </div>

      {/* Templates Grid */}
      {templatesApi.isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <TemplateSkeleton key={i} />
          ))}
        </div>
      ) : templatesApi.isError ? (
        <div className="text-center py-8">
          <p className="text-destructive mb-4">{templatesApi.error}</p>
          <Button variant="outline" onClick={() => loadTemplates()}>
            Tentar novamente
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {templatesApi.data?.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              isSelected={selectedTemplate === template.id}
              onSelect={() => handleSelectTemplate(template)}
            />
          ))}
        </div>
      )}

      {/* Back Button */}
      <div className="flex justify-start">
        <Button variant="outline" onClick={prevStep}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>
      </div>
    </motion.div>
  )
}
